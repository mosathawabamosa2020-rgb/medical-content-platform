# FOUNDER_GROUP_E_LIVE_PROOF_AND_SOURCE_EXPANSION_DIRECTIVE_2026-03-10

Date: 2026-03-10
Status: Active
Priority: Immediate / Controlled
Audience: Development Team / Codex Team
Authority: Founder / Technical Architecture Authority

## 1. Founder Assessment After Reviewing Group D

The latest Group D pass is accepted as real and meaningful progress.
The team implemented a valid baseline for:
- shared readiness and diagnostics logic,
- startup preflight checks,
- cleaner validation artifact export,
- improved health/readiness endpoint consistency,
- operator-facing degraded/blocked signaling,
- and stronger reporting discipline through the cumulative report.

These are important improvements and should be recognized as such.

However, this does **not** mean the platform is ready for closure.
The main unresolved issue is now narrower and clearer:

> The project still lacks a complete, evidence-backed, controlled live proof of its multi-source knowledge acquisition chain.

This means the platform has improved in governance and operations, but has not yet fully proven its defining identity as a sustainable scientific medical knowledge platform that can:
- search external sources,
- retrieve references/books/documents,
- deduplicate them,
- persist them,
- trace them,
- and expose them downstream in a controlled and reviewable form.

Accordingly, the next approved execution pass is **not broad feature expansion**.
It is:

## Live Multi-Source Proof + Source Registry Expansion + Operational Confidence Closure

---

## 2. Official Position on What Is Already Achieved

### Accepted as achieved / materially advanced
- Group D startup diagnostics baseline
- Health/readiness shared logic baseline
- Clean evidence export path
- Taxonomy lifecycle baseline
- Device-scoped dedup enforcement baseline
- Discovery SSRF hardening baseline
- Cumulative reporting governance baseline

### Not yet accepted as closed
- Full live multi-source discovery proof
- Strong downstream proof from acquisition to persistence to visibility
- Retrieval/search live confidence from real samples
- Cross-page/operator alert visibility maturity
- Warning reduction and legacy-path cleanup completion

---

## 3. New Mandatory Execution Rule

For this pass, the team must not respond with a short summary only.
They must:
1. execute the required workstreams,
2. update the cumulative report,
3. generate a dedicated current-pass report,
4. and produce a real live-proof evidence artifact package.

All claims must be evidence-backed.
If something is blocked, it must be explicitly classified as:
- PASS
- PARTIAL
- BLOCKED
- FAIL

---

## 4. Mandatory Parallel Workstreams

## Workstream A — Controlled Live Multi-Source Discovery Proof (Critical)

### Objective
Prove that the platform can perform a small, controlled, real acquisition run against multiple knowledge sources and persist the outputs correctly.

### Required actions
Execute a small controlled live run using a **safe, limited sample** only.

### Minimum proof expectations
- Use at least **2 distinct source types** that are currently technically supported.
- Use at least **2–3 small queries** tied to real medical devices.
- Attempt at least one re-run to verify duplicate handling.
- Persist resulting references into the database.
- Verify downstream visibility in at least one admin/reference/library surface.

### Required evidence per source/query
For every source/query attempt document:
- source name,
- query or identifier used,
- URL used or resolved,
- whether search succeeded,
- whether a candidate was returned,
- whether ingestion succeeded,
- whether dedup triggered on repeat attempt,
- whether file persisted,
- whether DB row persisted,
- whether any ingestion log row was created,
- whether the record became visible downstream,
- final status.

### Acceptance criteria
This workstream is not closed unless an evidence-backed live proof package exists.

---

## Workstream B — Source Registry Expansion and Governance (Critical)

### Objective
Expand the platform’s planned discovery surface by formally registering additional approved/conditional sources while preserving legal, operational, and quality controls.

### New source candidates requested by founder/project owner
The team must review and classify the following sources for inclusion planning:
- `https://www.scribd.com/`
- `https://www.ai-websites1.com/`
- `https://www.emro.who.int/`
- `https://tvtc.gov.sa/`
- `https://pubrica.com/`
- `https://www.noor-book.com/`
- `https://rayatgrup.com/`
- `https://frankshospitalworkshop.com/`
- `https://bmegtu.wordpress.com/`
- `https://www.freebookcentre.net/`
- `http://ijlalhaider.pbworks.com/`
- `https://www.sciencedirect.com/`
- `https://dokumen.pub/`
- `https://www.cambridge.org/`
- `https://link.springer.com/`
- `https://www.bspublications.com/`
- `https://ar.wikipedia.org/`

### Mandatory rule
These sources must **not** be blindly enabled.
Each source must be classified into one of the following:
- Approved for direct adapter implementation
- Approved for metadata/search-only integration
- Approved only as manual-reference source
- Blocked by robots / legal / login / anti-bot restrictions
- Low-priority / low-quality / not aligned with scientific quality baseline
- Needs manual review before inclusion

### Required evaluation criteria per source
For each source evaluate and document:
1. scientific relevance,
2. expected content type (book/manual/paper/article/media/wiki/etc.),
3. access model (public/open/login/paywalled),
4. robots/crawling restrictions,
5. legal/ToS risk,
6. extraction feasibility,
7. metadata quality,
8. reliability score baseline,
9. whether adapter-based integration is justified,
10. whether it belongs in automated discovery, assisted discovery, or manual-only intake.

### Acceptance criteria
The result must not be a flat list.
It must be a governed **source expansion matrix** with clear decisions.

---

## Workstream C — Search / Adapter / Discovery Reality Mapping (High Priority)

### Objective
Separate what is already live from what is only planned or partially scaffolded in the search/discovery layer.

### Required actions
Review and classify the real current state of:
- search aggregator,
- PubMed adapter,
- FDA adapter,
- manufacturer docs adapter,
- Wikimedia adapter,
- any other adapter/service currently present,
- discovery queries generation,
- discovery search endpoint,
- discovery ingest endpoint,
- references library visibility.

### Required classification for each component
- Implemented and live-proven
- Implemented baseline only
- Present but not live-proven
- Placeholder/scaffold only
- Blocked by source restrictions
- Requires redesign

### Acceptance criteria
This must be documented with no ambiguity.

---

## Workstream D — Startup Diagnostics Maturity Upgrade (High Priority)

### Objective
Advance diagnostics from a baseline preflight into a more operationally useful startup confidence layer.

### Required actions
Improve the current preflight/alerting baseline as follows:
1. Add explicit check result classification and human-readable remediation hints.
2. Distinguish:
   - missing config,
   - unreachable dependency,
   - writable-path issue,
   - timeout,
   - optional service absence.
3. Ensure startup diagnostics are reusable by:
   - terminal command,
   - API endpoint,
   - admin status display.
4. Add at least a minimal operator-facing status summary in more than one critical admin context if justified.
5. Ensure the terminal output is concise first, detailed second.

### Acceptance criteria
Preflight must help the operator answer:
- Can I safely open the platform now?
- What exactly is missing or degraded?
- What should I fix first?

---

## Workstream E — Browser-Based Live Verification via Chromium in VS Code (Mandatory)

### Objective
Use the available Chromium tooling inside Visual Studio Code as an official runtime-verification surface, not as an optional convenience.

### Required actions
1. Use the installed Chromium integration/tooling inside VS Code to execute live browser verification after startup/preflight passes to an acceptable state.
2. Open and verify at minimum the following routes where available:
   - `/admin`
   - `/admin/dashboard`
   - `/admin/taxonomy`
   - `/admin/references`
   - `/admin/verification`
   - `/admin/settings`
   - `/devices`
   - `/library`
   - `/search`
3. For every route tested, document:
   - render success/failure,
   - visible runtime errors if any,
   - loading/empty/success/error state behavior,
   - whether data was actually loaded,
   - whether the route is operationally usable,
   - any broken UI/API contract symptom observed from browser behavior.
4. While using Chromium, inspect network/API behavior for key requests where practical and note:
   - endpoint called,
   - response outcome,
   - visible frontend impact.
5. Include browser-based verification findings in both the current-pass report and the cumulative report.

### Acceptance criteria
- Browser-based verification is explicitly executed and documented.
- The team does not rely only on unit tests, build success, or API-only reasoning for runtime claims.
- Critical operator-facing routes are proven through an actual browser session.

---

## Workstream F — PowerShell-Based Operational Verification and Evidence Capture (Mandatory)

### Objective
Adopt PowerShell inside Visual Studio Code as an official operational verification surface for command execution, service diagnostics, script-based proof, evidence capture, and startup fault explanation before browser usage.

### Required actions
1. Use PowerShell as the primary shell for:
   - startup/preflight execution,
   - Prisma commands,
   - validation gates,
   - controlled live-proof scripts,
   - artifact export,
   - service/log inspection where applicable.
2. Execute and capture outputs for at minimum:
   - `npm run ops:preflight`
   - `npm run ops:export-validation`
   - `npx prisma generate`
   - `npx prisma migrate deploy`
   - `npx prisma migrate status`
   - `npm run typecheck`
   - `npm run lint`
   - `npm test -- --runInBand`
   - `npm run build`
3. Use PowerShell to verify operational prerequisites before browser usage, including where practical:
   - file/path presence,
   - settings store state,
   - audit-trail destination state,
   - backup manifest state,
   - generated artifacts presence.
4. Ensure all PowerShell-captured evidence is exported as clean UTF-8 artifacts and linked from the cumulative report.
5. Document any PowerShell-specific blockers, quoting/escaping issues, Windows path issues, or shell-environment differences that affect reproducibility.

### Acceptance criteria
- PowerShell is explicitly used as part of the official verification workflow.
- Command/evidence capture becomes reproducible and readable.
- Operational diagnostics are not inferred; they are executed and captured.

---

## Workstream G — Tests for Live-Proof-Critical Paths (High Priority)

### Objective
Raise confidence around the most important runtime-sensitive flows.

### Required actions
Add or expand tests for:
1. discovery duplicate conflict behavior,
2. upload duplicate conflict behavior,
3. upload rollback on file-write failure,
4. import duplicate conflict behavior,
5. readiness/preflight classification behavior,
6. any source-normalization edge case introduced in this pass.

### Acceptance criteria
The new tests must cover the newly claimed safety/correctness behaviors, not only happy paths.

---

## Workstream F — Reporting and Evidence Discipline (Mandatory)

### Objective
Ensure that the next pass is reviewable through one cumulative report plus a small number of well-scoped supporting artifacts.

### Required actions
The team must update:
1. `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`
2. `docs/00-governance/CURRENT_PROJECT_STATUS.md` if the status materially changes
3. `docs/00-governance/REPORTS_INDEX.md` if new canonical files are added

The team must also create:
- `docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_E.md`
- `docs/02-validation/PLATFORM_LIVE_MULTI_SOURCE_PROOF_REPORT.md`
- machine-readable/live-proof evidence artifacts under `artifacts/`

### Mandatory note
No new free-form report sprawl is allowed.
All new evidence must be summarized in the cumulative report and linked from it.

---

## 5. Required Reports for This Pass

## Report 1 — Implementation execution report
Path:
- `docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_E.md`

It must include at minimum:
1. Executive Summary
2. Scope of This Pass
3. Founder Directive Mapping
4. Files Changed
5. Source Registry / Adapter Decisions
6. Live Proof Actions Executed
7. Browser-Based Chromium Verification Summary
8. PowerShell-Based Operational Verification Summary
9. Tests Added or Updated
10. Validation Commands Executed
11. Evidence Artifacts Produced
12. Risks / Partial / Blocked Areas
13. Recommended Next Step

## Report 2 — Live multi-source proof report
Path:
- `docs/02-validation/PLATFORM_LIVE_MULTI_SOURCE_PROOF_REPORT.md`

It must include at minimum:
1. Objective
2. Scope of Live Proof
3. Sources Attempted
4. Query Matrix
5. Search Results Observed
6. Ingestion Results Observed
7. DB Persistence Evidence
8. Dedup Re-attempt Evidence
9. Downstream Visibility Evidence
10. Blockers / Limitations
11. Final Pass Matrix by Source and Query
12. Recommended Next Step

## Report 3 — Cumulative report update
Path:
- `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`

Must be updated, not replaced.

---

## 6. Required Source Expansion Artifact

Create:
- `docs/01-architecture/SOURCE_REGISTRY_EXPANSION_REVIEW.md`

This file must classify the founder-requested sources and define which of them are:
- auto-discovery candidates,
- manual-reference candidates,
- blocked/restricted,
- low-priority,
- or future-phase only.

---

## 7. Explicit Founder Questions To Be Answered In This Pass

The next team submission must answer these questions clearly:
1. Which sources are truly live-tested in this pass?
2. Which sources are only adapter-ready or scaffolded?
3. Which founder-requested sources are legally/technically unsuitable for automatic ingestion?
4. Can the current platform discover and persist at least a small sample from multiple sources end-to-end?
5. What remains blocked in the live proof, and what exact action will unblock it?
6. Is the current startup preflight sufficient for safe operator use before opening the UI?
7. What did the PowerShell-based operational verification prove about command reproducibility, dependency state, and artifact generation before browser testing?

---

## 8. Founder-Level Remaining Phase View

After this pass, the remaining path should become much clearer.
The likely remaining phase groups after Group E are:

### Remaining Phase R1 — Live proof closure
- complete multi-source evidence
- close remaining blocked discovery/retrieval items
- verify downstream retrieval/display confidence

### Remaining Phase R2 — Operational hardening closure
- warning reduction
- broader diagnostics visibility
- upload rollback depth tests
- stronger alert history / persisted diagnostics if justified

### Remaining Phase R3 — Final architecture closure pass
- resolve remaining semantic mismatches,
- confirm source-of-truth cleanliness,
- rerun closure matrix against active REC/TASK set,
- issue final founder-grade validation position.

---

## 9. Final Instruction

Proceed immediately with Group E.
Do not open unrelated feature expansion.
The next correct move is to prove the platform’s real knowledge-acquisition behavior, govern the requested source expansion, and strengthen operator confidence before any broader next-phase claim.
