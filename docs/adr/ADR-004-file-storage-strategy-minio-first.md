# ADR-004: File Storage Strategy - MinIO-First Evaluation

- Date: 2026-03-09
- Status: Accepted (Evaluation Direction)
- Maps to: Workstream C, TASK-036, TASK-040

## Context
The platform currently uses local filesystem paths (`uploads/`, `data/incoming_pdfs/`) for file lifecycle stages. This is workable for development but not a stable long-term production storage model.

## Decision
Adopt a MinIO-first evaluation path for production-grade object storage, while keeping local filesystem as the current development baseline.

## Considered Options
- Local filesystem only
- MinIO (S3-compatible, self-hosted)
- Cloudflare R2
- Supabase Storage

## Rationale
- MinIO aligns with open-source sustainability and self-hostability goals.
- It preserves S3-compatible APIs and enables future managed backend swaps with lower migration friction.

## Consequences
- Short-term: keep existing local storage behavior; no immediate breaking refactor.
- Mid-term: introduce a storage adapter boundary and move file lifecycle operations behind it.
- Long-term: choose deployment target (self-hosted MinIO or managed object storage) based on ops constraints.
