# BÁO CÁO KIỂM THỬ CÀI ĐẶT & VẬN HÀNH DỰ ÁN (SETUP VERIFICATION)
**Dự án:** JOBNEST — Nền tảng quản lý việc làm part-time & freelance cho sinh viên  
**Ngày thực hiện:** 04/11/2026  
**Môi trường thử nghiệm:** Windows 11 x64, Node.js v24.21.0, npm 10.8.2, PostgreSQL 18.6

---

## 1. Kết quả kiểm thử các hạng mục chính

| STT | Hạng mục kiểm thử | Lệnh thực hiện | Kết quả thực tế | Bằng chứng xác minh | Trạng thái |
|:---:|---|---|---|---|:---:|
| 1 | Cài đặt dependencies | `npm run install:all` | Thành công | Đã cài đặt đầy đủ gói cho cả 03_backend và 04_frontend | ✅ PASS |
| 2 | Cấu hình file môi trường | Tạo `03_backend/.env` & `04_frontend/.env` | Thành công | File mẫu `.env.example` sao chép chính xác | ✅ PASS |
| 3 | Kiểm tra dịch vụ PostgreSQL | Kết nối socket TCP port 5432 | Thành công | Dịch vụ `postgresql-x64-18` đang chạy | ✅ PASS |
| 4 | Kiểm tra CSDL `cd2_marketplace_db` | `SELECT 1 FROM pg_database WHERE datname='cd2_marketplace_db'` | Thành công | CSDL tồn tại và sẵn sàng | ✅ PASS |
| 5 | Kiểm tra hệ thống bảng (Migrations) | `SELECT table_name FROM information_schema.tables WHERE table_schema='public'` | Thành công | 30 bảng CSDL đã được định nghĩa và liên kết khóa ngoại | ✅ PASS |
| 6 | Nạp dữ liệu mẫu (Seed Data / Dump) | `node connect_db.js` / `pg_dump` | Thành công | 133 tài khoản người dùng, đầy đủ dữ liệu jobs & applications | ✅ PASS |
| 7 | Khởi chạy Backend Server | `npm run dev:backend` | Thành công | Backend Express lắng nghe tại `http://localhost:5000` | ✅ PASS |
| 8 | Kiểm tra Health Check Endpoint | `GET http://localhost:5000/health` | Thành công | Trả về HTTP 200 `{ status: "ok", db: "ok", service: "cd2-marketplace-backend" }` | ✅ PASS |
| 9 | Khởi chạy Frontend Client | `npm run dev:frontend` | Thành công | Vite dev server lắng nghe tại `http://localhost:5173` | ✅ PASS |
| 10 | Kiểm tra kết nối API Frontend $\rightarrow$ Backend | Proxy Vite `/api` và `/health` | Thành công | `checkBackendConnection()` trả về `ok: true`, `dbOk: true` | ✅ PASS |
| 11 | Xác thực tài khoản Admin Demo | `node setup_temp_admin.js` | Thành công | Tạo/cập nhật `admin.test@vlu.edu.vn` (`password123`) thành công | ✅ PASS |
| 12 | Bộ kiểm thử tích hợp (Integration Tests) | `npm test` | Thành công | **31/31 passed across 8 suites (100% PASS)** | ✅ PASS |
| 13 | Đóng gói sản phẩm Frontend (Build) | `npm run build:frontend` | Thành công | `vite build` tạo thư mục `dist/` trong 760ms (0 lỗi) | ✅ PASS |

---

## 2. Chi tiết kết quả thực thi Bộ kiểm thử (Backend Integration Tests)

```text
> cd2-marketplace-backend@1.0.0 test
> node --test tests/integration/*.test.js

▶ UC-06 & UC-07: Quy tắc nghiệp vụ Ứng tuyển (Applications)
  ✔ Nhà tuyển dụng không thể tự nộp đơn ứng tuyển vào tin của chính mình
  ✔ Không cho phép nộp đơn vào công việc đã đóng hoặc chưa duyệt
  ✔ Không cho phép một sinh viên nộp đơn ứng tuyển trùng lặp vào cùng 1 tin
  ✔ Chặn hoàn toàn việc cập nhật sang trạng thái ACCEPTED qua updateStatus (A3 RULE)
✔ UC-06 & UC-07: Quy tắc nghiệp vụ Ứng tuyển (Applications)

▶ NGÀY 4: Kiểm thử Module Work Assignments (Tiến độ công việc & Phân quyền)
  ✔ Student xem my-assignments -> trả list
  ✔ Employer xem employer-assignments -> trả list
  ✔ Employer chuyển NOT_STARTED -> IN_PROGRESS -> 200
  ✔ Employer chuyển IN_PROGRESS -> COMPLETED -> 200
  ✔ Employer chuyển thẳng NOT_STARTED -> COMPLETED -> 409
  ✔ Employer chuyển lùi COMPLETED -> IN_PROGRESS -> 409
  ✔ Không sở hữu job gọi PATCH -> 403
✔ NGÀY 4: Kiểm thử Module Work Assignments (Tiến độ công việc & Phân quyền)

▶ UC-01 & UC-02: Xác thực và Phân quyền (Auth)
  ✔ Mã hóa mật khẩu bằng bcrypt phải tạo hash an toàn
  ✔ Tạo JWT Token phải chứa đúng thông tin người dùng và vai trò
  ✔ JWT Token giả hoặc sai secret key phải bị từ chối
✔ UC-01 & UC-02: Xác thực và Phân quyền (Auth)

▶ NGÀY 2: Kiểm thử xác thực Database và Endpoint mới (Proposals & Notifications)
  ✔ Test 1: Lấy danh sách notifications của user -> trả về list, mỗi item có title, body
  ✔ Test 2: Lấy danh sách proposals của sinh viên (my-proposals) -> trả về list proposals
✔ NGÀY 2: Kiểm thử xác thực Database và Endpoint mới (Proposals & Notifications)

▶ UC-04 & UC-08: Quy tắc nghiệp vụ Tin tuyển dụng (Jobs)
  ✔ Không cho phép nhà tuyển dụng khác cập nhật tin không thuộc quyền quản lý
  ✔ Không cho phép chuyển công việc đã hoàn thành (COMPLETED) trở lại trạng thái OPEN
✔ UC-04 & UC-08: Quy tắc nghiệp vụ Tin tuyển dụng (Jobs)

▶ NGÀY 3: Kiểm thử Module Proposals (Freelance Flow & A3 Rule)
  ✔ Student nộp proposal cho job Freelance hợp lệ -> 201 + insert vào DB
  ✔ Student nộp proposal cho job Part-time -> 409 STATE_TRANSITION_INVALID
  ✔ Student nộp proposal trùng cho cùng job -> 409 DUPLICATE_RESOURCE
  ✔ Employer xem danh sách proposals của job mình -> 200 + list
  ✔ Employer chuyển proposal sang REVIEWING -> 200
  ✔ Employer cố set ACCEPTED qua PATCH -> 409 (A3)
  ✔ Employer không sở hữu job gọi PATCH -> 403
  ✔ Selections endpoint với proposalIds -> proposal ACCEPTED + tạo work_assignment
✔ NGÀY 3: Kiểm thử Module Proposals (Freelance Flow & A3 Rule)

▶ UC-09: Quy tắc nghiệp vụ Đánh giá sau công việc (Reviews)
  ✔ Không cho phép đánh giá nếu công việc chưa hoàn thành (COMPLETED)
  ✔ Không cho phép tự đánh giá chính mình
✔ UC-09: Quy tắc nghiệp vụ Đánh giá sau công việc (Reviews)

▶ RULE A3: Tuyến duy nhất chấp nhận ứng viên và khởi tạo Work Assignment (POST /jobs/:jobId/selections)
  ✔ Employer sở hữu job có thể chọn ứng viên -> application chuyển ACCEPTED + assignment được tạo
  ✔ Employer không sở hữu job gọi selections -> 403 Forbidden
  ✔ Chọn vượt quantity_required -> 409 QuantityExceeded
✔ RULE A3: Tuyến duy nhất chấp nhận ứng viên và khởi tạo Work Assignment (POST /jobs/:jobId/selections)

ℹ tests 31
ℹ suites 8
ℹ pass 31
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

---

## 3. Chi tiết kết quả thực thi Frontend Build

```text
> client@0.0.0 build
> vite build

vite v8.3.5 building client environment for production...
transforming...
✓ 2444 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     2.19 kB │ gzip:   0.88 kB
dist/assets/index-DAwMRH7L.css      9.08 kB │ gzip:   2.41 kB
dist/assets/index-Dy3SuA7n.js   1,029.98 kB │ gzip: 245.81 kB
✓ built in 760ms
```
