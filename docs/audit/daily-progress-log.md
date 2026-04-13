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
- [DONE] Đã viết đầy đủ mục 1.1 Vision trong `docs/report/garage-thesis-report.md`
- [DONE] Đã chuẩn hóa lại văn phong học thuật cho mục 1.1 và hoàn thiện mục 1.2 Stakeholder trong `docs/report/garage-thesis-report.md`
- [DONE] Đã hoàn thiện đầy đủ mục 1.3 System Context trong `docs/report/garage-thesis-report.md` (system boundary, external actors/systems, luồng thông tin vào/ra, context diagram)
- [DONE] Đã thiết lập bộ quy tắc viết báo cáo chính thức tại `docs/report/report-writing-rules.md`
- [DONE] Đã tạo đặc tả làm việc với AI cho báo cáo tại `docs/ai/report-agent-spec.md`
- [DONE] Đã tạo file hướng dẫn Copilot tại `.github/copilot-instructions.md`
- [DONE] Đã mở rộng AI flow từ 1 lệnh lên 3 lệnh chuẩn: `Viết báo cáo mục X`, `Cập nhật progress`, `push code` trong `docs/ai/report-agent-spec.md`
- [DONE] Đã đồng bộ `.github/copilot-instructions.md` để hỗ trợ 2 lệnh mới (`Cập nhật progress`, `push code`) theo đúng quy trình stage/commit/push

### Đang làm
- [IN_PROGRESS] Rà soát tính nhất quán giữa các mục 1.1, 1.2, 1.3 trước khi chuyển sang nhóm 2.x

### Kế hoạch ngày mai
- [TODO] Hoàn thành mục 2.1 Use Case (danh sách use case theo FR + use case diagram tổng quan)
- [TODO] Hoàn thành mục 2.2 Process Modeling cho 3 luồng chính (tiếp nhận xe, work order, hóa đơn/thanh toán)
- [TODO] Bắt đầu mục 2.3 Data Modeling (domain model và ERD concept mức cao)

### Rủi ro/Ghi chú
- Cần giữ scope MVP ổn định, tránh mở rộng sớm
- Chưa bắt đầu implement code theo đúng phase-gate
