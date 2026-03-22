# LIFECYCLE_STATE_MACHINE_AUDIT

Date: 2026-03-04
Status: PARTIAL PASS (naming and boundary gaps remain)

## 1. Official Lifecycle Under Audit

Directive lifecycle:
`uploaded -> processing -> processed -> pending_review -> verified | rejected | archived`

Implemented lifecycle in code:
- `lib/referenceState.ts`:
  - `pending_ingestion -> processing`
  - `processing -> processed`
  - `processed -> pending_review`
  - `pending_review -> verified | rejected`
  - `archived` has no active transitions.

Result:
- Functional sequence with `processed` step is enforced.
- Naming mismatch: directive uses `uploaded`; implementation uses `pending_ingestion`.

## 2. Worker Transition Enforcement

`lib/workers/ingestionWorker.ts` behavior:
- Picks only `pending_ingestion` rows.
- Sets status to `processing`.
- Calls helper that updates `processing -> processed -> pending_review`.

Tests:
- `__tests__/reference_state_lifecycle.test.ts` blocks `processing -> pending_review` direct skip.
- `__tests__/ingestion_worker.test.ts` and `__tests__/phase2a_flow.test.ts` pass with current sequence.

Result: PASS for sequence enforcement.

## 3. API Mutation Boundary Review

Verified:
- Verification API (`/api/admin/verification/[id]`) uses transactional `updateMany where status = pending_review` then writes log.
- Conflict path returns `409` when state already moved.

Gaps:
- Some ingestion endpoints create references without explicit lifecycle normalization to `uploaded` vocabulary.
- UI + API legacy endpoints still allow stale assumptions (see binding report).

## 4. Illegal Transition Resistance

Strengths:
- `assertTransition` exists and is used.
- Verification API guards pending state with conditional update count.

Gaps:
- No DB-level finite-state constraint (transition rule is application-enforced only).
- Direct DB writes can still force illegal status (outside API discipline).

## 5. Concurrency

Verification concurrency semantics validated by tests/transaction logic:
- First reviewer transition succeeds.
- Second concurrent attempt gets `409`.
- Duplicate verification log prevented by transaction flow.

## Final Lifecycle Decision

NOT FULLY CERTIFIED

Blockers:
1. Directive lifecycle label mismatch (`uploaded` vs `pending_ingestion`).
2. No DB-level transition guard.
3. Legacy UI/API assumptions still produce state/contract friction.
