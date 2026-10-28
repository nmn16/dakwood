#!/usr/bin/env bash
set -Eeuo pipefail

python manage.py migrate --noinput
python manage.py seed_demo_data --if-empty

# Render web services do not always expose an interactive shell. Set the three
# DJANGO_SUPERUSER_* variables in the Render dashboard for the initial deploy,
# then remove them after the account is created.
if [[ -n "${DJANGO_SUPERUSER_USERNAME:-}" || -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]]; then
  python manage.py bootstrap_admin
fi
