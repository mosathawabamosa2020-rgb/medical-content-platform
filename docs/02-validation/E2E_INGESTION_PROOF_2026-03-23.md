# E2E Ingestion Proof Report
Date: 2026-03-24

## Objective
Demonstrate end-to-end lifecycle evidence after A-2 enum remediation:
1. Create reference and ingestion sections.
2. Approve verification workflow.
3. Validate retrieval after approval.
4. Produce generated content with source linkage.
5. Capture bilingual query evidence.

## Execution
1. `docker compose up -d postgres redis minio`
2. `npx prisma migrate deploy`
3. `npx prisma generate`
4. `node tools/create_admin.js --email admin@example.test --password AdminPass123! --name "Platform Admin"`
5. `node tools/e2e_lifecycle_proof.js`

## Runtime Evidence (Latest Successful Run)
- Generated at: `2026-03-24T17:33:08.309Z`
- Token: `e2e-proof-1774373583665`
- Created reviewer ID: `cmn4w7wmz0000s3p6dvx626u9`
- Created device ID: `cmn4w7x160001s3p6yhfnrio1`
- Created reference ID: `cmn4w7x5g0004s3p6f5oblzw5`
- Created generated content ID: `cmn4w7yzg0009s3p634wiv2da`
- Created section IDs:
  - `sec-1774373583665-1`
  - `sec-1774373583665-2`
  - `sec-1774373583665-3`
  - `sec-1774373583665-4`
  - `sec-1774373583665-5`
- Section count for created reference: `5`
- Verification decision result: `ok`
- Post-approval reference status: `verified`
- Retrieval before approval: `0`
- Retrieval after approval: `4`

## Bilingual Retrieval Evidence
- Arabic query token: `قسطرة`
- Post-approval bilingual hits: `3`
- Sample returned English snippet:
  - `English explanation: catheter insertion workflow aligned with قسطرة terminology.`

## Generated Content Citation Evidence
- Generated content ID: `cmn4w7yzg0009s3p634wiv2da`
- Source reference IDs:
  - `cmn4w7x5g0004s3p6f5oblzw5`
- Source section IDs:
  - `sec-1774373583665-1`
  - `sec-1774373583665-2`
  - `sec-1774373583665-3`
  - `sec-1774373583665-4`
  - `sec-1774373583665-5`

## Artifacts
- Script: `tools/e2e_lifecycle_proof.js`
- Output artifact: `artifacts/e2e_lifecycle_proof.json` (latest run payload should be exported from script output log)

## Status
E2E lifecycle proof is now unblocked and executed successfully with live IDs, post-approval retrieval uplift, and bilingual evidence.
