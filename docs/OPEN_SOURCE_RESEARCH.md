# NGHIÊN CỨU MÃ NGUỒN MỞ & THAM KHẢO THIẾT KẾ (OPEN SOURCE RESEARCH) — JOBNEST

**Dự án:** JOBNEST — Nền tảng kết nối việc làm Part-time và Freelance cho Sinh viên  
**Học phần:** Chuyên Đề 2 — Đồ Án Tốt Nghiệp  
**Vị trí:** Senior Technical Researcher & System Architect  
**Ngày thực hiện:** 02/11/2026  
**Phiên bản:** 1.0.0  

---

## 1. MỤC TIÊU NGHIÊN CỨU

Nghiên cứu các giải pháp mã nguồn mở và nền tảng tuyển dụng thực tế đã được kiểm chứng trên thế giới và tại Việt Nam, nhằm:
1. Học hỏi kiến trúc phân tầng, quản lý trạng thái, mô hình dữ liệu quan hệ và cơ chế tương tác người dùng.
2. Áp dụng chuẩn thiết kế UI/UX hiện đại (Modern Professional Marketplace), tránh giao diện generic AI hoặc thiếu tính ứng dụng thực tế.
3. Tham khảo các thực hành tốt nhất (Best Practices) về bảo mật xác thực JWT, phân quyền RBAC và kiểm soát tải bản đồ.

---

## 2. BẢNG PHÂN TÍCH CÁC DỰ ÁN MÃ NGUỒN MỞ TIÊU BIỂU

| Repository / Sản phẩm | Công nghệ cốt lõi | Chức năng & Kiến trúc tham khảo | Giấy phép (License) | Khả năng áp dụng vào JobNest |
|---|---|---|---|---|
| **Cal.com** (calcom/cal.com) | Next.js, React, Tailwind CSS, PostgreSQL | Hệ thống phân lịch phỏng vấn, booking ca làm việc, UI Design System tối giản cao cấp | AGPL-3.0 | Áp dụng tư duy thiết kế Card lịch làm việc, component Dropdown và modal xác nhận |
| **Twenty CRM** (twentyhq/twenty) | React, TypeScript, Node.js, PostgreSQL | Quản lý quan hệ ứng viên, bảng Kanban trạng thái hồ sơ, phân quyền dữ liệu chặt chẽ | AGPL-3.0 | Áp dụng mô hình Kanban kéo thả và sàng lọc trạng thái hồ sơ (`PENDING` $\rightarrow$ `ACCEPTED` $\rightarrow$ `REJECTED`) |
| **Ghost Job Board** (TryGhost/Ghost) | Node.js, Express, React, PostgreSQL | Kiến trúc phân tầng 3-tier sạch (Routes - Services - Repositories), RESTful API chuẩn | MIT | Áp dụng 100% vào kiến trúc backend Express 3-tier hiện tại của JobNest |
| **Shadcn UI** (shadcn-ui/ui) | React, Tailwind CSS, Radix UI | Hệ thống Design System không phụ thuộc thư viện đóng gói, cho phép tùy biến mã nguồn trực tiếp | MIT | Áp dụng cho các thành phần UI: Button, Modal, Dropdown, Toast, Badge |
| **TopCV / VietnamWorks** (Tham chiếu công nghiệp) | Web SPA / SSR, Google Maps API, PostgreSQL | Bố cục trang Chi tiết công việc: Bản đồ đặt tại sidebar dưới thông tin công ty, liên kết chỉ đường Google Maps | Commercial Reference | Áp dụng vị trí hiển thị chuẩn của Section "Vị trí làm việc" và cấu trúc thẻ doanh nghiệp xác thực |

---

## 3. BÀI HỌC ÁP DỤNG TRỰC TIẾP VÀO JOBNEST

### 3.1. Về Kiến trúc Backend 3 tầng (3-Tier Clean Architecture)
- Tham khảo từ chuẩn Node.js Express của Ghost và NestJS: Tách biệt hoàn toàn tầng Routing (chỉ parse request), Service (chứa toàn bộ nghiệp vụ, rule kiểm tra), và Repository (chỉ thao tác SQL với PostgreSQL qua Parameterized Queries).
- Loại bỏ hoàn toàn việc viết logic nghiệp vụ trực tiếp trong Controller hoặc truy vấn SQL trực tiếp từ Frontend.

### 3.2. Về Tương tác Bản đồ & Định vị Vị trí (Google Maps Embed)
- Tham khảo từ TopCV và Google Store Locator: Thay vì sử dụng bản đồ ảnh tĩnh hoặc custom tile thiếu đồng bộ, việc tích hợp Google Maps Embed với iframe `output=embed` mang lại:
  - Tải nhanh, không phát sinh chi phí billing hay phụ thuộc khóa API trả phí.
  - Tự động hiển thị tên đường phố tiếng Việt, nút chuyển chế độ vệ tinh, điều khiển thu phóng và ghim đỏ chuẩn mực.
  - Cho phép người dùng bấm "Chỉ đường" để mở ngay ứng dụng Google Maps trên điện thoại hoặc máy tính.

### 3.3. Về Quản lý Trạng thái Tương tác (Hover & Scroll Suppression)
- Tham khảo từ Floating UI / Radix Popper: Khi người dùng cuộn trang, bất kỳ popover nào đang mở đều phải đóng lập tức (dismissal on scroll). Khi con trỏ chuột dừng trên một phần tử sau khi cuộn, hệ thống phải kích hoạt cơ chế ức chế (suppression) để không tự ý bật lại popup cho đến khi người dùng thực hiện một cử chỉ rê chuột chủ đích (`mouseenter` mới).

---

## 4. KẾT LUẬN

Việc nghiên cứu mã nguồn mở giúp JobNest kế thừa những kiến trúc đã qua kiểm nghiệm thực tế, nâng tầm đồ án tốt nghiệp từ một bài tập sinh viên thành một sản phẩm web hoàn chỉnh, đạt chuẩn công nghiệp về cả thẩm mỹ lẫn kỹ thuật.
