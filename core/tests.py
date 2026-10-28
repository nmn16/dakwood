import json
from datetime import timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from .models import HospitalityBooking, HospitalityProperty, TourBooking, TourPackage


class BookingFlowTests(TestCase):
    def setUp(self):
        self.property = HospitalityProperty.objects.create(
            name="Test Stay", location="Test City", description="A test property",
            nightly_rate=Decimal("1000.00"), rooms_total=2, amenities="Wi-Fi",
        )
        self.package = TourPackage.objects.create(
            title="Test Trip", destination="Test Destination", category="domestic",
            duration_days=2, price_per_person=Decimal("3000.00"),
            description="A test tour", max_group_size=4,
        )
        self.tomorrow = timezone.localdate() + timedelta(days=1)

    def json_post(self, url, payload):
        return self.client.post(url, data=json.dumps(payload), content_type="application/json")

    def test_hospitality_and_tour_options_are_separate(self):
        hospitality = self.client.get("/api/hospitality/properties/")
        tours = self.client.get("/api/tours/packages/")
        self.assertEqual(hospitality.status_code, 200)
        self.assertEqual(tours.status_code, 200)
        self.assertEqual(hospitality.json()["results"][0]["name"], "Test Stay")
        self.assertEqual(tours.json()["results"][0]["title"], "Test Trip")

    def test_hospitality_booking_can_be_created_and_tracked(self):
        response = self.json_post("/api/hospitality/bookings/", {
            "property_id": self.property.id, "full_name": "Test Guest", "contact": "555-0100",
            "email": "guest@example.com", "check_in": self.tomorrow.isoformat(),
            "check_out": (self.tomorrow + timedelta(days=2)).isoformat(), "guests": 2,
            "rooms_requested": 1, "special_requests": "Late arrival",
        })
        self.assertEqual(response.status_code, 201)
        reference = response.json()["reference"]
        self.assertTrue(HospitalityBooking.objects.filter(reference=reference).exists())
        status = self.client.get(f"/api/bookings/{reference}/")
        self.assertEqual(status.status_code, 200)
        self.assertEqual(status.json()["type"], "Hospitality")

    def test_hospitality_rejects_invalid_checkout(self):
        response = self.json_post("/api/hospitality/bookings/", {
            "property_id": self.property.id, "full_name": "Test Guest", "contact": "555-0100",
            "email": "guest@example.com", "check_in": self.tomorrow.isoformat(),
            "check_out": self.tomorrow.isoformat(), "guests": 1, "rooms_requested": 1,
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn("Check-out", response.json()["error"])

    def test_tour_booking_can_be_created_and_tracked(self):
        response = self.json_post("/api/tours/bookings/", {
            "package_id": self.package.id, "full_name": "Test Traveller", "contact": "555-0101",
            "email": "traveller@example.com", "travel_date": self.tomorrow.isoformat(),
            "travelers": 2, "special_requests": "Vegetarian meals",
        })
        self.assertEqual(response.status_code, 201)
        reference = response.json()["reference"]
        self.assertTrue(TourBooking.objects.filter(reference=reference).exists())
        status = self.client.get(f"/api/bookings/{reference}/")
        self.assertEqual(status.status_code, 200)
        self.assertEqual(status.json()["type"], "Tours & Travels")

    def test_tour_capacity_is_enforced(self):
        TourBooking.objects.create(
            package=self.package, full_name="Existing Group", contact="555-0102",
            email="group@example.com", travel_date=self.tomorrow, travelers=3,
        )
        response = self.json_post("/api/tours/bookings/", {
            "package_id": self.package.id, "full_name": "Another Group", "contact": "555-0103",
            "email": "another@example.com", "travel_date": self.tomorrow.isoformat(),
            "travelers": 2,
        })
        self.assertEqual(response.status_code, 409)

    def test_hospitality_capacity_is_enforced(self):
        HospitalityBooking.objects.create(
            property=self.property, full_name="Existing Guest", contact="555-0104",
            email="existing@example.com", check_in=self.tomorrow,
            check_out=self.tomorrow + timedelta(days=2), guests=4, rooms_requested=2,
        )
        response = self.json_post("/api/hospitality/bookings/", {
            "property_id": self.property.id, "full_name": "Another Guest", "contact": "555-0105",
            "email": "another@example.com", "check_in": self.tomorrow.isoformat(),
            "check_out": (self.tomorrow + timedelta(days=1)).isoformat(), "guests": 1,
            "rooms_requested": 1,
        })
        self.assertEqual(response.status_code, 409)

    def test_invalid_json_is_rejected(self):
        response = self.client.post(
            "/api/tours/bookings/", data="{not json", content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("valid JSON", response.json()["error"])

    def test_health_endpoint_checks_database(self):
        response = self.client.get("/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_booking_status_does_not_accept_malformed_reference(self):
        response = self.client.get("/api/bookings/not-a-reference/")
        self.assertEqual(response.status_code, 404)

