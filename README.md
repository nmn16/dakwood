# Kenchain Groups

Django application for the Kenchain Groups website, hospitality booking requests, Tours & Travels booking requests, enquiries, and courier tracking. The frontend and API are served by one Django service.

## Project areas

- **Hospitality:** separate accommodation catalogue and stay-request workflow, date overlap validation, room-capacity checks, booking references, and status lookup.
- **Tours & Travels:** separate tour package catalogue and trip-request workflow, date/group-capacity checks, booking references, and status lookup.
- **Courier:** shipment records and tracking events managed through Django Admin; customers can query a tracking number.
- **Enquiries:** records general, Adventures, and Courier enquiries.
- **Admin:** manage properties, packages, bookings, shipments, tracking events and enquiries at `/admin/`.

Booking creation is a request-and-staff-confirmation flow. It does not take payments or connect to live supplier inventory.

## Local development on Windows PowerShell

Run from this folder (`kenchain-backend`):

```powershell
py -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py createsuperuser
python manage.py runserver
```

If PowerShell blocks activation, run this once in the same PowerShell window and activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

Open the site at `http://127.0.0.1:8000/`, admin at `http://127.0.0.1:8000/admin/`, and health check at `http://127.0.0.1:8000/health/`.

For macOS/Linux, activate with `source venv/bin/activate` instead. SQLite is used for local development by default. `seed_demo_data` adds sample properties and packages. Sample names/prices are demonstration content and should be replaced with approved business information before launch.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health/` | Platform health check with database connectivity |
| GET | `/api/hospitality/properties/` | List active accommodation |
| POST | `/api/hospitality/bookings/` | Create an accommodation request |
| GET | `/api/tours/packages/` | List active tours |
| POST | `/api/tours/bookings/` | Create a tour request |
| GET | `/api/bookings/<reference>/` | Check a hospitality or tour booking status |
| POST | `/api/inquiries/` | Save an enquiry |
| GET | `/api/track/<tracking-number>/` | Look up a courier shipment |

POST requests accept JSON and require Django CSRF protection. The bundled frontend sends the CSRF token automatically. Validation failures return JSON with an `error` field. A newly created booking receives a unique public reference, but customer contact information is not returned from the public status endpoint.

## Automated checks

```powershell
python manage.py check
python manage.py test
python manage.py check --deploy
```

`check --deploy` should be run with production environment variables and will highlight deployment settings that need attention. A GitHub Actions workflow runs the basic Django check and test suite on pushes/pull requests to `main`.

## Production deployment on Render

The project includes `render.yaml`, `build.sh`, and `release.sh`. The Blueprint provisions a Django/Gunicorn web service and PostgreSQL database in Singapore. It uses a non-free service and database plan because the free web service can sleep and the free PostgreSQL plan is not appropriate for durable production records. Review current plan and pricing in Render before applying it.

1. Create a GitHub repository and push the *contents of this folder* to the repository root. Do not commit `.env`, database files, credentials, or customer data.
2. In Render, choose **New → Blueprint**, connect the repository, and apply `render.yaml`.
3. The build installs dependencies and collects static files. The release command migrates the database and inserts the sample catalogue only if the catalogue is empty.
4. Wait for GitHub Actions to pass and for Render to finish deploying. Check `/health/`, then `/` and `/admin/` on the URL Render gives you.
5. Create the first admin as described below, then remove its temporary password environment variable.

### Create the first production admin

In the Render web service's **Environment** settings, temporarily set:

- `DJANGO_SUPERUSER_USERNAME`: a unique admin username
- `DJANGO_SUPERUSER_EMAIL`: your admin email address
- `DJANGO_SUPERUSER_PASSWORD`: a strong unique password of at least 12 characters that passes Django's validators

Save/redeploy. `release.sh` creates the superuser if it doesn't already exist. If the variables are incomplete or the password is rejected, the release command fails rather than silently deploying without an administrator. After the account is created successfully, remove all three variables and redeploy. Do not put a real password in the repository or in the source file.

### Production environment

The Blueprint sets `DJANGO_DEBUG=0`, generates `DJANGO_SECRET_KEY`, uses PostgreSQL through `DATABASE_URL`, configures allowed hosts, enables HTTPS/security settings, collects static assets with WhiteNoise, and exposes `/health/` for service monitoring. Production settings intentionally refuse to start when `DATABASE_URL`, `DJANGO_SECRET_KEY`, or valid allowed hosts are missing, reducing the risk of accidentally running with debug settings or ephemeral SQLite data.

Email delivery is disabled by default in production to avoid writing customer details to web logs. To enable real notifications, configure a supported SMTP provider with `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, and `DEFAULT_FROM_EMAIL`. Set `INQUIRY_NOTIFY_EMAIL` to the staff inbox. Confirm that your hosting plan/provider permits the chosen email transport. Booking creation does not fail when notification delivery is unavailable.

For a custom domain, add its host to `DJANGO_ALLOWED_HOSTS` and its HTTPS origin to `DJANGO_CSRF_TRUSTED_ORIGINS`. Keep backups enabled for the production database and test restoring them. Use secrets management for credentials and configure monitoring/alerts before onboarding customers.

## Production scope and operational checklist

Before accepting real customers, replace demo inventory and prices; publish privacy, terms and cancellation policies; configure verified business email; set up database backups and restore tests; confirm monitoring and rate-limiting/WAF at the edge; and perform security and load tests. The app does not currently include payments, real-time hotel/tour supplier integrations, account login for customers, automated cancellations, or third-party courier integrations.

## Photos and video

The frontend now includes a resort hero photograph, a playable resort-drone clip, photo-led accommodation and tour cards, and a courier parcel photo. Photos/videos load from Unsplash and Pexels CDNs, so visitors need an internet connection for those media items. Media sources and license references are documented in `MEDIA_SOURCES.md`. Replace the photo URL arrays in `frontend/js/main.js` or the source URLs in `frontend/index.html` to customize imagery. The tour and accommodation card images rotate by item position; the booking/database workflow is unchanged.
