# SCHEMA_HARDENING_MIGRATION_PLAN

Date: 2026-03-09
Supersedes: docs/SCHEMA_SEMANTICS_REVIEW_2026-03-08.md (implementation section)

## Implemented in Schema (Phase-1)
- Added taxonomy lifecycle fields:
  - `Department.isActive`, `Department.archivedAt`
  - `Device.isActive`, `Device.archivedAt`
  - `DeviceModel.isActive`, `DeviceModel.archivedAt`
- Added normalized source identifiers:
  - `Reference.doi`, `Reference.pmid`, `Reference.arxivId`, `Reference.sourceFingerprint`

## Pending Migration Execution
1. Apply migration to database (`npx prisma migrate deploy`) - done on 2026-03-09.
2. Regenerate Prisma client - done (`npx prisma generate`).
3. Update taxonomy/admin APIs to support activate/deactivate lifecycle actions - done.
4. Add deduplication logic using normalized identifiers and source fingerprint - done for ingestion/discovery/upload flows.

## Current Open Follow-ups
1. Add API/UI coverage for lifecycle fields in all relevant operator flows beyond taxonomy baseline.
2. Expand dedup checks with stricter uniqueness policy once production source behavior is validated.

## parsedText Policy
- `Reference.parsedText` is retained as transitional extraction/debug artifact.
- Canonical knowledge serving remains based on verified `Section` / retrieval pipeline.
- Retention policy to be finalized in the next operations hardening pass.
