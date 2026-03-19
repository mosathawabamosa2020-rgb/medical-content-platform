# RETRIEVAL_ARCHITECTURE_AND_DIMENSION_VALIDATION_2026-03-08

Date: 2026-03-09
Directive Mapping: Workstream D (Search / Retrieval Hardening)

## Retrieval Baseline
- Primary path: PostgreSQL + pgvector + ranking policy.
- Vector queries: `lib/services/retrieval/retrieve.ts`.
- Ranking/engine orchestration: `lib/services/retrieval/engine.ts`.
- Embedding generation: `lib/embeddings.ts`.

## Embedding/Dimension Validation
Evidence:
- `lib/embeddings.ts` fallback dimension: `1536`.
- OpenAI model used: `text-embedding-3-small`.
- Migration evidence: `prisma/migrations/202603040001_authoritative_baseline/migration.sql` includes `vector(1536)`.

Conclusion:
- Current intended vector dimension is **1536**.
- Producer/storage alignment is consistent with current migration baseline.

## Retrieval Governance Findings
- Verified-only filtering exists in retrieval SQL (`Reference.status = 'verified'`).
- Device-scoped filtering exists.
- IVF probe policy is configurable and bounded.

## Gaps
- No single explicit runtime guard that rejects embedding vectors with non-1536 dimension before persistence.
- Multiple historical scripts reference `dist/lib/embeddings`, increasing drift risk.
- No formal retrieval quality acceptance benchmark tied to product thresholds.

## Recommendation
1. Add explicit dimension assertion before saving embeddings.
2. Consolidate script imports away from `dist/` runtime assumptions.
3. Define quality thresholds (precision/recall/latency SLO) and automate benchmark checks.
