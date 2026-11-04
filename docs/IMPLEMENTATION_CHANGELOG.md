# NHẬT KÝ THAY ĐỔI TRIỂN KHAI (IMPLEMENTATION CHANGELOG) — JOBNEST

**Dự án:** JOBNEST — Nền tảng kết nối việc làm Part-time và Freelance cho Sinh viên  
**Học phần:** Chuyên Đề 2 — Đồ Án Tốt Nghiệp  
**Vị trí:** Senior Full-stack Developer & Release Manager  
**Ngày cập nhật:** 02/11/2026  
**Phiên bản hiện tại:** v2.1.0 (Master Release)  

---

## 1. PHIÊN BẢN v2.1.0 — TỐI ƯU HÓA DESIGN SYSTEM VÀ BẢN ĐỒ GOOGLE MAPS (02/11/2026)

### Frontend & UI/UX:
- **Cập nhật CSS Tokens (`client/src/index.css`):**
  - Đồng bộ bảng màu **Soft Lavender & Peach** (`#7565A8`, `#F4B99D`, `#F8F7FB`, `#29263A`, `#EAE7F0`) thay thế tông tím than cũ.
  - Tối ưu hóa độ tương phản cho người dùng sinh viên và tăng tính nhận diện thương hiệu.
- **Tích hợp Google Maps Embed (`client/src/components/JobLocationMap.jsx`):**
  - Chuyển Section "Vị trí làm việc" từ cuối trang chi tiết lên **Sidebar phải, đặt ngay bên dưới Thông tin doanh nghiệp** theo bố cục chuẩn của TopCV / LinkedIn.
  - Tích hợp chuẩn Google Maps Embed qua iframe responsive: đầy đủ nút Vệ tinh, thu phóng, bản quyền ©Google, ghim đỏ của Google Maps.
  - Định vị chính xác số nhà: *The Coffee Chill* tại **123 Đặng Thùy Trâm, Bình Thạnh** (Cơ sở 3 ĐH Văn Lang).
  - Tự động nhận diện công việc Remote để hiển thị Card chuyên biệt mà không tạo bản đồ hay marker giả.
  - Thêm nút CTA mở chỉ đường trực tiếp trên Google Maps.
- **Sửa triệt để lỗi Quick Preview không tự đóng khi cuộn trang:**
  - Bổ sung bộ đôi cờ `isCursorInsideRef` và `isSuppressedByScrollRef` trong `JobCard.jsx`.
  - Bắt sự kiện cuộn ở Capture Phase trên window, wheel, touch và nested container; đóng popup lập tức (0ms).
  - Khóa tự động mở lại sau khi cuộn nếu chuột vẫn đang nằm trên Card; chỉ mở lại khi người dùng rê chuột ra ngoài rồi vào lại.
  - Đóng ngay khi nhấn phím `Escape` hoặc chuyển trang.

### Database & Backend:
- **Migration `003_add_job_coordinates_and_address.sql`:**
  - Bổ sung các cột `work_address VARCHAR(255)`, `latitude NUMERIC(10, 7)`, `longitude NUMERIC(10, 7)` vào bảng `jobs` trong PostgreSQL 18.
  - Cập nhật tọa độ thực tế cho các tin mẫu (The Coffee Chill, Bitexco, Saigon Tower, Khu Công Nghệ Cao).
- **Backend API (`server/src/routes/job.routes.js` & `server/src/services/job.service.js`):**
  - Trả về đầy đủ tọa độ và địa chỉ chi tiết cho API `GET /api/jobs/:id`.

---

## 2. PHIÊN BẢN v2.0.0 — NÂNG CẤP GIAO DIỆN & TÙY BIẾN DROPDOWN (GIAI ĐOẠN 3)

### Frontend:
- **Component CustomDropdown (`client/src/components/CustomDropdown.jsx`):**
  - Thay thế toàn bộ thẻ select native thô sơ của trình duyệt bằng Custom Dropdown cao cấp, bo góc 10px, có thanh tìm kiếm nhanh và tick xanh khi chọn.
- **Trang Chi tiết công việc (`JobDetailPage.jsx`):**
  - Xây dựng 7 sections hoàn chỉnh: Hero Banner, Tổng quan (A), Mô tả (B), Yêu cầu (C), Quyền lợi (D), Lịch trình làm việc (E), Ứng tuyển (F), và Sidebar Thông tin doanh nghiệp.
- **Trang Coming Soon (`ComingSoonPage.jsx`):**
  - Thiết kế trang "Tính năng đang phát triển" đồng bộ thương hiệu với logo chính thức `Logo.jpg`, minh họa chuyên nghiệp và nút điều hướng an toàn.
- **Footer hoàn chỉnh (`Footer.jsx`):**
  - Đầy đủ thông tin bản quyền, liên kết chính sách, tải ứng dụng di động (App Store, Google Play badges).

---

## 3. PHIÊN BẢN v1.0.0 — KHỞI TẠO NỀN TẢNG KIẾN TRÚC 3 TẦNG (GIAI ĐOẠN 1 & 2)

- Thiết lập cấu trúc phân tầng Node.js + Express.js + PostgreSQL 18.
- Xây dựng 6 modules RESTful API: auth, jobs, applications, reviews, admin, profile.
- Thiết kế CSDL quan hệ chuẩn hóa 3NF: `users`, `employers`, `jobs`, `applications`, `reviews`, `reports`.
- Viết 10 test suites tự động kiểm tra quy tắc nghiệp vụ với `node:test`.
- Tích hợp xác thực bảo mật một chiều bcryptjs và stateless JWT.
