# TÀI LIỆU ĐẶC TẢ CHI TIẾT API CONTRACT (RESTFUL API SPECIFICATION)
**Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên  
**Học phần:** Chuyên đề Tốt nghiệp 2 (Khoa CNTT — Trường Đại học Văn Lang)  
**Tài liệu phục vụ:** Buổi 5 — Thiết kế chi tiết (Mốc đánh giá giữa kỳ lần 1)  
**Host cục bộ:** `http://localhost:5000` | **Định dạng:** `application/json`

---

## 1. Danh mục 14 Tiêu chuẩn Đặc tả cho mỗi Endpoint

Mỗi API trong hệ thống được chuẩn hóa với đầy đủ 14 thông số kỹ thuật:
1. **Mã API:** Định danh chuẩn hóa.
2. **Tên nghiệp vụ:** Tên gọi chức năng.
3. **HTTP Method:** `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
4. **Endpoint:** Đường dẫn URL.
5. **Actor được phép gọi:** Sinh viên, Nhà tuyển dụng, Admin hoặc Public.
6. **Mục đích:** Giải quyết bài toán gì.
7. **Request Parameters / Body:** Tham số truyền vào.
8. **Quy tắc Validation:** Ràng buộc kiểm tra hợp lệ dữ liệu đầu vào.
9. **Response thành công:** Định dạng và mã trạng thái HTTP (200, 201).
10. **Các trường hợp lỗi & Mã HTTP:** 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Server Error.
11. **Điều kiện Xác thực / Phân quyền:** Token Bearer, Role checking middleware.
12. **Quy tắc nghiệp vụ (Business Rules):** Ràng buộc miền ứng dụng.
13. **Bảng CSDL sử dụng:** Bảng dữ liệu truy vấn/cập nhật.
14. **Use Case / FR liên quan:** Ánh xạ truy vết SRS.

---

## 2. Đặc tả Chi tiết từng Endpoint

---

### [API-01] Đăng ký tài khoản người dùng
1. **Mã API:** `API-01`
2. **Tên nghiệp vụ:** Đăng ký tài khoản Sinh viên hoặc Nhà tuyển dụng.
3. **HTTP Method:** `POST`
4. **Endpoint:** `/api/auth/register`
5. **Actor:** Người dùng mới (Khách)
6. **Mục đích:** Tạo tài khoản mới trên hệ sinh thái Marketplace.
7. **Request Body:**
   ```json
   {
     "email": "student@vlu.edu.vn",
     "password": "password123",
     "full_name": "Nguyễn Văn A",
     "phone": "0912345678",
     "role": "STUDENT" // hoặc "EMPLOYER"
   }
   ```
8. **Quy tắc Validation:**
   - `email`: Bắt buộc, đúng định dạng RFC 5322 regex.
   - `password`: Bắt buộc, độ dài $\ge 8$ ký tự (chính sách chung `MIN_PASSWORD_LENGTH = 8`, áp dụng cả khôi phục và đổi mật khẩu).
   - `full_name`: Bắt buộc, không được để trống.
   - `phone`: Bắt buộc, 8–20 ký tự số/`+()-`.
   - `role`: Bắt buộc, chỉ nhận `'STUDENT'` hoặc `'EMPLOYER'` (Admin không đăng ký qua public API).
9. **Response Thành công (201 Created):**
   ```json
   {
     "success": true,
     "message": "Đăng ký tài khoản thành công",
     "data": {
       "user": { "id": 6, "email": "student@vlu.edu.vn", "full_name": "Nguyễn Văn A", "role": "STUDENT" },
       "token": "eyJhbGciOi..."
     }
   }
   ```
10. **Các trường hợp lỗi & Mã HTTP:**
    - `400 Bad Request`: Thiếu trường bắt buộc, sai định dạng email, mật khẩu ngắn.
    - `409 Conflict`: Email đã tồn tại trong hệ thống.
11. **Điều kiện Xác thực:** Không yêu cầu (Public).
12. **Quy tắc nghiệp vụ:** Mật khẩu được mã hóa tự động bằng bcrypt trước khi lưu; tự động tạo một bản ghi rỗng trong bảng `profiles` cho người dùng.
13. **Bảng CSDL sử dụng:** `users`, `profiles`.
14. **Use Case / FR:** UC-01 | FR-01.

---

### [API-02] Đăng nhập hệ thống & Cấp phát Token
1. **Mã API:** `API-02`
2. **Tên nghiệp vụ:** Đăng nhập và xác thực danh tính.
3. **HTTP Method:** `POST`
4. **Endpoint:** `/api/auth/login`
5. **Actor:** Sinh viên, Nhà tuyển dụng, Quản trị viên
6. **Mục đích:** Cấp JWT Token để người dùng truy cập các tính năng được phân quyền.
7. **Request Body:**
   ```json
   {
     "email": "techcorp@gmail.com",
     "password": "password123"
   }
   ```
8. **Quy tắc Validation:** Email và password không được để trống.
9. **Response Thành công (200 OK):**
   ```json
   {
     "success": true,
     "message": "Đăng nhập thành công",
     "data": {
       "user": { "id": 2, "email": "techcorp@gmail.com", "role": "EMPLOYER", "full_name": "Công Ty Công Nghệ TechCorp" },
       "token": "eyJhbGciOi..."
     }
   }
   ```
10. **Các trường hợp lỗi & Mã HTTP:**
    - `400 Bad Request`: Thiếu email hoặc mật khẩu.
    - `401 Unauthorized`: Sai email hoặc sai mật khẩu.
    - `403 Forbidden`: Tài khoản đang ở trạng thái `BANNED`.
11. **Điều kiện Xác thực:** Không yêu cầu (Public).
12. **Quy tắc nghiệp vụ:** So khớp mật khẩu băm bcrypt; sinh JWT Token chứa `{id, email, role, full_name}` với hạn dùng 7 ngày.
13. **Bảng CSDL sử dụng:** `users`.
14. **Use Case / FR:** UC-02 | FR-01.

---

### [API-03] Lấy thông tin phiên làm việc hiện tại
1. **Mã API:** `API-03`
2. **Tên nghiệp vụ:** Xác thực phiên người dùng (Me).
3. **HTTP Method:** `GET`
4. **Endpoint:** `/api/auth/me`
5. **Actor:** Mọi người dùng đã đăng nhập
6. **Mục đích:** Frontend kiểm tra token còn hạn và lấy danh tính người dùng khi reload trang.
7. **Request:** Header `Authorization: Bearer <JWT_TOKEN>`.
8. **Quy tắc Validation:** Header phải đúng cú pháp `Bearer <token>`.
9. **Response Thành công (200 OK):** `{ "success": true, "data": { "id": 2, "email": "...", "role": "..." } }`.
10. **Các trường hợp lỗi & Mã HTTP:** `401 Unauthorized` (Thiếu token, sai token, token hết hạn, hoặc **token đã bị thu hồi** do đăng xuất / đặt lại mật khẩu); `403 Forbidden` (tài khoản bị khóa / tạm ngưng).
11. **Điều kiện Xác thực:** Middleware `verifyToken`.
12. **Quy tắc nghiệp vụ:** Giải mã JWT rồi đối chiếu `users.status` và `users.tokens_valid_after`: token có `iat` ≤ mốc thu hồi bị từ chối (áp dụng cho **mọi** API cần đăng nhập).
13. **Bảng CSDL sử dụng:** `users` (`status`, `tokens_valid_after`).
14. **Use Case / FR:** UC-02 | NFR-01.

---

### [API-04] Tìm kiếm và Lọc tin tuyển dụng part-time
1. **Mã API:** `API-04`
2. **Tên nghiệp vụ:** Tìm kiếm & Lọc danh sách việc làm.
3. **HTTP Method:** `GET`
4. **Endpoint:** `/api/jobs`
5. **Actor:** Sinh viên, Khách vãng lai
6. **Mục đích:** Hỗ trợ sinh viên tìm kiếm cơ hội việc làm theo nhu cầu.
7. **Request Query Parameters:**
   - `keyword` (string): Tìm trong tiêu đề, mô tả.
   - `category` (string): Ngành nghề.
   - `location` (string): Khu vực.
   - `minSalary`, `maxSalary` (number): Khoảng lương.
   - `workType` (string): `PART_TIME` hoặc `FULL_TIME`.
   - `page` (int, default 1), `limit` (int, default 20).
8. **Quy tắc Validation:** `minSalary`, `maxSalary` phải là số không âm nếu truyền vào, và `minSalary ≤ maxSalary`; giá trị sai (âm, không phải số) bị từ chối, **không bị bỏ qua âm thầm**.
9. **Response Thành công (200 OK):**
   ```json
   {
     "success": true,
     "data": [
       {
         "id": 1,
         "title": "Lập trình viên Frontend React.js Part-time",
         "company_name": "TechCorp Vietnam",
         "salary": "45000.00",
         "salary_type": "HOURLY",
         "location": "Quận 1, TP.HCM (Hỗ trợ Hybrid)",
         "status": "OPEN",
         "moderation_status": "APPROVED"
       }
     ]
   }
   ```
10. **Các trường hợp lỗi & Mã HTTP:** `400 Bad Request` ("Mức lương lọc không hợp lệ: phải là số không âm" / "Mức lương tối thiểu không được lớn hơn mức tối đa"); `500 Internal Server Error` (Lỗi truy vấn DB).
11. **Điều kiện Xác thực:** Public.
12. **Quy tắc nghiệp vụ:** Bắt buộc chỉ trả về các tin có `status = 'OPEN'` VÀ `moderation_status = 'APPROVED'`.
13. **Bảng CSDL sử dụng:** `jobs`, `users`, `profiles`.
14. **Use Case / FR:** UC-05 | FR-03.

---

### [API-05] Xem chi tiết một tin tuyển dụng
1. **Mã API:** `API-05`
2. **Tên nghiệp vụ:** Xem thông tin chi tiết việc làm.
3. **HTTP Method:** `GET`
4. **Endpoint:** `/api/jobs/:id`
5. **Actor:** Mọi người dùng
6. **Mục đích:** Cung cấp thông tin đầy đủ về yêu cầu, quyền lợi để sinh viên cân nhắc nộp đơn.
7. **Request Path Variable:** `:id` (Số nguyên dương).
8. **Quy tắc Validation:** `:id` phải là số nguyên hợp lệ.
9. **Response Thành công (200 OK):** Đầy đủ các trường: `title`, `description`, `requirements`, `salary`, `employer_name`, `company_name`, `company_address`.
10. **Các trường hợp lỗi & Mã HTTP:** `404 Not Found` (Tin không tồn tại, **hoặc chưa được duyệt / bị từ chối** khi người xem không phải Admin hay chủ tin).
11. **Điều kiện Xác thực:** Public (nếu gửi kèm token của Admin hoặc chủ tin thì xem được cả tin chưa duyệt).
12. **Quy tắc nghiệp vụ:** Truy vấn kèm hồ sơ doanh nghiệp tạo tin; tin chưa `APPROVED` không công khai.
13. **Bảng CSDL sử dụng:** `jobs`, `users`, `profiles`.
14. **Use Case / FR:** UC-05 / UC-06 | FR-02.

---

### [API-06] Nhà tuyển dụng đăng tin việc làm mới
1. **Mã API:** `API-06`
2. **Tên nghiệp vụ:** Tạo tin tuyển dụng.
3. **HTTP Method:** `POST`
4. **Endpoint:** `/api/jobs`
5. **Actor:** Nhà tuyển dụng (`EMPLOYER`)
6. **Mục đích:** Đăng tin tìm kiếm nhân sự part-time/freelance.
7. **Request Body:**
   ```json
   {
     "title": "Nhân viên Phục vụ ca tối",
     "description": "Tiếp đón khách hàng và hỗ trợ order đồ uống...",
     "requirements": "Nhanh nhẹn, trung thực...",
     "category": "Dịch vụ & F&B",
     "location": "Bình Thạnh, TP.HCM",
     "salary_type": "HOURLY",
     "salary": 30000,
     "work_type": "PART_TIME",
     "application_deadline": "2026-12-31"
   }
   ```
8. **Quy tắc Validation:**
   - `title`: Bắt buộc $\ge 5$ ký tự.
   - `description`: Bắt buộc $\ge 10$ ký tự.
   - `salary`: Bắt buộc là số dương $> 0$.
   - `category`, `location`: Bắt buộc.
   - `application_deadline`: **Bắt buộc khi tạo tin**, phải là ngày trong tương lai. Khi sửa tin (`PUT /api/jobs/:id`) có thể bỏ trống = giữ hạn cũ.
   - `salary_type`: Chỉ nhận `'HOURLY'`, `'FIXED'`, `'MONTHLY'` (Part-time chỉ dùng trả theo giờ hoặc theo tháng).
   - `work_type`: Chỉ nhận `'PART_TIME'`, `'FULL_TIME'`.
9. **Response Thành công (201 Created):** `{ "success": true, "message": "Đăng tin tuyển dụng thành công", "data": { "id": 4, "status": "OPEN", "moderation_status": "PENDING", ... } }`.
10. **Các trường hợp lỗi & Mã HTTP:**
    - `400 Bad Request`: Sai dữ liệu nhập liệu.
    - `401 Unauthorized`: Chưa đăng nhập.
    - `403 Forbidden`: Tài khoản không phải vai trò `EMPLOYER`.
11. **Điều kiện Xác thực:** `verifyToken` & `requireRoles('EMPLOYER')`.
12. **Quy tắc nghiệp vụ:** Gắn tự động `employer_id = req.user.id`; trạng thái khởi tạo: `status = 'OPEN'`, `moderation_status = 'PENDING'` — **tin chỉ hiển thị công khai sau khi Admin duyệt**. Mỗi lần sửa tin, tin quay lại `PENDING` chờ duyệt lại.
13. **Bảng CSDL sử dụng:** `jobs`.
14. **Use Case / FR:** UC-04 | FR-02.

---

### [API-07] Cập nhật trạng thái công việc
1. **Mã API:** `API-07`
2. **Tên nghiệp vụ:** Chuyển trạng thái tin tuyển dụng.
3. **HTTP Method:** `PATCH`
4. **Endpoint:** `/api/jobs/:id/status`
5. **Actor:** Nhà tuyển dụng sở hữu tin
6. **Mục đích:** Khóa nhận hồ sơ, đánh dấu hoàn thành hoặc hủy tin.
7. **Request Body:** `{ "status": "FILLED" }` (hoặc `"COMPLETED"`, `"CLOSED"`).
8. **Quy tắc Validation:** `status` phải nằm trong tập `['OPEN', 'FILLED', 'COMPLETED', 'CLOSED']`.
9. **Response Thành công (200 OK):** `{ "success": true, "message": "Cập nhật trạng thái thành công", "data": { ... } }`.
10. **Các trường hợp lỗi & Mã HTTP:**
    - `400 Bad Request`: Tin đã `COMPLETED` cố tình chuyển lại `OPEN`; hoặc chuyển thẳng `OPEN` $\rightarrow$ `COMPLETED`.
    - `403 Forbidden`: Người gọi không phải chủ sở hữu của tin tuyển dụng.
    - `404 Not Found`: Không tìm thấy tin.
11. **Điều kiện Xác thực:** `verifyToken` & `requireRoles('EMPLOYER')`.
12. **Quy tắc nghiệp vụ:** Kiểm tra `job.employer_id === req.user.id`; luồng chỉ tiến: `OPEN` $\rightarrow$ `FILLED` $\rightarrow$ `COMPLETED` (cấm `OPEN` $\rightarrow$ `COMPLETED` và `COMPLETED` $\rightarrow$ `OPEN`). `FILLED` được hệ thống tự đặt khi chọn đủ người (`POST /api/jobs/:jobId/selections`), `COMPLETED` tự đặt khi mọi hợp đồng của tin hoàn thành.
13. **Bảng CSDL sử dụng:** `jobs`.
14. **Use Case / FR:** UC-08 | FR-06.

---

### [API-08] Sinh viên nộp đơn ứng tuyển việc làm
1. **Mã API:** `API-08`
2. **Tên nghiệp vụ:** Ứng tuyển việc làm part-time.
3. **HTTP Method:** `POST`
4. **Endpoint:** `/api/applications`
5. **Actor:** Sinh viên (`STUDENT`)
6. **Mục đích:** Nộp hồ sơ xin việc kèm thư giới thiệu và CV.
7. **Request Body:**
   ```json
   {
     "job_id": 1,
     "cover_letter": "Em là sinh viên Kỹ thuật phần mềm Văn Lang...",
     "cv_url": "https://cv.example.com/nguyen-van-chi.pdf"
   }
   ```
8. **Quy tắc Validation:** `job_id` bắt buộc là số; `cover_letter` tối đa 2000 ký tự; **phải có ít nhất CV (`cv_url` thuộc chính sinh viên) hoặc lời giới thiệu** (FR-04) — thiếu cả hai trả `400`.
9. **Response Thành công (201 Created):** `{ "success": true, "message": "Nộp hồ sơ ứng tuyển thành công", "data": { "id": 2, "status": "PENDING", ... } }`.
10. **Các trường hợp lỗi & Mã HTTP:**
    - `400 Bad Request`: Tin việc làm đã đóng (`status != 'OPEN'`) hoặc chưa được duyệt (`moderation_status != 'APPROVED'`); hoặc NTD cố tình nộp đơn vào tin của chính mình.
    - `403 Forbidden`: Người dùng không có vai trò `STUDENT`.
    - `404 Not Found`: `job_id` không tồn tại.
    - `409 Conflict`: Sinh viên đã nộp đơn vào công việc này trước đó (Trùng đơn).
11. **Điều kiện Xác thực:** `verifyToken` & `requireRoles('STUDENT')`.
12. **Quy tắc nghiệp vụ:** Kiểm tra ràng buộc duy nhất `UNIQUE(job_id, student_id)`; trạng thái đơn khởi tạo là `'PENDING'`.
13. **Bảng CSDL sử dụng:** `applications`, `jobs`.
14. **Use Case / FR:** UC-06 | FR-04.

---

### [API-09] Nhà tuyển dụng xét duyệt ứng viên
1. **Mã API:** `API-09`
2. **Tên nghiệp vụ:** Duyệt hoặc từ chối đơn ứng tuyển.
3. **HTTP Method:** `PATCH`
4. **Endpoint:** `/api/applications/:id/status`
5. **Actor:** Nhà tuyển dụng sở hữu tin
6. **Mục đích:** Quyết định tuyển dụng ứng viên sinh viên.
7. **Request Body:** `{ "status": "REJECTED", "reason": "Không phù hợp lịch làm việc" }` (hoặc `"REVIEWING"`, `"SHORTLISTED"`). Nhận ứng viên (`ACCEPTED`) đi qua `POST /api/jobs/:jobId/selections` với `{ "applicationIds": [..] }`.
8. **Quy tắc Validation:** `status` chỉ nhận `'REVIEWING'`, `'SHORTLISTED'`, `'REJECTED'`; từ chối bắt buộc có lý do.
9. **Response Thành công (200 OK):** `{ "success": true, "message": "Hồ sơ đã được chuyển sang trạng thái: REJECTED", "data": { ... } }`.
10. **Các trường hợp lỗi & Mã HTTP:**
    - `400 Bad Request`: Trạng thái không hợp lệ / thiếu lý do từ chối.
    - `403 Forbidden`: Người duyệt không phải nhà tuyển dụng sở hữu công việc này.
    - `404 Not Found`: Không tìm thấy đơn ứng tuyển.
    - `409 Conflict`: Đơn đã ở trạng thái cuối (`ACCEPTED` hoặc `WITHDRAWN`) — không chuyển được nữa.
11. **Điều kiện Xác thực:** `verifyToken` & `requireRoles('EMPLOYER')`.
12. **Quy tắc nghiệp vụ:** Kiểm tra liên kết `applications.job_id` $\rightarrow$ `jobs.employer_id === req.user.id`; chỉ đổi trạng thái khi cập nhật DB thành công mới tạo thông báo cho sinh viên.
13. **Bảng CSDL sử dụng:** `applications`, `jobs`.
14. **Use Case / FR:** UC-07 | FR-05.

---

### [API-10] Đánh giá hai chiều sau công việc
1. **Mã API:** `API-10`
2. **Tên nghiệp vụ:** Gửi đánh giá và điểm số sao.
3. **HTTP Method:** `POST`
4. **Endpoint:** `/api/reviews`
5. **Actor:** Sinh viên hoặc Nhà tuyển dụng đã tham gia công việc
6. **Mục đích:** Xây dựng uy tín hai chiều sau khi hoàn thành công việc.
7. **Request Body:**
   ```json
   {
     "job_id": 1,
     "reviewee_id": 4,
     "rating": 5,
     "comment": "Sinh viên làm việc đúng giờ, có trách nhiệm và năng nổ."
   }
   ```
8. **Quy tắc Validation:** `rating` bắt buộc từ 1 đến 5 sao; `comment` tối thiểu 5 ký tự.
9. **Response Thành công (201 Created):** `{ "success": true, "message": "Gửi đánh giá thành công", "data": { "id": 1, ... } }`.
10. **Các trường hợp lỗi & Mã HTTP:**
    - `400 Bad Request`: Công việc chưa ở trạng thái `COMPLETED`; hoặc tự đánh giá chính mình (`reviewer_id === reviewee_id`).
    - `403 Forbidden`: Người đánh giá không phải đối tác thực tế trong công việc (Sinh viên chưa được duyệt `ACCEPTED` hoặc NTD không phải chủ tin).
    - `409 Conflict`: Đã đánh giá đối tác này trong công việc này rồi (Mỗi bên chỉ đánh giá 1 lần).
11. **Điều kiện Xác thực:** `verifyToken`.
12. **Quy tắc nghiệp vụ:** Kiểm tra `jobs.status === 'COMPLETED'` và kiểm tra đơn ứng tuyển `ACCEPTED`.
13. **Bảng CSDL sử dụng:** `reviews`, `jobs`, `applications`.
14. **Use Case / FR:** UC-09 | FR-07.

---

### [API-11] & [API-12] Quản trị viên Kiểm duyệt & Thống kê Hệ thống
1. **Mã API:** `API-11` & `API-12`
2. **Tên nghiệp vụ:** Quản trị người dùng & Kiểm duyệt tin đăng.
3. **HTTP Method & Endpoints:**
   - `PATCH /api/admin/users/:id/status` (Body: `{ "status": "BANNED" }` hoặc `"ACTIVE"`)
   - `PATCH /api/admin/jobs/:id/moderate` (Body: `{ "moderation_status": "APPROVED" }` hoặc `"REJECTED"`)
   - `GET /api/admin/stats` (Lấy tổng số tài khoản, tin tuyển dụng, đơn nộp)
4. **Actor:** Quản trị viên (`ADMIN`)
5. **Điều kiện Xác thực:** `verifyToken` & `requireRoles('ADMIN')`.
6. **Bảng CSDL sử dụng:** `users`, `jobs`, `applications`.
7. **Use Case / FR:** UC-10.

---

## 3. Endpoint bổ sung / thay đổi sau đợt kiểm thử 314 test case (20/11/2026)

> Các thay đổi dưới đây đi kèm migration `02_database/migrations/020_logout_and_reset_otp.sql` (cột `users.tokens_valid_after`, `password_reset_tokens.attempts`). Số hiệu lỗi tương ứng xem `BUGLOG.md` (BUG-10 → BUG-27).

### [API-13] Quên mật khẩu — gửi mã OTP
1. **Mã API:** `API-13`
2. **Tên nghiệp vụ:** Yêu cầu mã xác nhận khôi phục mật khẩu.
3. **HTTP Method:** `POST`
4. **Endpoint:** `/api/auth/forgot-password`
5. **Actor:** Khách (Sinh viên, Nhà tuyển dụng)
6. **Mục đích:** Gửi mã OTP 6 chữ số qua email để chứng minh quyền sở hữu tài khoản.
7. **Request Body:** `{ "email": "student@vlu.edu.vn" }`
8. **Quy tắc Validation:** `email` bắt buộc, đúng định dạng.
9. **Response Thành công (200 OK):** `{ "success": true, "message": "Mã xác nhận gồm 6 chữ số đã được gửi tới email của bạn (hiệu lực 15 phút)." }` (môi trường không phải production trả thêm `dev_token` để kiểm thử tự động).
10. **Các trường hợp lỗi & Mã HTTP:**
    - `400 Bad Request`: Email trống / sai định dạng.
    - `403 Forbidden`: Tài khoản đã bị khóa.
    - `404 Not Found`: "Không tìm thấy tài khoản đã đăng ký với địa chỉ email này." (theo AC2).
    - `429 Too Many Requests`: Quá 5 yêu cầu / 15 phút từ một IP.
    - `503 Service Unavailable`: Không gửi được email (chưa cấu hình SMTP hoặc máy chủ thư lỗi) — mã vừa tạo bị hủy.
11. **Điều kiện Xác thực:** Public.
12. **Quy tắc nghiệp vụ:** Mã sinh bằng `crypto.randomInt`, chỉ lưu SHA-256; hiệu lực 15 phút; yêu cầu mã mới vô hiệu hóa mã cũ. Gửi qua SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`; local dùng Mailpit, production dùng Gmail + mật khẩu ứng dụng).
13. **Bảng CSDL sử dụng:** `users`, `password_reset_tokens`.
14. **Use Case / FR:** PB-04, PB-10.

### [API-14] Đặt lại mật khẩu bằng mã OTP
1. **Mã API:** `API-14`
2. **Tên nghiệp vụ:** Xác nhận mã và đặt mật khẩu mới.
3. **HTTP Method:** `POST`
4. **Endpoint:** `/api/auth/reset-password`
5. **Actor:** Khách đã nhận mã qua email
6. **Mục đích:** Đổi mật khẩu khi quên, **bắt buộc** có mã OTP (không còn đặt lại chỉ bằng email).
7. **Request Body:** `{ "email": "student@vlu.edu.vn", "otp": "123456", "new_password": "NewPass88" }`
8. **Quy tắc Validation:** `email` đúng định dạng; `otp` bắt buộc; `new_password` ≥ 8 ký tự.
9. **Response Thành công (200 OK):** `{ "success": true, "message": "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới." }`
10. **Các trường hợp lỗi & Mã HTTP:**
    - `400 Bad Request`: Thiếu email/mã, mật khẩu ngắn, mã sai / hết hạn / đã dùng ("Mã xác nhận không đúng hoặc đã hết hạn…"), hoặc sai quá 5 lần ("Nhập sai mã quá nhiều lần. Vui lòng yêu cầu mã mới").
11. **Điều kiện Xác thực:** Public.
12. **Quy tắc nghiệp vụ:** Khóa dòng mã (`FOR UPDATE`) chống dùng trùng; sai 5 lần thì hủy mã; thành công thì đánh dấu mã đã dùng và **thu hồi mọi phiên đăng nhập cũ** (`tokens_valid_after = NOW()`).
13. **Bảng CSDL sử dụng:** `users`, `password_reset_tokens`.
14. **Use Case / FR:** PB-04, PB-10.

### [API-15] Đăng xuất (thu hồi phiên phía server)
1. **Mã API:** `API-15`
2. **Tên nghiệp vụ:** Kết thúc phiên đăng nhập.
3. **HTTP Method:** `POST`
4. **Endpoint:** `/api/auth/logout`
5. **Actor:** Mọi người dùng đã đăng nhập
6. **Mục đích:** Vô hiệu hóa token hiện có để không dùng lại được sau khi đăng xuất.
7. **Request:** Header `Authorization: Bearer <JWT_TOKEN>`, không có body.
8. **Quy tắc Validation:** Token hợp lệ.
9. **Response Thành công (200 OK):** `{ "success": true, "message": "Đã đăng xuất" }`
10. **Các trường hợp lỗi & Mã HTTP:** `401 Unauthorized` (token thiếu / sai / đã đăng xuất — gọi lần 2 với cùng token trả 401, không cấp phiên mới).
11. **Điều kiện Xác thực:** `verifyToken`.
12. **Quy tắc nghiệp vụ:** Ghi `users.tokens_valid_after = date_trunc('second', NOW())`; mọi token có `iat` ≤ mốc này bị từ chối ở mọi API (đăng xuất trên tất cả thiết bị).
13. **Bảng CSDL sử dụng:** `users`.
14. **Use Case / FR:** PB-03, PB-09, PB-12.

### [API-16] Nhật ký hệ thống có lọc theo khoảng ngày
1. **Mã API:** `API-16`
2. **Tên nghiệp vụ:** Xem nhật ký thao tác quản trị.
3. **HTTP Method:** `GET`
4. **Endpoint:** `/api/admin/logs?action=&from=YYYY-MM-DD&to=YYYY-MM-DD&limit=&page=`
5. **Actor:** Quản trị viên
6. **Mục đích:** Tra cứu ai làm gì, khi nào; lọc theo loại hành động và khoảng thời gian.
7. **Request Query:** `action` (tùy chọn), `from`, `to` (tùy chọn, ngày theo giờ Việt Nam), `limit`, `page`.
8. **Quy tắc Validation:** `from`, `to` đúng định dạng `YYYY-MM-DD`; `from ≤ to`.
9. **Response Thành công (200 OK):** `{ "success": true, "data": [ { "id", "admin_name", "action", "target_label", "metadata", "created_at" } ] }`
10. **Các trường hợp lỗi & Mã HTTP:** `400` (ngày sai định dạng / "Từ ngày" sau "Đến ngày"), `401`, `403` (không phải Admin).
11. **Điều kiện Xác thực:** `verifyToken` & `requireRoles('ADMIN')`.
12. **Quy tắc nghiệp vụ:** Tính trọn cả ngày đầu và ngày cuối (`from = to` trả nhật ký trong đúng ngày đó).
13. **Bảng CSDL sử dụng:** `admin_logs`, `users`, `jobs`, `categories`.
14. **Use Case / FR:** PB-39.

### [API-17] Xử lý khiếu nại tài khoản (có trạng thái Đang xử lý)
1. **Mã API:** `API-17`
2. **Tên nghiệp vụ:** Cập nhật trạng thái khiếu nại.
3. **HTTP Method:** `PATCH`
4. **Endpoint:** `/api/admin/appeals/:id`
5. **Actor:** Quản trị viên
6. **Mục đích:** Tiếp nhận rồi chấp nhận (mở khóa) hoặc từ chối khiếu nại.
7. **Request Body:** `{ "status": "IN_REVIEW" }` hoặc `{ "status": "APPROVED" | "REJECTED", "admin_response": "..." }`
8. **Quy tắc Validation:** `status` thuộc `IN_REVIEW`, `APPROVED`, `REJECTED`; `admin_response` bắt buộc với `APPROVED`/`REJECTED`.
9. **Response Thành công (200 OK):** Bản ghi khiếu nại sau cập nhật.
10. **Các trường hợp lỗi & Mã HTTP:** `400` (trạng thái sai / thiếu phản hồi), `404` (không có khiếu nại), `409` (khiếu nại đã có kết quả, hoặc đã ở Đang xử lý).
11. **Điều kiện Xác thực:** `verifyToken` & `requireRoles('ADMIN')`.
12. **Quy tắc nghiệp vụ:** Luồng `PENDING` → `IN_REVIEW` → `APPROVED`/`REJECTED`; chấp nhận thì mở khóa tài khoản; mỗi bước gửi thông báo cho người khiếu nại. Người dùng không gửi được khiếu nại mới khi đang có khiếu nại `PENDING`/`IN_REVIEW`.
13. **Bảng CSDL sử dụng:** `user_appeals`, `users`, `user_violations`, `notifications`.
14. **Use Case / FR:** PB-35.

### [API-18] Danh mục ngành nghề — chống trùng & ràng buộc xóa
1. **Mã API:** `API-18`
2. **Tên nghiệp vụ:** Tạo / sửa / xóa ngành nghề.
3. **HTTP Method & Endpoint:** `POST /api/admin/categories`, `PUT /api/admin/categories/:id`, `DELETE /api/admin/categories/:id`
4. **Actor:** Quản trị viên
5. **Request Body:** `{ "name": "Công nghệ thông tin", "is_active": true }`
6. **Quy tắc Validation:** Tên bắt buộc; chuẩn hóa khoảng trắng; **so trùng không phân biệt hoa thường**.
7. **Các trường hợp lỗi & Mã HTTP:** `400` (tên trống), `404`, `409` (trùng tên; hoặc xóa ngành còn tin tuyển dụng — gợi ý tắt hoạt động thay vì xóa).
8. **Điều kiện Xác thực:** `verifyToken` & `requireRoles('ADMIN')`.
9. **Bảng CSDL sử dụng:** `categories`, `jobs`.
10. **Use Case / FR:** PB-38.

### [API-19] Xử lý báo cáo vi phạm — chặn xử lý lặp
- **Endpoint:** `POST /api/admin/reports/:id/action` — Body `{ "action": "WARNING" | "BAN_USER" | "REMOVE_JOB" | "DISMISS", "note": "..." }`
- **Thay đổi:** Báo cáo đã `RESOLVED` trả `409 Conflict` ("Báo cáo này đã được xử lý, không thể xử lý lại."), không sinh hành động trùng. (PB-36)

### [API-20] Danh sách ngành công khai
- **Endpoint:** `GET /api/jobs/categories` (Public) — trả các ngành đang hoạt động, dùng cho bộ lọc tìm việc, trang chủ và chân trang (đồng bộ với danh mục Admin quản lý).

### [API-21] Tải ảnh banner tin tuyển dụng
- **Endpoint:** `POST /api/files/job-banner` (Nhà tuyển dụng) — Body `{ "data_url": "data:image/...;base64,...", "name": "banner.jpg" }`; lưu loại tệp `JOB_BANNER` (migration `019_job_banner_upload.sql`), trả đường dẫn công khai để gắn vào tin.

### Thay đổi giới hạn hồ sơ và mật khẩu
- `PUT /api/profile/me/student`, `PUT /api/profile/me/employer-public`, `PUT /api/profile/me/verification`: họ tên / tên hiển thị / tên pháp nhân **tối đa 255 ký tự — vượt thì trả `400`**, không cắt bớt âm thầm.
- `POST /api/auth/change-password`: mật khẩu mới ≥ 8 ký tự.
