# FOUNDER_GROUP_B_DEDUP_INGESTION_AND_TAXONOMY_AUDIT_2026-03-09

Date: 2026-03-09
Status: Founder Technical Audit
Scope: `lib/sourceIdentifiers.ts`, `pages/api/admin/ingestion/import.ts`, `pages/api/references/discovery/ingest.ts`, `pages/api/references/upload.ts`, taxonomy activation/archive APIs and taxonomy admin UI.

## 1. Executive Summary
This audit confirms that the development team implemented real code progress in three important areas:
1. normalized source identifier derivation,
2. duplicate-detection logic in import / discovery / upload flows,
3. soft archive lifecycle behavior for taxonomy entities.

However, the implementation is still at a **baseline-hardening stage**, not a final production-grade closure. The code introduces valid structural direction, but there are still critical issues in:
- duplicate-prevention guarantees,
- file lifecycle handling,
- schema enforcement vs application-only checks,
- SSRF and storage safety,
- reference-level vs page-level embedding semantics,
- taxonomy lifecycle UX and dependency awareness.

## 2. Positive Findings
### 2.1 Source identifier normalization
`lib/sourceIdentifiers.ts` is a meaningful improvement.
It introduces deterministic derivation for:
- DOI,
- PMID,
- arXiv ID,
- source fingerprint.

This is a valid baseline for reducing duplicate references and aligning source identity handling.

### 2.2 Duplicate checks were introduced into actual ingestion paths
The team wired identifier/content duplicate detection into:
- admin ingestion import,
- discovery ingest,
- references upload.

This is important because dedup logic moved from planning into runtime code paths.

### 2.3 Taxonomy lifecycle moved from hard-delete mindset toward soft archive
Departments, devices, and device models now support:
- `isActive`,
- `archivedAt`,
- PATCH-based activation/deactivation,
- DELETE behavior that archives instead of destructive delete.

This is aligned with operational safety and knowledge retention.

### 2.4 Audit wiring remains present in lifecycle mutations
The taxonomy mutation handlers continue to emit audit events. This is a positive governance sign, assuming the audit utility itself is durable and non-lossy.

## 3. Critical Findings

## 3.1 Dedup is still application-level and race-prone
Current duplicate prevention relies on:
- `findFirst(...)` checks,
- then `create(...)`.

This means concurrent requests can still create duplicates unless protected by:
- database-level unique constraints,
- transaction boundaries,
- or conflict-safe create strategy.

### Impact
The system can still admit duplicate references under parallel ingestion.

### Required conclusion
Dedup is **improved**, but not yet **enforced**.

## 3.2 Duplicate checks are scoped by `deviceId`
The new duplicate queries are generally scoped to the same `deviceId`.

### Architectural consequence
This implies the same scientific reference may be duplicated across devices.
That may be acceptable only if the project explicitly chooses a **device-scoped reference model**.

### Open architectural question
Should a reference be:
- globally unique across the platform,
- unique per device,
- or globally stored and linked to multiple devices?

This decision must be made explicitly and documented in an ADR.

## 3.3 File writes occur before duplicate closure in some flows
In `discovery/ingest` and `references/upload`, the code writes files to `uploads/` before duplicate outcome is fully finalized.

### Impact
This can create:
- orphaned files,
- duplicate physical files,
- storage drift,
- harder cleanup and backup volume growth.

### Required conclusion
Dedup must happen before durable file persistence whenever possible, or cleanup must be guaranteed on conflict/failure.

## 3.4 Discovery ingest has incomplete SSRF protection
The current crawl blocking only protects against a small set of protocols and hosts such as:
- `file:`
- `ftp:`
- `localhost`
- `127.0.0.1`

### Missing protections
It does not clearly protect against:
- RFC1918 private IP ranges,
- metadata endpoints,
- loopback aliases,
- internal DNS names,
- IPv6 local addresses,
- redirect-based bypass.

### Required conclusion
This is not sufficient for a hardened ingestion endpoint.

## 3.5 Upload content hashing is semantically weak for PDFs
In `references/upload`, PDF dedup uses extracted text hash rather than binary hash.

### Problem
For scanned or weakly parsed PDFs:
- extracted text may be empty or partial,
- different files may collapse to the same weak hash,
- or the same file may hash differently after parser changes.

### Required conclusion
Binary-file hash and extracted-text hash should be separated conceptually.

## 3.6 Reference embedding semantics remain unresolved
The upload flow iterates pages, generates embeddings per page, then repeatedly calls `saveReferenceEmbedding(ref.id, emb)`.

### Architectural problem
If `saveReferenceEmbedding` writes a single vector to the `Reference` row, then multiple page embeddings overwrite each other.
This means the final stored embedding may represent only the last processed page or another accidental overwrite outcome.

### Required conclusion
Reference-level embedding strategy is still unresolved and must not remain implicit.

## 3.7 Discovery/upload ingestion still do not prove chunk-first alignment
The current flows do not demonstrate a fully aligned chunk-first semantic ingestion path.
There is still a mismatch between:
- raw file persistence,
- truncated parsed text persistence,
- reference-level embedding handling,
- and the knowledge-chunk architecture expected by the platform.

## 3.8 Taxonomy soft archive is valid but still shallow
The lifecycle update is directionally correct, but still lacks:
- dependency-aware archive rules,
- UX visibility for archivedAt,
- filter controls for active/inactive entities,
- stronger child-link safety policies,
- full lifecycle reporting.

## 3.9 Validation depth remains insufficient
The team reported successful typecheck/lint/test/build, but no evidence was supplied yet for:
- new dedicated tests for dedup logic,
- new dedicated tests for archive activation behavior,
- end-to-end duplicate scenarios,
- runtime proof of conflict handling,
- file cleanup behavior.

Therefore the code changes are not yet fully evidence-backed.

## 4. File-by-File Assessment

## 4.1 `lib/sourceIdentifiers.ts`
### Good
- Clear normalization utility.
- Meaningful DOI/PMID/arXiv extraction.
- Deterministic sourceFingerprint baseline.

### Issues
- fingerprint is simple string concatenation, not canonical URL normalization.
- URL query noise / tracking params may reduce dedup strength.
- no precedence policy documentation exists.

### Assessment
Useful baseline, but not yet canonical-grade reference identity logic.

## 4.2 `pages/api/admin/ingestion/import.ts`
### Good
- PubMed import now derives normalized identifiers.
- Duplicate checks include identifier and content layers.

### Issues
- duplicate protection is non-transactional.
- no audit event shown here.
- `status: undefined as any` indicates weak typing / non-clean write path.
- two-step write pattern (`create` then `update processingDate`) is unnecessary unless justified.

### Assessment
Good direction, but still operationally loose.

## 4.3 `pages/api/references/discovery/ingest.ts`
### Good
- Source scoring exists.
- Rate limiting, CSRF checks, and security headers are present.
- Duplicate checks are integrated.

### Issues
- SSRF protection is incomplete.
- files are written before conflict finalization.
- no cleanup on duplicate/failure.
- no ingestion log / audit log visible in the supplied code.
- HTML flow stores only partial parsed text.

### Assessment
Promising but not hardened.

## 4.4 `pages/api/references/upload.ts`
### Good
- Handles PDF upload and parsing.
- Uses normalized source identifiers.
- Includes duplicate checks.

### Issues
- duplicate checks happen after file persistence.
- PDF dedup uses extracted text hash instead of binary hash.
- per-page embeddings are written back to one reference target repeatedly.
- no chunk persistence in this path.
- no explicit file-size/type safety shown.

### Assessment
Still semantically inconsistent with the intended knowledge architecture.

## 4.5 Taxonomy mutation handlers
### Good
- archive/activate lifecycle is now operational.
- archivedAt is set and cleared correctly.
- audit hooks are present.

### Issues
- dependency-aware archive policy is weak.
- child existence / relational impact is not deeply enforced.
- manufacturer validation is incomplete in some handlers.

### Assessment
Operational baseline accepted, not final lifecycle closure.

## 4.6 Taxonomy admin UI
### Good
- activation/deactivation controls are now surfaced.
- basic operational lifecycle is visible.

### Issues
- no archivedAt visibility.
- no active/inactive filters.
- limited state richness.
- no explicit confirmation modal or dependency warning.
- operator UX remains baseline only.

## 5. Founder-Level Conclusions
1. The team implemented the requested next code layer and moved beyond documentation-only responses.
2. The current result should be recognized as **baseline progress**, not as final closure.
3. Dedup logic exists, but dedup enforcement is not yet guaranteed.
4. Taxonomy lifecycle exists, but lifecycle governance is still shallow.
5. File persistence and embedding semantics remain the most important unresolved technical correctness issues.
6. The platform still needs a clear architectural decision on reference identity scope and embedding storage strategy.

## 6. Required Next Decisions
The development team must explicitly answer and implement:
1. Is `Reference` identity global or device-scoped?
2. Is dedup guaranteed in DB, or only attempted in application code?
3. Is embedding storage reference-level, chunk-level, or hybrid?
4. What is the file-write lifecycle on duplicate/failure?
5. What is the retention policy for persisted uploaded/discovered files?

## 7. Mandatory Next-Step Deliverable
The next execution pass must produce a report file at:
`docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_B.md`

This report must document:
- design decisions taken,
- files changed,
- migration path,
- duplicate-prevention guarantees,
- embedding strategy closure,
- test evidence,
- runtime evidence,
- open risks.

## 8. Final Audit Position
Current result: **accepted as meaningful progress, but not accepted as full closure**.

Recommended status:
- source identifier handling: Implemented Baseline
- dedup enforcement: Partial / Not Yet Proven
- taxonomy lifecycle: Implemented Baseline
- ingestion correctness: Partial
- embedding correctness: Open Critical Concern
