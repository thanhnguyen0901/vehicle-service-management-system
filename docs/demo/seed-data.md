# Seed Data Demo và E2E

## Mục đích

Hệ thống có 2 bộ dữ liệu seed độc lập. Mỗi lần chạy seed đều cleanup database hiện tại trước, sau đó tạo lại dữ liệu sạch.

- `e2e`: dữ liệu tối thiểu, ổn định cho Playwright E2E.
- `demo`: dữ liệu đầy đủ để trình diễn full flow trên các page nghiệp vụ.

Xem hướng dẫn thao tác đầy đủ tại [full-flow-guide.md](./full-flow-guide.md).

## Lệnh chạy

```bash
npm run seed:e2e --prefix apps/backend
npm run seed:demo --prefix apps/backend
```

Khi chạy local với database Docker hiện tại:

```bash
DATABASE_URL='postgresql://vsms_user:vsms_password@localhost:5434/vsms_db?schema=public' npm run seed:e2e --prefix apps/backend
DATABASE_URL='postgresql://vsms_user:vsms_password@localhost:5434/vsms_db?schema=public' npm run seed:demo --prefix apps/backend
```

## Account E2E

Mật khẩu chung: `Admin@123`

| Username     | Vai trò         | Tên hiển thị       |
| ------------ | --------------- | ------------------ |
| `admin`      | Admin           | Quản trị viên E2E  |
| `advisor`    | Service Advisor | Cố vấn dịch vụ E2E |
| `technician` | Technician      | Kỹ thuật viên E2E  |
| `inventory`  | Inventory Clerk | Thủ kho E2E        |
| `cashier`    | Cashier         | Thu ngân E2E       |
| `manager`    | Manager         | Quản lý E2E        |

## Account Demo

Mật khẩu chung: `Demo@123`

| Username     | Vai trò         | Tên hiển thị     | Email                   |
| ------------ | --------------- | ---------------- | ----------------------- |
| `admin`      | Admin           | Nguyễn Minh Quân | admin@garage.local      |
| `advisor`    | Service Advisor | Trần Thị Mai     | advisor@garage.local    |
| `technician` | Technician      | Lê Văn Hùng      | technician@garage.local |
| `inventory`  | Inventory Clerk | Phạm Quốc Bảo    | inventory@garage.local  |
| `cashier`    | Cashier         | Võ Thị Lan       | cashier@garage.local    |
| `manager`    | Manager         | Đặng Hoàng Nam   | manager@garage.local    |

## Nội dung dữ liệu demo

- Khách hàng cá nhân và doanh nghiệp, có địa chỉ, email, ghi chú tiếng Việt có dấu.
- Xe thuộc nhiều khách hàng, gồm biển số, hãng xe, model, VIN và số km hiện tại.
- Lịch hẹn ở nhiều trạng thái: đã đặt lịch, đã đến xưởng, đã hủy.
- Danh mục dịch vụ bảo dưỡng, sửa chữa, điều hòa và cân chỉnh.
- Danh mục phụ tùng có tồn kho, mức tồn tối thiểu và lịch sử nhập tồn đầu kỳ.
- Phiếu sửa chữa ở các trạng thái đang sửa, sẵn sàng giao xe và đã giao.
- Hóa đơn chưa thanh toán, hóa đơn đã thanh toán tiền mặt và chuyển khoản.
- Nhắc bảo dưỡng chưa gửi và đã gửi.
- Audit log mẫu để kiểm tra màn hình nhật ký thao tác.
