<!-- converted from 06_JOBNEST_API_Contract.docx -->

JOBNEST — API CONTRACT
Tên tài liệu: JOBNEST API Contract
Phiên bản: Draft — v2.1 — Revision 2: đối chiếu liên file
Định dạng bàn giao: Microsoft Word (06_JOBNEST_API_Contract.docx) + Excel (06_JOBNEST_Endpoint_Catalogue.xlsx)
Trạng thái: DRAFT — Chờ nhóm review và xác nhận
Nguồn đối chiếu: File 03 (SRS v1.2 Revision 2), 03_JOBNEST_Traceability_Matrix.xlsx, File 04 (UC Revision 2), File 05 (Wireframe v3.3), File 07 (ERD).
Quy ước nhãn: [ĐỀ XUẤT – chờ duyệt] là nội dung do biên soạn đề xuất, chưa được nhóm phê duyệt. TBD là chưa có quyết định, không tự điền. [PENDING]/[MISSING] là nhãn gốc của File 06. Các endpoint, method, nhãn trạng thái và API-D của bản v2.1 được giữ nguyên.
# 1. GENERAL / API BASELINE
## 1.1. API conventions
| Thuộc tính | Giá trị |
| --- | --- |
| API Base URL | /api/v1 |
| Architecture | REST API |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Authentication | JWT Bearer Token |
| Content-Type | application/json |
| Authorization | RBAC |
| Pagination | page=1, limit=20 |
| Maximum limit | TBD |

## 1.2. Response format
Success response
{
"data": {}
}

Paginated response
{
"data": [],
"pagination": {
"page": 1,
"limit": 20,
"total": 0
}
}

Error response
{
"error": {
"code": "ERROR_CODE",
"message": "Error message",
"details": {}
}
}

## 1.3. HTTP status codes
| HTTP Status | Ý nghĩa |
| --- | --- |
| 200 | OK |
| 201 | Created |
| 202 | Accepted |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 410 | Gone |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## 1.4. User roles
| Role | Mô tả |
| --- | --- |
| GUEST | Người dùng chưa đăng nhập |
| STUDENT | Sinh viên |
| INDIVIDUAL_EMPLOYER | Nhà tuyển dụng cá nhân |
| ADMIN | Quản trị viên |

# 2. AUTHENTICATION & VERIFICATION
## 2.1. Authentication endpoints
| Method | Endpoint | Mục đích | Trạng thái |
| --- | --- | --- | --- |
| POST | /auth/register | Đăng ký tài khoản | Baseline |
| POST | /auth/login | Đăng nhập | Baseline |
| POST | /auth/logout | Đăng xuất | [MISSING] |
| POST | /auth/forgot-password | Yêu cầu đặt lại mật khẩu | Baseline |
| — | Reset password endpoint | Đặt lại mật khẩu | [MISSING] |

POST /auth/register
Đối tượng đăng ký:
- Student.
- Individual Employer.
Request fields:
- Email.
- Password.
- Role.
- Các thông tin đăng ký theo loại tài khoản.
Response fields:
- userId
- role
Schema chi tiết cần đối chiếu tài liệu nguồn.
POST /auth/login
Request:
{
"email": "user@example.com",
"password": "password"
}

Response:
{
"accessToken": "JWT_TOKEN",
"role": "STUDENT",
"userId": "USER_ID"
}

POST /auth/forgot-password
Request:
{
"email": "user@example.com"
}

Response: HTTP 202 với thông báo chung, không tiết lộ email có tồn tại hay không.
## 2.2. Email and phone verification
Employer phải xác minh email và số điện thoại bằng OTP trước khi được phép đăng Job.
| Chức năng | Endpoint | Trạng thái |
| --- | --- | --- |
| Request email OTP | Chưa xác định | [MISSING] |
| Verify email OTP | Chưa xác định | [MISSING] |
| Request phone OTP | Chưa xác định | [MISSING] |
| Verify phone OTP | Chưa xác định | [MISSING] |

Các vấn đề còn mở:
- G-15: OTP expiry.
- G-16: Rate limit và số lần nhập OTP.
- Email/SMS provider: TBD.
# 3. PROFILE & CV MANAGEMENT
## 3.1. Profile endpoints
Các endpoint quản lý Student Profile và Employer Profile chưa được đặc tả đầy đủ.
| Chức năng | Endpoint | Trạng thái |
| --- | --- | --- |
| Get own profile | [MISSING] | [MISSING] |
| Update own profile | [MISSING] | [MISSING] |
| Get public profile | [MISSING] | [MISSING] |
| Update employer profile | [MISSING] | [MISSING] |

## 3.2. CV management — API-D1
| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | /students/me/cvs | Lấy danh sách CV |
| POST | /students/me/cvs | Tạo CV |
| PATCH | /students/me/cvs/:id | Cập nhật CV |
| DELETE | /students/me/cvs/:id | Xóa CV |

Trạng thái: [PENDING]
Các nội dung chưa được xác nhận:
- Request/response schema chi tiết.
- Quy tắc lưu CV.
- Giới hạn và định dạng file.
- S1: Certificate CRUD chưa được đặc tả.
- T2: Unique index cho CV mặc định là đề xuất, chưa xác nhận đã migration.
# 4. JOB MANAGEMENT & SEARCH
## 4.1. Job listing
GET /jobs
Query parameters:
| Parameter | Mô tả |
| --- | --- |
| keywords | Từ khóa tìm kiếm |
| job_type | Loại công việc |
| category | Danh mục |
| location | Địa điểm |
| salary_min | Mức lương tối thiểu |
| salary_max | Mức lương tối đa |
| page | Trang |
| limit | Số bản ghi mỗi trang |
| sort | Thứ tự sắp xếp |

Response mẫu:
{
"data": [
{
"jobId": "JOB_ID",
"title": "Job title",
"jobType": "PART_TIME",
"location": "Ho Chi Minh City"
}
],
"pagination": {
"page": 1,
"limit": 20,
"total": 1
}
}

Các vấn đề liên quan: G-21, G-22, G-24 và S6 vẫn TBD.
## 4.2. Job detail
GET /jobs/:jobId
Lấy chi tiết Job.
Response mẫu:
{
"data": {
"jobId": "JOB_ID",
"title": "Job title",
"jobType": "FREELANCE",
"description": "Job description"
}
}

G-23: Nội dung cần xác minh theo tài liệu nguồn.
## 4.3. Create Job
POST /jobs
Chỉ Individual Employer đã xác minh email và phone mới được tạo Job.
Các loại Job:
- PART_TIME
- SEASONAL
- FREELANCE
Request mẫu:
{
"title": "Part-time job",
"jobType": "PART_TIME",
"description": "Job description"
}

Response trạng thái ban đầu: DRAFT.
Các trường chi tiết theo từng loại Job cần đối chiếu schema nguồn. Quy tắc salary/budget theo S6 vẫn TBD.
## 4.4. Update Job
Endpoint cập nhật Job đang có vấn đề cần đối chiếu giữa API Contract và tài liệu nguồn.
- Method: PATCH hoặc PUT — chưa chốt.
- Endpoint dự kiến: /jobs/:jobId.
- Không tự ý chọn method thay nhóm.
## 4.5. Submit Job for review
| Method | Endpoint | Mục đích |
| --- | --- | --- |
| POST | /jobs/:jobId/submit-review | Gửi Job để kiểm duyệt |

## 4.6. Close Job
Endpoint đóng Job: [MISSING].
## 4.7. Admin Job moderation
| Method | Endpoint | Mục đích |
| --- | --- | --- |
| GET | /admin/jobs/pending | Lấy danh sách Job chờ duyệt |
| PATCH | /admin/jobs/:id/moderation | Thực hiện moderation |

C9 — Moderation Policy vẫn OPEN.
# 5. APPLICATION & FREELANCE PROPOSAL
## 5.1. Application endpoints
| Method | Endpoint | Chức năng |
| --- | --- | --- |
| POST | /jobs/:jobId/applications | Student ứng tuyển |
| GET | /jobs/:jobId/applications | Employer xem danh sách ứng tuyển |
| PATCH | /applications/:id/status | Cập nhật trạng thái Application |

Quy tắc trạng thái Application
PATCH /applications/:id/status chỉ được phép cập nhật:
- REVIEWING
- SHORTLISTED
- REJECTED
Không được phép cập nhật thành ACCEPTED.
Việc chọn ứng viên và tạo Work Assignment phải đi qua endpoint Selection tại mục 6.
## 5.2. Application history — API-D3
| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | /applications/me | Xem lịch sử ứng tuyển |

Trạng thái: [PENDING].
## 5.3. Application withdrawal — API-D4
| Method | Endpoint | Chức năng |
| --- | --- | --- |
| PATCH | /applications/:id/withdraw | Rút Application |

Trạng thái: [PENDING].
Quy tắc rút Application cần đối chiếu S2.
## 5.4. Freelance Proposal endpoints
| Method | Endpoint | Chức năng |
| --- | --- | --- |
| POST | /jobs/:jobId/proposals | Student gửi Proposal |
| GET | /jobs/:jobId/proposals | Employer xem Proposal |
| PATCH | /proposals/:id/status | Cập nhật trạng thái Proposal |

Quy tắc trạng thái Proposal
PATCH /proposals/:id/status chỉ được phép cập nhật:
- REVIEWING
- REJECTED
Không được phép cập nhật thành ACCEPTED.
## 5.5. Proposal withdrawal — API-D5
| Method | Endpoint | Chức năng |
| --- | --- | --- |
| PATCH | /proposals/:id/withdraw | Rút Proposal |

Trạng thái: [PENDING].
G-38 và G-39 liên quan chính sách rút Proposal và API tương ứng.
# 6. SELECTION & WORK MANAGEMENT
## 6.1. Candidate selection — A3
QUY TẮC BẮT BUỘC: POST /jobs/:jobId/selections LÀ ENDPOINT DUY NHẤT ĐƯỢC PHÉP CHỌN ỨNG VIÊN ACCEPTED VÀ TẠO WORK ASSIGNMENT.
POST /jobs/:jobId/selections
Chức năng:
- Employer xác nhận chọn ứng viên.
- Kiểm tra số lượng tuyển quantity_required.
- Kiểm tra số lượng đã chọn.
- Cập nhật trạng thái nguồn được chọn thành ACCEPTED.
- Tạo một Work Assignment riêng cho từng Student được chọn.
Các bước xử lý logic:
1. Lock Job để tránh xử lý đồng thời vượt số lượng tuyển.
2. Kiểm tra quantity_required.
3. Kiểm tra trạng thái Application/Proposal nguồn.
4. Kiểm tra số lượng ứng viên đã được chọn.
5. Cập nhật trạng thái nguồn thành ACCEPTED.
6. Tạo Work Assignment tương ứng cho từng Student.
7. Bảo đảm XOR source foreign key: Assignment chỉ tham chiếu một trong hai nguồn Application hoặc Proposal.
8. Commit transaction khi tất cả thao tác thành công.
9. Rollback toàn bộ transaction nếu có thao tác thất bại.
Các vấn đề còn mở: G-35, G-36, G-37 và C3.
## 6.2. Assignment detail
GET /assignments/:id
Cho phép các bên tham gia xem Assignment theo quyền sở hữu/tham gia.
Response mẫu:
{
"data": {
"assignmentId": "ASSIGNMENT_ID",
"status": "IN_PROGRESS",
"progressHistory": []
}
}

progressHistory là cấu trúc dự kiến; G-58 cần xác minh.
## 6.3. Work progress
POST /assignments/:id/progress
Request mẫu:
{
"progressPercent": 50,
"description": "Work progress update"
}

Actor policy liên quan G-06 vẫn TBD.
## 6.4. Deliverable submission
POST /assignments/:id/deliverables
Student gửi Deliverable cho Freelance Assignment.
Response mẫu:
{
"data": {
"deliverableId": "DELIVERABLE_ID",
"versionNo": 1,
"status": "SUBMITTED"
}
}

Lưu ý:
- SUBMITTED là trạng thái của Deliverable.
- Không sử dụng SUBMITTED làm trạng thái Work Assignment.
- T1/M1 vẫn là các đề xuất chưa được phê duyệt.
- File storage, MIME type và giới hạn dung lượng vẫn TBD.
## 6.5. Deliverable review
PATCH /deliverables/:id/decision
Các quyết định:
- ACCEPTED
- REVISION_REQUESTED
Nếu REVISION_REQUESTED, Employer phải cung cấp comment.
Lưu ý:
- Trạng thái Deliverable được cập nhật.
- Work Assignment vẫn IN_PROGRESS khi yêu cầu chỉnh sửa.
- Không tự động hoàn thành Assignment chỉ vì Deliverable được chấp nhận.
## 6.6. Deliverable history — API-D6
| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | /assignments/:id/deliverables | Xem danh sách Deliverable |

Trạng thái: [PENDING]. Response schema chưa hoàn thiện.
## 6.7. Complete Assignment
PATCH /assignments/:id/complete
Actor: Employer sở hữu Assignment.
Điều kiện:
- PART_TIME/SEASONAL: Employer xác nhận hoàn thành.
- FREELANCE: Deliverable mới nhất phải có trạng thái ACCEPTED, sau đó Employer xác nhận hoàn thành.
G-59: Quy tắc idempotency cần xác nhận.
# 7. REVIEW, NOTIFICATION & ADMIN
## 7.1. Review
POST /assignments/:id/reviews
Điều kiện:
- Assignment phải ở trạng thái COMPLETED.
- Mỗi participant chỉ được gửi một review theo quy tắc hiện tại.
Các vấn đề còn mở:
- C10: Rating scale.
- G-41: Comment bắt buộc hay tùy chọn.
- G-42: Comment max length.
## 7.2. Notification
| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | /notifications | Lấy danh sách notification của người dùng |
| PATCH | /notifications/:id/read | Đánh dấu đã đọc |

Người dùng chỉ được truy cập notification thuộc tài khoản của mình.
Các vấn đề còn mở:
- C3: Notification triggers.
- G-43: Idempotency khi đánh dấu đã đọc.
- G-44: Chính sách xóa notification.
## 7.3. Admin reports
| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | /admin/reports | Lấy danh sách report |
| PATCH | /admin/reports/:id | Cập nhật/xử lý report |

Request/response schema chi tiết cần đối chiếu tài liệu nguồn. G-48 còn TBD.
## 7.4. Admin user management — API-D7
| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | /admin/users | Danh sách người dùng |
| PATCH | /admin/users/:id/status | Cập nhật trạng thái người dùng |

Trạng thái: [PENDING].
## 7.5. Admin category management — API-D8
| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | /admin/categories | Danh sách category |
| POST | /admin/categories | Tạo category |
| PATCH | /admin/categories/:id | Cập nhật category |
| DELETE | /admin/categories/:id | Xóa category |

Trạng thái: [PENDING].
## 7.6. Public categories — API-D9
| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | /categories | Lấy danh sách category |

Trạng thái: [PENDING].
## 7.7. Create report — API-D10
| Method | Endpoint | Chức năng |
| --- | --- | --- |
| POST | /reports | Tạo report |

Trạng thái: [PENDING]. Request/response schema cần xác minh.
## 7.8. FR-40 Admin statistics and logs
| Method | Endpoint | Chức năng | Trạng thái |
| --- | --- | --- | --- |
| GET | /admin/stats | Admin statistics | [MISSING] — G-49 |
| GET | /admin/logs | Admin logs | [MISSING] — G-50 |

Đây là các API Gap G-49/G-50, không tự ý gán thành API-D mới.
Không tạo UC-23 hoặc UC-24 cho FR-40.
# 8. ERROR CATALOGUE, TRACEABILITY & OPEN ISSUES
## 8.1. Error catalogue
| Error Code | HTTP Status | Ý nghĩa |
| --- | --- | --- |
| VALIDATION_ERROR | 400 | Dữ liệu đầu vào không hợp lệ |
| INVALID_CREDENTIALS | 401 | Thông tin đăng nhập không hợp lệ |
| UNAUTHENTICATED | 401 | Chưa xác thực |
| FORBIDDEN | 403 | Không có quyền |
| OWNERSHIP_REQUIRED | 403 | Không sở hữu tài nguyên |
| RESOURCE_NOT_FOUND | 404 | Không tìm thấy tài nguyên |
| TOKEN_EXPIRED | 410 | Token hết hạn |
| STATE_TRANSITION_INVALID | 409 | Chuyển trạng thái không hợp lệ |
| DUPLICATE_RESOURCE | 409 | Tài nguyên trùng lặp |
| QUANTITY_EXCEEDED | 409 | Vượt số lượng tuyển |
| RATE_LIMIT_EXCEEDED | 429 | Vượt giới hạn request |
| INTERNAL_ERROR | 500 | Lỗi hệ thống |

Danh mục trên là bản dự thảo; cần nhóm xác nhận trước khi chốt.
## 8.2. Business Rules BR-01 đến BR-18
Nguồn: SRS v2.1 (baseline gốc), đối chiếu File 03 Chương 5.
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

*Lưu ý: BR-14 giữ nguyên chữ của SRS v2.1 nhưng mâu thuẫn với §6.5 của tài liệu này, M1 và UC-17 — xem CF-01 (File 03 Mục 3.4). Chưa chốt.*
## 8.3. FR traceability
Nguồn: sheet FR của 03_JOBNEST_Traceability_Matrix.xlsx; cột Endpoint tham chiếu ID ở mục 9. Coverage giữ nhãn baseline SRS (16 Mapped / 18 Partial / 6 Gap), không tự đổi. FR-40 không có UC (không tạo UC-23/24). FR-30 giữ vấn đề actor mismatch G-06.
| FR | UC | PB | Endpoint (mục 9) | Entity | Test IDs | Coverage (baseline SRS) | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FR-01 | UC-01 | PB-01, PB-06 | E-01 | users, student_profiles, employer_profiles | TBD (File 08 chưa có liên kết thật) | Mapped | Password policy TBD (UC-01 4b). |
| FR-02 | UC-02 | PB-02, PB-03 | E-02, E-03 | users | TBD (File 08 chưa có liên kết thật) | Mapped | Đã bỏ cụm 'đã triển khai' (không có bằng chứng triển khai). JWT expiry C1/G-56 TBD; cơ chế vô hiệu hóa JWT sau logout chưa chọn. |
| FR-03 | — (cross-cutting; không có UC riêng) | TBD | — (cross-cutting) | users (role) | TBD (File 08 chưa có liên kết thật) | Mapped | Mapped theo middleware xuyên suốt. UC/PB riêng: TBD. |
| FR-04 | UC-03 | PB-04 | E-04, E-05 | users, password_reset_tokens | TBD (File 08 chưa có liên kết thật) | Mapped | Reset token expiry TBD (liên quan UC-01/UC-03). |
| FR-05 | UC-06 | PB-10 | E-06, E-07 | employer_profiles, verification_tokens | TBD (File 08 chưa có liên kết thật) | Mapped | Coverage Mapped theo baseline nhưng API [MISSING]; G-15, G-16; provider TBD. |
| FR-06 | UC-06 | PB-10 | E-08, E-09 | employer_profiles, verification_tokens | TBD (File 08 chưa có liên kết thật) | Mapped | Coverage Mapped theo baseline nhưng API [MISSING]; G-15, G-16; SMS provider TBD. |
| FR-07 | UC-04 | PB-07, PB-08 (theo UC-04) | E-10, E-11 | student_profiles, student_skills, student_educations, student_experiences | TBD (File 08 chưa có liên kết thật) | Mapped | API profile [MISSING]. DEP-01: PB-08 phụ thuộc PB-07. |
| FR-08 | UC-04 | PB-07, PB-08 (theo UC-04) | E-15, E-16, E-17, E-18 | student_cvs (Certificate: chưa có bảng) | TBD (File 08 chưa có liên kết thật) | Partial | S1: Certificate chưa chốt (ERD chưa có student_certificates). T2: unique index CV mặc định (C5) chưa migration. |
| FR-09 | UC-05 | PB-09 | E-12, E-13 | employer_profiles, users | TBD (File 08 chưa có liên kết thật) | Mapped | API [MISSING]. |
| FR-10 | UC-05 | PB-09 | E-12, E-14 | employer_profiles (email_verified_at, phone_verified_at) | TBD (File 08 chưa có liên kết thật) | Mapped | Trạng thái xác minh chỉ đọc qua UC-05; WF-X03 xung đột (TBD). |
| FR-11 | UC-07 | PB-12 → PB-15 (theo UC-07) | E-24 | jobs, part_time_details | TBD (File 08 chưa có liên kết thật) | Mapped | PB riêng từng FR (1–1): TBD. C7/S6: quy tắc salary/budget theo job_type. |
| FR-12 | UC-07 | PB-12 → PB-15 (theo UC-07) | E-24 | jobs, seasonal_details | TBD (File 08 chưa có liên kết thật) | Mapped | C7/S6 TBD. |
| FR-13 | UC-07 | PB-12 → PB-15 (theo UC-07) | E-24 | jobs, freelance_details | TBD (File 08 chưa có liên kết thật) | Mapped | C7/S6 TBD. |
| FR-14 | UC-07 | PB-12 → PB-15 (theo UC-07) | E-25, E-26, E-27 | jobs | TBD (File 08 chưa có liên kết thật) | Partial | Sửa Job sau PUBLISHED có quay lại PENDING_REVIEW hay không: TBD. C4: EXPIRED/đóng/mở lại. |
| FR-15 | UC-08 | PB-31 | E-28, E-29 | jobs, admin_logs | TBD (File 08 chưa có liên kết thật) | Partial | C9 (Moderation Policy) TBD; B1/B2: PB-31 giữ Sprint 2 hay dời. |
| FR-16 | UC-09 | PB-16, PB-17 | E-22 | jobs, categories, job_views | TBD (File 08 chưa có liên kết thật) | Mapped | G-21 (quy tắc search) TBD. |
| FR-17 | UC-09 | PB-16, PB-17 | E-22, E-57 | jobs, categories | TBD (File 08 chưa có liên kết thật) | Partial | Danh sách tiêu chí lọc 'được hỗ trợ' chưa chốt. |
| FR-18 | UC-09 | PB-16, PB-17 | E-22 | jobs | TBD (File 08 chưa có liên kết thật) | Partial | Max limit pagination TBD (File 06). |
| FR-19 | UC-09 | PB-16, PB-17 | E-14, E-23 | jobs, employer_profiles, job_views | TBD (File 08 chưa có liên kết thật) | Partial | NFR-06: có hiển thị email/phone Employer hay không: TBD. G-23: Job hết hạn/đóng. |
| FR-20 | UC-10 | PB-18 | E-19, E-20, E-21 | job_saved | TBD (File 08 chưa có liên kết thật) | Gap | Gap: File 06 không có endpoint/mục API-D2. |
| FR-21 | UC-11 (UC-11 ghi FR-23/FR-24 'theo catalog' – cần đối chiếu) | TBD | E-30 | applications, jobs, users | TBD (File 08 chưa có liên kết thật) | Mapped | Lệch: SRS gán FR-21 cho nộp đơn, nhưng File 04 ghi UC-11 ↔ FR-23/FR-24; PB UC-11 = TBD. |
| FR-22 | UC-12 (PROPOSED; phạm vi cần xác minh) | TBD | E-33, E-34, E-38 | applications | TBD (File 08 chưa có liên kết thật) | Gap | S2/C2 chính sách rút đơn TBD. |
| FR-23 | UC-12 (PROPOSED) | TBD | E-31 | applications, student_profiles, student_cvs | TBD (File 08 chưa có liên kết thật) | Partial | NFR-06/G-54: mức hiển thị CV cho Employer TBD. |
| FR-24 | UC-12 (PROPOSED) | TBD | E-32 | applications, notifications | TBD (File 08 chưa có liên kết thật) | Partial | Không cho ACCEPTED (A3). C3 trigger thông báo TBD. |
| FR-25 | UC-13 | TBD | E-35 | freelance_proposals, jobs, notifications | TBD (File 08 chưa có liên kết thật) | Partial | Trường 'giá đề xuất' chỉ khi được bật (TBD). |
| FR-26 | UC-14 (PROPOSED); UC-13 ghi thêm FR-26 | TBD | E-36, E-37 | freelance_proposals | TBD (File 08 chưa có liên kết thật) | Partial | Mâu thuẫn FR-26 'chấp nhận' vs A3: xem Mục 3.4. Chấp nhận Proposal chỉ qua POST /jobs/:jobId/selections. |
| FR-27 | UC-15 | TBD | E-39 | work_assignments, applications, freelance_proposals, jobs | TBD (File 08 chưa có liên kết thật) | Partial | G-35, G-36, G-37; C3. A3 chưa có bằng chứng triển khai. |
| FR-28 | UC-15 | TBD | E-39 | work_assignments | TBD (File 08 chưa có liên kết thật) | Partial | G-35: XOR source integrity (C8). |
| FR-29 | UC-16 | PB-24, PB-25 | E-40 | work_assignments, work_progress | TBD (File 08 chưa có liên kết thật) | Partial | G-58: progressHistory nhúng hay endpoint riêng. |
| FR-30 | UC-16 | PB-24, PB-25 | E-41 | work_assignments, work_progress | TBD (File 08 chưa có liên kết thật) | Partial | G-06: actor cập nhật tiến độ mâu thuẫn giữa FR-30 (Student), API và BR-13. |
| FR-31 | UC-17 | PB-26, PB-27 | E-42, E-43 | work_assignments, work_deliverables | TBD (File 08 chưa có liên kết thật) | Mapped | File storage, MIME, dung lượng TBD. |
| FR-32 | UC-17 | PB-26, PB-27 | E-43, E-44 | work_deliverables | TBD (File 08 chưa có liên kết thật) | Mapped | C10: giới hạn số lần chỉnh sửa TBD. |
| FR-33 | UC-18 | PB-28 | E-45 | work_assignments, work_deliverables, notifications | TBD (File 08 chưa có liên kết thật) | Partial | G-59: idempotency khi xác nhận hoàn thành. |
| FR-34 | UC-19 | PB-29 | E-46 | reviews, work_assignments, users | TBD (File 08 chưa có liên kết thật) | Partial | C10/G-41/G-42: rating scale, comment rules TBD. |
| FR-35 | UC-19 | PB-29 | E-46 | reviews, work_assignments, users | TBD (File 08 chưa có liên kết thật) | Partial | C10/G-41/G-42 TBD. |
| FR-36 | UC-20 | PB-30 | E-47, E-48 | notifications, users | TBD (File 08 chưa có liên kết thật) | Partial | C3: danh sách trigger TBD. G-43/G-44. |
| FR-37 | UC-21 | PB-32 | E-51, E-52 | users, admin_logs | TBD (File 08 chưa có liên kết thật) | Gap | S4: tách PB-32. Gap. |
| FR-38 | UC-21 | PB-32 | E-53, E-54, E-55, E-56, E-57 | categories, admin_logs | TBD (File 08 chưa có liên kết thật) | Gap | S4, S5 (category routes). Gap. |
| FR-39 | UC-22 | PB-33 | E-49, E-50, E-58 | reports, admin_logs | TBD (File 08 chưa có liên kết thật) | Gap | G-48, G-51 TBD. Gap. |
| FR-40 | — (để trống theo G-49; không tạo UC-23) | PB-32 (một phần – Admin Logs, theo File 02 §PB-32) | E-59, E-60 | admin_logs | TBD (File 08 chưa có liên kết thật) | Gap | Gap. Chưa có UC riêng; API chưa xác nhận. Ghi chú: mã 'G-49' đang dùng cho cả endpoint /admin/stats (File 03/06) lẫn 'FR-40 chưa có UC' (File 04). |

## 8.4. TBD / Decision Register
A3: Quy tắc endpoint Selection duy nhất đã được áp dụng trong thiết kế API Contract. Điều này không có nghĩa endpoint đã được triển khai hoặc kiểm thử.
| Mã | Nội dung | Trạng thái | Ảnh hưởng |
| --- | --- | --- | --- |
| C1 | JWT expiry | TBD | FR-02, NFR-03, G-56 |
| C2 | Điều kiện cho phép Application chuyển WITHDRAWN | TBD | FR-22 |
| C3 | Notification trigger list | TBD | FR-36, UC-20 |
| C4 | Cơ chế Job EXPIRED: cron hoặc manual; đóng/mở lại Job | TBD | FR-14 |
| C5 | Ràng buộc CV mặc định – T2 | Proposed – chưa migration | FR-08 |
| C6 | Admin provisioning | TBD | BR-02 |
| C7 | Quy tắc salary_* và budget_* theo job_type | TBD | FR-11..FR-13 |
| C8 | Source integrity của work_assignments.student_id – G-35 | TBD | FR-27, FR-28 |
| C9 | Moderation Policy | TBD | FR-15, PB-31 |
| C10 | Revision limit, rating scale và comment rules | TBD | FR-32, FR-34, FR-35 |
| S1 | Certificate trong FR-08 | TBD | FR-08 |
| S2 | Withdraw Application | TBD | FR-22 |
| S3 | Withdraw Proposal | TBD | FR-22 (Proposal), API-D5 |
| S4 | Tách PB-32 thành User/Category/Log | TBD | FR-37, FR-38, FR-40 |
| S5 | Category routes | TBD | FR-38 |
| S6 | Salary/Budget CHECK theo job_type | TBD | FR-11..FR-13 |
| T1/M1 | Work Assignment Lifecycle | Proposed – chưa phê duyệt | FR-28, FR-30, FR-33 |
| T2 | Partial unique index cho CV mặc định | Proposed – chưa migration | FR-08 |
| A3 | Selection Rule | Logic áp dụng trong tài liệu; chưa có bằng chứng code | FR-24, FR-26, FR-27 |
| DEP-01 | PB-07 → PB-08 dependency | Phụ thuộc Backlog – chờ nhóm phê duyệt | FR-07, FR-08 |
| EPIC-GAP-01 | 12 vị trí Epic chưa có mapping | TBD | File 02 |
| G-06 | Actor cập nhật Progress chưa thống nhất | TBD | FR-30, UC-16, BR-13 |
| G-35 | Source integrity và XOR constraint của Work Assignment | TBD | FR-27, FR-28; TC-HIRE-009..012 |
| G-49 | GET /admin/stats chưa xác nhận (File 04 cũng dùng G-49 cho 'FR-40 chưa có UC') | Chưa xác nhận | FR-40 |
| G-50 | GET /admin/logs chưa xác nhận | Chưa xác nhận | FR-40 |
| G-57 | Nội dung Gap chưa có trong nguồn hiện tại | MISSING – cần xác nhận | — |
| G-58 | Cấu trúc Progress History và API liên quan | TBD | FR-29 |
| G-59 | Idempotency khi xác nhận hoàn thành Assignment | TBD | FR-33 |
| G-63 | Sai khác số lượng Job Management | Reconciliation | File 08 |
| G-64 | Sai khác Missing Data Register | Reconciliation | File 08 |

### Bảng API-D1 đến API-D10 (đã đối chiếu)
Đánh số theo File 06; File 03 Mục 8.4 đang lệch ở API-D2, D3, D4 (xem CF-04). API-D2 (Saved Jobs) không có mục trong bản v2.1; ba endpoint đề xuất ở mục 9 để nhóm duyệt.
| Mã | Nhóm | Endpoint | FR | Trạng thái | Endpoint ID |
| --- | --- | --- | --- | --- | --- |
| API-D1 | CV Management | /students/me/cvs (4 endpoint) | FR-08 | PENDING | E-15..E-18 |
| API-D2 | Saved Jobs | Chưa có mục trong File 06; đường dẫn đề xuất /students/me/saved-jobs, /jobs/:jobId/save | FR-20 | PENDING | E-19..E-21 [ĐỀ XUẤT] |
| API-D3 | Application history | GET /applications/me | FR-22 | PENDING | E-33 |
| API-D4 | Application withdrawal | PATCH /applications/:id/withdraw | FR-22 | PENDING | E-34 |
| API-D5 | Proposal withdrawal | PATCH /proposals/:id/withdraw | FR-22 | PENDING | E-38 |
| API-D6 | Deliverable history | GET /assignments/:id/deliverables | FR-31, FR-32 | PENDING | E-43 |
| API-D7 | Admin user management | GET /admin/users; PATCH /admin/users/:id/status | FR-37 | PENDING | E-51, E-52 |
| API-D8 | Admin category management | /admin/categories (4 endpoint) | FR-38 | PENDING | E-53..E-56 |
| API-D9 | Public categories | GET /categories | FR-17, FR-38 | PENDING | E-57 |
| API-D10 | Create report | POST /reports | FR-39 | PENDING | E-58 |

## 8.5. API completeness summary
| Nhóm | Số lượng / Trạng thái |
| --- | --- |
| API-D1 đến API-D10 | 10 nhóm API cần hoàn thiện (D2 chưa có mục trong v2.1) |
| Chức năng [MISSING] theo thống kê v2.1 (mục 2–3) | 10 chức năng: Logout 1, Reset password 1, Email/phone verification 4, Profile 4 |
| Chức năng [MISSING] bổ sung phát hiện khi đối chiếu | Close Job (§4.6) và 2 endpoint FR-40 (§7.8) — thống kê v2.1 chưa tính |
| Endpoint trong catalogue (mục 9) | 60 endpoint: 27 Baseline, 19 PENDING, 14 MISSING (hồ sơ Student/Employer tách riêng nên 4 chức năng Profile thành 5 endpoint) |
| Endpoint còn thiếu theo Wireframe (mục 10) | 8 endpoint đề xuất |
| API Contract | Draft |
| OpenAPI official | Chưa có |
| Implementation evidence | Chưa có |
| Test Pass evidence | Chưa có |

## 8.6. Testing status
- Tổng Test Cases baseline: 334.
- Not Run: 223.
- TBD: 110.
- Manual: 1.
- Không ghi nhận test Pass.
- Chưa có bằng chứng test execution.
- Không được tuyên bố API đã được kiểm thử thành công.
## 8.7. Final status
DRAFT — API Contract được tổng hợp theo baseline v2.1; các endpoint/API-D, schema, business rules và open issues còn chờ nhóm xác nhận. Chưa Approved, chưa có bằng chứng triển khai hoặc kiểm thử thành công.
# 9. CHI TIẾT ENDPOINT — REQUEST / RESPONSE / LỖI [ĐỀ XUẤT – chờ duyệt]
Bảng dưới tổng hợp toàn bộ endpoint. Phương thức, đường dẫn và nhãn trạng thái của endpoint đã có trong v2.1 được giữ nguyên; trường request/response lấy từ mẫu v2.1 hoặc suy ra từ File 07 (Entity) và File 04 (luồng UC) và đều là [ĐỀ XUẤT]. Đường dẫn của endpoint [MISSING] hoặc API-D2 cũng là [ĐỀ XUẤT]. Request: tên:kiểu:R (bắt buộc). Chi tiết dạng bảng nằm trong 06_JOBNEST_Endpoint_Catalogue.xlsx.
## 9.1. Authentication
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-01 | POST /auth/register Role: GUEST [Baseline] FR: FR-01 · UC: UC-01 | email:string:R password:string:R role:enum(STUDENT\|INDIVIDUAL_EMPLOYER):R fullName:string:R nếu STUDENT displayName:string:R nếu EMPLOYER | 201: userId:string role:enum | VALIDATION_ERROR 400 DUPLICATE_RESOURCE 409 | Chính sách mật khẩu: TBD (UC-01 4b). role=ADMIN bị từ chối (BR-02). |
| E-02 | POST /auth/login Role: GUEST [Baseline] FR: FR-02 · UC: UC-02 | email:string:R password:string:R | 200: accessToken:string role:enum userId:string | INVALID_CREDENTIALS 401 FORBIDDEN 403 (tài khoản LOCKED) | Thời hạn JWT: TBD (C1). |
| E-03 | POST /auth/logout Role: Đã đăng nhập [MISSING] FR: FR-02 · UC: UC-02 | — | TBD: — | UNAUTHENTICATED 401 | Endpoint chưa có. Đường dẫn là [ĐỀ XUẤT]. |
| E-04 | POST /auth/forgot-password Role: GUEST [Baseline] FR: FR-04 · UC: UC-03 | email:string:R | 202: message:string (thông báo chung) | VALIDATION_ERROR 400 RATE_LIMIT_EXCEEDED 429 | Không tiết lộ email có tồn tại (File 06 §2.1). |
| E-05 | POST /auth/reset-password Role: GUEST [MISSING] FR: FR-04 · UC: UC-03 | token:string:R newPassword:string:R confirmPassword:string:R | 200: message:string | TOKEN_EXPIRED 410 VALIDATION_ERROR 400 | Endpoint chưa có; đường dẫn và phương thức OTP/link là [ĐỀ XUẤT]. Expiry token: TBD. |

## 9.2. Verification
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-06 | POST /employers/me/verifications/email/request Role: INDIVIDUAL_EMPLOYER [MISSING] FR: FR-05 · UC: UC-06 | — | 200: message:string | VALIDATION_ERROR 400 TOKEN_EXPIRED 410 RATE_LIMIT_EXCEEDED 429 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. G-15 expiry, G-16 rate limit, provider: TBD. |
| E-07 | POST /employers/me/verifications/email/verify Role: INDIVIDUAL_EMPLOYER [MISSING] FR: FR-05 · UC: UC-06 | code:string:R | 200: verified:boolean verifiedAt:timestamp | VALIDATION_ERROR 400 TOKEN_EXPIRED 410 RATE_LIMIT_EXCEEDED 429 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. G-15 expiry, G-16 rate limit, provider: TBD. |
| E-08 | POST /employers/me/verifications/phone/request Role: INDIVIDUAL_EMPLOYER [MISSING] FR: FR-06 · UC: UC-06 | — | 200: message:string | VALIDATION_ERROR 400 TOKEN_EXPIRED 410 RATE_LIMIT_EXCEEDED 429 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. G-15 expiry, G-16 rate limit, provider: TBD. |
| E-09 | POST /employers/me/verifications/phone/verify Role: INDIVIDUAL_EMPLOYER [MISSING] FR: FR-06 · UC: UC-06 | code:string:R | 200: verified:boolean verifiedAt:timestamp | VALIDATION_ERROR 400 TOKEN_EXPIRED 410 RATE_LIMIT_EXCEEDED 429 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. G-15 expiry, G-16 rate limit, provider: TBD. |

## 9.3. Profile
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-10 | GET /students/me Role: STUDENT [MISSING] FR: FR-07 · UC: UC-04 | — | 200: fullName dateOfBirth school major bio avatarUrl skills[] educations[] experiences[] | UNAUTHENTICATED 401 FORBIDDEN 403 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. Certificate: TBD (S1). |
| E-11 | PATCH /students/me Role: STUDENT [MISSING] FR: FR-07 · UC: UC-04 | fullName:string dateOfBirth:date school:string major:string bio:string skills:array educations:array experiences:array | 200: Hồ sơ đã cập nhật | VALIDATION_ERROR 400 FORBIDDEN 403 | Endpoint chưa có; [ĐỀ XUẤT]. end_date < start_date: TBD. |
| E-12 | GET /employers/me Role: INDIVIDUAL_EMPLOYER [MISSING] FR: FR-09; FR-10 · UC: UC-05 | — | 200: displayName bio location avatarUrl email phone emailVerifiedAt phoneVerifiedAt | UNAUTHENTICATED 401 | Endpoint chưa có; [ĐỀ XUẤT]. |
| E-13 | PATCH /employers/me Role: INDIVIDUAL_EMPLOYER [MISSING] FR: FR-09 · UC: UC-05 | displayName:string bio:string location:string avatarUrl:string | 200: Hồ sơ đã cập nhật | VALIDATION_ERROR 400 | Email, phone, verified_at không sửa được qua endpoint này; [ĐỀ XUẤT]. |
| E-14 | GET /employers/:id/profile Role: GUEST / Đã đăng nhập [MISSING] FR: FR-10; FR-19 · UC: UC-05; UC-09 | — | 200: displayName bio location avatarUrl trạng thái xác minh (mức công khai: TBD) jobs đang tuyển | RESOURCE_NOT_FOUND 404 | Endpoint chưa có; [ĐỀ XUẤT]. NFR-06: dữ liệu liên hệ nào được công khai: TBD. |

## 9.4. CV (API-D1)
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-15 | GET /students/me/cvs Role: STUDENT [PENDING] FR: FR-08 · UC: UC-04 | — | 200: data[]: cvId originalName mimeType sizeBytes isDefault createdAt | UNAUTHENTICATED 401 | file_key không trả về. |
| E-16 | POST /students/me/cvs Role: STUDENT [PENDING] FR: FR-08 · UC: UC-04 | file:file:R isDefault:boolean | 201: cvId originalName isDefault | VALIDATION_ERROR 400 | MIME/size, storage: TBD. T2: tối đa một CV mặc định (đề xuất, chưa migrate). |
| E-17 | PATCH /students/me/cvs/:id Role: STUDENT (chủ CV) [PENDING] FR: FR-08 · UC: UC-04 | originalName:string isDefault:boolean | 200: CV đã cập nhật | OWNERSHIP_REQUIRED 403 RESOURCE_NOT_FOUND 404 STATE_TRANSITION_INVALID 409 | — |
| E-18 | DELETE /students/me/cvs/:id Role: STUDENT (chủ CV) [PENDING] FR: FR-08 · UC: UC-04 | — | 200: — | OWNERSHIP_REQUIRED 403 RESOURCE_NOT_FOUND 404 DUPLICATE_RESOURCE/Conflict nếu đang được Application tham chiếu: TBD | Chính sách xóa CV đang được applications.cv_id tham chiếu: TBD. |

## 9.5. Saved Jobs (API-D2)
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-19 | GET /students/me/saved-jobs Role: STUDENT [PENDING] FR: FR-20 · UC: UC-10 | page limit | 200: data[]: jobId title jobType employer location status savedAt | UNAUTHENTICATED 401 | File 06 không có mục API-D2; đường dẫn là [ĐỀ XUẤT]. Job CLOSED có hiển thị hay không: TBD. |
| E-20 | POST /jobs/:jobId/save Role: STUDENT [PENDING] FR: FR-20 · UC: UC-10 | — | 201: savedAt:timestamp | DUPLICATE_RESOURCE 409 RESOURCE_NOT_FOUND 404 | Đường dẫn là [ĐỀ XUẤT]. |
| E-21 | DELETE /jobs/:jobId/save Role: STUDENT [PENDING] FR: FR-20 · UC: UC-10 | — | 200: — | RESOURCE_NOT_FOUND 404 | Đường dẫn là [ĐỀ XUẤT]. |

## 9.6. Job
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-22 | GET /jobs Role: GUEST / Student [Baseline] FR: FR-16; FR-17; FR-18 · UC: UC-09 | keywords job_type category location salary_min salary_max page limit sort | 200: data[]: jobId title jobType location (+ employer, salary/budget, postedAt: TBD) pagination{page,limit,total} | VALIDATION_ERROR 400 | Chỉ trả Job PUBLISHED. Max limit, sort mặc định: TBD (G-21, G-22, G-24). |
| E-23 | GET /jobs/:jobId Role: GUEST / Student [Baseline] FR: FR-19 · UC: UC-09 | — | 200: jobId title jobType description + trường theo loại Job | RESOURCE_NOT_FOUND 404 | Job không công khai → 404. Hiển thị CLOSED/EXPIRED: TBD (G-23). |
| E-24 | POST /jobs Role: INDIVIDUAL_EMPLOYER (đã xác minh) [Baseline] FR: FR-11; FR-12; FR-13 · UC: UC-07 | title:string:R jobType:enum(PART_TIME\|SEASONAL\|FREELANCE):R description:string:R location categoryId quantityRequired:int>=1:R theo loại: workSchedule/payUnit/salary (PT,SV) startDate,endDate (SV) scope,deliverableRequirements,deadline,budget (FL) | 201: jobId status=DRAFT | VALIDATION_ERROR 400 FORBIDDEN 403 (chưa xác minh) | Chi tiết trường theo loại: [ĐỀ XUẤT]. S6, C10: TBD. |
| E-25 | PATCH /jobs/:jobId Role: INDIVIDUAL_EMPLOYER (chủ Job) [Baseline (method chưa chốt)] FR: FR-14 · UC: UC-07 | các trường Job được phép sửa | 200: Job đã cập nhật | OWNERSHIP_REQUIRED 403 STATE_TRANSITION_INVALID 409 | PATCH hoặc PUT: chưa chốt, không tự chọn. |
| E-26 | POST /jobs/:jobId/submit-review Role: INDIVIDUAL_EMPLOYER (chủ Job) [Baseline] FR: FR-14 · UC: UC-07 | — | 200: status=PENDING_REVIEW | STATE_TRANSITION_INVALID 409 FORBIDDEN 403 | — |
| E-27 | POST /jobs/:jobId/close Role: INDIVIDUAL_EMPLOYER (chủ Job) [MISSING] FR: FR-14 · UC: UC-07 | — | 200: status=CLOSED | STATE_TRANSITION_INVALID 409 OWNERSHIP_REQUIRED 403 | File 06 §4.6: [MISSING]. Đường dẫn là [ĐỀ XUẤT]. C4 TBD. |

## 9.7. Moderation
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-28 | GET /admin/jobs/pending Role: ADMIN [Baseline] FR: FR-15 · UC: UC-08 | jobType page limit | 200: data[]: jobId title employer jobType submittedAt | FORBIDDEN 403 | C9 TBD. |
| E-29 | PATCH /admin/jobs/:id/moderation Role: ADMIN [Baseline] FR: FR-15 · UC: UC-08 | decision:enum(APPROVE\|REJECT):R moderationReason:string (bắt buộc khi REJECT) | 200: status=PUBLISHED\|REJECTED | VALIDATION_ERROR 400 STATE_TRANSITION_INVALID 409 | Giá trị decision là [ĐỀ XUẤT]. Ghi admin_logs (BR-17). |

## 9.8. Application
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-30 | POST /jobs/:jobId/applications Role: STUDENT [Baseline] FR: FR-21 · UC: UC-11 | cvId:int coverLetter:string | 201: applicationId status=PENDING | DUPLICATE_RESOURCE 409 STATE_TRANSITION_INVALID 409 (Job đóng) VALIDATION_ERROR 400 | CV bắt buộc hay tùy chọn: TBD (G-28). Chỉ Job PT/SV. |
| E-31 | GET /jobs/:jobId/applications Role: INDIVIDUAL_EMPLOYER (chủ Job) [Baseline] FR: FR-23 · UC: UC-12 | status page limit | 200: data[]: applicationId student cvLink submittedAt status | OWNERSHIP_REQUIRED 403 | Bộ lọc: TBD (G-29). |
| E-32 | PATCH /applications/:id/status Role: INDIVIDUAL_EMPLOYER (chủ Job) [Baseline] FR: FR-24 · UC: UC-12 | status:enum(REVIEWING\|SHORTLISTED\|REJECTED):R note:string | 200: status | STATE_TRANSITION_INVALID 409 (gồm ACCEPTED) OWNERSHIP_REQUIRED 403 | Không cho ACCEPTED (A3). |

## 9.9. Application (API-D3)
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-33 | GET /applications/me Role: STUDENT [PENDING] FR: FR-22 · UC: UC-12 | status page limit | 200: data[]: applicationId job employer submittedAt status | UNAUTHENTICATED 401 | Chỉ bao gồm Application; Proposal chưa có endpoint lịch sử (xem §10). |

## 9.10. Application (API-D4)
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-34 | PATCH /applications/:id/withdraw Role: STUDENT (chủ đơn) [PENDING] FR: FR-22 · UC: UC-12 | — | 200: status=WITHDRAWN | STATE_TRANSITION_INVALID 409 OWNERSHIP_REQUIRED 403 | Chính sách: TBD (C2, S2). |

## 9.11. Proposal
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-35 | POST /jobs/:jobId/proposals Role: STUDENT [Baseline] FR: FR-25 · UC: UC-13 | proposalText:string:R estimatedDuration:string proposedPrice:int (nếu trường được bật) | 201: proposalId status=SUBMITTED | DUPLICATE_RESOURCE 409 VALIDATION_ERROR 400 | Chỉ Job FREELANCE. Trường giá: TBD. |
| E-36 | GET /jobs/:jobId/proposals Role: INDIVIDUAL_EMPLOYER (chủ Job) [Baseline] FR: FR-26 · UC: UC-14 | status page limit | 200: data[]: proposalId student estimatedDuration proposedPrice status | OWNERSHIP_REQUIRED 403 | Proposal detail API: TBD (G-32). |
| E-37 | PATCH /proposals/:id/status Role: INDIVIDUAL_EMPLOYER (chủ Job) [Baseline] FR: FR-26 · UC: UC-14 | status:enum(REVIEWING\|REJECTED):R | 200: status | STATE_TRANSITION_INVALID 409 (gồm ACCEPTED) | Không cho ACCEPTED (A3). Transition: TBD (G-33). |

## 9.12. Proposal (API-D5)
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-38 | PATCH /proposals/:id/withdraw Role: STUDENT (chủ đề xuất) [PENDING] FR: FR-22 · UC: UC-13 | — | 200: status=WITHDRAWN | STATE_TRANSITION_INVALID 409 | TBD (S3, G-38, G-39). |

## 9.13. Selection (A3)
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-39 | POST /jobs/:jobId/selections Role: INDIVIDUAL_EMPLOYER (chủ Job) [Baseline] FR: FR-27; FR-28 · UC: UC-15 | candidates:array:R (mỗi phần tử: sourceType=APPLICATION\|PROPOSAL sourceId) | 201: assignments[]: assignmentId studentId status=NOT_STARTED | QUANTITY_EXCEEDED 409 STATE_TRANSITION_INVALID 409 OWNERSHIP_REQUIRED 403 | Endpoint DUY NHẤT chọn ứng viên và tạo Work Assignment. Cấu trúc request là [ĐỀ XUẤT]. G-35, G-36, G-37, C3. |

## 9.14. Work
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-40 | GET /assignments/:id Role: Các bên của Assignment [Baseline] FR: FR-29 · UC: UC-16 | — | 200: assignmentId status job student progressHistory[] (G-58) | OWNERSHIP_REQUIRED 403 RESOURCE_NOT_FOUND 404 | Cấu trúc progressHistory: TBD (G-58). |
| E-41 | POST /assignments/:id/progress Role: TBD (G-06) [Baseline] FR: FR-30 · UC: UC-16 | progressPercent:int description:string | 201: progressId createdAt | VALIDATION_ERROR 400 OWNERSHIP_REQUIRED 403 | Actor, range progressPercent: TBD (G-06). |
| E-45 | PATCH /assignments/:id/complete Role: INDIVIDUAL_EMPLOYER (chủ Job) [Baseline] FR: FR-33 · UC: UC-18 | — | 200: status=COMPLETED completedAt | STATE_TRANSITION_INVALID 409 OWNERSHIP_REQUIRED 403 | FL: Deliverable mới nhất phải ACCEPTED. Idempotency: TBD (G-59). |

## 9.15. Deliverable
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-42 | POST /assignments/:id/deliverables Role: STUDENT (được giao) [Baseline] FR: FR-31 · UC: UC-17 | file:file externalLink:string description:string | 201: deliverableId versionNo status=SUBMITTED | VALIDATION_ERROR 400 OWNERSHIP_REQUIRED 403 | Mỗi lần gửi tạo version mới. MIME/size: TBD. Cần file hoặc link: [ĐỀ XUẤT]. |
| E-44 | PATCH /deliverables/:id/decision Role: INDIVIDUAL_EMPLOYER (chủ Job) [Baseline] FR: FR-32 · UC: UC-17 | decision:enum(ACCEPTED\|REVISION_REQUESTED):R comment:string (bắt buộc khi REVISION_REQUESTED) | 200: deliverableId status | VALIDATION_ERROR 400 OWNERSHIP_REQUIRED 403 STATE_TRANSITION_INVALID 409 | Assignment vẫn IN_PROGRESS. Revision limit: TBD (C10). |

## 9.16. Deliverable (API-D6)
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-43 | GET /assignments/:id/deliverables Role: Các bên của Assignment [PENDING] FR: FR-31; FR-32 · UC: UC-17 | — | 200: data[]: deliverableId versionNo status submittedAt comment | OWNERSHIP_REQUIRED 403 | Response schema chưa hoàn thiện. |

## 9.17. Review
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-46 | POST /assignments/:id/reviews Role: STUDENT / INDIVIDUAL_EMPLOYER [Baseline] FR: FR-34; FR-35 · UC: UC-19 | rating:int:R comment:string | 201: reviewId createdAt | STATE_TRANSITION_INVALID 409 (chưa COMPLETED) DUPLICATE_RESOURCE 409 OWNERSHIP_REQUIRED 403 | Rating scale, comment rules: TBD (C10, G-41, G-42). |

## 9.18. Notification
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-47 | GET /notifications Role: Đã đăng nhập [Baseline] FR: FR-36 · UC: UC-20 | page limit unreadOnly:boolean | 200: data[]: notificationId type title body targetType targetId readAt createdAt | UNAUTHENTICATED 401 | Pagination/sort: TBD (G-07). |
| E-48 | PATCH /notifications/:id/read Role: Chủ thông báo [Baseline] FR: FR-36 · UC: UC-20 | — | 200: readAt | OWNERSHIP_REQUIRED 403 RESOURCE_NOT_FOUND 404 | Idempotency: TBD (G-43). Xóa: TBD (G-44). |

## 9.19. Report
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-49 | GET /admin/reports Role: ADMIN [Baseline] FR: FR-39 · UC: UC-22 | status targetType page limit | 200: data[]: reportId reporter targetType targetId reason status | FORBIDDEN 403 | Status enum: TBD (G-48). |
| E-50 | PATCH /admin/reports/:id Role: ADMIN [Baseline] FR: FR-39 · UC: UC-22 | action:string:R (enum TBD) note:string | 200: reportId status | VALIDATION_ERROR 400 STATE_TRANSITION_INVALID 409 | Schema chi tiết cần đối chiếu. G-48, G-51 TBD. |

## 9.20. Admin User (API-D7)
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-51 | GET /admin/users Role: ADMIN [PENDING] FR: FR-37 · UC: UC-21 | role status q page limit | 200: data[]: userId email role accountStatus createdAt | FORBIDDEN 403 | — |
| E-52 | PATCH /admin/users/:id/status Role: ADMIN [PENDING] FR: FR-37 · UC: UC-21 | accountStatus:enum(ACTIVE\|LOCKED):R | 200: userId accountStatus | STATE_TRANSITION_INVALID 409 (khóa Admin cuối) | C6 TBD. |

## 9.21. Admin Category (API-D8)
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-53 | GET /admin/categories Role: ADMIN [PENDING] FR: FR-38 · UC: UC-21 | — | 200: data[]/category | VALIDATION_ERROR 400 FORBIDDEN 403 | Chính sách xóa khi có Job tham chiếu, parent-child: TBD (G-46, S5). |
| E-54 | POST /admin/categories Role: ADMIN [PENDING] FR: FR-38 · UC: UC-21 | name:string:R (POST) parentId:int isActive:boolean | 201: data[]/category | VALIDATION_ERROR 400 FORBIDDEN 403 | Chính sách xóa khi có Job tham chiếu, parent-child: TBD (G-46, S5). |
| E-55 | PATCH /admin/categories/:id Role: ADMIN [PENDING] FR: FR-38 · UC: UC-21 | name:string:R (POST) parentId:int isActive:boolean | 200: data[]/category | VALIDATION_ERROR 400 FORBIDDEN 403 | Chính sách xóa khi có Job tham chiếu, parent-child: TBD (G-46, S5). |
| E-56 | DELETE /admin/categories/:id Role: ADMIN [PENDING] FR: FR-38 · UC: UC-21 | — | 200: data[]/category | VALIDATION_ERROR 400 FORBIDDEN 403 | Chính sách xóa khi có Job tham chiếu, parent-child: TBD (G-46, S5). |

## 9.22. Public Category (API-D9)
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-57 | GET /categories Role: GUEST [PENDING] FR: FR-17; FR-38 · UC: UC-09 | — | 200: data[]: categoryId name parentId | — | Route công khai: TBD (S5). |

## 9.23. Report (API-D10)
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-58 | POST /reports Role: Đã đăng nhập [PENDING] FR: FR-39 · UC: UC-22 | targetType:enum(JOB\|USER):R targetId:int:R reason:string:R description:string | 201: reportId status | VALIDATION_ERROR 400 RESOURCE_NOT_FOUND 404 | Status khởi tạo TBD (G-48); báo cáo trùng: TBD (G-51). |

## 9.24. Admin Stats
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-59 | GET /admin/stats Role: ADMIN [MISSING (G-49)] FR: FR-40 · UC: — | — | TBD: — | — | Không tạo UC-23/24. Mã G-49 đang dùng hai nghĩa (xem CF-05). |

## 9.25. Admin Logs
| ID | Endpoint / Role / Trạng thái | Request | Response | Lỗi | Ghi chú / TBD |
| --- | --- | --- | --- | --- | --- |
| E-60 | GET /admin/logs Role: ADMIN [MISSING (G-50)] FR: FR-40 · UC: — | adminId actionType dateFrom dateTo page limit | TBD: data[]: timestamp admin action target metadata | FORBIDDEN 403 | Retention, filter: TBD (G-51). |

# 10. ENDPOINT CÒN THIẾU THEO WIREFRAME [ĐỀ XUẤT – chờ duyệt]
Khi đối chiếu 44 mã màn hình (File 05) với bản v2.1 phát hiện các màn hình cần dữ liệu nhưng chưa có endpoint tương ứng. Đây là đề xuất để nhóm xem xét, không phải endpoint đã duyệt.
| Mã | Endpoint đề xuất | Màn hình | Lý do | FR |
| --- | --- | --- | --- | --- |
| X-01 | GET /employers/me/jobs | WF-E04, WF-E01 | Danh sách Job của Employer theo tab trạng thái (GET /jobs chỉ trả Job công khai). | FR-14 |
| X-02 | GET /assignments | WF-S01, WF-E09 | Danh sách Assignment của người dùng (dashboard và quản lý Assignment). | FR-29 |
| X-03 | GET /applications/:id | WF-S12 | Chi tiết Application cho Student. | FR-22 |
| X-04 | GET /proposals/me; GET /proposals/:id | WF-S05, WF-S12 | Lịch sử và chi tiết Proposal; /applications/me chỉ bao gồm Application. | FR-22, FR-25 |
| X-05 | GET /admin/jobs/:id | WF-A04 | Chi tiết Job ở chế độ chỉ đọc cho kiểm duyệt. | FR-15 |
| X-06 | GET /admin/reports/:id | WF-A06 | Chi tiết báo cáo và lịch sử xử lý. | FR-39 |
| X-07 | GET /students/:id/profile | WF-E13 | Employer xem hồ sơ Student (phạm vi quyền: TBD). | FR-23 |
| X-08 | GET /reviews/me | WF-S10, WF-E11 | Danh sách Review đã nhận và Assignment COMPLETED chưa đánh giá. | FR-34, FR-35 |

# PHỤ LỤC A. BẢNG ĐỐI CHIẾU THAY ĐỔI (REVISION 2)
| Mục | Thay đổi | Lý do / nguồn |
| --- | --- | --- |
| Đầu file | Thêm Revision 2, nguồn đối chiếu, quy ước nhãn; định dạng Word + Excel | Đồng bộ File 01, 03 |
| §8.2 | Thay lời dặn bằng BR-01..BR-18 thật | Nguồn: SRS v2.1 / File 03 Chương 5 |
| §8.3 | Thay lời dặn bằng bảng truy vết FR-01..FR-40 | Traceability Matrix xlsx |
| §8.4 | Thay lời dặn bằng Decision Register thật và bảng API-D1..D10 đối chiếu | File 03 Mục 8, CF-04 |
| §8.5 | Sửa thống kê: thêm Close Job, FR-40; ghi rõ API-D2 không có mục | Đối chiếu §4.6, §7.8 |
| Cuối file | Xóa đoạn "YÊU CẦU KIỂM TRA TRƯỚC KHI BÀN GIAO" (lời dặn lẫn trong nội dung) | Không phải nội dung hợp đồng API |
| §9 (mới) | Request/response/lỗi cho 60 endpoint | [ĐỀ XUẤT] |
| §10 (mới) | 8 endpoint còn thiếu theo Wireframe | File 05 |

# PHỤ LỤC B. ĐIỂM LỆCH LIÊN FILE — KHÔNG TỰ CHỐT
| STT | Điểm lệch | Xử lý |
| --- | --- | --- |
| 1 | §6.5 (Assignment vẫn IN_PROGRESS) khác BR-14 trong SRS | CF-01 — chờ nhóm quyết định |
| 2 | PATCH Application/Proposal không cho ACCEPTED, nhưng FR-26 ghi "chấp nhận" | CF-02 |
| 3 | Các UC-16/17/18 đặt tiền điều kiện IN_PROGRESS, mẫu §6.2 trả IN_PROGRESS, ERD DEFAULT NOT_STARTED | CF-03 |
| 4 | API-D2/D3/D4 khác nghĩa giữa File 03 và File 06 | CF-04 — bảng đối chiếu ở §8.4 |
| 5 | G-49 mang hai nghĩa (FR-40 chưa có UC; /admin/stats chưa xác nhận) | CF-05 |
| 6 | Lịch sử Proposal và chi tiết Application/Proposal chưa có endpoint | §10 |
| 7 | Thống kê "10 endpoint Missing" chưa tính Close Job và FR-40 | §8.5 đã sửa |

# KẾT THÚC TÀI LIỆU API CONTRACT — REVISION 2