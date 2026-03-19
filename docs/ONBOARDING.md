Operation Handover & Onboarding
===============================

This document describes how to bring the repository up to a state where an admin user can sign in and the governance dashboard is available.

Prereqs
- Node 18+, npm
- A running PostgreSQL database on port 15432 (docker-compose default)
- DATABASE_URL set in `.env.local` or provided in the shell
- NEXTAUTH_SECRET set in `.env.local` or provided in the shell

Steps

1. Apply manual SQL migrations (adds role enum and audit table):

```bash
npm run db:apply
```

2. Generate Prisma client (if using prisma):

```bash
npx prisma generate
```

3. Create an admin user (CLI or env):

```bash
node tools/create_admin.js --email admin@example.com --password "yourpass" --name "Admin User"
# or via env vars
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpass node tools/create_admin.js
```

4. (Optional) Install NextAuth Prisma Adapter for production (recommended):

```bash
npm install @next-auth/prisma-adapter
npx prisma generate
```

5. Start the app locally:

```bash
npm run dev
```

> **Frontend context**: the app now includes a global `SessionProvider` in `pages/_app.tsx`.
> This wrapper is required for any page that uses `useSession` (dashboard,
> ingestion-monitor, research, etc.). If you add new client components that
> read session data, the provider must wrap them.

Notes
- The script `tools/create_admin.js` will create or update an existing user and set the role to `admin`.
- Legacy front‑end pieces (planner, workshop, and associated planner APIs) have been moved into `/archive` and are no longer served. Only the governance dashboard is exposed by default via the homepage.
- Health endpoints are now split:
  * `GET /api/health/system` returns `{ status: "ok" }` for simple liveness.
  * `GET /api/health/database` performs `SELECT 1` and returns `{ status: "ok" }` when the database is reachable.
  The previous `/api/devices` route has been archived for future research use and should not be used for health checks.
- New admin stats endpoint:
  * `GET /api/admin/stats` (admin-only) responds with `{ ingestedCount, verificationCount, knowledgeLibraryCount }` and is consumed by the executive dashboard.
- New verification APIs for references:
  * `GET /api/admin/references/pending_review` (admin-only) returns basic info for every reference waiting verification.
  * `GET /api/admin/references/[id]` (admin-only) returns a single reference record.
  * `POST /api/admin/verification/[id]` (admin-only) accepts `{ decision: "approved"|"rejected", comment?: string }` and atomically updates status and writes a `VerificationLog` entry; handles concurrency by returning 409 on conflict.
- A public library endpoint was added:
  * `GET /api/references/library?page=1&limit=20` returns verified references with pagination.
- Added `IngestionLog` table and corresponding migration script; worker writes activity messages here and the ingestion monitor page reads from it.
- **Reference lifecycle update:** the `ReferenceStatus` enum now includes full governance states (`pending_ingestion`, `processing`, `processed`, `pending_review`, `verified`, `rejected`, `archived`). Run `npm run db:migrate` after pulling the latest schema to apply.
- **Database indexes added:** new `@@index` declarations on `Reference(status)`, `Reference(createdAt)`, `VerificationLog(referenceId)` and `VerificationLog(reviewerId)` for long‑term performance. Re-run migrations to create these indexes.

**Note:** the previously evaluated `playwright-mcp` external tool is now frozen/deprecated due to instability (exit code 4294967295). All verification logic lives in the built‑in test suite; do not rely on the external tool.
