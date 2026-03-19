# REMEDIATION EXECUTION PLAN

## خطة المعالجة التنفيذية الرسمية بعد تقرير فريق التطوير

**Project:** Medical Devices Intelligent Scientific Knowledge Platform  
**Document Type:** Official Development Recovery & Alignment Plan  
**Status:** Approved for Team Execution  
**Audience:** Product Owner, Solution Architect, Engineering Leads, Frontend Team, Backend Team, QA Team, DevOps Team  
**Primary Workspace:** Visual Studio Code  
**Governing Inputs:**
- `TEAM_IMPLEMENTATION_GUIDE.md`
- `development-backlog.yaml`
- `IMPLEMENTATION_GAP_ANALYSIS_2026-03-07.md`

---

## 1. Purpose

This document converts the development team audit into an **execution recovery plan**.

Its purpose is to give the team a single, unambiguous path for:

- resolving implementation drift,
- restoring quality gates,
- closing backlog gaps,
- and moving the project from advanced prototype state to backlog-aligned implementation state.

This file is intended to become the team's **active operating plan** after the audit.

---

## 2. Official Interpretation of the Audit

The audit confirms the following:

1. The project contains real implementation and is not an empty scaffold.
2. The project is not backlog-complete.
3. The major problem is not engineering absence, but **closure discipline, consistency, and operational hardening**.
4. The next phase must focus on backlog alignment, acceptance closure, and gate stability.

### Current Official Status

- Delivery maturity: **Advanced Prototype / Pre-Production Hardening**
- Backlog completion status: **Incomplete**
- Quality gate status: **Unstable**
- Recommended execution mode: **Recovery Sprint + Controlled Closure**

---

## 3. Governing Rules From This Point Forward

The team must follow these rules without exception:

### 3.1 Source of Truth Rule
Only the following documents are authoritative:

1. `TEAM_IMPLEMENTATION_GUIDE.md`
2. `development-backlog.yaml`
3. `IMPLEMENTATION_GAP_ANALYSIS_2026-03-07.md`
4. `REMEDIATION_EXECUTION_PLAN.md`

All conflicting or outdated planning/closure documents must be archived, marked as obsolete, or ignored in execution decisions.

### 3.2 Acceptance Closure Rule
A task is **not complete** simply because code exists.
A task is complete only when:

- its acceptance criteria are satisfied,
- contracts are aligned,
- quality gates pass,
- and documentation is updated.

### 3.3 No New Feature Drift Rule
No additional feature expansion is allowed until:

- P0 issues are closed,
- quality gates are stable,
- and backlog alignment is restored.

### 3.4 Contract Integrity Rule
Every API used by UI must have a stable and documented response shape.
No implicit or inconsistent contract behavior is acceptable going forward.

---

## 4. Remediation Objectives

The team must achieve the following objectives in order:

1. Restore stable lint/build/test quality gates.
2. Consolidate source-of-truth documents.
3. Fix contract mismatches between frontend and backend.
4. Complete missing taxonomy APIs and UI.
5. Implement settings foundation.
6. Expand audit and operational hardening.
7. Re-run the backlog matrix and produce a closure report.

---

## 5. Recovery Workstreams

## Workstream A — Quality Gates Recovery

### Objective
Make the repository buildable, lintable, and testable in a deterministic way.

### Tasks
- Exclude generated `.next-build` or equivalent artifacts from lint scope.
- Prevent build output directories from being treated as source code.
- Add lock-cleanup or lock-detection handling for `.next-build/lock`.
- Validate local commands:
  - `npm run lint`
  - `npm test -- --runInBand`
  - `npm run build`
- Ensure the same commands are CI-ready.

### Required Output
- All three gates pass consistently.

### Exit Criteria
- Lint passes
- Tests pass
- Build passes
- Build artifacts are not causing false failures

---

## Workstream B — Source-of-Truth Consolidation

### Objective
Stop documentation drift and establish one official execution baseline.

### Tasks
- Review all architecture, closure, and planning docs in the repo.
- Mark outdated/conflicting docs as archived or superseded.
- Keep these as active references only:
  - `TEAM_IMPLEMENTATION_GUIDE.md`
  - `development-backlog.yaml`
  - `IMPLEMENTATION_GAP_ANALYSIS_2026-03-07.md`
  - `REMEDIATION_EXECUTION_PLAN.md`
- Add ADR baseline for future decisions.

### Required Output
- Clear documentation map
- No ambiguity around which document governs execution

### Exit Criteria
- Team can identify a single planning baseline without confusion

---

## Workstream C — Contract Alignment Recovery

### Objective
Eliminate API/UI response mismatches and stabilize integration behavior.

### Tasks
- Audit all active UI consumers against live API response contracts.
- Fix known mismatch cases such as:
  - devices page expecting `data.devices`
  - API returning `items`
- Establish shared response contracts or typed DTOs.
- Normalize list/detail/status payload shapes.
- Add regression tests for contract-sensitive pages.

### Required Output
- Stable integration between frontend and backend modules

### Exit Criteria
- No known contract mismatch remains in active routes
- Critical UI pages render against live APIs correctly

---

## Workstream D — Taxonomy Completion

### Objective
Close the most important backlog gap in foundational domain management.

### Tasks
- Implement **Departments CRUD API** (TASK-007).
- Complete **Devices full CRUD lifecycle** (TASK-008).
- Implement **Device Models CRUD API** (TASK-009).
- Build **Taxonomy Management UI** for departments/devices/models (TASK-010).
- Add validation and relation enforcement.
- Add tests for create/update/delete/list flows.

### Required Output
- Full taxonomy management capability from UI and API

### Exit Criteria
- Taxonomy tasks move from Not Started/Partial to Completed
- Acceptance criteria from backlog are met

---

## Workstream E — Settings Foundation

### Objective
Deliver the backlog-required settings baseline.

### Tasks
- Add settings persistence model.
- Add configuration endpoints.
- Add general settings UI.
- Add placeholders for AI/processing config.
- Ensure changes are traceable or audit logged.

### Required Output
- Minimal but real settings foundation

### Exit Criteria
- TASK-032 and TASK-033 reach Completed state or documented accepted baseline

---

## Workstream F — Audit & Governance Hardening

### Objective
Strengthen traceability and operational trust.

### Tasks
- Extend audit logging for:
  - verification decisions
  - content generation status changes
  - publishing status changes
  - settings mutations
- Introduce ADR template and first recorded decisions.
- Update onboarding/dev documentation.

### Required Output
- Stronger mutation traceability
- Clear architecture history

### Exit Criteria
- TASK-022 and TASK-040 are materially advanced to completion

---

## Workstream G — Operations Hardening

### Objective
Close operational readiness gaps required for a non-fragile system.

### Tasks
- Implement backup baseline (TASK-036).
- Add restore runbook and restore validation.
- Expand monitoring baseline beyond health endpoints (TASK-037).
- Ensure structured logging and standardized error contract progress (TASK-034).

### Required Output
- Minimal operational resilience baseline

### Exit Criteria
- Backup/restore and monitoring foundations are documented and usable

---

## 6. Priority Model

### P0 — Must Be Closed First
- Quality gates recovery
- Source-of-truth consolidation
- Contract alignment recovery

### P1 — Next Mandatory Closure Layer
- Taxonomy completion
- Settings foundation
- Audit expansion

### P2 — Hardening Layer
- Backup/restore
- Monitoring/alerts
- ADR formalization

---

## 7. Sprint Execution Order

### Sprint A — Recovery Sprint
Focus:
- Workstream A
- Workstream B
- Workstream C

### Sprint B — Domain Closure Sprint
Focus:
- Workstream D
- Workstream E

### Sprint C — Governance & Ops Sprint
Focus:
- Workstream F
- Workstream G

### Sprint D — Final Backlog Closure Sprint
Focus:
- Re-run full TASK-001..TASK-040 matrix
- Validate acceptance criteria task-by-task
- Produce final closure report

---

## 8. Team Instructions for VS Code Workflow

For every remediation task, the team must:

1. Reference the original task ID from `development-backlog.yaml`
2. Reference the remediation workstream from this document
3. Create branch names like:
   - `fix/TASK-003-quality-gates`
   - `feature/TASK-007-departments-crud`
4. Validate against acceptance criteria before PR
5. Update status in backlog tracking after merge

---

## 9. Required Deliverables After Remediation

At the end of the remediation cycle, the team must submit:

1. Updated backlog status matrix
2. Passing lint/build/test evidence
3. Contract alignment summary
4. Taxonomy completion evidence
5. Settings baseline evidence
6. Backup/monitoring evidence
7. Final implementation closure report

---

## 10. Definition of Recovery Done

The remediation plan is considered complete only when:

- P0 items are fully closed
- no critical contract mismatch remains
- lint/build/test all pass reliably
- taxonomy tasks are completed
- settings baseline exists
- audit expansion is implemented
- operations baseline is documented and minimally functional
- backlog matrix is re-run and updated

---

## 11. Final Directive to the Development Team

From this point onward, the team must treat the project as being in **controlled remediation mode**.

This means:

- no drifting away from backlog closure,
- no uncontrolled feature expansion,
- no claiming task completion without acceptance closure,
- and no ambiguity about the source of truth.

The immediate goal is not to add more visible features.
The immediate goal is to make the existing implementation **correct, aligned, complete, and operationally stable**.
