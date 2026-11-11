# Architecture Diagrams Reference Guide (Draw.io)

Tài liệu hướng dẫn trực quan hệ thống 5 sơ đồ kiến trúc bên trong repository JobNest.

---

## 1. Danh mục sơ đồ tại `docs/architecture/`
1. **`system-context.drawio.svg`:**
   - Cấp độ ngữ cảnh: Sinh viên, Doanh nghiệp, Admin tương tác qua HTTPS tới Nginx Reverse Proxy.
   - Các dịch vụ ngoại vi: Twenty CRM (Webhook notification), Leaflet / OpenStreetMap.
2. **`application-architecture.drawio.svg`:**
   - Kiến trúc phân tầng 3-Tier:
     - Tầng Client: React 19 SPA + Tailwind CSS + Lucide React.
     - Tầng Application: Node.js + Express.js API Gateway, Routes, Controllers, Services.
     - Tầng Data: PostgreSQL 18 RDBMS qua connection pool.
3. **`deployment-architecture.drawio.svg`:**
   - Cấu hình Docker Compose:
     - Container `jobnest-frontend` (Nginx, Port 8080).
     - Container `jobnest-backend` (Node.js, Port 5000).
     - Container `jobnest-db` (PostgreSQL 18, Port 5433 nội bộ).
     - Container `jobnest-twenty-crm` (Twenty CRM, Port 3000 / /crm).
4. **`database-erd.drawio.svg`:**
   - 13 bảng thực thể nghiệp vụ bám sát `02_database/Data_v2.xlsx`.
5. **`authentication-flow.drawio.svg`:**
   - Sơ đồ tuần tự đăng nhập, tạo JWT, xác thực token qua middleware và phân quyền RBAC.

## 2. Công cụ chỉnh sửa
- Extension VS Code: `hediet.vscode-drawio`.
- Mở file `.drawio.svg` trực tiếp trong VS Code để chỉnh sửa trực quan.

