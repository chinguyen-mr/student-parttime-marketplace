# JOBNEST — WIREFRAME PROGRESS TRACKER (44 MÀN HÌNH)

> **File nguồn:** `D:\Tai Lieu\DuLieuHoc\Đồ Án Tốt Nghiệp\Chuyên Đề 2\Dự án\JOBNEST_Wireframe_44.drawio`  
> **Tổng cộng:** 44 Màn hình Wireframe chuẩn hóa theo 6 Diagram.  
> **Quy tắc làm việc:** Làm tuần tự theo từng luồng (GUEST → STUDENT → EMPLOYER → ADMIN → BỔ SUNG / CHUNG), chạy test & build xác nhận, báo cáo và chờ duyệt trước khi chuyển sang màn hình tiếp theo.

---

## 1. KHÁCH VÃNG LAI (GUEST FLOW) — 8 MÀN HÌNH

| Mã WF | Tên màn hình Wireframe | Trạng thái | Ghi chú & File Component |
| :--- | :--- | :---: | :--- |
| **WF-G01** | Home (Trang chủ tìm việc) | [x] | `HomePage.jsx` (Header, Hero Search, Categories, Featured Jobs, Footer) - ĐÃ DUYỆT |
| **WF-G02** | Job Listing (Danh sách việc làm) | [x] | `App.jsx` (`activeTab === 'jobs'`, Filter panel, Skeleton, Pagination) - ĐÃ DUYỆT (PASS) |
| **WF-G03** | Job Detail (Chi tiết việc làm) | [x] | `JobDetailPage.jsx` (2 cột, Countdown Deadline, Bookmark, Apply, Footer 5 cột chuẩn) - ĐÃ DUYỆT (PASS) |
| **WF-G04** | Register (Đăng ký tài khoản Sinh viên / NTD) | [x] | `RegisterPage.jsx` (Trang riêng không Header/Footer theo mẫu tham khảo, Social auth Google/FB/LinkedIn dẫn tới Coming Soon, 2 Tab Role, Validate trường, Lỗi 409) - ĐÃ DUYỆT (PASS) |
| **WF-G05** | Login / Forgot / Reset Password | [x] | `LoginPage.jsx` (Trang riêng không Header/Footer chuẩn TopCV/Wireframe, Social auth Google/FB/LinkedIn dẫn tới Coming Soon, Nút Đăng nhập bo tròn xanh, Box Hotline, 3 State: Login 401, Quên MK, Đặt lại OTP) - HOÀN THÀNH |
| **WF-G06** | Public Employer Profile (Trang công khai NTD) | [ ] | Thông tin công ty, danh sách tin đã PUBLISHED, nút báo cáo |
| **WF-G07** | Static Pages (Giới thiệu / Liên hệ / Điều khoản) | [ ] | Trang chính sách, điều khoản bảo vệ sinh viên & liên hệ hỗ trợ |
| **WF-G08** | Registration Confirmation (Xác nhận đăng ký) | [ ] | Màn hình thông báo đăng ký thành công, CTA dẫn tới đăng nhập |

---

## 2. SINH VIÊN (STUDENT FLOW) — 12 MÀN HÌNH

| Mã WF | Tên màn hình Wireframe | Trạng thái | Ghi chú & File Component |
| :--- | :--- | :---: | :--- |
| **WF-S01** | Student Dashboard (Tổng quan sinh viên) | [x] | `StudentDashboardPage.jsx` (4 Stat KPI chuẩn WF: Application đang chờ, Assignment đang thực hiện, Việc đã hoàn thành, Thông báo chưa đọc; 2 Bảng: Assignment gần đây [Công việc / Trạng thái], Application gần đây [Job / Trạng thái]; Sub-nav 8 tabs; UI States: Loading skeleton, Error retry, Empty state + CTA tìm việc) - CHỜ DUYỆT |
| **WF-S02** | My Profile (Hồ sơ cá nhân sinh viên) | [x] | `StudentDashboardPage.jsx` (Tab Profile, Skill tags, PUT API) |
| **WF-S03** | CV Management (Quản lý hồ sơ CV) | [ ] | Tải lên PDF, xem trước CV, chọn CV mặc định |
| **WF-S04** | Saved Jobs (Việc làm đã lưu) | [x] | Đã tích hợp Tab trong `StudentDashboardPage.jsx` (LocalStorage) |
| **WF-S05** | Application History (Lịch sử ứng tuyển) | [x] | Đã tích hợp Tab trong `StudentDashboardPage.jsx` (Lọc & Hủy đơn) |
| **WF-S06** | Application Form (Form nộp đơn Part-time/Short-term) | [x] | `ApplicationModal.jsx` (Dành riêng cho PART_TIME / SEASONAL: Dropdown chọn CV, Cover letter, Hủy/Gửi, Dialog "Xác nhận gửi đơn", submit redirect sang WF-S05) - HOÀN THÀNH |
| **WF-S07** | Freelance Proposal Form (Đề xuất dự án Freelance) | [x] | `ProposalModal.jsx` (Dành riêng cho FREELANCE: Dự án, Nội dung Proposal bắt buộc, Thời gian dự kiến, Giá đề xuất, Nộp đề xuất & Hủy) - HOÀN THÀNH |
| **WF-S08** | Assignment Detail (Chi tiết công việc được giao) | [x] | `MyAssignmentsPage.jsx` (Tab 1: Chi tiết hợp đồng, Status badge, Timeline tiến độ Date — Note — Actor, Form cập nhật tiến độ, Button chuyển WF-S09) - HOÀN THÀNH |
| **WF-S09** | Deliverable Submission (Nộp sản phẩm bàn giao) | [x] | `MyAssignmentsPage.jsx` (Tab 2: Nộp sản phẩm file upload drag-and-drop, Link URL Github/Drive/Figma, Mô tả, Bảng phiên bản v1, v2 SUBMITTED/REVISION_REQUESTED) - HOÀN THÀNH |
| **WF-S10** | Reviews (Đánh giá & Phản hồi) | [x] | `StudentDashboardPage.jsx` (Chuẩn Image 3: Bảng Assignment đã hoàn thành chưa đánh giá [Công việc / Employer / Thao tác], Form Đánh giá với 5 sao interactive, Nhận xét, Nút "Gửi đánh giá", Xử lý lỗi 409 Conflict đã đánh giá) - HOÀN THÀNH |
| **WF-S11** | Notifications (Thông báo sinh viên) | [x] | `NotificationsPage.jsx` (Thông báo ứng tuyển, duyệt, lương, click mở chi tiết) - HOÀN THÀNH |
| **WF-S12** | Application / Proposal Detail (Chi tiết đơn đã gửi) | [x] | Tích hợp trong WF-S05 & WF-S08 |

---

## 3. NHÀ TUYỂN DỤNG (EMPLOYER FLOW) — 13 MÀN HÌNH (100% HOÀN TẤT & ĐÃ TỐI ƯU 2 KHÔNG GIAN)

> **✨ Tối ưu kiến trúc UX/UI — Phân tách 2 Không gian ("Trường") cho Nhà tuyển dụng:**
> - **Trường 1: Không gian Quản lý nội bộ (Workspace - `/employer/*`):** Header tối giản chuẩn WF-E01 (draw.io) với `[Logo] JOBNEST [Nhà tuyển dụng] [+ Đăng tin mới]`, Sidebar 8 mục chuẩn wireframe (`Dashboard`, `Profile`, `Verification`, `Jobs`, `Applicants`, `Proposals`, `Assignments`, `Notifications`). **ẨN HOÀN TOÀN FOOTER** để tối ưu không gian làm việc chuyên nghiệp.
> - **Trường 2: Không gian Nghiên cứu thị trường (Marketplace - `/`, `/jobs`, Chi tiết việc làm):** Giao diện tương đồng Khách/Sinh viên có hiển thị **ĐẦY ĐỦ FOOTER**, Header hiển thị nút nổi bật *"← Về trang Quản lý"* để trở về Workspace trong 1 click.
> - **Logic Chi tiết tin tuyển dụng (Job Detail):** Ẩn hoàn toàn nút *"Ứng tuyển ngay"*. Nếu là tin do chính NTD đăng sở hữu, hiển thị nút *"Chỉnh sửa tin này (Quản lý)"* dẫn trực tiếp về form sửa job trong Workspace; nếu là tin của đối tác khác, hiển thị nút *"Xem thông tin công ty"*.

| Mã WF | Tên màn hình Wireframe | Trạng thái | Ghi chú & File Component |
| :--- | :--- | :---: | :--- |
| **WF-E01** | Employer Dashboard (Tổng quan nhà tuyển dụng) | [x] | `EmployerDashboardPage.jsx` & `EmployerPortal.jsx` (Sidebar chuẩn WF-E01 8 mục chữ nhật; Top Header tối giản; 4 thẻ KPI [Job đã đăng, Application chờ xử lý, Proposal chờ xử lý, Assignment đang thực hiện]; Bảng Application / Proposal mới nhất [Student \| Loại \| Thời gian]; Hộp ghi chú nét đứt chuẩn Wireframe; Phân quyền Role Guard 403) - HOÀN THÀNH 100% |
| **WF-E02** | Personal Profile (Hồ sơ cá nhân nhà tuyển dụng) | [x] | `EmployerPersonalProfilePage.jsx` (Thuần túy hồ sơ cá nhân theo đúng Wireframe: Avatar, Display Name, Bio, Location, Email readonly, Phone readonly, nút Lưu hồ sơ; KHÔNG CÓ COMPANY PROFILE; Hộp trạng thái xác thực kèm link sang WF-E03) - HOÀN THÀNH 100% |
| **WF-E03** | Verification Center (Trung tâm xác thực tài khoản) | [x] | `EmployerVerificationCenterPage.jsx` (Màn hình riêng biệt: Xác thực OTP Email & OTP Phone kèm countdown 60s; Banner điều kiện tiên quyết: "Phải xác minh cả Email và Phone trước khi đăng Job") - HOÀN THÀNH 100% |
| **WF-E04** | Job List (Danh sách tin tuyển dụng đã đăng) | [x] | `EmployerJobsPage.jsx` (Đầy đủ 7 bộ lọc trạng thái: All, Draft, Pending, Published, Closed, Expired, Rejected; Hiển thị dòng cảnh báo kèm `moderation_reason` khi tin bị Rejected; Thao tác Đóng/Mở lại `PATCH /jobs/:id/status`) - HOÀN THÀNH 100% |
| **WF-E05** | Create / Edit Job (Đăng tin & Chỉnh sửa việc làm) | [x] | `EmployerCreateJobPage.jsx` (Form động theo 3 loại: Part-time / Seasonal / Freelance; Validate `application_deadline` bắt buộc ở tương lai; Banner cảnh báo xác thực email + phone trước khi gửi duyệt; Upload `job_banner_url`; API `POST /jobs`) - HOÀN THÀNH 100% |
| **WF-E06** | Applicant Management (Quản lý hồ sơ ứng viên Part-time) | [x] | `EmployerApplicantsPage.jsx` (TUYỆT ĐỐI KHÔNG CÓ NÚT ACCEPT inline theo Wireframe; Các thao tác: Xem hồ sơ sinh viên WF-E13, Rút gọn [SHORTLISTED], Từ chối [REJECTED]; Nút CTA điều hướng sang Tuyển chọn WF-E08) - HOÀN THÀNH 100% |
| **WF-E07** | Proposal Management (Quản lý báo giá Freelance) | [x] | `EmployerProposalsPage.jsx` (TUYỆT ĐỐI KHÔNG CÓ NÚT ACCEPT inline theo Wireframe; Các thao tác: Xem xét [REVIEWING], Từ chối [REJECTED]; Nút CTA điều hướng sang Tuyển chọn WF-E08) - HOÀN THÀNH 100% |
| **WF-E08** | Candidate Selection (Tuyển chọn ứng viên - Tuyến duy nhất A3) | [x] | `EmployerCandidateSelectionPage.jsx` (Tuyến DUY NHẤT phê duyệt ứng viên và khởi tạo Work Assignment qua `POST /jobs/:id/selections`; Hiển thị chỉ tiêu tuyển dụng; Thực thi quy tắc A3: Chọn 1 người, tự động chuyển các ứng viên còn lại sang REJECTED) - HOÀN THÀNH 100% |
| **WF-E09** | Assignment Management (Quản lý tiến độ công việc) | [x] | `EmployerAssignmentsPage.jsx` (Bảng tiến độ theo từng Student [Student \| Job \| Trạng thái \| Tiến độ %]; Theo dõi trạng thái `Assignment.status` [NOT_STARTED -> IN_PROGRESS -> COMPLETED]; Nút điều hướng sang Nghiệm thu WF-E10 và Đánh giá WF-E11) - HOÀN THÀNH 100% |
| **WF-E10** | Deliverable Review (Nghiệm thu sản phẩm bàn giao) | [x] | `EmployerDeliverableReviewPage.jsx` (Màn hình nghiệm thu chuyên biệt: Lịch sử các phiên bản v1, v2; Link demo/code; 2 hành động: Chấp thuận [Accept] hoặc Yêu cầu chỉnh sửa [Request Revision kèm lý do bắt buộc]; Nghiệm thu xong Assignment vẫn tiếp tục IN_PROGRESS) - HOÀN THÀNH 100% |
| **WF-E11** | Review Student (Đánh giá sinh viên sau công việc) | [x] | `EmployerReviewStudentPage.jsx` (Chỉ dành cho Assignment đã COMPLETED và chưa được review; Đánh giá sao tương tác 1-5 sao, nhận xét tinh thần trách nhiệm, gọi `POST /reviews`, chặn 409) - HOÀN THÀNH 100% |
| **WF-E12** | Notifications (Trung tâm Thông báo nhà tuyển dụng) | [x] | `EmployerNotificationsPage.jsx` (Danh sách thông báo NTD; Bộ lọc Tất cả / Chưa đọc; Đánh dấu đã đọc `PATCH /notifications/:id/read` và `read-all`; Click mở đúng thực thể liên quan) - HOÀN THÀNH 100% |
| **WF-E13** | Student Profile View (Xem hồ sơ ứng viên chi tiết) | [x] | `EmployerApplicantsPage.jsx` (Modal xem hồ sơ: Tên, MSSV, trường ĐH, bio, skill tags, học vấn, kinh nghiệm, nút xem CV PDF, nút chọn ứng viên) - HOÀN THÀNH 100% |

---

## 4. QUẢN TRỊ VIÊN (ADMIN FLOW) — 8 MÀN HÌNH (100% HOÀN TẤT)

> **🛡️ Phân hệ Quản trị viên (Admin Portal - `/admin`, WF-A01 đến WF-A08):**
> - **Kiến trúc Full-width Layout:** Sidebar 6 mục bám sát mép trái Viewport (`Dashboard`, `Users`, `Moderation`, `Reports`, `Categories`, `Logs`), Header tối giản nhận diện Admin. **ẨN HOÀN TOÀN FOOTER**.
> - **Phân quyền Role Guard nghiêm ngặt:** Chỉ tài khoản có `role === 'ADMIN'` mới được quyền truy cập. Chặn tuyệt đối `STUDENT` và `EMPLOYER` kèm màn hình 403 Forbidden.
> - **Bảo vệ an toàn hệ thống:** Áp dụng quy tắc kiểm tra ràng buộc không thể khóa Admin cuối cùng của hệ thống. Kiểm duyệt tin tuyển dụng bắt buộc nhập `moderation_reason` khi từ chối.

| Mã WF | Tên màn hình Wireframe | Trạng thái | Ghi chú & File Component |
| :--- | :--- | :---: | :--- |
| **WF-A01** | Admin Dashboard (Tổng quan quản trị hệ thống) | [x] | `AdminDashboardPage.jsx` & `AdminPortal.jsx` (6 Thẻ KPI: Student, Employer, Tổng Job, Tổng Application, Job chờ duyệt, Report chờ xử lý; 2 Khối phân phối: Người dùng & Job theo loại; Nhật ký hoạt động gần đây; Box note nét đứt Wireframe) - HOÀN THÀNH 100% |
| **WF-A02** | User Management (Quản lý người dùng) | [x] | `AdminUsersPage.jsx` (Tìm kiếm theo tên/email/phone; Lọc Role & Status; Bảng: ID \| Email \| Role \| Status \| Xác thực NTD \| Created \| Thao tác; Modal Khóa/Mở khóa có cảnh báo không thể khóa Admin cuối cùng; Nút cấp tick xanh VERIFIED cho NTD) - HOÀN THÀNH 100% |
| **WF-A03** | Job Moderation Queue (Hàng đợi kiểm duyệt tin đăng) | [x] | `AdminModerationPage.jsx` (Bộ lọc Loại Job: Part-time, Seasonal, Freelance; Bảng: ID \| Tiêu đề \| Loại \| Nhà tuyển dụng \| Mức lương \| Submitted_at \| Thao tác; Nút "Xem xét → A04") - HOÀN THÀNH 100% |
| **WF-A04** | Job Moderation Detail (Chi tiết duyệt tin tuyển dụng) | [x] | `AdminModerationPage.jsx` (Thông tin Job chỉ đọc: Tiêu đề, loại, lương, địa điểm, mô tả, yêu cầu; Quyết định: Phê duyệt [APPROVED], Từ chối [REJECTED - bắt buộc nhập lý do vào moderation_reason, nút Từ chối bị disable nếu chưa nhập], Quay lại) - HOÀN THÀNH 100% |
| **WF-A05** | Reports Management (Quản lý báo cáo vi phạm) | [x] | `AdminReportsPage.jsx` (Bộ lọc Status OPEN/RESOLVED, Target type JOB/USER; Bảng: Report ID \| Reporter \| Target \| Reason \| Status \| Thời gian \| Thao tác "Xử lý → A06") - HOÀN THÀNH 100% |
| **WF-A06** | Report Detail (Chi tiết xử lý vi phạm) | [x] | `AdminReportsPage.jsx` (Nội dung tố cáo, Reporter info, Target preview xem trước job/user; Bảng Lịch sử xử lý; Khung xử lý: Hành động WARNING, BAN_USER, REMOVE_JOB, DISMISS, Ghi chú; Nút Lưu xử lý, Đóng báo cáo, Quay lại) - HOÀN THÀNH 100% |
| **WF-A07** | Category Management (Quản lý ngành nghề & danh mục) | [x] | `AdminCategoriesPage.jsx` (Bảng Danh mục: ID \| Tên \| Cha \| Active \| Số tin \| Thao tác; Form Thêm/Sửa: Tên danh mục, Danh mục cha dropdown, Checkbox Active, Nút Lưu, Nút Ẩn, Nút Xóa) - HOÀN THÀNH 100% |
| **WF-A08** | Admin System Logs (Nhật ký hoạt động hệ thống) | [x] | `AdminLogsPage.jsx` (Bộ lọc Action type & Tìm kiếm; Bảng Audit Log: Timestamp \| Admin \| Action \| Target Type & ID \| Metadata) - HOÀN THÀNH 100% |

---

## 5. MÀN HÌNH CHUNG / HỆ THỐNG (SYSTEM & SHARED) — 3 MÀN HÌNH

| Mã WF | Tên màn hình Wireframe | Trạng thái | Ghi chú & File Component |
| :--- | :--- | :---: | :--- |
| **WF-X01** | Violation Report Modal (Modal báo cáo vi phạm) | [ ] | Form gửi khiếu nại/báo cáo tin lừa đảo từ màn chi tiết việc làm |
| **WF-X02** | Error Pages (Trang lỗi 404 / 403 / Hết hạn) | [ ] | Giao diện thân thiện khi không tìm thấy trang hoặc bị chặn quyền |
| **WF-X03** | Account Settings (Cài đặt tài khoản) | [ ] | Đổi mật khẩu, thiết lập thông báo, bảo mật 2 lớp |

---

## TỔNG KẾT TIẾN ĐỘ: 37 / 44 Màn hình đã hoàn thành (84.1%)
- Guest Flow: 5 / 8 màn hình
- Student Flow: 11 / 12 màn hình
- Employer Flow: 13 / 13 màn hình (100% HOÀN TẤT)
- Admin Flow: 8 / 8 màn hình (100% HOÀN TẤT)
