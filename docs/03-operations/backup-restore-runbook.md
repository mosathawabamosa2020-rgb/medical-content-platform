# Backup Restore Runbook

Date: 2026-03-19

## Backup
- App-level backup: `npm run ops:backup`
- PostgreSQL dump via Docker: `docker compose -f docker-compose.backup.yml run --rm postgres-backup`

## Restore
- App-level restore latest (without DB): `npm run ops:restore -- --skip-db`
- App-level restore specific backup (without DB): `npm run ops:restore -- --from artifacts/backups/<backup-id> --skip-db`
- PostgreSQL restore from dump:
  `pg_restore --clean --if-exists -h localhost -p 15432 -U platform_user -d medical_platform artifacts/backups/medical_platform.dump`

## Notes
- DB SQL backup/restore requires postgres-compatible `DATABASE_URL` and `pg_dump`/`pg_restore` binaries available.
- Backup manifest is written to `artifacts/backups/<backup-id>/manifest.json`.
