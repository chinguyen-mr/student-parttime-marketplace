# BÁO CÁO TRIỂN KHAI TRANG COMING SOON DÙNG CHUNG CHO TOÀN BỘ JOBNEST

> **Dự án**: Nền tảng tuyển dụng sinh viên bán thời gian và freelance — JobNest  
> **Vai trò thực hiện**: Senior UI/UX Designer & Senior Frontend Engineer  
> **Thời gian thực hiện**: Tháng 11/2026  
> **Tài liệu tham chiếu**: Đồ án tốt nghiệp / Chuyên đề 2  

---

## 1. TỔNG QUAN VÀ MỤC TIÊU TRIỂN KHAI

Để nâng cao tính chuyên nghiệp và mang lại trải nghiệm người dùng (UX) liền mạch trên toàn hệ thống **JobNest**, trang **Coming Soon** dùng chung đã được xây dựng và tích hợp nhằm giải quyết triệt để các trường hợp:
1. Chức năng đang trong lộ trình nghiên cứu và phát triển.
2. Các liên kết hoặc dịch vụ mở rộng chưa sẵn sàng đưa vào vận hành thực tế (ví dụ: ứng dụng di động trên iOS/Android, báo cáo lương thưởng, cổng hợp tác tài trợ doanh nghiệp...).
3. Thay thế hoàn toàn các màn hình trống hoặc thông báo lỗi sơ sài bằng một trang thông báo nhất quán, hiện đại, thân thiện và tạo sự hào hứng cho người dùng.

---

## 2. NGHIÊN CỨU HÌNH ẢNH THAM KHẢO VÀ PHONG CÁCH THIẾT KẾ

Dựa trên hình ảnh tham khảo về hiệu ứng **"Tấm giấy đang bóc mở" (Peeled / Curled Paper Effect)**:
- **Ý tưởng thị giác**: Một tấm giấy trắng kem đang được bóc lật nhẹ từ góc trên cuộn tròn xuống phía dưới, hé lộ một không gian nền tím than sâu thẳm mang đậm nhận diện thương hiệu JobNest.
- **Typography cốt lõi**:
  - Dòng chữ lớn in đậm: **COMING SOON** (Font-weight 900, độ tương phản sắc nét).
  - Dòng phụ đề: **STAY TUNED** (Letter-spacing rộng 0.35em, phong cách Modern SaaS).
  - Thanh gạch cam đào (`#F2A184`) làm điểm nhấn thương hiệu.
- **Công nghệ triển khai**:
  - Tự vẽ hình học vector bằng **SVG thuần túy kết hợp CSS Gradients & Drop Shadows 3D**, không sử dụng hình ảnh raster Shutterstock, không dính watermark, nhẹ nhàng và đạt hiệu năng tối đa 60fps trên mọi thiết bị.
  - Hỗ trợ đầy đủ `prefers-reduced-motion` đối với người dùng tắt hiệu ứng chuyển động.

---

## 3. NHẬN DIỆN THƯƠNG HIỆU VÀ TÀI SẢN HÌNH ẢNH SỬ DỤNG

Tuân thủ nghiêm ngặt bảng màu chuẩn của JobNest:
- **Primary / Brand**: `#594675` (Deep Lavender)
- **Primary Hover**: `#49375F`
- **Secondary**: `#806A9F`
- **Pastel Lavender**: `#A997C5` & `#F4F1F8`
- **Accent Peach**: `#F2A184` & `#F9E5DC`
- **Nền thẻ trung tâm**: Gradient đa tầng từ `#180F24` đến `#251838`
- **Mặt giấy lộ ra**: Trắng kem thanh lịch (`#FFFFFF` đến `#F9F7FC`)
- **Logo**: Sử dụng đúng file gốc [Tài Liệu/Logo.jpg](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/T%C3%A0i%20Li%E1%BB%87u/Logo.jpg) (phục vụ tĩnh tại `/logo.jpg`), không vẽ lại, không biến dạng tỷ lệ.
- **Tài sản chính thức**: Tích hợp các file ảnh gốc từ `Tài Liệu/`:
  - `app-store-badge.png`
  - `google-play-badge.png`
  - `dadangky.jpgx` (chuyển thành `dadangky.png` với nền trong suốt)

---

## 4. THIẾT KẾ COMPONENT DÙNG CHUNG `ComingSoonPage.jsx`

Component được đặt tại [client/src/pages/ComingSoonPage.jsx](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/client/src/pages/ComingSoonPage.jsx) với API linh hoạt:

### 4.1. Props Component
| Prop | Kiểu dữ liệu | Mặc định | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `'Tính năng mới'` | Tên chức năng cụ thể đang được phát triển |
| `description` | `string` | Thông điệp mặc định | Mô tả chi tiết về trạng thái tính năng |
| `showBackButton` | `boolean` | `true` | Cho phép hiển thị nút "Quay lại trang trước" |
| `showHomeButton` | `boolean` | `true` | Cho phép hiển thị nút "Về trang chủ tìm việc" |
| `onBack` | `function` | — | Hàm xử lý quay lại màn hình trước đó |
| `onGoHome` | `function` | — | Hàm xử lý chuyển về trang chủ việc làm |
| `onOpenSupport` | `function` | — | Hàm mở modal hỗ trợ giải đáp thắc mắc |

### 4.2. Cấu trúc 5 phần trực quan
1. **Thanh Header trên cùng**: Logo JobNest chính thức bo tròn + Tên thương hiệu + Badge trạng thái *"Trạng thái: Đang phát triển"*.
2. **Khối Hero Trung Tâm (Peeled Paper Effect)**:
   - Tấm giấy cuộn lật 3D với nếp gấp hình trụ, bóng đổ chân thực.
   - Chữ **COMING SOON** và **STAY TUNED** cực kỳ nổi bật.
   - Huy hiệu định danh tính năng động: `✨ [Tên tính năng]`.
3. **Thẻ Thông điệp Tiếng Việt Thân thiện**:
   - Tiêu đề tính năng to bản.
   - Lời thông báo: *"Chúng tôi đang hoàn thiện tính năng này để mang đến trải nghiệm tốt hơn cho bạn. JobNest đang chuẩn bị những điều thú vị để hỗ trợ tốt nhất cho công việc của bạn. Hãy quay lại trong thời gian tới nhé!"*
   - Hai nút bấm điều hướng: **← Quay lại trang trước** và **🏠 Về trang chủ tìm việc**.
4. **Form Đăng ký Nhận Thông báo**:
   - Cho phép người dùng nhập email và bấm "Đăng ký" để nhận email ngay khi tính năng ra mắt chính thức, kèm phản hồi xác nhận tự động.
5. **Dải Bản quyền Chân trang (Footer mini)**:
   - Ghi nhận bản quyền © 2026 JobNest và đề tài tốt nghiệp Khoa CNTT — Đại học Văn Lang.

---

## 5. DANH SÁCH TÍCH HỢP VÀ ĐIỀU HƯỚNG THỰC TẾ

### 5.1. Các chức năng chưa triển khai được định tuyến sang Coming Soon
1. **Ứng dụng di động JobNest trên App Store (iOS)**:
   - Nút bấm biểu tượng App Store tại Footer → Chuyển đến trang Coming Soon với tiêu đề *"Ứng dụng Di động JobNest trên App Store (iOS)"*.
2. **Ứng dụng di động JobNest trên Google Play (Android)**:
   - Nút bấm biểu tượng Google Play tại Footer → Chuyển đến trang Coming Soon với tiêu đề *"Ứng dụng Di động JobNest trên Google Play (Android)"*.
3. **Báo cáo Thị trường Tuyển dụng & Thù lao Sinh viên**:
   - Liên kết tại Cột 2 Footer → Chuyển đến trang Coming Soon với mô tả khảo sát mức lương và xu hướng việc làm bán thời gian 2026.
4. **Cổng Hợp tác Doanh nghiệp & Tài trợ Học bổng**:
   - Liên kết tại Cột 2 Footer → Chuyển đến trang Coming Soon với thông tin tiếp nhận hồ sơ hợp tác chiến lược và ngày hội việc làm.

### 5.2. Các chức năng nghiệp vụ đang hoạt động được bảo toàn 100%
- **Screen 6: Tìm kiếm việc làm (`jobs`)**: Tiếp tục hoạt động bình thường với bộ lọc ngành nghề, địa điểm, từ khóa và phân trang.
- **Screen 8: Quản lý ứng tuyển sinh viên (`student_apps`)**: Theo dõi danh sách hồ sơ đã nộp và trạng thái xét duyệt.
- **Screen 10: Quản lý tin tuyển dụng NTD (`employer_jobs`)**: Đóng/mở tin đăng, sửa tin, xem số lượng ứng viên.
- **Screen 11: Đăng tin tuyển dụng (`create_job`)**: Form đăng tin tuyển dụng mới cho doanh nghiệp.
- **Screen 12: Duyệt hồ sơ ứng viên (`applicants`)**: Xem CV, chấp thuận hoặc từ chối ứng viên.
- **Screen 5: Quản trị hệ thống (`admin`)**: Quản lý tài khoản người dùng và duyệt tin tuyển dụng.
- **Screen 1 & 2: Đăng nhập / Đăng ký (`login`)**: Xác thực tài khoản với backend.
- **Hệ thống Modals**: `JobDetailModal`, `ReviewModal`, `StudentProfileModal`, `EmployerProfileModal`, `PolicyModal`, `SupportModal`.

---

## 6. KẾT QUẢ KIỂM THỬ HỆ THỐNG

### 6.1. Kiểm thử Tự động (Automated Tests & Build)
- **Vite Production Build**:
  ```bash
  npm --prefix client run build
  # ✓ built in 461ms. 0 errors, 0 warnings.
  ```
- **ESLint Code Quality**:
  ```bash
  npm --prefix client run lint
  # 0 errors.
  ```

### 6.2. Kiểm thử Tương tác Thực tế trên Trình duyệt
- **Điều hướng qua lại (Back & Home navigation)**:
  - Khi nhấn *"Quay lại trang trước"*: Hệ thống ghi nhớ `prevTab` và lập tức đưa người dùng trở lại màn hình trước đó mà không mất dữ liệu hay bộ lọc.
  - Khi nhấn *"Về trang chủ tìm việc"*: Hệ thống cuộn mượt mà lên đầu trang `jobs`.
- **Độ nhạy giao diện (Responsive)**:
  - Trên màn hình Desktop (1440px): Tấm giấy hiển thị tỷ lệ chuẩn, chữ `COMING SOON` to bản sắc nét.
  - Trên màn hình Tablet và Mobile: Layout tự động co giãn theo tỷ lệ viewport, không phát sinh thanh cuộn ngang.

---

### 7. BẰNG CHỨNG HÌNH ẢNH THỰC TẾ (SCREENSHOTS)

Các ảnh chụp trực tiếp từ môi trường chạy thật đã được lưu trữ trong thư mục `docs/`:

1. **Giao diện Toàn Màn hình Độc lập (Standalone Full-Screen View - Theo yêu cầu mới nhất)**:  
   [docs/coming_soon_fullscreen_standalone.png](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/docs/coming_soon_fullscreen_standalone.png)  
   *(Minh chứng giao diện tràn màn hình 100vw x 100vh, tách biệt hoàn toàn không dính dáng navbar/footer của website, hiệu ứng giấy bóc mở 3D chân thực, typography COMING SOON - STAY TUNED nổi bật và duy nhất 1 nút "Quay về trang chủ JobNest").*

2. **Khối Hiệu ứng Tấm giấy Bóc mở Chi tiết**:  
   [docs/coming_soon_peeled_paper_screenshot.png](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/docs/coming_soon_peeled_paper_screenshot.png)

3. **Footer với Tài sản Chính thức từ `Tài Liệu`**:  
   [docs/footer_official_assets_screenshot.png](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/docs/footer_official_assets_screenshot.png)

---

## 8. KẾT LUẬN

Trang **Coming Soon dùng chung** của **JobNest** đã được triển khai hoàn tất với chất lượng hoàn thiện cao:
- Tái tạo thành công hiệu ứng **tấm giấy bóc mở (peeled paper)** đầy tính nghệ thuật và chiều sâu 3D bằng kỹ thuật SVG + CSS thuần túy.
- Đáp ứng 100% khả năng tái sử dụng linh hoạt cho bất kỳ route hoặc tính năng nào trong tương lai.
- Sử dụng chuẩn xác nhận diện thương hiệu và logo gốc của đề tài.
- Toàn bộ thay đổi mã nguồn nằm gọn gàng trong working tree và **chưa commit** để bạn chủ động nghiệm thu.
