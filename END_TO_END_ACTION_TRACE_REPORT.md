# END_TO_END_ACTION_TRACE_REPORT

Date: 2026-03-05

## Platform Root Validation

Single public root confirmed: `/`

Public navigation from root:

- `/library`
- `/search`
- `/reference/[id]`
- `/create`
- `/admin` (role/session gated)

## Action Traces

### 1. User clicks `Search` (Portal `/`)

- UI: `pages/index.tsx` submit handler
- API: `POST /api/references/query`
- Service: `runRetrievalQuery` -> `normalizeRequest` -> `embedText` -> `retrieveVectorCandidates` -> `rankAndPackage`
- DB read:
  - `Section` ANN index scan
  - joined `Reference` with `status='verified'`
- Response: `RetrievalQueryResponse` (`results`, `meta`)
- UI update: render results list and metadata

### 2. User clicks `Generate` (`/create`)

- UI: `pages/create.tsx` submit handler
- API: `POST /api/content/generate`
- Service flow:
  - `runRetrievalQuery`
  - `buildGeneratedContent` (safety checks, context assembly, scientific-device structuring)
- DB read:
  - verified `Section` retrieval
- DB write:
  - `GeneratedContent` create
  - `GeneratedContentReference` create (join rows)
  - `ContentDraft` create
  - `ReelScript` create (when selected)
- Response: `GeneratedContentResponse` including `imageSourceUrl` or `imagePrompt`, `topKUsed`, `probeUsed`
- UI update: script/caption/hashtags/voiceover and reel breakdown shown

### 3. User clicks `Save Draft` (`/create`)

- UI: `pages/create.tsx` save handler
- API: `PATCH /api/content/[id]`
- DB mutation: `GeneratedContent` update scoped by `userId`
- Response: updated content record
- UI update: local output state merged with saved values

### 4. Admin clicks `Upload` (admin ingestion)

- UI: admin ingestion page
- API: `POST /api/admin/file` and ingestion import APIs
- Service/worker:
  - create `File`
  - create `Reference` with initial status
  - worker extraction to `Section`
- DB mutation: `File`, `Reference`, `Section`, `IngestionLog`
- UI update: queue/list refresh

### 5. Admin clicks `Run Worker`

- UI: admin ingestion controls
- API: `POST /api/admin/ingestion/run-worker`
- Service: `ingestionWorker` executes deterministic transitions
- DB mutation: status transitions + logs
- UI update: run result and refreshed status

### 6. Admin clicks `Approve` (`/admin/verification/references/[id]`)

- UI: decision submit with loading guard
- API: `POST /api/admin/verification/[id]`
- Service: transactional verification path
- DB mutation:
  - conditional status update (`pending_review` -> `verified`)
  - insert `VerificationLog`
- Response:
  - `200` success
  - `409` conflict on concurrent update
- UI update:
  - success message + refresh
  - conflict/error message on failure

### 7. Admin clicks `Reject`

- Same path as approve, decision mapped to `rejected`.

### 8. Admin clicks `Start Scraper`

- UI: scraper controls
- API: `POST /api/admin/scraper/start`
- Service: starts scraper module
- DB mutation: new `Reference`/`Section` rows through ingestion flow
- UI update: status/log panel refresh

### 9. Admin clicks `View Logs`

- UI: admin logs pages
- API: log endpoints under `/api/admin/ingestion/logs` and `/api/admin/scraper/logs`
- DB read: `IngestionLog`
- UI update: logs table/list
