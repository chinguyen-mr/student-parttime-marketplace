<!-- converted from 03_JOBNEST_SRS.docx -->

JOBNEST — SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
| Thuộc tính | Nội dung |
| --- | --- |
| Tên tài liệu | JOBNEST — SOFTWARE REQUIREMENTS SPECIFICATION |
| Tên file | 03_JOBNEST_SRS.docx |
| Phiên bản | v1.2 — Consolidated Draft — Revision 2: đối chiếu liên file |
| Ngày | 03/11/2026 |
| Trạng thái | DRAFT — Đủ điều kiện review chính thức, chưa Approved |
| Nguồn chính | SRS v2.1 (tài liệu nguồn gốc của baseline FR/NFR/BR/UC/State Models; không phải file 02 hiện hành) |
| Nguồn bổ trợ | 01_JOBNEST_Project_Overview.docx; 02_JOBNEST_Product_Backlog_Sprint_Plan.docx Rev 3.1 |
| Functional Requirements | 40 |
| Non-functional Requirements | 10 |
| Business Rules | 18 |
| Use Case Catalog | 22 |

Ghi chú phiên bản: Đây là bản SRS hợp nhất để review. Việc tổng hợp nội dung không đồng nghĩa với việc các quyết định TBD đã được phê duyệt, API đã được triển khai, Database đã được migration hoặc Test Case đã được thực thi.
Quy ước nhãn: [ĐỀ XUẤT – chờ duyệt] là nội dung mới do biên soạn đề xuất, chưa được nhóm phê duyệt. TBD là chưa có quyết định, không tự điền. Revision 2 chỉ đối chiếu và bổ sung; không ghi nhận Approved, Pass, Verified hay Implemented cho bất kỳ hạng mục nào.
# CHƯƠNG 1 — GIỚI THIỆU
## 1.1. Mục đích tài liệu
Tài liệu Software Requirements Specification (SRS) mô tả các yêu cầu của hệ thống JOBNEST, bao gồm:
- Yêu cầu chức năng (Functional Requirements — FR).
- Yêu cầu phi chức năng (Non-functional Requirements — NFR).
- Quy tắc nghiệp vụ (Business Rules — BR).
- Các tác nhân (Actors) và Use Case của hệ thống.
- Các mô hình trạng thái và vòng đời nghiệp vụ.
- Ma trận truy vết giữa yêu cầu và các tài liệu liên quan.
- Các quyết định, giả định và vấn đề còn chưa được xác nhận.
Tài liệu được sử dụng làm cơ sở cho quá trình phân tích, thiết kế, phát triển và kiểm thử hệ thống.
## 1.2. Đối tượng sử dụng
Tài liệu hướng đến:
- Giảng viên hướng dẫn.
- Nhóm phân tích và phát triển hệ thống.
- Nhóm kiểm thử.
- Các thành viên tham gia quản lý dự án.
- Các bên liên quan đến phạm vi và yêu cầu của JOBNEST.
## 1.3. Phạm vi sản phẩm
JOBNEST là nền tảng web kết nối sinh viên với nhà tuyển dụng cá nhân, hỗ trợ tìm kiếm và quản lý cơ hội việc làm thuộc ba loại:
- PART_TIME: Công việc bán thời gian.
- SEASONAL: Công việc thời vụ.
- FREELANCE: Công việc tự do theo phạm vi, sản phẩm bàn giao và thỏa thuận công việc.
Hệ thống hỗ trợ quy trình từ đăng tin, tìm kiếm, ứng tuyển hoặc gửi Proposal, lựa chọn ứng viên, tạo Work Assignment, theo dõi tiến độ và đánh giá sau khi hoàn thành.
JOBNEST không xử lý thanh toán tiền thật, ví điện tử, escrow hoặc giải ngân tự động trong phạm vi hiện tại.
## 1.4. Baseline dự án
| Hạng mục | Baseline |
| --- | --- |
| Job type | PART_TIME, SEASONAL, FREELANCE |
| Employer | Individual Employer |
| Frontend | React.js |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Authentication | JWT |
| Password hashing | bcrypt |
| Authorization | RBAC |
| API prefix | /api/v1 |
| Employer verification | Email và số điện thoại bằng OTP |
| Multi-hire | Hỗ trợ nhiều Student theo quantity_required |
| Freelance workflow | Proposal → Selection → Work Assignment → Progress → Deliverable → Acceptance |

Các nội dung chưa được quyết định như nhà cung cấp OTP, giới hạn file và chính sách kiểm duyệt được ghi nhận riêng tại Chương 8.
## 1.5. Tài liệu tham chiếu
| Mã | Tài liệu | Vai trò |
| --- | --- | --- |
| REF-01 | 01_JOBNEST_Project_Overview.docx | Tổng quan dự án, phạm vi, mục tiêu và công nghệ |
| REF-02 | SRS v2.1 (tài liệu nguồn gốc của baseline FR/NFR/BR/UC/State Models; không phải file 02 hiện hành) | Nguồn FR, NFR, BR, UC Catalog và State Models |
| REF-03 | 02_JOBNEST_Product_Backlog_Sprint_Plan.docx Rev 3.1 | Product Backlog, MoSCoW và Sprint Plan |
| REF-04 | 04_JOBNEST_Use_Case_Specification | Đặc tả chi tiết 22 Use Case |
| REF-05 | 05_JOBNEST_Wireframe_Specification | Đặc tả 44 mã màn hình giao diện (36 gốc + 6 đề xuất + 1 template + 1 TBD) |
| REF-06 | 06_JOBNEST_API_Contract.docx | Endpoint, quy ước API, API-D1..D10 |
| REF-07 | 07_JOBNEST_Database_ERD_Specification.docx | Logical ERD 30 Entity |
| REF-08 | 08_JOBNEST_Test_Plan_Workbook.xlsx | Test Registry 334 TC, Gap Register |
| REF-09 | 03_JOBNEST_Traceability_Matrix.xlsx | Ma trận truy vết FR/NFR/BR/State Models đi kèm tài liệu này |

# CHƯƠNG 2 — MÔ TẢ TỔNG QUAN
## 2.1. Bối cảnh sản phẩm
Sinh viên hiện phải tìm kiếm cơ hội Part-time, Seasonal và Freelance từ nhiều nguồn khác nhau. Việc quản lý thông tin công việc, hồ sơ ứng tuyển và quá trình thực hiện công việc chưa được tập trung.
Đối với cá nhân tuyển dụng, việc đăng tin, tiếp nhận hồ sơ, lựa chọn ứng viên và theo dõi tiến độ công việc cần một quy trình thống nhất.
Đặc biệt, công việc Freelance cần hỗ trợ quy trình riêng, bao gồm gửi Proposal, lựa chọn ứng viên, tạo Work Assignment, bàn giao Deliverable và xác nhận nghiệm thu.
JOBNEST được xây dựng nhằm tập trung hóa các hoạt động trên trong một nền tảng web.
## 2.2. Mục tiêu hệ thống
| STT | Mục tiêu |
| --- | --- |
| 1 | Kết nối sinh viên với cá nhân tuyển dụng thông qua nền tảng tập trung. |
| 2 | Hỗ trợ ba loại công việc: Part-time, Seasonal và Freelance. |
| 3 | Chuẩn hóa vòng đời Job, Application, Proposal và Work Assignment. |
| 4 | Hỗ trợ tuyển nhiều Student thông qua quantity_required; mỗi Student được chọn có một Work Assignment riêng. |
| 5 | Hỗ trợ quy trình Freelance từ Proposal đến Deliverable Acceptance. |
| 6 | Hỗ trợ đánh giá hai chiều sau khi Work Assignment đạt trạng thái COMPLETED. |
| 7 | Yêu cầu Individual Employer xác minh email và số điện thoại bằng OTP trước khi đăng Job. |

## 2.3. Nhóm người dùng và Actor
Hệ thống có 4 Actor chính:
| Actor | Mô tả |
| --- | --- |
| Guest | Người chưa đăng nhập; có thể xem và tìm kiếm Job công khai, đăng ký và đăng nhập. |
| Student | Quản lý hồ sơ, CV, tìm kiếm và lưu Job, gửi Application hoặc Proposal, thực hiện Assignment và đánh giá. |
| Individual Employer | Xác minh email và số điện thoại, đăng Job, quản lý Application/Proposal, lựa chọn ứng viên, theo dõi Assignment và xác nhận hoàn thành. |
| Admin | Quản lý người dùng, danh mục, kiểm duyệt Job, xử lý báo cáo và theo dõi nhật ký quản trị. |

### 2.3.1. Ràng buộc Actor
- Đăng ký công khai chỉ hỗ trợ Student và Individual Employer.
- Admin được cấp thông qua quy trình quản trị, không tự đăng ký công khai.
- Không có Company Employer hoặc Employer Member trong baseline.
- Guest không được thực hiện các thao tác yêu cầu tài khoản đã đăng nhập.
- Backend phải kiểm tra Role và quyền sở hữu tài nguyên; không chỉ dựa vào việc ẩn hoặc hiện chức năng trên giao diện.
## 2.4. Phạm vi chức năng
JOBNEST bao gồm 13 nhóm chức năng:
| STT | Nhóm chức năng | Phạm vi |
| --- | --- | --- |
| 1 | Authentication | Đăng ký, đăng nhập và xác thực tài khoản |
| 2 | Verification | Xác minh email và số điện thoại Individual Employer bằng OTP |
| 3 | Profile Management | Quản lý hồ sơ Student và Individual Employer |
| 4 | Job Management | Tạo, chỉnh sửa và quản lý Job thuộc ba loại |
| 5 | Search | Tìm kiếm, lọc và xem thông tin Job |
| 6 | Application | Student ứng tuyển Job Part-time/Seasonal |
| 7 | Proposal | Student gửi Proposal cho Job Freelance |
| 8 | Multi-hire | Tuyển nhiều Student theo quantity_required |
| 9 | Work Management | Quản lý Work Assignment riêng cho từng Student |
| 10 | Deliverable | Student gửi Deliverable; Employer nghiệm thu hoặc yêu cầu chỉnh sửa |
| 11 | Review | Đánh giá hai chiều sau khi Assignment hoàn thành |
| 12 | Notification | Thông báo sự kiện nghiệp vụ; danh sách trigger còn TBD |
| 13 | Admin | Quản trị hệ thống và kiểm duyệt; chính sách kiểm duyệt còn TBD |

## 2.5. Ngoài phạm vi
Các chức năng sau không thuộc phạm vi hiện tại:
1. Thanh toán tiền thật, ví điện tử, escrow và giải ngân tự động.
2. Ứng dụng native Android/iOS.
3. Chat thời gian thực nâng cao.
4. Hợp đồng điện tử có giá trị pháp lý.
5. AI matching, chấm điểm CV hoặc tự động quyết định tuyển dụng.
6. Tài khoản doanh nghiệp hoặc hộ kinh doanh.
7. Hỗ trợ đa ngôn ngữ.
## 2.6. Quy trình nghiệp vụ tổng quan
### 2.6.1. Part-time / Seasonal
Employer tạo Job
|
v
Job được kiểm duyệt / công khai
|
v
Student gửi Application
|
v
Employer xem xét Application
|
v
Employer lựa chọn một hoặc nhiều Student
|
v
POST /jobs/:jobId/selections
|
v
Application ACCEPTED
|
v
Tạo Work Assignment riêng cho từng Student
|
v
Thực hiện công việc
|
v
Employer xác nhận hoàn thành
|
v
Work Assignment COMPLETED
|
v
Review hai chiều
Việc chuyển Application sang ACCEPTED và tạo Work Assignment phải tuân theo quy tắc A3 tại Chương 5.
### 2.6.2. Freelance
Employer tạo Job FREELANCE
|
v
Student gửi Proposal
|
v
Employer xem xét Proposal
|
v
Employer lựa chọn Proposal
|
v
POST /jobs/:jobId/selections
|
v
Proposal ACCEPTED
|
v
Tạo Work Assignment
|
v
Student cập nhật tiến độ
|
v
Student gửi Deliverable
|
v
Employer xem xét Deliverable
|
+------> REVISION_REQUESTED
| |
| v
| Student gửi phiên bản mới
| |
+----------------+
|
v
Deliverable ACCEPTED
|
v
Employer xác nhận hoàn thành
|
v
Work Assignment COMPLETED
|
v
Review hai chiều
Lưu ý: SUBMITTED, ACCEPTED và REVISION_REQUESTED của Deliverable thuộc vòng đời Deliverable, không được dùng thay cho trạng thái của Work Assignment.
## 2.7. Công nghệ và kiến trúc nền tảng
| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React.js |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Authentication | JWT |
| Password hashing | bcrypt |
| Authorization | RBAC |
| API | REST API, prefix /api/v1 |
| File Storage | TBD |
| Email OTP Provider | TBD |
| SMS OTP Provider | TBD |

## 2.8. Giả định và ràng buộc tổng quan
- Người dùng chịu trách nhiệm về tính chính xác của thông tin cung cấp.
- Individual Employer phải xác minh email và số điện thoại trước khi đăng Job.
- Hệ thống không xử lý thanh toán tiền thật.
- Job, Application, Proposal, Work Assignment và Deliverable có vòng đời riêng.
- Một Job có thể tuyển nhiều Student theo quantity_required.
- Mỗi Student được lựa chọn có Work Assignment riêng.
- Các thao tác thay đổi nhiều dữ liệu liên quan phải bảo đảm tính nhất quán bằng transaction hoặc cơ chế tương đương.
- Admin thực hiện kiểm duyệt và quản trị theo quyền được cấp.
# CHƯƠNG 3 — YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)
## 3.1. Danh sách yêu cầu chức năng
Nguồn: SRS v2.1 (baseline gốc).
| Mã | Module | Yêu cầu chức năng |
| --- | --- | --- |
| FR-01 | Authentication | Đăng ký tài khoản Student và Individual Employer; kiểm tra dữ liệu và email duy nhất. |
| FR-02 | Authentication | Đăng nhập/đăng xuất bằng cơ chế xác thực JWT; API nghiệp vụ yêu cầu JWT phù hợp. |
| FR-03 | Authorization | Phân quyền Guest, Student, Individual Employer và Admin; không cho người dùng tự nâng quyền. |
| FR-04 | Authentication | Quên mật khẩu và đặt lại mật khẩu bằng token/OTP có thời hạn. |
| FR-05 | Verification | Employer xác minh email bằng mã/token; mã có hạn dùng và chỉ sử dụng theo quy định. |
| FR-06 | Verification | Employer xác minh số điện thoại bằng OTP; kiểm soát số lần thử và thời hạn OTP. |
| FR-07 | Student Profile | Student xem và cập nhật hồ sơ cá nhân. |
| FR-08 | Student Profile | Student quản lý CV, kỹ năng, học vấn, kinh nghiệm và chứng chỉ. |
| FR-09 | Employer Profile | Employer xem và cập nhật hồ sơ cá nhân. |
| FR-10 | Employer Profile | Hệ thống hiển thị trạng thái xác minh email và số điện thoại của Employer. |
| FR-11 | Job Management | Employer tạo Job Part-time với mô tả, lịch/ca, mức lương, địa điểm, số lượng tuyển và hạn ứng tuyển. |
| FR-12 | Job Management | Employer tạo Job Seasonal với thời gian bắt đầu/kết thúc, lịch, mức lương, địa điểm và số lượng tuyển. |
| FR-13 | Job Management | Employer tạo Job Freelance với scope, deliverables, deadline, ngân sách/mức thù lao và số lượng cần tuyển. |
| FR-14 | Job Management | Employer chỉnh sửa, lưu nháp, gửi duyệt, đóng hoặc gia hạn Job theo quyền và trạng thái. |
| FR-15 | Moderation | Admin xem hàng đợi kiểm duyệt, duyệt/từ chối Job và ghi lý do quyết định. |
| FR-16 | Job Search | Guest/Student tìm kiếm Job công khai theo từ khóa. |
| FR-17 | Job Search | Guest/Student lọc theo job_type, category, location, salary/budget và các tiêu chí được hỗ trợ. |
| FR-18 | Job Search | Hệ thống sắp xếp và phân trang kết quả. |
| FR-19 | Job Detail | Hệ thống hiển thị chi tiết Job và Employer public profile ở phạm vi được phép. |
| FR-20 | Saved Jobs | Student lưu và bỏ lưu Job. |
| FR-21 | Application | Student nộp Application cho Job Part-time/Seasonal kèm CV hoặc giới thiệu bản thân. |
| FR-22 | Application | Student xem lịch sử và chi tiết Application; được rút đơn khi trạng thái cho phép. |
| FR-23 | Recruitment | Employer xem danh sách Application của Job do mình sở hữu và xem dữ liệu hồ sơ được phép. |
| FR-24 | Recruitment | Employer chuyển Application qua các trạng thái xét duyệt hợp lệ và thông báo cho Student. |
| FR-25 | Freelance Proposal | Student gửi Proposal cho Job Freelance, gồm nội dung đề xuất, thời gian dự kiến và giá đề xuất nếu trường này được bật. |
| FR-26 | Freelance Proposal | Employer xem, chấp nhận hoặc từ chối Proposal thuộc Job của mình. |
| FR-27 | Hiring | Employer chọn một hoặc nhiều ứng viên; hệ thống kiểm tra quantity_required và không tạo vượt số lượng. |
| FR-28 | Work Assignment | Hệ thống tạo Assignment riêng cho từng Student được chọn. |
| FR-29 | Work Management | Các bên liên quan xem trạng thái và lịch sử tiến độ Assignment. |
| FR-30 | Work Management | Student cập nhật tiến độ theo quyền; hệ thống lưu người cập nhật và thời điểm. |
| FR-31 | Deliverables | Student gửi Deliverable cho Assignment Freelance. |
| FR-32 | Deliverables | Employer chấp nhận Deliverable hoặc yêu cầu chỉnh sửa kèm nhận xét. |
| FR-33 | Work Completion | Employer xác nhận hoàn thành Assignment; hệ thống cập nhật trạng thái và thời điểm. |
| FR-34 | Review | Student đánh giá Employer sau khi Assignment hoàn thành. |
| FR-35 | Review | Employer đánh giá Student sau khi Assignment hoàn thành. |
| FR-36 | Notification | Hệ thống tạo thông báo trong ứng dụng khi Application/Proposal/Assignment thay đổi trạng thái. |
| FR-37 | Admin | Admin quản lý tài khoản: xem, khóa/mở khóa theo quyền và ghi nhật ký. |
| FR-38 | Admin | Admin quản lý danh mục công việc. |
| FR-39 | Reports | Người dùng gửi báo cáo Job/User; Admin tiếp nhận và xử lý. |
| FR-40 | Admin | Admin xem dashboard thống kê và nhật ký hoạt động quản trị. |

Lưu ý: FR-26 mâu thuẫn với A3 — xem CF-02 (Mục 3.4). Chữ của FR-26 được giữ nguyên chờ nhóm quyết định.
## 3.2. Ghi chú và phụ thuộc của yêu cầu chức năng
| FR | Ghi chú |
| --- | --- |
| FR-08 | Có TBD S1 liên quan đến Certificate. Chi tiết Certificate chưa được chốt. |
| FR-15 | Mapping PB-31, UC-08; phụ thuộc C9 — Moderation Policy. |
| FR-37 | Mapping PB-32, UC-21; liên quan quyết định S4 về việc tách PB-32. |
| FR-38 | Mapping PB-32, UC-21; liên quan quyết định S4 về việc tách PB-32. |
| FR-39 | Mapping PB-33, UC-22. |
| FR-40 | Liên quan G-49 (GET /admin/stats) và G-50 (GET /admin/logs); hai API này chưa được xác nhận trong API Contract. |

## 3.3. Các ràng buộc quan trọng
1. Chỉ Job thuộc ba loại PART_TIME, SEASONAL, FREELANCE.
2. Application thông thường chỉ dùng cho Job Part-time/Seasonal.
3. Proposal được sử dụng cho Job Freelance.
4. Một Job có thể tuyển nhiều Student, nhưng tổng số Assignment được tạo không vượt quantity_required.
5. Mỗi Student được chọn phải có Work Assignment riêng.
6. Việc lựa chọn ứng viên và tạo Assignment phải tuân theo quy tắc A3 tại Chương 5.
7. Deliverable có vòng đời riêng, không gộp trạng thái của Deliverable vào Work Assignment.
8. Chỉ Assignment COMPLETED mới đủ điều kiện cho quy trình Review hai chiều.
## 3.4. Mâu thuẫn tài liệu cần nhóm quyết định
Các mâu thuẫn dưới đây được nêu cả hai vế. Cột đề xuất là câu thống nhất [ĐỀ XUẤT – chờ duyệt]; tài liệu không tự chốt.
| Mã | Vế thứ nhất | Vế thứ hai | Câu thống nhất [ĐỀ XUẤT – chờ duyệt] | Trạng thái |
| --- | --- | --- | --- | --- |
| CF-01 | BR-14 (SRS v1.2): "yêu cầu chỉnh sửa đưa Assignment về trạng thái cần sửa". | M1 / Mục 6.5: Assignment chỉ có NOT_STARTED → IN_PROGRESS → COMPLETED; REVISION_REQUESTED thuộc Deliverable. UC-17 và File 06 §6.5: Assignment vẫn IN_PROGRESS khi yêu cầu chỉnh sửa. | BR-14: "Freelance chỉ hoàn thành khi Employer chấp nhận Deliverable cuối cùng và xác nhận hoàn thành; yêu cầu chỉnh sửa chỉ đổi trạng thái Deliverable sang REVISION_REQUESTED, Assignment vẫn IN_PROGRESS." | Chờ nhóm quyết định (T1/M1 chưa duyệt) |
| CF-02 | FR-26: "Employer xem, chấp nhận hoặc từ chối Proposal". | A3 (Mục 5.2): PATCH /proposals/:id/status không được đặt ACCEPTED; chỉ POST /jobs/:jobId/selections được chuyển Proposal sang ACCEPTED. | FR-26: "Employer xem và từ chối Proposal; việc chấp nhận Proposal được thực hiện qua thao tác lựa chọn ứng viên (POST /jobs/:jobId/selections) theo A3." | Chờ nhóm quyết định |
| CF-03 | Mục 6.5.1: mô hình vẽ NOT_STARTED trước IN_PROGRESS. | UC-16, UC-17, UC-18 đặt tiền điều kiện Assignment đang IN_PROGRESS; File 06 mẫu trả "IN_PROGRESS". | Chọn một trạng thái khởi tạo và điều kiện chuyển NOT_STARTED → IN_PROGRESS (hoặc bỏ NOT_STARTED). | TBD (T1/M1) |
| CF-04 | SRS v1.2 Mục 8.4: API-D3 = history và withdraw Application; API-D4 chưa xác định; API-D2 = Saved Jobs. | File 06: API-D3 = Application history; API-D4 = Application withdrawal; không có mục API-D2 (Saved Jobs). | Thống nhất bảng API-D1..D10 giữa File 03 và File 06 (ngay trong File 06 làm lại). | Chờ nhóm quyết định |
| CF-05 | File 03/File 06: G-49 = GET /admin/stats chưa xác nhận. | File 04: G-49 = "FR-40 chưa có UC mapping chính thức". | Tách thành hai mã Gap khác nhau (số mới do nhóm cấp) hoặc ghi rõ hai nghĩa trong Gap Register. | Chờ nhóm quyết định |

## 3.5. Tiêu chí chấp nhận cho từng yêu cầu chức năng
Mỗi FR có 2–4 tiêu chí chấp nhận có thể đo được. Toàn bộ Mục 3.5 là nội dung [ĐỀ XUẤT – chờ duyệt]. Ngưỡng hoặc giá trị chưa được quyết định ghi TBD kèm mã quyết định. Tiêu chí chấp nhận mô tả điều cần kiểm; không phải bằng chứng hệ thống đã đạt.
| FR | Tiêu chí chấp nhận [ĐỀ XUẤT – chờ duyệt] |
| --- | --- |
| FR-01 | AC-01.1: Đăng ký hợp lệ (Student hoặc Employer) tạo đồng thời bản ghi users và profile trong một transaction; nếu bước nào lỗi thì không còn bản ghi nào được lưu (0 bản ghi mồ côi). AC-01.2: Email trùng → 409; email sai định dạng hoặc thiếu trường bắt buộc → 400 kèm lỗi theo từng trường. AC-01.3: Mật khẩu lưu dạng bcrypt hash; 0 response/log chứa password hoặc password_hash. AC-01.4: Giá trị role ngoài STUDENT/INDIVIDUAL_EMPLOYER (kể cả ADMIN) bị từ chối. |
| FR-02 | AC-02.1: Đăng nhập đúng trả accessToken, role, userId; sai email hoặc sai password đều trả 401 cùng một thông điệp (không lộ email có tồn tại). AC-02.2: Tài khoản bị khóa đăng nhập → 403. AC-02.3: Gọi API riêng tư không kèm JWT hợp lệ → 401. AC-02.4: Hành vi đăng xuất và thời hạn JWT chỉ được kiểm khi C1/G-56 được chốt (TBD). |
| FR-03 | AC-03.1: Với mỗi endpoint riêng tư, gọi bằng role không được phép → 403 (kiểm bằng ma trận Role × Endpoint). AC-03.2: Gọi endpoint của Job/Application/Assignment mà không sở hữu → 403 hoặc 404 theo quy ước thống nhất (TBD). AC-03.3: Request thay đổi role của chính mình không làm đổi role trong users. |
| FR-04 | AC-04.1: Yêu cầu quên mật khẩu trả 202 với thông điệp chung, cùng nội dung cho email tồn tại và không tồn tại. AC-04.2: Token sai, đã dùng hoặc hết hạn bị từ chối; token đã dùng không dùng lại được. AC-04.3: Đặt lại thành công: đăng nhập được bằng mật khẩu mới, mật khẩu cũ bị từ chối; lỗi DB giữ nguyên mật khẩu cũ (rollback). |
| FR-05 | AC-05.1: Mã email đúng và còn hạn → email_verified_at được ghi; mã sai → từ chối và tăng attempt_count. AC-05.2: Mã hết hạn hoặc đã dùng → từ chối. AC-05.3: Thời hạn mã và số lần thử tối đa lấy theo quyết định G-15/G-16 (TBD). |
| FR-06 | AC-06.1: OTP điện thoại đúng và còn hạn → phone_verified_at được ghi. AC-06.2: Vượt số lần thử cho phép → bị từ chối theo rate limit (HTTP 429); giá trị ngưỡng theo G-16 (TBD). AC-06.3: Lỗi nhà cung cấp SMS trả lỗi rõ ràng, không ghi nhận xác minh. |
| FR-07 | AC-07.1: Student xem được hồ sơ của chính mình; không xem/sửa được hồ sơ Student khác. AC-07.2: Cập nhật hợp lệ lưu đủ các trường gửi lên; dữ liệu sai định dạng → 400 theo trường. AC-07.3: Response không chứa password_hash. |
| FR-08 | AC-08.1: Thêm/sửa/xóa CV, kỹ năng, học vấn, kinh nghiệm chỉ tác động lên dữ liệu của chính Student. AC-08.2: Tối đa một CV mặc định cho mỗi Student (sau khi T2/C5 được duyệt); trước đó ghi TBD. AC-08.3: Định dạng và dung lượng file CV theo quyết định File Storage (TBD). |
| FR-09 | AC-09.1: Employer xem và cập nhật được các trường cho phép của chính mình. AC-09.2: Trường email/số điện thoại đã xác minh không sửa được qua UC-05. AC-09.3: Employer khác không truy cập được hồ sơ (kiểm ownership). |
| FR-10 | AC-10.1: Hồ sơ hiển thị đúng hai trạng thái 'đã xác minh/chưa xác minh' của email và số điện thoại, khớp email_verified_at và phone_verified_at. AC-10.2: Trạng thái cập nhật hiển thị sau khi xác minh thành công mà không cần đăng nhập lại. |
| FR-11 | AC-11.1: Tạo Job PART_TIME với đủ mô tả, lịch/ca, mức lương, địa điểm, quantity_required ≥ 1 và hạn ứng tuyển → Job lưu ở DRAFT. AC-11.2: Thiếu trường bắt buộc → 400 theo trường. AC-11.3: Employer chưa xác minh email hoặc số điện thoại không tạo/gửi duyệt được Job (BR-03). |
| FR-12 | AC-12.1: Tạo Job SEASONAL lưu được thời gian bắt đầu/kết thúc; ngày kết thúc trước ngày bắt đầu → 400. AC-12.2: Bản ghi seasonal_details gắn đúng một Job; Job và chi tiết lưu trong một transaction. |
| FR-13 | AC-13.1: Tạo Job FREELANCE lưu scope, deliverables, deadline, ngân sách/mức thù lao và quantity_required. AC-13.2: Quy tắc ngân sách theo job_type áp dụng theo C7/S6 (TBD). AC-13.3: Job FREELANCE nhận Proposal, không nhận Application thường (BR-09). |
| FR-14 | AC-14.1: Employer chỉ sửa/đóng Job của mình; Job của người khác → 403. AC-14.2: Gửi duyệt chuyển Job DRAFT → PENDING_REVIEW; Job ở trạng thái không hợp lệ bị từ chối. AC-14.3: Job CLOSED/EXPIRED/REJECTED không nhận Application/Proposal mới (BR-07). |
| FR-15 | AC-15.1: Hàng đợi chỉ liệt kê Job PENDING_REVIEW; Admin duyệt → PUBLISHED và set published_at. AC-15.2: Từ chối bắt buộc có moderation_reason (thiếu → 400); trạng thái và admin_logs được ghi trong cùng một transaction. AC-15.3: Role không phải ADMIN → 403. |
| FR-16 | AC-16.1: Tìm theo từ khóa chỉ trả Job PUBLISHED. AC-16.2: Guest (chưa đăng nhập) tìm kiếm được. AC-16.3: Mục tiêu hiệu năng NFR-01 (p95 ≤ 1.5 giây) chỉ xác nhận khi có benchmark (G-52). |
| FR-17 | AC-17.1: Lọc theo job_type, category, location, salary/budget trả đúng tập con (đối chiếu với dữ liệu mẫu có đáp án định trước). AC-17.2: Tham số lọc sai kiểu → 400. |
| FR-18 | AC-18.1: Kết quả có thứ tự sắp xếp xác định và phân trang; không bỏ sót/trùng bản ghi giữa các trang. AC-18.2: Giá trị max limit lấy theo quyết định pagination (TBD). |
| FR-19 | AC-19.1: Chi tiết Job hiển thị đủ thông tin Job và Employer public profile. AC-19.2: Response public không chứa email, số điện thoại hoặc trường nhạy cảm chưa được phép (NFR-06). AC-19.3: Job không còn PUBLISHED xử lý theo G-23 (TBD). |
| FR-20 | AC-20.1: Student lưu rồi bỏ lưu một Job; lưu lặp lại không tạo bản ghi trùng. AC-20.2: Chỉ lưu được Job PUBLISHED (BR-06); danh sách chỉ của chính Student. AC-20.3: Hành vi với Job đã CLOSED/EXPIRED trong Saved Jobs: TBD. |
| FR-21 | AC-21.1: Nộp đơn Part-time/Seasonal tạo Application ở PENDING, gắn đúng Student và Job; tạo notification cho Employer sau khi lưu thành công (BR-16). AC-21.2: Nộp lần hai cho cùng Job → bị từ chối (BR-08). AC-21.3: Job không PUBLISHED, đã đóng/hết hạn hoặc là FREELANCE → bị từ chối. |
| FR-22 | AC-22.1: Student xem được lịch sử và chi tiết Application của chính mình. AC-22.2: Rút đơn chỉ thành công khi thỏa chính sách C2/S2 (TBD); bản ghi không bị xóa (BR-08). AC-22.3: Application ACCEPTED không rút được trừ khi chính sách quy định khác (TBD). |
| FR-23 | AC-23.1: Employer chỉ xem danh sách Application của Job thuộc sở hữu; Job của người khác → 403. AC-23.2: Dữ liệu hồ sơ/CV hiển thị theo mức cho phép NFR-06/G-54 (TBD). |
| FR-24 | AC-24.1: PATCH chỉ nhận REVIEWING, SHORTLISTED, REJECTED; yêu cầu đặt ACCEPTED → bị từ chối. AC-24.2: Chuyển trạng thái sai thứ tự theo bảng chuyển trạng thái → 409. AC-24.3: Notification cho Student chỉ tạo sau khi lưu thành công (BR-16). |
| FR-25 | AC-25.1: Gửi Proposal cho Job FREELANCE đang PUBLISHED tạo Proposal ở SUBMITTED, gắn đúng Job và Student. AC-25.2: Proposal trùng cho cùng Job và Student → bị từ chối. AC-25.3: Job không phải FREELANCE → bị từ chối. |
| FR-26 | AC-26.1: Employer xem Proposal của Job mình sở hữu. AC-26.2: PATCH /proposals/:id/status chỉ nhận REVIEWING hoặc REJECTED; ACCEPTED chỉ xuất hiện sau POST /jobs/:jobId/selections (A3). |
| FR-27 | AC-27.1: Tổng Work Assignment của một Job không bao giờ vượt quantity_required, kể cả khi hai request chọn đồng thời (kiểm bằng test đua). AC-27.2: Lựa chọn vượt số lượng hoặc dữ liệu không hợp lệ → toàn bộ bị rollback, 0 Assignment tạo ra. AC-27.3: Chỉ endpoint Selection chuyển nguồn sang ACCEPTED. |
| FR-28 | AC-28.1: Mỗi Student được chọn có đúng một Work Assignment; Assignment tham chiếu đúng một nguồn (Application hoặc Proposal) – XOR, chờ G-35/C8. AC-28.2: Assignment tạo cùng transaction với việc chuyển ACCEPTED. |
| FR-29 | AC-29.1: Chỉ participant của Assignment xem được trạng thái và lịch sử tiến độ (BR-13). AC-29.2: Lịch sử hiển thị theo thứ tự thời gian với người cập nhật và thời điểm; cấu trúc response theo G-58 (TBD). |
| FR-30 | AC-30.1: Mỗi cập nhật tiến độ lưu người cập nhật và thời điểm. AC-30.2: Người không thuộc Assignment → 403; actor được phép cập nhật theo quyết định G-06 (TBD). AC-30.3: Assignment đã COMPLETED không nhận cập nhật tiến độ mới [ĐỀ XUẤT]. |
| FR-31 | AC-31.1: Gửi Deliverable cho Assignment FREELANCE đang IN_PROGRESS tạo bản ghi version_no tăng dần, trạng thái SUBMITTED. AC-31.2: Assignment không phải FREELANCE hoặc không phải của Student gửi → bị từ chối. AC-31.3: Gửi Deliverable không làm đổi trạng thái Assignment. |
| FR-32 | AC-32.1: Quyết định chỉ nhận ACCEPTED hoặc REVISION_REQUESTED; REVISION_REQUESTED bắt buộc có comment. AC-32.2: Sau quyết định, Assignment vẫn IN_PROGRESS. AC-32.3: Giới hạn số lần chỉnh sửa theo C10 (TBD). |
| FR-33 | AC-33.1: Employer sở hữu xác nhận hoàn thành: Assignment IN_PROGRESS → COMPLETED và ghi completed_at. AC-33.2: Freelance: chỉ hoàn thành khi Deliverable mới nhất ACCEPTED; nếu không → bị từ chối. AC-33.3: Gọi lặp lại không tạo thay đổi thêm (idempotency theo G-59, TBD). |
| FR-34 | AC-34.1: Student chỉ đánh giá được Assignment COMPLETED mà mình là participant. AC-34.2: Mỗi Student tối đa một Review cho mỗi Assignment; lần hai → 409. AC-34.3: Thang điểm và độ dài comment theo C10/G-41/G-42 (TBD). |
| FR-35 | AC-35.1: Employer chỉ đánh giá được Assignment COMPLETED mà mình sở hữu. AC-35.2: Mỗi Employer tối đa một Review cho mỗi Assignment; lần hai → 409. AC-35.3: Thang điểm và độ dài comment theo C10/G-41/G-42 (TBD). |
| FR-36 | AC-36.1: Mỗi sự kiện đổi trạng thái Application/Proposal/Assignment đã lưu thành công tạo notification cho đúng người nhận; sự kiện thất bại không tạo notification (BR-16). AC-36.2: Người dùng chỉ xem/đánh dấu đã đọc thông báo của mình. AC-36.3: Danh sách trigger theo C3 (TBD). |
| FR-37 | AC-37.1: Chỉ ADMIN xem danh sách, khóa/mở khóa tài khoản. AC-37.2: Mỗi thao tác tạo một bản ghi admin_logs có actor, action, target, timestamp (BR-17). AC-37.3: Tài khoản bị khóa không đăng nhập được (403). |
| FR-38 | AC-38.1: Admin tạo/sửa/xóa danh mục; thao tác ghi admin_logs. AC-38.2: Quy tắc xóa danh mục đang được Job tham chiếu theo quyết định (TBD). |
| FR-39 | AC-39.1: Người dùng đã đăng nhập gửi được report Job/User; report gắn đúng đối tượng. AC-39.2: Admin xem và cập nhật xử lý; mỗi cập nhật ghi admin_logs. AC-39.3: Trạng thái/hành động xử lý và chính sách report trùng theo G-48/G-51 (TBD). |
| FR-40 | AC-40.1: Dashboard thống kê và nhật ký hiển thị đúng dữ liệu admin_logs khi API GET /admin/stats và GET /admin/logs được xác nhận (G-49, G-50). AC-40.2: Chỉ ADMIN truy cập được. AC-40.3: Danh sách chỉ số dashboard: TBD. |

# CHƯƠNG 4 — YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)
## 4.1. Danh sách yêu cầu phi chức năng
Nguồn: SRS v2.1 (baseline gốc).
| Mã | Nhóm | Yêu cầu |
| --- | --- | --- |
| NFR-01 | Performance | API đăng nhập, tìm kiếm và ứng tuyển có thời gian phản hồi p95 ≤ 1.5 giây trong môi trường kiểm thử tải bình thường đã định nghĩa; ghi rõ cấu hình máy và dữ liệu kiểm thử trong biên bản. |
| NFR-02 | Security | 100% mật khẩu lưu dưới dạng hash bằng thuật toán phù hợp; không lưu plaintext. |
| NFR-03 | Security | API riêng tư yêu cầu JWT hợp lệ; kiểm tra role và quyền sở hữu tài nguyên ở backend. |
| NFR-04 | Compatibility | Giao diện responsive trên desktop, tablet và mobile browser hiện đại. |
| NFR-05 | Validation | Dữ liệu đầu vào được kiểm tra ở backend; lỗi validation trả cấu trúc thống nhất. |
| NFR-06 | Privacy | Chỉ hiển thị dữ liệu hồ sơ/CV cho đúng đối tượng và mục đích nghiệp vụ; không lộ dữ liệu nhạy cảm qua API công khai. |
| NFR-07 | Reliability | Thao tác cập nhật nhiều bản ghi liên quan phải dùng transaction để tránh trạng thái dở dang. |
| NFR-08 | Maintainability | Backend chia module/routes/controllers/services/data-access; cấu hình môi trường nằm ngoài mã nguồn. |
| NFR-09 | Auditability | Thao tác Admin và chuyển trạng thái quan trọng lưu actor, action, target, timestamp. |
| NFR-10 | Backup | Có quy trình sao lưu và phục hồi PostgreSQL được mô tả, thử nghiệm trong giai đoạn triển khai. |

## 4.2. Ràng buộc kiến trúc liên quan
| Thành phần | Yêu cầu |
| --- | --- |
| Frontend | React.js, responsive web |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Authentication | JWT |
| Password hashing | bcrypt |
| Authorization | RBAC |
| API base path | /api/v1 |
| Ownership validation | Backend phải kiểm tra quyền sở hữu tài nguyên |
| Input validation | Backend phải kiểm tra dữ liệu đầu vào |

## 4.3. Dịch vụ ngoài và phụ thuộc chưa xác định
| Dịch vụ | Trạng thái |
| --- | --- |
| Email/OTP Provider | TBD |
| SMS/OTP Provider | TBD |
| File Storage cho CV và Deliverable | TBD |

Lưu ý: NFR-01 có ngưỡng p95 ≤ 1.5 giây, nhưng kết quả kiểm thử chỉ được xác nhận khi có môi trường, dữ liệu và biên bản kiểm thử thực tế. Không xem ngưỡng yêu cầu là bằng chứng hệ thống đã đạt hiệu năng.
## 4.4. Phương pháp đo và điều kiện kiểm cho NFR
Nội dung [ĐỀ XUẤT – chờ duyệt]. Cột điều kiện kiểm nêu dữ liệu hoặc quyết định cần có trước khi kiểm; ô ghi TBD tham chiếu Gap tương ứng.
| NFR | Phương pháp đo | Điều kiện kiểm | Gap / Decision |
| --- | --- | --- | --- |
| NFR-01 | Kiểm thử tải trên 3 API (POST /auth/login, GET /jobs, POST /jobs/:jobId/applications); lấy p95 từ công cụ tải. | Cấu hình máy, số người dùng đồng thời và kích thước dữ liệu: TBD (G-52 chưa có benchmark). | G-52 |
| NFR-02 | Kiểm tra bảng users: 0 giá trị password_hash không có tiền tố bcrypt; rà soát log và response không chứa mật khẩu. | Dữ liệu seed và dữ liệu đăng ký thử. | — |
| NFR-03 | Ma trận Role × Endpoint; gọi không token, token hết hạn, role sai, tài nguyên của người khác; kỳ vọng 401/403. | Cần C1 (JWT expiry) để kiểm token hết hạn. | G-56 / C1 |
| NFR-04 | Kiểm thủ công theo breakpoint đã chốt trên trình duyệt mục tiêu; mỗi màn hình không bị cuộn ngang ngoài ý muốn. | Breakpoint và danh sách trình duyệt: TBD (G-53). | G-53 |
| NFR-05 | Gửi dữ liệu sai kiểu/thiếu trường cho từng endpoint ghi; kỳ vọng 400 và cấu trúc lỗi theo File 06 §1. | Cấu trúc lỗi chuẩn (File 06). | — |
| NFR-06 | Gọi API công khai bằng Guest và rà các trường response; Employer chỉ xem CV của ứng viên đã nộp vào Job của mình. | Chính sách xem CV: TBD (G-54). | G-54 |
| NFR-07 | Gây lỗi giữa chừng (mô phỏng lỗi DB) ở các thao tác đăng ký, chọn ứng viên, duyệt Job, hoàn thành Assignment; kỳ vọng rollback toàn bộ. | Khả năng chèn lỗi trong môi trường kiểm thử. | — |
| NFR-08 | Rà soát cấu trúc thư mục và không có secret trong repo (checklist code review). | Cần repo mã nguồn (chưa có bằng chứng). | — |
| NFR-09 | Thực hiện mỗi thao tác Admin; kỳ vọng đúng một bản ghi admin_logs có đủ 4 trường. | Danh sách 'chuyển trạng thái quan trọng' ngoài Admin: TBD. | — |
| NFR-10 | Thực hiện một lần sao lưu rồi phục hồi sang môi trường trống; đối chiếu số dòng các bảng chính. | Quy trình sao lưu chưa có (G-55). | G-55 |

# CHƯƠNG 5 — QUY TẮC NGHIỆP VỤ (BUSINESS RULES)
## 5.1. Danh sách Business Rules
Nguồn: SRS v2.1 (baseline gốc).
| Mã | Quy tắc nghiệp vụ |
| --- | --- |
| BR-01 | Người dùng phải đăng nhập để thực hiện hành động cần ghi nhận danh tính như ứng tuyển, gửi Proposal, tạo tin, đánh giá. |
| BR-02 | Tài khoản đăng ký công khai chỉ được chọn Student hoặc Individual Employer; Admin được cấp bởi quy trình quản trị, không tự đăng ký. |
| BR-03 | Employer phải xác minh email và số điện thoại thành công trước khi tạo/gửi duyệt tin. |
| BR-04 | Employer chỉ được xem/sửa/đóng tin và quản lý hồ sơ thuộc quyền sở hữu của mình. |
| BR-05 | Job có job_type thuộc PART_TIME, SEASONAL hoặc FREELANCE. |
| BR-06 | Job chỉ được công khai khi đáp ứng điều kiện dữ liệu và trạng thái kiểm duyệt. |
| BR-07 | Job đóng, hết hạn, bị từ chối hoặc không còn nhận hồ sơ không nhận Application/Proposal mới. |
| BR-08 | Một Student chỉ có một Application đang/đã được ghi nhận cho cùng Job; rút đơn không tự xóa lịch sử. |
| BR-09 | Freelance dùng Proposal riêng, không thay thế bằng Application thông thường. |
| BR-10 | Một Job có thể tuyển nhiều Student; số Assignment được chấp nhận không vượt quantity_required. |
| BR-11 | Mỗi Student được chọn phải có Work Assignment riêng gắn với Application/Proposal tương ứng. |
| BR-12 | Job status, Application/Proposal status và Work Assignment status là ba vòng đời độc lập. |
| BR-13 | Chỉ các bên liên quan của Assignment được xem/cập nhật tiến độ và Deliverable. |
| BR-14 | Freelance chỉ hoàn thành khi Employer chấp nhận Deliverable cuối cùng; yêu cầu chỉnh sửa đưa Assignment về trạng thái cần sửa. |
| BR-15 | Chỉ Assignment COMPLETED mới cho phép hai bên đánh giá; mỗi bên tối đa một Review cho mỗi Assignment. |
| BR-16 | Thông báo chỉ được tạo sau khi thay đổi nghiệp vụ được lưu thành công. |
| BR-17 | Admin thực hiện thao tác quản trị phải được ghi nhật ký. |
| BR-18 | Hệ thống không thu, giữ hoặc chuyển tiền trong phạm vi hiện tại. |

Lưu ý: BR-14 mâu thuẫn với M1, UC-17 và File 06 §6.5 — xem CF-01 (Mục 3.4). Chữ của BR-14 được giữ nguyên chờ nhóm quyết định.
## 5.2. Quy tắc lựa chọn ứng viên — A3
Trạng thái: Logic đã thống nhất trong tài liệu, chưa có bằng chứng xác nhận triển khai.
Chỉ endpoint sau được phép thực hiện thao tác lựa chọn ứng viên và tạo Work Assignment:
POST /api/v1/jobs/:jobId/selections
Endpoint này chịu trách nhiệm:
1. Kiểm tra Job và quyền sở hữu của Employer.
2. Kiểm tra trạng thái Application/Proposal được chọn.
3. Kiểm tra số lượng đã được tuyển so với quantity_required.
4. Thiết lập trạng thái ACCEPTED cho Application hoặc Proposal được chọn.
5. Tạo Work Assignment riêng cho từng Student được chọn.
6. Bảo đảm các thao tác liên quan được xử lý nhất quán trong transaction hoặc cơ chế nguyên tử tương đương.
Hai endpoint sau không được tự thiết lập ACCEPTED và không được tự tạo Work Assignment:
PATCH /api/v1/applications/:id/status
PATCH /api/v1/proposals/:id/status
A3 là quy tắc đã được thống nhất trong tài liệu, nhưng chưa có bằng chứng xác nhận đã được triển khai trong mã nguồn.
## 5.3. Quy tắc phụ thuộc PB-07 và PB-08
DEP-01 — PB-07 → PB-08
- PB-08 phụ thuộc PB-07.
- PB-08 không được bắt đầu khi PB-07 chưa sẵn sàng.
- Nếu PB-07 chưa hoàn thành hoặc chưa đáp ứng điều kiện phụ thuộc, PB-08 phải được xem xét Blocked/Deferred hoặc dịch chuyển Sprint.
- Đây là ràng buộc kế hoạch Backlog, không phải trạng thái nghiệp vụ của JOBNEST.
## 5.4. Phân biệt các vòng đời nghiệp vụ
| Đối tượng | Trách nhiệm |
| --- | --- |
| Job | Quản lý vòng đời tin tuyển dụng |
| Application | Quản lý hồ sơ ứng tuyển Part-time/Seasonal |
| Proposal | Quản lý đề xuất cho công việc Freelance |
| Work Assignment | Quản lý công việc được giao cho từng Student |
| Deliverable | Quản lý các phiên bản bàn giao và quyết định nghiệm thu |

Không sử dụng trạng thái của đối tượng này để thay thế trạng thái của đối tượng khác.
# CHƯƠNG 6 — STATE MODELS VÀ VÒNG ĐỜI
## 6.1. Nguyên tắc mô hình trạng thái
JOBNEST quản lý các vòng đời nghiệp vụ độc lập cho Job, Application, Proposal, Work Assignment và Deliverable.
Việc thay đổi trạng thái phải đáp ứng các điều kiện nghiệp vụ, quyền của Actor và tính nhất quán dữ liệu.
Không được tự động suy luận rằng trạng thái của một đối tượng sẽ làm thay đổi trạng thái của đối tượng khác nếu chưa có quy tắc tương ứng.
## 6.2. Job Lifecycle
### 6.2.1. Sơ đồ trạng thái
DRAFT
|
v
PENDING_REVIEW
|
+---------------------> REJECTED
|
v
PUBLISHED
|
+---------------------> CLOSED
|
+---------------------> EXPIRED
### 6.2.2. Mô tả trạng thái
| Trạng thái | Mô tả |
| --- | --- |
| DRAFT | Employer đang soạn Job, chưa công khai. |
| PENDING_REVIEW | Job đã gửi duyệt; việc bắt buộc duyệt tất cả Job hay chỉ Job bị gắn cờ còn phụ thuộc C9. |
| PUBLISHED | Job được phép hiển thị và nhận hồ sơ. |
| REJECTED | Job bị từ chối; phải lưu moderation_reason. |
| CLOSED | Job đã đóng hoặc không còn nhu cầu tuyển dụng. |
| EXPIRED | Job đã quá hạn theo deadline. |

### 6.2.3. Quy tắc và vấn đề chưa chốt
- Job chỉ được công khai khi đáp ứng điều kiện dữ liệu và trạng thái kiểm duyệt.
- Job đóng, hết hạn hoặc bị từ chối không nhận Application/Proposal mới.
- Việc sửa Job sau khi đã Published có cần quay lại PENDING_REVIEW hay không còn TBD.
- Cơ chế chuyển sang EXPIRED bằng cron hoặc thao tác thủ công còn TBD theo C4.
- Quyền mở lại Job sau khi đóng hoặc hết hạn chưa được xác định.
## 6.3. Application Lifecycle
Application chỉ sử dụng cho Job PART_TIME và SEASONAL.
### 6.3.1. Sơ đồ trạng thái
PENDING
|
v
REVIEWING
|
v
SHORTLISTED
|
+---------------------> ACCEPTED
|
+---------------------> REJECTED

Các trạng thái chưa ACCEPTED
|
v
WITHDRAWN (theo chính sách)
### 6.3.2. Quy tắc
- Student gửi Application cho Job còn nhận hồ sơ.
- Application được ghi nhận ban đầu ở trạng thái PENDING.
- Employer xem xét và chuyển trạng thái theo quy tắc hợp lệ.
- Application chỉ được chuyển ACCEPTED thông qua endpoint Selection theo A3.
- Việc chuyển ACCEPTED phải được thực hiện cùng transaction tạo Work Assignment.
- Student chỉ được rút Application khi đáp ứng chính sách rút đơn.
- Chính sách rút Application còn TBD theo C2/S2.
- Việc rút đơn không tự xóa lịch sử Application.
## 6.4. Freelance Proposal Lifecycle
Proposal sử dụng riêng cho Job FREELANCE, không thay thế bằng Application thông thường.
### 6.4.1. Sơ đồ trạng thái
SUBMITTED
|
v
REVIEWING
|
+---------------------> ACCEPTED
|
+---------------------> REJECTED
|
+---------------------> WITHDRAWN
(nếu chính sách cho phép)
### 6.4.2. Quy tắc
- Student gửi Proposal cho Job Freelance đang nhận Proposal.
- Proposal ban đầu có trạng thái SUBMITTED.
- Employer xem xét Proposal và có thể chuyển sang trạng thái xét duyệt hợp lệ.
- Proposal chỉ được chuyển ACCEPTED thông qua endpoint Selection theo A3.
- Proposal ACCEPTED là nguồn tạo Work Assignment.
- Quy tắc rút Proposal còn TBD theo S3.
## 6.5. Work Assignment Lifecycle
Work Assignment được tạo riêng cho mỗi Student được lựa chọn.
### 6.5.1. Mô hình trạng thái đề xuất
NOT_STARTED
|
v
IN_PROGRESS
|
v
COMPLETED
Đối với Freelance, quá trình Deliverable có thể yêu cầu chỉnh sửa. Tuy nhiên, trạng thái chỉnh sửa thuộc Deliverable, không được tự động đưa vào vòng đời Work Assignment.
### 6.5.2. Quy tắc
- Mỗi Student được lựa chọn phải có Work Assignment riêng.
- Work Assignment có vòng đời độc lập với Job và Application/Proposal.
- Part-time/Seasonal không bắt buộc có Deliverable.
- Employer xác nhận hoàn thành Assignment theo quy trình tương ứng.
- Freelance chỉ hoàn thành sau khi Deliverable cuối cùng được chấp nhận và Employer xác nhận hoàn thành.
- T1/M1 — Work Assignment Lifecycle hiện là đề xuất, chưa được phê duyệt.
Lưu ý quan trọng: Không sử dụng SUBMITTED làm trạng thái Work Assignment. Trạng thái SUBMITTED thuộc vòng đời Deliverable.
## 6.6. Deliverable Lifecycle
Deliverable có vòng đời độc lập với Work Assignment.
### 6.6.1. Sơ đồ trạng thái
SUBMITTED
|
+---------------------> ACCEPTED
|
+---------------------> REVISION_REQUESTED
|
v
Student gửi lại
|
v
SUBMITTED
### 6.6.2. Quy tắc
- Student gửi Deliverable cho Work Assignment Freelance.
- Hệ thống lưu phiên bản bàn giao.
- Employer có thể chấp nhận hoặc yêu cầu chỉnh sửa.
- Nếu yêu cầu chỉnh sửa, Employer phải cung cấp lý do theo quy tắc nghiệp vụ.
- Mỗi lần gửi lại tạo phiên bản mới theo version_no.
- Khi Deliverable được chấp nhận, Assignment chưa tự động hoàn thành.
- Employer vẫn phải thực hiện bước xác nhận hoàn thành Assignment.
- Giới hạn số lần chỉnh sửa còn TBD theo C10.
## 6.7. Multi-hire Rule
Một Job có thể tuyển nhiều Student theo quantity_required.
Các nguyên tắc:
1. Tổng số Work Assignment được tạo từ các Application/Proposal đã được chấp nhận không vượt quantity_required.
2. Mỗi Student được chọn có một Work Assignment riêng.
3. Quá trình lựa chọn nhiều ứng viên phải được xử lý bằng transaction, locking hoặc cơ chế nguyên tử tương đương.
4. Nếu thao tác vượt số lượng hoặc dữ liệu không hợp lệ, hệ thống không được tạo Assignment một phần ngoài dự kiến.
5. Không suy ra Job đã hoàn thành chỉ vì một Work Assignment hoàn thành.
## 6.8. Các quyết định liên quan đến State Models
| Mã | Nội dung | Trạng thái |
| --- | --- | --- |
| C2 | Điều kiện cho phép Application chuyển WITHDRAWN | TBD |
| C4 | Cơ chế Job EXPIRED, đóng và mở lại Job | TBD |
| C9 | Duyệt tất cả Job hay chỉ Job bị gắn cờ | TBD |
| C10 | Giới hạn số lần chỉnh sửa Deliverable | TBD |
| S2 | Chính sách Withdraw Application | TBD |
| S3 | Chính sách Withdraw Proposal | TBD |
| T1/M1 | Work Assignment Lifecycle | Proposed — chưa phê duyệt |

## 6.9. Bảng chuyển trạng thái chi tiết
Tổng hợp từ Mục 6.2–6.6, Mục 5.2 và File 06. Ô ghi TBD là chỗ nguồn chưa nêu hoặc chưa chốt; không được hiểu là đã được phê duyệt. Mô hình Work Assignment (T1/M1) là đề xuất chưa duyệt.
### 6.9.1. Job
| Từ | Đến | Actor | Điều kiện | Nguồn |
| --- | --- | --- | --- | --- |
| (tạo mới) | DRAFT | Employer (chủ Job) | Employer đã xác minh email và số điện thoại (BR-03); dữ liệu Job lưu được | SRS §6.2; BR-03 |
| DRAFT | PENDING_REVIEW | Employer (chủ Job) | Dữ liệu đủ điều kiện gửi duyệt; POST /jobs/:jobId/submit-review | SRS §6.2; File 06 §4.5 |
| PENDING_REVIEW | PUBLISHED | Admin | Duyệt; set published_at; ghi admin_logs cùng transaction. Duyệt mọi Job hay chỉ Job bị gắn cờ: TBD (C9) | SRS §6.2; UC-08 |
| PENDING_REVIEW | REJECTED | Admin | Bắt buộc moderation_reason; ghi admin_logs cùng transaction | SRS §6.2; UC-08 |
| PUBLISHED | CLOSED | Employer (chủ Job) | Đóng thủ công; endpoint đóng Job [MISSING] (File 06 §4.6). Quyền mở lại: TBD | SRS §6.2; C4 |
| PUBLISHED | EXPIRED | Hệ thống (cron) hoặc thao tác thủ công – TBD | Quá deadline; cơ chế chọn cron/thủ công: TBD (C4) | SRS §6.2; C4 |
| PUBLISHED | PENDING_REVIEW | TBD | Sửa Job sau khi đã PUBLISHED có quay lại duyệt hay không: TBD | SRS §6.2.3 (TBD) |
| REJECTED | DRAFT | TBD | Employer sửa và gửi lại sau khi bị từ chối: chưa được nêu trong nguồn – TBD | Không có trong nguồn |

### 6.9.2. Application
| Từ | Đến | Actor | Điều kiện | Nguồn |
| --- | --- | --- | --- | --- |
| (tạo mới) | PENDING | Student | Job PUBLISHED, còn hạn, còn nhận hồ sơ; chưa có Application cho cùng Job (BR-08); Job không phải FREELANCE | SRS §6.3; UC-11 |
| PENDING | REVIEWING | Employer (chủ Job) | PATCH /applications/:id/status | SRS §6.3; File 06 §5.1 |
| REVIEWING | SHORTLISTED | Employer (chủ Job) | PATCH /applications/:id/status | SRS §6.3; File 06 §5.1 |
| PENDING / REVIEWING / SHORTLISTED | REJECTED | Employer (chủ Job) | PATCH cho phép đặt REJECTED; từ trạng thái nào được phép: sơ đồ SRS chỉ vẽ từ SHORTLISTED – TBD | File 06 §5.1; SRS §6.3.1 |
| (trạng thái nguồn được chọn) | ACCEPTED | Employer, chỉ qua POST /jobs/:jobId/selections | A3: cùng transaction với tạo Work Assignment; PATCH không được đặt ACCEPTED | SRS §5.2, §6.3.2; File 06 §6.1 |
| các trạng thái chưa ACCEPTED | WITHDRAWN | Student | Theo chính sách rút đơn: TBD (C2/S2); không xóa lịch sử (BR-08) | SRS §6.3.2; C2, S2 |

### 6.9.3. Proposal
| Từ | Đến | Actor | Điều kiện | Nguồn |
| --- | --- | --- | --- | --- |
| (tạo mới) | SUBMITTED | Student | Job FREELANCE đang PUBLISHED, nhận Proposal; chưa có Proposal trùng | SRS §6.4; UC-13 |
| SUBMITTED | REVIEWING | Employer (chủ Job) | PATCH /proposals/:id/status | SRS §6.4; File 06 §5.4 |
| SUBMITTED / REVIEWING | REJECTED | Employer (chủ Job) | PATCH /proposals/:id/status; trạng thái nguồn hợp lệ: sơ đồ SRS vẽ từ REVIEWING – TBD | File 06 §5.4; SRS §6.4.1 |
| (trạng thái nguồn được chọn) | ACCEPTED | Employer, chỉ qua POST /jobs/:jobId/selections | A3 | SRS §6.4.2 |
| SUBMITTED / REVIEWING | WITHDRAWN | Student | Nếu chính sách cho phép: TBD (S3); API-D5 [PENDING] | SRS §6.4.2; S3 |

### 6.9.4. Work Assignment
| Từ | Đến | Actor | Điều kiện | Nguồn |
| --- | --- | --- | --- | --- |
| (tạo mới) | NOT_STARTED hoặc IN_PROGRESS – TBD | Hệ thống (endpoint Selection) | Trạng thái khởi tạo chưa chốt: SRS vẽ NOT_STARTED, nhưng UC-16/17/18 yêu cầu IN_PROGRESS; T1/M1 là đề xuất chưa duyệt | SRS §6.5; T1/M1 |
| NOT_STARTED | IN_PROGRESS | TBD (Student hoặc hệ thống) | Điều kiện kích hoạt chưa được nêu trong nguồn – TBD | SRS §6.5.1 (đề xuất) |
| IN_PROGRESS | COMPLETED | Employer (chủ Job) | PART_TIME/SEASONAL: Employer xác nhận. FREELANCE: Deliverable mới nhất phải ACCEPTED rồi Employer xác nhận. Ghi completed_at. Idempotency: TBD (G-59) | SRS §6.5.2; File 06 §6.7; UC-18 |

### 6.9.5. Deliverable
| Từ | Đến | Actor | Điều kiện | Nguồn |
| --- | --- | --- | --- | --- |
| (tạo mới) | SUBMITTED | Student (được giao Assignment) | Assignment thuộc Job FREELANCE và đang IN_PROGRESS; version_no tăng dần | SRS §6.6; UC-17 |
| SUBMITTED | ACCEPTED | Employer (chủ Job) | PATCH /deliverables/:id/decision; Assignment chưa tự hoàn thành | SRS §6.6.2; File 06 §6.5 |
| SUBMITTED | REVISION_REQUESTED | Employer (chủ Job) | Bắt buộc comment; Assignment vẫn IN_PROGRESS. Giới hạn số lần: TBD (C10) | SRS §6.6.2; File 06 §6.5 |
| REVISION_REQUESTED | SUBMITTED | Student | Gửi phiên bản mới (version_no + 1) | SRS §6.6.1 |

# CHƯƠNG 7 — REQUIREMENT TRACEABILITY
## 7.1. Mục đích
Requirement Traceability dùng để theo dõi mối liên hệ giữa yêu cầu và các thành phần triển khai, thiết kế, kiểm thử.
Các loại liên kết được theo dõi gồm:
FR
|
+---- UC
|
+---- PB
|
+---- WF
|
+---- API
|
+---- Entity
|
+---- Test Case
Mục đích của ma trận:
- Kiểm tra mỗi FR có Use Case tương ứng.
- Kiểm tra yêu cầu có Product Backlog hỗ trợ.
- Kiểm tra chức năng có màn hình giao diện liên quan.
- Kiểm tra API có hỗ trợ nghiệp vụ.
- Kiểm tra Entity có dữ liệu phục vụ nghiệp vụ.
- Kiểm tra yêu cầu có Test Case tương ứng.
- Phát hiện yêu cầu thiếu thiết kế, API hoặc kiểm thử.
## 7.2. Cấu trúc ma trận truy vết
Ma trận truy vết sử dụng các cột:
| Cột | Ý nghĩa |
| --- | --- |
| FR | Mã yêu cầu chức năng |
| UC | Use Case liên quan |
| PB | Product Backlog |
| WF | Wireframe |
| API | API liên quan |
| Entity | Database Entity liên quan |
| Test IDs | Mã Test Case |
| Coverage | Mức độ bao phủ |
| Notes | Ghi chú, gap hoặc phụ thuộc |

Lưu ý: Các mã và liên kết cụ thể phải lấy từ Traceability Matrix nguồn. Không tự tạo mã UC, PB, WF, API hoặc Test Case để lấp ô trống.
## 7.3. Tổng quan Requirement Coverage
Theo baseline Traceability Matrix:
| Coverage | Số lượng FR | Tỷ lệ |
| --- | --- | --- |
| Mapped | 16 | 40% |
| Partial | 18 | 45% |
| Gap | 6 | 15% |
| Tổng | 40 | 100% |

Danh sách FR theo nhóm:

Mapped — 16 FR
FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07, FR-09, FR-10, FR-11, FR-12, FR-13, FR-16, FR-21, FR-31, FR-32

Partial — 18 FR
FR-08, FR-14, FR-15, FR-17, FR-18, FR-19, FR-23, FR-24, FR-25, FR-26, FR-27, FR-28, FR-29, FR-30, FR-33, FR-34, FR-35, FR-36

Gap — 6 FR
FR-20, FR-22, FR-37, FR-38, FR-39, FR-40
Có ghi nhận một sai khác giữa baseline phân loại và số lượng nhãn Coverage trong các dòng nguồn: số đếm nhãn theo từng dòng là 14 Mapped, 20 Partial và 6 Gap. Hai cách thống kê này được giữ riêng để đối chiếu, không tự ý thay đổi dữ liệu nguồn.
### 7.3.1. Bảng đối chiếu từng FR — giải thích chênh lệch 16/18/6 và 14/20/6
Hai cách thống kê (16/18/6 theo baseline; 14/20/6 theo nhãn từng dòng) chênh nhau 2 FR giữa nhóm Mapped và Partial. Bảy file nguồn không chứa các dòng nhãn gốc, nên không xác định được 2 FR nào bị lệch. Bảng dưới chấm mỗi FR theo 5 loại bằng chứng (UC, PB, WF, API, Entity) theo quy tắc [ĐỀ XUẤT – chờ duyệt]: mỗi loại đạt 1 điểm khi có nội dung thật, không TBD, API không [MISSING]/[PENDING]. Điểm này chỉ để nhóm đối chiếu; nhãn baseline được giữ nguyên. Công thức tính nằm ở sheet Coverage Recon của 03_JOBNEST_Traceability_Matrix.xlsx.
| FR | Baseline | Điểm | Đánh giá theo bằng chứng | Chênh lệch / phần thiếu |
| --- | --- | --- | --- | --- |
| FR-01 | Mapped | 5/5 | Đủ bằng chứng |  |
| FR-02 | Mapped | 4/5 | Một phần | Mapped nhưng thiếu: API |
| FR-03 | Mapped | 1/5 | Thiếu | Mapped nhưng thiếu: UC, PB, WF, API |
| FR-04 | Mapped | 4/5 | Một phần | Mapped nhưng thiếu: API |
| FR-05 | Mapped | 4/5 | Một phần | Mapped nhưng thiếu: API |
| FR-06 | Mapped | 4/5 | Một phần | Mapped nhưng thiếu: API |
| FR-07 | Mapped | 4/5 | Một phần | Mapped nhưng thiếu: API |
| FR-08 | Partial | 4/5 | Một phần |  |
| FR-09 | Mapped | 4/5 | Một phần | Mapped nhưng thiếu: API |
| FR-10 | Mapped | 4/5 | Một phần | Mapped nhưng thiếu: API |
| FR-11 | Mapped | 5/5 | Đủ bằng chứng |  |
| FR-12 | Mapped | 5/5 | Đủ bằng chứng |  |
| FR-13 | Mapped | 5/5 | Đủ bằng chứng |  |
| FR-14 | Partial | 4/5 | Một phần |  |
| FR-15 | Partial | 5/5 | Đủ bằng chứng | Partial nhưng đủ 5/5 – cần xem phần còn thiếu ở TBD/Gap của FR |
| FR-16 | Mapped | 5/5 | Đủ bằng chứng |  |
| FR-17 | Partial | 4/5 | Một phần |  |
| FR-18 | Partial | 5/5 | Đủ bằng chứng | Partial nhưng đủ 5/5 – cần xem phần còn thiếu ở TBD/Gap của FR |
| FR-19 | Partial | 5/5 | Đủ bằng chứng | Partial nhưng đủ 5/5 – cần xem phần còn thiếu ở TBD/Gap của FR |
| FR-20 | Gap | 4/5 | Một phần | Gap nhưng gần đủ: thiếu API |
| FR-21 | Mapped | 4/5 | Một phần | Mapped nhưng thiếu: PB |
| FR-22 | Gap | 3/5 | Một phần |  |
| FR-23 | Partial | 4/5 | Một phần |  |
| FR-24 | Partial | 4/5 | Một phần |  |
| FR-25 | Partial | 4/5 | Một phần |  |
| FR-26 | Partial | 4/5 | Một phần |  |
| FR-27 | Partial | 4/5 | Một phần |  |
| FR-28 | Partial | 4/5 | Một phần |  |
| FR-29 | Partial | 5/5 | Đủ bằng chứng | Partial nhưng đủ 5/5 – cần xem phần còn thiếu ở TBD/Gap của FR |
| FR-30 | Partial | 5/5 | Đủ bằng chứng | Partial nhưng đủ 5/5 – cần xem phần còn thiếu ở TBD/Gap của FR |
| FR-31 | Mapped | 5/5 | Đủ bằng chứng |  |
| FR-32 | Mapped | 4/5 | Một phần | Mapped nhưng thiếu: API |
| FR-33 | Partial | 5/5 | Đủ bằng chứng | Partial nhưng đủ 5/5 – cần xem phần còn thiếu ở TBD/Gap của FR |
| FR-34 | Partial | 5/5 | Đủ bằng chứng | Partial nhưng đủ 5/5 – cần xem phần còn thiếu ở TBD/Gap của FR |
| FR-35 | Partial | 5/5 | Đủ bằng chứng | Partial nhưng đủ 5/5 – cần xem phần còn thiếu ở TBD/Gap của FR |
| FR-36 | Partial | 5/5 | Đủ bằng chứng | Partial nhưng đủ 5/5 – cần xem phần còn thiếu ở TBD/Gap của FR |
| FR-37 | Gap | 4/5 | Một phần | Gap nhưng gần đủ: thiếu API |
| FR-38 | Gap | 4/5 | Một phần | Gap nhưng gần đủ: thiếu API |
| FR-39 | Gap | 4/5 | Một phần | Gap nhưng gần đủ: thiếu API |
| FR-40 | Gap | 3/5 | Một phần |  |

Kết quả: 6 FR baseline Mapped đủ 5/5 bằng chứng; 10 FR baseline Mapped còn thiếu ít nhất một loại bằng chứng (chủ yếu API [MISSING]/[PENDING]). Hai FR bị lệch giữa Mapped và Partial nằm trong nhóm 10 FR này nhưng không xác định được cụ thể; nhóm cần xác nhận (xem Ghi chú review còn mở).
## 7.4. Các điểm truy vết cần lưu ý
| FR | Vấn đề | Trạng thái |
| --- | --- | --- |
| FR-03 | Được hỗ trợ bởi JWT/RBAC middleware; không có endpoint riêng | Mapped theo cross-cutting middleware |
| FR-08 | Certificate CRUD chưa có nguồn đầy đủ; liên quan S1 | Partial |
| FR-20 | Saved Jobs API thuộc API-D2 | Chưa phê duyệt |
| FR-22 | Application history và withdraw API thuộc API-D3/S2 | TBD |
| FR-26 | Proposal review; PATCH chỉ được chuyển trạng thái hợp lệ, không tự ACCEPTED | A3 |
| FR-29 | Progress history; chưa xác định history endpoint riêng hay nhúng trong Assignment Detail | TBD |
| FR-30 | Actor cập nhật tiến độ có mâu thuẫn giữa FR, API và BR-13 | G-06 |
| FR-37 | Admin User Management; API bổ sung chưa xác nhận | Gap |
| FR-38 | Admin Category Management; API bổ sung chưa xác nhận | Gap |
| FR-39 | Reports; một số API và trạng thái xử lý chưa đầy đủ | Gap |
| FR-40 | Admin Dashboard và Logs; chưa có UC riêng và API chưa xác nhận | Gap |

## 7.5. Test Coverage
Theo Test Registry:
| Chỉ số | Số lượng |
| --- | --- |
| Tổng Test Case trong Registry | 334 |
| Not Run | 223 |
| TBD | 110 |
| Manual | 1 |
| Cross-reference pairs | 8 |
| Unique Coverage | 326 |
| Proposed Test Case chờ S4 | 17 |
| Official Unique Coverage nếu loại 17 Proposed | 309 |

Baseline ghi nhận 40/40 FR có Test IDs được liên kết. Tuy nhiên, trong bộ tài liệu hiện có không còn liên kết FR ↔ Test ID thật để kiểm chứng (ma trận truy vết trong bản File 08 cũ là dữ liệu giả và đã bị loại); cột Test trong 03_JOBNEST_Traceability_Matrix.xlsx ghi TBD cho đến khi File 08 được làm lại. Việc có Test ID cũng không đồng nghĩa tất cả yêu cầu đã có API hoàn chỉnh hoặc đã được kiểm thử.
### 7.5.1. Trạng thái thực thi
- Chưa có bằng chứng xác nhận Test Case nào đã Pass.
- Not Run không có nghĩa là Pass.
- TBD là chưa xác định đủ điều kiện hoặc nội dung kiểm thử.
- NR* phải được giữ riêng với TBD.
- 17 Test Case PROPOSED đang chờ quyết định S4, chưa được mặc định là Test Case chính thức.
### 7.5.2. Các Test Case bị chặn bởi G-35
Các Test Case sau cần xác minh ràng buộc dữ liệu và Source Integrity:
TC-HIRE-009 đến TC-HIRE-012
Trạng thái: Not Run* — bị chặn cho đến khi kiểm tra PostgreSQL XOR/source-integrity constraint và migration liên quan.
## 7.6. Cross-reference Test Cases
Tám cặp cross-reference được ghi nhận:
| STT | Test Case 1 | Test Case 2 |
| --- | --- | --- |
| 1 | TC-AUTHZ-001 | TC-INT-AUTH-006 |
| 2 | TC-AUTHZ-001-03 | TC-INT-AUTH-003 |
| 3 | TC-APP-002-02 | TC-INT-RACE-002 |
| 4 | TC-HIRE-014 | TC-INT-RACE-001 |
| 5 | TC-NOTI-003 | TC-INT-NOTI-001 |
| 6 | TC-MOD-001 | TC-SEARCH-001-05 |
| 7 | TC-VER-003 | TC-JOB-021 |
| 8 | TC-VER-003-02 | TC-JOB-022 |

Các cặp trên được dùng để xác định Unique Coverage, không tự ý xóa hoặc đổi mã Test Case nguồn.
## 7.7. Các Gap quan trọng
| Gap | Nội dung | Trạng thái |
| --- | --- | --- |
| G-06 | Actor cập nhật Progress chưa thống nhất | TBD |
| G-35 | Source integrity và XOR constraint của Work Assignment | TBD |
| G-48 | Trạng thái và hành động xử lý Report | TBD |
| G-49 | GET /admin/stats | Chưa xác nhận |
| G-50 | GET /admin/logs | Chưa xác nhận |
| G-57 | Nội dung Gap chưa có trong nguồn hiện tại | MISSING — cần xác nhận |
| G-58 | Cấu trúc Progress History và API liên quan | TBD |
| G-59 | Idempotency khi xác nhận hoàn thành Assignment | TBD |
| G-63 | Sai khác số lượng Job Management | Reconciliation |
| G-64 | Sai khác Missing Data Register | Reconciliation |

# CHƯƠNG 8 — TBD / DECISIONS / OPEN ISSUES
## 8.1. Decision Register — C1 đến C10
| Mã | Nội dung | Trạng thái |
| --- | --- | --- |
| C1 | JWT expiry | TBD |
| C2 | Điều kiện cho phép WITHDRAWN | TBD |
| C3 | Notification trigger list | TBD |
| C4 | Cơ chế Job EXPIRED: cron hoặc manual | TBD |
| C5 | Ràng buộc CV mặc định — T2 | Proposed — chưa migration |
| C6 | Admin provisioning | TBD |
| C7 | Quy tắc salary_* và budget_* theo job_type | TBD |
| C8 | Source integrity của work_assignments.student_id — G-35 | TBD |
| C9 | Moderation Policy | TBD |
| C10 | Revision limit, rating scale và comment rules | TBD |

## 8.2. Decision Register — S1 đến S6
| Mã | Nội dung | Trạng thái |
| --- | --- | --- |
| S1 | Certificate trong FR-08 | TBD |
| S2 | Withdraw Application | TBD |
| S3 | Withdraw Proposal | TBD |
| S4 | Tách PB-32 thành User/Category/Log | TBD |
| S5 | Category routes | TBD |
| S6 | Salary/Budget CHECK theo job_type | TBD |

## 8.3. Technical Proposal và các quy tắc liên quan
| Mã | Nội dung | Trạng thái |
| --- | --- | --- |
| T1/M1 | Work Assignment Lifecycle | Proposed — chưa phê duyệt |
| T2 | Partial unique index cho CV mặc định | Proposed — chưa migration |
| A3 | Selection Rule | Logic áp dụng trong tài liệu; chưa có bằng chứng code |
| DEP-01 | PB-07 → PB-08 dependency | Phụ thuộc Backlog |
| EPIC-GAP-01 | 12 vị trí Epic chưa có mapping | TBD |

## 8.4. API-D1 đến API-D10
Các API dưới đây được ghi nhận là API bổ sung cần đối chiếu/phê duyệt, không mặc định là API đã được triển khai.
| Mã | Nhóm API | Nội dung |
| --- | --- | --- |
| API-D1 | Student Profile | CV CRUD |
| API-D2 | Saved Jobs | Lưu và bỏ lưu Job (File 06 không có mục API-D2 hay endpoint Saved Jobs) |
| API-D3 | Application | Application history và withdraw (File 06: D3 = history, D4 = withdraw) |
| API-D4 | Application (File 06) | Chưa xác định đủ nội dung trong SRS; File 06 ghi API-D4 = Application withdrawal [PENDING] |
| API-D5 | Freelance Proposal | Withdraw Proposal |
| API-D6 | Deliverable | Lấy danh sách phiên bản Deliverable |
| API-D7 | Admin User | Quản lý trạng thái người dùng |
| API-D8 | Admin Category | Quản lý Category |
| API-D9 | Public Category | Public categories |
| API-D10 | Reports | Submit Report |

Các chi tiết chưa được xác định trong nguồn cần tiếp tục đối chiếu với API Contract. Không tự suy diễn method, request schema hoặc response schema cho endpoint còn thiếu.
Lưu ý đánh số: bảng API-D1..D10 của File 03 và File 06 chưa trùng nhau ở D2, D3, D4 (xem CF-04, Mục 3.4). Cần nhóm thống nhất; tài liệu này không tự đổi mã.
## 8.5. Các vấn đề nghiệp vụ còn mở
| Mã / Gap | Nội dung | Ảnh hưởng |
| --- | --- | --- |
| G-06 | Actor cập nhật Progress chưa thống nhất | FR-30, UC-16, BR-13 |
| G-15 | OTP expiry | Verification |
| G-16 | OTP rate limit | Verification |
| G-21 | Quy tắc Search | Search |
| G-23 | Hiển thị Job hết hạn/đóng | Job Search/Detail |
| G-25 đến G-31 | Các vấn đề Application | Application Management |
| G-32 đến G-40 | Các vấn đề Freelance | Proposal, Selection, Assignment, Deliverable |
| G-41 | Review comment required/optional | Review |
| G-42 | Review comment max length | Review |
| G-43 | Notification mark-read idempotency | Notification |
| G-44 | Notification deletion policy | Notification |
| G-48 | Report status/actions | Admin Reports |
| G-51 | Duplicate Report policy | Admin Reports |
| G-52 | NFR-01 benchmark chưa có | Performance |
| G-53 | NFR-04 breakpoint proposal chưa chốt | Responsive UI |
| G-54 | NFR-06 CV viewing policy chưa chốt | Privacy |
| G-55 | NFR-10 backup procedure chưa có | Backup |
| G-56 | JWT expiry chưa chốt | Authentication |
| G-58 | Progress history API/response | Work Management |
| G-59 | Assignment completion idempotency | Work Completion |
| G-60 đến G-62 | Các vấn đề Process & Deployment | Deployment/Documentation |
| G-63 | Reconciliation Job Management count | Traceability |
| G-64 | Reconciliation Missing Data count | Test Registry |

## 8.6. Missing Data Register
Sáu nội dung thiếu dữ liệu được ghi nhận:
| STT | Nội dung thiếu | Nguồn liên quan |
| --- | --- | --- |
| 1 | Profile Certificate CRUD | S1 |
| 2 | Quy tắc location matching cho TC-SEARCH-001-08 | Discovery |
| 3 | Setup command và health-check endpoint cho TC-TECH-001 | Process |
| 4 | Official OpenAPI cho TC-TECH-002 | Process |
| 5 | E2E Test Plan cho TC-INT-001 | Process |
| 6 | Deployment target và README structure cho TC-DEP-001 | Process |

Ngoài ra, G-57 được đánh dấu [MISSING — cần đối chiếu nguồn]; không tự điền nội dung khi chưa có nguồn xác nhận.
## 8.7. Các điểm cần xác nhận trước khi hoàn tất thiết kế
1. Nhà cung cấp Email OTP và SMS OTP.
2. Thời hạn OTP và giới hạn số lần thử.
3. JWT expiry và hành vi Logout.
4. Chính sách duyệt Job theo C9.
5. Chính sách Withdraw Application và Proposal.
6. Quy tắc Salary/Budget theo từng Job type.
7. Chính sách CV, Certificate và File Storage.
8. Source Integrity giữa Application/Proposal và Work Assignment.
9. Actor có quyền cập nhật Progress theo G-06.
10. Notification trigger list theo C3.
11. Revision limit theo C10.
12. Rating scale và giới hạn Review comment.
13. Report status/action và duplicate policy.
14. API bổ sung API-D1 đến API-D10.
15. Các API liên quan FR-40: /admin/stats và /admin/logs.
16. DDL và Migration cho Database.
# CHƯƠNG 9 — LIMITATIONS AND CURRENT STATUS
## 9.1. Giới hạn hiện tại của tài liệu
Tài liệu SRS hiện tại có các giới hạn sau:
- Một số yêu cầu đã có mô tả chức năng nhưng chưa có đầy đủ đặc tả Use Case.
- Một số API chưa được xác nhận hoặc chưa có request/response schema.
- Một số quyết định nghiệp vụ vẫn ở trạng thái TBD.
- Một số mô hình trạng thái là đề xuất, chưa được phê duyệt.
- Một số liên kết giữa FR, UC, PB, WF, API, Entity và Test Case cần tiếp tục đối chiếu.
- Chưa có bằng chứng xác nhận toàn bộ chức năng đã được triển khai.
- Chưa có bằng chứng xác nhận Test Case đã thực thi và Pass.
## 9.2. Trạng thái các thành phần tài liệu
| Thành phần | Số lượng / Phạm vi | Trạng thái |
| --- | --- | --- |
| Functional Requirements | 40 | Có danh sách và mô tả |
| Non-functional Requirements | 10 | Có danh sách và mô tả |
| Business Rules | 18 | Có danh sách và mô tả |
| UC Catalog | 22 | Có tên và Actor |
| UC Specification | 22 | Cần đối chiếu tài liệu đặc tả chi tiết |
| State Models | 5 nhóm đối tượng | Có mô hình, một số quyết định chưa phê duyệt |
| Wireframe | 44 mã màn hình | Cần đối chiếu tài liệu Wireframe v3.3 (36 gốc + 6 đề xuất + 1 template + 1 TBD) |
| Test Registry | 334 Test Cases | Có Registry; chưa có bằng chứng thực thi |
| Traceability | 40 FR | Có ma trận (03_JOBNEST_Traceability_Matrix.xlsx); còn Partial và Gap; cột Test = TBD |
| Database | 30 Entity | Có Logical ERD; chưa xác nhận Physical DDL/Migration |

## 9.3. Trạng thái Database và ERD
Database sử dụng PostgreSQL.
Logical ERD hiện có 30 Entity thuộc 6 nhóm:
| Nhóm | Số Entity |
| --- | --- |
| Accounts | 5 |
| Student | 4 |
| Job | 8 |
| Application/Proposal | 4 |
| Work | 4 |
| System | 5 |
| Tổng | 30 |

Logical ERD không đồng nghĩa với Physical DDL đã hoàn thiện.
Các nội dung cần tiếp tục xác nhận:
- Role/Profile integrity.
- Student Certificate.
- Default CV constraint.
- Job subtype integrity.
- Application/Proposal source integrity.
- Work Assignment source integrity.
- Deliverable versioning.
- Review constraints.
- Report target integrity.
- Foreign key delete policy.
- Indexes và transaction constraints.
Trạng thái: Logical ERD có nguồn; chưa xác nhận DDL và Migration đã được thực thi.
## 9.4. Trạng thái API
- API sử dụng REST và prefix /api/v1.
- Authentication sử dụng JWT.
- API nghiệp vụ phải kiểm tra Role và Ownership.
- Selection endpoint theo A3 là quy tắc đã thống nhất.
- API-D1 đến API-D10 vẫn cần xác nhận.
- /admin/stats và /admin/logs chưa được xác nhận trong API Contract.
- Các endpoint thiếu request/response schema cần được đánh dấu Missing/TBD.
Không xem danh sách API trong tài liệu là bằng chứng endpoint đã được triển khai.
## 9.5. Trạng thái kiểm thử
Theo Test Registry:
| Trạng thái | Số lượng |
| --- | --- |
| Not Run | 223 |
| TBD | 110 |
| Manual | 1 |
| Tổng | 334 |

- Có 8 cặp cross-reference.
- Unique Coverage: 326.
- Có 17 Test Case Proposed đang chờ quyết định S4.
- Nếu loại 17 Proposed khỏi phạm vi chính thức, Official Unique Coverage là 309 theo baseline hiện tại.
- Chưa có bằng chứng xác nhận Test Case nào đã Pass.
## 9.6. Điều kiện để xem SRS hoàn tất
Tài liệu chỉ được xem là hoàn tất sau khi các điều kiện sau được rà soát:
| STT | Điều kiện | Trạng thái hiện tại |
| --- | --- | --- |
| 1 | 40 FR có nội dung | Có |
| 2 | 10 NFR có nội dung | Có |
| 3 | 18 BR có nội dung | Có |
| 4 | 22 UC Catalog | Có |
| 5 | Đối chiếu đầy đủ 22 UC Specification | Cần đối chiếu |
| 6 | Đối chiếu 44 mã màn hình Wireframe (36 gốc + 6 đề xuất + 1 template + 1 TBD) | Cần đối chiếu |
| 7 | Hoàn thiện ma trận FR ↔ UC ↔ PB ↔ WF ↔ API ↔ Entity ↔ TC | Chưa hoàn tất |
| 8 | C1–C10 và S1–S6 được chốt hoặc có phương án | Còn TBD |
| 9 | T1/M1, T2, A3 và API-D1..D10 có trạng thái rõ ràng | Cần xác nhận |
| 10 | G-35, G-49, G-50 được đóng hoặc có kế hoạch xử lý | Chưa đóng |
| 11 | ERD 30 Entity có DDL chi tiết | Chưa xác nhận |
| 12 | Database Migration đã chạy và có bằng chứng | Chưa xác nhận |
| 13 | Test Case có kết quả thực thi và bằng chứng | Chưa xác nhận |

## 9.7. Kết luận trạng thái tài liệu
JOBNEST SRS v1.2 là bản hợp nhất yêu cầu ở trạng thái DRAFT.
Tài liệu đã tổng hợp danh sách 40 Functional Requirements, 10 Non-functional Requirements, 18 Business Rules, 22 Use Case Catalog và các mô hình vòng đời nghiệp vụ.
Tuy nhiên, các quyết định chưa được phê duyệt, API chưa xác nhận, các khoảng trống trong Traceability, Database DDL/Migration và bằng chứng kiểm thử vẫn cần được xử lý trước khi tài liệu được xem là hoàn tất.
Trạng thái cuối: DRAFT — Đủ điều kiện review chính thức (chưa Approved)
# PHỤ LỤC A — BẢNG ĐỐI CHIẾU THAY ĐỔI (REVISION 2)
| Mục sửa | Lý do | File nguồn |
| --- | --- | --- |
| Bảng thông tin đầu tài liệu: nhãn phiên bản "Revision 2"; sửa "Nguồn chính" 02_JOBNEST_SRS_v2.1.docx → SRS v2.1 (baseline gốc) | Tên cũ trùng với số thứ tự File 02 hiện hành (Product Backlog); thống nhất nhãn phiên bản với File 01 | File 01, File 02 |
| REF-02, REF-05; Mục 3.1, 4.1, 5.1 (dòng Nguồn); thêm REF-06..09 | Sửa tên nguồn tham chiếu; Wireframe nay là 44 mã; bổ sung các tài liệu tham chiếu 06, 07, 08 và ma trận | File 05, 06, 07, 08 |
| FR-02: bỏ cụm "đã triển khai" | Không có bằng chứng triển khai; /auth/logout còn [MISSING] | File 06 |
| Mục 3.2, 5.2: ghi chú trỏ tới CF-01, CF-02; chữ BR-14 và FR-26 giữ nguyên | Không tự chốt mâu thuẫn | File 03, 04, 06 |
| Mục 3.4 (mới): CF-01..CF-05 | Nêu cả hai vế mâu thuẫn kèm câu thống nhất đề xuất | File 03, 04, 06 |
| Mục 3.5 (mới): tiêu chí chấp nhận cho 40 FR | Yêu cầu bổ sung 2–4 tiêu chí đo được mỗi FR; dựa trên luồng và mã lỗi trong File 04, File 06 | File 04, 06 |
| Mục 4.4 (mới): phương pháp đo và điều kiện kiểm NFR | NFR chưa có phương pháp đo; ngưỡng chưa có ghi TBD | File 03 |
| Mục 6.9 (mới): bảng chuyển trạng thái cho Job, Application, Proposal, Assignment, Deliverable | Thiếu bảng from → to, actor, điều kiện; chỗ nguồn chưa nêu ghi TBD | File 03, 04, 06 |
| Mục 7.3.1 (mới): bảng đối chiếu từng FR | Giải thích lệch 16/18/6 và 14/20/6; không xác định được 2 FR lệch từ 7 file | File 03 |
| Mục 7.5: sửa câu "40/40 FR có Test IDs" | Liên kết FR ↔ Test ID thật không còn trong nguồn; ma trận File 08 cũ là dữ liệu giả | File 08 |
| Mục 8.4: chú thích API-D2, D3, D4 và lưu ý đánh số | File 06 không có API-D2; D3/D4 khác nghĩa giữa File 03 và File 06 | File 06 |
| Mục 9.2, 9.6: Wireframe 36 → 44 mã; Traceability có ma trận xlsx | Đồng bộ với File 05 v3.3 và ma trận mới | File 05 |

# KẾT THÚC TÀI LIỆU
JOBNEST — SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
| Thuộc tính | Giá trị |
| --- | --- |
| Tên file | 03_JOBNEST_SRS.docx |
| Phiên bản | v1.2 — Consolidated Draft — Revision 2: đối chiếu liên file |
| Trạng thái | DRAFT — Đủ điều kiện review chính thức |
| Phê duyệt | Chưa Approved |

## Ghi chú review còn mở
Hai vấn đề được giữ lại để nhóm quyết định trong buổi review, không tự ý chỉnh sửa số liệu:
1. Traceability Coverage: Xác nhận sử dụng baseline 16 Mapped / 18 Partial / 6 Gap hay số đếm nhãn theo từng dòng 14 Mapped / 20 Partial / 6 Gap.
2. G-57: Xác nhận G-57 là Gap thực sự bị thiếu nội dung hay là mã không tồn tại trong Gap Register.
3. Mâu thuẫn CF-01 đến CF-05 (Mục 3.4): nhóm chọn phương án thống nhất cho BR-14/M1, FR-26/A3, trạng thái khởi tạo của Assignment, đánh số API-D và mã G-49.
4. Hai FR bị lệch giữa Mapped và Partial (Mục 7.3.1): nhóm chỉ ra FR nào.
Kết luận: File 03 SRS v1.2 — Revision 2 gồm 9 chương và Phụ lục A, đủ điều kiện đưa ra review chính thức. Các điểm trên là quyết định của nhóm, không phải nội dung được tự ý chốt trong tài liệu.