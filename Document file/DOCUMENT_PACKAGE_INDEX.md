# DOCUMENT_PACKAGE_INDEX

Date: 2026-03-13
Status: Active
Owner: Founder / Technical Architecture Authority
Applies To: Development Team, External Verification Team, Founder Review Cycle

## 1. Purpose of This File
This file defines the official meaning of the **Document Package** used in this project.

In this project, the phrase:

> **"ملف الوثيقة" / "Document Package"**

does **not** refer to a single standalone file.

It refers to the **full governed package of project documents, directives, reports, templates, plans, and status files** that collectively describe:
- the project vision,
- the approved architecture,
- the execution backlog,
- the remediation history,
- the founder directives,
- the verification requirements,
- the execution evidence,
- the current platform status,
- and the next required actions.

This package is what gets sent to:
- the development team,
- the external verification team,
- and any future technical review authority.

---

## 2. Official Meaning of the Document Package
The Document Package is the **complete managed reference layer** of the project.

It is the package through which every receiving team should understand:
1. what the platform is,
2. what has been requested,
3. what has been implemented,
4. what has been verified,
5. what remains open,
6. and what they are expected to do next.

Therefore, when the founder/project owner says:
- "I will send the Document Package to the verification team"
- or "I will send the Document Package to the development team"

it means the receiving team is expected to review the **relevant governed files in the package**, not a single isolated note.

---

## 3. Core Governance Principle
The Document Package must always remain:
- synchronized,
- non-contradictory,
- hierarchically organized,
- easy to review,
- and suitable for handoff to different execution or verification teams.

No major directive, verification result, or implementation conclusion should exist only in chat form.
It must be reflected in the package.

The governance layer is now materially present inside the repository under:
- `docs/00-governance/SOURCE_OF_TRUTH.md`
- `docs/00-governance/CURRENT_PROJECT_STATUS.md`
- `docs/00-governance/REPORTS_INDEX.md`

These files must remain synchronized with this package index.

---

## 4. Primary Audiences of the Document Package

### A. Founder / Technical Architecture Authority
Uses the package to:
- direct both teams,
- review reports,
- track progress,
- identify contradictions,
- and decide the next execution or verification step.

### B. Development Team
Uses the package to:
- understand the approved implementation baseline,
- review verification findings,
- receive founder directives,
- execute required tasks,
- and update the cumulative execution state.

### C. External Verification Team
Uses the package to:
- understand project expectations,
- inspect the implementation against directives,
- validate the platform behavior,
- and produce an evidence-backed audit report.

---

## 5. High-Level Reading Order for Any Receiving Team
Every team receiving the Document Package should review it in the following order.

### Step 1 — Understand the project baseline
Read first:
1. `TEAM_IMPLEMENTATION_GUIDE.md`
2. `development-backlog.yaml`
3. `development-backlog-recovery.yaml`

### Step 2 — Understand current state and governance
Then read:
4. `docs/00-governance/SOURCE_OF_TRUTH.md`
5. `docs/00-governance/CURRENT_PROJECT_STATUS.md`
6. `docs/00-governance/REPORTS_INDEX.md`
7. `DOCUMENT_PACKAGE_INDEX.md`

### Step 3 — Understand cumulative execution and verification state
Then read:
8. `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`

### Step 4 — Read the latest active founder directive relevant to the receiving team
For development execution:
- read the latest applicable `FOUNDER_*_DIRECTIVE_*.md`

For external verification:
- read the latest applicable external verification directive

### Step 5 — Review supporting reports and evidence
Then read:
- implementation execution reports,
- deep verification reports,
- readiness/operations reports,
- architecture reviews,
- artifacts linked from the cumulative report.

---

## 6. Current Active Team Directives

### A. Current Active Verification Team Directive
The current verification handoff for any external verification team must be based on:
- `EXTERNAL_VERIFICATION_TEAM_FULL_PLATFORM_AUDIT_AND_VERIFICATION_DIRECTIVE_2026-03-12.md`
- `EXTERNAL_VERIFICATION_TEAM_FULL_PLATFORM_AUDIT_REPORT_TEMPLATE.md`
- `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`
- `docs/00-governance/CURRENT_PROJECT_STATUS.md`
- `SOURCE_EXPANSION_POLICY_AND_CANDIDATES_2026-03-10.md`

This means that when the founder/project owner says:
> "Send the Document Package to the verification team"

the receiving verification team must treat the above set as the current active verification layer inside the full package.

### B. Current Active Development Team Directive
The current development handoff for the implementation team must be based on:
- `TEAM_IMPLEMENTATION_GUIDE.md`
- `development-backlog.yaml`
- `development-backlog-recovery.yaml`
- `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`
- `docs/00-governance/CURRENT_PROJECT_STATUS.md`
- `FOUNDER_GROUP_I_REPOSITORY_REALIGNMENT_AND_PRE_PUSH_VERIFICATION_DIRECTIVE_2026-03-15.md`
- `IMPLEMENTATION_EXECUTION_REPORT_GROUP_I_TEMPLATE.md`
- `FOUNDER_GROUP_H_UNIFIED_VERIFICATION_SYNTHESIS_2026-03-15.md`
- `docs/02-validation/EXTERNAL_VERIFICATION_TEAM_FULL_PLATFORM_AUDIT_AND_VERIFICATION_REPORT.md`
- `docs/02-validation/EXTERNAL_VERIFICATION_TEAM_EXECUTION_REPORT_2026-03-12.md`
- accepted static findings from CodeRabbit as summarized in `FOUNDER_GROUP_H_UNIFIED_VERIFICATION_SYNTHESIS_2026-03-15.md`
- `FOUNDER_CODERABBIT_INTEGRATION_AUDIT_AND_DECISION_2026-03-13.md` (supporting static-audit/tooling input; not a runtime verification authority)

This means the development team must treat:
- the external verification report as the primary runtime/evidence authority,
- CodeRabbit findings as additional static source-code findings that still require remediation where accepted,
- and the new canonical repository realignment as an immediate gating concern before any blind push.

This means that when the founder/project owner says:
> "Send the Document Package to the development team"

the receiving development team must treat the above set as the current active execution layer inside the full package.

### C. Sustainability Protection Rule for the Document Package
The Document Package must preserve the project’s sustainability principle at all times.
This means:
- no update may silently remove or weaken the open-source-first principle,
- no new directive may ignore prior verified decisions without explicitly superseding them,
- no new execution or verification cycle may discard prior evidence without archiving and indexing it,
- and no package reorganization may cause loss of architectural memory.

The package is not only a reporting layer; it is also a continuity and sustainability control layer for the platform.

## 7. Current Document Package Layers

### Layer A — Strategic and execution baseline
- `TEAM_IMPLEMENTATION_GUIDE.md`
- `development-backlog.yaml`
- `development-backlog-recovery.yaml`
- `REMEDIATION_EXECUTION_PLAN.md`
- `IMPLEMENTATION_GAP_ANALYSIS_2026-03-07.md`

### Layer B — Governance and source-of-truth control
- `docs/00-governance/SOURCE_OF_TRUTH.md`
- `docs/00-governance/CURRENT_PROJECT_STATUS.md`
- `docs/00-governance/REPORTS_INDEX.md`
- `docs/00-governance/DOCUMENT_RETENTION_AND_ARCHIVE_POLICY.md`
- `DOCUMENT_PACKAGE_INDEX.md`

### Layer C — Founder directives and execution control
This includes the founder-issued directives that define execution or verification expectations.
Examples include:
- `CODEX_TEAM_DIRECTIVE_2026-03-08.md`
- `CODEX_PARALLEL_EXECUTION_AND_VALIDATION_DIRECTIVE_2026-03-08.md`
- `FOUNDER_PHASE2_EXECUTION_DIRECTIVE_2026-03-08.md`
- `FOUNDER_FINAL_VALIDATION_AND_CLOSURE_DIRECTIVE_2026-03-08.md`
- `FOUNDER_BACKBONE_REVIEW_AND_NEXT_DIRECTIVE_2026-03-08.md`
- `FOUNDER_EXECUTION_AUDIT_AND_DOCUMENT_GOVERNANCE_DIRECTIVE_2026-03-09.md`
- `FOUNDER_GROUP_A_*`
- `FOUNDER_GROUP_B_*`
- `FOUNDER_GROUP_C_*`
- `FOUNDER_GROUP_D_*`
- `FOUNDER_GROUP_E_*`

### Layer D — Team-facing templates and structured report formats
Examples:
- `CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT_TEMPLATE.md`
- `IMPLEMENTATION_EXECUTION_REPORT_GROUP_A_TEMPLATE.md`
- `IMPLEMENTATION_EXECUTION_REPORT_GROUP_B_TEMPLATE.md`
- `IMPLEMENTATION_EXECUTION_REPORT_GROUP_C_TEMPLATE.md`
- `IMPLEMENTATION_EXECUTION_REPORT_GROUP_D_TEMPLATE.md`
- `IMPLEMENTATION_EXECUTION_REPORT_GROUP_E_TEMPLATE.md`
- `EXTERNAL_VERIFICATION_TEAM_FULL_PLATFORM_AUDIT_REPORT_TEMPLATE.md`

### Layer E — Verification and evidence outputs
Examples:
- `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`
- `docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_*.md`
- `docs/02-validation/PLATFORM_DEEP_VERIFICATION_AND_*.md`
- supporting artifacts under `artifacts/`

### Layer F — Architecture and domain review documents
Examples:
- knowledge pipeline reviews,
- schema semantics reviews,
- retrieval reviews,
- storage reviews,
- worker/governance reviews,
- operator UX reviews,
- source expansion policy.

---

## 8. Rules for Sending the Document Package to the Verification Team
When the Document Package is sent to an external verification team, they are expected to:
1. review the package hierarchy,
2. identify the current authoritative execution state,
3. start from the active verification directive listed in Section 6,
4. inspect the repository and runtime behavior,
5. verify the project against the requested checks,
6. and produce a detailed, evidence-backed report.

### Verification team must especially review:
- current active verification directive,
- current status,
- cumulative execution report,
- source expansion policy if source validation is requested,
- active architecture and operations documents linked from the cumulative report.

---

## 9. Rules for Sending the Document Package to the Development Team
When the Document Package is sent to the development team, they are expected to:
1. review the current baseline,
2. review the latest verification findings,
3. start from the active development directive listed in Section 6,
4. implement only what is authorized,
5. update required reports and evidence,
6. and reflect implementation truth back into the package.

### Development team must especially review:
- the active development directive,
- the cumulative execution report,
- current project status,
- active templates for reporting,
- relevant verification findings that led to the directive.

---

## 9. Operating Cycle of the Project
This project is governed in a recurring loop:

1. Founder sends the Document Package to the verification team.
2. Verification team reviews the repository, runtime, data flow, services, UI, and operations.
3. Verification team returns a detailed report.
4. Founder reviews the report deeply.
5. Founder updates the Document Package to reflect verified truth.
6. Founder issues new execution directives to the development team.
7. Development team implements changes and updates evidence/report files.
8. Founder reviews their report and changed files.
9. Founder updates the Document Package again.
10. Updated package is then ready to be sent back to the verification team for the next proof cycle.

This loop continues until the platform reaches the required confidence and closure level.

---

## 10. Synchronization Rule
Whenever any major new finding appears from:
- development implementation,
- external verification,
- founder audit,
- or architecture review,

it must be synchronized into the Document Package through some combination of:
- directive update,
- cumulative report update,
- current project status update,
- reports index update,
- source-of-truth update,
- or package index update.

No critical execution truth should remain outside the package.

---

## 11. Report Discipline Rule
The project must avoid uncontrolled report sprawl.

### Required principle
The cumulative report remains the main living execution/verification record:
- `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`

Special reports may still exist, but they must:
- be linked from the cumulative report,
- be linked from the reports index if current,
- and be clearly identified as current, supporting, historical, or superseded.

---

## 12. Document Package Hygiene Rules
The package must always satisfy the following:
1. stable filenames for current-state documents where possible,
2. dated historical artifacts only where historically necessary,
3. archive of superseded material under `docs/archive/`,
4. no duplicate current-state documents claiming different truths,
5. every new directive or verification pass reflected in the cumulative report,
6. every team-facing package understandable without founder chat history.

---

## 13. Required Minimum Files That Must Stay Synchronized
The following files are especially critical and must remain aligned:
- `TEAM_IMPLEMENTATION_GUIDE.md`
- `development-backlog.yaml`
- `development-backlog-recovery.yaml`
- `docs/00-governance/SOURCE_OF_TRUTH.md`
- `docs/00-governance/CURRENT_PROJECT_STATUS.md`
- `docs/00-governance/REPORTS_INDEX.md`
- `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`
- the latest active founder directive relevant to the receiving team
- the latest active verification/report template relevant to that directive

---

## 14. Current External Verification Entry Point
If a new external verification team is engaged, the recommended entry sequence is:
1. `DOCUMENT_PACKAGE_INDEX.md`
2. `TEAM_IMPLEMENTATION_GUIDE.md`
3. `docs/00-governance/SOURCE_OF_TRUTH.md`
4. `docs/00-governance/CURRENT_PROJECT_STATUS.md`
5. `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`
6. `EXTERNAL_VERIFICATION_TEAM_FULL_PLATFORM_AUDIT_AND_VERIFICATION_DIRECTIVE_2026-03-12.md`
7. `EXTERNAL_VERIFICATION_TEAM_FULL_PLATFORM_AUDIT_REPORT_TEMPLATE.md`
8. `SOURCE_EXPANSION_POLICY_AND_CANDIDATES_2026-03-10.md`

---

## 15. Current Development Execution Entry Point
If the development team is the receiving side, the recommended entry sequence is:
1. `DOCUMENT_PACKAGE_INDEX.md`
2. `TEAM_IMPLEMENTATION_GUIDE.md`
3. `docs/00-governance/CURRENT_PROJECT_STATUS.md`
4. `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`
5. the latest active founder group directive
6. the matching implementation execution report template
7. any linked verification reports that justify the directive

---

## 16. Founder-Level Enforcement Rule
If a team performs work but does not reflect it properly into the Document Package, the work should be treated as incomplete from a governance and review standpoint.

Code alone is not enough.
Evidence alone is not enough.
Reports alone are not enough.
The full Document Package must remain synchronized.

---

## 17. Final Position
The Document Package is the operational memory of the project.
It is the medium through which:
- strategy becomes execution,
- execution becomes evidence,
- evidence becomes directives,
- and directives become the next implementation or verification cycle.

This file exists to ensure that all teams interact with the project through one governed package, not through scattered notes or isolated files.
