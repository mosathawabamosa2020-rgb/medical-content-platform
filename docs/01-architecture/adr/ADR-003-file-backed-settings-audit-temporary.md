# ADR-003: File-Backed Settings and Audit as Transitional Baseline

- Date: 2026-03-08
- Status: Accepted (Transitional)
- Maps to: REC-005, REC-006, TASK-022, TASK-032, TASK-033, TASK-040

## Context
Settings and audit coverage were required immediately for remediation closure and governance visibility, before final operational persistence hardening.

## Decision
Adopt file-backed storage for current settings and audit baseline:
- settings in `data/platform-settings.json`
- audit trail in `data/audit-trail.log`

## Consequences
- Positive: immediate delivery with low migration overhead.
- Negative: not ideal for concurrent multi-instance deployment.
- Required follow-up: migrate settings/audit persistence to DB-backed tables in a later hardening phase.
