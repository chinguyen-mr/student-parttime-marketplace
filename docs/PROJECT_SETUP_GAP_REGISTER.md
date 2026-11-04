# BẢNG GHI NHẬN CÁC ĐIỂM CẦN LƯU Ý & CẢI TIẾN DỰ ÁN (PROJECT SETUP GAP REGISTER)
**Dự án:** JOBNEST  
**Ngày lập:** 04/11/2026  
**Mục đích:** Theo dõi những điểm sai lệch kỹ thuật được phát hiện trong quá trình kiểm tra, các ranh giới kiến trúc cần lưu ý và các đề xuất cần xác nhận từ Trưởng nhóm / Giảng viên hướng dẫn.

---

## 1. Danh sách các điểm phát hiện & Hiện trạng xử lý

| ID | Vấn đề phát hiện | Phân loại | Ảnh hưởng kỹ thuật | Biện pháp xử lý hiện tại | Khuyến nghị lâu dài |
|---|---|---|---|---|---|
| **GAP-01** | Lệnh `npm run dev` ở thư mục gốc chỉ chạy Frontend (`npm --prefix 04_frontend run dev`), không chạy đồng thời cả Backend | Workflow CLI | Người dùng mới gõ `npm run dev` tưởng rằng hệ thống đã chạy đủ nhưng thực tế Backend chưa bật | README đã làm rõ: Phải mở 2 terminal (`npm run dev:backend` và `npm run dev:frontend`) | Xem xét cài đặt thư viện `concurrently` ở root để `npm run dev` chạy cả 2 server cùng lúc nếu được nhóm duyệt |
| **GAP-02** | Bảng `profiles` trong `001_seed_data.sql` trước đây không tồn tại trong DDL 30 bảng | Database Schema | Script seed bị dừng lại giữa chừng khi gặp lệnh INSERT vào `profiles` | Đã cập nhật `001_seed_data.sql` trỏ đúng vào `employer_profiles` và `student_profiles` | Duy trì đồng bộ giữa file SQL Seed và các DDL Migration |
| **GAP-03** | Khóa ngoại trong 31 file migration gây lỗi nếu chạy theo thứ tự bảng chữ cái | Database Migration | `applications.sql` tham chiếu tới `jobs` và `users`, nhưng nếu chạy theo alphabet thì `applications` chạy trước `jobs` $\rightarrow$ lỗi | Đã bổ sung danh sách ưu tiên `priorityOrder` và cơ chế retry 3 vòng trong `auto-bootstrap.js` | Xem xét áp dụng công cụ quản lý migration chuyên dụng (như `db-migrate` hoặc `node-pg-migrate`) trong tương lai |
| **GAP-04** | Port PostgreSQL máy mới có thể là 5433 hoặc 5434 thay vì 5432 | Môi trường hệ thống | Lỗi `connect ECONNREFUSED 127.0.0.1:5432` khi người dùng cài PostgreSQL phiên bản mới song song với bản cũ | `auto-bootstrap.js` và `connect_db.js` đã hỗ trợ tự động quét các cổng 5432, 5433, 5434 | Hướng dẫn người dùng trong README cách kiểm tra port thực tế trong pgAdmin / Services |
| **GAP-05** | `oxlint` báo 3 lỗi `no-constant-binary-expression` do biểu thức `false &&` trong `04_frontend/src/App.jsx` | Code Quality / Linting | Lệnh `npm --prefix 04_frontend run lint` trả về exit code 1 | Đã xác minh `vite build` vẫn pass 100% không bị ảnh hưởng | Đề xuất nhóm loại bỏ hoàn toàn các đoạn mã legacy mockup thừa thay vì để `false &&` |
| **GAP-06** | File `import_data_v2.py` cần môi trường Python và thư viện pandas | Tooling cũ | Người dùng mới nghĩ rằng bắt buộc phải cài đặt Python mới chạy được dự án | Toàn bộ dữ liệu từ Excel đã được chuyển đổi thành `02_database/cd2_marketplace_full_dump.sql`, không cần Python nữa | Lưu `import_data_v2.py` vào thư mục lưu trữ tài liệu tham khảo |

---

## 2. Các đề xuất cần xác nhận (Chờ duyệt)
1. **Đề xuất 1 (Tùy chọn):** Có nên bổ sung `concurrently` vào root `package.json` để lệnh `npm run dev` tự động kích hoạt cả Backend (Port 5000) và Frontend (Port 5173) trên cùng một cửa sổ terminal hay không?
   - *Ưu điểm:* Tiện lợi cho lập trình viên, chỉ cần mở 1 terminal duy nhất.
   - *Lưu ý:* Cần cài thêm 1 dependency ở root package.
2. **Đề xuất 2 (Tùy chọn):** Dọn dẹp 3 khối `false &&` trong `04_frontend/src/App.jsx` để lệnh `npm --prefix 04_frontend run lint` đạt 0 lỗi tuyệt đối.
