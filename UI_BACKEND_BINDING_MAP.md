# UI_BACKEND_BINDING_MAP

Date: 2026-03-04
Status: PARTIAL COVERAGE (contract mismatches exist)

## Button-to-Backend Map

| UI Action | UI File | API Route | Service/Worker | Prisma / DB Mutation | Certification |
|---|---|---|---|---|---|
| Upload reference PDF | `pages/devices/[id]/references.tsx` | `POST /api/references/upload` | direct handler logic | `Reference.create`, embedding write (`Reference.embedding`) | PARTIAL (no section creation, uses alerts) |
| Search PubMed | `pages/admin/research.tsx` | `GET /api/search/pubmed?term=...` | `SearchAggregatorService` | read-only | PASS |
| Import article | `pages/admin/research.tsx` | `POST /api/admin/ingestion/import` | direct handler | `Reference.create` | PARTIAL (uses alerts, no explicit loading lock for import request) |
| Start ingestion worker | Admin ingestion controls / API callers | `POST /api/admin/ingestion/run-worker` | `runIngestionWorker()` | status updates + section inserts + logs | PASS (async accepted; monitor behavior depends on logs) |
| Process one reference | admin ingestion process route | `POST /api/admin/ingestion/process/[referenceId]` | `processReferenceById()` | status updates + section inserts | PASS |
| Start scraper | `pages/admin/scraper.tsx` | `POST /api/admin/scraper/start` | dist scraper module | file/log side effects; downstream ingestion outside route | PARTIAL (alerts + dist dependency) |
| View scraper status | `pages/admin/scraper.tsx` | `GET /api/admin/scraper/status` | direct handler | read-only | PASS |
| View scraper logs stream | `pages/admin/scraper.tsx` | `GET /api/admin/scraper/logs` (SSE) | direct handler | read-only (file tail) | PASS |
| Verify reference (canonical) | `pages/admin/verification/references/[id].tsx` | `POST /api/admin/verification/[id]` | transaction in route | conditional status update + `VerificationLog.create` | PASS |
| Reject reference (canonical) | `pages/admin/verification/references/[id].tsx` | `POST /api/admin/verification/[id]` | transaction in route | same as above | PASS |
| Verify/Reject (legacy review page) | `pages/admin/references/[id].tsx` | `POST /api/admin/verification/[id]` | transaction in route | same DB writes | PARTIAL (older UX path retained) |
| Search web discovery | `pages/devices/[id]/discover.tsx` | `POST /api/references/discovery/search` | direct handler + SerpAPI | read-only | PARTIAL (no auth on discovery route by design) |
| Ingest discovered URL | `pages/devices/[id]/discover.tsx` | `POST /api/references/discovery/ingest` | direct handler | `Reference.create` + file write | PARTIAL (alerts, no governance hardening) |
| Retrieval query (programmatic) | API consumer | `POST /api/references/query` | `lib/services/retrieval/*` | vector/keyword read queries | PARTIAL (build/type issue + perf blockers) |

## Contract Mismatches Identified

1. Verification list mismatch:
- UI `pages/admin/verification/references/index.tsx` consumes `data.map(...)`.
- API `/api/admin/references/pending_review` returns `{ items: [...] }`.
- Effect: list rendering/runtime mismatch risk.

2. Section queue mismatch:
- UI `pages/admin/references/[id].tsx` expects `sd.sections` from `/api/admin/sections/queue?referenceId=...`.
- API currently returns array directly and ignores `referenceId` filter.

## Final Binding Decision

NOT FULLY CERTIFIED

Reason: End-to-end bindings exist, but multiple UI/API response-shape mismatches and legacy duplicate flows can break governed operator workflows.
