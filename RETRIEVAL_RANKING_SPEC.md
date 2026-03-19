# RETRIEVAL_RANKING_SPEC

Date: 2026-03-05

## 1. Similarity Metric

- Vector metric: cosine distance via pgvector operator `<=>`
- Similarity transform: `similarity = 1 - distance`

## 2. Hybrid Weighting

Current scoring in `lib/services/retrieval/rank.ts`:

- `vector_weight = 0.75`
- `keyword_weight = 0.25`
- `keyword_score = matched_query_tokens / total_query_tokens` over snippet text

Final score:

```text
score = vector_similarity * 0.75
      + keyword_score * 0.25
      + reliability_boost(0..0.1)
      + recency_boost(0.05)
```

## 3. Verified-Only Rule

Non-bypassable at SQL layer:

- Retrieval query joins `Reference` and enforces `Reference.status = 'verified'`
- Unverified references are excluded before ranking output

## 4. Query Normalization

Implemented in `lib/services/retrieval/normalize.ts`:

- lowercasing
- control-char removal
- Arabic normalization:
  - alef variants -> `Ç`
  - `ì` -> `í`
  - `É` -> `å`
  - diacritics removed
- punctuation stripping
- stopword filtering (English + Arabic compact set)
- token truncation: max 64 tokens
- final length truncation: max 1000 chars

## 5. Pagination Consistency

- Input constraints: `page >= 1`
- `topK` clamped to `MAX_TOP_K=25`
- retrieval prefetch uses page-aware window
- response returns `hasMore`

## 6. Tie-Break and Ordering

- Primary: descending final score
- Secondary: stable JS sort order by computed score sequence

## 7. Cache Key Structure

Defined helper:

```text
q=<normalizedQuery>|k=<topK>|p=<page>|d=<deviceId|all>
```

## 8. SLO Status

- Current IVFFlat configuration does not satisfy target SLO.
- HNSW evaluation performed and documented for follow-up migration decision.
