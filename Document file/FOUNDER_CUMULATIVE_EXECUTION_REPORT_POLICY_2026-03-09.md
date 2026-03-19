# FOUNDER_CUMULATIVE_EXECUTION_REPORT_POLICY_2026-03-09

Date: 2026-03-09
Status: Active
Owner: Founder / Technical Architecture Authority
Applies To: All future engineering responses and implementation passes

## 1. Policy Objective
This policy establishes a mandatory reporting standard for the development team after every founder directive, remediation order, implementation pass, or verification task.

The purpose is to stop report sprawl, reduce duplicate dated reports, simplify founder review, preserve a clean source of truth, and ensure every execution pass is auditable through one continuously updated canonical report.

## 2. Mandatory Rule
From this point forward, the development team must NOT create a new free-form implementation summary after each directive unless explicitly instructed.

Instead, after completing any founder-issued directive, the team must update one canonical cumulative report and attach evidence references inside it.

## 3. Canonical Report Path
The development team must maintain this file as the primary cumulative implementation report:

- `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`

This file becomes the official founder review artifact for all subsequent implementation passes.

## 4. Update Rule
After each new directive, the development team must:

1. Update the cumulative report.
2. Add a new dated execution entry inside the report.
3. Mark which directive is being answered.
4. Describe exactly what changed.
5. Link to evidence artifacts and raw command outputs.
6. Update current status for open, closed, partial, and blocked items.
7. Update next recommended actions.

They must NOT create many overlapping “progress” reports unless specifically requested for a special audit.

## 5. Allowed Supporting Artifacts
The team may still create supporting artifacts when needed, but these are secondary evidence only.

Examples:
- raw command output files
- route verification matrices
- migration evidence files
- live proof artifacts
- screenshots or JSON readiness snapshots

These artifacts must be referenced from the cumulative report rather than used as standalone narrative replacements.

## 6. Mandatory Report Structure
The cumulative report must contain these fixed sections and preserve them across updates:

1. Executive Summary
2. Current Directive(s) Being Executed
3. Current Overall Project Status
4. Open Critical Risks
5. Closed Items Since Last Update
6. Partial / In-Progress Items
7. Blocked Items
8. Database and Migration Status
9. Service Verification Status
10. Smart Discovery / Retrieval / Ingestion Proof Status
11. Runtime / Build / Test / Lint / Typecheck Status
12. Health / Readiness / Diagnostics / Alerting Status
13. UI / Operator Experience Status
14. Documents / Governance / Archive Status
15. Team Improvement Proposals
16. Evidence Index
17. Next Required Actions
18. Change Log by Date

## 7. Mandatory Execution Entry Format
For every new implementation pass, the team must append a new subsection in the Change Log using this structure:

### YYYY-MM-DD — Execution Pass Title
- Directive answered:
- Scope executed:
- Files changed:
- Migrations applied:
- Tests added/updated:
- Commands executed:
- Runtime verification performed:
- Evidence artifacts:
- Result summary:
- Open issues:
- Recommended next step:

## 8. Mandatory Evidence Rules
Each update must include evidence references for:
- command outputs
- migration evidence
- tests added/updated
- runtime verification where applicable
- DB/service impact

Claims such as PASS / VERIFIED / IMPLEMENTED must not appear without evidence reference.

## 9. Status Vocabulary
The report must use only the following status vocabulary:
- Not Started
- Implemented Baseline
- Implemented and Verified
- Partial
- Blocked
- Closed
- Archived
- Superseded

## 10. Report Hygiene Rules
The team must:
- use stable filenames for current-state reports
- archive dated superseded documents under `docs/archive/`
- avoid creating near-duplicate report names for the same purpose
- update `docs/00-governance/REPORTS_INDEX.md` when canonical report structure changes
- update `docs/00-governance/CURRENT_PROJECT_STATUS.md` when project status changes materially

## 11. Special Rule for Founder Directives
Every founder directive must be reflected in the cumulative report under:
- Current Directive(s) Being Executed
- Change Log by Date
- Next Required Actions

This ensures that founder review can happen by reading one canonical report rather than many scattered reports.

## 12. Special Rule for Verification Packages
If the founder requests a deep verification package, the team may create a dedicated report, but they must still:
- summarize it in the cumulative report
- link to it from the Evidence Index
- mark whether it supersedes or supplements earlier evidence

## 13. Required Additional Deliverable Going Forward
After every new directive, the team must update BOTH:

1. `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`
2. `docs/00-governance/CURRENT_PROJECT_STATUS.md` (if status changed materially)

## 14. Founder Expectation
No future response from the team should rely on short chat-style summaries alone.
Every response must reference the updated cumulative report and identify the exact sections changed.

## 15. Enforcement Rule
If the team completes implementation without updating the cumulative report, the founder review should treat the execution as incomplete from a governance standpoint, even if code changes exist.

## 16. Immediate Adoption Order
This policy is effective immediately and applies to all future work starting with the next founder directive.

The development team must create the canonical cumulative report now if it does not already exist, and backfill recent directive responses into it.
