# DATABASE_REPRODUCIBILITY_CERTIFICATION

Date: 2026-03-05
Status: CERTIFIED (with noted constraints)

## Chosen Remediation Strategy

Strategy C: Reset + create an authoritative baseline migration.

Rationale:
- The repo had drift between `prisma/migrations` and `prisma/manual_migrations`.
- Deterministic production deploy requires a single tracked Prisma migration path.

## Migration Graph (Authoritative)

1. `20260303_add_indexes_and_verificationlog` (retained as historical no-op placeholder)
2. `202603040001_authoritative_baseline` (full schema baseline + vector extension + ANN index)

## Schema Alignment Actions

- Added tracked baseline migration under `prisma/migrations/202603040001_authoritative_baseline/migration.sql`.
- Added `Section.embedding vector(1536)` and index:
  - `section_embedding_ivfflat` on `Section(embedding vector_cosine_ops)` with `lists=100`.
- Added tracked models for governance parity:
  - `File`
  - `AuditLog`
- Deprecated manual SQL migration runner (`scripts/run_migrations.js`) to avoid split migration paths.

## Final Schema Snapshot (High-Level)

Core tables verified after deploy:
- `User`, `Device`, `File`, `Reference`, `Section`, `VerificationLog`, `AuditLog`, `KnowledgeChunk`, `IngestionLog`, `PlannerSuggestion`.

Core vector columns:
- `Reference.embedding vector(1536)`
- `Section.embedding vector(1536)`
- `KnowledgeChunk.embedding vector(1536)`

## Clean Bootstrap Proof

Executed from clean DB volume:

```bash
docker compose down -v
docker compose up -d
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed:admin
npm run build
```

Observed results:
- `npm install` PASS
- `prisma generate` PASS
- `prisma migrate deploy` PASS (all tracked migrations applied)
- `seed:admin` PASS (sequential run after migrations)
- `npm run build` PASS

Notes:
- `npm start` default port `3000` encountered `EADDRINUSE` in this workstation session (environment occupancy), not schema/migration failure.

## Determinism Decision

PASS

The database can now be rebuilt from zero using tracked Prisma migrations without manual SQL intervention.
