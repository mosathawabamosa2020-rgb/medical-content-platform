# FOUNDER GROUP G — DEVELOPMENT MERGED RESPONSE DIRECTIVE

Date: 2026-03-13
Status: Active
Priority: Immediate
Audience: Development Team
Authority: Founder / Technical Architecture Authority
Depends on:
- `DOCUMENT_PACKAGE_INDEX.md`
- `docs/02-validation/EXTERNAL_VERIFICATION_TEAM_FULL_PLATFORM_AUDIT_AND_VERIFICATION_REPORT.md`
- `docs/02-validation/EXTERNAL_VERIFICATION_TEAM_EXECUTION_REPORT_2026-03-12.md`
- `FOUNDER_GROUP_F_EXTERNAL_VERIFICATION_AUDIT_2026-03-13.md`
- `FOUNDER_GROUP_G_COMBINED_VERIFICATION_SYNTHESIS_2026-03-13.md`
- `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`

## 1. Executive Position
Two verification-related inputs have now been reviewed.
Only one of them is accepted as runtime/platform verification evidence.

### Accepted as authoritative verification input
- `EXTERNAL_VERIFICATION_TEAM_FULL_PLATFORM_AUDIT_AND_VERIFICATION_REPORT.md`
- `EXTERNAL_VERIFICATION_TEAM_EXECUTION_REPORT_2026-03-12.md`

### Not accepted as verification evidence
- CodeRabbit tooling/setup suggestion

The development team must therefore respond to a **merged founder directive** whose evidentiary base is the external verification audit, while only optionally absorbing non-blocking governance/tooling ideas from the CodeRabbit suggestion.

## 2. Non-Negotiable Development Objective
The goal of this pass is not broad feature expansion.
The goal is to move the project from:
- build/test-backed baseline,
- but externally blocked runtime proof,

to:
- externally verifiable runtime baseline,
- live multi-source proof,
- schema/runtime consistency,
- and lower ambiguity in active flows.

## 3. Confirmed Findings That Must Be Treated as Binding
The following are now official confirmed findings:

1. Missing external runtime env baseline for verification:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`

2. External DB/migration verification is blocked.

3. `Reference.embedding` mismatch remains open.

4. Live multi-source discovery proof was not externally completed in the latest audit.

5. Runtime UI/auth proof remains externally incomplete.

6. Build warnings remain in:
   - `pages/api/admin/scraper/start.ts`
   - `pages/api/content/generate-post.ts`

7. CodeRabbit integration is **not** a blocking workstream and must not displace the core development response.

## 4. Mandatory Parallel Workstreams

### Workstream A — External-Verifier-Ready Runtime Baseline
Objective: make the platform runnable by an external verification team with minimal ambiguity.

Required work:
1. Define the exact verification-ready runtime requirements.
2. Ensure required env expectations are documented clearly.
3. Ensure the external verifier can understand how to provide:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - optional `REDIS_URL`
4. Ensure `npm run ops:preflight` produces useful remediation information and becomes externally actionable.
5. Clarify DB port / container / local runtime assumptions explicitly.

Acceptance criteria:
- external runtime assumptions are no longer hidden,
- preflight can be understood and rerun cleanly,
- docs reflect the actual executable baseline.

### Workstream B — Database and Migration Operability Closure
Objective: allow the next external verification pass to confirm DB/migration operability without ambiguity.

Required work:
1. Validate database connectivity path in the actual supported dev/verification environment.
2. Re-run and confirm:
   - `npx prisma generate`
   - `npx prisma migrate deploy`
   - `npx prisma migrate status`
3. Explain any environment-specific caveat if still present.
4. Ensure DB readiness is externally reproducible, not only locally implied.

Acceptance criteria:
- migrate deploy/status can succeed in the supported verification baseline,
- or any unavoidable limitation is clearly documented and justified.

### Workstream C — Embedding Contract Closure (Critical)
Objective: remove or formalize the `Reference.embedding` contradiction.

Required work:
1. Decide one truth:
   - remove reference-level embedding usage,
   - or formalize it in schema + migration + runtime,
   - or define a hybrid model explicitly.
2. Update all affected code paths.
3. Update cumulative report and implementation report with direct answers.
4. Ensure no runtime path relies on a schema field that does not exist.

Acceptance criteria:
- contradiction closed,
- retrieval semantics explicit,
- runtime/schema consistency restored.

### Workstream D — Controlled Live Multi-Source Proof With Persistence
Objective: execute the proof the external verifier could not complete.

Required work:
1. Use a very small controlled sample from allowed sources only.
2. Execute:
   - discovery/search
   - ingest/persist
   - retry for dedup confirmation
   - downstream read visibility
3. Capture machine-readable evidence artifacts.
4. Classify any blocked steps precisely.

Acceptance criteria:
- at least one small multi-source persistence proof exists,
- dedup on retry is evidenced,
- downstream visibility is evidenced in at least one read path.

### Workstream E — Runtime Auth/UI Verification Readiness
Objective: make the next external verification pass able to prove login and core UI behavior.

Required work:
1. Ensure the project supports a known verification-ready auth path in the local/dev baseline if policy allows.
2. Clarify any required seed/bootstrap account.
3. Reduce ambiguity between legacy and canonical admin/verification flows.
4. Ensure the next external verifier can navigate the intended paths with minimal confusion.

Acceptance criteria:
- auth/runtime verification is easier and clearer,
- legacy/canonical drift is reduced or documented.

### Workstream F — Build Warning Reduction and Justification
Objective: reduce trust-eroding warnings.

Required work:
1. Analyze and fix or constrain the dynamic dependency warnings where feasible.
2. If any warning remains, classify it explicitly:
   - accepted for now,
   - deferred with reason,
   - blocked by architecture/tooling.

Acceptance criteria:
- warning set is smaller or better explained,
- reports distinguish between fixed and accepted warnings.

### Workstream G — Governance and Reporting Synchronization
Objective: keep the Document Package synchronized after the merged verification analysis.

Required work:
1. Update cumulative report.
2. Update current project status.
3. Update reports index if needed.
4. Ensure the next development report reflects both:
   - the external verification findings,
   - and the founder’s decision to defer CodeRabbit as non-blocking tooling.

### Workstream H — CodeRabbit Tooling Decision (Deferred / Optional)
Objective: prevent tool-driven distraction.

Required work:
1. Do not treat CodeRabbit integration as a current blocking implementation requirement.
2. If the team wants to prepare a future plan, they may create a short note only.
3. No production/runtime milestone may be delayed for CodeRabbit setup.

Acceptance criteria:
- no source-of-truth drift caused by tooling automation,
- no diversion from the main operational proof path.

## 5. Mandatory Report for This Pass
Create:
- `docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_G.md`

This report must include at minimum:
1. Executive Summary
2. External Verification Findings Addressed
3. Combined Verification Inputs Considered
4. Files Changed
5. Runtime Baseline Changes
6. Database / Migration Operability Changes
7. Embedding Contract Resolution
8. Live Multi-Source Proof Summary
9. Auth/UI Verification Readiness Changes
10. Build Warning Status
11. Validation Commands and Results
12. Evidence Artifact Paths
13. Remaining Risks / Blockers
14. Final Status by Workstream
15. Recommended Next Step

## 6. Mandatory Evidence for This Pass
Include full outputs or referenced artifacts for:
- `npm run ops:preflight`
- `npx prisma generate`
- `npx prisma migrate deploy`
- `npx prisma migrate status`
- `npm run typecheck`
- `npm run lint`
- `npm test -- --runInBand`
- `npm run build`
- live multi-source proof artifacts
- any runtime auth/UI verification artifacts

## 7. Explicit Founder Questions the Development Team Must Answer
1. What exact action closed the `Reference.embedding` contradiction?
2. Is the external verification environment now runnable with clear documented env requirements?
3. Was a small live multi-source proof executed successfully, and what persisted?
4. Which warnings remain and why?
5. Is the project ready to return to an external verification cycle after this pass?
6. What parts of the CodeRabbit suggestion, if any, are intentionally deferred and why?

## 8. Final Founder Instruction
Treat this as a merged development response pass.
Do not split the work into disconnected responses to separate verification inputs.
The next development answer must be one coherent response to the current combined verification state.
