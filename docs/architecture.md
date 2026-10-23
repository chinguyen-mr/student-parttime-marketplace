# KIẾN TRÚC HỆ THỐNG — NỀN TẢNG MARKETPLACE VIỆC LÀM PART-TIME CHO SINH VIÊN
**Môn học:** Chuyên đề Tốt nghiệp 2  
**Khoa:** Công nghệ Thông tin — Trường Đại học Văn Lang  
**Nhóm sinh viên:** Nguyễn Tấn Hoàng Thông, Lê Quang Anh Tuấn, Nguyễn Văn Chí  
**GVHD:** ThS. Nguyễn Văn Trung  

---

## 1. Tổng quan Kiến trúc

Hệ thống được thiết kế theo mô hình **Client - Server (RESTful Architecture)** kết hợp cấu trúc phân tầng **3-Tier Layered Architecture** ở phía Backend nhằm đảm bảo tính phân tách trách nhiệm (Separation of Concerns), dễ bảo trì và mở rộng:

```
[ Client: React.js + Tailwind CSS ]
           │ (HTTP / JSON / JWT)
           ▼
[ Tầng 1: Routes & Controllers (Express.js) ]
           │
[ Tầng 2: Business Logic / Services ] ◄── [ Validators ]
           │
[ Tầng 3: Data Access / Repositories ]
           │ (SQL Queries)
           ▼
[ Cơ sở dữ liệu: PostgreSQL 18 ]
```

---

## 2. Chi tiết các tầng trong Backend (`server/`)

### 2.1. Tầng 1: Routes & Middlewares (`src/routes/`, `src/middleware/`)
- **Vai trò:** Tiếp nhận HTTP request, trích xuất headers (Authorization Bearer Token), query parameters và request body.
- **Middleware:**
  - `auth.middleware.js`: Kiểm tra tính hợp lệ và thời hạn của JWT Token; giải mã danh tính người dùng (`req.user`).
  - `requireRoles(...)`: Kiểm soát phân quyền dựa trên vai trò (`STUDENT`, `EMPLOYER`, `ADMIN`).
  - `error.middleware.js`: Bộ tập trung xử lý lỗi (Centralized Error Handler), chuyển đổi các lỗi Domain (`AppError`, `NotFoundError`, `ConflictError`) và mã lỗi cơ sở dữ liệu (ví dụ mã 23505 trùng khóa) thành chuẩn phản hồi JSON thống nhất.

### 2.2. Tầng 2: Services (`src/services/`)
- **Vai trò:** Trái tim của ứng dụng, chứa toàn bộ **Business Rules (Quy tắc nghiệp vụ)** theo đặc tả Use Case:
  - `auth.service.js`: Đăng ký, đăng nhập, mã hóa mật khẩu bằng bcrypt (10 rounds), cấp phát JWT Token.
  - `job.service.js`: Kiểm tra trạng thái tin, quy tắc không cho phép hoàn tác tin đã `COMPLETED` về `OPEN`, quyền của nhà tuyển dụng sở hữu tin.
  - `application.service.js`: Ngăn chặn nộp đơn trùng, ngăn nhà tuyển dụng tự ứng tuyển vào tin của mình, kiểm tra điều kiện tin phải `OPEN` và `APPROVED`.
  - `review.service.js`: Chỉ cho phép đánh giá khi công việc ở trạng thái `COMPLETED`, không cho phép tự đánh giá chính mình, ràng buộc quan hệ hợp tác thực tế giữa Sinh viên và Nhà tuyển dụng.
  - `admin.service.js`: Duyệt/từ chối tin tuyển dụng, khóa/mở khóa tài khoản, tính toán số liệu thống kê hệ sinh thái.

### 2.3. Tầng 3: Repositories (`src/repositories/`)
- **Vai trò:** Trừu tượng hóa việc truy xuất dữ liệu từ PostgreSQL.
- **Nguyên tắc:** Toàn bộ câu lệnh SQL đều sử dụng **Parameterized Queries** (`$1, $2, ...`) để phòng chống hoàn toàn lỗ hổng **SQL Injection**.

### 2.4. Tầng Kiểm tra hợp lệ: Validators (`src/validators/`)
- Kiểm tra tính đầy đủ, kiểu dữ liệu, định dạng email, độ dài chuỗi và mức lương hợp lệ trước khi dữ liệu được chuyển đến tầng Service.

---

## 3. Lược đồ Cơ sở dữ liệu (Database Schema)

- **`users`**: Quản lý tài khoản (Sinh viên, Nhà tuyển dụng, Quản trị viên).
- **`profiles`**: Hồ sơ chi tiết (Kỹ năng, trường ĐH, chuyên ngành cho SV; Tên cty, địa chỉ, website cho NTD).
- **`jobs`**: Tin tuyển dụng part-time / freelance (Tiêu đề, mô tả, danh mục, địa điểm, mức lương, trạng thái tuyển, trạng thái duyệt).
- **`applications`**: Đơn ứng tuyển của sinh viên vào việc làm (Thư xin việc, CV URL, trạng thái `PENDING`, `ACCEPTED`, `REJECTED`). Ràng buộc duy nhất `(job_id, student_id)`.
- **`reviews`**: Đánh giá hai chiều sau khi hoàn thành công việc (1 - 5 sao, nhận xét). Ràng buộc duy nhất `(job_id, reviewer_id, reviewee_id)`.
