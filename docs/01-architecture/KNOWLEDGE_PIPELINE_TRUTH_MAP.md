# KNOWLEDGE_PIPELINE_TRUTH_MAP_2026-03-08

Date: 2026-03-09
Directive: FOUNDER_EXTERNAL_REVIEW_SYNTHESIS_AND_DIRECTIVE_2026-03-08

## Classification Legend
- Implemented and operational
- Implemented but partially wired
- Placeholder/scaffold only
- Blocked
- Needs redesign

## Pipeline Truth Map
| Area | Evidence | Status | Notes |
|---|---|---|---|
| Search API | `pages/api/search/pubmed.ts`, `pages/api/references/query.ts` | Implemented and operational | Query endpoints exist and tested. |
| Research API | `pages/api/research/*` | Implemented but partially wired | Baseline exists; limited orchestration depth. |
| References Discovery | `pages/api/references/discovery/*` | Implemented but partially wired | Functional discovery endpoints exist. |
| Scraper | `pages/api/admin/scraper/*`, `scripts/scrape_fda*.js` | Implemented but partially wired | Runtime warning + mixed script paths (`dist` references). |
| Ingestion | `pages/api/admin/ingestion/*`, `lib/workers/ingestionWorker.ts` | Implemented and operational | Manual trigger and worker flow exist. |
| Workers | `lib/workers/ingestionWorker.ts` | Implemented and operational | Executable from API and queue fallback. |
| Queue | `lib/queue/queues.ts` | Implemented but partially wired | BullMQ optional; inline fallback if unavailable. |
| Retrieval Service | `lib/services/retrieval/*` | Implemented and operational | Hybrid retrieval path present with timing metadata. |
| Knowledge Chunks | `KnowledgeChunk`, `Section` in `prisma/schema.prisma` | Implemented and operational | Chunk/section persistence exists. |
| Embeddings | `lib/embeddings.ts`, pgvector migrations | Implemented and operational | OpenAI + deterministic local fallback. |
| Verification | `pages/api/admin/verification/[id].ts`, admin verification pages | Implemented and operational | Decision path and review pages exist. |
| Content Generation | `pages/api/content/generate.ts`, `pages/api/content/[id].ts` | Implemented but partially wired | Core generation works; governance lineage needs deeper proof. |
| Publishing | `pages/api/admin/publishing/schedule.ts`, `PublishingTask` | Implemented but partially wired | Scheduling baseline exists; deeper runtime governance pending. |

## Summary
The backbone is real and executable, not pure scaffolding. Remaining gaps are mostly governance depth, observability, and consistency between script/runtime paths.
