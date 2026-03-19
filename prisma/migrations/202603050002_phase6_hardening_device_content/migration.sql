-- Phase 6 hardening: scientific device content persistence
ALTER TABLE "GeneratedContent"
ADD COLUMN IF NOT EXISTS "contentType" TEXT NOT NULL DEFAULT 'generic',
ADD COLUMN IF NOT EXISTS "imageSourceUrl" TEXT,
ADD COLUMN IF NOT EXISTS "imagePrompt" TEXT,
ADD COLUMN IF NOT EXISTS "topKUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "probeUsed" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "GeneratedContent_contentType_idx"
ON "GeneratedContent"("contentType");
