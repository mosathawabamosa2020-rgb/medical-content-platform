# Founder Group C Audit — Schema, Dedup, Lifecycle, and Service Proof

Date: 2026-03-09
Status: Active
Scope reviewed:
- `prisma/schema.prisma`
- `lib/sourceIdentifiers.ts`
- `pages/api/admin/ingestion/import.ts`
- `pages/api/references/discovery/ingest.ts`
- `pages/api/references/upload.ts`
- `pages/api/admin/taxonomy/departments/[id].ts`
- `pages/api/admin/taxonomy/devices/[id].ts`
- `pages/api/admin/taxonomy/models/[id].ts`
- `pages/api/admin/taxonomy/departments/index.ts`
- `pages/api/admin/taxonomy/devices/index.ts`
- `pages/api/admin/taxonomy/models/index.ts`
- `pages/admin/taxonomy/index.tsx`
- `__tests__/source_identifiers.test.ts`
- `__tests__/taxonomy_departments_detail_api.test.ts`
- `docs/01-architecture/SCHEMA_HARDENING_MIGRATION_PLAN.md`
- `docs/00-governance/CURRENT_PROJECT_STATUS.md`

## 1. Executive Judgment
The team delivered real implementation progress in source-identifier derivation, ingestion dedup wiring, taxonomy soft-archive behavior, and documentation updates. However, this pass does **not** qualify as final closure.

The most critical unresolved issue remains architectural consistency between:
- Prisma schema,
- embeddings/retrieval code path,
- and the intended canonical retrieval model.

The current implementation shows useful progress, but still reflects a stabilized baseline rather than a complete, production-grade closure.

## 2. Accepted Progress
The following are accepted as meaningful progress:
1. Source identifier derivation exists as reusable utility.
2. Dedup checks are now wired into multiple ingestion paths.
3. Taxonomy lifecycle fields are being used for soft archive / activation behavior.
4. Basic regression tests were added.
5. Governance docs were updated to reflect migration intent and current status.

## 3. Critical Finding A — Schema/Retrieval Mismatch Still Open
`prisma/schema.prisma` still does **not** define `Reference.embedding`.

This is critical because reviewed code in the current project family has already relied on:
- writing embeddings to `Reference`, and
- querying vectors from `Reference`.

Therefore one of the following must be true:
1. The database contains a column not represented in Prisma schema.
2. Retrieval code is writing to a non-canonical field via raw SQL.
3. The intended architecture should be chunk-first retrieval, but implementation drifted.
4. The migration/schema sync is still incomplete from an architectural perspective.

This is the single most important unresolved backbone issue.

## 4. Critical Finding B — Dedup Is Still Best-Effort, Not Enforced
The current schema adds identifier fields to `Reference`:
- `doi`
- `pmid`
- `arxivId`
- `sourceFingerprint`
- `contentHash`

But these are indexed, not uniquely enforced.

Current dedup behavior in code relies on:
- application-level lookup (`findFirst`), then
- creation (`create`).

This means:
- race conditions remain possible,
- duplicate writes are still possible under concurrent ingestion,
- dedup is heuristic/application-level, not database-guaranteed.

## 5. Critical Finding C — Reference Identity Scope Is Unresolved
Dedup checks are mostly scoped by `deviceId`.

That means the system currently behaves closer to:
- reference-per-device,
not:
- global reference catalog.

This is a major design decision and must be made explicit. Without this decision, dedup policy and database constraints will remain ambiguous.

## 6. Critical Finding D — File Lifecycle Is Not Safe Enough Yet
In upload and discovery flows, files are written before final duplicate closure is guaranteed.

This can produce:
- orphan files,
- storage drift,
- inconsistent DB/file state,
- and unnecessary disk growth.

The platform still needs a defined file lifecycle policy.

## 7. Critical Finding E — Upload Embedding Semantics Are Ambiguous
In the upload flow, each page is embedded, then `saveReferenceEmbedding(ref.id, emb)` is called repeatedly.

If `saveReferenceEmbedding` writes a single vector at reference level, then the last write may overwrite prior pages.

This means the implementation may be doing one of the following:
- overwriting reference embedding on each page,
- using undocumented reference-level aggregation semantics,
- or relying on a schema/DB shape not represented in Prisma.

This must be explicitly resolved.

## 8. Critical Finding F — SSRF and Discovery Hardening Are Partial
`discovery/ingest` includes some blocking for protocols and local hosts, but this is not a full SSRF-hardening strategy.

This remains acceptable only as a baseline, not as a final operational security posture.

## 9. Critical Finding G — Taxonomy Lifecycle Is Baseline, Not Mature
The taxonomy endpoints now support activation/deactivation via:
- `isActive`
- `archivedAt`

However:
- index routes still return all items without clear lifecycle filtering policy,
- operator UI exposes activation state only minimally,
- archivedAt is not surfaced clearly,
- dependency-aware lifecycle behavior is not visible,
- restore/archive semantics are not yet elevated to a full lifecycle model.

## 10. Critical Finding H — Test Coverage Is Too Thin for This Layer
Tests added in this pass are useful but insufficient.

Observed tests cover:
- source identifier derivation,
- department detail lifecycle behavior.

Missing or not evidenced here:
- upload dedup tests,
- discovery ingest dedup tests,
- import dedup tests,
- device/model lifecycle tests,
- file cleanup behavior,
- concurrent duplicate protection,
- embedding semantics tests.

## 11. Documentation Status Assessment
`SCHEMA_HARDENING_MIGRATION_PLAN.md` is directionally useful.
`CURRENT_PROJECT_STATUS.md` is acceptable as a baseline status page.

But governance is still weaker than required because:
- architectural contradictions remain open,
- canonical docs still summarize some items as “implemented baseline” without sufficient proof depth,
- no unified deep service-proof report has yet been evidenced for the actual platform service chain.

## 12. Founder Decision
The project should now move into a stricter execution phase focused on:
1. schema/retrieval closure,
2. migration evidence,
3. service-proof validation,
4. database and platform backbone verification,
5. live proof of smart retrieval/discovery from multiple sources,
6. and a formal deep verification report authored by the development team.

## 13. Mandatory Follow-up Evidence Required
The next evidence package must include:
1. Exact migration folder and `migration.sql` content for schema semantics phase-1.
2. Full outputs of:
   - `npx prisma migrate deploy`
   - `npx prisma migrate status`
   - `npx prisma generate`
3. Current implementation report for this pass.
4. Full service-proof report requested by founder directive.
5. Route/API/service validation evidence for search/discovery/ingestion/retrieval flows.

## 14. Final Founder Position
The platform is improving in meaningful ways, but it is still not ready to claim full architectural closure.

The correct next step is **not** feature expansion.
The correct next step is:
- proof,
- alignment,
- migration evidence,
- retrieval model closure,
- service verification,
- and documented operational confidence.
