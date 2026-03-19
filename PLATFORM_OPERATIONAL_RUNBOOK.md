# PLATFORM_OPERATIONAL_RUNBOOK

Date: 2026-03-05

## 1. Clean Setup

```bash
docker compose down -v
docker compose up -d
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run seed:admin
npm run build
npm start
```

If port `3000` is already occupied:

```bash
npm start -- -p 3001
```

## 2. Required Environment Variables

Minimum required:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `OPENAI_API_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Optional (feature-dependent):
- `SERPAPI_KEY`
- `GOOGLE_CSE_ID`
- `REDIS_URL`
- `SCRAPER_DELAY_MS`
- `OCR_SPACE_API_KEY`
- storage keys (`AWS_*`)

Reference template:
- `.env.example`

## 3. Required Services

- PostgreSQL (pgvector enabled)
- Redis
- Node.js + npm

Local default via Docker Compose:
- `db` on `localhost:15432`
- `redis` on `localhost:6379`

## 4. Common Failure Patterns

1. `EADDRINUSE :3000`
- Cause: existing app bound to port 3000.
- Action: stop conflicting process or run `npm start -- -p 3001`.

2. Prisma migration mismatch
- Action: ensure `.env` has correct `DATABASE_URL`, then run:
  - `npx prisma migrate status`
  - `npx prisma migrate deploy`

3. Missing admin user
- Action: run `npm run seed:admin`.

4. Retrieval request 429
- Cause: API rate limiter exceeded.
- Action: backoff/retry.

## 5. Migration Recovery

- Check state:
  - `npx prisma migrate status`
- Apply pending:
  - `npx prisma migrate deploy`
- Regenerate client:
  - `npx prisma generate`

Do not use manual SQL migration runner for normal operations.

## 6. Production Deployment Steps

1. Set production env vars.
2. Build artifacts:
   - `npm ci`
   - `npx prisma generate`
   - `npm run build`
3. Run migrations before app rollout:
   - `npx prisma migrate deploy`
4. Seed admin (one-time controlled operation).
5. Start app process manager.

## 7. Rollback Strategy

- Application rollback:
  - deploy previous app artifact.
- Database rollback:
  - restore from DB backup/snapshot (Prisma migrations are forward-only by default).
- For failed release, prioritize app rollback + DB restore point.

## 8. Vector Index Rebuild

Rebuild section ANN index:

```sql
DROP INDEX IF EXISTS section_embedding_ivfflat;
CREATE INDEX section_embedding_ivfflat
ON "Section"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
ANALYZE "Section";
```

Run during low-traffic window.
