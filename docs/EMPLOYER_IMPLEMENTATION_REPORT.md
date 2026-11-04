# BÁO CÁO TRIỂN KHAI PHÂN HỆ NHÀ TUYỂN DỤNG (EMPLOYER IMPLEMENTATION REPORT)
**Dự án:** JobNest — Hệ sinh thái Việc làm & Tuyển dụng Sinh viên  
**Phân hệ:** Cổng Nhà tuyển dụng (Employer Portal)  
**Ngày thực hiện:** 04/11/2026  
**Tham chiếu Wireframe:** `JOBNEST_Wireframe_44.drawio` (Trang `EMPLOYER (12)`)  
**Tài khoản Test:** `employer.test@vlu.edu.vn` (Mật khẩu: `password123`)

---

## 1. TỔNG QUAN KIẾN TRÚC & PHÂN TÁCH 2 KHÔNG GIAN (DUAL-SPACE ARCHITECTURE)

Hệ thống đã triển khai cấu trúc tách biệt rõ ràng 2 không gian nhằm tối ưu UX, tránh gây nhầm lẫn giữa chức năng quản trị và trải nghiệm thị trường công khai:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TRƯỜNG 1: KHÔNG GIAN QUẢN LÝ (WORKSPACE)                                   │
│ URL / Route: /employer/*                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Header tối giản: [Logo] JOBNEST [Nhà tuyển dụng] [+ Đăng tin mới]         │
│   - Bên phải: [Chuông thông báo] [Avatar] [Đăng xuất]                       │
│ • Sidebar 8 mục chuẩn Wireframe:                                            │
│   Dashboard, Profile, Verification, Jobs, Applicants,                       │
│   Proposals, Assignments, Notifications                                     │
│ • Quick Switch: Nút "Khám phá thị trường" chuyển sang Trường 2              │
│ • Footer: ĐÃ ẨN HOÀN TOÀN để tập trung 100% vào không gian làm việc.        │
└─────────────────────────────────────────────────────────────────────────────┘
                                  ▲
                                  │ (Chuyển đổi 1 chạm)
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TRƯỜNG 2: KHÔNG GIAN NGHIÊN CỨU THỊ TRƯỜNG (MARKETPLACE)                    │
│ URL / Route: /, /jobs, /jobs/:id                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Header công khai: Hiển thị đầy đủ Menu (Trang chủ, Việc làm, Danh mục)    │
│   - NÚT NỔI BẬT: [← Về trang Quản lý] đưa Employer quay về Trường 1         │
│ • Footer: HIỂN THỊ ĐẦY ĐỦ (chuẩn giao diện Guest/Student)                   │
│ • Logic Chi tiết Job (JobDetailPage):                                       │
│   - ẨN hoàn toàn nút "Ứng tuyển ngay" (vì Employer không thể tự ứng tuyển)  │
│   - Nếu Job của chính mình: Hiển thị nút "Chỉnh sửa tin này"                │
│   - Nếu Job của doanh nghiệp khác: Hiển thị nút "Xem thông tin công ty"     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DANH SÁCH 12 MÀN HÌNH EMPLOYER ĐỒNG BỘ 100% WIREFRAME

| Mã màn hình | Tên màn hình Wireframe | File triển khai | Thành phần chính & Quy tắc nghiệp vụ |
|---|---|---|---|
| **WF-E01** | **Employer Dashboard** | `EmployerDashboardPage.jsx` | 4 Thẻ KPI (`Job đã đăng`, `Application chờ xử lý`, `Proposal chờ xử lý`, `Assignment đang thực hiện`). Bảng `Application / Proposal mới` (`Student \| Loại \| Thời gian`). Hộp ghi chú nét đứt: *"Trạng thái UI / TBD: Dashboard tổng hợp, không có nghiệp vụ riêng."* |
| **WF-E02** | **Personal Profile** | `EmployerPersonalProfilePage.jsx` | **Hồ sơ cá nhân thuần túy, KHÔNG có Company Profile**. Chứa: Avatar, Display Name, Bio, Location, Email readonly, Phone readonly, nút Lưu hồ sơ (`PUT /profile/me`). Box trạng thái xác thực dẫn sang WF-E03. |
| **WF-E03** | **Verification Center** | `EmployerVerificationCenterPage.jsx` | **Màn hình riêng biệt**. Thẻ OTP Email (countdown 60s), thẻ OTP Phone (countdown 60s). Banner điều kiện: *"Phải xác minh cả Email và Phone trước khi đăng Job"*. |
| **WF-E04** | **Job List** | `EmployerJobsPage.jsx` | Danh sách tin đăng. **7 bộ lọc trạng thái**: `All`, `Draft`, `Pending`, `Published`, `Closed`, `Expired`, `Rejected`. Khi tin bị `REJECTED`, hiển thị dòng thông báo kèm `moderation_reason`. Thao tác Đóng / Mở lại tin (`PATCH /jobs/:id/status`). |
| **WF-E05** | **Create / Edit Job** | `EmployerCreateJobPage.jsx` | Form tạo/sửa tin động theo 3 hình thức: `Part-time`, `Seasonal`, `Freelance`. Validate bắt buộc `application_deadline` phải ở tương lai. Kiểm tra điều kiện tiên quyết: nếu tài khoản chưa xác minh Email/Phone, hiển thị banner cảnh báo và điều hướng sang WF-E03. |
| **WF-E06** | **Applicant Management** | `EmployerApplicantsPage.jsx` | Quản lý đơn ứng tuyển Part-time/Seasonal. **TUYỆT ĐỐI KHÔNG CÓ NÚT ACCEPT**. Các thao tác: `Xem hồ sơ (WF-E13)`, `Rút gọn (SHORTLISTED)`, `Từ chối (REJECTED)`. Nút CTA: `Tuyển chọn ứng viên chính thức (WF-E08 A3)`. |
| **WF-E07** | **Proposal Management** | `EmployerProposalsPage.jsx` | Quản lý báo giá dự án Freelance. **TUYỆT ĐỐI KHÔNG CÓ NÚT ACCEPT INLINE**. Các thao tác: `Xem xét (REVIEWING)`, `Từ chối (REJECTED)`. Nút CTA: `Tuyển chọn ứng viên (WF-E08 A3)`. |
| **WF-E08** | **Candidate Selection** | `EmployerCandidateSelectionPage.jsx` | **Tuyến duy nhất phê duyệt ứng viên và khởi tạo Work Assignment (`POST /jobs/:jobId/selections`)**. Hiển thị chỉ tiêu tuyển dụng (`quantity_required`, `Đã chọn`, `Còn lại`). Thực thi **Quy tắc A3**: Khi đủ chỉ tiêu, các ứng viên còn lại tự động chuyển sang `REJECTED`. |
| **WF-E09** | **Assignment Management** | `EmployerAssignmentsPage.jsx` | Quản lý tiến độ hợp đồng theo từng Student (`Student \| Job \| Trạng thái \| Tiến độ %`). Theo dõi trạng thái `Assignment.status` (`NOT_STARTED` -> `IN_PROGRESS` -> `COMPLETED`). Nút điều hướng sang `Nghiệm thu (WF-E10)` và `Đánh giá (WF-E11)`. |
| **WF-E10** | **Deliverable Review** | `EmployerDeliverableReviewPage.jsx` | Màn hình nghiệm thu sản phẩm bàn giao. Lịch sử các phiên bản (`v1`, `v2`), link sản phẩm demo/mã nguồn. 2 hành động: `Chấp thuận (Accept)` hoặc `Yêu cầu sửa đổi (Request Revision kèm lý do bắt buộc)`. **Quy tắc Wireframe**: Nghiệm thu sản phẩm chỉ cập nhật Deliverable, Assignment vẫn duy trì `IN_PROGRESS`. |
| **WF-E11** | **Review Student** | `EmployerReviewStudentPage.jsx` | Đánh giá sinh viên sau khi hoàn thành công việc. **Chỉ hiển thị cho các Assignment có trạng thái `COMPLETED` và chưa được đánh giá**. Chấm điểm 1-5 sao, nhận xét đóng góp, gọi `POST /reviews`. |
| **WF-E12** | **Notifications** | `EmployerNotificationsPage.jsx` | Trung tâm thông báo nhà tuyển dụng. Bộ lọc `Tất cả` / `Chưa đọc`. Bấm vào thông báo tự động đánh dấu đã đọc (`PATCH /notifications/:id/read`) và điều hướng tới đúng phân hệ liên quan (Application, Proposal, Assignment, Job). |

---

## 3. THIẾT KẾ SIDEBAR & HEADER CHUẨN 100% DRAW.IO

### 3.1. Top Header trong Trường 1 (Workspace)
- Trái: Logo tròn JobNest + Tiêu đề `JOBNEST` in đậm + Badge `Nhà tuyển dụng` + Nút `[+ Đăng tin mới]`.
- Giữa: Đã ẩn toàn bộ các link chung (Trang chủ, Việc làm, Danh mục).
- Phải: Nút Chuông thông báo (kèm số chưa đọc) + Avatar người dùng + Nút `Đăng xuất`.

### 3.2. Left Sidebar trong Trường 1 (Workspace)
- Gồm đúng 8 nút dạng thẻ chữ nhật viền đen, có icon checkbox/box chuẩn hình ảnh Wireframe `JOBNEST_Wireframe_44.drawio`:
  1. `[■] Dashboard`
  2. `[ ] Profile`
  3. `[ ] Verification`
  4. `[ ] Jobs`
  5. `[ ] Applicants`
  6. `[ ] Proposals`
  7. `[ ] Assignments`
  8. `[ ] Notifications`
- Bên dưới có nút viền nét đứt: `[🔍 Khám phá thị trường]` giúp NTD chuyển sang Trường 2 bất cứ lúc nào.

---

## 4. BẢO MẬT & PHÂN QUYỀN (ROLE GUARD)
- Đảm bảo kiểm tra nghiêm ngặt `currentUser?.token && currentUser?.role === 'EMPLOYER'`.
- Nếu tài khoản có vai trò `STUDENT` hoặc ở trạng thái Khách vãng lai (`GUEST`), hệ thống tự động hiển thị màn hình từ chối quyền truy cập (403 Forbidden) kèm nút điều hướng quay về trang chủ hoặc mở modal đăng nhập tài khoản NTD.
- Không tồn tại lỗ hổng lộ API: Mọi request nội bộ đều kèm header `Authorization: Bearer <token>`.

---

## 5. HỆ THỐNG THÔNG BÁO XUYÊN SUỐT (NOTIFICATION SYSTEM INTEGRATION)
- **Header Notification Bell:** Tích hợp bộ đếm `unread_count` lấy trực tiếp từ `GET /api/notifications` (tự động làm mới định kỳ mỗi 15 giây).
- **NotificationsDropdown:** Xem nhanh 20 thông báo, đánh dấu tất cả đã đọc qua `PATCH /api/notifications/read-all`, hoặc đánh dấu từng thông báo qua `PATCH /api/notifications/:id/read`.
- **WF-E12 Notification Center:** Cung cấp 10 bộ lọc sự kiện: `Tất cả`, `Chưa đọc`, `Đã đọc`, `Ứng tuyển`, `Đề xuất Freelance`, `Tin đăng`, `Hợp đồng`, `Nghiệm thu`, `Xác thực`, `Hệ thống`.
- **Tự động kích hoạt thông báo từ sự kiện Backend:**
  - Sinh viên nộp đơn ứng tuyển → Sinh thông báo `APPLICATION` cho NTD (`application.service.js`).
  - Sinh viên gửi báo giá Freelance → Sinh thông báo `PROPOSAL` cho NTD (`proposal.service.js`).
  - Quản trị viên duyệt/từ chối tin → Sinh thông báo `JOB` cho NTD (`admin.service.js`).
  - Tuyển chọn ứng viên (A3) → Sinh thông báo chúc mừng cho sinh viên trúng tuyển và từ chối các ứng viên khác (`selection.service.js`).
  - Cập nhật tiến độ / hoàn thành công việc → Sinh thông báo `ASSIGNMENT` (`assignment.service.js`).

---

## 6. DANH SÁCH TÀI LIỆU QUY CHUẨN XUẤT BẢN
1. `docs/EMPLOYER_UI_AUDIT_REPORT.md`
2. `docs/EMPLOYER_REQUIREMENT_TRACEABILITY.md`
3. `docs/EMPLOYER_UI_REDESIGN_PLAN.md`
4. `docs/EMPLOYER_FOOTER_ROUTE_RULES.md`
5. `docs/EMPLOYER_NOTIFICATION_REQUIREMENTS.md`
6. `docs/EMPLOYER_IMPLEMENTATION_REPORT.md`
7. `docs/EMPLOYER_TEST_REPORT.md`

---

## 7. KIẾN TRÚC FULL-VIEWPORT WIDTH (100vw) & TỐI ƯU LAYOUT

Thực hiện chuẩn hóa layout theo đúng cấu trúc Wireframe WF-E01:
1. **Header:** Chiếm 100% chiều rộng màn hình (`width: 100%`), dính ở mép trên (`position: sticky; top: 0`).
2. **Left Sidebar:** Căn sát mép trái Viewport (`left: 0`), cố định chiều rộng 260px (`border-right: 1.5px solid #E2E8F0`), chiều cao `calc(100vh - 74px)`, thanh cuộn độc lập.
3. **Main Content:** Mở rộng tự động chiếm 100% phần chiều rộng còn lại của màn hình (`width: 100%`, `maxWidth: none`, `minWidth: 0`), loại bỏ triệt để khoảng trắng lề hai bên.
4. **4 Thẻ KPI Dashboard (WF-E01):** Sử dụng CSS Grid responsive trải đều trên 1 hàng ngang duy nhất trên màn hình Desktop:
   - Desktop (>=1200px): `grid-template-columns: repeat(4, 1fr)`.
   - Tablet (641px - 1199px): `grid-template-columns: repeat(2, 1fr)`.
   - Mobile (<=640px): `grid-template-columns: 1fr`.
5. **Đồng bộ trên toàn bộ 12 màn hình:**
   - WF-E01 đến WF-E12 đều thừa hưởng cấu trúc Full-Width Layout, không còn container con giới hạn `maxWidth: 960/1100/1140` và `margin: 0 auto`.
6. **Lược bỏ nút Chuông nổi (Floating Bell):**
   - Đã loại bỏ hoàn toàn nút chuông thông báo nổi ở góc dưới bên phải màn hình trong `FloatingActions.jsx` để tránh trùng lặp với Chuông thông báo chính trên Header.