# QUY CHUẨN QUẢN LÝ SƠ ĐỒ KIẾN TRÚC DRAW.IO (JOBNEST)

> **Mục tiêu:** Không để sơ đồ kiến trúc nằm rời rạc bên ngoài dự án. Mọi sơ đồ phải được lưu trữ, phiên bản hóa và chỉnh sửa trực tiếp bên trong repository.

---

## 1. ĐỊNH DẠNG VÀ VỊ TRÍ QUẢN LÝ
- **Vị trí lưu trữ:** `docs/architecture/`
- **Định dạng chuẩn:** `.drawio.svg` (file vector SVG có nhúng trực tiếp mã nguồn XML của Draw.io).
  - Vừa hiển thị xem trước trực tiếp trên GitHub / Markdown.
  - Vừa mở và chỉnh sửa trực tiếp được bằng extension `hediet.vscode-drawio` trong VS Code.

## 2. DANH MỤC 5 SƠ ĐỒ QUẢN TRỊ BẮT BUỘC
1. `system-context.drawio.svg`: Bối cảnh hệ thống JobNest (Sinh viên, Nhà tuyển dụng, Quản trị viên, API bên ngoài).
2. `application-architecture.drawio.svg`: Kiến trúc phân tầng 3-Tier (Frontend React, Backend Express, Database PostgreSQL).
3. `deployment-architecture.drawio.svg`: Mô hình triển khai Docker Compose (Container, Networks, Volumes, Reverse Proxy).
4. `database-erd.drawio.svg`: Sơ đồ thực thể liên kết ERD bám sát 13 bảng theo `02_database/Data_v2.xlsx`.
5. `authentication-flow.drawio.svg`: Luồng tuần tự xác thực JWT, mã hóa bcrypt và phân quyền RBAC.

## 3. QUY TẮC ĐỒNG BỘ GIT (GIT SYNCHRONIZATION RULE)
- Luôn cập nhật và commit các file sơ đồ `.drawio.svg` tương ứng mỗi khi có sự thay đổi về Database schema, API route hoặc cấu hình Docker.

