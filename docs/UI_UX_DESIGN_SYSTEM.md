# TÀI LIỆU HỆ THỐNG THIẾT KẾ (UI/UX DESIGN SYSTEM) — JOBNEST

**Dự án:** JOBNEST — Nền tảng kết nối việc làm Part-time và Freelance cho Sinh viên  
**Học phần:** Chuyên Đề 2 — Đồ Án Tốt Nghiệp  
**Vị trí:** Senior UI/UX Designer & Product Designer  
**Ngày ban hành:** 02/11/2026  
**Phiên bản:** 2.0.0 (Soft Lavender & Peach Edition)  

---

## 1. TRIẾT LÝ THIẾT KẾ (DESIGN PHILOSOPHY)

JobNest theo đuổi phong cách **Modern Professional Job Marketplace**:
- **Hiện đại & Tinh tế:** Giao diện thoáng đãng, phân cấp thông tin rõ ràng, giảm tải nhận thức cho sinh viên đang tìm việc giữa giờ học.
- **Thân thiện với sinh viên, Đáng tin cậy với nhà tuyển dụng:** Sử dụng bảng màu nhẹ nhàng **Soft Lavender & Peach** kết hợp nền kem nhạt `#F8F7FB` thay vì tông màu tím than nặng nề.
- **Tính thương mại cao:** Thẻ công việc thể hiện logo doanh nghiệp thực tế, thẻ xác thực doanh nghiệp xanh ngọc `#269A73`, bản đồ Google Maps định vị số nhà chính xác.
- **Không Generic / Không Slop:** Không sử dụng gradient lòe loẹt hoặc các mẫu template AI sơ sài. Mọi thành phần đều có border tinh tế `1px solid #EAE7F0` và bo góc mềm mại `12px - 14px`.

---

## 2. HỆ THỐNG MÀU SẮC CHUẨN HÓA (COLOR TOKENS)

| Token Name | Hex Code | Tên màu | Vai trò ứng dụng trong hệ thống |
|---|---|---|---|
| `--color-primary` | **#7565A8** | Soft Lavender Primary | Màu nhận diện thương hiệu chính, nút CTA chính, tiêu đề quan trọng, link điều hướng active |
| `--color-primary-hover` | **#635394** | Deep Lavender Hover | Trạng thái hover cho các nút Primary |
| `--color-primary-light` | **#EEEAF7** | Lavender Pastel Tint | Nền badge, nền icon nổi bật, hiệu ứng hover nhẹ của list item |
| `--color-secondary` | **#F4B99D** | Warm Peach Accent | Màu cam đào điểm xuyết, tag nổi bật, thẻ highlight, ngôi sao đánh giá |
| `--color-secondary-hover` | **#E8A484** | Deep Peach Hover | Hover cho các nút accent cam đào |
| `--color-background` | **#F8F7FB** | Soft Cream Canvas | Nền toàn trang, tạo cảm giác dịu mắt và sạch sẽ |
| `--color-surface` | **#FFFFFF** | Pure White Surface | Nền các thẻ Card, Modal, Dropdown menu, Sidebar |
| `--color-border` | **#EAE7F0** | Soft Lavender Border | Đường viền ngăn cách card, input, table, header |
| `--color-text-primary` | **#29263A** | Dark Eggplant Text | Tiêu đề chính, tên công việc, tên doanh nghiệp (độ tương phản cao > 7:1) |
| `--color-text-secondary` | **#777486** | Muted Slate Purple | Mô tả phụ, nhãn thông số, thời gian, số lượng ứng viên |
| `--color-success` | **#269A73** | Emerald Mint | Nhãn "Doanh nghiệp xác thực", badge "Đã nhận việc / ACCEPTED", "Địa chỉ xác thực" |
| `--color-warning` | **#E5A34C** | Warm Amber | Nhãn "Đang chờ duyệt / PENDING", badge "Vị trí ước lượng" |
| `--color-danger` | **#D95F68** | Soft Crimson | Nhãn "Từ chối / REJECTED", thông báo lỗi form validation |

---

## 3. LOGO BẮT BUỘC (MANDATORY BRAND ASSET)

**Quy định tối cao theo Đề tài:**
- **Nguồn logo gốc:** `D:\Tai Lieu\DuLieuHoc\Đồ Án Tốt Nghiệp\Chuyên Đề 2\Tài Liệu\Logo.jpg` (dung lượng 140,720 bytes).
- **Quy tắc hiển thị:**
  - Tuyệt đối không tạo logo mới hoặc vẽ lại biểu tượng.
  - Được nhúng trực tiếp qua file tĩnh `/logo.jpg` hoặc import asset.
  - Tỷ lệ khung hình: Vuông hoặc tròn với `border-radius: 10px - 50%`, viền mờ `1px solid rgba(89,70,117,0.12)`.
  - Vị trí áp dụng đồng bộ: Header điều hướng chính, Footer chân trang, Màn hình đăng nhập/đăng ký (`LoginPage.jsx`), Modal xác thực (`AuthModal.jsx`), và Trang `ComingSoonPage.jsx`.

---

## 4. TYPOGRAPHY & PHÂN CẤP CHỮ

- **Font Family:** `'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif`
- **Thang kích thước chuẩn (Type Scale):**
  - **H1 (Hero Heading):** 28px - 34px, Bold (800), line-height: 1.25
  - **H2 (Section Heading):** 20px - 24px, Bold (800), line-height: 1.3
  - **H3 (Card Title / Subheading):** 16px - 18px, Bold (700), line-height: 1.35
  - **H4 (Group Title / Label):** 14px - 15px, Semi-bold (600), text-transform uppercase
  - **Body Text:** 13.5px - 14px, Regular (400) hoặc Medium (500), line-height: 1.6
  - **Caption / Meta / Badge:** 11px - 12.5px, Medium (500) hoặc Semi-bold (600)

---

## 5. THANG KHOẢNG CÁCH & ĐỔ BÓNG (SPACING & ELEVATION)

- **Spacing Scale:** 4px (xs), 8px (sm), 12px (md), 16px (base), 20px (lg), 24px (xl), 32px (2xl), 48px (3xl).
- **Border Radius:**
  - Tag / Badge / Button nhỏ: `6px - 8px`
  - Input / Select: `8px - 10px`
  - Card / Section: `12px - 14px`
  - Modal / Large Container: `16px - 20px`
  - Pill Tag / User Avatar: `9999px` (Full circle)
- **Shadow Scale:**
  - `shadow-sm`: `0 1px 3px rgba(41, 38, 58, 0.04)` (Thẻ card mặc định)
  - `shadow-md`: `0 4px 12px -2px rgba(117, 101, 168, 0.08)` (Card hover, Dropdown mở)
  - `shadow-lg`: `0 16px 36px -4px rgba(41, 38, 58, 0.14)` (Modal, Quick Preview popover)

---

## 6. HỆ THỐNG THÀNH PHẦN GIAO DIỆN CỐT LÕI (CORE COMPONENTS)

1. **Button Component (`Button.jsx`):**
   - `variant="primary"`: Nền `#7565A8`, chữ trắng, hover `#635394`.
   - `variant="secondary"`: Nền trắng, viền `#EAE7F0`, chữ `#29263A`, hover nền `#EEEAF7`.
   - `variant="accent"`: Nền `#F4B99D`, chữ `#29263A`, hover `#E8A484`.
2. **JobCard Component (`JobCard.jsx`):**
   - Hiển thị Logo công ty thực tế (Clearbit API fallback), mức lương tím nổi bật, địa chỉ kèm icon pin, nhãn ca làm việc, nút lưu yêu thích tim đỏ.
   - Cơ chế Hover Quick Preview với Scroll Suppression thông minh (tự đóng ngay khi cuộn, không tự mở lại).
3. **CustomDropdown Component (`CustomDropdown.jsx`):**
   - Thay thế toàn bộ thẻ select native của trình duyệt. Tùy biến popup bo góc 10px, ô tìm kiếm danh mục nhanh, hiệu ứng tick xanh khi chọn.
4. **JobLocationMap Component (`JobLocationMap.jsx`):**
   - Tích hợp chuẩn Google Maps Embed responsive. Đặt tại Sidebar phải ngay bên dưới Thông tin doanh nghiệp. Tự động nhận diện tin Remote để hiển thị banner online không có marker giả.

---

## 7. ÁNH XẠ 14 MÀN HÌNH WIREFRAME THỰC TẾ

| Wireframe Screen | Tên màn hình | Tác nhân chính (Actor) | Component / View trong mã nguồn |
|---|---|---|---|
| **Màn 1** | Đăng ký tài khoản Sinh viên / NTD | Sinh viên, NTD | `LoginPage.jsx` (mode: register), `AuthModal.jsx` |
| **Màn 2** | Đăng nhập hệ thống | Tất cả | `LoginPage.jsx` (mode: login), `AuthModal.jsx` |
| **Màn 3** | Quên mật khẩu & Khôi phục | Tất cả | `ForgotPasswordModal.jsx` |
| **Màn 4** | Trung tâm thông báo ứng tuyển | Sinh viên | `NotificationsDropdown.jsx` |
| **Màn 5** | Admin Dashboard & Kiểm duyệt | Quản trị viên | `App.jsx` (Tab `admin`: Quản lý user & Duyệt tin) |
| **Màn 6** | Danh sách việc làm Part-time / Freelance | Sinh viên, Khách | `App.jsx` (Tab `jobs`, bộ lọc, tìm kiếm, Quick Preview) |
| **Màn 7** | Chi tiết công việc & Bản đồ Google Maps | Sinh viên, Khách | `JobDetailPage.jsx`, `JobLocationMap.jsx` |
| **Màn 8** | Quản lý lịch sử nộp hồ sơ của Sinh viên | Sinh viên | `App.jsx` (Tab `student_apps`, lọc trạng thái) |
| **Màn 9** | Hồ sơ năng lực Sinh viên (Profile) | Sinh viên | `StudentProfileModal.jsx` (học vấn, kỹ năng, CV) |
| **Màn 10** | Quản lý tin tuyển dụng đã đăng của NTD | Nhà tuyển dụng | `App.jsx` (Tab `employer_jobs`, trạng thái OPEN/CLOSED) |
| **Màn 11** | Biểu mẫu đăng tin việc làm mới | Nhà tuyển dụng | `App.jsx` (Tab `create_job`) |
| **Màn 12** | Quản lý & Sàng lọc ứng viên nộp hồ sơ | Nhà tuyển dụng | `App.jsx` (Tab `applicants`, duyệt/từ chối đơn) |
| **Màn 13** | Đánh giá hai chiều sau công việc | Sinh viên, NTD | `ReviewModal.jsx` (chấm sao 1-5, nhận xét) |
| **Màn 14** | Hồ sơ doanh nghiệp / Nhà tuyển dụng | NTD, Sinh viên | `EmployerProfileModal.jsx` (MST, website, địa chỉ) |
