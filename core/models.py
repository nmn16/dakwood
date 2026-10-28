import secrets
import string

from django.core.validators import MinValueValidator
from django.db import models


def _reference(prefix):
    return f"{prefix}-{secrets.token_hex(6).upper()}"


def make_tracking_number():
    """KC + 10 random digits. Random so numbers can't be guessed in sequence."""
    return "KC" + "".join(secrets.choice(string.digits) for _ in range(10))


def make_hospitality_reference():
    return _reference("HSP")


def make_tour_reference():
    return _reference("TRV")


class Inquiry(models.Model):
    SERVICES = [
        ("adventures", "Adventures"),
        ("courier", "Courier"),
        ("general", "General enquiry"),
    ]
    name = models.CharField(max_length=100)
    contact = models.CharField("Phone or email", max_length=150)
    service = models.CharField(max_length=20, choices=SERVICES, default="general")
    message = models.TextField(blank=True, max_length=2000)
    handled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "inquiries"

    def __str__(self):
        return f"{self.name} - {self.get_service_display()}"


class HospitalityProperty(models.Model):
    name = models.CharField(max_length=120)
    location = models.CharField(max_length=160)
    description = models.TextField(max_length=1200)
    nightly_rate = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    rooms_total = models.PositiveSmallIntegerField(default=10, validators=[MinValueValidator(1)])
    amenities = models.CharField(max_length=500, blank=True, help_text="Separate amenities with commas")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["nightly_rate", "name"]
        verbose_name_plural = "hospitality properties"

    def __str__(self):
        return f"{self.name} - {self.location}"


class HospitalityBooking(models.Model):
    STATUSES = [
        ("requested", "Request received"),
        ("confirmed", "Confirmed"),
        ("checked_in", "Checked in"),
        ("checked_out", "Checked out"),
        ("cancelled", "Cancelled"),
    ]
    reference = models.CharField(max_length=16, unique=True, default=make_hospitality_reference, editable=False)
    property = models.ForeignKey(HospitalityProperty, related_name="bookings", on_delete=models.PROTECT)
    full_name = models.CharField(max_length=100)
    contact = models.CharField(max_length=150)
    email = models.EmailField()
    check_in = models.DateField()
    check_out = models.DateField()
    guests = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1)])
    rooms_requested = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1)])
    special_requests = models.CharField(max_length=1000, blank=True)
    status = models.CharField(max_length=20, choices=STATUSES, default="requested")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["property", "status", "check_in", "check_out"],
                name="hosp_booking_availability_idx",
            ),
        ]

    def __str__(self):
        return f"{self.reference} - {self.full_name}"


class TourPackage(models.Model):
    CATEGORIES = [
        ("domestic", "Domestic holiday"),
        ("international", "International holiday"),
        ("weekend", "Weekend getaway"),
        ("adventure", "Adventure trip"),
        ("corporate", "Corporate travel"),
    ]
    title = models.CharField(max_length=140)
    destination = models.CharField(max_length=160)
    category = models.CharField(max_length=20, choices=CATEGORIES, default="domestic")
    duration_days = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1)])
    price_per_person = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    description = models.TextField(max_length=1200)
    inclusions = models.CharField(max_length=700, blank=True, help_text="Separate inclusions with commas")
    max_group_size = models.PositiveSmallIntegerField(default=20, validators=[MinValueValidator(1)])
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["price_per_person", "title"]

    def __str__(self):
        return f"{self.title} - {self.destination}"


class TourBooking(models.Model):
    STATUSES = [
        ("requested", "Request received"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]
    reference = models.CharField(max_length=16, unique=True, default=make_tour_reference, editable=False)
    package = models.ForeignKey(TourPackage, related_name="bookings", on_delete=models.PROTECT)
    full_name = models.CharField(max_length=100)
    contact = models.CharField(max_length=150)
    email = models.EmailField()
    travel_date = models.DateField()
    travelers = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1)])
    special_requests = models.CharField(max_length=1000, blank=True)
    status = models.CharField(max_length=20, choices=STATUSES, default="requested")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["package", "travel_date", "status"],
                name="tour_booking_capacity_idx",
            ),
        ]

    def __str__(self):
        return f"{self.reference} - {self.full_name}"


class Shipment(models.Model):
    STATUSES = [
        ("booked", "Booked"),
        ("picked_up", "Picked up"),
        ("in_transit", "In transit"),
        ("out_for_delivery", "Out for delivery"),
        ("delivered", "Delivered"),
    ]
    tracking_number = models.CharField(max_length=12, unique=True, default=make_tracking_number, editable=False)
    sender_name = models.CharField(max_length=100)
    receiver_name = models.CharField(max_length=100)
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUSES, default="booked")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.tracking_number


class TrackingEvent(models.Model):
    shipment = models.ForeignKey(Shipment, related_name="events", on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Shipment.STATUSES)
    location = models.CharField(max_length=100, blank=True)
    note = models.CharField(max_length=200, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["shipment", "timestamp"], name="tracking_event_latest_idx"),
        ]

    def _sync_shipment_status(self):
        latest = TrackingEvent.objects.filter(shipment_id=self.shipment_id).order_by("-timestamp", "-pk").first()
        target_status = latest.status if latest else "booked"
        Shipment.objects.filter(pk=self.shipment_id).exclude(status=target_status).update(status=target_status)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Keep current shipment status aligned with the latest event, not simply
        # whichever historical event happened to be edited last.
        self._sync_shipment_status()

    def delete(self, *args, **kwargs):
        shipment_id = self.shipment_id
        result = super().delete(*args, **kwargs)
        self.shipment_id = shipment_id
        self._sync_shipment_status()
        return result
