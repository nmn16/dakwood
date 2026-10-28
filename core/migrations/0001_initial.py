# Initial schema for the Kenchain Groups demo project.
import core.models
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="HospitalityProperty",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120)),
                ("location", models.CharField(max_length=160)),
                ("description", models.TextField(max_length=1200)),
                ("nightly_rate", models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)])),
                ("rooms_total", models.PositiveSmallIntegerField(default=10, validators=[django.core.validators.MinValueValidator(1)])),
                ("amenities", models.CharField(blank=True, help_text="Separate amenities with commas", max_length=500)),
                ("active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["nightly_rate", "name"], "verbose_name_plural": "hospitality properties"},
        ),
        migrations.CreateModel(
            name="Inquiry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("contact", models.CharField(max_length=150, verbose_name="Phone or email")),
                ("service", models.CharField(choices=[("adventures", "Adventures"), ("courier", "Courier"), ("general", "General enquiry")], default="general", max_length=20)),
                ("message", models.TextField(blank=True, max_length=2000)),
                ("handled", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-created_at"], "verbose_name_plural": "inquiries"},
        ),
        migrations.CreateModel(
            name="Shipment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("tracking_number", models.CharField(default=core.models.make_tracking_number, editable=False, max_length=12, unique=True)),
                ("sender_name", models.CharField(max_length=100)),
                ("receiver_name", models.CharField(max_length=100)),
                ("origin", models.CharField(max_length=100)),
                ("destination", models.CharField(max_length=100)),
                ("status", models.CharField(choices=[("booked", "Booked"), ("picked_up", "Picked up"), ("in_transit", "In transit"), ("out_for_delivery", "Out for delivery"), ("delivered", "Delivered")], default="booked", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="TourPackage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=140)),
                ("destination", models.CharField(max_length=160)),
                ("category", models.CharField(choices=[("domestic", "Domestic holiday"), ("international", "International holiday"), ("weekend", "Weekend getaway"), ("adventure", "Adventure trip"), ("corporate", "Corporate travel")], default="domestic", max_length=20)),
                ("duration_days", models.PositiveSmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)])),
                ("price_per_person", models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)])),
                ("description", models.TextField(max_length=1200)),
                ("inclusions", models.CharField(blank=True, help_text="Separate inclusions with commas", max_length=700)),
                ("max_group_size", models.PositiveSmallIntegerField(default=20, validators=[django.core.validators.MinValueValidator(1)])),
                ("active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["price_per_person", "title"]},
        ),
        migrations.CreateModel(
            name="HospitalityBooking",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("reference", models.CharField(default=core.models.make_hospitality_reference, editable=False, max_length=16, unique=True)),
                ("full_name", models.CharField(max_length=100)),
                ("contact", models.CharField(max_length=150)),
                ("email", models.EmailField(max_length=254)),
                ("check_in", models.DateField()),
                ("check_out", models.DateField()),
                ("guests", models.PositiveSmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)])),
                ("rooms_requested", models.PositiveSmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)])),
                ("special_requests", models.CharField(blank=True, max_length=1000)),
                ("status", models.CharField(choices=[("requested", "Request received"), ("confirmed", "Confirmed"), ("checked_in", "Checked in"), ("checked_out", "Checked out"), ("cancelled", "Cancelled")], default="requested", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("property", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="bookings", to="core.hospitalityproperty")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="TourBooking",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("reference", models.CharField(default=core.models.make_tour_reference, editable=False, max_length=16, unique=True)),
                ("full_name", models.CharField(max_length=100)),
                ("contact", models.CharField(max_length=150)),
                ("email", models.EmailField(max_length=254)),
                ("travel_date", models.DateField()),
                ("travelers", models.PositiveSmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)])),
                ("special_requests", models.CharField(blank=True, max_length=1000)),
                ("status", models.CharField(choices=[("requested", "Request received"), ("confirmed", "Confirmed"), ("completed", "Completed"), ("cancelled", "Cancelled")], default="requested", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("package", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="bookings", to="core.tourpackage")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="TrackingEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("status", models.CharField(choices=[("booked", "Booked"), ("picked_up", "Picked up"), ("in_transit", "In transit"), ("out_for_delivery", "Out for delivery"), ("delivered", "Delivered")], max_length=20)),
                ("location", models.CharField(blank=True, max_length=100)),
                ("note", models.CharField(blank=True, max_length=200)),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                ("shipment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="events", to="core.shipment")),
            ],
            options={"ordering": ["-timestamp"]},
        ),
    ]
