# QUY TẮC VIẾT BÁO CÁO CHÍNH THỨC

## 1. Mục đích áp dụng
Tài liệu này quy định nguyên tắc bắt buộc khi biên soạn file `docs/report/garage-thesis-report.md`.
Mục tiêu là bảo đảm nội dung báo cáo luôn đúng cấu trúc học thuật, đúng trọng tâm đề tài, và giữ chất lượng trình bày nhất quán.

## 2. Nguyên tắc cốt lõi
- Mỗi đề mục trong báo cáo phải được hiểu đúng bản chất trước khi viết.
- Trước khi viết đề mục nào, phải đọc tài liệu hướng dẫn tương ứng trong `docs/technique/` để xác định:
  - đề mục cần trả lời câu hỏi gì,
  - đầu ra cần thể hiện những thành phần nào,
  - mức độ chi tiết và chuẩn trình bày yêu cầu.
- Không viết theo cảm tính hoặc suy diễn thiếu căn cứ từ đề tài.
- Nội dung trình bày trong báo cáo phải phản ánh trực tiếp hệ thống đang xây dựng: **Vehicle Service Management System**.

## 3. Quy trình bắt buộc cho từng đề mục
1. Xác định đề mục sắp viết (ví dụ: 1.3, 2.1, 3.2).
2. Mở file hướng dẫn tương ứng trong `docs/technique/`.
3. Trích ra danh sách ý bắt buộc phải có của đề mục đó.
4. Viết nội dung theo đúng ngữ cảnh đề tài garage, không sao chép máy móc ví dụ chung.
5. Tự kiểm tra chất lượng trước khi chốt:
   - đủ ý,
   - logic,
   - đúng thuật ngữ,
   - nhất quán với các mục trước.

## 4. Tiêu chuẩn nội dung
- Đầy đủ: không bỏ sót các thành phần bắt buộc của đề mục.
- Chính xác: dữ liệu, thuật ngữ, phạm vi chức năng và vai trò phải đúng với quyết định đã chốt.
- Nhất quán: các phần Vision, Stakeholder, Requirement, Design, Testing không mâu thuẫn nhau.
- Có chiều sâu phân tích: nêu rõ vấn đề, nguyên nhân, mục tiêu, cách tiếp cận và tiêu chí đánh giá.
- Bám sát thực tiễn nghiệp vụ garage; không trình bày chung chung.

## 5. Tiêu chuẩn văn phong
- Văn phong học thuật, chuyên nghiệp, rõ ràng.
- Câu văn dứt khoát, tránh khẩu ngữ.
- Không dùng giọng văn mang tính “AI trả lời”.
- Không viết kiểu ghi chú vận hành như:
  - “refer cái này”,
  - “lấy từ mục/file nào”,
  - “theo checklist nội bộ”.
- Không đưa meta-commentary vào nội dung báo cáo.

## 6. Quy định trình bày trong file báo cáo
- Mỗi mục phải có tiêu đề rõ ràng và cấu trúc hợp lý (tiểu mục, bảng, danh sách khi cần).
- Khi cần nêu phạm vi, phải trình bày theo ngôn ngữ báo cáo (in-scope/out-of-scope), không ghi dạng nhắc việc.
- Các danh sách chức năng, vai trò, KPI, rủi ro cần thể hiện bằng nội dung hoàn chỉnh, có ngữ nghĩa nghiệp vụ.
- Tránh lặp ý giữa các mục; nếu có liên hệ, diễn đạt bằng ngôn ngữ tự nhiên trong cùng mạch nội dung.

## 7. Danh sách kiểm tra trước khi chốt mỗi mục
- [ ] Đã đọc file hướng dẫn tương ứng trong `docs/technique/`.
- [ ] Nội dung phản ánh đúng đề tài garage, không phải template chung.
- [ ] Không có câu mang tính ghi chú nội bộ hoặc giọng điệu hội thoại.
- [ ] Có đủ các thành phần bắt buộc của đề mục.
- [ ] Không mâu thuẫn với các quyết định đã chốt (stack, kiến trúc, phạm vi chức năng, vai trò).

## 8. Quy tắc áp dụng lâu dài
Mỗi lần có yêu cầu viết hoặc cập nhật `garage-thesis-report.md`, phải kiểm tra tài liệu này trước khi soạn thảo.
Nếu phát hiện mục nào chưa đạt chuẩn theo quy tắc trên, phải chỉnh sửa ngay trước khi chuyển sang mục tiếp theo.
