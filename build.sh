#!/usr/bin/env bash
set -Eeuo pipefail

python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python manage.py collectstatic --noinput
