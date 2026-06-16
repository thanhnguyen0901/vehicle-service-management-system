# Implementation Status — Vehicle Service Management System

> Cập nhật: 16/06/2026  
> Phiên bản MVP: FR-01 → FR-19

---

## Tổng quan tiến độ

```
Backend  ██████░░░░░░░░░░░░░░  ~25%  (Auth/User + shared infra, chưa có business modules)
Frontend █████░░░░░░░░░░░░░░░  ~25%  (auth + layout + UserManagementPage, còn thiếu business pages)
Schema   ████████████████░░░░  ~80%  (15/15 bảng, thiếu 1 enum CustomerType)
Infra    ████████████████████  100%  (filters, guards, pipes, interceptors, health endpoint)
E2E      ██░░░░░░░░░░░░░░░░░░  setup có Auth/User specs, runtime đang blocked bởi DB local credential/port
```

**Recheck 16/06/2026:**
- ✅ Backend build pass.
- ✅ Frontend build pass.
- ✅ Đã sửa `UserController.changePassword` để trả HTTP 403 qua `ForbiddenException`.
- ✅ Đã thêm `GET /api/v1/health` phục vụ readiness cho Playwright.
- ✅ Đã thêm frontend `UserManagementPage` tích hợp API thật `/users`.
- ✅ Đã thêm Playwright config + specs cho Auth và User Management.
- ⚠️ `npm run test:e2e` chưa pass do backend không kết nối được DB: port `5432` đang trỏ tới PostgreSQL khác, credential `vsms_user` không hợp lệ.

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
| `customers` | `Customer` | ⚠️ Thiếu `type` (Individual/Corporate), `companyName`, `taxCode` — cần cho FR-04 |
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

**Patch cần thực hiện trước `prisma migrate`:**
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

### ❌ CustomerModule — CHƯA IMPLEMENT

**Cần cho:** FR-03, FR-04

**Endpoints cần tạo:**
```
GET    /api/v1/customers              [Admin, ServiceAdvisor, Manager]
GET    /api/v1/customers/:id          [Admin, ServiceAdvisor, Manager]
GET    /api/v1/customers/:id/vehicles [Admin, ServiceAdvisor, Manager]
POST   /api/v1/customers              [Admin, ServiceAdvisor]
PATCH  /api/v1/customers/:id          [Admin, ServiceAdvisor]
DELETE /api/v1/customers/:id          [Admin]
```

**DTO cần tạo (Zod):**
- `CreateCustomerSchema`: `fullName`, `phone`, `email?`, `address?`, `type` (Individual/Corporate), `companyName?`, `taxCode?`
- `UpdateCustomerSchema`: partial của trên
- `CustomerQuerySchema`: search by `phone`, `name`, `licensePlate` (cross join)

---

### ❌ VehicleModule — CHƯA IMPLEMENT

**Cần cho:** FR-05

**Endpoints cần tạo:**
```
GET    /api/v1/vehicles               [Admin, ServiceAdvisor, Technician, Manager]
GET    /api/v1/vehicles/:id           [Admin, ServiceAdvisor, Technician, Manager]
GET    /api/v1/vehicles/:id/history   → redirect sang WorkOrder filter (FR-16)
POST   /api/v1/vehicles               [Admin, ServiceAdvisor]
PATCH  /api/v1/vehicles/:id           [Admin, ServiceAdvisor]
DELETE /api/v1/vehicles/:id           [Admin]
```

---

### ❌ AppointmentModule — CHƯA IMPLEMENT

**Cần cho:** FR-06

**Endpoints cần tạo:**
```
GET    /api/v1/appointments           filter by date range, status
GET    /api/v1/appointments/:id
POST   /api/v1/appointments           [ServiceAdvisor, Admin]
PATCH  /api/v1/appointments/:id       update status (Scheduled→Arrived, Cancelled)
DELETE /api/v1/appointments/:id       [Admin]
```

---

### ❌ WorkOrderModule — CHƯA IMPLEMENT

**Cần cho:** FR-07, FR-08, FR-09 — **module quan trọng nhất**

**Endpoints cần tạo:**
```
GET    /api/v1/work-orders
GET    /api/v1/work-orders/:id
POST   /api/v1/work-orders            tạo từ appointment hoặc walk-in
PATCH  /api/v1/work-orders/:id/status [Technician, ServiceAdvisor, Admin] — state machine
POST   /api/v1/work-orders/:id/items  thêm hạng mục (service/parts)
PATCH  /api/v1/work-orders/:id/items/:itemId
DELETE /api/v1/work-orders/:id/items/:itemId
POST   /api/v1/work-orders/:id/parts  ghi nhận part usage → trừ kho (Prisma $transaction)
```

**State machine cần implement:**
```
Received → Diagnosing → Repairing ⇄ WaitingParts → ReadyForDelivery → Delivered
                                                                      → Cancelled (từ mọi state trừ Delivered)
```

---

### ❌ ServiceCatalogModule — CHƯA IMPLEMENT

**Cần cho:** FR-10

**Endpoints cần tạo:**
```
GET    /api/v1/services               public trong app (mọi role)
GET    /api/v1/services/:id
POST   /api/v1/services               [Admin, Manager]
PATCH  /api/v1/services/:id           [Admin, Manager]
PATCH  /api/v1/services/:id/toggle    bật/tắt isActive
```

---

### ❌ InventoryModule — CHƯA IMPLEMENT

**Cần cho:** FR-11, FR-12, FR-13

**Endpoints cần tạo:**
```
GET    /api/v1/parts                  + filter low-stock (stockQuantity <= reorderLevel)
GET    /api/v1/parts/:id
POST   /api/v1/parts                  [Admin, InventoryClerk]
PATCH  /api/v1/parts/:id              [Admin, InventoryClerk]
POST   /api/v1/inventory/import       nhập kho (quantityDelta > 0)
POST   /api/v1/inventory/export       xuất kho thủ công (quantityDelta < 0)
POST   /api/v1/inventory/adjustment   điều chỉnh (quantityDelta ± )
GET    /api/v1/inventory/transactions filter by partId, type, date
```

**Logic đặc biệt (FR-13):** Khi WorkOrder thêm PartUsage:
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

### ✅/⚠️ Feature Pages đã có nhưng chưa DONE theo vertical slice

| FR | Page/API | Route | Trạng thái |
|---|---|---|---|
| FR-02 | `features/users/UserManagementPage.tsx`, `features/users/userApi.ts` | `/dashboard/users` | ✅ UI + API thật đã có; ⚠️ Playwright spec đã có nhưng runtime blocked bởi DB local credential/port |

### ❌ Feature Pages chưa tạo

| FR | Page | Route |
|---|---|---|
| FR-03, FR-04 | CustomerListPage | `/dashboard/customers` |
| FR-03, FR-04 | CustomerFormPage (create/edit) | `/dashboard/customers/new`, `/:id/edit` |
| FR-05 | VehicleListPage | `/dashboard/vehicles` |
| FR-05 | VehicleFormPage | `/dashboard/vehicles/new`, `/:id/edit` |
| FR-06 | AppointmentPage | `/dashboard/appointments` |
| FR-07~09 | WorkOrderListPage | `/dashboard/work-orders` |
| FR-07~09 | WorkOrderDetailPage | `/dashboard/work-orders/:id` |
| FR-10 | ServiceCatalogPage | `/dashboard/services` |
| FR-11~12 | PartsPage | `/dashboard/parts` |
| FR-13 | InventoryTransactionPage | `/dashboard/inventory` |
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
  [ ] Patch schema: thêm CustomerType enum + 3 fields vào Customer
  [ ] prisma migrate dev --name add_customer_type
  [ ] CustomerModule (backend FR-03, FR-04)
  [ ] VehicleModule (backend FR-05)
  [ ] ServiceCatalogModule (backend FR-10)
  [ ] InventoryModule — parts CRUD (backend FR-11)

Phase 2 — Operations (phụ thuộc Phase 1):
  [ ] AppointmentModule (backend FR-06)
  [ ] WorkOrderModule (backend FR-07~09) — bao gồm state machine
  [ ] InventoryModule — nhập/xuất kho (backend FR-12, FR-13)

Phase 3 — Billing & Reports (phụ thuộc Phase 2):
  [ ] InvoiceModule (backend FR-14, FR-15)
  [ ] ReminderModule (backend FR-17)
  [ ] ReportModule (backend FR-18)

Phase 4 — Frontend pages (có thể làm song song từ Phase 1):
  [ ] Sidebar navigation đầy đủ (thêm routes vào DashboardLayout)
  [ ] CustomerListPage + CustomerFormPage
  [ ] VehicleListPage + VehicleFormPage
  [ ] ServiceCatalogPage + PartsPage
  [ ] AppointmentPage
  [ ] WorkOrderListPage + WorkOrderDetailPage (phức tạp nhất)
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
    ├── customer/                        ❌ chưa tạo
    ├── vehicle/                         ❌ chưa tạo
    ├── appointment/                     ❌ chưa tạo
    ├── work-order/                      ❌ chưa tạo
    ├── service-catalog/                 ❌ chưa tạo
    ├── inventory/                       ❌ chưa tạo
    ├── invoice/                         ❌ chưa tạo
    ├── reminder/                        ❌ chưa tạo
    └── report/                          ❌ chưa tạo

apps/frontend/src/
├── App.tsx                              ✅ (routes: /login, /dashboard, /dashboard/users)
├── main.tsx                             ✅
├── index.css                            ✅
├── vite-env.d.ts                        ✅
├── features/
│   ├── auth/                            ✅ (5 files)
│   ├── dashboard/
│   │   └── DashboardHome.tsx            ✅ (placeholder)
│   └── users/                           ✅ UI + API thật, ⚠️ e2e blocked bởi DB
│       ├── UserManagementPage.tsx       ✅
│       └── userApi.ts                   ✅
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
    ├── auth.spec.ts                     ✅ spec có, runtime blocked bởi DB
    ├── users.spec.ts                    ✅ spec có, runtime blocked bởi DB
    └── helpers/auth.ts                  ✅
```
