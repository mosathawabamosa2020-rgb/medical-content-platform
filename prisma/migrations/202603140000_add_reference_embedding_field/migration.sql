-- AlterTable
ALTER TABLE "Reference" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);
ALTER TABLE "KnowledgeChunk" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);
ALTER TABLE "Section" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);
