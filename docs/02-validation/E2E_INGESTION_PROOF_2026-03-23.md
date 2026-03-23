# E2E Ingestion Proof Report
Date: 2026-03-23

## Objective
Demonstrate end-to-end lifecycle evidence:
- Reference upload/ingestion
- Chunk creation and embedding
- Verification approval
- Retrieval
- Generated content with citations

## Execution Log
1. Infrastructure startup
   - Command: `docker compose up -d postgres redis`
   - Result: PASS (containers started)

2. Migration baseline check
   - Command: `npm run db:migrate:deploy`
   - Result: PASS (no pending migrations)

3. E2E lifecycle proof script
   - Command: `node tools/e2e_lifecycle_proof.js`
   - Result: FAIL
   - Failure:
     - `type "public.UserRole" does not exist`
     - Indicates runtime schema mismatch between current DB state and expected Prisma model.

4. Schema sync attempt
   - Command: `npm run db:push`
   - Result: FAIL
   - Failure:
     - `column "fts_arabic" of relation "KnowledgeChunk" is a generated column`
     - Current DB state requires a controlled/manual remediation path rather than direct push.

## Supporting Evidence
- Script used: `tools/e2e_lifecycle_proof.js`
- Error signatures captured from execution:
  - Prisma `UserRole` enum missing.
  - Prisma push blocked on generated-column expression handling for `fts_arabic`.

## Current Status
- End-to-end live proof is **blocked** by database schema-state drift in the local runtime.
- The application code path is healthy at compile/test/build level, but DB runtime needs reconciliation before live lifecycle proof can be completed.

## What Is Ready
- `/api/metrics` endpoint is implemented and tested.
- Embedding fallback observability (`EMBED_FALLBACK_ACTIVATED`) is implemented and tested.
- Storage adapter canonicalization is complete and validated.
- Source adapters now share retry/backoff/rate-limit policy logic.

## Required Next Step To Unblock E2E Proof
1. Reconcile DB schema baseline against Prisma models (enum/type + generated-column migration strategy).
2. Re-run `tools/e2e_lifecycle_proof.js`.
3. Capture final artifact with:
   - reference IDs
   - approved chunk counts (>= 5)
   - bilingual retrieval evidence
   - generated content citation IDs

## Verification-Team Question
Please confirm the canonical recovery path for this repository when DB schema and migration history diverge:
- Option A: Fresh reset and full replay of approved migrations.
- Option B: Manual patch migration to align existing DB without reset.
