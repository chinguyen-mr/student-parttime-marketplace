# NHẬT KÝ ĐỒNG BỘ TÀI LIỆU DỰ ÁN (PROJECT DOCUMENTATION CHANGELOG)

Tài liệu này ghi nhận toàn bộ các thay đổi liên quan đến cấu hình môi trường, kịch bản khởi chạy, cơ sở dữ liệu và cấu trúc tài liệu của dự án JOBNEST theo quy định của MASTER PROMPT.

---

## Bảng nhật ký thay đổi

| Date | Change ID | Component | Change Description | Reason | Impact | README Updated | Other Docs Updated | Approval Status |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 2026-11-04 | CHG-001 | Backend / Config | Bổ sung module `auto-bootstrap.js` và cập nhật `server.js` | Tự động hóa kiểm tra CSDL, nạp migrations và tạo Admin khi khởi động máy mới | Backend không bị crash nếu DB chưa tồn tại | ✅ Có | ✅ Có | APPROVED |
| 2026-11-04 | CHG-002 | Database | Sắp xếp thứ tự chạy 31 file SQL Migration theo quan hệ khóa ngoại (users, categories trước) | Migration bị lỗi `relation does not exist` khi chạy theo thứ tự bảng chữ cái trên database mới | CSDL tạo đủ 30 bảng không bị lỗi | ✅ Có | ✅ Có | APPROVED |
| 2026-11-04 | CHG-003 | Database / Seed | Sửa tên bảng `profiles` thành `employer_profiles` và `student_profiles` trong `001_seed_data.sql` | Bảng `profiles` không tồn tại trong schema CSDL | Seed nạp thành công 100% | ✅ Có | ✅ Có | APPROVED |
| 2026-11-04 | CHG-004 | Database / Export | Xuất toàn bộ CSDL ra tập tin chuẩn SQL `02_database/cd2_marketplace_full_dump.sql` (~603 KB, 133 users) | Cung cấp file dump hoàn chỉnh cho phép nạp trực tiếp qua pgAdmin 4 hoặc công cụ tự động | Dễ dàng import vào bất kỳ máy tính mới nào | ✅ Có | ✅ Có | APPROVED |
| 2026-11-04 | CHG-005 | Backend / DB Config | Bổ sung `set pool` và `refreshPool()` trong `03_backend/src/config/db.js` | Cho phép cập nhật kết nối động khi dò mật khẩu/port và cho phép mock DB Pool trong integration tests | Toàn bộ 31 tests chạy pass 100% | ✅ Có | ✅ Có | APPROVED |
| 2026-11-04 | CHG-006 | Automation / Windows | Tạo file kịch bản `setup_new_machine.bat` và `connect_db.bat` | Giúp người dùng Windows click đúp chuột để tự cài đặt dependencies và kết nối DB | Trải nghiệm người dùng mới thuận tiện, không cần gõ lệnh phức tạp | ✅ Có | ✅ Có | APPROVED |
| 2026-11-04 | CHG-007 | Root Package | Bổ sung script `"setup"` và `"connect:db"` vào root `package.json` | Chuẩn hóa các lệnh thiết lập từ thư mục gốc | Cung cấp lệnh CLI chuẩn `npm run setup` | ✅ Có | ✅ Có | APPROVED |
| 2026-11-04 | CHG-008 | Documentation | Viết lại toàn bộ `README.md` theo cấu trúc chuẩn 32 mục, phục vụ người dùng mới từ con số 0 | Khắc phục tình trạng tài liệu cũ thiếu hướng dẫn cài đặt từ đầu và sai lệch một số lệnh | README trở thành tài liệu hướng dẫn chính xác, đầy đủ 100% | ✅ Có | ✅ Có | APPROVED |

---

## Phân loại trạng thái thay đổi
- **EXISTING:** Thông tin đã tồn tại trong dự án.
- **FIX:** Sửa sai lệch hoặc lỗi kỹ thuật.
- **ADDITION:** Bổ sung tính năng/công cụ mới.
- **PROPOSED:** Đề xuất, chờ phê duyệt.
- **APPROVED:** Đã được kiểm thử và phê duyệt chính thức.
- **DEPRECATED:** Không còn sử dụng.
