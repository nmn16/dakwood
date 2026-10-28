import os

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.password_validation import validate_password


class Command(BaseCommand):
    """Create the first deployment admin from environment variables, if absent."""

    help = "Create a deployment superuser from environment variables if one does not exist."

    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "").strip()
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "").strip()

        if not username or not password:
            raise CommandError(
                "Set DJANGO_SUPERUSER_USERNAME and DJANGO_SUPERUSER_PASSWORD to bootstrap an admin."
            )

        User = get_user_model()
        existing = User.objects.filter(username=username).first()
        if existing:
            if not existing.is_superuser or not existing.is_staff:
                raise CommandError(
                    f"Username '{username}' already exists but is not an administrator. "
                    "Choose a different DJANGO_SUPERUSER_USERNAME."
                )
            self.stdout.write(f"Admin user '{username}' already exists; no changes made.")
            return

        candidate = User(username=username, email=email)
        try:
            validate_password(password, user=candidate)
        except ValidationError as exc:
            raise CommandError("The admin password does not meet Django's password requirements: " + "; ".join(exc.messages))

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f"Created admin user '{username}'."))
