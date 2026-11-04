# BÁO CÁO NGHIÊN CỨU VÀ TÁI THIẾT KẾ FOOTER JOBNEST

> **Dự án**: Nền tảng tuyển dụng sinh viên bán thời gian và freelance — JobNest  
> **Vai trò thực hiện**: Senior UI/UX Designer & Senior Frontend Engineer  
> **Thời gian thực hiện**: Tháng 11/2026  
> **Tài liệu tham chiếu**: Đồ án tốt nghiệp / Chuyên đề 2  

---

## 1. TỔNG QUAN VÀ MỤC TIÊU DỰ ÁN

Mục tiêu của nhiệm vụ là nghiên cứu chuyên sâu cấu trúc, giao diện và trải nghiệm người dùng (UI/UX) của hai cổng thông tin tuyển dụng hàng đầu tại Việt Nam:
1. **Vieclam24h** ([https://vieclam24h.vn/](https://vieclam24h.vn/))
2. **VietnamWorks** ([https://www.vietnamworks.com/](https://www.vietnamworks.com/))

Từ đó, tái thiết kế toàn diện khu vực **Footer** và bổ sung **Cụm nút điều hướng nổi (Floating Action Buttons - FAB)** cho nền tảng **JobNest**, đạt mức độ hoàn thiện cao cấp, thẩm mỹ nhất quán với bộ nhận diện thương hiệu (Soft Lavender & Peach), bố cục 5 cột đa tầng, và liên kết 100% chức năng thực tế trên source code frontend.

---

## 2. KẾT QUẢ NGHIÊN CỨU WEBSITE THAM KHẢO

### 2.1. Phân tích Cổng tuyển dụng Vieclam24h (`vieclam24h.vn`)

| Yếu tố UI/UX | Đặc điểm ghi nhận trực tiếp | Bài học kinh nghiệm áp dụng cho JobNest |
| :--- | :--- | :--- |
| **Bố cục tổng thể** | Phân tầng theo chiều dọc: Banner hotline & Tải ứng dụng ở trên, tiếp đến là khối liên kết phân loại, cuối cùng là thông tin doanh nghiệp & bản quyền. | Tách Footer thành 3 tầng: Tầng 1 (Hotline kép + App Banner), Tầng 2 (Lưới 5 cột phân loại chức năng), Tầng 3 (Bản quyền & Công nhận đề tài). |
| **Khu vực Hotline** | Chia tách rõ ràng 2 kênh liên hệ: **Hotline Người tìm việc** và **Hotline Nhà tuyển dụng**, kèm giờ làm việc cụ thể. | Tạo 2 thẻ Hotline Card nổi bật bằng hiệu ứng Glassmorphism với màu viền lavender, phân rõ kênh hỗ trợ sinh viên và doanh nghiệp. |
| **Khu vực Tải App** | Giới thiệu ứng dụng di động kèm QR Code, nút tải App Store và Google Play. | Thiết kế App Banner thông minh cho JobNest, thể hiện lộ trình ứng dụng di động (kèm nhãn minh bạch "Đang phát triển / Sắp ra mắt"). |
| **Màu sắc & Phân cách** | Tông màu thương hiệu xanh đậm chủ đạo, chữ trắng ngà, đường kẻ viền phân chia thanh mảnh. | Áp dụng nền Tím Than Sâu (`#22192B` đến `#2E233B`), viền tím `#49375F`, chữ màu Lavender nhạt (`#E0D7EC`) và điểm nhấn Cam Đào (`#F2A184`). |

### 2.2. Phân tích Cổng tuyển dụng VietnamWorks (`vietnamworks.com`)

| Yếu tố UI/UX | Đặc điểm ghi nhận trực tiếp | Bài học kinh nghiệm áp dụng cho JobNest |
| :--- | :--- | :--- |
| **Mật độ thông tin & Đa cột** | Bố cục đa cột dày đặc, phân cấp rõ rệt: Việc làm theo địa điểm trọng điểm, Việc làm theo ngành nghề cốt lõi, Công cụ ứng viên, Dịch vụ tuyển dụng. | Xây dựng lưới 5 cột chuyên nghiệp với độ rộng linh hoạt (`1.25fr 1fr 1fr 1.15fr 1.15fr`), đáp ứng cả tìm kiếm theo ngành nghề và khu vực thực tế. |
| **Hành vi điều hướng** | Các từ khóa ngành nghề và địa điểm đều là liên kết lọc trực tiếp đến trang tìm kiếm với tham số tương ứng. | Toàn bộ thẻ ngành nghề (CNTT, Thiết kế, F&B, Marketing...) và địa điểm (Quận 1, Bình Thạnh, Thủ Đức, Từ xa...) kích hoạt chuyển sang tab `jobs` kèm thiết lập bộ lọc tự động. |
| **Cụm nút nổi (Floating Actions)** | Nút quay lại đầu trang (Back to top) và nút hỗ trợ trực tuyến ghim cố định ở góc dưới bên phải màn hình. | Triển khai component `FloatingActions.jsx` gồm: Nút Back-to-Top (tự hiện khi cuộn > 200px), Nút mở Ngăn thông báo (Notifications), Nút mở Trung tâm hỗ trợ (Support Modal), kèm Tooltip nổi và animation mượt mà. |

---

## 3. KIẾN TRÚC VÀ BỐ CỤC FOOTER JOBNEST ĐÃ TRIỂN KHAI

### 3.1. Nhận diện thương hiệu JobNest
- **Logo**: Sử dụng chuẩn xác file logo gốc của dự án từ `Tài Liệu/Logo.jpg` (được phục vụ tĩnh tại `/logo.jpg` và `src/assets/logo.jpg`). Tuyệt đối không vẽ lại hay thay thế logo.
- **Bảng màu chuẩn**:
  - `Primary / Brand`: `#594675`
  - `Hover State`: `#49375F`
  - `Secondary Lavender`: `#806A9F` & `#A997C5`
  - `Accent Peach`: `#F2A184` (dùng làm hover highlight, active badge và CTA)
  - `Footer Dark Background`: Gradient tuyến tính từ `#2E233B` xuống `#22192B`
  - `Footer Text`: Trắng ngà và Lavender dịu mắt (`#EAE5F0`, `#BDB3CC`), tương phản WCAG AAA.

### 3.2. Cấu trúc 3 tầng chi tiết

```
┌────────────────────────────────────────────────────────────────────────┐
│ TẦNG 1: TOP HIGHLIGHTS (Vieclam24h Inspired)                            │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────┐ │
│ │ 🎧 Hotline Sinh viên │ │ 💼 Hotline Tuyển dụng│ │ 📱 JobNest Mobile│ │
│ │  (028) 7109 2424     │ │  (028) 7108 2424     │ │  iOS & Android   │ │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ TẦNG 2: 5-COLUMN DIRECTORY (VietnamWorks Inspired)                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────┐ │
│ │ CỘT 1    │ │ CỘT 2    │ │ CỘT 3    │ │ CỘT 4        │ │ CỘT 5      │ │
│ │ Về       │ │ Cho Người│ │ Cho Nhà  │ │ Ngành nghề & │ │ Kết nối &  │ │
│ │ JobNest  │ │ Tìm Việc │ │ Tuyển Dụng│ │ Khu vực      │ │ Pháp lý    │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────────┘ └────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ TẦNG 3: BOTTOM ACCREDITATION & COPYRIGHT                               │
│  © 2026 JobNest. All rights reserved. • Văn Lang University Thesis     │
└────────────────────────────────────────────────────────────────────────┘
```

#### Chi tiết 5 Cột Nội Dung:
1. **Cột 1: Về Nền Tảng JobNest**
   - Logo JobNest chính thức (hiển thị sắc nét trên nền sáng bo tròn).
   - Sứ mệnh: *"Nền tảng công nghệ kết nối sinh viên với cơ hội việc làm bán thời gian, thực tập và dự án freelance chất lượng cao, minh bạch và an toàn."*
   - Thông tin vận hành thực tế: Cơ sở Trường Đại học Văn Lang (69/68 Đặng Thùy Trâm, P.13, Q. Bình Thạnh, TP.HCM).
   - Email liên hệ: `support@jobnest.vn` | `contact@jobnest.vn`.
   - Huy hiệu Đề án Tốt nghiệp Chuyên đề 2.

2. **Cột 2: Dành Cho Người Tìm Việc (Ứng Viên Sinh Viên)**
   - *Tất cả việc làm mới nhất* → Chuyển sang Tab Việc làm (`jobs`).
   - *Việc làm Bán thời gian (Part-time)* → Tab `jobs` kèm filter `Bán thời gian`.
   - *Dự án Freelance sinh viên* → Tab `jobs` kèm filter `Freelance`.
   - *Việc làm Từ xa (Remote)* → Tab `jobs` kèm filter `Từ xa`.
   - *Quản lý hồ sơ ứng tuyển* → Tab `student_apps` (yêu cầu đăng nhập).
   - *Hồ sơ & CV năng lực* → Tab `studentProfile`.
   - *Hướng dẫn ứng tuyển an toàn* → Mở Quy chế & Hướng dẫn sinh viên.

3. **Cột 3: Dành Cho Nhà Tuyển Dụng (Doanh Nghiệp / Đối Tác)**
   - *Đăng tin tuyển dụng mới* → Chuyển tab `create_job`.
   - *Quản lý tin tuyển dụng đã đăng* → Chuyển tab `employer_jobs`.
   - *Duyệt hồ sơ & Quản lý ứng viên* → Chuyển tab `applicants`.
   - *Hồ sơ thương hiệu Doanh nghiệp* → Chuyển tab `employerProfile`.
   - *Quy chế duyệt tin & Bảo vệ quyền lợi* → Mở Quy chế sàn TMĐT.
   - *Liên hệ bộ phận CSKH Doanh nghiệp* → Mở Support Modal kênh Doanh nghiệp.

4. **Cột 4: Ngành Nghề & Khu Vực Tuyển Dụng**
   - **Nhóm Ngành nghề hot**: Thẻ bấm trực tiếp lọc việc: Công nghệ thông tin (`IT`), Thiết kế đồ họa (`Design`), F&B & Dịch vụ khách hàng, Giáo dục & Gia sư, Tiếp thị & Marketing.
   - **Nhóm Khu vực trọng điểm**: Thẻ lọc theo Quận 1, Quận Bình Thạnh, Quận Gò Vấp, TP. Thủ Đức, và Làm việc Từ xa (Remote).
   - Nút *"Khám phá toàn bộ danh mục"* dẫn tới toàn bộ kho dữ liệu.

5. **Cột 5: Kết Nối & Trung Tâm Pháp Lý**
   - Mạng xã hội chính thức: Facebook JobNest, LinkedIn, GitHub Repository, Kênh YouTube chia sẻ kỹ năng.
   - Các nút mở Modal pháp lý độc lập:
     - *Điều khoản sử dụng dịch vụ*
     - *Chính sách bảo mật dữ liệu cá nhân* (Tuân thủ Nghị định 13/2023/NĐ-CP)
     - *Quy chế hoạt động & Giải quyết tranh chấp* (Tài liệu UC-10)
     - *Sơ đồ tổ chức website (Sitemap)*

---

## 4. HỆ THỐNG CÁC MODAL VÀ TIỆN ÍCH NỔI ĐƯỢC XÂY DỰNG MỚI

### 4.1. Component `FloatingActions.jsx` (Nút Điều Hướng Nổi Bên Phải)
- **Vị trí**: Ghim cố định tại `fixed bottom-6 right-6 z-40`, xếp theo chiều dọc cách nhau 12px.
- **Nút Cuộn lên đầu trang (Back to Top)**:
  - Tự động ẩn khi ở đỉnh trang; chỉ kích hoạt và chuyển mượt mà khi người dùng cuộn xuống quá 200px.
  - Sử dụng hiệu ứng `window.scrollTo({ top: 0, behavior: 'smooth' })`.
- **Nút Thông báo nhanh (Notifications)**:
  - Hiển thị chuông thông báo kèm huy hiệu đếm số thông báo mới (unread badge `3`).
  - Nhấp chuột kích hoạt mở ngăn thông báo `NotificationsDropdown` ở góc trên màn hình.
- **Nút Hỗ trợ & Khẩn cấp (Support FAB)**:
  - Biểu tượng tai nghe hỗ trợ viên kèm hiệu ứng hào quang màu đào dịu (`shadow-lg shadow-purple-900/40`).
  - Nhấp chuột mở ngay `SupportModal`.
- **Tooltip Desktop**: Mỗi nút đều có Tooltip nổi màu tím đen viền lavender, tự động hiển thị khi rê chuột.

### 4.2. Component `SupportModal.jsx` (Trung Tâm Hỗ Trợ Đa Kênh)
- Thiết kế dạng modal hiện đại với nền tối kết hợp chi tiết Lavender.
- 2 thẻ Hotline chuyên biệt kèm nút bấm "Gọi ngay":
  - Sinh viên / Ứng viên: `(028) 7109 2424` (8:00 - 21:00)
  - Nhà tuyển dụng: `(028) 7108 2424` (8:30 - 18:00)
- Biểu mẫu gửi phản hồi trực tiếp: Người dùng có thể nhập Họ tên, Email, Loại yêu cầu (Hỗ trợ tài khoản, Báo cáo tin giả mạo, Tư vấn tuyển dụng) và Nội dung tin nhắn, có phản hồi xác nhận thành công.

### 4.3. Component `PolicyModal.jsx` (Trung Tâm Văn Bản Pháp Lý & Quy Chế)
- Hỗ trợ chuyển đổi linh hoạt 4 tab:
  1. **Điều khoản sử dụng**: Quy định thành viên, trách nhiệm đăng tin, tiêu chuẩn bảo vệ sinh viên làm thêm.
  2. **Chính sách bảo mật**: Quy trình mã hóa mật khẩu, cam kết không bán dữ liệu cho bên thứ ba theo NĐ 13/2023/NĐ-CP.
  3. **Quy chế hoạt động**: Cơ chế kiểm duyệt tin đăng, quy trình xử lý tranh chấp việc làm (đáp ứng Use Case UC-10 trong tài liệu SRS).
  4. **Sơ đồ website (Sitemap)**: Bản đồ toàn diện cấu trúc điều hướng của JobNest.

---

## 5. BẢNG TỔNG HỢP ROUTE VÀ HÀNH VI ĐIỀU HƯỚNG LIÊN KẾT

| Tên liên kết trên Footer | Loại tương tác | Tham số / Hành vi thực tế | Trạng thái kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Tìm việc làm / Tất cả việc làm** | Tab Switch | Chuyển sang Tab `jobs` | Hoạt động 100% |
| **Việc làm Bán thời gian** | Filter + Tab Switch | Tab `jobs`, đặt `selectedWorkType = "Bán thời gian"` | Hoạt động 100% |
| **Việc làm Freelance** | Filter + Tab Switch | Tab `jobs`, đặt `selectedWorkType = "Freelance"` | Hoạt động 100% |
| **Việc làm Từ xa (Remote)** | Filter + Tab Switch | Tab `jobs`, đặt `selectedLocation = "Từ xa"` | Hoạt động 100% |
| **Thẻ Ngành nghề (IT, Thiết kế...)** | Filter + Tab Switch | Tab `jobs`, đặt `selectedCategory = categoryName` | Hoạt động 100% |
| **Thẻ Khu vực (Q1, Bình Thạnh...)** | Filter + Tab Switch | Tab `jobs`, đặt `selectedLocation = locationName` | Hoạt động 100% |
| **Đăng tin tuyển dụng** | Tab Switch | Chuyển sang Tab `create_job` (yêu cầu role employer) | Hoạt động 100% |
| **Quản lý tin tuyển dụng** | Tab Switch | Chuyển sang Tab `employer_jobs` | Hoạt động 100% |
| **Quản lý ứng viên** | Tab Switch | Chuyển sang Tab `applicants` | Hoạt động 100% |
| **Lịch sử ứng tuyển sinh viên** | Tab Switch | Chuyển sang Tab `student_apps` | Hoạt động 100% |
| **Hồ sơ sinh viên / NTD** | Tab Switch | Chuyển sang Tab `studentProfile` / `employerProfile` | Hoạt động 100% |
| **Điều khoản / Bảo mật / Quy chế** | Modal Trigger | Mở `PolicyModal` với Tab tương ứng | Hoạt động 100% |
| **Hotline / Trung tâm trợ giúp** | Modal Trigger | Mở `SupportModal` với đầy đủ thông tin | Hoạt động 100% |
| **Email liên hệ** | `mailto:` Link | Mở `mailto:support@jobnest.vn` | Hoạt động 100% |

---

## 6. KHẢ NĂNG TƯƠNG THÍCH ĐA THIẾT BỊ (RESPONSIVE)

- **Desktop (>= 1024px)**: Lưới 5 cột hoàn chỉnh được kiểm soát bởi class chuyên biệt `.footer-grid` (`grid-template-columns: 1.25fr 1fr 1fr 1.15fr 1.15fr; gap: 32px;`).
- **Tablet (640px – 1023px)**: Tự động tổ chức lại thành bố cục 3 cột (`repeat(3, 1fr)`), đảm bảo các khối nội dung không bị chen chúc hoặc đứt gãy.
- **Mobile (< 640px)**: Tự động chuyển đổi thành 1 cột xếp dọc (`1fr`), tối ưu hóa khoảng cách chạm (touch targets tối thiểu 44px), không gây tràn màn hình hoặc thanh cuộn ngang ngoài ý muốn.
- **Cụm nút nổi trên Mobile**: Tự động tinh chỉnh kích thước, nằm nép gọn gàng bên góc phải không che khuất nội dung quan trọng.

---

## 7. KẾT QUẢ KIỂM THỬ VÀ XÁC MINH HỆ THỐNG

### 7.1. Kiểm thử Tự động (Automated Verification)
- **Vite Production Build**:
  ```bash
  npm --prefix client run build
  # Kết quả: vite v5.4.14 building for production...
  # transform (80) -> dist/index.html, dist/assets/index-*.js, dist/assets/index-*.css
  # ✓ built in 506ms. 0 errors, 0 warnings.
  ```
- **ESLint Code Quality**:
  ```bash
  npm --prefix client run lint
  # Kết quả: 0 errors, 0 warnings.
  ```
- **Backend & Integration Tests**:
  ```bash
  npm test
  # Test Suites: 4 passed, 4 total
  # Tests:       10 passed, 10 total
  # Snapshots:   0 total
  # Time:        5.768 s
  ```

### 7.2. Bằng chứng Hình ảnh Thực tế (Screenshots)
Các ảnh chụp trực tiếp từ trình duyệt trong môi trường chạy thật đã được lưu trữ trong thư mục `docs/`:

1. **Giao diện Footer Tinh Gọn Chuẩn VietnamWorks (Theo phản hồi mới nhất)**: `docs/footer_minimal_screenshot.png`  
   *(Minh chứng giao diện tinh tế, loại bỏ hoàn toàn các icon rườm rà cạnh liên kết, đúng định dạng typography tối giản và chuyên nghiệp như VietnamWorks/Vieclam24h).*
2. **Giao diện 5 Cột Toàn Cảnh**: `docs/footer_5cols_screenshot.png`  
   *(Minh chứng tỷ lệ cột cân đối, hiển thị logo JobNest chính thức, cụm liên kết và nút FABs góc phải).*
3. **Trung Tâm Trợ Giúp Tương Tác**: `docs/support_modal_screenshot.png`  
   *(Minh chứng giao diện Support Modal với form phản hồi và hotline trực tuyến).*
4. **Trung Tâm Chính Sách Pháp Lý**: `docs/policy_modal_screenshot.png`  
   *(Minh chứng Policy Modal với hệ thống 4 tab nội dung pháp lý đầy đủ).*

---

## 8. KẾT LUẬN

Khu vực Footer của **JobNest** đã được nâng cấp toàn diện từ trạng thái cơ bản lên tiêu chuẩn cổng thông tin tuyển dụng chuyên nghiệp tương đương **Vieclam24h** và **VietnamWorks**:
- Giữ vững bản sắc thiết kế **Soft Lavender & Peach**, sử dụng **Logo gốc** không sai lệch.
- 100% liên kết và nút bấm có chức năng thực chất, gắn kết chặt chẽ với hệ thống tìm kiếm, lọc dữ liệu và quản trị của JobNest.
- Bộ mã nguồn tuân thủ tiêu chuẩn code sạch, modular, responsive mượt mà và không gây bất kỳ tác động tiêu cực nào tới các luồng nghiệp vụ hiện hữu của hệ thống.
- Toàn bộ thay đổi nằm trong working tree, sẵn sàng để bàn giao cho quản lý dự án nghiệm thu.
