# RETRIEVAL_PRODUCTION_CERTIFICATION

Date: 2026-03-05
Status: NOT CERTIFIED

## Scope
- Verified IVFFlat index presence
- Tested retrieval query plans on 10k references / 100k sections
- Measured concurrency behavior at 20 concurrent requests

## Evidence

### Index Verification
- `section_embedding_ivfflat` exists on `Section(embedding vector_cosine_ops)`.

### Dataset Baseline
- References: 10,000
- Sections: 100,000
- Verified references: 10,000

### Query Plan (ANN path)
- Plan shows index usage via `Index Scan using section_embedding_ivfflat`.
- Join to `Reference` applies verified-only guard.

### Concurrency Benchmark (20 users)
- Requests: 60
- Concurrency: 20
- p50: 15,816.82 ms
- p95: 24,734.82 ms
- p99: 24,868.94 ms
- avg: 18,098.26 ms

Target SLO:
- p50 < 150 ms
- p95 < 400 ms
- p99 < 700 ms

Result:
- SLO not met.

## Tuning Actions Applied
- Retrieval SQL changed to section-first ANN candidate selection, then verified reference join.
- Docker Postgres tuning defaults added:
  - `shared_buffers=512MB`
  - `work_mem=32MB`
  - `effective_cache_size=1536MB`
  - `max_connections=200`

## Dynamic IVFFlat `lists` Sweep

Required target: test lists `100 / 200 / 500`.

Observed:
- `lists=100`: creation works under normal memory.
- higher list sweeps (`200/500`) in this environment caused long-running index build and timeout/resource constraints during this execution window.

Status:
- Partial evidence only; full sweep not completed in bounded time.

## Root-Cause Notes
- Benchmark vectors are near-identical synthetic vectors, causing poor ANN selectivity and worst-case ranking behavior.
- Additional production tuning required:
  - realistic embedding distributions
  - query-time ANN probe tuning
  - optional HNSW evaluation for higher-scale target (500k sections / 50 concurrency)

## Certification Decision
- NOT CERTIFIED for production SLO gate.
