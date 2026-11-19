# Kiểm thử tự động 314 test case

Bộ script chạy toàn bộ test case trong `../CDTN2_TestCases.xlsx` và cho ra `final_results.json`. Kết quả đã điền vào `../CDTN2_TestReport.xlsx`.

**Lượt chạy cuối (20/11/2026, code sau khi sửa BUG-10 → BUG-27):** 314 Passed · 0 Failed · 0 Blocked.

## Chuẩn bị
- `docker compose up -d` (backend `:5000`, PostgreSQL, frontend) và Mailpit `:8025`; giao diện Vite chạy ở `http://localhost:5173`.
- Tài khoản mẫu `student.test@vlu.edu.vn`, `employer.test@vlu.edu.vn`, `admin.test@vlu.edu.vn` (mật khẩu `Jobnest@2026`).
- Chrome cài ở `C:/Program Files/Google/Chrome/Application/chrome.exe`; `NODE_PATH` trỏ tới thư mục có `playwright-core`.

## Chạy
```bash
NODE_PATH=<thư mục node_modules có playwright-core> bash run_all.sh
```

## Các bước
| Script | Nội dung |
|---|---|
| `run_api.cjs` | ~287 case mức API/DB, tự tạo dữ liệu thử (`qa-*@example.test`, tin `[QA-AUTO …]`) |
| `rerun.cjs` | Chạy lại các case cần dữ liệu đặc thù (hồ sơ, khiếu nại) |
| `run_ui.cjs` | Case giao diện bằng Chrome |
| `verify_fix.cjs` | Các case gắn với lỗi đã sửa (OTP, đăng xuất, giới hạn, danh mục, nhật ký…) |
| `verify_blocked.cjs` | Case cần giả lập: lỗi DB (trigger tạm), hàng đợi rỗng, gửi mail Mailpit, khiếu nại "Đang xử lý" |
| `final_checks.cjs`, `cv_checks.cjs`, `placeholder_checks.cjs`, `reset_emp.cjs`, `audit_checks.cjs` | Case cần dữ liệu riêng (CV, 0/1/25 ứng viên, lọc lương…) |
| `strict_checks.cjs` | Kiểm chặt các case giao diện: phải thấy dữ liệu thật trên trang, không đạt "rỗng" |
| `merge_results.cjs` | Gộp kết quả thành `final_results.json` |

Các script tự dọn dữ liệu thử sau khi chạy. 9 case dùng cách làm đặc biệt (giả lập lỗi DB, Mailpit, thay ô email bằng SĐT…) được ghi rõ ở cột Comments của Test Report.
