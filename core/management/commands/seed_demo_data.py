from decimal import Decimal
from django.core.management.base import BaseCommand
from core.models import HospitalityProperty, TourPackage


class Command(BaseCommand):
    help = "Create or refresh sample hospitality properties and tours for local demos."

    def add_arguments(self, parser):
        parser.add_argument(
            "--if-empty",
            action="store_true",
            help="Seed only when both catalog tables are empty; preserve existing live catalog data.",
        )

    def handle(self, *args, **options):
        if options["if_empty"] and (
            HospitalityProperty.objects.exists() or TourPackage.objects.exists()
        ):
            self.stdout.write("Catalog data already exists; leaving it unchanged.")
            return

        properties = [
            {
                "name": "Cedar Court Stay", "location": "Bengaluru, Karnataka",
                "description": "A comfortable city stay for work trips, appointments and weekend plans, with easy access to the city.",
                "nightly_rate": Decimal("2400.00"), "rooms_total": 12,
                "amenities": "Wi-Fi, Breakfast, Parking, 24-hour reception",
            },
            {
                "name": "Lakeview Residency", "location": "Mysuru, Karnataka",
                "description": "A relaxed base for exploring Mysuru, with practical comforts for couples, families and small groups.",
                "nightly_rate": Decimal("3200.00"), "rooms_total": 10,
                "amenities": "Wi-Fi, Breakfast, Family rooms, Parking",
            },
            {
                "name": "Coastline Haven", "location": "Gokarna, Karnataka",
                "description": "A laid-back coastal stay for slower mornings, beach walks and a little room to reset.",
                "nightly_rate": Decimal("4100.00"), "rooms_total": 8,
                "amenities": "Wi-Fi, Garden, Restaurant, Local transfers",
            },
        ]
        for item in properties:
            HospitalityProperty.objects.update_or_create(name=item["name"], defaults=item)

        packages = [
            {
                "title": "Coorg Weekend Escape", "destination": "Coorg, Karnataka", "category": "weekend",
                "duration_days": 3, "price_per_person": Decimal("6999.00"),
                "description": "A short hill-country break with coffee estate visits, scenic viewpoints and time to unwind.",
                "inclusions": "2 nights stay, Breakfast, Local sightseeing, Trip coordinator", "max_group_size": 20,
            },
            {
                "title": "Hampi Heritage Trail", "destination": "Hampi, Karnataka", "category": "domestic",
                "duration_days": 3, "price_per_person": Decimal("8499.00"),
                "description": "Explore the remarkable ruins, stone architecture and landscapes of the Vijayanagara heritage region.",
                "inclusions": "2 nights stay, Local guide, Sightseeing, Breakfast", "max_group_size": 18,
            },
            {
                "title": "Kerala Backwater Break", "destination": "Alappuzha & Kochi, Kerala", "category": "domestic",
                "duration_days": 4, "price_per_person": Decimal("12999.00"),
                "description": "A relaxed Kerala circuit mixing backwater scenery, local food experiences and a little city time.",
                "inclusions": "3 nights stay, Breakfast, Backwater experience, Transfers", "max_group_size": 16,
            },
            {
                "title": "Rajasthan Royal Loop", "destination": "Jaipur & Udaipur, Rajasthan", "category": "domestic",
                "duration_days": 6, "price_per_person": Decimal("22999.00"),
                "description": "A colourful route through palaces, old-city lanes, lakeside evenings and regional cuisine.",
                "inclusions": "5 nights stay, Breakfast, Local transfers, Guided visits", "max_group_size": 16,
            },
            {
                "title": "Western Ghats Trek", "destination": "Western Ghats, Karnataka", "category": "adventure",
                "duration_days": 2, "price_per_person": Decimal("5499.00"),
                "description": "A guided outdoor escape with forest trails, viewpoints and a camp-style evening, subject to conditions.",
                "inclusions": "Guide, Meals, Basic safety briefing, Shared transport", "max_group_size": 12,
            },
            {
                "title": "Singapore City Discovery", "destination": "Singapore", "category": "international",
                "duration_days": 5, "price_per_person": Decimal("45999.00"),
                "description": "A starter international itinerary covering city highlights, gardens and time to explore at your own pace.",
                "inclusions": "4 nights stay, Breakfast, City tour, Airport transfers", "max_group_size": 20,
            },
        ]
        for item in packages:
            TourPackage.objects.update_or_create(title=item["title"], defaults=item)

        self.stdout.write(self.style.SUCCESS(
            f"Demo data ready: {len(properties)} hospitality properties and {len(packages)} tour packages."
        ))
