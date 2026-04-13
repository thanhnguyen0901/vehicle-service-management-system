# Copilot Instructions - Vehicle Service Management System

## Working target
Primary document to maintain: `docs/report/garage-thesis-report.md`.

## Mandatory process
When asked to write report section X:
1. Read matching guidance file in `docs/technique/`.
2. Follow writing rules in `docs/report/report-writing-rules.md`.
3. Align with project decisions in `docs/ai/report-agent-spec.md`.
4. Write directly as final report prose (not notes/checklist style).
5. Update `docs/audit/daily-progress-log.md` with completed work.

## Content constraints
- Use formal Vietnamese academic style.
- Keep consistency with approved architecture, stack, FR scope, and role matrix.
- Do not include internal-reference language such as "refer file" or "checklist note" in report prose.

## Approved project baseline
- Web app, Modular Monolith
- BE: NestJS + Prisma + PostgreSQL + Zod + JWT/bcrypt
- FE: React 18 + TS + Vite + Router v6 + RTK/Saga + Axios + PrimeReact/Tailwind
- UUIDv7 for IDs, API prefix `/api/v1`
- MVP functional scope: FR-01..FR-19
- Roles: Admin, Service Advisor, Technician, Inventory Clerk, Cashier, Manager
