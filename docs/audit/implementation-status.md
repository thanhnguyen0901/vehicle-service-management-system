# Implementation Status — Vehicle Service Management System

> Cập nhật: 27/06/2026
> Phiên bản MVP: FR-01 → FR-19

---

## Tổng quan tiến độ

```
Backend  ███████████████████░  ~95%  (Auth/User/Customer/Vehicle/ServiceCatalog/Parts/Appointment/WorkOrder/Inventory/Part Usage/Invoice/Payment/Maintenance History/Reminder/Reports + shared infra)
Frontend ███████████████████░  ~95%  (auth + layout + User/Customer/Vehicle/Service/Parts/Appointment/WorkOrder/Inventory/Part Usage/Invoice/Payment/Maintenance History/Reminder/Reports)
Schema   ██████████████████░░  ~90%  (15/15 bảng, đã bổ sung CustomerType và Part.unit; còn thiếu migration file chính thức)
Infra    ████████████████████  100%  (filters, guards, pipes, interceptors, health endpoint)
E2E      ██████████████████░░  Auth/User/Customer/Vehicle/Service/Parts/Appointment/WorkOrder/Inventory/Part Usage/Invoice/Payment/Maintenance History/Reminder/Reports specs pass
```

**Recheck 27/06/2026:**
- ✅ Reports FR-18 DONE: backend report API cho revenue, work orders, top services, top parts và low stock với RBAC/Zod.
- ✅ Revenue tính theo payment thực thu trong khoảng ngày; date range `to` bao gồm toàn bộ ngày được chọn.
- ✅ Frontend Reports DONE: menu/route `/dashboard/reports`, filter ngày, KPI và bảng report dùng API thật.
- ✅ `reports.spec.ts` pass cho dữ liệu doanh thu, top service, top part và low-stock.
- ✅ Backend build pass; frontend build pass; full Playwright regression pass 15/15.
- ▶️ Active slice tiếp theo: Audit Log API/UI (FR-19).
- ✅ Reminder FR-17 DONE: backend CRUD/list/filter + mark sent với RBAC và Zod.
- ✅ Reminder chặn tạo nhắc khi xe không thuộc khách hàng đã chọn.
- ✅ Frontend Reminder DONE: menu/route `/dashboard/reminders`, filter chưa nhắc/đến hạn/đã nhắc, tạo/sửa/xóa và đánh dấu đã nhắc.
- ✅ `reminders.spec.ts` pass cho tạo nhắc đến hạn, search, mark sent và validation xe/khách.
- ✅ Backend build pass; frontend build pass; full Playwright regression pass 14/14.
- ✅ Maintenance History FR-16 DONE: backend API `/api/v1/maintenance-history` với filter `customerId`, `vehicleId`, `search`, RBAC và Zod.
- ✅ Response trả lịch sử work order đã `Delivered` kèm xe, khách hàng, service items, part usages, invoice và payments.
- ✅ Frontend Maintenance History DONE: menu/route `/dashboard/maintenance-history`, filter khách hàng/xe/search, table và detail dialog dùng API thật.
- ✅ `maintenance-history.spec.ts` pass cho case có lịch sử và empty history.
- ✅ Backend build pass; frontend build pass; full Playwright regression pass 13/13.

**Recheck 25/06/2026:**
- ✅ Payment FR-15 DONE: backend create payment + payment history trong invoice response, RBAC và Zod.
- ✅ Hỗ trợ thanh toán nhiều lần; trạng thái `Paid` khi tổng payment bằng `totalAmount`.
- ✅ Payment và cập nhật Invoice status chạy trong transaction `Serializable`; chặn overpayment và invoice đã paid.
- ✅ Work Order chỉ được chuyển `Delivered` khi có invoice `Paid`.
- ✅ Frontend Payment panel DONE: số đã trả/còn lại, form phương thức/mã giao dịch và lịch sử thanh toán.
- ✅ `payments.spec.ts` pass; full Playwright regression pass 12/12.
- ✅ Backend build pass; frontend build pass.
- ▶️ Active slice tiếp theo: Maintenance History (FR-16).
- ✅ Invoice FR-14 DONE: backend list/detail/create + RBAC + Zod validation.
- ✅ Chỉ tạo từ Work Order `ReadyForDelivery`, có dòng tính tiền và chưa có invoice.
- ✅ Snapshot service items và part usages thành immutable `InvoiceLine` trong cùng Prisma transaction.
- ✅ Tổng tiền tính từ lines, discount và tax; duplicate invoice được chặn cả business check và unique constraint.
- ✅ Work Order đã có invoice không còn được sửa service item hoặc part usage.
- ✅ Frontend Invoice DONE: menu/route/list/create/detail/API thật, tìm kiếm và lọc trạng thái.
- ✅ `invoices.spec.ts` pass; full Playwright regression pass 11/11.
- ✅ Backend build pass; frontend build pass.
- ▶️ Active slice tiếp theo: Payment (FR-15).

**Recheck 24/06/2026:**
- ✅ Part Usage FR-13 DONE: backend add/update/delete + RBAC + Zod validation.
- ✅ Mỗi thao tác usage cập nhật tồn kho và ghi `InventoryTransaction` trong cùng Prisma transaction.
- ✅ Sửa quantity chỉ áp dụng phần chênh lệch; đổi part hoàn part cũ và trừ part mới; xóa usage hoàn tồn kho.
- ✅ Chặn thiếu tồn, phụ tùng ngưng hoạt động và chỉnh sửa trên work order Delivered/Cancelled.
- ✅ Frontend Part Usage tích hợp trong Work Order detail, gắn usage với từng service item và snapshot đơn giá.
- ✅ `part-usages.spec.ts` pass; full Playwright regression pass 10/10.
- ✅ Backend build pass; frontend build pass.
- ▶️ Active slice tiếp theo: Invoice (FR-14).
- ✅ Inventory Transaction FR-12 DONE: backend import/export/adjustment/list + RBAC + Zod validation.
- ✅ Cập nhật tồn kho và tạo lịch sử chạy trong cùng Prisma transaction; chặn xuất/điều chỉnh làm tồn âm và chặn phụ tùng ngưng hoạt động.
- ✅ Frontend DONE: menu/route/page/API thật, lọc theo phụ tùng/loại, hiển thị tồn và lịch sử giao dịch.
- ✅ `inventory-transactions.spec.ts` pass: nhập, xuất, điều chỉnh, lọc và kiểm tra insufficient stock.
- ✅ Backend build pass; frontend build pass.
- ✅ Full Playwright regression pass 9/9.
- ▶️ Active slice tiếp theo: Part Usage (FR-13).

**Recheck 23/06/2026:**
- ✅ Work Order slice DONE: backend create/list/detail/status/items + RBAC + Zod validation + state machine.
- ✅ Work Order frontend DONE: menu/route/page/API thật, tạo phiếu từ lịch hẹn hoặc walk-in, xem chi tiết, đổi trạng thái, thêm/sửa/xóa hạng mục dịch vụ.
- ✅ `work-orders.spec.ts` pass.
- ✅ `npm run test:e2e` trong `apps/frontend` pass: `auth.spec.ts`, `users.spec.ts`, `customers.spec.ts`, `vehicles.spec.ts`, `services.spec.ts`, `parts.spec.ts`, `appointments.spec.ts`, `work-orders.spec.ts` (8/8).
- ✅ Backend build pass sau Work Order.
- ✅ Frontend build pass sau Work Order.
- ▶️ Active slice tiếp theo: Inventory Transaction (FR-12).
- ✅ Appointment slice DONE: backend create/list/detail/update/cancel/delete + RBAC + Zod validation.
- ✅ Appointment frontend DONE: menu/route/page/API thật, chọn xe thật, list/search/filter/create/update/cancel/delete flow.
- ✅ `appointments.spec.ts` pass.
- ✅ `npm run test:e2e` trong `apps/frontend` pass: `auth.spec.ts`, `users.spec.ts`, `customers.spec.ts`, `vehicles.spec.ts`, `services.spec.ts`, `parts.spec.ts`, `appointments.spec.ts` (7/7).
- ✅ Backend build pass.
- ✅ Frontend build pass.
- ✅ Work Order đã được triển khai hoàn tất ngày 23/06/2026.

**Recheck 22/06/2026:**
- ✅ Docker Postgres dev đã chạy được qua port host `5434`.
- ✅ Đã sync schema bằng `npx prisma db push`.
- ✅ Đã seed account admin mặc định.
- ✅ `npm run test:e2e` trong `apps/frontend` pass: `auth.spec.ts`, `users.spec.ts` (2/2).
- ✅ Backend build pass.
- ✅ Frontend build pass.
- ✅ Đã thêm checklist triển khai theo vertical slice tại `docs/audit/vertical-slice-implementation-checklist.md`.
- ✅ Customer slice DONE: schema CustomerType + backend CRUD/search + frontend UI + Playwright customer flow.
- ✅ Vehicle slice DONE: backend CRUD/search/history endpoint + frontend UI + Playwright vehicle flow.
- ✅ Service Catalog slice DONE: backend CRUD/toggle + frontend UI + Playwright service flow.
- ✅ Parts Catalog slice DONE: schema `Part.unit` + backend CRUD/toggle/low-stock filter + frontend UI + Playwright parts flow.
- ✅ `npm run test:e2e` trong `apps/frontend` pass: `auth.spec.ts`, `users.spec.ts`, `customers.spec.ts`, `vehicles.spec.ts`, `services.spec.ts`, `parts.spec.ts` (6/6).
- ✅ Backend build pass sau Parts.
- ✅ Frontend build pass sau Parts.
- ✅ Appointment đã được triển khai hoàn tất ngày 23/06/2026.

**Recheck 16/06/2026:**
- ✅ Backend build pass.
- ✅ Frontend build pass.
- ✅ Đã sửa `UserController.changePassword` để trả HTTP 403 qua `ForbiddenException`.
- ✅ Đã thêm `GET /api/v1/health` phục vụ readiness cho Playwright.
- ✅ Đã thêm frontend `UserManagementPage` tích hợp API thật `/users`.
- ✅ Đã thêm Playwright config + specs cho Auth và User Management.
- ✅ Blocker DB local credential/port đã được xử lý ngày 22/06/2026 bằng port host `5434`.

---

## 1. Infrastructure & Shared — ✅ DONE

| File | Mô tả |
|---|---|
| `src/main.ts` | NestJS bootstrap, helmet, cookie-parser, CORS, global prefix `/api/v1` |
| `src/app.module.ts` | AppModule + ConfigModule (global) + ThrottlerModule (100 req/min) |
| `src/prisma/prisma.service.ts` | PrismaClient singleton, onModuleInit connect |
| `src/prisma/prisma.module.ts` | Global PrismaModule, exported cho toàn app |
| `src/common/filters/global-exception.filter.ts` | Bắt HttpException + ZodError + PrismaError → `{ error: { code, message, details, timestamp } }` |
| `src/common/pipes/zod-validation.pipe.ts` | ZodValidationPipe dùng per-route `@Body(new ZodValidationPipe(schema))` |
| `src/common/guards/jwt-auth.guard.ts` | JwtAuthGuard (passport-jwt, đọc từ HttpOnly cookie `access_token`) |
| `src/common/guards/roles.guard.ts` | RolesGuard — kiểm tra `user.role` vs `@Roles(...)` metadata |
| `src/common/interceptors/audit.interceptor.ts` | Ghi AuditLog cho mọi POST/PUT/PATCH/DELETE |
| `src/common/decorators/roles.decorator.ts` | `@Roles(...roles)` decorator |
| `src/common/decorators/current-user.decorator.ts` | `@CurrentUser()` param decorator |

---

## 2. Database Schema — ✅ 15/15 bảng, ⚠️ 1 field thiếu

| Bảng | Model | Trạng thái |
|---|---|---|
| `user_accounts` | `UserAccount` | ✅ |
| `customers` | `Customer` | ✅ Đã có `type` (Individual/Corporate), `companyName`, `taxCode` |
| `vehicles` | `Vehicle` | ✅ |
| `appointments` | `Appointment` | ✅ |
| `work_orders` | `WorkOrder` | ✅ |
| `work_order_items` | `WorkOrderItem` | ✅ |
| `services` | `Service` | ✅ |
| `parts` | `Part` | ✅ |
| `part_usages` | `PartUsage` | ✅ |
| `inventory_transactions` | `InventoryTransaction` | ✅ |
| `invoices` | `Invoice` | ✅ |
| `invoice_lines` | `InvoiceLine` | ✅ |
| `payments` | `Payment` | ✅ |
| `maintenance_reminders` | `MaintenanceReminder` | ✅ |
| `audit_logs` | `AuditLog` | ✅ |

**Patch FR-04 đã áp dụng vào Prisma schema:**
```prisma
enum CustomerType {
  Individual
  Corporate
}

model Customer {
  // ... thêm vào:
  type        CustomerType @default(Individual)
  companyName String?      @map("company_name") @db.VarChar(150)
  taxCode     String?      @map("tax_code")     @db.VarChar(20)
}
```

---

## 3. Backend Modules

### ✅ AuthModule — `src/modules/auth/`

| File | Nội dung |
|---|---|
| `auth.controller.ts` | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/me` |
| `auth.service.ts` | Login (bcrypt verify), issue access token 15m + refresh token 7d, token rotation |
| `strategies/jwt.strategy.ts` | Đọc access token từ cookie `access_token`, validate user active |
| `dto/auth.dto.ts` | `LoginSchema` (Zod), `RefreshTokenSchema` |

**Chi tiết endpoints:**
- `POST /api/v1/auth/login` — set cookie `access_token` (15m) + `refresh_token` (7d) HttpOnly SameSite=Strict
- `POST /api/v1/auth/refresh` — rotate cả 2 token
- `POST /api/v1/auth/logout` — clear cookie + xóa refresh token trong DB
- `POST /api/v1/auth/me` — trả về profile user hiện tại

---

### ✅ UserModule — `src/modules/user/`

| File | Nội dung |
|---|---|
| `user.controller.ts` | CRUD + change-password + deactivate |
| `user.service.ts` | findAll, findById, create (bcrypt hash), update, changePassword, deactivate |
| `dto/user.dto.ts` | `CreateUserSchema`, `UpdateUserSchema`, `ChangePasswordSchema` (Zod) |

**Chi tiết endpoints:**
- `GET /api/v1/users` — `[Admin, Manager]`
- `GET /api/v1/users/:id` — `[Admin, Manager]`
- `POST /api/v1/users` — `[Admin]`
- `PATCH /api/v1/users/:id` — `[Admin, Manager]`
- `PATCH /api/v1/users/:id/change-password` — chính user hoặc Admin
- `DELETE /api/v1/users/:id` — `[Admin]` (soft delete: `isActive = false`)

---

### ✅ CustomerModule — `src/modules/customer/`

**Cần cho:** FR-03, FR-04

**Endpoints đã có:**
```
GET    /api/v1/customers              [Admin, ServiceAdvisor, Manager]
GET    /api/v1/customers/:id          [Admin, ServiceAdvisor, Manager]
GET    /api/v1/customers/:id/vehicles [Admin, ServiceAdvisor, Manager]
POST   /api/v1/customers              [Admin, ServiceAdvisor]
PATCH  /api/v1/customers/:id          [Admin, ServiceAdvisor]
DELETE /api/v1/customers/:id          [Admin]
```

**DTO đã có (Zod):**
- `CreateCustomerSchema`: `fullName`, `phone`, `email?`, `address?`, `type` (Individual/Corporate), `companyName?`, `taxCode?`, `notes?`
- `UpdateCustomerSchema`: partial của trên
- `CustomerQuerySchema`: search by `phone`, `name`, `email`, `companyName`, `taxCode`, `licensePlate`

---

### ✅ VehicleModule — `src/modules/vehicle/`

**Cần cho:** FR-05

**Endpoints đã có:**
```
GET    /api/v1/vehicles               [Admin, ServiceAdvisor, Technician, Manager]
GET    /api/v1/vehicles/:id           [Admin, ServiceAdvisor, Technician, Manager]
GET    /api/v1/vehicles/:id/history   [Admin, ServiceAdvisor, Technician, InventoryClerk, Cashier, Manager]
POST   /api/v1/vehicles               [Admin, ServiceAdvisor]
PATCH  /api/v1/vehicles/:id           [Admin, ServiceAdvisor]
DELETE /api/v1/vehicles/:id           [Admin]
```

---

### ✅ AppointmentModule — `src/modules/appointment/`

**Cần cho:** FR-06

**Endpoints đã có:**
```
GET    /api/v1/appointments           [Admin, ServiceAdvisor, Technician, Manager] filter by search/date range/status
GET    /api/v1/appointments/:id       [Admin, ServiceAdvisor, Technician, Manager]
POST   /api/v1/appointments           [ServiceAdvisor, Admin]
PATCH  /api/v1/appointments/:id       update status (Scheduled→Arrived, Cancelled)
DELETE /api/v1/appointments/:id       [Admin]
```

**Business rules đã có:**
- Validate DTO bằng Zod.
- `createdBy` lấy từ user hiện tại.
- Không cho cập nhật lịch đã `Cancelled`.
- Chỉ cho chuyển `Scheduled → Arrived` hoặc `Scheduled → Cancelled`.

---

### ✅ WorkOrderModule — `src/modules/work-order/`

**Cần cho:** FR-07, FR-08, FR-09 — **module quan trọng nhất**

**Endpoints đã có:**
```
GET    /api/v1/work-orders            [mọi role] filter by search/status/vehicle
GET    /api/v1/work-orders/:id        [mọi role]
POST   /api/v1/work-orders            [Admin, ServiceAdvisor] tạo từ appointment hoặc walk-in
PATCH  /api/v1/work-orders/:id/status [Technician, ServiceAdvisor, Admin] — state machine
POST   /api/v1/work-orders/:id/items  [Technician, ServiceAdvisor, Admin] thêm hạng mục dịch vụ
PATCH  /api/v1/work-orders/:id/items/:itemId [Technician, ServiceAdvisor, Admin]
DELETE /api/v1/work-orders/:id/items/:itemId [Technician, ServiceAdvisor, Admin]
POST   /api/v1/work-orders/:id/part-usages [Admin, ServiceAdvisor, Technician, InventoryClerk]
PATCH  /api/v1/work-orders/:id/part-usages/:usageId [Admin, ServiceAdvisor, Technician, InventoryClerk]
DELETE /api/v1/work-orders/:id/part-usages/:usageId [Admin, ServiceAdvisor, Technician, InventoryClerk]
```

**State machine đã có:**
```
Received → Diagnosing → Repairing ⇄ WaitingParts → ReadyForDelivery → Delivered
                                                                      → Cancelled (từ mọi state trừ Delivered)
```

**Business rules đã có:**
- Tạo work order từ appointment hoặc walk-in vehicle.
- Tạo từ appointment chạy trong transaction và tự chuyển appointment sang `Arrived`.
- Không cho tạo work order từ appointment đã hủy hoặc appointment đã có work order.
- Không cho sửa item khi work order đã `Delivered` hoặc `Cancelled`.
- Hạng mục dịch vụ tự tính `amount = quantity * unitPrice`.
- Không cho xóa service item khi vẫn còn part usage liên kết.
- Part usage trừ/hoàn tồn và ghi inventory transaction atomically.
- Work order đã có invoice không cho sửa service item hoặc part usage.
- Work order chỉ được chuyển `Delivered` khi invoice đã `Paid`.

---

### ✅ ServiceCatalogModule — `src/modules/service-catalog/`

**Cần cho:** FR-10

**Endpoints đã có:**
```
GET    /api/v1/services               public trong app (mọi role)
GET    /api/v1/services/:id
POST   /api/v1/services               [Admin, Manager]
PATCH  /api/v1/services/:id           [Admin, Manager]
PATCH  /api/v1/services/:id/toggle    bật/tắt isActive
```

---

### ✅ InventoryModule — `src/modules/inventory/`

**Cần cho:** FR-11, FR-12, FR-13

**FR-11 Parts Catalog đã có:**
```
GET    /api/v1/parts                  + filter low-stock (stockQuantity <= reorderLevel)
GET    /api/v1/parts/:id
POST   /api/v1/parts                  [Admin, InventoryClerk]
PATCH  /api/v1/parts/:id              [Admin, InventoryClerk]
PATCH  /api/v1/parts/:id/toggle       [Admin, InventoryClerk]
DELETE /api/v1/parts/:id              [Admin, InventoryClerk] soft deactivate
```

**FR-12 Inventory Transaction đã có:**
```
POST   /api/v1/inventory/import       nhập kho (quantityDelta > 0)
POST   /api/v1/inventory/export       xuất kho thủ công (quantityDelta < 0)
POST   /api/v1/inventory/adjustment   điều chỉnh (quantityDelta ± )
GET    /api/v1/inventory/transactions filter by partId, type, date
```

**Business rules FR-12 đã có:**
- Chỉ `Admin` và `InventoryClerk` được ghi giao dịch; mọi role đăng nhập được xem lịch sử.
- Cập nhật `Part.stockQuantity` và tạo `InventoryTransaction` trong cùng Prisma transaction.
- Tồn khởi tạo hoặc thay đổi từ danh mục phụ tùng cũng sinh giao dịch `Adjustment`.
- Không cho xuất hoặc điều chỉnh làm tồn kho âm.
- Không cho giao dịch với phụ tùng đã ngưng hoạt động.

**Business rules FR-13 đã có:**
- Part usage gắn với một `WorkOrderItem`, lưu quantity và snapshot unit price.
- Create/update/delete chạy trong Prisma transaction cùng cập nhật stock và inventory ledger.
- Tăng quantity chỉ trừ phần chênh lệch; giảm quantity hoàn phần chênh lệch.
- Đổi part hoàn toàn bộ part cũ rồi trừ part mới; xóa usage hoàn tồn.
- Không cho tồn âm hoặc dùng part đã ngưng hoạt động.

---

### ✅ InvoiceModule — `src/modules/invoice/`

**Cần cho:** FR-14, FR-15

**FR-14 endpoints đã có:**
```
GET    /api/v1/invoices               list/search/filter [mọi role]
GET    /api/v1/invoices/:id           detail + immutable lines [mọi role]
POST   /api/v1/invoices               từ workOrderId → snapshot InvoiceLines [Cashier, Admin]
```

**Business rules FR-14 đã có:**
- Chỉ Work Order `ReadyForDelivery` và có ít nhất một service/part line được lập hóa đơn.
- Mỗi Work Order chỉ có một Invoice; duplicate được chặn bằng business validation và DB unique.
- Service items và part usages được snapshot thành `InvoiceLine` trong cùng Prisma transaction.
- `totalAmount = sum(lines.amount) - discount + tax`, không cho tổng âm.
- Không có endpoint sửa/xóa InvoiceLine; Work Order đã invoiced bị khóa phần billable data.

**FR-15 endpoint đã có:**
```
POST   /api/v1/invoices/:id/payments  ghi nhận thanh toán [Cashier, Admin]
```

**Business rules FR-15 đã có:**
- Invoice detail/list trả payment history để tính tổng đã trả và số còn lại.
- Cho phép thanh toán nhiều lần; payment phải dương và không vượt số còn lại.
- Tạo Payment và cập nhật Invoice status/paidAt trong transaction `Serializable`.
- Khi tổng payment bằng `totalAmount`, invoice chuyển `Paid`; invoice Paid không nhận thêm payment.
- Chỉ `Admin` và `Cashier` được ghi nhận thanh toán.

---

### ✅ MaintenanceHistoryModule — `src/modules/maintenance-history/`

**Cần cho:** FR-16

**Endpoints đã có:**
```
GET    /api/v1/maintenance-history    filter customerId/vehicleId/search [mọi role]
```

**Business rules FR-16 đã có:**
- Chỉ trả các Work Order đã `Delivered` để phản ánh lịch sử bảo dưỡng hoàn tất.
- Query được theo khách hàng, phương tiện hoặc keyword biển số/tên khách hàng/SĐT/công ty.
- Response gom đủ vehicle/customer, service items, part usages, invoice summary và payment history cho màn hình tra cứu.

---

### ✅ ReminderModule — `src/modules/reminder/`

**Cần cho:** FR-17

**Endpoints đã có:**
```
GET    /api/v1/reminders              filter search/customerId/vehicleId/isSent/dueFrom/dueTo [mọi role]
GET    /api/v1/reminders/:id
POST   /api/v1/reminders              [ServiceAdvisor, Admin]
PATCH  /api/v1/reminders/:id          [ServiceAdvisor, Admin]
PATCH  /api/v1/reminders/:id/send     đánh dấu đã nhắc (isSent=true, sentAt=now)
DELETE /api/v1/reminders/:id          [Admin]
```

**Business rules FR-17 đã có:**
- Reminder luôn gắn với customer và vehicle thật.
- Chặn tạo/cập nhật nếu vehicle không thuộc customer đã chọn.
- Mark sent cập nhật `isSent=true` và `sentAt=now`.
- List hỗ trợ due list bằng filter `dueTo` và trạng thái `isSent=false`.

---

---

### ✅ ReportModule — `src/modules/report/`

**Cần cho:** FR-18

**Endpoints đã có:**
```
GET    /api/v1/reports/revenue        doanh thu theo khoảng ngày [Admin, Manager]
GET    /api/v1/reports/work-orders    số phiếu theo trạng thái, theo kỳ [Admin, Manager]
GET    /api/v1/reports/top-services   top N dịch vụ theo doanh thu/số lần [Admin, Manager]
GET    /api/v1/reports/top-parts      top N phụ tùng theo số lần sử dụng [Admin, Manager]
GET    /api/v1/reports/low-stock      parts có stockQuantity <= reorderLevel [Admin, Manager]
```

**Business rules FR-18 đã có:**
- Revenue tính theo `Payment.paidAt` và tổng amount thực thu.
- Work order report group theo `WorkOrder.status`.
- Top services/parts tính từ work order đã có invoice trong khoảng ngày.
- Low stock trả phụ tùng active có `stockQuantity <= reorderLevel`.
- Không dùng raw SQL; aggregate bằng Prisma query/groupBy và xử lý trong service.

---

## 4. Frontend Pages

### ✅ Auth & Layout

| File | Trạng thái |
|---|---|
| `features/auth/LoginPage.tsx` | ✅ Formik + Yup, kết nối Redux action `loginRequest` |
| `features/auth/authSlice.ts` | ✅ Redux slice: login/logout/authCheck states |
| `features/auth/authSaga.ts` | ✅ Saga: login/logout/authCheck, authCheck thử refresh rồi gọi me |
| `features/auth/authApi.ts` | ✅ axios calls: login, logout, me, refresh |
| `shared/components/ProtectedRoute.tsx` | ✅ Loading khi authCheck, redirect /login nếu chưa auth |
| `shared/layouts/DashboardLayout.tsx` | ✅ Sidebar + Outlet, logout button, menu `/dashboard/users` theo role |
| `features/dashboard/DashboardHome.tsx` | ✅ Placeholder cards (data hardcoded `—`) |
| `services/api.ts` | ✅ Axios instance + auto refresh interceptor (retry on 401) |
| `store/index.ts` | ✅ Redux store + sagaMiddleware |
| `store/rootSaga.ts` | ✅ Root saga, combine authSaga |

### ✅ Feature Pages đã DONE theo vertical slice

| FR | Page/API | Route | Trạng thái |
|---|---|---|---|
| FR-02 | `features/users/UserManagementPage.tsx`, `features/users/userApi.ts` | `/dashboard/users` | ✅ UI + API thật đã có; ✅ Playwright user CRUD flow pass ngày 22/06/2026 |
| FR-03, FR-04 | `features/customers/CustomerListPage.tsx`, `features/customers/customerApi.ts` | `/dashboard/customers` | ✅ UI + API thật đã có; ✅ Playwright customer CRUD/search flow pass ngày 22/06/2026 |
| FR-05, FR-16 | `features/vehicles/VehicleListPage.tsx`, `features/vehicles/vehicleApi.ts` | `/dashboard/vehicles` | ✅ UI + API thật đã có; ✅ Playwright vehicle CRUD/search flow pass ngày 22/06/2026 |
| FR-10 | `features/services/ServiceCatalogPage.tsx`, `features/services/serviceCatalogApi.ts` | `/dashboard/services` | ✅ UI + API thật đã có; ✅ Playwright service CRUD/toggle flow pass ngày 22/06/2026 |
| FR-11 | `features/parts/PartsPage.tsx`, `features/parts/partApi.ts` | `/dashboard/parts` | ✅ UI + API thật đã có; ✅ Playwright parts CRUD/low-stock flow pass ngày 22/06/2026 |
| FR-06 | `features/appointments/AppointmentListPage.tsx`, `features/appointments/appointmentApi.ts` | `/dashboard/appointments` | ✅ UI + API thật đã có; ✅ Playwright appointment create/search/update/delete flow pass ngày 23/06/2026 |
| FR-07~09 | `features/work-orders/WorkOrderListPage.tsx`, `features/work-orders/workOrderApi.ts` | `/dashboard/work-orders` | ✅ UI + API thật đã có; ✅ Playwright work order create/status/items flow pass ngày 23/06/2026 |
| FR-12 | `features/inventory/InventoryTransactionsPage.tsx`, `features/inventory/inventoryApi.ts` | `/dashboard/inventory` | ✅ UI + API thật đã có; ✅ Playwright import/export/adjustment/filter flow pass ngày 24/06/2026 |
| FR-13 | Part Usage panel trong `features/work-orders/WorkOrderListPage.tsx` | `/dashboard/work-orders` | ✅ UI + API thật đã có; ✅ Playwright create/update/delete/stock rollback flow pass ngày 24/06/2026 |
| FR-14 | `features/invoices/InvoiceListPage.tsx`, `features/invoices/invoiceApi.ts` | `/dashboard/invoices` | ✅ List/create/detail + immutable snapshot; ✅ Playwright service/part lines and duplicate rejection pass ngày 25/06/2026 |
| FR-15 | Payment panel trong `features/invoices/InvoiceListPage.tsx` | `/dashboard/invoices` | ✅ Partial/final payment + history + remaining amount; ✅ Playwright overpayment/paid rejection pass ngày 25/06/2026 |
| FR-16 | `features/maintenance-history/MaintenanceHistoryPage.tsx`, `features/maintenance-history/maintenanceHistoryApi.ts` | `/dashboard/maintenance-history` | ✅ Filter khách hàng/xe/search + detail lịch sử; ✅ Playwright existing/empty history flow pass ngày 27/06/2026 |
| FR-17 | `features/reminders/ReminderListPage.tsx`, `features/reminders/reminderApi.ts` | `/dashboard/reminders` | ✅ Due list + create/edit/delete/mark sent; ✅ Playwright create/search/mark sent flow pass ngày 27/06/2026 |
| FR-18 | `features/reports/ReportsPage.tsx`, `features/reports/reportApi.ts` | `/dashboard/reports` | ✅ KPI + revenue/work order/top service/top part/low stock reports; ✅ Playwright generated report data pass ngày 27/06/2026 |

### ❌ Feature Pages chưa tạo

| FR | Page | Route |
|---|---|---|
| FR-19 | AuditLogPage | `/dashboard/audit-logs` |

**Mỗi feature page cần thêm vào store:**
- `slice.ts` — state management
- `saga.ts` — API call effects
- `api.ts` — axios calls tới backend

---

## 5. Việc cần làm tiếp theo (theo thứ tự phụ thuộc)

```
Phase 1 — Core data (không phụ thuộc gì):
  [x] Patch schema: thêm CustomerType enum + 3 fields vào Customer
  [x] prisma db push + generate cho CustomerType
  [x] CustomerModule + frontend + Playwright (FR-03, FR-04)
  [x] VehicleModule + frontend + Playwright (FR-05)
  [x] ServiceCatalogModule + frontend + Playwright (FR-10)
  [x] InventoryModule — parts CRUD + frontend + Playwright (backend FR-11)

Phase 2 — Operations (phụ thuộc Phase 1):
  [x] AppointmentModule + frontend + Playwright (FR-06)
  [x] WorkOrderModule + frontend + Playwright (FR-07~09) — bao gồm state machine
  [x] InventoryModule — nhập/xuất/điều chỉnh kho + frontend + Playwright (FR-12)
  [x] PartUsage — ghi nhận/sửa/xóa theo work order + trừ/hoàn kho + Playwright (FR-13)

Phase 3 — Billing & Reports (phụ thuộc Phase 2):
  [x] InvoiceModule + frontend + Playwright (FR-14)
  [x] Payment flow trong InvoiceModule + frontend + Playwright (FR-15)
  [x] MaintenanceHistoryModule + frontend + Playwright (FR-16)
  [x] ReminderModule + frontend + Playwright (FR-17)
  [x] ReportModule + frontend + Playwright (FR-18)

Phase 4 — Frontend pages (có thể làm song song từ Phase 1):
  [ ] Sidebar navigation đầy đủ (thêm routes vào DashboardLayout)
  [x] CustomerListPage + form dialog
  [x] VehicleListPage + form dialog
  [x] ServiceCatalogPage
  [x] PartsPage
  [x] AppointmentPage
  [x] WorkOrderListPage + detail dialog
  [x] InventoryTransactionsPage
  [x] InvoiceListPage + detail dialog
  [ ] RemindersPage
  [ ] ReportsPage (Recharts charts)
  [ ] DashboardHome — kết nối dữ liệu thật từ /reports
```

---

## 6. Cấu trúc file hiện tại

```
apps/backend/src/
├── app.module.ts                        ✅
├── health.controller.ts                 ✅
├── main.ts                              ✅
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts    ✅
│   │   └── roles.decorator.ts           ✅
│   ├── filters/
│   │   └── global-exception.filter.ts   ✅
│   ├── guards/
│   │   ├── jwt-auth.guard.ts            ✅
│   │   └── roles.guard.ts               ✅
│   ├── interceptors/
│   │   └── audit.interceptor.ts         ✅
│   └── pipes/
│       └── zod-validation.pipe.ts       ✅
├── prisma/
│   ├── prisma.module.ts                 ✅
│   └── prisma.service.ts                ✅
└── modules/
    ├── auth/                            ✅ (4 files)
    ├── user/                            ✅ (4 files)
    ├── customer/                        ✅ (4 files)
    ├── vehicle/                         ✅ (4 files)
    ├── appointment/                     ✅
    ├── work-order/                      ✅ FR-07~09 + FR-13
    ├── service-catalog/                 ✅ (4 files)
    ├── inventory/                       ✅ FR-11/FR-12
    ├── invoice/                         ✅ FR-14/FR-15
    ├── reminder/                        ❌ chưa tạo
    └── report/                          ❌ chưa tạo

apps/frontend/src/
├── App.tsx                              ✅ (routes đến Invoice)
├── main.tsx                             ✅
├── index.css                            ✅
├── vite-env.d.ts                        ✅
├── features/
│   ├── auth/                            ✅ (5 files)
│   ├── dashboard/
│   │   └── DashboardHome.tsx            ✅ (placeholder)
│   ├── users/                           ✅ UI + API thật, ✅ e2e pass
│       ├── UserManagementPage.tsx       ✅
│       └── userApi.ts                   ✅
│   ├── customers/                       ✅ UI + API thật, ✅ e2e pass
│   │   ├── CustomerListPage.tsx         ✅
│   │   └── customerApi.ts               ✅
│   └── vehicles/                        ✅ UI + API thật, ✅ e2e pass
│       ├── VehicleListPage.tsx          ✅
│       └── vehicleApi.ts                ✅
│   └── services/                        ✅ UI + API thật, ✅ e2e pass
│       ├── ServiceCatalogPage.tsx       ✅
│       └── serviceCatalogApi.ts         ✅
│   └── parts/                           ✅ UI + API thật, ✅ e2e pass
│       ├── PartsPage.tsx                ✅
│       └── partApi.ts                   ✅
│   ├── appointments/                    ✅ UI + API thật, ✅ e2e pass
│   ├── work-orders/                     ✅ UI + API thật, ✅ e2e pass
│   └── inventory/                       ✅ UI + API thật, ✅ e2e pass
│   └── invoices/                        ✅ FR-14/FR-15 UI + API thật, ✅ e2e pass
├── services/
│   └── api.ts                           ✅ (axios + refresh interceptor)
├── shared/
│   ├── components/
│   │   └── ProtectedRoute.tsx           ✅
│   └── layouts/
│       └── DashboardLayout.tsx          ✅
└── store/
    ├── index.ts                         ✅
    └── rootSaga.ts                      ✅

apps/frontend/
├── playwright.config.ts                 ✅
└── e2e/
    ├── auth.spec.ts                     ✅ pass ngày 22/06/2026
    ├── users.spec.ts                    ✅ pass ngày 22/06/2026
    ├── customers.spec.ts                ✅ pass ngày 22/06/2026
    ├── vehicles.spec.ts                 ✅ pass ngày 22/06/2026
    ├── services.spec.ts                 ✅ pass ngày 22/06/2026
    ├── parts.spec.ts                    ✅ pass ngày 22/06/2026
    ├── appointments.spec.ts             ✅ pass ngày 23/06/2026
    ├── work-orders.spec.ts              ✅ pass ngày 23/06/2026
    ├── inventory-transactions.spec.ts   ✅ pass ngày 24/06/2026
    ├── part-usages.spec.ts              ✅ pass ngày 24/06/2026
    ├── invoices.spec.ts                 ✅ pass ngày 25/06/2026
    ├── payments.spec.ts                 ✅ pass ngày 25/06/2026
    └── helpers/auth.ts                  ✅
```
