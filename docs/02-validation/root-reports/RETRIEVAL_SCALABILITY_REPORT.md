# RETRIEVAL_SCALABILITY_REPORT

Date: 2026-03-05
Status: NOT CERTIFIED (Benchmark gate blocked)

## Implemented Remediation

1. Retrieval source switched to section-level vectors:
- `lib/services/retrieval/retrieve.ts` now queries `Section` joined with `Reference`.
- Verified-only filter enforced at SQL layer: `r.status = 'verified'`.

2. ANN index added (tracked migration):

```sql
CREATE INDEX section_embedding_ivfflat
ON "Section"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

ANALYZE "Section";
```

## Dataset Target

Target used:
- 10k references
- 100k sections
- concurrency >= 20

Observed DB counts after load attempts:
- references: 10,000
- sections: 100,000

## Benchmark Execution Outcome

What succeeded:
- Dataset reached target counts.
- ANN index is present in migration and deployed.

What failed:
- Concurrent benchmark runs repeatedly exceeded session/tool timeout in this environment.
- Long-running DB sessions caused lock contention and required manual backend termination.
- Full p50/p95/p99 collection under stable run could not be completed in this cycle.

## Before vs After Snapshot

Before remediation evidence (prior audit):
- p50 ~ 1556 ms
- p95 ~ 4625 ms
- p99 ~ 5694 ms
- avg ~ 1774 ms

After remediation:
- Index + section-level retrieval implemented.
- Reliable full-latency sample not completed due timeout/locking under benchmark harness.

## EXPLAIN ANALYZE

Attempted multiple times; explain workloads on full 100k set timed out in this session before stable capture completion.

## Certification Decision

NOT CERTIFIED

Blockers:
1. Stable benchmark harness execution on 100k sections did not complete within bounded runtime.
2. Required final metrics (`p50/p95/p99` + CPU + explain plan capture) are incomplete for certification.

## Required Next Action

Run benchmark in a dedicated non-interrupted process window (no tool timeouts), then capture:
- complete EXPLAIN ANALYZE output,
- p50/p95/p99 over fixed request volume,
- host CPU utilization during test.
