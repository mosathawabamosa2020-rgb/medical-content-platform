# EMBEDDING_MIGRATION_RUNBOOK

Date: 2026-03-24
Status: Draft (staging first, no production activation)

## Goal
Safely stage and validate migration from 1536-dim embeddings to self-hosted 1024-dim embeddings (`BAAI/bge-m3`) without impacting production.

## Preconditions
1. Full database backup exists for all vector-bearing tables.
2. Staging environment is available and isolated from production.
3. `embedding-service` is reachable and healthy.

## Stage Procedure
1. Start embedding service in phase2 profile:
   - `docker compose --profile phase2 up -d embedding-service`
2. Confirm health:
   - `curl -s http://localhost:8001/health`
3. Set staging env:
   - `EMBEDDING_SERVICE_URL=http://localhost:8001`
4. Re-embed records in controlled batches (tooling phase):
   - `node tools/reembed_all.ts`
5. Apply vector dimension migration to 1024:
   - update `Reference.embedding`, `KnowledgeChunk.embedding`, `Section.embedding` to `vector(1024)`
6. Rebuild vector indexes (HNSW/IVFFlat as configured).
7. Run bilingual retrieval smoke tests (Arabic query -> English chunk hit).

## Verification Checklist
1. Embedding service responds with model name and vectors.
2. Re-embedding job reports expected processed counts and no fatal errors.
3. Retrieval checks pass with staged embeddings and no schema drift.

## Rollback Plan
1. Stop re-embedding jobs.
2. Restore database snapshot.
3. Revert `EMBEDDING_SERVICE_URL` change.
4. Restart application and re-run readiness + retrieval smoke checks.
