# Founder Group C Execution Directive

Date: 2026-03-09
Status: Active
Audience: Development Team / Codex Team
Depends on:
- `FOUNDER_GROUP_A_EXECUTION_DIRECTIVE_2026-03-08.md`
- `FOUNDER_GROUP_B_EXECUTION_DIRECTIVE_2026-03-09.md`
- `FOUNDER_GROUP_C_SCHEMA_AND_SERVICE_PROOF_AUDIT_2026-03-09.md`

## 1. Founder Position
Your recent pass shows real implementation progress and is accepted as meaningful baseline work in:
- source identifier derivation,
- ingestion dedup wiring,
- taxonomy soft archive behavior,
- and migration planning updates.

However, this pass is **not accepted as final closure**.
The project now enters a stricter verification-and-proof phase.

No additional broad feature expansion is authorized before the next proof package is delivered.

## 2. Strategic Objective of This Directive
You are now required to move from “implemented baseline” to “evidence-backed operational confidence”.

This means the next execution pass must prove:
1. the database structure is correct and synchronized,
2. the platform backbone is stable and not internally contradictory,
3. the implemented services actually function and are wired to the database,
4. the smart discovery/retrieval pipeline can fetch a small real sample from multiple sources and persist it correctly,
5. and the development team can articulate its own engineering improvement recommendations.

## 3. Mandatory Parallel Workstreams
Execute the following workstreams in parallel where possible.

### Workstream A — Prisma / Database Structure Verification
You must verify and document:
1. Prisma schema current shape.
2. Exact migration path applied to the database.
3. Database schema synchronization status.
4. Whether any DB columns exist outside canonical Prisma schema.
5. Whether retrieval/embedding behavior is truly aligned with schema.

Required outputs:
- exact migration folder path,
- full `migration.sql`,
- `npx prisma migrate deploy` output,
- `npx prisma migrate status` output,
- `npx prisma generate` output,
- explicit statement on whether `Reference.embedding` exists or does not exist in the authoritative model.

### Workstream B — Core Backbone and Robustness Verification
You must verify and document platform backbone strength, including:
1. no broken critical service path,
2. no unhandled internal contradiction between API / schema / service logic,
3. no silently failing critical dependency in the main platform path,
4. build/test/typecheck/lint still passing after the latest DB-aligned changes,
5. explanation of remaining warnings and whether they are operationally safe.

This workstream must explicitly inspect:
- health/readiness model,
- DB connectivity assumptions,
- ingestion path,
- retrieval path,
- taxonomy path,
- content path if affected.

### Workstream C — Service Verification and Database Wiring Proof
You must verify that the actual platform services work and are truly wired into the database.

At minimum verify and document:
1. taxonomy services,
2. settings if affected,
3. ingestion/import/upload services,
4. discovery service,
5. search/retrieval service,
6. verification workflow if touched by the current data path,
7. publishing/content modules only if materially connected to tested data.

For each verified service, report:
- endpoint/path,
- input used,
- expected behavior,
- actual result,
- database impact,
- PASS/FAIL/BLOCKED,
- notes.

### Workstream D — Smart Retrieval / Discovery Live Proof
This is mandatory.
You must execute a small real evidence-backed proof for smart retrieval/discovery.

Required scope:
1. Use a small sample set only.
2. Attempt retrieval/discovery from multiple sources (at least two distinct source types where the current implementation supports it).
3. Ingest a small number of references/documents.
4. Persist them into the database.
5. Verify that the references pass through the intended stages as currently implemented.
6. Verify they become visible to relevant downstream layers (DB, admin/reference visibility, and where applicable retrieval/indexing evidence).

You must document:
- source used,
- URL/sample identifier,
- type of source,
- whether retrieval succeeded,
- whether dedup triggered correctly when re-attempted,
- whether file persisted,
- whether DB record persisted,
- whether parsed/chunked/indexed evidence exists,
- whether downstream visibility exists.

This is not optional. The platform’s identity depends on proving this chain.

### Workstream E — Dedup, Identity, and Lifecycle Closure Notes
You are not required to fully redesign the data model in this pass, but you must document and clarify:
1. Is reference identity per-device or global?
2. Is current dedup best-effort or hard-enforced?
3. What race-condition risks remain?
4. What is the intended file cleanup policy on duplicate/failure?
5. What is the intended lifecycle policy for active vs archived taxonomy items in listing endpoints and UI?

If any of these remain open, state them explicitly as open engineering decisions.

### Workstream F — Development Team Improvement Proposals
You must include a formal section authored by the development team containing:
1. architectural improvement proposals,
2. robustness/hardening proposals,
3. performance proposals,
4. data-model proposals,
5. UI/UX proposals,
6. operational proposals,
7. sustainability/open-source alignment proposals.

These proposals must distinguish between:
- immediate recommendation,
- next-sprint recommendation,
- longer-term recommendation.

## 4. Mandatory Deep Verification Report
You are required to create the following report file inside the repository:

`docs/02-validation/PLATFORM_DEEP_VERIFICATION_AND_SERVICE_PROOF_REPORT.md`

This report is mandatory and must be treated as the primary deliverable of this execution pass.

## 5. Mandatory Report Structure
The report must include, in this exact order:

1. Executive Summary
2. Scope of Verification
3. Database Structure Verification
4. Migration Evidence
5. Prisma Sync Status
6. Backbone Robustness Assessment
7. Health / Readiness / Dependency Status
8. Service Verification Matrix
9. Database Wiring Proof by Service
10. Smart Discovery / Retrieval Live Proof
11. Reference Ingestion and Storage Flow Verification
12. Dedup Behavior Verification
13. Search / Retrieval Result Verification
14. Remaining Contradictions / Open Risks
15. Development Team Improvement Proposals
16. Final Status by Verified Area
17. Raw Command Outputs Appendix

## 6. Mandatory Additional Execution Report
In addition to the deep verification report, you must create:

`docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_C.md`

Use the report template that will be provided in project docs.

This execution report must focus on:
- files changed,
- code decisions,
- migrations,
- tests,
- commands,
- and known limitations of this exact pass.

## 7. Validation Commands Required
The report must include the full raw outputs for:
- `npx prisma migrate deploy`
- `npx prisma migrate status`
- `npx prisma generate`
- `npm run typecheck`
- `npm run lint`
- `npm test -- --runInBand`
- `npm run build`

Do not summarize these as only PASS/FAIL. Include the real command outputs.

## 8. Evidence Quality Requirements
The next response will not be accepted if it only contains a narrative summary.

Your submission must include:
1. report paths,
2. changed file list,
3. actual command outputs,
4. explicit PASS / FAIL / BLOCKED matrix,
5. and clear explanation of unresolved contradictions.

## 9. Explicit Founder Questions You Must Answer
In the next report, answer these clearly:
1. Does the authoritative database model include `Reference.embedding` or not?
2. If not, why is any reference-level embedding logic still present?
3. Is dedup currently guaranteed by the database or only by application logic?
4. Can the platform currently fetch and persist a small real sample from multiple sources successfully?
5. Which services are truly proven live in this pass, and which are still only partially evidenced?

## 10. Delivery Standard
This pass is a proof-and-confidence pass, not a cosmetic pass.

The project must now be treated as a knowledge infrastructure platform whose value depends on:
- trustworthy data flow,
- operational evidence,
- explicit architecture decisions,
- and verifiable service behavior.

Proceed immediately.
