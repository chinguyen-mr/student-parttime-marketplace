# BÁO CÁO TRIỂN KHAI: TÍCH HỢP BẢN ĐỒ VỊ TRÍ LÀM VIỆC VÀO TRANG CHI TIẾT CÔNG VIỆC JOBNEST

**Dự án:** JobNest — Nền tảng Việc làm Part-time & Freelance cho Sinh viên  
**Học phần:** Chuyên Đề 2 — Đồ Án Tốt Nghiệp  
**Vị trí thực hiện:** Senior Full-stack Developer & UI/UX Designer  
**Thời gian hoàn thành:** 02/11/2026  
**Trạng thái:** HOÀN TẤT 100% — ĐỒNG BỘ GOOGLE MAPS THEO YÊU CẦU UI/UX  

---

## 1. TỔNG QUAN YÊU CẦU & BỐ CỤC MỚI

1. **Vị trí hiển thị:**
   - Section **"Vị trí làm việc"** đã được tinh chỉnh đưa lên cột **Sidebar phải**, nằm ngay **phía dưới Card "Thông tin doanh nghiệp"** và phía trên mục "Kỹ năng & Từ khóa liên quan".
   - Đây là vị trí chuẩn UX của các nền tảng tuyển dụng lớn (LinkedIn, TopCV, VietnamWorks), giúp ứng viên xem ngay địa chỉ và vị trí bản đồ khi tham khảo thông tin doanh nghiệp.
   - Nút liên kết **"Xem bản đồ ↓"** tại Section E (Địa điểm & thời gian làm việc) hỗ trợ cuộn mượt (`smooth scrollIntoView`) trực tiếp đến Card bản đồ ở sidebar.

2. **Công nghệ & Giao diện chuẩn Google Maps:**
   - **Google Maps Embed:** Hiển thị trực tiếp giao diện bản đồ Google chuẩn quốc tế (đầy đủ watermark ©Google, nút vệ tinh Satellite, nút phóng to thu nhỏ, tên đường phố tiếng Việt sắc nét và marker đỏ của Google Maps).
   - **Địa chỉ động theo từng tin tuyển dụng:** Lấy trực tiếp từ `work_address`, `company_address` hoặc `location` của từng tin (không dùng tọa độ cứng).
   - **Tích hợp tọa độ GPS:** Sử dụng tọa độ chính xác từ cơ sở dữ liệu (`latitude`, `longitude`) hoặc địa chỉ số nhà chi tiết để ghim đúng vị trí.

---

## 2. DỮ LIỆU CÔNG VIỆC & CƠ SỞ DỮ LIỆU

- **Migration `003_add_job_coordinates_and_address.sql`:**
  - `work_address VARCHAR(255)`: Địa chỉ cụ thể.
  - `latitude NUMERIC(10, 7)` & `longitude NUMERIC(10, 7)`: Tọa độ GPS.
- **Dữ liệu thực tế được kiểm chứng:**
  - **Job 3 (The Coffee Chill):** `123 Đặng Thùy Trâm, Phường 13, Bình Thạnh, TP.HCM` → Tọa độ `10.8277250, 106.6997120` (ngay cạnh cơ sở 3 Đại học Văn Lang).
  - **Job 4 (Nội thất):** `Tòa nhà Saigon Tower, 29 Lê Duẩn, Quận 1, TP.HCM` → Tọa độ `10.7818500, 106.7001200`.
  - **Job 1 (TechCorp Frontend):** `Bitexco Financial Tower, Quận 1, TP.HCM` → Tọa độ `10.7716610, 106.7044030`.
  - **Job 2 (Banner Freelance):** `Remote 100%` → `latitude: NULL, longitude: NULL`.

---

## 3. XỬ LÝ CÁC TRƯỜNG HỢP ĐẶC BIỆT

| Tình huống | Giao diện hiển thị | Hành vi bản đồ |
|---|---|---|
| **Công việc có địa chỉ thực tế** (Vd: The Coffee Chill - 123 Đặng Thùy Trâm) | Tiêu đề "Vị trí làm việc", Badge xanh `Địa chỉ xác thực`, địa chỉ đầy đủ | Google Maps Embed hiển thị ghim đỏ tại đúng số nhà, đường Đặng Thùy Trâm và Cơ sở 3 ĐH Văn Lang |
| **Công việc làm từ xa (Remote 100%)** (Vd: Banner Freelance) | Card chuyên biệt viền nét đứt tím, Badge xanh lá: `Làm việc từ xa (Remote)` | **Tuyệt đối không hiển thị bản đồ và không tạo marker giả**, thông báo rõ ràng về tính chất làm online |
| **Công việc chỉ có quận/huyện** | Badge vàng cảnh báo: `Vị trí khu vực (Ước lượng)` | Google Maps hiển thị trung tâm quận/huyện tương ứng |
| **Chưa có địa chỉ** | Hộp thông báo xám nhạt với icon `AlertCircle` | Hướng dẫn ứng viên liên hệ nhà tuyển dụng |
| **Nút "Chỉ đường"** | Nút CTA `Mở chỉ đường trên Google Maps` | Mở trực tiếp Google Maps với đích đến là địa chỉ/tọa độ đã xác thực trong tab mới |

---

## 4. KẾT QUẢ KIỂM THỬ THỰC TẾ

1. **Kiểm thử trên trình duyệt (Playwright):**
   - Đã chụp ảnh màn hình giao diện Desktop (1440x900) với The Coffee Chill: Google Maps hiển thị chuẩn xác tại Đặng Thùy Trâm bên dưới "Thông tin doanh nghiệp".
   - Đã chụp ảnh màn hình giao diện Remote: Hiển thị đúng Card Remote chuyên biệt, không có bản đồ rác.
   - Responsive trên Mobile (375x812): Khung bản đồ tự động co giãn, các nút bấm thao tác dễ dàng.
2. **Kiểm thử hồi quy mã nguồn:**
   - Frontend Build: `npm --prefix client run build` thành công trong **525ms**.
   - Backend Test Suites: `npm --prefix server test` đạt **10/10 test suites thành công 100%**.
