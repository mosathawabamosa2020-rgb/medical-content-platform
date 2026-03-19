# FOUNDER_GROUP_B_EXECUTION_DIRECTIVE_2026-03-09

Date: 2026-03-09
Authority: Founder / Technical Architect
Status: Active Directive
Scope: Group-B remediation after review of source-identifier, dedup, ingestion, taxonomy lifecycle, and UI changes.

## 1. Executive Position
The latest implementation pass is acknowledged as real progress.
The team has moved important logic into code for:
- normalized source identifiers,
- duplicate detection,
- taxonomy activation/archive lifecycle.

However, this work is accepted only as **baseline progress**, not as final closure.
The platform still has open correctness issues in:
- dedup enforcement,
- file lifecycle safety,
- reference identity scope,
- embedding storage semantics,
- ingestion hardening,
- taxonomy lifecycle governance.

This directive defines the next required execution pass.

## 2. Non-Negotiable Rule for the Next Pass
The team must not respond with a free-form summary only.
They must create and maintain a structured execution report file at:

`docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_B.md`

This report is mandatory and must be updated in the same pass as the code changes.

## 3. Required Parallel Workstreams

### Workstream A — Dedup Enforcement Closure
Objective: move duplicate prevention from best-effort application checks to stronger enforceable behavior.

Required work:
1. Define dedup scope explicitly:
   - global reference uniqueness,
   - or device-scoped uniqueness,
   - or hybrid global-reference plus join-link strategy.
2. Document the chosen decision in an ADR or in the execution report.
3. Add DB-level protections where appropriate:
   - unique constraints,
   - composite unique constraints,
   - or conflict-safe insertion strategy.
4. Eliminate race-prone `findFirst` → `create` behavior wherever duplicate guarantees are expected.
5. Ensure duplicate conflict responses remain deterministic and user-readable.

Acceptance expectations:
- concurrent duplicate scenarios are addressed,
- dedup policy is documented,
- duplicate outcomes are consistent and reproducible.

### Workstream B — Source Identity Hardening
Objective: make source identity normalization strong enough for real scientific reference ingestion.

Required work:
1. Improve `sourceFingerprint` logic beyond simple concatenation when needed:
   - canonical URL normalization,
   - trimming query noise/tracking params,
   - consistent host/path normalization.
2. Define precedence between DOI / PMID / arXiv / fingerprint / content hash.
3. Document fallback behavior when identifiers are partially missing.
4. Ensure the same scientific source is not duplicated because of minor URL formatting differences.

Acceptance expectations:
- precedence rules are explicit,
- normalized identifier derivation is test-backed,
- duplicate identity behavior is deterministic.

### Workstream C — File Lifecycle and Storage Safety
Objective: prevent orphaned files and inconsistent persistence.

Required work:
1. Reorder ingestion logic so duplicate checks happen before durable file persistence whenever possible.
2. Where early file write is unavoidable, implement cleanup on:
   - duplicate conflict,
   - parse failure,
   - DB write failure.
3. Distinguish clearly between:
   - binary file hash,
   - extracted text hash,
   - source identity.
4. Document file retention behavior for:
   - successful ingestion,
   - rejected duplicates,
   - failed parsing,
   - archived references.

Acceptance expectations:
- no silent orphan-file path remains,
- file lifecycle is explicit in code and report,
- duplicate conflict does not unnecessarily increase storage footprint.

### Workstream D — Embedding Semantics Closure (Critical)
Objective: close the unresolved correctness issue around reference-level embedding writes.

Required work:
1. Decide and document the intended strategy:
   - chunk-first embeddings only,
   - reference-level aggregate embedding,
   - or hybrid model.
2. If reference-level embedding remains, define exactly how it is produced:
   - mean pooling,
   - title/body weighted aggregation,
   - first-page/last-page prohibition,
   - deterministic aggregation algorithm.
3. Stop repeated page-loop overwrites to the same reference embedding target unless that behavior is intentionally designed and documented.
4. Align upload/discovery/import flows with the chosen strategy.
5. Ensure schema, migration, application logic, and retrieval code all reflect the same truth.

Acceptance expectations:
- no implicit overwrite ambiguity remains,
- retrieval semantics are documented,
- code path aligns with schema and DB reality.

### Workstream E — Ingestion Hardening and Security
Objective: raise ingestion endpoints from baseline to operationally safer behavior.

Required work:
1. Harden SSRF protection in discovery ingest:
   - block private/internal IP ranges,
   - block metadata endpoints,
   - guard against redirect bypass,
   - evaluate internal host resolution risks.
2. Add explicit file type / size / parsing safety checks in upload flow.
3. Add stronger error classification for fetch, parse, duplicate, and persistence failures.
4. Log ingestion failures and duplicate conflicts in a consistent operational manner.
5. If available in architecture, wire ingestion events into audit/ingestion logs.

Acceptance expectations:
- discovery ingest is materially safer,
- upload path is not over-trusting,
- operational visibility improves.

### Workstream F — Taxonomy Lifecycle Hardening
Objective: move taxonomy soft archive from baseline UI behavior to governed lifecycle behavior.

Required work:
1. Make lifecycle policy explicit for departments/devices/models:
   - activate,
   - deactivate,
   - archive,
   - restore.
2. Add stronger dependency-awareness before archiving where relevant.
3. Add visibility for `archivedAt` and lifecycle state in the admin UI.
4. Add filters or sections for active/inactive records.
5. Ensure lifecycle behavior is consistent across all taxonomy APIs.

Acceptance expectations:
- archive behavior is understandable to operators,
- inactive entities are visible and manageable,
- lifecycle is not hidden behind implicit PATCH semantics only.

### Workstream G — Tests and Runtime Proof
Objective: prove the new logic, not just compile it.

Required work:
1. Add dedicated tests for:
   - source identifier extraction/normalization,
   - duplicate conflict scenarios,
   - archive/restore lifecycle APIs,
   - embedding write semantics if changed,
   - upload/discovery duplicate behavior.
2. Add at least focused runtime verification evidence for the modified endpoints.
3. Include raw command outputs for:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test -- --runInBand`
   - `npm run build`
4. If Prisma migration or client generation is part of the pass, include exact command evidence.

Acceptance expectations:
- test coverage grows meaningfully for the new behavior,
- evidence is attached, not implied.

## 4. Mandatory Report Structure
The team must create/update:
`docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_B.md`

The report must contain at minimum these sections:
1. Executive Summary
2. Scope of This Pass
3. Founder Directive Mapping
4. Decisions Taken
5. Files Changed
6. Database / Migration Changes
7. Dedup Policy Implemented
8. Embedding Strategy Implemented
9. File Lifecycle / Cleanup Behavior
10. Security Hardening Applied
11. Taxonomy Lifecycle Behavior
12. Tests Added or Updated
13. Validation Commands and Raw Outputs
14. Runtime Verification Evidence
15. Known Risks / Partial Areas
16. Final Status by Workstream
17. Recommended Next Step

## 5. Required Output Style From the Team
The next team response must include:
- the path to the new execution report,
- the exact list of changed files,
- migration path and status,
- commands executed with outcomes,
- what remains open.

Do not accept a vague summary without the report.

## 6. Founder Closure Condition
This execution pass will be considered successful only if all of the following are true:
1. dedup behavior is made stronger and more explicit,
2. embedding semantics are no longer ambiguous,
3. file lifecycle is safer,
4. taxonomy lifecycle is more visible and governed,
5. new tests and evidence are attached,
6. the mandatory report file exists and is complete.

## 7. Final Directive
Proceed immediately with the above workstreams in parallel.
Do not open unrelated feature expansion before resolving the correctness concerns identified in Group-B audit.
