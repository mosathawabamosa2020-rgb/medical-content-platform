-- Group B dedup enforcement constraints (device-scoped identity policy).
CREATE UNIQUE INDEX IF NOT EXISTS "reference_device_contenthash_unique"
  ON "Reference" ("deviceId", "contentHash");

CREATE UNIQUE INDEX IF NOT EXISTS "reference_device_pmid_unique"
  ON "Reference" ("deviceId", "pmid");

CREATE UNIQUE INDEX IF NOT EXISTS "reference_device_doi_unique"
  ON "Reference" ("deviceId", "doi");

CREATE UNIQUE INDEX IF NOT EXISTS "reference_device_arxiv_unique"
  ON "Reference" ("deviceId", "arxivId");

CREATE UNIQUE INDEX IF NOT EXISTS "reference_device_fingerprint_unique"
  ON "Reference" ("deviceId", "sourceFingerprint");
