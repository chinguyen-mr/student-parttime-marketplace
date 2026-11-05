<!-- converted from 06_JOBNEST_API_Contract.docx -->

JOBNEST — API CONTRACT
Tên tài liệu: JOBNEST API Contract
Phiên bản: Draft — v2.1
Định dạng bàn giao: Microsoft Word (06_JOBNEST_API_Contract.docx)
Trạng thái: DRAFT — Chờ nhóm review và xác nhận
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
Giữ nguyên toàn bộ nội dung BR-01 đến BR-18 từ tài liệu nguồn API Contract. Không tự viết lại, không đổi mã BR và không tự tạo business rule mới.
## 8.3. FR traceability
Giữ nguyên bảng truy vết FR-01 đến FR-40 từ tài liệu nguồn, với các cột tương ứng:
FR | UC | PB | API | Entity | Test IDs | Coverage | Notes
Yêu cầu:
- Giữ nguyên mã tham chiếu.
- Không tự tạo UC cho FR-40.
- FR-30 giữ nguyên vấn đề actor mismatch G-06.
- Các FR chưa có API hoặc UC phải giữ nguyên trạng thái Gap/Partial tương ứng.
- Không tự chuyển Gap thành Mapped.
## 8.4. TBD / Decision Register
Giữ nguyên các mã và nội dung còn mở:
- C1–C10.
- S1–S6.
- T1, T2.
- M1.
- A3.
- API-D1–API-D10.
- G-06.
- G-41–G-44.
- G-46.
- G-48–G-50.
- G-58, G-59.
- G-63, G-64.
A3: Quy tắc endpoint Selection duy nhất đã được áp dụng trong thiết kế API Contract. Điều này không có nghĩa endpoint đã được triển khai hoặc kiểm thử.
## 8.5. API completeness summary
| Nhóm | Số lượng / Trạng thái |
| --- | --- |
| API-D1 đến API-D10 | 10 nhóm API cần hoàn thiện |
| Missing endpoints | 10 endpoint |
| FR-40 API gaps | 2 endpoint: /admin/stats, /admin/logs |
| API Contract | Draft |
| OpenAPI official | Chưa có |
| Implementation evidence | Chưa có |
| Test Pass evidence | Chưa có |

10 endpoint Missing theo nhóm:
- Logout: 1.
- Reset password: 1.
- Email/phone verification: 4.
- Profile: 4.
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
# YÊU CẦU KIỂM TRA TRƯỚC KHI BÀN GIAO
- Đủ 8 phần.
- Giữ nguyên tất cả endpoint và HTTP method.
- Giữ nguyên API-D1 đến API-D10.
- Giữ nguyên nhãn [PENDING], [MISSING], TBD.
- Quy tắc A3 được làm nổi bật.
- PATCH Application không cho phép ACCEPTED.
- PATCH Proposal không cho phép ACCEPTED.
- Chỉ POST /jobs/:jobId/selections được tạo Work Assignment.
- Work Assignment không dùng trạng thái SUBMITTED.
- /admin/stats và /admin/logs vẫn là Gap G-49/G-50.
- Không tạo UC-23/UC-24.
- Không tự điền các schema còn thiếu.
- Không ghi nhận API đã triển khai hoặc test Pass khi chưa có bằng chứng.