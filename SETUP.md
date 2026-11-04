# JobNest — Hướng dẫn chạy dự án trên máy mới (Windows)

## 1. Yêu cầu hệ thống

- **Windows 10/11**
- **Node.js 18+** ([tải tại nodejs.org](https://nodejs.org))
- **PostgreSQL 14+** ([tải tại postgresql.org](https://www.postgresql.org/download/windows/))
- **Git** ([tải tại git-scm.com](https://git-scm.com/download/win))

## 2. Clone dự án

```powershell
git clone <repository-url>
cd "Chuyên Đề 2"
```

## 3. Cài đặt dependencies

```powershell
# Backend
cd 03_backend
npm install

# Frontend (mở terminal mới hoặc cd về root trước)
cd 04_frontend
npm install
```

## 4. Tạo database PostgreSQL

Mở **pgAdmin** hoặc **psql** và tạo database mới:

```sql
CREATE DATABASE cd2_marketplace_dev;
```

## 5. Cấu hình backend

### 5.1. Tạo file `.env` từ template

```powershell
cd 03_backend
copy .env.example .env
```

### 5.2. Sửa file `.env` với thông tin thực tế

Mở `03_backend/.env` bằng Notepad hoặc VS Code và điền:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<mật-khẩu-PostgreSQL-của-bạn>
DB_NAME=cd2_marketplace_dev

# JWT Secret (tối thiểu 32 ký tự, tạo ngẫu nhiên)
JWT_SECRET=abcdef1234567890abcdef1234567890abcdef1234567890

# Server
PORT=5000
HOST=127.0.0.1
NODE_ENV=development

# CORS (frontend chạy ở đâu)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Auto-bootstrap (kiểm tra DB lúc khởi động)
AUTO_BOOTSTRAP=check
```

**Lưu ý quan trọng:**
- `JWT_SECRET`: Đổi thành chuỗi ngẫu nhiên >= 32 ký tự (không dùng mẫu trên production)
- `DB_PASSWORD`: Mật khẩu bạn đặt khi cài PostgreSQL

## 6. Nạp database schema + dữ liệu mẫu

Từ **root** của dự án (đảm bảo `03_backend/.env` đã đúng và database đã tồn tại):

```powershell
# Tạo bảng (chạy toàn bộ migration)
npm run migrate

# Nạp dữ liệu mẫu
npm run seed
```

**Cách thay thế** — nạp toàn bộ dump một lần (nhanh hơn, cần `psql` trong PATH):

```powershell
psql -U postgres -d cd2_marketplace_dev -f 02_database/cd2_marketplace_full_dump.sql
```

Nhập mật khẩu PostgreSQL khi được hỏi.

## 7. Chạy backend

```powershell
cd 03_backend
npm start
```

Nếu thành công, bạn sẽ thấy:

```
🔍 [BOOTSTRAP] Đang kiểm tra kết nối PostgreSQL (mode: check)...
✅ [BOOTSTRAP] Kết nối PostgreSQL thành công.
🚀 CD2 Marketplace Backend is running on http://127.0.0.1:5000
```

Kiểm tra health endpoint: [http://localhost:5000/health](http://localhost:5000/health)

## 8. Cấu hình frontend

### 8.1. Tạo file `.env` (nếu cần)

Frontend mặc định kết nối `http://localhost:5000/api`. Nếu backend chạy ở máy khác, tạo `04_frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

**Model B** (cùng máy): dùng `localhost`  
**Model C** (backend máy A, frontend máy B): dùng `http://<IP-máy-A>:5000/api`

### 8.2. Chạy frontend

```powershell
cd 04_frontend
npm run dev
```

Mở trình duyệt: [http://localhost:5173](http://localhost:5173)

## 9. Tạo tài khoản Admin test (tùy chọn)

Từ **root** của dự án:

```powershell
$env:SEED_ADMIN_EMAIL="admin@vlu.edu.vn"
$env:SEED_ADMIN_PASSWORD="Admin@2026#Secure"
node setup_temp_admin.js
```

Đăng nhập bằng email/password vừa đặt.

## 10. Khắc phục lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|------|-------------|-----------|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL chưa chạy | Mở **Services** → khởi động `postgresql-x64-14` |
| `password authentication failed` | Sai `DB_PASSWORD` | Kiểm tra lại mật khẩu trong `.env` |
| `database "cd2_marketplace_dev" does not exist` | Chưa tạo DB | Chạy lại bước 4 |
| `JWT_SECRET phải có ít nhất 32 ký tự` | Thiếu hoặc quá ngắn | Đặt chuỗi >= 32 ký tự trong `.env` |
| Frontend không gọi được API | CORS hoặc sai URL | Kiểm tra `CORS_ORIGINS` và `VITE_API_URL` |

## 11. API Endpoints

- Health check: `GET /api/health`
- Jobs: `GET /api/jobs`
- Auth: `POST /api/auth/login`, `POST /api/auth/register`

Tất cả API có hai prefix: `/api` và `/api/v1` (tương đương).

---

**Cần hỗ trợ?** Kiểm tra log console của backend/frontend để xem lỗi chi tiết.
