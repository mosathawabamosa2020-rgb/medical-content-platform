# CODEX TEAM DIRECTIVE — 2026-03-08

## التوجيه الرسمي إلى فريق التطوير كودكس

**Project:** Medical Devices Intelligent Scientific Knowledge Platform  
**Issued By:** Founder / Technical Lead  
**Audience:** Codex Development Team  
**Directive Type:** Official Execution Instruction After P0 Remediation  
**Status:** Approved for Immediate Execution  
**Primary Workspace:** Visual Studio Code  

---

## 1. Executive Direction

Team,

I reviewed your latest remediation update and acknowledge the work completed on the P0 recovery path.

Your implementation of the following items is recognized as meaningful progress:

- quality gate stabilization work,
- source-of-truth consolidation baseline,
- UI/API contract alignment baseline,
- ADR baseline creation,
- remediation progress reporting.

This is the correct direction.

However, this does **not** yet constitute final closure of the remediation cycle.
The project remains in **controlled remediation mode**, and execution must continue under the approved planning package already provided.

From this point forward, your work must proceed in a disciplined, backlog-traceable, acceptance-driven manner.

---

## 2. Official Source of Truth

All implementation decisions must be governed only by the following documents:

1. `TEAM_IMPLEMENTATION_GUIDE.md`
2. `development-backlog.yaml`
3. `IMPLEMENTATION_GAP_ANALYSIS_2026-03-07.md`
4. `REMEDIATION_EXECUTION_PLAN.md`
5. `development-backlog-recovery.yaml`
6. `docs/SOURCE_OF_TRUTH.md`

If any older document, internal assumption, or legacy implementation conflicts with the above, the listed documents take precedence.

---

## 3. Official Position on Your Latest Update

Your reported work is accepted as **progress toward closure**, specifically for the P0 layer:

- `REC-001` — Quality gate stabilization: **In Progress / Not yet fully closed**
- `REC-002` — Source-of-truth consolidation: **In Progress / Baseline established**
- `REC-003` — Contract alignment: **In Progress / Baseline established**

### Clarification
P0 is not considered fully closed until the following are evidenced in a deterministic manner:

- `npm run lint` passes consistently,
- `npm test -- --runInBand` passes consistently,
- `npm run build` passes deterministically,
- no unresolved critical UI/API mismatch remains,
- source-of-truth drift is formally contained and documented.

Because your build proof is still pending, P0 remains **open** until final evidence is submitted.

---

## 4. Immediate Instruction

You are authorized to continue immediately with the next execution layer, but under the following rule:

### Execution Rule
Proceed with `REC-004` **in parallel with finalizing remaining P0 closure evidence**, provided that:

- you do not introduce new drift,
- you do not weaken the quality gates,
- and all new work remains mapped to backlog tasks and recovery items.

### Approved Next Work Item
**REC-004 — Complete taxonomy APIs and management UI**

Mapped tasks:
- `TASK-007`
- `TASK-008`
- `TASK-009`
- `TASK-010`

---

## 5. Required Scope for REC-004

You are instructed to implement and/or complete the following without scope drift:

### A. Departments CRUD
Implement full Departments CRUD lifecycle:
- create department,
- list departments,
- view department details,
- update department,
- archive/delete policy as appropriate,
- activation status support,
- validation and error handling.

### B. Devices Full CRUD
Complete device lifecycle beyond listing/filtering:
- create,
- list,
- detail,
- update,
- archive/delete policy,
- relation to department,
- knowledge completion status support,
- validation of required medical taxonomy fields.

### C. Device Models CRUD
Implement full models lifecycle:
- create model,
- list models by device,
- update model,
- archive/delete policy,
- manufacturer,
- production year,
- technical notes,
- relation integrity with parent device.

### D. Taxonomy Management UI
Deliver operator-facing taxonomy UI covering:
- departments management,
- devices management,
- models management,
- form validation,
- empty/loading/error states,
- clear relation flow between department → device → model.

---

## 6. Mandatory Implementation Standards

The following are mandatory and non-optional:

1. **Strict traceability**
   - Every branch, PR, and report must reference:
     - recovery item ID,
     - mapped task IDs,
     - acceptance criteria.

2. **Contract stability**
   - All new API responses must follow documented and consistent response shapes.
   - Legacy compatibility should be temporary and explicitly documented if retained.

3. **Validation discipline**
   - No create/update endpoint may ship without input validation and expected error behavior.

4. **Layering discipline**
   - No business logic leakage into UI pages.
   - No ad hoc DB access from presentation layer.

5. **Documentation discipline**
   - Update `docs/SOURCE_OF_TRUTH.md` or related docs only when the implementation baseline materially changes.
   - Add ADRs only for meaningful architectural decisions, not routine coding changes.

---

## 7. Acceptance Criteria for the Next Submission

Your next submission for `REC-004` must include evidence that the following are true:

### Functional Acceptance
- Departments can be created, listed, edited, and deactivated/archived.
- Devices can be created, listed, edited, and linked correctly to departments.
- Device models can be created, listed, edited, and linked correctly to devices.
- Taxonomy UI works end-to-end for these entities.

### Technical Acceptance
- Input validation exists on create/update APIs.
- Error handling is consistent.
- Relations are enforced correctly.
- No critical UI/API contract mismatch exists in the taxonomy flow.

### Quality Acceptance
- Relevant tests pass.
- `npm run lint` passes.
- `npm run build` evidence is updated again.
- No newly introduced regression is visible in current implemented modules.

---

## 8. Required Deliverables in Your Next Reply

Your next response must include the following, in order:

1. **Implementation Summary**
   - what was changed,
   - which files were added/updated,
   - which tasks/recovery items were addressed.

2. **Status Matrix Update**
   - updated status for:
     - `REC-001`
     - `REC-002`
     - `REC-003`
     - `REC-004`
     - `TASK-007`
     - `TASK-008`
     - `TASK-009`
     - `TASK-010`

3. **Validation Evidence**
   - lint result,
   - test result,
   - build result,
   - note any environmental blocker explicitly.

4. **Risk / Blocker Report**
   - any blocker preventing deterministic build,
   - any migration risk,
   - any unresolved contract risk,
   - any assumption requiring approval.

5. **Progress Document Update**
   - update `docs/REMEDIATION_PROGRESS_2026-03-08.md`
   - include what is now complete vs still open.

---

## 9. Explicit Constraints

You are **not** authorized at this stage to:

- expand into unrelated new features,
- introduce major architectural deviation,
- mark backlog items complete without acceptance evidence,
- bypass documented source-of-truth rules,
- postpone build determinism without reporting exact cause and mitigation.

---

## 10. Founder-Level Expectation

I am not looking for superficial feature growth.
I am looking for controlled engineering closure.

The standard from this point onward is:

- accurate implementation,
- stable contracts,
- deterministic validation,
- documented decisions,
- and clean backlog alignment.

Your execution quality will be judged not by how much code was added, but by how reliably the project moves from mixed implementation state to a controlled, evidence-backed, backlog-aligned system.

---

## 11. Final Instruction

Proceed immediately with `REC-004`, while preserving the P0 remediation baseline and continuing to close any remaining proof gaps for deterministic build stability.

Use the approved planning package as the only governing baseline.

Your next update must be structured, evidence-based, and mapped directly to the backlog and remediation IDs.

**Proceed.**
