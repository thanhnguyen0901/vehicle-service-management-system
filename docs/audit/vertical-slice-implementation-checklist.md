# Vertical Slice Implementation Checklist

> Last updated: 2026-06-22 20:18 +07
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
| 7 | Appointment | FR-06 | IN_PROGRESS | TODO | TODO | TODO | IN_PROGRESS | Active slice: appointment create/update/cancel/list |
| 8 | Work Order | FR-07, FR-08, FR-09 | TODO | TODO | TODO | TODO | TODO | Core business slice, includes state flow |
| 9 | Inventory Transaction | FR-12 | TODO | TODO | TODO | TODO | TODO | Import/export/adjustment |
| 10 | Part Usage | FR-13 | TODO | TODO | TODO | TODO | TODO | Must decrement stock transactionally |
| 11 | Invoice | FR-14 | TODO | TODO | TODO | TODO | TODO | Snapshot invoice lines from work order |
| 12 | Payment | FR-15 | TODO | TODO | TODO | TODO | TODO | Cashier/Admin only |
| 13 | Maintenance History | FR-16 | TODO | TODO | TODO | TODO | TODO | Query by customer/vehicle |
| 14 | Reminder | FR-17 | TODO | TODO | TODO | TODO | TODO | Due list and sent marker |
| 15 | Reports | FR-18 | TODO | TODO | TODO | TODO | TODO | Revenue, work orders, top services/parts, low stock |
| 16 | Audit Log API/UI | FR-19 | DONE | TODO | TODO | TODO | IN_PROGRESS | Audit write interceptor exists; read API/UI missing |
| 17 | Dashboard Real Data | FR-18 | TODO | TODO | TODO | TODO | TODO | Replace placeholder KPI cards |

## Current Active Slice

Active slice: Appointment.

Exit criteria:
- [ ] Appointment backend create/update/cancel/list endpoints pass RBAC.
- [ ] Appointment frontend list/create/update/cancel flow uses real API.
- [ ] Appointment Playwright flow passes.
- [ ] Backend build passes.
- [ ] Frontend build passes.
- [ ] `implementation-status.md` updated with Appointment result.

Latest completed verification:
- [x] `auth.spec.ts` passed on 2026-06-22.
- [x] `users.spec.ts` passed on 2026-06-22.
- [x] `customers.spec.ts` passed on 2026-06-22.
- [x] `vehicles.spec.ts` passed on 2026-06-22.
- [x] `services.spec.ts` passed on 2026-06-22.
- [x] `parts.spec.ts` passed on 2026-06-22.
- [x] Backend build passed on 2026-06-22.
- [x] Frontend build passed on 2026-06-22.

Next slice after pass: Work Order.
