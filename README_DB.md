# Database Setup Instructions

**⚠️ PostgreSQL is NOT installed on this machine.**

## Step 1: Install PostgreSQL
Run this command in a new terminal/PowerShell window:
```powershell
winget install -e --id PostgreSQL.PostgreSQL.16
```
*   Follow the installation prompt.
*   **Important**: When asked for a password for the `postgres` user, memorize it (e.g., `password123` or `admin`).
*   Keep the port as `5432` (default).

## Step 2: Configure Project
Once installed, you must tell the project your password.
1.  Open `apps/backend/.env` (create it if missing).
2.  Add/Update this line:
    ```env
    DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/finterp?schema=public"
    ```
    *(Replace `YOUR_PASSWORD` with the one you set).*

## Step 3: Start the Backend
1.  Restart your terminal/VSCode to load the new PATH.
2.  Run migration (optional but good practice):
    ```bash
    cd apps/backend
    npx prisma migrate deploy
    ```
3.  Start the app:
    ```bash
    npm run start:dev
    ```

---
# (Old Instructions - verifying existing DB)
## Option 1: Automatic Script (Try this first)
Run the helper script I just created for you:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-db.ps1
```

## Option 2: Windows Service
1. Press `Win + R`, type `services.msc`, and hit Enter.
2. Scroll down and look for **postgresql-x64-15** (or similar version).
3. Right-click on it and select **Start**.

## Option 3: Docker
If you installed Postgres via Docker:
1. Open **Docker Desktop**.
2. Go to "Containers".
3. Find `postgres` (or `finterp-db`) and click the **Play (Start)** button.
4. Or run: `docker start postgres`

## Verification
Once started, verify connection by running:
```bash
node scripts/verify-audit.js
```
It should print "Login Success!".
