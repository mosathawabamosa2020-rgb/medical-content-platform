# Embedding Phase 2 Migration Plan (1536 -> 1024)

## Context
Phase 1 uses OpenAI embeddings (`1536`). Phase 2 target is self-hosted `BAAI/bge-m3` (`1024`).

## Required Changes
1. Redefine vector columns from `vector(1536)` to `vector(1024)` on `Reference`, `KnowledgeChunk`, and `Section`.
2. Run full re-embedding for all existing rows.
3. Freeze ingestion and generation writes during migration window.

## Rollback
1. Restore DB snapshot from pre-migration `pg_dump`.
2. Revert application config to OpenAI embedding mode.
3. Re-run ingestion jobs for records created during rollback window.

