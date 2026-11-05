<!-- converted from 03_JOBNEST_Traceability_Matrix.xlsx -->

## Sheet: Đọc trước
| JOBNEST — 03_JOBNEST_Traceability_Matrix.xlsx |  |
| --- | --- |
| Tài liệu đi kèm | 03_JOBNEST_SRS.docx (v1.2 — Consolidated Draft — Revision 2: đối chiếu liên file) |
| Trạng thái | DRAFT — chưa Approved. Không có mục nào được ghi Approved/Pass/Verified/Implemented. |
| Số liệu thống nhất | 40 FR · 10 NFR · 18 BR · 22 UC · 44 mã màn hình · 36 PB · 12 DB · 30 Entity · 334 TC · 64 Gap |
| Nguồn dữ liệu | File 02 (Backlog Rev 3.1), 03 (SRS v1.2), 04 (Use Case v1.0), 05 (Wireframe v3.3), 06 (API Contract), 07 (Database/ERD), 08 (Test Plan). Ánh xạ UC/PB/WF/Entity lấy từ bảng mapping trong File 04; API lấy từ File 06. |
| Nhãn quy ước | TBD = chưa có quyết định, không tự điền. [MISSING]/[PENDING] = nhãn gốc của File 06. [ĐỀ XUẤT – chờ duyệt] = nội dung do biên soạn đề xuất, chưa được nhóm duyệt. |
| Cột Coverage (sheet FR) | Giữ nguyên nhãn baseline của SRS v1.2: 16 Mapped / 18 Partial / 6 Gap. Không tự đổi nhãn. Đánh giá theo bằng chứng nằm riêng ở sheet Coverage Recon. |
| Cột Test (sheet FR) | TBD cho cả 40 FR. 7 file nguồn không chứa liên kết FR ↔ Test ID thật (ma trận trong bản File 08 cũ là dữ liệu giả và đã bị loại). Sẽ điền khi làm lại File 08. |
| Sheet | FR · NFR · BR · State Models · Decision Register · Coverage Recon · Bảng đối chiếu thay đổi |
## Sheet: FR
| FR | Module | UC | PB | WF | API | Entity | BR | Test | Coverage | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FR-01 | Authentication | UC-01 | PB-01, PB-06 | WF-G04, WF-G08 | POST /auth/register [Baseline] | users, student_profiles, employer_profiles | BR-01, BR-02 | TBD | Mapped | Password policy TBD (UC-01 4b). |
| FR-02 | Authentication | UC-02 | PB-02, PB-03 | WF-G05 | POST /auth/login [Baseline]; POST /auth/logout [MISSING] | users | BR-01 | TBD | Mapped | Đã bỏ cụm 'đã triển khai' (không có bằng chứng triển khai). JWT expiry C1/G-56 TBD; cơ chế vô hiệu hóa JWT sau logout chưa chọn. |
| FR-03 | Authorization | — (cross-cutting; không có UC riêng) | TBD | — (WF-X02 Error Pages cho 403) | Không có endpoint riêng; JWT/RBAC middleware | users (role) | BR-02, BR-04 | TBD | Mapped | Mapped theo middleware xuyên suốt. UC/PB riêng: TBD. |
| FR-04 | Authentication | UC-03 | PB-04 | WF-G05 | POST /auth/forgot-password [Baseline]; Reset password [MISSING] | users, password_reset_tokens | — (không có BR đặc thù) | TBD | Mapped | Reset token expiry TBD (liên quan UC-01/UC-03). |
| FR-05 | Verification | UC-06 | PB-10 | WF-E03 | Request/Verify email OTP [MISSING] | employer_profiles, verification_tokens | BR-03 | TBD | Mapped | Coverage Mapped theo baseline nhưng API [MISSING]; G-15, G-16; provider TBD. |
| FR-06 | Verification | UC-06 | PB-10 | WF-E03 | Request/Verify phone OTP [MISSING] | employer_profiles, verification_tokens | BR-03 | TBD | Mapped | Coverage Mapped theo baseline nhưng API [MISSING]; G-15, G-16; SMS provider TBD. |
| FR-07 | Student Profile | UC-04 | PB-07, PB-08 (theo UC-04) | WF-S02 | Get/Update own profile [MISSING] | student_profiles, student_skills, student_educations, student_experiences | BR-01, BR-04 | TBD | Mapped | API profile [MISSING]. DEP-01: PB-08 phụ thuộc PB-07. |
| FR-08 | Student Profile | UC-04 | PB-07, PB-08 (theo UC-04) | WF-S03 | API-D1: GET/POST/PATCH/DELETE /students/me/cvs [PENDING] | student_cvs (Certificate: chưa có bảng) | BR-01, BR-04 | TBD | Partial | S1: Certificate chưa chốt (ERD chưa có student_certificates). T2: unique index CV mặc định (C5) chưa migration. |
| FR-09 | Employer Profile | UC-05 | PB-09 | WF-E02 | Update employer profile [MISSING] | employer_profiles, users | BR-01, BR-03, BR-04 | TBD | Mapped | API [MISSING]. |
| FR-10 | Employer Profile | UC-05 | PB-09 | WF-E02, WF-E03 | Get own profile [MISSING] | employer_profiles (email_verified_at, phone_verified_at) | BR-03 | TBD | Mapped | Trạng thái xác minh chỉ đọc qua UC-05; WF-X03 xung đột (TBD). |
| FR-11 | Job Management | UC-07 | PB-12 → PB-15 (theo UC-07) | WF-E04, WF-E05 | POST /jobs | jobs, part_time_details | BR-03, BR-05, BR-06 | TBD | Mapped | PB riêng từng FR (1–1): TBD. C7/S6: quy tắc salary/budget theo job_type. |
| FR-12 | Job Management | UC-07 | PB-12 → PB-15 (theo UC-07) | WF-E04, WF-E05 | POST /jobs | jobs, seasonal_details | BR-03, BR-05, BR-06 | TBD | Mapped | C7/S6 TBD. |
| FR-13 | Job Management | UC-07 | PB-12 → PB-15 (theo UC-07) | WF-E04, WF-E05 | POST /jobs | jobs, freelance_details | BR-03, BR-05, BR-06 | TBD | Mapped | C7/S6 TBD. |
| FR-14 | Job Management | UC-07 | PB-12 → PB-15 (theo UC-07) | WF-E04, WF-E05 | PATCH hoặc PUT /jobs/:jobId (chưa chốt); POST /jobs/:jobId/submit-review; Close Job [MISSING] | jobs | BR-03, BR-04, BR-06 | TBD | Partial | Sửa Job sau PUBLISHED có quay lại PENDING_REVIEW hay không: TBD. C4: EXPIRED/đóng/mở lại. |
| FR-15 | Moderation | UC-08 | PB-31 | WF-A03, WF-A04 | GET /admin/jobs/pending; PATCH /admin/jobs/:id/moderation | jobs, admin_logs | BR-06, BR-17 | TBD | Partial | C9 (Moderation Policy) TBD; B1/B2: PB-31 giữ Sprint 2 hay dời. |
| FR-16 | Job Search | UC-09 | PB-16, PB-17 | WF-G01, WF-G02 | GET /jobs | jobs, categories, job_views | BR-06, BR-07 | TBD | Mapped | G-21 (quy tắc search) TBD. |
| FR-17 | Job Search | UC-09 | PB-16, PB-17 | WF-G02 | GET /jobs (query filter); GET /categories (API-D9) [PENDING] | jobs, categories | BR-06 | TBD | Partial | Danh sách tiêu chí lọc 'được hỗ trợ' chưa chốt. |
| FR-18 | Job Search | UC-09 | PB-16, PB-17 | WF-G02 | GET /jobs (sort, page) | jobs | BR-06 | TBD | Partial | Max limit pagination TBD (File 06). |
| FR-19 | Job Detail | UC-09 | PB-16, PB-17 | WF-G03, WF-G06 | GET /jobs/:jobId | jobs, employer_profiles, job_views | BR-06, BR-07 | TBD | Partial | NFR-06: có hiển thị email/phone Employer hay không: TBD. G-23: Job hết hạn/đóng. |
| FR-20 | Saved Jobs | UC-10 | PB-18 | WF-S04 | Không có trong File 06 (SRS ghi API-D2: Saved Jobs, chưa phê duyệt) | job_saved | BR-01, BR-06 | TBD | Gap | Gap: File 06 không có endpoint/mục API-D2. |
| FR-21 | Application | UC-11 (UC-11 ghi FR-23/FR-24 'theo catalog' – cần đối chiếu) | TBD | WF-S06 | POST /jobs/:jobId/applications | applications, jobs, users | BR-07, BR-08 | TBD | Mapped | Lệch: SRS gán FR-21 cho nộp đơn, nhưng File 04 ghi UC-11 ↔ FR-23/FR-24; PB UC-11 = TBD. |
| FR-22 | Application | UC-12 (PROPOSED; phạm vi cần xác minh) | TBD | WF-S05, WF-S12 | API-D3: GET /applications/me [PENDING]; API-D4 (File 06): PATCH /applications/:id/withdraw [PENDING] | applications | BR-08 | TBD | Gap | S2/C2 chính sách rút đơn TBD. |
| FR-23 | Recruitment | UC-12 (PROPOSED) | TBD | WF-E06, WF-E13 | GET /jobs/:jobId/applications | applications, student_profiles, student_cvs | BR-04 | TBD | Partial | NFR-06/G-54: mức hiển thị CV cho Employer TBD. |
| FR-24 | Recruitment | UC-12 (PROPOSED) | TBD | WF-E06 | PATCH /applications/:id/status (chỉ REVIEWING, SHORTLISTED, REJECTED) | applications, notifications | BR-04, BR-07 | TBD | Partial | Không cho ACCEPTED (A3). C3 trigger thông báo TBD. |
| FR-25 | Freelance Proposal | UC-13 | TBD | WF-S07, WF-S12 | POST /jobs/:jobId/proposals | freelance_proposals, jobs, notifications | BR-09 | TBD | Partial | Trường 'giá đề xuất' chỉ khi được bật (TBD). |
| FR-26 | Freelance Proposal | UC-14 (PROPOSED); UC-13 ghi thêm FR-26 | TBD | WF-E07, WF-E08 | GET /jobs/:jobId/proposals; PATCH /proposals/:id/status (chỉ REVIEWING, REJECTED) | freelance_proposals | BR-04, BR-09 | TBD | Partial | Mâu thuẫn FR-26 'chấp nhận' vs A3: xem Mục 3.4. Chấp nhận Proposal chỉ qua POST /jobs/:jobId/selections. |
| FR-27 | Hiring | UC-15 | TBD | WF-E08 | POST /jobs/:jobId/selections (A3) | work_assignments, applications, freelance_proposals, jobs | BR-10, BR-11 | TBD | Partial | G-35, G-36, G-37; C3. A3 chưa có bằng chứng triển khai. |
| FR-28 | Work Assignment | UC-15 | TBD | WF-E08 | POST /jobs/:jobId/selections (A3) | work_assignments | BR-10, BR-11, BR-12 | TBD | Partial | G-35: XOR source integrity (C8). |
| FR-29 | Work Management | UC-16 | PB-24, PB-25 | WF-S08, WF-E09 | GET /assignments/:id | work_assignments, work_progress | BR-12, BR-13 | TBD | Partial | G-58: progressHistory nhúng hay endpoint riêng. |
| FR-30 | Work Management | UC-16 | PB-24, PB-25 | WF-S08, WF-E09 | POST /assignments/:id/progress | work_assignments, work_progress | BR-12, BR-13 | TBD | Partial | G-06: actor cập nhật tiến độ mâu thuẫn giữa FR-30 (Student), API và BR-13. |
| FR-31 | Deliverables | UC-17 | PB-26, PB-27 | WF-S09 | POST /assignments/:id/deliverables | work_assignments, work_deliverables | BR-13, BR-14 | TBD | Mapped | File storage, MIME, dung lượng TBD. |
| FR-32 | Deliverables | UC-17 | PB-26, PB-27 | WF-E10 | PATCH /deliverables/:id/decision; API-D6: GET /assignments/:id/deliverables [PENDING] | work_deliverables | BR-13, BR-14 | TBD | Mapped | C10: giới hạn số lần chỉnh sửa TBD. |
| FR-33 | Work Completion | UC-18 | PB-28 | WF-E09 | PATCH /assignments/:id/complete | work_assignments, work_deliverables, notifications | BR-12, BR-14, BR-16 | TBD | Partial | G-59: idempotency khi xác nhận hoàn thành. |
| FR-34 | Review | UC-19 | PB-29 | WF-S10 | POST /assignments/:id/reviews | reviews, work_assignments, users | BR-15 | TBD | Partial | C10/G-41/G-42: rating scale, comment rules TBD. |
| FR-35 | Review | UC-19 | PB-29 | WF-E11 | POST /assignments/:id/reviews | reviews, work_assignments, users | BR-15 | TBD | Partial | C10/G-41/G-42 TBD. |
| FR-36 | Notification | UC-20 | PB-30 | WF-S11, WF-E12 | GET /notifications; PATCH /notifications/:id/read | notifications, users | BR-16 | TBD | Partial | C3: danh sách trigger TBD. G-43/G-44. |
| FR-37 | Admin | UC-21 | PB-32 | WF-A02 | API-D7: GET /admin/users; PATCH /admin/users/:id/status [PENDING] | users, admin_logs | BR-17 | TBD | Gap | S4: tách PB-32. Gap. |
| FR-38 | Admin | UC-21 | PB-32 | WF-A07 | API-D8: /admin/categories (GET/POST/PATCH/DELETE) [PENDING] | categories, admin_logs | BR-17 | TBD | Gap | S4, S5 (category routes). Gap. |
| FR-39 | Reports | UC-22 | PB-33 | WF-A05, WF-A06, WF-X01 | API-D10: POST /reports [PENDING]; GET /admin/reports; PATCH /admin/reports/:id | reports, admin_logs | BR-17 | TBD | Gap | G-48, G-51 TBD. Gap. |
| FR-40 | Admin | — (để trống theo G-49; không tạo UC-23) | PB-32 (một phần – Admin Logs, theo File 02 §PB-32) | WF-A01, WF-A08 | GET /admin/stats [MISSING] – G-49; GET /admin/logs [MISSING] – G-50 | admin_logs | BR-17 | TBD | Gap | Gap. Chưa có UC riêng; API chưa xác nhận. Ghi chú: mã 'G-49' đang dùng cho cả endpoint /admin/stats (File 03/06) lẫn 'FR-40 chưa có UC' (File 04). |
| Tổng |  |  |  |  |  |  |  |  |  |  |
| Mapped | 16 |  |  |  |  |  |  |  |  |  |
| Partial | 18 |  |  |  |  |  |  |  |  |  |
| Gap | 6 |  |  |  |  |  |  |  |  |  |
| Cộng | 40 |  |  |  |  |  |  |  |  |  |
| Ghi chú: baseline SRS v1.2 là 16/18/6; đếm nhãn theo từng dòng của ma trận cũ là 14/20/6 — hai cách đếm chưa được nhóm thống nhất (xem sheet Coverage Recon). |  |  |  |  |  |  |  |  |  |  |
## Sheet: NFR
| NFR | Nhóm | Yêu cầu (SRS v1.2) | Phương pháp đo [ĐỀ XUẤT – chờ duyệt] | Điều kiện kiểm [ĐỀ XUẤT – chờ duyệt] | Gap / Decision liên quan |
| --- | --- | --- | --- | --- | --- |
| NFR-01 | Performance | API đăng nhập, tìm kiếm và ứng tuyển có thời gian phản hồi p95 ≤ 1.5 giây trong môi trường kiểm thử tải bình thường đã định nghĩa; ghi rõ cấu hình máy và dữ liệu kiểm thử trong biên bản. | Kiểm thử tải trên 3 API (POST /auth/login, GET /jobs, POST /jobs/:jobId/applications); lấy p95 từ công cụ tải. | Cấu hình máy, số người dùng đồng thời và kích thước dữ liệu: TBD (G-52 chưa có benchmark). | G-52 |
| NFR-02 | Security | 100% mật khẩu lưu dưới dạng hash bằng thuật toán phù hợp; không lưu plaintext. | Kiểm tra bảng users: 0 giá trị password_hash không có tiền tố bcrypt; rà soát log và response không chứa mật khẩu. | Dữ liệu seed và dữ liệu đăng ký thử. | — |
| NFR-03 | Security | API riêng tư yêu cầu JWT hợp lệ; kiểm tra role và quyền sở hữu tài nguyên ở backend. | Ma trận Role × Endpoint; gọi không token, token hết hạn, role sai, tài nguyên của người khác; kỳ vọng 401/403. | Cần C1 (JWT expiry) để kiểm token hết hạn. | G-56 / C1 |
| NFR-04 | Compatibility | Giao diện responsive trên desktop, tablet và mobile browser hiện đại. | Kiểm thủ công theo breakpoint đã chốt trên trình duyệt mục tiêu; mỗi màn hình không bị cuộn ngang ngoài ý muốn. | Breakpoint và danh sách trình duyệt: TBD (G-53). | G-53 |
| NFR-05 | Validation | Dữ liệu đầu vào được kiểm tra ở backend; lỗi validation trả cấu trúc thống nhất. | Gửi dữ liệu sai kiểu/thiếu trường cho từng endpoint ghi; kỳ vọng 400 và cấu trúc lỗi theo File 06 §1. | Cấu trúc lỗi chuẩn (File 06). | — |
| NFR-06 | Privacy | Chỉ hiển thị dữ liệu hồ sơ/CV cho đúng đối tượng và mục đích nghiệp vụ; không lộ dữ liệu nhạy cảm qua API công khai. | Gọi API công khai bằng Guest và rà các trường response; Employer chỉ xem CV của ứng viên đã nộp vào Job của mình. | Chính sách xem CV: TBD (G-54). | G-54 |
| NFR-07 | Reliability | Thao tác cập nhật nhiều bản ghi liên quan phải dùng transaction để tránh trạng thái dở dang. | Gây lỗi giữa chừng (mô phỏng lỗi DB) ở các thao tác đăng ký, chọn ứng viên, duyệt Job, hoàn thành Assignment; kỳ vọng rollback toàn bộ. | Khả năng chèn lỗi trong môi trường kiểm thử. | — |
| NFR-08 | Maintainability | Backend chia module/routes/controllers/services/data-access; cấu hình môi trường nằm ngoài mã nguồn. | Rà soát cấu trúc thư mục và không có secret trong repo (checklist code review). | Cần repo mã nguồn (chưa có bằng chứng). | — |
| NFR-09 | Auditability | Thao tác Admin và chuyển trạng thái quan trọng lưu actor, action, target, timestamp. | Thực hiện mỗi thao tác Admin; kỳ vọng đúng một bản ghi admin_logs có đủ 4 trường. | Danh sách 'chuyển trạng thái quan trọng' ngoài Admin: TBD. | — |
| NFR-10 | Backup | Có quy trình sao lưu và phục hồi PostgreSQL được mô tả, thử nghiệm trong giai đoạn triển khai. | Thực hiện một lần sao lưu rồi phục hồi sang môi trường trống; đối chiếu số dòng các bảng chính. | Quy trình sao lưu chưa có (G-55). | G-55 |
## Sheet: BR
| BR | Quy tắc nghiệp vụ | FR liên quan | Số FR (công thức) | UC liên quan | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| BR-01 | Người dùng phải đăng nhập để thực hiện hành động cần ghi nhận danh tính như ứng tuyển, gửi Proposal, tạo tin, đánh giá. | FR-01, FR-02, FR-07, FR-08, FR-09, FR-20 | 6 | UC-01, UC-02, UC-04, UC-05, UC-10 |  |
| BR-02 | Tài khoản đăng ký công khai chỉ được chọn Student hoặc Individual Employer; Admin được cấp bởi quy trình quản trị, không tự đăng ký. | FR-01, FR-03 | 2 | UC-01 |  |
| BR-03 | Employer phải xác minh email và số điện thoại thành công trước khi tạo/gửi duyệt tin. | FR-05, FR-06, FR-09, FR-10, FR-11, FR-12, FR-13, FR-14 | 8 | UC-05, UC-06, UC-07 |  |
| BR-04 | Employer chỉ được xem/sửa/đóng tin và quản lý hồ sơ thuộc quyền sở hữu của mình. | FR-03, FR-07, FR-08, FR-09, FR-14, FR-23, FR-24, FR-26 | 8 | UC-04, UC-05, UC-07, UC-12, UC-13, UC-14 |  |
| BR-05 | Job có job_type thuộc PART_TIME, SEASONAL hoặc FREELANCE. | FR-11, FR-12, FR-13 | 3 | UC-07 |  |
| BR-06 | Job chỉ được công khai khi đáp ứng điều kiện dữ liệu và trạng thái kiểm duyệt. | FR-11, FR-12, FR-13, FR-14, FR-15, FR-16, FR-17, FR-18, FR-19, FR-20 | 10 | UC-07, UC-08, UC-09, UC-10 |  |
| BR-07 | Job đóng, hết hạn, bị từ chối hoặc không còn nhận hồ sơ không nhận Application/Proposal mới. | FR-16, FR-19, FR-21, FR-24 | 4 | UC-09, UC-11, UC-12 |  |
| BR-08 | Một Student chỉ có một Application đang/đã được ghi nhận cho cùng Job; rút đơn không tự xóa lịch sử. | FR-21, FR-22 | 2 | UC-11, UC-12 |  |
| BR-09 | Freelance dùng Proposal riêng, không thay thế bằng Application thông thường. | FR-25, FR-26 | 2 | UC-13, UC-14 |  |
| BR-10 | Một Job có thể tuyển nhiều Student; số Assignment được chấp nhận không vượt quantity_required. | FR-27, FR-28 | 2 | UC-15 |  |
| BR-11 | Mỗi Student được chọn phải có Work Assignment riêng gắn với Application/Proposal tương ứng. | FR-27, FR-28 | 2 | UC-15 |  |
| BR-12 | Job status, Application/Proposal status và Work Assignment status là ba vòng đời độc lập. | FR-28, FR-29, FR-30, FR-33 | 4 | UC-15, UC-16, UC-18 | Đồng bộ với State Models (5 vòng đời độc lập, gồm Deliverable). |
| BR-13 | Chỉ các bên liên quan của Assignment được xem/cập nhật tiến độ và Deliverable. | FR-29, FR-30, FR-31, FR-32 | 4 | UC-16, UC-17 |  |
| BR-14 | Freelance chỉ hoàn thành khi Employer chấp nhận Deliverable cuối cùng; yêu cầu chỉnh sửa đưa Assignment về trạng thái cần sửa. | FR-31, FR-32, FR-33 | 3 | UC-17, UC-18 | MÂU THUẪN: vế 'đưa Assignment về trạng thái cần sửa' trái với M1/State Model §6.5, UC-17 (Assignment vẫn IN_PROGRESS) và File 06 §6.5. UC-17/UC-18 chỉ chép vế 'chỉ hoàn thành khi Deliverable cuối cùng được chấp nhận và Employer xác nhận'. Chưa chốt – xem Mục 3.4. |
| BR-15 | Chỉ Assignment COMPLETED mới cho phép hai bên đánh giá; mỗi bên tối đa một Review cho mỗi Assignment. | FR-34, FR-35 | 2 | UC-19 |  |
| BR-16 | Thông báo chỉ được tạo sau khi thay đổi nghiệp vụ được lưu thành công. | FR-33, FR-36 | 2 | UC-18, UC-20 |  |
| BR-17 | Admin thực hiện thao tác quản trị phải được ghi nhật ký. | FR-15, FR-37, FR-38, FR-39, FR-40 | 5 | UC-08, UC-21, UC-22 |  |
| BR-18 | Hệ thống không thu, giữ hoặc chuyển tiền trong phạm vi hiện tại. | — | 0 | — | Ràng buộc phạm vi; không gắn FR/UC cụ thể. |
## Sheet: State Models
| Đối tượng | Từ trạng thái | Đến trạng thái | Actor | Điều kiện | Nguồn | Có phần TBD (công thức) |
| --- | --- | --- | --- | --- | --- | --- |
| Job | (tạo mới) | DRAFT | Employer (chủ Job) | Employer đã xác minh email và số điện thoại (BR-03); dữ liệu Job lưu được | SRS §6.2; BR-03 | Theo nguồn |
| Job | DRAFT | PENDING_REVIEW | Employer (chủ Job) | Dữ liệu đủ điều kiện gửi duyệt; POST /jobs/:jobId/submit-review | SRS §6.2; File 06 §4.5 | Theo nguồn |
| Job | PENDING_REVIEW | PUBLISHED | Admin | Duyệt; set published_at; ghi admin_logs cùng transaction. Duyệt mọi Job hay chỉ Job bị gắn cờ: TBD (C9) | SRS §6.2; UC-08 | TBD |
| Job | PENDING_REVIEW | REJECTED | Admin | Bắt buộc moderation_reason; ghi admin_logs cùng transaction | SRS §6.2; UC-08 | Theo nguồn |
| Job | PUBLISHED | CLOSED | Employer (chủ Job) | Đóng thủ công; endpoint đóng Job [MISSING] (File 06 §4.6). Quyền mở lại: TBD | SRS §6.2; C4 | TBD |
| Job | PUBLISHED | EXPIRED | Hệ thống (cron) hoặc thao tác thủ công – TBD | Quá deadline; cơ chế chọn cron/thủ công: TBD (C4) | SRS §6.2; C4 | TBD |
| Job | PUBLISHED | PENDING_REVIEW | TBD | Sửa Job sau khi đã PUBLISHED có quay lại duyệt hay không: TBD | SRS §6.2.3 (TBD) | TBD |
| Job | REJECTED | DRAFT | TBD | Employer sửa và gửi lại sau khi bị từ chối: chưa được nêu trong nguồn – TBD | Không có trong nguồn | TBD |
| Application | (tạo mới) | PENDING | Student | Job PUBLISHED, còn hạn, còn nhận hồ sơ; chưa có Application cho cùng Job (BR-08); Job không phải FREELANCE | SRS §6.3; UC-11 | Theo nguồn |
| Application | PENDING | REVIEWING | Employer (chủ Job) | PATCH /applications/:id/status | SRS §6.3; File 06 §5.1 | Theo nguồn |
| Application | REVIEWING | SHORTLISTED | Employer (chủ Job) | PATCH /applications/:id/status | SRS §6.3; File 06 §5.1 | Theo nguồn |
| Application | PENDING / REVIEWING / SHORTLISTED | REJECTED | Employer (chủ Job) | PATCH cho phép đặt REJECTED; từ trạng thái nào được phép: sơ đồ SRS chỉ vẽ từ SHORTLISTED – TBD | File 06 §5.1; SRS §6.3.1 | TBD |
| Application | (trạng thái nguồn được chọn) | ACCEPTED | Employer, chỉ qua POST /jobs/:jobId/selections | A3: cùng transaction với tạo Work Assignment; PATCH không được đặt ACCEPTED | SRS §5.2, §6.3.2; File 06 §6.1 | Theo nguồn |
| Application | các trạng thái chưa ACCEPTED | WITHDRAWN | Student | Theo chính sách rút đơn: TBD (C2/S2); không xóa lịch sử (BR-08) | SRS §6.3.2; C2, S2 | TBD |
| Proposal | (tạo mới) | SUBMITTED | Student | Job FREELANCE đang PUBLISHED, nhận Proposal; chưa có Proposal trùng | SRS §6.4; UC-13 | Theo nguồn |
| Proposal | SUBMITTED | REVIEWING | Employer (chủ Job) | PATCH /proposals/:id/status | SRS §6.4; File 06 §5.4 | Theo nguồn |
| Proposal | SUBMITTED / REVIEWING | REJECTED | Employer (chủ Job) | PATCH /proposals/:id/status; trạng thái nguồn hợp lệ: sơ đồ SRS vẽ từ REVIEWING – TBD | File 06 §5.4; SRS §6.4.1 | TBD |
| Proposal | (trạng thái nguồn được chọn) | ACCEPTED | Employer, chỉ qua POST /jobs/:jobId/selections | A3 | SRS §6.4.2 | Theo nguồn |
| Proposal | SUBMITTED / REVIEWING | WITHDRAWN | Student | Nếu chính sách cho phép: TBD (S3); API-D5 [PENDING] | SRS §6.4.2; S3 | TBD |
| Work Assignment | (tạo mới) | NOT_STARTED hoặc IN_PROGRESS – TBD | Hệ thống (endpoint Selection) | Trạng thái khởi tạo chưa chốt: SRS vẽ NOT_STARTED, nhưng UC-16/17/18 yêu cầu IN_PROGRESS; T1/M1 là đề xuất chưa duyệt | SRS §6.5; T1/M1 | TBD |
| Work Assignment | NOT_STARTED | IN_PROGRESS | TBD (Student hoặc hệ thống) | Điều kiện kích hoạt chưa được nêu trong nguồn – TBD | SRS §6.5.1 (đề xuất) | TBD |
| Work Assignment | IN_PROGRESS | COMPLETED | Employer (chủ Job) | PART_TIME/SEASONAL: Employer xác nhận. FREELANCE: Deliverable mới nhất phải ACCEPTED rồi Employer xác nhận. Ghi completed_at. Idempotency: TBD (G-59) | SRS §6.5.2; File 06 §6.7; UC-18 | TBD |
| Deliverable | (tạo mới) | SUBMITTED | Student (được giao Assignment) | Assignment thuộc Job FREELANCE và đang IN_PROGRESS; version_no tăng dần | SRS §6.6; UC-17 | Theo nguồn |
| Deliverable | SUBMITTED | ACCEPTED | Employer (chủ Job) | PATCH /deliverables/:id/decision; Assignment chưa tự hoàn thành | SRS §6.6.2; File 06 §6.5 | Theo nguồn |
| Deliverable | SUBMITTED | REVISION_REQUESTED | Employer (chủ Job) | Bắt buộc comment; Assignment vẫn IN_PROGRESS. Giới hạn số lần: TBD (C10) | SRS §6.6.2; File 06 §6.5 | TBD |
| Deliverable | REVISION_REQUESTED | SUBMITTED | Student | Gửi phiên bản mới (version_no + 1) | SRS §6.6.1 | Theo nguồn |
| Ghi chú | Mô hình Work Assignment (T1/M1) là đề xuất chưa phê duyệt. SUBMITTED/ACCEPTED/REVISION_REQUESTED thuộc Deliverable, không dùng cho Work Assignment. Các dòng ghi TBD là chỗ nguồn chưa nêu hoặc chưa chốt. |  |  |  |  |  |
## Sheet: Decision Register
| Mã | Nội dung | Trạng thái | Nhóm | Ảnh hưởng |
| --- | --- | --- | --- | --- |
| C1 | JWT expiry | TBD | C | FR-02, NFR-03, G-56 |
| C2 | Điều kiện cho phép Application chuyển WITHDRAWN | TBD | C | FR-22 |
| C3 | Notification trigger list | TBD | C | FR-36, UC-20 |
| C4 | Cơ chế Job EXPIRED: cron hoặc manual; đóng/mở lại Job | TBD | C | FR-14 |
| C5 | Ràng buộc CV mặc định – T2 | Proposed – chưa migration | C | FR-08 |
| C6 | Admin provisioning | TBD | C | BR-02 |
| C7 | Quy tắc salary_* và budget_* theo job_type | TBD | C | FR-11..FR-13 |
| C8 | Source integrity của work_assignments.student_id – G-35 | TBD | C | FR-27, FR-28 |
| C9 | Moderation Policy | TBD | C | FR-15, PB-31 |
| C10 | Revision limit, rating scale và comment rules | TBD | C | FR-32, FR-34, FR-35 |
| S1 | Certificate trong FR-08 | TBD | S | FR-08 |
| S2 | Withdraw Application | TBD | S | FR-22 |
| S3 | Withdraw Proposal | TBD | S | FR-22 (Proposal), API-D5 |
| S4 | Tách PB-32 thành User/Category/Log | TBD | S | FR-37, FR-38, FR-40 |
| S5 | Category routes | TBD | S | FR-38 |
| S6 | Salary/Budget CHECK theo job_type | TBD | S | FR-11..FR-13 |
| T1/M1 | Work Assignment Lifecycle | Proposed – chưa phê duyệt | T | FR-28, FR-30, FR-33 |
| T2 | Partial unique index cho CV mặc định | Proposed – chưa migration | T | FR-08 |
| A3 | Selection Rule | Logic áp dụng trong tài liệu; chưa có bằng chứng code | A | FR-24, FR-26, FR-27 |
| DEP-01 | PB-07 → PB-08 dependency | Phụ thuộc Backlog – chờ nhóm phê duyệt | D | FR-07, FR-08 |
| EPIC-GAP-01 | 12 vị trí Epic chưa có mapping | TBD | D | File 02 |
| G-06 | Actor cập nhật Progress chưa thống nhất | TBD | G | FR-30, UC-16, BR-13 |
| G-35 | Source integrity và XOR constraint của Work Assignment | TBD | G | FR-27, FR-28; TC-HIRE-009..012 |
| G-49 | GET /admin/stats chưa xác nhận (File 04 cũng dùng G-49 cho 'FR-40 chưa có UC') | Chưa xác nhận | G | FR-40 |
| G-50 | GET /admin/logs chưa xác nhận | Chưa xác nhận | G | FR-40 |
| G-57 | Nội dung Gap chưa có trong nguồn hiện tại | MISSING – cần xác nhận | G | — |
| G-58 | Cấu trúc Progress History và API liên quan | TBD | G | FR-29 |
| G-59 | Idempotency khi xác nhận hoàn thành Assignment | TBD | G | FR-33 |
| G-63 | Sai khác số lượng Job Management | Reconciliation | G | File 08 |
| G-64 | Sai khác Missing Data Register | Reconciliation | G | File 08 |
| API-D1..D10 | API bổ sung cần đối chiếu/phê duyệt (xem Mục 8.4; lệch đánh số giữa File 03 và File 06) | Chưa phê duyệt | D | Nhiều FR |
## Sheet: Coverage Recon
| Đối chiếu Coverage 16/18/6 và 14/20/6 — đánh giá theo bằng chứng [ĐỀ XUẤT – chờ duyệt] |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Quy tắc đề xuất: mỗi ô UC/PB/WF/API/Entity đạt 1 điểm khi có nội dung thật (không TBD, không bắt đầu bằng '—', API không [MISSING]/[PENDING] và không 'Không có'). 5/5 = đủ bằng chứng. Đây chỉ là công cụ đối chiếu, KHÔNG thay nhãn baseline. |  |  |  |  |  |  |  |  |  |
| FR | Coverage (baseline) | UC | PB | WF | API | Entity | Điểm bằng chứng (0–5) | Đánh giá theo bằng chứng | Lệch với baseline |
| FR-01 | Mapped | 1 | 1 | 1 | 1 | 1 | 5 | Đủ bằng chứng |  |
| FR-02 | Mapped | 1 | 1 | 1 | 0 | 1 | 4 | Một phần | Baseline Mapped nhưng thiếu bằng chứng |
| FR-03 | Mapped | 0 | 0 | 0 | 0 | 1 | 1 | Thiếu | Baseline Mapped nhưng thiếu bằng chứng |
| FR-04 | Mapped | 1 | 1 | 1 | 0 | 1 | 4 | Một phần | Baseline Mapped nhưng thiếu bằng chứng |
| FR-05 | Mapped | 1 | 1 | 1 | 0 | 1 | 4 | Một phần | Baseline Mapped nhưng thiếu bằng chứng |
| FR-06 | Mapped | 1 | 1 | 1 | 0 | 1 | 4 | Một phần | Baseline Mapped nhưng thiếu bằng chứng |
| FR-07 | Mapped | 1 | 1 | 1 | 0 | 1 | 4 | Một phần | Baseline Mapped nhưng thiếu bằng chứng |
| FR-08 | Partial | 1 | 1 | 1 | 0 | 1 | 4 | Một phần |  |
| FR-09 | Mapped | 1 | 1 | 1 | 0 | 1 | 4 | Một phần | Baseline Mapped nhưng thiếu bằng chứng |
| FR-10 | Mapped | 1 | 1 | 1 | 0 | 1 | 4 | Một phần | Baseline Mapped nhưng thiếu bằng chứng |
| FR-11 | Mapped | 1 | 1 | 1 | 1 | 1 | 5 | Đủ bằng chứng |  |
| FR-12 | Mapped | 1 | 1 | 1 | 1 | 1 | 5 | Đủ bằng chứng |  |
| FR-13 | Mapped | 1 | 1 | 1 | 1 | 1 | 5 | Đủ bằng chứng |  |
| FR-14 | Partial | 1 | 1 | 1 | 0 | 1 | 4 | Một phần |  |
| FR-15 | Partial | 1 | 1 | 1 | 0 | 1 | 4 | Một phần |  |
| FR-16 | Mapped | 1 | 1 | 1 | 1 | 1 | 5 | Đủ bằng chứng |  |
| FR-17 | Partial | 1 | 1 | 1 | 0 | 1 | 4 | Một phần |  |
| FR-18 | Partial | 1 | 1 | 1 | 1 | 1 | 5 | Đủ bằng chứng | Baseline Partial nhưng đủ bằng chứng |
| FR-19 | Partial | 1 | 1 | 1 | 1 | 1 | 5 | Đủ bằng chứng | Baseline Partial nhưng đủ bằng chứng |
| FR-20 | Gap | 1 | 1 | 1 | 0 | 1 | 4 | Một phần | Baseline Gap nhưng gần đủ bằng chứng |
| FR-21 | Mapped | 1 | 0 | 1 | 1 | 1 | 4 | Một phần | Baseline Mapped nhưng thiếu bằng chứng |
| FR-22 | Gap | 1 | 0 | 1 | 0 | 1 | 3 | Một phần |  |
| FR-23 | Partial | 1 | 0 | 1 | 1 | 1 | 4 | Một phần |  |
| FR-24 | Partial | 1 | 0 | 1 | 1 | 1 | 4 | Một phần |  |
| FR-25 | Partial | 1 | 0 | 1 | 1 | 1 | 4 | Một phần |  |
| FR-26 | Partial | 1 | 0 | 1 | 1 | 1 | 4 | Một phần |  |
| FR-27 | Partial | 1 | 0 | 1 | 1 | 1 | 4 | Một phần |  |
| FR-28 | Partial | 1 | 0 | 1 | 1 | 1 | 4 | Một phần |  |
| FR-29 | Partial | 1 | 1 | 1 | 1 | 1 | 5 | Đủ bằng chứng | Baseline Partial nhưng đủ bằng chứng |
| FR-30 | Partial | 1 | 1 | 1 | 1 | 1 | 5 | Đủ bằng chứng | Baseline Partial nhưng đủ bằng chứng |
| FR-31 | Mapped | 1 | 1 | 1 | 1 | 1 | 5 | Đủ bằng chứng |  |
| FR-32 | Mapped | 1 | 1 | 1 | 0 | 1 | 4 | Một phần | Baseline Mapped nhưng thiếu bằng chứng |
| FR-33 | Partial | 1 | 1 | 1 | 1 | 1 | 5 | Đủ bằng chứng | Baseline Partial nhưng đủ bằng chứng |
| FR-34 | Partial | 1 | 1 | 1 | 1 | 1 | 5 | Đủ bằng chứng | Baseline Partial nhưng đủ bằng chứng |
| FR-35 | Partial | 1 | 1 | 1 | 1 | 1 | 5 | Đủ bằng chứng | Baseline Partial nhưng đủ bằng chứng |
| FR-36 | Partial | 1 | 1 | 1 | 1 | 1 | 5 | Đủ bằng chứng | Baseline Partial nhưng đủ bằng chứng |
| FR-37 | Gap | 1 | 1 | 1 | 0 | 1 | 4 | Một phần | Baseline Gap nhưng gần đủ bằng chứng |
| FR-38 | Gap | 1 | 1 | 1 | 0 | 1 | 4 | Một phần | Baseline Gap nhưng gần đủ bằng chứng |
| FR-39 | Gap | 1 | 1 | 1 | 0 | 1 | 4 | Một phần | Baseline Gap nhưng gần đủ bằng chứng |
| FR-40 | Gap | 0 | 1 | 1 | 0 | 1 | 3 | Một phần |  |
| Tổng hợp |  |  |  |  |  |  |  |  |  |
| Baseline – Mapped |  |  |  |  |  | 16 | SRS v1.2: 16 |  |  |
| Baseline – Partial |  |  |  |  |  | 18 | SRS v1.2: 18 |  |  |
| Baseline – Gap |  |  |  |  |  | 6 | SRS v1.2: 6 |  |  |
| Đếm nhãn theo từng dòng (nguồn cũ) – Mapped / Partial / Gap |  |  |  |  |  | 14 / 20 / 6 | Không có dòng nguồn trong 7 file để kiểm lại: TBD (nhóm xác nhận) |  |  |
| Chênh lệch cần giải thích |  |  |  |  |  | 2 | Mapped 16 → 14 và Partial 18 → 20: 2 FR đang được gán Mapped ở danh sách nhưng nhãn dòng là Partial; không xác định được 2 FR nào từ 7 file |  |  |
| Đủ bằng chứng (5/5) |  |  |  |  |  | 14 | Theo quy tắc đề xuất ở trên |  |  |
| Một phần (3–4) |  |  |  |  |  | 25 |  |  |  |
| Thiếu (0–2) |  |  |  |  |  | 1 |  |  |  |
| Baseline Mapped nhưng thiếu bằng chứng |  |  |  |  |  | 10 | Ứng viên giải thích chênh lệch 16 → 14; cần nhóm quyết định |  |  |
| Baseline Partial nhưng đủ bằng chứng |  |  |  |  |  | 8 |  |  |  |
## Sheet: Bảng đối chiếu thay đổi
| Mục sửa | Lý do | File nguồn |
| --- | --- | --- |
| Tạo mới ma trận FR | Module | UC | PB | WF | API | Entity | BR | Test | Coverage | Ghi chú | SRS v1.2 chỉ mô tả cấu trúc ma trận, chưa có dữ liệu; điền từ bảng mapping của File 04, File 06 và File 02. Ô không có căn cứ ghi TBD. | File 02, 04, 05, 06, 07 |
| FR-40: UC để trống, không tạo UC-23 | Theo G-49 và quy ước File 04. | File 04 |
| FR-21: ghi chú lệch UC-11 ↔ FR-23/FR-24 | SRS gán FR-21 cho nộp đơn Part-time/Seasonal; File 04 chỉ liệt kê FR-23, FR-24 cho UC-11. | File 03, File 04 |
| FR-20: API trống | File 06 không có endpoint Saved Jobs và không có mục API-D2. | File 06 |
| Cột Test = TBD cho 40 FR | Không có liên kết FR ↔ Test ID thật trong 7 file nguồn. | File 08 (cũ: dữ liệu giả) |
| Sheet NFR: thêm phương pháp đo và điều kiện kiểm | Yêu cầu bổ sung; gắn nhãn [ĐỀ XUẤT – chờ duyệt]; ngưỡng chưa có ghi TBD. | File 03 |
| Sheet BR: nêu mâu thuẫn BR-14 ↔ M1 | BR-14 nói 'đưa Assignment về trạng thái cần sửa', trái M1, UC-17 và File 06 §6.5. | File 03, 04, 06 |
| Sheet State Models: bảng from → to cho 5 đối tượng | Tổng hợp từ SRS §6 và File 06; chỗ nguồn chưa nêu ghi TBD. | File 03, 04, 06 |
| Sheet Decision Register: gộp C/S/T/A/DEP/G/API-D | Một nơi theo dõi mọi quyết định còn mở; ghi nhận G-49 bị dùng hai nghĩa. | File 03, 04, 06 |
| Sheet Coverage Recon | Giải thích chênh lệch 16/18/6 vs 14/20/6 bằng quy tắc bằng chứng [ĐỀ XUẤT]; không đổi nhãn baseline. | File 03 |
| Lệch đánh số API-D3/D4 | File 03 ghi D3 = history + withdraw, D4 = chưa xác định; File 06 ghi D3 = history, D4 = withdraw Application. | File 03, File 06 |