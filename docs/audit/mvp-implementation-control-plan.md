# MVP Implementation Control Plan

> Muc dich: lam tai lieu dieu khien trien khai code cho Vehicle Service Management System, dam bao source code bam dung `garage-thesis-report.md`, `mvp-functional-requirements.md`, `role-permission-matrix-v1.md` va trang thai hien tai trong `implementation-status.md`.
>
> Pham vi: MVP FR-01 den FR-19.
> Trang thai code hien tai: MVP vertical slices FR-01 den FR-19 da hoan thanh full flow backend/frontend/E2E. Full Playwright regression da pass 17/17 ngay 28/06/2026 sau khi reset database bang `seed:e2e`; database local da duoc reset ve bo `seed:demo` de phuc vu demo. Active slice hien tai: khong co. Viec con lai truoc release/demo la tao Prisma migration chinh thuc cho schema hien tai va chay final demo/release verification.

---

## 1. Nguon Yeu Cau Can Bam

| Tai lieu | Vai tro khi code |
|---|---|
| `docs/report/garage-thesis-report.md` | Nguon chinh ve vision, stakeholder, use case, process, business rule, API/design/testing |
| `docs/report/artifacts/mvp-functional-requirements.md` | Danh sach FR-01..FR-19 phai hoan thanh |
| `docs/report/artifacts/role-permission-matrix-v1.md` | RBAC bat buoc cho tung module |
| `docs/audit/implementation-status.md` | Trang thai da lam/chua lam va endpoint du kien |

Quy tac uu tien khi co mau thuan:
1. Yeu cau chuc nang va business rule trong `garage-thesis-report.md`.
2. Danh sach FR va role matrix trong `docs/report/artifacts/`.
3. Thiet ke code hien co neu khong trai voi bao cao.

---

## 2. Definition of Done Chung

Mot FR/module chi duoc xem la hoan thanh khi dat du cac dieu kien sau:

| Nhom | Tieu chi |
|---|---|
| Backend | Co NestJS module/controller/service/dto, validation Zod, Prisma query/transaction dung nghiep vu |
| API | Endpoint dung prefix `/api/v1`, response/error format nhat quan, status code dung |
| RBAC | Moi endpoint co `JwtAuthGuard` va `@Roles(...)` dung role matrix, tru auth public/login |
| Database | Schema/migration dap ung field, unique, relation, enum, khong pha du lieu nghiep vu |
| Frontend | Moi backend module hoan thanh phai co UI tuong ung: route, page, form/list/detail can thiet, goi API that, xu ly loading/error/empty state |
| FE-BE integration | UI phai integrate truc tiep voi endpoint backend moi; khong tinh xong neu con mock/static data cho chuc nang do |
| Playwright UI test | Moi module co UI phai co Playwright test cho luong chinh tren frontend, chay qua UI va verify du lieu tu backend |
| Audit | Thao tac tao/sua/xoa/chot nghiep vu quan trong duoc ghi audit log |
| Test/build | Backend build pass, frontend build pass, Playwright test cua module pass; logic rui ro cao co unit/integration test hoac checklist manual ro rang |
| Traceability | Cap nhat `implementation-status.md` sau khi hoan thanh module/phase |

Nguyen tac trien khai bat buoc:
- Khong lam backend theo kieu tach roi roi de frontend lam sau qua lau.
- Moi module backend khi merge/ket thuc dot code phai di kem UI frontend tuong ung, API integration that va Playwright test cho UI do.
- Neu module backend la nen tang khong co UI rieng, phai co UI tieu thu no trong module gan nhat hoac co ghi chu ro trong `implementation-status.md`.
- Mot phase chi duoc xem la pass khi ca 3 lop Backend + Frontend + Playwright cung pass.

---

## 3. Module Implementation Status

Trang thai dung de cap nhat lien tuc:

| Status | Y nghia |
|---|---|
| DONE | Da co backend, frontend UI integrate backend that, Playwright UI test pass, build pass |
| IN_PROGRESS | Dang implement; co mot phan backend/frontend/test nhung chua dat Definition of Done |
| NEW | Chua implement hoac moi co trong plan |
| BLOCKED | Dang bi chan boi schema, dependency, moi truong, hoac quyet dinh nghiep vu |

Bang status hien tai, dua tren code da recheck:

| Module / Area | FR | Backend | Frontend UI | Playwright UI Test | Overall | Ghi chu |
|---|---|---|---|---|---|---|
| Infrastructure & shared | Cross-cutting | DONE | N/A | N/A | DONE | Main bootstrap, health endpoint, PrismaModule, guards, filters, pipes, interceptor da co |
| Auth | FR-01 | DONE | DONE | DONE | DONE | Login/logout/me/refresh da co; auth Playwright spec pass ngay 22/06/2026 |
| User management | FR-02 | DONE | DONE | DONE | DONE | Backend CRUD + UserManagement UI da co; Playwright user CRUD spec pass ngay 22/06/2026 |
| Customer | FR-03, FR-04 | DONE | DONE | DONE | DONE | Corporate customer CRUD/search flow pass ngay 22/06/2026 |
| Vehicle | FR-05, FR-16 | DONE | DONE | DONE | DONE | Vehicle CRUD/search flow pass ngay 22/06/2026 |
| Service catalog | FR-10 | DONE | DONE | DONE | DONE | Service CRUD/toggle flow pass ngay 22/06/2026 |
| Parts catalog | FR-11 | DONE | DONE | DONE | DONE | Parts CRUD/low-stock flow pass ngay 22/06/2026 |
| Appointment | FR-06 | DONE | DONE | DONE | DONE | Appointment create/update/cancel/list flow pass ngay 23/06/2026 |
| Work order | FR-07, FR-08, FR-09 | DONE | DONE | DONE | DONE | Work order create/status/items flow pass ngay 23/06/2026 |
| Inventory transactions | FR-12 | DONE | DONE | DONE | DONE | Import/export/adjustment/history flow pass ngay 24/06/2026 |
| Part usage | FR-13 | DONE | DONE | DONE | DONE | Record/update/remove with transactional stock flow pass ngay 24/06/2026 |
| Invoice | FR-14 | DONE | DONE | DONE | DONE | Immutable service/part snapshot flow pass ngay 25/06/2026 |
| Payment | FR-15 | DONE | DONE | DONE | DONE | Partial/final payment and overpayment rejection flow pass ngay 25/06/2026 |
| Maintenance history | FR-16 | DONE | DONE | DONE | DONE | Query by customer/vehicle flow pass ngay 27/06/2026 |
| Reminder | FR-17 | DONE | DONE | DONE | DONE | Due list and sent marker flow pass ngay 27/06/2026 |
| Reports | FR-18 | DONE | DONE | DONE | DONE | Revenue, top service/part, low stock report flow pass ngay 27/06/2026 |
| Audit log API/UI | FR-19 | DONE | DONE | DONE | DONE | Audit read API/UI and filter flow pass ngay 27/06/2026 |
| Dashboard real data | FR-18 | DONE | DONE | DONE | DONE | Dashboard KPI dung API that, flow pass ngay 27/06/2026 |
| Clean seed data | Demo/E2E | DONE | N/A | DONE | DONE | `seed:e2e` va `seed:demo` da pass ngay 28/06/2026; account demo ghi tai `docs/demo/seed-data.md` |

Trang thai tong ket:
- Active slice: khong co.
- MVP feature slices: DONE.
- Database schema: du bang/model cho MVP, con thieu Prisma migration file chinh thuc.
- Final release/demo gate: chua chot, can migration chinh thuc + final verification.

Quy tac cap nhat status:
- Khi bat dau lam module: doi `Overall` thanh `IN_PROGRESS`.
- Khi backend xong nhung UI/test chua xong: van giu `IN_PROGRESS`.
- Chi doi `Overall` thanh `DONE` khi Backend + Frontend UI + Playwright UI Test deu `DONE`.
- Neu gap chan: doi `Overall` thanh `BLOCKED` va ghi ro ly do o cot `Ghi chu`.

---

## 4. Thu Tu Trien Khai Bat Buoc

### Phase 0 - Nen Tang va Schema

| Task | FR | Viec can lam | Tieu chi nghiem thu |
|---|---|---|---|
| Fix User change-password error | FR-01, FR-02 | Doi return object loi sang `ForbiddenException` | User khong phai Admin khong doi duoc password nguoi khac, HTTP 403 |
| Patch Customer schema | FR-04 | Them `CustomerType`, `type`, `companyName`, `taxCode` | DONE bang Prisma schema + db push ngay 22/06/2026 |
| RBAC baseline | FR-01, FR-02 | Chuan hoa role enum theo Prisma: `Admin`, `ServiceAdvisor`, `Technician`, `InventoryClerk`, `Cashier`, `Manager` | Tat ca endpoint moi dung role enum hien co |

### Phase 1 - Du Lieu Nen

| Module | FR | Backend bat buoc | Frontend bat buoc | Business rule |
|---|---|---|---|---|
| CustomerModule | FR-03, FR-04 | CRUD, search name/phone/licensePlate, get vehicles | Customer list, create/edit form, detail vehicles | Khach doanh nghiep co companyName/taxCode/address de lap hoa don |
| VehicleModule | FR-05, FR-16 | CRUD, search licensePlate/customer, history endpoint | Vehicle list, form, history view | Bien so unique; moi xe thuoc mot customer |
| ServiceCatalogModule | FR-10 | CRUD, toggle isActive | Service catalog page | Chi service active moi duoc chon vao work order moi |
| InventoryModule - parts | FR-11 | CRUD parts, low-stock filter | Parts page | Quan ly gia von, gia ban, ton kho, reorder level |

### Phase 2 - Van Hanh Dich Vu

| Module | FR | Backend bat buoc | Frontend bat buoc | Business rule |
|---|---|---|---|---|
| AppointmentModule | FR-06 | Create/update/cancel/list/detail, filter date/status | Appointment list/calendar/form | Lich hen da huy khong duoc chuyen truc tiep thanh work order |
| WorkOrderModule | FR-07, FR-08, FR-09 | Create from appointment/walk-in, items CRUD, status update | Work order list/detail, item editor, status controls | State machine chi cho transition hop le |
| Inventory transaction | FR-12 | Import/export/adjustment, transaction history | Inventory transaction page | Khong lam ton kho am |
| PartUsage | FR-13 | Record/confirm usage, tru kho trong Prisma transaction | Add part usage trong work order | Neu ton kho khong du thi reject; phu tung dung phai vao hoa don |

### Phase 3 - Hoa Don, Thanh Toan, Lich Su

| Module | FR | Backend bat buoc | Frontend bat buoc | Business rule |
|---|---|---|---|---|
| InvoiceModule | FR-14 | Create invoice from workOrder, list/detail | Invoice list/detail/create from WO | Snapshot description/quantity/unitPrice/amount tai thoi diem lap |
| PaymentModule/Invoice payments | FR-15 | Record payment, list payments, update invoice status | Payment form/history | Chi Cashier/Admin ghi thanh toan; trang thai phu thuoc tong tien da tra |
| Maintenance history | FR-16 | Query history by vehicle/customer | History page in customer/vehicle detail | Lich su lay tu work order da co ket qua/phat sinh nghiep vu |
| ReminderModule | FR-17 | CRUD/list due/send marker | Reminders page | Co trang thai da nhac/chua nhac, dueDate |

### Phase 4 - Bao Cao va Audit

| Module | FR | Backend bat buoc | Frontend bat buoc | Business rule |
|---|---|---|---|---|
| ReportModule | FR-18 | Revenue, work order summary, top services, top parts, low stock | Reports dashboard/charts | Manager xem full; role khac xem pham vi phu hop |
| AuditLog API | FR-19 | Read audit logs, filters user/action/date/entity | Audit log page | Audit append-only, khong update/delete qua API |
| Dashboard real data | FR-18 | API summary neu can | DashboardHome lay du lieu that | Khong con hardcoded `—` cho KPI chinh |

### Phase 5 - Tich Hop va Demo Flow

| Flow | FR bao phu | Tieu chi pass |
|---|---|---|
| Login va doi mat khau | FR-01 | DONE - auth/user Playwright flow da pass |
| Tiep nhan xe | FR-03, FR-04, FR-05, FR-06, FR-07 | DONE - customer -> vehicle -> appointment -> work order da co UI/API/E2E |
| Xu ly ky thuat | FR-08, FR-09 | DONE - service items va state machine da co UI/API/E2E |
| Xuat phu tung | FR-11, FR-12, FR-13 | DONE - inventory transaction/part usage cap nhat ton kho atomically va E2E pass |
| Lap hoa don | FR-14 | DONE - invoice snapshot tu work order da co UI/API/E2E |
| Thanh toan | FR-15 | DONE - partial/final payment va overpayment rejection da co UI/API/E2E |
| Lich su/nhac lich | FR-16, FR-17 | DONE - maintenance history/reminder da co UI/API/E2E |
| Bao cao/audit | FR-18, FR-19 | DONE - reports/dashboard/audit log da co UI/API/E2E |
| Seed demo data | Demo | DONE - `seed:demo` tao full-flow data va account demo |
| Release verification | Release | TODO - can Prisma migration chinh thuc va final demo/release verification |

---

## 5. RBAC Endpoint Checklist

| Module | Read | Create | Update | Delete/Special |
|---|---|---|---|---|
| Auth | All authenticated/self | Login public | Change own password/Admin | Logout self |
| User | Admin, Manager; role khac read limited neu can | Admin | Admin, Manager | Admin soft deactivate |
| Customer | All roles read theo matrix | Admin, ServiceAdvisor | Admin, ServiceAdvisor | Admin |
| Vehicle | All roles read | Admin, ServiceAdvisor | Admin, ServiceAdvisor, Technician note-only neu implement | Admin |
| Appointment | All roles read | Admin, ServiceAdvisor | Admin, ServiceAdvisor | Admin/ServiceAdvisor cancel theo matrix |
| WorkOrder | All roles read | Admin, ServiceAdvisor | Admin, ServiceAdvisor, Technician phan ky thuat | Admin/Manager special approval neu can |
| ServiceCatalog | All roles read | Admin, Manager | Admin, Manager | Toggle inactive thay vi hard delete |
| Parts | All roles read | Admin, InventoryClerk | Admin, InventoryClerk | Khong hard delete neu da phat sinh |
| InventoryTransaction | All roles read phu hop | Admin, InventoryClerk | Dieu chinh bang transaction moi | Khong delete |
| PartUsage | Cashier/Manager read, Advisor/Tech/Inventory act | Advisor/Technician/Inventory/Admin | Truoc khi invoice | Khong sua sau invoice |
| Invoice | All roles read phu hop | Admin, Cashier | Admin, Cashier | Khong hard delete |
| Payment | All roles read phu hop | Admin, Cashier | Admin, Cashier theo chinh sach | Khong hard delete |
| Reminder | All roles read phu hop | Admin, ServiceAdvisor | Admin, ServiceAdvisor | Admin |
| Report | Role-specific read | None | None | None |
| AuditLog | Admin, Manager full; others limited own actions neu co | System only | None | None |

---

## 6. Business Rules Can Encode Trong Code

| Ma | Rule | Noi can enforce |
|---|---|---|
| BR-01 | Moi Vehicle phai thuoc Customer; licensePlate unique | Prisma unique + VehicleService validation |
| BR-02 | Appointment phai gan voi vehicle/customer hop le | AppointmentService |
| BR-03 | Appointment Cancelled khong duoc tao WorkOrder truc tiep | WorkOrderService.createFromAppointment |
| BR-04 | WorkOrder phai co vehicle, status, receivedAt | Prisma + DTO |
| BR-05 | Chi chuyen sang ReadyForDelivery khi hang muc bat buoc da xu ly | WorkOrderStateMachine |
| BR-06 | Chi service active moi duoc them vao WorkOrderItem moi | WorkOrderItemService |
| BR-07 | Part quantity su dung > 0 va khong lam stock am | PartUsageService transaction |
| BR-08 | PartUsage phai tao InventoryTransaction Export hoac co xac nhan quyen kho | PartUsageService/InventoryService |
| BR-09 | Mot WorkOrder chi co mot Invoice hieu luc | Prisma unique workOrderId + InvoiceService |
| BR-10 | Invoice total tinh tu InvoiceLine | InvoiceService |
| BR-11 | Invoice status phu thuoc tong Payment | PaymentService |
| BR-12 | Maintenance history lay tu WorkOrder da co ket qua nghiep vu | History query |
| BR-13 | Tao/sua/chot nghiep vu quan trong phai co audit log | AuditInterceptor/AuditModule |

---

## 7. Backend Module Template

Moi module moi nen theo khung sau:

```text
apps/backend/src/modules/<module>/
  <module>.module.ts
  <module>.controller.ts
  <module>.service.ts
  dto/<module>.dto.ts
```

Checklist khi tao endpoint:
- Controller co `@Controller(...)`, `@UseGuards(JwtAuthGuard, RolesGuard)`.
- Moi route co `@Roles(...)` dung matrix.
- DTO dung Zod schema va `ZodValidationPipe`.
- Service khong tra ve passwordHash/refreshToken.
- Write operation nhieu bang dung `prisma.$transaction`.
- Loi nghiep vu dung Nest exception, khong return object loi thu cong.
- Neu la create/update/delete/chot trang thai/thanh toan/xuat kho thi audit log phai ghi du.

---

## 8. Vertical Slice Workflow

Moi module phai duoc lam theo vertical slice, khong danh dau backend la DONE khi frontend/test chua xong.

| Buoc | Ket qua bat buoc |
|---|---|
| 1. Backend contract | DTO, endpoint, RBAC, service logic, Prisma query/transaction |
| 2. Frontend API client | `<feature>Api.ts` goi dung endpoint that qua `services/api.ts` |
| 3. Frontend state | Slice/Saga hoac pattern state hien co cho loading/error/success |
| 4. Frontend UI | Page/form/list/detail/action button tuong ung voi endpoint |
| 5. Integration check | UI thao tac duoc voi backend chay that, khong dung mock cho luong chinh |
| 6. Playwright test | Test mo UI, dang nhap role phu hop, thao tac luong chinh, verify ket qua tren man hinh |
| 7. Status update | Cap nhat `implementation-status.md` voi BE/FE/test result |

Definition of Done theo module:
- Backend endpoint pass build va logic chinh.
- Frontend UI goi duoc endpoint do.
- Playwright test cua luong UI chinh pass.
- RBAC negative case toi thieu cho action nhay cam co test hoac checklist ro.

---

## 9. Frontend Feature Template

Moi feature frontend nen theo khung sau:

```text
apps/frontend/src/features/<feature>/
  <feature>Api.ts
  <feature>Slice.ts
  <feature>Saga.ts
  pages/
  components/
```

Checklist UI:
- Co route trong `App.tsx`.
- Co menu trong `DashboardLayout.tsx`, hien/an theo role neu can.
- List page co search/filter/pagination khi du lieu co the nhieu.
- Form co validation client-side tuong ung backend DTO.
- Goi API qua `services/api.ts` de dung cookie + refresh interceptor.
- Co loading, error, empty state.
- Thanh cong/that bai co notification ro rang.

---

## 10. Playwright UI Test Requirements

Moi feature page phai co test UI tuong ung. Test di qua frontend nhu nguoi dung that, khong goi truc tiep service function.

| Feature | Playwright flow toi thieu |
|---|---|
| Auth/User | Login, logout, doi password/forbidden case neu co |
| Customer | Tao customer, search/list, edit customer |
| Vehicle | Tao vehicle cho customer, search bien so, xem detail/history |
| ServiceCatalog | Tao service, toggle active/inactive |
| Parts/Inventory | Tao part, nhap kho, xem ton kho/low stock |
| Appointment | Tao lich hen, update/cancel, filter theo ngay/status |
| WorkOrder | Tao work order, them item, doi status hop le |
| PartUsage | Them phu tung vao work order, verify ton kho giam |
| Invoice/Payment | Tao invoice tu work order, verify lines snapshot, ghi payment |
| Reminder | Tao reminder, filter due, danh dau da nhac |
| Reports | Mo report, filter date, verify KPI/chart/table co du lieu |
| AuditLog | Mo audit log bang Admin/Manager, filter action/user |

Yeu cau Playwright:
- Test phai dang nhap bang role phu hop.
- Test phai seed du lieu hoac tao du lieu qua UI/API setup ro rang.
- Test phai verify ca UI state va du lieu hien thi sau khi backend thay doi.
- Test forbidden UI/API action cho it nhat cac module nhay cam: Invoice, Payment, Inventory, AuditLog.

---

## 11. Test va Verification Checklist

| Cap do | Bat buoc toi thieu |
|---|---|
| Build | DONE - backend/frontend build da pass trong cac dot slice; can chay lai trong final release verification |
| Unit | RUI RO CON LAI - cac rule quan trong duoc bao phu chu yeu bang service logic va E2E, chua tach day du unit test |
| Integration | DONE theo UI/E2E cho Auth, Customer, Vehicle, Appointment, WorkOrder, Inventory, PartUsage, Invoice, Payment, History, Reminder, Reports, Audit |
| RBAC | DONE o muc route/role guard theo module; can smoke lai cac role demo trong final verification |
| Playwright UI | DONE - full suite pass 17/17 ngay 28/06/2026 sau `seed:e2e` |
| Manual UAT | TODO - chay demo flow tren `seed:demo` sau khi co migration chinh thuc |
| Data integrity | DONE theo E2E chinh: khong stock am, invoice snapshot, payment status; can final smoke tren demo data |

Lenh verify hien tai:

```bash
DATABASE_URL='postgresql://vsms_user:vsms_password@localhost:5434/vsms_db?schema=public' npm run seed:e2e --prefix apps/backend
DATABASE_URL='postgresql://vsms_user:vsms_password@localhost:5434/vsms_db?schema=public' FRONTEND_URL='http://localhost:5173,http://127.0.0.1:5173' VITE_API_URL='http://127.0.0.1:3000/api/v1' npm run test:e2e --prefix apps/frontend
DATABASE_URL='postgresql://vsms_user:vsms_password@localhost:5434/vsms_db?schema=public' npm run seed:demo --prefix apps/backend
```

Build:

```bash
npm run build --prefix apps/backend
npm run build --prefix apps/frontend
```

---

## 12. Cap Nhat Trang Thai Sau Moi Dot Code

Sau moi module/phase, cap nhat:
1. `docs/audit/implementation-status.md`
   - Module nao da xong.
   - Endpoint nao da co.
   - Trang thai frontend page.
   - Playwright UI test nao da co va ket qua pass/fail.
   - Build/test result.
2. Neu code thay doi so voi bao cao:
   - Uu tien sua code de khop bao cao.
   - Chi sua bao cao khi yeu cau nghiep vu thuc su thay doi.

---

## 13. Roadmap Ngan Gon Tiep Theo

Thu tu nen lam ngay:
1. Tao Prisma migration chinh thuc cho schema hien tai.
2. Chay migration tren database local sach va verify Prisma client.
3. Chay `seed:e2e` + full Playwright regression 17/17.
4. Chay `seed:demo` va manual smoke full-flow demo bang account trong `docs/demo/seed-data.md`.
5. Cap nhat `implementation-status.md`, `vertical-slice-implementation-checklist.md`, `daily-progress-log.md` voi ket qua final verification.
6. Commit/push final release/demo verification.
