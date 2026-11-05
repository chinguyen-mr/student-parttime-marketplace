<!-- converted from 07_JOBNEST_Database_ERD_Specification.docx -->

JOBNEST — DATABASE / ERD SPECIFICATION
Tên file: 07_JOBNEST_Database_ERD_Specification.docx
Phiên bản: v2.1 + Phase 1 Rev.6 (đề xuất, chưa áp dụng) — Revision 2: đối chiếu liên file
Ngày: 03/11/2026
Trạng thái: Bản nháp — chờ nhóm review
Database: PostgreSQL
Loại tài liệu: Logical ERD + Data Dictionary + Constraint List
Phạm vi: Logical proposal — KHÔNG phải PostgreSQL DDL hoặc migration đã chạy.
Nguồn đối chiếu: File 03 (SRS v1.2 — Consolidated Draft — Revision 2), 03_JOBNEST_Traceability_Matrix.xlsx (sheet FR — cột Entity), ERD_JOBNEST_30_bang.drawio
Quy ước nhãn: [ĐỀ XUẤT – chờ duyệt] = nội dung mới do biên soạn đề xuất, chưa được nhóm phê duyệt. TBD = chưa có quyết định, không tự điền giá trị.
# MỤC LỤC
1. Tổng quan
2. Data Dictionary (30 entity)
   - 2.1. Nhóm tài khoản (5 bảng)
   - 2.2. Nhóm Student (4 bảng)
   - 2.3. Nhóm Job (8 bảng)
   - 2.4. Nhóm Application/Proposal (4 bảng)
   - 2.5. Nhóm Work (4 bảng)
   - 2.6. Nhóm hệ thống (5 bảng)
3. Relationships & Cardinality
4. Constraints bắt buộc
5. State transition & Foreign Key
6. Missing / TBD trong ERD
7. Logical ERD — Draw.io file
8. Migration Plan (đề xuất — chưa thực thi)
9. Các điểm cần giữ nguyên — không tự sửa
10. Constraint List — Phân nhóm theo mức độ hoàn thiện
11. Trạng thái Tài liệu
# 1. TỔNG QUAN
## 1.1. Số lượng entity
| Nhóm | Số bảng | Danh sách |
| --- | --- | --- |
| Tài khoản | 5 | users, student_profiles, employer_profiles, verification_tokens, password_reset_tokens |
| Student | 4 | student_skills, student_educations, student_experiences, student_cvs |
| Job | 8 | categories, jobs, part_time_details, seasonal_details, freelance_details, job_skills, job_saved, job_views |
| Application/Proposal | 4 | applications, application_histories, freelance_proposals, proposal_histories |
| Work | 4 | work_assignments, work_progress, work_deliverables, deliverable_reviews |
| Hệ thống | 5 | reviews, notifications, reports, report_actions, admin_logs |
| Tổng | 30 | — |

## 1.2. Lưu ý
- Đây là Logical ERD — chưa phải DDL/migration đã chạy.
- Một số constraint (XOR, source integrity, quantity) mới được mô tả — chưa có migration chứng minh.
- PostgreSQL là DB baseline — được xác nhận trong Project Overview.
- Constraint và index trong tài liệu là đề xuất — cần verify khi tạo migration thực tế.
- Kiểu dữ liệu (SERIAL, VARCHAR, TIMESTAMP, INT) là đề xuất — cần quyết định khi chọn ORM/migration.
# 2. DATA DICTIONARY (30 ENTITY)
## 2.1. NHÓM TÀI KHOẢN
### 2.1.1. Bảng users
| Cột | Kiểu (đề xuất) | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| id | SERIAL | PK | ID tài khoản |
| email | VARCHAR(255) | UNIQUE NOT NULL | Email đăng nhập |
| phone | VARCHAR(20) | UNIQUE (nullable) | Số điện thoại; unique nếu có |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hash |
| role | VARCHAR(30) | CHECK IN ('STUDENT','INDIVIDUAL_EMPLOYER','ADMIN') | Vai trò |
| account_status | VARCHAR(20) | CHECK IN ('ACTIVE','LOCKED') DEFAULT 'ACTIVE' | Trạng thái tài khoản |
| created_at | TIMESTAMP | DEFAULT NOW() |  |
| updated_at | TIMESTAMP | DEFAULT NOW() | Cần cơ chế cập nhật khi UPDATE |

Ghi chú:
- updated_at với DEFAULT NOW() không tự cập nhật khi UPDATE — cần trigger hoặc application logic.
- Không xóa cascade — dùng soft-delete (account_status = 'LOCKED').
### 2.1.2. Bảng student_profiles
| Cột | Kiểu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| id | SERIAL | PK |  |
| user_id | INT | FK users.id UNIQUE NOT NULL | 1-1 với users |
| full_name | VARCHAR(255) | NOT NULL |  |
| date_of_birth | DATE | nullable |  |
| school | VARCHAR(255) | nullable |  |
| major | VARCHAR(255) | nullable |  |
| bio | TEXT | nullable |  |
| avatar_url | VARCHAR(500) | nullable |  |
| created_at | TIMESTAMP | DEFAULT NOW() |  |
| updated_at | TIMESTAMP | DEFAULT NOW() |  |

Ghi chú:
- Subtype/Role integrity: User role STUDENT phải có Student Profile — cơ chế thực thi TBD.
- Không thể đồng thời có cả Student + Employer profile — cơ chế TBD.
### 2.1.3. Bảng employer_profiles
| Cột | Kiểu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| id | SERIAL | PK |  |
| user_id | INT | FK users.id UNIQUE NOT NULL | 1-1 với users |
| display_name | VARCHAR(255) | NOT NULL |  |
| bio | TEXT | nullable |  |
| location | VARCHAR(255) | nullable |  |
| avatar_url | VARCHAR(500) | nullable |  |
| email_verified_at | TIMESTAMP | nullable | Set khi verify email |
| phone_verified_at | TIMESTAMP | nullable | Set khi verify phone |
| created_at | TIMESTAMP | DEFAULT NOW() |  |
| updated_at | TIMESTAMP | DEFAULT NOW() |  |

Ghi chú:
- Employer là Individual Employer — không có Company Profile.
- email_verified_at, phone_verified_at chỉ set qua UC-06 — không cho sửa qua profile endpoint.
- BR-03: cả hai phải verified trước khi đăng tin.
### 2.1.4. Bảng verification_tokens
| Cột | Kiểu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| id | SERIAL | PK |  |
| user_id | INT | FK users.id |  |
| channel | VARCHAR(10) | CHECK IN ('EMAIL','PHONE') |  |
| token_hash | VARCHAR(255) | NOT NULL | Hash token (không lưu plaintext) |
| expires_at | TIMESTAMP | NOT NULL | Expiry — giá trị cụ thể TBD (G-15) |
| used_at | TIMESTAMP | nullable |  |
| attempt_count | INT | DEFAULT 0 | Attempt threshold TBD (G-16) |
| created_at | TIMESTAMP | DEFAULT NOW() |  |

TBD:
- G-15: Expiry value chưa có trong SRS/PB — chưa mã hóa trong C1–C10.
- G-16: Rate limit và attempt threshold chưa có ngưỡng.
- Provider Email/SMS chưa chọn.
### 2.1.5. Bảng password_reset_tokens
| Cột | Kiểu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| id | SERIAL | PK |  |
| user_id | INT | FK users.id |  |
| token_hash | VARCHAR(255) | NOT NULL |  |
| expires_at | TIMESTAMP | NOT NULL | Expiry TBD (chưa mã hóa) |
| used_at | TIMESTAMP | nullable |  |
| created_at | TIMESTAMP | DEFAULT NOW() |  |

TBD:
- Reset token expiry chưa có giá trị.
- Phương thức reset (OTP vs link) chưa chốt.
## 2.2. NHÓM STUDENT
### 2.2.1. Bảng student_skills
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| student_profile_id | INT | FK student_profiles.id |
| skill_name | VARCHAR(100) | NOT NULL |

Ghi chú: Pagination cho list skills — G-17 TBD. Ownership: chỉ Student sở hữu profile được thao tác.
### 2.2.2. Bảng student_educations
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| student_profile_id | INT | FK student_profiles.id |
| institution | VARCHAR(255) | NOT NULL |
| degree | VARCHAR(255) | nullable |
| start_date | DATE | nullable |
| end_date | DATE | nullable |

TBD: Validation rule end_date < start_date — chưa chốt (TC-PROFILE-001-09).
### 2.2.3. Bảng student_experiences
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| student_profile_id | INT | FK student_profiles.id |
| title | VARCHAR(255) | NOT NULL |
| organization | VARCHAR(255) | nullable |
| description | TEXT | nullable |
| start_date | DATE | nullable |
| end_date | DATE | nullable |

### 2.2.4. Bảng student_cvs
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| student_profile_id | INT | FK student_profiles.id |
| file_key | VARCHAR(500) | NOT NULL (internal, không trả public) |
| original_name | VARCHAR(255) | nullable |
| mime_type | VARCHAR(100) | nullable |
| size_bytes | INT | nullable |
| is_default | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | DEFAULT NOW() |

Phase 1 T2 — đề xuất (chưa migrate):
CREATE UNIQUE INDEX uq_one_default_cv_per_profile
  ON public.student_cvs (student_profile_id)
  WHERE is_default = TRUE;
Ghi chú:
- T2 là đề xuất Phase 1 — chưa migrate.
- student_certificates chưa có — blocked S1.
- CV delete policy: nếu đang được applications.cv_id tham chiếu — TBD.
- MIME allowlist, size limit, storage provider — TBD. API-D1 chưa duyệt.
## 2.3. NHÓM JOB
### 2.3.1. Bảng categories
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| name | VARCHAR(100) | NOT NULL |
| parent_id | INT | FK categories.id nullable |
| is_active | BOOLEAN | DEFAULT TRUE |

TBD:
- G-46: Hierarchy policy (chống vòng lặp cây) chưa chốt.
- S5: Route public categories — /categories hay /jobs/categories.
- Delete policy khi Category đang được Job tham chiếu — TBD.
### 2.3.2. Bảng jobs
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| employer_id | INT | FK users.id NOT NULL |
| category_id | INT | FK categories.id nullable |
| job_type | VARCHAR(20) | CHECK IN ('PART_TIME','SEASONAL','FREELANCE') NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NOT NULL |
| location | VARCHAR(255) | nullable |
| salary_min | INT | nullable |
| salary_max | INT | nullable |
| pay_unit | VARCHAR(20) | CHECK IN ('HOUR','DAY','SHIFT','PROJECT') nullable |
| budget_min | INT | nullable |
| budget_max | INT | nullable |
| quantity_required | INT | CHECK >= 1 NOT NULL |
| application_deadline | DATE | nullable |
| status | VARCHAR(30) | CHECK IN ('DRAFT','PENDING_REVIEW','PUBLISHED','CLOSED','EXPIRED','REJECTED') NOT NULL |
| moderation_reason | TEXT | nullable |
| published_at | TIMESTAMP | nullable |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

TBD:
- S6: Quy tắc NULL/NOT NULL giữa salary_* (PT/SV) và budget_* (FL) chưa chốt.
- Không tự đặt CHECK theo job_type.
- FK employer_id → users.id — cần xác nhận đích FK (baseline: users).
### 2.3.3. Bảng part_time_details
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| job_id | INT | PK + FK jobs.id |
| shift_description | VARCHAR(255) | nullable |
| weekly_schedule | TEXT | nullable |
| hours_per_week | INT | nullable |

### 2.3.4. Bảng seasonal_details
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| job_id | INT | PK + FK jobs.id |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| schedule_description | TEXT | nullable |

### 2.3.5. Bảng freelance_details
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| job_id | INT | PK + FK jobs.id |
| scope | TEXT | NOT NULL |
| deliverable_requirements | TEXT | NOT NULL |
| deadline | DATE | NOT NULL |
| revision_limit | INT | nullable — TBD (C10) |

### 2.3.6. Bảng job_skills
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| job_id | INT | FK jobs.id, composite PK |
| skill_name | VARCHAR(100) | composite PK |

### 2.3.7. Bảng job_saved
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| student_id | INT | FK users.id, composite PK |
| job_id | INT | FK jobs.id, composite PK |
| saved_at | TIMESTAMP | DEFAULT NOW() |

### 2.3.8. Bảng job_views
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| job_id | INT | FK jobs.id |
| viewer_id | INT | FK users.id nullable |
| viewed_at | TIMESTAMP | DEFAULT NOW() |

## 2.4. NHÓM APPLICATION/PROPOSAL
### 2.4.1. Bảng applications
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| job_id | INT | FK jobs.id NOT NULL |
| student_id | INT | FK users.id NOT NULL |
| cv_id | INT | FK student_cvs.id nullable |
| cover_letter | TEXT | nullable |
| status | VARCHAR(30) | CHECK IN ('PENDING','REVIEWING','SHORTLISTED','ACCEPTED','REJECTED','WITHDRAWN') DEFAULT 'PENDING' |
| submitted_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |
| UNIQUE |  | (job_id, student_id) |

Source integrity — TBD:
- Chưa có CHECK đảm bảo applications.job_id thuộc Job PART_TIME hoặc SEASONAL.
- Cần service validation hoặc DB constraint — TBD (§4.4).
- A3 enforcement: Application không được set ACCEPTED qua PATCH — chỉ qua selections.
### 2.4.2. Bảng application_histories
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| application_id | INT | FK applications.id |
| from_status | VARCHAR(30) |  |
| to_status | VARCHAR(30) |  |
| changed_by | INT | FK users.id |
| note | TEXT | nullable |
| created_at | TIMESTAMP | DEFAULT NOW() |

TBD: G-31: Response structure cho history chưa định nghĩa (trả kèm detail hay endpoint riêng).
### 2.4.3. Bảng freelance_proposals
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| job_id | INT | FK jobs.id NOT NULL |
| student_id | INT | FK users.id NOT NULL |
| proposal_text | TEXT | NOT NULL |
| estimated_duration | VARCHAR(100) | nullable |
| proposed_price | INT | nullable (field bật/tắt TBD) |
| status | VARCHAR(30) | CHECK IN ('SUBMITTED','REVIEWING','ACCEPTED','REJECTED','WITHDRAWN') DEFAULT 'SUBMITTED' |
| submitted_at | TIMESTAMP | DEFAULT NOW() |
| UNIQUE |  | (job_id, student_id) |

Source integrity — TBD:
- Chưa có CHECK đảm bảo freelance_proposals.job_id thuộc Job FREELANCE.
- A3 enforcement: Proposal không được set ACCEPTED qua PATCH — chỉ qua selections.
### 2.4.4. Bảng proposal_histories
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| proposal_id | INT | FK freelance_proposals.id |
| from_status | VARCHAR(30) |  |
| to_status | VARCHAR(30) |  |
| changed_by | INT | FK users.id |
| note | TEXT | nullable |
| created_at | TIMESTAMP | DEFAULT NOW() |

## 2.5. NHÓM WORK
### 2.5.1. Bảng work_assignments
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| job_id | INT | FK jobs.id NOT NULL |
| student_id | INT | FK users.id NOT NULL |
| application_id | INT | FK applications.id UNIQUE nullable |
| proposal_id | INT | FK freelance_proposals.id UNIQUE nullable |
| status | VARCHAR(20) | CHECK IN ('NOT_STARTED','IN_PROGRESS','COMPLETED') DEFAULT 'NOT_STARTED' |
| started_at | TIMESTAMP | nullable |
| completed_at | TIMESTAMP | nullable |
| created_at | TIMESTAMP | DEFAULT NOW() |
| CHECK XOR |  | ((application_id IS NOT NULL)::int + (proposal_id IS NOT NULL)::int = 1) |

⚠️ CẢNH BÁO — T1/M1 CHƯA ĐƯỢC DUYỆT:
- SRS v2.1 gốc có lifecycle Assignment khác với M1 đề xuất.
- M1 (Phase 1 Rev.6) đề xuất: Assignment chỉ có NOT_STARTED → IN_PROGRESS → COMPLETED.
- SUBMITTED và REVISION_REQUESTED thuộc về Deliverable, không thuộc Assignment.
- T1 chưa được nhóm duyệt — đây là proposed schema, không phải baseline.
- Không được trình bày 3 trạng thái M1 như đã được duyệt.
- Deliverable giữ lifecycle riêng: SUBMITTED → ACCEPTED / REVISION_REQUESTED.
- Khi Request Revision: Assignment vẫn IN_PROGRESS theo M1.
- CF-03 (File 03 Mục 3.4): DEFAULT 'NOT_STARTED' ở cột status mâu thuẫn với UC-16/17/18 (File 04), vốn đặt tiền điều kiện Assignment đang IN_PROGRESS ngay khi vừa tạo. Tài liệu này giữ nguyên DEFAULT 'NOT_STARTED' theo đề xuất M1 — không tự chọn phương án; chờ nhóm chốt cùng T1/M1.
Source/Job/Student integrity — TBD:
- Chưa có constraint đảm bảo application_id/proposal_id thuộc cùng Job với Assignment.
- Chưa có constraint student_id khớp với student trong source.
- Xem chi tiết §4.4.
### 2.5.2. Bảng work_progress
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| assignment_id | INT | FK work_assignments.id |
| updated_by | INT | FK users.id |
| progress_percent | INT | nullable |
| description | TEXT | nullable |
| created_at | TIMESTAMP | DEFAULT NOW() |

TBD:
- G-06: Actor được phép cập nhật progress — (A) chỉ Student; (B) cả hai; (C) Student cập nhật, Employer xem/xác nhận.
- Range progress_percent chưa chốt.
- Ownership integrity: Chưa có constraint đảm bảo updated_by là participant của Assignment.
- G-58: History endpoint/response structure.
### 2.5.3. Bảng work_deliverables
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| assignment_id | INT | FK work_assignments.id |
| submitted_by | INT | FK users.id |
| version_no | INT | NOT NULL |
| file_key | VARCHAR(500) | nullable |
| description | TEXT | nullable |
| status | VARCHAR(30) | CHECK IN ('SUBMITTED','ACCEPTED','REVISION_REQUESTED') |
| submitted_at | TIMESTAMP | DEFAULT NOW() |
| UNIQUE |  | (assignment_id, version_no) |

Ownership integrity — TBD:
- Chưa có ràng buộc submitted_by phải là Student của Assignment.
- Mỗi lần gửi tạo version mới — không ghi đè.
### 2.5.4. Bảng deliverable_reviews
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| deliverable_id | INT | FK work_deliverables.id |
| reviewed_by | INT | FK users.id |
| decision | VARCHAR(30) | CHECK IN ('ACCEPTED','REVISION_REQUESTED') |
| comment | TEXT | nullable (bắt buộc khi REVISION_REQUESTED) |
| created_at | TIMESTAMP | DEFAULT NOW() |

Ownership integrity — TBD:
- Chưa có ràng buộc reviewed_by phải là Employer owner của Job.
- Chưa có unique rule ngăn decision trùng cho cùng Deliverable/Reviewer.
## 2.6. NHÓM HỆ THỐNG
### 2.6.1. Bảng reviews
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| assignment_id | INT | FK work_assignments.id |
| reviewer_id | INT | FK users.id |
| reviewee_id | INT | FK users.id |
| rating | INT | nullable |
| comment | TEXT | nullable |
| created_at | TIMESTAMP | DEFAULT NOW() |
| UNIQUE |  | (assignment_id, reviewer_id) |

TBD: C10 rating scale; G-41 comment required; G-42 max length. Ownership: reviewer/reviewee phải là participant.
### 2.6.2. Bảng notifications
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| user_id | INT | FK users.id |
| type | VARCHAR(50) |  |
| title | VARCHAR(255) |  |
| body | TEXT | nullable |
| target_type | VARCHAR(50) | nullable |
| target_id | INT | nullable |
| read_at | TIMESTAMP | nullable |
| created_at | TIMESTAMP | DEFAULT NOW() |

TBD: C3 trigger list; G-07 pagination/sort; G-43 mark-read idempotency; G-44 delete policy.
### 2.6.3. Bảng reports
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| reporter_id | INT | FK users.id NOT NULL |
| target_type | VARCHAR(20) | CHECK IN ('JOB','USER') |
| target_id | INT | NOT NULL |
| reason | TEXT | NOT NULL |
| description | TEXT | nullable |
| status | VARCHAR(20) | Giá trị khởi tạo TBD (G-48) |
| created_at | TIMESTAMP | DEFAULT NOW() |

TBD: G-48 report status; G-51 report status/action transitions. Target polymorphic — chưa có FK (§4.8).
### 2.6.4. Bảng report_actions
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| report_id | INT | FK reports.id |
| admin_id | INT | FK users.id |
| action | VARCHAR(100) |  |
| note | TEXT | nullable |
| created_at | TIMESTAMP | DEFAULT NOW() |

TBD: G-48 action enum; G-51 report status/action transitions; C3 notification reporter.
### 2.6.5. Bảng admin_logs
| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | SERIAL | PK |
| admin_id | INT | FK users.id |
| action | VARCHAR(100) | NOT NULL |
| target_type | VARCHAR(50) | nullable |
| target_id | INT | nullable |
| metadata | JSONB | nullable |
| created_at | TIMESTAMP | DEFAULT NOW() |

TBD:
- Retention/immutability policy — TBD.
- G-50: API /admin/logs chưa được duyệt.
- G-51: Filter/pagination/retention chưa được đặc tả.
# 3. RELATIONSHIPS & CARDINALITY
## 3.1. Sơ đồ quan hệ tổng quát
users 1─1 student_profiles
users 1─1 employer_profiles
users 1─n jobs (employer_id)
users 1─n verification_tokens
users 1─n password_reset_tokens
users 1─n applications (student_id)
users 1─n freelance_proposals (student_id)
users 1─n work_assignments (student_id)
users 1─n work_progress (updated_by)
users 1─n work_deliverables (submitted_by)
users 1─n deliverable_reviews (reviewed_by)
users 1─n reviews (reviewer_id, reviewee_id)
users 1─n notifications
users 1─n reports (reporter_id)
users 1─n report_actions (admin_id)
users 1─n admin_logs (admin_id)

student_profiles 1─n student_skills
student_profiles 1─n student_educations
student_profiles 1─n student_experiences
student_profiles 1─n student_cvs
student_cvs 1─n applications (cv_id, nullable)

categories 1─n jobs (category_id, nullable)
categories 1─n categories (parent_id, nullable)

jobs 1─n applications (PT/SV only)
jobs 1─n freelance_proposals (FL only)
jobs 1─n job_skills
jobs 1─n job_saved
jobs 1─n job_views
jobs 1─1 part_time_details
jobs 1─1 seasonal_details
jobs 1─1 freelance_details
jobs 1─n work_assignments (job_id, NOT NULL — xem §4.4 về yêu cầu khớp với application/proposal)

applications 1─0..1 work_assignments (application_id)
freelance_proposals 1─0..1 work_assignments (proposal_id)
applications 1─n application_histories
freelance_proposals 1─n proposal_histories

work_assignments 1─n work_progress
work_assignments 1─n work_deliverables
work_assignments 1─n reviews
work_deliverables 1─n deliverable_reviews

reports 1─n report_actions
## 3.2. Bảng cardinality chi tiết
| Quan hệ | Cardinality | Ràng buộc |
| --- | --- | --- |
| users ↔ student_profiles | 1:1 | student_profiles.user_id UNIQUE |
| users ↔ employer_profiles | 1:1 | employer_profiles.user_id UNIQUE |
| users ↔ jobs (employer) | 1:n | jobs.employer_id FK |
| categories ↔ jobs | 1:n | jobs.category_id FK nullable |
| categories ↔ categories | 1:n | parent_id FK nullable |
| student_profiles ↔ student_skills | 1:n | student_skills.student_profile_id FK |
| student_profiles ↔ student_educations | 1:n | student_educations.student_profile_id FK |
| student_profiles ↔ student_experiences | 1:n | student_experiences.student_profile_id FK |
| student_profiles ↔ student_cvs | 1:n | student_cvs.student_profile_id FK |
| student_cvs ↔ applications | 1:n | applications.cv_id FK nullable |
| jobs ↔ applications | 1:n | applications.job_id FK |
| jobs ↔ freelance_proposals | 1:n | freelance_proposals.job_id FK |
| jobs ↔ work_assignments | 1:n | work_assignments.job_id FK NOT NULL — khớp application/proposal: TBD (§4.4) |
| applications ↔ work_assignments | 1:0..1 | UNIQUE(application_id) |
| freelance_proposals ↔ work_assignments | 1:0..1 | UNIQUE(proposal_id) |
| work_assignments ↔ work_progress | 1:n | work_progress.assignment_id FK |
| work_assignments ↔ work_deliverables | 1:n | version_no tăng dần |
| work_deliverables ↔ deliverable_reviews | 1:n |  |
| work_assignments ↔ reviews | 1:n | UNIQUE(assignment_id, reviewer_id) |

## 3.3. Subtype / Role integrity — TBD
users 1─1 student_profiles + users 1─1 employer_profiles chỉ đảm bảo mỗi profile thuộc tối đa 1 user. Chưa đảm bảo:
| # | Ràng buộc | Trạng thái |
| --- | --- | --- |
| 1 | User role STUDENT phải có Student Profile | TBD |
| 2 | User role INDIVIDUAL_EMPLOYER phải có Employer Profile | TBD |
| 3 | User không đồng thời có cả hai loại Profile | TBD |
| 4 | Admin không có Student/Employer Profile | TBD |

Cơ chế thực thi TBD — không tự thêm trigger.
# 4. CONSTRAINTS BẮT BUỘC
## 4.1. UNIQUE
users.email UNIQUE NOT NULL
users.phone UNIQUE (chỉ khi NOT NULL)
student_profiles.user_id UNIQUE + FK users.id
employer_profiles.user_id UNIQUE + FK users.id
applications UNIQUE(job_id, student_id)
freelance_proposals UNIQUE(job_id, student_id)
work_assignments UNIQUE(application_id)
work_assignments UNIQUE(proposal_id)
work_deliverables UNIQUE(assignment_id, version_no)
reviews UNIQUE(assignment_id, reviewer_id)
## 4.2. CHECK
users.role CHECK IN ('STUDENT','INDIVIDUAL_EMPLOYER','ADMIN')
users.account_status CHECK IN ('ACTIVE','LOCKED')
jobs.job_type CHECK IN ('PART_TIME','SEASONAL','FREELANCE')
jobs.status CHECK IN ('DRAFT','PENDING_REVIEW','PUBLISHED','CLOSED','EXPIRED','REJECTED')
jobs.quantity_required CHECK >= 1
applications.status CHECK IN ('PENDING','REVIEWING','SHORTLISTED','ACCEPTED','REJECTED','WITHDRAWN')
freelance_proposals.status CHECK IN ('SUBMITTED','REVIEWING','ACCEPTED','REJECTED','WITHDRAWN')
work_assignments.status CHECK IN ('NOT_STARTED','IN_PROGRESS','COMPLETED')  -- T1/M1 proposed
work_deliverables.status CHECK IN ('SUBMITTED','ACCEPTED','REVISION_REQUESTED')
deliverable_reviews.decision CHECK IN ('ACCEPTED','REVISION_REQUESTED')
## 4.3. XOR — work_assignments (đã có)
CHECK ((application_id IS NOT NULL)::int + (proposal_id IS NOT NULL)::int = 1)
### Giới hạn của XOR hiện tại
XOR chỉ đảm bảo Assignment có đúng 1 source reference. Chưa đảm bảo:
| # | Ràng buộc | Trạng thái |
| --- | --- | --- |
| 1 | application_id thuộc đúng job_id của Assignment | TBD |
| 2 | proposal_id thuộc đúng job_id của Assignment | TBD |
| 3 | student_id trùng Student trong source | TBD |
| 4 | Application chỉ dùng cho Job PT/SV | TBD |
| 5 | Proposal chỉ dùng cho Job FREELANCE | TBD |
| 6 | Mỗi source chỉ được tạo tối đa 1 Assignment (đã có UNIQUE riêng — nhưng cần verify) | Verify |

→ Source/job/student integrity TBD — xem §4.4.
## 4.4. Source / Job / Student Integrity — TBD
Các ràng buộc sau chưa được đặc tả đầy đủ ở DB layer. Cần nhóm quyết định cơ chế thực thi (DB constraint, trigger, hay service validation):
| # | Ràng buộc | Trạng thái |
| --- | --- | --- |
| 1 | applications.job_id phải thuộc Job PART_TIME hoặc SEASONAL | TBD |
| 2 | freelance_proposals.job_id phải thuộc Job FREELANCE | TBD |
| 3 | work_assignments.job_id phải khớp với application_id.job_id HOẶC proposal_id.job_id | TBD |
| 4 | work_assignments.student_id phải khớp với applications.student_id HOẶC freelance_proposals.student_id | TBD |

Ghi chú: G-35 và C8 liên quan. C8 hiện là service validation — chưa triển khai. Không ghi nhận các điều kiện trên là đã được database enforcement.
## 4.5. Phase 1 T2 (đề xuất — chưa migrate)
CREATE UNIQUE INDEX uq_one_default_cv_per_profile
  ON public.student_cvs (student_profile_id)
  WHERE is_default = TRUE;
Trạng thái: Đề xuất Phase 1, chưa migrate. Blocked C5.
## 4.6. Job Subtype Integrity — TBD
Ba bảng part_time_details, seasonal_details, freelance_details có job_id PK+FK → mỗi Job có tối đa 1 bản ghi mỗi loại. Nhưng chưa có quy tắc đảm bảo:
| job_type | Bảng chi tiết được phép | Các bảng phải NULL |
| --- | --- | --- |
| PART_TIME | part_time_details | seasonal_details, freelance_details |
| SEASONAL | seasonal_details | part_time_details, freelance_details |
| FREELANCE | freelance_details | part_time_details, seasonal_details |

Cơ chế thực thi TBD — cần service validation, trigger, hoặc exclusion constraint. Không tự đặt CHECK vì PostgreSQL CHECK không thể kiểm tra sự tồn tại ở bảng khác. Không tự đặt CHECK theo job_type cho salary/budget — S6 vẫn TBD.
## 4.7. Participant / Ownership Integrity — TBD
| Bảng | Ràng buộc | Trạng thái |
| --- | --- | --- |
| work_progress | updated_by phải là participant của Assignment | TBD (liên quan G-06) |
| work_deliverables | submitted_by phải là Student của Assignment | TBD |
| deliverable_reviews | reviewed_by phải là Employer owner của Job | TBD |
| deliverable_reviews | Không cho decision trùng cho cùng Deliverable/Reviewer (nếu policy yêu cầu) | TBD — cần nhóm xác nhận |
| reviews | reviewer_id và reviewee_id phải là 2 participant của Assignment | TBD |
| reviews | reviewer_id ≠ reviewee_id | TBD |

## 4.8. Report Target Integrity — TBD
reports.target_type = JOB | USER, reports.target_id polymorphic:
- Không thể dùng FK thông thường — PostgreSQL không hỗ trợ FK có điều kiện.
- Rủi ro: report trỏ tới target không tồn tại; target bị xóa để lại report orphan.
- Cơ chế TBD: service validation, trigger, hoặc đổi schema thành 2 cột FK nullable. Không tự đổi schema — cần nhóm duyệt.
## 4.9. Indexes (đề xuất)
### Index hiện có trong draft
CREATE INDEX idx_jobs_status_type_category ON jobs(status, job_type, category_id);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_applications_job_status ON applications(job_id, status);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_proposals_job_status ON freelance_proposals(job_id, status);
CREATE INDEX idx_assignments_student_status ON work_assignments(student_id, status);
CREATE INDEX idx_assignments_job ON work_assignments(job_id);
### Khuyến nghị bổ sung — chưa bắt buộc
CREATE INDEX idx_jobs_employer_status ON jobs(employer_id, status);
CREATE INDEX idx_assignments_job_status ON work_assignments(job_id, status);
CREATE INDEX idx_progress_assignment_created ON work_progress(assignment_id, created_at);
CREATE INDEX idx_deliverables_assignment_version ON work_deliverables(assignment_id, version_no);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at, created_at);
CREATE INDEX idx_reports_status_created ON reports(status, created_at);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at);
Ghi chú: Đây là khuyến nghị, chưa bắt buộc. Cần verify với query thực tế và execution plan trước khi tạo.
# 5. STATE TRANSITION & FOREIGN KEY
Phạm vi: mục này chỉ nêu quy tắc cascade/xóa và các FK cần xác nhận ở tầng DB. Bảng chuyển trạng thái đầy đủ (from → to, actor, điều kiện) cho Job, Application, Proposal, Work Assignment và Deliverable nằm ở File 03 (SRS) Mục 6.9 và sheet "State Models" của 03_JOBNEST_Traceability_Matrix.xlsx — tài liệu này không lặp lại để tránh hai nguồn có thể lệch nhau.
## 5.1. Cascade / Restrict
- users không xóa cascade — dùng soft-delete (account_status = 'LOCKED').
- jobs khi bị Admin reject vẫn giữ — không xóa.
- applications / freelance_proposals khi Student rút đơn → WITHDRAWN, không xóa.
- work_deliverables không ghi đè — mỗi version mới.
- reviews không sửa/xóa — không có quy định trong SRS.
- ON DELETE policy cụ thể (RESTRICT/CASCADE/SET NULL) cho từng FK — TBD, cần nhóm quyết định.
## 5.2. FK reference confirm
| FK | Cần confirm |
| --- | --- |
| jobs.employer_id → users.id | Đã xác nhận (Individual Employer) |
| work_assignments.application_id → applications.id | Đã xác nhận |
| work_assignments.proposal_id → freelance_proposals.id | Đã xác nhận |
| work_assignments.student_id khớp với student trong application/proposal | Chưa có FK constraint — cần service validation hoặc trigger (§4.4) |

## 5.3. Kiểu dữ liệu — cần quyết định kỹ thuật
| Điểm | Trạng thái |
| --- | --- |
| TIMESTAMP vs TIMESTAMPTZ cho các trường thời gian | Đề xuất — cần quyết định |
| SERIAL vs IDENTITY cho khóa tự tăng | Đề xuất — cần quyết định |
| INT có đủ cho size_bytes, số tiền, trường đếm | Đề xuất — cần verify range |
| updated_at cập nhật bằng application hay trigger | Đề xuất — cần quyết định |

Đây là các quyết định kỹ thuật cần xác nhận, không phải lỗi khiến Logical ERD hiện tại mất hiệu lực.
# 6. MISSING / TBD TRONG ERD
## 6.1. Bảng tổng hợp
| Item | Trạng thái | Ghi chú |
| --- | --- | --- |
| student_certificates | Không có | Blocked S1 |
| jobs.salary_* vs budget_* | Chưa có CHECK theo job_type | S6 |
| freelance_details.revision_limit | Có cột nhưng chưa có giá trị | C10 |
| reviews.rating | Có cột nhưng chưa có range CHECK | C10 |
| reviews.comment required/optional | Có cột nhưng chưa chốt | G-41 |
| reviews.comment max length | Có cột nhưng chưa chốt | G-42 |
| reports.status | Có cột nhưng chưa có giá trị khởi tạo | G-48 |
| report_actions.action enum | Chưa xác định | TBD |
| reports.target_id integrity | Polymorphic — không FK | TBD (§4.8) |
| work_assignments SUBMITTED/REVISION_REQUESTED | Không có trong M1 | T1 chưa duyệt |
| work_assignments source/job/student integrity | Chưa có constraint DB | TBD (§4.4) |
| work_progress.updated_by ownership | Chưa có constraint DB | TBD (§4.7) |
| work_progress.progress_percent range | Chưa có CHECK | TBD |
| work_deliverables.submitted_by ownership | Chưa có constraint DB | TBD (§4.7) |
| deliverable_reviews.reviewed_by ownership | Chưa có constraint DB | TBD (§4.7) |
| reviews participant integrity | Chưa có constraint DB | TBD (§4.7) |
| Job Subtype Integrity | Chưa có CHECK | TBD (§4.6) |
| Subtype/Role integrity (users↔profiles) | Chưa có cơ chế | TBD (§3.3) |
| notifications trigger list | Chưa xác định | C3 |
| notifications pagination/sort | Chưa xác định | G-07 |
| verification_tokens.expires_at | Có cột nhưng chưa có giá trị | G-15 |
| password_reset_tokens.expires_at | Có cột nhưng chưa có giá trị | Chưa mã hóa |
| Rate limit fields | Không có | G-16 |
| categories hierarchy anti-cycle | Chưa có | G-46 |
| admin_logs retention/immutability | Chưa có | TBD |
| users.updated_at auto-update | DEFAULT NOW() không tự update | Cần cơ chế |
| Kiểu dữ liệu: TIMESTAMP vs TIMESTAMPTZ | Đề xuất | Cần quyết định |
| Kiểu dữ liệu: SERIAL vs IDENTITY | Đề xuất | Cần quyết định |
| INT cho size_bytes, tiền tệ | Đề xuất | Cần verify range |

# 7. LOGICAL ERD — DRAW.IO FILE
- File nguồn: ERD_JOBNEST_30_bang.drawio (tên cũ trong bản trước — 06_JOBNEST_Logical_ERD_v2.1.drawio — không khớp tên file thực tế; đã sửa).
- Đã tự kiểm tra lại khi đối chiếu Revision 2: XML parse thành công (mxfile hợp lệ, 1 diagram "ERD JOBNEST (30 bảng)"); 30/30 bảng trong file vẽ khớp tên và nhóm với Mục 2; 46 quan hệ (mxCell edge có source/target, không tính 2 mũi tên chú giải) khớp số lượng "46 quan hệ" ghi ở File 01 §9.
- Đối chiếu cột: tên cột, kiểu dữ liệu và constraint trong file vẽ khớp với Mục 2 (Data Dictionary) ở toàn bộ 30 bảng đã kiểm tra.
- Đây là Logical ERD — không phải PostgreSQL DDL.
- Cần nhóm rà soát cardinality, kiểu dữ liệu PostgreSQL, constraint, index trước khi chuyển thành migration.
- File Draw.io chưa được chỉnh trực tiếp theo các phát hiện constraint/integrity ở tài liệu này.
# 8. MIGRATION PLAN (ĐỀ XUẤT — CHƯA THỰC THI)
## 8.1. Thứ tự migration khuyến nghị
001_users.sql
002_student_profiles.sql
003_employer_profiles.sql
004_verification_tokens.sql
005_password_reset_tokens.sql
006_student_skills.sql
007_student_educations.sql
008_student_experiences.sql
009_student_cvs.sql      ← T2 partial unique index (proposed)
010_categories.sql
011_jobs.sql
012_part_time_details.sql
013_seasonal_details.sql
014_freelance_details.sql
015_job_skills.sql
016_job_saved.sql
017_job_views.sql
018_applications.sql
019_application_histories.sql
020_freelance_proposals.sql
021_proposal_histories.sql
022_work_assignments.sql ← XOR check
023_work_progress.sql
024_work_deliverables.sql
025_deliverable_reviews.sql
026_reviews.sql
027_notifications.sql
028_reports.sql
029_report_actions.sql
030_admin_logs.sql
## 8.2. Lưu ý khi triển khai
- Migration 022 phải FK tới cả applications (018) và freelance_proposals (020) — đã đúng thứ tự.
- Constraint source integrity (§4.4) có thể cần migration riêng hoặc service validation.
- Migration T2 (§4.5) giữ trạng thái đề xuất — chưa chạy.
- Migration liên quan G-35 phải verify trước khi cho TC-HIRE-009..012 chạy.
- Cần quyết định cơ chế cập nhật updated_at.
- Seed data cho Admin hoặc Category cần kế hoạch riêng — chưa có trong plan này.
- Đây là thứ tự đề xuất — dependency cần kiểm tra khi triển khai thực tế.
## 8.3. Điều kiện tiên quyết
| # | Điều kiện | Trạng thái |
| --- | --- | --- |
| 1 | Chọn ORM (Prisma/Sequelize/Knex/TypeORM) | Chưa chốt |
| 2 | Chốt kiểu dữ liệu (TIMESTAMPTZ, IDENTITY, INT range) | Chưa chốt |
| 3 | Chốt ON DELETE policy cho từng FK | Chưa chốt |
| 4 | Chốt cơ chế cập nhật updated_at | Chưa chốt |
| 5 | Chốt cơ chế thực thi source integrity | Chưa chốt |

# 9. CÁC ĐIỂM CẦN GIỮ NGUYÊN — KHÔNG TỰ SỬA
| Mã | Nội dung | Trạng thái phải giữ |
| --- | --- | --- |
| S1 | student_certificates | Chưa có, blocked |
| S6 | Salary/budget theo job_type | TBD |
| C10 | Revision limit, rating scale, comment policy | TBD |
| T1/M1 | Assignment lifecycle | Đề xuất, chưa duyệt |
| T2 | Partial unique index default CV | Đề xuất, chưa migrate |
| G-06 | Actor cập nhật progress | TBD |
| G-35 | XOR/source integrity DB enforcement | Chưa xác minh |
| G-48 | Report initial status | TBD |
| G-58 | Progress history endpoint/response | TBD |
| G-59 | Complete Assignment idempotency | TBD |
| C3 | Notification trigger list | TBD |
| C5 | CV default constraint direction | Chỉ mới chọn hướng, chưa migrate |
| G-49 | FR-40 Dashboard/Logs | Chưa có UC riêng |

## 9.1. Nguyên tắc bổ sung
- Không thêm student_certificates.
- Không thêm trạng thái Assignment mới.
- Không coi CHECK/XOR trong tài liệu là đã triển khai.
- Không tuyên bố PostgreSQL DDL hoặc migration đã chạy.
- Không chuyển bất kỳ Test Case nào sang Pass.
# 10. CONSTRAINT LIST — PHÂN NHÓM THEO MỨC ĐỘ HOÀN THIỆN
## 10.1. Nhóm A — Có trong bản đặc tả (Logical proposal)
PK, FK, UNIQUE, CHECK đã liệt kê ở §4.1, §4.2, §4.3.
## 10.2. Nhóm B — Cần bổ sung để bảo đảm integrity
| # | Ràng buộc | Section |
| --- | --- | --- |
| 1 | Application phải thuộc Job PT/SV | §4.4 |
| 2 | Proposal phải thuộc Job FL | §4.4 |
| 3 | Assignment phải khớp Job và Student với source | §4.4 |
| 4 | Job subtype consistency (mỗi job_type chỉ dùng 1 detail table) | §4.6 |
| 5 | Deliverable phải do Student được giao Assignment gửi | §4.7 |
| 6 | Deliverable review phải do Employer owner thực hiện | §4.7 |
| 7 | Progress update phải do actor được phép thực hiện | §4.7 |
| 8 | Review phải được tạo bởi participant; reviewee phải là participant còn lại | §4.7 |
| 9 | Report target phải tồn tại theo target_type | §4.8 |
| 10 | Subtype/Role integrity users↔profiles | §3.3 |

Các constraint này là yêu cầu kiểm tra tính toàn vẹn cần nhóm review — không được hiểu là đã có constraint thực thi.
## 10.3. Nhóm C — Chờ quyết định
T1, T2, S1, S6, C10, G-06, G-48, G-58, G-59.
# 11. TRẠNG THÁI TÀI LIỆU
## 11.1. Bảng trạng thái
| Hạng mục | Trạng thái |
| --- | --- |
| 30 entity dictionary | Có |
| Relationships / cardinality | Có (+ subtype integrity TBD ghi rõ) |
| UNIQUE / CHECK / XOR constraints | Có (đề xuất) + Source/Job/Student integrity TBD |
| Job subtype integrity | Đã bổ sung (§4.6) — TBD cơ chế |
| Participant/Ownership integrity | Đã bổ sung (§4.7) — TBD cơ chế |
| Report target integrity | Đã bổ sung (§4.8) — TBD cơ chế |
| Indexes | Có (đề xuất + khuyến nghị) |
| Migration plan | Có (đề xuất) |
| student_certificates | Blocked S1 |
| Salary/budget CHECK | Blocked S6 |
| Revision limit | Blocked C10 |
| Rating scale | Blocked C10 |
| Report status | Blocked G-48 |
| T1 Assignment M1 | Đề xuất Phase 1 — cảnh báo tại §2.5 |
| T2 partial unique index | Đề xuất Phase 1 |
| Migration thực tế | Chưa viết, chưa chạy |
| Kiểu dữ liệu PostgreSQL (TIMESTAMP/TIMESTAMPTZ, SERIAL/IDENTITY, INT range) | Đề xuất — cần quyết định |
| Verification Status | DRAFT — Revision 2 đã đối chiếu 30 entity và 46 quan hệ với ERD_JOBNEST_30_bang.drawio (khớp), và đối chiếu Entity với cột Entity ở sheet FR của 03_JOBNEST_Traceability_Matrix.xlsx (khớp). Việc đối chiếu độc lập (Independent Audit) với toàn bộ constraint ở §4.4, §4.6–§4.8 và §3.3 chưa thực hiện. Chưa có DDL/migration nào được thực thi. Cần nhóm dự án hoặc Tech Lead kiểm chứng lần cuối trước khi dùng làm cơ sở triển khai Database. (Ghi chú: bản trước ghi "V5.1 / góp ý của Reviewer" — không khớp quy ước phiên bản của bộ 8 tài liệu dự án; đã sửa, xem Phụ lục A.) |

## 11.2. Kết luận
Đây là Logical ERD + Data Dictionary + Constraint List để nhóm review và làm cơ sở viết migration. Chưa phải PostgreSQL DDL hoặc migration đã chạy.
- Constraint và index là đề xuất.
- Integrity constraints ở §4.4, §4.6, §4.7, §4.8 và §3.3 là yêu cầu cần review — chưa được thực thi ở DB.
- Không Test Case nào được chuyển sang Pass — toàn bộ 334 test vẫn ở trạng thái Not Run / TBD / Manual.
- Lưu ý: Tài liệu này chưa trải qua Independent Audit (đánh giá độc lập), mọi thay đổi cần được Tech Lead/Team Dev kiểm chứng thực tế.
## 11.3. Bước tiếp theo đề xuất
1. Chốt kiểu dữ liệu PostgreSQL (TIMESTAMPTZ, IDENTITY, INT range).
2. Chốt ON DELETE policy cho từng FK.
3. Chốt cơ chế thực thi source integrity (§4.4).
4. Chốt cơ chế cập nhật updated_at.
5. Chọn ORM (Prisma/Sequelize/Knex/TypeORM).
6. Quyết định S1 (chứng chỉ) — có thêm bảng student_certificates hay không.
7. Quyết định S6 (salary/budget CHECK) — quy tắc NULL/NOT NULL theo job_type.
8. Quyết định T1 — có duyệt M1 hay giữ lifecycle cũ.
9. Quyết định T2 — có migrate partial unique index hay không.
10. Verify XOR + source integrity trong migration — trước khi cho TC-HIRE-009..012 chạy.
11. Sau khi chốt — viết DDL/migration thực tế.
# PHỤ LỤC A. BẢNG ĐỐI CHIẾU THAY ĐỔI (REVISION 2)
| Mục | Thay đổi | Lý do / nguồn |
| --- | --- | --- |
| Đầu file | Thêm "— Revision 2" vào Phiên bản; thêm dòng Nguồn đối chiếu và Quy ước nhãn | Khớp quy ước File 01, 03 |
| §3.1, §3.2 | Bổ sung 6 quan hệ bị thiếu: student_profiles → student_skills/educations/experiences/cvs; student_cvs → applications; jobs → work_assignments. Bổ sung work_assignments ↔ work_progress vào bảng §3.2 (đã có ở §3.1 nhưng thiếu ở bảng). | Các quan hệ này đã có ở Data Dictionary (§2.2, §2.4, §2.5) và ở ERD_JOBNEST_30_bang.drawio nhưng bị bỏ sót khi liệt kê quan hệ |
| §2.5.1 | Thêm ghi chú CF-03: DEFAULT 'NOT_STARTED' mâu thuẫn với tiền điều kiện IN_PROGRESS ở UC-16/17/18; không tự chọn phương án | File 03 Mục 3.4 (CF-03); File 04 UC-16/17/18 |
| §5 (đầu mục) | Thêm câu nêu phạm vi (chỉ FK/cascade) và trỏ về File 03 §6.9 / sheet State Models cho bảng chuyển trạng thái đầy đủ | Tránh trùng lặp hai nguồn có thể lệch nhau |
| §7 | Sửa tên file nguồn thành ERD_JOBNEST_30_bang.drawio; thay câu xác minh không kiểm chứng được ("per README v2.1") bằng kết quả tự đối chiếu (30 bảng, 46 quan hệ, cột khớp Mục 2) | Tên cũ không khớp file thực tế đính kèm (ERD_JOBNEST_30_bang.drawio); không có README v2.1 trong 13 file dự án |
| §11.1 | Sửa dòng Verification Status: bỏ "V5.1 / góp ý Reviewer" (không khớp quy ước phiên bản dự án), thay bằng kết quả đối chiếu Revision 2 thật | "V5.1" không xuất hiện trong danh sách nhãn phiên bản của 8 file dự án (File 01 Phụ lục B #7) — nhiều khả năng là nội dung copy từ nguồn khác |

# PHỤ LỤC B. PHÁT HIỆN KHI ĐỐI CHIẾU — KHÔNG SỬA TRONG FILE NÀY
Các điểm sau được phát hiện khi đối chiếu File 07 với File 03, Traceability Matrix và Data_v2.xlsx, nhưng không thuộc phạm vi sửa của tài liệu này; chuyển cho người phụ trách hoặc file tương ứng quyết định.
| STT | Điểm lệch | Xử lý |
| --- | --- | --- |
| 1 | Data_v2.xlsx (và Data.xlsx gốc) map vào một schema CŨ, đơn giản hơn (10 bảng tiếng Việt: NguoiDung, TinTuyenDung, HoSoUngTuyen...) — không có freelance_proposals, work_assignments, work_deliverables, deliverable_reviews và các bảng khác của ERD 30 bảng hiện tại. | Không dùng Data_v2.xlsx làm seed cho schema 30 bảng hiện tại nếu chưa làm lại; cần nhóm quyết định hướng (làm lại bộ dữ liệu mẫu theo 30 bảng, hay giữ Data_v2.xlsx cho mục đích khác) |
| 2 | Mã G-49 trong File 07 (§9) chỉ dùng theo nghĩa của File 04 ("FR-40 chưa có UC"), không nhắc tới /admin/stats như File 03/06 dùng. | Dữ liệu bổ sung cho quyết định CF-05 (File 03 Mục 3.4) — nhóm chọn tách mã hoặc ghi rõ hai nghĩa |

# KẾT THÚC TÀI LIỆU 07 — DATABASE/ERD SPECIFICATION