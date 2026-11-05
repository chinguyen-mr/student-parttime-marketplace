<!-- converted from 04_JOBNEST_UC_Register.xlsx -->

## Sheet: UC Register
| UC_ID | Tên UC | Actor chính | Actor phụ | FR | PB | WF | BR | Entity | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UC-01 | Đăng ký tài khoản | Guest | — | FR-01 | PB-01, PB-06 | WF-G04 | BR-01, BR-02 | users, student_profiles, employer_profiles | BASELINE |
| UC-02 | Đăng nhập/Đăng xuất | Student / Individual Employer / Admin | — | FR-02 | PB-02, PB-03 | WF-G05 | BR-01 | users | BASELINE |
| UC-03 | Quên/đặt lại mật khẩu | Guest | Email service / SMS service (nếu được chọn) | FR-04 | PB-04 | WF-G05 | — | users, password_reset_tokens [TBD — đối chiếu ERD] | REVISION |
| UC-04 | Quản lý hồ sơ Student | Student | — | FR-07, FR-08 | PB-07, PB-08 | WF-S02, WF-S03 | BR-01, BR-04 | student_profiles, student_skills, student_educations, student_experiences, student_cvs | REVISION |
| UC-05 | Quản lý hồ sơ Employer | Individual Employer | — | FR-09, FR-10 | PB-09 | WF-E02 | BR-01, BR-03, BR-04 | employer_profiles, users | REVISION |
| UC-06 | Xác minh email và số điện thoại | Individual Employer | Email/SMS provider | FR-05, FR-06 | PB-10 | WF-E03 | BR-03 | employer_profiles, verification_tokens | BASELINE |
| UC-07 | Tạo và quản lý Job | Individual Employer | — | FR-11, FR-12, FR-13, FR-14 | PB-12, PB-13, PB-14, PB-15 | WF-E04, WF-E05 | BR-03, BR-05, BR-06 | jobs, part_time_details, seasonal_details, freelance_details | BASELINE |
| UC-08 | Kiểm duyệt Job | Admin | Employer (nhận kết quả/notification nếu C3 được duyệt) | FR-15 | PB-31 | WF-A03, WF-A04 | BR-06, BR-17 | jobs, admin_logs, notifications [notification theo C3 — TBD] | REVISION |
| UC-09 | Tìm kiếm và xem Job | Guest / Student | Employer public profile (dữ liệu công khai) | FR-16, FR-17, FR-18, FR-19 | PB-16, PB-17 | WF-G01, WF-G02, WF-G03 | BR-06, BR-07 | jobs, categories, employer_profiles, job_views [ghi view TBD] | REVISION |
| UC-10 | Lưu Job | Student | — | FR-20 | PB-18 | WF-S04 | BR-01, BR-06, BR-07 | job_saved, jobs, users | REVISION |
| UC-11 | Ứng tuyển Part-time/Seasonal | Student | Individual Employer (nhận notification theo C3) | FR-21; FR-22 (overlap — xem CF-06) | PB-19 | WF-S06 | BR-07, BR-08 | applications, jobs, users, notifications | CF-06 |
| UC-12 | Quản lý Application | Individual Employer / Student | Student / Employer (bên liên quan); notification service | FR-22 (overlap — xem CF-06), FR-23, FR-24 | PB-20 | WF-E06, WF-S05 | BR-04, BR-07, BR-08, BR-16 | applications, jobs, users, notifications | PROPOSED |
| UC-13 | Gửi Freelance Proposal | Student | Individual Employer (nhận Proposal/notification theo C3) | FR-25, FR-26 | PB-21 | WF-S07 | BR-07, BR-09 | freelance_proposals, jobs, notifications | REVISION |
| UC-14 | Xét duyệt Freelance Proposal | Individual Employer | Student (nhận kết quả/notification theo C3) | FR-26 | PB-22 | WF-E07 | BR-04, BR-09, BR-16 | freelance_proposals, jobs, notifications | PROPOSED |
| UC-15 | Chọn nhiều ứng viên và tạo Assignment | Individual Employer | Student được chọn; notification service | FR-27, FR-28 | PB-23, PB-24 | WF-E08 | BR-10, BR-11, BR-12 | work_assignments, applications, freelance_proposals, jobs, notifications, users | REVISION |
| UC-16 | Theo dõi tiến độ Assignment | Student / Individual Employer | — | FR-29, FR-30 | PB-24, PB-25 | WF-S08, WF-E09 | BR-12, BR-13 | work_assignments, work_progress | REVISION |
| UC-17 | Bàn giao và nghiệm thu Freelance | Student (gửi Deliverable) / Individual Employer (nghiệm thu) | Student / Employer còn lại trong Assignment | FR-31, FR-32 | PB-26, PB-27 | WF-S09, WF-E10 | BR-13, BR-14 | work_assignments, work_deliverables | BASELINE |
| UC-18 | Xác nhận hoàn thành Assignment | Individual Employer | Student (participant/nhận thông báo theo C3) | FR-33 | PB-28 | WF-E09 | BR-12, BR-14, BR-16 | work_assignments, work_deliverables, notifications | REVISION |
| UC-19 | Đánh giá hai chiều | Student / Individual Employer | Participant còn lại của Assignment | FR-34, FR-35 | PB-29 | WF-S10, WF-E11 | BR-15 | reviews, work_assignments, users, notifications | REVISION |
| UC-20 | Nhận thông báo | Student / Individual Employer | Notification service / nghiệp vụ phát sinh sự kiện | FR-36 | PB-30 | WF-S11, WF-E12 | BR-16 | notifications, users | REVISION |
| UC-21 | Quản lý người dùng và danh mục | Admin | User / Job (đối tượng dữ liệu được quản trị) | FR-37, FR-38 | PB-32 [PARTIAL — xem S4] | WF-A02, WF-A07 | BR-17 | users, categories, admin_logs | REVISION |
| UC-22 | Xử lý báo cáo | Admin | Reporter / User hoặc Job bị báo cáo | FR-39 | PB-33 | WF-A05, WF-A06 | BR-17 | reports, users, jobs, admin_logs | REVISION |
## Sheet: PB Mapping
| UC_ID | PB | Trạng thái mapping | Ghi chú |
| --- | --- | --- | --- |
| UC-01 | PB-01, PB-06 | MAPPED |  |
| UC-02 | PB-02, PB-03 | MAPPED |  |
| UC-03 | PB-04 | MAPPED |  |
| UC-04 | PB-07, PB-08 | MAPPED |  |
| UC-05 | PB-09 | MAPPED |  |
| UC-06 | PB-10 | MAPPED |  |
| UC-07 | PB-12, PB-13, PB-14, PB-15 | MAPPED |  |
| UC-08 | PB-31 | MAPPED |  |
| UC-09 | PB-16, PB-17 | MAPPED |  |
| UC-10 | PB-18 | MAPPED |  |
| UC-11 | PB-19 | CF-06 | PB-19; FR-22 overlap đang chờ quyết định CF-06. |
| UC-12 | PB-20 | CF-06 | PB-20; FR-22 overlap đang chờ quyết định CF-06. |
| UC-13 | PB-21 | MAPPED |  |
| UC-14 | PB-22 | MAPPED |  |
| UC-15 | PB-23, PB-24 | OVERLAP | PB-24 overlap với UC-16; PB-23 là chọn nhiều ứng viên. |
| UC-16 | PB-24, PB-25 | OVERLAP | PB-24 overlap với UC-15; PB-25 là cập nhật tiến độ. |
| UC-17 | PB-26, PB-27 | MAPPED |  |
| UC-18 | PB-28 | MAPPED |  |
| UC-19 | PB-29 | MAPPED |  |
| UC-20 | PB-30 | MAPPED |  |
| UC-21 | PB-32 [PARTIAL — xem S4] | PARTIAL | PB-32 PARTIAL; S4 cần quyết định phạm vi User/Category/Logs. |
| UC-22 | PB-33 | MAPPED |  |
## Sheet: CF Register
| Mã | Vế 1 | Vế 2 | Phương án A | Phương án B | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| CF-06 | UC-11: FR-21 (nộp Application); review sửa UC-11 không còn FR-23/FR-24. | UC-12: FR-23/FR-24 (Employer xem/xử lý); FR-22 mô tả history/withdraw giao thoa UC-11 và UC-12. | FR-22 chỉ thuộc UC-12; UC-11 chỉ FR-21. Phân tách nộp đơn với lịch sử/rút đơn. | FR-22 dùng chung UC-11 và UC-12; cần phân ranh acceptance criteria để tránh trùng phạm vi. | Chờ nhóm quyết định — chưa chốt |