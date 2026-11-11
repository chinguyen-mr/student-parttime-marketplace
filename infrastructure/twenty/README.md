# TWENTY CRM — HẠ TẦNG SELF-HOSTED CHO HỆ THỐNG JOBNEST

**Dự án:** JOBNEST — Nền tảng kết nối việc làm bán thời gian cho sinh viên  
**Học phần:** Chuyên Đề 2 — Đồ Án Tốt Nghiệp  
**Vị trí:** `infrastructure/twenty/`  
**Nguồn chính thức:** [https://github.com/twentyhq/twenty](https://github.com/twentyhq/twenty) | [https://docs.twenty.com/](https://docs.twenty.com/)  

---

## I. TWENTY CRM LÀ GÌ VÀ VÌ SAO JOBNEST CẦN SỬ DỤNG?

1. **Twenty CRM là gì:**  
   Twenty là hệ thống CRM (Customer Relationship Management) mã nguồn mở hiện đại hàng đầu hiện nay, được xây dựng bằng TypeScript, GraphQL, React và PostgreSQL. Nó cho phép tùy biến mạnh mẽ các đối tượng (Objects), trường thông tin (Fields), quy trình (Pipelines/Workflows) và bảng điều khiển (Dashboards).
2. **Vai trò trong JobNest:**  
   Trong khi cơ sở dữ liệu `cd2_marketplace_db` của JobNest tập trung xử lý giao dịch tuyển dụng (Tin đăng, Ứng tuyển, Phân công ca làm), **Twenty CRM** đóng vai trò là hệ thống nội bộ phục vụ:
   - Quản lý mối quan hệ và chăm sóc các **Nhà tuyển dụng doanh nghiệp** (Employer Account Management).
   - Quản lý các **Đối tác chiến lược** (Trường đại học, Hiệp hội doanh nghiệp, Đơn vị đào tạo kỹ năng).
   - Theo dõi tiến độ hợp tác và mở rộng nguồn tuyển dụng (**Partner & Opportunity Pipeline**).
   - Ghi chú lịch sử liên hệ, cuộc gọi, nhắc việc nội bộ cho đội ngũ quản trị sàn JobNest.

---

## II. KIẾN TRÚC DỊCH VỤ ĐỘC LẬP (DECOUPLED STACK)

Cụm dịch vụ của Twenty CRM hoàn toàn độc lập với backend Express và CSDL của JobNest:

| Dịch vụ Container | Image chính thức | Cổng Host | Mạng Docker | Volume lưu trữ |
| :--- | :--- | :---: | :--- | :--- |
| **`twenty-server`** | `twentycrm/twenty:latest` | **3020** | `twenty-network` | `twenty_server_data`, `twenty_docker_data` |
| **`twenty-worker`** | `twentycrm/twenty:latest` | Không | `twenty-network` | `twenty_server_data`, `twenty_docker_data` |
| **`twenty-db`** | `twentycrm/twenty-postgres:latest` | **5435** | `twenty-network` | `twenty_db_data` |
| **`twenty-redis`**| `redis:7-alpine` | Không | `twenty-network` | `twenty_redis_data` |

*Lưu ý an toàn: Cổng 3020 và 5435 được chọn để đảm bảo tuyệt đối không đụng độ với cổng 5000 (Backend), 5173/8080 (Frontend), và 5432 (PostgreSQL JobNest).*

---

## III. HƯỚNG DẪN KHỞI ĐỘNG VÀ TRUY CẬP (A - Z)

### 1. Chuẩn bị biến môi trường
Từ thư mục `infrastructure/twenty/`:
```powershell
# Copy file mẫu sang file cấu hình thực tế
cp .env.example .env
```
Mở file `.env` và tạo mã khóa bảo mật:
- `ENCRYPTION_KEY`: Chạy lệnh tạo chuỗi ngẫu nhiên 32 ký tự (hoặc gõ bất kỳ chuỗi Base64 an toàn 32 ký tự).
- `PG_DATABASE_PASSWORD`: Đổi mật khẩu cơ sở dữ liệu nội bộ Twenty.

### 2. Khởi động các container
```powershell
cd infrastructure/twenty
docker compose up -d
```

### 3. Kiểm tra trạng thái hoạt động
```powershell
docker compose ps
```
Khi thấy các container `twenty-server`, `twenty-worker`, `twenty-db`, `twenty-redis` đều ở trạng thái `running` (hoặc `healthy`), Twenty đã sẵn sàng.

### 4. Truy cập giao diện CRM
Mở trình duyệt web và truy cập địa chỉ:  
👉 **`http://localhost:3020`**

Ở lần mở đầu tiên, hệ thống sẽ yêu cầu bạn tạo tài khoản Quản trị viên (Super Admin) của Twenty CRM.

---

## IV. HƯỚNG DẪN QUẢN TRỊ VẬN HÀNH

### 1. Dừng cụm Twenty CRM
```powershell
docker compose stop    # Tạm dừng (giữ nguyên container)
docker compose down    # Dỡ bỏ container (DỮ LIỆU TRÊN VOLUME VẪN NGUYÊN VẸN)
```

### 2. Sao lưu dữ liệu (Backup)
Để backup toàn bộ cơ sở dữ liệu Twenty:
```powershell
docker exec twenty-db pg_dump -U twenty twenty > backup_twenty_$(Get-Date -Format 'yyyyMMdd').sql
```

### 3. Phục hồi dữ liệu (Restore)
```powershell
cat backup_file.sql | docker exec -i twenty-db psql -U twenty twenty
```

### 4. Nâng cấp phiên bản Twenty CRM
1. Mở file `.env` sửa biến `TAG=vX.Y.Z` (hoặc giữ `TAG=latest`).
2. Chạy:
   ```powershell
   docker compose pull
   docker compose down
   docker compose up -d
   ```
   *(Twenty tự động chạy các migration nâng cấp dữ liệu khi khởi động).*

---

## V. XỬ LÝ LỖI THƯỜNG GẶP (TROUBLESHOOTING)

1. **Lỗi `bind: address already in use`:**  
   Kiểm tra xem cổng 3020 hoặc 5435 có bị chiếm không. Đổi `PORT=3025` trong `.env` và file `docker-compose.yml`.
2. **Lỗi `server crash / out of memory`:**  
   Twenty CRM cần tối thiểu 2GB RAM khả dụng trên Docker Desktop (WSL2). Hãy kiểm tra file `C:\Users\<user>\.wslconfig` để cấp đủ RAM cho Docker (khuyến nghị >= 4GB).
3. **Lỗi `database relation does not exist` khi mới khởi động:**  
   Đây là hiện tượng bình thường khi container chạy migrations lần đầu (mất khoảng 30 - 60 giây). Hãy đợi container worker và server chạy xong seed khởi tạo.

