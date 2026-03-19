# New Database Schema Report
Date: 2026-03-06

## Authoritative Files
- Prisma schema: `prisma/schema.prisma`
- Migration: `prisma/migrations/202603060001_architecture_alignment_phase2/migration.sql`

## Added Core Entities
- `Department`
  - `id`, `name`, `description`, `createdAt`, `updatedAt`
- `Manufacturer`
  - `id`, `name`, `description`, `createdAt`, `updatedAt`
- `DeviceModel`
  - `id`, `deviceId`, `manufacturerId`, `modelName`, `year`, `specifications`, timestamps
- `PublishingTask`
  - `id`, `deviceId`, `departmentId`, `taskType`, `status`, `scheduledDate`, `generatedContentId`, timestamps

## Added Device Fields
- `departmentId`
- `manufacturerId`
- `knowledgeScore`
- `knowledgeComplete`

## Added Ontology Layer Entities
- `ClinicalUse`
- `FailureMode`
- `DeviceClinicalUse` (join)
- `DeviceFailureMode` (join)
- `DeviceOntologyEdge` (graph edge)

## Added Enum
- `PublishingTaskStatus`
  - `pending`, `running`, `completed`, `failed`, `canceled`

## Indexing/Relations Added
- Device indexes on `departmentId`, `manufacturerId`, `knowledgeComplete`
- DeviceModel indexes + unique on (`deviceId`, `modelName`)
- PublishingTask indexes on `deviceId`, `departmentId`, (`status`, `scheduledDate`)
- Ontology join indexes and unique edge constraint
