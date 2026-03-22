# INGESTION_PIPELINE_CERTIFICATION

Date: 2026-03-04
Status: NOT CERTIFIED

## 1. Expected Certified Flow

Expected:
1. Admin upload action
2. File stored
3. Reference created in initial lifecycle state
4. Worker picks job
5. Text extraction
6. Embedding generation
7. Section creation (no duplicates)
8. Status `processed` then `pending_review`
9. Ingestion logs complete and coherent

## 2. Implemented Flows Found

### Flow A: Device Upload
UI: `pages/devices/[id]/references.tsx` -> `POST /api/references/upload`
- Stores file in `uploads/`
- Creates `Reference`
- Generates embeddings and writes `Reference.embedding`
- Does not create `Section` rows
- Does not transition through worker lifecycle states

### Flow B: Research Import
UI: `pages/admin/research.tsx` -> `POST /api/admin/ingestion/import`
- Creates reference for PubMed source
- Worker endpoint: `/api/admin/ingestion/run-worker` or `/api/admin/ingestion/process/[referenceId]`
- Worker performs extraction + `processing -> processed -> pending_review`

### Flow C: Discovery Ingest
UI: `pages/devices/[id]/discover.tsx` -> `POST /api/references/discovery/ingest`
- Fetches URL, stores snapshot/PDF, creates `Reference`
- No guaranteed section extraction at ingest-time

## 3. Certification Findings

PASS:
- Worker lifecycle sequence includes `processed` before `pending_review`.
- Ingestion worker writes `IngestionLog` entries.
- Worker failure path still transitions to `pending_review` for manual review.

FAIL:
1. Ingestion paths are inconsistent (A/B/C do not share one governed pipeline).
2. Upload flow does not produce sections but still performs embedding side effects.
3. Section deduplication/idempotency is not guaranteed by unique constraints or hash checks.
4. Error handling uses broad catches + console logging; failed side effects can leave partial state.
5. UI still relies on `alert()` in ingestion actions, violating governance UX consistency.

## 4. Transaction Boundaries

Observed:
- Worker section inserts are per-row operations, not wrapped in single reference-level transaction.
- Verification endpoint is transactional; ingestion endpoints are not uniformly transactional.

Risk:
- Partial ingestion data under failures (some sections written, some not).

## Final Ingestion Certification Decision

NOT CERTIFIED

Primary blockers:
- Multiple non-unified ingestion entry paths.
- Missing strong idempotency + dedup guarantees.
- Incomplete transactional boundaries for end-to-end ingestion mutations.
