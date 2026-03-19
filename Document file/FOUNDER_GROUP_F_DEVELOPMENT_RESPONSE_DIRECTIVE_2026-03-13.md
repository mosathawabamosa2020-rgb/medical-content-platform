# FOUNDER GROUP F — DEVELOPMENT RESPONSE DIRECTIVE

Date: 2026-03-13
Status: Active
Priority: Immediate
Audience: Development Team
Authority: Founder / Technical Architecture Authority
Depends on:
- `DOCUMENT_PACKAGE_INDEX.md`
- `docs/02-validation/EXTERNAL_VERIFICATION_TEAM_FULL_PLATFORM_AUDIT_AND_VERIFICATION_REPORT.md`
- `docs/02-validation/EXTERNAL_VERIFICATION_TEAM_EXECUTION_REPORT_2026-03-12.md`
- `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`
- `FOUNDER_GROUP_F_EXTERNAL_VERIFICATION_AUDIT_2026-03-13.md`

## 1. Founder Position
The external verification team produced a credible audit.
Their result is accepted as an external verification pass, but not as closure.

The main outcome is clear:
- the repository has meaningful implementation,
- but runtime verification confidence is still incomplete,
- and the next correct step is a **development response pass**, not another broad verification cycle.

Accordingly, this directive defines the required development response.

## 2. What the Development Team Must Treat as Confirmed Findings
The following findings are now considered officially confirmed and must be addressed directly:

1. Runtime environment is not verification-ready for external teams:
   - missing `DATABASE_URL`
   - missing `NEXTAUTH_SECRET`
   - DB timeout in preflight
   - migrate deploy/status blocked in external run

2. Schema/code mismatch remains open:
   - `lib/embeddings.ts` still references `Reference.embedding`
   - authoritative Prisma schema does not define `Reference.embedding`

3. Live multi-source discovery proof is still not externally verified in the latest audit.

4. Build warnings remain in:
   - `pages/api/admin/scraper/start.ts`
   - `pages/api/content/generate-post.ts`

5. UI/auth/runtime proof remains partial because the external team could not perform live authenticated verification.

## 3. Immediate Execution Objective
The development team is now required to execute a **response-and-proof pass** that converts the externally reported blockers into either:
- fixed implementation,
- operationally ready configuration,
- or explicitly documented and justified limitations.

## 4. Mandatory Parallel Workstreams

### Workstream A — Verification-Ready Runtime Baseline
Objective: make the project runnable by an external team without hidden environment ambiguity.

Required work:
1. Define and document the required runtime environment clearly.
2. Ensure the project can expose a verification-ready local/dev baseline for:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - optional `REDIS_URL`
3. Ensure `npm run ops:preflight` becomes meaningfully actionable for external reviewers.
4. If the project relies on `.env.local`, document the expected shape and required keys.
5. Ensure DB connectivity assumptions are explicit and reproducible.

Deliverables:
- updated ops/governance docs
- updated current status
- clean rerun evidence

### Workstream B — Embedding Contract Closure
Objective: close the repeated contradiction around `Reference.embedding`.

Required work:
1. Decide one truth path:
   - remove `Reference.embedding` runtime dependency entirely,
   - or formalize it properly in schema + migration + runtime.
2. Update `lib/embeddings.ts`, retrieval helpers, and any related write/query paths accordingly.
3. State the retrieval model explicitly:
   - chunk-first,
   - section-first,
   - hybrid,
   - reference-level aggregate.
4. Update the cumulative report and implementation report with a direct answer.

Acceptance criteria:
- no active runtime path references a schema field that does not exist,
- retrieval storage semantics are explicit and evidence-backed.

### Workstream C — Controlled Live Multi-Source Proof
Objective: execute the proof the external verification team could not complete.

Required work:
1. Run a small controlled proof using a very small sample from approved/allowed sources.
2. Use only source types allowed by current policy.
3. Demonstrate:
   - discovery/search result generation,
   - ingestion attempt,
   - DB persistence,
   - dedup on repeat,
   - downstream visibility in at least one read path (`library`, `query`, or admin references view).
4. Attach artifacts and report sections.

Acceptance criteria:
- the chain must be evidenced, not only described,
- blocked parts must be explicitly classified.

### Workstream D — Build Warning Reduction
Objective: reduce trust-eroding warnings in the current build.

Required work:
1. Analyze the dynamic dependency warnings in:
   - `pages/api/admin/scraper/start.ts`
   - `pages/api/content/generate-post.ts`
2. Either remove them, constrain them, or explicitly document why they remain acceptable.
3. Update reports to distinguish:
   - warning accepted for now,
   - warning fixed,
   - warning deferred with reason.

### Workstream E — Auth and UI Runtime Proof Support
Objective: support the next external verification cycle with stronger live-proof readiness.

Required work:
1. Ensure the login/auth path can be exercised with a known local/dev verification account if policy allows.
2. Ensure admin landing and critical admin pages are navigable in a verification-ready environment.
3. Reduce ambiguity between legacy verification routes and canonical verification routes.
4. If deprecation is needed, document it clearly.

### Workstream F — Reporting and Governance Response
Objective: keep the Document Package synchronized after the external audit.

Required work:
1. Update `docs/02-validation/CUMULATIVE_EXECUTION_AND_VERIFICATION_REPORT.md`
2. Update `docs/00-governance/CURRENT_PROJECT_STATUS.md`
3. Update `docs/00-governance/REPORTS_INDEX.md` if needed
4. Produce a new development response report file.

## 5. Mandatory Development Report for This Pass
Create:
- `docs/02-validation/IMPLEMENTATION_EXECUTION_REPORT_GROUP_F.md`

This report must include at minimum:
1. Executive Summary
2. External Verification Findings Addressed
3. Files Changed
4. Runtime Baseline Changes
5. Embedding Contract Resolution
6. Multi-Source Proof Execution Summary
7. Build Warning Status
8. Auth/UI Runtime Readiness Changes
9. Validation Commands and Results
10. Evidence Artifact Paths
11. Remaining Risks / Blockers
12. Final Status by Workstream
13. Recommended Next Step

## 6. Mandatory Evidence for This Pass
At minimum include full outputs or referenced artifacts for:
- `npm run ops:preflight`
- `npx prisma generate`
- `npx prisma migrate deploy`
- `npx prisma migrate status`
- `npm run typecheck`
- `npm run lint`
- `npm test -- --runInBand`
- `npm run build`
- live multi-source proof artifacts if executed

## 7. Explicit Founder Questions the Development Team Must Answer
1. What exact change was made to resolve the `Reference.embedding` contradiction?
2. Can an external verification team now run the project with a clear documented env baseline?
3. Was a small live multi-source proof executed successfully? If yes, what persisted and where is the evidence?
4. Which build warnings remain and why?
5. Is the project now ready for a second external verification pass, or not yet?

## 8. Final Founder Instruction
Do not treat the external audit as a passive review artifact.
Treat it as an actionable response package.

The next step is a **development response pass**.
Only after that response is implemented and documented should the project return to an external verification cycle.
