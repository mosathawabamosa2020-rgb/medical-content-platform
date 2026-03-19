-- Add bilingual FTS generated columns to KnowledgeChunk
-- Note: Prisma does not support GENERATED columns; raw SQL required

ALTER TABLE "KnowledgeChunk"
  ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS "fts_arabic"  tsvector
    GENERATED ALWAYS AS (to_tsvector('pg_catalog.arabic',  coalesce("content", ''))) STORED,
  ADD COLUMN IF NOT EXISTS "fts_english" tsvector
    GENERATED ALWAYS AS (to_tsvector('pg_catalog.english', coalesce("content", ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_kc_fts_ar ON "KnowledgeChunk" USING GIN("fts_arabic");
CREATE INDEX IF NOT EXISTS idx_kc_fts_en ON "KnowledgeChunk" USING GIN("fts_english");

CREATE INDEX IF NOT EXISTS idx_kc_embedding_hnsw
  ON "KnowledgeChunk" USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_ref_embedding_hnsw
  ON "Reference" USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_sec_embedding_hnsw
  ON "Section" USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
