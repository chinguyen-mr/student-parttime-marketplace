# BÁO CÁO BÀN GIAO BUỔI 2: PHÂN TÍCH YÊU CẦU ĐỀ TÀI & ĐẶC TẢ YÊU CẦU (SRS RÚT GỌN)

**Học phần:** Chuyên đề Tốt nghiệp 2 (Khoa CNTT — Trường Đại học Văn Lang)  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Trung  
**Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên  
**Nhóm sinh viên thực hiện:**
1. Nguyễn Văn Chí (MSSV: 2374802010056) — Nhóm trưởng (Backend Lead & Architect)
2. Nguyễn Tấn Hoàng Thông (MSSV: 2374802010485) — Thành viên (Backend & Data Modeler)
3. Lê Quang Anh Tuấn (MSSV: 2374802010538) — Thành viên (Frontend Lead & UI/UX)

---

## 1. Mục tiêu buổi học (Theo Đề cương Buổi 2)
1. Nắm vững kỹ thuật thu thập và phân tích yêu cầu cho sản phẩm CNTT theo phương pháp 5W1H.
2. Phân biệt rõ ràng yêu cầu chức năng (Functional Requirements - FR) và yêu cầu phi chức năng (Non-functional Requirements - NFR).
3. Xác định rõ ràng các tác nhân (Actors) và luồng nghiệp vụ đầu-cuối (End-to-End Workflow).
4. Xây dựng bản đặc tả yêu cầu phần mềm rút gọn (SRS rút gọn) chuẩn 4 mục làm tiền đề cho việc lập Product Backlog ở Buổi 3 và thiết kế hệ thống ở Buổi 4-5.

---

## 2. Khai thác Yêu cầu Bài toán bằng Kỹ thuật 5W1H

| Thành tố 5W1H | Câu hỏi đặt ra | Phân tích & Trả lời cụ thể cho Đề tài |
|---|---|---|
| **WHO (Ai)** | Ai là đối tượng người dùng chính tham gia hệ thống? | - **Sinh viên (Student):** Sinh viên các trường ĐH (đặc biệt ĐH Văn Lang) cần tìm việc làm part-time phù hợp lịch học.<br>- **Nhà tuyển dụng (Employer):** Các hộ kinh doanh, doanh nghiệp SME, cá nhân cần tìm nhân sự thời vụ ngắn hạn.<br>- **Quản trị viên (Admin):** Người điều hành kiểm duyệt nội dung tin đăng và đảm bảo an toàn cho nền tảng. |
| **WHAT (Cái gì)** | Hệ thống cần cung cấp sản phẩm/tính năng gì? | Nền tảng Marketplace 2 chiều kết nối việc làm: Quản lý hồ sơ, Đăng tin, Tìm kiếm & Lọc việc làm, Nộp đơn ứng tuyển, Quản lý ứng viên, Cập nhật tiến độ việc làm, và Đánh giá 2 chiều sau công việc. |
| **WHERE (Ở đâu)** | Hệ thống được sử dụng và áp dụng ở địa bàn nào? | - Môi trường Web Application tương thích trình duyệt hiện đại trên máy tính Desktop (tỷ lệ 16:9).<br>- Vị trí công việc: Tập trung tại khu vực TP.HCM (Quận 1, Bình Thạnh, Gò Vấp...) và các công việc làm từ xa (Remote / Freelance). |
| **WHEN (Khi nào)** | Thời điểm và thời hạn phát sinh nhu cầu làm việc? | - Theo ca làm việc linh hoạt (sáng/chiều/tối/cuối tuần) không trùng lịch học của sinh viên.<br>- Tuyển dụng theo mùa cao điểm hoặc dự án ngắn hạn (theo giờ, theo ca hoặc theo gói công việc). |
| **WHY (Tại sao)** | Tại sao cần xây dựng sản phẩm này? | - Giải quyết vấn đề nhức nhối: Sinh viên tìm việc qua mạng xã hội (Facebook groups) rất dễ dính bẫy lừa đảo, đa cấp hoặc bị quỵt lương.<br>- Nhà tuyển dụng gặp khó khăn khi đăng tin trên các kênh lớn (VietnamWorks, TopCV...) do chi phí cao và không nhắm trúng tệp ứng viên sinh viên. |
| **HOW (Như thế nào)** | Hệ thống vận hành và kết nối các bên ra sao? | Hệ thống vận hành thông qua quy trình tự động hóa khép kín: Nhà tuyển dụng đăng tin -> Sinh viên tìm kiếm & nộp hồ sơ trực tuyến -> Nhà tuyển dụng duyệt -> Thực hiện công việc -> Hoàn tất & Đánh giá uy tín minh bạch. |

---

## 3. Khung Đặc tả Yêu cầu Phần mềm Rút gọn (SRS Rút gọn)

### MỤC 1: MÔ TẢ BÀI TOÁN VÀ MỤC TIÊU SẢN PHẨM
- **Bối cảnh:** Thị trường việc làm part-time cho sinh viên hiện nay phát triển mạnh nhưng phân tán, thiếu công cụ xác minh độ tin cậy. Sinh viên thường mất nhiều thời gian tìm việc và có nguy cơ bị xâm hại quyền lợi.
- **Mục tiêu sản phẩm:** Xây dựng một nền tảng web ứng dụng tập trung (two-sided marketplace) giải quyết bài toán việc làm thời vụ sinh viên với chi phí vận hành thấp, cơ chế tương tác trực tiếp và đánh giá hai chiều minh bạch sau khi hoàn thành công việc.

### MỤC 2: XÁC ĐỊNH ACTOR VÀ LUỒNG NGHIỆP VỤ ĐẦU-CUỐI
- **Danh sách Actor:**
  1. `Sinh viên`: Tìm kiếm tin, xem chi tiết, ứng tuyển, quản lý đơn nộp, đánh giá nhà tuyển dụng.
  2. `Nhà tuyển dụng`: Đăng tin tuyển dụng, xem danh sách ứng viên, duyệt/từ chối đơn, cập nhật tiến độ công việc, đánh giá sinh viên.
  3. `Quản trị viên`: Quản lý tài khoản người dùng (khóa/mở khóa), kiểm duyệt tin tuyển dụng, giám sát số liệu thống kê nền tảng.
- **Luồng nghiệp vụ đầu-cuối (End-to-End Core Flow):**
  ```
  [Đăng ký/Đăng nhập] ──► [NTD Tạo tin tuyển dụng (OPEN)] ──► [Admin duyệt tin (APPROVED)]
                                                                     │
  [Đánh giá 2 chiều (COMPLETED)] ◄── [NTD Hoàn tất việc] ◄── [Sinh viên nộp đơn & NTD Duyệt]
  ```

### MỤC 3: DANH SÁCH YÊU CẦU CHỨC NĂNG ĐÃ ĐÁNH SỐ (FUNCTIONAL REQUIREMENTS)

| Mã FR | Thuộc Phân hệ / Module | Nội dung Yêu cầu Đặc tả | Vai trò thực hiện |
|---|---|---|---|
| **FR-01** | Xác thực & Phân quyền | Cho phép người dùng đăng ký, đăng nhập bảo mật; phân quyền nghiêm ngặt 3 vai trò: Sinh viên, Nhà tuyển dụng, Quản trị viên. Cung cấp phiên làm việc qua JWT. | Tất cả |
| **FR-02** | Đăng tin việc làm | Cho phép Nhà tuyển dụng tạo và đăng tin việc làm part-time với các trường thông tin: tiêu đề, mô tả, yêu cầu, ngành nghề, mức lương, địa điểm, thời gian làm việc. | Nhà tuyển dụng |
| **FR-03** | Tìm kiếm & Lọc việc làm | Cung cấp công cụ cho Sinh viên tìm kiếm theo từ khóa và lọc đa chiều theo ngành nghề, khu vực quận/huyện, khoảng lương; hỗ trợ phân trang kết quả. | Sinh viên |
| **FR-04** | Ứng tuyển việc làm | Cho phép Sinh viên gửi hồ sơ ứng tuyển vào tin tuyển dụng đang mở kèm theo thư giới thiệu (cover letter) và đường dẫn CV. Ngăn chặn nộp đơn trùng lặp. | Sinh viên |
| **FR-05** | Quản lý ứng viên | Hiển thị danh sách ứng viên nộp vào từng tin tuyển dụng; cho phép Nhà tuyển dụng xem chi tiết hồ sơ và đưa ra quyết định Duyệt (`ACCEPTED`) hoặc Từ chối (`REJECTED`). | Nhà tuyển dụng |
| **FR-06** | Quản lý vòng đời công việc | Cho phép Nhà tuyển dụng cập nhật trạng thái công việc theo luồng quy định: Đang mở (`OPEN`) $\rightarrow$ Đã nhận người (`FILLED`) $\rightarrow$ Hoàn thành (`COMPLETED`) hoặc Đóng (`CLOSED`). Không cho hoàn tác tin đã hoàn thành. | Nhà tuyển dụng |
| **FR-07** | Đánh giá hai chiều sau việc | Mở khóa chức năng chấm điểm sao (1 đến 5 sao) và viết nhận xét hai chiều giữa Sinh viên và Nhà tuyển dụng khi công việc đạt trạng thái `COMPLETED`. Ngăn chặn tự đánh giá chính mình. | Sinh viên & NTD |
| **FR-08** | Quản trị & Thông báo cơ bản | Cung cấp màn hình cho Quản trị viên duyệt tin, khóa tài khoản vi phạm; hiển thị thông báo phản hồi trạng thái ứng tuyển tức thời (Toast) cho người dùng. | Quản trị viên |

### MỤC 4: DANH SÁCH YÊU CẦU PHI CHỨC NĂNG ĐO LƯỜNG ĐƯỢC (NON-FUNCTIONAL REQUIREMENTS)

| Mã NFR | Tiêu chí kỹ thuật | Đặc tả yêu cầu & Ngưỡng định lượng đo lường | Phương pháp kiểm chứng |
|---|---|---|---|
| **NFR-01** | **Hiệu năng (Performance)** | Thời gian phản hồi của các API nghiệp vụ cốt lõi (Đăng nhập, Tìm việc, Nộp đơn) $\le$ **1.5 giây** trong điều kiện tải mạng nội bộ tiêu chuẩn. | Đo đạc qua HTTP response time & Network inspector. |
| **NFR-02** | **Bảo mật (Security)** | - 100% mật khẩu được mã hóa an toàn bằng thuật toán **bcryptjs** (10 salt rounds) trước khi lưu CSDL.<br>- 100% API nghiệp vụ bảo vệ qua Bearer JWT Token.<br>- Ngăn chặn SQL Injection thông qua Parameterized SQL Queries ($1, $2). | Unit tests bảo mật & Quét kiểm thử bảo mật. |
| **NFR-03** | **Tính toàn vẹn (Integrity)** | Ràng buộc duy nhất `UNIQUE(job_id, student_id)` để đảm bảo một sinh viên không thể nộp đơn 2 lần vào cùng 1 tin tuyển dụng. | PostgreSQL DB Constraint & Seed validation. |
| **NFR-04** | **Tương thích (Usability)** | Giao diện chuẩn Web Responsive, hiển thị tối ưu và ổn định trên màn hình Desktop tỷ lệ 16:9 (độ phân giải từ 1366x768 đến 1920x1080), không bị vỡ bố cục hoặc tràn thanh cuộn ngang ngoài ý muốn. | Vite React Client UI Review. |

---

## 4. Danh sách Phân rã 10 Use Case chuẩn hóa

Từ danh sách FR-01 $\rightarrow$ FR-08, hệ thống được phân rã thành 10 Use Cases chi tiết tương ứng với các phân hệ:

| Mã Use Case | Tên Use Case | Actor chính | Ánh xạ FR |
|---|---|---|---|
| **UC-01** | Đăng ký tài khoản (Register) | Sinh viên, NTD | FR-01 |
| **UC-02** | Đăng nhập hệ thống (Login) | Tất cả | FR-01 |
| **UC-03** | Cập nhật hồ sơ cá nhân (Manage Profile) | Sinh viên, NTD | FR-01 |
| **UC-04** | Đăng tin việc làm mới (Post Job) | Nhà tuyển dụng | FR-02 |
| **UC-05** | Tìm kiếm & Lọc việc làm (Search & Filter Jobs) | Sinh viên | FR-03 |
| **UC-06** | Ứng tuyển việc làm (Apply Job) | Sinh viên | FR-04 |
| **UC-07** | Xem & Duyệt đơn ứng tuyển (Manage Applications) | Nhà tuyển dụng | FR-05 |
| **UC-08** | Cập nhật trạng thái công việc (Update Job Status) | Nhà tuyển dụng | FR-06 |
| **UC-09** | Đánh giá hai chiều sau công việc (Submit Review) | Sinh viên, NTD | FR-07 |
| **UC-10** | Quản trị tin đăng & Người dùng (Admin Moderation) | Quản trị viên | FR-08 |

---

## 5. Trả lời Câu hỏi Thảo luận nhanh theo Slide Buổi 2

### Câu 1: Yêu cầu nào của nhóm có khả năng thay đổi nhiều nhất khi bắt tay vào làm thực tế? Vì sao?
- **Yêu cầu có nguy cơ thay đổi lớn nhất:** **FR-04 (Ứng tuyển việc làm) & FR-07 (Đánh giá hai chiều)**.
- **Lý do:**
  - Với **FR-04**, ban đầu nhóm dự kiến chỉ nhận đoạn văn giới thiệu bản thân dạng text. Tuy nhiên khi triển khai thực tế, sinh viên có nhu cầu nộp file CV (PDF/Word) hoặc liên kết CV online. Nhóm đã xử lý bằng cách cho phép lưu trường `cv_url` trong CSDL để đảm bảo tính linh hoạt và dễ nâng cấp.
  - Với **FR-07**, điều kiện mở khóa đánh giá phụ thuộc chặt chẽ vào quy trình chuyển đổi trạng thái của tin tuyển dụng (`COMPLETED`). Nhóm đã thiết lập ràng buộc nghiêm ngặt ở tầng Service để đảm bảo không ai có thể đánh giá khống trước khi việc hoàn thành.

### Câu 2: Nếu chỉ được chọn 3 yêu cầu chức năng quan trọng nhất để làm trước, nhóm bạn sẽ chọn gì?
Nhóm lựa chọn **3 tính năng sống còn (Core backbone)** tạo nên chu trình tương tác tối thiểu:
1. **FR-01 (Xác thực & Phân quyền):** Nền móng bảo mật để phân định vai trò giữa Sinh viên và Nhà tuyển dụng.
2. **FR-02 (Đăng tin tuyển dụng):** Khởi tạo nguồn cung việc làm trên nền tảng Marketplace.
3. **FR-04 (Ứng tuyển việc làm):** Kết nối nguồn cầu (sinh viên) với nguồn cung, kích hoạt giá trị trao đổi cốt lõi của nền tảng.

---
*Tài liệu đã được nhóm hoàn thiện và lưu trữ tại kho mã nguồn của dự án.*
