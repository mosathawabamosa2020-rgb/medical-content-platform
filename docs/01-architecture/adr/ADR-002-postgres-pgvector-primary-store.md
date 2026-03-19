# ADR-002: PostgreSQL + pgvector as Primary Knowledge Store

- Date: 2026-03-08
- Status: Accepted
- Maps to: TASK-004, TASK-005, TASK-019, TASK-024, TASK-040

## Context
The platform needs one authoritative store for structured entities (taxonomy, references, verification state) and semantic retrieval support.

## Decision
Use PostgreSQL as the primary system of record and pgvector-backed vectors for semantic retrieval.

## Consequences
- Positive: transactional consistency, strong queryability, one storage governance model.
- Positive: hybrid retrieval is possible with SQL + vector search.
- Negative: vector scale limits compared to dedicated vector DB at very large scale.
- Mitigation: keep retrieval abstraction in `lib/services/retrieval/*` for future backend swap if needed.
