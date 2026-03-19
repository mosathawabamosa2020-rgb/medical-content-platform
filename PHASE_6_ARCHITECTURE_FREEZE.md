# PHASE_6_ARCHITECTURE_FREEZE

Date: 2026-03-05
Status: Frozen for Phase 7 entry (RFC required for structural drift)

## 1. DB Schema Freeze

Frozen entities for Phase 6 boundary:

- Knowledge core: `Reference`, `Section`, `File`, `SourceRegistry`, `VerificationLog`, `IngestionLog`
- Generation: `GeneratedContent`, `GeneratedContentReference`, `ContentDraft`, `ReelScript`

Key frozen constraints:

- `Reference.status` governed lifecycle
- `Reference.contentHash` dedup semantics
- generation observability/cost fields (`tokenUsage*`, latency, `topKUsed`, `probeUsed`, `failureCode`, `retryCount`)

No schema drift allowed without RFC.

## 2. Retrieval Path Freeze

Frozen pipeline:

1. normalize query
2. embed query (local fallback allowed)
3. vector phase (id + referenceId + similarity only)
4. hydration phase after LIMIT
5. ranking + pagination packaging
6. verified-only invariant at SQL layer

No bypass path for unverified retrieval.

## 3. Generation Path Freeze

Frozen flow:

- retrieval context acquisition
- scientific-device structured assembly
- citation trace generation
- reel/voiceover/caption creation
- image source lookup or AI prompt fallback
- persistence in generation tables

## 4. Admin Boundary Freeze

Frozen requirement:

- `/api/admin/**` role-protected
- verification action remains transactional with conflict semantics

## 5. Public Route Map Freeze

Frozen public routes:

- `/`
- `/library`
- `/search`
- `/reference/[id]`
- `/create`

Admin entry remains segregated under `/admin`.

## 6. Change Control

Any Phase 7 structural modifications to schema, retrieval contract, or governance boundaries require RFC/ACR before merge.
