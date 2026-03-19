# Rollback Procedure

## Scope
This procedure covers application image rollback and database rollback.

## Application Rollback
1. Identify the last known-good image tag.
2. Pin deployment to that tag (do not use floating tags in rollback).
3. Restart `app` and `worker` with pinned tags.
4. Run `npm run ops:preflight` and smoke-test critical endpoints.

## Database Rollback
1. Ensure a pre-deployment dump exists (`pg_dump -Fc`).
2. Stop writes to the application.
3. Restore snapshot with:
   `pg_restore --clean --if-exists -h localhost -p 15432 -U platform_user -d medical_platform <dump_file>`
4. Re-run Prisma migration status:
   `npx prisma migrate status`
5. Bring app and worker back online and validate health.

## Verification Checklist
- `/api/health` responds `ok`.
- Admin auth works.
- Reference upload and ingestion paths respond without 5xx.
- Logs show no migration drift errors.
