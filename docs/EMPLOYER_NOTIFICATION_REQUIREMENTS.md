# YÊU CẦU & THIẾT KẾ HỆ THỐNG THÔNG BÁO XUYÊN SUỐT (NOTIFICATION SYSTEM)
**Tài liệu:** `docs/EMPLOYER_NOTIFICATION_REQUIREMENTS.md`  
**Dự án:** JobNest — Nền tảng Việc làm Sinh viên  
**Tham chiếu Wireframe & Design:** WF-E12 Notifications, Header Notification Bell

---

## 1. MỤC TIÊU & TẦM NHÌN

Hệ thống Thông báo (Notification System) của JobNest là kênh thông tin sự kiện thời gian thực giúp kết nối 3 tác tử: **Sinh viên (Student)**, **Nhà tuyển dụng (Employer)** và **Quản trị viên (Admin)**.

Hệ thống giải quyết triệt để vấn đề thông báo giả, hardcode dữ liệu hoặc bỏ sót sự kiện nghiệp vụ quan trọng.

---

## 2. KIẾN TRÚC & MÔ HÌNH DỮ LIỆU (DATABASE SCHEMA)

Bảng cơ sở dữ liệu `notifications` trong PostgreSQL 18:

```sql
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'APPLICATION', 'PROPOSAL', 'JOB', 'ASSIGNMENT', 'DELIVERABLE', 'VERIFICATION', 'SYSTEM'
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    target_type VARCHAR(50), -- 'APPLICATION', 'PROPOSAL', 'JOB', 'ASSIGNMENT', 'DELIVERABLE'
    target_id INT,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, read_at);
```

---

## 3. CÁC SỰ KIỆN KÍCH HOẠT THÔNG BÁO THỰC TẾ (EVENT-DRIVEN TRIGGERS)

| Tác nhân gây sự kiện | Tên sự kiện | Người nhận | Tiêu đề thông báo mẫu | Module xử lý Backend |
|---|---|---|---|---|
| **Sinh viên** | Nộp đơn ứng tuyển Part-time/Seasonal | Nhà tuyển dụng | `Ứng viên mới nộp hồ sơ` | `application.service.js:37` |
| **Sinh viên** | Gửi đề xuất báo giá Freelance | Nhà tuyển dụng | `Đề xuất dự án Freelance mới` | `proposal.service.js:55` |
| **Sinh viên** | Bàn giao sản phẩm (Deliverable v1, v2) | Nhà tuyển dụng | `Sinh viên đã bàn giao sản phẩm v{version}` | `deliverable.service.js` |
| **Quản trị viên** | Phê duyệt tin tuyển dụng (`APPROVED`) | Nhà tuyển dụng | `Tin tuyển dụng đã được phê duyệt` | `admin.service.js:31` |
| **Quản trị viên** | Từ chối tin tuyển dụng (`REJECTED`) | Nhà tuyển dụng | `Tin tuyển dụng bị từ chối phê duyệt` | `admin.service.js:31` |
| **Nhà tuyển dụng** | Tuyển chọn ứng viên chính thức (Rule A3) | Sinh viên trúng tuyển | `Chúc mừng! Bạn đã được chọn vào công việc` | `selection.service.js:141` |
| **Nhà tuyển dụng** | Tự động từ chối ứng viên còn lại (Rule A3) | Các sinh viên khác | `Thông báo kết quả ứng tuyển` | `selection.service.js:239` |
| **Nhà tuyển dụng** | Chuyển trạng thái Application (`SHORTLISTED`) | Sinh viên | `Hồ sơ ứng tuyển được đưa vào danh sách rút gọn` | `application.service.js:101` |
| **Nhà tuyển dụng** | Chuyển trạng thái Proposal (`REVIEWING`) | Sinh viên | `Đề xuất của bạn đang được nhà tuyển dụng xem xét` | `proposal.service.js:160` |
| **Nhà tuyển dụng** | Khởi động công việc (`IN_PROGRESS`) | Sinh viên | `Công việc đã bắt đầu` | `assignment.service.js:152` |
| **Nhà tuyển dụng** | Nghiệm thu sản phẩm (`ACCEPTED`) | Sinh viên | `Sản phẩm bàn giao đã được nghiệm thu` | `assignment.service.js` |
| **Nhà tuyển dụng** | Yêu cầu sửa đổi sản phẩm (`REVISION_REQUESTED`) | Sinh viên | `Yêu cầu chỉnh sửa sản phẩm kèm lý do` | `assignment.service.js` |
| **Nhà tuyển dụng** | Hoàn thành hợp đồng (`COMPLETED`) | Sinh viên | `Công việc đã hoàn thành` | `assignment.service.js:152` |
| **Hệ thống** | Xác minh Email / Số điện thoại hoàn tất | Nhà tuyển dụng | `Tài khoản đã hoàn tất xác minh uy tín` | `profile.service.js` |

---

## 4. GIAO DIỆN PHÍA FRONTEND (CLIENT IMPLEMENTATION)

### 4.1. Notification Bell trong Top Header
- **Vị trí:** Nằm trên Header của cả Trường 1 (Workspace) và Trường 2 (Marketplace).
- **Badge số chưa đọc:** Lấy trực tiếp từ trường `unread_count` trả về từ `GET /api/notifications`. Tự động cập nhật mỗi 15 giây.
- **Dropdown thông báo nhanh (`NotificationsDropdown.jsx`):**
  - Hiển thị danh sách 20 thông báo mới nhất.
  - Nút *"Đánh dấu tất cả đã đọc"* (`PATCH /api/notifications/read-all`).
  - Nút *"Xem tất cả"* dẫn trực tiếp về WF-E12 (`setActiveTab('notifications')`).
  - Bấm vào từng thông báo tự động gọi `PATCH /api/notifications/:id/read` và điều hướng tới thực thể tương ứng.

### 4.2. Notification Center WF-E12 (`EmployerNotificationsPage.jsx`)
- **10 Bộ lọc chuyên nghiệp:**
  1. `Tất cả` (All)
  2. `Chưa đọc` (Unread kèm số lượng)
  3. `Đã đọc` (Read)
  4. `Ứng tuyển` (Application)
  5. `Đề xuất Freelance` (Proposal)
  6. `Tin đăng` (Job)
  7. `Hợp đồng` (Assignment)
  8. `Nghiệm thu` (Deliverable)
  9. `Xác thực` (Verification)
  10. `Hệ thống` (System)
- **Bảng danh sách chi tiết:** Hiển thị Tiêu đề, Nội dung, Thời gian tương đối (ví dụ: "5 phút trước", "Hôm qua"), Trạng thái (Chưa đọc viền xanh / Đã đọc), nút Xem chi tiết.
- **Điều hướng thông minh:**
  - Thông báo về Application → Chuyển sang tab `applicants`.
  - Thông báo về Proposal → Chuyển sang tab `proposals`.
  - Thông báo về Assignment / Deliverable → Chuyển sang tab `assignments`.
  - Thông báo về Job → Chuyển sang tab `jobs`.

---

## 5. API ENDPOINTS SPECIFICATION

| Phương thức | Đường dẫn API | Mục đích | Headers |
|---|---|---|---|
| `GET` | `/api/notifications` | Lấy danh sách thông báo phân trang & số lượng chưa đọc | `Authorization: Bearer <token>` |
| `PATCH` | `/api/notifications/read-all` | Đánh dấu tất cả thông báo của user là đã đọc | `Authorization: Bearer <token>` |
| `PATCH` | `/api/notifications/:id/read` | Đánh dấu 1 thông báo là đã đọc (kiểm tra sở hữu) | `Authorization: Bearer <token>` |

