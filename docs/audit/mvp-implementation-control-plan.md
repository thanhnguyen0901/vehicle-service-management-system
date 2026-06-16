# MVP Implementation Control Plan

> Muc dich: lam tai lieu dieu khien trien khai code cho Vehicle Service Management System, dam bao source code bam dung `garage-thesis-report.md`, `mvp-functional-requirements.md`, `role-permission-matrix-v1.md` va trang thai hien tai trong `implementation-status.md`.
>
> Pham vi: MVP FR-01 den FR-19.
> Trang thai code hien tai: backend da co AuthModule, UserModule, infrastructure chung va health endpoint; frontend da co login, protected route, dashboard layout, UserManagementPage; Playwright Auth/User specs da co nhung runtime dang blocked boi DB local credential/port; schema con thieu CustomerType cho FR-04.

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
| Auth | FR-01 | DONE | DONE | BLOCKED | IN_PROGRESS | Login/logout/me/refresh da co; auth Playwright spec da co nhung test runtime dang bi chan boi DB local sai credential |
| User management | FR-02 | DONE | DONE | BLOCKED | IN_PROGRESS | Backend CRUD + UserManagement UI da co; Playwright spec da co nhung test runtime dang bi chan boi DB local sai credential |
| Customer | FR-03, FR-04 | NEW | NEW | NEW | NEW | Can patch Customer schema truoc |
| Vehicle | FR-05, FR-16 | NEW | NEW | NEW | NEW | Phu thuoc Customer |
| Service catalog | FR-10 | NEW | NEW | NEW | NEW | Nen lam truoc WorkOrder item |
| Parts catalog | FR-11 | NEW | NEW | NEW | NEW | Nen lam truoc Inventory/PartUsage |
| Inventory transactions | FR-12 | NEW | NEW | NEW | NEW | Phu thuoc Parts |
| Appointment | FR-06 | NEW | NEW | NEW | NEW | Phu thuoc Customer/Vehicle |
| Work order | FR-07, FR-08, FR-09 | NEW | NEW | NEW | NEW | Module nghiep vu loi |
| Part usage | FR-13 | NEW | NEW | NEW | NEW | Phu thuoc WorkOrder + Parts + Inventory |
| Invoice | FR-14 | NEW | NEW | NEW | NEW | Phu thuoc WorkOrder/PartUsage |
| Payment | FR-15 | NEW | NEW | NEW | NEW | Phu thuoc Invoice |
| Maintenance history | FR-16 | NEW | NEW | NEW | NEW | Query tu WorkOrder/Invoice |
| Reminder | FR-17 | NEW | NEW | NEW | NEW | Co the lam sau history |
| Reports | FR-18 | NEW | NEW | NEW | NEW | Phu thuoc du lieu invoice/workorder/inventory |
| Audit log API/UI | FR-19 | IN_PROGRESS | NEW | NEW | IN_PROGRESS | AuditInterceptor da co, chua co API read/UI/test |
| Dashboard real data | FR-18 | NEW | NEW | NEW | NEW | Hien tai chi placeholder |

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
| Patch Customer schema | FR-04 | Them `CustomerType`, `type`, `companyName`, `taxCode` | Prisma schema/migration co du field doanh nghiep |
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
| Login va doi mat khau | FR-01 | Login set cookie, refresh ok, logout revoke token, doi password revoke refresh |
| Tiep nhan xe | FR-03, FR-04, FR-05, FR-06, FR-07 | Tao customer -> vehicle -> appointment -> work order |
| Xu ly ky thuat | FR-08, FR-09 | Them hang muc, cap nhat trang thai dung state machine |
| Xuat phu tung | FR-11, FR-12, FR-13 | Nhap kho -> dung phu tung -> ton kho giam dung, khong am |
| Lap hoa don | FR-14 | Invoice lines snapshot dung voi work order items va part usage |
| Thanh toan | FR-15 | Ghi payment, invoice status dung voi tong tien da tra |
| Lich su/nhac lich | FR-16, FR-17 | Tra cuu theo xe/khach, tao va danh dau reminder |
| Bao cao/audit | FR-18, FR-19 | Report co du lieu, audit log ghi thao tac quan trong |

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
| Build | `apps/backend npm run build`, `apps/frontend npm run build` pass |
| Unit | WorkOrder state machine, invoice calculation, stock deduction, payment status |
| Integration | Auth, Customer, Vehicle, Appointment, WorkOrder, PartUsage, Invoice, Payment |
| RBAC | Thu role khong du quyen voi endpoint nhay cam phai ra 403 |
| Playwright UI | Moi module co UI phai co test luong chinh va pass |
| Manual UAT | 8 demo flow o Phase 5 pass end-to-end sau khi Playwright pass |
| Data integrity | Khong stock am, invoice snapshot khong doi khi service/part price doi sau do |

Lenh verify hien tai:

```bash
source ~/.nvm/nvm.sh && npm run build
```

Chay trong tung thu muc:
- `apps/backend`
- `apps/frontend`

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

## 13. Roadmap Ngan Gon De Bat Dau Code

Thu tu nen lam ngay:
1. Phase 0: fix `change-password`, patch Customer schema, migration, them Playwright setup neu chua co.
2. Phase 1A: CustomerModule + Customer pages + Playwright customer flow.
3. Phase 1B: VehicleModule + Vehicle pages/history + Playwright vehicle flow.
4. Phase 1C: ServiceCatalogModule + Inventory parts CRUD + Playwright service/parts flow.
5. Phase 2: Appointment -> WorkOrder -> PartUsage/InventoryTransaction, moi module kem UI va Playwright.
6. Phase 3: Invoice -> Payment -> Reminder, moi module kem UI va Playwright.
7. Phase 4: Reports -> AuditLog page -> Dashboard real data + Playwright report/audit flow.
8. Phase 5: seed demo data, full Playwright regression, manual UAT flow, final status update.
