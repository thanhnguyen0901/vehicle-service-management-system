# Vertical Slice Implementation Checklist

> Last updated: 2026-06-25 11:30 +07
>
> Scope: MVP FR-01 to FR-19.
>
> Rule: implement one business slice at a time. A slice is only complete when database, backend, frontend, Playwright E2E, build/test verification, and progress documentation are all done.

## Working Rules

- Do not move to the next feature while the current feature has a failing UI/business flow.
- Every business feature must include database changes, backend APIs, frontend UI integration, and Playwright E2E coverage.
- Frontend must call real backend endpoints for the main flow. Mock/static data does not count as complete.
- RBAC must follow `docs/report/artifacts/role-permission-matrix-v1.md`.
- Important create/update/delete/finalize/payment/inventory actions must be auditable.
- After each slice, update `docs/audit/implementation-status.md` and this checklist with pass/fail results.
- If a blocker appears, mark the current slice as `BLOCKED` with the exact reason before starting unrelated work.

## Completion Checklist Per Slice

Use this checklist for each module before marking it `DONE`.

- [ ] Database: Prisma schema/migration/seed updated if required.
- [ ] Backend: NestJS module/controller/service/dto implemented.
- [ ] Backend: Zod validation and Nest exceptions implemented.
- [ ] Backend: RBAC guards and roles match the permission matrix.
- [ ] Backend: business rules enforced with transactions where needed.
- [ ] Frontend: route/menu/page/components implemented.
- [ ] Frontend: API client/state/loading/error/empty/success states implemented.
- [ ] E2E: Playwright covers the main UI business flow.
- [ ] E2E: sensitive/forbidden case covered when applicable.
- [ ] Verification: backend build passes.
- [ ] Verification: frontend build passes.
- [ ] Verification: Playwright flow passes.
- [ ] Docs: implementation status and checklist updated.

## MVP Slice Order

| Order | Slice | FR | DB | Backend | Frontend | E2E | Overall | Notes |
|---:|---|---|---|---|---|---|---|---|
| 0 | Infrastructure/shared | Cross-cutting | DONE | DONE | N/A | N/A | DONE | Bootstrap, Prisma, guards, filters, pipes, audit interceptor, health endpoint |
| 1 | Auth | FR-01 | DONE | DONE | DONE | DONE | DONE | Playwright auth flow passed on 2026-06-22 |
| 2 | User & RBAC | FR-02 | DONE | DONE | DONE | DONE | DONE | Playwright user CRUD flow passed on 2026-06-22 |
| 3 | Customer | FR-03, FR-04 | DONE | DONE | DONE | DONE | DONE | Corporate customer CRUD/search E2E passed on 2026-06-22 |
| 4 | Vehicle | FR-05, FR-16 | DONE | DONE | DONE | DONE | DONE | Vehicle CRUD/search E2E passed on 2026-06-22 |
| 5 | Service Catalog | FR-10 | DONE | DONE | DONE | DONE | DONE | Service catalog CRUD/toggle E2E passed on 2026-06-22 |
| 6 | Parts Catalog | FR-11 | DONE | DONE | DONE | DONE | DONE | Parts CRUD/low-stock E2E passed on 2026-06-22 |
| 7 | Appointment | FR-06 | DONE | DONE | DONE | DONE | DONE | Appointment create/update/cancel/list E2E passed on 2026-06-23 |
| 8 | Work Order | FR-07, FR-08, FR-09 | DONE | DONE | DONE | DONE | DONE | Work order create/status/items E2E passed on 2026-06-23 |
| 9 | Inventory Transaction | FR-12 | DONE | DONE | DONE | DONE | DONE | Import/export/adjustment/history E2E passed on 2026-06-24 |
| 10 | Part Usage | FR-13 | DONE | DONE | DONE | DONE | DONE | Record/update/remove with transactional stock E2E passed on 2026-06-24 |
| 11 | Invoice | FR-14 | DONE | DONE | DONE | DONE | DONE | Immutable service/part snapshot E2E passed on 2026-06-25 |
| 12 | Payment | FR-15 | DONE | DONE | DONE | DONE | DONE | Partial/final payment and overpayment rejection E2E passed on 2026-06-25 |
| 13 | Maintenance History | FR-16 | TODO | TODO | TODO | TODO | TODO | Query by customer/vehicle |
| 14 | Reminder | FR-17 | TODO | TODO | TODO | TODO | TODO | Due list and sent marker |
| 15 | Reports | FR-18 | TODO | TODO | TODO | TODO | TODO | Revenue, work orders, top services/parts, low stock |
| 16 | Audit Log API/UI | FR-19 | DONE | TODO | TODO | TODO | IN_PROGRESS | Audit write interceptor exists; read API/UI missing |
| 17 | Dashboard Real Data | FR-18 | TODO | TODO | TODO | TODO | TODO | Replace placeholder KPI cards |

## Current Active Slice

Active slice: None. Payment is complete; next slice is Maintenance History.

Next slice exit criteria:
- [ ] Maintenance History backend returns complete vehicle/customer service history.
- [ ] Maintenance History frontend search/detail flow uses real API.
- [ ] Maintenance History Playwright flow covers existing and empty history.
- [ ] Backend build passes.
- [ ] Frontend build passes.
- [ ] `implementation-status.md` updated with Maintenance History result.

Latest completed verification:
- [x] `auth.spec.ts` passed on 2026-06-22.
- [x] `users.spec.ts` passed on 2026-06-22.
- [x] `customers.spec.ts` passed on 2026-06-22.
- [x] `vehicles.spec.ts` passed on 2026-06-22.
- [x] `services.spec.ts` passed on 2026-06-22.
- [x] `parts.spec.ts` passed on 2026-06-22.
- [x] `appointments.spec.ts` passed on 2026-06-23.
- [x] `work-orders.spec.ts` passed on 2026-06-23.
- [x] `inventory-transactions.spec.ts` passed on 2026-06-24.
- [x] `part-usages.spec.ts` passed on 2026-06-24.
- [x] `invoices.spec.ts` passed on 2026-06-25.
- [x] `payments.spec.ts` passed on 2026-06-25.
- [x] Backend build passed on 2026-06-22.
- [x] Frontend build passed on 2026-06-22.
- [x] Backend build passed on 2026-06-23.
- [x] Frontend build passed on 2026-06-23.
- [x] Full frontend Playwright suite passed on 2026-06-23 (7/7).
- [x] Full frontend Playwright suite passed on 2026-06-23 (8/8).
- [x] Backend build passed on 2026-06-24.
- [x] Frontend build passed on 2026-06-24.
- [x] Full frontend Playwright suite passed on 2026-06-24 (9/9).
- [x] Full frontend Playwright suite passed on 2026-06-24 (10/10).
- [x] Backend build passed on 2026-06-25.
- [x] Frontend build passed on 2026-06-25.
- [x] Full frontend Playwright suite passed on 2026-06-25 (11/11).
- [x] Full frontend Playwright suite passed on 2026-06-25 (12/12).

Next slice after pass: Reminder.
