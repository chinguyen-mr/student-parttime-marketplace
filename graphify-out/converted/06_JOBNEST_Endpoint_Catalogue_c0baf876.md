<!-- converted from 06_JOBNEST_Endpoint_Catalogue.xlsx -->

## Sheet: Đọc trước
| JOBNEST — 06_JOBNEST_Endpoint_Catalogue.xlsx |  |
| --- | --- |
| Tài liệu đi kèm | 06_JOBNEST_API_Contract.docx (Draft — v2.1 — Revision 2) |
| Trạng thái | DRAFT — chưa Approved. Không ghi nhận endpoint đã triển khai hoặc test Pass. |
| Nhãn | [ĐỀ XUẤT – chờ duyệt] = do biên soạn đề xuất; TBD = chưa quyết định; Baseline/PENDING/MISSING = nhãn gốc File 06. |
| Cột "Nguồn đường dẫn" | File 06 = có trong v2.1; [ĐỀ XUẤT] = đường dẫn do biên soạn đề xuất cho chức năng [MISSING] hoặc API-D2. |
| Sheet | Endpoints · Fields · Error Catalogue · API-D Register · Missing & Gap · Tổng kết · Đối chiếu thay đổi |
## Sheet: Endpoints
| ID | Method | Path | Nhóm | Role | Trạng thái | FR | UC | WF | Request | Response | HTTP OK | Lỗi | Ghi chú / TBD | Nguồn đường dẫn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E-01 | POST | /auth/register | Authentication | GUEST | Baseline | FR-01 | UC-01 | WF-G04 | email:string:R; password:string:R; role:enum(STUDENT|INDIVIDUAL_EMPLOYER):R; fullName:string:R nếu STUDENT; displayName:string:R nếu EMPLOYER | userId:string; role:enum | 201 | VALIDATION_ERROR 400; DUPLICATE_RESOURCE 409 | Chính sách mật khẩu: TBD (UC-01 4b). role=ADMIN bị từ chối (BR-02). | File 06 |
| E-02 | POST | /auth/login | Authentication | GUEST | Baseline | FR-02 | UC-02 | WF-G05 | email:string:R; password:string:R | accessToken:string; role:enum; userId:string | 200 | INVALID_CREDENTIALS 401; FORBIDDEN 403 (tài khoản LOCKED) | Thời hạn JWT: TBD (C1). | File 06 |
| E-03 | POST | /auth/logout | Authentication | Đã đăng nhập | MISSING | FR-02 | UC-02 | WF-G05 | — | — | TBD | UNAUTHENTICATED 401 | Endpoint chưa có. Đường dẫn là [ĐỀ XUẤT]. | File 06 |
| E-04 | POST | /auth/forgot-password | Authentication | GUEST | Baseline | FR-04 | UC-03 | WF-G05 | email:string:R | message:string (thông báo chung) | 202 | VALIDATION_ERROR 400; RATE_LIMIT_EXCEEDED 429 | Không tiết lộ email có tồn tại (File 06 §2.1). | File 06 |
| E-05 | POST | /auth/reset-password | Authentication | GUEST | MISSING | FR-04 | UC-03 | WF-G05 | token:string:R; newPassword:string:R; confirmPassword:string:R | message:string | 200 | TOKEN_EXPIRED 410; VALIDATION_ERROR 400 | Endpoint chưa có; đường dẫn và phương thức OTP/link là [ĐỀ XUẤT]. Expiry token: TBD. | [ĐỀ XUẤT] |
| E-06 | POST | /employers/me/verifications/email/request | Verification | INDIVIDUAL_EMPLOYER | MISSING | FR-05 | UC-06 | WF-E03 | — | message:string | 200 | VALIDATION_ERROR 400; TOKEN_EXPIRED 410; RATE_LIMIT_EXCEEDED 429 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. G-15 expiry, G-16 rate limit, provider: TBD. | [ĐỀ XUẤT] |
| E-07 | POST | /employers/me/verifications/email/verify | Verification | INDIVIDUAL_EMPLOYER | MISSING | FR-05 | UC-06 | WF-E03 | code:string:R | verified:boolean; verifiedAt:timestamp | 200 | VALIDATION_ERROR 400; TOKEN_EXPIRED 410; RATE_LIMIT_EXCEEDED 429 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. G-15 expiry, G-16 rate limit, provider: TBD. | [ĐỀ XUẤT] |
| E-08 | POST | /employers/me/verifications/phone/request | Verification | INDIVIDUAL_EMPLOYER | MISSING | FR-06 | UC-06 | WF-E03 | — | message:string | 200 | VALIDATION_ERROR 400; TOKEN_EXPIRED 410; RATE_LIMIT_EXCEEDED 429 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. G-15 expiry, G-16 rate limit, provider: TBD. | [ĐỀ XUẤT] |
| E-09 | POST | /employers/me/verifications/phone/verify | Verification | INDIVIDUAL_EMPLOYER | MISSING | FR-06 | UC-06 | WF-E03 | code:string:R | verified:boolean; verifiedAt:timestamp | 200 | VALIDATION_ERROR 400; TOKEN_EXPIRED 410; RATE_LIMIT_EXCEEDED 429 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. G-15 expiry, G-16 rate limit, provider: TBD. | [ĐỀ XUẤT] |
| E-10 | GET | /students/me | Profile | STUDENT | MISSING | FR-07 | UC-04 | WF-S02 | — | fullName; dateOfBirth; school; major; bio; avatarUrl; skills[]; educations[]; experiences[] | 200 | UNAUTHENTICATED 401; FORBIDDEN 403 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. Certificate: TBD (S1). | [ĐỀ XUẤT] |
| E-11 | PATCH | /students/me | Profile | STUDENT | MISSING | FR-07 | UC-04 | WF-S02 | fullName:string; dateOfBirth:date; school:string; major:string; bio:string; skills:array; educations:array; experiences:array | Hồ sơ đã cập nhật | 200 | VALIDATION_ERROR 400; FORBIDDEN 403 | Endpoint chưa có; [ĐỀ XUẤT]. end_date < start_date: TBD. | [ĐỀ XUẤT] |
| E-12 | GET | /employers/me | Profile | INDIVIDUAL_EMPLOYER | MISSING | FR-09; FR-10 | UC-05 | WF-E02 | — | displayName; bio; location; avatarUrl; email; phone; emailVerifiedAt; phoneVerifiedAt | 200 | UNAUTHENTICATED 401 | Endpoint chưa có; [ĐỀ XUẤT]. | [ĐỀ XUẤT] |
| E-13 | PATCH | /employers/me | Profile | INDIVIDUAL_EMPLOYER | MISSING | FR-09 | UC-05 | WF-E02 | displayName:string; bio:string; location:string; avatarUrl:string | Hồ sơ đã cập nhật | 200 | VALIDATION_ERROR 400 | Email, phone, verified_at không sửa được qua endpoint này; [ĐỀ XUẤT]. | [ĐỀ XUẤT] |
| E-14 | GET | /employers/:id/profile | Profile | GUEST / Đã đăng nhập | MISSING | FR-10; FR-19 | UC-05; UC-09 | WF-G03; WF-G06 | — | displayName; bio; location; avatarUrl; trạng thái xác minh (mức công khai: TBD); jobs đang tuyển | 200 | RESOURCE_NOT_FOUND 404 | Endpoint chưa có; [ĐỀ XUẤT]. NFR-06: dữ liệu liên hệ nào được công khai: TBD. | [ĐỀ XUẤT] |
| E-15 | GET | /students/me/cvs | CV (API-D1) | STUDENT | PENDING | FR-08 | UC-04 | WF-S03 | — | data[]: cvId; originalName; mimeType; sizeBytes; isDefault; createdAt | 200 | UNAUTHENTICATED 401 | file_key không trả về. | File 06 |
| E-16 | POST | /students/me/cvs | CV (API-D1) | STUDENT | PENDING | FR-08 | UC-04 | WF-S03 | file:file:R; isDefault:boolean | cvId; originalName; isDefault | 201 | VALIDATION_ERROR 400 | MIME/size, storage: TBD. T2: tối đa một CV mặc định (đề xuất, chưa migrate). | File 06 |
| E-17 | PATCH | /students/me/cvs/:id | CV (API-D1) | STUDENT (chủ CV) | PENDING | FR-08 | UC-04 | WF-S03 | originalName:string; isDefault:boolean | CV đã cập nhật | 200 | OWNERSHIP_REQUIRED 403; RESOURCE_NOT_FOUND 404; STATE_TRANSITION_INVALID 409 | — | File 06 |
| E-18 | DELETE | /students/me/cvs/:id | CV (API-D1) | STUDENT (chủ CV) | PENDING | FR-08 | UC-04 | WF-S03 | — | — | 200 | OWNERSHIP_REQUIRED 403; RESOURCE_NOT_FOUND 404; DUPLICATE_RESOURCE/Conflict nếu đang được Application tham chiếu: TBD | Chính sách xóa CV đang được applications.cv_id tham chiếu: TBD. | File 06 |
| E-19 | GET | /students/me/saved-jobs | Saved Jobs (API-D2) | STUDENT | PENDING | FR-20 | UC-10 | WF-S04 | page; limit | data[]: jobId; title; jobType; employer; location; status; savedAt | 200 | UNAUTHENTICATED 401 | File 06 không có mục API-D2; đường dẫn là [ĐỀ XUẤT]. Job CLOSED có hiển thị hay không: TBD. | [ĐỀ XUẤT] |
| E-20 | POST | /jobs/:jobId/save | Saved Jobs (API-D2) | STUDENT | PENDING | FR-20 | UC-10 | WF-G03; WF-S04 | — | savedAt:timestamp | 201 | DUPLICATE_RESOURCE 409; RESOURCE_NOT_FOUND 404 | Đường dẫn là [ĐỀ XUẤT]. | [ĐỀ XUẤT] |
| E-21 | DELETE | /jobs/:jobId/save | Saved Jobs (API-D2) | STUDENT | PENDING | FR-20 | UC-10 | WF-S04 | — | — | 200 | RESOURCE_NOT_FOUND 404 | Đường dẫn là [ĐỀ XUẤT]. | [ĐỀ XUẤT] |
| E-22 | GET | /jobs | Job | GUEST / Student | Baseline | FR-16; FR-17; FR-18 | UC-09 | WF-G01; WF-G02 | keywords; job_type; category; location; salary_min; salary_max; page; limit; sort | data[]: jobId; title; jobType; location (+ employer, salary/budget, postedAt: TBD); pagination{page,limit,total} | 200 | VALIDATION_ERROR 400 | Chỉ trả Job PUBLISHED. Max limit, sort mặc định: TBD (G-21, G-22, G-24). | File 06 |
| E-23 | GET | /jobs/:jobId | Job | GUEST / Student | Baseline | FR-19 | UC-09 | WF-G03 | — | jobId; title; jobType; description; + trường theo loại Job | 200 | RESOURCE_NOT_FOUND 404 | Job không công khai → 404. Hiển thị CLOSED/EXPIRED: TBD (G-23). | File 06 |
| E-24 | POST | /jobs | Job | INDIVIDUAL_EMPLOYER (đã xác minh) | Baseline | FR-11; FR-12; FR-13 | UC-07 | WF-E05 | title:string:R; jobType:enum(PART_TIME|SEASONAL|FREELANCE):R; description:string:R; location; categoryId; quantityRequired:int>=1:R; theo loại: workSchedule/payUnit/salary (PT,SV); startDate,endDate (SV); scope,deliverableRequirements,deadline,budget (FL) | jobId; status=DRAFT | 201 | VALIDATION_ERROR 400; FORBIDDEN 403 (chưa xác minh) | Chi tiết trường theo loại: [ĐỀ XUẤT]. S6, C10: TBD. | File 06 |
| E-25 | PATCH | /jobs/:jobId | Job | INDIVIDUAL_EMPLOYER (chủ Job) | Baseline (method chưa chốt) | FR-14 | UC-07 | WF-E05 | các trường Job được phép sửa | Job đã cập nhật | 200 | OWNERSHIP_REQUIRED 403; STATE_TRANSITION_INVALID 409 | PATCH hoặc PUT: chưa chốt, không tự chọn. | File 06 |
| E-26 | POST | /jobs/:jobId/submit-review | Job | INDIVIDUAL_EMPLOYER (chủ Job) | Baseline | FR-14 | UC-07 | WF-E05 | — | status=PENDING_REVIEW | 200 | STATE_TRANSITION_INVALID 409; FORBIDDEN 403 | — | File 06 |
| E-27 | POST | /jobs/:jobId/close | Job | INDIVIDUAL_EMPLOYER (chủ Job) | MISSING | FR-14 | UC-07 | WF-E04 | — | status=CLOSED | 200 | STATE_TRANSITION_INVALID 409; OWNERSHIP_REQUIRED 403 | File 06 §4.6: [MISSING]. Đường dẫn là [ĐỀ XUẤT]. C4 TBD. | [ĐỀ XUẤT] |
| E-28 | GET | /admin/jobs/pending | Moderation | ADMIN | Baseline | FR-15 | UC-08 | WF-A03 | jobType; page; limit | data[]: jobId; title; employer; jobType; submittedAt | 200 | FORBIDDEN 403 | C9 TBD. | File 06 |
| E-29 | PATCH | /admin/jobs/:id/moderation | Moderation | ADMIN | Baseline | FR-15 | UC-08 | WF-A04 | decision:enum(APPROVE|REJECT):R; moderationReason:string (bắt buộc khi REJECT) | status=PUBLISHED|REJECTED | 200 | VALIDATION_ERROR 400; STATE_TRANSITION_INVALID 409 | Giá trị decision là [ĐỀ XUẤT]. Ghi admin_logs (BR-17). | File 06 |
| E-30 | POST | /jobs/:jobId/applications | Application | STUDENT | Baseline | FR-21 | UC-11 | WF-S06 | cvId:int; coverLetter:string | applicationId; status=PENDING | 201 | DUPLICATE_RESOURCE 409; STATE_TRANSITION_INVALID 409 (Job đóng); VALIDATION_ERROR 400 | CV bắt buộc hay tùy chọn: TBD (G-28). Chỉ Job PT/SV. | File 06 |
| E-31 | GET | /jobs/:jobId/applications | Application | INDIVIDUAL_EMPLOYER (chủ Job) | Baseline | FR-23 | UC-12 | WF-E06 | status; page; limit | data[]: applicationId; student; cvLink; submittedAt; status | 200 | OWNERSHIP_REQUIRED 403 | Bộ lọc: TBD (G-29). | File 06 |
| E-32 | PATCH | /applications/:id/status | Application | INDIVIDUAL_EMPLOYER (chủ Job) | Baseline | FR-24 | UC-12 | WF-E06 | status:enum(REVIEWING|SHORTLISTED|REJECTED):R; note:string | status | 200 | STATE_TRANSITION_INVALID 409 (gồm ACCEPTED); OWNERSHIP_REQUIRED 403 | Không cho ACCEPTED (A3). | File 06 |
| E-33 | GET | /applications/me | Application (API-D3) | STUDENT | PENDING | FR-22 | UC-12 | WF-S05 | status; page; limit | data[]: applicationId; job; employer; submittedAt; status | 200 | UNAUTHENTICATED 401 | Chỉ bao gồm Application; Proposal chưa có endpoint lịch sử (xem §10). | File 06 |
| E-34 | PATCH | /applications/:id/withdraw | Application (API-D4) | STUDENT (chủ đơn) | PENDING | FR-22 | UC-12 | WF-S05; WF-S12 | — | status=WITHDRAWN | 200 | STATE_TRANSITION_INVALID 409; OWNERSHIP_REQUIRED 403 | Chính sách: TBD (C2, S2). | File 06 |
| E-35 | POST | /jobs/:jobId/proposals | Proposal | STUDENT | Baseline | FR-25 | UC-13 | WF-S07 | proposalText:string:R; estimatedDuration:string; proposedPrice:int (nếu trường được bật) | proposalId; status=SUBMITTED | 201 | DUPLICATE_RESOURCE 409; VALIDATION_ERROR 400 | Chỉ Job FREELANCE. Trường giá: TBD. | File 06 |
| E-36 | GET | /jobs/:jobId/proposals | Proposal | INDIVIDUAL_EMPLOYER (chủ Job) | Baseline | FR-26 | UC-14 | WF-E07 | status; page; limit | data[]: proposalId; student; estimatedDuration; proposedPrice; status | 200 | OWNERSHIP_REQUIRED 403 | Proposal detail API: TBD (G-32). | File 06 |
| E-37 | PATCH | /proposals/:id/status | Proposal | INDIVIDUAL_EMPLOYER (chủ Job) | Baseline | FR-26 | UC-14 | WF-E07 | status:enum(REVIEWING|REJECTED):R | status | 200 | STATE_TRANSITION_INVALID 409 (gồm ACCEPTED) | Không cho ACCEPTED (A3). Transition: TBD (G-33). | File 06 |
| E-38 | PATCH | /proposals/:id/withdraw | Proposal (API-D5) | STUDENT (chủ đề xuất) | PENDING | FR-22 | UC-13 | WF-S12 | — | status=WITHDRAWN | 200 | STATE_TRANSITION_INVALID 409 | TBD (S3, G-38, G-39). | File 06 |
| E-39 | POST | /jobs/:jobId/selections | Selection (A3) | INDIVIDUAL_EMPLOYER (chủ Job) | Baseline | FR-27; FR-28 | UC-15 | WF-E08 | candidates:array:R (mỗi phần tử: sourceType=APPLICATION|PROPOSAL; sourceId) | assignments[]: assignmentId; studentId; status=NOT_STARTED | 201 | QUANTITY_EXCEEDED 409; STATE_TRANSITION_INVALID 409; OWNERSHIP_REQUIRED 403 | Endpoint DUY NHẤT chọn ứng viên và tạo Work Assignment. Cấu trúc request là [ĐỀ XUẤT]. G-35, G-36, G-37, C3. | File 06 |
| E-40 | GET | /assignments/:id | Work | Các bên của Assignment | Baseline | FR-29 | UC-16 | WF-S08; WF-E09 | — | assignmentId; status; job; student; progressHistory[] (G-58) | 200 | OWNERSHIP_REQUIRED 403; RESOURCE_NOT_FOUND 404 | Cấu trúc progressHistory: TBD (G-58). | File 06 |
| E-41 | POST | /assignments/:id/progress | Work | TBD (G-06) | Baseline | FR-30 | UC-16 | WF-S08 | progressPercent:int; description:string | progressId; createdAt | 201 | VALIDATION_ERROR 400; OWNERSHIP_REQUIRED 403 | Actor, range progressPercent: TBD (G-06). | File 06 |
| E-42 | POST | /assignments/:id/deliverables | Deliverable | STUDENT (được giao) | Baseline | FR-31 | UC-17 | WF-S09 | file:file; externalLink:string; description:string | deliverableId; versionNo; status=SUBMITTED | 201 | VALIDATION_ERROR 400; OWNERSHIP_REQUIRED 403 | Mỗi lần gửi tạo version mới. MIME/size: TBD. Cần file hoặc link: [ĐỀ XUẤT]. | File 06 |
| E-43 | GET | /assignments/:id/deliverables | Deliverable (API-D6) | Các bên của Assignment | PENDING | FR-31; FR-32 | UC-17 | WF-S09; WF-E10 | — | data[]: deliverableId; versionNo; status; submittedAt; comment | 200 | OWNERSHIP_REQUIRED 403 | Response schema chưa hoàn thiện. | File 06 |
| E-44 | PATCH | /deliverables/:id/decision | Deliverable | INDIVIDUAL_EMPLOYER (chủ Job) | Baseline | FR-32 | UC-17 | WF-E10 | decision:enum(ACCEPTED|REVISION_REQUESTED):R; comment:string (bắt buộc khi REVISION_REQUESTED) | deliverableId; status | 200 | VALIDATION_ERROR 400; OWNERSHIP_REQUIRED 403; STATE_TRANSITION_INVALID 409 | Assignment vẫn IN_PROGRESS. Revision limit: TBD (C10). | File 06 |
| E-45 | PATCH | /assignments/:id/complete | Work | INDIVIDUAL_EMPLOYER (chủ Job) | Baseline | FR-33 | UC-18 | WF-E09 | — | status=COMPLETED; completedAt | 200 | STATE_TRANSITION_INVALID 409; OWNERSHIP_REQUIRED 403 | FL: Deliverable mới nhất phải ACCEPTED. Idempotency: TBD (G-59). | File 06 |
| E-46 | POST | /assignments/:id/reviews | Review | STUDENT / INDIVIDUAL_EMPLOYER | Baseline | FR-34; FR-35 | UC-19 | WF-S10; WF-E11 | rating:int:R; comment:string | reviewId; createdAt | 201 | STATE_TRANSITION_INVALID 409 (chưa COMPLETED); DUPLICATE_RESOURCE 409; OWNERSHIP_REQUIRED 403 | Rating scale, comment rules: TBD (C10, G-41, G-42). | File 06 |
| E-47 | GET | /notifications | Notification | Đã đăng nhập | Baseline | FR-36 | UC-20 | WF-S11; WF-E12 | page; limit; unreadOnly:boolean | data[]: notificationId; type; title; body; targetType; targetId; readAt; createdAt | 200 | UNAUTHENTICATED 401 | Pagination/sort: TBD (G-07). | File 06 |
| E-48 | PATCH | /notifications/:id/read | Notification | Chủ thông báo | Baseline | FR-36 | UC-20 | WF-S11; WF-E12 | — | readAt | 200 | OWNERSHIP_REQUIRED 403; RESOURCE_NOT_FOUND 404 | Idempotency: TBD (G-43). Xóa: TBD (G-44). | File 06 |
| E-49 | GET | /admin/reports | Report | ADMIN | Baseline | FR-39 | UC-22 | WF-A05 | status; targetType; page; limit | data[]: reportId; reporter; targetType; targetId; reason; status | 200 | FORBIDDEN 403 | Status enum: TBD (G-48). | File 06 |
| E-50 | PATCH | /admin/reports/:id | Report | ADMIN | Baseline | FR-39 | UC-22 | WF-A06 | action:string:R (enum TBD); note:string | reportId; status | 200 | VALIDATION_ERROR 400; STATE_TRANSITION_INVALID 409 | Schema chi tiết cần đối chiếu. G-48, G-51 TBD. | File 06 |
| E-51 | GET | /admin/users | Admin User (API-D7) | ADMIN | PENDING | FR-37 | UC-21 | WF-A02 | role; status; q; page; limit | data[]: userId; email; role; accountStatus; createdAt | 200 | FORBIDDEN 403 | — | File 06 |
| E-52 | PATCH | /admin/users/:id/status | Admin User (API-D7) | ADMIN | PENDING | FR-37 | UC-21 | WF-A02 | accountStatus:enum(ACTIVE|LOCKED):R | userId; accountStatus | 200 | STATE_TRANSITION_INVALID 409 (khóa Admin cuối) | C6 TBD. | File 06 |
| E-53 | GET | /admin/categories | Admin Category (API-D8) | ADMIN | PENDING | FR-38 | UC-21 | WF-A07 | — | data[]/category | 200 | VALIDATION_ERROR 400; FORBIDDEN 403 | Chính sách xóa khi có Job tham chiếu, parent-child: TBD (G-46, S5). | File 06 |
| E-54 | POST | /admin/categories | Admin Category (API-D8) | ADMIN | PENDING | FR-38 | UC-21 | WF-A07 | name:string:R (POST); parentId:int; isActive:boolean | data[]/category | 201 | VALIDATION_ERROR 400; FORBIDDEN 403 | Chính sách xóa khi có Job tham chiếu, parent-child: TBD (G-46, S5). | File 06 |
| E-55 | PATCH | /admin/categories/:id | Admin Category (API-D8) | ADMIN | PENDING | FR-38 | UC-21 | WF-A07 | name:string:R (POST); parentId:int; isActive:boolean | data[]/category | 200 | VALIDATION_ERROR 400; FORBIDDEN 403 | Chính sách xóa khi có Job tham chiếu, parent-child: TBD (G-46, S5). | File 06 |
| E-56 | DELETE | /admin/categories/:id | Admin Category (API-D8) | ADMIN | PENDING | FR-38 | UC-21 | WF-A07 | — | data[]/category | 200 | VALIDATION_ERROR 400; FORBIDDEN 403 | Chính sách xóa khi có Job tham chiếu, parent-child: TBD (G-46, S5). | File 06 |
| E-57 | GET | /categories | Public Category (API-D9) | GUEST | PENDING | FR-17; FR-38 | UC-09 | WF-G01; WF-G02 | — | data[]: categoryId; name; parentId | 200 | — | Route công khai: TBD (S5). | File 06 |
| E-58 | POST | /reports | Report (API-D10) | Đã đăng nhập | PENDING | FR-39 | UC-22 | WF-X01 | targetType:enum(JOB|USER):R; targetId:int:R; reason:string:R; description:string | reportId; status | 201 | VALIDATION_ERROR 400; RESOURCE_NOT_FOUND 404 | Status khởi tạo TBD (G-48); báo cáo trùng: TBD (G-51). | File 06 |
| E-59 | GET | /admin/stats | Admin Stats | ADMIN | MISSING (G-49) | FR-40 | — | WF-A01 | — | — | TBD | — | Không tạo UC-23/24. Mã G-49 đang dùng hai nghĩa (xem CF-05). | File 06 |
| E-60 | GET | /admin/logs | Admin Logs | ADMIN | MISSING (G-50) | FR-40 | — | WF-A08 | adminId; actionType; dateFrom; dateTo; page; limit | data[]: timestamp; admin; action; target; metadata | TBD | FORBIDDEN 403 | Retention, filter: TBD (G-51). | File 06 |
## Sheet: Fields
| Endpoint ID | Hướng | Trường | Kiểu | Bắt buộc | Ghi chú gốc |
| --- | --- | --- | --- | --- | --- |
| E-01 | Request | email | string | Bắt buộc | email:string:R |
| E-01 | Request | password | string | Bắt buộc | password:string:R |
| E-01 | Request | role | enum(STUDENT|INDIVIDUAL_EMPLOYER) | Bắt buộc | role:enum(STUDENT|INDIVIDUAL_EMPLOYER):R |
| E-01 | Request | fullName | string | Bắt buộc | fullName:string:R nếu STUDENT |
| E-01 | Request | displayName | string | Bắt buộc | displayName:string:R nếu EMPLOYER |
| E-01 | Response | userId | string |  |  |
| E-01 | Response | role | enum |  |  |
| E-02 | Request | email | string | Bắt buộc | email:string:R |
| E-02 | Request | password | string | Bắt buộc | password:string:R |
| E-02 | Response | accessToken | string |  |  |
| E-02 | Response | role | enum |  |  |
| E-02 | Response | userId | string |  |  |
| E-04 | Request | email | string | Bắt buộc | email:string:R |
| E-04 | Response | message | string (thông báo chung) |  |  |
| E-05 | Request | token | string | Bắt buộc | token:string:R |
| E-05 | Request | newPassword | string | Bắt buộc | newPassword:string:R |
| E-05 | Request | confirmPassword | string | Bắt buộc | confirmPassword:string:R |
| E-05 | Response | message | string |  |  |
| E-06 | Response | message | string |  |  |
| E-07 | Request | code | string | Bắt buộc | code:string:R |
| E-07 | Response | verified | boolean |  |  |
| E-07 | Response | verifiedAt | timestamp |  |  |
| E-08 | Response | message | string |  |  |
| E-09 | Request | code | string | Bắt buộc | code:string:R |
| E-09 | Response | verified | boolean |  |  |
| E-09 | Response | verifiedAt | timestamp |  |  |
| E-10 | Response | fullName |  |  |  |
| E-10 | Response | dateOfBirth |  |  |  |
| E-10 | Response | school |  |  |  |
| E-10 | Response | major |  |  |  |
| E-10 | Response | bio |  |  |  |
| E-10 | Response | avatarUrl |  |  |  |
| E-10 | Response | skills[] |  |  |  |
| E-10 | Response | educations[] |  |  |  |
| E-10 | Response | experiences[] |  |  |  |
| E-11 | Request | fullName | string |  |  |
| E-11 | Request | dateOfBirth | date |  |  |
| E-11 | Request | school | string |  |  |
| E-11 | Request | major | string |  |  |
| E-11 | Request | bio | string |  |  |
| E-11 | Request | skills | array |  |  |
| E-11 | Request | educations | array |  |  |
| E-11 | Request | experiences | array |  |  |
| E-11 | Response | Hồ sơ đã cập nhật |  |  |  |
| E-12 | Response | displayName |  |  |  |
| E-12 | Response | bio |  |  |  |
| E-12 | Response | location |  |  |  |
| E-12 | Response | avatarUrl |  |  |  |
| E-12 | Response | email |  |  |  |
| E-12 | Response | phone |  |  |  |
| E-12 | Response | emailVerifiedAt |  |  |  |
| E-12 | Response | phoneVerifiedAt |  |  |  |
| E-13 | Request | displayName | string |  |  |
| E-13 | Request | bio | string |  |  |
| E-13 | Request | location | string |  |  |
| E-13 | Request | avatarUrl | string |  |  |
| E-13 | Response | Hồ sơ đã cập nhật |  |  |  |
| E-14 | Response | displayName |  |  |  |
| E-14 | Response | bio |  |  |  |
| E-14 | Response | location |  |  |  |
| E-14 | Response | avatarUrl |  |  |  |
| E-14 | Response | trạng thái xác minh (mức công khai |  TBD) |  |  |
| E-14 | Response | jobs đang tuyển |  |  |  |
| E-15 | Response | data[] |  cvId |  |  |
| E-15 | Response | originalName |  |  |  |
| E-15 | Response | mimeType |  |  |  |
| E-15 | Response | sizeBytes |  |  |  |
| E-15 | Response | isDefault |  |  |  |
| E-15 | Response | createdAt |  |  |  |
| E-16 | Request | file | file | Bắt buộc | file:file:R |
| E-16 | Request | isDefault | boolean |  |  |
| E-16 | Response | cvId |  |  |  |
| E-16 | Response | originalName |  |  |  |
| E-16 | Response | isDefault |  |  |  |
| E-17 | Request | originalName | string |  |  |
| E-17 | Request | isDefault | boolean |  |  |
| E-17 | Response | CV đã cập nhật |  |  |  |
| E-19 | Request | page |  |  |  |
| E-19 | Request | limit |  |  |  |
| E-19 | Response | data[] |  jobId |  |  |
| E-19 | Response | title |  |  |  |
| E-19 | Response | jobType |  |  |  |
| E-19 | Response | employer |  |  |  |
| E-19 | Response | location |  |  |  |
| E-19 | Response | status |  |  |  |
| E-19 | Response | savedAt |  |  |  |
| E-20 | Response | savedAt | timestamp |  |  |
| E-22 | Request | keywords |  |  |  |
| E-22 | Request | job_type |  |  |  |
| E-22 | Request | category |  |  |  |
| E-22 | Request | location |  |  |  |
| E-22 | Request | salary_min |  |  |  |
| E-22 | Request | salary_max |  |  |  |
| E-22 | Request | page |  |  |  |
| E-22 | Request | limit |  |  |  |
| E-22 | Request | sort |  |  |  |
| E-22 | Response | data[] |  jobId |  |  |
| E-22 | Response | title |  |  |  |
| E-22 | Response | jobType |  |  |  |
| E-22 | Response | location (+ employer, salary/budget, postedAt |  TBD) |  |  |
| E-22 | Response | pagination{page,limit,total} |  |  |  |
| E-23 | Response | jobId |  |  |  |
| E-23 | Response | title |  |  |  |
| E-23 | Response | jobType |  |  |  |
| E-23 | Response | description |  |  |  |
| E-23 | Response | + trường theo loại Job |  |  |  |
| E-24 | Request | title | string | Bắt buộc | title:string:R |
| E-24 | Request | jobType | enum(PART_TIME|SEASONAL|FREELANCE) | Bắt buộc | jobType:enum(PART_TIME|SEASONAL|FREELANCE):R |
| E-24 | Request | description | string | Bắt buộc | description:string:R |
| E-24 | Request | location |  |  |  |
| E-24 | Request | categoryId |  |  |  |
| E-24 | Request | quantityRequired | int>=1 | Bắt buộc | quantityRequired:int>=1:R |
| E-24 | Request | theo loại |  workSchedule/payUnit/salary (PT,SV) |  |  |
| E-24 | Request | startDate,endDate (SV) |  |  |  |
| E-24 | Request | scope,deliverableRequirements,deadline,budget (FL) |  |  |  |
| E-24 | Response | jobId |  |  |  |
| E-24 | Response | status=DRAFT |  |  |  |
| E-25 | Request | các trường Job được phép sửa |  |  |  |
| E-25 | Response | Job đã cập nhật |  |  |  |
| E-26 | Response | status=PENDING_REVIEW |  |  |  |
| E-27 | Response | status=CLOSED |  |  |  |
| E-28 | Request | jobType |  |  |  |
| E-28 | Request | page |  |  |  |
| E-28 | Request | limit |  |  |  |
| E-28 | Response | data[] |  jobId |  |  |
| E-28 | Response | title |  |  |  |
| E-28 | Response | employer |  |  |  |
| E-28 | Response | jobType |  |  |  |
| E-28 | Response | submittedAt |  |  |  |
| E-29 | Request | decision | enum(APPROVE|REJECT) | Bắt buộc | decision:enum(APPROVE|REJECT):R |
| E-29 | Request | moderationReason | string (bắt buộc khi REJECT) |  |  |
| E-29 | Response | status=PUBLISHED|REJECTED |  |  |  |
| E-30 | Request | cvId | int |  |  |
| E-30 | Request | coverLetter | string |  |  |
| E-30 | Response | applicationId |  |  |  |
| E-30 | Response | status=PENDING |  |  |  |
| E-31 | Request | status |  |  |  |
| E-31 | Request | page |  |  |  |
| E-31 | Request | limit |  |  |  |
| E-31 | Response | data[] |  applicationId |  |  |
| E-31 | Response | student |  |  |  |
| E-31 | Response | cvLink |  |  |  |
| E-31 | Response | submittedAt |  |  |  |
| E-31 | Response | status |  |  |  |
| E-32 | Request | status | enum(REVIEWING|SHORTLISTED|REJECTED) | Bắt buộc | status:enum(REVIEWING|SHORTLISTED|REJECTED):R |
| E-32 | Request | note | string |  |  |
| E-32 | Response | status |  |  |  |
| E-33 | Request | status |  |  |  |
| E-33 | Request | page |  |  |  |
| E-33 | Request | limit |  |  |  |
| E-33 | Response | data[] |  applicationId |  |  |
| E-33 | Response | job |  |  |  |
| E-33 | Response | employer |  |  |  |
| E-33 | Response | submittedAt |  |  |  |
| E-33 | Response | status |  |  |  |
| E-34 | Response | status=WITHDRAWN |  |  |  |
| E-35 | Request | proposalText | string | Bắt buộc | proposalText:string:R |
| E-35 | Request | estimatedDuration | string |  |  |
| E-35 | Request | proposedPrice | int (nếu trường được bật) |  |  |
| E-35 | Response | proposalId |  |  |  |
| E-35 | Response | status=SUBMITTED |  |  |  |
| E-36 | Request | status |  |  |  |
| E-36 | Request | page |  |  |  |
| E-36 | Request | limit |  |  |  |
| E-36 | Response | data[] |  proposalId |  |  |
| E-36 | Response | student |  |  |  |
| E-36 | Response | estimatedDuration |  |  |  |
| E-36 | Response | proposedPrice |  |  |  |
| E-36 | Response | status |  |  |  |
| E-37 | Request | status | enum(REVIEWING|REJECTED) | Bắt buộc | status:enum(REVIEWING|REJECTED):R |
| E-37 | Response | status |  |  |  |
| E-38 | Response | status=WITHDRAWN |  |  |  |
| E-39 | Request | candidates | array | Bắt buộc | candidates:array:R (mỗi phần tử: sourceType=APPLICATION|PROPOSAL |
| E-39 | Request | sourceId) |  |  |  |
| E-39 | Response | assignments[] |  assignmentId |  |  |
| E-39 | Response | studentId |  |  |  |
| E-39 | Response | status=NOT_STARTED |  |  |  |
| E-40 | Response | assignmentId |  |  |  |
| E-40 | Response | status |  |  |  |
| E-40 | Response | job |  |  |  |
| E-40 | Response | student |  |  |  |
| E-40 | Response | progressHistory[] (G-58) |  |  |  |
| E-41 | Request | progressPercent | int |  |  |
| E-41 | Request | description | string |  |  |
| E-41 | Response | progressId |  |  |  |
| E-41 | Response | createdAt |  |  |  |
| E-42 | Request | file | file |  |  |
| E-42 | Request | externalLink | string |  |  |
| E-42 | Request | description | string |  |  |
| E-42 | Response | deliverableId |  |  |  |
| E-42 | Response | versionNo |  |  |  |
| E-42 | Response | status=SUBMITTED |  |  |  |
| E-43 | Response | data[] |  deliverableId |  |  |
| E-43 | Response | versionNo |  |  |  |
| E-43 | Response | status |  |  |  |
| E-43 | Response | submittedAt |  |  |  |
| E-43 | Response | comment |  |  |  |
| E-44 | Request | decision | enum(ACCEPTED|REVISION_REQUESTED) | Bắt buộc | decision:enum(ACCEPTED|REVISION_REQUESTED):R |
| E-44 | Request | comment | string (bắt buộc khi REVISION_REQUESTED) |  |  |
| E-44 | Response | deliverableId |  |  |  |
| E-44 | Response | status |  |  |  |
| E-45 | Response | status=COMPLETED |  |  |  |
| E-45 | Response | completedAt |  |  |  |
| E-46 | Request | rating | int | Bắt buộc | rating:int:R |
| E-46 | Request | comment | string |  |  |
| E-46 | Response | reviewId |  |  |  |
| E-46 | Response | createdAt |  |  |  |
| E-47 | Request | page |  |  |  |
| E-47 | Request | limit |  |  |  |
| E-47 | Request | unreadOnly | boolean |  |  |
| E-47 | Response | data[] |  notificationId |  |  |
| E-47 | Response | type |  |  |  |
| E-47 | Response | title |  |  |  |
| E-47 | Response | body |  |  |  |
| E-47 | Response | targetType |  |  |  |
| E-47 | Response | targetId |  |  |  |
| E-47 | Response | readAt |  |  |  |
| E-47 | Response | createdAt |  |  |  |
| E-48 | Response | readAt |  |  |  |
| E-49 | Request | status |  |  |  |
| E-49 | Request | targetType |  |  |  |
| E-49 | Request | page |  |  |  |
| E-49 | Request | limit |  |  |  |
| E-49 | Response | data[] |  reportId |  |  |
| E-49 | Response | reporter |  |  |  |
| E-49 | Response | targetType |  |  |  |
| E-49 | Response | targetId |  |  |  |
| E-49 | Response | reason |  |  |  |
| E-49 | Response | status |  |  |  |
| E-50 | Request | action | string | Bắt buộc | action:string:R (enum TBD) |
| E-50 | Request | note | string |  |  |
| E-50 | Response | reportId |  |  |  |
| E-50 | Response | status |  |  |  |
| E-51 | Request | role |  |  |  |
| E-51 | Request | status |  |  |  |
| E-51 | Request | q |  |  |  |
| E-51 | Request | page |  |  |  |
| E-51 | Request | limit |  |  |  |
| E-51 | Response | data[] |  userId |  |  |
| E-51 | Response | email |  |  |  |
| E-51 | Response | role |  |  |  |
| E-51 | Response | accountStatus |  |  |  |
| E-51 | Response | createdAt |  |  |  |
| E-52 | Request | accountStatus | enum(ACTIVE|LOCKED) | Bắt buộc | accountStatus:enum(ACTIVE|LOCKED):R |
| E-52 | Response | userId |  |  |  |
| E-52 | Response | accountStatus |  |  |  |
| E-53 | Response | data[]/category |  |  |  |
| E-54 | Request | name | string | Bắt buộc | name:string:R (POST) |
| E-54 | Request | parentId | int |  |  |
| E-54 | Request | isActive | boolean |  |  |
| E-54 | Response | data[]/category |  |  |  |
| E-55 | Request | name | string | Bắt buộc | name:string:R (POST) |
| E-55 | Request | parentId | int |  |  |
| E-55 | Request | isActive | boolean |  |  |
| E-55 | Response | data[]/category |  |  |  |
| E-56 | Response | data[]/category |  |  |  |
| E-57 | Response | data[] |  categoryId |  |  |
| E-57 | Response | name |  |  |  |
| E-57 | Response | parentId |  |  |  |
| E-58 | Request | targetType | enum(JOB|USER) | Bắt buộc | targetType:enum(JOB|USER):R |
| E-58 | Request | targetId | int | Bắt buộc | targetId:int:R |
| E-58 | Request | reason | string | Bắt buộc | reason:string:R |
| E-58 | Request | description | string |  |  |
| E-58 | Response | reportId |  |  |  |
| E-58 | Response | status |  |  |  |
| E-60 | Request | adminId |  |  |  |
| E-60 | Request | actionType |  |  |  |
| E-60 | Request | dateFrom |  |  |  |
| E-60 | Request | dateTo |  |  |  |
| E-60 | Request | page |  |  |  |
| E-60 | Request | limit |  |  |  |
| E-60 | Response | data[] |  timestamp |  |  |
| E-60 | Response | admin |  |  |  |
| E-60 | Response | action |  |  |  |
| E-60 | Response | target |  |  |  |
| E-60 | Response | metadata |  |  |  |
## Sheet: Error Catalogue
| Error code | HTTP | Ý nghĩa | Trạng thái | Số endpoint dùng (công thức) |
| --- | --- | --- | --- | --- |
| VALIDATION_ERROR | 400 | Dữ liệu đầu vào không hợp lệ | Baseline | 24 |
| INVALID_CREDENTIALS | 401 | Thông tin đăng nhập không hợp lệ | Baseline | 1 |
| UNAUTHENTICATED | 401 | Chưa xác thực | Baseline | 7 |
| FORBIDDEN | 403 | Không có quyền | Baseline | 13 |
| OWNERSHIP_REQUIRED | 403 | Không sở hữu tài nguyên | Baseline | 17 |
| RESOURCE_NOT_FOUND | 404 | Không tìm thấy tài nguyên | Baseline | 9 |
| TOKEN_EXPIRED | 410 | Token hết hạn | Baseline | 5 |
| STATE_TRANSITION_INVALID | 409 | Chuyển trạng thái không hợp lệ | Baseline | 16 |
| DUPLICATE_RESOURCE | 409 | Tài nguyên trùng lặp | Baseline | 6 |
| QUANTITY_EXCEEDED | 409 | Vượt số lượng tuyển | Baseline | 1 |
| RATE_LIMIT_EXCEEDED | 429 | Vượt giới hạn request | Baseline | 5 |
| INTERNAL_ERROR | 500 | Lỗi hệ thống | Baseline | 0 |
## Sheet: API-D Register
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
## Sheet: Missing & Gap
| Loại | ID / Mã | Endpoint | Màn hình / FR | Mô tả |
| --- | --- | --- | --- | --- |
| MISSING | E-03 | POST /auth/logout | FR-02 | Endpoint chưa có. Đường dẫn là [ĐỀ XUẤT]. |
| MISSING | E-05 | POST /auth/reset-password | FR-04 | Endpoint chưa có; đường dẫn và phương thức OTP/link là [ĐỀ XUẤT]. Expiry token: TBD. |
| MISSING | E-06 | POST /employers/me/verifications/email/request | FR-05 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. G-15 expiry, G-16 rate limit, provider: TBD. |
| MISSING | E-07 | POST /employers/me/verifications/email/verify | FR-05 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. G-15 expiry, G-16 rate limit, provider: TBD. |
| MISSING | E-08 | POST /employers/me/verifications/phone/request | FR-06 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. G-15 expiry, G-16 rate limit, provider: TBD. |
| MISSING | E-09 | POST /employers/me/verifications/phone/verify | FR-06 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. G-15 expiry, G-16 rate limit, provider: TBD. |
| MISSING | E-10 | GET /students/me | FR-07 | Endpoint chưa có; đường dẫn là [ĐỀ XUẤT]. Certificate: TBD (S1). |
| MISSING | E-11 | PATCH /students/me | FR-07 | Endpoint chưa có; [ĐỀ XUẤT]. end_date < start_date: TBD. |
| MISSING | E-12 | GET /employers/me | FR-09; FR-10 | Endpoint chưa có; [ĐỀ XUẤT]. |
| MISSING | E-13 | PATCH /employers/me | FR-09 | Email, phone, verified_at không sửa được qua endpoint này; [ĐỀ XUẤT]. |
| MISSING | E-14 | GET /employers/:id/profile | FR-10; FR-19 | Endpoint chưa có; [ĐỀ XUẤT]. NFR-06: dữ liệu liên hệ nào được công khai: TBD. |
| MISSING | E-27 | POST /jobs/:jobId/close | FR-14 | File 06 §4.6: [MISSING]. Đường dẫn là [ĐỀ XUẤT]. C4 TBD. |
| MISSING | E-59 | GET /admin/stats | FR-40 | Không tạo UC-23/24. Mã G-49 đang dùng hai nghĩa (xem CF-05). |
| MISSING | E-60 | GET /admin/logs | FR-40 | Retention, filter: TBD (G-51). |
| Thiếu theo Wireframe [ĐỀ XUẤT] | X-01 | GET /employers/me/jobs | WF-E04, WF-E01 | Danh sách Job của Employer theo tab trạng thái (GET /jobs chỉ trả Job công khai). |
| Thiếu theo Wireframe [ĐỀ XUẤT] | X-02 | GET /assignments | WF-S01, WF-E09 | Danh sách Assignment của người dùng (dashboard và quản lý Assignment). |
| Thiếu theo Wireframe [ĐỀ XUẤT] | X-03 | GET /applications/:id | WF-S12 | Chi tiết Application cho Student. |
| Thiếu theo Wireframe [ĐỀ XUẤT] | X-04 | GET /proposals/me; GET /proposals/:id | WF-S05, WF-S12 | Lịch sử và chi tiết Proposal; /applications/me chỉ bao gồm Application. |
| Thiếu theo Wireframe [ĐỀ XUẤT] | X-05 | GET /admin/jobs/:id | WF-A04 | Chi tiết Job ở chế độ chỉ đọc cho kiểm duyệt. |
| Thiếu theo Wireframe [ĐỀ XUẤT] | X-06 | GET /admin/reports/:id | WF-A06 | Chi tiết báo cáo và lịch sử xử lý. |
| Thiếu theo Wireframe [ĐỀ XUẤT] | X-07 | GET /students/:id/profile | WF-E13 | Employer xem hồ sơ Student (phạm vi quyền: TBD). |
| Thiếu theo Wireframe [ĐỀ XUẤT] | X-08 | GET /reviews/me | WF-S10, WF-E11 | Danh sách Review đã nhận và Assignment COMPLETED chưa đánh giá. |
## Sheet: Tổng kết
| Tổng kết endpoint |  |
| --- | --- |
| Baseline | 27 |
| PENDING | 19 |
| MISSING | 14 |
| Tổng endpoint | 60 |
| Đề xuất đường dẫn mới | 14 |
| Endpoint thiếu theo Wireframe | 8 |
| Theo nhóm |  |
| Authentication | 5 |
| Verification | 4 |
| Profile | 5 |
| CV (API-D1) | 4 |
| Saved Jobs (API-D2) | 3 |
| Job | 6 |
| Moderation | 2 |
| Application | 3 |
| Application (API-D3) | 1 |
| Application (API-D4) | 1 |
| Proposal | 3 |
| Proposal (API-D5) | 1 |
| Selection (A3) | 1 |
| Work | 3 |
| Deliverable | 2 |
| Deliverable (API-D6) | 1 |
| Review | 1 |
| Notification | 2 |
| Report | 2 |
| Admin User (API-D7) | 2 |
| Admin Category (API-D8) | 4 |
| Public Category (API-D9) | 1 |
| Report (API-D10) | 1 |
| Admin Stats | 1 |
| Admin Logs | 1 |
## Sheet: Đối chiếu thay đổi
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