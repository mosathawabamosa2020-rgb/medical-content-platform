# ADR-001: Modular Monolith Baseline with Next.js Pages + API Routes

- Date: 2026-03-08
- Status: Accepted
- Maps to: REC-002, REC-006, TASK-001, TASK-040

## Context
The platform needs fast iteration across admin UI, APIs, and domain workflows while remediation and backlog closure are still active.

## Decision
Keep a modular monolith architecture:
- UI in Next.js pages routes.
- Backend APIs in Next.js API routes.
- Shared domain/services in `lib/*` with route handlers acting as thin orchestration layers.

## Consequences
- Positive: fast delivery, low deployment complexity, shared type/model context.
- Negative: runtime coupling between UI and API deployment unit.
- Mitigation: enforce service boundaries inside `lib/services/*` and use ADRs for future extraction points.
