# PHASE A Verification Freeze Report
Date: 2026-03-23
Commit baseline: `cf89087`

## Environment Context
```text
HOST=INGMUOSA
UTC=2026-03-23T18:04:23.0464837Z
LOCAL=2026-03-23T21:04:23.0761501+03:00
Node=v24.13.0
npm=11.6.2
Next.js=v16.1.6
```

## Required Commands Executed
1. `npm ci --force`
2. `npx prisma generate`
3. `npx prisma migrate deploy`
4. `npm run typecheck`
5. `npm run lint`
6. `npm test -- --runInBand`
7. `npm run build`
8. `npm run ops:preflight`
9. `GET /api/metrics` (first 40 lines)

## Exact Output Excerpts
### npm ci
```text
added 1080 packages, and audited 1081 packages in 9m
9 vulnerabilities (4 low, 2 moderate, 3 high)
```

### prisma generate
```text
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
✔ Generated Prisma Client (v5.22.0) to .\node_modules\@prisma\client in 6.45s
```

### prisma migrate deploy
```text
Datasource "db": PostgreSQL database "medical", schema "public" at "localhost:15432"
12 migrations found in prisma/migrations
No pending migrations to apply.
```

### typecheck
```text
> medical-content-platform@0.1.0 typecheck
> tsc --noEmit
```

### lint
```text
> medical-content-platform@0.1.0 lint
> eslint . --ext .ts,.tsx
```

### tests (runInBand)
```text
Test Suites: 46 passed, 46 total
Tests:       116 passed, 116 total
```

### build
```text
✓ Compiled successfully in 14.3s
Route (pages) generated successfully
```

### ops:preflight
```text
Startup Preflight Diagnostics
Overall: OK
[OK] environment | required=yes | required env vars are present
[OK] database | required=yes | database query succeeded
[OK] redis | required=no | redis ping succeeded
[OK] settings_store | required=yes | data\platform-settings.json writable
[OK] audit_trail | required=yes | data\audit-trail.log writable
[OK] backup_manifest | required=no | backup manifest found
```

### /api/metrics (first lines)
```text
# HELP queue_depth_pdf Number of jobs pending/active in pdf-processing queue.
# TYPE queue_depth_pdf gauge
queue_depth_pdf 0
# HELP queue_depth_embed Number of jobs pending/active in embedding-generation queue.
# TYPE queue_depth_embed gauge
queue_depth_embed 0
# HELP queue_depth_search Number of jobs pending/active in source-search queue.
# TYPE queue_depth_search gauge
queue_depth_search 0
# HELP retrieval_latency_ms_p50 Rolling retrieval latency P50 in milliseconds.
# TYPE retrieval_latency_ms_p50 gauge
retrieval_latency_ms_p50 0
# HELP retrieval_latency_ms_p95 Rolling retrieval latency P95 in milliseconds.
# TYPE retrieval_latency_ms_p95 gauge
retrieval_latency_ms_p95 0
# HELP embedding_fallback_activated_total Count of embedding fallback activations.
# TYPE embedding_fallback_activated_total counter
embedding_fallback_activated_total 0
```

## Gate Result
- Phase A status: PASS
- All required gates returned success.
- Evidence logs were captured under `artifacts/phase-a/`.

## Notes
- `npm ci` required `--force` on Windows due a transient `ENOTEMPTY` cleanup failure in `node_modules`; installation completed successfully after forcing.
