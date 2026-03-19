# DATABASE_INTEGRITY_REPORT

Date: 2026-03-04
Scope: PostgreSQL + pgvector + Prisma 5.22.0
Status: PARTIAL PASS (Critical blockers remain)

## 1. Schema vs Migration Reality

Observed:
- Prisma schema defines core models: `User`, `Device`, `Reference`, `Section`, `VerificationLog`, `KnowledgeChunk`, `IngestionLog`, `PlannerSuggestion`.
- Prisma migration folder contains only one tracked migration: `prisma/migrations/20260303_add_indexes_and_verificationlog/migration.sql`.
- Actual database bootstrap relies on manual SQL chain (`prisma/manual_migrations/*.sql`).

Certification result:
- FAIL (governance reproducibility risk): schema creation is not represented in Prisma migration history, so `prisma migrate deploy` from clean DB fails baseline requirements.

## 2. Foreign Keys, Cascades, Orphans

Checks executed:
- Catalog FK inspection + orphan scans for major relations.

Results:
- Orphan counts checked: `Section->Reference`, `Section->Device`, `Reference->Device`, `KnowledgeChunk->Reference`, `VerificationLog->Reference`, `VerificationLog->User` => `0` in sampled DB state.
- FK constraints exist and are active.
- Duplicate FK detected on `Section(referenceId)`:
  - `Section_referenceId_fkey`
  - `fk_section_reference`
  - Both resolve to: `FOREIGN KEY ("referenceId") REFERENCES "Reference"(id) ON DELETE CASCADE`

Certification result:
- PASS for referential enforcement.
- FAIL for schema hygiene (duplicate FK should be normalized).

## 3. Enum and Status Integrity

Observed enums:
- `Role`: `admin`, `reviewer`, `editor`
- `ReferenceStatus`: `pending_ingestion`, `processing`, `processed`, `pending_review`, `verified`, `rejected`, `archived`

Certification result:
- PASS: enum values exist as expected in current codebase.

## 4. Vector Storage Integrity

Observed:
- `Reference.embedding` exists as `vector(1536)`.
- Prisma schema also declares `KnowledgeChunk.embedding Unsupported("vector")?`.
- Database table `KnowledgeChunk` currently has no `embedding` column in baseline SQL.

Certification result:
- FAIL (schema drift): Prisma model and DB physical schema are inconsistent for `KnowledgeChunk.embedding`.

## 5. Index Coverage

Observed reference indexes:
- `Reference_status_idx` (btree)
- `Reference_uploadedAt_idx` (btree)
- primary key index

Observed retrieval behavior:
- No vector ANN index (`ivfflat`/`hnsw`) found on `Reference.embedding`.

Certification result:
- PASS for basic btree indexes.
- FAIL for retrieval-scale vector index requirement.

## 6. Manual Migration Coherence

Manual chain executed successfully via `npm run db:apply`, including:
- `00_create_full_schema.sql`
- `01_add_vector_support.sql`
- `03_update_section_schema.sql`
- `04_add_audit_log.sql`
- `05_add_verified_reference_status.sql`
- `05_remove_section_status_audit.sql`

Risk:
- Manual chain and Prisma migration history are not fully reconciled.

## Final Database Integrity Decision

NOT CERTIFIED

Blocking reasons:
1. Bootstrap/migrate reproducibility is not clean with Prisma migrate workflow.
2. `KnowledgeChunk.embedding` schema drift.
3. Missing vector ANN index for retrieval scale.
4. Duplicate FK on `Section(referenceId)` indicates migration layering debt.
