# FOUNDER GROUP H DEVELOPMENT RESPONSE DIRECTIVE — 2026-03-15

Date: 2026-03-15
Status: Active
Audience: Development Team
Authority: Founder / Technical Architecture Authority
Depends on:
- `FOUNDER_GROUP_H_UNIFIED_VERIFICATION_SYNTHESIS_2026-03-15.md`
- `docs/02-validation/EXTERNAL_VERIFICATION_TEAM_FULL_PLATFORM_AUDIT_AND_VERIFICATION_REPORT.md`
- `docs/02-validation/EXTERNAL_VERIFICATION_TEAM_EXECUTION_REPORT_2026-03-12.md`
- accepted static findings from CodeRabbit review

## 1. Founder Position
The next step is a **merged development response pass**.

This pass is not a feature-expansion pass.
It is a controlled correction, proof-enablement, and security-hardening pass.

The current external verification state remains insufficient for closure because:
- runtime proof is blocked,
- DB-to-UI proof is absent,
- live multi-source proof is absent,
- critical auth gaps remain in source code,
- and the schema/runtime truth around `Reference.embedding` remains unresolved.

## 2. Mandatory Rule
Do not answer this directive with a free-form summary only.
You must create and update:
- `docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_H.md`
- `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`
- `docs/00-governance/CURRENT_PROJECT_STATUS.md`

## 3. Workstreams to Execute in Parallel

### Workstream A — Verification-Ready Environment Baseline
Required:
1. document exact env requirements for an external verification pass,
2. provide a reproducible verification-ready startup path,
3. ensure `ops:preflight` explains required vs optional dependencies clearly,
4. remove ambiguity around DB reachability and migration execution expectations.

Acceptance:
- a verifier can understand exactly how to reach a runtime-ready state,
- missing env is no longer a hidden blocker.

### Workstream B — Critical Authentication and Route Protection
Required:
1. add proper auth protection to `pages/api/references/discovery/ingest.ts`,
2. add proper auth protection to `pages/api/content/generate-post.ts`,
3. review `pages/api/references/upload.ts` and explicitly document its auth model,
4. review admin pages that rely only on weaker client-side protection and strengthen server-side protection where needed.

Acceptance:
- the two critical unprotected routes are closed,
- auth model for high-impact write paths is explicit and evidence-backed.

### Workstream C — Reference Embedding Contract Closure
Required:
1. decide whether `Reference.embedding` is intentionally part of the canonical model,
2. if yes: declare it in Prisma schema and add the required migration,
3. if no: remove or deprecate reference-level embedding writes and queries,
4. ensure retrieval, ingestion, and schema all express the same truth.

Acceptance:
- no mismatch remains between runtime behavior and canonical schema.

### Workstream D — Live Multi-Source Proof Enablement
Required:
1. unblock the controlled live multi-source discovery proof,
2. run a minimal safe proof with at least 2 source types already approved in policy,
3. prove: discovery -> ingest -> persist -> dedup retry -> downstream visibility,
4. update evidence artifacts and cumulative report accordingly.

Acceptance:
- the knowledge chain is proven at least once with evidence.

### Workstream E — Warning Reduction and Runtime Cleanliness
Required:
1. reduce or explicitly classify the remaining build warnings,
2. review lint warnings and remove low-cost ones that create avoidable noise,
3. ensure critical routes do not depend on ambiguous dynamic require behavior without justification.

Acceptance:
- warning posture is improved or clearly justified.

### Workstream F — Governance and Repository Hygiene
Required:
1. ensure referenced remediation/security files actually exist before being cited,
2. review path consistency between Document Package references and real repository structure,
3. clean any still-tracked generated/runtime artifacts or document why they remain.

Acceptance:
- no major claimed evidence file remains missing,
- package hygiene does not contradict founder governance rules.

## 4. Explicit Founder Questions the Team Must Answer
In `IMPLEMENTATION_EXECUTION_REPORT_GROUP_H.md`, answer explicitly:
1. Was `ingest.ts` secured? How exactly?
2. Was `generate-post.ts` secured? How exactly?
3. Does `Reference.embedding` now exist canonically or was the runtime path removed?
4. What exact environment does an external verifier need to complete live proof?
5. Which source types were used in the live multi-source proof and what persisted?
6. Which routes/pages are now externally verifiable live, and which remain partial?

## 5. Required Outputs
Create/update:
1. `docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_H.md`
2. `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`
3. `docs/00-governance/CURRENT_PROJECT_STATUS.md`
4. any required migration files if schema changes are made
5. updated evidence artifacts for the live proof pass

## 6. Final Instruction
Proceed with this merged response pass immediately.
Do not treat CodeRabbit as the governing verifier.
Treat the execution-backed external verification report as authoritative for runtime proof, and treat accepted CodeRabbit findings as static code issues to close before the next verification cycle.
