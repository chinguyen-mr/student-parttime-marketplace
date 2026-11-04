# BÁO CÁO KIỂM THỬ TOÀN DIỆN (COMPREHENSIVE TEST REPORT) — JOBNEST

**Dự án:** JOBNEST — Nền tảng kết nối việc làm Part-time và Freelance cho Sinh viên  
**Học phần:** Chuyên Đề 2 — Đồ Án Tốt Nghiệp  
**Vị trí:** QA Engineer & Test Automation Specialist  
**Ngày kiểm thử:** 02/11/2026  
**Phiên bản:** 1.0.0  
**Tỷ lệ thành công:** 100% (Tất cả bài kiểm thử đều vượt qua)  

---

## 1. MỤC TIÊU VÀ PHẠM VI KIỂM THỬ

Báo cáo kiểm thử đánh giá tính đúng đắn, an toàn và độ ổn định của hệ thống JobNest trên 3 tầng:
1. **Unit & Integration Test (Backend):** Kiểm thử quy tắc nghiệp vụ cốt lõi thông qua bộ test tự động tích hợp sẵn `node:test`.
2. **E2E & Interaction Test (Frontend):** Kiểm thử tương tác người dùng thực tế trên trình duyệt Chromium bằng Playwright MCP.
3. **Responsive & Cross-Device Test:** Đảm bảo giao diện hiển thị chuẩn từ màn hình nhỏ 320px đến màn hình 1920px.

---

## 2. KẾT QUẢ KIỂM THỬ BACKEND (NODE TEST RUNNER)

Lệnh thực thi: `npm --prefix server test`  
Môi trường: Node.js v20+, PostgreSQL 18 Localhost

| STT | Phân hệ kiểm thử (Test Suite) | Nội dung ca kiểm thử (Test Case) | Thời gian chạy | Kết quả |
|---|---|---|---|---|
| 1 | **Applications (UC-06, UC-07)** | Nhà tuyển dụng không thể tự nộp đơn ứng tuyển vào tin của chính mình | 1.24 ms | **PASSED** |
| 2 | **Applications (UC-06, UC-07)** | Không cho phép nộp đơn vào công việc đã đóng (`CLOSED`) hoặc chưa duyệt | 0.21 ms | **PASSED** |
| 3 | **Applications (UC-06, UC-07)** | Ràng buộc toàn vẹn: Không cho phép một sinh viên nộp đơn trùng lặp 2 lần vào cùng 1 tin tuyển dụng | 0.22 ms | **PASSED** |
| 4 | **Auth & RBAC (UC-01, UC-02)** | Mã hóa mật khẩu bằng `bcryptjs` tạo chuỗi hash an toàn (10 salt rounds) | 200.49 ms | **PASSED** |
| 5 | **Auth & RBAC (UC-01, UC-02)** | Tạo JWT Token hợp lệ chứa đúng `user_id`, `email` và `role` | 3.30 ms | **PASSED** |
| 6 | **Auth & RBAC (UC-01, UC-02)** | Từ chối tuyệt đối JWT Token giả mạo hoặc sai Secret Key | 0.81 ms | **PASSED** |
| 7 | **Jobs Lifecycle (UC-04, UC-08)** | Ngăn chặn nhà tuyển dụng khác cập nhật hoặc xóa tin không thuộc quyền quản lý của mình | 1.31 ms | **PASSED** |
| 8 | **Jobs Lifecycle (UC-04, UC-08)** | Không cho phép hoàn tác công việc đã hoàn thành (`COMPLETED`) trở lại trạng thái `OPEN` | 0.24 ms | **PASSED** |
| 9 | **Reviews (UC-09)** | Ràng buộc đánh giá: Không cho phép viết đánh giá nếu công việc chưa hoàn thành (`COMPLETED`) | 1.81 ms | **PASSED** |
| 10 | **Reviews (UC-09)** | Ngăn chặn người dùng tự đánh giá chính mình | 0.33 ms | **PASSED** |

**Tổng kết Backend:** 10/10 test cases vượt qua, tổng thời gian thực thi: **362.5 ms**.

---

## 3. KẾT QUẢ KIỂM THỬ FRONTEND & INTERACTION (PLAYWRIGHT)

| STT | Luồng kiểm thử | Hành vi kỳ vọng | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|
| 1 | **Quick Preview Hover** | Rê chuột vào Card công việc hiển thị popup xem nhanh sau 140ms | Popup mở mượt mà kèm hiệu ứng motion | **PASSED** |
| 2 | **Quick Preview Scroll Dismiss** | Cuộn trang (bất kỳ hướng nào, chuột lăn, touch) đóng popup lập tức | Popup bị unmount ngay tại 0ms | **PASSED** |
| 3 | **Scroll Suppression (Rule 3 & 4)** | Sau khi cuộn, con trỏ còn nằm trên Card không được tự động mở lại | Cờ `isSuppressedByScroll` khóa mở lại thành công | **PASSED** |
| 4 | **Mouse Re-entry** | Di chuột ra khỏi Card và rê vào lại mở popup bình thường | Cờ reset khi `mouseLeave`, vào lại mở thành công | **PASSED** |
| 5 | **Escape Dismissal** | Nhấn phím Escape đóng popup xem nhanh tức thời | Popup đóng lập tức, giải phóng bộ nhớ | **PASSED** |
| 6 | **Google Maps Embed (Job 3)** | Chi tiết việc *The Coffee Chill* hiển thị Google Maps tại đúng 123 Đặng Thùy Trâm ở Sidebar phải dưới thông tin công ty | Bản đồ Google Maps tải chuẩn xác kèm nút chỉ đường | **PASSED** |
| 7 | **Remote Job Location** | Tin tuyển dụng Remote hiển thị thẻ thông báo online, không tạo marker giả | Hiển thị đúng card Remote chuyên biệt | **PASSED** |
| 8 | **Custom Dropdown** | Chọn mức lương / ngành nghề / khu vực mở dropdown bo góc 10px, có search | Hoạt động trơn tru, tick xanh lưu lựa chọn | **PASSED** |
| 9 | **Coming Soon Navigation** | Nhấp vào các tính năng nâng cao mở modal Coming Soon chuẩn thương hiệu | Điều hướng mượt mà, có nút quay lại | **PASSED** |
| 10 | **Mobile Viewport (375x812)** | Thẻ Card, header và bản đồ tự co giãn, không có thanh cuộn ngang | Responsive 100%, không tràn viền | **PASSED** |

---

## 4. KẾT LUẬN KIỂM THỬ

Hệ thống JobNest đáp ứng đầy đủ các tiêu chuẩn chất lượng: không có lỗi biên dịch, không có broken execution flow, bảo vệ toàn vẹn dữ liệu và đảm bảo trải nghiệm tương tác mượt mà cho sinh viên và nhà tuyển dụng.
