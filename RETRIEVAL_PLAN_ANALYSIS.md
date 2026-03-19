# RETRIEVAL_PLAN_ANALYSIS

Date: 2026-03-05

## 1. Production Query Path Analyzed

Analyzed query is the exact API path used by `lib/services/retrieval/retrieve.ts`:

- ANN candidate query on `Section.embedding <=> query_vector`
- join to `Reference`
- enforced filter `Reference.status = 'verified'`
- final `LIMIT` hard-capped by policy (`MAX_TOP_K = 25`)

## 2. Explain Output Summary

Command executed:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...
```

Key findings from `retrieval_explain.txt`:

- Access type: `Index Scan using section_embedding_ivfflat`
- Sequential scan: not used on primary ANN path
- Planner estimate: very large row-space (`rows=100000`) despite low final limit
- Actual execution: high latency (12.6s in sampled run)
- Buffer profile: high heap reads (`read=84518`) and temp usage

Representative lines:

- `Index Scan using section_embedding_ivfflat on "Section" s`
- `Execution Time: 12607.823 ms`
- `Buffers: shared hit=16259 read=84518, temp read=294 written=295`

## 3. Root Cause Diagnosis

1. ANN index is being used, but high heap-page reads dominate runtime.
2. Current DB memory settings are conservative for this workload:
   - `shared_buffers=128MB`
   - `work_mem=4MB`
   - `maintenance_work_mem=64MB`
3. Candidate prefetch + join still causes significant IO pressure under concurrent load.

## 4. Guardrail Verification

Implemented and verified:

- `topK` hard cap in API validation
- verified-only filter in SQL path
- no unbounded retrieval path
- no `$queryRawUnsafe` user interpolation path for query inputs in runtime API
- retrieval logs now emit `topKUsed` and `probeUsed`

## 5. Conclusion

- Query plan uses ANN index (good).
- Performance target is not met with IVFFlat alone in this environment.
- Escalation path executed: HNSW evaluation performed (documented in `PERFORMANCE_EVIDENCE_BENCHMARKS.md`).
