# CODEX PARALLEL EXECUTION AND VALIDATION DIRECTIVE — 2026-03-08

## التوجيه الرسمي التنفيذي إلى فريق التطوير كودكس

**Project:** Medical Devices Intelligent Scientific Knowledge Platform  
**Issued By:** Founder / Technical Lead  
**Audience:** Codex Development Team  
**Directive Type:** Parallel Execution + Full Validation + Final Platform Assessment  
**Status:** Approved for Immediate Execution  
**Execution Mode:** Controlled Remediation + Parallel Delivery  
**Primary Workspace:** Visual Studio Code  

---

## 1) Official Founder Assessment of Your Latest Reply

Your latest reply demonstrates **real and useful progress**, specifically in the following areas:

- P0 remediation has started in the correct order.
- Quality gate stabilization work was initiated.
- Source-of-truth baseline was established.
- Devices UI/API contract alignment was addressed.
- ADR baseline and remediation progress tracking were added.

This is positive and acceptable as **measurable progress**.

However, from a founder/technical governance perspective, my assessment is the following:

### What is good
- You followed the remediation plan rather than drifting into unrelated implementation.
- You touched the right files for P0.
- You provided validation evidence instead of only claiming completion.
- You showed willingness to continue immediately into REC-004.

### What is not yet sufficient
- P0 is **not closed** because deterministic build proof is still missing.
- Validation evidence is still too narrow because only a targeted test path was explicitly reported, not full-system verification.
- Source-of-truth drift risk still exists because part of the planning package lives outside the main repo context.
- The project still lacks final proof that UI, APIs, services, data model, tooling, and operational scripts work together end-to-end.

### Official conclusion
Your update is accepted as **credible progress**, but **not as remediation closure**.
The project remains in **controlled execution mode**, and the next instruction is broader:

> You are now required to execute multiple coordinated workstreams in parallel, then perform a full project verification cycle, run the platform, inspect all implemented modules and integrations, and issue a comprehensive final platform report.

---

## 2) Governing Source of Truth

All implementation, validation, and reporting must be aligned to the following documents only:

1. `TEAM_IMPLEMENTATION_GUIDE.md`
2. `development-backlog.yaml`
3. `IMPLEMENTATION_GAP_ANALYSIS_2026-03-07.md`
4. `REMEDIATION_EXECUTION_PLAN.md`
5. `development-backlog-recovery.yaml`
6. `CODEX_TEAM_DIRECTIVE_2026-03-08.md`
7. `CODEX_PARALLEL_EXECUTION_AND_VALIDATION_DIRECTIVE_2026-03-08.md`
8. `docs/SOURCE_OF_TRUTH.md`

If any branch, local note, or older document conflicts with the above, the above list takes precedence.

---

## 3) Execution Strategy From This Point Forward

You are **not** to proceed as a single-thread implementation team.
You are to proceed as a coordinated engineering team executing **parallel workstreams** under one controlled plan.

### Parallel Workstream Model
You are authorized to execute the following workstreams in parallel, provided contract stability and branch discipline are maintained:

#### Workstream A — P0 Final Closure
Mapped items:
- `REC-001`
- `REC-002`
- `REC-003`

Required outcome:
- deterministic lint
- deterministic tests
- deterministic build
- stable source-of-truth mapping
- no critical contract mismatch in active routes

#### Workstream B — Taxonomy Foundation Completion
Mapped items:
- `REC-004`
- `TASK-007`
- `TASK-008`
- `TASK-009`
- `TASK-010`

Required outcome:
- Departments CRUD complete
- Devices full CRUD complete
- Device Models CRUD complete
- taxonomy management UI complete
- validation, relation integrity, error handling, and tests included

#### Workstream C — Settings and Governance Foundation
Mapped items:
- `REC-005`
- `REC-006`
- `TASK-022`
- `TASK-032`
- `TASK-033`
- `TASK-040`

Required outcome:
- settings persistence exists
- settings API exists
- settings UI exists
- audit logging expanded for major mutations
- documentation and ADR baseline updated properly

#### Workstream D — Validation, Runtime Verification, and Final Assessment
Mapped items:
- `REC-009` pre-close verification layer
- quality gates verification
- runtime verification
- end-to-end flow inspection

Required outcome:
- project is actually run
- implemented modules are inspected live
- integrations are verified
- final detailed assessment report is produced

---

## 4) Official Instruction: What You Must Do Next

You are instructed to do **all** of the following:

### 4.1 Complete implementation work in parallel
Proceed in parallel on:
- final P0 closure,
- taxonomy completion,
- settings foundation,
- audit/governance expansion.

### 4.2 Do not wait until the very end to validate
Every workstream must include:
- implementation,
- local validation,
- regression check,
- documentation update,
- backlog/recovery mapping.

### 4.3 After implementation, run the platform and inspect it as a system
This is mandatory.
Do not stop at code changes or unit tests.
You must:
- run the platform,
- inspect major routes,
- verify APIs and UI flows,
- confirm services and tools are wired correctly,
- and report the actual operational state of the platform.

---

## 5) Mandatory Detailed Scope by Workstream

## Workstream A — P0 Final Closure Requirements

You must fully close the remaining P0 proof gaps.

### A.1 Quality gates
You must validate and report results for:
- `npm run lint`
- full relevant test execution (not only one narrow test unless justified)
- `npm run build`

### A.2 Build determinism
You must identify and resolve the exact reason why build is timing out in the current environment.
You are not authorized to leave this as a vague note.
You must provide:
- root cause,
- reproduction context,
- mitigation,
- and whether the issue is code-related, environment-related, or toolchain-related.

### A.3 Contract closure
You must confirm that no active high-priority UI/API contract mismatch remains in the currently implemented areas.
This must cover at minimum:
- devices flow,
- dashboard metrics consumers,
- verification routes,
- reference management consumers,
- taxonomy UI once completed.

### A.4 Source-of-truth closure
You must confirm exactly which documents are active and which are archived/superseded.
No ambiguity may remain.

---

## Workstream B — Taxonomy Completion Requirements

You must complete the foundational taxonomy layer properly.

### B.1 Departments CRUD
Implement and validate:
- create department
- list departments
- get department details
- update department
- activate/deactivate department
- archive/delete policy if used
- validation and standardized errors

### B.2 Devices full CRUD
Implement and validate:
- create device
- list devices
- get device details
- update device
- archive/delete policy
- relation to department
- scientific/commercial naming fields
- knowledge completion state handling

### B.3 Device Models CRUD
Implement and validate:
- create model
- list models
- get model details if applicable
- update model
- archive/delete policy
- manufacturer
- production year
- technical notes
- parent relation integrity with device

### B.4 Taxonomy management UI
Deliver UI for:
- departments management
- devices management
- models management
- create/edit forms
- loading/empty/error states
- relation-based navigation and usability

### B.5 Taxonomy tests
You must include:
- API tests for CRUD lifecycle
- validation tests
- relation integrity tests
- UI behavior tests where practical

---

## Workstream C — Settings and Governance Requirements

### C.1 Settings foundation
Implement:
- settings persistence model
- settings retrieval/update API
- settings UI
- placeholders for future AI/processing/config values
- safe defaults

### C.2 Audit expansion
Expand audit coverage to at least:
- verification decisions
- content generation status changes
- publishing status changes
- settings changes
- taxonomy mutations where practical

### C.3 ADR and docs governance
You must:
- preserve `docs/SOURCE_OF_TRUTH.md`
- add ADR records for meaningful architectural decisions created during this implementation phase
- keep remediation progress docs updated
- ensure documentation reflects actual implementation, not intention only

---

## Workstream D — Full Validation and Platform Inspection Requirements

This workstream is mandatory after implementation and must not be skipped.

### D.1 Installation and environment verification
Verify and report:
- dependency installation state
- environment variables assumptions
- database availability
- migrations status
- seed status if applicable
- docker/dev services status if used

### D.2 Runtime verification
You must actually run the platform and inspect:
- boot success
- main routes load behavior
- API responses for core modules
- database connectivity
- retrieval/verification/content paths where implemented
- major admin screens behavior

### D.3 Functional verification checklist
You must inspect and report on the state of:
- authentication flow
- dashboard
- departments
- devices
- device models
- references
- reference file processing
- chunk extraction path
- verification workflow
- knowledge retrieval/search
- content generation
- publishing tasks
- settings
- logging/audit traces
- docs/source-of-truth consistency

### D.4 Tooling and engineering verification
You must verify:
- linting
- tests
- build
- scripts
- lock cleanup behavior
- ESLint behavior
- package scripts health
- developer workflow consistency

### D.5 UI/UX and design verification
You must review and report:
- route accessibility
- visual breakage if any
- major empty/loading/error states
- admin usability issues
- obvious contract/render defects
- obvious design regressions introduced by changes

### D.6 Operational readiness verification
You must inspect and report whether the repo currently has or lacks:
- backup baseline
- restore guidance
- monitoring baseline
- health endpoints
- alerting baseline
- deployment readiness notes

---

## 6) Required Final Deliverables

Your next major submission must include **all** of the following deliverables:

### Deliverable 1 — Implementation Summary
A clear summary of:
- what was implemented
- which workstreams were executed
- which files were added/updated
- which backlog and recovery IDs were addressed

### Deliverable 2 — Validation Evidence
Exact command results for:
- `npm run lint`
- test commands executed
- `npm run build`
- platform run/start command(s)
- migration/seed commands if used

### Deliverable 3 — Live Platform Verification Notes
A structured live verification summary covering:
- what routes/pages were opened
- what APIs were checked
- what flows succeeded
- what failed
- what remains partial

### Deliverable 4 — Final Detailed Platform Report
You must create a detailed report file inside the repository with a name in this form:

- `PLATFORM_FULL_VALIDATION_REPORT_YYYY-MM-DD.md`

This report must include at minimum:
- executive summary
- current maturity assessment
- implementation coverage by module
- backlog/recovery closure matrix
- quality gate results
- runtime verification results
- UI/API contract assessment
- architecture consistency assessment
- tooling/scripts assessment
- testing assessment
- design/UI assessment
- operational readiness assessment
- open risks/blockers
- exact recommended next actions

### Deliverable 5 — Updated Progress Report
Update progress documentation with:
- what is now completed
- what remains partial
- what remains blocked
- whether P0 is finally closed

---

## 7) Required Reporting Format

Your reply must be structured exactly in this order:

1. **Executive Summary**
2. **Workstreams Executed**
3. **Files Changed**
4. **Backlog / Recovery Mapping**
5. **Validation Commands and Results**
6. **Platform Runtime Verification Results**
7. **Issues / Risks / Blockers**
8. **Status of P0 Closure**
9. **Link to Final Detailed Validation Report**
10. **Recommended Next Step**

Do not send an unstructured narrative reply.

---

## 8) Non-Negotiable Constraints

You are not authorized to:
- mark work as complete without evidence,
- ignore deterministic build proof,
- skip runtime verification,
- skip documentation updates,
- introduce unrelated scope expansion,
- leave ambiguous whether a problem is fixed, partial, or still open.

---

## 9) Founder-Level Standard

The required standard is no longer “code exists.”
The required standard is:

- implementation correctness,
- backlog traceability,
- deterministic validation,
- runtime proof,
- documentation integrity,
- and system-level verification.

The objective is not superficial progress.
The objective is to move the repository toward a state that can be trusted by engineering leadership as an implementation baseline.

---

## 10) Final Instruction

Proceed immediately with the authorized parallel workstreams.

After implementation is complete, you must run the platform, inspect the implemented system end-to-end, validate its services/tools/scripts/design surfaces, and produce a detailed repository-based platform report.

**Proceed with parallel execution and full validation.**
