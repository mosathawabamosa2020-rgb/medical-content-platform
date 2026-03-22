# Local Setup Guide (Windows / PowerShell)

Purpose: Step-by-step copy-paste friendly instructions to get a fully functional, version-controlled, containerized local development environment for this project and to generate/commit Prisma migrations.

IMPORTANT: Replace placeholders like <your-repo-url>, <user>, <pass>, <host>, and <db> with real values. Run PowerShell as Administrator where noted (Docker Desktop install may require it).

---

## 1) Prerequisites (install first)

Install the following if not already present:
- Git for Windows: https://git-scm.com/download/win
- Docker Desktop for Windows: https://www.docker.com/get-started
- Node.js (LTS >= 18): https://nodejs.org/
- (Optional) VS Code: https://code.visualstudio.com/

Verify installs in PowerShell:

```powershell
git --version
docker --version
node --version
npm --version
```

If any command fails, install the missing tool and re-run the verification commands above.

---

## 2) Clone the repository (preferred: start from remote)

If you have the remote repository URL, run:

```powershell
cd $HOME\Documents
git clone <your-repo-url>
cd medical-content-platform
```

If you already have the project files but there is no `.git` (e.g., downloaded ZIP), initialize and connect to remote:

```powershell
cd C:\path\to\medical-content-platform
# Initialize git repo locally
git init
# Add remote (replace URL)
git remote add origin <your-repo-url>
# Create initial branch tracking origin/main (if you know main exists)
git fetch origin
git checkout -b main --track origin/main
# If the remote doesn't exist yet, create and push:
# git add . && git commit -m "initial import" && git branch -M main && git remote add origin <your-repo-url> && git push -u origin main
```

Note: If you get "fatal: not a git repository" previously, the above `git init` / `git remote add` flow will make the working folder a Git repository.

---

## 3) Install project dependencies

From the project root (folder that contains `package.json`):

```powershell
npm ci
# or if you prefer install: npm install
```

---

## 4) Create `.env.local` with required environment variables

Create a `.env.local` file at the project root. The app expects at least the following variables in test/dev mode.

Copy the exact block below into PowerShell to write the file (adjust values):

```powershell
@'
# Environment for local development
DATABASE_URL="postgresql://postgres:postgres@localhost:15432/medical?schema=public"
NEXTAUTH_SECRET="replace-with-a-random-secret"
OPENAI_API_KEY="your-openai-key-or-empty-for-local"
# any other variables your app expects (API keys, etc.)
'@ > .env.local
```

- `NEXTAUTH_SECRET`: create a reasonably long secret (32+ chars). Example quick generator in PowerShell:

```powershell
# prints a GUID you can paste
[guid]::NewGuid().ToString()
```

Replace the placeholder values with real ones. The `DATABASE_URL` above matches the Postgres container we create next.

---

## 4.1) External Verification Runtime Baseline (Quick Check)

This is the minimum baseline an external verification team should be able to reproduce:
- Required env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`
- Optional env var: `REDIS_URL` (only if Redis is running)
- Database port assumption: 15432 (docker-compose default)

Run preflight after the env file exists:

```powershell
npm run ops:preflight
```

If preflight reports missing env vars, export them in the same shell session and re-run:

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:15432/medical?schema=public"
$env:NEXTAUTH_SECRET="replace-with-a-random-secret"
npm run ops:preflight
```

---

## 5) Create `docker-compose.yml` (Postgres + Admin UI)

If your repo does not include a `docker-compose.yml`, create one so you can run a local Postgres. Copy-paste the following into the project root using PowerShell:

```powershell
@'
version: "3.8"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: medical
    ports:
      - "15432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
  adminer:
    image: adminer
    restart: always
    ports:
      - "8080:8080"
volumes:
  db_data:
'@ > docker-compose.yml
```

This creates a Postgres DB with user `postgres` / password `postgres`, database `medical`, and Adminer at http://localhost:8080 to inspect the DB.

---

## 6) Start Docker services and verify DB is ready

Start containers (detached):

```powershell
docker-compose up -d
```

Check containers are running:

```powershell
docker-compose ps
# view logs for db if needed
docker-compose logs -f db
```

Wait until Postgres finishes init and shows "database system is ready to accept connections" in the logs.

You can verify by connecting with Adminer at http://localhost:8080 (select PostgreSQL, server: host.docker.internal or localhost, port 15432, username: postgres, password: postgres, database: medical).

---

## 7) Ensure Prisma client and generate types

From project root:

```powershell
# Ensure Prisma is available, generate client
npx prisma generate
```

If this requires a DATABASE_URL, ensure .env.local has the `DATABASE_URL` set as above or export it to the session:

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:15432/medical?schema=public"
```

---

## 8) Create the Prisma migration (create-only) and commit

This is the exact sequence for the task you requested (generate migration files, commit them to git). Run these commands after you've confirmed Postgres is healthy and you are on the `main` branch.

```powershell
# ensure you're on main and up-to-date
git checkout main
git pull origin main

# export the DATABASE_URL into this Powershell session (so prisma can connect)
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:15432/medical?schema=public"

# generate migration files without applying them (create-only). Replace the migration name as appropriate
npx prisma migrate dev --name add_indexes_and_verificationlog --create-only

# Stage the new migration files and commit
git add prisma/migrations
git commit -m "chore(prisma): add migration to create indexes for Reference and VerificationLog"

git push origin main
```

Notes:
- `--create-only` instructs Prisma to create migration files locally but not apply them to the DB. If you want Prisma to apply the migration immediately, omit `--create-only`.
- If `npx prisma migrate dev` complains about DB connectivity, ensure the Docker Postgres container is running and reachable, and that `$env:DATABASE_URL` is set in the same shell.

---

## 9) Run the application locally

Start the Next.js app in development mode (in project root):

```powershell
npm run dev
```

Open http://localhost:3000 in your browser to view the app.

---

## 10) Run the full test suite (post-migration commit)

After migration files are committed to `main`, run the tests to validate everything:

```powershell
npm ci
npm run test -- --runInBand --detectOpenHandles
```

All tests should pass locally (the project has a comprehensive Jest suite). If tests fail, copy the console output and open an issue or share it with the team.

---

## 11) Troubleshooting / common issues

- "fatal: not a git repository": run `git init` and set `origin` remote as explained in Section 2.
- Docker not starting or `docker-compose` missing: install Docker Desktop and enable WSL2 if required.
- Prisma CLI complaining about missing `DATABASE_URL`: export it in PowerShell using the `$env:...` syntax and re-run the Prisma command in the same shell.
- If port 15432 is in use, stop the conflicting service or change port mapping in `docker-compose.yml` and update `DATABASE_URL` accordingly.

---

## 12) Definition of Done (how you know it's complete)

- The project lead can run the `npx prisma migrate dev --name ... --create-only` command successfully and sees new migration files under `prisma/migrations/`.
- The migration files have been staged and committed to git and pushed to `main`.
- The project's full test suite (`npm run test`) runs and passes locally after this migration is present.

---

If you want, once you've pushed the migration I can run the test suite here and produce the final Phase 3a Hardening completion report.

Thank you — let me know when you have the migration pushed or if you want me to initialize git and commit locally on your behalf (I can do that only with your confirmation).
