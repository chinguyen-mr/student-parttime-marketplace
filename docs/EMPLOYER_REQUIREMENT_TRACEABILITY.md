# MA TRẬN TRUY VẾT YÊU CẦU EMPLOYER (EMPLOYER REQUIREMENT TRACEABILITY MATRIX)
**Dự án:** JOBNEST  
**Phạm vi:** Luồng Nhà tuyển dụng (WF-E01 đến WF-E12)  
**Ngày lập:** 04/11/2026  

---

## 1. BẢNG MAPPING CHI TIẾT 12 MÀN HÌNH

| Wireframe ID | Tên màn hình | SRS / Business Rules | Use Case ID | API Endpoint liên quan | Frontend Component đảm nhiệm | Phân loại trạng thái |
|:---|:---|:---|:---|:---|:---|:---:|
| **WF-E01** | Employer Dashboard | BR-01: Tổng quan chỉ số tuyển dụng, tổng hợp số liệu thực tế | UC-04, UC-06, UC-07 | `GET /api/jobs/my-jobs`<br>`GET /api/proposals/employer-proposals`<br>`GET /api/assignments/employer-assignments` | `EmployerDashboardPage.jsx` | Correct |
| **WF-E02** | Personal Profile | BR-02: Quản lý hồ sơ cá nhân người tuyển dụng, chặn sửa email/phone trực tiếp | UC-03 (Quản lý hồ sơ) | `GET /api/profile/me`<br>`PUT /api/profile/me` | `EmployerPersonalProfilePage.jsx` | Redesign (Tách từ E02/E03) |
| **WF-E03** | Verification Center | BR-03: Xác thực tài khoản đa lớp (Email OTP + Phone OTP), bắt buộc trước khi đăng job | UC-01, UC-02 | `POST /api/auth/send-otp`<br>`POST /api/auth/verify-otp`<br>`GET /api/profile/me` | `EmployerVerificationCenterPage.jsx` | Redesign (Tách thành màn riêng) |
| **WF-E04** | Job List | BR-04: Quản lý vòng đời tin tuyển dụng, hiển thị lý do kiểm duyệt nếu bị từ chối | UC-04, UC-05, UC-08 | `GET /api/jobs/my-jobs`<br>`PATCH /api/jobs/:id/status` | `EmployerJobsPage.jsx` | Partially Implemented -> Refactored |
| **WF-E05** | Create / Edit Job | BR-05: Form động theo loại công việc (PT, Seasonal, Freelance), validate deadline tương lai | UC-04 (Đăng tin tuyển dụng) | `POST /api/jobs`<br>`PUT /api/jobs/:id` | `EmployerCreateJobPage.jsx` | Refactored (Dynamic 3 types) |
| **WF-E06** | Applicant Management | BR-06: Sàng lọc hồ sơ ứng viên Part-time/Seasonal, KHÔNG chấp thuận trực tiếp tại chỗ | UC-06 (Sàng lọc ứng viên) | `GET /api/applications/job/:jobId`<br>`PATCH /api/applications/:id/status` | `EmployerApplicantsPage.jsx` | Refactored (Xóa nút Accept) |
| **WF-E07** | Proposal Management | BR-07: Sàng lọc đề xuất Freelance, KHÔNG chấp thuận trực tiếp tại chỗ | UC-07 (Đề xuất dự án) | `GET /api/proposals/job/:jobId`<br>`PATCH /api/proposals/:id/status` | `EmployerProposalsPage.jsx` | Refactored (Xóa nút Accept) |
| **WF-E08** | Candidate Selection | **Quy tắc A3**: Tuyến duy nhất chấp thuận ứng viên, sinh Work Assignment, tự động từ chối số còn lại | UC-06, UC-07, Rule A3 | `POST /api/jobs/:jobId/selections` | `EmployerCandidateSelectionPage.jsx` | Newly Implemented (Màn hình riêng) |
| **WF-E09** | Assignment Management | BR-08: Theo dõi tiến độ hợp đồng công việc theo từng Student riêng biệt | UC-08 (Quản lý tiến độ) | `GET /api/assignments/employer-assignments`<br>`PATCH /api/assignments/:id/status` | `EmployerAssignmentsPage.jsx` | Refactored |
| **WF-E10** | Deliverable Review | BR-09: Nghiệm thu sản phẩm nhiều phiên bản. Accept/Request Revision không tự ý đóng Assignment | UC-08 (Nghiệm thu sản phẩm) | `GET /api/assignments/:id/deliverables`<br>`POST /api/assignments/:id/deliverables/review` | `EmployerDeliverableReviewPage.jsx` | Refactored |
| **WF-E11** | Review Student | BR-10: Đánh giá sau công việc (1-5 sao, nhận xét), chỉ áp dụng cho việc đã COMPLETED | UC-09 (Đánh giá sau việc) | `POST /api/reviews`<br>`GET /api/assignments/employer-assignments` | `EmployerReviewStudentPage.jsx` | Refactored |
| **WF-E12** | Notifications | BR-11: Nhận và xử lý thông báo tuyển dụng, điều hướng trực tiếp đến đúng đối tượng | UC-10 (Thông báo hệ thống) | `GET /api/notifications`<br>`PATCH /api/notifications/:id/read`<br>`PATCH /api/notifications/read-all` | `EmployerNotificationsPage.jsx` | Refactored (Điều hướng thực tế) |

---

## 2. QUY TẮC NGHIỆP VỤ ĐẶC THÙ ĐƯỢC BẢO ĐẢM
1. **Rule A3 (Single Entry Selection):** Chỉ `WF-E08` gọi `POST /jobs/:jobId/selections` mới được chuyển trạng thái `ACCEPTED` và sinh `work_assignments`.
2. **Rule V1 (Pre-condition Posting):** Tài khoản Employer phải hoàn thành cả Email OTP và Phone OTP (trạng thái `VERIFIED`) mới được phép bấm `Gửi duyệt` ở form `WF-E05`.
3. **Rule D1 (Deliverable Lifecycle):** Hành động duyệt bàn giao ở `WF-E10` chỉ cập nhật trạng thái của bản nộp (v1, v2). Trạng thái Assignment vẫn duy trì `IN_PROGRESS` cho đến khi NTD chính thức xác nhận hoàn thành.

