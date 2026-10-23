# TÀI LIỆU ĐẶC TẢ API (RESTFUL API SPECIFICATION)
**Nền tảng Quản lý Freelance / Marketplace việc làm part-time cho sinh viên**  
**Host cục bộ:** `http://localhost:5000`  
**Định dạng dữ liệu:** `application/json`  
**Xác thực:** Header `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Nhóm Xác thực & Tài khoản (Auth) — UC-01, UC-02

### 1.1. Đăng ký tài khoản (UC-01)
- **Endpoint:** `POST /api/auth/register`
- **Quyền truy cập:** Công khai (Public)
- **Request Body:**
```json
{
  "email": "student@vlu.edu.vn",
  "password": "password123",
  "full_name": "Nguyễn Văn A",
  "phone": "0912345678",
  "role": "STUDENT" // hoặc "EMPLOYER"
}
```
- **Response Success (201 Created):**
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "user": { "id": 6, "email": "student@vlu.edu.vn", "role": "STUDENT", "full_name": "Nguyễn Văn A" },
    "token": "eyJhbGciOi..."
  }
}
```

### 1.2. Đăng nhập hệ thống (UC-02)
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
```json
{
  "email": "techcorp@gmail.com",
  "password": "password123"
}
```
- **Response Success (200 OK):**
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

### 1.3. Lấy thông tin cá nhân hiện tại
- **Endpoint:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <TOKEN>`

---

## 2. Nhóm Hồ sơ cá nhân (Profiles) — UC-03

### 2.1. Xem hồ sơ cá nhân
- **Endpoint:** `GET /api/profile/me`
- **Headers:** `Authorization: Bearer <TOKEN>`

### 2.2. Cập nhật hồ sơ cá nhân
- **Endpoint:** `PUT /api/profile/me`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Request Body:**
```json
{
  "bio": "Sinh viên năm cuối nhiệt tình, chăm chỉ",
  "skills": "React, Node.js, PostgreSQL",
  "university": "Đại học Văn Lang",
  "major": "Kỹ thuật phần mềm",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

---

## 3. Nhóm Tin việc làm (Jobs) — UC-04, UC-05, UC-08

### 3.1. Tìm kiếm & Lọc tin tuyển dụng (UC-05)
- **Endpoint:** `GET /api/jobs`
- **Query Params:**
  - `keyword`: Tìm trong tiêu đề hoặc mô tả
  - `category`: Ngành nghề (CNTT, Dịch vụ, Thiết kế, v.v.)
  - `location`: Khu vực (Quận 1, Bình Thạnh, Remote, v.v.)
  - `minSalary`, `maxSalary`: Khoảng lương
  - `workType`: `PART_TIME` hoặc `FREELANCE`
  - `page`, `limit`: Phân trang

### 3.2. Xem chi tiết tin tuyển dụng
- **Endpoint:** `GET /api/jobs/:id`

### 3.3. Đăng tin tuyển dụng mới (UC-04)
- **Endpoint:** `POST /api/jobs`
- **Quyền truy cập:** `EMPLOYER`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Request Body:**
```json
{
  "title": "Gia sư Tiếng Anh Part-time",
  "description": "Dạy kèm tiếng Anh giao tiếp cho học sinh cấp 2.",
  "requirements": "IELTS 6.5 trở lên, kiên nhẫn.",
  "category": "Giáo dục & Gia sư",
  "location": "Bình Thạnh, TP.HCM",
  "salary_type": "HOURLY",
  "salary": 120000,
  "work_type": "PART_TIME"
}
```

### 3.4. Cập nhật trạng thái công việc (UC-08)
- **Endpoint:** `PATCH /api/jobs/:id/status`
- **Quyền truy cập:** `EMPLOYER` (Sở hữu tin)
- **Request Body:**
```json
{
  "status": "FILLED" // Hoặc "COMPLETED", "CLOSED"
}
```

---

## 4. Nhóm Đơn ứng tuyển (Applications) — UC-06, UC-07

### 4.1. Nộp hồ sơ ứng tuyển (UC-06)
- **Endpoint:** `POST /api/applications`
- **Quyền truy cập:** `STUDENT`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Request Body:**
```json
{
  "job_id": 1,
  "cover_letter": "Em rất quan tâm đến vị trí này...",
  "cv_url": "https://example.com/my-cv.pdf"
}
```

### 4.2. Sinh viên xem danh sách việc đã ứng tuyển
- **Endpoint:** `GET /api/applications/my-applications`
- **Quyền truy cập:** `STUDENT`

### 4.3. Nhà tuyển dụng xem danh sách ứng viên (UC-07)
- **Endpoint:** `GET /api/applications/job/:jobId`
- **Quyền truy cập:** `EMPLOYER` (Sở hữu tin)

### 4.4. Duyệt hoặc Từ chối ứng viên (UC-07)
- **Endpoint:** `PATCH /api/applications/:id/status`
- **Quyền truy cập:** `EMPLOYER`
- **Request Body:**
```json
{
  "status": "ACCEPTED" // hoặc "REJECTED"
}
```

---

## 5. Nhóm Đánh giá sau công việc (Reviews) — UC-09

### 5.1. Gửi đánh giá
- **Endpoint:** `POST /api/reviews`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Request Body:**
```json
{
  "job_id": 1,
  "reviewee_id": 4,
  "rating": 5,
  "comment": "Sinh viên làm việc đúng giờ, có trách nhiệm cao."
}
```

### 5.2. Xem đánh giá của một người dùng
- **Endpoint:** `GET /api/reviews/user/:userId`

---

## 6. Nhóm Quản trị hệ thống (Admin) — UC-10

- `GET /api/admin/users`: Danh sách người dùng hệ thống.
- `PATCH /api/admin/users/:id/status`: Khóa (`BANNED`) hoặc Mở khóa (`ACTIVE`) tài khoản.
- `PATCH /api/admin/jobs/:id/moderate`: Duyệt (`APPROVED`) hoặc Từ chối (`REJECTED`) tin đăng.
- `GET /api/admin/stats`: Báo cáo thống kê tổng thể số liệu nền tảng.
