<!-- converted from Tài liệu API Contract.docx -->

# Tài liệu API Contract
Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên · Chuyên đề tốt nghiệp 2 – Công nghệ phần mềm · PBI 4 (Task 4.1, 4.2) · Sprint 1 · Phiên bản 1.0 (bản nháp)
## 1. Tổng quan và quy ước chung
Tài liệu gồm hai phần việc của PBI 4: Task 4.1 lên danh sách các REST API cần thiết cho hệ thống (mục 2) và Task 4.2 đặc tả từng API gồm Endpoint, Method, Request, Response (mục 3 và 4). Mục 5 là bảng mã lỗi, mục 6 là các thông tin còn thiếu cần xác nhận. Bản máy đọc được (Swagger/OpenAPI) là file api-contract.yaml đi kèm, nội dung hai bản khớp nhau.
| Hạng mục | Quy ước |
| --- | --- |
| Base URL | /api/v1 |
| Định dạng dữ liệu | JSON UTF-8, tên trường camelCase |
| Thời gian | ISO-8601 UTC (2026-11-03T08:00:00Z); ngày dùng YYYY-MM-DD |
| Tiền tệ | VND, số nguyên |
| Khóa chính | Số nguyên (int64) |
| Xác thực | Header Authorization: Bearer <accessToken> (JWT). Access token 30 phút, refresh token 7 ngày |
| Phân trang | Query page (từ 0), size (mặc định 10, tối đa 50), sort (field,asc hoặc field,desc) |
| Response phân trang | content (mảng), page, size, totalElements, totalPages |
| Vai trò | PUBLIC (không cần token), STUDENT, EMPLOYER, ADMIN |
Quy ước lỗi chung. Mọi lỗi trả về cùng một cấu trúc gồm timestamp, status, code, message, path và mảng errors (chỉ có khi code là VALIDATION_ERROR, mỗi phần tử gồm field và message). Trong mục 4, phần Lỗi chỉ ghi các lỗi nghiệp vụ riêng của từng API. Ngoài ra luôn có thể gặp: 400 VALIDATION_ERROR khi dữ liệu gửi lên sai, 401 UNAUTHORIZED khi thiếu hoặc hết hạn token, 403 FORBIDDEN khi sai vai trò hoặc không phải chủ tài nguyên, 404 NOT_FOUND khi không tìm thấy tài nguyên.
Vòng đời trạng thái của Job (tin tuyển dụng)
| Từ | Sang | Ai thực hiện | Ghi chú |
| --- | --- | --- | --- |
| (tạo mới) | OPEN | Nhà tuyển dụng | Đang tuyển |
| OPEN | FILLED | Nhà tuyển dụng hoặc hệ thống | Hệ thống tự chuyển khi số ứng viên được duyệt đạt số lượng cần tuyển |
| FILLED | OPEN | Nhà tuyển dụng | Mở lại để tuyển thêm |
| FILLED | COMPLETED | Nhà tuyển dụng | Hoàn thành công việc, mở quyền đánh giá |
| OPEN hoặc FILLED | CANCELLED | Nhà tuyển dụng | Hủy tin |
Khi Job chuyển sang COMPLETED hoặc CANCELLED, các đơn còn PENDING tự động chuyển sang REJECTED và sinh viên nhận thông báo.
Vòng đời trạng thái của Application (đơn ứng tuyển): PENDING → ACCEPTED hoặc REJECTED (do nhà tuyển dụng); PENDING → WITHDRAWN (do sinh viên rút đơn).
## 2. Task 4.1 – Danh sách API
Tổng cộng 38 API, chia thành 8 nhóm.
| # | Nhóm | Method | Endpoint | Chức năng | Quyền |
| --- | --- | --- | --- | --- | --- |
| 1 | Auth | POST | /auth/register | Đăng ký tài khoản | PUBLIC |
| 2 | Auth | POST | /auth/login | Đăng nhập | PUBLIC |
| 3 | Auth | POST | /auth/refresh | Làm mới access token | PUBLIC |
| 4 | Auth | POST | /auth/logout | Đăng xuất | Đã đăng nhập |
| 5 | Auth | POST | /auth/change-password | Đổi mật khẩu | Đã đăng nhập |
| 6 | Profile | GET | /users/me | Lấy tài khoản và hồ sơ đang đăng nhập | Đã đăng nhập |
| 7 | Profile | PUT | /students/me/profile | Cập nhật hồ sơ sinh viên | STUDENT |
| 8 | Profile | POST | /students/me/cv | Tải lên CV | STUDENT |
| 9 | Profile | GET | /students/{userId} | Xem hồ sơ sinh viên | Chính chủ, ADMIN, EMPLOYER đã nhận đơn của sinh viên |
| 10 | Profile | PUT | /employers/me/profile | Cập nhật hồ sơ nhà tuyển dụng | EMPLOYER |
| 11 | Profile | GET | /employers/{userId} | Xem hồ sơ nhà tuyển dụng | Đã đăng nhập |
| 12 | Category | GET | /categories | Danh sách ngành nghề | PUBLIC |
| 13 | Job | GET | /jobs | Tìm kiếm, lọc tin tuyển dụng | PUBLIC |
| 14 | Job | POST | /jobs | Đăng tin tuyển dụng | EMPLOYER |
| 15 | Job | GET | /jobs/{jobId} | Xem chi tiết tin | PUBLIC |
| 16 | Job | PUT | /jobs/{jobId} | Sửa tin | EMPLOYER (chủ tin) |
| 17 | Job | PATCH | /jobs/{jobId}/status | Đổi trạng thái tin | EMPLOYER (chủ tin) |
| 18 | Job | GET | /employers/me/jobs | Danh sách tin của tôi | EMPLOYER |
| 19 | Application | POST | /jobs/{jobId}/applications | Ứng tuyển vào tin | STUDENT |
| 20 | Application | GET | /jobs/{jobId}/applications | Danh sách ứng viên của một tin | EMPLOYER (chủ tin), ADMIN |
| 21 | Application | GET | /students/me/applications | Danh sách đơn ứng tuyển của tôi | STUDENT |
| 22 | Application | GET | /applications/{applicationId} | Xem chi tiết đơn ứng tuyển | Sinh viên nộp đơn, EMPLOYER chủ tin, ADMIN |
| 23 | Application | PATCH | /applications/{applicationId}/status | Duyệt hoặc từ chối đơn | EMPLOYER (chủ tin) |
| 24 | Application | POST | /applications/{applicationId}/withdraw | Rút đơn ứng tuyển | STUDENT (người nộp) |
| 25 | Review | POST | /jobs/{jobId}/reviews | Đánh giá sau khi hoàn thành | EMPLOYER hoặc STUDENT thuộc job |
| 26 | Review | GET | /jobs/{jobId}/reviews | Các đánh giá của một công việc | Người thuộc job, ADMIN |
| 27 | Review | GET | /users/{userId}/reviews | Các đánh giá một người đã nhận | Đã đăng nhập |
| 28 | Notification | GET | /notifications | Danh sách thông báo của tôi | Đã đăng nhập |
| 29 | Notification | GET | /notifications/unread-count | Số thông báo chưa đọc | Đã đăng nhập |
| 30 | Notification | PATCH | /notifications/{notificationId}/read | Đánh dấu một thông báo đã đọc | Chủ thông báo |
| 31 | Notification | PATCH | /notifications/read-all | Đánh dấu tất cả đã đọc | Đã đăng nhập |
| 32 | Admin | GET | /admin/users | Danh sách người dùng | ADMIN |
| 33 | Admin | PATCH | /admin/users/{userId}/status | Khóa hoặc mở khóa tài khoản | ADMIN |
| 34 | Admin | GET | /admin/jobs | Danh sách mọi tin (kể cả tin bị ẩn) | ADMIN |
| 35 | Admin | PATCH | /admin/jobs/{jobId}/visibility | Ẩn hoặc hiện tin | ADMIN |
| 36 | Admin | POST | /admin/categories | Thêm ngành nghề | ADMIN |
| 37 | Admin | PUT | /admin/categories/{categoryId} | Sửa ngành nghề | ADMIN |
| 38 | Admin | DELETE | /admin/categories/{categoryId} | Xóa ngành nghề | ADMIN |
## 3. Mô hình dữ liệu dùng chung (response)
Các đối tượng dưới đây được tái sử dụng trong phần đặc tả ở mục 4. Dấu ? sau tên trường nghĩa là trường có thể vắng mặt hoặc null.
| Đối tượng | Các trường |
| --- | --- |
| UserSummary | id (int), email (string), fullName (string), role (STUDENT / EMPLOYER / ADMIN), status (ACTIVE / LOCKED), createdAt (datetime) |
| AuthResponse | accessToken (string), refreshToken (string), tokenType (luôn là Bearer), expiresIn (int, giây, ví dụ 1800), user (UserSummary) |
| StudentProfile | userId (int), fullName, phone, university, major (string), yearOfStudy? (int, 1–8), bio? (string), skills (mảng string), email? (chỉ trả về khi người xem có quyền), cvUrl? (string), ratingAverage (số 0–5), ratingCount (int) |
| EmployerProfile | userId (int), displayName (string), employerType (COMPANY / INDIVIDUAL), description?, address?, city?, website? (string), phone (string), ratingAverage (số 0–5), ratingCount (int) |
| Category | id (int), name (string), description? (string) |
| JobSummary | id (int), title (string), category (Category), city (string), salaryMin và salaryMax (int, VND), salaryUnit (SalaryUnit), startDate và endDate (date), vacancies (int, số cần tuyển), acceptedCount (int, số đã duyệt), status (OPEN / FILLED / COMPLETED / CANCELLED), employer (userId, displayName, ratingAverage, ratingCount), createdAt (datetime) |
| JobDetail | Toàn bộ JobSummary và thêm: description (string), requirements? (string), address (string), workSchedule? (string), applicationDeadline? (date), hidden (boolean, có bị Admin ẩn hay không), applicationCount? (int, chỉ chủ tin và Admin thấy), hasApplied? (boolean, chỉ có khi gọi bằng token STUDENT), updatedAt (datetime) |
| Application | id (int), jobId (int), status (PENDING / ACCEPTED / REJECTED / WITHDRAWN), coverLetter (string), cvUrl? (CV tại thời điểm nộp đơn), note? (ghi chú của nhà tuyển dụng), appliedAt và updatedAt (datetime), applicant? (userId, fullName, university, major, ratingAverage, ratingCount; có ở góc nhìn nhà tuyển dụng), job? (JobSummary; có ở góc nhìn sinh viên) |
| Review | id (int), jobId (int), jobTitle (string), reviewer (UserSummary), reviewee (UserSummary), rating (int, 1–5), comment? (string), createdAt (datetime) |
| Notification | id (int), type (NotificationType), title (string), message (string), refType? (JOB / APPLICATION / REVIEW), refId? (int), read (boolean), createdAt (datetime) |
| Page<T> | content (mảng T), page (int, từ 0), size (int), totalElements (int), totalPages (int) |
Các enum:
- SalaryUnit: PER_HOUR (VND/giờ), PER_DAY (VND/ngày), PER_MONTH (VND/tháng), PER_JOB (VND/công việc).
- NotificationType: APPLICATION_RECEIVED, APPLICATION_ACCEPTED, APPLICATION_REJECTED, APPLICATION_WITHDRAWN, JOB_COMPLETED, JOB_CANCELLED, JOB_HIDDEN, REVIEW_RECEIVED.
## 4. Task 4.2 – Đặc tả chi tiết từng API
### 4.1 Nhóm Auth
API 1 – POST /auth/register – Đăng ký tài khoản
Quyền: PUBLIC. Chỉ đăng ký được vai trò STUDENT hoặc EMPLOYER (tài khoản ADMIN do hệ thống tạo sẵn).
Request body (JSON)
| Trường | Kiểu | Bắt buộc | Ràng buộc / mô tả |
| --- | --- | --- | --- |
| email | string | Có | Email hợp lệ, tối đa 150 ký tự, không trùng |
| password | string | Có | 8–64 ký tự, gồm chữ và số |
| fullName | string | Có | 2–100 ký tự (họ tên sinh viên hoặc tên hiển thị nhà tuyển dụng) |
| phone | string | Không | Số điện thoại Việt Nam, dạng 0xxxxxxxxx hoặc +84xxxxxxxxx |
| role | enum | Có | STUDENT hoặc EMPLOYER |
Response: 201 – AuthResponse (đăng ký xong tự đăng nhập).
Lỗi: 409 EMAIL_ALREADY_EXISTS – email đã được đăng ký.
API 2 – POST /auth/login – Đăng nhập
Quyền: PUBLIC.
Request body (JSON): email (string, bắt buộc), password (string, bắt buộc).
Response: 200 – AuthResponse.
Lỗi: 401 INVALID_CREDENTIALS – sai email hoặc mật khẩu; 403 ACCOUNT_LOCKED – tài khoản bị khóa.
API 3 – POST /auth/refresh – Làm mới access token
Quyền: PUBLIC.
Request body (JSON): refreshToken (string, bắt buộc).
Response: 200 – AuthResponse mới; refresh token cũ bị vô hiệu.
Lỗi: 401 UNAUTHORIZED – refresh token hết hạn hoặc không hợp lệ.
API 4 – POST /auth/logout – Đăng xuất
Quyền: đã đăng nhập.
Request body (JSON): refreshToken (string, bắt buộc) – token cần vô hiệu hóa.
Response: 204 – không có nội dung.
API 5 – POST /auth/change-password – Đổi mật khẩu
Quyền: đã đăng nhập.
Request body (JSON): currentPassword (string, bắt buộc), newPassword (string, bắt buộc, 8–64 ký tự).
Response: 204 – không có nội dung.
Lỗi: 400 VALIDATION_ERROR khi mật khẩu hiện tại sai hoặc mật khẩu mới không hợp lệ.
### 4.2 Nhóm Profile
API 6 – GET /users/me – Lấy tài khoản và hồ sơ đang đăng nhập
Quyền: đã đăng nhập.
Request: không có body.
Response: 200 – UserSummary kèm studentProfile? (khi role là STUDENT) hoặc employerProfile? (khi role là EMPLOYER).
API 7 – PUT /students/me/profile – Cập nhật hồ sơ sinh viên
Quyền: STUDENT. Ghi đè toàn bộ các trường hồ sơ (CV cập nhật riêng ở API 8).
Request body (JSON)
| Trường | Kiểu | Bắt buộc | Ràng buộc / mô tả |
| --- | --- | --- | --- |
| fullName | string | Có | 2–100 ký tự |
| phone | string | Có | Số điện thoại Việt Nam |
| university | string | Có | Tối đa 150 ký tự |
| major | string | Có | Ngành học, tối đa 150 ký tự |
| yearOfStudy | int | Không | Năm học, từ 1 đến 8 |
| bio | string | Không | Giới thiệu bản thân, tối đa 2000 ký tự |
| skills | mảng string | Không | Tối đa 20 phần tử, mỗi phần tử tối đa 50 ký tự |
Response: 200 – StudentProfile.
API 8 – POST /students/me/cv – Tải lên CV
Quyền: STUDENT.
Request: multipart/form-data, trường file (binary, bắt buộc), định dạng PDF, DOC hoặc DOCX, tối đa 5 MB. CV mới thay thế CV cũ trong hồ sơ.
Response: 200 – cvUrl (string), fileName (string), size (int, đơn vị byte).
Lỗi: 400 VALIDATION_ERROR khi sai định dạng hoặc quá dung lượng.
API 9 – GET /students/{userId} – Xem hồ sơ sinh viên
Quyền: chính chủ, ADMIN, hoặc EMPLOYER đã nhận đơn ứng tuyển của sinh viên này.
Request: path userId; không có body.
Response: 200 – StudentProfile. email và phone chỉ trả về khi người xem là chính chủ, Admin hoặc nhà tuyển dụng đã duyệt (ACCEPTED) đơn của sinh viên.
API 10 – PUT /employers/me/profile – Cập nhật hồ sơ nhà tuyển dụng
Quyền: EMPLOYER. Ghi đè toàn bộ các trường hồ sơ.
Request body (JSON)
| Trường | Kiểu | Bắt buộc | Ràng buộc / mô tả |
| --- | --- | --- | --- |
| displayName | string | Có | Tên hiển thị, 2–150 ký tự |
| employerType | enum | Có | COMPANY (doanh nghiệp, cửa hàng) hoặc INDIVIDUAL (cá nhân) |
| description | string | Không | Tối đa 2000 ký tự |
| address | string | Không | Tối đa 255 ký tự |
| city | string | Không | Tối đa 100 ký tự |
| phone | string | Có | Số điện thoại Việt Nam |
| website | string | Không | URL hợp lệ, tối đa 255 ký tự |
Response: 200 – EmployerProfile.
API 11 – GET /employers/{userId} – Xem hồ sơ nhà tuyển dụng
Quyền: đã đăng nhập. Sinh viên dùng để xem thông tin và điểm đánh giá của nhà tuyển dụng trước khi ứng tuyển.
Request: path userId; không có body.
Response: 200 – EmployerProfile.
### 4.3 Nhóm Category
API 12 – GET /categories – Danh sách ngành nghề
Quyền: PUBLIC. Dùng cho bộ lọc tìm kiếm và form đăng tin.
Request: không có body, không phân trang.
Response: 200 – mảng Category.
### 4.4 Nhóm Job
API 13 – GET /jobs – Tìm kiếm, lọc tin tuyển dụng
Quyền: PUBLIC. Chỉ trả về tin OPEN và không bị Admin ẩn. Các tham số lọc đều không bắt buộc và kết hợp theo phép AND.
Query parameters
| Tham số | Kiểu | Mô tả |
| --- | --- | --- |
| keyword | string | Từ khóa tìm trong tiêu đề và mô tả |
| categoryId | int | Lọc theo ngành nghề |
| city | string | Lọc theo tỉnh/thành (khớp chính xác, không phân biệt hoa thường) |
| salaryMin | int | Mức lương tối thiểu mong muốn (VND) |
| salaryMax | int | Mức lương tối đa mong muốn (VND) |
| salaryUnit | enum | Đơn vị lương; nên truyền kèm khi lọc theo lương để so sánh cùng đơn vị |
| page, size | int | Phân trang (xem mục 1) |
| sort | string | Cho phép createdAt, salaryMax, startDate; mặc định createdAt,desc |
Lọc theo lương: trả về các tin có khoảng lương giao với khoảng lương cần lọc.
Response: 200 – Page<JobSummary>.
API 14 – POST /jobs – Đăng tin tuyển dụng
Quyền: EMPLOYER. Tin mới có trạng thái OPEN.
Request body (JSON)
| Trường | Kiểu | Bắt buộc | Ràng buộc / mô tả |
| --- | --- | --- | --- |
| title | string | Có | 5–150 ký tự |
| description | string | Có | Mô tả công việc, tối đa 5000 ký tự |
| requirements | string | Không | Yêu cầu với ứng viên, tối đa 2000 ký tự |
| categoryId | int | Có | Mã ngành nghề (lấy từ API 12) |
| address | string | Có | Địa chỉ làm việc, tối đa 255 ký tự |
| city | string | Có | Tỉnh/thành, tối đa 100 ký tự |
| salaryMin | int | Có | ≥ 0 và ≤ salaryMax (VND) |
| salaryMax | int | Có | ≥ 0 (VND) |
| salaryUnit | enum | Có | PER_HOUR, PER_DAY, PER_MONTH hoặc PER_JOB |
| startDate | date | Có | Ngày bắt đầu, không ở quá khứ |
| endDate | date | Có | Ngày kết thúc dự kiến, ≥ startDate |
| workSchedule | string | Không | Khung giờ làm việc, tối đa 255 ký tự (ví dụ Thứ 2 – Thứ 6, 18:00 – 22:00) |
| vacancies | int | Có | Số lượng cần tuyển, từ 1 đến 100 |
| applicationDeadline | date | Không | Hạn nhận hồ sơ, ≤ endDate |
Response: 201 – JobDetail.
API 15 – GET /jobs/{jobId} – Xem chi tiết tin
Quyền: PUBLIC. Tin OPEN, FILLED, COMPLETED và không bị ẩn thì ai cũng xem được. Tin CANCELLED hoặc bị ẩn chỉ chủ tin và Admin xem được, người khác nhận 404.
Request: path jobId; không có body.
Response: 200 – JobDetail.
API 16 – PUT /jobs/{jobId} – Sửa tin
Quyền: EMPLOYER là chủ tin. Chỉ sửa được khi tin đang OPEN.
Request body (JSON): giống API 14.
Response: 200 – JobDetail.
Lỗi: 409 INVALID_STATE_TRANSITION – tin không còn ở trạng thái OPEN.
API 17 – PATCH /jobs/{jobId}/status – Đổi trạng thái tin
Quyền: EMPLOYER là chủ tin. Chỉ cho phép các chuyển trạng thái trong bảng vòng đời ở mục 1.
Request body (JSON)
| Trường | Kiểu | Bắt buộc | Ràng buộc / mô tả |
| --- | --- | --- | --- |
| status | enum | Có | OPEN, FILLED, COMPLETED hoặc CANCELLED |
| reason | string | Không | Tối đa 500 ký tự; nên có khi hủy tin, được gửi kèm thông báo cho ứng viên |
Response: 200 – JobDetail.
Lỗi: 409 INVALID_STATE_TRANSITION – chuyển trạng thái không hợp lệ.
Tác dụng kèm theo: khi chuyển sang COMPLETED hoặc CANCELLED, các đơn PENDING tự chuyển REJECTED; sinh viên liên quan nhận thông báo JOB_COMPLETED hoặc JOB_CANCELLED.
API 18 – GET /employers/me/jobs – Danh sách tin của tôi
Quyền: EMPLOYER. Trả về mọi tin của chính mình, kể cả tin CANCELLED.
Query parameters: status (enum, không bắt buộc), page, size, sort.
Response: 200 – Page<JobSummary>.
### 4.5 Nhóm Application
API 19 – POST /jobs/{jobId}/applications – Ứng tuyển vào tin
Quyền: STUDENT. Mỗi sinh viên chỉ ứng tuyển một lần cho mỗi tin (kể cả khi đã rút đơn hoặc bị từ chối).
Request body (JSON)
| Trường | Kiểu | Bắt buộc | Ràng buộc / mô tả |
| --- | --- | --- | --- |
| coverLetter | string | Có | Thư giới thiệu bản thân, 10–2000 ký tự |
| cvUrl | string | Không | Đường dẫn CV đã tải lên; bỏ trống thì dùng CV trong hồ sơ. Nếu cả hai đều không có thì trả 400 |
Response: 201 – Application (trạng thái PENDING).
Lỗi: 409 ALREADY_APPLIED – đã ứng tuyển tin này; 409 JOB_NOT_OPEN – tin không còn OPEN, đã quá hạn nhận hồ sơ hoặc bị Admin ẩn.
Tác dụng kèm theo: nhà tuyển dụng nhận thông báo APPLICATION_RECEIVED.
API 20 – GET /jobs/{jobId}/applications – Danh sách ứng viên của một tin
Quyền: EMPLOYER là chủ tin, hoặc ADMIN.
Query parameters: status (enum PENDING / ACCEPTED / REJECTED / WITHDRAWN, không bắt buộc), page, size, sort.
Response: 200 – Page<Application>, mỗi đơn có applicant.
API 21 – GET /students/me/applications – Danh sách đơn ứng tuyển của tôi
Quyền: STUDENT.
Query parameters: status (enum, không bắt buộc), page, size, sort.
Response: 200 – Page<Application>, mỗi đơn có job để hiển thị trạng thái ứng tuyển.
API 22 – GET /applications/{applicationId} – Xem chi tiết đơn ứng tuyển
Quyền: sinh viên nộp đơn, EMPLOYER là chủ tin, hoặc ADMIN.
Request: path applicationId; không có body.
Response: 200 – Application, có đủ applicant và job.
API 23 – PATCH /applications/{applicationId}/status – Duyệt hoặc từ chối đơn
Quyền: EMPLOYER là chủ tin. Chỉ xử lý được đơn đang PENDING. Duyệt (ACCEPTED) yêu cầu tin đang OPEN; khi số đơn ACCEPTED đạt vacancies, tin tự chuyển sang FILLED.
Request body (JSON)
| Trường | Kiểu | Bắt buộc | Ràng buộc / mô tả |
| --- | --- | --- | --- |
| status | enum | Có | ACCEPTED hoặc REJECTED |
| note | string | Không | Lời nhắn gửi sinh viên, tối đa 500 ký tự; nên có khi từ chối |
Response: 200 – Application.
Lỗi: 409 INVALID_STATE_TRANSITION – đơn không còn ở trạng thái PENDING; 409 JOB_NOT_OPEN – duyệt khi tin không còn OPEN.
Tác dụng kèm theo: sinh viên nhận thông báo APPLICATION_ACCEPTED hoặc APPLICATION_REJECTED.
API 24 – POST /applications/{applicationId}/withdraw – Rút đơn ứng tuyển
Quyền: STUDENT là người nộp đơn. Chỉ rút được khi đơn còn PENDING.
Request: path applicationId; không có body.
Response: 200 – Application (trạng thái WITHDRAWN).
Lỗi: 409 INVALID_STATE_TRANSITION – đơn không còn ở trạng thái PENDING.
Tác dụng kèm theo: nhà tuyển dụng nhận thông báo APPLICATION_WITHDRAWN.
### 4.6 Nhóm Review
API 25 – POST /jobs/{jobId}/reviews – Đánh giá sau khi hoàn thành công việc
Quyền: EMPLOYER hoặc STUDENT thuộc job; người đánh giá lấy từ token. EMPLOYER đánh giá sinh viên có đơn ACCEPTED của job; STUDENT (đã ACCEPTED) đánh giá nhà tuyển dụng của job. Job phải ở trạng thái COMPLETED.
Request body (JSON)
| Trường | Kiểu | Bắt buộc | Ràng buộc / mô tả |
| --- | --- | --- | --- |
| revieweeId | int | Có | Người được đánh giá; phải thuộc job và khác người đánh giá |
| rating | int | Có | Điểm từ 1 đến 5 |
| comment | string | Không | Nhận xét, tối đa 1000 ký tự |
Response: 201 – Review.
Lỗi: 409 REVIEW_NOT_ALLOWED – job chưa COMPLETED hoặc người đánh giá/người được đánh giá không thuộc job; 409 REVIEW_ALREADY_EXISTS – đã đánh giá cặp này rồi.
Tác dụng kèm theo: cập nhật ratingAverage và ratingCount của người được đánh giá; người đó nhận thông báo REVIEW_RECEIVED.
API 26 – GET /jobs/{jobId}/reviews – Các đánh giá của một công việc
Quyền: EMPLOYER là chủ tin, STUDENT đã ACCEPTED trong job, hoặc ADMIN. Giúp giao diện biết đã đánh giá ai và còn ai chưa được đánh giá.
Request: path jobId; không có body.
Response: 200 – mảng Review (không phân trang).
API 27 – GET /users/{userId}/reviews – Các đánh giá một người đã nhận
Quyền: đã đăng nhập. Dùng ở trang hồ sơ công khai của sinh viên và nhà tuyển dụng.
Query parameters: page, size.
Response: 200 – Page<Review>, mới nhất trước.
### 4.7 Nhóm Notification
API 28 – GET /notifications – Danh sách thông báo của tôi
Quyền: đã đăng nhập.
Query parameters: unreadOnly (boolean, mặc định false), page, size.
Response: 200 – Page<Notification>, mới nhất trước.
API 29 – GET /notifications/unread-count – Số thông báo chưa đọc
Quyền: đã đăng nhập. Frontend gọi định kỳ (ví dụ mỗi 30 giây) để hiển thị chấm đỏ trên biểu tượng chuông.
Response: 200 – count (int).
API 30 – PATCH /notifications/{notificationId}/read – Đánh dấu một thông báo đã đọc
Quyền: chủ của thông báo.
Request: path notificationId; không có body.
Response: 200 – Notification (read = true).
API 31 – PATCH /notifications/read-all – Đánh dấu tất cả đã đọc
Quyền: đã đăng nhập.
Request: không có body.
Response: 204 – không có nội dung.
### 4.8 Nhóm Admin
API 32 – GET /admin/users – Danh sách người dùng
Quyền: ADMIN.
Query parameters: role (enum, không bắt buộc), status (ACTIVE / LOCKED, không bắt buộc), keyword (tìm theo email hoặc họ tên), page, size, sort.
Response: 200 – Page<UserSummary>.
API 33 – PATCH /admin/users/{userId}/status – Khóa hoặc mở khóa tài khoản
Quyền: ADMIN. Không được khóa chính mình hoặc tài khoản ADMIN khác. Tài khoản LOCKED không đăng nhập được và token cũ bị từ chối.
Request body (JSON)
| Trường | Kiểu | Bắt buộc | Ràng buộc / mô tả |
| --- | --- | --- | --- |
| status | enum | Có | ACTIVE hoặc LOCKED |
| reason | string | Không | Lý do, tối đa 500 ký tự |
Response: 200 – UserSummary.
API 34 – GET /admin/jobs – Danh sách mọi tin tuyển dụng
Quyền: ADMIN. Gồm cả tin CANCELLED và tin đang bị ẩn.
Query parameters: status (enum, không bắt buộc), hidden (boolean, không bắt buộc), keyword, page, size, sort.
Response: 200 – Page<JobSummary>.
API 35 – PATCH /admin/jobs/{jobId}/visibility – Ẩn hoặc hiện tin
Quyền: ADMIN. Tin bị ẩn không xuất hiện ở API 13 và không nhận thêm đơn ứng tuyển.
Request body (JSON)
| Trường | Kiểu | Bắt buộc | Ràng buộc / mô tả |
| --- | --- | --- | --- |
| hidden | boolean | Có | true là ẩn, false là hiện lại |
| reason | string | Không | Lý do, tối đa 500 ký tự |
Response: 200 – JobDetail.
Tác dụng kèm theo: nhà tuyển dụng nhận thông báo JOB_HIDDEN kèm lý do.
API 36 – POST /admin/categories – Thêm ngành nghề
Quyền: ADMIN.
Request body (JSON)
| Trường | Kiểu | Bắt buộc | Ràng buộc / mô tả |
| --- | --- | --- | --- |
| name | string | Có | 2–100 ký tự, không trùng |
| description | string | Không | Tối đa 500 ký tự |
Response: 201 – Category.
Lỗi: 409 CATEGORY_ALREADY_EXISTS – tên ngành nghề đã tồn tại.
API 37 – PUT /admin/categories/{categoryId} – Sửa ngành nghề
Quyền: ADMIN.
Request body (JSON): giống API 36.
Response: 200 – Category.
Lỗi: 409 CATEGORY_ALREADY_EXISTS – tên ngành nghề đã tồn tại.
API 38 – DELETE /admin/categories/{categoryId} – Xóa ngành nghề
Quyền: ADMIN.
Request: path categoryId; không có body.
Response: 204 – không có nội dung.
Lỗi: 409 CATEGORY_IN_USE – ngành nghề đang được tin tuyển dụng sử dụng.
## 5. Bảng mã lỗi
| code | HTTP | Khi nào |
| --- | --- | --- |
| VALIDATION_ERROR | 400 | Dữ liệu đầu vào sai định dạng hoặc vi phạm ràng buộc (kèm mảng errors) |
| INVALID_CREDENTIALS | 401 | Sai email hoặc mật khẩu |
| UNAUTHORIZED | 401 | Thiếu token, token hết hạn hoặc không hợp lệ |
| ACCOUNT_LOCKED | 403 | Tài khoản bị khóa |
| FORBIDDEN | 403 | Không đủ quyền hoặc không phải chủ sở hữu tài nguyên |
| NOT_FOUND | 404 | Không tìm thấy tài nguyên |
| EMAIL_ALREADY_EXISTS | 409 | Email đã được đăng ký |
| ALREADY_APPLIED | 409 | Sinh viên đã ứng tuyển tin này |
| JOB_NOT_OPEN | 409 | Tin không còn OPEN, đã quá hạn nhận hồ sơ hoặc bị ẩn |
| INVALID_STATE_TRANSITION | 409 | Chuyển trạng thái không hợp lệ (tin hoặc đơn ứng tuyển) |
| REVIEW_NOT_ALLOWED | 409 | Job chưa COMPLETED hoặc hai bên không thuộc job |
| REVIEW_ALREADY_EXISTS | 409 | Đã đánh giá cặp này rồi |
| CATEGORY_ALREADY_EXISTS | 409 | Tên ngành nghề đã tồn tại |
| CATEGORY_IN_USE | 409 | Xóa ngành nghề đang được tin tuyển dụng sử dụng |
| INTERNAL_ERROR | 500 | Lỗi hệ thống không xác định |
## 6. Thông tin còn thiếu cần xác nhận
Đề tài chưa nêu rõ một số điểm nên bản nháp này dùng giả định tạm thời. Các điểm dưới đây cần nhóm hoặc GVHD xác nhận trước khi chốt contract; chốt xong thì có thể xóa mục này khỏi tài liệu.
| # | Vấn đề | Giả định hiện tại trong tài liệu | Cần xác nhận |
| --- | --- | --- | --- |
| 1 | Số người tuyển mỗi tin | Một tin tuyển được nhiều người (vacancies), tự chuyển FILLED khi duyệt đủ | Đúng ý nhóm, hay mỗi tin chỉ tuyển một người? |
| 2 | Ai xác nhận hoàn thành | Chỉ nhà tuyển dụng bấm hoàn thành | Sinh viên có cần xác nhận lại không? |
| 3 | Quy tắc đánh giá | Điểm 1–5 kèm nhận xét; chỉ khi COMPLETED; mỗi cặp đánh giá một lần; không sửa, không xóa | Có cho sửa/xóa đánh giá, hoặc cần thêm tiêu chí đánh giá riêng không? |
| 4 | Quyền của Quản trị viên | Khóa/mở khóa người dùng, ẩn/hiện tin vi phạm, quản lý ngành nghề; chưa có thống kê | Admin cần thêm chức năng nào (thống kê, duyệt tin trước khi hiển thị)? |
| 5 | Cách ghi mức lương | Khoảng salaryMin–salaryMax kèm đơn vị (giờ, ngày, tháng, công việc) | Có cần trường hợp lương thỏa thuận (không ghi số) không? |
| 6 | Địa điểm làm việc | city là chuỗi tự do (ví dụ TP. Hồ Chí Minh) | Dùng danh sách tỉnh/thành cố định, hay thêm quận/huyện? |
| 7 | CV và hồ sơ ứng tuyển | Tải file PDF/DOC/DOCX tối đa 5 MB, kèm thư giới thiệu | Chỉ cho dán link CV, hay cần thêm ảnh đại diện? |
| 8 | Tài khoản nâng cao | Chưa có quên mật khẩu, xác thực email, đăng nhập bằng Google | Đề tài có yêu cầu các chức năng này không? |
| 9 | Thông báo | Chỉ thông báo trong ứng dụng (frontend gọi định kỳ), không gửi email | Có cần gửi email thông báo không? |
| 10 | Ứng tuyển lại, rút đơn | Không được ứng tuyển lại sau khi rút hoặc bị từ chối; chỉ rút được khi đơn PENDING | Giữ nguyên hay thay đổi? |
| 11 | Danh sách ngành nghề ban đầu | Chưa có | Cung cấp danh sách ngành nghề cần tạo sẵn (ví dụ phục vụ, bán hàng, gia sư) |
| 12 | Khớp với ERD | Tên trường và kiểu ID (số nguyên) đang suy ra từ đề tài | Đối chiếu với ERD của nhóm (cùng Sprint 1); ID dùng số nguyên hay UUID? |
| 13 | Thời hạn token | Access token 30 phút, refresh token 7 ngày | Nhóm Backend có đồng ý không? |
| 14 | Định dạng nộp sản phẩm | Tài liệu này và file api-contract.yaml (Swagger) | GVHD nhận định dạng nào: Swagger, Postman hay Word? |
