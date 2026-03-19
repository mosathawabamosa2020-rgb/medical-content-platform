# BUILD_DETERMINISM_ROOT_CAUSE_2026-03-08

Date: 2026-03-08
Maps to: REC-001, TASK-003, TASK-034, TASK-035

## Summary
Build determinism is now validated in this workspace:
- `npm run build` passed 3 consecutive times (post-fix evidence).
- `npm run lint` passes (warnings only).
- `npm test -- --runInBand` passes (36 suites / 90 tests).

REC-001 status is updated to **closed with warnings** (non-blocking webpack warnings still present).

## Root Cause Analysis
Previous "unstable build" status came from two factors:
1. Deterministic code issues discovered earlier in taxonomy/settings routes (already fixed).
2. Command timeout/observation-window limits during earlier executions, which looked like hangs.

Current evidence shows the pipeline is stable when build is allowed enough runtime.

## Reproduction and Evidence
Artifacts:
- `artifacts/build-attempt-1-2026-03-08.log`
- `artifacts/build-attempt-2-2026-03-08.log`
- `artifacts/build-attempt-3-2026-03-08.log`
- `artifacts/build-attempt-summary-2026-03-08.json`

Build attempt summary:
- Attempt 1: exit `0`, duration `162.61s`
- Attempt 2: exit `0`, duration `186.78s`
- Attempt 3: exit `0`, duration `206.97s`

Post-implementation validation run:
- Additional `npm run build` passed after REC-007/REC-008 baseline changes.

## Remaining Non-Blocking Warnings
Webpack warning persists in:
- `pages/api/admin/scraper/start.ts`
- `pages/api/content/generate-post.ts`

Message: `Critical dependency: the request of a dependency is an expression`.

This warning does not fail build currently, but should be addressed in a hardening pass.

## Closure Decision
- REC-001: **Closed** (deterministic build proof supplied).
- Residual risk: medium (warning cleanup pending, but no deterministic build failure remains).
