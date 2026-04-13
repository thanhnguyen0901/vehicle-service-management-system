# BÁO CÁO ĐỒ ÁN: VEHICLE SERVICE MANAGEMENT SYSTEM

## Thông tin chung
- Đề tài: Quản lý Hồ sơ & Bảo dưỡng Phương tiện (Garage)
- Hình thức: Web application
- Mục tiêu bàn giao: 1) Báo cáo (.md -> .docx), 2) Source code
- Trạng thái: Đang phân tích và lập kế hoạch, chưa implement code

## Cấu trúc báo cáo (theo docs/technique 1.1 -> 7.5)

### 1.1 Vision
#### 1.1.1 Tóm tắt định hướng dự án
Vehicle Service Management System là hệ thống web được xây dựng nhằm số hóa toàn bộ vòng đời dịch vụ tại garage, từ tiếp nhận phương tiện đến hoàn tất thanh toán và theo dõi lịch sử bảo dưỡng. Tầm nhìn của dự án là hình thành một nền tảng dữ liệu tập trung, giúp các bộ phận lễ tân, kỹ thuật, kho và thu ngân phối hợp trên cùng một nguồn thông tin chuẩn, từ đó nâng độ chính xác vận hành, giảm thất thoát nghiệp vụ và tăng năng lực kiểm soát của quản lý. Trong phạm vi đồ án, hệ thống đồng thời đóng vai trò minh chứng cho quy trình phát triển phần mềm hoàn chỉnh, có khả năng truy vết từ nhu cầu nghiệp vụ đến thiết kế, triển khai và kiểm thử.

#### 1.1.2 Bài toán nghiệp vụ và cơ hội cải tiến
Mô hình vận hành thủ công tại garage hiện nay tạo ra nhiều điểm nghẽn:
- Dữ liệu phân tán giữa sổ tay, bảng tính và trao đổi trực tiếp, dẫn đến thiếu nhất quán khi đối soát.
- Lịch sử dịch vụ theo phương tiện khó truy xuất nhanh, đặc biệt với khách hàng quay lại nhiều lần.
- Trạng thái xử lý xe không đồng bộ giữa các bộ phận, gây chậm tiến độ và khó chủ động giao tiếp với khách hàng.
- Thông tin phụ tùng xuất kho và dữ liệu hóa đơn dễ sai lệch nếu nhập liệu lặp lại nhiều điểm.
- Quản lý thiếu báo cáo tin cậy theo thời gian gần thực để điều hành công việc hằng ngày.

Hệ thống được định hướng giải quyết các điểm nghẽn trên bằng cơ chế chuẩn hóa quy trình và quản trị dữ liệu tập trung theo từng vai trò nghiệp vụ, tạo nền tảng cho vận hành minh bạch và cải tiến hiệu suất dài hạn.

#### 1.1.3 Động lực kinh doanh
Các động lực chính thúc đẩy dự án gồm:
- Nhu cầu chuẩn hóa quy trình dịch vụ để giảm phụ thuộc vào kinh nghiệm cá nhân.
- Nhu cầu kiểm soát chặt chẽ doanh thu, chi phí phụ tùng và chất lượng thực thi công việc.
- Nhu cầu rút ngắn thời gian phản hồi cho khách hàng thông qua tra cứu lịch sử và trạng thái xử lý nhanh.
- Nhu cầu tạo cơ sở dữ liệu phục vụ phân tích vận hành, ra quyết định và lập kế hoạch tài nguyên.
- Nhu cầu hoàn thiện sản phẩm có giá trị ứng dụng thực tế, đồng thời đáp ứng yêu cầu học thuật của đồ án.

#### 1.1.4 Mục tiêu dự án và thước đo thành công
Mục tiêu 1: Chuẩn hóa luồng nghiệp vụ chính (tiếp nhận xe, tạo phiếu dịch vụ, thực hiện kỹ thuật, xuất phụ tùng, lập hóa đơn, thanh toán) trong một hệ thống thống nhất.
- Chỉ số đánh giá: hoàn tất trọn vẹn luồng nghiệp vụ end-to-end trong phiên kiểm thử tích hợp và phiên demo cuối kỳ.

Mục tiêu 2: Tăng độ nhất quán dữ liệu giữa các mô-đun nghiệp vụ.
- Chỉ số đánh giá: 100% hóa đơn trong bộ dữ liệu kiểm thử phản ánh đầy đủ hạng mục dịch vụ và phụ tùng đã xác nhận trên phiếu dịch vụ.

Mục tiêu 3: Nâng hiệu quả truy xuất thông tin phục vụ vận hành.
- Chỉ số đánh giá: thời gian tra cứu hồ sơ khách hàng hoặc lịch sử dịch vụ phương tiện không vượt quá 10 giây trên bộ dữ liệu mẫu chuẩn.

Mục tiêu 4: Cung cấp thông tin quản trị thiết yếu cho cấp quản lý.
- Chỉ số đánh giá: hệ thống hiển thị được tối thiểu các nhóm báo cáo doanh thu, khối lượng công việc theo trạng thái và cảnh báo tồn kho thấp.

Mục tiêu 5: Bảo đảm chất lượng học thuật và khả năng bảo trì sản phẩm.
- Chỉ số đánh giá: tài liệu phân tích, thiết kế, kiểm thử và mã nguồn nhất quán, có khả năng truy vết rõ ràng giữa yêu cầu và hiện thực hệ thống.

#### 1.1.5 Tuyên bố phạm vi
**Phạm vi triển khai trong giai đoạn hiện tại (MVP)**
- Quản lý người dùng và phân quyền theo vai trò nghiệp vụ.
- Quản lý hồ sơ khách hàng và phương tiện.
- Quản lý lịch hẹn và phiếu dịch vụ.
- Quản lý hạng mục công việc kỹ thuật và trạng thái xử lý xe.
- Quản lý danh mục dịch vụ, danh mục phụ tùng và giao dịch kho cơ bản.
- Lập hóa đơn, ghi nhận thanh toán và lưu trữ lịch sử dịch vụ.
- Cung cấp báo cáo vận hành cơ bản và danh sách nhắc lịch bảo dưỡng.

**Phạm vi không triển khai trong giai đoạn hiện tại**
- Tích hợp cổng thanh toán trực tuyến.
- Phát hành hóa đơn điện tử theo chuẩn tích hợp cơ quan thuế.
- Quản lý đa chi nhánh với đồng bộ dữ liệu thời gian thực.
- Ứng dụng di động riêng cho khách hàng.
- Tích hợp sâu với ERP hoặc hệ thống kế toán doanh nghiệp bên ngoài.

**Định hướng giai đoạn mở rộng**
- Mở rộng quản lý đa chi nhánh.
- Tăng cường phân tích dữ liệu dịch vụ để hỗ trợ dự báo nhu cầu bảo dưỡng.
- Xem xét tích hợp kênh chăm sóc khách hàng số (thông báo lịch hẹn, nhắc lịch định kỳ).

#### 1.1.6 Ràng buộc mức cao
- Thời gian triển khai giới hạn theo kế hoạch đồ án học kỳ.
- Nguồn lực thực hiện nhỏ, ưu tiên giải pháp khả thi và dễ kiểm soát phạm vi.
- Hệ thống triển khai theo kiến trúc Modular Monolith để cân bằng tốc độ phát triển và khả năng mở rộng.
- Công nghệ và quyết định kỹ thuật phải thống nhất với stack đã chốt của dự án.

#### 1.1.7 Giả định chính
- Garage mục tiêu vận hành theo mô hình một chi nhánh trong phiên bản đầu tiên.
- Người dùng nghiệp vụ tham gia xác nhận yêu cầu và phản hồi trong các mốc phân tích, nghiệm thu.
- Dữ liệu mẫu phục vụ kiểm thử và trình diễn được chuẩn bị đầy đủ trước giai đoạn tích hợp.
- Hạ tầng triển khai thử nghiệm đáp ứng được yêu cầu vận hành cơ bản của hệ thống web nội bộ.

#### 1.1.8 Rủi ro định hướng
- Mở rộng phạm vi chức năng quá sớm làm ảnh hưởng tiến độ và chất lượng.
- Khác biệt trong cách hiểu quy trình giữa các vai trò nghiệp vụ gây chậm chốt yêu cầu chi tiết.
- Dữ liệu đầu vào không đầy đủ hoặc thiếu chuẩn hóa làm giảm hiệu quả kiểm thử và trình diễn.
- Độ bao phủ kiểm thử chưa đủ rộng có thể làm phát sinh lỗi nghiệp vụ ở giai đoạn cuối.

### 1.2 Stakeholder
#### 1.2.1 Mục tiêu phân tích stakeholder
Phân tích stakeholder nhằm nhận diện đầy đủ các bên sử dụng, chịu tác động và có quyền ra quyết định đối với Vehicle Service Management System. Kết quả phân tích là cơ sở để thu thập yêu cầu đúng trọng tâm, ưu tiên đúng phạm vi nghiệp vụ, giảm xung đột giữa các phòng ban và tăng khả năng chấp nhận hệ thống khi đưa vào vận hành.

#### 1.2.2 Danh mục và phân loại stakeholder
| Mã | Nhóm stakeholder | Nhóm phân loại | Vai trò trong nghiệp vụ | Mức ảnh hưởng | Mức quan tâm |
|---|---|---|---|---|---|
| SH-01 | Chủ garage / Ban quản lý | Primary (Decision) | Định hướng mục tiêu kinh doanh, phê duyệt phạm vi và tiêu chí vận hành | Cao | Cao |
| SH-02 | Quản lý vận hành | Primary | Giám sát tiến độ xử lý xe, hiệu suất nhân sự, chất lượng báo cáo | Cao | Cao |
| SH-03 | Lễ tân / Cố vấn dịch vụ | Primary (User) | Tiếp nhận xe, tạo lịch hẹn, lập phiếu dịch vụ, cập nhật thông tin khách | Trung bình | Cao |
| SH-04 | Kỹ thuật viên | Primary (User) | Chẩn đoán, thực hiện sửa chữa/bảo dưỡng, cập nhật trạng thái công việc | Trung bình | Cao |
| SH-05 | Thủ kho phụ tùng | Primary (User) | Quản lý nhập/xuất kho, kiểm soát tồn kho theo phiếu dịch vụ | Trung bình | Cao |
| SH-06 | Thu ngân / Kế toán nội bộ | Primary (User) | Lập hóa đơn, ghi nhận thanh toán, đối soát số liệu doanh thu | Trung bình | Cao |
| SH-07 | Quản trị hệ thống | Project | Quản trị tài khoản, phân quyền, cấu hình hệ thống và hỗ trợ vận hành | Trung bình | Trung bình |
| SH-08 | Khách hàng sử dụng dịch vụ | Secondary | Cung cấp thông tin xe, nhận báo giá/chứng từ, phản hồi chất lượng dịch vụ | Thấp | Trung bình |
| SH-09 | Giảng viên hướng dẫn/đánh giá | Project (Governance) | Đánh giá mức độ hoàn thiện học thuật và tính nhất quán của sản phẩm | Cao | Cao |

#### 1.2.3 Nhu cầu và mối quan tâm chính theo từng nhóm
- Chủ garage/Ban quản lý: cần dữ liệu tổng hợp đáng tin cậy để theo dõi doanh thu, năng suất xử lý xe và hiệu quả sử dụng phụ tùng.
- Quản lý vận hành: cần theo dõi trạng thái công việc theo thời gian gần thực để điều phối nhân sự và xử lý điểm nghẽn.
- Lễ tân/Cố vấn dịch vụ: cần thao tác tiếp nhận nhanh, tra cứu lịch sử thuận tiện, hạn chế nhập liệu lặp và sai sót thông tin.
- Kỹ thuật viên: cần danh sách công việc rõ ràng, cập nhật tiến độ đơn giản, tránh bỏ sót hạng mục và nhầm lẫn yêu cầu.
- Thủ kho: cần kiểm soát xuất kho theo phiếu, cảnh báo tồn thấp, giảm sai lệch giữa số liệu hệ thống và tồn thực tế.
- Thu ngân/Kế toán nội bộ: cần hóa đơn đồng nhất với dữ liệu dịch vụ/phụ tùng và theo dõi trạng thái thanh toán minh bạch.
- Quản trị hệ thống: cần mô hình phân quyền rõ, nhật ký thao tác đủ dùng cho kiểm tra và hỗ trợ vận hành.
- Khách hàng: cần quy trình minh bạch, thời gian xử lý được thông báo rõ, lịch sử bảo dưỡng có thể truy xuất khi cần.

#### 1.2.4 Phân tích quyền lực - mức quan tâm và chiến lược tương tác
| Nhóm | Phân loại Power/Interest | Chiến lược tương tác |
|---|---|---|
| Chủ garage, Quản lý vận hành, Giảng viên hướng dẫn | Cao/Cao | Manage closely: làm việc định kỳ theo mốc, xác nhận phạm vi và tiêu chí nghiệm thu |
| Lễ tân, Kỹ thuật viên, Thủ kho, Thu ngân | Trung bình/Cao | Keep informed + involve deeply: workshop quy trình, xác nhận use case và phản hồi theo vòng lặp ngắn |
| Quản trị hệ thống | Trung bình/Trung bình | Keep satisfied: tham vấn ở các quyết định về phân quyền, bảo mật và vận hành hệ thống |
| Khách hàng | Thấp/Trung bình | Monitor/feedback: thu thập phản hồi trải nghiệm qua các tình huống dịch vụ thực tế |

#### 1.2.5 Vai trò phê duyệt và ra quyết định
- Phê duyệt phạm vi nghiệp vụ và ưu tiên tính năng MVP: Chủ garage/Ban quản lý và Quản lý vận hành.
- Phê duyệt tiêu chí học thuật, cấu trúc báo cáo và mức độ hoàn thiện đồ án: Giảng viên hướng dẫn/đánh giá.
- Quyết định kỹ thuật chi tiết (thiết kế kiến trúc, API, dữ liệu, kiểm thử): Nhóm thực hiện dự án.

#### 1.2.6 Chân dung người dùng đại diện (User Persona)
**Persona P1 - Lễ tân/Cố vấn dịch vụ**
- Bối cảnh công việc: là điểm tiếp xúc đầu tiên với khách hàng, xử lý lượng yêu cầu lớn vào giờ cao điểm.
- Mục tiêu chính: tiếp nhận xe nhanh, ghi nhận đúng nhu cầu dịch vụ, tra cứu lịch sử tức thời.
- Điểm đau hiện tại: thông tin phân tán, phải ghi chép lặp nhiều nơi, dễ thiếu dữ liệu khi bàn giao cho kỹ thuật.
- Mức thành thạo công nghệ: trung bình.
- Tần suất sử dụng hệ thống: liên tục trong ca làm việc.

**Persona P2 - Kỹ thuật viên**
- Bối cảnh công việc: thực hiện nhiều hạng mục song song, phụ thuộc thông tin đầu vào từ lễ tân và kho.
- Mục tiêu chính: nhận việc rõ ràng, cập nhật tiến độ đơn giản, hạn chế gián đoạn do thiếu phụ tùng.
- Điểm đau hiện tại: thiếu một luồng theo dõi thống nhất về trạng thái công việc và vật tư liên quan.
- Mức thành thạo công nghệ: cơ bản đến trung bình.
- Tần suất sử dụng hệ thống: nhiều lần theo từng công việc trong ngày.

**Persona P3 - Quản lý vận hành/Chủ garage**
- Bối cảnh công việc: theo dõi hiệu suất toàn garage, ra quyết định điều phối nhân sự và kiểm soát doanh thu.
- Mục tiêu chính: có báo cáo ngắn gọn, chính xác, cập nhật để điều hành.
- Điểm đau hiện tại: dữ liệu tổng hợp chậm, khó đối soát giữa dịch vụ đã làm, phụ tùng đã xuất và hóa đơn.
- Mức thành thạo công nghệ: trung bình.
- Tần suất sử dụng hệ thống: hằng ngày theo mốc kiểm tra vận hành.

#### 1.2.7 Ma trận trách nhiệm mức cao (RACI sơ bộ)
| Hoạt động chính | Chủ garage/Quản lý | Lễ tân | Kỹ thuật viên | Thủ kho | Thu ngân | Quản trị hệ thống | Nhóm dự án |
|---|---|---|---|---|---|---|---|
| Xác nhận phạm vi nghiệp vụ | A | C | C | C | C | I | R |
| Mô tả quy trình tiếp nhận và xử lý xe | C | R | R | C | I | I | A |
| Chốt yêu cầu kho, hóa đơn và thanh toán | C | C | C | R | R | I | A |
| Thiết kế phân quyền và cơ chế kiểm soát truy cập | C | I | I | I | I | R | A |
| Kiểm thử nghiệp vụ và nghiệm thu kịch bản demo | A | R | R | R | R | C | C |

Chú thích: R (Responsible) - trực tiếp thực hiện; A (Accountable) - chịu trách nhiệm cuối cùng; C (Consulted) - được tham vấn; I (Informed) - được thông báo.

#### 1.2.8 Kết luận phân tích stakeholder
Phân tích stakeholder cho thấy hệ thống có tính liên phòng ban cao, trong đó các nhóm trực tiếp vận hành gồm lễ tân, kỹ thuật viên, thủ kho và thu ngân là nguồn yêu cầu nghiệp vụ cốt lõi. Nhóm quản lý giữ vai trò quyết định phạm vi và tiêu chí thành công, trong khi quản trị hệ thống bảo đảm tính khả thi khi triển khai vận hành. Vì vậy, chiến lược phù hợp là thu thập yêu cầu theo luồng nghiệp vụ end-to-end, xác nhận liên tục theo mốc ngắn và duy trì cơ chế phê duyệt rõ ràng để hạn chế thay đổi phạm vi vào giai đoạn cuối.

### 1.3 System Context
#### 1.3.1 Mục tiêu xác định ngữ cảnh hệ thống
Mục tiêu của System Context là xác định rõ ranh giới giữa Vehicle Service Management System và môi trường vận hành bên ngoài, bao gồm các tác nhân sử dụng, hệ thống liên quan và các luồng thông tin trao đổi. Việc định nghĩa ngữ cảnh ở mức cao giúp kiểm soát phạm vi, hạn chế nhầm lẫn giữa yêu cầu tích hợp và thiết kế nội bộ, đồng thời tạo cơ sở cho các phần Use Case và Process Modeling ở chương sau.

#### 1.3.2 Ranh giới hệ thống (System Boundary)
Vehicle Service Management System được xem là một hệ thống thống nhất phục vụ nghiệp vụ garage trong phạm vi một chi nhánh ở giai đoạn MVP. Bên trong ranh giới hệ thống bao gồm các chức năng chính: quản lý khách hàng và phương tiện, lịch hẹn, phiếu dịch vụ, quy trình kỹ thuật, kho phụ tùng, hóa đơn thanh toán, báo cáo vận hành và phân quyền truy cập.

Những thành phần ngoài ranh giới hệ thống:
- Người dùng nghiệp vụ và khách hàng (đóng vai trò tác nhân tương tác).
- Các dịch vụ liên lạc bên ngoài như Email/SMS (nếu kích hoạt nhắc lịch).
- Cổng thanh toán trực tuyến, hệ thống hóa đơn điện tử, ERP kế toán (được xác định là ngoài phạm vi tích hợp ở MVP).

#### 1.3.3 Tác nhân và hệ thống bên ngoài
| Mã | Thực thể ngoài hệ thống | Loại | Vai trò tương tác chính | Tần suất tương tác |
|---|---|---|---|---|
| EX-01 | Lễ tân/Cố vấn dịch vụ | Actor | Tiếp nhận xe, tạo lịch hẹn, lập phiếu dịch vụ, theo dõi trạng thái | Liên tục trong ca làm việc |
| EX-02 | Kỹ thuật viên | Actor | Nhận việc, cập nhật chẩn đoán và tiến độ thực hiện | Nhiều lần theo từng công việc |
| EX-03 | Thủ kho phụ tùng | Actor | Xác nhận xuất kho, cập nhật tồn kho theo phiếu | Theo từng giao dịch kho |
| EX-04 | Thu ngân/Kế toán nội bộ | Actor | Lập hóa đơn, ghi nhận thanh toán, đối soát dữ liệu | Theo từng ca và cuối ngày |
| EX-05 | Quản lý vận hành/Chủ garage | Actor | Theo dõi báo cáo doanh thu, tiến độ xử lý, tồn kho cảnh báo | Hằng ngày/định kỳ |
| EX-06 | Khách hàng sử dụng dịch vụ | Actor | Cung cấp thông tin xe, nhận báo giá/chứng từ, nhận thông báo | Theo từng lần sử dụng dịch vụ |
| EX-07 | Dịch vụ Email/SMS | External System | Gửi thông báo lịch hẹn, nhắc lịch bảo dưỡng, trạng thái xử lý | Theo sự kiện hoặc lịch định kỳ |
| EX-08 | Cổng thanh toán/ERP/Hóa đơn điện tử | External System (Future) | Tích hợp thanh toán và đồng bộ kế toán (định hướng mở rộng) | Chưa áp dụng ở MVP |

#### 1.3.4 Luồng dữ liệu vào/ra mức cao
| Mã luồng | Nguồn -> Đích | Nội dung thông tin | Hướng luồng | Cơ chế kích hoạt |
|---|---|---|---|---|
| DF-01 | Lễ tân -> Hệ thống | Thông tin khách hàng, phương tiện, yêu cầu dịch vụ, lịch hẹn | Vào hệ thống | Real-time theo thao tác tiếp nhận |
| DF-02 | Kỹ thuật viên -> Hệ thống | Kết quả kiểm tra, hạng mục thực hiện, trạng thái công việc | Vào hệ thống | Real-time theo tiến độ xử lý |
| DF-03 | Thủ kho -> Hệ thống | Phiếu xuất/điều chỉnh phụ tùng, xác nhận tồn | Vào hệ thống | Theo giao dịch phát sinh |
| DF-04 | Thu ngân -> Hệ thống | Dữ liệu thanh toán, trạng thái hóa đơn | Vào hệ thống | Theo nghiệp vụ thanh toán |
| DF-05 | Hệ thống -> Quản lý | Báo cáo doanh thu, hiệu suất xử lý xe, cảnh báo tồn kho | Ra hệ thống | On-demand và theo mốc kiểm tra |
| DF-06 | Hệ thống <-> Khách hàng | Tiếp nhận thông tin xe và phản hồi kết quả dịch vụ/chứng từ | Hai chiều | Theo từng phiên phục vụ |
| DF-07 | Hệ thống -> Email/SMS | Nội dung nhắc lịch, xác nhận lịch hẹn, thông báo trạng thái | Ra hệ thống | Theo sự kiện hoặc lịch đặt trước |
| DF-08 | Cổng thanh toán/ERP/Hóa đơn điện tử <-> Hệ thống | Dữ liệu thanh toán/đồng bộ kế toán/hóa đơn điện tử | Hai chiều | Chưa áp dụng ở MVP |

#### 1.3.5 Sơ đồ ngữ cảnh hệ thống mức cao
```mermaid
flowchart LR
    LT[Lễ tân / Cố vấn dịch vụ]
    KT[Kỹ thuật viên]
    KHO[Thủ kho phụ tùng]
    TN[Thu ngân / Kế toán nội bộ]
    QL[Quản lý vận hành / Chủ garage]
    KH[Khách hàng]
    MSG[Dịch vụ Email/SMS]
    EXT[Cổng thanh toán / ERP / HĐĐT (Future)]

    SYS[Vehicle Service Management System]

    LT -->|Tiếp nhận xe, lịch hẹn, phiếu dịch vụ| SYS
    KT -->|Cập nhật chẩn đoán, tiến độ| SYS
    KHO -->|Xuất kho, cập nhật tồn| SYS
    TN -->|Hóa đơn, thanh toán| SYS
    SYS -->|Báo cáo, cảnh báo| QL
    KH -->|Thông tin xe, yêu cầu| SYS
    SYS -->|Kết quả dịch vụ, chứng từ| KH
    SYS -->|Nhắc lịch/Thông báo| MSG
    SYS -.Định hướng mở rộng.- EXT
```

#### 1.3.6 Ghi chú phụ thuộc và ràng buộc ngữ cảnh
- Tại phiên bản MVP, hệ thống ưu tiên mô hình vận hành nội bộ một chi nhánh và chưa phụ thuộc bắt buộc vào tích hợp bên thứ ba.
- Luồng thông tin nghiệp vụ cốt lõi được thiết kế theo hướng real-time để giảm độ trễ giữa lễ tân, kỹ thuật, kho và thu ngân.
- Các tích hợp ngoài phạm vi (thanh toán trực tuyến, ERP, hóa đơn điện tử) chỉ được nêu như phụ thuộc tương lai để tránh mở rộng phạm vi sớm.

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
