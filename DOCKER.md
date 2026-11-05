# JobNest — Chạy dự án bằng Docker (1 lệnh)

Cách này **không cần cài Node.js hay PostgreSQL** trên máy. Chỉ cần Docker.
Toàn bộ 3 thành phần (database, backend, frontend) chạy trong container.

## 1. Yêu cầu

- **Docker Desktop** (Windows/macOS) hoặc **Docker Engine + Compose** (Linux)
  — tải tại [docker.com](https://www.docker.com/products/docker-desktop/)
- Git (để clone dự án)

Kiểm tra Docker đã sẵn sàng:

```powershell
docker version
docker compose version
```

## 2. Clone dự án

```powershell
git clone <repository-url>
cd "Chuyên Đề 2"
```

## 3. Tạo file `.env` ở thư mục gốc

```powershell
copy .env.docker.example .env
```

Mở `.env` và điền 2 giá trị bắt buộc:

```env
POSTGRES_PASSWORD=<đặt-mật-khẩu-bất-kỳ>
JWT_SECRET=<chuỗi-ngẫu-nhiên-tối-thiểu-32-ký-tự>
```

Tạo nhanh `JWT_SECRET` (nếu có Node) hoặc tự gõ chuỗi dài ≥ 32 ký tự:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> File `.env` đã được `.gitignore` loại trừ — không commit giá trị thật.
> Nếu để trống `POSTGRES_PASSWORD` hoặc `JWT_SECRET`, Docker sẽ báo lỗi dừng ngay (đúng thiết kế).

## 4. Khởi động toàn bộ hệ thống

```powershell
docker compose up -d
```

Lần đầu Docker sẽ:
- Tải image PostgreSQL, Node, Nginx
- Build backend và frontend
- **Tự động nạp schema + dữ liệu mẫu** từ `02_database/cd2_marketplace_full_dump.sql`
  (chạy một lần duy nhất khi database còn trống)

Chờ tới khi cả 3 container `healthy`:

```powershell
docker compose ps
```

## 5. Truy cập ứng dụng

| Thành phần | URL |
|---|---|
| **Frontend (giao diện)** | http://localhost:8080 |
| API qua Nginx proxy | http://localhost:8080/api/... |
| Health check | http://localhost:8080/health |
| Backend trực tiếp (debug) | http://localhost:5000/health |

Frontend gọi API cùng origin qua Nginx (`/api`), nên **không cần cấu hình IP** —
chạy được ngay trên bất kỳ máy nào.

## 6. Các lệnh thường dùng

```powershell
# Xem log
docker compose logs -f backend
docker compose logs -f frontend

# Dừng (giữ lại dữ liệu)
docker compose stop

# Khởi động lại
docker compose start

# Dừng và xoá container (GIỮ dữ liệu database trong volume)
docker compose down

# Xoá sạch kể cả database để nạp lại dump từ đầu
docker compose down -v

# Build lại sau khi sửa code
docker compose up -d --build
```

## 7. Khắc phục lỗi

| Lỗi | Nguyên nhân | Giải pháp |
|---|---|---|
| `required variable POSTGRES_PASSWORD is missing` | Chưa tạo `.env` hoặc để trống | Làm lại bước 3 |
| `JWT_SECRET ... missing` | Thiếu `JWT_SECRET` ≥ 32 ký tự | Điền `JWT_SECRET` trong `.env` |
| Container `postgres` không healthy | Cổng 5432 đang bị chiếm | Dừng PostgreSQL local, hoặc xoá dòng `5432:5432` trong `docker-compose.yml` |
| Cổng 8080 đã dùng | App khác chiếm cổng | Đổi `"8080:80"` thành `"3000:80"` trong compose |
| `relation ... does not exist` | Dump chưa nạp (volume cũ) | `docker compose down -v` rồi `up -d` lại |
| Docker daemon không chạy | Docker Desktop chưa khởi động | Mở Docker Desktop, chờ icon xanh |

## 8. Kiến trúc

```
Trình duyệt ──▶ frontend (Nginx :8080)
                  ├── /          → React SPA (static)
                  └── /api, /health → proxy ──▶ backend (Node :5000)
                                                   └──▶ postgres (:5432)
```

- **postgres**: PostgreSQL 17, dữ liệu lưu trong Docker volume `postgres_data`.
- **backend**: Node 20 + Express, `HOST=0.0.0.0`, kết nối `postgres` qua mạng nội bộ.
- **frontend**: build Vite tĩnh, phục vụ bằng Nginx, đồng thời proxy `/api` sang backend.

---

> Muốn chạy **không dùng Docker** (cài Node + PostgreSQL trực tiếp)? Xem [`SETUP.md`](./SETUP.md).
