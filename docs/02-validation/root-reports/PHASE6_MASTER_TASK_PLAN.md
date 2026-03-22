# PHASE6_MASTER_TASK_PLAN

Date: 2026-03-05
Status: Final Revision for Execution Approval
Execution Mode: Planning Only (No implementation started)

## 1) Mandatory Platform Architectural Model

### 1.1 Knowledge Core Layer (Isolated)

Scope:
- `Reference`
- `Section`
- `File`
- `SourceRegistry` (new)
- Embeddings
- Lifecycle state machine
- Retrieval engine
- Audit trail

Responsibilities:
- Deterministic ingestion
- Verified-only enforcement
- Vector similarity search
- Source deduplication
- Governance event logging

Boundary rule:
- No media-generation logic in this layer.

### 1.2 Media & Content Generation Layer (Isolated)

Scope:
- `GeneratedContent` (new)
- `GeneratedContentReference` (new join table)
- `ContentDraft` (new)
- `ReelScript` (new)
- Voiceover output
- Caption/hashtag generation
- Safety & abuse guard sub-layer (mandatory)

Responsibilities:
- Consume verified knowledge only
- Assemble context via retrieval outputs
- Produce structured content objects
- Persist generated outputs
- Track generation cost and token metadata

Boundary rule:
- No direct mutation to `Reference`/`Section` from this layer.

### 1.3 Public Experience Layer

Routes:
- `/`
- `/library`
- `/reference/[id]`
- `/search`
- `/create`

Responsibilities:
- Unified public entry point
- Search-first UX
- Read/create/admin separation
- Role-aware admin access link only

Boundary rule:
- No public ingestion/scraper controls.

## 2) Main Portal Definition (`/`)

Required:
- Global search (primary)
- Featured verified references
- Recently verified references
- `Create Content` entry
- Role-based `Admin Access`
- No ingestion controls

Wireframe logic:

```text
[Top Nav]
- Logo
- Global Search Input
- Create Content
- Admin Access (admin-only)

[Hero]
- Search-first prompt
- Primary CTA: Search

[Featured Verified]
- 6 reference cards (title/source/badge/open)

[Recently Verified]
- chronological verified list

[Footer]
- public links
```

## 3) Explicit UI Action Definitions (Non-Generic)

### 3.1 `/`

Action: Search submit
- API: `POST /api/references/query`
- Service: retrieval orchestrator
- DB: read `Section`+`Reference` (verified-only)
- Response: typed retrieval payload
- UI: validate input, disable button, loading, render results/empty/error

Action: Featured card click
- API: none (prefetched data already loaded)
- Service: none at click
- DB: none at click
- Response: route transition
- UI: navigate `/reference/[id]`

Action: Create Content click
- API: none
- Service: none
- DB: none
- Response: route transition
- UI: navigate `/create`

Action: Admin Access click
- API: session check
- Service: auth session resolver
- DB: read user/session
- Response: allowed/forbidden
- UI: navigate admin or show unauthorized

### 3.2 `/library`

Action: page change
- API: `GET /api/references/library?page&limit&filters`
- Service: library query service
- DB: read verified references only
- Response: paginated list
- UI: loading state -> list update

Action: filter change
- API: same route with filter params
- Service: filter builder
- DB: filtered read query
- Response: filtered page
- UI: reset page index + rerender

### 3.3 `/reference/[id]`

Action: load detail
- API: `GET /api/references/[id]`
- Service: detail fetch service
- DB: read reference + sections (verified)
- Response: typed detail contract
- UI: loading -> detail render with verification badge

### 3.4 `/search`

Action: query submit
- API: `POST /api/references/query`
- Service: normalize -> embed -> retrieve -> rank -> package
- DB: verified-only vector/keyword read query
- Response: structured ranked results
- UI: disabled submit + loader + paginated results

Action: paginate
- API: `POST /api/references/query` with cursor/page payload
- Service: deterministic pagination resolver
- DB: bounded read query
- Response: next slice
- UI: stable page transition without duplicates

### 3.5 `/create`

Action: generate content
- API: `POST /api/content/generate`
- Service: context assembly + safety guard + generation orchestrator
- DB: read verified context, write generated artifacts
- Response: `{content, script, caption, hashtags, voiceover, costMeta}`
- UI: disable generate button, show progress, show output panels

Action: save draft edits
- API: `PATCH /api/content/[id]`
- Service: draft persistence service
- DB: update `ContentDraft`/`GeneratedContent`
- Response: updated object
- UI: optimistic save + status banner

### 3.6 `/admin/*`

Action: verify/reject reference
- API: `PATCH /api/admin/reference/[id]`
- Service: verification transaction service
- DB: status transition + `VerificationLog` + `AuditLog`
- Response: updated reference
- UI: disable action controls, handle 409/500, refresh

## 4) RETRIEVAL_RANKING_STRATEGY

### 4.1 Similarity metric
- Primary vector metric: cosine similarity (`vector_cosine_ops`).

### 4.2 Hybrid weighting
- Vector score weight: 75%
- Keyword score weight: 25%

### 4.3 Boosting rules
- Verified boost: not required as hard filter already enforces verified-only.
- Freshness factor: +0.05 normalized boost for recently verified records (policy window configurable, default 180 days).

### 4.4 Tie-break strategy
1. Higher final score
2. More recent verification timestamp
3. Stable deterministic key (`referenceId`, then `sectionId` ascending)

### 4.5 Pagination consistency guarantee
- Deterministic cursor includes: normalized query hash + filters + score + tie-break keys.
- Guarantee: no duplicate/missing rows across page boundaries for unchanged index state.

## 5) Query Normalization Specification

Rules:
- Case normalization: lowercase for Latin scripts.
- Arabic normalization:
  - remove diacritics (tashkeel)
  - normalize alef forms to bare alef
  - normalize ta marbuta/yaa variants by configured mapping
- Stopword policy:
  - conservative stopword removal only for keyword side; no stopword removal for embedding text by default.
- Token truncation limit:
  - max 512 tokens for embedding input pre-pass.
- Embedding input sanitization:
  - trim/control-char cleanup
  - collapse whitespace
  - remove non-text binary fragments
- Cache key structure:
  - `retrieval:v1:{queryHash}:{filtersHash}:{topK}:{pageCursor}`

Example transformation:
- Input: `"  ÃÝÖáõ ÃÌåÒÉö ÞíÇÓö ÇáÓßÑ¿  "`
- Normalized keyword form: `"ÇÝÖá ÇÌåÒÉ ÞíÇÓ ÇáÓßÑ"`
- Embedding form: cleaned + whitespace-collapsed original-language text (without control chars)

## 6) GENERATION_CONTEXT_ASSEMBLY_SPEC

Rules:
- Max sections selected: 12
- Cross-reference diversity: minimum 3 unique references if available
- Same-reference clustering cap: max 4 sections from one reference
- Ordering before prompt injection:
  1. score desc
  2. diversity pass
  3. chronology tiebreak
- Context truncation logic:
  - hard cap 14,000 characters or token cap threshold (whichever first)
- Safety trimming:
  - remove policy-sensitive/unsafe fragments before prompt build

## 7) Safety & Abuse Guard Sub-Layer (Media Layer)

Controls:
- Profanity rejection/soft-block policy
- Policy-sensitive topic handling (deny/restrict workflows)
- Reference misuse prevention (must cite verified sources only)
- Prompt injection defense:
  - strip instruction-like content from retrieved context
  - enforce fixed system policy templates
- Max output length:
  - caption/script/voiceover hard caps
- Rate-limit escalation:
  - warning -> throttle -> temporary block for repeated abuse

## 8) Observability for Retrieval & Generation

Required telemetry fields:
- `generationLatencyMs`
- `retrievalLatencyMs`
- `tokenUsageInput`
- `tokenUsageOutput`
- `failureCode`
- `retryCount`

Persistence strategy:
- structured logs for high-volume events
- DB persistence for audit-critical generation events and failures
- correlation ID propagated across API -> service -> DB logs

## 9) Data Model Additions (Explicit)

### 9.1 `SourceRegistry`
- `id`
- `name`
- `baseUrl`
- `lastFetchedAt`
- `active`
- `rateLimitPolicy`
- `createdAt`
- `updatedAt`

### 9.2 `GeneratedContent`
- `id`
- `userId`
- `topic`
- `tone`
- `platform`
- `script`
- `caption`
- `hashtags`
- `voiceoverText`
- `generationCostEstimate`
- `createdAt`
- `updatedAt`

### 9.3 `GeneratedContentReference` (Join table; replaces `referenceIds: String[]`)
- `id`
- `generatedContentId`
- `referenceId`

Justification:
- Referential integrity and FK enforcement
- Queryability for provenance and audits
- Prevents orphan IDs and array-integrity drift

### 9.4 `ContentDraft`
- `id`
- `generatedContentId`
- `draftJson`
- `version`
- `createdAt`

### 9.5 `ReelScript`
- `id`
- `generatedContentId`
- `durationSec`
- `scriptText`
- `timestampBreakdown`
- `createdAt`

## 10) contentHash Specification

- Algorithm: SHA-256 (mandatory)
- Hash scope: full normalized extracted content (post-cleaning, pre-embedding)
- Collision handling:
  - on hash match, compare secondary signals (source URL, size, sampled text segments)
- False-positive mitigation:
  - if hash equal but structural metadata conflicts, mark as `dedup_review_required` instead of hard reject

## 11) Scalability Projection

Future projection target:
- 500k sections
- 50 concurrent users

Index strategy note:
- Phase 6 baseline: IVFFlat
- Projection assessment: evaluate HNSW migration path if IVFFlat misses p95/p99 targets at 500k/50 concurrency

## 12) End-to-End Data Flow Diagram (Textual)

```text
Ingestion
  -> Verification
    -> Embedding
      -> Retrieval
        -> Context Assembly
          -> Generation
            -> Persistence
              -> Display (Public/Admin/Create)
```

Expanded trace:
1. Source ingestion creates `Reference/File/SourceRegistry` records
2. Verification transitions reference to verified/rejected with logs
3. Embedding pipeline populates section vectors
4. Retrieval queries verified vectors and ranks results
5. Context assembly selects/diversifies/truncates safe context
6. Generation produces content artifacts
7. Persistence writes generated entities + provenance links
8. UI displays results in `/search` and outputs in `/create`

## 13) Migration Plan (Pre-Coding)

1. Add new models and join table in Prisma schema
2. Add `Reference.contentHash` + index
3. Create tracked migration(s) with FK/index constraints
4. Backfill `contentHash` async job with idempotent batches
5. Deploy order:
   - migrate deploy -> generate client -> backfill -> enable strict dedup
6. Rollback:
   - app rollback first, DB rollback via snapshot strategy

## 14) Cost Governance

Hard limits:
- Max retrieval context: 12 sections OR 14,000 chars
- Max generation tokens/request: 3,000
- Max `/create` generation calls/user: 20/hour
- Max retrieval calls/user: 120/hour
- Max references selected per generation: 5

Policy behavior:
- reject over-limit requests with explicit error codes
- persist cost estimate + token metadata
- cache placeholder:
  - TTL 5m for retrieval responses
  - key by normalized query+filters+topK+cursor

## 15) Retrieval SLO Formalization

Production SLO:
- p50 < 150ms
- p95 < 400ms
- p99 < 700ms

Assumptions:
- dataset >= 100k sections (Phase 6), projection to 500k
- concurrency baseline 20 (Phase 6), projection 50
- pgvector enabled with tuned DB memory and pool settings

## 16) Ordered Execution Plan, Dependencies, Effort

### Phase A — Foundation + Scale (8 days)
1. Schema/migration design finalization (2.0d)
2. Migration implementation + backfill safety plan (2.5d)
3. Retrieval scaling and SLO benchmark certification (3.5d)

### Phase B — Public Experience (5 days)
4. Build `/` portal (1.5d)
5. Build `/library`, `/reference/[id]`, `/search` (3.5d)

### Phase C — Content Generation (7 days)
6. Build `/create` UX + contracts (2.5d)
7. Implement generation orchestration + persistence (3.0d)
8. Reel/voiceover formatting and controls (1.5d)

### Phase D — Admin Reorg + Governance Outputs (4 days)
9. Reorganize `/admin/*` and enforce auth/trace links (1.5d)
10. Produce action matrix + completion report + leadership test guide (2.5d)

### Phase E — Stabilization Buffer (2 days)
11. Cross-layer integration stabilization, regression fixes, doc finalization

Total envelope: 24 engineering days

## 17) Risk Classification

Critical:
- Retrieval SLO miss
- Migration/data-integrity regressions
- Security bypass in public/create/admin boundaries

High:
- Contract drift UI/API/service
- Generation cost overrun
- Dedup false positive/negative behavior

Medium:
- Pagination consistency regressions
- Admin navigation/role visibility regressions

## 18) Approval Gate

Execution begins only after explicit approval of this revised plan.
No implementation has started in this step.
