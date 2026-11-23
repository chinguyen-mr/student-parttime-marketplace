# Kiểm thử tự động 479 test case

Bộ script chạy toàn bộ test case trong `../CDTN2_TestCases.xlsx`. Kết quả đã điền vào `../CDTN2_TestReport.xlsx`.

- **Đợt 1 — TC số 1 → 314 (PB-01 → PB-39):** lượt chạy cuối 20/11/2026 (sau khi sửa BUG-10 → BUG-27): 314 Passed · 0 Failed · 0 Blocked → `final_results.json`.
- **Đợt 2 — TC số 315 → 479 (PB-40 → PB-65):** bổ sung để phủ đủ 86 chức năng trong `01_docs/10_JOBNEST_DanhSachChucNang.xlsx`. Lượt chạy cuối 22/11/2026 (sau khi sửa BUG-28 → BUG-31): 165 Passed · 0 Failed → `new_features_results.json`, `new_features_ui_results.json`. Xem mục [Đợt 2](#đợt-2--165-test-case-bổ-sung).

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

## Đợt 2 — 165 test case bổ sung

Chạy trên **mã nguồn hiện tại** (không phải image `jobnest-backend` cũ): một container backend tạm gắn thư mục `03_backend/src`, cùng mạng Docker với `jobnest-postgres`, và Vite trỏ vào backend đó. Cổng 5432 trên máy Windows có thể bị PostgreSQL cài sẵn chiếm, nên backend tạm phải chạy trong mạng Docker.

```bash
# backend tạm (lấy biến môi trường từ container jobnest-backend, ghi ra qa.env trước)
docker run -d --rm --name jn-qa-backend --network chuyn2_jobnest -p 5056:5056 --env-file qa.env \
  -e PORT=5056 -e JOBNEST_SYNC_API_KEY=<khóa thử> -e CORS_ORIGINS=http://localhost:5174 \
  -v "<đường dẫn>/03_backend/src:/app/src:ro" jobnest-backend:latest node src/server.js
# frontend
cd 04_frontend && VITE_API_URL=http://localhost:5056/api/v1 npx vite --port 5174
# chạy test
QA_WEBHOOK_KEY=<khóa thử> API_URL=http://localhost:5056/api node new_features.cjs
API_URL=http://localhost:5056/api WEB=http://localhost:5174 PW_CORE=<đường dẫn playwright-core> node new_features_ui.cjs
```

| Script | Nội dung |
|---|---|
| `new_features.cjs` | 152 case API/DB (PB-40 → PB-64, gồm nhóm dò lỗi PB-59) — mỗi case khai báo cả nội dung Excel lẫn đoạn kiểm thử |
| `new_features_ui.cjs` | 13 case giao diện Chrome (PB-65) |
| `new_features_cleanup.sh` | Dọn dữ liệu thử của 1 lần chạy (tin → tài khoản → thông báo `ADMIN_TASK` mồ côi) |
| `coverage_map.cjs` | Ma trận phủ: 86 chức năng ↔ test case (dùng `old_testcases.tsv` cho 314 TC đợt 1) |
| `build_new_testcases.cjs` | Xuất 165 TC + kết quả + danh sách lỗi + ma trận phủ ra Excel |
| `record_demo.cjs` | Quay 4 video kiểm thử giao diện (Khách, Sinh viên, NTD, Admin) vào `../videos/`, có phụ đề từng bước; cần ffmpeg của Playwright (`playwright-core install ffmpeg`) |
