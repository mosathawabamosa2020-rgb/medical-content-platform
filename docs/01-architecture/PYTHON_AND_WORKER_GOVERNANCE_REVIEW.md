# PYTHON_AND_WORKER_GOVERNANCE_REVIEW_2026-03-08

Date: 2026-03-09
Directive Mapping: Workstream F

## Python Component Findings
Observed active Python path:
- `MedicalBot/main.py`
- `MedicalBot/pyproject.toml`

Assessment:
- Purpose appears unrelated to core platform runtime (Telegram bot + OCR utility pattern).
- Secrets are hardcoded in source (`TOKEN`, API key) and governance is missing.
- No documented integration boundary with Next.js platform workflows.

Decision:
- Treat `MedicalBot` as **out-of-band experimental component** until formally governed.
- Remove hardcoded secrets from source and move to env if retained.
- Add ownership/runtime contract doc before any production use.

## Worker/Queue Findings
Evidence:
- Worker: `lib/workers/ingestionWorker.ts`
- Queue orchestration: `lib/queue/queues.ts`
- API triggers: `pages/api/admin/ingestion/run-worker.ts`, `pages/api/admin/ingestion/scheduler.ts`

Current governance state:
- BullMQ path exists but is optional at runtime.
- Fallback mode executes ingestion inline when BullMQ is unavailable.
- Repeat jobs are configured, but DLQ/advanced failure policy and operational dashboard are minimal.

## Recommendations
1. Explicitly document queue mode (`bullmq` vs `inline`) in ops runbook.
2. Add structured failure counters/metrics around worker executions.
3. Add dead-letter handling policy for recurring jobs.
4. Move Python component under clear `experimental/` governance or formalize as supported service.
