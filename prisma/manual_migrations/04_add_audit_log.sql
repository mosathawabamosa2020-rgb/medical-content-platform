-- migration: add Role enum and SectionAuditLog

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname IN ('Role', 'role')) THEN
        CREATE TYPE "Role" AS ENUM ('admin','reviewer','editor');
    END IF;
END$$;

-- change User.role from text to Role
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role");

-- create SectionAuditLog table
CREATE TABLE IF NOT EXISTS "SectionAuditLog" (
  id TEXT PRIMARY KEY,
  "sectionId" TEXT NOT NULL,
  "userId" TEXT,
  "previousStatus" "SectionStatus" NOT NULL,
  "newStatus" "SectionStatus" NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SectionAuditLog_section_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"(id) ON DELETE CASCADE,
  CONSTRAINT "SectionAuditLog_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "SectionAuditLog_section_idx" ON "SectionAuditLog" ("sectionId");
CREATE INDEX IF NOT EXISTS "SectionAuditLog_user_idx" ON "SectionAuditLog" ("userId");
