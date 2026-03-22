Official Directive: "Medical Knowledge Engine" Project
To: Manus AI Development Team
From: Project Technical Lead
Date: February 26, 2026
Subject: Official Mandate & Roadmap for the "Medical Knowledge & Content Engine"

1. Executive Summary
This document is the official Project Charter for the "Medical Knowledge & Content Engine." It supersedes all previous directives and establishes the project's vision, principles, scope, and technical roadmap. Our goal is not merely to build an application, but to establish the first specialized Arabic scientific AI engine for transforming trusted medical device data into multi-tiered, professional content.

2. Vision & Core Principles
Vision: To create an AI platform that serves as the most trusted source in the Arab world for generating educational content about medical devices, targeting both professionals and the general public.
Prime Directive 1: Absolute Reliability. Every piece of information in our system must be directly traceable to an approved, official source (FDA, WHO, PubMed, official user manuals). There is no room for opinions, blogs, or Wikipedia.
Prime Directive 2: From Knowledge to Content. We are not just a data scraper. We are an integrated "content factory" that transforms raw data into structured knowledge, and then into ready-to-use content products (posts, video scripts).

3. Approved Technical Architecture
Following "Operation Absolute Simplification," the following architecture is mandated for maximum stability and reliability:
Frontend & API: Next.js + TypeScript.
Execution Model: In-Process, Synchronous Execution. All resource-intensive operations (e.g., scraping) will be invoked directly from API Routes as async functions. The use of separate processes (spawn) or job queues (BullMQ) is strictly forbidden at this stage.
Database: PostgreSQL + Prisma ORM.
Semantic Search: pgvector for storing and querying embeddings.
Storage: Local file storage (data/uploads) for PDFs is the current standard, with a future migration path to S3.
Logging: pino for structured logging to data/scraper.log.

4. Development Roadmap
The following phases must be executed in strict sequential order. Do not proceed to a new phase until the preceding one is successfully completed and verified.
Phase 1: Establish the "Trusted Reference Engine" (80% Complete)
Task 1.1 (Done): Build the core scraper using Playwright to target the FDA website.
Task 1.2 (Done): Implement logic for downloading PDF files and extracting raw text.
Task 1.3 (In Progress): Verification and Refinement. Ensure the current scraper functions flawlessly within the simplified architecture. Run the system, verify data is correctly persisted to the database without errors.
Task 1.4 (New): Source Expansion. After full verification of the FDA scraper, add new scraper modules to target:
  - World Health Organization (WHO).
  - PubMed (for device-related abstracts).
Phase 2: Build the "Medical Knowledge Extraction Core"
Task 2.1: Advanced Analysis and Classification. Develop a module that uses Large Language Models (LLMs) to analyze the raw text extracted from PDFs and classify it into the categories defined in the project vision (e.g., principle of operation, common failures, maintenance).
Task 2.2: Structured Persistence. Modify the schema.prisma to create new tables for storing these classified paragraphs, linking each paragraph to the device, the original source, and the page number.
Task 2.3: Embedding Generation. For each classified paragraph, generate an embedding using the OpenAI API and save it to the dedicated vector field in the database.
Phase 3: Develop the "Intelligent User Interfaces"
Task 3.1: Build the "Smart Hospital Map." Create a UI (/hospital-map) that displays major hospital departments. Clicking a department should list its associated devices and the content coverage percentage for each.
Task 3.2: Build the "Daily Content Planner." Create a UI (/planner) that automatically suggests a "Device of the Day" based on which devices have the lowest content coverage.
Task 3.3: Build the "Post Generation System." On the planner page, when a device is selected, add a "Generate Post" button. On click, this will invoke an LLM with a specialized prompt to generate four versions of a post (general, student, technical, medical) based on the extracted knowledge from Phase 2.
Task 3.4: Build the "Reels Video Prep System." Add another button, "Generate Reels Script." This will invoke an LLM to generate the complete video plan as detailed in the project vision.

5. Immediate Directives
Persist This Mandate: Create a file named PROJECT_MANDATE.md in the project root and paste this content into it.
Begin Task 1.3: Do not write any new feature code. Execute the current system (npm run build then npm run dev) and run the scraper. Provide a detailed report on the state of the database after the process completes. Is the data present? Is it clean? Are there any errors?
All future development must be in strict compliance with this charter. Any deviation requires formal approval.

Signed,
Project Technical Lead
