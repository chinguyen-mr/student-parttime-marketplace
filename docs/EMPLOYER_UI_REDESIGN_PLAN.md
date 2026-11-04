# KẾ HOẠCH TÁI THIẾT KẾ UI/UX EMPLOYER (EMPLOYER UI/UX REDESIGN PLAN)
**Dự án:** JOBNEST  
**Ngày lập:** 04/11/2026  

---

## 1. MỤC TIÊU VÀ NGUYÊN TẮC THIẾT KẾ
1. **Bám sát 100% Wireframe draw.io (Trang EMPLOYER 12):** Không tự tạo nghiệp vụ, không thêm trường dữ liệu không có trong thiết kế hoặc Backend.
2. **Tách biệt 2 Không gian (Trường):**
   - **Trường 1 (Workspace - `/employer/*`):** Không gian làm việc nội bộ, header tối giản, **ẨN HOÀN TOÀN FOOTER**, Sidebar 8 nút hình chữ nhật viền rõ ràng.
   - **Trường 2 (Marketplace - `/`, `/jobs`):** Nghiên cứu thị trường công khai, có đầy đủ Footer, có nút nổi bật `"← Về trang Quản lý"` trên Header.
3. **Cấu trúc Component Module hóa cho từng Màn hình:**
   - `EmployerDashboardPage.jsx` (WF-E01)
   - `EmployerPersonalProfilePage.jsx` (WF-E02)
   - `EmployerVerificationCenterPage.jsx` (WF-E03)
   - `EmployerJobsPage.jsx` (WF-E04)
   - `EmployerCreateJobPage.jsx` (WF-E05)
   - `EmployerApplicantsPage.jsx` (WF-E06)
   - `EmployerProposalsPage.jsx` (WF-E07)
   - `EmployerCandidateSelectionPage.jsx` (WF-E08)
   - `EmployerAssignmentsPage.jsx` (WF-E09)
   - `EmployerDeliverableReviewPage.jsx` (WF-E10)
   - `EmployerReviewStudentPage.jsx` (WF-E11)
   - `EmployerNotificationsPage.jsx` (WF-E12)

---

## 2. CHI TIẾT THIẾT KẾ TỪNG MÀN HÌNH

### 2.1. WF-E02 — Personal Profile
- **Bố cục 2 cột chuẩn Wireframe:**
  - **Cột trái - Khối "Hồ sơ":**
    - Avatar upload / xem trước.
    - `Tên hiển thị` (input text, cho phép sửa).
    - `Bio` (textarea giới thiệu ngắn cá nhân, cho phép sửa).
    - `Địa điểm` (input text khu vực làm việc, cho phép sửa).
    - `Email (chỉ đọc)` (disabled input có icon khóa, hiển thị email tài khoản).
    - `Số điện thoại (chỉ đọc)` (disabled input có icon khóa, hiển thị SĐT tài khoản).
    - Nút `Lưu thay đổi` (gọi `PUT /api/profile/me`).
  - **Cột phải - Khối "Xác minh":**
    - `• Email: Đã xác minh` (Badge xanh hoặc vàng).
    - `• Điện thoại: Chưa xác minh` (Badge xanh hoặc vàng).
    - Nút/Link: `Mở Verification Center` -> Chuyển trực tiếp sang tab `WF-E03`.
- **Ghi chú nghiệp vụ:** Không hiển thị Company Profile (tên công ty, MST, website, giấy phép kinh doanh) theo đúng Wireframe note: *`Backend chặn đổi email/phone. Không có Company Profile.`*

### 2.2. WF-E03 — Verification Center (Màn hình độc lập)
- **Khối 1 - Xác minh Email:**
  - Trạng thái `[Đã xác minh]` hoặc `[Chưa xác minh]`.
  - Email (readonly).
  - Ô nhập Mã OTP 6 số.
  - Bộ đếm thời hạn OTP (Countdown timer 60s).
  - Nút `Gửi OTP` & nút `Xác nhận`.
- **Khối 2 - Xác minh Số điện thoại:**
  - Trạng thái `[Đã xác minh]` hoặc `[Chờ xác minh]`.
  - Số điện thoại.
  - Ô nhập Mã OTP 6 số.
  - Nút `Gửi OTP` & nút `Xác nhận`.
- **Khối 3 - Điều kiện:**
  - Khung thông báo: *`• Phải xác minh cả Email và Phone trước khi đăng Job.`*

### 2.3. WF-E04 — Job List
- **7 Bộ lọc trạng thái:** `All`, `Draft`, `Pending`, `Published`, `Closed`, `Expired`, `Rejected`.
- **Bảng danh sách:**
  - Cột: `Tiêu đề | Loại | SL tuyển | Trạng thái | Số Application | moderation_reason`.
  - Nếu trạng thái là `REJECTED`, hiển thị tooltip/dòng lý do từ chối từ admin.
- **Hành động theo trạng thái:**
  - `Draft`: Sửa, Gửi duyệt, Xóa.
  - `Published`: Xem, Đóng tin.
  - `Closed`: Mở lại tin.
  - `Rejected`: Sửa lại, Gửi duyệt lại.

### 2.4. WF-E05 — Create / Edit Job (Form động 3 biến thể)
- **Thanh chọn loại Job:** `Part-time` | `Seasonal` | `Freelance`.
- **Trường nhập liệu động:**
  - **Part-time:** Tiêu đề, Mô tả, Địa điểm, Lương theo giờ/ca/ngày, Lịch làm việc ca *, Ngày bắt đầu/kết thúc, Số lượng tuyển.
  - **Seasonal:** Tiêu đề, Mô tả, Địa điểm, Lương giờ/ngày/toàn kỳ, Lịch làm việc *, Ngày bắt đầu *, Ngày kết thúc *, Số lượng tuyển.
  - **Freelance:** Tiêu đề, Mô tả, Địa điểm (On-site/Remote/Hybrid), Ngân sách dự án, Lịch làm việc tùy chọn, Deadline *, Deliverable requirements *, Revision policy, Số lượng tuyển.
- **Thao tác:** `Lưu nháp`, `Xem trước`, `Gửi duyệt`, `Hủy`.
- **Guard:** Kiểm tra tài khoản đã hoàn thành xác minh Email + Phone chưa; nếu chưa, cảnh báo và điều hướng sang `WF-E03`.

### 2.5. WF-E06 & WF-E07 — Applicant & Proposal Management
- **Không có nút Accept tại chỗ:**
  - WF-E06: Cho phép đổi trạng thái `REVIEWING`, `SHORTLISTED`, `REJECTED`, xem CV PDF. Nút *"Tuyển chọn ứng viên"* điều hướng sang `WF-E08`.
  - WF-E07: Cho phép đổi trạng thái `REVIEWING`, `REJECTED`, xem đề xuất giá & thời gian. Nút *"Tuyển chọn ứng viên"* điều hướng sang `WF-E08`.

### 2.6. WF-E08 — Candidate Selection (Trung tâm tuyển chọn A3)
- **Thông tin Job & Chỉ tiêu:**
  - Tên công việc & Loại.
  - `quantity_required: N`
  - `Đã chọn: M`
  - `Còn lại: N - M`
- **Bảng ứng viên đủ điều kiện:**
  - Checkbox chọn (giới hạn không vượt quá chỉ tiêu còn lại).
  - Student Name, Nguồn (Application / Proposal), Trạng thái hiện tại.
- **Xác nhận:**
  - Khung lưu ý: *`• Mỗi Student được chọn → 1 Work Assignment riêng.`*
  - Nút `Xác nhận tuyển` (Gọi API `POST /api/jobs/:jobId/selections`) và nút `Hủy`.

### 2.7. WF-E09, WF-E10, WF-E11 — Assignments, Deliverables & Reviews
- **WF-E09:** Bảng tiến độ theo từng sinh viên (`Student | Job | Trạng thái | Tiến độ %`). Nút xem nghiệm thu dẫn sang `WF-E10`.
- **WF-E10:** Xem phiên bản bàn giao (v1, v2). Quyết định: `Accept` hoặc `Request Revision` (kèm ô nhập lý do bắt buộc). Trạng thái Assignment vẫn giữ `IN_PROGRESS`.
- **WF-E11:** Bảng danh sách công việc `COMPLETED` chưa đánh giá. Form 5 sao tương tác và ô nhận xét. Gọi API `POST /api/reviews`.

### 2.8. WF-E12 — Notifications
- Danh sách thông báo chia theo trạng thái Đã đọc / Chưa đọc.
- Bấm vào thông báo điều hướng chính xác về màn hình tương ứng.

