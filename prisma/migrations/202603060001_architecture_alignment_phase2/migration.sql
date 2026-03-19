-- Phase 2: architecture alignment for departments, models, coverage, and publishing tasks

CREATE TABLE IF NOT EXISTS "Department" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Department_name_key" ON "Department"("name");

CREATE TABLE IF NOT EXISTS "Manufacturer" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Manufacturer_name_key" ON "Manufacturer"("name");

ALTER TABLE "Device"
  ADD COLUMN IF NOT EXISTS "departmentId" TEXT,
  ADD COLUMN IF NOT EXISTS "manufacturerId" TEXT,
  ADD COLUMN IF NOT EXISTS "knowledgeScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "knowledgeComplete" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Device_departmentId_idx" ON "Device"("departmentId");
CREATE INDEX IF NOT EXISTS "Device_manufacturerId_idx" ON "Device"("manufacturerId");
CREATE INDEX IF NOT EXISTS "Device_knowledgeComplete_idx" ON "Device"("knowledgeComplete");

DO $$ BEGIN
  ALTER TABLE "Device"
  ADD CONSTRAINT "Device_departmentId_fkey"
  FOREIGN KEY ("departmentId") REFERENCES "Department"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Device"
  ADD CONSTRAINT "Device_manufacturerId_fkey"
  FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "DeviceModel" (
  "id" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "manufacturerId" TEXT,
  "modelName" TEXT NOT NULL,
  "year" INTEGER,
  "specifications" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DeviceModel_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DeviceModel_deviceId_idx" ON "DeviceModel"("deviceId");
CREATE INDEX IF NOT EXISTS "DeviceModel_manufacturerId_idx" ON "DeviceModel"("manufacturerId");
CREATE UNIQUE INDEX IF NOT EXISTS "device_model_unique_per_device" ON "DeviceModel"("deviceId", "modelName");

DO $$ BEGIN
  ALTER TABLE "DeviceModel"
  ADD CONSTRAINT "DeviceModel_deviceId_fkey"
  FOREIGN KEY ("deviceId") REFERENCES "Device"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DeviceModel"
  ADD CONSTRAINT "DeviceModel_manufacturerId_fkey"
  FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PublishingTaskStatus" AS ENUM ('pending', 'running', 'completed', 'failed', 'canceled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "PublishingTask" (
  "id" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "departmentId" TEXT,
  "taskType" TEXT NOT NULL,
  "status" "PublishingTaskStatus" NOT NULL DEFAULT 'pending',
  "scheduledDate" TIMESTAMP(3) NOT NULL,
  "generatedContentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PublishingTask_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PublishingTask_deviceId_idx" ON "PublishingTask"("deviceId");
CREATE INDEX IF NOT EXISTS "PublishingTask_departmentId_idx" ON "PublishingTask"("departmentId");
CREATE INDEX IF NOT EXISTS "PublishingTask_status_scheduledDate_idx" ON "PublishingTask"("status", "scheduledDate");

DO $$ BEGIN
  ALTER TABLE "PublishingTask"
  ADD CONSTRAINT "PublishingTask_deviceId_fkey"
  FOREIGN KEY ("deviceId") REFERENCES "Device"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "PublishingTask"
  ADD CONSTRAINT "PublishingTask_departmentId_fkey"
  FOREIGN KEY ("departmentId") REFERENCES "Department"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "PublishingTask"
  ADD CONSTRAINT "PublishingTask_generatedContentId_fkey"
  FOREIGN KEY ("generatedContentId") REFERENCES "GeneratedContent"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "ClinicalUse" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClinicalUse_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ClinicalUse_name_key" ON "ClinicalUse"("name");

CREATE TABLE IF NOT EXISTS "FailureMode" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FailureMode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FailureMode_name_key" ON "FailureMode"("name");

CREATE TABLE IF NOT EXISTS "DeviceClinicalUse" (
  "id" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "clinicalUseId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeviceClinicalUse_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DeviceClinicalUse_deviceId_clinicalUseId_key"
ON "DeviceClinicalUse"("deviceId", "clinicalUseId");
CREATE INDEX IF NOT EXISTS "DeviceClinicalUse_clinicalUseId_idx" ON "DeviceClinicalUse"("clinicalUseId");

DO $$ BEGIN
  ALTER TABLE "DeviceClinicalUse"
  ADD CONSTRAINT "DeviceClinicalUse_deviceId_fkey"
  FOREIGN KEY ("deviceId") REFERENCES "Device"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DeviceClinicalUse"
  ADD CONSTRAINT "DeviceClinicalUse_clinicalUseId_fkey"
  FOREIGN KEY ("clinicalUseId") REFERENCES "ClinicalUse"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "DeviceFailureMode" (
  "id" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "failureModeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeviceFailureMode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DeviceFailureMode_deviceId_failureModeId_key"
ON "DeviceFailureMode"("deviceId", "failureModeId");
CREATE INDEX IF NOT EXISTS "DeviceFailureMode_failureModeId_idx" ON "DeviceFailureMode"("failureModeId");

DO $$ BEGIN
  ALTER TABLE "DeviceFailureMode"
  ADD CONSTRAINT "DeviceFailureMode_deviceId_fkey"
  FOREIGN KEY ("deviceId") REFERENCES "Device"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DeviceFailureMode"
  ADD CONSTRAINT "DeviceFailureMode_failureModeId_fkey"
  FOREIGN KEY ("failureModeId") REFERENCES "FailureMode"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "DeviceOntologyEdge" (
  "id" TEXT NOT NULL,
  "fromDeviceId" TEXT NOT NULL,
  "toDeviceId" TEXT NOT NULL,
  "relationType" TEXT NOT NULL,
  "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeviceOntologyEdge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DeviceOntologyEdge_fromDeviceId_idx" ON "DeviceOntologyEdge"("fromDeviceId");
CREATE INDEX IF NOT EXISTS "DeviceOntologyEdge_toDeviceId_idx" ON "DeviceOntologyEdge"("toDeviceId");
CREATE UNIQUE INDEX IF NOT EXISTS "device_ontology_unique_edge"
ON "DeviceOntologyEdge"("fromDeviceId", "toDeviceId", "relationType");

DO $$ BEGIN
  ALTER TABLE "DeviceOntologyEdge"
  ADD CONSTRAINT "DeviceOntologyEdge_fromDeviceId_fkey"
  FOREIGN KEY ("fromDeviceId") REFERENCES "Device"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DeviceOntologyEdge"
  ADD CONSTRAINT "DeviceOntologyEdge_toDeviceId_fkey"
  FOREIGN KEY ("toDeviceId") REFERENCES "Device"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
