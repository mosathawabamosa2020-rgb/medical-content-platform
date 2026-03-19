-- manual migration to add Section table for structured profiles

CREATE TABLE IF NOT EXISTS "Section" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "deviceId" TEXT NOT NULL REFERENCES "Device"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Section_deviceId_idx" ON "Section" ("deviceId");
