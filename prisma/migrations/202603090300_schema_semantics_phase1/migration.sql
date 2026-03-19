-- Phase-1 schema semantics hardening (Workstream D, 2026-03-09)
ALTER TABLE "Department"
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);

ALTER TABLE "Device"
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);

ALTER TABLE "DeviceModel"
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);

ALTER TABLE "Reference"
  ADD COLUMN IF NOT EXISTS "doi" TEXT,
  ADD COLUMN IF NOT EXISTS "pmid" TEXT,
  ADD COLUMN IF NOT EXISTS "arxivId" TEXT,
  ADD COLUMN IF NOT EXISTS "sourceFingerprint" TEXT;

CREATE INDEX IF NOT EXISTS "Department_isActive_idx" ON "Department"("isActive");
CREATE INDEX IF NOT EXISTS "Device_isActive_idx" ON "Device"("isActive");
CREATE INDEX IF NOT EXISTS "DeviceModel_isActive_idx" ON "DeviceModel"("isActive");
CREATE INDEX IF NOT EXISTS "Reference_doi_idx" ON "Reference"("doi");
CREATE INDEX IF NOT EXISTS "Reference_pmid_idx" ON "Reference"("pmid");
CREATE INDEX IF NOT EXISTS "Reference_arxivId_idx" ON "Reference"("arxivId");
CREATE INDEX IF NOT EXISTS "Reference_sourceFingerprint_idx" ON "Reference"("sourceFingerprint");
