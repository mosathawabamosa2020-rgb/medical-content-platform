# ADR-008: Storage Adapter Canonical Import Path

- Status: Accepted
- Date: 2026-03-23

## Context

The codebase contained two import targets for the same storage implementation:

- `lib/storage/storage.adapter.ts`
- `lib/storage/storageAdapter.ts`

This duplicate path pattern increased drift risk because future edits could touch one file while callers still imported the other.

## Decision

Use `lib/storage/storage.adapter.ts` as the single canonical implementation and import path.

Remove `lib/storage/storageAdapter.ts` after import migration.

## Consequences

- Code search and onboarding become simpler.
- Drift risk between adapter aliases is eliminated.
- Existing imports had to be migrated once.
