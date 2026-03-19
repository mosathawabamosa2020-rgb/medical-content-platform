# FOUNDER_GROUP_D_EXECUTION_DIRECTIVE_2026-03-09

Date: 2026-03-09
Status: Active
Priority: Immediate
Audience: Development team / implementation owners
Authority: Founder technical directive

## 1. Directive Purpose
This directive defines the next approved execution pass.
The team is **not** authorized to move into broad new feature expansion yet.
The approved focus is:
- verification certainty,
- service proof,
- startup diagnostics,
- operator alerting,
- and clean evidence generation.

## 2. Founder Assessment of Current State
Accepted:
- Group B hardening produced real progress in dedup, ingestion safety, and taxonomy lifecycle.
- Group C produced useful proof-oriented structure and better alignment between code and schema.
- Database-level device-scoped dedup constraints are now present in the authoritative schema.
- Build/test/typecheck/lint are reported passing.

Not yet accepted as final closure:
- corrupted/incomplete raw validation evidence,
- partial/blocked live multi-source proof,
- insufficient startup diagnostics and alerting,
- incomplete operational confidence before opening the platform UI,
- unresolved need for clearer operator-visible degraded/failure state handling.

## 3. Immediate Execution Order
Execute the following workstreams in parallel where practical, but do not skip evidence generation.

---

## 4. Workstream A — Clean Evidence Integrity and Validation Output Export
### Objective
Make all validation evidence audit-grade, clean, reproducible, and human-readable.

### Required Actions
1. Re-run and export full raw outputs for:
   - `npx prisma generate`
   - `npx prisma migrate deploy`
   - `npx prisma migrate status`
   - `npm run typecheck`
   - `npm run lint`
   - `npm test -- --runInBand`
   - `npm run build`
2. Ensure outputs are stored as clean UTF-8 text with no BOM/NUL corruption.
3. Place the artifact under:
   - `artifacts/group_d_validation_outputs_2026-03-09.txt`
4. If terminal tooling causes corruption, export command outputs through a safer redirect/capture path and document how the artifact was generated.

### Acceptance Criteria
- No corrupted raw output artifact.
- Full outputs visible and readable.
- Commands in report match artifact content exactly.

---

## 5. Workstream B — Database Structure and Migration Proof
### Objective
Prove that the database schema, migration history, and Prisma client are synchronized and operationally trustworthy.

### Required Actions
1. Verify and document:
   - current Prisma schema,
   - active migration folders,
   - migration order,
   - schema-to-DB sync state.
2. Confirm dedup constraints are present in DB, not only in schema text.
3. Explain whether any columns/indexes exist in DB that are not represented in authoritative Prisma schema.
4. Document any remaining semantic mismatches, especially around:
   - embeddings,
   - audit persistence,
   - file/filePath usage.

### Acceptance Criteria
- Clear DB structure verification section in report.
- Prisma sync evidence included.
- Any mismatch explicitly listed, not hidden.

---

## 6. Workstream C — Core Service Proof Against the Database
### Objective
Prove that the core changed services are actually working against the database and not only compiling.

### Required Actions
Verify and document with evidence:
1. Taxonomy list/detail lifecycle behavior.
2. Ingestion import create/duplicate handling.
3. Discovery ingest create/duplicate/blocked URL behavior.
4. Upload acceptance/rejection/dedup behavior.
5. Ingestion logging behavior.
6. Any affected health/readiness endpoints.

### Required Evidence
For each verified service include:
- endpoint/path,
- input sample,
- expected behavior,
- actual result,
- DB effect,
- status (`PASS / FAIL / BLOCKED / PARTIAL`).

### Acceptance Criteria
- Evidence matrix included in report.
- At least one DB-impact proof for each touched service area.

---

## 7. Workstream D — Smart Search and Multi-Source Discovery Proof
### Objective
Prove the platform’s identity as a knowledge acquisition system, not just a CRUD/admin project.

### Required Actions
1. Execute a **small controlled live proof** of multi-source discovery.
2. Use a limited and safe sample (for example 2–3 sources and a very small number of references).
3. Sources must be clearly documented.
4. Demonstrate the flow:
   - discovery/search,
   - fetch/ingest,
   - storage in DB,
   - state/log evidence,
   - and any resulting visibility in the platform where applicable.
5. If a full end-to-end live run is blocked, document exactly why, what works, what is blocked, and what the next unblock action is.

### Acceptance Criteria
- One concrete proof run exists.
- Stored references can be shown as persisted records/logged outcomes.
- The report distinguishes code-level readiness from live-runtime evidence.

---

## 8. Workstream E — Startup Preflight Diagnostics and Operator Alerting
### Objective
Add a real startup confidence layer so the operator knows platform readiness **before opening the browser**.

### Required Actions
Implement a startup diagnostics layer that reports, at minimum:
1. Database connection: connected / failed.
2. Redis connection: connected / not configured / failed.
3. Required environment variables: ok / missing.
4. Settings store: writable / missing / failed.
5. Audit trail destination: writable / missing / failed.
6. Backup manifest presence: found / missing.
7. Readiness summary: `ok / degraded / blocked`.

### Deliverables
1. A startup/preflight command, e.g.:
   - `npm run ops:preflight`
2. Terminal-friendly structured output with clear statuses and human-readable messages.
3. A reusable diagnostics layer so the same logic can power:
   - terminal startup checks,
   - readiness API,
   - and admin/operator status display.
4. An admin/operator-facing status summary or banner if the platform is degraded or blocked.

### Acceptance Criteria
- Running the preflight command clearly shows what is working and what is not.
- Required vs optional dependencies are clearly distinguished.
- A degraded state is visible before entering the application.

---

## 9. Workstream F — Health / Readiness Refactor and Alert Model
### Objective
Strengthen operational truth and reduce duplicated logic.

### Required Actions
1. Refactor health dependency checks into a shared module/service.
2. Add timeouts to dependency checks.
3. Introduce consistent status vocabulary such as:
   - `ok`
   - `degraded`
   - `blocked`
   - `not_configured`
   - `error`
4. Ensure `/api/health`, `/api/health/dependencies`, `/api/health/system`, and readiness tooling are aligned.
5. Document the model in operations docs.

### Acceptance Criteria
- Health logic is no longer duplicated ad hoc.
- Status semantics are consistent across terminal/tooling/API outputs.

---

## 10. Workstream G — Test Expansion for Hardening Paths
### Objective
Increase trust in the changed service paths.

### Required Actions
Add or expand tests for:
1. Discovery SSRF rejection (blocked protocol/host/private IP cases).
2. Upload duplicate conflict behavior.
3. Upload rollback on file write failure.
4. Import duplicate conflict behavior.
5. Taxonomy lifecycle filters and dependency guards where still uncovered.
6. Startup/preflight diagnostics logic.

### Acceptance Criteria
- New tests added and included in suite output.
- Reports state what remains untested and why.

---

## 11. Mandatory Reports Required From This Pass
The team must create the following files:
1. `docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_D.md`
2. `docs/02-validation/PLATFORM_DEEP_VERIFICATION_AND_ALERTING_REPORT.md`

### Report 1 must include at minimum
- objective,
- scope,
- files changed,
- migrations/sync actions,
- APIs/UI affected,
- tests added/updated,
- commands executed,
- known risks,
- next recommended step.

### Report 2 must include at minimum
1. Database structure and schema verification.
2. Backbone robustness and service health verification.
3. Proof that services are functioning and wired to the database.
4. Smart search/discovery proof from multiple sources using a small real sample.
5. Team recommendations for stability, architecture, design, and operational improvement.

In addition, include:
- `artifacts/group_d_validation_outputs_2026-03-09.txt`

---

## 12. Reporting Discipline Rules
- Do not provide summary-only claims without artifact-backed evidence.
- Do not mark a service as PASS unless there is either runtime proof or a clearly justified proof path.
- Distinguish `PASS`, `PARTIAL`, `BLOCKED`, and `FAIL` precisely.
- If a live proof is blocked, name the blocker and the exact unblock action.

---

## 13. Explicit Founder Constraint
No transition to a new functional phase will be approved until this pass provides:
- clean raw outputs,
- service proof confidence,
- startup/operator diagnostics,
- and a clear status view of what works, what is degraded, and what is blocked.

## 14. Final Instruction
Proceed immediately with Group D execution.
Do not respond with a brief summary only.
Respond only after:
- code changes are applied,
- diagnostics are implemented,
- reports are created,
- and clean evidence artifacts are attached.
