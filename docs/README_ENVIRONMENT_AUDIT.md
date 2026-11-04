# BÁO CÁO AUDIT MÔI TRƯỜNG & DEPENDENCIES — DỰ ÁN JOBNEST
**Ngày thực hiện:** 04/11/2026  
**Chuyên đề tốt nghiệp 2 — Khoa CNTT — Đại học Văn Lang (VLU)**  
**Người thực hiện:** Senior Software Engineer / DevOps / Database Engineer

---

## 1. Bảng đối chiếu Môi trường & Công cụ

| Thành phần | Phiên bản hiện tại tại Máy A | Yêu cầu tối thiểu | Nguồn xác minh | Trạng thái |
|---|---|---|---|---|
| **Hệ điều hành** | Windows 11 (build x64) | Windows 10/11 x64, macOS 12+, Ubuntu 20.04+ LTS | System Info / User Env | ✅ Đạt |
| **Node.js** | v24.21.0 | `>= 20.0.0` (Khuyến nghị 20.x hoặc 22.x LTS) | `03_backend/package.json` (`engines.node: ">=20"`) | ✅ Đạt |
| **npm** | 10.8.2 | `>= 9.0.0` | `npm --version` | ✅ Đạt |
| **PostgreSQL Server** | 18.6 (x64) | `>= 14.0` (Hỗ trợ tốt 14, 15, 16, 17, 18) | `pg_dump.exe` header & query `SELECT version()` | ✅ Đạt |
| **pgAdmin 4** | v8+ (tích hợp cùng PostgreSQL) | Tùy chọn (không bắt buộc) | UI screenshot từ người dùng | ✅ Đạt |
| **Git** | 2.45+ (MINGW64) | `>= 2.30.0` | `git --version` | ✅ Đạt |
| **Trình duyệt (Browser)** | Chrome / Edge Chromium | Chrome >= 100, Firefox >= 100, Edge >= 100 | Trình duyệt hỗ trợ ES2022 | ✅ Đạt |
| **Backend Framework** | Express 4.21.2 | Node.js native http + Express 4.x | `03_backend/package.json` | ✅ Đạt |
| **Frontend Framework** | React 19.3.1 + Vite 8.3.4 | Vite >= 5.x, React >= 18.x | `04_frontend/package.json` | ✅ Đạt |

---

## 2. Kiểm tra Dependencies & Lockfile

### 2.1. Backend (`03_backend/package.json`)
- **Tập tin Lockfile:** `03_backend/package-lock.json` tồn tại, lockfileVersion 3.
- **Dependencies chính:**
  - `bcryptjs`: `^3.0.3` (Mã hóa mật khẩu 10 salt rounds an toàn)
  - `cors`: `^2.8.5` (Cấu hình CORS đa origin)
  - `dotenv`: `^17.3.1` (Nạp biến môi trường từ `.env`)
  - `express`: `^4.21.2` (RESTful API Server)
  - `jsonwebtoken`: `^9.0.3` (Tạo và giải mã JWT token)
  - `pg`: `^8.13.1` (PostgreSQL Client & Connection Pooling)
  - `xlsx`: `^0.18.5` (Xử lý tập tin bảng tính dữ liệu)
- **Scripts:**
  - `npm start`: `node src/server.js`
  - `npm run dev`: `node --watch src/server.js` (Yêu cầu Node >= 18.11 để hỗ trợ `--watch`)
  - `npm test`: `node --test tests/integration/*.test.js` (Native Node Test Runner)
  - `npm run migrate`: `node src/config/migrate.js`
  - `npm run seed`: `node src/config/seed.js`

### 2.2. Frontend (`04_frontend/package.json`)
- **Tập tin Lockfile:** `04_frontend/package-lock.json` tồn tại, lockfileVersion 3.
- **Dependencies chính:**
  - `react`: `^19.3.1`
  - `react-dom`: `^19.3.1`
  - `motion`: `^14.9.0` (Thư viện hoạt họa Motion/React)
  - `lucide-react`: `^1.61.0` (Icon đồ họa UI)
  - `leaflet`: `^1.9.4` (Bản đồ số định vị việc làm)
  - `@animate-ui/react`: `^2.4.1` (Hiệu ứng giao diện)
- **DevDependencies:**
  - `vite`: `^8.3.4` (Module Bundler siêu tốc)
  - `@vitejs/plugin-react`: `^6.1.2` (React Fast Refresh plugin)
  - `oxlint`: `^1.88.0` (Linter tốc độ cao)
- **Scripts:**
  - `npm run dev`: `vite` (Mặc định chạy ở cổng `http://localhost:5173`)
  - `npm run build`: `vite build`
  - `npm run lint`: `oxlint`
  - `npm run preview`: `vite preview`

### 2.3. Root Package (`package.json`)
- Điều phối các script tổng thể:
  - `npm run install:all`: Cài đặt dependencies cho cả backend và frontend.
  - `npm run connect:db`: Dò tìm cổng, thử nghiệm xác thực, tạo DB và nạp toàn bộ cấu trúc CSDL.
  - `npm run setup`: Kết hợp `install:all` và `connect:db`.
  - `npm run dev:backend`: Khởi chạy máy chủ Backend tại port 5000.
  - `npm run dev:frontend`: Khởi chạy ứng dụng Frontend tại port 5173.
  - `npm test`: Thực thi 31 integration test cases của Backend.
  - `npm run build:frontend`: Build gói tĩnh phân phối Frontend.

---

## 3. Cổng mạng (Network Ports) & Biến môi trường

### 3.1. Các cổng sử dụng
- **Port 5000 (TCP):** Máy chủ Backend Express API.
- **Port 5173 (TCP):** Máy chủ phát triển Vite Frontend.
- **Port 5432 (TCP):** Cổng mặc định dịch vụ PostgreSQL Server (có cơ chế dự phòng tự động quét cổng `5433` và `5434`).

### 3.2. Biến môi trường Backend (`03_backend/.env`)
- `PORT`: 5000
- `NODE_ENV`: development / production
- `DB_HOST`: localhost
- `DB_PORT`: 5432 (hoặc 5433 tùy máy)
- `DB_USER`: postgres
- `DB_PASSWORD`: Mật khẩu của tài khoản postgres cục bộ trên máy
- `DB_NAME`: cd2_marketplace_db
- `JWT_SECRET`: Chuỗi khóa ký JWT Token an toàn
- `JWT_EXPIRES_IN`: 7d

### 3.3. Biến môi trường Frontend (`04_frontend/.env`)
- `VITE_API_URL`: `http://localhost:5000/api` (hoặc cấu hình thông qua Vite proxy `/api`).

---

## 4. Xác nhận tính an toàn & Cô lập
- Repository **không bao giờ commit** các file `.env` chứa mật khẩu thực tế (được chặn nghiêm ngặt bởi `.gitignore`).
- Đã cung cấp sẵn `.env.example` ở cả hai thư mục `03_backend` và `04_frontend`.
- Không sử dụng các thư viện yêu cầu quyền hệ thống cao hoặc biên dịch C++ phức tạp (native bindings không tương thích). Tất cả dependency đều là pure JavaScript hoặc prebuilt binaries (như Vite/esbuild/oxlint).
