-- AlterTable
ALTER TABLE "Reference" ADD COLUMN "embedding" vector(1536);
ALTER TABLE "KnowledgeChunk" ADD COLUMN "embedding" vector(1536);
ALTER TABLE "Section" ADD COLUMN "embedding" vector(1536);
