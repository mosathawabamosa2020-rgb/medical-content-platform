# Button Action Matrix - Phase 6

## Format
UI Component | Button | API Endpoint | DB Mutation | Side Effects | Logs
------------|--------|--------------|------------|-------------|-----

## Main Portal (/)

| UI Component | Button | API Endpoint | DB Mutation | Side Effects | Logs |
|--------------|--------|--------------|------------|-------------|------|
| Search Bar | Search | GET /api/search | None | Display results | Search query logged |
| Quick Access Card - Library | Go to Library | N/A (Navigation) | None | Navigate to /library | Navigation event logged |
| Quick Access Card - Devices | Go to Devices | N/A (Navigation) | None | Navigate to /devices | Navigation event logged |
| Quick Access Card - Admin | Go to Admin | N/A (Navigation) | None | Navigate to /admin | Navigation event logged |
| Quick Access Card - Drafts | Go to Drafts | N/A (Navigation) | None | Navigate to /drafts | Navigation event logged |

## Library (/library)

| UI Component | Button | API Endpoint | DB Mutation | Side Effects | Logs |
|--------------|--------|--------------|------------|-------------|------|
| Reference List | View Details | GET /api/references/[id] | None | Navigate to reference detail | View event logged |
| Filter Panel | Apply Filters | GET /api/references?filters=... | None | Update reference list | Filter parameters logged |
| Reference Detail | Download | GET /api/references/[id]/download | None | Download file | Download event logged |
| Reference Detail | Add to Device | POST /api/references/[id]/add-to-device | Create DeviceReference | Update device references | Association logged |

## Devices (/devices)

| UI Component | Button | API Endpoint | DB Mutation | Side Effects | Logs |
|--------------|--------|--------------|------------|-------------|------|
| Device List | Create Device | POST /api/devices | Create Device | Navigate to new device | Device creation logged |
| Device List | View Device | GET /api/devices/[id] | None | Navigate to device detail | View event logged |
| Device Detail | Edit Device | PUT /api/devices/[id] | Update Device | Refresh device data | Update logged |
| Device Detail | Delete Device | DELETE /api/devices/[id] | Delete Device | Navigate to device list | Deletion logged |
| Device Detail | Generate Content | POST /api/devices/[id]/generate | Create GeneratedContent | Trigger content generation | Generation request logged |
| Device Detail | Add Reference | POST /api/devices/[id]/references | Create DeviceReference | Update device references | Association logged |

## Admin Dashboard (/admin)

| UI Component | Button | API Endpoint | DB Mutation | Side Effects | Logs |
|--------------|--------|--------------|------------|-------------|------|
| Dashboard | Refresh Stats | GET /api/admin/stats | None | Update dashboard | Refresh event logged |
| Quick Actions | Upload Reference | POST /api/admin/ingestion | Create Reference(status=pending) | Trigger ingestionWorker | Upload logged |
| Quick Actions | View Pending | GET /api/admin/verification/pending | None | Navigate to verification queue | Navigation event logged |

## Admin Ingestion (/admin/ingestion)

| UI Component | Button | API Endpoint | DB Mutation | Side Effects | Logs |
|--------------|--------|--------------|------------|-------------|------|
| Upload Form | Upload | POST /api/admin/ingestion | Create Reference(status=pending) | Trigger ingestionWorker | Upload logged |
| Ingestion Monitor | View Logs | GET /api/admin/ingestion/logs | None | Display logs | Log view event logged |
| Ingestion Monitor | Retry | POST /api/admin/ingestion/[id]/retry | Update Reference(status=processing) | Trigger ingestionWorker | Retry logged |

## Admin Verification (/admin/verification)

| UI Component | Button | API Endpoint | DB Mutation | Side Effects | Logs |
|--------------|--------|--------------|------------|-------------|------|
| Pending List | Approve | POST /api/admin/verification/approve | Update Reference(status=verified) | Create VerificationLog | Approval logged |
| Pending List | Reject | POST /api/admin/verification/reject | Update Reference(status=rejected) | Create VerificationLog | Rejection logged |
| Pending List | View Details | GET /api/references/[id] | None | Navigate to reference detail | View event logged |
| Verification Form | Submit Comment | POST /api/admin/verification/comment | Create VerificationLog | Update reference | Comment logged |

## Drafts (/drafts)

| UI Component | Button | API Endpoint | DB Mutation | Side Effects | Logs |
|--------------|--------|--------------|------------|-------------|------|
| Draft List | Create Draft | POST /api/drafts | Create ContentDraft | Navigate to draft editor | Creation logged |
| Draft List | View Draft | GET /api/drafts/[id] | None | Navigate to draft editor | View event logged |
| Draft List | Delete Draft | DELETE /api/drafts/[id] | Delete ContentDraft | Navigate to draft list | Deletion logged |
| Draft Editor | Save | PUT /api/drafts/[id] | Update ContentDraft | Refresh draft data | Save logged |
| Draft Editor | Publish | POST /api/drafts/[id]/publish | Update ContentDraft, Create GeneratedContent | Navigate to published content | Publication logged |

## Verification Queue (/verification-queue)

| UI Component | Button | API Endpoint | DB Mutation | Side Effects | Logs |
|--------------|--------|--------------|------------|-------------|------|
| Queue List | Process | POST /api/verification/process | Update Reference(status) | Create VerificationLog | Processing logged |
| Queue List | View History | GET /api/verification/history | None | Display history | History view logged |
| Verification Form | Approve | POST /api/verification/approve | Update Reference(status=verified) | Create VerificationLog | Approval logged |
| Verification Form | Reject | POST /api/verification/reject | Update Reference(status=rejected) | Create VerificationLog | Rejection logged |

## Device Content Generation

| UI Component | Button | API Endpoint | DB Mutation | Side Effects | Logs |
|--------------|--------|--------------|------------|-------------|------|
| Generation Form | Generate | POST /api/content/generate | Create GeneratedContent | Trigger RetrievalService | Generation request logged |
| Generation Form | Generate Reel | POST /api/content/generate-reel | Create ReelScript | Trigger RetrievalService | Reel generation logged |
| Generated Content | Edit | PUT /api/content/[id] | Update GeneratedContent | Refresh content | Edit logged |
| Generated Content | Delete | DELETE /api/content/[id] | Delete GeneratedContent | Navigate to content list | Deletion logged |