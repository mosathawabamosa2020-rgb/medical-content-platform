-- Auto-generated full schema SQL derived from prisma/schema.prisma
-- Creates base types, tables, and indexes required by application

-- Enums
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('admin','reviewer','editor');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReferenceStatus" AS ENUM (
        'pending_ingestion','processing','processed','pending_review','verified','rejected','archived'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Users
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "password" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'editor',
  "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- Devices
CREATE TABLE IF NOT EXISTS "Device" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "description" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_device_createdby FOREIGN KEY ("createdById") REFERENCES "User"("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "unique_name_model" ON "Device" ("name","model");

-- References
CREATE TABLE IF NOT EXISTS "Reference" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "deviceId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "filePath" TEXT,
  "sourceUrl" TEXT,
  "sourceName" TEXT,
  "sourceId" TEXT,
  "sourceReliabilityScore" DOUBLE PRECISION DEFAULT 0.0,
  "parsedText" TEXT,
  "pageCount" INTEGER,
  "status" "ReferenceStatus" NOT NULL DEFAULT 'pending_ingestion',
  "uploadedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  "version" INTEGER NOT NULL DEFAULT 1,
  "processingDate" TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT fk_reference_device FOREIGN KEY ("deviceId") REFERENCES "Device"("id")
);
CREATE INDEX IF NOT EXISTS "Reference_status_idx" ON "Reference" ("status");
CREATE INDEX IF NOT EXISTS "Reference_uploadedAt_idx" ON "Reference" ("uploadedAt");

-- KnowledgeChunk (embedding column created later by vector migration)
CREATE TABLE IF NOT EXISTS "KnowledgeChunk" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "referenceId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "pageNumber" INTEGER NOT NULL,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_kc_reference FOREIGN KEY ("referenceId") REFERENCES "Reference"("id") ON DELETE CASCADE
);

-- VerificationLog
CREATE TABLE IF NOT EXISTS "VerificationLog" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "referenceId" TEXT NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "decision" TEXT NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_vl_reference FOREIGN KEY ("referenceId") REFERENCES "Reference"("id") ON DELETE CASCADE,
  CONSTRAINT fk_vl_reviewer FOREIGN KEY ("reviewerId") REFERENCES "User"("id")
);
CREATE INDEX IF NOT EXISTS "VerificationLog_referenceId_idx" ON "VerificationLog" ("referenceId");
CREATE INDEX IF NOT EXISTS "VerificationLog_reviewerId_idx" ON "VerificationLog" ("reviewerId");

-- PlannerSuggestion
CREATE TABLE IF NOT EXISTS "PlannerSuggestion" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "deviceId" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "referenceId" TEXT,
  "page" INTEGER,
  "snippet" TEXT,
  "score" DOUBLE PRECISION,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_planner_device FOREIGN KEY ("deviceId") REFERENCES "Device"("id")
);

-- Section
CREATE TABLE IF NOT EXISTS "Section" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "deviceId" TEXT NOT NULL,
  "referenceId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_section_device FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE,
  CONSTRAINT fk_section_reference FOREIGN KEY ("referenceId") REFERENCES "Reference"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "Section_deviceId_idx" ON "Section" ("deviceId");

-- IngestionLog
CREATE TABLE IF NOT EXISTS "IngestionLog" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "referenceId" TEXT,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_inglog_reference FOREIGN KEY ("referenceId") REFERENCES "Reference"("id")
);

-- Ensure search path / extensions are available later (vector handled in 01_add_vector_support.sql)

-- End of schema
