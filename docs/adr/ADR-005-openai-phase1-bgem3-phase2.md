# ADR-005: OpenAI Embeddings in Phase 1, bge-m3 in Phase 2

## Status
Accepted

## Context
Phase 1 requires production reliability with minimal infra overhead. Phase 2 targets cost control and multilingual retrieval optimization.

## Decision
Use OpenAI embeddings (1536 dimensions) in Phase 1. Plan migration to self-hosted `BAAI/bge-m3` (1024 dimensions) in Phase 2.

## Consequences
- Phase 1 remains operational with low setup friction.
- Phase 2 requires vector-column dimension migration and full re-embedding.
- Migration must include maintenance window and rollback plan.
