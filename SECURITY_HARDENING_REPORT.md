# SECURITY_HARDENING_REPORT

Date: 2026-03-05
Status: PARTIAL (Not fully certified)

## Implemented

1. Admin auth boundary
- `withAdminAuth` remains enforced across `/api/admin/**`.
- Coverage test remains in place:
  - `__tests__/admin_auth_coverage.test.ts`.

2. CSRF protection (state-changing routes)
- Added `enforceCsrfForMutation` in `lib/apiSecurity.ts`.
- Applied through `withAdminAuth` and selected non-admin POST routes.
- Policy: same-origin `origin/host` validation (test environment bypass for automated tests).

3. Secure headers
- Added `setSecurityHeaders` in `lib/apiSecurity.ts`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: no-referrer`
  - `Permissions-Policy`
  - `Content-Security-Policy` (baseline self-only policy)

4. Rate limiting
- Added in-memory limiter `enforceRateLimit`.
- Enforced on:
  - admin wrapper (all admin routes)
  - `/api/references/query`
  - selected discovery/upload routes

5. Session expiry hardening
- Updated NextAuth session policy:
  - `maxAge: 8h`
  - `updateAge: 1h`

## Remaining Security Risks

1. Dependency vulnerabilities remain
- `npm audit --omit=dev` currently reports 4 high vulnerabilities (`next`, `pdfjs-dist`, `tar` chain).
- Requires coordinated dependency upgrade plan and regression pass.

2. Rate limit persistence
- Current limiter is in-memory only (single-node, non-distributed).
- Production deployment should use Redis-backed limiter.

3. CSRF strategy scope
- Current enforcement is same-origin header validation.
- A token-based CSRF model may still be required depending on deployment topology and proxy behavior.

## Certification Decision

NOT FULLY CERTIFIED

Core hardening is implemented, but dependency vulnerability closure is still open and blocks full security certification.
