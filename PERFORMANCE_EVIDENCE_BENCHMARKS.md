# PERFORMANCE_EVIDENCE_BENCHMARKS

Date: 2026-03-05
Dataset: 10k references, 100k sections
Concurrency: 20

## 1. IVFFlat Matrix (lists x probes)

Source: `retrieval_hardening_results.json`

### lists = 100

- probes=5: p50 9491.95ms, p95 9535.18ms, p99 9536.34ms
- probes=10: p50 7954.73ms, p95 8118.17ms, p99 8123.35ms
- probes=20: p50 7251.07ms, p95 7413.13ms, p99 7416.61ms
- probes=40: p50 6751.47ms, p95 7278.40ms, p99 7293.60ms

### lists = 200

- probes=5: p50 7835.43ms, p95 7927.81ms, p99 7930.94ms
- probes=10: p50 7618.49ms, p95 7715.33ms, p99 7752.41ms
- probes=20: p50 6362.38ms, p95 6468.68ms, p99 6482.84ms
- probes=40: p50 6377.51ms, p95 6484.84ms, p99 6485.19ms

### lists = 500

- probes=5: p50 7901.86ms, p95 7943.82ms, p99 8232.59ms
- probes=10: p50 11965.48ms, p95 12138.39ms, p99 12147.96ms
- probes=20: p50 8515.27ms, p95 8644.47ms, p99 8659.23ms
- probes=40: p50 7645.45ms, p95 7807.57ms, p99 7812.82ms

Index validation:

- `section_embedding_ivfflat` exists
- final index setting: `lists=500`
- embedding dimension detected: `1536`

## 2. Explain Evidence (IVFFlat)

Representative output (`retrieval_explain.txt`):

- index used: `Index Scan using section_embedding_ivfflat`
- execution sample: `12607.823 ms`
- buffers: large shared reads + temp usage

## 3. HNSW Evaluation (Escalation Path)

Source: `hnsw_eval_output.txt`

- plan used: `Index Scan using section_embedding_hnsw`
- single query execution: `40.778 ms`
- 20-concurrent/20-request run:
  - p50: `447.27 ms`
  - p95: `781.98 ms`
  - p99: `833.41 ms`

Observation:

- HNSW materially improves over IVFFlat in this environment.
- Strict target (`p95 < 400ms`) is still not met.

## 4. SLO Decision

Current state: FAIL against required retrieval SLO.

- IVFFlat path: far above threshold
- HNSW evaluation: improved but still above p95 target under tested concurrency
