# BÁO CÁO BÀN GIAO BUỔI 3: LẬP KẾ HOẠCH DỰ ÁN THEO AGILE/SCRUM RÚT GỌN & PRODUCT BACKLOG CHI TIẾT

**Học phần:** Chuyên đề Tốt nghiệp 2 (Khoa CNTT — Trường Đại học Văn Lang)  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Trung  
**Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên  
**Nhóm sinh viên thực hiện:**
1. Nguyễn Văn Chí (MSSV: 2374802010056) — Nhóm trưởng
2. Nguyễn Tấn Hoàng Thông (MSSV: 2374802010485)
3. Lê Quang Anh Tuấn (MSSV: 2374802010538)

---

## 1. Mục tiêu và Căn cứ Lập kế hoạch

Tài liệu này được xây dựng dựa trên:
1. Hướng dẫn tại slide bài giảng **`Buoi03_ChuyenDeTotNghiep2.pdf`**.
2. Đặc tả yêu cầu kỹ thuật **`CDTN2_SRS.docx`** và đặc tả Use Case **`Dac_ta.docx`** (FR-01 $\rightarrow$ FR-08, UC-01 $\rightarrow$ UC-10).
3. Bảng công nghệ đã chốt **`CongNgheSD.xlsx`** (React.js + Tailwind CSS, Node.js + Express.js, PostgreSQL).
4. Khung thời gian: Mô hình Agile/Scrum rút gọn được thiết kế tối ưu cho **lộ trình 10 buổi học** (không áp dụng hình thức rườm rà như daily standup đầy đủ, tập trung vào: Backlog được ưu tiên MoSCoW, chia Sprint rõ ràng, và Demo nghiệm thu cuối mỗi Sprint).

---

## 2. Product Backlog chi tiết ưu tiên theo MoSCoW (Must - Should - Could - Won't)

### Quy ước mức độ ưu tiên:
- **Must-have (M):** Bắt buộc phải có để hệ thống vận hành luồng nghiệp vụ cốt lõi (Core flow).
- **Should-have (S):** Tính năng quan trọng, tăng cường độ tin cậy và hoàn thiện trải nghiệm.
- **Could-have (C):** Tiện ích mở rộng nếu còn thời gian Sprint.
- **Won't-have (W):** Thống nhất không đưa vào phạm vi CD2 (Thanh toán tiền thật, Chat socket real-time phức tạp, App Mobile Native).

| Mã PB | Tên User Story & Mô tả | Use Case / FR | Tiêu chí chấp nhận (Acceptance Criteria - AC) | Độ ưu tiên (MoSCoW) | Story Points | Thành viên phụ trách |
|---|---|---|---|---|---|---|
| **PB-01** | **Đăng ký tài khoản Sinh viên / Nhà tuyển dụng**<br>*Là Sinh viên/NTD, tôi muốn đăng ký tài khoản với email và mật khẩu để tham gia nền tảng.* | UC-01<br>(FR-01) | - AC1: Kiểm tra tính hợp lệ của email và độ dài mật khẩu $\ge$ 6 ký tự.<br>- AC2: Kiểm tra email không được trùng lặp trong hệ thống (báo lỗi 409).<br>- AC3: Mật khẩu được mã hóa an toàn bằng bcrypt trước khi lưu vào CSDL.<br>- AC4: Khởi tạo hồ sơ cá nhân rỗng tương ứng với vai trò. | **Must-have** | 3 | Nguyễn Văn Chí |
| **PB-02** | **Đăng nhập và cấp Token xác thực**<br>*Là người dùng, tôi muốn đăng nhập bằng email và mật khẩu để nhận phiên làm việc bảo mật.* | UC-02<br>(FR-01) | - AC1: Xác thực đúng thông tin và cấp JWT Token có thời hạn 7 ngày.<br>- AC2: Chặn tài khoản ở trạng thái `BANNED` (báo lỗi 403).<br>- AC3: Cung cấp API `GET /api/auth/me` để lấy thông tin phiên hiện tại. | **Must-have** | 2 | Nguyễn Văn Chí |
| **PB-03** | **Quản lý hồ sơ cá nhân (Profile)**<br>*Là Sinh viên/NTD, tôi muốn cập nhật kỹ năng, trường học hoặc thông tin doanh nghiệp.* | UC-03 | - AC1: Sinh viên cập nhật: kỹ năng, trường ĐH, chuyên ngành, link CV.<br>- AC2: NTD cập nhật: tên công ty, địa chỉ, website đại diện.<br>- AC3: Cho phép xem hồ sơ công khai của đối tác. | **Should-have** | 3 | Lê Quang Anh Tuấn |
| **PB-04** | **Nhà tuyển dụng đăng tin việc làm mới**<br>*Là Nhà tuyển dụng, tôi muốn tạo tin tuyển dụng part-time với mức lương, địa điểm và mô tả.* | UC-04<br>(FR-02) | - AC1: Yêu cầu bắt buộc: Tiêu đề $\ge$ 5 ký tự, mô tả $\ge$ 10 ký tự, ngành nghề, địa điểm, mức lương dương.<br>- AC2: Trạng thái khởi tạo mặc định: `status = 'OPEN'`.<br>- AC3: Tin đăng tự động gắn với ID của nhà tuyển dụng tạo tin. | **Must-have** | 5 | Nguyễn Tấn Hoàng Thông |
| **PB-05** | **Tìm kiếm & Lọc tin tuyển dụng**<br>*Là Sinh viên, tôi muốn tìm việc theo từ khóa, ngành nghề, khu vực và khoảng lương.* | UC-05<br>(FR-03) | - AC1: Hỗ trợ tìm kiếm theo từ khóa trong tiêu đề và mô tả.<br>- AC2: Lọc theo ngành nghề (CNTT, F&B, Thiết kế, Gia sư) và khu vực (Quận 1, Bình Thạnh, Remote).<br>- AC3: Chỉ hiển thị các tin ở trạng thái `OPEN` và đã được `APPROVED`.<br>- AC4: Hỗ trợ phân trang danh sách việc làm. | **Must-have** | 5 | Lê Quang Anh Tuấn |
| **PB-06** | **Xem chi tiết tin tuyển dụng**<br>*Là Sinh viên, tôi muốn xem đầy đủ yêu cầu và quyền lợi để quyết định ứng tuyển.* | UC-05 / UC-06 | - AC1: Hiển thị đầy đủ mô tả, yêu cầu, lương, địa điểm và thông tin NTD.<br>- AC2: Hiển thị nút nộp đơn nếu tin còn nhận ứng viên.<br>- AC3: Báo lỗi phù hợp nếu tin không tồn tại hoặc đã đóng. | **Must-have** | 2 | Lê Quang Anh Tuấn |
| **PB-07** | **Sinh viên nộp đơn ứng tuyển (Apply)**<br>*Là Sinh viên, tôi muốn nộp thư giới thiệu và CV vào tin tuyển dụng.* | UC-06<br>(FR-04) | - AC1: Sinh viên chỉ được nộp đơn khi tin đang `OPEN` và `APPROVED`.<br>- AC2: Ngăn chặn NTD tự ứng tuyển vào tin của chính mình.<br>- AC3: Ràng buộc duy nhất: Một sinh viên chỉ nộp tối đa 1 đơn cho 1 việc làm (Chống nộp đơn trùng).<br>- AC4: Trạng thái đơn khởi tạo là `PENDING`. | **Must-have** | 5 | Nguyễn Văn Chí |
| **PB-08** | **Sinh viên theo dõi trạng thái ứng tuyển**<br>*Là Sinh viên, tôi muốn xem danh sách các công việc đã nộp và kết quả xét duyệt.* | UC-06 | - AC1: Liệt kê đầy đủ các công việc sinh viên đã nộp.<br>- AC2: Hiển thị rõ trạng thái: `PENDING` (Chờ duyệt), `ACCEPTED` (Đã nhận), `REJECTED` (Từ chối). | **Must-have** | 3 | Lê Quang Anh Tuấn |
| **PB-09** | **Nhà tuyển dụng quản lý ứng viên (Xem/Duyệt/Từ chối)**<br>*Là Nhà tuyển dụng, tôi muốn xem danh sách ứng viên và phê duyệt hoặc từ chối hồ sơ.* | UC-07<br>(FR-05) | - AC1: Chỉ chủ sở hữu tin tuyển dụng mới có quyền xem danh sách ứng viên của tin đó.<br>- AC2: Cập nhật trạng thái đơn ứng tuyển thành `ACCEPTED` hoặc `REJECTED`.<br>- AC3: Cấm người dùng khác can thiệp vào đơn ứng tuyển không thuộc quyền. | **Must-have** | 5 | Nguyễn Tấn Hoàng Thông |
| **PB-10** | **Cập nhật tiến độ & trạng thái công việc**<br>*Là Nhà tuyển dụng, tôi muốn chuyển trạng thái tin sang đã nhận người hoặc hoàn thành.* | UC-08<br>(FR-06) | - AC1: Chuyển đổi trạng thái: `OPEN` $\rightarrow$ `FILLED` $\rightarrow$ `COMPLETED` hoặc `CLOSED`.<br>- AC2: Không cho phép hoàn tác tin đã `COMPLETED` trở lại `OPEN`.<br>- AC3: Chỉ nhà tuyển dụng tạo tin mới có quyền đổi trạng thái. | **Must-have** | 3 | Nguyễn Tấn Hoàng Thông |
| **PB-11** | **Đánh giá hai chiều sau khi hoàn thành công việc**<br>*Là Sinh viên/NTD, tôi muốn đánh giá và chấm điểm sao đối tác sau khi việc hoàn tất.* | UC-09<br>(FR-07) | - AC1: Chỉ cho phép đánh giá khi công việc ở trạng thái `COMPLETED`.<br>- AC2: Người đánh giá và người được đánh giá phải có quan hệ làm việc thực tế trong công việc đó.<br>- AC3: Không được tự đánh giá chính mình.<br>- AC4: Điểm đánh giá hợp lệ từ 1 đến 5 sao; mỗi bên chỉ đánh giá 1 lần cho 1 công việc. | **Should-have** | 5 | Nguyễn Văn Chí |
| **PB-12** | **Xem điểm uy tín và nhận xét đối tác**<br>*Là người dùng, tôi muốn xem điểm đánh giá trung bình và các nhận xét trước khi hợp tác.* | UC-09 | - AC1: Tính toán điểm đánh giá trung bình (làm tròn 1 chữ số thập phân).<br>- AC2: Hiển thị danh sách phản hồi từ các đối tác trước đó. | **Should-have** | 2 | Lê Quang Anh Tuấn |
| **PB-13** | **Quản trị viên kiểm duyệt tin đăng & người dùng**<br>*Là Admin, tôi muốn duyệt/hủy tin đăng và khóa tài khoản vi phạm chính sách.* | UC-10 | - AC1: Quản trị viên duyệt tin: `moderation_status = 'APPROVED'` hoặc `'REJECTED'`.<br>- AC2: Khóa (`BANNED`) hoặc mở khóa (`ACTIVE`) tài khoản người dùng.<br>- AC3: Xem báo cáo thống kê số liệu tổng quan hệ thống. | **Should-have** | 5 | Nguyễn Tấn Hoàng Thông |
| **PB-14** | **Thông báo cơ bản khi có cập nhật trạng thái**<br>*Là người dùng, tôi muốn nhận thông báo khi có đơn mới hoặc đơn được duyệt.* | NFR-02 | - AC1: Ghi nhận thông báo trong hệ thống khi đơn ứng tuyển được gửi hoặc được duyệt.<br>- AC2: Hiển thị thông báo trạng thái tức thời trên giao diện (Toast message). | **Could-have** | 3 | Lê Quang Anh Tuấn |
| **PB-15** | **Thanh toán tiền lương trực tiếp qua cổng trung gian** | Ngoại vi | Thanh toán chuyển khoản thực tế qua VNPay/Momo | **Won't-have** | - | *Ngoài phạm vi CD2* |
| **PB-16** | **Ứng dụng Native Mobile (iOS/Android) riêng** | Ngoại vi | Viết mã nguồn Swift / Kotlin riêng biệt | **Won't-have** | - | *Ngoài phạm vi CD2* |

**Tổng Story Points cam kết cho dự án:** **41 Story Points** (Tập trung 100% vào Must-have và Should-have).

---

## 3. Kế hoạch phân chia Sprint ánh xạ theo lộ trình 10 Buổi học

Mô hình chia Sprint được cấu trúc chặt chẽ theo 4 giai đoạn lớn của đồ án:

```
[Buổi 1-3: Khởi động & Kế hoạch] ──► [Buổi 4-5: Sprint Thiết kế (Mốc 1)] ──► [Buổi 6-7: Sprint Xây dựng (Mốc 2)] ──► [Buổi 8-10: Kiểm thử & Báo cáo]
```

| Buổi học | Tên giai đoạn / Sprint | Mục tiêu kỹ thuật cốt lõi | Các mục Backlog giải quyết | Sản phẩm / Bàn giao nghiệm thu |
|---|---|---|---|---|
| **Buổi 1** | Khởi động & Đăng ký đề tài | Thống nhất đề tài, bầu nhóm trưởng, phân tích bối cảnh bài toán | Tìm hiểu đề tài, lập nhật ký buổi 1 | Biên bản đăng ký đề tài, mục tiêu và phạm vi |
| **Buổi 2** | Phân tích yêu cầu đề tài | Hoàn thiện SRS, xác định Functional Requirements (FR-01 $\rightarrow$ FR-08), đặc tả Use Case | Phân tích nghiệp vụ UC-01 $\rightarrow$ UC-10 | Tài liệu `CDTN2_SRS.docx`, `Dac_ta.docx` |
| **Buổi 3** | Lập kế hoạch Agile/Scrum rút gọn | Chuyển yêu cầu thành Product Backlog, gán nhãn MoSCoW, phân bổ Sprint và phân chia vai trò | PB-01 $\rightarrow$ PB-14, lập bảng phân vai trò kỹ thuật | `buoi-03-ke-hoach-agile-product-backlog.md`, bảng Product Backlog |
| **Buổi 4** | **Sprint Thiết kế: Kiến trúc tổng thể** | Phác thảo kiến trúc 3 tầng, chốt công nghệ (Node/Express + React + PostgreSQL), thiết kế ERD sơ bộ | DB-05, DB-06, DB-07, thiết kế tầng Routes - Services - Repositories | Sơ đồ kiến trúc hệ thống, bảng phân tích công nghệ, nhật ký buổi 4 |
| **Buổi 5** | **Sprint Thiết kế: Thiết kế chi tiết (Mốc GK 1 - 30%)** | Hoàn thiện DDL CSDL, API Contract, Sequence diagrams, chuẩn bị môi trường phát triển | DB-03, DB-05, DDL `001_initial_schema.sql`, API specs | **Hồ sơ thiết kế chi tiết hoàn chỉnh, CSDL PostgreSQL sẵn sàng, Nhật ký buổi 1-5 (Chấm Rubric 2)** |
| **Buổi 6** | **Sprint Xây dựng 1: Module Cốt lõi** | Lập trình module Xác thực (JWT/bcrypt), Đăng tin (JobPost), Tìm kiếm & Ứng tuyển cơ bản | PB-01, PB-02, PB-04, PB-05, PB-06, PB-07 | Backend API chạy được, Demo luồng Đăng ký $\rightarrow$ Đăng tin $\rightarrow$ Tìm kiếm $\rightarrow$ Nộp đơn |
| **Buổi 7** | **Sprint Xây dựng 2: Module Mở rộng (Mốc GK 2)** | Quản lý ứng viên (Duyệt/từ chối), Chuyển trạng thái công việc, Đánh giá sau việc, Quản trị Admin | PB-08, PB-09, PB-10, PB-11, PB-12, PB-13 | **Sản phẩm hoàn thiện toàn bộ luồng nghiệp vụ 10 Use Cases, Demo chức năng cho GVHD chấm mốc 2** |
| **Buổi 8** | Kiểm thử & Tinh chỉnh sản phẩm | Kiểm thử tích hợp, kiểm tra bảo mật (SQL Injection, JWT expiration, Role check), kiểm thử giao diện bằng Playwright | DB-08, Viết unit tests & integration tests | Bộ test báo cáo kết quả: `node:test` + kịch bản kiểm thử lỗi giao diện |
| **Buổi 9** | Triển khai & Viết báo cáo | Đóng gói sản phẩm, hướng dẫn triển khai local/cloud, hoàn thiện bản thảo báo cáo tổng kết | DB-09, DB-12, Viết Báo cáo Chuyên đề tốt nghiệp | Tài liệu hướng dẫn cài đặt (`README.md`), Báo cáo Chuyên đề bản thảo |
| **Buổi 10** | Tổng duyệt & Chuẩn bị bảo vệ | Tổng duyệt demo sản phẩm, chuẩn bị slide thuyết trình, kiểm tra kịch bản hỏi đáp trước Hội đồng | DB-12, Tổng duyệt toàn bộ hệ thống | Slide báo cáo, video demo hoàn chỉnh, sẵn sàng bảo vệ chính thức |

---

## 4. Bảng Phân công Vai trò Kỹ thuật (Technical Role Assignment)

Nhóm gồm 3 thành viên, phân công chuyên môn rõ ràng nhằm tránh tình trạng chồng chéo hoặc bỏ sót trách nhiệm tích hợp:

| Thành viên | Vai trò kỹ thuật chính | Vai trò kỹ thuật phụ | Trách nhiệm chi tiết & Module phụ trách | Cam kết chất lượng bàn giao |
|---|---|---|---|---|
| **Nguyễn Văn Chí**<br>*(MSSV: 2374802010056)<br>**Nhóm trưởng** | **Backend Lead & System Architecture** | Database & DevOps | - Thiết kế kiến trúc phân tầng 3-tier Backend (Express.js).<br>- Phụ trách Module Xác thực (JWT, bcrypt), Module Ứng tuyển (Applications) và Module Đánh giá (Reviews).<br>- Điều phối tiến độ chung, kiểm soát Git repository và tích hợp hệ thống. | - API tuân thủ chuẩn RESTful, mã lỗi HTTP chính xác.<br>- Viết unit test đạt độ phủ 100% cho tầng Service phụ trách.<br>- Bảo đảm CSDL không bị lỗi rò rỉ kết nối (Connection pool). |
| **Nguyễn Tấn Hoàng Thông**<br>*(MSSV: 2374802010485)* | **Backend Developer & Data Modeler** | QA / Security Tester | - Thiết kế chi tiết lược đồ CSDL PostgreSQL, viết migrations và seeds data.<br>- Phụ trách Module Quản lý Tin việc làm (Jobs) và Module Quản trị viên (Admin moderation & stats).<br>- Kiểm thử phân quyền vai trò (Role-based Authorization) và phòng chống SQL Injection. | - Mọi truy vấn SQL đều dùng Parameterized Query ($1, $2).<br>- Thiết kế quan hệ và ràng buộc khóa ngoại (Foreign key) chuẩn xác.<br>- Hoàn thiện đầy đủ API cho Admin và Employer. |
| **Lê Quang Anh Tuấn**<br>*(MSSV: 2374802010538)* | **Frontend Lead & UI/UX Designer** | Client-side Integration | - Xây dựng giao diện người dùng trên nền tảng React.js + Tailwind CSS.<br>- Phụ trách các màn hình: Khám phá Việc làm, Bộ lọc tìm kiếm, Kênh sinh viên, Kênh nhà tuyển dụng.<br>- Kết nối Frontend với RESTful API Backend, quản lý State và thông báo phản hồi (Toast/Loading/Error). | - Giao diện hiện đại, chuẩn Responsive trên màn hình Desktop (tỷ lệ 16:9).<br>- Không phát sinh lỗi JavaScript Console hoặc vỡ layout.<br>- Trải nghiệm người dùng mượt mà, trực quan. |

---

## 5. Quy trình Quản trị Tiến độ và Kế hoạch Demo nghiệm thu

1. **Công cụ theo dõi Backlog:** Nhóm sử dụng file `Product_Backlog.xlsx` kết hợp Git commits có gắn mã User Story (ví dụ: `feat(job): implement UC-04 job posting [PB-04]`).
2. **Kế hoạch Demo tiến độ:**
   - **Demo Sprint 1 (Buổi 6):** Demo trực tiếp cho GVHD luồng: Tạo tài khoản $\rightarrow$ Đăng tin việc làm $\rightarrow$ Tìm kiếm/Lọc tin $\rightarrow$ Gửi hồ sơ ứng tuyển.
   - **Demo Sprint 2 (Buổi 7):** Demo toàn vẹn luồng: Duyệt hồ sơ $\rightarrow$ Hoàn thành công việc $\rightarrow$ Đánh giá 2 chiều $\rightarrow$ Admin kiểm duyệt tin và giám sát số liệu.
3. **Kế hoạch dự phòng rủi ro (Risk Contingency):**
   - *Rủi ro nghẽn tiến độ Frontend:* Backend đã có sẵn bộ Unit Test và mock data, có thể kiểm thử độc lập qua API trước khi nối giao diện.
   - *Rủi ro CSDL PostgreSQL:* Đã xây dựng sẵn script `npm run migrate` và `npm run seed` tự động tạo DB, có thể thiết lập lại môi trường trong 15 giây.

---
*Tài liệu đã được nhóm rà soát, thống nhất và lưu trữ chính thức tại kho mã nguồn của dự án.*
