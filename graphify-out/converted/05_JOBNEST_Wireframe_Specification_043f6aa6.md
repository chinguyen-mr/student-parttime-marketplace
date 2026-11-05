<!-- converted from 05_JOBNEST_Wireframe_Specification.docx -->

JOBNEST — WIREFRAME SPECIFICATION
Tên file: 05_JOBNEST_Wireframe_Specification.docx
Phiên bản: v3.3 (Bản Hợp Nhất Hoàn Chỉnh)
Ngày: 03/11/2026
Trạng thái: DRAFT — Chờ nhóm review
Phạm vi: 44 mã màn hình (36 gốc + 8 mã bổ sung/phân loại)
# MỤC LỤC
1. Quy tắc thiết kế chung
2. Design System
3. Screen Inventory (Phân loại màn hình)
4. Guest Screens (Gốc)
5. Student Screens (Gốc)
6. Employer Screens (Gốc)
7. Admin Screens (Gốc)
8. Gap Screens (Màn hình bổ sung & Phân loại)
9. Dynamic Job Form
10. Navigation & State Requirements
11. UI States
12. TBD / Missing / Ghi chú
13. Tổng kết và giới hạn xác minh
# 1. QUY TẮC THIẾT KẾ CHUNG
- Header công khai gồm logo JOBNEST, tìm kiếm, loại công việc, đăng nhập và đăng ký.
- Dashboard sau đăng nhập sử dụng sidebar theo role; không hiển thị menu trái quyền.
- Job form thay đổi trường theo job_type: PART_TIME, SEASONAL, FREELANCE.
- Freelance có Proposal, Work Assignment, Progress, Deliverable và Acceptance; không dùng form Application giống PT/SV.
- Mọi màn hình cần có các trạng thái Loading, Empty, Error, Success và Validation.
- Hỗ trợ responsive desktop/tablet/mobile web.
- CV và Deliverable chỉ được mở bởi người có quyền.
- Ẩn hoặc disable action theo role, ownership, job_type và trạng thái; backend vẫn phải kiểm tra quyền. UI không phải lớp bảo mật.
- Guest Apply/Proposal/Report redirect phải giữ return URL an toàn và quay lại đúng đối tượng sau khi đăng nhập.
# 2. DESIGN SYSTEM — ĐỀ XUẤT, CHƯA CHỐT
## 2.1. Màu sắc
| Thành phần | Giá trị đề xuất | Mục đích |
| --- | --- | --- |
| Primary | #2563EB | CTA, link, active state |
| Secondary | #10B981 | Success state |
| Warning | #F59E0B | Cảnh báo, pending |
| Danger | #EF4444 | Error, destructive action |
| Neutral | #6B7280 | Text phụ, border |
| Background | #F9FAFB | Nền |

## 2.2. Typography
| Thành phần | Giá trị đề xuất |
| --- | --- |
| Font chính | Inter hoặc Roboto |
| H1 / H2 / H3 | 32px / 24px / 18px |
| Body / Small | 14px / 12px |

## 2.3. Spacing & Layout
| Thành phần | Giá trị đề xuất |
| --- | --- |
| Spacing scale | 4px / 8px / 16px / 24px / 32px |
| Border radius | 4px cho input/button; 8px cho card |
| Desktop / Tablet / Mobile | ≥1024px; 768–1023px; <768px |

# 3. SCREEN INVENTORY (PHÂN LOẠI MÀN HÌNH)
| Nhóm | Số lượng | Mã | Phân loại trạng thái |
| --- | --- | --- | --- |
| Guest (Gốc) | 5 | WF-G01 → G05 | Nghiệp vụ chính thức |
| Student (Gốc) | 11 | WF-S01 → S11 | Nghiệp vụ chính thức |
| Employer (Gốc) | 12 | WF-E01 → E12 | Nghiệp vụ chính thức |
| Admin (Gốc) | 8 | WF-A01 → A08 | Nghiệp vụ chính thức |
| Bổ sung | 6 | G06, G07, G08, S12, E13, X01 | Màn hình Đề xuất (Chờ review) |
| Dùng chung | 1 | WF-X02 | Shared UI Template (Lỗi) |
| TBD | 1 | WF-X03 | Chưa duyệt (Chưa vào scope chính) |
| Tổng cộng | 44 mã | (36 gốc + 8 bổ sung/phân loại) |  |

# 4. GUEST SCREENS (GỐC)
## 4.1. WF-G01 — Home
Actor: Guest
UC Mapping: UC-09 — Tìm kiếm và xem Job
Purpose: Trang chủ công khai, giới thiệu nền tảng, việc làm nổi bật và tìm kiếm.
Components:
- Header: Logo JOBNEST, Search bar, Job type selector PT/SV/FL, CTA Đăng nhập/Đăng ký.
- Hero section: tiêu đề, search bar lớn gồm keyword/location/job type, CTA Tìm việc.
- Featured Jobs: grid card hiển thị Employer, Job title, salary, location, job_type.
- Categories: icon và tên category; click để lọc danh sách.
- CTA Employer: banner đăng tin miễn phí.
- Footer: Giới thiệu, Liên hệ, Điều khoản, © 2026.
- Actions: Tìm việc; Xem tất cả việc làm; Đăng ký; Đăng nhập.
- Navigation: Search/category → WF-G02; Job card → WF-G03; Register → WF-G04; Login → WF-G05.
- UI States: Loading skeleton; Empty khi chưa có Job; Error kèm retry; Success hiển thị dữ liệu.
## 4.2. WF-G02 — Job Listing
Actor: Guest / Student
UC Mapping: UC-09
Purpose: Danh sách Job công khai với tìm kiếm, lọc, sắp xếp và phân trang.
Components:
- Header như WF-G01.
- Search bar gồm keyword và nút Tìm.
- Filter panel: Job type, Category, Location, Salary range, Sort by.
- Job cards: title, employer, salary, location, posted date, job_type.
- Pagination: previous, page number, next và tổng số kết quả.
- Actions: Tìm; áp dụng/xóa filter; đổi sort; chuyển trang.
- Navigation: Click Job card → WF-G03; filter/sort/pagination → WF-G02.
- UI States: Loading skeleton; Empty kèm CTA xóa filter; Error kèm retry; Success. Filter state được giữ trong URL query params.
## 4.3. WF-G03 — Job Detail
Actor: Guest / Student
UC Mapping: UC-09
Purpose: Xem chi tiết Job trước khi ứng tuyển.
Components:
- Header như WF-G01.
- Title block: Job title, Employer name, salary, location, deadline.
- Body: Description, Requirements, Benefits và nội dung riêng theo job_type.
  - PT: schedule, hours/week.
  - SV: start/end date, schedule.
  - FL: scope, deliverable, deadline, budget.
- Side panel: Employer info và CTA phù hợp.
- Actions: Apply với PT/SV; Send Proposal với FL; Save nếu đã đăng nhập (API-D2).
- Navigation: Guest chưa login → WF-G05 rồi quay lại WF-G03; Student Apply → WF-S06; Student Proposal → WF-S07.
- UI States: Loading skeleton; 404 nếu Job không tồn tại/không công khai; Success; Expired/Closed disable CTA — G-23 TBD.
## 4.4. WF-G04 — Register
Actor: Guest
UC Mapping: UC-01
Purpose: Đăng ký tài khoản Student hoặc Individual Employer.
Components:
- Header và link Login.
- Role selector gồm Student và Individual Employer.
- Student form: Email, password, confirm password, full_name.
- Employer form: Email, password, confirm password, display_name.
- CTA Đăng ký.
- Actions: Chọn role; submit đăng ký; chuyển Login.
- Navigation: Đăng ký thành công → WF-G08 (Post-Register Confirmation).
- UI States: Validation từng trường; Loading; Error 409 email tồn tại; Error 400 validation; Success.
## 4.5. WF-G05 — Login / Forgot Password
Actor: Guest
UC Mapping: UC-02, UC-03
Purpose: Đăng nhập và khôi phục mật khẩu.
Components:
- Login view: Email, password, checkbox Ghi nhớ, nút Đăng nhập, Quên mật khẩu, Đăng ký.
- Forgot Password view: Email và Gửi yêu cầu.
- Reset Password view: Token/OTP, mật khẩu mới, xác nhận mật khẩu.
- Actions: Đăng nhập; gửi yêu cầu khôi phục; đặt lại mật khẩu; quay lại Login.
- Navigation: Login thành công → Dashboard theo role; nếu có return URL thì quay lại trang đích an toàn; Register → WF-G04.
- UI States: 401 sai thông tin; 403 tài khoản khóa; 400/410 token hết hạn/đã dùng; Loading; Success redirect Dashboard.
# 5. STUDENT SCREENS (GỐC)
## 5.1. WF-S01 — Student Dashboard
Actor: Student | UC Mapping: TBD (View tổng hợp)
Purpose: Tổng quan hoạt động Student.
Components: Sidebar; stat cards (Application đang chờ, Assignment đang thực hiện, việc đã hoàn thành, notification chưa đọc); danh sách Assignment IN_PROGRESS; Application gần đây.
Actions: Điều hướng đến Profile, CV, Saved Jobs, Application History, Notifications và Assignment.
Navigation: Dữ liệu tổng hợp từ UC-12, UC-16, UC-20.
UI States: Loading skeleton; Empty kèm CTA tìm việc; Error kèm retry.
(Lưu ý: Dashboard là aggregated view, không phải UC riêng).
## 5.2. WF-S02 — My Profile
Actor: Student | UC Mapping: UC-04
Purpose: Xem và cập nhật hồ sơ cá nhân.
Components: Avatar; Full name; Date of birth; School; Major; Bio; Skills; Education; Experience; nút Lưu thay đổi.
Actions: Cập nhật hồ sơ; thêm/xóa Skill, Education, Experience; upload Avatar.
Navigation: Lưu hồ sơ qua chức năng Profile.
UI States: Loading; Validation; Success toast; Error.
TBD: S1 — Certificate section chưa được quyết định thêm/bỏ.
## 5.3. WF-S03 — CV Management
Actor: Student | UC Mapping: UC-04
Purpose: Quản lý danh sách CV.
Components: CV cards gồm filename, upload date, badge Mặc định; action Đặt làm mặc định/Xóa; Upload CV mới và progress bar.
Actions: Upload; đặt mặc định; xóa CV.
Navigation: Các thao tác CV theo API tương ứng.
UI States: Loading; Empty kèm CTA upload; Success; Error upload.
TBD: API-D1 chưa duyệt; MIME/size limit chưa chốt; T2 chưa migrate.
## 5.4. WF-S04 — Saved Jobs
Actor: Student | UC Mapping: UC-10
Purpose: Xem danh sách Job đã lưu.
Components: Job cards gồm title, Employer, salary, location, badge CLOSED/EXPIRED nếu được hiển thị; action Bỏ lưu.
Actions: Bỏ lưu; Xem chi tiết.
Navigation: Xem chi tiết → WF-G03.
UI States: Loading; Empty kèm CTA tìm việc.
TBD: API-D2 chưa duyệt; chưa quyết định Job CLOSED có hiển thị trong danh sách hay không.
## 5.5. WF-S05 — Application History
Actor: Student | UC Mapping: UC-12
Purpose: Xem lịch sử ứng tuyển.
Components: Status filter; Application cards gồm Job title, Employer, submitted_at, status badge; Xem chi tiết; Rút đơn nếu được phép.
Actions: Xem chi tiết; Rút đơn; lọc status.
Navigation: Xem chi tiết → WF-S12.
UI States: Loading; Empty; trạng thái theo Application.
TBD: API-D3 history chưa duyệt; API-D4 withdraw chưa duyệt; S2 withdrawal policy chưa chốt.
## 5.6. WF-S06 — Application Form
Actor: Student | UC Mapping: UC-11
Purpose: Nộp đơn ứng tuyển PT/SV.
Components: Job title; CV selector; Cover letter; nút Gửi đơn; confirm dialog.
Actions: Gửi đơn; Hủy.
Navigation: Thành công → WF-S05.
UI States: Validation CV hoặc Cover letter theo G-28; Loading; Error; Success toast.
Giới hạn: Chỉ hiển thị với Job PART_TIME/SEASONAL.
## 5.7. WF-S07 — Freelance Proposal Form
Actor: Student | UC Mapping: UC-13
Purpose: Gửi Proposal cho Job Freelance.
Components: Job title; proposal_text; estimated_duration; proposed_price nếu field được bật; nút Gửi đề xuất.
Actions: Gửi đề xuất; Hủy.
Navigation: Sau khi gửi thành công → WF-S12.
UI States: Validation proposal_text bắt buộc; Loading; Success; Error.
Giới hạn: Chỉ hiển thị với Job FREELANCE.
TBD: proposed_price/estimated_duration bật/tắt theo quyết định chưa chốt.
## 5.8. WF-S08 — Assignment Detail
Actor: Student | UC Mapping: UC-16
Purpose: Xem và cập nhật tiến độ Assignment.
Components: Job title; Employer name; Assignment status; progress timeline gồm ngày, mô tả, actor; action Cập nhật tiến độ.
Actions: Mở form cập nhật progress. Không có action chuyển trạng thái Assignment trực tiếp.
Navigation: Xem Assignment detail và progress history.
UI States: Loading; Empty khi chưa có progress; Error.
TBD: G-06 actor được phép cập nhật progress; G-58 history nằm trong detail hay endpoint riêng. Assignment status không đồng nghĩa Job status.
## 5.9. WF-S09 — Deliverable Submission
Actor: Student | UC Mapping: UC-17
Purpose: Gửi sản phẩm bàn giao cho Employer.
Components: Assignment title; current version; file upload hoặc link; description; version history; nút Gửi bàn giao.
Actions: Gửi bàn giao; Hủy.
Navigation: Sau submit, hiển thị version mới.
UI States: Upload progress; Validation file; Success; Error.
TBD: API-D6 danh sách version chưa duyệt; MIME/size chưa chốt. Mỗi lần gửi tạo version mới, không ghi đè.
## 5.10. WF-S10 — Reviews
Actor: Student | UC Mapping: UC-19
Purpose: Đánh giá Employer sau khi Assignment COMPLETED.
Components: Danh sách Assignment COMPLETED chưa đánh giá; rating; comment.
Actions: Gửi đánh giá; xem đánh giá đã tạo.
Navigation: Review gắn với Assignment đã COMPLETED.
UI States: Loading; Empty; Error 409 nếu đã đánh giá.
TBD: C10 rating scale; G-41 comment required/optional; G-42 comment max length.
## 5.11. WF-S11 — Notifications
Actor: Student | UC Mapping: UC-20
Purpose: Xem và đánh dấu thông báo.
Components: Notification cards gồm title, body tóm tắt, thời gian, trạng thái đọc.
Actions: Click notification để mark read và điều hướng; Đánh dấu tất cả đã đọc nếu hỗ trợ.
Navigation: Theo target của notification.
UI States: Loading; Empty; Error.
TBD: C3 notification triggers; G-07 pagination/sort; G-43 mark-read idempotency; G-44 delete policy.
# 6. EMPLOYER SCREENS (GỐC)
## 6.1. WF-E01 — Employer Dashboard
Actor: Individual Employer | UC Mapping: UC-07, UC-12, UC-14, UC-16; view tổng hợp.
Purpose: Tổng quan hoạt động Employer.
Components: Sidebar; stat cards; Job gần đây; Application/Proposal; Assignment đang thực hiện; notification.
Actions: Điều hướng đến Job, Applicant, Proposal, Assignment và Notification.
Navigation: Dữ liệu tổng hợp từ các chức năng liên quan.
UI States: Loading; Empty; Error.
## 6.2. WF-E02 — Personal Profile
Actor: Individual Employer | UC Mapping: UC-05
Purpose: Xem và cập nhật hồ sơ cá nhân Employer.
Components: Avatar; display_name; bio; location; email; phone; verification status.
Actions: Cập nhật thông tin hồ sơ được phép.
Navigation: Profile management.
UI States: Loading; Validation; Success; Error. Email/phone và verified status hiển thị read-only; backend chặn thay đổi trái phép.
## 6.3. WF-E03 — Verification Center
Actor: Individual Employer | UC Mapping: UC-06
Purpose: Xác minh email và số điện thoại.
Components: Email verification; Phone verification; OTP input; trạng thái xác minh.
Actions: Gửi OTP; xác minh OTP.
Navigation: Sau khi hoàn tất cả hai xác minh, Employer đủ điều kiện đăng Job.
UI States: Loading; Validation; Success; Error.
TBD: Provider chưa chọn; G-15 OTP expiry; G-16 rate limit.
## 6.4. WF-E04 — Job List
Actor: Individual Employer | UC Mapping: UC-07
Purpose: Quản lý danh sách Job của Employer.
Components: Tabs All, Draft, Pending, Published, Closed, Expired, Rejected; bảng/card Job; thông tin trạng thái và moderation_reason.
Actions: Xem Job; tạo Job; sửa Job; đóng Job; xem lý do từ chối.
Navigation: Create/Edit → WF-E05.
UI States: Loading; Empty; Error; Success. Job REJECTED phải hiển thị moderation_reason theo B5 fixed.
## 6.5. WF-E05 — Create/Edit Job
Actor: Individual Employer | UC Mapping: UC-07
Purpose: Tạo hoặc sửa Job với form động theo job_type.
Components: Job type selector; trường chung; trường PT/SV/FL; quantity_required; deliverable requirements và revision policy đối với FL.
Actions: Lưu nháp; Xem trước; Gửi duyệt; Hủy.
Navigation: Lưu nháp → DRAFT; Gửi duyệt → PENDING_REVIEW.
UI States: Validation; Loading; Success; Error.
TBD: S6 salary/budget rules; C10 revision_limit.
## 6.6. WF-E06 — Applicant Management
Actor: Individual Employer | UC Mapping: UC-12
Purpose: Quản lý Applicant cho Job PT/SV.
Components: Applicant list; Student information; Application status; filter; link xem hồ sơ/CV (dẫn đến WF-E13).
Actions: Xem Applicant; Cập nhật trạng thái (Chỉ theo transition của Lifecycle, KHÔNG set ACCEPTED); Chuyển sang Candidate Selection.
Navigation: Candidate Selection → WF-E08.
UI States: Loading; Empty; Error.
A3: Không có action Accept trực tiếp trên màn hình này.
## 6.7. WF-E07 — Proposal Management
Actor: Individual Employer | UC Mapping: UC-14
Purpose: Quản lý Proposal cho Job Freelance.
Components: Proposal list; Student; proposal content; estimated duration; proposed price; status.
Actions: Xem Proposal; Cập nhật trạng thái (Chỉ theo transition của Lifecycle, KHÔNG set ACCEPTED); Chuyển sang Candidate Selection.
Navigation: Candidate Selection → WF-E08.
UI States: Loading; Empty; Error.
A3: Không có action Accept trực tiếp trên màn hình này.
## 6.8. WF-E08 — Candidate Selection
Actor: Individual Employer | UC Mapping: UC-15
Purpose: Chọn ứng viên và tạo Work Assignment.
Components: Danh sách ứng viên được chọn; số lượng đã chọn; quantity_required; trạng thái chỉ tiêu.
Actions: Chọn ứng viên; xác nhận selection.
Navigation: Gọi POST /jobs/:jobId/selections; tạo Assignment cho từng Student được chọn.
UI States: Loading; Validation khi vượt quantity; Error; Success.
A3: Đây là màn hình duy nhất thực hiện selection và tạo Assignment.
## 6.9. WF-E09 — Assignment Management
Actor: Individual Employer | UC Mapping: UC-16
Purpose: Quản lý các Assignment đã tạo.
Components: Danh sách Assignment; Student; Job; Assignment status riêng; progress timeline.
Actions: Xem Assignment; theo dõi progress.
Navigation: Mỗi Student có Work Assignment riêng.
UI States: Loading; Empty; Error. Job status không thay thế Assignment status.
Nghiệp vụ TBD: Quy trình, điều kiện và Actor xác nhận hoàn thành Assignment đang chờ quyết định (phụ thuộc T1/M1). Không tự mặc định Employer là người xác nhận.
## 6.10. WF-E10 — Deliverable Review
Actor: Individual Employer | UC Mapping: UC-17
Purpose: Xem và nghiệm thu Deliverable.
Components: Assignment; Student; current version; file/link; description; version history; Accept; Request Revision; comment field.
Actions: Accept; Request Revision kèm comment bắt buộc.
Navigation: Quyết định áp dụng lên Deliverable.
UI States: Loading; Validation comment; Error 403 nếu không phải owner; Success.
Lưu ý: Accept hoặc Request Revision không tự chuyển Assignment state. Assignment vẫn IN_PROGRESS sau cả hai action.
## 6.11. WF-E11 — Review Student
Actor: Individual Employer | UC Mapping: UC-19
Purpose: Đánh giá Student sau khi Assignment COMPLETED.
Components: Assignment COMPLETED chưa đánh giá; rating; comment.
Actions: Gửi review; xem review đã tạo.
Navigation: Review gắn với Assignment đã COMPLETED.
UI States: Loading; Empty; Error.
TBD: C10 rating scale; G-41 comment required; G-42 max length.
## 6.12. WF-E12 — Notifications
Actor: Individual Employer | UC Mapping: UC-20
Purpose: Xem thông báo Employer.
Components: Notification list tương tự WF-S11.
Actions: Click notification để mark read và điều hướng; đánh dấu tất cả đã đọc.
Navigation: Theo target của notification.
UI States: Loading; Empty; Error.
TBD: C3, G-07, G-43.
# 7. ADMIN SCREENS (GỐC)
## 7.1. WF-A01 — Admin Dashboard
Actor: Admin | UC Mapping: UC-21, UC-22, FR-40
Purpose: Tổng quan hệ thống.
Components: Sidebar; stat cards (User, Job, Application, Job pending, Report chờ); chart tùy chọn.
Actions: Điều hướng đến Users, Moderation, Reports, Categories, Logs.
UI States: Loading; Error.
TBD: G-49 FR-40; G-50 /admin/stats; G-51 metrics.
## 7.2. WF-A02 — User Management
Actor: Admin | UC Mapping: UC-21
Purpose: Quản lý tài khoản.
Components: Filter Role/Status; bảng ID, Email, Role, Status, Created, Action Lock/Unlock.
Actions: Search/filter; Lock/Unlock; xác nhận thao tác và ghi audit log.
UI States: Loading; Empty; Error 403.
Lưu ý: Không thể khóa Admin cuối cùng; C6 TBD; API-D7 chưa duyệt.
## 7.3. WF-A03 — Job Moderation Queue
Actor: Admin | UC Mapping: UC-08
Purpose: Danh sách Job chờ kiểm duyệt.
Components: Filter Job type; bảng Job title, Employer, Type, Submitted_at, action Xem xét.
Actions: Xem xét; filter job_type.
Navigation: Xem xét → WF-A04.
UI States: Loading; Empty; Error.
TBD: C9 moderation policy.
## 7.4. WF-A04 — Job Moderation Detail
Actor: Admin | UC Mapping: UC-08
Purpose: Duyệt hoặc từ chối Job.
Components: Toàn bộ nội dung Job ở chế độ view-only; Duyệt; Từ chối; trường nhập lý do.
Actions: Approve; Reject kèm reason.
Navigation: Sau xử lý quay lại WF-A03.
UI States: Validation reason bắt buộc khi Reject; Loading; Success; Error.
## 7.5. WF-A05 — Reports
Actor: Admin | UC Mapping: UC-22
Purpose: Danh sách báo cáo vi phạm.
Components: Filter Status/Target type; bảng Report ID, Reporter, Target, Reason, Status, Action.
Actions: Xem chi tiết; filter.
Navigation: Xem chi tiết → WF-A06.
UI States: Loading; Empty; Error.
TBD: API-D10 POST /reports; G-48 report status.
## 7.6. WF-A06 — Report Detail
Actor: Admin | UC Mapping: UC-22
Purpose: Xử lý báo cáo.
Components: Report content; target preview; reporter info; action history; action form.
Actions: Chọn action; nhập note; đóng report nếu phù hợp.
Navigation: Trở lại danh sách Reports.
UI States: Loading; Validation action required; Error.
TBD: G-48 action enum; G-51 transition rule; C3 notification reporter.
## 7.7. WF-A07 — Category Management
Actor: Admin | UC Mapping: UC-21
Purpose: CRUD danh mục công việc.
Components: Bảng Name, Parent, Active, Action.
Actions: Tạo mới; sửa; ẩn; xóa theo policy.
Navigation: Quản lý Category.
UI States: Loading; Empty; Error.
TBD: API-D8; G-46 parent-child; delete policy; S5 public categories route.
## 7.8. WF-A08 — Admin Logs
Actor: Admin | UC Mapping: FR-40
Purpose: Nhật ký hoạt động quản trị.
Components: Filter Admin, Action type, Date range; bảng Timestamp, Admin, Action, Target, Metadata.
Actions: Filter; xem chi tiết nếu cần.
Navigation: Admin Logs.
UI States: Loading; Empty; Error.
TBD: G-49 FR-40; G-50 /admin/logs; G-51 retention policy.
# 8. GAP SCREENS (MÀN HÌNH BỔ SUNG & PHÂN LOẠI)
## 8.1. WF-G06 — Employer Public Page
Phân loại: Màn hình Đề xuất.
Purpose: Xem thông tin công khai của Nhà tuyển dụng.
Components: Header; Profile Info; Verification Badges (Email/SĐT); Job List.
Navigation: Từ WF-G03 click tên Employer.
TBD: Cần xác nhận thông tin xác minh nào được công khai.
## 8.2. WF-G07 — Static Pages (About/Contact/Terms)
Phân loại: Màn hình Đề xuất.
Purpose: Cung cấp thông tin tĩnh.
Components: Header/Footer chuẩn; Main Content (Text).
Lưu ý: Form liên hệ cần TBD vì chưa có chức năng xác nhận.
## 8.3. WF-G08 — Post-Register Confirmation
Phân loại: Màn hình Đề xuất.
Purpose: Thông báo đăng ký thành công.
Lưu ý: Là màn hình đích duy nhất sau khi đăng ký thành công từ WF-G04.
## 8.4. WF-S12 — Application / Proposal Detail
Phân loại: Màn hình Đề xuất.
Purpose: Xem chi tiết nội dung đã nộp và lịch sử trạng thái.
Components: Job Context; Submitted Data; Status Timeline; Nút Rút đơn (nếu được phép).
Đặc tả chi tiết:
- Application (PT/SV): Hiển thị CV, Cover Letter. Lịch sử trạng thái theo đúng mô hình Application Lifecycle. Hành động rút đơn (S2).
- Proposal (Freelance): Hiển thị Proposal text, Giá đề xuất (proposed_price) và Thời gian dự kiến (estimated_duration) nếu các trường này được bật. Lịch sử trạng thái theo đúng mô hình Proposal Lifecycle. Hành động rút Proposal (S3).
- Lưu ý: Tuyệt đối không tự tạo hoặc đưa thêm enum trạng thái mới nếu chưa có trong State Model.
## 8.5. WF-E13 — Student Profile View
Phân loại: Màn hình Đề xuất.
Purpose: Employer xem chi tiết hồ sơ của Student.
Lưu ý: Employer chỉ được xem CV/hồ sơ trong phạm vi Job mà họ đang xét duyệt ứng viên. Backend phải xác thực quyền truy cập, không chỉ ẩn nút trên giao diện.
## 8.6. WF-X01 — Report Form (Báo cáo vi phạm)
Phân loại: Màn hình Đề xuất.
Actor: Student / Individual Employer.
Điều kiện truy cập: Guest phải đăng nhập.
Navigation: Guest bấm Report từ WF-G03 → chuyển sang WF-G05 (Login). Sau khi login thành công, quay lại WF-X01 với đúng target_id (không quay về WF-G03).
Lưu ý: API-D10 chưa duyệt.
## 8.7. WF-X02 — Error Pages (404 / 403 / Expired)
Phân loại: Shared UI Template / State.
Purpose: Hiển thị thông báo lỗi. Các trạng thái này đã được định nghĩa trong tài liệu gốc.
## 8.8. WF-X03 — Account Settings
Phân loại: TBD (Chưa chốt).
Purpose: Cài đặt tài khoản.
Lưu ý: Chưa nên chốt. Xung đột với quy tắc WF-E02 (Email/Phone read-only). Cần chờ nhóm chốt quy trình xác minh UC-06.
# 9. DYNAMIC JOB FORM — WF-E05
Actor: Employer | UC Mapping: UC-07
| Field | Part-time | Seasonal | Freelance |
| --- | --- | --- | --- |
| Title / Description | Required | Required | Required |
| Location / Remote | Required | Required | On-site / Remote / Hybrid |
| Pay / Budget | Hourly / shift / day | Hourly / day / whole period | Project budget |
| Work schedule | Required | Required | Optional |
| Start/end dates | Optional | Required | Deadline required |
| Quantity required | Required (≥1) | Required (≥1) | Required (≥1) |
| Deliverable requirements | — | — | Required |
| Revision policy | — | — | TBD (C10) |

Actions chung: Lưu nháp → DRAFT; Xem trước; Gửi duyệt → PENDING_REVIEW; Hủy.
Lưu ý: S6 TBD quy tắc salary/budget; C10 TBD revision_limit. Backend phải validate theo job_type.
# 10. NAVIGATION & STATE REQUIREMENTS
## 10.1. Quy tắc navigation chung
- Guest Job Detail chưa đăng nhập: Apply/Proposal → Login → quay lại đúng Job Detail bằng return URL an toàn.
- Student chỉ Apply với PT/SV; chỉ Send Proposal với FL.
- Employer Candidate Selection hiển thị số lượng đã chọn và quantity_required; disable khi hết chỉ tiêu.
- Employer Assignment Detail hiển thị từng Student và status riêng; không lấy Job.status làm Assignment.status.
- Freelance Deliverable Review có hai action: Accept hoặc Request Revision; Request Revision bắt buộc comment.
- Admin từ chối Job phải nhập lý do.
- Pending/Rejected không xuất hiện public theo quy tắc nguồn.
- Empty state có CTA; Error state có retry; Validation đặt gần trường.
- Ẩn/disable action theo role, ownership, job_type, trạng thái; backend vẫn phải kiểm tra lại.
- Guest Apply/Proposal redirect phải giữ return URL an toàn.
## 10.2. A3 — Selection là đường duy nhất để tuyển
- WF-E06 Applicant Management không có action Accept trực tiếp.
- Chỉ WF-E08 Candidate Selection được gọi POST /jobs/:jobId/selections.
- WF-E07 Proposal Management không có nút Accept trực tiếp; nếu cần thì điều hướng sang WF-E08.
## 10.3. Assignment và Job status
- WF-E09 hiển thị status riêng của từng Assignment.
- Job status không đại diện Assignment status.
- Job có thể PUBLISHED trong khi Assignment ở IN_PROGRESS hoặc COMPLETED.
## 10.4. Deliverable lifecycle
- WF-E10 Request Revision không chuyển Assignment sang REVISION_REQUESTED; chỉ Deliverable chuyển trạng thái.
- Assignment vẫn IN_PROGRESS sau cả Accept và Request Revision.
# 11. UI STATES
Mỗi màn hình cần xem xét các trạng thái tối thiểu sau:
| State | Mô tả | Hiển thị |
| --- | --- | --- |
| Loading | Đang tải dữ liệu | Skeleton hoặc spinner |
| Empty | Không có dữ liệu | Message và CTA phù hợp |
| Error | Lỗi tải/xử lý | Message lỗi và retry |
| Success | Hành động thành công | Toast/snackbar |
| Validation error | Dữ liệu không hợp lệ | Inline error |
| Unauthorized | 401 — chưa đăng nhập | Redirect Login hoặc message |
| Forbidden | 403 — không có quyền | Message không có quyền |
| Expired/Closed | Job/Assignment đóng | Disable action và badge |
| Not Found | 404 | Message không tìm thấy |

Yêu cầu chi tiết:
- Loading: skeleton cho card/list; spinner cho button submit.
- Empty: message có ngữ cảnh và CTA.
- Error: message cụ thể và retry; không hiển thị stack trace.
- Success: toast ngắn gọn, auto-dismiss 3–5 giây.
- Validation: realtime hoặc on-submit; lỗi dưới trường.
- Unauthorized: redirect sau khi lưu return URL.
- Forbidden: không redirect; hiển thị message tại chỗ.
- Expired/Closed: UI state và disable action; backend vẫn kiểm tra.
- Responsive: Desktop ≥1024px; Tablet 768–1023px; Mobile <768px.
# 12. TBD / MISSING / GHI CHÚ
## 12.1. TBD liên quan màn hình
| Mã | Nội dung | Màn hình liên quan |
| --- | --- | --- |
| G-06 | Actor cập nhật progress | WF-S08, WF-E09 |
| G-07 | Notification pagination/sort | WF-S11, WF-E12 |
| G-15 | OTP expiry | WF-E03 |
| G-16 | OTP rate limit | WF-E03 |
| G-21 | Sort default Job list | WF-G02 |
| G-23 | Job CLOSED/EXPIRED display | WF-G03 |
| G-28 | CV required/optional | WF-S06 |
| G-29 | Application filter spec | WF-E06 |
| G-32 | Proposal detail API | WF-E07 |
| G-33 | Proposal transition rule | WF-E07 |
| G-41 | Review comment required/optional | WF-S10, WF-E11 |
| G-42 | Review comment max length | WF-S10, WF-E11 |
| G-43 | Mark-read idempotency | WF-S11, WF-E12 |
| G-44 | Notification delete policy | WF-S11, WF-E12 |
| G-46 | Category parent-child | WF-A07 |
| G-48 | Report status/action enum | WF-A05, WF-A06 |
| G-49 | FR-40 chưa có UC riêng | WF-A01, WF-A08 |
| G-50 | Admin dashboard/logs API | WF-A01, WF-A08 |
| G-51 | Dashboard metric/log retention | WF-A01, WF-A08 |
| G-58 | Assignment history endpoint | WF-S08, WF-E09 |
| G-59 | Complete idempotency | WF-E09 |
| C3 | Notification trigger list | WF-S11, WF-E12 |
| C6 | Quy trình cấp Admin | WF-A02 |
| C9 | Moderation policy | WF-A03, WF-A04 |
| C10 | Rating scale + revision limit | WF-S10, WF-E11, WF-E05 |
| S1 | Certificate CRUD | WF-S02 |
| S2 | Withdraw Application | WF-S05 |
| S3 | Withdraw Proposal | WF-S12 |
| S4 | PB-32 split | WF-A02, WF-A07, WF-A08 |
| S5 | Route categories | WF-A07, WF-G01/G02 |
| S6 | Salary/budget CHECK | WF-E05 |

## 12.2. API-D chưa duyệt liên quan màn hình
| API-D | Endpoint/chức năng | Màn hình |
| --- | --- | --- |
| API-D1 | CV Management | WF-S03 |
| API-D2 | Saved Jobs | WF-S04 |
| API-D3 | Application history | WF-S05 |
| API-D4 | Withdraw Application | WF-S05 |
| API-D5 | Withdraw Proposal | WF-S12 |
| API-D6 | Deliverable list | WF-S09, WF-E10 |
| API-D7 | Admin User Management | WF-A02 |
| API-D8 | Admin Category Management | WF-A07 |
| API-D9 | Public Categories | WF-G01, WF-G02 |
| API-D10 | Submit Report | WF-X01 |
| — | Admin stats/logs | WF-A01, WF-A08 |

# 13. TỔNG KẾT VÀ GIỚI HẠN XÁC MINH
## 13.1. Phân bố màn hình
- 36 màn hình gốc: Đã đặc tả đầy đủ chi tiết.
- 6 màn hình bổ sung: Đã phân loại rõ (Đề xuất/Chờ review).
- 1 Shared Template (WF-X02): Không đếm vào chức năng nghiệp vụ.
- 1 TBD (WF-X03): Cần chờ chốt quy trình xác minh.
- (Tổng cộng 44 mã màn hình được quản lý trong tài liệu).
## 13.2. Các điểm cần giữ nguyên
- Design System là đề xuất, chưa chốt.
- File Draw.io gốc chưa được chỉnh trực tiếp theo đặc tả này.
- Dashboard Student và Employer là view tổng hợp, không phải UC riêng.
- Tất cả TBD/Missing giữ nguyên trạng thái mở. Không tự bổ sung quyết định nghiệp vụ.
- Candidate Selection là màn hình duy nhất thực hiện selection theo A3.
- Revision không làm thay đổi Assignment state.
- Admin Reject bắt buộc có reason.
- Backend authorization vẫn phải được thực hiện; UI hide/disable không thay thế kiểm tra quyền phía server.
## 13.3. Giới hạn xác minh
Đây là Wireframe Specification dạng văn bản, không phải bộ hình wireframe trực quan. Nhóm cần vẽ hình bằng Figma/Draw.io dựa trên đặc tả này và tuân thủ navigation, UI states, A3 enforcement.
# KẾT THÚC FILE 05 — JOBNEST WIREFRAME SPECIFICATION v3.3