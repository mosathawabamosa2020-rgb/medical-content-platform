# VERIFICATION_FLOW_TRACE_REPORT

Date: 2026-03-04
Status: PARTIAL PASS

## 1. Trace: UI -> API -> Prisma -> DB -> UI

Primary verification page:
- `pages/admin/verification/references/[id].tsx`

Trace:
1. User selects decision (Approve/Reject) and clicks `Submit`.
2. UI sends `POST /api/admin/verification/[id]` with `{ decision, comment }`.
3. API (`pages/api/admin/verification/[id].ts`) checks admin session.
4. API starts Prisma transaction:
   - `reference.updateMany({ where: { id, status: 'pending_review' }, data: { status: 'verified'|'rejected' } })`
   - if count = 0 => throws `state_conflict`
   - `verificationLog.create(...)`
5. Transaction commits; API returns `200`.
6. UI shows success message and navigates back to queue.

Conflict branch:
- second/late submit returns `409` and UI shows explicit conflict message.

Error branch:
- `>=500` or network failure maps to explicit message in UI.

## 2. Governance Controls Verified

PASS:
- Submit guard: `if (!decision || submitting) return`
- Button disabled during submit.
- 409 and 500 handling implemented.
- Verification persistence is atomic (single transaction).

## 3. Remaining Gaps

1. Legacy review page (`pages/admin/references/[id].tsx`) still exists with separate action path and weaker UX patterns.
2. Queue page mismatch:
   - `pages/admin/verification/references/index.tsx` expects array directly (`data.map`)
   - API `pages/api/admin/references/pending_review.ts` returns `{ items: [...] }`
   - This can break list rendering and prevent reaching detail actions consistently.
3. API still logs errors with `console.error` instead of standardized structured logger path.

## Final Verification Flow Decision

CONDITIONALLY CERTIFIED

Conditions to close:
- Fix queue response-shape mismatch.
- Remove legacy duplicate review path or align it to canonical flow.
- Normalize error logging to structured logger.
