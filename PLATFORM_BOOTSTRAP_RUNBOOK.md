# PLATFORM_BOOTSTRAP_RUNBOOK

Date: 2026-03-04
Status: NOT REPRODUCIBLY CERTIFIED (with current command contract)

## 1. Clean-Machine Commands Executed

Executed in order:
1. `docker compose down -v` -> PASS
2. `docker compose up -d` -> PASS
3. `npm install` -> PASS
4. `npx prisma generate` -> PASS
5. `npx dotenv -e .env.local -- npx prisma migrate deploy` -> FAIL (`P3005`, non-empty schema baseline issue)
6. `npx dotenv -e .env.local -- npm run seed:admin` -> PASS after schema setup
7. `npm run dev` -> INCONCLUSIVE in non-interactive capture (process timed out without startup banner in captured output)

## 2. Additional Required Step Found During Audit

To initialize schema from zero in current repo state, this extra step was required:
- `npx dotenv -e .env.local -- npm run db:apply`

This applies manual SQL migrations in `prisma/manual_migrations/`.

## 3. Prisma Migration Status Findings

After manual migration apply:
- `npx dotenv -e .env.local -- npx prisma migrate status` -> reports pending tracked migration `20260303_add_indexes_and_verificationlog`.
- `prisma migrate deploy` still fails baseline path due existing non-empty schema history mismatch.

## 4. Environment File Completeness

Observed:
- `.env.local.example` exists.
- `.env.example` missing.
- Runtime code references keys including:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `OPENAI_API_KEY`
  - `SERPAPI_KEY`
  - others depending on optional flows.

Result:
- PARTIAL: env template exists but canonical `.env.example` contract requested in directive is not present.

## 5. Production Build Check

- `npm run build` -> FAIL (TypeScript type mismatch in `pages/api/references/query.ts`).

## 6. Bootstrap Certification Verdict

NOT CERTIFIED

Blocking reproducibility gaps:
1. Required bootstrap path cannot complete with `prisma migrate deploy` alone.
2. Manual migration chain is mandatory but outside Prisma tracked migration history.
3. Production build does not pass.
4. Clean-start runtime launch evidence is incomplete in non-interactive capture.
