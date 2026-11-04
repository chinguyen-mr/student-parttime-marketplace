# BÁO CÁO TÁI THIẾT KẾ BỐ CỤC GIAO DIỆN HỆ THỐNG — JOBNEST
**Tài liệu:** `docs/UI_LAYOUT_REDESIGN_REPORT.md`  
**Chuyên đề:** Tối ưu hóa Kiến trúc Giao diện Đa phân hệ & Trải nghiệm Người dùng (UX/UI Architecture)  
**Tác giả:** Senior Frontend Architect & Senior UI/UX Engineer  
**Đối tượng áp dụng:** Phân hệ Doanh nghiệp (Employer), Quản trị viên (Admin) và Thị trường (Marketplace)  

---

## 1. BỐI CẢNH VÀ VẤN ĐỀ TRƯỚC KHI TÁI THIẾT KẾ

### 1.1. Hiện trạng kiến trúc cũ
Trước khi tối ưu, giao diện Bảng điều khiển của Nhà tuyển dụng (`EmployerPortal`) và Quản trị viên (`AdminPortal`) gặp phải một số lỗi kiến trúc layout nghiêm trọng:
1. **Container bị bóp hẹp (Centered Box Syndrome):** Khu vực nội dung làm việc nội bộ bị đặt lồng bên trong một thẻ `<main>` có giới hạn `max-width: 1240px` và căn giữa (`margin: 0 auto`). Điều này khiến hai bên màn hình xuất hiện khoảng trống lớn (whitespace lãng phí) trên các màn hình Desktop từ 1440px trở lên.
2. **Sidebar bị đẩy lệch khỏi mép màn hình:** Thanh điều hướng Sidebar không nằm sát mép trái của khung nhìn (viewport), làm mất đi cảm giác của một Bảng điều khiển nghiệp vụ (Enterprise Dashboard) chuyên nghiệp như wireframe `WF-E01` và `WF-A01`.
3. **Chân trang (Footer) hiển thị không phù hợp:** Footer chứa danh bạ liên hệ, liên kết mạng xã hội và thông tin trường đại học bị hiển thị cả trong các màn hình quản trị nội bộ (danh sách ứng viên, quản lý ca làm, bảng duyệt tin), gây rối mắt và làm gián đoạn luồng làm việc tập trung của người dùng.
4. **Trùng lặp thành phần tương tác:** Xuất hiện chuông thông báo trôi nổi (Floating Bell) ở góc dưới bên phải màn hình, trong khi trên Header đã có chuông thông báo hệ thống chính thức.

---

## 2. NGUYÊN TẮC THIẾT KẾ & KIẾN TRÚC MỚI

Nhằm đáp ứng tuyệt đối tiêu chuẩn Wireframe trong `JOBNEST_Wireframe_44.drawio` và các chỉ đạo từ Hội đồng đánh giá, kiến trúc giao diện mới được chuẩn hóa dựa trên 4 trụ cột cốt lõi:

### 2.1. Cấu trúc Full-Viewport Width (100vw Architecture)
- Chiều rộng vùng làm việc được giải phóng hoàn toàn: `maxWidth: 'none'` cho các trang Workspace.
- Layout tổng thể được cấu tạo bởi 2 cột CSS Grid hoặc Flexbox tràn viền:
  ```text
  APPLICATION CONTAINER (Width: 100vw)
  │
  ├── APPLICATION HEADER (Width: 100%, Height: 68px, Sticky Top, zIndex: 100)
  │
  └── WORKSPACE BODY (Width: 100%, Display: Flex / Grid)
      ├── ASIDE SIDEBAR (Width: 260px, Sticky Top 68px, Height: calc(100vh - 68px), Flush-left)
      └── MAIN CONTENT (Width: calc(100% - 260px), Min-width: 0, Padding: 28px 36px)
  ```
- **Không gian hiển thị dữ liệu:** Main Content tự động dãn rộng tối đa theo độ phân giải màn hình, cho phép hiển thị các bảng dữ liệu phức tạp (quản lý người dùng, hồ sơ ứng viên, báo giá Freelance) một cách trực quan, không bị cắt xén hay co rúm nội dung.

### 2.2. Tách biệt rõ ràng 2 Không gian (Dual-Zone UX Model)

| Tiêu chí so sánh | TRƯỜNG 1: KHÔNG GIAN QUẢN LÝ (WORKSPACE) | TRƯỜNG 2: KHÔNG GIAN THỊ TRƯỜNG (MARKETPLACE) |
|---|---|---|
| **Đường dẫn (Routes)** | `/employer/*`, `/admin/*` | `/`, `/jobs`, `/categories`, `/search` |
| **Mục đích sử dụng** | Quản trị nội bộ, duyệt hồ sơ, đăng tin, theo dõi hợp đồng, xử lý báo cáo vi phạm. | Khám phá thị trường việc làm, tìm kiếm việc làm part-time, xem chi tiết tin đăng công khai. |
| **Bố cục Header** | Tối giản, ẩn các link thị trường ("Trang chủ", "Việc làm", "Danh mục"). Có nút chuyển nhanh: `[Khám phá thị trường]`. | Đầy đủ menu định hướng người dùng, có nút quay về nổi bật: `[← Về Bảng Quản trị]` hoặc `[← Về Quản lý Tuyển dụng]`. |
| **Thanh điều hướng** | Sidebar chuyên dụng 260px cố định bên trái, hiển thị avatar và danh mục chức năng. | Không có Sidebar quản lý; giao diện tập trung vào bộ lọc và thẻ tin việc làm. |
| **Chân trang (Footer)** | **ẨN HOÀN TOÀN (Hidden).** Không hiển thị footer trong bất kỳ màn hình quản trị nào. | **HIỂN THỊ ĐẦY ĐỦ (Visible).** Đầy đủ thông tin liên hệ, bản quyền, chính sách và liên kết mạng xã hội. |
| **Hành động xem tin** | Employer xem tin của chính mình sẽ thấy nút `[Chỉnh sửa tin]` thay vì `[Ứng tuyển ngay]`. | Sinh viên/Khách vãng lai thấy nút `[Ứng tuyển ngay]` hoặc `[Báo giá Freelance]`. |

---

## 3. CHI TIẾT TRIỂN KHAI MÃ NGUỒN (IMPLEMENTATION DETAILS)

### 3.1. Điều phối Layout tại `App.jsx`
Trong file `04_frontend/src/App.jsx`, vùng `<main>` được điều chỉnh linh hoạt theo ngữ cảnh vai trò và tab hoạt động:
```jsx
// Xác định trạng thái không gian làm việc của Employer và Admin
const isEmployerWorkspace = (
  currentUser?.role === 'EMPLOYER' && 
  (activeTab === 'employer' || isEmployerTab(activeTab))
);

const isAdminWorkspace = (
  currentUser?.role === 'ADMIN' && 
  (activeTab === 'admin' || isAdminTab(activeTab))
);

// Áp dụng style thích ứng cho main container
<main style={{
  flex: 1,
  width: '100%',
  maxWidth: (isEmployerWorkspace || isAdminWorkspace) ? 'none' : 1240,
  margin: (isEmployerWorkspace || isAdminWorkspace) ? '0' : '0 auto',
  padding: (isEmployerWorkspace || isAdminWorkspace) ? '0' : '24px 20px',
  boxSizing: 'border-box'
}}>
  {/* Render Component tương ứng */}
</main>
```

### 3.2. Quy tắc ẩn hiện Footer theo Route (`EMPLOYER_FOOTER_ROUTE_RULES.md`)
Tại chân trang ứng dụng, logic kiểm tra điều kiện hiển thị được thực thi như sau:
```jsx
{/* FOOTER CHỈ XUẤT HIỆN Ở KHÔNG GIAN THỊ TRƯỜNG HOẶC DÀNH CHO SINH VIÊN / KHÁCH */}
{!isEmployerWorkspace && !isAdminWorkspace && (
  <Footer 
    onNavigate={handleNavigate}
    onOpenTerms={() => setTermsOpen(true)}
    onOpenPrivacy={() => setPrivacyOpen(true)}
    onOpenContact={() => setContactOpen(true)}
  />
)}
```

### 3.3. Tối ưu hệ thống nút điều hướng hai chiều trên Header
- **Khi đang ở trong Workspace:** Header hiển thị nút khám phá:
  ```jsx
  <button 
    onClick={() => setActiveTab('jobs')}
    className="market-discovery-btn"
    title="Chuyển sang xem thị trường việc làm"
  >
    <Search size={16} />
    <span>Khám phá thị trường</span>
  </button>
  ```
- **Khi đang ở ngoài Marketplace:** Header phát hiện tài khoản có quyền quản lý và hiển thị nút quay lại nổi bật:
  ```jsx
  {currentUser?.role === 'EMPLOYER' && (
    <button 
      onClick={() => setActiveTab('employer')}
      className="back-to-workspace-btn"
    >
      <ArrowLeft size={16} />
      <span>Về trang Quản lý Tuyển dụng</span>
    </button>
  )}

  {currentUser?.role === 'ADMIN' && (
    <button 
      onClick={() => setActiveTab('admin')}
      className="back-to-workspace-btn"
    >
      <ArrowLeft size={16} />
      <span>Về Bảng Quản trị Admin</span>
    </button>
  )}
  ```

### 3.4. Loại bỏ chuông thông báo trôi nổi (Duplicate Notification Cleanup)
- File `04_frontend/src/components/layout/FloatingActions.jsx` được tinh gọn chỉ giữ lại:
  1. Nút cuộn nhanh lên đầu trang (`ArrowUp`) khi cuộn quá 200px.
  2. Nút mở Trung tâm Hỗ trợ & Hotline 24/7 (`Headphones`).
- Xóa bỏ nút chuông thông báo trôi nổi ở góc phải bên dưới nhằm tránh xung đột trải nghiệm với chuông thông báo chính trên Header.

---

## 4. BẢNG SO SÁNH TRƯỚC VÀ SAU KHI TỐI ƯU

| Hạng mục kiểm tra | Trước khi tối ưu | Sau khi tối ưu hoàn thiện |
|---|---|---|
| **Độ phủ màn hình Desktop (>=1440px)** | Bị co cụm trong khung 1240px, lề trắng 2 bên >200px. | Tràn viền 100vw, Sidebar sát mép lề trái, Content co giãn tối đa. |
| **Vị trí Sidebar** | Cách mép trái một khoảng trống lớn không cần thiết. | Cố định sát mép lề trái (Flush-left 0px), dính đỉnh `top: 68px`. |
| **Khả năng hiển thị Bảng dữ liệu** | Phải cuộn ngang thường xuyên trên màn hình laptop 1366px. | Bảng dữ liệu mở rộng trọn vẹn, hiển thị đủ các cột thông tin mà không vỡ khung. |
| **Trải nghiệm phân vai (Dual-Zone UX)** | Nhầm lẫn giữa việc quản lý ứng viên và xem tin người khác. | Tách biệt hoàn toàn Không gian làm việc và Không gian nghiên cứu thị trường. |
| **Tình trạng Footer** | Xuất hiện thừa thãi bên dưới các bảng quản lý nội bộ. | Ẩn hoàn toàn trong Workspace; chỉ hiển thị khi khám phá thị trường. |
| **Tập trung thông báo** | 2 chuông thông báo (1 ở Header, 1 trôi nổi góc phải). | 1 chuông thông báo duy nhất trên Header, có badge đếm số realtime. |

---

## 5. KẾT LUẬN

Kiến trúc Layout mới đã giải quyết triệt để các tồn tại về thẩm mỹ và công năng sử dụng, đồng bộ 100% với các bản vẽ chi tiết trong `JOBNEST_Wireframe_44.drawio`. Hệ thống mang lại trải nghiệm chuyên nghiệp, mượt mà và trực quan cho tất cả các nhóm đối tượng người dùng.

