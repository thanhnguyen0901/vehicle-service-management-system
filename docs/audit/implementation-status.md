# Implementation Status — Vehicle Service Management System

> Cập nhật: 24/06/2026
> Phiên bản MVP: FR-01 → FR-19

---

## Tổng quan tiến độ

```
Backend  █████████████░░░░░░░  ~65%  (Auth/User/Customer/Vehicle/ServiceCatalog/Parts/Appointment/WorkOrder/Inventory Transaction + shared infra)
Frontend █████████████░░░░░░░  ~65%  (auth + layout + User/Customer/Vehicle/Service/Parts/Appointment/WorkOrder/Inventory pages)
Schema   ██████████████████░░  ~90%  (15/15 bảng, đã bổ sung CustomerType và Part.unit; còn thiếu migration file chính thức)
Infra    ████████████████████  100%  (filters, guards, pipes, interceptors, health endpoint)
E2E      ████████████░░░░░░░░  Auth/User/Customer/Vehicle/Service/Parts/Appointment/WorkOrder/Inventory specs pass
```

**Recheck 24/06/2026:**
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
GET    /api/v1/work-orders            [Admin, ServiceAdvisor, Technician, Manager] filter by search/status/vehicle
GET    /api/v1/work-orders/:id        [Admin, ServiceAdvisor, Technician, Manager]
POST   /api/v1/work-orders            [Admin, ServiceAdvisor] tạo từ appointment hoặc walk-in
PATCH  /api/v1/work-orders/:id/status [Technician, ServiceAdvisor, Admin] — state machine
POST   /api/v1/work-orders/:id/items  [Technician, ServiceAdvisor, Admin] thêm hạng mục dịch vụ
PATCH  /api/v1/work-orders/:id/items/:itemId [Technician, ServiceAdvisor, Admin]
DELETE /api/v1/work-orders/:id/items/:itemId [Technician, ServiceAdvisor, Admin]
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
- Part usage/trừ kho được tách sang FR-13 theo checklist.

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

### ✅/⚠️ InventoryModule — `src/modules/inventory/`

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

**FR-13 cần tạo tiếp:** Khi WorkOrder thêm PartUsage:
```typescript
await prisma.$transaction(async (tx) => {
  const part = await tx.part.findUnique({ where: { id }, ...lockForUpdate });
  if (part.stockQuantity < quantity) throw new ConflictException('Insufficient stock');
  await tx.part.update({ data: { stockQuantity: { decrement: quantity } } });
  await tx.partUsage.create({ ... });
  await tx.inventoryTransaction.create({ type: 'Export', quantityDelta: -quantity, ... });
});
```

---

### ❌ InvoiceModule — CHƯA IMPLEMENT

**Cần cho:** FR-14, FR-15

**Endpoints cần tạo:**
```
GET    /api/v1/invoices
GET    /api/v1/invoices/:id
POST   /api/v1/invoices               từ workOrderId → snapshot InvoiceLines [Cashier, Admin]
POST   /api/v1/invoices/:id/payments  ghi nhận thanh toán [Cashier, Admin]
GET    /api/v1/invoices/:id/payments
```

**Snapshot logic (FR-14):** Khi tạo invoice, copy `description` + `unitPrice` từ WorkOrderItems vào `InvoiceLine` — không phụ thuộc giá dịch vụ thay đổi sau này.

---

### ❌ ReminderModule — CHƯA IMPLEMENT

**Cần cho:** FR-17

**Endpoints cần tạo:**
```
GET    /api/v1/reminders              filter isSent, dueDate
GET    /api/v1/reminders/:id
POST   /api/v1/reminders              [ServiceAdvisor, Admin]
PATCH  /api/v1/reminders/:id/send     đánh dấu đã nhắc (isSent=true, sentAt=now)
DELETE /api/v1/reminders/:id          [Admin]
```

---

### ❌ ReportModule — CHƯA IMPLEMENT

**Cần cho:** FR-18

**Endpoints cần tạo:**
```
GET    /api/v1/reports/revenue        doanh thu theo khoảng ngày (group by day/month)
GET    /api/v1/reports/work-orders    số phiếu theo trạng thái, theo kỳ
GET    /api/v1/reports/top-services   top N dịch vụ theo doanh thu/số lần
GET    /api/v1/reports/top-parts      top N phụ tùng theo số lần sử dụng
GET    /api/v1/reports/low-stock      parts có stockQuantity <= reorderLevel
```

**Lưu ý:** Các query report dùng Prisma `groupBy` + `aggregate`, không raw SQL.

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

### ❌ Feature Pages chưa tạo

| FR | Page | Route |
|---|---|---|
| FR-13 | Part Usage trong WorkOrder detail | `/dashboard/work-orders` |
| FR-14~15 | InvoicePage | `/dashboard/invoices` |
| FR-14~15 | InvoiceDetailPage | `/dashboard/invoices/:id` |
| FR-16 | MaintenanceHistoryPage | `/dashboard/vehicles/:id/history` |
| FR-17 | RemindersPage | `/dashboard/reminders` |
| FR-18 | ReportsPage | `/dashboard/reports` |

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
  [ ] PartUsage — ghi nhận phụ tùng theo work order và trừ kho (FR-13)

Phase 3 — Billing & Reports (phụ thuộc Phase 2):
  [ ] InvoiceModule (backend FR-14, FR-15)
  [ ] ReminderModule (backend FR-17)
  [ ] ReportModule (backend FR-18)

Phase 4 — Frontend pages (có thể làm song song từ Phase 1):
  [ ] Sidebar navigation đầy đủ (thêm routes vào DashboardLayout)
  [x] CustomerListPage + form dialog
  [x] VehicleListPage + form dialog
  [x] ServiceCatalogPage
  [x] PartsPage
  [x] AppointmentPage
  [x] WorkOrderListPage + detail dialog
  [x] InventoryTransactionsPage
  [ ] InvoicePage + InvoiceDetailPage
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
    ├── work-order/                      ✅
    ├── service-catalog/                 ✅ (4 files)
    ├── inventory/                       ✅ FR-11/FR-12, ⚠️ FR-13 chưa xong
    ├── invoice/                         ❌ chưa tạo
    ├── reminder/                        ❌ chưa tạo
    └── report/                          ❌ chưa tạo

apps/frontend/src/
├── App.tsx                              ✅ (routes đến Inventory Transaction)
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
    └── helpers/auth.ts                  ✅
```
