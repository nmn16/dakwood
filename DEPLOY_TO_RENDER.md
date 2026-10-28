# Deploy Kenchain Groups to Render

The repository includes a production-oriented Blueprint. It provisions a Django/Gunicorn web service and a persistent PostgreSQL database. The configured plans are paid, so review Render's current prices before applying.

## 1. Push the project to GitHub from Windows PowerShell

Extract the ZIP, open PowerShell inside `kenchain-backend`, then run:

```powershell
git init
git add .
git commit -m "Prepare Kenchain Groups for production"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kenchain-groups.git
git push -u origin main
```

Replace `YOUR_USERNAME` and the remote URL with your GitHub repository details. Keep `.env`, `db.sqlite3`, credentials and real customer records out of Git.

## 2. Create the Render Blueprint

1. Sign in at <https://dashboard.render.com/>.
2. Choose **New → Blueprint** and connect the GitHub repository.
3. Apply the `render.yaml` Blueprint.
4. Review plan sizes and cost, then approve provisioning.
5. Wait for GitHub Actions to pass and for Render to finish deployment.

The build command installs packages and runs `collectstatic`. The release command runs database migrations and seeds the demo catalogue only if both catalogues are empty. Render checks `/health/` before considering the service healthy.

## 3. Create the admin account

Temporarily add these environment variables to the Render web service, using your own values:

- `DJANGO_SUPERUSER_USERNAME`
- `DJANGO_SUPERUSER_EMAIL`
- `DJANGO_SUPERUSER_PASSWORD`

Save/redeploy. The release command validates the password and creates the account. Remove the variables after successful deployment and redeploy. Never hard-code deployment credentials in Python or commit them to Git.

## 4. Verify after deployment

Open these pages on the service URL Render assigns:

- `/health/` should return `{"status":"ok"}`
- `/` should display the site
- `/admin/` should display Django's login page
- `/api/hospitality/properties/` should return hospitality data
- `/api/tours/packages/` should return tour data

Create an accommodation request and a tour request; verify them in the admin. Add a shipment and tracking events in Admin → Shipments, then test `/api/track/<tracking-number>/`.

## 5. Before live customer use

Replace sample catalogues/prices; configure real email delivery; review privacy/terms/cancellation requirements; configure and test database backups; add monitoring and edge rate limiting; and complete security/load testing. The current booking process takes requests for staff confirmation and does not process payments or query live supplier inventory.
