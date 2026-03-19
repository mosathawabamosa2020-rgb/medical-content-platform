# DOCUMENT_RETENTION_AND_ARCHIVE_POLICY

Date: 2026-03-09

## Policy
1. Current active documents must use stable names (no date suffix).
2. Date-suffixed documents are historical snapshots and must live under `docs/archive/historical`.
3. If a document is replaced by a canonical stable file, it must be marked superseded and moved to `docs/archive/superseded`.
4. Every new report must include `Supersedes:` header when applicable.

## Retention Classes
- Authoritative current state: keep in `docs/00-governance`, `docs/01-architecture`, `docs/02-validation`, `docs/03-operations`, `docs/04-planning`.
- Historical evidence: keep in `docs/archive/historical`.
- Superseded duplicates: keep in `docs/archive/superseded`.

## Cleanup Rules
- No duplicate current-state docs with conflicting status statements.
- Prefer links from canonical docs instead of copying repeated summaries.
