# RETRIEVAL_LATENCY_DECOMPOSITION

Date: 2026-03-05
Source: `retrieval_latency_decomposition.json`

## Average Breakdown (ms)

- normalizationMs: 0.8
- embeddingMs: 0.8
- dbVectorMs: 372.8
- hydrationMs: 0.0
- rankingMs: 0.0
- serializationMs: 0.0
- totalMs: 375.0

## Notes

- Decomposition instrumentation is now emitted from retrieval engine meta.
- On current sample set, vector DB time dominates latency.
- `hydrationMs`, `rankingMs`, and `serializationMs` are near-zero in this sample because result-set handling is lightweight after capped candidate selection.

## Two-Phase Retrieval Enforcement Certification

Status: ENFORCED

Vector phase SQL (fetches only id/referenceId/similarity):

```sql
SELECT cand.id, cand."referenceId", 1 - cand.distance AS similarity
FROM (
  SELECT s.id, s."referenceId", (s.embedding <=> $query_vector) AS distance
  FROM "Section" s
  JOIN "Reference" r ON r.id = s."referenceId"
  WHERE s.embedding IS NOT NULL
    AND r.status = 'verified'
  ORDER BY s.embedding <=> $query_vector
  LIMIT $sectionProbeLimit
) cand
ORDER BY cand.distance ASC
LIMIT $prefetchLimit;
```

Hydration phase SQL (runs after limit, by selected ids only):

```sql
SELECT s.id, s."referenceId", s.content, s.title,
       r."deviceId", r."sourceReliabilityScore", r."uploadedAt", r."sourceUrl"
FROM "Section" s
JOIN "Reference" r ON r.id = s."referenceId"
WHERE s.id IN ($selectedIds);
```

Assertions:

- Vector query fetches only id/referenceId/similarity before hydration.
- Hydration occurs only for limited candidate ids.
- No ORM overfetch path is used for retrieval internals.
- Full section text is not loaded before vector LIMIT slicing.

## Final Benchmark Evidence (100k sections, 20 concurrency)

Source: `retrieval_final_benchmark.json`

- p50: 4507 ms
- p95: 24241 ms
- p99: 24243 ms
- CPU usage (PostgreSQL container `medical-content-platform-db-1`):
  - avg: 0.23%
  - max: 2.56%

EXPLAIN highlights:

- `Index Scan using section_embedding_hnsw on "Section" s`
- `Execution Time: 2.541 ms` for sampled query plan

SLO-B closure:

- Current measured concurrent latency is not within target envelope.
- Retrieval is **not closed** under SLO-B in this benchmark run.
