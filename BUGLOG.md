# BUGLOG — Nhật ký lỗi JobNest

Ghi lại các lỗi đã phát hiện, nguyên nhân, cách sửa và cách kiểm chứng.
Thêm lỗi mới lên **đầu bảng tóm tắt** và thêm mục chi tiết tương ứng bên dưới.

**Mức độ:** 🔴 Nghiêm trọng (hỏng chức năng / không cài được) · 🟠 Trung bình (sai dữ liệu, sai luồng) · 🟡 Nhẹ (giao diện, log, cảnh báo)

## Tóm tắt

| # | Ngày | Mức | Lỗi | Trạng thái | Commit |
|---|---|---|---|---|---|
| BUG-27 | 20/11/2026 | 🟠 | Trên máy tính, bấm avatar không mở được menu tài khoản (rê chuột mở rồi bấm lại đóng) | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-26 | 20/11/2026 | 🟠 | Khối "Nhà tuyển dụng đánh giá bạn" hiển thị dữ liệu mẫu cố định (5.0★, "Công ty TNHH… | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-25 | 20/11/2026 | 🟡 | API lọc nhận mức lương âm hoặc không phải số (-1, abc) mà không báo lỗi, trả về toàn bộ tin | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-24 | 20/11/2026 | 🟡 | Khiếu nại không có trạng thái "Đang xử lý" | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-23 | 20/11/2026 | 🟠 | Không lọc được nhật ký theo khoảng thời gian | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-22 | 20/11/2026 | 🟠 | Xóa được ngành đang có tin tham chiếu, tin còn lại mang tên ngành không tồn tại | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-21 | 20/11/2026 | 🟡 | Tạo được ngành trùng tên chỉ khác hoa/thường, khoảng trắng | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-20 | 20/11/2026 | 🟠 | Báo cáo đã xử lý vẫn xử lý lại được, sinh hành động trùng | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-19 | 20/11/2026 | 🟡 | Họ tên / tên doanh nghiệp dài hơn 255 ký tự bị cắt âm thầm | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-18 | 20/11/2026 | 🟠 | Tin Đang tuyển chuyển thẳng sang Hoàn thành | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-17 | 20/11/2026 | 🟠 | Đơn đã nhận (ACCEPTED) vẫn chuyển được sang Từ chối | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-16 | 20/11/2026 | 🟠 | Nộp được đơn không có CV và không có lời giới thiệu | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-15 | 20/11/2026 | 🟠 | Tạo được tin không có hạn nộp hồ sơ | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-14 | 20/11/2026 | 🟡 | Backend Docker không gửi được thư khôi phục; production chưa có SMTP vẫn báo "đã gửi mã" | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-13 | 20/11/2026 | 🟡 | Email chưa đăng ký nhận thông báo chung, không báo "không tìm thấy Email" như AC2 | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-12 | 20/11/2026 | 🟡 | Mật khẩu 7 ký tự vẫn được chấp nhận (đặc tả tối thiểu 8) | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-11 | 20/11/2026 | 🟠 | Đăng xuất chỉ xóa phiên trình duyệt; token cũ vẫn gọi được API tới khi hết hạn (7 ngày) | ✅ Đã sửa | Đợt kiểm thử 314 TC |
| BUG-10 | 20/11/2026 | 🔴 | Gửi chỉ email + mật khẩu mới tới /auth/reset-password là đổi được mật khẩu của bất kỳ tài… | ✅ Đã sửa | Đợt kiểm thử 314 TC |
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

> BUG-10 → BUG-27 phát hiện khi chạy đủ 314 test case (file `CDTN2_TestCases.xlsx`) ngày 19–20/11/2026; số hiệu trùng với sheet *Bug Analysis* trong Test Report. Kết quả lượt chạy cuối: 314/314 Passed.

### BUG-27 — Trên máy tính, bấm avatar không mở được menu tài khoản (rê chuột mở rồi bấm lại đóng) 🟠
- **Hiện tượng:** Trên máy tính, bấm avatar không mở được menu tài khoản (rê chuột mở rồi bấm lại đóng). Phạm vi: Giao diện chung / Menu tài khoản.
- **Nguyên nhân:** onMouseEnter mở menu, onClick lại đảo trạng thái.
- **Cách sửa:** Bấm avatar luôn mở menu; đóng bằng Esc / bấm ra ngoài / rời chuột.
- **Kiểm chứng:** Rê rồi bấm vẫn mở menu; bấm Đăng xuất thu hồi phiên. Test case: Không có TC riêng (phát hiện khi chạy UI nhóm Đăng xuất).

### BUG-26 — Khối "Nhà tuyển dụng đánh giá bạn" hiển thị dữ liệu mẫu cố định (5.0★, "Công ty TNHH… 🟠
- **Hiện tượng:** Khối "Nhà tuyển dụng đánh giá bạn" hiển thị dữ liệu mẫu cố định (5.0★, "Công ty TNHH TechNova"), không phải đánh giá thật. Phạm vi: Sinh viên / Đánh giá & Phản hồi (PB-24).
- **Nguyên nhân:** Giao diện viết cứng nội dung mẫu, không gọi API đánh giá.
- **Cách sửa:** Lấy đánh giá thật từ GET /reviews/user/:id; có trạng thái đang tải / lỗi / chưa có đánh giá.
- **Kiểm chứng:** Sinh viên thấy đúng điểm trung bình và từng nhận xét thật; bình luận HTML hiển thị dạng chữ. Test case: TC_REVIEW_STU_008.

### BUG-25 — API lọc nhận mức lương âm hoặc không phải số (-1, abc) mà không báo lỗi, trả về toàn bộ tin 🟡
- **Hiện tượng:** API lọc nhận mức lương âm hoặc không phải số (-1, abc) mà không báo lỗi, trả về toàn bộ tin. Phạm vi: Tìm kiếm / Lọc tin (PB-16).
- **Nguyên nhân:** Tham số sai bị bỏ qua âm thầm (Number("abc") = NaN) hoặc lọc theo "≥ -1".
- **Cách sửa:** Kiểm tra minSalary/maxSalary là số không âm và min ≤ max, sai thì trả 400.
- **Kiểm chứng:** -1, abc, min > max → 400; 80.000 → chỉ tin lương ≥ 80.000. Test case: TC_JOB_FILTER_009.

### BUG-24 — Khiếu nại không có trạng thái "Đang xử lý" 🟡
- **Hiện tượng:** Khiếu nại không có trạng thái "Đang xử lý". Phạm vi: Quản trị / Khiếu nại tài khoản (PB-35).
- **Nguyên nhân:** Chỉ có Chờ xử lý → Chấp nhận / Từ chối.
- **Cách sửa:** Thêm trạng thái IN_REVIEW (nút "Nhận xử lý", bộ lọc, thông báo); khiếu nại đã có kết quả không đổi lại.
- **Kiểm chứng:** PENDING → IN_REVIEW → APPROVED; cập nhật lại sau khi có kết quả → 409. Test case: TC_COMPLAINT_003.

### BUG-23 — Không lọc được nhật ký theo khoảng thời gian 🟠
- **Hiện tượng:** Không lọc được nhật ký theo khoảng thời gian. Phạm vi: Quản trị / Nhật ký hệ thống (PB-39).
- **Nguyên nhân:** API và trang chỉ có lọc loại hành động.
- **Cách sửa:** Thêm lọc Từ ngày/Đến ngày (giờ VN, tính trọn ngày); khoảng đảo → báo lỗi.
- **Kiểm chứng:** Lọc 01–15/11 đúng khoảng; cùng ngày đúng biên; khoảng đảo → 400 và báo lỗi trên giao diện. Test case: TC_AUDIT_LOG_003, TC_AUDIT_LOG_006, TC_AUDIT_LOG_007.

### BUG-22 — Xóa được ngành đang có tin tham chiếu, tin còn lại mang tên ngành không tồn tại 🟠
- **Hiện tượng:** Xóa được ngành đang có tin tham chiếu, tin còn lại mang tên ngành không tồn tại. Phạm vi: Quản trị / Danh mục ngành (PB-38).
- **Nguyên nhân:** Không kiểm tra tin đang dùng ngành.
- **Cách sửa:** Chặn xóa ngành còn tin (409), hướng dẫn tắt hoạt động thay vì xóa.
- **Kiểm chứng:** Xóa ngành có tin → 409, ngành còn nguyên. Test case: TC_CATEGORY_008.

### BUG-21 — Tạo được ngành trùng tên chỉ khác hoa/thường, khoảng trắng 🟡
- **Hiện tượng:** Tạo được ngành trùng tên chỉ khác hoa/thường, khoảng trắng. Phạm vi: Quản trị / Danh mục ngành (PB-38).
- **Nguyên nhân:** So trùng phân biệt hoa thường.
- **Cách sửa:** Chuẩn hóa khoảng trắng, so trùng không phân biệt hoa thường khi tạo/sửa (409).
- **Kiểm chứng:** " CÔNG NGHỆ THÔNG TIN " → 409. Test case: TC_CATEGORY_009.

### BUG-20 — Báo cáo đã xử lý vẫn xử lý lại được, sinh hành động trùng 🟠
- **Hiện tượng:** Báo cáo đã xử lý vẫn xử lý lại được, sinh hành động trùng. Phạm vi: Quản trị / Báo cáo vi phạm (PB-36).
- **Nguyên nhân:** Không kiểm tra trạng thái RESOLVED.
- **Cách sửa:** Chặn xử lý báo cáo đã RESOLVED (409).
- **Kiểm chứng:** Xử lý lặp → 409, số hành động giữ nguyên. Test case: TC_VIOLATION_008.

### BUG-19 — Họ tên / tên doanh nghiệp dài hơn 255 ký tự bị cắt âm thầm 🟡
- **Hiện tượng:** Họ tên / tên doanh nghiệp dài hơn 255 ký tự bị cắt âm thầm. Phạm vi: Hồ sơ Sinh viên / Nhà tuyển dụng (PB-28, PB-30).
- **Nguyên nhân:** Hàm chuẩn hóa cắt chuỗi thay vì báo lỗi.
- **Cách sửa:** Báo lỗi vượt 255 ký tự cho họ tên, tên hiển thị, tên pháp nhân.
- **Kiểm chứng:** 255 ký tự → 200; 256 ký tự → 400. Test case: TC_PROFILE_STU_EDIT_006, TC_PROFILE_EMP_EDIT_006.

### BUG-18 — Tin Đang tuyển chuyển thẳng sang Hoàn thành 🟠
- **Hiện tượng:** Tin Đang tuyển chuyển thẳng sang Hoàn thành. Phạm vi: Nhà tuyển dụng / Vòng đời tin (PB-22).
- **Nguyên nhân:** Thiếu quy tắc OPEN → COMPLETED.
- **Cách sửa:** Phải qua Đã nhận người (FILLED) mới Hoàn thành.
- **Kiểm chứng:** OPEN → COMPLETED → 400, giữ OPEN. Test case: TC_JOB_STATUS_003.

### BUG-17 — Đơn đã nhận (ACCEPTED) vẫn chuyển được sang Từ chối 🟠
- **Hiện tượng:** Đơn đã nhận (ACCEPTED) vẫn chuyển được sang Từ chối. Phạm vi: Nhà tuyển dụng / Từ chối đơn (PB-21).
- **Nguyên nhân:** Không chặn chuyển trạng thái từ trạng thái cuối.
- **Cách sửa:** Đơn ACCEPTED/WITHDRAWN không đổi trạng thái được (409).
- **Kiểm chứng:** Từ chối đơn đã nhận → 409, giữ ACCEPTED. Test case: TC_APP_REJECT_002.

### BUG-16 — Nộp được đơn không có CV và không có lời giới thiệu 🟠
- **Hiện tượng:** Nộp được đơn không có CV và không có lời giới thiệu. Phạm vi: Sinh viên / Ứng tuyển (PB-18).
- **Nguyên nhân:** Không kiểm tra nội dung hồ sơ tối thiểu (FR-04).
- **Cách sửa:** Bắt buộc CV hoặc lời giới thiệu (backend + form ứng tuyển).
- **Kiểm chứng:** Đơn trống → 400, không lưu; đơn chỉ có CV → 201. Test case: TC_APPLY_004.

### BUG-15 — Tạo được tin không có hạn nộp hồ sơ 🟠
- **Hiện tượng:** Tạo được tin không có hạn nộp hồ sơ. Phạm vi: Nhà tuyển dụng / Tạo tin (PB-13).
- **Nguyên nhân:** Validator chỉ kiểm tra hạn nộp khi có giá trị.
- **Cách sửa:** Bắt buộc hạn nộp khi tạo tin; khi sửa tin để trống thì giữ hạn cũ.
- **Kiểm chứng:** Thiếu hạn/lương/địa điểm → 400 từng trường. Test case: TC_JOB_CREATE_008.

### BUG-14 — Backend Docker không gửi được thư khôi phục; production chưa có SMTP vẫn báo "đã gửi mã" 🟡
- **Hiện tượng:** Backend Docker không gửi được thư khôi phục; production chưa có SMTP vẫn báo "đã gửi mã". Phạm vi: Triển khai / Email.
- **Nguyên nhân:** Thiếu biến SMTP trong docker-compose; dịch vụ email giả lập thành công khi không có SMTP.
- **Cách sửa:** Cấu hình SMTP (Mailpit local, hỗ trợ Gmail); production thiếu SMTP → báo lỗi 503 và hủy mã.
- **Kiểm chứng:** Mailpit nhận mã 6 số, hạn 15 phút; tắt máy chủ thư → 503, mã bị hủy. Test case: TC_RESET_STU_003, TC_RESET_EMP_003.

### BUG-13 — Email chưa đăng ký nhận thông báo chung, không báo "không tìm thấy Email" như AC2 🟡
- **Hiện tượng:** Email chưa đăng ký nhận thông báo chung, không báo "không tìm thấy Email" như AC2. Phạm vi: Xác thực / Khôi phục mật khẩu.
- **Nguyên nhân:** Phản hồi trung lập chống dò email.
- **Cách sửa:** Trả 404 "Không tìm thấy tài khoản…"; giới hạn 5 yêu cầu/15 phút để hạn chế dò.
- **Kiểm chứng:** Email không tồn tại → 404 đúng thông báo. Test case: TC_RESET_STU_002, TC_RESET_EMP_002.

### BUG-12 — Mật khẩu 7 ký tự vẫn được chấp nhận (đặc tả tối thiểu 8) 🟡
- **Hiện tượng:** Mật khẩu 7 ký tự vẫn được chấp nhận (đặc tả tối thiểu 8). Phạm vi: Xác thực / Chính sách mật khẩu.
- **Nguyên nhân:** Ngưỡng cấu hình 6 ký tự.
- **Cách sửa:** Ngưỡng chung MIN_PASSWORD_LENGTH = 8 cho đăng ký, khôi phục, đổi mật khẩu (backend + giao diện).
- **Kiểm chứng:** 7 ký tự → 400; 8 và 9 ký tự → hợp lệ. Test case: TC_REG_STU_008, TC_RESET_STU_008, TC_RESET_EMP_008.

### BUG-11 — Đăng xuất chỉ xóa phiên trình duyệt; token cũ vẫn gọi được API tới khi hết hạn (7 ngày) 🟠
- **Hiện tượng:** Đăng xuất chỉ xóa phiên trình duyệt; token cũ vẫn gọi được API tới khi hết hạn (7 ngày). Phạm vi: Xác thực / Đăng xuất (PB-03, PB-09, PB-12).
- **Nguyên nhân:** Không có API đăng xuất, JWT không bị thu hồi phía server.
- **Cách sửa:** Thêm POST /auth/logout + cột users.tokens_valid_after (migration 020); middleware từ chối token phát hành trước mốc.
- **Kiểm chứng:** Sau đăng xuất: /auth/me và API riêng tư trả 401; đăng nhập lại dùng bình thường. Test case: TC_LOGOUT_STU_002/004, TC_LOGOUT_EMP_002/004, TC_LOGOUT_ADM_002/004.

### BUG-10 — Gửi chỉ email + mật khẩu mới tới /auth/reset-password là đổi được mật khẩu của bất kỳ tài… 🔴
- **Hiện tượng:** Gửi chỉ email + mật khẩu mới tới /auth/reset-password là đổi được mật khẩu của bất kỳ tài khoản nào, không cần mã OTP. Phạm vi: Xác thực / Khôi phục mật khẩu (PB-04, PB-10).
- **Nguyên nhân:** Luồng "đặt lại trực tiếp" bỏ qua bước xác minh mã.
- **Cách sửa:** Bắt buộc email + mã OTP 6 số gửi qua email (hạn 15 phút, chỉ lưu SHA-256); sai 5 lần hủy mã; giao diện quên mật khẩu 2 bước.
- **Kiểm chứng:** Không có OTP → 400, OTP sai → 400, mật khẩu không đổi; OTP đúng đổi được; dùng lại mã → 400. Test case: TC_RESET_STU_006, TC_RESET_EMP_006.

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
