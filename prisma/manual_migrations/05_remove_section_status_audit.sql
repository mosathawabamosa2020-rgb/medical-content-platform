-- migration: remove section status column, SectionStatus type, and audit log table
-- Created: 2026-03-04

ALTER TABLE "Section" DROP COLUMN IF EXISTS "status";

DROP TABLE IF EXISTS "SectionAuditLog";

DROP TYPE IF EXISTS "SectionStatus";
