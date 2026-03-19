# FILE_STORAGE_ARCHITECTURE_REVIEW_2026-03-08

Date: 2026-03-09
Directive Mapping: Workstream C (Storage and File Lifecycle Architecture)

## Current State
Observed storage paths in repo:
- `uploads/` (uploaded artifacts)
- `data/incoming_pdfs/` (ingestion staging)
- DB metadata in `Reference.filePath` and `File.path`

## Lifecycle Baseline (Current)
1. Discovery/Upload: references can be created from upload/discovery APIs.
2. Temporary staging: files are kept locally in repo/runtime paths.
3. Parsing/Extraction: parsed text and sections/chunks are persisted.
4. Retention: no strict policy enforcement yet (age-based or status-based archival not automated).
5. Backup/Restore: baseline scripts now exist (`tools/ops_backup.js`, `tools/ops_restore.js`).

## Risks
- Local filesystem as long-term storage is not sustainable for multi-instance deployment.
- Backup and restore of binary files are possible but still operationally manual.
- No explicit retention lifecycle policy by reference status.

## Option Review
| Option | Sustainability | Self-hostability | Ops Simplicity | Cost Predictability | Notes |
|---|---|---|---|---|---|
| Local FS only | Low | Medium | Medium | High | Suitable for dev only. |
| MinIO (S3-compatible) | High | High | Medium | High | Preferred for open-source sustainability. |
| Cloudflare R2 | Medium-High | Low | High | Medium | Managed simplicity, external dependency. |
| Supabase Storage | Medium | Low-Medium | High | Medium | Good if broader Supabase stack is adopted. |

## Decision Direction
- Short-term: keep local FS as development baseline.
- Target direction: **MinIO-first evaluation** as official production-grade storage baseline.

## Required Next Step
Create a dedicated implementation ADR for object storage migration path, then implement storage adapter abstraction before production cutover.
