# Development Setup

1. Copy `.env.example` to `.env`.
2. Start dependencies: `docker compose up -d postgres redis minio`.
3. Apply migrations: `npx prisma migrate deploy`.
4. Run app: `npm run dev`.

