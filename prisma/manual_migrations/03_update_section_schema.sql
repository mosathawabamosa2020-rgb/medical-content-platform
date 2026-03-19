-- migration to add status enum, referenceId relation, and Reference version

-- create enum type for section status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SectionStatus') THEN
        CREATE TYPE "SectionStatus" AS ENUM ('ingested','verified','rejected');
    END IF;
END$$;

-- add new columns to Section table
ALTER TABLE "Section" ADD COLUMN IF NOT EXISTS "referenceId" TEXT;
ALTER TABLE "Section" ADD COLUMN IF NOT EXISTS "status" "SectionStatus" NOT NULL DEFAULT 'ingested';
ALTER TABLE "Section" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- add foreign key for referenceId (idempotent for PostgreSQL)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Section_referenceId_fkey'
    ) THEN
        ALTER TABLE "Section"
            ADD CONSTRAINT "Section_referenceId_fkey"
            FOREIGN KEY ("referenceId")
            REFERENCES "Reference"(id)
            ON DELETE CASCADE;
    END IF;
END$$;

-- add fields to Reference
ALTER TABLE "Reference" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Reference" ADD COLUMN IF NOT EXISTS "processingDate" TIMESTAMP;

-- create index on referenceId
CREATE INDEX IF NOT EXISTS "Section_referenceId_idx" ON "Section" ("referenceId");
