# NHẬT KÝ AUDIT HẰNG NGÀY - VEHICLE SERVICE MANAGEMENT SYSTEM

## Mục đích
- Ghi lại hôm nay đã làm gì
- Chốt ngày mai làm gì tiếp
- Theo dõi tiến độ theo từng đề mục 1.1 -> 7.5

## Quy ước
- Status: `DONE`, `IN_PROGRESS`, `TODO`, `BLOCKED`
- Mỗi ngày tối thiểu 1 dòng tổng kết + 1 kế hoạch ngày tiếp theo

---

## 2026-04-13
### Đã hoàn thành hôm nay
- [DONE] Chốt hướng xây dựng: Web app
- [DONE] Chốt stack kỹ thuật:
  - Backend: NestJS, Prisma, Zod, JWT + bcrypt
  - Security middleware: cookie-parser, cors, helmet, rate-limit
  - Frontend: React 18 + TypeScript, Vite, React Router v6
  - State/data/UI: Redux Toolkit + Saga, Axios, PrimeReact + Tailwind, Formik + Yup, i18next, Recharts
- [DONE] Chốt architecture: Modular Monolith
- [DONE] Chốt API convention: `/api/v1`, format lỗi thống nhất
- [DONE] Chốt DB ID strategy: UUIDv7 cho ID/PK/FK
- [DONE] Chốt Functional Requirements MVP: FR-01..FR-19
- [DONE] Chốt role matrix: 6 vai trò (Admin, Service Advisor, Technician, Inventory Clerk, Cashier, Manager)
- [DONE] Ghi artifact FR MVP: `docs/report/artifacts/mvp-functional-requirements.md`
- [DONE] Ghi artifact Role Matrix: `docs/report/artifacts/role-permission-matrix-v1.md`
- [DONE] Tạo file báo cáo tổng (`docs/report/garage-thesis-report.md`)
- [DONE] Tạo file audit ngày (`docs/audit/daily-progress-log.md`)

### Đang làm
- [IN_PROGRESS] Chuẩn bị viết nội dung chi tiết cho mục 1.2 Stakeholder theo đề tài garage

### Bổ sung cuối ngày
- [DONE] Đã viết đầy đủ mục 1.1 Vision trong `docs/report/garage-thesis-report.md`
- [DONE] Đã chuẩn hóa lại văn phong học thuật cho mục 1.1 và hoàn thiện mục 1.2 Stakeholder trong `docs/report/garage-thesis-report.md`
- [DONE] Đã thiết lập bộ quy tắc viết báo cáo chính thức tại `docs/report/report-writing-rules.md`
- [DONE] Đã viết lại mục 1.1 theo đúng cấu trúc chuẩn vision document (business drivers, mục tiêu/metrics, scope, constraints, assumptions, risks)
- [DONE] Đã tạo đặc tả làm việc với AI cho báo cáo tại `docs/ai/report-agent-spec.md`
- [DONE] Đã tạo file hướng dẫn Copilot tại `.github/copilot-instructions.md`

### Kế hoạch ngày mai
- [TODO] Hoàn thành nội dung chi tiết mục 1.1 Vision (có thể đưa thẳng vào báo cáo)
- [TODO] Hoàn thành nội dung chi tiết mục 1.2 Stakeholder (persona + stakeholder register)
- [TODO] Bắt đầu 1.3 System Context (system boundary + actor ngoài hệ thống)

### Rủi ro/Ghi chú
- Cần giữ scope MVP ổn định, tránh mở rộng sớm
- Chưa bắt đầu implement code theo đúng phase-gate
