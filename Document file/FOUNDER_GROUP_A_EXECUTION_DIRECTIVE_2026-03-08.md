# FOUNDER_GROUP_A_EXECUTION_DIRECTIVE_2026-03-08

Date: 2026-03-08
Audience: Codex Development Team
Priority: Immediate / High
Execution mode: controlled parallel hardening based on deep founder audit

## 1. Executive Position

The latest reviewed files show real progress in build discipline, governance structure, and baseline architectural hardening. That progress is acknowledged.

However, the review also uncovered a backbone-level inconsistency that must now be treated as a primary execution concern:

> The embedding runtime contract is not aligned with the Prisma schema and the intended retrieval architecture.

This is not a cosmetic issue. It affects retrieval integrity, scientific traceability, DB truth, and platform coherence.

Accordingly, the next pass is not a generic continuation pass.
It is a targeted correction and proof pass.

## 2. Mandatory Execution Rule for This Pass

For this execution cycle, you must:
1. implement the requested workstreams,
2. validate them technically,
3. and produce one unified execution report file for this pass.

Do **not** respond only with a conversational summary.
The execution must be accompanied by a repository report.

## 3. Required Report File for This Pass

Create this file after completing the work:

- `docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_A.md`

This file is mandatory.

### It must include these sections exactly:
1. Executive Summary
2. Founder Audit Findings Addressed
3. Workstreams Executed
4. Files Changed
5. Schema / Migration Changes
6. Retrieval Contract Decision
7. API / UI Wiring Changes
8. Tests Added or Updated
9. Validation Commands Run
10. Runtime Verification Performed
11. Warnings / Known Limitations
12. Risks Still Open
13. Mapping to Recovery Items (REC-xxx)
14. Mapping to Original Tasks (TASK-xxx)
15. Evidence Links to Canonical Docs
16. Recommended Next Step
17. Final Status Statement

If a section does not apply, explicitly write `Not applicable in this pass` and explain why.

## 4. Workstreams to Execute in Parallel

### Workstream A — Embedding / Retrieval Truth Alignment

#### Objective
Resolve the contradiction between runtime embedding behavior, retrieval code, and Prisma schema.

#### Required actions
1. Inspect the real database/model strategy and decide explicitly whether vectors live on:
   - `KnowledgeChunk` only,
   - `Reference` only,
   - or both.
2. If `Reference.embedding` is a real intended field:
   - formalize it in Prisma schema and migrations,
   - document its semantics,
   - explain how it is computed.
3. If `Reference.embedding` is **not** intended:
   - remove or refactor runtime writes/queries that depend on it,
   - move retrieval to the correct entity model.
4. Document the retrieval strategy decision in a real ADR.

#### Required outputs
- updated runtime code
- schema/migration alignment
- ADR covering retrieval vector strategy
- evidence in the execution report

#### Acceptance criteria
- no runtime vector field is used without schema truth
- retrieval target entity is clearly defined
- the decision is documented and testable

---

### Workstream B — Schema Hardening Closure (Phase 1 to Executable Reality)

#### Objective
Move schema hardening from “fields added in schema” to “applied, regenerated, and wired.”

#### Required actions
1. Execute Prisma migration for phase-1 fields if not yet applied.
2. Regenerate Prisma client.
3. Confirm the database and Prisma schema are synchronized.
4. Wire `isActive` / `archivedAt` into taxonomy APIs and UI where relevant.
5. Wire normalized source identifiers into the reference ingestion / dedup path where relevant.

#### Required outputs
- migration files
- updated API behavior
- updated UI behavior where applicable
- report section describing what is wired vs not wired

#### Acceptance criteria
- schema changes are not merely declarative
- Prisma client reflects the actual schema
- at least baseline API wiring exists for lifecycle fields

---

### Workstream C — Retrieval Safety and Query Discipline

#### Objective
Reduce unsafe and semantically ambiguous retrieval behavior.

#### Required actions
1. Review all vector query/write paths.
2. Minimize or eliminate `$queryRawUnsafe` where feasible in core retrieval code.
3. Centralize vector SQL handling into one controlled module/helper if raw SQL remains necessary.
4. Explicitly document any remaining raw SQL and why it is still required.
5. Validate dimension consistency end-to-end.

#### Acceptance criteria
- unsafe raw vector access is reduced or justified
- embedding dimension policy is explicit and enforced
- retrieval code path is easier to reason about

---

### Workstream D — Governance Tightening for Canonical Docs

#### Objective
Move from “better docs” to “strict current-state governance.”

#### Required actions
1. Re-check `SOURCE_OF_TRUTH.md` and reduce over-broad authority where needed.
2. Distinguish clearly between:
   - strategic baseline docs,
   - current operational truth,
   - historical directives.
3. Ensure canonical current-state docs point to stable filenames only.
4. Ensure archived docs are not still presented as equally authoritative current inputs.

#### Acceptance criteria
- governance hierarchy is explicit
- current execution truth is not diluted by historical directives
- canonical docs are coherent and linked

---

### Workstream E — Package / DB Lifecycle Governance

#### Objective
Harden execution discipline around Prisma/database operations.

#### Required actions
1. Review `package.json` scripts and add/clarify missing Prisma lifecycle commands if needed.
2. Make the difference clear between:
   - local development sync,
   - migration generation,
   - migration application,
   - Prisma client generation.
3. Reflect the intended DB workflow in docs.

#### Acceptance criteria
- database lifecycle is understandable from scripts + docs
- migration discipline is explicit
- no ambiguity remains between temporary push flows and durable migration flows

---

### Workstream F — Validation and Evidence

#### Objective
Prove that the changes work, not merely that files were edited.

#### Required actions
1. Run and report:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test -- --runInBand`
   - `npm run build`
2. If APIs/UI are updated, perform focused runtime verification for affected routes.
3. If migrations were applied, include migration evidence and generated-client evidence.

#### Acceptance criteria
- execution report contains command results
- affected routes are actually verified
- no hidden DB/schema mismatch remains unreported

## 5. Additional Required ADRs / Docs in This Pass

If not already present, add or update:
- an ADR for retrieval vector storage strategy
- a canonical validation note for schema migration execution

Suggested names:
- `docs/01-architecture/adr/ADR-005-retrieval-vector-storage-strategy.md`
- `docs/02-validation/SCHEMA_MIGRATION_EXECUTION_NOTE.md`

## 6. Non-Negotiable Clarifications Required in the Report

Your report must answer these questions explicitly:
1. Does `Reference.embedding` exist in the real system or not?
2. If yes, where is it defined and migrated?
3. Is semantic retrieval currently reference-level, chunk-level, or hybrid?
4. What is the intended scientific citation granularity?
5. Which APIs/UI paths now use `isActive` / `archivedAt`?
6. Which dedup fields are stored only vs actually used in logic?
7. Which raw SQL paths remain, and why?

## 7. Current Interpretation of Recovery Mapping

This pass primarily advances:
- REC-002
- REC-003
- REC-004
- REC-009

And may partially deepen:
- REC-006

## 8. Final Instruction

Do not open a new broad feature branch of unrelated functionality.
This pass is about coherence, proof, and truth alignment.

When complete, respond with:
1. the unified report file,
2. the exact list of changed files,
3. the validation outputs,
4. and a short closure statement indicating what remains open after this pass.
