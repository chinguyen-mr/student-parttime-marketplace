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
   - `password`: Bắt buộc, độ dài $\ge 6$ ký tự.
   - `full_name`: Bắt buộc, không được để trống.
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
10. **Các trường hợp lỗi & Mã HTTP:** `401 Unauthorized` (Thiếu token, sai token, hoặc token hết hạn).
11. **Điều kiện Xác thực:** Middleware `verifyToken`.
12. **Quy tắc nghiệp vụ:** Giải mã payload JWT Token an toàn.
13. **Bảng CSDL sử dụng:** Bộ nhớ giải mã JWT (Không cần truy vấn lại DB nếu token hợp lệ).
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
   - `workType` (string): `PART_TIME` hoặc `FREELANCE`.
   - `page` (int, default 1), `limit` (int, default 20).
8. **Quy tắc Validation:** `minSalary`, `maxSalary` phải là số không âm nếu truyền vào.
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
10. **Các trường hợp lỗi & Mã HTTP:** `500 Internal Server Error` (Lỗi truy vấn DB).
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
10. **Các trường hợp lỗi & Mã HTTP:** `404 Not Found` (Tin không tồn tại).
11. **Điều kiện Xác thực:** Public.
12. **Quy tắc nghiệp vụ:** Truy vấn kèm hồ sơ doanh nghiệp tạo tin.
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
     "work_type": "PART_TIME"
   }
   ```
8. **Quy tắc Validation:**
   - `title`: Bắt buộc $\ge 5$ ký tự.
   - `description`: Bắt buộc $\ge 10$ ký tự.
   - `salary`: Bắt buộc là số dương $> 0$.
   - `category`, `location`: Bắt buộc.
   - `salary_type`: Chỉ nhận `'HOURLY'`, `'FIXED'`, `'MONTHLY'`.
   - `work_type`: Chỉ nhận `'PART_TIME'`, `'FREELANCE'`.
9. **Response Thành công (201 Created):** `{ "success": true, "message": "Đăng tin tuyển dụng thành công", "data": { "id": 4, "status": "OPEN", ... } }`.
10. **Các trường hợp lỗi & Mã HTTP:**
    - `400 Bad Request`: Sai dữ liệu nhập liệu.
    - `401 Unauthorized`: Chưa đăng nhập.
    - `403 Forbidden`: Tài khoản không phải vai trò `EMPLOYER`.
11. **Điều kiện Xác thực:** `verifyToken` & `requireRoles('EMPLOYER')`.
12. **Quy tắc nghiệp vụ:** Gắn tự động `employer_id = req.user.id`; trạng thái khởi tạo: `status = 'OPEN'`, `moderation_status = 'APPROVED'`.
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
    - `400 Bad Request`: Tin đã `COMPLETED` cố tình chuyển lại `OPEN`.
    - `403 Forbidden`: Người gọi không phải chủ sở hữu của tin tuyển dụng.
    - `404 Not Found`: Không tìm thấy tin.
11. **Điều kiện Xác thực:** `verifyToken` & `requireRoles('EMPLOYER')`.
12. **Quy tắc nghiệp vụ:** Kiểm tra `job.employer_id === req.user.id`; cấm đảo ngược trạng thái `COMPLETED` $\rightarrow$ `OPEN`.
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
8. **Quy tắc Validation:** `job_id` bắt buộc là số; `cover_letter` tối đa 2000 ký tự.
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
7. **Request Body:** `{ "status": "ACCEPTED" }` (hoặc `"REJECTED"`).
8. **Quy tắc Validation:** `status` chỉ nhận `'ACCEPTED'` hoặc `'REJECTED'`.
9. **Response Thành công (200 OK):** `{ "success": true, "message": "Hồ sơ đã được chuyển sang trạng thái: ACCEPTED", "data": { ... } }`.
10. **Các trường hợp lỗi & Mã HTTP:**
    - `403 Forbidden`: Người duyệt không phải nhà tuyển dụng sở hữu công việc này.
    - `404 Not Found`: Không tìm thấy đơn ứng tuyển.
11. **Điều kiện Xác thực:** `verifyToken` & `requireRoles('EMPLOYER')`.
12. **Quy tắc nghiệp vụ:** Kiểm tra liên kết `applications.job_id` $\rightarrow$ `jobs.employer_id === req.user.id`.
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
