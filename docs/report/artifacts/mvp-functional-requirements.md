# MVP Functional Requirements v1

## Phạm vi
Tài liệu này chốt danh sách Functional Requirements cho phiên bản MVP của đề tài:
**Quản lý Hồ sơ & Bảo dưỡng Phương tiện (Garage)**.

## Danh sách FR đã chốt
- FR-01 Đăng nhập/đăng xuất, refresh token, đổi mật khẩu.
- FR-02 Quản lý người dùng và phân quyền theo vai trò (RBAC).
- FR-03 Quản lý khách hàng (CRUD, tìm kiếm).
- FR-04 Hỗ trợ loại khách hàng `INDIVIDUAL/CORPORATE`; quản lý thông tin xuất hóa đơn doanh nghiệp (tên công ty, mã số thuế, địa chỉ).
- FR-05 Quản lý phương tiện (CRUD, tìm kiếm, biển số duy nhất).
- FR-06 Quản lý lịch hẹn dịch vụ (tạo/sửa/hủy/xem lịch).
- FR-07 Tạo phiếu dịch vụ (work order) từ lịch hẹn hoặc tiếp nhận trực tiếp.
- FR-08 Quản lý hạng mục công việc trong phiếu dịch vụ (dịch vụ, công sửa chữa, công thợ).
- FR-09 Quản lý trạng thái phiếu dịch vụ theo quy trình (tiếp nhận, đang xử lý, chờ phụ tùng, hoàn tất, bàn giao).
- FR-10 Quản lý danh mục dịch vụ (CRUD, giá chuẩn, trạng thái sử dụng).
- FR-11 Quản lý danh mục phụ tùng (CRUD, đơn vị tính, giá chuẩn, tồn kho).
- FR-12 Quản lý nhập/xuất/điều chỉnh tồn kho phụ tùng.
- FR-13 Ghi nhận phụ tùng sử dụng theo phiếu dịch vụ và trừ tồn kho tự động.
- FR-14 Lập hóa đơn từ phiếu dịch vụ (snapshot đơn giá tại thời điểm chốt bill).
- FR-15 Ghi nhận thanh toán hóa đơn (đủ/thiếu, phương thức thanh toán, trạng thái thanh toán).
- FR-16 Tra cứu lịch sử bảo dưỡng/sửa chữa theo phương tiện hoặc khách hàng.
- FR-17 Nhắc lịch bảo dưỡng định kỳ (danh sách cần nhắc, trạng thái đã nhắc/chưa nhắc).
- FR-18 Báo cáo cơ bản: doanh thu, số phiếu dịch vụ, tồn kho thấp, top dịch vụ/phụ tùng.
- FR-19 Nhật ký thao tác nghiệp vụ quan trọng (audit log cơ bản).

## Ghi chú phạm vi
- Danh sách trên là **MVP v1** đã chốt.
- Chi tiết từng FR (Actor, Preconditions, Main Flow, Exception, Acceptance Criteria) sẽ được viết ở bước SRS chi tiết tiếp theo.
