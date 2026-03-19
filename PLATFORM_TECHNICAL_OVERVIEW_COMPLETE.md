# PLATFORM_TECHNICAL_OVERVIEW_COMPLETE

Date: 2026-03-05

## 1. Architecture Snapshot

### Knowledge Core Layer

- entities: `Reference`, `Section`, `File`, `SourceRegistry`
- lifecycle: governed state machine (`lib/referenceState.ts`)
- retrieval: normalize -> embed -> ANN retrieve -> hybrid rank -> package
- dedup: `Reference.contentHash` (SHA-256)

### Media & Content Generation Layer

- entities: `GeneratedContent`, `GeneratedContentReference`, `ContentDraft`, `ReelScript`
- scientific device mode implemented:
  - definition
  - working principle
  - components
  - advantages
  - limitations
  - use cases
- image flow:
  - attempt public-domain image (Wikimedia API)
  - fallback prompt generation stored in DB (`imagePrompt`)

### Public Experience Layer

- root: `/`
- routes: `/library`, `/search`, `/reference/[id]`, `/create`
- admin route isolated: `/admin`

## 2. Retrieval Engine Hardening Summary

- verified-only SQL enforcement
- topK hard limit (`MAX_TOP_K=25`)
- page and input validation
- probe tracking (`probeUsed`) in logs/response metadata
- hybrid vector+keyword ranking in service layer

## 3. Security & Governance

- admin auth coverage tests
- CSRF + security headers + rate limits
- dependency CVE hardening complete (prod audit clean)

## 4. Build/Test Determinism

- `npx prisma migrate deploy`: PASS
- `npm run build`: PASS (Next 16, webpack mode)
- `npm test -- --runInBand --detectOpenHandles`: PASS (29/29)

## 5. Operational Gap

- Retrieval performance SLO remains unmet under IVFFlat matrix.
- HNSW evaluation indicates meaningful improvement but still above strict p95 target.
