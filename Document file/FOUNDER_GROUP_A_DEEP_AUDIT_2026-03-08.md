# FOUNDER_GROUP_A_DEEP_AUDIT_2026-03-08

Date: 2026-03-08
Scope reviewed:
- `lib/embeddings.ts`
- `package.json`
- `docs/00-governance/SOURCE_OF_TRUTH.md`
- `docs/00-governance/CURRENT_PROJECT_STATUS.md`
- `docs/00-governance/REPORTS_INDEX.md`
- `docs/00-governance/DOCUMENT_RETENTION_AND_ARCHIVE_POLICY.md`
- `docs/00-governance/EXECUTION_AUDIT_RESPONSE.md`

## 1. Executive Verdict

The team has made real progress in governance, build stability, and report structure. However, the reviewed files also expose a set of critical architectural inconsistencies that must be closed before the platform can be considered technically coherent.

The most important finding is not cosmetic:

> `lib/embeddings.ts` writes and queries `Reference.embedding`, while the provided `prisma/schema.prisma` does not define an `embedding` field on `Reference`.

This is a backbone-level inconsistency. It suggests one of the following:
- the database was manually altered outside Prisma and the schema is no longer the truth,
- the schema is outdated and not synchronized with runtime behavior,
- or the embedding strategy is undecided between reference-level vectors and chunk-level vectors.

This issue must be treated as a blocker for retrieval integrity.

## 2. Positive Findings

### 2.1 Embedding guardrails exist
- `EMBEDDING_DIMENSION` is validated.
- deterministic local fallback exists when external embeddings are unavailable.
- OpenAI responses are dimension-checked before persistence.

### 2.2 Governance documents are improved
- stable filenames for canonical reports are a strong improvement.
- `REPORTS_INDEX.md` and `DOCUMENT_RETENTION_AND_ARCHIVE_POLICY.md` are directionally correct.
- `CURRENT_PROJECT_STATUS.md` attempts to centralize state.

### 2.3 Build/test discipline appears to be improving
- the team is now reporting `typecheck`, `lint`, `test`, and `build` consistently.
- `package.json` includes operational scripts for backup/restore/readiness.

## 3. Critical Findings

### 3.1 Embedding persistence contract is inconsistent
`lib/embeddings.ts` exposes:
- `saveReferenceEmbedding(referenceId, embedding)`
- `queryVectors(queryEmbedding, topK)` querying `Reference.embedding`

But the reviewed Prisma schema does not define:
- `Reference.embedding`

Impact:
- retrieval behavior may rely on a database column invisible to Prisma schema,
- or runtime behavior may be broken in clean environments,
- or the implementation is mixing two incompatible retrieval models.

Required resolution:
- explicitly decide whether vectors live on `KnowledgeChunk`, `Reference`, or both,
- reflect that decision in Prisma schema + SQL migrations + retrieval code + reports,
- document the decision in an ADR.

### 3.2 Retrieval strategy is drifting from the architectural intent
The current `queryVectors()` searches:
- `Reference.embedding`
- and returns `parsedText` as `pageContent`

This conflicts with the intended architecture where semantic retrieval should primarily operate on:
- `KnowledgeChunk`
- with page-level traceability
- and category-level explainability

Impact:
- lower retrieval precision,
- poor explainability,
- weak alignment with scientific citation granularity.

### 3.3 Unsafe SQL remains in the retrieval path
`queryVectors()` uses `$queryRawUnsafe` with interpolated SQL.
Even if current inputs are internal, this must be eliminated in core retrieval code.

Required resolution:
- use a safe helper or strongly constrained raw execution path,
- centralize vector SQL operations in one module,
- add tests for malicious/invalid input handling.

### 3.4 Single-vector-per-reference semantics are unclear
`saveReferenceEmbedding()` updates one vector on `Reference`.
But reviewed scripts indicate page-by-page processing may call this repeatedly.

This creates an unresolved semantic question:
- Is the reference vector meant to be the last page vector?
- an aggregate vector?
- a centroid over chunks?
- or should it not exist at all?

This is not a cosmetic issue. It changes retrieval quality and scientific traceability.

### 3.5 Schema hardening is partial, not complete
The reviewed status documents claim baseline implementation, but the audit response itself still states:
- schema hardening fields need migration execution,
- Prisma client regeneration is still pending in the next DB-change cycle.

Therefore:
- schema hardening must not be treated as closed,
- current status language should remain explicit about pending migration application and API/UI wiring.

### 3.6 Governance improved, but source-of-truth is still too broad
`SOURCE_OF_TRUTH.md` still lists many historical founder directives as authoritative inputs.
That is better than chaos, but still too wide for true governance.

Recommended hierarchy:
- strategic baseline docs,
- current canonical docs,
- archived historical directives.

Only a small set should remain authoritative for current execution.

### 3.7 Package scripts need stronger DB lifecycle governance
`package.json` currently includes:
- `db:push`
- `manual:migrate`
- `db:apply`

This is not enough for long-term discipline.
Missing or weakly represented:
- explicit Prisma generate command,
- explicit migrate dev/deploy flow,
- clearer distinction between local development and production-safe migration execution,
- execution reports linked to DB changes.

## 4. Medium-Risk Findings

### 4.1 Current status language may over-compress reality
`CURRENT_PROJECT_STATUS.md` labels many items as `Implemented Baseline`.
This is acceptable as a temporary label, but it must always be paired with:
- what is wired,
- what is not wired,
- what evidence exists,
- what remains environment-dependent.

### 4.2 Canonical docs exist, but archive enforcement is not proven yet
The governance model is good on paper, but execution proof still depends on:
- actual folder structure,
- moved historical files,
- removal of duplicate current-state statements,
- index completeness.

### 4.3 Warning budget is not formalized
The team still reports non-blocking warnings.
A platform of this type should move toward a documented warning policy:
- accepted warnings,
- target warnings to eliminate,
- ownership and ETA.

## 5. Recommended Decisions

### Decision A — Retrieval truth must be unified
Choose one of the following and document it:
1. chunk-first retrieval only,
2. hybrid retrieval with chunk vectors + optional aggregated reference vectors,
3. reference-only retrieval (not recommended for this platform).

Recommended outcome:
- chunk-first retrieval,
- optional derived reference summary vector only if justified.

### Decision B — Prisma must regain authority
No runtime behavior should depend on fields absent from Prisma schema without explicit architectural exception.
If `Reference.embedding` exists in DB, it must be formalized.
If not intended, remove runtime writes to it.

### Decision C — Governance docs must become hierarchical
Reduce current authoritative docs to:
- implementation baseline,
- recovery baseline,
- current project status,
- canonical validation report,
- source of truth.

All older directives should remain available but not equally authoritative.

## 6. Required Next Proofs

The next implementation pass must prove, not just claim:
1. schema migration execution,
2. Prisma client regeneration,
3. retrieval contract reconciliation,
4. taxonomy activation wiring,
5. normalized-source dedup behavior,
6. canonical reporting discipline via one execution report.

## 7. Final Position

The project is improving meaningfully.
But the current state is still a partially unified system, not a fully coherent one.

The next execution pass must focus on:
- schema/runtime truth alignment,
- retrieval integrity,
- safer SQL and cleaner DB lifecycle,
- report discipline,
- and evidence-backed validation.
