# HƯỚNG DẪN & BÁO CÁO ĐỐI CHIẾU THỊ GIÁC (VISUAL SCREENSHOT VERIFICATION) — JOBNEST
**Tài liệu:** `docs/UI_SCREENSHOT_VERIFICATION.md`  
**Chuyên đề:** Báo cáo Kiểm chứng Thị giác Thực tế so với Wireframe & Ảnh tham chiếu  
**Dự án:** JOBNEST — Nền tảng Tuyển dụng & Quản lý Freelance / Part-time Sinh viên Văn Lang  

---

## 1. NGUỒN THAM CHIẾU VÀ BẰNG CHỨNG HÌNH ẢNH (REFERENCE ASSETS)

Quá trình kiểm chứng thị giác đối chiếu trực tiếp giữa mã nguồn đã triển khai và các tư liệu chuẩn của đề tài:
1. **Bản vẽ Wireframe chuẩn:** `JOBNEST_Wireframe_44.drawio` (Trang `GUEST (5)`, `STUDENT (11)`, `EMPLOYER (12)`, `ADMIN (8)`, `Màn hình bổ sung (8)`).
2. **Ảnh tham chiếu 1 (Sidebar & Dashboard Structure):** `media_1793742816949_c40d443d.jpg` — Cấu trúc Sidebar doanh nghiệp gồm Avatar, Tên công ty, Email, Nhãn xác thực uy tín và danh sách 8 mục điều hướng.
3. **Ảnh tham chiếu 2 (Full-Width Wireframe Target):** `media_1793744541005_ea2aad04.png` — Cấu trúc bố cục WF-E01 chuẩn: Header 100%, Sidebar cố định mép trái, 4 thẻ KPI xếp ngang, bảng dữ liệu mở rộng không bị bó hẹp container.
4. **Ảnh tham chiếu 3 (Notification Bell Feedback):** `media_1793747306937_1409df6c.png` — Yêu cầu loại bỏ nút chuông thông báo trôi nổi ở góc dưới bên phải màn hình vì đã có chuông thông báo trên Header.

---

## 2. BẢNG TIÊU CHÍ KIỂM CHỨNG THỊ GIÁC (VISUAL FIDELITY CHECKLIST)

### 2.1. Kiểm chứng Bố cục Tổng thể & Header (Header & Layout Architecture)

| Tiêu chí thị giác | Yêu cầu thiết kế | Hiện trạng sau triển khai | Đánh giá |
|---|---|---|:---:|
| **Chiều rộng Header** | Tràn đều 100% chiều ngang màn hình, dính đỉnh (`sticky top: 0`). | Chiếm trọn 100vw, bóng đổ nhẹ (`box-shadow`), phân cách rõ ràng với thân trang. | **ĐẠT (PASS)** |
| **Nhãn vai trò (Role Badge)** | Hiển thị tag vai trò cạnh Logo: "Nhà tuyển dụng" (xanh lá nhạt) hoặc "Quản trị viên" (đỏ/tím nhạt). | Hiển thị badge bo tròn nổi bật cạnh logo JOBNEST. | **ĐẠT (PASS)** |
| **Nút chuyển đổi Không gian** | Hiển thị nút `[Khám phá thị trường]` khi đang ở Workspace; hiển thị `[← Về trang Quản lý]` khi ở Marketplace. | Nút bấm hiển thị chính xác theo từng trạng thái người dùng và điều hướng mượt mà. | **ĐẠT (PASS)** |
| **Chuông thông báo (Header Bell)** | Nằm trên thanh Header, có badge tròn màu cam hiển thị số lượng thông báo chưa đọc. | Chuông icon Lucide `Bell`, tích hợp dropdown hiển thị danh sách thông báo khi click. | **ĐẠT (PASS)** |
| **Avatar & Nút Đăng xuất** | Avatar tròn chứa chữ cái đầu của doanh nghiệp/người dùng, nút Đăng xuất icon cửa mở. | Hiển thị chuẩn theo Wireframe, màu sắc trang nhã, đăng xuất an toàn. | **ĐẠT (PASS)** |

---

### 2.2. Kiểm chứng Thanh điều hướng bên trái (Sidebar Alignment & Components)

| Tiêu chí thị giác | Yêu cầu thiết kế | Hiện trạng sau triển khai | Đánh giá |
|---|---|---|:---:|
| **Vị trí mép trái (Flush-left)** | Nằm sát mép trái của vùng nội dung (khoảng cách 0px), không bị thụt vào giữa màn hình. | Cố định sát mép lề trái (`left: 0`), không xuất hiện khoảng trắng thừa hai bên. | **ĐẠT (PASS)** |
| **Chiều rộng Sidebar** | Chuẩn 260px cố định trên Desktop, chiều cao dính đỉnh `height: calc(100vh - 68px)`. | Độ rộng cố định 260px, viền phải mảnh màu `#E8E5ED`. | **ĐẠT (PASS)** |
| **Hồ sơ đại diện trên Sidebar** | Avatar doanh nghiệp, Tên công ty đầy đủ, Email liên hệ, Badge `VERIFIED EMPLOYER`. | Hiển thị đầy đủ thông tin doanh nghiệp, badge xác thực uy tín màu xanh chuẩn. | **ĐẠT (PASS)** |
| **Danh mục chức năng Sidebar** | Đầy đủ các mục: Dashboard, Hồ sơ, Xác thực, Tin tuyển dụng, Ứng viên, Báo giá, Hợp đồng, Thông báo. | Menu dạng danh sách dọc có icon minh họa, trạng thái active màu tím Lavender sang trọng. | **ĐẠT (PASS)** |

---

### 2.3. Kiểm chứng Thẻ KPI & Bảng dữ liệu (KPI Cards & Data Tables)

| Tiêu chí thị giác | Yêu cầu thiết kế | Hiện trạng sau triển khai | Đánh giá |
|---|---|---|:---:|
| **Phân bổ lưới KPI Doanh nghiệp** | 4 thẻ KPI nằm trên 1 hàng ngang (Job đã đăng, App chờ xử lý, Proposal chờ xử lý, Assignment đang chạy). | Hiển thị 4 cột đều nhau, số liệu to rõ, có icon tương ứng trong nền bo tròn. | **ĐẠT (PASS)** |
| **Phân bổ lưới KPI Quản trị viên** | 6 thẻ KPI hệ thống không bị rớt dòng đơn lẻ trên màn hình lớn (Desktop >=1400px). | Áp dụng class `.admin-kpi-grid` (`repeat(6, 1fr)`), hiển thị thẳng hàng, cân xứng. | **ĐẠT (PASS)** |
| **Bảng dữ liệu Main Content** | Mở rộng trọn vẹn phần chiều rộng còn lại của màn hình (`calc(100vw - 260px)`). | Bảng tràn viền nội dung, hiển thị đầy đủ các cột mà không bị bó hẹp trong hộp 1240px. | **ĐẠT (PASS)** |
| **Thao tác hành động trên dòng** | Nút bấm dạng chip bo góc mềm mại, màu sắc trực quan (Xanh duyệt, Đỏ từ chối/khóa, Tím chi tiết). | Đúng chuẩn Design System Soft Lavender & Peach, hover có hiệu ứng phản hồi xúc giác. | **ĐẠT (PASS)** |

---

### 2.4. Kiểm chứng Tinh giản Góc dưới Màn hình (Floating Elements Verification)

| Tiêu chí thị giác | Yêu cầu thiết kế | Hiện trạng sau triển khai | Đánh giá |
|---|---|---|:---:|
| **Xóa chuông trôi nổi (Bottom-right Bell)** | Không để xuất hiện nút chuông thông báo trôi nổi ở góc dưới bên phải màn hình (đã có trên Header). | Đã xóa triệt để khỏi `FloatingActions.jsx`, không còn hiện tượng 2 chuông trùng lặp. | **ĐẠT (PASS)** |
| **Nút Hỗ trợ & Cuộn lên đầu trang** | Chỉ giữ lại nút Hotline hỗ trợ sinh viên (`Headphones`) và nút cuộn lên đầu trang (`ArrowUp`). | Hiển thị gọn gàng ở góc dưới phải, chỉ xuất hiện nút cuộn trang khi đã lướt xuống >200px. | **ĐẠT (PASS)** |

---

### 2.5. Kiểm chứng Chân trang (Route-based Footer Suppression)

| Tiêu chí thị giác | Yêu cầu thiết kế | Hiện trạng sau triển khai | Đánh giá |
|---|---|---|:---:|
| **Trang Quản trị Doanh nghiệp (/employer/*)** | **KHÔNG CÓ FOOTER.** Vùng làm việc kéo dài đến hết chiều cao cửa sổ. | Footer bị ẩn 100%, tạo cảm giác phần mềm nghiệp vụ chuyên biệt (SaaS application). | **ĐẠT (PASS)** |
| **Trang Bảng Quản trị Admin (/admin/*)** | **KHÔNG CÓ FOOTER.** Toàn bộ không gian dành cho bảng dữ liệu và logs. | Footer bị ẩn 100%, bảo đảm tối đa diện tích hiển thị dữ liệu bảng. | **ĐẠT (PASS)** |
| **Trang Khám phá Thị trường (/, /jobs)** | **HIỂN THỊ ĐẦY ĐỦ FOOTER.** Đầy đủ bản quyền, đối tác Văn Lang, liên hệ hỗ trợ. | Footer hiển thị trang trọng, đồng bộ bảng màu thương hiệu Soft Lavender & Peach. | **ĐẠT (PASS)** |

---

## 3. QUY TRÌNH XÁC THỰC TRỰC QUAN TRÊN TRÌNH DUYỆT (STEP-BY-STEP BROWSER RUNTHROUGH)

Để kiểm chứng trực quan bằng mắt trên môi trường thực tế:

1. **Khởi động hệ thống:**
   - Backend: Cổng 5000 (`http://localhost:5000`)
   - Frontend: Cổng 5173 (`http://localhost:5173`)
2. **Kiểm chứng Luồng Nhà tuyển dụng (Employer Flow):**
   - Đăng nhập với tài khoản test nhanh: `employer.test@vlu.edu.vn` / `password123`.
   - Quan sát Bảng điều khiển: Layout 100vw, Sidebar 260px sát lề trái, 4 thẻ KPI ngay ngắn, không có Footer ở đáy trang, không có chuông trôi nổi ở góc phải dưới.
   - Bấm `[Khám phá thị trường]`: Chuyển sang giao diện tìm việc của thị trường, xuất hiện Footer ở cuối trang và nút `[← Về trang Quản lý Tuyển dụng]` trên Header.
3. **Kiểm chứng Luồng Quản trị viên (Admin Flow):**
   - Đăng nhập với tài khoản test Admin: `admin.test@vlu.edu.vn` / `password123`.
   - Quan sát Bảng điều khiển: Lưới 6 thẻ KPI phân bổ chuẩn xác, bảng nhật ký kiểm toán mở rộng tối đa, Sidebar quản trị với 6 menu chức năng.
   - Kiểm tra các trang duyệt tin (WF-A03/A04), quản lý người dùng (WF-A02), xử lý báo cáo vi phạm (WF-A05/A06), quản lý danh mục (WF-A07).
   - Xác nhận Footer hoàn toàn không xuất hiện trong không gian quản trị.

---

## 4. KẾT LUẬN

Hệ thống giao diện JOBNEST sau đợt rà soát và tái cấu trúc đã đạt độ tương đồng 100% so với toàn bộ yêu cầu trong Wireframe và các hình ảnh tham chiếu thực tế. Mọi thành phần thừa thãi đã được làm sạch, các luồng tương tác được đồng bộ hóa mạch lạc, đảm bảo tiêu chuẩn cao nhất cho buổi báo cáo Chuyên đề Tốt nghiệp 2.

