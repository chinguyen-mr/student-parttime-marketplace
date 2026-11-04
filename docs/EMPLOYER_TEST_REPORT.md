# BÁO CÁO KIỂM THỬ PHÂN HỆ NHÀ TUYỂN DỤNG (EMPLOYER TEST REPORT)
**Dự án:** JobNest — Nền tảng Việc làm Sinh viên  
**Phân hệ:** Cổng Nhà tuyển dụng (Employer Flow: WF-E01 đến WF-E12)  
**Thời gian kiểm thử:** 04/11/2026  
**Môi trường:** Node.js v22.14.0 / PostgreSQL 18.0 / Vite 8.3.5 / React 18  
**Tài khoản Test chính thức:** `employer.test@vlu.edu.vn` / `password123` (Role: `EMPLOYER`, Status: `ACTIVE`)

---

## 1. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG BACKEND (AUTOMATED INTEGRATION TESTS)

Toàn bộ **31/31 kiểm thử tích hợp (integration tests)** của Backend đã chạy thành công 100%:

```
> cd2-marketplace-backend@1.0.0 test
> node --test tests/integration/*.test.js

▶ UC-06 & UC-07: Quy tắc nghiệp vụ Ứng tuyển (Applications)
  ✔ Nhà tuyển dụng không thể tự nộp đơn ứng tuyển vào tin của chính mình (3.8ms)
  ✔ Không cho phép nộp đơn vào công việc đã đóng hoặc chưa duyệt (0.5ms)
  ✔ Không cho phép một sinh viên nộp đơn ứng tuyển trùng lặp vào cùng 1 tin (0.4ms)
  ✔ Chặn hoàn toàn việc cập nhật sang trạng thái ACCEPTED qua updateStatus (A3 RULE) (0.7ms)
✔ UC-06 & UC-07: Quy tắc nghiệp vụ Ứng tuyển (Applications) (7.4ms)

▶ NGÀY 4: Kiểm thử Module Work Assignments (Tiến độ công việc & Phân quyền)
  ✔ Student xem my-assignments -> trả list (1.9ms)
  ✔ Employer xem employer-assignments -> trả list (0.6ms)
  ✔ Employer chuyển NOT_STARTED -> IN_PROGRESS -> 200 (0.5ms)
  ✔ Employer chuyển IN_PROGRESS -> COMPLETED -> 200 (0.4ms)
  ✔ Employer chuyển thẳng NOT_STARTED -> COMPLETED -> 409 (1.1ms)
  ✔ Employer chuyển lùi COMPLETED -> IN_PROGRESS -> 409 (0.4ms)
  ✔ Không sở hữu job gọi PATCH -> 403 (0.4ms)
✔ NGÀY 4: Kiểm thử Module Work Assignments (Tiến độ công việc & Phân quyền) (9.3ms)

▶ UC-01 & UC-02: Xác thực và Phân quyền (Auth)
  ✔ Mã hóa mật khẩu bằng bcrypt phải tạo hash an toàn (203.7ms)
  ✔ Tạo JWT Token phải chứa đúng thông tin người dùng và vai trò (4.1ms)
  ✔ JWT Token giả hoặc sai secret key phải bị từ chối (1.5ms)
✔ UC-01 & UC-02: Xác thực và Phân quyền (Auth) (210.6ms)

▶ NGÀY 2: Kiểm thử xác thực Database và Endpoint mới (Proposals & Notifications)
  ✔ Test 1: Lấy danh sách notifications của user -> trả về list (2.2ms)
  ✔ Test 2: Lấy danh sách proposals của sinh viên (my-proposals) -> trả về list (0.3ms)
✔ NGÀY 2: Kiểm thử xác thực Database và Endpoint mới (Proposals & Notifications) (3.5ms)

▶ UC-04 & UC-08: Quy tắc nghiệp vụ Tin tuyển dụng (Jobs)
  ✔ Không cho phép nhà tuyển dụng khác cập nhật tin không thuộc quyền quản lý (2.7ms)
  ✔ Không cho phép chuyển công việc đã hoàn thành (COMPLETED) trở lại trạng thái OPEN (0.6ms)
✔ UC-04 & UC-08: Quy tắc nghiệp vụ Tin tuyển dụng (Jobs) (5.2ms)

▶ NGÀY 3: Kiểm thử Module Proposals (Freelance Flow & A3 Rule)
  ✔ Student nộp proposal cho job Freelance hợp lệ -> 201 + insert vào DB (2.5ms)
  ✔ Student nộp proposal cho job Part-time -> 409 STATE_TRANSITION_INVALID (1.6ms)
  ✔ Student nộp proposal trùng cho cùng job -> 409 DUPLICATE_RESOURCE (1.0ms)
  ✔ Employer xem danh sách proposals của job mình -> 200 + list (0.5ms)
  ✔ Employer chuyển proposal sang REVIEWING -> 200 (0.6ms)
  ✔ Employer cố set ACCEPTED qua PATCH -> 409 (A3) (0.4ms)
  ✔ Employer không sở hữu job gọi PATCH -> 403 (0.5ms)
  ✔ Selections endpoint với proposalIds -> proposal ACCEPTED + tạo work_assignment (1.1ms)
✔ NGÀY 3: Kiểm thử Module Proposals (Freelance Flow & A3 Rule) (10.5ms)

▶ UC-09: Quy tắc nghiệp vụ Đánh giá sau công việc (Reviews)
  ✔ Không cho phép đánh giá nếu công việc chưa hoàn thành (COMPLETED) (3.8ms)
  ✔ Không cho phép tự đánh giá chính mình (0.7ms)
✔ UC-09: Quy tắc nghiệp vụ Đánh giá sau công việc (Reviews) (6.2ms)

▶ RULE A3: Tuyến duy nhất chấp nhận ứng viên và khởi tạo Work Assignment (POST /jobs/:jobId/selections)
  ✔ Employer sở hữu job có thể chọn ứng viên -> application chuyển ACCEPTED + assignment được tạo (1.6ms)
  ✔ Employer không sở hữu job gọi selections -> 403 Forbidden (1.4ms)
  ✔ Chọn vượt quantity_required -> 409 QuantityExceeded (0.6ms)
✔ RULE A3: Tuyến duy nhất chấp nhận ứng viên và khởi tạo Work Assignment (POST /jobs/:jobId/selections) (5.6ms)

=======================================================
TỔNG KẾT: 31 PASS / 0 FAIL / 0 SKIPPED (Thời gian: 621ms)
=======================================================
```

---

## 2. KẾT QUẢ KIỂM THỬ BIÊN DỊCH FRONTEND (VITE BUILD)

```
> client@0.0.0 build
> vite build

vite v8.3.5 building client environment for production...
transforming...
✓ 2437 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   2.19 kB │ gzip:   0.88 kB
dist/assets/index-DABlw4ar.css    7.74 kB │ gzip:   2.14 kB
dist/assets/index-zzaEorR6.js   948.74 kB │ gzip: 233.29 kB
✓ built in 1.38s
```
**Kết quả:** 0 lỗi cú pháp, 0 lỗi TypeScript/JSX, tài nguyên minified chuẩn xác.

---

## 3. BẢNG KIỂM TRA CHỨC NĂNG THỰC TẾ TRÊN TỪNG MÀN HÌNH WIREFRAME

| Mã màn hình | Mô tả kiểm thử thực tế | Kết quả mong đợi | Thực tế | Trạng thái |
|---|---|---|---|:---:|
| **WF-E01** | Xem Dashboard NTD | Hiển thị 4 thẻ KPI, bảng ứng viên/đề xuất mới, hộp ghi chú nét đứt | Đúng 100% bố cục Wireframe | **PASSED** |
| **WF-E02** | Xem & Cập nhật Hồ sơ cá nhân | Chỉ hiển thị Avatar, Display Name, Bio, Location; Email & Phone readonly; KHÔNG CÓ COMPANY PROFILE | Form gọn gàng, lưu thành công vào `employer_profiles` | **PASSED** |
| **WF-E03** | Trung tâm xác thực (Verification) | Tách biệt màn hình riêng, OTP Email + Phone kèm countdown 60s, banner điều kiện trước khi đăng tin | Giao diện chuẩn xác thực 2 lớp | **PASSED** |
| **WF-E04** | Quản lý danh sách tin đăng | Có 7 bộ lọc trạng thái; tin bị REJECTED hiển thị `moderation_reason` | Lọc chính xác, hiển thị lý do kiểm duyệt rõ ràng | **PASSED** |
| **WF-E05** | Tạo tin tuyển dụng mới | Form động theo 3 hình thức (PT/SS/FL); validate hạn chót ở tương lai; banner cảnh báo xác thực nếu chưa verify | Validate chặt chẽ, tạo tin thành công (PENDING) | **PASSED** |
| **WF-E06** | Quản lý đơn ứng tuyển Part-time | KHÔNG có nút Accept inline; chỉ có Rút gọn, Từ chối, Xem hồ sơ; nút Tuyển chọn điều hướng sang WF-E08 | Đúng quy tắc Wireframe, không bypass A3 | **PASSED** |
| **WF-E07** | Quản lý đề xuất Freelance | KHÔNG có nút Accept inline; chỉ có Xem xét, Từ chối; nút Tuyển chọn điều hướng sang WF-E08 | Đúng quy tắc Wireframe | **PASSED** |
| **WF-E08** | Tuyển chọn ứng viên (Rule A3) | Chọn tối đa theo chỉ tiêu còn lại; gọi `POST /jobs/:jobId/selections`; tự động reject các ứng viên còn lại | Khởi tạo Work Assignment thành công | **PASSED** |
| **WF-E09** | Quản lý tiến độ Assignment | Bảng danh sách theo từng Student; theo dõi `Assignment.status`; nút điều hướng sang Nghiệm thu và Đánh giá | Trạng thái hiển thị đúng theo bảng Work Assignment | **PASSED** |
| **WF-E10** | Nghiệm thu sản phẩm (Deliverable) | Hiển thị phiên bản v1, v2; link xem sản phẩm; Accept / Request Revision (lý do bắt buộc); giữ Assignment IN_PROGRESS | Luồng nghiệm thu chuẩn xác | **PASSED** |
| **WF-E11** | Đánh giá sinh viên | Chỉ cho phép đánh giá khi Assignment đã COMPLETED; form 5 sao và nhận xét chi tiết | Gửi review thành công (`POST /reviews`) | **PASSED** |
| **WF-E12** | Trung tâm Thông báo NTD | Danh sách thông báo; lọc Chưa đọc; bấm vào tự động đánh dấu đã đọc và điều hướng đúng phân hệ | Đánh dấu đã đọc mượt mà | **PASSED** |
| **Trường 1** | Workspace (/employer/*) | Header tối giản, Sidebar 8 nút chữ nhật, ẨN FOOTER hoàn toàn | Giao diện làm việc tập trung, sạch sẽ | **PASSED** |
| **Trường 2** | Marketplace (/, /jobs) | Header công khai có nút `[← Về trang Quản lý]`, HIỂN THỊ FOOTER; Job Detail ẩn nút ứng tuyển cho NTD | Chuyển đổi 2 chiều mượt mà | **PASSED** |

---

## 4. BẢNG KIỂM THỬ QUY TẮC HIỂN THỊ FOOTER THEO ROUTE (TEST CASES FT-01 ĐẾN FT-15)

Kiểm thử nghiêm ngặt theo yêu cầu: **Chỉ hiển thị Footer tại Khám phá thị trường, tuyệt đối ẩn trong toàn bộ màn hình nghiệp vụ Employer.**

| Test Case | Màn hình / Route | Loại không gian | Kết quả mong muốn | Kết quả thực tế | Trạng thái |
|:---:|---|---|---|---|:---:|
| **FT-01** | `jobs` (Khám phá thị trường) | Market Discovery | Footer hiển thị đầy đủ | Đã hiển thị đầy đủ | **PASSED** |
| **FT-02** | `jobs?keyword=...` (Kết quả tìm kiếm) | Market Discovery | Footer hiển thị đầy đủ | Đã hiển thị đầy đủ | **PASSED** |
| **FT-03** | `home` (Trang chủ tìm việc) | Market Discovery | Footer hiển thị đầy đủ | Đã hiển thị đầy đủ | **PASSED** |
| **FT-04** | `employer_dashboard` (WF-E01) | Employer Operational | Footer KHÔNG hiển thị | Đã ẩn hoàn toàn | **PASSED** |
| **FT-05** | `employer_profile` (WF-E02) | Employer Operational | Footer KHÔNG hiển thị | Đã ẩn hoàn toàn | **PASSED** |
| **FT-06** | `verification` (WF-E03) | Employer Operational | Footer KHÔNG hiển thị | Đã ẩn hoàn toàn | **PASSED** |
| **FT-07** | `employer_jobs` (WF-E04) | Employer Operational | Footer KHÔNG hiển thị | Đã ẩn hoàn toàn | **PASSED** |
| **FT-08** | `create_job` (WF-E05 — Ref Image 4) | Employer Operational | Footer KHÔNG hiển thị | Đã ẩn hoàn toàn | **PASSED** |
| **FT-09** | `applicants` (WF-E06) | Employer Operational | Footer KHÔNG hiển thị | Đã ẩn hoàn toàn | **PASSED** |
| **FT-10** | `employer_proposals` (WF-E07) | Employer Operational | Footer KHÔNG hiển thị | Đã ẩn hoàn toàn | **PASSED** |
| **FT-11** | `selection` (WF-E08) | Employer Operational | Footer KHÔNG hiển thị | Đã ẩn hoàn toàn | **PASSED** |
| **FT-12** | `employer_assignments` (WF-E09) | Employer Operational | Footer KHÔNG hiển thị | Đã ẩn hoàn toàn | **PASSED** |
| **FT-13** | `deliverable` (WF-E10) | Employer Operational | Footer KHÔNG hiển thị | Đã ẩn hoàn toàn | **PASSED** |
| **FT-14** | `review_student` (WF-E11) | Employer Operational | Footer KHÔNG hiển thị | Đã ẩn hoàn toàn | **PASSED** |
| **FT-15** | `notifications` (WF-E12) | Employer Operational | Footer KHÔNG hiển thị | Đã ẩn hoàn toàn | **PASSED** |

---

## 5. KIỂM THỬ HỆ THỐNG THÔNG BÁO (NOTIFICATION SYSTEM TEST)

| STT | Kịch bản kiểm thử | Hành động & Endpoint | Kết quả mong đợi | Trạng thái |
|:---:|---|---|---|:---:|
| 1 | Đồng bộ số thông báo chưa đọc | Header gọi `GET /api/notifications` | Badge trên chuông hiển thị đúng số unread | **PASSED** |
| 2 | Xem dropdown thông báo | Bấm vào Notification Bell | Mở dropdown 20 thông báo gần nhất kèm thời gian | **PASSED** |
| 3 | Đánh dấu tất cả đã đọc | Bấm *"Đánh dấu tất cả đã đọc"* (`PATCH /read-all`) | Badge reset về 0, tất cả thông báo chuyển sang đã đọc | **PASSED** |
| 4 | Đánh dấu 1 thông báo đã đọc | Click vào thông báo (`PATCH /:id/read`) | Trừ unread count đi 1, thông báo đổi màu nền | **PASSED** |
| 5 | Điều hướng theo loại sự kiện | Click thông báo Application / Proposal / Assignment | Tự động mở đúng tab nghiệp vụ tương ứng | **PASSED** |
| 6 | Lọc 10 loại tại WF-E12 | Bấm các tab: Tất cả, Chưa đọc, Đã đọc, Ứng tuyển, Đề xuất, Tin đăng, Hợp đồng, Nghiệm thu, Xác thực, Hệ thống | Bảng dữ liệu lọc chính xác danh sách | **PASSED** |
| 7 | Sinh viên nộp hồ sơ tạo notification | `applyForJob` trong `application.service.js` | Tự động sinh bản ghi trong bảng `notifications` cho NTD | **PASSED** |
| 8 | Quản trị viên duyệt/từ chối job | `moderateJob` trong `admin.service.js` | Tự động sinh thông báo cho NTD sở hữu job | **PASSED** |

---

## 6. KẾT LUẬN
- Phân hệ Nhà tuyển dụng (Employer Portal) đã hoàn tất 100% theo Wireframe `JOBNEST_Wireframe_44.drawio` và các ảnh tham chiếu (Reference Images 1, 2, 3, 4).
- Hệ thống phân tách 2 không gian hoạt động ổn định: Không gian Quản lý tối ưu năng suất làm việc (không footer); Không gian Thị trường đầy đủ tính năng khám phá (có footer).
- Hệ thống thông báo kết nối thông suốt từ Database PostgreSQL, Backend Service đến Header Bell và Notification Center.

