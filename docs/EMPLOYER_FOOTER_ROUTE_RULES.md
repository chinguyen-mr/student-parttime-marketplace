# QUY TẮC HIỂN THỊ FOOTER THEO ROUTE & PHÂN VÙNG HỆ THỐNG
**Tài liệu:** `docs/EMPLOYER_FOOTER_ROUTE_RULES.md`  
**Dự án:** JobNest — Nền tảng Việc làm Sinh viên  
**Tham chiếu Wireframe & Design:** `JOBNEST_Wireframe_44.drawio`, Reference Image 3 (Market Discovery), Reference Image 4 (Create Job)

---

## 1. NGUYÊN TẮC CỐT LÕI (CORE PRINCIPLES)

1. **Chỉ hiển thị Footer tại khu vực Khám phá thị trường (Market Discovery Layout):**
   - Áp dụng cho khách vãng lai (Guest), sinh viên (Student) và nhà tuyển dụng (Employer) khi đang duyệt tìm kiếm việc làm công khai.
   - Các route được phép render Footer:
     - `home` (Trang chủ tìm việc)
     - `jobs` (Danh sách việc làm công khai, tìm kiếm và lọc)
     - `categories` (Xem việc theo danh mục)
     - `search` (Trang kết quả tìm kiếm)
     - `featured_jobs` (Việc làm nổi bật)

2. **Tuyệt đối ẨN Footer tại toàn bộ khu vực Quản trị Nhà tuyển dụng (Employer Operational Layout):**
   - Footer **BỊ CHẶN HOÀN TOÀN** trên tất cả 12 màn hình nghiệp vụ từ WF-E01 đến WF-E12:
     - **WF-E01:** Employer Dashboard
     - **WF-E02:** Personal Profile
     - **WF-E03:** Verification Center
     - **WF-E04:** Job List
     - **WF-E05:** Create / Edit Job *(Đặc biệt bám sát Reference Image 4: form đăng tin chiếm toàn bộ không gian làm việc, tuyệt đối không có footer)*
     - **WF-E06:** Applicant Management
     - **WF-E07:** Proposal Management
     - **WF-E08:** Candidate Selection
     - **WF-E09:** Assignment Management
     - **WF-E10:** Deliverable Review
     - **WF-E11:** Review Student
     - **WF-E12:** Notifications

3. **Không xóa Footer khỏi dự án:**
   - Component `Footer.jsx` vẫn được lưu giữ và tái sử dụng nguyên vẹn nội dung thông tin pháp lý, bản quyền, liên kết Trường Đại học Văn Lang cho khu vực Khám phá thị trường.

---

## 2. KIẾN TRÚC ROUTE & COMPONENT CONDITIONAL RENDERING

Trong `04_frontend/src/App.jsx`:

```javascript
// 1. Nhận diện Không gian Làm việc Employer (Trường 1)
const isEmployer = Boolean(currentUser?.token && currentUser?.role === 'EMPLOYER');
const employerWorkspaceTabs = [
  'employer_dashboard',
  'employer_jobs',
  'create_job',
  'applicants',
  'employer_proposals',
  'employer_assignments',
  'employer_profile'
];
const isEmployerWorkspace = Boolean(
  isEmployer && (
    employerWorkspaceTabs.includes(activeTab) || 
    (activeTab === 'notifications' && currentUser?.role === 'EMPLOYER')
  )
);

// 2. Nhận diện Route Khám phá Thị trường (Trường 2)
const isMarketDiscoveryRoute = [
  'home',
  'jobs',
  'categories',
  'search',
  'featured_jobs'
].includes(activeTab) && !isEmployerWorkspace;

// 3. Nhận diện Màn hình Nghiệp vụ Employer (Operational Route)
const isEmployerOperationalScreen = isEmployerWorkspace || (
  currentUser?.role === 'EMPLOYER' && [
    'employer_dashboard',
    'employer_jobs',
    'create_job',
    'applicants',
    'employer_proposals',
    'employer_assignments',
    'employer_profile',
    'notifications'
  ].includes(activeTab)
);
```

### Khối render JSX:
```jsx
{/* ================= COMPREHENSIVE RESTRUCTURED FOOTER ================= */}
{/* QUY TẮC HIỂN THỊ ROUTE-BASED (FT-01 đến FT-15): CHỈ RENDER TẠI KHÁM PHÁ THỊ TRƯỜNG, TUYỆT ĐỐI ẨN TRONG EMPLOYER PORTAL */}
{!isEmployerOperationalScreen && isMarketDiscoveryRoute && (
  <Footer
    onSelectCategory={...}
    onSelectLocation={...}
    onSelectWorkType={...}
    ...
  />
)}
```

---

## 3. BẢNG MA TRẬN TEST CASE FOOTER THEO ROUTE (FT-01 ĐẾN FT-15)

| Mã kiểm thử | Tên màn hình / Route | Loại Layout | Điều kiện Role | Kết quả hiển thị Footer | Trạng thái |
|:---:|---|---|:---:|:---:|:---:|
| **FT-01** | `jobs` (Khám phá thị trường) | Market Discovery | GUEST / STUDENT / EMPLOYER | **HIỂN THỊ** | **PASS** |
| **FT-02** | `jobs?keyword=...` (Kết quả tìm kiếm) | Market Discovery | Bất kỳ | **HIỂN THỊ** | **PASS** |
| **FT-03** | `home` (Trang chủ tìm việc) | Market Discovery | Bất kỳ | **HIỂN THỊ** | **PASS** |
| **FT-04** | `employer_dashboard` (WF-E01) | Employer Operational | EMPLOYER | **ẨN HOÀN TOÀN** | **PASS** |
| **FT-05** | `employer_profile` (WF-E02) | Employer Operational | EMPLOYER | **ẨN HOÀN TOÀN** | **PASS** |
| **FT-06** | `verification` (WF-E03) | Employer Operational | EMPLOYER | **ẨN HOÀN TOÀN** | **PASS** |
| **FT-07** | `employer_jobs` (WF-E04) | Employer Operational | EMPLOYER | **ẨN HOÀN TOÀN** | **PASS** |
| **FT-08** | `create_job` (WF-E05 - Ref Image 4) | Employer Operational | EMPLOYER | **ẨN HOÀN TOÀN** | **PASS** |
| **FT-09** | `applicants` (WF-E06) | Employer Operational | EMPLOYER | **ẨN HOÀN TOÀN** | **PASS** |
| **FT-10** | `employer_proposals` (WF-E07) | Employer Operational | EMPLOYER | **ẨN HOÀN TOÀN** | **PASS** |
| **FT-11** | `selection` (WF-E08) | Employer Operational | EMPLOYER | **ẨN HOÀN TOÀN** | **PASS** |
| **FT-12** | `employer_assignments` (WF-E09) | Employer Operational | EMPLOYER | **ẨN HOÀN TOÀN** | **PASS** |
| **FT-13** | `deliverable` (WF-E10) | Employer Operational | EMPLOYER | **ẨN HOÀN TOÀN** | **PASS** |
| **FT-14** | `review_student` (WF-E11) | Employer Operational | EMPLOYER | **ẨN HOÀN TOÀN** | **PASS** |
| **FT-15** | `notifications` (WF-E12) | Employer Operational | EMPLOYER | **ẨN HOÀN TOÀN** | **PASS** |

