# ADR-007: BullMQ + Redis for Async Processing

## Status
Accepted

## Context
Ingestion, embedding, and discovery workflows are long-running and should not block API request cycles.

## Decision
Use BullMQ with Redis for asynchronous workloads, with worker processes isolated from API handlers.

## Consequences
- Better API responsiveness and reliability.
- Requires Redis availability and worker lifecycle management.
- Job retries and observability become first-class operational requirements.
