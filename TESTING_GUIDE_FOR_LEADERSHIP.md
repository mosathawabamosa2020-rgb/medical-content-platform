# TESTING_GUIDE_FOR_LEADERSHIP

Date: 2026-03-05

## 1. Login

1. Open `/api/auth/signin` or app login page.
2. Authenticate with seeded admin credentials (`npm run seed:admin`).
3. Confirm admin navigation appears.

Expected: session created, admin pages accessible.

## 2. Upload + Ingestion

1. Go to `/admin/ingestion`.
2. Upload a file/reference source.
3. Trigger worker run.

Expected:

- reference created
- lifecycle transitions through governed states
- ingestion logs visible

## 3. Verification

1. Open `/admin/verification/references`.
2. Select pending reference.
3. click `Verify` or `Reject`.

Expected:

- button disabled while submitting
- success message on 200
- conflict message on 409
- status and logs updated

## 4. Search

1. Open `/search`.
2. Submit a valid query.

Expected:

- request to `/api/references/query`
- verified-only results
- paginated/structured output

## 5. Scientific Device Content Generation

1. Open `/create`.
2. Enter device topic.
3. Select `Scientific Device Post`.
4. Optionally enable reel.
5. Click `Generate`.

Expected:

- structured scientific sections in script
- caption + hashtags + voiceover
- image source URL or stored AI image prompt fallback
- reel breakdown timestamps when enabled

## 6. Save Draft

1. Edit script/caption/voiceover.
2. Click `Save Draft`.

Expected:

- `PATCH /api/content/[id]`
- persisted update and refreshed UI state

## 7. Known Limits

- retrieval latency under required SLO is not yet achieved under current IVFFlat path.
- build emits warnings for legacy dynamic requires in two API files.
