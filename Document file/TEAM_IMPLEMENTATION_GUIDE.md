# TEAM IMPLEMENTATION GUIDE

## وثيقة التنفيذ الرسمية لفريق التطوير

**Project:** Medical Devices Intelligent Scientific Knowledge Platform  
**Arabic Name:** المنصة المعرفية العلمية الذكية للأجهزة الطبية  
**Document Type:** Official Development Execution Guide  
**Status:** Approved Draft for Development Adoption  
**Version:** 1.0.0  
**Audience:** Product Owner, Solution Architect, Frontend Team, Backend Team, Data/AI Team, QA Team, DevOps/Infrastructure Team  
**Primary Workspace:** Visual Studio Code  
**Source of Truth:** This document + `development-backlog.yaml`  

---

## 1. Purpose of This Document

This file is the **official execution guide** for the development team. It converts the approved architectural vision into a structured implementation path.

The development team must use this file as the primary reference for:

- project scope understanding,
- architectural direction,
- implementation order,
- module ownership,
- acceptance criteria,
- quality gates,
- and delivery expectations.

This document is intentionally written in a **developer-friendly structured format** so it can be read directly in VS Code and used in parallel with issues, branches, pull requests, and sprint planning.

---

## 2. Document Usage Rules

The team must follow the following order of reference:

1. `TEAM_IMPLEMENTATION_GUIDE.md` → authoritative execution and architecture interpretation.
2. `development-backlog.yaml` → structured implementation backlog and task dependency map.
3. source code + migrations + ADRs → implementation-level truth after approval.

### Mandatory Rule
If implementation behavior conflicts with assumptions made by an engineer, the team must follow this document unless a newer approved version replaces it.

---

## 3. Product Mission

Build a sustainable, intelligent, scientific, medical-knowledge platform specialized in medical devices across hospital departments.

The platform is **not** a generic content website.
It is a **knowledge system** that:

- collects scientific references,
- processes and indexes them,
- verifies extracted knowledge scientifically,
- builds a trusted medical devices knowledge base,
- and generates high-quality scientific content from approved references.

---

## 4. Core Product Goals

The platform must enable the following outcomes:

1. Build a reliable scientific reference for medical devices.
2. Organize medical devices by hospital departments and models.
3. Collect and ingest books, papers, manuals, and PDFs.
4. Extract knowledge chunks from references.
5. Store semantic representations for smart retrieval.
6. Verify all scientific material before approval.
7. Generate scientific content based only on approved knowledge.
8. Support future educational and technical use cases for doctors, students, and biomedical engineers.

---

## 5. Non-Negotiable Architectural Principles

### 5.1 Sustainability First
The platform must rely on **free and open-source technologies wherever practically possible**.

### 5.2 Scientific Trustworthiness
No generated content may bypass the scientific verification workflow.

### 5.3 Traceability
Every approved knowledge item must be traceable to:

- a source reference,
- a file,
- a chunk,
- a review decision,
- and a timestamp.

### 5.4 Progressive Scalability
The first implementation must be designed for one main operator but architected for future multi-user growth.

### 5.5 Delivery Practicality
The first release must prioritize a stable and maintainable implementation over premature complexity.

---

## 6. Official Technical Direction

### 6.1 Recommended Architecture Style
Use a **Modular Monolith** in phase 1.

This means:

- one main application codebase,
- clear module separation,
- layered architecture,
- shared data model,
- internal service boundaries,
- future ability to extract modules if needed.

### 6.2 Layered Structure
The team must implement the project using the following layers:

- **Presentation Layer**: UI components and pages.
- **API Layer**: route handlers / controllers.
- **Application Layer**: use cases and orchestration.
- **Domain/Service Layer**: business services and workflows.
- **Data Access Layer**: repositories / Prisma data access.
- **Infrastructure Layer**: external integrations, storage, vectorization, OCR, logging.

### 6.3 Core Stack
- Frontend: Next.js
- Backend runtime: Node.js
- ORM: Prisma
- Database: PostgreSQL
- Vector storage: pgvector
- Containers: Docker / Docker Compose
- Optional caching: Redis
- Monitoring: Prometheus + Grafana (future-ready)
- OCR: Tesseract (when needed)
- Embeddings service: open-source model via internal Python service if required

---

## 7. Phase 1 Scope

### Included in Phase 1
- authentication foundation,
- medical departments management,
- medical devices management,
- device models management,
- references and files management,
- PDF ingestion pipeline,
- chunk extraction and indexing,
- semantic embeddings storage,
- scientific review workflow,
- knowledge base browsing,
- content generation workflow,
- image prompt generation workflow,
- publishing tasks scheduling,
- admin dashboard,
- settings foundation,
- logging and backup basics.

### Deferred to Later Phases
- full reels/video generation activation,
- public multi-user production rollout,
- advanced role matrix,
- complete offline AI operation,
- microservices decomposition,
- advanced analytics and recommendation engines.

---

## 8. Primary User Roles

### Current Phase
- Platform Owner / Main Operator

### Future-Ready Roles
- Scientific Reviewer
- Content Editor
- Biomedical Engineer
- Doctor
- Student
- Read-Only User

The team must prepare the data model and permission strategy for future roles even if phase 1 activates only the owner role operationally.

---

## 9. Functional Modules

The team must implement the following main modules:

1. Authentication Module
2. Dashboard Module
3. Medical Taxonomy Module (Departments / Devices / Models)
4. Smart Retrieval Module
5. Reference Ingestion Module
6. Knowledge Chunking & Vector Indexing Module
7. Scientific Verification Module
8. Knowledge Base Module
9. Content Generation Module
10. Image Support Module
11. Publishing Tasks Module
12. Settings & System Configuration Module
13. Audit / Logging / Monitoring Foundation

---

## 10. Domain Data Model Requirements

The database design must include, at minimum, the following entities:

- MedicalDepartments
- MedicalDevices
- DeviceModels
- References
- ReferenceFiles
- KnowledgeChunks
- Embeddings
- ReviewTasks / Verifications
- GeneratedContent
- PublishingTasks
- ContentCategories
- Tags
- DeviceTags
- ChunkTags
- KnowledgeRevisions
- Users
- Roles
- UserRoles
- Permissions (optional if needed in phase 1)
- LearningPaths
- LearningPathItems
- AuditLogs

### Mandatory Data Rules
- Foreign keys must be enforced.
- Important search paths must be indexed.
- timestamps must exist on core entities.
- soft delete should be used where deletion may affect traceability.
- every approved chunk must retain source relation.

---

## 11. Implementation Standards

### 11.1 Coding Standards
- TypeScript-first implementation.
- Strict typing is required.
- Shared types must be centralized.
- No business logic inside UI components.
- No direct database calls inside presentation components.

### 11.2 API Standards
- APIs must be version-aware or version-ready.
- Validation must exist for all inputs.
- Errors must be standardized.
- API contracts must be documented.

### 11.3 Database Standards
- Prisma migrations are mandatory.
- No manual production schema drift.
- Indexing strategy must be documented for search-heavy tables.

### 11.4 Git Standards
- Branch model: `main`, `develop`, `feature/*`, `fix/*`.
- Every major change must map to task IDs from the backlog.
- Pull requests must reference task IDs and acceptance criteria.

---

## 12. Definition of Done (Global)

A task is not considered complete unless all applicable conditions below are met:

1. Code implemented.
2. Code reviewed.
3. Linting passes.
4. Build passes.
5. Relevant tests pass.
6. Database migration added when needed.
7. Documentation updated when behavior changes.
8. Acceptance criteria explicitly satisfied.
9. No critical unresolved error introduced.
10. Traceability to task ID preserved in branch / PR / commit context.

---

## 13. Delivery Phases

### Phase 00 — Foundation & Bootstrap
Goal: establish repository, environment, containers, standards, and technical baseline.

### Phase 01 — Core Data & Taxonomy
Goal: establish departments, devices, models, and foundational schema.

### Phase 02 — References & Ingestion
Goal: ingest references, manage files, extract text, create chunks.

### Phase 03 — Semantic Layer & Retrieval
Goal: embeddings, vector search, metadata scoring, knowledge search.

### Phase 04 — Scientific Verification
Goal: review workflow, approval states, auditability.

### Phase 05 — Content Generation & Scheduling
Goal: transform approved knowledge into publishable scientific content.

### Phase 06 — Frontend Portal & Dashboard
Goal: implement the operator-facing user experience.

### Phase 07 — Quality, Security, Monitoring, Release Readiness
Goal: stabilize the platform for controlled deployment.

---

## 14. Epic Map

### EPIC-01 — Repository, Environment, and Development Foundation
**Goal:** create a sustainable and repeatable local development environment.

### EPIC-02 — Core Database Schema and Prisma Foundation
**Goal:** establish the canonical relational and vector-ready schema.

### EPIC-03 — Medical Taxonomy and Core CRUD APIs
**Goal:** manage departments, devices, and models.

### EPIC-04 — Reference Management and File Lifecycle
**Goal:** upload, store, track, and organize references and files.

### EPIC-05 — Ingestion Pipeline and Knowledge Chunking
**Goal:** parse references into structured knowledge units.

### EPIC-06 — Embeddings, Retrieval, and Source Scoring
**Goal:** enable semantic search and quality-aware retrieval.

### EPIC-07 — Scientific Verification Workflow
**Goal:** ensure approved knowledge is scientifically controlled.

### EPIC-08 — Knowledge Base Access and Device Information UI
**Goal:** expose approved knowledge clearly and safely.

### EPIC-09 — Content Generation and Publishing Tasks
**Goal:** generate scientific content from verified knowledge.

### EPIC-10 — Dashboard, Settings, and Operational Visibility
**Goal:** give the operator a unified control center.

### EPIC-11 — Quality, Security, Monitoring, and Backup
**Goal:** make the platform reliable and non-fragile.

---

## 15. Mandatory Team Tasks by Epic

This section is the executive summary. The detailed structured tasks are defined in `development-backlog.yaml`.

### EPIC-01 Mandatory Tasks
- initialize repository standards,
- prepare Docker environment,
- define environment variable strategy,
- configure linting/formatting,
- define module folder conventions,
- prepare CI build and validation pipeline.

### EPIC-02 Mandatory Tasks
- implement Prisma schema,
- create migrations,
- activate pgvector,
- define indexing strategy,
- prepare seed data for medical taxonomy baseline.

### EPIC-03 Mandatory Tasks
- departments CRUD,
- devices CRUD,
- device models CRUD,
- completion status logic,
- taxonomy validation rules.

### EPIC-04 Mandatory Tasks
- reference creation/update,
- file upload lifecycle,
- file processing state handling,
- source metadata storage,
- manual linking to devices/models.

### EPIC-05 Mandatory Tasks
- PDF text extraction,
- OCR fallback strategy,
- chunking pipeline,
- content category detection,
- page-level traceability.

### EPIC-06 Mandatory Tasks
- embeddings generation workflow,
- pgvector persistence,
- retrieval query implementation,
- full-text + vector hybrid search,
- source quality scoring.

### EPIC-07 Mandatory Tasks
- review task creation,
- review status workflow,
- reviewer notes,
- review levels,
- audit logging.

### EPIC-08 Mandatory Tasks
- knowledge base search UI,
- device detail views,
- source attribution display,
- filters and completion indicators,
- approved-only visibility rules.

### EPIC-09 Mandatory Tasks
- publishing task scheduler,
- scientific content template engine,
- generated content persistence,
- image prompt generation,
- preview and copy workflow.

### EPIC-10 Mandatory Tasks
- dashboard statistics,
- indexing status visibility,
- review queue overview,
- content task timeline,
- settings screens.

### EPIC-11 Mandatory Tasks
- global error handling,
- unit tests,
- integration tests,
- logging,
- backups,
- restore procedure,
- monitoring foundation,
- secrets handling.

---

## 16. Acceptance Principles

All acceptance criteria throughout the project must satisfy these standards:

- measurable,
- observable,
- testable,
- implementation-neutral where possible,
- traceable to business need.

No task should be accepted using vague criteria such as “works fine” or “looks okay”.

---

## 17. API and Service Expectations

The team must expose APIs for at least the following capabilities:

- auth,
- departments,
- devices,
- models,
- references,
- files,
- ingestion jobs,
- chunks,
- verifications,
- search,
- content generation,
- publishing tasks,
- dashboard metrics,
- settings.

OpenAPI/Swagger-compatible documentation is recommended and should be planned early.

---

## 18. UX Implementation Expectations

The frontend team must implement:

- a clean Arabic-first layout,
- sidebar navigation,
- dashboard cards,
- searchable and filterable tables,
- device detail tabs,
- progress indicators for knowledge completeness,
- review decision actions,
- preview-based content generation flow,
- clear status colors,
- loading states, toasts, and confirmation modals.

---

## 19. Quality and Testing Requirements

### Mandatory Test Categories
- unit tests for business logic,
- integration tests for API + DB paths,
- smoke tests for critical flows,
- migration verification,
- build verification before merge.

### Critical Flows That Must Be Tested
- device creation and linking,
- reference upload and processing,
- chunk persistence,
- review approval path,
- approved-only retrieval,
- publishing task generation,
- content save workflow.

---

## 20. Security and Reliability Requirements

The team must implement:

- secure environment variable handling,
- restricted database exposure,
- input validation,
- output sanitization when needed,
- logging without leaking secrets,
- backup schedule,
- restore test plan,
- timeouts and retries for external integrations,
- centralized error handling.

---

## 21. AI and Model Usage Rules

The AI layer is **assistive**, not authoritative.

### Mandatory Rules
- AI must not override verified references.
- Generated outputs must rely on approved knowledge.
- Offline-first AI is not a phase-1 requirement.
- Online model dependency must be replaceable where possible.
- Open-source/self-hosted options should be preferred when practical.

---

## 22. Delivery Governance

The team must maintain:

- task-to-branch traceability,
- PR templates referencing task IDs,
- migration discipline,
- ADR records for major design decisions,
- release notes for milestone deliveries.

---

## 23. What the Team Must Not Do

The team must not:

- bypass the scientific review workflow,
- treat generated content as approved knowledge,
- hard-code business logic in UI pages,
- introduce paid closed dependencies without approval,
- split into unnecessary microservices early,
- ignore source traceability,
- implement uncontrolled schema changes,
- treat phase-2 items as phase-1 blockers.

---

## 24. Required Delivery Order

The team must follow this implementation order unless an approved revision changes it:

1. foundation and environment,
2. schema and taxonomy,
3. reference/file management,
4. ingestion and chunking,
5. embeddings and retrieval,
6. verification workflow,
7. knowledge base interfaces,
8. content generation,
9. dashboard and settings,
10. testing, monitoring, backup, release hardening.

---

## 25. Handover Format for Team Execution

The development team should use the following workflow inside VS Code:

1. open `TEAM_IMPLEMENTATION_GUIDE.md`,
2. open `development-backlog.yaml`,
3. pick next task based on dependencies and priority,
4. create branch using task ID,
5. implement,
6. validate against acceptance criteria,
7. open PR referencing the task,
8. update task status.

---

## 26. Final Directive

This document is the official path for the development team.

It should be treated as:

- an architecture-aligned execution guide,
- a technical delivery contract,
- and the approved implementation baseline for phase 1.

Any change affecting scope, architecture, data model, verification flow, or AI usage must be documented and approved before implementation diverges from this guide.
