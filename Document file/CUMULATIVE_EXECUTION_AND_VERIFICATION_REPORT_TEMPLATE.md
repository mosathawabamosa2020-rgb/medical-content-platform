# CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT_TEMPLATE

Canonical Path:
- `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`

Use this template as the permanent cumulative report. Do not create a new report for every pass unless explicitly instructed. Update this document after every founder directive.

---

# CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT

Last Updated: YYYY-MM-DD
Status: Active
Owner: Development Team
Review Authority: Founder / Technical Architecture Authority

## 1. Executive Summary
- Brief current status of the platform.
- Most important progress since the last update.
- Most important open blockers.

## 2. Current Directive(s) Being Executed
- Directive file(s):
- Scope of current execution:
- Expected closure conditions:

## 3. Current Overall Project Status
- REC/TASK status summary
- Current maturity classification
- Current phase statement

## 4. Open Critical Risks
- Risk 1
- Risk 2
- Risk 3

## 5. Closed Items Since Last Update
- Item
- Evidence
- Impact

## 6. Partial / In-Progress Items
- Item
- Current status
- What remains

## 7. Blocked Items
- Item
- Why blocked
- What is needed to unblock it

## 8. Database and Migration Status
- Current schema state
- Migrations applied
- Prisma generate status
- Prisma migrate status
- Any known DB/schema mismatches

## 9. Service Verification Status
For each service area include:
- Service name
- Endpoints/files involved
- DB impact
- Verification mode (code/test/runtime)
- Status

Suggested service areas:
- taxonomy
- references/import
- upload
- discovery/ingestion
- retrieval/search
- verification
- content generation
- publishing
- settings
- health/readiness

## 10. Smart Discovery / Retrieval / Ingestion Proof Status
- Sources tested
- Retrieval/discovery behavior observed
- What was stored in DB
- What passed
- What is still partial/blocked
- Evidence references

## 11. Runtime / Build / Test / Lint / Typecheck Status
- `npx prisma generate`
- `npx prisma migrate deploy`
- `npx prisma migrate status`
- `npm run typecheck`
- `npm run lint`
- `npm test -- --runInBand`
- `npm run build`

Include summary + artifact references.

## 12. Health / Readiness / Diagnostics / Alerting Status
- Current health endpoints
- Readiness behavior
- Startup diagnostics status
- Operator alerts status
- Missing diagnostics or degraded dependencies

## 13. UI / Operator Experience Status
- Key operator screens reviewed
- State handling (loading/error/empty/success)
- Current UX gaps

## 14. Documents / Governance / Archive Status
- Current canonical docs updated
- Archive/supersede actions taken
- Report index updates
- Any governance drift still open

## 15. Team Improvement Proposals
### Immediate
- Proposal

### Next Sprint
- Proposal

### Longer Term
- Proposal

## 16. Evidence Index
List all referenced evidence artifacts.

Examples:
- `artifacts/...`
- `docs/02-validation/...`
- screenshots
- JSON snapshots
- migration outputs
- route verification matrices

## 17. Next Required Actions
- Action 1
- Action 2
- Action 3

## 18. Change Log by Date

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
