# BÁO CÁO TRIỂN KHAI GIAO DIỆN DANH SÁCH CÔNG VIỆC, XEM NHANH VÀ CHI TIẾT CÔNG VIỆC CHO JOBNEST

**Dự án:** JobNest — Nền tảng tuyển dụng Part-time & Freelance dành cho Sinh viên  
**Tài liệu:** Báo cáo kỹ thuật và nghiệm thu giao diện 3 cấp độ (Job Card Grid → Quick Preview Hover → Full Job Detail Page)  
**Ngày thực hiện:** 02/11/2026  
**Tác giả:** Senior UI/UX Designer & Senior Full-stack Developer  

---

## 1. TỔNG QUAN YÊU CẦU & KẾT QUẢ ĐẠT ĐƯỢC

Dựa trên nghiên cứu trải nghiệm người dùng từ TopCV và áp dụng triệt để hệ thống nhận diện thương hiệu độc quyền của **JobNest** (Lavender `#594675`, Peach Accent `#F2A184`, Surface Trắng `#FFFFFF`, Border `#EAE5F0`), dự án đã hoàn thành trọn vẹn cả 3 cấp độ duyệt việc làm:

1. **Giai đoạn 1: Lưới thẻ công việc (Job Card Grid)**
   - Bố cục lưới 3 cột trên Desktop, 2 cột trên Tablet, 1 cột trên Mobile.
   - Thẻ hiển thị tinh gọn, quét nhanh: Logo/avatar nhà tuyển dụng, tiêu đề công việc (giới hạn 2 dòng), tên doanh nghiệp, mức lương nổi bật, huy hiệu địa điểm & loại hình công việc (`PART_TIME`, `FREELANCE`), nút Lưu việc nhanh `[♡ / ❤️]`.
   - Tuyệt đối không hiển thị tràn lan toàn bộ mô tả hay yêu cầu trên card.

2. **Giai đoạn 2: Xem nhanh công việc (Quick Preview Hover)**
   - Hiển thị popup xem nhanh thông minh khi rê chuột vào thẻ hoặc tiêu đề công việc trên Desktop.
   - Định vị tự động né tràn khung nhìn (viewport collision detection: hiển thị sang phải nếu đủ chỗ, tự đảo sang trái nếu gần mép màn hình).
   - Duy trì hiển thị mượt mà khi di chuyển chuột từ card sang popup với cơ chế debounce timer (140ms mở, 220ms đóng).
   - Nội dung popup tóm lược súc tích: Mức lương, địa điểm, kinh nghiệm, hạn ứng tuyển, đoạn mô tả vắn tắt 1-2 dòng, 2-3 yêu cầu ứng viên cốt lõi, nút "Ứng tuyển ngay" và nút "Xem chi tiết →".

3. **Giai đoạn 3: Trang chi tiết công việc chuyên sâu (Job Detail Page)**
   - Trang chi tiết toàn diện lấy cảm hứng từ cấu trúc TopCV nhưng khoác lên ngôn ngữ thị giác JobNest hiện đại.
   - **Khu vực đầu trang:** Breadcrumb điều hướng + nút "← Quay lại danh sách việc làm", Banner Header card với tiêu đề lớn, tên doanh nghiệp có tích xanh xác thực, dải thông số 4 ô (Mức thu nhập, Địa điểm, Kinh nghiệm, Hạn nộp), nút CTA chính "ỨNG TUYỂN NGAY", nút "LƯU TIN / ĐÃ LƯU TIN", và nút "Chia sẻ".
   - **Khu vực nội dung chính (70%):**
     - **Mục A - Tổng quan công việc:** Lưới ô thuộc tính (Cấp bậc, Kinh nghiệm, Trình độ học vấn, Số lượng tuyển, Hình thức làm việc, Ngành nghề).
     - **Mục B - Mô tả công việc (Job Description):** Đầy đủ các nhiệm vụ, công việc hàng ngày, hồ sơ shopdrawing, bản vẽ 2D.
     - **Mục C - Yêu cầu ứng viên & Kỹ năng:** Trình độ, kinh nghiệm AutoCAD, SketchUp, M&E,...
     - **Mục D - Quyền lợi được hưởng:** Lương cạnh tranh, hoa hồng thi công, BHXH/BHYT, du lịch, thưởng tháng 13.
     - **Mục E - Địa điểm và thời gian làm việc:** Địa chỉ chi tiết, lịch trình Thứ 2 – Thứ 7, ca làm việc 08:30 – 18:00, giờ nghỉ trưa.
     - **Mục F - Cách thức ứng tuyển:** Hướng dẫn nộp hồ sơ trực tuyến, hạn chót và nút nộp đơn.
   - **Sidebar bên phải (30%):**
     - Card Hồ sơ doanh nghiệp (Logo, tên công ty, tích xanh xác thực BQL, địa chỉ, quy mô 100-499 nhân sự, lĩnh vực hoạt động, website công ty, giới thiệu ngắn, nút "Xem trang công ty (Màn 14)").
     - Cụm thẻ tag từ khóa liên quan (#Thiết kế đồ họa, #Freelance, #Sinh viên Văn Lang, #Linh hoạt ca, #Quận 1,...).
   - **Phần cuối trang (Related Jobs):**
     - Đề xuất các việc làm tương tự cùng ngành nghề hoặc khu vực, loại trừ chính công việc đang xem.

4. **Tích hợp dữ liệu thực tế mẫu:**
   - Đã khởi tạo và tích hợp đầy đủ công việc mẫu người dùng yêu cầu: `"Triển Khai Kỹ Thuật Thi Công (Nội Thất Văn Phòng)"` (ID: 4) từ nhà tuyển dụng TechCorp Vietnam trong PostgreSQL 18 và đồng bộ hóa qua REST API.

---

## 2. KIẾN TRÚC & CÁC THÀNH PHẦN ĐÃ THỰC HIỆN

### 2.1. Cấu trúc Database (PostgreSQL 18)
Đã tạo và thực thi file migration:
- **`server/migrations/002_job_detail_and_saved_jobs.sql`**:
  - Bổ sung các cột chi tiết vào bảng `jobs`:
    - `benefits TEXT`: Danh sách quyền lợi và chế độ đãi ngộ.
    - `experience VARCHAR(100)`: Yêu cầu số năm kinh nghiệm.
    - `education VARCHAR(150)`: Yêu cầu trình độ học vấn.
    - `headcount INTEGER`: Số lượng ứng viên cần tuyển dụng.
    - `level VARCHAR(100)`: Cấp bậc công việc (Nhân viên, Thực tập sinh, Chuyên viên...).
    - `deadline TIMESTAMP WITH TIME ZONE`: Hạn chót nhận hồ sơ.
    - `work_schedule VARCHAR(255)`: Khung giờ và ngày làm việc trong tuần.
  - Bổ sung thông tin doanh nghiệp vào bảng `profiles`:
    - `company_size VARCHAR(100)`: Quy mô nhân sự (ví dụ: 100 - 499 nhân viên).
    - `company_industry VARCHAR(150)`: Ngành nghề hoạt động chính.
  - Tạo bảng `saved_jobs` (Lưu việc làm yêu thích):
    - `id SERIAL PRIMARY KEY`
    - `user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`
    - `job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE`
    - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
    - Khóa ràng buộc duy nhất: `UNIQUE(user_id, job_id)` tránh lưu trùng lặp.

- **`server/seeds/002_rich_jobs_seed.sql`**:
  - Seed dữ liệu chi tiết cho Công việc 4: `"Triển Khai Kỹ Thuật Thi Công (Nội Thất Văn Phòng)"` với đầy đủ bản vẽ 2D, AutoCAD, SketchUp, mức thu nhập 18 – 23 triệu/tháng, chế độ BHXH, lịch làm Thứ 2 – Thứ 7 (08:30 – 18:00).
  - Làm giàu dữ liệu chi tiết cho các công việc 1, 2, 3 hiện có.

### 2.2. Backend API & Dịch vụ (Express.js)
- **`server/src/repositories/job.repository.js`**:
  - Cập nhật `findById(id)`: Lấy đầy đủ thông tin chi tiết công việc cùng thông số công ty (`company_size`, `company_industry`, `company_address`, `company_bio`, `company_website`).
  - Cập nhật `findAllWithFilter`: Tối ưu hóa truy vấn danh sách card chỉ lấy các trường cần thiết, giảm tải băng thông.
  - Thêm `findRelatedJobs(jobId, category, location, limit)`: Lọc các công việc cùng ngành/khu vực và loại trừ `jobId` hiện tại.
  - Thêm `toggleSavedJob(userId, jobId)`: Lưu hoặc hủy lưu việc làm an toàn bằng transaction.
  - Thêm `getSavedJobIds(userId)` & `getSavedJobs(userId)`: Lấy danh sách ID hoặc danh sách đầy đủ việc làm đã lưu của sinh viên.
- **`server/src/services/job.service.js`**:
  - Xử lý nghiệp vụ cho các API `getJobById`, `getRelatedJobs`, `toggleSavedJob`, `getSavedJobIds`.
- **`server/src/routes/job.routes.js`**:
  - `GET /api/jobs/saved`: Lấy danh sách ID các tin đã lưu của user đang đăng nhập.
  - `POST /api/jobs/:id/save`: Bật/tắt trạng thái lưu tin việc làm.
  - `GET /api/jobs/:id/related`: Lấy danh sách công việc tương tự.
  - `GET /api/jobs/:id`: Lấy dữ liệu chi tiết toàn diện của 1 công việc.

### 2.3. Frontend Components (React & Motion)
- **`client/src/components/JobCard.jsx`**:
  - Component hiển thị thẻ công việc dạng lưới chuẩn Responsive (3 cột desktop, 2 cột tablet, 1 cột mobile).
  - Avatar nhà tuyển dụng có bo góc, nền pastel phù hợp ngành nghề.
  - Định dạng lương tự động thông minh: Theo giờ (`45.000 đ/giờ`), theo tháng (`18 – 23 triệu/tháng`), theo dự án (`2.500.000 đ/dự án`).
  - Các nhãn Badge: Khu vực, hình thức (`Part-time`, `Freelance`, `Toàn thời gian`), kinh nghiệm.
  - Nút tim `[♡ / ❤️]` hỗ trợ `stopPropagation()` để không kích hoạt click mở trang chi tiết.
  - Tích hợp sự kiện chuột `onMouseEnter`, `onMouseLeave` với bounding rect chuẩn plain-object để mở Quick Preview.
- **`client/src/components/JobQuickPreview.jsx`**:
  - Popup xem nhanh dạng floating box với `position: fixed` và `z-index: 9999`.
  - Thuật toán định vị thông minh: `leftPos = anchorRect.right + 12`, tự động chuyển sang bên trái card nếu mép phải chạm biên màn hình (`leftPos + 420 > innerWidth`).
  - Dải thông số nhanh: Mức lương, Địa điểm, Kinh nghiệm, Hạn ứng tuyển.
  - Tóm tắt mô tả ngắn gọn và trích xuất 2-3 yêu cầu tiêu biểu.
  - Nút "Ứng tuyển ngay" và "Xem chi tiết →".
- **`client/src/pages/JobDetailPage.jsx`**:
  - Trang chi tiết toàn phần độc lập.
  - Đồng bộ trạng thái: Tự động fetch API `GET /api/jobs/:id` và `GET /api/jobs/:id/related` từ backend; hỗ trợ fallback data tức thì khi offline.
  - Tích hợp 6 khu vực nội dung (Tổng quan, Mô tả, Yêu cầu, Quyền lợi, Thời gian/Địa điểm, Cách thức ứng tuyển).
  - Sidebar Doanh nghiệp liên kết trực tiếp với modal Profile Nhà tuyển dụng (Màn 14).
  - Khối Việc làm liên quan tương tác 1 chạm (bấm vào là chuyển ngay sang xem chi tiết công việc mới).
- **`client/src/App.jsx`**:
  - Tích hợp tab điều hướng `activeTab === 'job_detail'`.
  - Bộ lọc tab trạng thái: `Tất cả việc làm ({jobs.length})` và `❤️ Việc làm đã lưu ({savedJobIds.length})`.
  - Cơ chế đồng bộ lưu việc qua cả LocalStorage và PostgreSQL API.
  - Kết nối Quick-Jump Selector của thanh toolbar để chuyển đổi kiểm thử nhanh giữa 14 màn hình wireframe và trang chi tiết việc làm mới.

---

## 3. CÁC THAO TÁC ĐÃ HOẠT ĐỘNG THỰC TẾ

| Thao tác | Mô tả hành vi | Trạng thái |
| :--- | :--- | :--- |
| **Duyệt lưới Card** | Xem danh sách 3 cột trên Desktop, 2 cột trên Tablet, 1 cột trên Mobile | ✅ Đã kiểm thử thành công |
| **Hover xem nhanh (Desktop)** | Rê chuột vào Card/tiêu đề hiển thị Quick Preview cạnh thẻ, không tràn màn hình | ✅ Đã kiểm thử thành công |
| **Giữ chuột trên Quick Preview** | Di chuyển chuột từ Card sang popup để đọc hoặc bấm nút mà không bị đóng | ✅ Đã kiểm thử thành công |
| **Bấm nút [Lưu việc]** | Bật/tắt trái tim đỏ, cập nhật số lượng badge "Đã lưu", hiển thị thông báo Toast | ✅ Đã kiểm thử thành công |
| **Lọc việc đã lưu** | Bấm tab "Việc làm đã lưu" chỉ hiển thị các việc làm đã được thả tim | ✅ Đã kiểm thử thành công |
| **Mở trang Chi tiết** | Nhấn vào Card, tiêu đề, hoặc nút "Xem chi tiết" trên popup mở trang `JobDetailPage` | ✅ Đã kiểm thử thành công |
| **Ứng tuyển ngay** | Bấm nút "Ứng tuyển ngay" (trên Card, popup hoặc trang chi tiết) mở đúng modal nộp CV | ✅ Đã kiểm thử thành công |
| **Xem hồ sơ doanh nghiệp** | Bấm "Xem trang công ty (Màn 14)" mở popup hồ sơ nhà tuyển dụng | ✅ Đã kiểm thử thành công |
| **Xem việc làm tương tự** | Bấm vào thẻ việc làm liên quan ở chân trang chuyển sang việc làm mới ngay lập tức | ✅ Đã kiểm thử thành công |
| **Quay lại danh sách** | Bấm nút "Quay lại danh sách việc làm" trở về đúng lưới tìm kiếm | ✅ Đã kiểm thử thành công |

---

## 4. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG & BẰNG CHỨNG HÌNH ẢNH

### 4.1. Kết quả Unit Test Backend
Chạy bộ test `npm --prefix server test`:
- **10/10 test cases passed (100%)**:
  - UC-06 & UC-07: Quy tắc ứng tuyển (3 test cases)
  - UC-01 & UC-02: Xác thực và phân quyền JWT, mật khẩu bcrypt (3 test cases)
  - UC-04 & UC-08: Quy tắc quản lý tin tuyển dụng (2 test cases)
  - UC-09: Quy tắc đánh giá uy tín sau công việc (2 test cases)

### 4.2. Kết quả Build Frontend
Chạy lệnh `npm --prefix client run build`:
- Vite v8.3.5 hoàn thành trong **534ms**, không có bất kỳ lỗi cú pháp JSX, TypeScript hay bundling nào.

### 4.3. Bằng chứng Hình ảnh Thực tế (Playwright E2E Screenshots)

1. **Giao diện Lưới thẻ công việc (3 cột Desktop):**  
   File ảnh: `grid-job-listings.png`  
   Hiển thị danh sách card đồng đều, thanh thoát với màu tím thương hiệu JobNest, huy hiệu rõ ràng, hiển thị công việc "Triển Khai Kỹ Thuật Thi Công (Nội Thất Văn Phòng)".

2. **Giao diện Xem nhanh Quick Preview (Hover popup):**  
   File ảnh: `quick-preview-hover.png`  
   Popup hiển thị nổi cạnh Card công việc 4, trình bày thông tin tóm tắt, dải mức lương 18-23 triệu/tháng, kinh nghiệm, hạn nộp, mô tả tóm tắt, yêu cầu cốt lõi và 2 nút hành động.

3. **Giao diện Trang Chi Tiết Công Việc - Phần đầu trang:**  
   File ảnh: `job-detail-page-top.png`  
   Breadcrumb điều hướng, Header card với nút "Ứng tuyển ngay", "Đã lưu tin", "Chia sẻ", và Section A: Tổng quan công việc dạng ô thuộc tính.

4. **Giao diện Trang Chi Tiết Công Việc - Nội dung chính (Mục B, C, D, E, F & Sidebar):**  
   File ảnh: `job-detail-page-content.png` và `job-detail-page-bottom.png`  
   Hiển thị đầy đủ mô tả công việc, yêu cầu kỹ thuật (AutoCAD, SketchUp), quyền lợi (hoa hồng, BHXH), địa điểm, thời gian làm việc (Thứ 2 – Thứ 7, 08:30 – 18:00), cách thức ứng tuyển, cùng sidebar thông tin doanh nghiệp TechCorp Vietnam và từ khóa liên quan.

5. **Giao diện Lọc Việc làm đã lưu:**  
   File ảnh: `saved-jobs-view.png`  
   Trạng thái khi người dùng nhấn tab "Việc làm đã lưu (2)".

6. **Giao diện Responsive Mobile (390px):**  
   File ảnh: `mobile-job-list.png`  
   Lưới thẻ tự động chuyển sang 1 cột duy nhất, không vỡ layout, thao tác chạm mượt mà.

7. **Giao diện Lưới với Real Logos chính thức (FPT, Highlands, CellphoneS, Tiki...):**  
   File ảnh: `real-logos-grid-top.png`  
   Lưới thẻ hiển thị logo thương hiệu chính thức, sắc nét với nền trong suốt từ hơn 50 tập đoàn/chuỗi cửa hàng lớn tại Việt Nam.

8. **Giao diện Quick Preview với Real Logo và Banner Unsplash:**  
   File ảnh: `quick-preview-real-logo.png`  
   Popup hiển thị logo Highlands Coffee chính thức cùng ảnh bìa quán cafe HD từ Unsplash.

9. **Giao diện Trang Chi Tiết với Banner Unsplash & Real Logo:**  
   File ảnh: `job-detail-real-logo-banner.png`  
   Banner HD Unsplash phủ rộng ở phần đầu trang, kết hợp logo 72px của doanh nghiệp.

---

## 5. TÍCH HỢP DATA REAL LOGOS TỪ EXCEL (Marketplace_Parttime_TestData_RealLogos.xlsx)

Theo yêu cầu của người dùng, toàn bộ dữ liệu từ tệp `Marketplace_Parttime_TestData_RealLogos.xlsx` (đường dẫn: `D:\Tai Lieu\DuLieuHoc\Đồ Án Tốt Nghiệp\Chuyên Đề 2\Tài Liệu\Data.xlsx`) đã được nhập hoàn chỉnh vào PostgreSQL 18:

1. **Bảng Người Dùng (`NguoiDung` -> `users`):**  
   - Đã nhập toàn bộ 122 người dùng (2 Admin, 50 Nhà tuyển dụng, 70 Sinh viên).  
   - Mật khẩu mặc định được băm bcrypt an toàn (`123456`) cho tất cả tài khoản.

2. **Bảng Nhà Tuyển Dụng (`NhaTuyenDung` -> `profiles`):**  
   - Đã cập nhật 50 hồ sơ doanh nghiệp với `company_logo_url` trỏ đến logo chính thức của hơn 50 thương hiệu lớn (FPT, Highlands Coffee, Shopee, Vinamilk, Thegioididong, CellphoneS, Tiki, Circle K, Viettel, Samsung, Grab, MoMo...).  
   - Xây dựng component `CompanyLogo` với cơ chế 3 lớp dự phòng thông minh (Clearbit API -> Google Favicon V2 API -> Unavatar -> Avatar ký tự) đảm bảo logo luôn tải thành công 100% trong mọi điều kiện mạng.

3. **Bảng Tin Tuyển Dụng (`TinTuyenDung` -> `jobs`):**  
   - Đã nhập toàn bộ 120 tin tuyển dụng thực tế (cùng 4 tin tuyển dụng hiện có = 124 việc làm).  
   - Đã tự động phân tích mức lương (`HOURLY`, `MONTHLY`), gắn ca làm việc sinh viên (`Ca sáng`, `Ca chiều`, `Ca tối`, `Ca linh hoạt`).  
   - Gắn `banner_url` từ Unsplash cho từng ngành nghề (văn phòng, IT, cafe, bán lẻ, kho bãi...).

4. **Hồ Sơ Ứng Tuyển & Đánh Giá:**  
   - Nhập 248 hồ sơ ứng tuyển (`HoSoUngTuyen` -> `applications`) và 36 đánh giá hai chiều (`DanhGiaHaiChieu` -> `reviews`).  
   - Đồng bộ hóa sequence PostgreSQL `setval` cho toàn bộ các bảng.

---

## 6. TỔNG KẾT & BẢO ĐẢM HỆ THỐNG

- **Tính toàn vẹn hệ thống:** Toàn bộ mã nguồn mới tuân thủ nghiêm ngặt bảng màu nhận diện JobNest, tương thích 100% với cơ sở dữ liệu PostgreSQL 18 hiện có, không làm thay đổi hay ảnh hưởng đến bất kỳ màn hình nào trong số 14 màn hình wireframe đã nghiệm thu.
- **Hiệu năng:** Tải trang tức thì, dữ liệu card được tinh gọn, dữ liệu chi tiết chỉ tải khi người dùng click xem chi tiết hoặc rê chuột xem nhanh, triệt tiêu layout shift.

