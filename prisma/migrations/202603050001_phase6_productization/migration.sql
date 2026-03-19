-- Phase 6 productization schema expansion

ALTER TABLE "Reference" ADD COLUMN IF NOT EXISTS "contentHash" TEXT;
CREATE INDEX IF NOT EXISTS "Reference_contentHash_idx" ON "Reference"("contentHash");

CREATE TABLE IF NOT EXISTS "SourceRegistry" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "baseUrl" TEXT NOT NULL,
  "lastFetchedAt" TIMESTAMP(3),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "rateLimitPolicy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SourceRegistry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SourceRegistry_name_key" ON "SourceRegistry"("name");

CREATE TABLE IF NOT EXISTS "GeneratedContent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "topic" TEXT NOT NULL,
  "tone" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "script" TEXT NOT NULL,
  "caption" TEXT NOT NULL,
  "hashtags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "voiceoverText" TEXT NOT NULL,
  "generationCostEstimate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tokenUsageInput" INTEGER NOT NULL DEFAULT 0,
  "tokenUsageOutput" INTEGER NOT NULL DEFAULT 0,
  "generationLatencyMs" INTEGER NOT NULL DEFAULT 0,
  "retrievalLatencyMs" INTEGER NOT NULL DEFAULT 0,
  "failureCode" TEXT,
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GeneratedContent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "GeneratedContent_userId_idx" ON "GeneratedContent"("userId");
CREATE INDEX IF NOT EXISTS "GeneratedContent_createdAt_idx" ON "GeneratedContent"("createdAt");

CREATE TABLE IF NOT EXISTS "GeneratedContentReference" (
  "id" TEXT NOT NULL,
  "generatedContentId" TEXT NOT NULL,
  "referenceId" TEXT NOT NULL,
  CONSTRAINT "GeneratedContentReference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GeneratedContentReference_generatedContentId_referenceId_key"
ON "GeneratedContentReference"("generatedContentId", "referenceId");
CREATE INDEX IF NOT EXISTS "GeneratedContentReference_referenceId_idx"
ON "GeneratedContentReference"("referenceId");

CREATE TABLE IF NOT EXISTS "ContentDraft" (
  "id" TEXT NOT NULL,
  "generatedContentId" TEXT NOT NULL,
  "draftJson" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentDraft_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ContentDraft_generatedContentId_idx" ON "ContentDraft"("generatedContentId");

CREATE TABLE IF NOT EXISTS "ReelScript" (
  "id" TEXT NOT NULL,
  "generatedContentId" TEXT NOT NULL,
  "durationSec" INTEGER NOT NULL,
  "scriptText" TEXT NOT NULL,
  "timestampBreakdown" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReelScript_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ReelScript_generatedContentId_idx" ON "ReelScript"("generatedContentId");

DO $$ BEGIN
  ALTER TABLE "GeneratedContent"
  ADD CONSTRAINT "GeneratedContent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "GeneratedContentReference"
  ADD CONSTRAINT "GeneratedContentReference_generatedContentId_fkey"
  FOREIGN KEY ("generatedContentId") REFERENCES "GeneratedContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "GeneratedContentReference"
  ADD CONSTRAINT "GeneratedContentReference_referenceId_fkey"
  FOREIGN KEY ("referenceId") REFERENCES "Reference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ContentDraft"
  ADD CONSTRAINT "ContentDraft_generatedContentId_fkey"
  FOREIGN KEY ("generatedContentId") REFERENCES "GeneratedContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ReelScript"
  ADD CONSTRAINT "ReelScript_generatedContentId_fkey"
  FOREIGN KEY ("generatedContentId") REFERENCES "GeneratedContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
