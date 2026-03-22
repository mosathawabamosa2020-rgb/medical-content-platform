# CODEX Audit Report - Phase 4

Date: 2026-03-04
Project: Medical Content Platform
Auditor: Codex (Architectural Governance Protocol)

## 1. Environment Setup Summary

Executed commands (mandatory order):

1. `npm install`
- Result: PASS
- Output summary: dependencies up to date; 6 vulnerabilities reported by npm audit.

2. `npx prisma generate`
- Result: FAIL
- Error: `The "path" argument must be of type string. Received undefined`

3. `npx prisma validate`
- First run: FAIL (DATABASE_URL not found)
- Re-run with explicit `DATABASE_URL` from `.env.local`: PASS
- Output: `schema.prisma is valid`

4. `npx prisma migrate status`
- First run: FAIL (DATABASE_URL not found)
- Re-run with explicit `DATABASE_URL`: FAIL
- Error: `Schema engine error` (datasource shown as PostgreSQL on localhost:15432)

5. `npm test --runInBand --detectOpenHandles`
- Result: FAIL
- Summary: 5 failed suites, 18 passed suites; 3 failed tests, 57 passed tests
- Primary blocker error in failures: `Cannot find module '.prisma/client/default'`

Mandatory protocol gate outcome:
- The protocol states any failure => immediate stop.
- Multiple mandatory steps failed, therefore the system does not pass the Phase 4 gate.

## 2. Test Suite Result

Command: `npm test -- --runInBand --detectOpenHandles`

- Test suites: 23 total
- Passed: 18
- Failed: 5
- Tests total: 60
- Passed: 57
- Failed: 3

Failing suites:
- `__tests__/run_worker_api.test.ts`
- `__tests__/tools/reextract_sections.test.js`
- `__tests__/home.test.tsx`
- `__tests__/health.test.ts`
- `__tests__/auth_callbacks.test.ts`

Root cause seen across failures:
- Prisma runtime artifact resolution failure: `.prisma/client/default`

Warnings observed:
- Environment warnings in test mode from `lib/env.ts` for missing test env vars.

No skipped tests detected:
- Search for `.skip`, `xit`, `xdescribe`: none found.

## 3. Database Integrity

### Lifecycle status check
Observed implementation:
- `pending_ingestion -> processing -> pending_review`
- `pending_review -> verified/rejected`

Deviation vs official lifecycle in instruction pack:
- Official requires: `processing -> processed -> pending_review`
- Current worker jumps directly to `pending_review` and does not set `processed` state.

### Archived unreachable check
- `archived` exists in Prisma enum and referenceState union.
- `referenceState` allows no outgoing transitions to/from archived in active flow.
- No API route sets `status: 'archived'`.
- Conclusion: archived is currently unreachable programmatically (compliant with prohibition).

### Version policy check
- No evidence of `version++` in API verification flow.
- Version increment is present in scraper/re-extraction path (`scripts/master_scraper.ts`) when creating new versioned references.
- Conclusion: no detected version increments outside re-extraction path.

### FK / enum / index review (schema-level)
- FK relations present across User/Device/Reference/Section/VerificationLog/KnowledgeChunk/IngestionLog.
- Indexes present on:
  - `Reference(status)`
  - `Reference(uploadedAt)`
  - `VerificationLog(referenceId)`
  - `VerificationLog(reviewerId)`
- Enums present:
  - `Role`: admin, reviewer, editor
  - `ReferenceStatus`: pending_ingestion, processing, processed, pending_review, verified, rejected, archived

Orphan relation check:
- Could not execute DB-level orphan scan due migration/status engine failure.
- Static schema shows FK constraints are defined.

## 4. API Contract Verification

### Admin auth coverage
Admin routes without explicit admin auth protection detected:
- `pages/api/admin/file.ts`
- `pages/api/admin/scraper/start.ts`
- `pages/api/admin/scraper/status.ts`
- `pages/api/admin/scraper/logs.ts`

All other admin endpoints inspected are protected via `withAdminAuth` or `getServerSession` role check.

### Endpoint behavior deviations and risks
1. `GET /api/admin/sections/queue`
- Returns all sections globally and ignores `referenceId` filter used by UI caller.
- Contract mismatch with UI in `pages/admin/references/[id].tsx` (UI expects `sd.sections`).

2. `POST /api/admin/verification/[id]`
- Transactional update + log insert is correctly implemented with 409 conflict path.

3. Public/search/content routes
- Several non-admin endpoints intentionally unauthenticated (library/query/search/health), but admin-prefixed unprotected routes are governance risk.

4. Method constraints
- Most routes enforce method checks with 405.
- `pages/api/health.ts` and `pages/api/references/discovery/queries.ts` do not enforce explicit method constraints.

## 5. Concurrency Result

Required simulation performed: concurrent verification attempts on same reference semantics.

Simulation output:
- First request: 200
- Second request: 409
- Final status: verified
- Verification log entries created: 1

Interpretation:
- Concurrency model expected by your protocol (single success, one conflict, no duplicate log) is satisfied by transactional/conditional semantics.
- Note: this was a controlled simulation and code-path inspection, not a live DB race against production data due environment blockers above.

## 6. Search & Retrieval Review

### Current stage validation
- Full-text/vector query endpoint exists (`/api/references/query`) with `topK` and optional device filter.
- Verified library endpoint paginates and filters to `verified` with existing sections.

### Query safety
- `queryVectors` path depends on embedding helper; risk depends on implementation details there.
- Direct SQL execution appears in embedding utilities/scripts (`$executeRawUnsafe` usage in scraper path), which is higher risk and must remain tightly controlled.

### Index check
- Indexes on status/timestamps and verification logs exist in schema/migrations.
- No dedicated index on section content/full-text observed in Prisma schema.

### Performance evaluation
Performed under environment limitations:
- Metrics endpoint true DB load test blocked by Prisma runtime failure.
- Search aggregation synthetic benchmark (10k mocked items): completed in ~13ms (logic-only, non-network).
- Reference payload simulation (1000 sections, ~1.26MB JSON): serialization ~18ms; server-side render simulation for 1000 sections ~62ms.

Conclusion:
- Retrieval logic is functional at prototype level, but production-scale performance is not validated due blocked DB runtime and no true load harness.

## 7. UI Behavioral Validation

Protocol requirement: loading state, prevent double-click, 409/500 handling, success feedback, no console errors.

Findings:
- Loading states exist in some pages (`research`, `verification list`, some detail pages).
- Double-click prevention is inconsistent:
  - Present in some actions (disabled imported buttons, scraper start button).
  - Missing for key verification submit action in `pages/admin/verification/references/[id].tsx`.
- 409 conflict handling:
  - Implemented in `pages/admin/references/[id].tsx`.
  - Not explicitly handled in `pages/admin/verification/references/[id].tsx` (generic error path only).
- 500 handling and success feedback:
  - Mostly alert/message based, inconsistent UX pattern.
- Console errors:
  - Multiple API handlers still use `console.error` directly; test logs show expected error outputs during simulated failures.

## 8. Security Review

Auth and access control:
- Core admin endpoints mostly protected.
- Critical gap: unprotected admin-prefixed routes (`admin/file`, `admin/scraper/*`).

Password handling:
- Passwords hashed with bcrypt (`tools/create_admin.js`, auth credential compare in `lib/auth.ts`).

Exposure and hygiene:
- `.gitignore` currently only ignores `node_modules`.
- Sensitive/local artifacts are tracked in git (e.g., `.env.local`, `prisma/dev.db`), which is a governance/security risk.

Dependency/runtime integrity:
- Prisma package mismatch observed (`prisma` CLI 5.11.0 vs `@prisma/client` 5.22.0 installed), likely contributing to runtime/client generation failures.

## 9. Identified Risks and Fixation Suggestions

1. Prisma runtime generation failure
- Risk: app/tests unstable, blocked CI/CD
- Suggestion: align `prisma` and `@prisma/client` versions exactly, regenerate client, re-run mandatory checks.

2. Missing admin auth on admin-prefixed routes
- Risk: unauthorized scraper control/file access
- Suggestion: wrap with `withAdminAuth` (or equivalent role gate) immediately.

3. Lifecycle deviation (`processing -> pending_review` skipping `processed`)
- Risk: non-compliance with official lifecycle governance
- Suggestion: route worker through `processed` explicitly or update approved architecture via ACR before proceeding.

4. UI contract mismatch on sections queue/detail flow
- Risk: broken admin review UX/data integrity assumptions
- Suggestion: enforce endpoint filter by `referenceId` and normalize response shape.

5. Environment/migration command fragility
- Risk: onboarding failures, inconsistent local state
- Suggestion: standardize env loading for Prisma commands and fix migration status engine failure.

6. Security hygiene in git tracking
- Risk: secret/data leakage
- Suggestion: harden `.gitignore`, remove tracked local secrets/artifacts from version control history/present tree.

## 10. Final Readiness Status

Status: NOT READY

Reasons:
- Mandatory environment protocol did not pass (`prisma generate`, `migrate status`, full tests).
- Admin auth coverage has critical gaps on admin-prefixed routes.
- Lifecycle implementation deviates from declared official state progression.
- UI verification behavior is partially compliant but not fully hardened for the required governance UX guarantees.
- DB/runtime stability and true performance readiness are not yet validated in a clean passing environment.

---

Evidence commands executed in this audit:
- `npm install`
- `npx prisma generate`
- `npx prisma validate`
- `npx prisma migrate status`
- `npm test -- --runInBand --detectOpenHandles`
- additional static + simulation checks for auth coverage, lifecycle transitions, concurrency, and payload/perf behavior.
