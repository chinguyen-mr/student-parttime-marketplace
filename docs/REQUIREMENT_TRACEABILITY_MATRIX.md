# MA TRẬN TRUY VẾT YÊU CẦU TOÀN DIỆN (REQUIREMENT TRACEABILITY MATRIX) — JOBNEST

**Dự án:** JOBNEST — Nền tảng kết nối việc làm Part-time và Freelance cho Sinh viên  
**Học phần:** Chuyên Đề 2 — Đồ Án Tốt Nghiệp  
**Đơn vị:** Khoa Công nghệ Thông tin — Trường Đại học Văn Lang  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Trung  
**Ngày cập nhật:** 02/11/2026  
**Phiên bản:** 2.0.0 (Master Traceability)

---

## 1. MỤC TIÊU VÀ NGUYÊN TẮC TRUY VẾT

Ma trận truy vết yêu cầu (Requirement Traceability Matrix - RTM) thiết lập mối liên kết hai chiều từ:
**Yêu cầu SRS (FR & NFR) $\leftrightarrow$ Use Case Specification $\leftrightarrow$ Product Backlog (PBI) $\leftrightarrow$ Frontend Component/Page $\leftrightarrow$ Backend RESTful API $\leftrightarrow$ Bảng Cơ sở dữ liệu $\leftrightarrow$ Bộ kiểm thử tự động (Unit Test & E2E Test).**

Đảm bảo:
1. Không có yêu cầu nào trong SRS bị bỏ sót trên sản phẩm thực tế.
2. Không có chức năng nào trên giao diện được xây dựng mà không có căn cứ từ tài liệu phân tích thiết kế.
3. Đáp ứng 100% tiêu chí đánh giá học thuật của Giảng viên hướng dẫn.

---

## 2. BẢNG MA TRẬN TRUY VẾT YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

| Requirement ID | Use Case | Module | Frontend Component / Page | Backend API Endpoint | Database Table | Unit / E2E Test | Status |
|---|---|---|---|---|---|---|---|
| **FR-01.1** | **UC-01** | Xác thực & Phân quyền | `client/src/pages/LoginPage.jsx`, `AuthModal.jsx` | `POST /api/auth/register` | `users`, `employers` | `tests/auth.test.js` (UC-01) | **Hoàn thành (100%)** |
| **FR-01.2** | **UC-02** | Xác thực & Phân quyền | `client/src/pages/LoginPage.jsx`, `AuthModal.jsx` | `POST /api/auth/login`, `GET /api/auth/me` | `users` | `tests/auth.test.js` (UC-02) | **Hoàn thành (100%)** |
| **FR-01.3** | **UC-03** | Quản lý hồ sơ | `client/src/components/StudentProfileModal.jsx`, `EmployerProfileModal.jsx` | `GET /api/profile`, `PUT /api/profile` | `users`, `employers` | Playwright E2E Profile Test | **Hoàn thành (100%)** |
| **FR-02** | **UC-04** | Đăng tin việc làm | `client/src/App.jsx` (Tab `create_job`) | `POST /api/jobs` | `jobs` | `tests/job.test.js` (UC-04) | **Hoàn thành (100%)** |
| **FR-03.1** | **UC-05** | Tìm kiếm & Lọc việc làm | `client/src/App.jsx` (Tab `jobs`), `CustomDropdown.jsx` | `GET /api/jobs?keyword=&category=&location=&salary=` | `jobs`, `employers` | Playwright Search & Filter Test | **Hoàn thành (100%)** |
| **FR-03.2** | **UC-05** | Xem nhanh & Xem chi tiết | `JobCard.jsx`, `JobQuickPreview.jsx`, `JobDetailPage.jsx` | `GET /api/jobs/:id` | `jobs`, `employers` | `tests/job.test.js`, Playwright E2E | **Hoàn thành (100%)** |
| **FR-03.3** | **UC-05** | Bản đồ vị trí làm việc | `JobLocationMap.jsx` (Google Maps Embed) | `GET /api/jobs/:id` (`work_address`, `latitude`, `longitude`) | `jobs` (`work_address`, `latitude`, `longitude`) | Playwright Visual Map Test | **Hoàn thành (100%)** |
| **FR-04** | **UC-06** | Ứng tuyển việc làm | `JobDetailModal.jsx`, `JobDetailPage.jsx` | `POST /api/applications` | `applications` | `tests/application.test.js` (UC-06) | **Hoàn thành (100%)** |
| **FR-05.1** | **UC-07** | Theo dõi đơn ứng tuyển | `client/src/App.jsx` (Tab `student_apps`) | `GET /api/applications/my` | `applications`, `jobs` | Playwright My Applications Test | **Hoàn thành (100%)** |
| **FR-05.2** | **UC-07** | Sàng lọc & Duyệt ứng viên | `client/src/App.jsx` (Tab `applicants`) | `GET /api/applications/job/:jobId`, `PATCH /api/applications/:id/status` | `applications` | `tests/application.test.js` (UC-07) | **Hoàn thành (100%)** |
| **FR-06** | **UC-08** | Quản lý vòng đời việc làm | `client/src/App.jsx` (Tab `employer_jobs`) | `PATCH /api/jobs/:id/status`, `PUT /api/jobs/:id` | `jobs` | `tests/job.test.js` (UC-08) | **Hoàn thành (100%)** |
| **FR-07** | **UC-09** | Đánh giá hai chiều sau việc | `client/src/components/ReviewModal.jsx` | `POST /api/reviews`, `GET /api/reviews/job/:jobId` | `reviews`, `jobs` | `tests/review.test.js` (UC-09) | **Hoàn thành (100%)** |
| **FR-08.1** | **UC-10** | Quản trị tài khoản & Tin | `client/src/App.jsx` (Tab `admin`, subtab `users`, `moderation`) | `GET /api/admin/users`, `PATCH /api/admin/users/:id/status`, `PATCH /api/admin/jobs/:id/moderation` | `users`, `jobs` | Playwright Admin Test | **Hoàn thành (100%)** |
| **FR-08.2** | **UC-10** | Trung tâm thông báo | `client/src/components/NotificationsDropdown.jsx` | Socket / Client Notification State | `applications` | Playwright Notification Test | **Hoàn thành (100%)** |

---

## 3. BẢNG MA TRẬN TRUY VẾT YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

| Requirement ID | Tiêu chí kỹ thuật | Định lượng yêu cầu | Thành phần kiểm soát mã nguồn | Kết quả đo lường thực tế | Trạng thái |
|---|---|---|---|---|---|
| **NFR-01** | **Hiệu năng (Performance)** | Thời gian phản hồi API $\le$ **1.5 giây**; Thời gian build frontend $\le$ **2 giây** | Connection pooling `pg`, Vite 8.3.5, debounce scroll | - API Response: 15ms - 45ms<br>- Vite Build: **525ms** | **ĐẠT (Vượt chỉ tiêu)** |
| **NFR-02** | **Bảo mật (Security)** | - Mật khẩu băm `bcrypt` (10 rounds)<br>- 100% API bảo vệ bằng Bearer JWT<br>- Parameterized SQL Queries ($1, $2) chống SQL Injection | `auth.middleware.js`, `user.repository.js`, `job.repository.js` | 100% truy vấn an toàn; Mật khẩu băm an toàn | **ĐẠT** |
| **NFR-03** | **Tính toàn vẹn (Integrity)** | Ràng buộc duy nhất: Một sinh viên không nộp đơn trùng lặp 2 lần vào 1 tin | `server/migrations/001_initial_schema.sql` (`UNIQUE(job_id, student_id)`) | Unit Test UC-06 ngăn chặn nộp trùng lặp 100% | **ĐẠT** |
| **NFR-04** | **Tương thích (Usability)** | Giao diện chuẩn Web Responsive từ 320px đến 1920px, không vỡ layout, không tràn ngang | `index.css`, Tailwind CSS, CSS Grid/Flexbox | Kiểm thử Playwright trên 1440x900 và 375x812 không lỗi layout | **ĐẠT** |

---

## 4. KẾT LUẬN TRUY VẾT

100% các yêu cầu chức năng (FR-01 đến FR-08) và phi chức năng (NFR-01 đến NFR-04) đã được ánh xạ chính xác và đầy đủ từ tài liệu SRS đến các component frontend, endpoint backend và bảng cơ sở dữ liệu PostgreSQL 18.
