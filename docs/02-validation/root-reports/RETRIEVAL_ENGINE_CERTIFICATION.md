# RETRIEVAL_ENGINE_CERTIFICATION

Date: 2026-03-04
Status: NOT CERTIFIED (Performance + migration/index blockers)

## 1. Pipeline Implementation Review

Service path: `lib/services/retrieval/`

Implemented pipeline:
1. Normalize request (`normalize.ts`)
2. Generate query embedding (`embedder` dependency)
3. Vector retrieval (`retrieveVectorCandidates`)
4. Rank + metadata boost (`rank.ts`)
5. Filter by min score
6. Package response
7. Fallback to keyword retrieval on embed failure

## 2. Governance Safeguards

PASS:
- API validation via Zod in `/api/references/query`.
- `topK` max enforced by schema and policy (`MAX_TOP_K = 25`).
- Verified-only filter is embedded in SQL (`status = 'verified'`) for vector and keyword paths.
- Query SQL uses Prisma tagged `$queryRaw` (parameterized), no `$queryRawUnsafe` in retrieval service.

## 3. Contract and Type Stability

FAIL:
- `npm run build` fails:
  - `pages/api/references/query.ts(21,44): TS2345` (`query` optional mismatch against `RetrievalRequestInput`).
- This blocks production build certification.

## 4. Index and Explain Findings

Observed DB index state:
- Btree index on `Reference.status` and `Reference.uploadedAt`.
- No ANN vector index on `Reference.embedding` (`ivfflat`/`hnsw` not present).

Explain analysis observation:
- Planner uses btree status filter, then computes vector distance; no vector ANN index acceleration.

## 5. Performance Benchmark (Real DB)

Synthetic load generated in DB:
- ~10k references
- ~100k sections

Concurrent query benchmark result (200 requests, concurrency 20):
- p50 ~ 1556 ms
- p95 ~ 4625 ms
- p99 ~ 5694 ms
- avg ~ 1774 ms

Target from policy:
- P95 < 300 ms

Result:
- FAIL (well above target).

## 6. Embedding Consistency

PASS:
- `Reference.embedding` uses `vector(1536)`.

FAIL:
- `KnowledgeChunk.embedding` declared in Prisma but not physically present in DB baseline.

## Final Retrieval Certification Decision

NOT CERTIFIED

Blockers:
1. Production build type error on query API contract.
2. Missing vector ANN index.
3. Latency target not met under benchmark load.
4. Schema drift around `KnowledgeChunk.embedding`.
