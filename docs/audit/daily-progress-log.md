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
- [DONE] Rà soát tính nhất quán giữa các mục 1.1, 1.2, 1.3 trước khi chuyển sang nhóm 2.x
- [DONE] Hoàn thành mục 2.1 Use Case trong `docs/report/garage-thesis-report.md` (actor, danh sách UC theo FR, diagram tổng quan, đặc tả UC trọng yếu, traceability)
- [DONE] Tinh gọn mục 2.1 Use Case từ 18 UC xuống 14 UC nghiệp vụ, tránh tách dư theo từng FR và làm rõ Customer là actor phụ trong MVP nội bộ
- [DONE] Hoàn thành mục 2.2 Process Modeling trong `docs/report/garage-thesis-report.md` với 3 quy trình chính: tiếp nhận xe, xử lý work order, lập hóa đơn/thanh toán
- [DONE] Hoàn thành mục 2.3 Data Modeling trong `docs/report/garage-thesis-report.md` với entity catalog, conceptual ERD, relationship catalog và business rules
- [DONE] Hoàn thành mục 3.1 Functional Requirement chi tiết trong `docs/report/garage-thesis-report.md` cho FR-01..FR-19, kèm CRUD matrix và traceability

### Kế hoạch ngày mai
- [DONE] Bắt đầu mục 3.2 Non Functional Requirement (bảo mật, hiệu năng, độ tin cậy, khả năng bảo trì/vận hành)

### Rủi ro/Ghi chú
- Cần giữ scope MVP ổn định, tránh mở rộng sớm
- Chưa bắt đầu implement code theo đúng phase-gate

---

## 2026-06-14
### Đã hoàn thành hôm nay
- [DONE] Hoàn thành mục 3.2 Non Functional Requirement trong `docs/report/garage-thesis-report.md`
  - 24 NFR theo 5 nhóm: Hiệu năng (P01..P04), Bảo mật (S01..S07), Độ sẵn sàng/Tin cậy (A01..A04), Khả năng sử dụng (U01..U04), Ràng buộc/Bảo trì (C01..C05)
  - Mỗi NFR có: phát biểu đo được, mức ưu tiên, lý do nghiệp vụ, phương pháp kiểm chứng, nguồn tham chiếu
  - Tổng hợp bảng NFR và quan hệ với quyết định kiến trúc

### Kế hoạch ngày mai
- [DONE] Bắt đầu mục 4.3 Architecture (Modular Monolith layer/module design, luồng xử lý)

### Rủi ro/Ghi chú
- Cần giữ scope MVP ổn định, tránh mở rộng sớm
- Chưa bắt đầu implement code theo đúng phase-gate

---

## 2026-06-14 (tiếp 4)
### Đã hoàn thành hôm nay
- [DONE] Hoàn thành mục 4.3 Architecture trong `docs/report/garage-thesis-report.md`
  - Lý do chọn Modular Monolith với bảng so sánh vs Microservices
  - Kiến trúc logic 3 tier (Presentation/Application/Data) với sơ đồ text
  - Cấu trúc 11 NestJS module với trách nhiệm và entity sở hữu
  - Kiến trúc nội bộ module (Controller/Service/Repository/DTO pattern)
  - Global middleware pipeline (JWT → RBAC → Zod → Audit → Exception Filter)
  - Cấu trúc thư mục frontend (features/pages/services/hooks)
  - Luồng dữ liệu Redux Saga
  - Sơ đồ kiến trúc tổng quan (Mermaid)
  - Bảng điểm tích hợp bên ngoài (MVP vs tương lai)
  - 4 ADR: Modular Monolith, Global Middleware, Prisma Transaction, Append-only AuditLog

### Kế hoạch ngày mai
- [DONE] Bắt đầu mục 5.1 Component → DONE trong cùng phiên

### Rủi ro/Ghi chú
- Cần giữ scope MVP ổn định, tránh mở rộng sớm
- Chưa bắt đầu implement code theo đúng phase-gate

---

## 2026-06-14 (tiếp 5)
### Đã hoàn thành hôm nay
- [DONE] Hoàn thành mục 5.1 Component trong `docs/report/garage-thesis-report.md`
  - Phân rã chi tiết tất cả 11 NestJS module thành các component (Controller/Service/StateMachine/Repository)
  - Danh mục component table: tên, lớp, trách nhiệm, interface chính, phụ thuộc
  - Phân rã 10 feature module frontend + shared components (DataTable, FormField, ProtectedRoute, ...)
  - Sơ đồ Mermaid flowchart quan hệ phụ thuộc backend toàn bộ
  - Ma trận FR coverage (FR-01..FR-19 × component chính)
  - Bảng phân tích độ phức tạp component (WorkOrderService, PartUsageService, InvoiceService ở mức Cao)

### Kế hoạch ngày mai
- [TODO] Bắt đầu mục 5.2 API Design (endpoint list theo module, request/response format, error codes)

### Rủi ro/Ghi chú
- WorkOrderStateMachine và PartUsageService cần unit test kỹ — đã ghi chú trong 5.1.6
- ReportService cần index strategy — sẽ chi tiết hóa ở 5.3

---

## 2026-06-14 (tiếp 6)
### Đã hoàn thành hôm nay
- [DONE] Hoàn thành mục 5.2 API Design trong `docs/report/garage-thesis-report.md`
  - Tổng quan API: base URL, giao thức, format, xác thực, versioning, rate limiting, CORS
  - Cơ chế xác thực JWT HTTP-only cookie + role-endpoint permission table
  - Định dạng phản hồi chuẩn (thành công + lỗi), bảng HTTP status code, catalog error code (11 mã)
  - Đặc tả endpoint đầy đủ cho 10 module (Auth, Users, Customers, Appointments, WorkOrders, ServiceCatalog, Inventory, Invoices, Reports, Reminders, AuditLogs)
  - Request/response body ví dụ cho các endpoint phức tạp
  - Pagination/filtering chuẩn (page, limit, search, from, to, sortBy, sortOrder)
  - Versioning và backward compatibility policy

### Kế hoạch ngày mai
- [DONE] Bắt đầu mục 5.3 Database Architecture → DONE trong cùng phiên

### Rủi ro/Ghi chú
- API spec cần sync với Prisma schema ở 5.3 — giữ nhất quán tên trường
- ReportService aggregate query cần index — sẽ xác định cụ thể ở 5.3

---

## 2026-06-14 (tiếp 7)
### Đã hoàn thành hôm nay
- [DONE] Hoàn thành mục 5.3 Database Architecture trong `docs/report/garage-thesis-report.md`
  - Nền tảng: PostgreSQL 16, Prisma 5.x, UTF-8, connection pool max 10
  - Quy ước đặt tên (snake_case, plural table, idx_/uq_ prefix)
  - Chiến lược UUIDv7: time-ordered, native UUID type, lý do chọn vs BIGSERIAL/UUIDv4
  - Physical ERD (Mermaid) đầy đủ 15 bảng với quan hệ
  - Đặc tả chi tiết 15 bảng: kiểu dữ liệu, nullability, mặc định, ràng buộc
  - Chiến lược index: 16 index (UNIQUE + BTREE + composite + partial)
  - State machine WorkOrder và điều kiện dữ liệu bổ sung
  - Phân quyền data access theo module (single schema, enforce tầng application)
  - Ước tính khối lượng dữ liệu MVP 1 năm + ngưỡng cân nhắc partitioning

### Kế hoạch ngày mai
- [DONE] Bắt đầu mục 5.4 Security Design → DONE trong cùng phiên

### Rủi ro/Ghi chú
- `audit_logs` là append-only — cần enforce ở tầng application (không cho UPDATE/DELETE)
- `parts.stock_quantity` CHECK ≥ 0 cần test kỹ khi PartUsageService trừ tồn kho

---

## 2026-06-14 (tiếp 8)
### Đã hoàn thành hôm nay
- [DONE] Hoàn thành mục 5.4 Security Design trong `docs/report/garage-thesis-report.md`
  - Tổng quan bảo mật: 5 mục tiêu + phân tích STRIDE rút gọn 6 mối đe dọa × biện pháp
  - Xác thực JWT HTTP-only cookie: luồng login/refresh/logout, cấu hình JWT (HS256, 15min/7d), chính sách mật khẩu bcrypt cost 12
  - Phân quyền RBAC: JwtAuthGuard + RolesGuard, ma trận chi tiết 6 role × 20 resource action
  - Bảo vệ dữ liệu: HTTPS/TLS 1.3, HSTS, quy tắc không log 4 loại dữ liệu nhạy cảm, phân loại 4 cấp
  - Kiểm soát bảo mật: Zod validation, Prisma parameterized query, XSS/CSRF/Helmet (6 header), rate-limit 3 tier, CORS config
  - Audit Log: 12 action code, AuditInterceptor append-only, lưu trữ ≥ 2 năm
  - Secrets Management: 4 loại secret, env var, không commit .env
  - Giám sát: 4 ngưỡng cảnh báo, quy trình phản ứng sự cố 5 bước

### Kế hoạch ngày mai
- [DONE] Bắt đầu mục 6.1 Class Design → DONE trong cùng phiên

### Rủi ro/Ghi chú
- Phần 5 hoàn thành toàn bộ (5.1–5.4)
- Bắt đầu phần 6 — thiết kế chi tiết; cần nhất quán với 5.1 component và 5.3 DB schema

---

## 2026-06-14 (tiếp 9)
### Đã hoàn thành hôm nay
- [DONE] Hoàn thành mục 6.1 Class Design trong `docs/report/garage-thesis-report.md`
  - Tổ chức class theo package/namespace (4 tầng: controller/service/repository/dto)
  - Class diagram chi tiết Module WorkOrder: WorkOrderController, WorkOrderService, WorkOrderStateMachine, WorkOrderRepository, WorkOrderItemService, WorkOrderItemRepository + DTO + Enum
  - Class diagram Module Inventory: PartUsageService, InventoryTransactionService, PartService, 3 Repository + DTO + Enum
  - Class diagram Module Auth & User: AuthService, JwtStrategy, JwtAuthGuard, RolesGuard, UserService, UserRepository + value objects (JwtPayload, UserContext) + Role enum
  - Class diagram Module Invoice: InvoiceService, PaymentService, 2 Repository + DTO + Enum
  - Design patterns: Repository, Strategy (StateMachine), DI, DTO, Guard, Interceptor, Snapshot (7 patterns)
  - Mapping entity ↔ DB table (15 class)
  - SOLID principles áp dụng (S/O/L/I/D)

### Kế hoạch ngày mai
- [DONE] Bắt đầu mục 6.2 Sequence Diagram → DONE trong cùng phiên

### Rủi ro/Ghi chú
- Lưu ý đặt tên: `Service` entity → đổi thành `RepairService` để tránh trùng NestJS annotation
- 6.2 cần vẽ sequence cho ít nhất 3 luồng nghiệp vụ quan trọng

---

## 2026-06-14 (tiếp 10)
### Đã hoàn thành hôm nay
- [DONE] Hoàn thành mục 6.2 Sequence Diagram trong `docs/report/garage-thesis-report.md`
  - Chọn 5 use case cho sequence (SD-01..SD-05) với lý do
  - SD-01: Login flow (bcrypt, JWT, cookie) + SD-01b: Refresh token với token rotation
  - SD-02: Tạo phiếu DV + thêm hạng mục (assertWorkOrderNotLocked, AuditInterceptor)
  - SD-03: Cập nhật trạng thái (WorkOrderStateMachine assertTransition, kịch bản valid + invalid)
  - SD-04: Ghi nhận phụ tùng trong Prisma $transaction (SELECT FOR UPDATE, trừ tồn kho, insert inventory_transaction)
  - SD-05: Lập hóa đơn (snapshot, $transaction, cập nhật WO status) + thanh toán (assertNotPaid)
  - Ma trận cross-reference Use Case × Class × Method

### Kế hoạch ngày mai
- [DONE] Bắt đầu mục 6.3 UI High Fidelity → DONE trong cùng phiên

### Rủi ro/Ghi chú
- SD-04 dùng SELECT FOR UPDATE — cần kiểm tra Prisma hỗ trợ trong $transaction (đã xác nhận: rawQuery hoặc lockWith)
- 6.3 chỉ cần mô tả wireframe high-fidelity bằng text + layout spec, không cần ảnh thật

---

## 2026-06-14 (tiếp 11)
### Đã hoàn thành hôm nay
- [DONE] Hoàn thành mục 6.3 UI High Fidelity trong `docs/report/garage-thesis-report.md`
  - Design System: color palette 13 token (WCAG AA), typography 7 level (Inter), spacing scale, border radius, shadow 3 cấp, badge màu WorkOrder status
  - SCR-01 Đăng nhập: centered card layout, states (default/error/loading)
  - SCR-07 Danh sách phiếu DV: AppLayout sidebar + DataTable + filter bar + pagination
  - SCR-08 Chi tiết phiếu DV: header card + hạng mục + phụ tùng + summary sticky bar
  - SCR-14 Lập hóa đơn: modal dialog với snapshot review + confirm action
  - SCR-16 Dashboard báo cáo: KPI row + Recharts LineChart + PieChart + low-stock table
  - Component states: Button (4 variant × 5 state), Input (5 state), DataTable row (4 state)
  - Responsive breakpoints: Desktop/Tablet/Mobile cho 6 component type

### Kế hoạch ngày mai
- [DONE] Bắt đầu mục 6.4 Database Detail Design → DONE trong cùng phiên

### Rủi ro/Ghi chú
- 6.4 là mục chi tiết nhất về DB — sẽ expand từ 5.3, thêm DDL-style spec + constraint + trigger nếu có
- Cần nhất quán tên cột giữa 5.3, 6.1, 6.4

---

## 2026-06-14 (tiếp 12)
### Đã hoàn thành hôm nay
- [DONE] Hoàn thành mục 6.4 Database Detail Design trong `docs/report/garage-thesis-report.md`
  - Tổng quan DB: PostgreSQL 16, extension pgcrypto + pg_stat_statements, Prisma Migrate
  - Data dictionary chi tiết 5 bảng quan trọng nhất: user_accounts, work_orders, parts, invoice_lines, audit_logs (mô tả nghiệp vụ, valid values, example, nhạy cảm)
  - Catalog action codes AuditLog (14 codes)
  - Index strategy bổ sung: 14 FK index + 9 business query index (có thể kèm partial index, composite)
  - Business integrity constraints: 7 ràng buộc mức DB + Application
  - Cấu trúc DDL migration Prisma (4 migration file theo thứ tự, rollback order)
  - Sensitive Data Catalog: 6 cột nhạy cảm với biện pháp bảo vệ

### Kế hoạch ngày mai
- [DONE] Bắt đầu mục 7.1 Algorithm → DONE trong cùng phiên

### Rủi ro/Ghi chú
- Phần 6 hoàn thành toàn bộ (6.1–6.4)
- Bắt đầu phần 7 — implementation specs; 7.1 cần pseudocode chi tiết cho các thuật toán nghiệp vụ

---

## 2026-06-14 (tiếp 13)
### Đã hoàn thành hôm nay
- [DONE] Hoàn thành mục 7.1 Algorithm trong `docs/report/garage-thesis-report.md`
  - Xác định 5 thuật toán: ALG-01..ALG-05 với FR mapping và class method
  - ALG-01 buildInvoiceLines: snapshot aggregate O(n+m), edge cases (phụ tùng chưa xác nhận, service bị vô hiệu hóa)
  - ALG-02 recordUsage: Prisma $transaction + SELECT FOR UPDATE, race condition handling, edge cases đồng thời
  - ALG-03 assertTransition: VALID_TRANSITIONS hash map O(1), điều kiện bổ sung khi Delivered
  - ALG-04 generateCode: LPAD sequence trong ngày + UNIQUE collision retry tối đa 3 lần
  - ALG-05 findDue: partial index query, MVP scope (thủ công, không auto-send)
  - Bảng tổng hợp độ phức tạp O-notation + tối ưu áp dụng

### Kế hoạch ngày mai
- [DONE] Bắt đầu mục 7.2..7.5 → DONE toàn bộ trong cùng phiên

### Rủi ro/Ghi chú
- ALG-02 SELECT FOR UPDATE cần verify Prisma syntax: `prisma.$queryRaw` hoặc Prisma 5 `lockingClause`
- 7.2 cần nhất quán với catalog error code đã định nghĩa ở 5.2.3

---

## 2026-06-14 (tiếp 14 — HOÀN THÀNH TOÀN BỘ BÁO CÁO)
### Đã hoàn thành hôm nay
- [DONE] Hoàn thành mục 7.2 Exception Design
  - Exception hierarchy (NestJS HttpException → AppBusinessException → các exception con)
  - Catalog 22 error code: HTTP status, class, thông báo người dùng, developer context
  - GlobalExceptionFilter: mapping, log level, format response chuẩn
  - Xử lý lỗi theo tầng + Prisma error code mapping (P2002/P2025/P2003/P2034)
  - Quy tắc logging bảo mật (không log password/token)

- [DONE] Hoàn thành mục 7.3 Testing
  - Testing pyramid: Unit 70% / Integration 20% / E2E 10%
  - Unit test scope: 8 class quan trọng + ví dụ test case StateMachine (TC-UT-01..04)
  - Integration test: 8 endpoint nhóm với các trường hợp positive/negative
  - UAT 7 kịch bản demo (FR-01..FR-19 phủ đầy đủ)
  - Non-functional testing: load test k6, security OWASP ZAP

- [DONE] Hoàn thành mục 7.4 Development Standard
  - Naming convention: Backend TS (PascalCase/camelCase/UPPER_SNAKE) + Frontend + DB
  - Code style: Prettier config + ESLint rules (no-any, complexity max 10)
  - Git workflow: GitHub Flow + Conventional Commits
  - PR checklist: Code quality / Testing / Security / Database / Docs
  - Cấu trúc thư mục chuẩn backend + frontend

- [DONE] Hoàn thành mục 7.5 Implementation Plan
  - 6 phase: P0 Nền tảng → P1 KH/Xe → P2 WorkOrder → P3 Kho → P4 HĐ → P5 Báo cáo → P6 QA
  - Timeline 8 tuần (~40 ngày làm việc), task granular với ước tính
  - Critical path xác định: Auth → WO StateMachine → PartUsage → Invoice
  - 5 rủi ro với biện pháp phòng ngừa

### Trạng thái báo cáo
- **[DONE] TOÀN BỘ 26 mục (1.1 → 7.5) đã hoàn thành**
- File: `docs/report/garage-thesis-report.md`
- Phủ đầy đủ FR-01..FR-19, 6 roles, Modular Monolith, PostgreSQL 16, NestJS, React

### Kế hoạch tiếp theo
- Chuyển sang phase implement code theo đúng Implementation Plan (7.5)
- Bắt đầu từ Phase 0: setup monorepo, Docker, Prisma migration, AuthModule
