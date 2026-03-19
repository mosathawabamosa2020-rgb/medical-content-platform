# IMPLEMENTATION_EXECUTION_REPORT_GROUP_E_TEMPLATE

Required output path:
- `docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_E.md`

---

# IMPLEMENTATION_EXECUTION_REPORT_GROUP_E

Date:
Execution Pass:
Founder Directive:
Primary Report Path:
Live Proof Report Path:
Source Expansion Review Path:
Artifacts Path(s):

## 1. Executive Summary
- What was executed in this pass
- What was proven live
- What remains partial or blocked

## 2. Scope of This Pass
- In scope
- Out of scope
- Explicitly deferred items

## 3. Founder Directive Mapping
Map each Group E workstream to:
- Implemented and Verified
- Implemented Baseline
- Partial
- Blocked
- Not Started

## 4. Files Changed
Group by:
- source/adapters
- discovery/search APIs
- ingestion/upload/import
- diagnostics/ops
- UI
- tests
- docs/reports
- artifacts

## 5. Source Registry / Adapter Decisions
For each founder-requested source state:
- source URL
- classification
- reason
- integration mode (auto / assisted / manual / blocked)
- legal/robots/access note
- priority

## 6. Live Proof Actions Executed
Describe:
- sources tested
- queries used
- number of references attempted
- duplicate re-attempt scenarios
- DB/log visibility checks

## 7. Service Areas Verified
For each service include:
- endpoint/path
- input used
- expected behavior
- actual behavior
- DB effect
- status (`PASS / PARTIAL / BLOCKED / FAIL`)

## 8. Browser-Based Chromium Verification Summary
Document explicitly:
- whether Chromium inside VS Code was used
- routes/pages opened
- per-route result (`PASS / PARTIAL / BLOCKED / FAIL`)
- visible runtime/render/data issues
- network/API observations where relevant
- operator usability notes from real browser interaction

## 9. Startup Diagnostics / Alerting Changes
- preflight changes
- alerting changes
- operator visibility changes
- known remaining limitations

## 10. PowerShell-Based Operational Verification Summary
Document explicitly:
- whether PowerShell inside VS Code was used as the primary execution shell
- commands executed through PowerShell
- operational checks performed before browser use
- any shell-specific issues (paths, quoting, env loading, encoding)
- what PowerShell-based evidence proved about startup readiness and artifact generation
- what concrete runtime blockers/errors/warnings PowerShell exposed before browser verification
- what was fixed before proceeding to Chromium-based verification

## 11. Tests Added or Updated
- test files added/updated
- covered scenarios
- still-uncovered scenarios

## 12. Validation Commands Executed
List exact commands executed.

## 13. Evidence Artifacts Produced
List all evidence artifacts produced in this pass, including:
- live proof files
- raw outputs
- JSON snapshots
- logs
- screenshots if any

## 14. Risks / Partial / Blocked Areas
- risk
- blocked item
- required unblock action

## 15. Final Status by Workstream
- Workstream A:
- Workstream B:
- Workstream C:
- Workstream D:
- Workstream E:
- Workstream F:
- Workstream G:

## 16. Recommended Next Step
- immediate next justified step
- prerequisites if any
