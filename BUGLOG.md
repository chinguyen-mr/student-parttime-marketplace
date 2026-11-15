# BUGLOG — Nhật ký lỗi JobNest

Ghi lại các lỗi đã phát hiện, nguyên nhân, cách sửa và cách kiểm chứng.
Thêm lỗi mới lên **đầu bảng tóm tắt** và thêm mục chi tiết tương ứng bên dưới.

**Mức độ:** 🔴 Nghiêm trọng (hỏng chức năng / không cài được) · 🟠 Trung bình (sai dữ liệu, sai luồng) · 🟡 Nhẹ (giao diện, log, cảnh báo)

## Tóm tắt

| # | Ngày | Mức | Lỗi | Trạng thái | Commit |
|---|---|---|---|---|---|
| BUG-09 | 16/11/2026 | 🟡 | Log Vercel đầy cảnh báo SSL (mức error) và quảng cáo dotenv | ✅ Đã sửa | `b9dd212` |
| BUG-08 | 16/11/2026 | 🟡 | Mã nội bộ (UC-09, WF-E05, Rule A3…) hiện trên giao diện; trang/popup trùng lặp | ✅ Đã sửa | `8c98e44` |
| BUG-07 | 16/11/2026 | 🟠 | Nút "Việc làm theo lịch rảnh" mở nhầm trang Tổng quan | ✅ Đã sửa | `25e0c54` |
| BUG-06 | 15/11/2026 | 🟡 | Vercel build frontend 2 lần mỗi lần deploy; lỗ hổng `uuid` | ✅ Đã sửa | `04fed60` |
| BUG-05 | 15/11/2026 | 🟡 | Vercel/trình duyệt không lấy được icon trang | ✅ Đã sửa | `d3929ae` |
| BUG-04 | 15/11/2026 | 🟠 | Dữ liệu giả bị trộn vào danh sách thật | ✅ Đã sửa | `47ff68d` |
| BUG-03 | 15/11/2026 | 🟠 | Dashboard/Hồ sơ ứng viên chỉ tải hồ sơ của 3–5 tin đầu | ✅ Đã sửa | `47ff68d` |
| BUG-02 | 15/11/2026 | 🟠 | Ứng viên "Đã nhận" hiển thị "Chờ duyệt", vẫn bấm được "Từ chối" | ✅ Đã sửa | `47ff68d` |
| BUG-01 | 15/11/2026 | 🔴 | Cài mới bằng Docker hỏng ở bước tạo database | ✅ Đã sửa | `47ff68d` |

---

## Chi tiết

### BUG-09 — Log Vercel đầy cảnh báo SSL và quảng cáo dotenv 🟡
- **Hiện tượng:** Mỗi request khởi động lạnh trên Vercel in dòng mức **error** `SECURITY WARNING: The SSL modes 'prefer', 'require'…` và 2 dòng `◇ injected env (0) from .env // tip: …`.
- **Nguyên nhân:** `DATABASE_URL` của Neon có `sslmode=require`; thư viện `pg` 8.x tự đổi thành kiểm tra chứng chỉ đầy đủ, **ghi đè** tùy chọn `ssl` trong code và in cảnh báo. `dotenv` 17 mặc định in mẹo quảng cáo.
- **Cách sửa:** `03_backend/src/config/db.js` bỏ `sslmode` khỏi URL, khai báo `ssl: {}` (đúng cấu hình đang hiệu lực); `dotenv.config({ quiet: true })` ở `app.js`, `server.js`, `db.js`, `migrate.js`.
- **Kiểm chứng:** Kết nối Neon production: TLS 1.3, chứng chỉ hợp lệ, Neon từ chối kết nối không mã hóa. Log sau deploy không còn hai loại dòng trên.

### BUG-08 — Mã nội bộ hiện trên giao diện, trang trùng lặp 🟡
- **Hiện tượng:** Giao diện hiện "(UC-09 & UC-10)", "UC-09:", "(WF-E08 A3)", "WF-E05 Form động", "WF-S08:", "Chuẩn wireframe"…; toast chọn ứng viên có "(A3 Rule)". Có trang "Sơ đồ website" không cần thiết.
- **Nguyên nhân:** Mã yêu cầu/wireframe dùng khi phát triển bị để lại trong chữ hiển thị. `PolicyModal` và `StaticContentPage` là bản cũ trùng nội dung trang Giới thiệu, không còn được mở.
- **Cách sửa:** Gỡ mã khỏi chữ hiển thị (frontend + thông báo backend); bỏ mục Sơ đồ website (trang Giới thiệu, menu, footer); xóa `PolicyModal`, `StaticContentPage` (link cũ `?tab=static_content` chuyển sang Giới thiệu).
- **Kiểm chứng:** Script trình duyệt quét chữ hiển thị trên 45 màn hình của 4 vai trò: không còn mã nào.

### BUG-07 — Nút "Việc làm theo lịch rảnh" mở nhầm trang 🟠
- **Hiện tượng:** Sinh viên bấm nút trên header bị đưa về trang Tổng quan (hoặc giữ nguyên tab đang mở).
- **Nguyên nhân:** `App.jsx` chỉ đổi sang `student_dashboard` mà không chọn tab con `availability`.
- **Cách sửa:** Gọi `openStudentTab('availability')`.
- **Kiểm chứng:** Bấm từ trang chủ và từ trong trang sinh viên đều mở đúng "Lịch rảnh & Gợi ý AI" (local + production).

### BUG-06 — Vercel build 2 lần; lỗ hổng `uuid` 🟡
- **Hiện tượng:** Log build có `> vite build` 2 lần; `npm audit` báo 2 lỗ hổng mức moderate; cảnh báo chunk > 600 kB.
- **Nguyên nhân:** Script `vercel-build` (trùng `build`) được `@vercel/node` chạy lại khi build hàm `api/`. `exceljs` dùng `uuid` < 11.1.1 (GHSA-w5hq-g745-h8pq).
- **Cách sửa:** Bỏ script `vercel-build`, `vercel.json` dùng `npm run build`; `overrides: { uuid: ^11.1.1 }` trong `04_frontend/package.json`; nâng `chunkSizeWarningLimit` lên 1000 (chunk lớn duy nhất là `exceljs`, chỉ tải khi bấm "Xuất Excel").
- **Kiểm chứng:** `npm audit` 0 lỗ hổng; xuất Excel trên production ở 4 trang đều tải được file.

### BUG-05 — Không lấy được icon trang 🟡
- **Hiện tượng:** Thẻ project trên Vercel hiện tam giác mờ thay vì logo.
- **Nguyên nhân:** Không có `/favicon.ico`; yêu cầu tới đường dẫn này bị rewrite về `index.html` (trả HTML).
- **Cách sửa:** Tạo `favicon.ico`, `apple-touch-icon.png`, `icon-192/512.png` từ `logo.jpg`; cập nhật `index.html`, `manifest.json`; xóa `favicon.svg`/`icons.svg` mặc định của Vite.
- **Kiểm chứng:** `/favicon.ico` trên production trả `image/vnd.microsoft.icon`.

### BUG-04 — Dữ liệu giả trộn vào danh sách thật 🟠
- **Hiện tượng:** Danh sách tin của nhà tuyển dụng và đơn ứng tuyển của sinh viên lẫn bản ghi mẫu (tin "Kế toán", công ty "ABC"…).
- **Nguyên nhân:** `App.jsx` dùng `DEFAULT_EMPLOYER_JOBS`, `DEFAULT_STUDENT_APPLICATIONS`, `DEFAULT_APPLICANTS_KETOAN` làm giá trị ban đầu và trộn vào dữ liệu API.
- **Cách sửa:** Xóa các hằng dữ liệu giả; chỉ hiển thị dữ liệu từ API (rỗng thì hiện trạng thái rỗng).
- **Kiểm chứng:** Smoke test 14 màn hình trên bản cài mới chỉ hiện dữ liệu từ database.

### BUG-03 — Chỉ tải hồ sơ của vài tin đầu 🟠
- **Hiện tượng:** Trang Hồ sơ ứng viên chỉ lấy hồ sơ của 5 tin đầu, Dashboard chỉ 3 tin đầu → KPI và danh sách thiếu.
- **Nguyên nhân:** `fetchedJobs.slice(0, 5)` / `slice(0, 3)`, gọi tuần tự.
- **Cách sửa:** Tải hồ sơ của **tất cả** tin, song song bằng `Promise.all` (`EmployerApplicantsPage.jsx`, `EmployerDashboardPage.jsx`).
- **Kiểm chứng:** Tài khoản `employer.test` hiển thị đủ 26 hồ sơ của 8 tin.

### BUG-02 — Sai trạng thái ứng viên 🟠
- **Hiện tượng:** Ứng viên đã nhận (`ACCEPTED`) và đang xem xét (`REVIEWING`) hiển thị "Chờ duyệt"; ứng viên đã nhận vẫn có nút "Rút gọn/Từ chối".
- **Nguyên nhân:** Nhãn trạng thái chỉ phân biệt `SHORTLISTED`/`REJECTED`, còn lại mặc định "Chờ duyệt"; nút thao tác hiện cho mọi trạng thái trừ `WITHDRAWN`.
- **Cách sửa:** Bảng `STATUS_BADGE` đủ trạng thái; nút thao tác chỉ hiện với `PENDING`/`REVIEWING`/`SHORTLISTED`. Dashboard hiển thị nhãn tiếng Việt cho `REVIEWING`/`SHORTLISTED`/`WITHDRAWN`.
- **Kiểm chứng:** So khớp trạng thái hiển thị với database.

### BUG-01 — Cài mới bằng Docker hỏng 🔴
- **Hiện tượng:** Máy mới chạy `docker compose up` → PostgreSQL dừng khi khởi tạo: `relation "job_work_schedules" does not exist` (migration 006).
- **Nguyên nhân:** Dump cũ `cd2_marketplace_full_dump.sql` thiếu bảng của migration 003/004 và các bảng do `migrate.js` tạo sau.
- **Cách sửa:** Thay bằng `02_database/jobnest_schema.sql` (schema đầy đủ, xuất từ DB hiện tại); thêm service `seed` nạp dữ liệu demo: `docker compose --profile seed run --rm seed`.
- **Kiểm chứng:** Cài mới hoàn toàn trong project Docker tách biệt: không lỗi SQL, nạp 14.670 dòng, đăng nhập 3 vai trò, smoke test giao diện đạt.

---

## Mẫu ghi lỗi mới

```markdown
### BUG-XX — Tên lỗi ngắn gọn 🟠
- **Hiện tượng:** Người dùng thấy gì, ở màn hình nào, các bước tái hiện.
- **Nguyên nhân:** File/hàm gây lỗi và lý do.
- **Cách sửa:** Đã thay đổi gì.
- **Kiểm chứng:** Test/kiểm tra nào chứng minh đã hết lỗi.
```
