# FULL_UI_BACKEND_EXECUTION_TRACE

Date: 2026-03-05
Status: COMPLETED

## 1. Admin Upload Button Flow

UI Action:
- Admin upload action targets `POST /api/admin/file`.

Trace:
1. UI sends multipart form (`file`, `deviceId`, optional `title`).
2. API route: `pages/api/admin/file.ts`.
3. Service logic in route transaction:
   - `tx.file.create(...)`
   - `tx.reference.create(...)` with `status='pending_ingestion'`
   - `tx.auditLog.create(...)` action `admin.file.uploaded`
4. DB mutations:
   - insert `File`
   - insert `Reference`
   - insert `AuditLog`
5. Response payload:
   - `{ ok: true, referenceId, fileId }`
6. Worker queue readiness:
   - created reference is discoverable by ingestion worker (`pending_ingestion`).

## 2. Worker Process Flow

Worker entry points:
- `POST /api/admin/ingestion/run-worker`
- `POST /api/admin/ingestion/process/[referenceId]`

Trace (`lib/workers/ingestionWorker.ts`):
1. Select references with `status='pending_ingestion'`.
2. Update reference -> `processing`.
3. Extract text (adapter-based).
4. Idempotency guard: delete prior sections for same reference (if available) before reinsert.
5. Create `Section` rows.
6. Generate section embeddings (best-effort; logged on failure).
7. Transition:
   - `processing -> processed`
   - `processed -> pending_review`
8. Log entries persisted in `IngestionLog`.

DB mutations:
- `Reference.update`
- `Section.deleteMany` (guarded)
- `Section.create`
- `IngestionLog.create`

## 3. Verification Approve / Reject Flow

Canonical UI:
- `pages/admin/verification/references/[id].tsx`

Trace:
1. UI click sends `PATCH /api/admin/verification/[id]` with `VerificationDecisionPayload`.
2. API validates admin auth + payload.
3. Service: `applyReferenceVerificationDecision(...)`.
4. Prisma transaction:
   - conditional `reference.updateMany(where: {id, status:'pending_review'})`
   - `verificationLog.create(...)`
5. Conflict path:
   - `updateMany.count=0` -> `409 state conflict`.
6. Success path:
   - `200 { ok: true }`
7. UI state:
   - submit disabled during request,
   - explicit 409/500 handling,
   - refresh/navigation on success.

## 4. Search Query Flow

API entry:
- `POST /api/references/query`

Trace:
1. Request validated by Zod (`query`, `topK`, `deviceId`).
2. Security gates:
   - headers applied
   - rate limit enforced
3. Service pipeline (`lib/services/retrieval/`):
   - normalize query
   - embed query
   - vector retrieve from `Section` joined to `Reference`
   - SQL-level verified-only filter: `r.status='verified'`
   - topK cap via policy
   - rank + package
   - fallback keyword retrieval on embedding failure
4. Response:
   - structured `RetrievalQueryResponse` (`results`, `meta`).
5. UI/API consumer renders typed result model.

## 5. Route/Service/Prisma Mapping Summary

- Upload: `pages/api/admin/file.ts` -> transaction -> `file.create`, `reference.create`, `auditLog.create`
- Worker: `lib/workers/ingestionWorker.ts` -> `reference.update`, `section.create`, `ingestionLog.create`
- Verification: `pages/api/admin/verification/[id].ts` + `lib/services/verificationService.ts` -> `reference.updateMany`, `verificationLog.create`
- Retrieval: `pages/api/references/query.ts` + `lib/services/retrieval/*` -> `$queryRaw` vector/keyword SQL on `Section` + `Reference`
