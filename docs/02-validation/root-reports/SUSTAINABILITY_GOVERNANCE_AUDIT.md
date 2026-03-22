# SUSTAINABILITY_GOVERNANCE_AUDIT

Date: 2026-03-05

## Policy Objective

Validate baseline operation under free/open stack constraints.

## Findings

### 1. No paid API required for baseline functionality

Status: PASS

- Retrieval can run with deterministic local embeddings (`EMBEDDING_BACKEND=local` or missing `OPENAI_API_KEY`).
- Content generation layer has deterministic template generation and does not require paid LLM APIs.

### 2. Embedding fallback exists

Status: PASS

- Implemented in `lib/embeddings.ts`:
  - local deterministic 1536-d embedding fallback
  - auto-enabled when API key is missing or backend set to local

### 3. Generation fallback template exists

Status: PASS

- `lib/services/contentGeneration.ts` provides rule-based structured output pipeline for scientific device content.

### 4. No mandatory external SaaS dependency

Status: PASS

- Core stack runs locally with:
  - Next.js
  - PostgreSQL + pgvector
  - Prisma
  - local deterministic embedding fallback

### 5. pgvector only

Status: PASS

- Vector storage/indexing implemented on PostgreSQL pgvector (`ivfflat`/`hnsw` indices).
- No external vector DB dependency required.

### 6. Hidden cloud lock-in

Status: PASS

- No mandatory proprietary managed service is required for baseline retrieval/generation lifecycle.

## Sustainability Conclusion

Platform baseline remains compatible with free-tier and open-source operational policy.
