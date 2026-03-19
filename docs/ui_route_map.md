# UI Route Map - Phase 6

## Root Layout
```
/
├── / (Main Portal)
│   ├── /library
│   ├── /devices
│   ├── /admin
│   │   ├── /dashboard
│   │   ├── /ingestion
│   │   ├── /verification
│   │   └── /research
│   ├── /drafts
│   └── /verification-queue
```

## Route Definitions

### Main Portal (/)
- **Path**: `/`
- **Component**: `pages/index.tsx`
- **Access Control**: Public read-only, authenticated users have full access
- **Layout**: Unified portal with navigation to all sections
- **Features**:
  - Search bar (global)
  - Quick access cards to Library, Devices, Admin, Drafts
  - Recent activity feed
  - System status indicator

### Library (/library)
- **Path**: `/library`
- **Component**: `pages/library.tsx`
- **Access Control**: Authenticated users only
- **Features**:
  - Browse all references
  - Filter by status, device, source
  - View reference details
  - Download reference files

### Device Generation (/devices)
- **Path**: `/devices`
- **Component**: `pages/devices/index.tsx`
- **Access Control**: Authenticated users only
- **Features**:
  - List all devices
  - Create new device
  - View device details
  - Generate device content

### Device Details (/devices/[id])
- **Path**: `/devices/[id]`
- **Component**: `pages/devices/[id]/index.tsx`
- **Access Control**: Authenticated users only
- **Features**:
  - View device information
  - Associated references
  - Scientific sections
  - Generated content

### Admin Dashboard (/admin)
- **Path**: `/admin`
- **Component**: `pages/admin/index.tsx`
- **Access Control**: Admin role only
- **Features**:
  - System overview
  - Statistics dashboard
  - Quick actions
  - Recent activity

### Admin Ingestion (/admin/ingestion)
- **Path**: `/admin/ingestion`
- **Component**: `pages/admin/ingestion/index.tsx`
- **Access Control**: Admin role only
- **Features**:
  - Upload references
  - Monitor ingestion progress
  - View ingestion logs
  - Manage ingestion queue

### Admin Verification (/admin/verification)
- **Path**: `/admin/verification`
- **Component**: `pages/admin/verification/index.tsx`
- **Access Control**: Admin/Reviewer role only
- **Features**:
  - View pending references
  - Approve/reject references
  - Add verification comments
  - View verification history

### Admin Research (/admin/research)
- **Path**: `/admin/research`
- **Component**: `pages/admin/research.tsx`
- **Access Control**: Admin role only
- **Features**:
  - Research tools
  - Data analysis
  - Export functionality

### Content Drafts (/drafts)
- **Path**: `/drafts`
- **Component**: `pages/drafts/index.tsx`
- **Access Control**: Authenticated users only
- **Features**:
  - List all drafts
  - Create new draft
  - Edit drafts
  - Publish drafts

### Verification Queue (/verification-queue)
- **Path**: `/verification-queue`
- **Component**: `pages/verification-queue/index.tsx`
- **Access Control**: Reviewer role only
- **Features**:
  - View pending verifications
  - Process verifications
  - View verification history

## Access Control Rules

### Role-Based Access
- **Admin**: Full access to all routes
- **Reviewer**: Access to verification routes and read-only access to library/devices
- **Editor**: Access to library, devices, and drafts
- **Public**: Read-only access to main portal and library

### Route Guards
1. Authentication required for all routes except `/` and `/library`
2. Role-based access control implemented at route level
3. Automatic redirect to login if not authenticated
4. 403 error if insufficient permissions

## Navigation Structure

### Main Navigation
- Home (/)
- Library (/library)
- Devices (/devices)
- Admin (/admin) - Admin only
- Drafts (/drafts)
- Verification Queue (/verification-queue) - Reviewer only

### Secondary Navigation
- User Profile
- Settings
- Logout

## API Endpoints per Route

### Main Portal (/)
- GET /api/health
- GET /api/stats

### Library (/library)
- GET /api/references
- GET /api/references/[id]
- GET /api/references/[id]/download

### Devices (/devices)
- GET /api/devices
- POST /api/devices
- GET /api/devices/[id]
- PUT /api/devices/[id]
- DELETE /api/devices/[id]

### Admin (/admin)
- GET /api/admin/stats
- GET /api/admin/activity

### Ingestion (/admin/ingestion)
- POST /api/admin/ingestion
- GET /api/admin/ingestion/logs
- GET /api/admin/ingestion/status

### Verification (/admin/verification)
- GET /api/admin/verification/pending
- POST /api/admin/verification/approve
- POST /api/admin/verification/reject
- GET /api/admin/verification/history

### Drafts (/drafts)
- GET /api/drafts
- POST /api/drafts
- GET /api/drafts/[id]
- PUT /api/drafts/[id]
- DELETE /api/drafts/[id]

### Verification Queue (/verification-queue)
- GET /api/verification/queue
- POST /api/verification/process
- GET /api/verification/history