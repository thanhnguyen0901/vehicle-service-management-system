# BÁO CÁO ĐỒ ÁN: VEHICLE SERVICE MANAGEMENT SYSTEM

## Thông tin chung
- Đề tài: Quản lý Hồ sơ & Bảo dưỡng Phương tiện (Garage)
- Hình thức: Web application
- Mục tiêu bàn giao: 1) Báo cáo (.md -> .docx), 2) Source code
- Trạng thái: Đang phân tích và lập kế hoạch, chưa implement code

## Cấu trúc báo cáo (theo docs/technique 1.1 -> 7.5)

### 1.1 Vision
#### 1.1.1 Tóm tắt định hướng dự án
Đề tài xây dựng một hệ thống web quản lý hồ sơ và bảo dưỡng phương tiện cho mô hình garage, nhằm thay thế cách vận hành thủ công đang gây phân tán dữ liệu và thiếu kiểm soát quy trình. Hệ thống được định hướng giải quyết đồng thời ba mục tiêu: chuẩn hóa tác nghiệp liên phòng ban, nâng độ chính xác dữ liệu nghiệp vụ và cung cấp thông tin quản trị kịp thời. Kết quả kỳ vọng là một sản phẩm có thể vận hành đầy đủ theo chu trình dịch vụ thực tế, đồng thời đáp ứng yêu cầu học thuật về quy trình phát triển phần mềm hoàn chỉnh.

#### 1.1.2 Bài toán nghiệp vụ và cơ hội cải tiến
Trong bối cảnh vận hành truyền thống, dữ liệu khách hàng, phương tiện, phiếu dịch vụ, phụ tùng và hóa đơn thường được lưu ở nhiều kênh khác nhau như sổ tay, file bảng tính hoặc trao đổi miệng. Thực trạng này làm phát sinh các hạn chế trọng yếu:
- Khó truy xuất lịch sử dịch vụ theo phương tiện, đặc biệt khi xe quay lại nhiều lần.
- Dễ phát sinh sai lệch giữa công việc thực hiện, phụ tùng xuất kho và dữ liệu hóa đơn.
- Thiếu khả năng theo dõi tiến độ xử lý xe theo thời gian thực giữa lễ tân, kỹ thuật và kho.
- Bộ phận quản lý không có báo cáo tổng hợp đủ tin cậy để điều hành hoạt động.

Việc xây dựng hệ thống là cơ hội chuyển đổi từ mô hình ghi nhận rời rạc sang mô hình dữ liệu tập trung, tạo nền tảng cho kiểm soát chất lượng dịch vụ và tối ưu hiệu suất vận hành.

#### 1.1.3 Động lực kinh doanh
Các động lực chính của dự án bao gồm:
- Nhu cầu chuẩn hóa quy trình nghiệp vụ tại garage để giảm phụ thuộc vào kinh nghiệm cá nhân.
- Nhu cầu minh bạch dữ liệu doanh thu, chi phí phụ tùng và trạng thái xử lý công việc.
- Nhu cầu nâng chất lượng phục vụ thông qua tra cứu lịch sử nhanh và nhắc lịch bảo dưỡng định kỳ.
- Nhu cầu xây dựng sản phẩm có khả năng trình diễn và đánh giá đầy đủ trong phạm vi đồ án thực tập cơ sở.

#### 1.1.4 Mục tiêu dự án và thước đo thành công
Mục tiêu 1: Chuẩn hóa và số hóa quy trình tiếp nhận, xử lý dịch vụ, lập hóa đơn và thanh toán.
- Chỉ số đánh giá: hoàn tất được luồng nghiệp vụ đầy đủ từ tiếp nhận xe đến thanh toán trong phiên demo.

Mục tiêu 2: Bảo đảm tính nhất quán dữ liệu giữa phiếu dịch vụ, kho phụ tùng và hóa đơn.
- Chỉ số đánh giá: dữ liệu hóa đơn phản ánh đầy đủ các hạng mục dịch vụ và phụ tùng đã ghi nhận trong phiếu.

Mục tiêu 3: Nâng hiệu quả truy xuất thông tin phục vụ vận hành và chăm sóc khách hàng.
- Chỉ số đánh giá: thời gian tra cứu lịch sử dịch vụ của phương tiện trong bộ dữ liệu mẫu không vượt quá 10 giây.

Mục tiêu 4: Cung cấp số liệu quản trị cơ bản cho người quản lý garage.
- Chỉ số đánh giá: hệ thống hiển thị được báo cáo doanh thu, khối lượng công việc và cảnh báo tồn kho thấp.

Mục tiêu 5: Đáp ứng chuẩn đầu ra học thuật về vòng đời phát triển phần mềm.
- Chỉ số đánh giá: bộ tài liệu và sản phẩm triển khai nhất quán, có khả năng truy vết từ yêu cầu đến kiểm thử.

#### 1.1.5 Tuyên bố phạm vi
**Phạm vi triển khai trong giai đoạn hiện tại**
- Quản lý truy cập hệ thống theo vai trò người dùng.
- Quản lý khách hàng và phương tiện, bao gồm khách hàng cá nhân và doanh nghiệp.
- Quản lý lịch hẹn, phiếu dịch vụ, công việc kỹ thuật và trạng thái xử lý.
- Quản lý danh mục dịch vụ, danh mục phụ tùng và giao dịch kho cơ bản.
- Lập hóa đơn, ghi nhận thanh toán, lưu vết lịch sử dịch vụ.
- Thống kê vận hành cơ bản và quản lý danh sách nhắc lịch bảo dưỡng.

**Phạm vi không triển khai trong giai đoạn hiện tại**
- Tích hợp cổng thanh toán trực tuyến hoặc hóa đơn điện tử theo chuẩn cơ quan thuế.
- Quản lý đa chi nhánh theo mô hình đồng bộ tập trung thời gian thực.
- Ứng dụng di động riêng cho khách hàng cuối.
- Tích hợp sâu với hệ thống ERP hoặc kế toán doanh nghiệp bên ngoài.

#### 1.1.6 Ràng buộc mức cao
- Dự án triển khai theo quy mô đồ án học thuật, thời gian và nguồn lực giới hạn.
- Giải pháp phải đủ đơn giản để hoàn thành đúng tiến độ nhưng vẫn bảo đảm tính thực tiễn nghiệp vụ.
- Hệ thống được phát triển theo kiến trúc đơn khối phân mô-đun để giảm độ phức tạp vận hành.

#### 1.1.7 Giả định chính
- Garage vận hành theo mô hình một chi nhánh trong phiên bản đầu.
- Người dùng nghiệp vụ tham gia cung cấp thông tin và phản hồi trong các mốc xác nhận yêu cầu.
- Dữ liệu mẫu phục vụ trình diễn có thể được chuẩn bị đầy đủ trước giai đoạn kiểm thử tích hợp.

#### 1.1.8 Rủi ro định hướng
- Mở rộng phạm vi quá sớm dẫn đến quá tải khối lượng trong giai đoạn triển khai.
- Thiếu thống nhất quy trình giữa các vai trò nghiệp vụ làm chậm quá trình đặc tả yêu cầu chi tiết.
- Chậm hoàn thiện dữ liệu mẫu và kịch bản trình diễn làm giảm chất lượng đánh giá cuối kỳ.

### 1.2 Stakeholder
#### 1.2.1 Mục tiêu phân tích stakeholder
Phân tích stakeholder nhằm xác định đầy đủ các nhóm liên quan trực tiếp và gián tiếp đến hệ thống, từ đó bảo đảm yêu cầu phần mềm phản ánh đúng nhu cầu nghiệp vụ, giảm xung đột ưu tiên trong quá trình triển khai và nâng cao khả năng chấp nhận hệ thống khi đưa vào sử dụng.

#### 1.2.2 Danh mục stakeholder
| Mã | Nhóm stakeholder | Vai trò trong nghiệp vụ | Mức ảnh hưởng | Mức quan tâm |
|---|---|---|---|---|
| SH-01 | Chủ garage / Ban quản lý | Định hướng mục tiêu kinh doanh, phê duyệt phạm vi | Cao | Cao |
| SH-02 | Quản lý vận hành | Giám sát quy trình, theo dõi hiệu suất và báo cáo | Cao | Cao |
| SH-03 | Lễ tân / Cố vấn dịch vụ | Tiếp nhận xe, tạo lịch hẹn, lập phiếu dịch vụ | Trung bình | Cao |
| SH-04 | Kỹ thuật viên | Chẩn đoán, thực hiện công việc sửa chữa, cập nhật trạng thái | Trung bình | Cao |
| SH-05 | Thủ kho phụ tùng | Quản lý nhập/xuất/điều chỉnh tồn kho | Trung bình | Cao |
| SH-06 | Thu ngân / Kế toán nội bộ | Lập hóa đơn, ghi nhận thanh toán, đối soát dữ liệu | Trung bình | Cao |
| SH-07 | Quản trị hệ thống | Quản lý người dùng, quyền truy cập, cấu hình cơ bản | Trung bình | Trung bình |
| SH-08 | Khách hàng sử dụng dịch vụ | Cung cấp thông tin xe, nhận kết quả và chứng từ dịch vụ | Thấp | Trung bình |
| SH-09 | Giảng viên hướng dẫn/đánh giá | Đánh giá tính học thuật và mức hoàn thiện sản phẩm | Cao | Cao |

#### 1.2.3 Nhu cầu và vấn đề chính theo từng nhóm
- Chủ garage/Quản lý: cần số liệu chính xác, tức thời để kiểm soát doanh thu, tình trạng xử lý xe và hiệu quả sử dụng phụ tùng.
- Lễ tân: cần thao tác nhanh khi tiếp nhận xe, tra cứu lịch sử thuận tiện, giảm ghi chép lặp lại.
- Kỹ thuật viên: cần nhận việc rõ ràng, cập nhật tiến độ minh bạch, tránh bỏ sót hạng mục.
- Thủ kho: cần kiểm soát xuất kho theo phiếu, cảnh báo tồn thấp, hạn chế sai lệch số lượng thực tế.
- Thu ngân/Kế toán: cần lập hóa đơn nhất quán với dữ liệu thực hiện dịch vụ, theo dõi trạng thái thanh toán rõ ràng.
- Khách hàng: kỳ vọng thông tin dịch vụ minh bạch, thời gian xử lý rõ ràng, lịch sử bảo dưỡng có thể tra cứu khi cần.

#### 1.2.4 Phân tích quyền lực - mức quan tâm và chiến lược tương tác
| Nhóm | Phân loại Power/Interest | Chiến lược tương tác |
|---|---|---|
| Chủ garage, Quản lý vận hành, Giảng viên hướng dẫn | Cao/Cao | Trao đổi định kỳ, xác nhận các mốc quyết định quan trọng |
| Lễ tân, Kỹ thuật viên, Thủ kho, Thu ngân | Trung bình/Cao | Thu thập yêu cầu chi tiết, phản hồi thường xuyên theo luồng nghiệp vụ |
| Quản trị hệ thống | Trung bình/Trung bình | Tham vấn khi chốt mô hình quyền và vận hành kỹ thuật |
| Khách hàng | Thấp/Trung bình | Ghi nhận phản hồi gián tiếp thông qua quy trình phục vụ |

#### 1.2.5 Vai trò phê duyệt và ra quyết định
- Phê duyệt phạm vi nghiệp vụ: Chủ garage/Quản lý vận hành.
- Phê duyệt tiêu chí học thuật và chất lượng báo cáo: Giảng viên hướng dẫn/đánh giá.
- Phê duyệt thiết kế kỹ thuật chi tiết và thứ tự triển khai: Nhóm thực hiện dự án (vai trò Solution Architect/Developer).

#### 1.2.6 Kết luận phân tích stakeholder
Hệ thống có đặc thù đa vai trò và phụ thuộc phối hợp liên phòng ban. Vì vậy, yêu cầu quan trọng nhất trong giai đoạn phân tích là bảo đảm luồng nghiệp vụ được mô hình hóa nhất quán giữa lễ tân, kỹ thuật, kho và thu ngân; đồng thời cấu hình phân quyền phải đủ chặt để bảo vệ dữ liệu nghiệp vụ nhưng vẫn thuận tiện cho thao tác hàng ngày.

### 1.3 System Context
- [ ] System boundary
- [ ] External actors/systems
- [ ] Luồng thông tin vào/ra

### 2.1 Use Case
- [ ] Danh sách use case theo FR
- [ ] Use case diagram tổng quan
- [ ] Mô tả use case specification

### 2.2 Process Modeling
- [ ] Quy trình tiếp nhận xe
- [ ] Quy trình xử lý work order
- [ ] Quy trình lập hóa đơn/thanh toán

### 2.3 Data Modeling
- [ ] Domain model
- [ ] ERD concept
- [ ] Quan hệ chính và ràng buộc nghiệp vụ

### 3.1 Functional Requirement
- [x] Chốt danh sách MVP FR-01..FR-19
- [ ] Viết chi tiết từng FR (actor, pre/post, flow, AC)

### 3.2 Non Functional Requirement
- [ ] Bảo mật
- [ ] Hiệu năng
- [ ] Độ tin cậy
- [ ] Khả năng bảo trì/vận hành

### 3.3 UI Mockup
- [ ] Danh sách màn hình
- [ ] Wireframe theo role
- [ ] Luồng thao tác chính

### 4.1 Drivers
- [ ] Business drivers
- [ ] Technical drivers
- [ ] Constraints

### 4.2 Tech Choice
- [x] Chốt stack: NestJS + Prisma + PostgreSQL, React + Vite
- [ ] Lập bảng lý do chọn và trade-off

### 4.3 Architecture
- [x] Chốt architecture: Modular Monolith
- [ ] Thiết kế layer/module và luồng xử lý

### 5.1 Component
- [ ] Danh sách component backend/frontend
- [ ] Sơ đồ component

### 5.2 API Design
- [x] Chốt convention: /api/v1 + error format
- [ ] Danh sách endpoint theo module

### 5.3 Database Architecture
- [x] Chốt PK/FK: UUIDv7
- [ ] Logical schema + indexing strategy

### 5.4 Security Design
- [x] Chốt JWT + bcrypt + cookie-parser + cors + helmet + rate-limit
- [ ] RBAC detail + token lifecycle + audit policy

### 6.1 Class Design
- [ ] Class/entity chính theo module

### 6.2 Sequence Diagram
- [ ] Login flow
- [ ] Work order flow
- [ ] Invoice/payment flow

### 6.3 UI High Fidelity
- [ ] High-fidelity cho màn hình demo-critical

### 6.4 Database Detail Design
- [ ] Data dictionary đầy đủ
- [ ] Constraint, index, audit fields

### 7.1 Algorithm
- [ ] Tính tổng tiền hóa đơn
- [ ] Trừ tồn kho
- [ ] Gợi ý nhắc lịch

### 7.2 Exception Design
- [ ] Danh sách mã lỗi nghiệp vụ
- [ ] Error handling strategy

### 7.3 Testing
- [ ] Unit test scope
- [ ] Integration test scope
- [ ] UAT/demo scenario

### 7.4 Development Standard
- [ ] Coding convention
- [ ] Git workflow
- [ ] PR checklist

### 7.5 Implementation Plan
- [ ] Roadmap phase-by-phase
- [ ] Milestone theo tuần

## Quy tắc làm việc mỗi ngày
- Mỗi ngày hoàn thành tối thiểu 1 mục lớn (ví dụ: 1.1 hoặc 1.2)
- Cập nhật tiến độ vào file audit ngay trong ngày
- Chỉ implement code sau khi các mục phân tích/thiết kế cốt lõi được duyệt

## Kết quả đã chốt (Artifacts)
- Functional Requirements MVP (FR-01..FR-19): `docs/report/artifacts/mvp-functional-requirements.md`
- Role-Permission Matrix v1 (6 vai trò): `docs/report/artifacts/role-permission-matrix-v1.md`
