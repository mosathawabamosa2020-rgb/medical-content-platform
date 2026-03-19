# SCHEMA_SEMANTICS_REVIEW_2026-03-08

Date: 2026-03-09
Directive Mapping: Workstream E (Schema and Data Semantics Review)

## Core Model Assessment
- `Device` is effectively the central entity and is correctly linked to references, sections, publishing, and taxonomy relations.
- `Reference`, `Section`, `KnowledgeChunk`, and `VerificationLog` provide a usable knowledge lifecycle baseline.

## Findings

### 1) Taxonomy activation semantics
- `Department` currently has no explicit activation/deactivation/archive fields.
- `DeviceModel` currently has no explicit activation/deactivation/archive fields.
- Impact: API/UI can delete/update but cannot express lifecycle governance cleanly.

### 2) Source identifier semantics
- `Reference` has `sourceName` and `sourceId`, but no normalized dedicated identifier columns for DOI/PMID/arXiv.
- Impact: deduplication and deterministic source integrity remain heuristic.

### 3) `parsedText` vs chunk/section truth source
- `Reference.parsedText` co-exists with `Section` and `KnowledgeChunk`.
- Current status: useful as extraction artifact/debug fallback, but not formally documented as transient or canonical.

### 4) Planner semantics depth
- `PlannerSuggestion` lacks strongly governed provenance fields (`reason`, `confidence`, `sourceChunkId`).
- Impact: weak explainability for planner-generated recommendations.

## Controlled Change Recommendations (No Rash Refactor)
1. Add lifecycle fields for taxonomy entities (`isActive`, optional `archivedAt`) in phased migrations.
2. Add normalized optional source columns in `Reference` (`doi`, `pmid`, `arxivId`) with targeted unique/index strategy.
3. Keep `parsedText` as transitional extraction artifact and formalize retention policy in ADR/docs.
4. Expand `PlannerSuggestion` with explainability metadata in a focused migration.

## Status
Schema is serviceable and production-progressive, but semantics hardening is still required for governance-grade maturity.
