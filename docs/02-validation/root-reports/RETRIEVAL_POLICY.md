# RETRIEVAL_POLICY

Date: 2026-03-04
Status: Active (Phase 5 v1.0)
Scope: Semantic and keyword retrieval over verified medical references.

## 1. Non-Negotiable Governance Rules

1. Verified-only invariant:
- Retrieval must return content only from `Reference.status = verified`.
- No API parameter may disable or bypass this rule.

2. TopK hard cap:
- `topK` must be capped at `25`.
- Requests above cap are clamped, not expanded.

3. Input validation:
- `query` is required, trimmed, and must be at least 2 characters.
- `deviceId` is optional.

4. SQL safety:
- No user input may be interpolated into unsafe SQL.
- Parameterized Prisma query APIs are mandatory.

## 2. Retrieval Pipeline

Pipeline stages:
1. Query normalization
2. Embedding generation
3. Vector candidate retrieval (verified-only)
4. Hybrid ranking (vector + metadata weighting)
5. Threshold filtering
6. Result packaging
7. Structured audit logging

## 3. Ranking Policy (v1)

Primary score:
- Cosine similarity transformed from pgvector distance:
- `similarity = 1 - (embedding <=> query_embedding)`

Hybrid adjustments:
- Reliability boost:
  - `boost = clamp(sourceReliabilityScore, 0, 1) * 0.10`
- Recency boost:
  - `+0.05` when `uploadedAt` is within 180 days

Final score:
- `final = similarity + reliability_boost + recency_boost`

Threshold:
- Default minimum score = `0.35`

## 4. Fallback Behavior

Fallback is used when embedding generation fails:
- Execute keyword retrieval on verified references using case-insensitive text match.
- Apply same governance rules (verified-only, topK cap).
- Mark result source as `keyword_fallback`.

## 5. Packaging Contract

Response shape:
- `results[]` with:
  - `id`
  - `score`
  - `text`
  - `source` (`semantic` or `keyword_fallback`)
  - `reference` metadata (id, title, sourceUrl, deviceId, uploadedAt)
- `meta` with:
  - `topK`
  - `candidates`
  - `fallbackUsed`

## 6. Performance Defaults

- Default `topK = 5`
- Candidate prefetch multiplier for ranking = `3x topK`
- Vector retrieval target in normal operation:
  - P95 API latency < 300 ms (to be validated with harness)

## 7. Audit Requirement

Each retrieval request must produce a structured audit event containing:
- normalized query hash/length metadata
- requested topK and effective topK
- fallback usage
- result count
- duration

