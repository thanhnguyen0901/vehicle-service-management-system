# ĐẶC TẢ LÀM VIỆC VỚI AI CHO BÁO CÁO ĐỒ ÁN

## 1. Mục đích
Tài liệu này là nguồn hướng dẫn vận hành chính khi yêu cầu AI viết hoặc cập nhật `docs/report/garage-thesis-report.md`.
Mục tiêu là bảo đảm mọi nội dung sinh ra đều đúng chuẩn học thuật, đúng đề tài, đúng phạm vi đã chốt, và nhất quán xuyên suốt báo cáo.

## 2. Phạm vi áp dụng
Áp dụng cho mọi yêu cầu thuộc các mục `1.1 -> 7.5` trong báo cáo đồ án.

## 3. Nguồn sự thật (Source of Truth) theo thứ tự ưu tiên
1. `docs/report/report-writing-rules.md` (quy tắc văn phong và chất lượng bắt buộc)
2. `docs/technique/*` (hướng dẫn nội dung và đầu ra cho từng đề mục)
3. `docs/report/artifacts/mvp-functional-requirements.md` (FR MVP đã chốt)
4. `docs/report/artifacts/role-permission-matrix-v1.md` (ma trận vai trò/quyền)
5. `docs/audit/daily-progress-log.md` (tiến độ và quyết định theo ngày)
6. `docs/report/garage-thesis-report.md` (nội dung báo cáo chính thức đang biên soạn)

## 4. Bối cảnh đề tài đã chốt (không tự ý thay đổi)
- Loại ứng dụng: Web application
- Kiến trúc: Modular Monolith
- Backend: Node.js + NestJS
- ORM: Prisma
- Validation: Zod
- Auth & Security: JWT + bcrypt, cookie-parser, cors, helmet, rate-limit
- Frontend: React 18 + TypeScript, Vite, React Router v6
- FE state/data/UI: Redux Toolkit + Redux Saga, Axios, PrimeReact + Tailwind, Formik + Yup, i18next (vi/en), Recharts
- Cơ sở dữ liệu: PostgreSQL
- Quy ước ID: UUIDv7 cho ID/PK/FK
- API convention: `/api/v1` + chuẩn lỗi thống nhất
- Chức năng MVP: FR-01..FR-19 (đã chốt)
- Vai trò hệ thống: 6 vai trò (Admin, Service Advisor, Technician, Inventory Clerk, Cashier, Manager)

## 5. Bản đồ đề mục báo cáo -> tài liệu technique bắt buộc đọc
- 1.1 -> `docs/technique/1.1-vision.txt`
- 1.2 -> `docs/technique/1.2-stakeholder.txt`
- 1.3 -> `docs/technique/1.3-system context.txt`
- 2.1 -> `docs/technique/2.1-usecase.txt`
- 2.2 -> `docs/technique/2.2-process modeling.txt`
- 2.3 -> `docs/technique/2.3-data modeling.txt`
- 3.1 -> `docs/technique/3.1-functional requirement.txt`
- 3.2 -> `docs/technique/3.2-non functional requirement.txt`
- 3.3 -> `docs/technique/3.3-UI mockup.txt`
- 4.1 -> `docs/technique/4.1-drive.txt`
- 4.2 -> `docs/technique/4.2-tech choice.txt`
- 4.3 -> `docs/technique/4.3-architecture.txt`
- 5.1 -> `docs/technique/5.1-component.txt`
- 5.2 -> `docs/technique/5.2-api design.txt`
- 5.3 -> `docs/technique/5.3-database architecture.txt`
- 5.4 -> `docs/technique/5.4-security design.txt`
- 6.1 -> `docs/technique/6.1-class design.txt`
- 6.2 -> `docs/technique/6.2-sequence diagram.txt`
- 6.3 -> `docs/technique/6.3-UI high fidelity.txt`
- 6.4 -> `docs/technique/6.4-database detail design.txt`
- 7.1 -> `docs/technique/7.1-algorithm.txt`
- 7.2 -> `docs/technique/7.2-exception design.txt`
- 7.3 -> `docs/technique/7.3-testing.txt`
- 7.4 -> `docs/technique/7.4-development standard.txt`
- 7.5 -> `docs/technique/7.5-implementation plan.txt`

## 6. Quy trình bắt buộc khi nhận yêu cầu "viết mục X"
1. Xác định đúng mục X trong `garage-thesis-report.md`.
2. Đọc file `docs/technique` tương ứng của mục X.
3. Trích các thành phần bắt buộc phải có cho mục X.
4. Đối chiếu với quyết định hiện tại của đề tài (stack, FR, role, scope).
5. Viết nội dung trực tiếp vào `garage-thesis-report.md` bằng văn phong báo cáo chính thức.
6. Tự rà soát theo checklist chất lượng trước khi chốt.
7. Cập nhật `docs/audit/daily-progress-log.md` với thay đổi đã thực hiện.

## 7. Checklist chất lượng trước khi chốt
- [ ] Đã đọc đúng file `docs/technique` của mục đang viết.
- [ ] Nội dung bám sát đề tài Garage và quyết định đã chốt.
- [ ] Có đủ thành phần bắt buộc của đề mục.
- [ ] Văn phong học thuật, không giọng hội thoại.
- [ ] Không chứa câu kiểu ghi chú nội bộ.
- [ ] Không mâu thuẫn với FR, role matrix, kiến trúc, stack.
- [ ] Có tính logic, rõ luận điểm, rõ phạm vi.

## 8. Điều cấm khi viết báo cáo
- Không viết theo kiểu "ghi chú làm việc" hoặc "todo list" trong phần nội dung học thuật.
- Không dùng câu như "tham chiếu file...", "refer...", "theo checklist..." trong thân bài báo cáo.
- Không đưa phát biểu chưa được chốt thành sự thật trong báo cáo.
- Không thay đổi scope/stack/kiến trúc nếu chưa có xác nhận.

## 9. Mẫu lệnh khuyến nghị cho người dùng
- "Viết mục 1.3 trong garage-thesis-report.md theo chuẩn technique và rule hiện tại."
- "Viết lại mục 3.1 theo văn phong học thuật, bám FR-01..FR-19 đã chốt."
- "Soát mục 5.2 và chỉnh cho nhất quán với API convention /api/v1."

## 10. Đầu ra mong đợi sau mỗi lần cập nhật
- Nội dung mục được viết/chỉnh sửa trực tiếp trong `docs/report/garage-thesis-report.md`.
- Audit được cập nhật tại `docs/audit/daily-progress-log.md`.
- Nếu phát sinh quyết định mới, cập nhật thêm vào artifact hoặc phần quyết định đã chốt.
