-- Enable the vector extension if it doesn't exist.
CREATE EXTENSION IF NOT EXISTS vector;

-- Add the 'embedding' column to the "Reference" table manually.
-- This runs AFTER Prisma has created the table.
ALTER TABLE "Reference" ADD COLUMN IF NOT EXISTS embedding vector(1536);
