# TÀI LIỆU THIẾT KẾ BẢN MẪU GIAO DIỆN (WIREFRAMES & UI SPECIFICATION)
**Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên  
**Học phần:** Chuyên đề Tốt nghiệp 2 (Khoa CNTT — Trường Đại học Văn Lang)  
**Tài liệu phục vụ:** Buổi 5 — Thiết kế chi tiết (Mốc đánh giá giữa kỳ lần 1)  

---

## 1. Nguyên tắc Thiết kế Giao diện

1. **Chuẩn Responsive & Thân thiện người dùng:** Thiết kế tối ưu cho màn hình Desktop (tỷ lệ 16:9, độ phân giải từ 1366x768 trở lên) và tự động co giãn linh hoạt trên thiết bị di động theo chuẩn Tailwind CSS.
2. **Nhất quán với Mô hình Dữ liệu (ERD):** Mọi trường dữ liệu trên giao diện đều có ánh xạ trực tiếp 1-1 với các cột trong các bảng CSDL (`users`, `profiles`, `jobs`, `applications`, `reviews`). Không có trường dữ liệu "ma" không tồn tại trong DB.
3. **Phân quyền vai trò trực quan:** Giao diện điều chỉnh linh hoạt theo 3 Actor: **Sinh viên (STUDENT)**, **Nhà tuyển dụng (EMPLOYER)**, và **Quản trị viên (ADMIN)**.
4. **Trạng thái phản hồi đầy đủ:** Mỗi màn hình đều có kịch bản cho 4 trạng thái:
   - **Loading State:** Hiển thị hiệu ứng tải mượt mà (Skeleton loader hoặc Spinner).
   - **Empty State:** Hiển thị hình ảnh minh họa và thông báo gợi ý hành động khi không có dữ liệu.
   - **Success State:** Thông báo Toast xanh xác nhận thao tác thành công.
   - **Error State:** Thông báo lỗi cụ thể, hướng dẫn sửa đổi dữ liệu không hợp lệ.
5. **Không thêm chức năng ngoài phạm vi:** Tuyệt đối không tích hợp cổng thanh toán tiền thật, chat socket real-time phức tạp hay AI recommender.

---

## 2. Danh mục Bản mẫu Giao diện theo Phân hệ

```
PHÂN HỆ GIAO DIỆN CHÍNH
├── Phân hệ Sinh viên (Student)
│   ├── [WF-01] Màn hình Khám phá & Lọc việc làm Part-time
│   ├── [WF-02] Màn hình Chi tiết Tin việc làm & Modal Nộp đơn
│   ├── [WF-03] Màn hình Theo dõi Hồ sơ ứng tuyển của tôi
│   ├── [WF-04] Màn hình Quản lý Hồ sơ cá nhân (Profile)
│   └── [WF-05] Modal Đánh giá Nhà tuyển dụng sau công việc
│
├── Phân hệ Nhà tuyển dụng (Employer)
│   ├── [WF-06] Màn hình Form Đăng tin tuyển dụng mới
│   ├── [WF-07] Màn hình Quản lý Tin đăng & Cập nhật Trạng thái công việc
│   ├── [WF-08] Màn hình Xét duyệt Hồ sơ Ứng viên (Duyệt / Từ chối)
│   └── [WF-09] Modal Đánh giá Sinh viên sau khi hoàn thành việc
│
├── Phân hệ Quản trị viên (Admin)
│   ├── [WF-10] Bảng điều khiển Thống kê Tổng quan (KPI Dashboard)
│   ├── [WF-11] Màn hình Quản lý & Kiểm soát Tài khoản người dùng
│   └── [WF-12] Màn hình Kiểm duyệt Tin đăng tuyển dụng
│
└── Phân hệ Chung (Auth & Layout)
    ├── [WF-13] Màn hình Đăng ký / Đăng nhập
    └── [WF-14] Thanh điều hướng Header & Chuyển đổi vai trò kiểm thử
```

---

## 3. Đặc tả Chi tiết từng Bản mẫu Giao diện

---

### [WF-01] Màn hình Khám phá & Lọc việc làm Part-time
- **Use Case / FR liên quan:** UC-05 | FR-03
- **Actor sử dụng:** Sinh viên, Khách vãng lai
- **Quyền truy cập:** Công khai (Public)
- **API sử dụng:** `GET /api/jobs` (Query: `keyword`, `category`, `location`, `minSalary`, `maxSalary`, `workType`, `page`, `limit`)

#### Sơ đồ Bố cục Giao diện (Wireframe Layout):
```
+------------------------------------------------------------------------------------------+
| [LOGO] VLU Marketplace     [Khám phá Việc làm]  [Kênh NTD]  [Kênh SV]  [Admin]   [User Icon] |
+------------------------------------------------------------------------------------------+
| HERO BANNER: "Nền tảng kết nối Việc làm Part-time & Freelance cho Sinh viên Văn Lang"    |
| [ Ô tìm kiếm từ khóa... ] [Chọn Ngành nghề v] [Chọn Khu vực v] [Khoảng lương v] [TÌM KIẾM]|
+------------------------------------------------------------------------------------------+
| Danh sách Việc làm đang tuyển (3 việc)                          Sắp xếp: [Mới nhất v]     |
| +-----------------------------------+  +-----------------------------------+             |
| | [CNTT] [Part-time]                |  | [Thiết kế] [Freelance]            |             |
| | Lập trình viên Frontend React.js  |  | Cộng tác viên Banner UI/UX        |             |
| | 🏢 TechCorp Vietnam               |  | 🏢 TechCorp Vietnam               |             |
| | 💵 45.000 đ/giờ                   |  | 💵 2.500.000 đ/dự án              |             |
| | 📍 Quận 1, TP.HCM (Hybrid)        |  | 📍 Remote (Làm việc từ xa)        |             |
| | Đăng ngày: 23/10/2026             |  | Đăng ngày: 23/10/2026             |             |
| | [ XEM CHI TIẾT & ỨNG TUYỂN ]      |  | [ XEM CHI TIẾT & ỨNG TUYỂN ]      |             |
| +-----------------------------------+  +-----------------------------------+             |
| +-----------------------------------+                                                    |
| | [F&B] [Part-time]                 |                                                    |
| | Nhân viên Phục vụ ca tối          |                                                    |
| | 🏢 The Coffee Chill House         |                                                    |
| | 💵 30.000 đ/giờ | 📍 Bình Thạnh   |                                                    |
| | [ XEM CHI TIẾT & ỨNG TUYỂN ]      |                                                    |
| +-----------------------------------+                                                    |
+------------------------------------------------------------------------------------------+
```

- **Thành phần & Trường dữ liệu:**
  - Ô tìm kiếm: Textbox tìm kiếm toàn văn theo tiêu đề, mô tả.
  - Dropdown danh mục: Công nghệ thông tin, Thiết kế đồ họa, Dịch vụ & F&B, Giáo dục & Gia sư.
  - Dropdown địa điểm: Quận 1, Bình Thạnh, Gò Vấp, Remote.
  - Thẻ công việc (Job Card): `title`, `company_name`, `salary`, `salary_type`, `location`, `work_type`, `created_at`.
- **Hành vi thao tác (Buttons/Actions):**
  - Bấm "Tìm kiếm": Kích hoạt gọi API `GET /api/jobs` kèm bộ lọc.
  - Bấm "Xem chi tiết & Ứng tuyển": Mở màn hình/modal WF-02.
- **Xử lý Trạng thái:**
  - *Loading:* Hiển thị 6 thẻ khung xám (Skeleton) lấp lánh khi API đang xử lý.
  - *Empty:* "Không tìm thấy công việc phù hợp với tiêu chí lọc của bạn. Hãy thử thay đổi từ khóa hoặc khoảng lương!"
  - *Error:* Banner đỏ: "Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra lại dịch vụ."

---

### [WF-02] Màn hình Chi tiết Tin việc làm & Modal Nộp đơn
- **Use Case / FR liên quan:** UC-05, UC-06 | FR-02, FR-04
- **Actor sử dụng:** Sinh viên
- **Quyền truy cập:** Đăng nhập với vai trò `STUDENT` để nộp đơn
- **API sử dụng:** `GET /api/jobs/:id`, `POST /api/applications`

#### Sơ đồ Bố cục Giao diện (Wireframe Layout):
```
+------------------------------------------------------------------------------------------+
| < Quay lại danh sách việc làm                                                            |
|                                                                                          |
| TIÊU ĐỀ: Lập trình viên Frontend React.js Part-time              [ ỨNG TUYỂN NGAY ]      |
| Doanh nghiệp: TechCorp Vietnam | Đánh giá uy tín: ★★★★★ 5.0 (12 nhận xét)                |
| Mức lương: 45.000 VNĐ / giờ   | Hình thức: Part-time (20h/tuần) | Khu vực: Quận 1, TP.HCM |
|------------------------------------------------------------------------------------------|
| MÔ TẢ CÔNG VIỆC:                                                                         |
| - Hỗ trợ phát triển giao diện người dùng cho hệ thống nội bộ công ty.                    |
| - Phối hợp cùng đội ngũ Backend để kết nối RESTful API.                                 |
|                                                                                          |
| YÊU CẦU ỨNG VIÊN:                                                                        |
| - Sinh viên năm 3-4 chuyên ngành CNTT / Phần mềm Đại học Văn Lang.                      |
| - Biết cơ bản React.js, Tailwind CSS, có trách nhiệm trong công việc.                   |
+------------------------------------------------------------------------------------------+
|  MODAL: NỘP HỒ SƠ ỨNG TUYỂN (Khi bấm nút "Ứng tuyển ngay")                               |
|  +------------------------------------------------------------------------------------+  |
|  | Tiêu đề việc: Lập trình viên Frontend React.js Part-time                          |  |
|  | Người nộp: Nguyễn Văn Chí (nguyen.van.chi@vlu.edu.vn - ĐH Văn Lang)               |  |
|  |                                                                                    |  |
|  | Thư giới thiệu (Cover Letter) *:                                                   |  |
|  | [ Em là sinh viên Kỹ thuật phần mềm Văn Lang, có kinh nghiệm làm đồ án React... ] |  |
|  |                                                                                    |  |
|  | Hồ sơ năng lực (CV): [ Link CV / File: CV_Nguyen_Van_Chi.pdf ]                     |  |
|  |                                                                                    |  |
|  |                        [ HỦY BỎ ]     [ XÁC NHẬN NỘP HỒ SƠ ]                       |  |
|  +------------------------------------------------------------------------------------+  |
+------------------------------------------------------------------------------------------+
```

- **Quy tắc nghiệp vụ trên UI:**
  - Nếu người dùng chưa đăng nhập: Hiển thị thông báo "Vui lòng đăng nhập với tài khoản Sinh viên để nộp đơn".
  - Nếu là tài khoản Nhà tuyển dụng: Ẩn nút nộp đơn hoặc vô hiệu hóa kèm tooltip: "Nhà tuyển dụng không thể nộp đơn".
  - Nếu sinh viên đã từng nộp đơn vào tin này: Nút chuyển sang trạng thái xám disabled với chữ: "Bạn đã nộp đơn vào việc này".
- **Hành vi thao tác:**
  - Bấm "Xác nhận nộp hồ sơ": Gửi payload `{ job_id, cover_letter, cv_url }` đến `POST /api/applications`.
  - Thành công: Đóng modal, hiển thị Toast xanh: "Nộp hồ sơ ứng tuyển thành công!".
  - Trùng đơn: Báo lỗi 409 Conflict: "Bạn đã nộp đơn ứng tuyển cho công việc này rồi. Không thể nộp đơn trùng!".

---

### [WF-03] Kênh Sinh viên: Quản lý & Theo dõi Hồ sơ Ứng tuyển
- **Use Case / FR liên quan:** UC-06 | FR-04
- **Actor sử dụng:** Sinh viên (STUDENT)
- **Quyền truy cập:** Bắt buộc Bearer Token với `role = 'STUDENT'`
- **API sử dụng:** `GET /api/applications/my-applications`

#### Sơ đồ Bố cục Giao diện (Wireframe Layout):
```
+------------------------------------------------------------------------------------------+
| KÊNH SINH VIÊN: Lịch sử nộp hồ sơ ứng tuyển                           Sinh viên: Văn Chí |
+------------------------------------------------------------------------------------------+
| Bộ lọc trạng thái: [Tất cả] [Chờ duyệt] [Đã được nhận] [Bị từ chối]                      |
|                                                                                          |
| +--------------------------------------------------------------------------------------+ |
| | Công việc: Lập trình viên Frontend React.js Part-time                 [ ĐANG XÉT DUYỆT ] | |
| | 🏢 TechCorp Vietnam | 📍 Quận 1 | 💵 45.000 đ/giờ                     (Chờ NTD duyệt)| |
| | Ngày nộp: 23/10/2026 15:30 | Lời nhắn: "Em là sinh viên KTPM muốn học hỏi..."       | |
| +--------------------------------------------------------------------------------------+ |
|                                                                                          |
| +--------------------------------------------------------------------------------------+ |
| | Công việc: Trợ giảng Tin học văn phòng Part-time                      [ ĐÃ ĐƯỢC NHẬN ] | |
| | 🏢 Trung tâm Đào tạo Kỹ năng | 📍 Bình Thạnh | 💵 60.000 đ/giờ        (🎉 Chúc mừng!)| |
| | Ngày nộp: 20/10/2026 | Công việc đã hoàn thành: [ VIẾT ĐÁNH GIÁ ĐỐI TÁC ]             | |
| +--------------------------------------------------------------------------------------+ |
+------------------------------------------------------------------------------------------+
```

- **Thành phần & Trường dữ liệu:**
  - Bảng/danh sách thẻ ứng tuyển: `job_title`, `employer_name`, `location`, `salary`, `applied_at`, `status`.
  - Nhãn Badge trạng thái:
    - `PENDING`: Màu vàng cam ("Chờ nhà tuyển dụng duyệt").
    - `ACCEPTED`: Màu xanh lá ("Đã được nhận vào làm").
    - `REJECTED`: Màu đỏ ("Hồ sơ chưa phù hợp").
  - Nút "Viết đánh giá đối tác": Chỉ hiển thị khi trạng thái công việc là `COMPLETED` và đơn là `ACCEPTED` (Dẫn tới WF-05).
- **Xử lý Trạng thái:**
  - *Empty State:* Hình minh họa cặp hồ sơ rỗng + Thông báo: "Bạn chưa nộp đơn vào công việc nào. Khám phá các việc làm part-time hấp dẫn ngay!" kèm nút chuyển tab.

---

### [WF-06] Kênh Nhà tuyển dụng: Form Đăng tin Tuyển dụng mới
- **Use Case / FR liên quan:** UC-04 | FR-02
- **Actor sử dụng:** Nhà tuyển dụng (EMPLOYER)
- **Quyền truy cập:** Bắt buộc Bearer Token với `role = 'EMPLOYER'`
- **API sử dụng:** `POST /api/jobs`

#### Sơ đồ Bố cục Giao diện (Wireframe Layout):
```
+------------------------------------------------------------------------------------------+
| KÊNH NHÀ TUYỂN DỤNG > Đăng tin tuyển dụng mới                                            |
+------------------------------------------------------------------------------------------+
| FORM NHẬP LIỆU:                                                                          |
| 1. Tiêu đề công việc (*):                                                                |
|    [ Lập trình viên Frontend React.js Part-time....................................... ]  |
|                                                                                          |
| 2. Ngành nghề (*):                     3. Hình thức (*):                                 |
|    [ Công nghệ thông tin            v]   [ Part-time (Bán thời gian)                   v]  |
|                                                                                          |
| 4. Mức lương chi trả (*):              5. Cách tính lương (*):                           |
|    [ 45000                          ]   [ Theo giờ (Hourly)                           v]  |
|                                                                                          |
| 6. Địa điểm làm việc (*):                                                                |
|    [ Tòa nhà A, Quận 1, TP.HCM (Hỗ trợ Hybrid)........................................ ]  |
|                                                                                          |
| 7. Mô tả công việc chi tiết (*):                                                         |
|    +----------------------------------------------------------------------------------+  |
|    | Hỗ trợ phát triển giao diện người dùng cho hệ thống nội bộ công ty...            |  |
|    +----------------------------------------------------------------------------------+  |
|                                                                                          |
| 8. Yêu cầu ứng viên:                                                                     |
|    +----------------------------------------------------------------------------------+  |
|    | Biết cơ bản React.js, Tailwind CSS, có tinh thần trách nhiệm...                  |  |
|    +----------------------------------------------------------------------------------+  |
|                                                                                          |
|                      [ HỦY / NHẬP LẠI ]        [ XÁC NHẬN ĐĂNG TIN ]                     |
+------------------------------------------------------------------------------------------+
```

- **Quy tắc Validation trực tiếp trên Form:**
  - `title`: Bắt buộc, tối thiểu 5 ký tự.
  - `salary`: Bắt buộc, số dương $> 0$.
  - `description`: Bắt buộc, tối thiểu 10 ký tự.
  - Bấm "Xác nhận đăng tin": Gửi payload lên `POST /api/jobs`.
  - Phản hồi thành công: Reset form, chuyển sang danh sách tin đã đăng (WF-07), hiện Toast xanh.

---

### [WF-07] & [WF-08] Quản lý Tin đăng & Xét duyệt Ứng viên (Employer)
- **Use Case / FR liên quan:** UC-07, UC-08 | FR-05, FR-06
- **Actor sử dụng:** Nhà tuyển dụng (EMPLOYER)
- **API sử dụng:** `GET /api/jobs/my-jobs`, `GET /api/applications/job/:jobId`, `PATCH /api/applications/:id/status`, `PATCH /api/jobs/:id/status`

#### Sơ đồ Bố cục Giao diện (Wireframe Layout):
```
+------------------------------------------------------------------------------------------+
| KÊNH NHÀ TUYỂN DỤNG: Danh sách tin đã đăng                                              |
+------------------------------------------------------------------------------------------+
| TIN 1: Lập trình viên Frontend React.js Part-time              Trạng thái: [ĐANG TUYỂN]  |
| Lương: 45.000 đ/giờ | Địa điểm: Quận 1 | Đã nhận: 1 ứng viên                              |
| [ 👥 XEM HỒ SƠ ỨNG VIÊN (1) ]                     Hành động tin: [ Khóa nhận người (FILLED) ]
|------------------------------------------------------------------------------------------|
| SUB-PANEL: DANH SÁCH ỨNG VIÊN ĐÃ NỘP (Khi bấm "Xem hồ sơ ứng viên"):                     |
| +--------------------------------------------------------------------------------------+ |
| | Ứng viên: Nguyễn Văn Chí | Email: nguyen.van.chi@vlu.edu.vn | SĐT: 0912345678        | |
| | Trường: Đại học Văn Lang | Khoa: Công nghệ thông tin | Kỹ năng: React, Node.js, SQL  | |
| | Thư giới thiệu: "Em là sinh viên Kỹ thuật phần mềm Văn Lang, em đã từng làm đồ án..."| |
| | Link CV: [ Xem file CV_Nguyen_Van_Chi.pdf ]                                          | |
| |                                                                                      | |
| | Trạng thái hiện tại: [ ĐANG CHỜ XÉT DUYỆT ]                                           | |
| | Thao tác duyệt:        [ ✓ CHẤP THUẬN (ACCEPT) ]       [ ✕ TỪ CHỐI (REJECT) ]        | |
| +--------------------------------------------------------------------------------------+ |
+------------------------------------------------------------------------------------------+
```

- **Quy tắc chuyển đổi trạng thái nghiệp vụ (State Machine):**
  - **Trạng thái việc làm (Job Status):**
    - `OPEN` $\rightarrow$ bấm "Khóa nhận người" $\rightarrow$ chuyển thành `FILLED`.
    - `FILLED` $\rightarrow$ bấm "Hoàn thành việc" $\rightarrow$ chuyển thành `COMPLETED`.
    - `COMPLETED`: Không được phép hoàn tác về `OPEN` (Theo quy tắc kiểm thử đã PASS).
  - **Trạng thái ứng viên (Application Status):**
    - Bấm "Chấp thuận (ACCEPT)": Cập nhật đơn thành `ACCEPTED`, ứng viên nhận thông báo trúng tuyển.
    - Bấm "Từ chối (REJECT)": Cập nhật đơn thành `REJECTED`.

---

### [WF-10] & [WF-11] Bảng Quản trị Hệ thống & Kiểm duyệt (Admin)
- **Use Case / FR liên quan:** UC-10 (Quản trị hệ thống)
- **Actor sử dụng:** Quản trị viên (ADMIN)
- **Quyền truy cập:** Bắt buộc Bearer Token với `role = 'ADMIN'`
- **API sử dụng:** `GET /api/admin/stats`, `GET /api/admin/users`, `PATCH /api/admin/users/:id/status`, `PATCH /api/admin/jobs/:id/moderate`

#### Sơ đồ Bố cục Giao diện (Wireframe Layout):
```
+------------------------------------------------------------------------------------------+
| BẢNG QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN DASHBOARD)                          Vai trò: QUẢN TRỊ |
+------------------------------------------------------------------------------------------+
| CHỈ SỐ KPI TỔNG QUAN:                                                                    |
| [ 👥 Tổng tài khoản: 5 ]     [ 📋 Tổng việc làm: 3 ]     [ 📑 Đơn ứng tuyển: 1 ]         |
| 1 Admin, 2 NTD, 2 Sinh viên   3 Đang tuyển (Approved)     1 Đang chờ xét duyệt           |
|------------------------------------------------------------------------------------------|
| QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG:                                                            |
| Mã  | Họ và tên         | Email                       | Vai trò  | Trạng thái | Thao tác  |
| #1  | Hệ Thống Quản Trị | admin@marketplace.vlu.edu.vn| ADMIN    | [ACTIVE]   | (Khóa)    |
| #2  | TechCorp Vietnam  | techcorp@gmail.com          | EMPLOYER | [ACTIVE]   | [KHÓA TK] |
| #4  | Nguyễn Văn Chí    | nguyen.van.chi@vlu.edu.vn   | STUDENT  | [ACTIVE]   | [KHÓA TK] |
|------------------------------------------------------------------------------------------|
| KIỂM DUYỆT TIN ĐĂNG TUYỂN DỤNG:                                                          |
| Mã  | Tiêu đề tin                  | Doanh nghiệp đăng   | Kiểm duyệt | Thao tác         |
| #1  | Lập trình viên Frontend React| TechCorp Vietnam    | [APPROVED] | [GỠ TIN (REJECT)]|
+------------------------------------------------------------------------------------------+
```

---

## 4. Bảng Đối chiếu Ràng buộc giữa Wireframe và Mô hình Dữ liệu (ERD)

| Thành phần Wireframe | Trường dữ liệu tương ứng trong CSDL | Bảng CSDL | Ràng buộc kiểm tra |
|---|---|---|---|
| Ô tìm kiếm & Dropdown ngành nghề | `jobs.title`, `jobs.category`, `jobs.location` | `jobs` | Index tìm kiếm ILIKE / `=` |
| Thẻ mức lương | `jobs.salary`, `jobs.salary_type` | `jobs` | `salary > 0`, `salary_type IN (...)` |
| Form đăng tin | `title`, `description`, `requirements`, `salary` | `jobs` | NOT NULL, `title >= 5`, `desc >= 10` |
| Thư xin việc & CV | `applications.cover_letter`, `applications.cv_url` | `applications` | `UNIQUE(job_id, student_id)` |
| Badge trạng thái xét duyệt | `applications.status` | `applications` | `IN ('PENDING', 'ACCEPTED', 'REJECTED')` |
| Điểm đánh giá sao | `reviews.rating`, `reviews.comment` | `reviews` | `1 <= rating <= 5`, `UNIQUE(job, reviewer, reviewee)` |
| Bảng người dùng Admin | `users.full_name`, `users.role`, `users.status` | `users` | `role IN ('STUDENT', 'EMPLOYER', 'ADMIN')` |
