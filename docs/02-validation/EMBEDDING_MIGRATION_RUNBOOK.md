# EMBEDDING_MIGRATION_RUNBOOK

Date: 2026-03-24
Status: Draft (staging first, no production activation)

## Goal
Safely stage and validate migration from 1536-dim embeddings to self-hosted 1024-dim embeddings (`BAAI/bge-m3`) without impacting production.

## Preconditions
1. Full database backup exists for all vector-bearing tables.
2. Staging environment is available and isolated from production.
3. `embedding-service` is reachable and healthy.
4. Re-embedding tool is available (`tools/reembed_all_chunks.js` in Phase C scope). Until that tool exists, adapt an existing utility (`tools/regenerate_embeddings.js` / `tools/local_embed.js`) for staged runs.

## Stage Procedure
1. Start embedding service in phase2 profile:
   - `docker compose --profile phase2 up -d embedding-service`
2. Confirm health:
   - `curl -s http://localhost:8001/health`
3. Set staging env:
   - `EMBEDDING_SERVICE_URL=http://localhost:8001`
4. Run re-embedding in controlled batches (once tool is present):
   - `node tools/reembed_all_chunks.js --batch 500 --retries 3`
5. Apply vector dimension migration to 1024 for all vector columns:
   - `Reference.embedding`
   - `KnowledgeChunk.embedding`
   - `Section.embedding`
   - Use a Prisma migration (preferred) or run raw SQL in staging first:
   ```sql
   ALTER TABLE "Reference" ALTER COLUMN "embedding" TYPE vector(1024);
   ALTER TABLE "KnowledgeChunk" ALTER COLUMN "embedding" TYPE vector(1024);
   ALTER TABLE "Section" ALTER COLUMN "embedding" TYPE vector(1024);
   ```
6. Rebuild vector indexes after migration (HNSW/IVFFlat as configured per table).
   ```sql
   -- Example names; use actual index names from your environment
   REINDEX INDEX CONCURRENTLY reference_embedding_idx;
   REINDEX INDEX CONCURRENTLY knowledgechunk_embedding_idx;
   REINDEX INDEX CONCURRENTLY section_embedding_idx;
   ```
7. Run bilingual retrieval smoke tests (Arabic query -> English chunk hit).

## Verification Checklist
1. Embedding service responds with model name and vectors.
2. `/embed` returns 1024-dim vectors for non-empty input.
3. Re-embedding reports expected processed counts and no fatal errors.
4. Retrieval checks pass with staged embeddings and no schema drift.

## Rollback Plan
1. Stop re-embedding jobs.
2. Restore database snapshot.
3. Revert `EMBEDDING_SERVICE_URL`.
4. Restart application and re-run readiness + retrieval smoke checks.
