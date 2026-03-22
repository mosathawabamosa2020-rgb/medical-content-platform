# FULL_PRODUCT_ACTION_MATRIX

Date: 2026-03-05

| Page | Button/Action | API | Service/Logic | Prisma/DB Mutation | Response | UI Update |
|---|---|---|---|---|---|---|
| `/` | Search submit | `POST /api/references/query` | retrieval engine (`normalize -> embed -> retrieve -> rank`) | Read-only `Section` + `Reference` verified | `RetrievalQueryResponse` | disable button, loading, render cards |
| `/` | Featured card click | none | route navigation | none | n/a | route to `/reference/[id]` |
| `/` | Create Content click | none | route navigation | none | n/a | route to `/create` |
| `/library` | Pagination | `GET /api/references/library` | library query with filters | Read-only verified references | `{items,total,page,limit}` | list refresh |
| `/library` | Category filter | `GET /api/references/library?category=...` | filter builder | Read-only | paginated list | reset page + rerender |
| `/reference/[id]` | Initial load | `GET /api/references/[id]` | detail query | Read-only reference + sections | reference detail payload | render title/sections/badge |
| `/search` | Search submit | `POST /api/references/query` | retrieval engine | Read-only | ranked results + meta | loading + results |
| `/search` | Next/Prev page | `POST /api/references/query` (`page`) | retrieval pagination | Read-only | next page payload | update list/page |
| `/create` | Generate | `POST /api/content/generate` | context assembly + safety guard + generator | Insert `GeneratedContent`, `GeneratedContentReference`, `ContentDraft`, `ReelScript` | generated content payload | disable, progress, show output |
| `/create` | Save draft | `PATCH /api/content/[id]` | draft persistence | Update `GeneratedContent` | updated object | save status updated |
| `/admin/sources` | Register source | `POST /api/admin/sources` | source registry creation | Insert `SourceRegistry` | created source | list refresh |
| `/admin/verification/references/[id]` | Approve/Reject | `PATCH /api/admin/verification/[id]` | verification transaction service | update `Reference.status`, insert `VerificationLog` | `{ok:true}` or `409` | disable button, message, refresh |
| `/admin/research` | Import | `POST /api/admin/ingestion/import` | ingestion import handler | Insert `Reference` (`pending_ingestion`) | `201` or `409` | imported state + message |
| `/admin/ingestion-monitor` | Run worker | `POST /api/admin/ingestion/run-worker` | ingestion worker | update statuses, write sections/logs | `202 accepted` | monitor updates |
| `/devices/[id]/references` | Upload & index | `POST /api/references/upload` | upload parser + embedding write | Insert `Reference`, update embedding | `201` or `409` | success/error alert/message |
