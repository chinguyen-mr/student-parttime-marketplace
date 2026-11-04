# Chuyên đề Tốt nghiệp 2 — Nền tảng quản lý Freelance / Marketplace việc làm part-time cho sinh viên (JOBNEST)

**Khoa Công nghệ Thông tin — Trường Đại học Văn Lang (VLU)**  
**Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên (**JOBNEST**)  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Trung  
**Sinh viên thực hiện:**
1. Nguyễn Tấn Hoàng Thông (2374802010485)
2. Lê Quang Anh Tuấn (2374802010538)
3. Nguyễn Văn Chí (2374802010056)

---

## 1. Công nghệ sử dụng (Technology Stack)

- **Backend:** Node.js (>=20) + Express.js (Kiến trúc phân tầng 3-tier: Routes → Services → Repositories → Validators).
- **Cơ sở dữ liệu:** PostgreSQL (>=14) (Kết nối qua cổng `5432`, `pg` Pool parameterized queries).
- **Frontend:** React 19 + Vite 8 + CSS Design Tokens (Bảng màu Soft Lavender `#7565A8` & Peach `#F4B99D`).
- **Thư viện giao diện & Hoạt họa:** Lucide React, Motion/React, Animate UI, Leaflet Map.
- **Xác thực & Bảo mật:** JWT (JSON Web Token), mã hóa mật khẩu an toàn bằng `bcryptjs`, RBAC 3 vai trò (Student, Employer, Admin).
- **Kiểm thử tự động:** `node:test` (Native Node.js integration tests) với **31/31 test cases** trên **8 suites**.

---

## 2. Cấu trúc thư mục dự án

```text
Chuyên Đề 2/
├── 01_tailieu/                     # Đề cương, SRS, đặc tả Use Case, slide bài giảng
├── 02_database/                    # Tài liệu ERD 30 bảng, schema DDL và migrations
│   ├── migrations/                 # DDL tạo bảng CSDL và nâng cấp cột
│   └── erd/                        # File vẽ ERD (.drawio)
│
├── 03_backend/                     # Dịch vụ Backend API (Node.js + Express + PostgreSQL)
│   ├── src/
│   │   ├── config/                 # Kết nối DB pool, migrate, seed
│   │   ├── errors/                 # AppError & Domain Errors
│   │   ├── middleware/             # Xác thực JWT, phân quyền vai trò (RBAC), xử lý lỗi tập trung
│   │   ├── modules/                # Các module nghiệp vụ (auth, jobs, applications, proposals, admin...)
│   │   ├── app.js                  # Cấu hình Express app & API routes
│   │   └── server.js               # Khởi chạy HTTP Server (Cổng 5000)
│   ├── tests/integration/          # 8 test suites kiểm thử tích hợp (31 tests)
│   ├── .env                        # Biến môi trường kết nối CSDL và Secret Key
│   └── package.json
│
├── 04_frontend/                    # Ứng dụng Frontend Web (React 19 + Vite + Design Tokens)
│   ├── src/
│   │   ├── components/             # Reusable UI components (JobCard, Header, Footer, Dropdown, Modals...)
│   │   ├── pages/
│   │   │   ├── admin/              # Phân hệ Quản trị viên (WF-A01 -> WF-A08)
│   │   │   ├── employer/           # Phân hệ Nhà tuyển dụng (WF-E01 -> WF-E12)
│   │   │   ├── student/            # Phân hệ Sinh viên (WF-S01 -> WF-S11)
│   │   │   └── HomePage.jsx        # Trang chủ & Khám phá thị trường (WF-G01, WF-G02)
│   │   ├── App.jsx                 # Điều phối Root Layout, Dual-Zone UX & Route-based Footer
│   │   └── main.jsx
│   └── package.json
│
├── 05_wireframes/                  # Danh mục 44 bản mẫu Wireframe HTML & Catalog
├── docs/                           # Báo cáo kỹ thuật, ma trận đối chiếu 44 Wireframe, audit logs
│   ├── WIREFRAME_UI_AUDIT_MATRIX.md    # Ma trận đối chiếu 44 màn hình Wireframe (100% MATCHED)
│   ├── WF_A01_DISPLAY_FIX_REPORT.md    # Báo cáo tối ưu bố cục Bảng điều khiển Admin WF-A01
│   ├── UI_LAYOUT_REDESIGN_REPORT.md    # Báo cáo kiến trúc 100vw, Dual-Zone UX & Route-based Footer
│   ├── UI_RESPONSIVE_TEST_REPORT.md    # Báo cáo kiểm thử thích ứng 6 dải màn hình
│   └── UI_IMPLEMENTATION_CHANGELOG.md  # Nhật ký thay đổi mã nguồn toàn diện
│
├── setup_temp_admin.js             # Script khởi tạo tài khoản Test Admin cố định
├── package.json                    # Script tổng điều phối toàn dự án từ thư mục gốc
└── README.md
```

---

## 3. Hướng dẫn cài đặt và khởi chạy hệ thống

### Bước 1: Cài đặt thư viện phụ thuộc (Dependencies)

Mở terminal tại thư mục gốc của dự án (`Chuyên Đề 2`) và cài đặt cho cả Backend lẫn Frontend:

```bash
# 1. Cài đặt thư viện Backend
cd 03_backend
npm install

# 2. Cài đặt thư viện Frontend
cd ../04_frontend
npm install

# 3. Quay lại thư mục gốc
cd ..
```

---

### Bước 2: Cấu hình biến môi trường (`03_backend/.env`)

Kiểm tra hoặc tạo tập tin `03_backend/.env` với các thông số kết nối PostgreSQL:

```env
PORT=5000
NODE_ENV=development

# Cấu hình kết nối PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cd2_marketplace_db
DB_USER=postgres
DB_PASSWORD=postgres

# Bảo mật JWT
JWT_SECRET=super_secret_jwt_key_cdtn2_jobnest_2026
JWT_EXPIRES_IN=7d
```

---

### Bước 3: Khởi tạo Cơ sở dữ liệu và Dữ liệu mẫu (Cơ chế Tự Động Hoàn Toàn 1-Click)

> 💡 **Tính năng Kết nối Tự Động 1-Click cho máy mới (Auto-Bootstrap):**  
> Khi bạn kéo code về máy mới (Máy B), bạn chỉ cần chạy **đúng 1 lệnh duy nhất** từ thư mục gốc:  
> ```bash
> npm run connect:db
> # Hoặc: node connect_db.js
> # Hoặc trên Windows: Click đúp vào file connect_db.bat
> ```
> Hệ thống sẽ **tự động kiểm tra và thực hiện toàn bộ quy trình**:  
> 1. Tự động kiểm tra và tạo file cấu hình `03_backend/.env` nếu máy mới chưa có.  
> 2. Tự động quét các cổng PostgreSQL (`5432`, `5433`, `5434`) và tự dò mật khẩu (`postgres`, `123456`, `admin`, `root`...).  
> 3. Tự động tạo Cơ sở dữ liệu `cd2_marketplace_db` nếu chưa tồn tại.  
> 4. Tự động chạy toàn bộ các file SQL Migration tạo 30 bảng CSDL.  
> 5. Tự động nạp dữ liệu mẫu (Seed Data) nếu database trống.  
> 6. Tự động khởi tạo tài khoản Quản trị viên (`admin.test@vlu.edu.vn` / `password123`).  
>
> *(Bạn cũng có thể chạy thủ công bằng các lệnh bên dưới nếu muốn)*:

```bash
# Cách chạy thủ công từ thư mục gốc (nếu cần):
npm run migrate
npm run seed
node setup_temp_admin.js
```

---

### Bước 4: Chạy bộ kiểm thử tự động (Integration Tests)

Dự án tích hợp bộ test tự động sử dụng `node:test` của Node.js, kiểm tra toàn bộ quy tắc nghiệp vụ cốt lõi (Xác thực JWT, Rule A3 duyệt ứng viên, chuyển đổi trạng thái FSM ca làm việc, cấm tự nộp đơn, v.v.):

```bash
# Chạy từ thư mục gốc
npm test

# Hoặc chạy từ 03_backend
cd 03_backend
npm test
```
*Kết quả mong đợi:* **`✔ 31/31 passed across 8 suites (100% PASS)`**.

---

### Bước 5: Khởi chạy Máy chủ Backend API

```bash
# Chạy từ thư mục gốc
npm run dev:backend

# Hoặc chạy trực tiếp trong 03_backend
cd 03_backend
npm run dev
```

- **Địa chỉ API:** `http://localhost:5000`
- **Kiểm tra trạng thái (Health Check):** `http://localhost:5000/api/health` hoặc `http://localhost:5000/health`

---

### Bước 6: Khởi chạy Ứng dụng Frontend (React + Vite)

Mở một cửa sổ terminal mới:

```bash
# Chạy từ thư mục gốc
npm run dev:frontend

# Hoặc chạy trực tiếp trong 04_frontend
cd 04_frontend
npm run dev
```

- **Địa chỉ ứng dụng Web:** **`http://localhost:5173`**

---

### Bước 7: Kiểm tra Biên dịch Frontend (Production Build)

Để đảm bảo mã nguồn không có bất kỳ lỗi cú pháp nào trước khi đóng gói:

```bash
npm run build:frontend
# Hoặc: cd 04_frontend && npm run build
```
*Kết quả:* `✓ built in ~800ms (0 errors, 0 warnings)`.

---

## 4. Tài khoản thử nghiệm có sẵn (Quick Login Chips)

Giao diện Đăng nhập của hệ thống (`AuthModal`) đã tích hợp sẵn các **Chip bấm nhanh** để đăng nhập ngay mà không cần nhập tay:

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn & Chức năng kiểm thử |
|---|---|---|---|
| **Quản trị viên (ADMIN)** | `admin.test@vlu.edu.vn` | `password123` | Truy cập toàn quyền **Admin Portal (WF-A01 → WF-A08)**: Duyệt tin tuyển dụng (có lý do bắt buộc khi từ chối), Quản lý & Khóa tài khoản, Xử lý khiếu nại báo cáo vi phạm, Quản lý ngành nghề, Xem nhật ký kiểm toán hệ thống. |
| **Nhà tuyển dụng (EMPLOYER)** | `employer.test@vlu.edu.vn` | `password123` | Truy cập **Employer Portal (WF-E01 → WF-E12)**: Đăng tin tuyển dụng (Part-time / Freelance), Xem danh sách ứng viên & CV chi tiết, Tuyển chọn ứng viên (Rule A3), Quản lý ca làm, Nghiệm thu sản phẩm, Đánh giá sinh viên. Đã có tick xanh `VERIFIED EMPLOYER`. |
| **Sinh viên (STUDENT)** | `student.test@vlu.edu.vn` | `password123` | Truy cập **Student Dashboard (WF-S01 → WF-S11)**: Tìm kiếm & lọc việc làm, Nộp đơn Part-time (Cover letter + CV), Gửi báo giá Freelance (Proposal), Bàn giao link sản phẩm, Đánh giá nhà tuyển dụng. |

---

## 5. Danh mục lệnh điều phối nhanh (Root NPM Commands)

Tập tin `package.json` tại thư mục gốc hỗ trợ các lệnh tắt tiện lợi:

| Lệnh thực thi | Mục đích | Thao tác tương ứng |
|---|---|---|
| `npm run dev:frontend` (hoặc `npm run dev`) | Khởi chạy máy chủ giao diện người dùng | `npm --prefix 04_frontend run dev` (Port 5173) |
| `npm run dev:backend` (hoặc `npm run backend`) | Khởi chạy máy chủ Backend API | `npm --prefix 03_backend run dev` (Port 5000) |
| `npm test` | Chạy bộ 31 bài kiểm thử tích hợp | `npm --prefix 03_backend test` |
| `npm run migrate` | Chạy migration cấu trúc bảng CSDL | `npm --prefix 03_backend run migrate` |
| `npm run seed` | Nạp dữ liệu mẫu vào PostgreSQL | `npm --prefix 03_backend run seed` |
| `npm run build:frontend` | Biên dịch đóng gói Frontend | `npm --prefix 04_frontend run build` |

---

## 6. Danh mục 44 Màn hình Wireframe và Tài liệu Nghiệm thu

Dự án đã đối chiếu và đồng bộ trọn vẹn **44 / 44 màn hình Wireframe** từ `JOBNEST_Wireframe_44(1).drawio`:
1. [**`docs/WIREFRAME_UI_AUDIT_MATRIX.md`**](docs/WIREFRAME_UI_AUDIT_MATRIX.md): Ma trận đối chiếu 44 màn hình (Guest, Student, Employer, Admin, Supplementary) với kết quả **100% MATCHED**.
2. [**`docs/WF_A01_DISPLAY_FIX_REPORT.md`**](docs/WF_A01_DISPLAY_FIX_REPORT.md): Báo cáo khắc phục lỗi hiển thị Bảng điều khiển Quản trị WF-A01, thanh Navigation tràn viền và 6 thẻ KPI.
3. [**`docs/UI_LAYOUT_REDESIGN_REPORT.md`**](docs/UI_LAYOUT_REDESIGN_REPORT.md): Báo cáo kiến trúc bố cục Full-width 100vw, mô hình Dual-Zone UX và quy tắc ẩn hiện chân trang (Route-based Footer).
4. [**`docs/UI_RESPONSIVE_TEST_REPORT.md`**](docs/UI_RESPONSIVE_TEST_REPORT.md): Báo cáo kiểm thử đáp ứng trên 6 dải độ phân giải (1920x1080 đến 390x844).
5. [**`docs/UI_IMPLEMENTATION_CHANGELOG.md`**](docs/UI_IMPLEMENTATION_CHANGELOG.md): Nhật ký chi tiết các endpoint API và component giao diện đã thực thi.
