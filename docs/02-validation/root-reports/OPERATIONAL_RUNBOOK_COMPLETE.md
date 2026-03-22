# OPERATIONAL_RUNBOOK_COMPLETE

Date: 2026-03-05

## 1. Clean Startup

```bash
docker-compose down -v
docker-compose up -d
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed:admin
npm run build
npm start
```

## 2. Required Environment Variables

From `.env.example`:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `OPENAI_API_KEY` (or configured embedding fallback path)

## 3. Retrieval Validation Commands

```bash
node tools/retrieval_hardening_suite.js
npm run test -- --runInBand --detectOpenHandles
```

## 4. Database/Vector Maintenance

IVFFlat rebuild:

```sql
DROP INDEX IF EXISTS section_embedding_ivfflat;
SET maintenance_work_mem = '256MB';
CREATE INDEX section_embedding_ivfflat
ON "Section" USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 500);
ANALYZE "Section";
```

HNSW evaluation index:

```sql
CREATE INDEX IF NOT EXISTS section_embedding_hnsw
ON "Section" USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
ANALYZE "Section";
```

## 5. Common Failure Patterns

- `maintenance_work_mem` too low when creating high-list IVFFlat index.
- Prisma pool timeouts under high concurrency when using transaction-per-request tuning.
- Dynamic require warnings during build from legacy scraper/content endpoints.

## 6. Recovery Steps

- Rebuild index with higher `maintenance_work_mem`.
- Verify migration parity: `npx prisma migrate status`.
- Restart app processes if SWC lock errors appear before dependency install.

## 7. Rollback Strategy

- Revert to previous known commit hash.
- Reapply migrations up to approved baseline.
- restore previous package-lock and rerun build/test gates.
