# FOUNDER GROUP I REPOSITORY REALIGNMENT AND PRE-PUSH VERIFICATION DIRECTIVE — 2026-03-15

Date: 2026-03-15
Status: Active
Audience: Development Team
Authority: Founder / Technical Architecture Authority
Depends on:
- `DOCUMENT_PACKAGE_INDEX.md`
- `TEAM_IMPLEMENTATION_GUIDE.md`
- `development-backlog.yaml`
- `development-backlog-recovery.yaml`
- `docs/00-governance/SOURCE_OF_TRUTH.md`
- `docs/00-governance/CURRENT_PROJECT_STATUS.md`
- `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`
- `FOUNDER_GROUP_H_DEVELOPMENT_RESPONSE_DIRECTIVE_2026-03-15.md`
- `FOUNDER_GROUP_H_UNIFIED_VERIFICATION_SYNTHESIS_2026-03-15.md`

## 1. Executive Position
A critical repository governance correction has been identified.

The canonical repository for this project is now:
- `https://github.com/mosathawabamosa2020-rgb/medical-content-platform`

The previously used repository is no longer the valid canonical target for this platform.

This changes the immediate execution priority.

The development team is **not** authorized to treat prior repository publishing activity as valid project closure.
Before any new push to the correct canonical repository, the team must perform a complete local repository review and pre-push verification pass against the actual project workspace:
- `C:\Users\mosat\medical-content-platform`

This is now a **repository realignment and pre-push confidence pass**.

## 2. Primary Objective of This Directive
The objective of this pass is to ensure that the local project workspace is:
1. technically coherent,
2. operationally reviewable,
3. aligned with the Document Package,
4. ready for canonical repository publication,
5. and not carrying silent contradictions, broken flows, or missing files into the new official repository.

## 3. Non-Negotiable Rule
The team must review the **local workspace first**, not assume that prior remote repository history is valid.

They must verify the real local state of:
- code,
- schemas,
- migrations,
- environment assumptions,
- services,
- routes,
- readiness tooling,
- verification evidence,
- and Document Package references,

before pushing to the new canonical repository.

## 4. Canonical Repository Declaration
From this point forward, the canonical repository target is:
- `https://github.com/mosathawabamosa2020-rgb/medical-content-platform`

The development team must:
1. treat this as the only valid official repository destination,
2. update any repository references in docs if they still point elsewhere,
3. explicitly document whether any old repository references remain in files,
4. and confirm that the pushed content matches the verified local workspace.

## 5. Mandatory Parallel Workstreams

### Workstream A — Local Workspace Integrity Review
Review the actual local workspace at:
- `C:\Users\mosat\medical-content-platform`

Required checks:
1. confirm all critical code files exist,
2. confirm all active Document Package files exist,
3. confirm there are no missing files referenced by current directives/reports,
4. identify untracked/generated/sensitive/runtime files that must not be pushed,
5. verify root structure, docs structure, and package references are coherent.

Acceptance:
- local workspace state is understood and documented,
- missing/claimed-but-absent files are identified before push.

### Workstream B — Database / Prisma / Migration Verification
The team must verify locally:
1. `prisma/schema.prisma`
2. migration directories and order
3. Prisma generate
4. Prisma migrate deploy/status expectations
5. whether `Reference.embedding` is now canonically resolved or still open
6. whether db push has been used anywhere outside documented policy

Acceptance:
- schema and migration truth is explicitly documented before push,
- any open DB/schema contradiction is stated clearly.

### Workstream C — Runtime and Service Verification Baseline
The team must perform a local verification pass for the real project services, including where applicable:
- taxonomy
- references/import
- upload
- discovery/ingestion
- retrieval/search
- verification
- content generation
- publishing/scheduling
- settings
- health/readiness

Required outcome per service:
- PASS / PARTIAL / BLOCKED / FAIL / NOT VERIFIED
- path(s) checked
- DB impact
- downstream visibility status

Acceptance:
- no service is silently assumed working,
- every major service has an explicit status.

### Workstream D — Authentication and Route Protection Review
The team must explicitly verify:
1. sign-in path readiness,
2. admin route protection,
3. protected API route coverage,
4. whether prior critical auth findings are now fixed or still open,
5. whether any write-capable route remains publicly callable.

Required focus areas:
- `pages/api/references/discovery/ingest.ts`
- `pages/api/content/generate-post.ts`
- `pages/api/references/upload.ts`
- relevant `/admin` pages and `/api/admin/*`

Acceptance:
- auth model is explicit and current,
- critical auth gaps are either closed or documented as blockers.

### Workstream E — Live Proof Readiness and Data Flow Review
The team must determine the exact local readiness of the full knowledge flow:
1. source discovery/search
2. ingest
3. persistence
4. processing/chunking/indexing
5. verification
6. retrieval
7. downstream UI visibility

If a full live proof is not performed in this pass, the team must still provide:
- exact blocker,
- exact prerequisites,
- exact next command/action required.

Acceptance:
- the team does not hide behind vague statements like “not ready”; instead they explain precisely what is needed.

### Workstream F — Repository Publishing Readiness
Before pushing to the new canonical repository, the team must verify:
1. `.gitignore` coverage for generated/runtime/sensitive content,
2. exclusion of build artifacts and runtime data,
3. no accidental inclusion of secrets, logs, uploads, or temporary artifacts,
4. no stale references to deleted or wrong repositories,
5. that the repository content being pushed matches the verified local state.

Acceptance:
- repository is safe and coherent to publish.

### Workstream G — Document Package Synchronization Review
The team must verify the current Document Package against the local workspace and ensure:
1. active directives reference real files,
2. current status reflects actual local truth,
3. reports index is current,
4. cumulative report is current,
5. canonical repository reference is updated where needed,
6. no claimed remediation document is missing.

Acceptance:
- the Document Package remains synchronized and fit for handoff after the push.

## 6. Required Deliverables
The team must create/update the following:
1. `docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_I.md`
2. `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`
3. `docs/00-governance/CURRENT_PROJECT_STATUS.md`
4. `docs/00-governance/REPORTS_INDEX.md` (if canonical references change)
5. any necessary repository-location note if old repo references were found and corrected

## 7. Mandatory Report Structure
The report file:
- `docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_I.md`

must include these sections in order:
1. Executive Summary
2. Canonical Repository Confirmation
3. Local Workspace Review Scope
4. Files/Directories Verified
5. Missing / Mismatched / Stale References Found
6. Database / Prisma / Migration Status
7. Authentication and Protected Route Status
8. Core Service Verification Matrix
9. Live Proof Readiness Status
10. Repository Publishing Readiness
11. Document Package Synchronization Status
12. Commands Executed
13. Validation Results
14. Risks / Blockers
15. Exact Push Readiness Decision
16. Recommended Next Step

## 8. Founder Questions the Team Must Answer Explicitly
1. Is the local workspace at `C:\Users\mosat\medical-content-platform` coherent and ready to be the source of truth for the new repository?
2. Are there any missing files referenced by the current Document Package?
3. Is `Reference.embedding` now canonically resolved, or still open?
4. Are the critical auth-route concerns closed or still open?
5. Is the project ready to be pushed to the new canonical repository now, or not?
6. If not, what exact blockers remain?

## 9. Final Instruction
Proceed immediately with a full local pre-push verification pass.
Do not push blindly to the new canonical repository.
The local workspace must be reviewed, classified, and documented first.

Only after this pass may the founder decide whether the next step is:
- authorize push to the canonical repository,
- return to the development team for further fixes,
- or send the updated Document Package to an external verification team.
