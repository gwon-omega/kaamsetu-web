# Android Execution Plan (Post Web Major Changes)

## Objective

Stabilize Android delivery first, then execute a production-grade quality cycle for bugs, performance, security, tampering resistance, pentest/hunter checks, and scalability.

## Phase 1: Android Setup Baseline (Current)

- Lock app runtime behavior in Expo config.
- Keep only required Android permissions and block risky defaults.
- Ensure OTA strategy is controlled for production updates.
- Add repeatable EAS build profiles for internal and production tracks.

Exit criteria:

- `pnpm --filter @shram-sewa/android typecheck` passes.
- `pnpm --filter @shram-sewa/android config:public` resolves expected runtime config.
- `apps/android/eas.json` supports `preview` and `production` release profiles.

## Phase 2: Bug Stabilization

- Build an Android regression matrix for login, search, hire flow, notifications, and offline queue.
- Add deterministic test data seed path for device QA.
- Fix crash and logic defects by severity: blocker, major, minor.

Exit criteria:

- No blocker or major defects open.
- Top 10 user journeys pass on low-end Android devices.

## Phase 3: Performance and Reliability

- Measure cold start, navigation latency, and API screen load on low-memory devices.
- Optimize list rendering, image payloads, and local database sync windows.
- Add network resilience with retry/backoff, offline-first queueing, and idempotent writes.

Exit criteria:

- Stable operation on 2-3 GB RAM devices.
- No sustained frame drops in primary worker and hirer flows.

## Phase 4: Security and Tamper Resistance

- Enforce strict auth session handling with secure storage only.
- Add root/jailbreak and emulator risk signals in critical actions.
- Validate all client input before API dispatch and at server boundaries.
- Verify minimal permission footprint remains intact per release.

Exit criteria:

- No critical auth/session handling gaps.
- No sensitive secrets in source, logs, or local plaintext storage.

## Phase 5: Pentest and Hunter Checks

- Run mobile security checklist aligned to OWASP MASVS.
- Perform API abuse tests: auth bypass, token replay, IDOR, rate-limit evasion.
- Execute practical bug-hunter style checks on business logic misuse paths.

Exit criteria:

- All critical/high findings closed or accepted with explicit risk sign-off.
- Abuse paths have server-side mitigations and audit traces.

## Phase 6: Scalability and Production Operations

- Test worker search and hire API behavior under realistic burst traffic.
- Validate Supabase indexes, query paths, and RLS performance impact.
- Prepare release runbook with rollback plan and incident triage steps.

Exit criteria:

- Meets expected launch load for target municipalities.
- Roll-forward and rollback are both executable in under 30 minutes.

## Industry-Grade Operating Cadence

- Weekly release branch with controlled EAS preview rollout.
- Daily crash/latency review with strict triage SLA.
- Security gate before production promote.
- Monthly resilience drill (network outage, partial backend degradation, token key rotation).

## Commands

- `pnpm --filter @shram-sewa/android dev`
- `pnpm --filter @shram-sewa/android dev:clear`
- `pnpm --filter @shram-sewa/android typecheck`
- `pnpm --filter @shram-sewa/android config:public`
- `pnpm --filter @shram-sewa/android prebuild:android`
- `pnpm --filter @shram-sewa/android eas:build:preview`
- `pnpm --filter @shram-sewa/android eas:build:production`
- `pnpm --filter @shram-sewa/android eas:submit:production`

## QA Remediation Backlog (From Deep Audit)

Use this as the implementation checklist for web, android, shared, and edge functions.

| ID      | Priority | Scope                   | Task                                                                                                                              | Done Criteria                                                                          |
| ------- | -------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| QAT-001 | P0       | Web Auth                | Make auth state source-of-truth come from live Supabase session; on logout call `authApi.signOut()` then clear local store state. | Route guards block unauthorized users correctly after refresh and logout in all cases. |
| QAT-002 | P0       | Shared Config           | Fix broken `getRateLimitKey()` implementation in `packages/shared/src/config/rate-limit.ts`.                                      | Shared package typecheck and lint pass without syntax/runtime errors.                  |
| QAT-003 | P0       | CI Quality              | Add `lint` and `typecheck` scripts to `packages/shared` and `packages/ui-tokens`, wire into Turbo tasks.                          | `pnpm lint` and `pnpm typecheck` validate all workspace packages, not just apps.       |
| QAT-004 | P0       | Web Search              | Refactor `apps/web/src/pages/search.tsx` to remove setState-in-effect lint violations and avoid cascading renders.                | Web lint passes with zero errors; search pagination behavior remains correct.          |
| QAT-005 | P0       | Testing                 | Add baseline tests: shared API mapper tests, web hire flow integration test, android critical hook tests.                         | CI includes automated tests for login, search, hire, and notifications smoke paths.    |
| QAT-006 | P0       | Observability           | Add production error tracking (Sentry or equivalent) to web and android app roots; capture API mutation failures.                 | Runtime exceptions and failed critical mutations are visible in monitoring dashboard.  |
| QAT-007 | P1       | Web Notifications       | Scope query key by userId and limit notification payload/rows in `apps/web/src/hooks/use-notifications.ts`.                       | No stale/cross-user notification cache behavior; memory usage remains bounded.         |
| QAT-008 | P1       | IP Security UX          | Add TTL-based expiry for IP hire lock records and cleanup strategy in web client helpers.                                         | Old locks auto-expire and valid rehiring is not blocked after lock window.             |
| QAT-009 | P1       | Network Resilience      | Move IP resolution fallback to server-side edge logic where feasible, keep client lookup best-effort only.                        | Hire flow remains usable under intermittent connectivity and external IP API failures. |
| QAT-010 | P1       | Android Auth            | Enable secure session persistence strategy for Android and add auth restore on app start.                                         | Users stay logged in across app restarts unless explicitly signed out.                 |
| QAT-011 | P1       | Offline Data            | Integrate WatermelonDB into live app flow with local-first reads and queued writes.                                               | Core screens show cached/offline data and sync correctly when network returns.         |
| QAT-012 | P1       | Concurrency             | Make worker availability updates atomic (DB trigger or transactional edge function).                                              | No race-induced incorrect availability state under concurrent hire status updates.     |
| QAT-013 | P1       | Search Performance      | Replace large client-side search loads with server-side filtering and stricter page limits.                                       | Search remains responsive on low-end devices and does not overfetch large datasets.    |
| QAT-014 | P1       | Date Correctness        | Replace `safeDate` epoch fallback strategy with explicit invalid-date handling.                                                   | Invalid dates are not silently shown as 1970; UI handles parse failures clearly.       |
| QAT-015 | P1       | Android UX              | Surface actionable error messages in `HireBottomSheet` on failed confirm actions.                                                 | Users always receive visible failure reason and retry path.                            |
| QAT-016 | P1       | Accessibility           | Add missing labels, roles, and accessibility metadata on web and android hire/profile flows.                                      | Keyboard/screen-reader checks pass for critical forms and action buttons.              |
| QAT-017 | P2       | UI Clarity              | Remove or wire currently non-functional action controls (for example settings/call buttons).                                      | No dead-click controls remain in worker/profile surfaces.                              |
| QAT-018 | P2       | Bundle Size             | Split large web chunk with manual chunking/lazy boundaries and monitor bundle budgets.                                            | Main chunk warning is reduced and first-load JS budget is documented and enforced.     |
| QAT-019 | P2       | Notification Consent UX | Add rationale pre-prompt and fallback guidance for Android notification permission flow.                                          | Permission grant rate improves and denied users understand impact/recovery steps.      |
| QAT-020 | P2       | TS Upgrade Safety       | Resolve baseUrl deprecation path and prepare TS upgrade-safe configuration.                                                       | No deprecation warnings remain that can block future TS major upgrades.                |

## Execution Progress (Current)

- Completed in code: QAT-001, QAT-002, QAT-003, QAT-004, QAT-005, QAT-006, QAT-007, QAT-008, QAT-009, QAT-010, QAT-015, QAT-020.
- Validation pass: `@shram-sewa/shared` typecheck + lint script, `@shram-sewa/ui-tokens` typecheck + lint script, `@shram-sewa/web` typecheck, and web lint (warnings only).

## Recommended Execution Order

Week 1:

- QAT-001 to QAT-007
- Target: auth correctness, CI safety, lint green, monitoring baseline, cache safety

Week 2:

- QAT-008 to QAT-016
- Target: resilience, offline-readiness, concurrency safety, UX/accessibility

Week 3:

- QAT-017 to QAT-020
- Target: polish, performance budget, long-term maintainability

## Release Gate Criteria

- All P0 tasks completed
- At least 70 percent of P1 tasks completed
- `pnpm lint`, `pnpm typecheck`, web build, and android build all green
- No open critical defects in auth, hire flow, or notification delivery
