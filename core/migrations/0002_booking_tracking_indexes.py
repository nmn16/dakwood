from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="hospitalitybooking",
            index=models.Index(
                fields=["property", "status", "check_in", "check_out"],
                name="hosp_booking_availability_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="tourbooking",
            index=models.Index(
                fields=["package", "travel_date", "status"],
                name="tour_booking_capacity_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="trackingevent",
            index=models.Index(
                fields=["shipment", "timestamp"],
                name="tracking_event_latest_idx",
            ),
        ),
    ]
