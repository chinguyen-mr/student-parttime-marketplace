# Chuyên đề Tốt nghiệp 2 — Nền tảng quản lý Freelance / Marketplace việc làm part-time cho sinh viên

**Khoa Công nghệ Thông tin — Trường Đại học Văn Lang**  
**Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Trung  
**Sinh viên thực hiện:**
1. Nguyễn Tấn Hoàng Thông (2374802010485)
2. Lê Quang Anh Tuấn (2374802010538)
3. Nguyễn Văn Chí (2374802010056)

---

## 1. Công nghệ sử dụng (Technology Stack)

- **Backend:** Node.js + Express.js (Kiến trúc phân tầng 3-tier: Routes - Services - Repositories - Validators).
- **Cơ sở dữ liệu:** PostgreSQL 18 (Local connection qua cổng 5432).
- **Frontend:** React.js + Tailwind CSS + Vite.
- **Xác thực:** JWT (JSON Web Token), mã hóa mật khẩu bằng bcrypt.
- **Kiểm thử tự động:** `node:test` (Native Node.js test runner) và Playwright / Chrome DevTools MCP.

---

## 2. Cấu trúc thư mục dự án

```
Chuyên Đề 2/
├── client/                     # Ứng dụng Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Các component UI tái sử dụng
│   │   ├── pages/              # Trang Sinh viên, Nhà tuyển dụng, Admin
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                     # Dịch vụ Backend API (Node.js + Express + PostgreSQL)
│   ├── src/
│   │   ├── config/             # Kết nối DB pool, migrate, seed
│   │   ├── errors/             # AppError & Domain Errors
│   │   ├── middleware/         # Xác thực JWT, phân quyền vai trò, xử lý lỗi
│   │   ├── routes/             # Định tuyến HTTP RESTful API (UC-01 -> UC-10)
│   │   ├── services/           # Nghiệp vụ cốt lõi (Business Logic Rules)
│   │   ├── repositories/       # Truy vấn dữ liệu PostgreSQL (Parameterized SQL)
│   │   ├── validators/         # Kiểm tra hợp lệ đầu vào request
│   │   ├── app.js              # Cấu hình Express app
│   │   └── server.js           # Khởi chạy máy chủ HTTP (Port 5000)
│   ├── migrations/             # DDL tạo bảng CSDL (001_initial_schema.sql)
│   ├── seeds/                  # Dữ liệu mẫu khởi tạo (001_seed_data.sql)
│   ├── tests/                  # Bộ Unit Test chạy bằng node --test
│   ├── .env                    # Biến môi trường kết nối CSDL và Secret Key
│   └── package.json
│
├── docs/                       # Tài liệu kỹ thuật
│   ├── architecture.md         # Bản vẽ và giải thích kiến trúc phân tầng
│   └── api-docs.md             # Đặc tả chi tiết toàn bộ RESTful API
│
├── Tài Liệu/                   # Tài liệu đề cương, SRS, đặc tả Use Case, slide bài giảng
├── .gitignore                  # Cấu hình loại trừ Git
├── package.json                # Script tổng điều phối toàn dự án
└── README.md
```

---

## 3. Hướng dẫn khởi chạy hệ thống

### Bước 1: Khởi tạo Cơ sở dữ liệu và Dữ liệu mẫu

Hệ thống đã có script tự động tạo cơ sở dữ liệu `cd2_marketplace_db` và nạp dữ liệu mẫu:

```bash
# Di chuyển vào thư mục server
cd server

# Chạy migration tạo bảng
npm run migrate

# Nạp dữ liệu mẫu (Admin, Nhà tuyển dụng, Sinh viên, Tin tuyển dụng mẫu)
npm run seed
```

### Bước 2: Chạy bộ kiểm thử tự động (Unit Tests)

Bộ kiểm thử chạy hoàn toàn bằng công cụ tích hợp sẵn `node:test` của Node.js:

```bash
cd server
npm test
```
*Kết quả: 10/10 test cases vượt qua thành công về nghiệp vụ xác thực, tin tuyển dụng, đơn ứng tuyển và đánh giá.*

### Bước 3: Khởi chạy Backend API

```bash
cd server
npm run dev
```
Backend API sẽ hoạt động tại: **`http://localhost:5000`**  
Kiểm tra sức khỏe hệ thống: **`http://localhost:5000/health`**

### Bước 4: Khởi chạy Frontend Web

```bash
cd client
npm run dev
```

---

## 4. Tài khoản mẫu dùng để thử nghiệm (Mật khẩu: `password123`)

| Vai trò | Email đăng nhập | Mật khẩu | Mục đích |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@marketplace.vlu.edu.vn` | `password123` | Quản trị tài khoản, kiểm duyệt tin đăng, xem thống kê |
| **Nhà tuyển dụng 1** | `techcorp@gmail.com` | `password123` | Đăng tin, xem và duyệt hồ sơ ứng viên CNTT |
| **Nhà tuyển dụng 2** | `coffeehouse@gmail.com` | `password123` | Đăng việc part-time F&B, quản lý trạng thái công việc |
| **Sinh viên 1** | `nguyen.van.chi@vlu.edu.vn` | `password123` | Tìm việc, nộp đơn ứng tuyển, theo dõi kết quả, đánh giá |
| **Sinh viên 2** | `le.quang.tuan@vlu.edu.vn` | `password123` | Tìm việc part-time, quản lý hồ sơ cá nhân |
