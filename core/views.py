"""Public website views and JSON endpoints for Kenchain Groups."""

import json
import logging
import re
from datetime import date, timedelta

from django.conf import settings
from django.core.exceptions import RequestDataTooBig
from django.core.mail import send_mail
from django.db import DatabaseError, connection, transaction
from django.db.models import Sum
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from .models import (
    HospitalityBooking,
    HospitalityProperty,
    Inquiry,
    Shipment,
    TourBooking,
    TourPackage,
)

logger = logging.getLogger(__name__)
TRACKING_RE = re.compile(r"^[A-Za-z0-9]{6,16}$")
REFERENCE_RE = re.compile(r"^(HSP|TRV)-[A-F0-9]{8,12}$")
ACTIVE_HOSPITALITY_STATUSES = ["requested", "confirmed", "checked_in"]
ACTIVE_TOUR_STATUSES = ["requested", "confirmed"]
MAX_STAY_NIGHTS = 90


def _payload(request):
    try:
        body = request.body
    except RequestDataTooBig:
        return None, JsonResponse({"error": "Request body is too large."}, status=413)
    try:
        data = json.loads(body or b"{}")
    except (ValueError, TypeError, UnicodeDecodeError):
        return None, JsonResponse({"error": "Send a valid JSON request."}, status=400)
    if not isinstance(data, dict):
        return None, JsonResponse({"error": "The request body must be a JSON object."}, status=400)
    return data, None


def _clean_text(data, key, max_length, required=True):
    raw = data.get(key, "")
    if raw is None:
        raw = ""
    if not isinstance(raw, str):
        raise ValueError(f"{key.replace('_', ' ').capitalize()} must be text.")
    value = raw.strip()
    if required and not value:
        raise ValueError(f"Please enter {key.replace('_', ' ')}.")
    if len(value) > max_length:
        raise ValueError(f"{key.replace('_', ' ').capitalize()} must be {max_length} characters or fewer.")
    return value


def _parse_date(value, label):
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        raise ValueError(f"Please provide a valid {label} date in YYYY-MM-DD format.")
    try:
        return date.fromisoformat(value)
    except ValueError:
        raise ValueError(f"Please provide a valid {label} date in YYYY-MM-DD format.")


def _parse_int(value, label, default=None):
    if value is None and default is not None:
        return default
    # Reject booleans, fractional numbers, and containers instead of silently
    # coercing them into valid-looking IDs or counts.
    if isinstance(value, bool) or not isinstance(value, (int, str)):
        raise ValueError(f"Please provide a valid {label}.")
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        raise ValueError(f"Please provide a valid {label}.")
    if isinstance(value, str) and str(parsed) != value.strip():
        raise ValueError(f"Please provide a valid {label}.")
    return parsed


def _valid_email(value):
    from django.core.exceptions import ValidationError
    from django.core.validators import validate_email

    try:
        validate_email(value)
    except ValidationError:
        raise ValueError("Please enter a valid email address.")
    return value


def _notify(subject, message, email=None):
    """Attempt notifications without making a saved booking depend on email."""
    if settings.EMAIL_BACKEND.endswith("dummy.EmailBackend"):
        logger.info("Email notifications are disabled; configure EMAIL_BACKEND to enable delivery.")
        return
    try:
        send_mail(
            subject=subject.replace("\r", " ").replace("\n", " "),
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.INQUIRY_NOTIFY_EMAIL],
            fail_silently=False,
        )
        if email:
            send_mail(
                subject=subject.replace("\r", " ").replace("\n", " "),
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
    except Exception:
        # Do not log the message body: it contains customer contact details.
        logger.exception("Email notification delivery failed.")


@ensure_csrf_cookie
def home(request):
    """Serve the single-page frontend and issue the CSRF cookie used by forms."""
    html = (settings.FRONTEND_DIR / "index.html").read_text(encoding="utf-8")
    return HttpResponse(html, content_type="text/html; charset=utf-8")


@require_GET
def health(request):
    """Minimal platform health check including database connectivity."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except DatabaseError:
        logger.exception("Health check failed: database is unavailable.")
        return JsonResponse({"status": "unhealthy"}, status=503)
    return JsonResponse({"status": "ok"})


@require_GET
def hospitality_properties(request):
    properties = HospitalityProperty.objects.filter(active=True)
    return JsonResponse({"results": [
        {
            "id": item.id,
            "name": item.name,
            "location": item.location,
            "description": item.description,
            "nightly_rate": str(item.nightly_rate),
            "rooms_total": item.rooms_total,
            "amenities": [x.strip() for x in item.amenities.split(",") if x.strip()],
        } for item in properties
    ]})


@require_POST
def create_hospitality_booking(request):
    data, error = _payload(request)
    if error:
        return error
    try:
        full_name = _clean_text(data, "full_name", 100)
        contact = _clean_text(data, "contact", 150)
        email = _valid_email(_clean_text(data, "email", 254))
        special_requests = _clean_text(data, "special_requests", 1000, required=False)
        check_in = _parse_date(data.get("check_in"), "check-in")
        check_out = _parse_date(data.get("check_out"), "check-out")
        if check_in < timezone.localdate():
            raise ValueError("Check-in date cannot be in the past.")
        if check_out <= check_in:
            raise ValueError("Check-out must be after check-in.")
        if (check_out - check_in).days > MAX_STAY_NIGHTS:
            raise ValueError("For stays longer than 90 nights, please contact the team directly.")

        property_id = _parse_int(data.get("property_id"), "accommodation")
        guests = _parse_int(data.get("guests", 1), "guest count", default=1)
        rooms_requested = _parse_int(data.get("rooms_requested", 1), "room count", default=1)
        if guests < 1 or guests > 40 or rooms_requested < 1 or rooms_requested > 10:
            raise ValueError("Guests must be 1–40 and rooms must be 1–10.")
        if guests > rooms_requested * 4:
            raise ValueError("Please allow no more than 4 guests per room.")

        # Lock the inventory row while checking and inserting. On PostgreSQL,
        # this serializes competing requests for the same property and prevents
        # two simultaneous requests from overselling the same rooms.
        with transaction.atomic():
            try:
                prop = HospitalityProperty.objects.select_for_update().get(pk=property_id, active=True)
            except HospitalityProperty.DoesNotExist:
                raise ValueError("That accommodation is no longer available. Please refresh and choose another.")

            occupied = HospitalityBooking.objects.filter(
                property=prop,
                status__in=ACTIVE_HOSPITALITY_STATUSES,
                check_in__lt=check_out,
                check_out__gt=check_in,
            ).values_list("check_in", "check_out", "rooms_requested")
            existing_stays = list(occupied)
            night = check_in
            while night < check_out:
                reserved = sum(
                    rooms for existing_in, existing_out, rooms in existing_stays
                    if existing_in <= night < existing_out
                )
                if reserved + rooms_requested > prop.rooms_total:
                    return JsonResponse({
                        "error": "There are not enough rooms available for those dates. Please change your dates or room count."
                    }, status=409)
                night += timedelta(days=1)

            booking = HospitalityBooking.objects.create(
                property=prop, full_name=full_name, contact=contact, email=email,
                check_in=check_in, check_out=check_out, guests=guests,
                rooms_requested=rooms_requested, special_requests=special_requests,
            )
    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    message = (
        f"Hospitality reservation request {booking.reference}\n"
        f"Guest: {booking.full_name}\nProperty: {prop.name}\n"
        f"Dates: {booking.check_in} to {booking.check_out}\n"
        f"Guests: {booking.guests}; rooms: {booking.rooms_requested}\n"
        f"Contact: {booking.contact}; email: {booking.email}\n"
        f"Requests: {booking.special_requests or 'None'}\nStatus: Request received"
    )
    _notify(f"Hospitality booking request {booking.reference}", message, booking.email)
    return JsonResponse({
        "ok": True,
        "reference": booking.reference,
        "status": booking.get_status_display(),
        "message": "Your stay request has been received. Our team will confirm availability shortly.",
    }, status=201)


@require_GET
def tour_packages(request):
    packages = TourPackage.objects.filter(active=True)
    category = str(request.GET.get("category", "")).strip()
    if category:
        packages = packages.filter(category=category)
    return JsonResponse({"results": [
        {
            "id": item.id,
            "title": item.title,
            "destination": item.destination,
            "category": item.get_category_display(),
            "category_key": item.category,
            "duration_days": item.duration_days,
            "price_per_person": str(item.price_per_person),
            "description": item.description,
            "inclusions": [x.strip() for x in item.inclusions.split(",") if x.strip()],
            "max_group_size": item.max_group_size,
        } for item in packages
    ]})


@require_POST
def create_tour_booking(request):
    data, error = _payload(request)
    if error:
        return error
    try:
        full_name = _clean_text(data, "full_name", 100)
        contact = _clean_text(data, "contact", 150)
        email = _valid_email(_clean_text(data, "email", 254))
        special_requests = _clean_text(data, "special_requests", 1000, required=False)
        travel_date = _parse_date(data.get("travel_date"), "travel")
        if travel_date < timezone.localdate():
            raise ValueError("Travel date cannot be in the past.")

        package_id = _parse_int(data.get("package_id"), "tour package")
        travelers = _parse_int(data.get("travelers", 1), "traveller count", default=1)
        if not 1 <= travelers <= 100:
            raise ValueError("Travellers must be between 1 and 100.")

        # The package row lock serializes concurrent bookings for the same tour.
        with transaction.atomic():
            try:
                package = TourPackage.objects.select_for_update().get(pk=package_id, active=True)
            except TourPackage.DoesNotExist:
                raise ValueError("That tour package is no longer available. Please refresh and choose another.")

            reserved = TourBooking.objects.filter(
                package=package,
                travel_date=travel_date,
                status__in=ACTIVE_TOUR_STATUSES,
            ).aggregate(total=Sum("travelers"))["total"] or 0
            if reserved + travelers > package.max_group_size:
                return JsonResponse({
                    "error": "This departure does not have enough seats for your group. Please reduce the group size or choose another date/package."
                }, status=409)

            booking = TourBooking.objects.create(
                package=package, full_name=full_name, contact=contact, email=email,
                travel_date=travel_date, travelers=travelers, special_requests=special_requests,
            )
    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    message = (
        f"Tours & Travels booking request {booking.reference}\n"
        f"Customer: {booking.full_name}\nPackage: {package.title} ({package.destination})\n"
        f"Travel date: {booking.travel_date}\nTravellers: {booking.travelers}\n"
        f"Contact: {booking.contact}; email: {booking.email}\n"
        f"Requests: {booking.special_requests or 'None'}\nStatus: Request received"
    )
    _notify(f"Tour booking request {booking.reference}", message, booking.email)
    return JsonResponse({
        "ok": True,
        "reference": booking.reference,
        "status": booking.get_status_display(),
        "message": "Your tour request has been received. Our team will contact you to confirm the itinerary and price.",
    }, status=201)


@require_GET
def booking_status(request, reference):
    reference = reference.strip().upper()
    if not REFERENCE_RE.fullmatch(reference):
        return JsonResponse({"error": "We couldn't find a booking with that reference. Check the code and try again."}, status=404)
    if reference.startswith("HSP-"):
        booking = HospitalityBooking.objects.select_related("property").filter(reference=reference).first()
        if booking:
            return JsonResponse({
                "reference": booking.reference, "type": "Hospitality",
                "status": booking.get_status_display(), "item": booking.property.name,
                "date": f"{booking.check_in:%d %b %Y} to {booking.check_out:%d %b %Y}",
                "submitted": timezone.localtime(booking.created_at).strftime("%d %b %Y, %I:%M %p"),
            })
    elif reference.startswith("TRV-"):
        booking = TourBooking.objects.select_related("package").filter(reference=reference).first()
        if booking:
            return JsonResponse({
                "reference": booking.reference, "type": "Tours & Travels",
                "status": booking.get_status_display(), "item": booking.package.title,
                "date": booking.travel_date.strftime("%d %b %Y"),
                "submitted": timezone.localtime(booking.created_at).strftime("%d %b %Y, %I:%M %p"),
            })
    return JsonResponse({"error": "We couldn't find a booking with that reference. Check the code and try again."}, status=404)


@require_POST
def create_inquiry(request):
    data, error = _payload(request)
    if error:
        return error
    try:
        name = _clean_text(data, "name", 100)
        contact = _clean_text(data, "contact", 150)
        message = _clean_text(data, "message", 2000, required=False)
        service = data.get("service", "general")
        if not isinstance(service, str):
            raise ValueError("Please choose Adventures, Courier, or General enquiry.")
        service = service.strip().lower() or "general"
        allowed_services = {key for key, _ in Inquiry.SERVICES}
        if service not in allowed_services:
            raise ValueError("Please choose Adventures, Courier, or General enquiry.")
    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    inquiry = Inquiry.objects.create(name=name, contact=contact, service=service, message=message)
    _notify(
        f"New inquiry: {inquiry.get_service_display()} from {name}",
        f"Name: {name}\nContact: {contact}\nService: {inquiry.get_service_display()}\n\n{message}",
    )
    return JsonResponse({"ok": True, "name": name}, status=201)


@require_GET
def track_shipment(request, number):
    number = number.strip().upper()
    if not TRACKING_RE.fullmatch(number):
        return JsonResponse({"error": "That does not look like a tracking number."}, status=400)
    shipment = Shipment.objects.prefetch_related("events").filter(tracking_number=number).first()
    if not shipment:
        return JsonResponse({"error": "No parcel found with that tracking number."}, status=404)

    return JsonResponse({
        "tracking_number": shipment.tracking_number,
        "status": shipment.get_status_display(),
        "origin": shipment.origin,
        "destination": shipment.destination,
        "events": [{
            "status": event.get_status_display(), "location": event.location,
            "note": event.note,
            "time": timezone.localtime(event.timestamp).strftime("%d %b %Y, %I:%M %p"),
        } for event in shipment.events.all()],
    })
