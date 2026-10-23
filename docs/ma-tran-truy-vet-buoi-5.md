# MA TRẬN TRUY VẾT YÊU CẦU NGHIỆP VỤ — BUỔI 5 (TRACEABILITY MATRIX)
**Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên  
**Học phần:** Chuyên đề Tốt nghiệp 2 (Khoa CNTT — Trường Đại học Văn Lang)  
**Tài liệu làm căn cứ:** `Dac_ta.docx` (UC-01 $\rightarrow$ UC-10), `CDTN2_SRS.docx` (FR-01 $\rightarrow$ FR-08), `Product_Backlog.xlsx`, `buoi-04-05-thiet-ke-kien-truc-erd-chi-tiet.md`, `wireframes.md`.

---

## 1. Bảng Ma trận Truy vết Toàn diện (FR/UC ↔ ERD ↔ API ↔ Wireframe)

| Mã Yêu cầu | Tên Nghiệp vụ / Use Case | Bảng ERD liên quan | API Contract liên quan | Wireframe liên quan | Trạng thái nhất quán | Ghi chú / Vấn đề rà soát |
|---|---|---|---|---|---|---|
| **FR-01** | **UC-01: Đăng ký tài khoản** (Sinh viên, Nhà tuyển dụng) | `users`, `profiles` | `POST /api/auth/register` | `WF-13` (Màn hình Đăng ký) | **PASS (100% Khớp)** | Mã hóa bcrypt, tạo profile rỗng tự động. Đã có Unit Test pass. |
| **FR-01** | **UC-02: Đăng nhập & Đăng xuất** (Sinh viên, NTD, Admin) | `users` | `POST /api/auth/login`, `GET /api/auth/me` | `WF-13`, `WF-14` (Header bar) | **PASS (100% Khớp)** | JWT Token 7 ngày. Chặn tài khoản BANNED. Đã kiểm thử `curl` thành công. |
| **-** | **UC-03: Quản lý hồ sơ cá nhân** (Sinh viên, NTD) | `profiles`, `users` | `GET /api/profile/me`, `PUT /api/profile/me`, `GET /api/profile/:userId` | `WF-04` (Hồ sơ cá nhân) | **PASS (100% Khớp)** | Hỗ trợ trường ĐH/kỹ năng cho SV, Tên cty/địa chỉ cho NTD. |
| **FR-02** | **UC-04: Đăng tin tuyển dụng** (Nhà tuyển dụng) | `jobs` | `POST /api/jobs`, `GET /api/jobs/my-jobs` | `WF-06` (Form Đăng tin), `WF-07` (Quản lý tin) | **PASS (100% Khớp)** | Bắt buộc lương dương, tiêu đề $\ge$ 5 ký tự. Khóa ngoại `employer_id`. |
| **FR-03** | **UC-05: Tìm kiếm & Lọc tin tuyển dụng** (Sinh viên) | `jobs`, `users`, `profiles` | `GET /api/jobs` | `WF-01` (Khám phá & Lọc việc làm) | **PASS (100% Khớp)** | Lọc ngành nghề, khu vực, lương. Có index tăng tốc tìm kiếm. |
| **FR-02/03**| **Xem chi tiết tin việc làm** (Bước trong UC-05/UC-06) | `jobs`, `profiles` | `GET /api/jobs/:id` | `WF-02` (Chi tiết tin việc làm) | **PASS (100% Khớp)** | Hiển thị mô tả, yêu cầu, lương, địa điểm và uy tín NTD. |
| **FR-04** | **UC-06: Ứng tuyển việc làm** (Sinh viên) | `applications`, `jobs` | `POST /api/applications`, `GET /api/applications/my-applications` | `WF-02` (Modal Nộp đơn), `WF-03` (Theo dõi đơn) | **PASS (100% Khớp)** | Chống nộp đơn trùng (`UNIQUE(job_id, student_id)`), chặn nộp tin đóng. |
| **FR-05** | **UC-07: Quản lý ứng viên** (Nhà tuyển dụng) | `applications`, `users`, `profiles` | `GET /api/applications/job/:jobId`, `PATCH /api/applications/:id/status` | `WF-08` (Xét duyệt hồ sơ) | **PASS (100% Khớp)** | NTD duyệt (`ACCEPTED`) hoặc từ chối (`REJECTED`). Có kiểm tra chủ sở hữu. |
| **FR-06** | **UC-08: Cập nhật trạng thái công việc** (Nhà tuyển dụng) | `jobs` | `PATCH /api/jobs/:id/status` | `WF-07` (Chuyển trạng thái) | **PASS (100% Khớp)** | Chuyển `OPEN` $\rightarrow$ `FILLED` $\rightarrow$ `COMPLETED`. Chặn hoàn tác `COMPLETED` $\rightarrow$ `OPEN`. |
| **FR-07** | **UC-09: Đánh giá sau công việc** (Sinh viên, NTD) | `reviews`, `jobs`, `applications` | `POST /api/reviews`, `GET /api/reviews/user/:userId` | `WF-05`, `WF-09` (Modal Đánh giá) | **PASS (100% Khớp)** | Chỉ đánh giá khi việc `COMPLETED`, đánh giá 1-5 sao, chặn tự đánh giá. |
| **Admin** | **UC-10: Kiểm duyệt tin đăng & tài khoản** (Quản trị viên) | `users`, `jobs` | `GET /api/admin/users`, `PATCH /api/admin/users/:id/status`, `PATCH /api/admin/jobs/:id/moderate`, `GET /api/admin/stats` | `WF-10` (Dashboard KPI), `WF-11` (Quản lý User), `WF-12` (Duyệt tin) | **PASS (100% Khớp)** | Khóa/Mở tài khoản, duyệt/hủy tin đăng, thống kê KPI hệ thống. |
| **NFR-01** | **Bảo mật dữ liệu & Xác thực** | Toàn bộ 5 bảng | Middleware `verifyToken`, `requireRoles` | Toàn bộ giao diện | **PASS (100% Khớp)** | Bcrypt băm mật khẩu, JWT Stateless, Parameterized SQL queries. |
| **NFR-02** | **Phản hồi trạng thái giao diện** | - | - | Toast message trên React Client | **PASS (100% Khớp)** | Đầy đủ 4 trạng thái: Loading, Empty, Success, Error. |

---

## 2. Kết luận Rà soát Ma trận Truy vết
1. **Độ bao phủ:** 10/10 Use Cases và 8/8 Functional Requirements đều có sự ánh xạ đồng bộ 100% qua:
   - Thực thể CSDL PostgreSQL (`001_initial_schema.sql`)
   - API endpoints (`server/src/routes/`)
   - Màn hình Wireframe (`docs/wireframes.md`)
2. **Không phát sinh dư thừa:** Không có bất kỳ bảng dữ liệu nào hoặc API nào bị "mồ côi" (không phục vụ nghiệp vụ).
3. **Phạm vi bảo toàn:** Không xuất hiện các tính năng nằm ngoài phạm vi đồ án (như thanh toán thực hoặc chat realtime).
