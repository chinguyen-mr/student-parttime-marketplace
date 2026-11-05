<!-- converted from 01_JOBNEST_Project_Overview.docx -->

JOBNEST — PROJECT OVERVIEW
| Thuộc tính | Giá trị |
| --- | --- |
| Tên file | 01_JOBNEST_Project_Overview.docx |
| Phiên bản | v2.1 + Phase 1 Rev.6 (Proposal — chưa áp dụng chính thức) — Revision 2: đối chiếu liên file |
| Ngày | 03/11/2026 |
| Trạng thái | DRAFT — chờ nhóm rà soát; chưa Approved |
| Nguồn đối chiếu | File 02 (Backlog Rev 3.1), 03 (SRS v1.2), 04 (Use Case v1.0), 05 (Wireframe v3.3), 06 (API Contract), 07 (Database/ERD), 08 (Test Plan Workbook) |
| Quy ước nhãn | [ĐỀ XUẤT – chờ duyệt]: nội dung mới do biên soạn đề xuất, chưa được nhóm phê duyệt. TBD: chưa có quyết định, không tự điền giá trị. |

Mục lục: 1. Bối cảnh và vấn đề · 2. Mục tiêu cốt lõi · 3. Phạm vi · 4. Actor và các bên liên quan · 5. Nền tảng công nghệ · 6. Tổng quan quy trình nghiệp vụ · 7. Giả định, ràng buộc và rủi ro · 8. TBD / quyết định còn mở · 9. Danh mục tài liệu · 10. Trạng thái tài liệu · Phụ lục A: Đối chiếu thay đổi · Phụ lục B: Điểm lệch liên file
# 1. Project Background / Problem Statement
## 1.1. Project Background
JOBNEST là nền tảng kết nối sinh viên với các cơ hội việc làm Part-time, Seasonal và Freelance.
Sinh viên có nhu cầu tìm kiếm công việc linh hoạt để tăng thu nhập, tích lũy kinh nghiệm và phát triển kỹ năng. Tuy nhiên, việc tìm kiếm cơ hội việc làm còn phân tán, khó theo dõi và thiếu một quy trình thống nhất.
Ở phía tuyển dụng, cá nhân tuyển dụng cần một công cụ để đăng Job, tiếp nhận hồ sơ, xem xét ứng viên và quản lý quá trình làm việc.
Đối với Freelance, quá trình làm việc cần được quản lý qua các bước riêng biệt: gửi Proposal, lựa chọn ứng viên, tạo Work Assignment, bàn giao Deliverable và xác nhận Acceptance.
JOBNEST được xây dựng nhằm cung cấp một nền tảng thống nhất để hỗ trợ các hoạt động trên.
## 1.2. Problem Statement
| STT | Vấn đề | Hệ quả hiện tại | Đáp ứng bởi (mục tiêu §2) |
| --- | --- | --- | --- |
| 1 | Sinh viên khó tìm cơ hội Part-time, Seasonal, Freelance vì phân tán nhiều nguồn. | Mất thời gian tìm kiếm, bỏ lỡ cơ hội. | Mục tiêu 1, 2 |
| 2 | Cá nhân tuyển dụng thiếu công cụ thống nhất để đăng và quản lý Job. | Quản lý hồ sơ thủ công, khó theo dõi. | Mục tiêu 1, 3 |
| 3 | Quy trình ứng tuyển và lựa chọn ứng viên cần được chuẩn hóa. | Trạng thái hồ sơ không rõ ràng. | Mục tiêu 3 |
| 4 | Quy trình Freelance chưa được quản lý xuyên suốt từ Proposal đến Deliverable Acceptance. | Khó kiểm soát bàn giao và nghiệm thu. | Mục tiêu 5 |
| 5 | Việc tuyển nhiều Student cho cùng một Job cần được hỗ trợ. | Vượt hoặc thiếu chỉ tiêu tuyển. | Mục tiêu 4 |
| 6 | Hai bên cần cơ chế đánh giá sau khi Work Assignment hoàn thành. | Thiếu cơ sở đánh giá uy tín. | Mục tiêu 6 |
| 7 | Employer cần xác minh email và số điện thoại trước khi được đăng Job. | Rủi ro tin tuyển dụng thiếu tin cậy. | Mục tiêu 7 |
# 2. Core Objectives
JOBNEST có 7 mục tiêu cốt lõi. Cột chỉ số đo và ngưỡng là [ĐỀ XUẤT – chờ duyệt]; ngưỡng “100%” lấy từ Business Rule tương ứng, các ngưỡng còn lại là TBD vì chưa có dữ liệu nền.
| STT | Mục tiêu | Chỉ số đo [ĐỀ XUẤT – chờ duyệt] | Ngưỡng |
| --- | --- | --- | --- |
| 1 | Kết nối sinh viên với cá nhân tuyển dụng thông qua một nền tảng tập trung. | Số Application/Proposal gửi trên mỗi Job PUBLISHED. | TBD |
| 2 | Hỗ trợ ba loại công việc: Part-time, Seasonal và Freelance. | Phân bố Job theo job_type (PART_TIME / SEASONAL / FREELANCE). | TBD |
| 3 | Chuẩn hóa vòng đời Job, Application, Proposal và Work Assignment. | Tỷ lệ chuyển trạng thái hợp lệ theo State Model; chuyển sai bị chặn (STATE_TRANSITION_INVALID); có lịch sử trạng thái. | TBD |
| 4 | Một Job tuyển nhiều Student thông qua quantity_required; mỗi Student được chọn có một Work Assignment riêng. | Số Assignment của mỗi Job ≤ quantity_required (BR-10, BR-11). | 100% |
| 5 | Hỗ trợ quy trình Freelance: Proposal, lựa chọn, Work Assignment, Deliverable, Acceptance. | Số Deliverable theo trạng thái SUBMITTED / ACCEPTED / REVISION_REQUESTED. | TBD |
| 6 | Hỗ trợ đánh giá hai chiều sau khi Work Assignment đạt COMPLETED. | Mỗi bên tối đa 1 Review cho mỗi Assignment (BR-15); tỷ lệ Assignment có đủ 2 Review. | Tối đa 1 Review/bên: 100%; tỷ lệ đủ 2 Review: TBD |
| 7 | Individual Employer xác minh email và số điện thoại bằng OTP trước khi đăng Job. | Số Job gửi duyệt bởi Employer chưa xác minh đủ 2 kênh (BR-03). | 0 (tức 100% đã xác minh) |
# 3. Project Scope
## 3.1. In-Scope
Dự án bao gồm 13 nhóm chức năng. Cột FR được đối chiếu từ File 03 (SRS).
| STT | Nhóm chức năng | Phạm vi | FR (File 03) |
| --- | --- | --- | --- |
| 1 | Authentication | Đăng ký, đăng nhập và xác thực tài khoản. | FR-01, 02, 03, 04 |
| 2 | Verification | Xác minh email và số điện thoại của Individual Employer bằng OTP. | FR-05, 06 |
| 3 | Profile Management | Quản lý hồ sơ Student và Individual Employer. | FR-07, 08, 09, 10 |
| 4 | Job Management | Tạo, quản lý và theo dõi Job thuộc ba loại Part-time, Seasonal và Freelance. | FR-11, 12, 13, 14 |
| 5 | Search | Tìm kiếm và xem thông tin Job; lưu Job. | FR-16, 17, 18, 19, 20 |
| 6 | Application — Part-time/Seasonal | Student gửi và quản lý Application cho Job Part-time hoặc Seasonal. | FR-21, 22, 23, 24 |
| 7 | Proposal — Freelance | Student gửi Proposal cho Job Freelance; Employer xem xét Proposal. | FR-25, 26 |
| 8 | Multi-hire | Cho phép tuyển nhiều Student cho một Job theo quantity_required. | FR-27 |
| 9 | Work Management | Tạo và quản lý Work Assignment riêng cho từng Student được lựa chọn. | FR-28, 29, 30, 33 |
| 10 | Deliverable — Freelance | Student gửi Deliverable; Employer chấp nhận hoặc yêu cầu chỉnh sửa. | FR-31, 32 |
| 11 | Review | Đánh giá hai chiều sau khi Work Assignment hoàn thành. | FR-34, 35 |
| 12 | Notification | Thông báo các sự kiện thuộc phạm vi hệ thống; trigger list TBD — C3. | FR-36 |
| 13 | Admin | Quản trị, kiểm duyệt, xử lý báo cáo; moderation policy TBD — C9. | FR-15, 37, 38, 39, 40 |
Ghi chú: FR-40 (dashboard thống kê và nhật ký quản trị) chưa có Use Case riêng (G-49); /admin/stats và /admin/logs là Gap G-49/G-50.
## 3.2. Out-of-Scope
| STT | Nội dung | Trạng thái |
| --- | --- | --- |
| 1 | Thanh toán tiền thật, ví điện tử, escrow và tự động giải ngân | Out-of-Scope (BR-18) |
| 2 | Ứng dụng native Android/iOS | Out-of-Scope |
| 3 | Chat thời gian thực nâng cao | Out-of-Scope |
| 4 | Hợp đồng điện tử có giá trị pháp lý | Out-of-Scope |
| 5 | AI matching, chấm điểm CV và tự động quyết định tuyển dụng | Out-of-Scope |
| 6 | Tài khoản doanh nghiệp hoặc hộ kinh doanh | Out-of-Scope |
| 7 | Hỗ trợ đa ngôn ngữ | Out-of-Scope |
## 3.3. Scope Constraints
- Chỉ có Individual Employer trong phạm vi Actor; không có Company Employer, không có Employer Member.
- Một Job có thể tuyển nhiều Student thông qua quantity_required; mỗi Student được chọn có một Work Assignment riêng.
- Application, Proposal, Work Assignment và Deliverable là các đối tượng có vòng đời riêng.
- Không đồng nhất trạng thái Deliverable với trạng thái Work Assignment.
# 4. Actors và các bên liên quan
## 4.1. Actor List
| Actor | Mô tả | Vai trò chính |
| --- | --- | --- |
| Guest | Người chưa đăng nhập | Xem và tìm kiếm Job công khai; đăng ký hoặc đăng nhập. |
| Student | Sinh viên đã có tài khoản | Quản lý hồ sơ, tìm Job, gửi Application hoặc Proposal, thực hiện Assignment, gửi Deliverable và đánh giá. |
| Individual Employer | Cá nhân tuyển dụng | Quản lý hồ sơ, xác minh email và số điện thoại, đăng Job, xem xét ứng viên, lựa chọn Student và quản lý Assignment. |
| Admin | Quản trị viên | Quản lý và kiểm duyệt dữ liệu, người dùng, danh mục và báo cáo theo quyền được cấp (RBAC). |
## 4.2. Actor Constraints
- Guest không được thực hiện các chức năng yêu cầu tài khoản đã xác thực.
- Individual Employer là cá nhân tuyển dụng, không phải tài khoản doanh nghiệp, và phải xác minh cả email và số điện thoại trước khi đăng Job.
- Admin do quy trình quản trị cấp, không tự đăng ký (BR-02); quy trình cấp Admin TBD — C6.
- Không bổ sung Company Employer hoặc Employer Member vào baseline.
## 4.3. Stakeholder Register [ĐỀ XUẤT – chờ duyệt]
| Bên liên quan | Mối quan tâm chính | Owner / người phụ trách |
| --- | --- | --- |
| Student | Tìm việc linh hoạt, theo dõi hồ sơ ứng tuyển và công việc, được đánh giá công bằng. | — |
| Individual Employer | Đăng Job, nhận hồ sơ đáng tin cậy, chọn đúng số lượng Student, nghiệm thu sản phẩm. | — |
| Admin | Kiểm duyệt Job, xử lý báo cáo, quản lý người dùng và danh mục. | Quy trình cấp Admin: TBD (C6) |
| Nhóm dự án (Dev / QA) | Đặc tả đủ rõ để triển khai và kiểm thử. | Thành viên, vai trò và capacity: TBD (File 02 §3.4) |
| Tech Lead / Reviewer | Kiểm chứng lần cuối Database/ERD và các quyết định kỹ thuật (File 07 §11). | TBD |
| Nhà cung cấp dịch vụ ngoài | Email/OTP, SMS/OTP, File Storage. | Chưa chọn nhà cung cấp |
# 5. Technology Baseline
## 5.1. Technology Stack
| Thành phần | Công nghệ | Vai trò |
| --- | --- | --- |
| Frontend | React.js | Giao diện Web responsive. |
| Backend | Node.js + Express.js | Xây dựng REST API và xử lý nghiệp vụ. |
| Database | PostgreSQL | Lưu trữ dữ liệu hệ thống. |
| Authentication | JWT | Xác thực request bằng token (thời hạn: TBD — C1). |
| Password Hashing | bcrypt | Băm mật khẩu. |
| Authorization | RBAC | Phân quyền theo vai trò. |
| API Base Path | /api/v1 | Tiền tố chung cho API. |
| File Storage | TBD | Lưu trữ CV và Deliverable. |
| Email/OTP Provider | TBD | Gửi email và OTP xác minh. |
| SMS/OTP Provider | TBD | Gửi OTP xác minh số điện thoại. |
## 5.2. Architecture Overview
JOBNEST sử dụng kiến trúc Web Client — REST API — Relational Database.
| Tầng | Thành phần và trách nhiệm |
| --- | --- |
| Frontend | React.js; giao diện Web responsive; hiển thị chức năng theo Actor và quyền; gọi Backend qua REST API. |
| Backend | Node.js + Express.js; REST API tại /api/v1; xác thực JWT; kiểm tra RBAC và quyền sở hữu tài nguyên; xử lý nghiệp vụ Job, Application, Proposal, Work Assignment, Deliverable, Review, Notification. |
| Database | PostgreSQL; lưu tài khoản, hồ sơ, Job, Application, Proposal, Assignment, Deliverable và dữ liệu hệ thống; Logical ERD gồm 30 Entity; migration và DDL chưa được thực thi. |
| Dịch vụ ngoài | Email/OTP, SMS/OTP, File Storage — đều TBD. |
## 5.3. Architecture Constraints
- Frontend React.js; Backend Node.js + Express.js; Database PostgreSQL; API /api/v1.
- Authentication dùng JWT; mật khẩu xử lý bằng bcrypt; Authorization dùng RBAC.
- Backend phải kiểm tra quyền và ownership; UI ẩn hoặc vô hiệu hóa nút không thay thế kiểm tra phía server.
- Không xác nhận các dịch vụ ngoài đã được lựa chọn hoặc triển khai khi chưa có quyết định.
# 6. Tổng quan quy trình nghiệp vụ [ĐỀ XUẤT – chờ duyệt]
Phần này tóm tắt luồng nghiệp vụ từ SRS (File 03 §2.6) để người đọc nắm toàn cảnh; đặc tả chi tiết nằm ở File 03 và File 04.
## 6.1. Part-time / Seasonal
| Bước | Actor | Hành động | Đối tượng / trạng thái |
| --- | --- | --- | --- |
| 1 | Employer | Xác minh email và số điện thoại (BR-03), tạo Job, lưu nháp hoặc gửi duyệt. | Job: DRAFT → PENDING_REVIEW |
| 2 | Admin | Kiểm duyệt Job; từ chối phải có moderation_reason (phạm vi duyệt: TBD — C9). | Job: PUBLISHED hoặc REJECTED |
| 3 | Student | Tìm kiếm, xem chi tiết, lưu Job; gửi Application kèm CV hoặc giới thiệu. | Application: PENDING |
| 4 | Employer | Xem xét Application. | Application: REVIEWING, SHORTLISTED |
| 5 | Employer | Chọn một hoặc nhiều Student tại Candidate Selection — POST /jobs/:jobId/selections (A3). | Application: ACCEPTED; tạo Work Assignment riêng cho từng Student |
| 6 | Student / Employer | Thực hiện và theo dõi tiến độ (actor cập nhật tiến độ: TBD — G-06). | Assignment: NOT_STARTED → IN_PROGRESS (T1/M1 đề xuất) |
| 7 | Employer | Xác nhận hoàn thành. | Assignment: COMPLETED |
| 8 | Student / Employer | Đánh giá hai chiều (mỗi bên tối đa 1 Review). | Review |
## 6.2. Freelance
| Bước | Actor | Hành động | Đối tượng / trạng thái |
| --- | --- | --- | --- |
| 1 | Employer | Tạo Job FREELANCE (scope, deliverable requirements, deadline, ngân sách), gửi duyệt; Admin kiểm duyệt như §6.1. | Job |
| 2 | Student | Gửi Proposal (nội dung, thời gian dự kiến, giá đề xuất nếu trường được bật). | Proposal: SUBMITTED |
| 3 | Employer | Xem xét Proposal. | Proposal: REVIEWING |
| 4 | Employer | Chọn Proposal tại Candidate Selection — POST /jobs/:jobId/selections (A3). | Proposal: ACCEPTED; tạo Work Assignment |
| 5 | Student | Cập nhật tiến độ và gửi Deliverable; mỗi lần gửi tạo phiên bản mới. | Deliverable: SUBMITTED |
| 6 | Employer | Chấp nhận hoặc yêu cầu chỉnh sửa (bắt buộc có nhận xét); nếu chỉnh sửa, Student gửi phiên bản mới. | Deliverable: ACCEPTED hoặc REVISION_REQUESTED |
| 7 | Employer | Xác nhận hoàn thành Assignment. | Assignment: COMPLETED |
| 8 | Student / Employer | Đánh giá hai chiều. | Review |
## 6.3. Các vòng đời độc lập
Job, Application, Proposal, Work Assignment và Deliverable là các vòng đời riêng (BR-12). Giá trị trạng thái lấy từ ràng buộc CHECK đề xuất trong File 07.
| Đối tượng | Trạng thái | Ghi chú |
| --- | --- | --- |
| Job | DRAFT, PENDING_REVIEW, PUBLISHED, REJECTED, CLOSED, EXPIRED | Cơ chế EXPIRED: TBD — C4. |
| Application (PT/SV) | PENDING, REVIEWING, SHORTLISTED, ACCEPTED, REJECTED, WITHDRAWN | ACCEPTED chỉ qua selections (A3). WITHDRAWN: TBD — C2, S2. |
| Freelance Proposal | SUBMITTED, REVIEWING, ACCEPTED, REJECTED, WITHDRAWN | ACCEPTED chỉ qua selections (A3). WITHDRAWN: TBD — C2, S3. |
| Work Assignment | NOT_STARTED, IN_PROGRESS, COMPLETED | T1/M1: đề xuất, chưa được duyệt. Không dùng SUBMITTED. |
| Deliverable | SUBMITTED, ACCEPTED, REVISION_REQUESTED | Request Revision không đổi trạng thái Assignment (IN_PROGRESS) theo M1. |
# 7. Assumptions, Constraints và Risks
## 7.1. Assumptions
| STT | Giả định | Nội dung |
| --- | --- | --- |
| 1 | User chịu trách nhiệm về dữ liệu | Người dùng chịu trách nhiệm về tính chính xác của thông tin do mình cung cấp. |
| 2 | Employer Verification | Individual Employer phải xác minh email và số điện thoại trước khi đăng Job. |
| 3 | Không thanh toán trực tuyến | Hệ thống không xử lý thanh toán tiền thật, ví, escrow hoặc tự động giải ngân. |
| 4 | Tách vòng đời dữ liệu | Job và Work Assignment có vòng đời riêng; Application, Proposal và Deliverable cũng được quản lý riêng. |
| 5 | Multi-hire | Một Job có thể tuyển nhiều Student thông qua quantity_required; mỗi Student được chọn có một Work Assignment riêng. |
| 6 | Admin moderation | Hệ thống có chức năng Admin moderation và xử lý Report; chính sách chi tiết TBD — C9. |
## 7.2. Constraints
| STT | Ràng buộc | Nội dung |
| --- | --- | --- |
| 1 | Actor | Chỉ gồm Guest, Student, Individual Employer và Admin. |
| 2 | Employer verification | Employer chưa xác minh đủ email và số điện thoại không được đăng Job. |
| 3 | API | Base path là /api/v1. |
| 4 | Authentication | Sử dụng JWT và bcrypt. |
| 5 | Authorization | Sử dụng RBAC và phải kiểm tra quyền ở Backend. |
| 6 | Database | PostgreSQL; Logical ERD có 30 Entity. |
| 7 | Migration | Chưa chạy migration; constraint và migration plan chưa được xem là đã triển khai. |
| 8 | Freelance lifecycle | Deliverable có trạng thái riêng; không dùng SUBMITTED cho Work Assignment. |
| 9 | Selection | Chỉ POST /jobs/:jobId/selections được phép thực hiện lựa chọn ACCEPTED và tạo Work Assignment (A3). |
| 10 | External services | Email, SMS/OTP và File Storage chưa chốt nhà cung cấp. |
## 7.3. Risk Register [ĐỀ XUẤT – chờ duyệt]
Các rủi ro được suy ra từ các quyết định còn mở; biện pháp là đề xuất và chưa có người phụ trách.
| Mã | Rủi ro | Ảnh hưởng | Biện pháp [ĐỀ XUẤT – chờ duyệt] | Owner |
| --- | --- | --- | --- | --- |
| R-01 | Nhà cung cấp Email/SMS/File Storage chưa chọn. | Chặn xác minh OTP (UC-06), upload CV và Deliverable. | Chốt nhà cung cấp trước Sprint liên quan; dùng mock cho môi trường phát triển. | TBD |
| R-02 | T1/M1 chưa được duyệt; BR-14 trong SRS mô tả khác M1. | Sai lệch lifecycle Assignment giữa SRS, API và ERD. | Họp chốt T1/M1; cập nhật đồng bộ File 03, 06, 07. | TBD |
| R-03 | C9 (moderation policy) chưa chốt. | PB-31 (Sprint 2) chỉ làm được một phần. | Chọn phương án A hoặc B tại File 02 §3.3.2. | TBD |
| R-04 | Source integrity (C8/G-35) chưa được thực thi ở DB. | TC-HIRE-009..012 bị chặn; nguy cơ Assignment sai nguồn. | Chốt cơ chế (constraint, trigger hoặc service validation) trước khi viết migration. | TBD |
| R-05 | API-D1..D10 chờ duyệt; 10 endpoint còn thiếu. | Frontend và Backend không thống nhất hợp đồng. | Duyệt API-D, hoàn thiện schema ở File 06. | TBD |
| R-06 | Sprint capacity, team size, velocity chưa có. | Kế hoạch 186 SP / 4 Sprint chưa khả thi để cam kết. | Xác nhận thành viên và capacity (File 02 §3.4). | TBD |
| R-07 | Chưa có test nào thực thi (334 TC: 223 Not Run, 110 TBD, 1 Manual). | Không có bằng chứng chất lượng. | Hoàn thiện Test Registry (File 08) trước khi chạy. | TBD |
# 8. TBD / Open Decisions
| Mã | Nội dung | Trạng thái |
| --- | --- | --- |
| C1 | JWT expiry | TBD |
| C2 | Thời điểm WITHDRAWN được phép | TBD |
| C3 | Notification trigger list | TBD |
| C4 | Cơ chế EXPIRED Job: cron hoặc manual | TBD |
| C5 | CV default constraint; hướng T2 đã được đề xuất | Đề xuất, chưa migrate |
| C6 | Quy trình cấp Admin | TBD |
| C7 | salary_* hay budget_* theo job_type | TBD — S6 |
| C8 | work_assignments.student_id khớp source; service validation | Chưa code |
| C9 | Moderation policy | TBD |
| C10 | Revision limit, rating scale và comment rules | TBD |
| S1 | Chứng chỉ trong FR-08 | TBD |
| S2 | Withdraw Application | TBD |
| S3 | Withdraw Proposal | TBD |
| S4 | Tách PB-32 thành User/Category/Log; quyết định 17 test PROPOSED | TBD |
| S5 | Route categories | TBD |
| S6 | CHECK salary/budget theo job_type | TBD |
| API-D1..D10 | Các API bổ sung đang chờ duyệt | Chờ duyệt |
| G-49, G-50 | /admin/stats, /admin/logs | Gap |
## 8.1. Các đề xuất và quy tắc cần phân biệt
- T1/M1: vòng đời Work Assignment là đề xuất, chưa được duyệt chính thức.
- T2: partial unique index cho CV mặc định là đề xuất, chưa migrate.
- A3: Selection là đường duy nhất để đặt ACCEPTED và tạo Work Assignment; logic đã áp dụng trong đặc tả, chưa xác nhận đã code.
- C8: service validation về tính nhất quán giữa work_assignments.student_id và nguồn chưa code.
- C9 và C10: chưa chốt.
# 9. Danh mục tài liệu [ĐỀ XUẤT – chờ duyệt]
Tám tài liệu của dự án và định dạng bàn giao. Cột phiên bản ghi nhận nhãn hiện có trong từng file; các nhãn chưa thống nhất (xem Phụ lục B).
| STT | Tài liệu | Định dạng | Nội dung chính | Phiên bản hiện ghi nhận | Phụ thuộc |
| --- | --- | --- | --- | --- | --- |
| 01 | Project Overview | Word | Bối cảnh, mục tiêu, phạm vi, actor, công nghệ | v2.1 + Phase 1 Rev.6 — Revision 2 | — |
| 02 | Product Backlog & Sprint Plan | Word + Excel | 36 PB, Sprint, Decision Register, Document Backlog | v2.1 + Phase 1 Rev.6 (Revision 3.1) | 01, 03 |
| 03 | SRS | Word + Excel | 40 FR, 10 NFR, 18 BR, State Model, Traceability | v1.2 — Consolidated Draft | 01 |
| 04 | Use Case Specification | Word | 22 UC (20 có đặc tả, 2 PROPOSED) | v1.0 — Consolidated Draft | 03 |
| 05 | Wireframe Specification | Word + Excel | 44 mã màn hình | v3.3 | 03, 04 |
| 06 | API Contract | Word + Excel | Endpoint, response, lỗi, API-D1..D10 | Draft — v2.1 | 03, 04, 07 |
| 07 | Database/ERD Specification | Word + Excel | 30 Entity, constraint, migration plan | v2.1 + Phase 1 Rev.6 | 03 |
| 08 | Test Plan Workbook | Excel | 334 Test Case, Gap Register, Traceability | — | 03–07 |

Sơ đồ đi kèm (bản vẽ đề xuất, chưa được nhóm review): JOBNEST_Wireframe_44.drawio (44 mã màn hình) và ERD_JOBNEST_30_bang.drawio (30 bảng, 46 quan hệ).
# 10. Document Status
| Thuộc tính | Giá trị |
| --- | --- |
| Document | JOBNEST Project Overview |
| Version | v2.1 + Phase 1 Rev.6 — Revision 2 |
| Date | 03/11/2026 |
| Status | Draft — chờ nhóm rà soát |
| Phase 1 Rev.6 | Proposal — chưa áp dụng chính thức |
| Functional Requirements | 40 FR |
| Non-Functional Requirements | 10 NFR |
| Business Rules | 18 BR |
| Use Cases | 22 UC (20 có đặc tả; UC-12 và UC-14 PROPOSED) |
| Wireframe Screens | 44 mã: 36 gốc + 6 đề xuất (G06, G07, G08, S12, E13, X01) + 1 template (X02) + 1 TBD (X03) |
| Product Backlog | 36 PB (31 Must, 5 Should; 186 SP) |
| Document Backlog | 12 DB (+ 5 mã tạm DB-TBD-01..05) |
| ERD Entities | 30 |
| Test Cases | 334 — 223 Not Run, 110 TBD, 1 Manual; không có Test Case nào Pass |
| Gap IDs | 64 |
| API | 10 endpoint Missing; API-D1..D10 chờ duyệt; chưa có OpenAPI chính thức |
| Migration | Chưa chạy |
| Implementation Status | Không được suy ra từ tài liệu đặc tả |
# Phụ lục A. Bảng đối chiếu thay đổi
| Mục | Bản cũ | Bản Revision 2 | Lý do / nguồn |
| --- | --- | --- | --- |
| Đầu file | Không có nguồn đối chiếu | Thêm nguồn đối chiếu và quy ước nhãn | Minh bạch nội dung đề xuất |
| §1.2 | Danh sách 7 vấn đề | Thêm hệ quả và liên kết tới mục tiêu | Truy vết vấn đề → mục tiêu |
| §2 | 7 mục tiêu, không chỉ số | Thêm chỉ số đo và ngưỡng (100% lấy từ BR, còn lại TBD) | BR-03, BR-10, BR-11, BR-15; [ĐỀ XUẤT – chờ duyệt] |
| §3.1 | 13 nhóm, không FR | Thêm cột FR; ghi chú FR-40/G-49 | File 03 §3.1, §3.2 |
| §4.3 | Không có | Thêm Stakeholder Register | Bổ sung; [ĐỀ XUẤT – chờ duyệt] |
| §6 | Không có | Thêm quy trình PT/SV, Freelance, các vòng đời độc lập | File 03 §2.6, §6; File 07 §4.2 |
| §7.3 | Không có | Thêm Risk Register (R-01..R-07) | Suy ra từ TBD; [ĐỀ XUẤT – chờ duyệt] |
| §8 | Giữ nguyên | Giữ nguyên danh sách TBD | Không tự chốt |
| §9 | Không có | Thêm danh mục 8 tài liệu và định dạng | Quản lý tài liệu |
| §10 | Wireframe Screens: 36 | Wireframe Screens: 44 mã; UC 20 + 2 PROPOSED; API missing 10 | File 05 v3.3; File 04; File 06 |
| Cũ §8 → mới §10 | Đánh số §8 | Đổi số mục do chèn §6, §7.3, §9 | Cấu trúc |
# Phụ lục B. Điểm lệch liên file ghi nhận khi đối chiếu
Các điểm sau không sửa trong File 01; chuyển cho file tương ứng xử lý, giữ nguyên TBD cho đến khi nhóm quyết định.
| STT | Điểm lệch | File liên quan | Xử lý |
| --- | --- | --- | --- |
| 1 | BR-14 (SRS) nói yêu cầu chỉnh sửa đưa Assignment về trạng thái cần sửa; M1 và API nói Assignment vẫn IN_PROGRESS. | 03, 06, 07 | Chốt T1/M1; sửa File 03 |
| 2 | FR-26 ghi Employer “chấp nhận” Proposal; A3 chỉ cho phép ACCEPTED qua selections. | 03, 05, 06 | Sửa câu chữ FR-26 ở File 03 |
| 3 | Thống kê coverage 16/18/6 lệch với đếm theo dòng 14/20/6. | 03 | Lập bảng đối chiếu từng FR |
| 4 | Ma trận truy vết và Test Registry trong File 08 là dữ liệu giữ chỗ (UC-23..40, WF-M, entity_n, mô tả “[từ nguồn]”). | 08 | Làm lại từ File 03–07 |
| 5 | File 06 §8.2–8.4 chỉ có lời dặn, và có đoạn checklist lẫn trong nội dung. | 06 | Viết nội dung thật, xóa đoạn checklist |
| 6 | Register 36 PB không có tên, SP từng PB, tiêu chí chấp nhận; 12 Epic chưa có tên. | 02 | Làm lại Backlog Register (Excel) |
| 7 | Nhãn phiên bản mỗi file một kiểu (v2.1+Rev.6, Rev 3.1, v1.2, v1.0, v3.3). | 01–08 | Thống nhất quy ước phiên bản |
| 8 | File 05 và 07 còn ghi “chưa vẽ draw.io” trong khi bản vẽ đã có. | 05, 07 | Cập nhật mục trạng thái |