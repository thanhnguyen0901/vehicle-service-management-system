# Role-Permission Matrix v1

## Vai trò đã chốt
- `ADMIN`
- `SERVICE_ADVISOR` (Lễ tân/Cố vấn dịch vụ)
- `TECHNICIAN` (Kỹ thuật viên)
- `INVENTORY_CLERK` (Thủ kho)
- `CASHIER` (Thu ngân/Kế toán)
- `MANAGER` (Quản lý)

## Ký hiệu quyền
- `C`: Create
- `R`: Read
- `U`: Update
- `D`: Delete
- `A`: Approve/Special action

## Ma trận quyền theo module
| Module / Chức năng | ADMIN | SERVICE_ADVISOR | TECHNICIAN | INVENTORY_CLERK | CASHIER | MANAGER |
|---|---|---|---|---|---|---|
| FR-01 Auth (login/logout/refresh/change password) | R/U | R/U | R/U | R/U | R/U | R/U |
| FR-02 User & Role Management | C/R/U/D | R | R | R | R | R |
| FR-03/04 Customer + loại INDIVIDUAL/CORPORATE | C/R/U/D | C/R/U | R | R | R | R |
| FR-05 Vehicle Management | C/R/U/D | C/R/U | R/U (ghi chú kỹ thuật) | R | R | R |
| FR-06 Appointment | C/R/U/D | C/R/U/D | R | R | R | R |
| FR-07 Create Work Order | C/R/U/D | C/R/U | R | R | R | R |
| FR-08 Work Order Tasks | C/R/U | C/R/U | C/R/U | R | R | R |
| FR-09 Work Order Status Flow | C/R/U/A | C/R/U (không close final) | R/U (trạng thái kỹ thuật) | R | R | R/A |
| FR-10 Service Catalog | C/R/U/D | R | R | R | R | R |
| FR-11 Parts Catalog | C/R/U/D | R | R | C/R/U | R | R |
| FR-12 Inventory In/Out/Adjust | C/R/U/D | R | R (xem tồn) | C/R/U | R | R |
| FR-13 Part Usage in Work Order | C/R/U | C/R/U (request) | C/R/U (consume) | C/R/U (confirm issue) | R | R |
| FR-14 Invoice Generation | C/R/U/D | R (xem) | R | R | C/R/U | R |
| FR-15 Payment | C/R/U/D | R | R | R | C/R/U | R |
| FR-16 Maintenance History Lookup | R | R | R | R | R | R |
| FR-17 Maintenance Reminder | C/R/U | C/R/U | R | R | R | R |
| FR-18 Reports | R | R (operational) | R (own jobs) | R (stock) | R (billing) | R (full) |
| FR-19 Audit Log | R | R (limited own actions) | R (limited own actions) | R (limited own actions) | R (limited own actions) | R (full) |

## Quy tắc phân quyền trọng yếu
- Chỉ `CASHIER` và `ADMIN` được tạo/chốt hóa đơn, ghi nhận thanh toán.
- `SERVICE_ADVISOR` được tạo và điều phối phiếu dịch vụ nhưng không được finalize thanh toán.
- `TECHNICIAN` chỉ cập nhật nghiệp vụ kỹ thuật, không can thiệp giá/hóa đơn.
- `INVENTORY_CLERK` chịu trách nhiệm tồn kho chính thức và xác nhận xuất kho.
- `MANAGER` có quyền xem toàn bộ báo cáo và duyệt thao tác nhạy cảm.
- `ADMIN` có toàn quyền hệ thống và quản trị user/role.
