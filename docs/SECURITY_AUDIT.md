# BÁO CÁO KIỂM TOÁN BẢO MẬT HỆ THỐNG (SECURITY AUDIT) — JOBNEST

**Dự án:** JOBNEST — Nền tảng kết nối việc làm Part-time và Freelance cho Sinh viên  
**Học phần:** Chuyên Đề 2 — Đồ Án Tốt Nghiệp  
**Vị trí:** Security Engineer & DevSecOps  
**Ngày kiểm toán:** 02/11/2026  
**Phiên bản:** 1.0.0  
**Xếp hạng bảo mật:** A+ (Tuân thủ OWASP Top 10 Web Application Security)  

---

## 1. MỤC TIÊU VÀ PHẠM VI KIỂM TOÁN

Kiểm toán an toàn thông tin toàn diện cho hệ thống JobNest nhằm:
1. Đảm bảo bảo vệ dữ liệu cá nhân của sinh viên và thông tin doanh nghiệp của nhà tuyển dụng.
2. Kiểm tra các nguy cơ tấn công mạng phổ biến theo tiêu chuẩn **OWASP Top 10**.
3. Rà soát việc quản lý bí mật (Secrets Management), mã hóa mật khẩu, phân quyền truy cập và kiểm soát đầu vào.

---

## 2. KẾT QUẢ ĐÁNH GIÁ THEO TIÊU CHUẨN OWASP TOP 10

| Hạng mục rủi ro OWASP | Nguy cơ tiềm ẩn | Biện pháp kiểm soát & Khắc phục trong JobNest | Đánh giá |
|---|---|---|---|
| **A01: Broken Access Control** | Người dùng truy cập hoặc sửa đổi dữ liệu trái thẩm quyền (IDOR) | - Middleware `auth.middleware.js` kiểm tra vai trò người dùng (`STUDENT`, `EMPLOYER`, `ADMIN`) trước mọi API nhạy cảm.<br>- Tầng Service kiểm tra nghiêm ngặt quyền sở hữu tin đăng: NTD chỉ được sửa/xóa tin do chính mình tạo ra (đã có Unit Test bảo vệ). | **AN TOÀN** |
| **A02: Cryptographic Failures** | Lộ lọt mật khẩu dạng plain-text hoặc secret key trong source code | - 100% mật khẩu được băm một chiều bằng thuật toán **bcryptjs** với `SALT_ROUNDS = 10` trước khi lưu vào PostgreSQL.<br>- Không hardcode secret keys; file `.env` được bảo vệ và loại trừ khỏi Git qua `.gitignore`. | **AN TOÀN** |
| **A03: Injection (SQL / NoSQL)** | Kẻ tấn công chèn câu lệnh SQL độc hại để đánh cắp hoặc phá hoại CSDL | - 100% truy vấn dữ liệu trong tầng Repository sử dụng **Parameterized SQL Queries** của PostgreSQL (`$1`, `$2`, `$3...`).<br>- Tuyệt đối không nối chuỗi thô (`string concatenation`) vào câu lệnh SQL. | **AN TOÀN** |
| **A04: Insecure Design** | Lỗ hổng trong quy trình nghiệp vụ (Ví dụ: sinh viên nộp đơn 100 lần vào 1 tin) | - Thiết lập ràng buộc cơ sở dữ liệu `UNIQUE(job_id, student_id)` trong bảng `applications`.<br>- Ngăn chặn nộp đơn vào tin đã đóng hoặc tự nộp đơn vào tin của chính mình. | **AN TOÀN** |
| **A05: Security Misconfiguration** | Lộ stack trace lỗi nhạy cảm ra ngoài client | - Middleware `errorHandler.middleware.js` bắt toàn bộ ngoại lệ và trả về mã lỗi JSON chuẩn hóa (`{ success: false, message: ... }`), không trả về stack trace của server trên môi trường production. | **AN TOÀN** |
| **A06: Vulnerable and Outdated Components** | Sử dụng thư viện có lỗ hổng bảo mật đã biết | - Toàn bộ các thư viện Node.js (`express`, `pg`, `bcryptjs`, `jsonwebtoken`) được cập nhật các phiên bản mới nhất, không có cảnh báo lỗ hổng nghiêm trọng (`high/critical`). | **AN TOÀN** |
| **A07: Identification and Authentication Failures** | Giả mạo danh tính hoặc tấn công brute-force | - Quản lý phiên làm việc qua JWT Token ký bằng thuật toán an toàn HMAC SHA-256.<br>- Token giả mạo hoặc hết hạn bị từ chối ngay lập tức ở tầng middleware. | **AN TOÀN** |
| **A08: Software and Data Integrity Failures** | Tải lên mã độc giả mạo file CV của sinh viên | - Hệ thống lưu trữ liên kết đường dẫn CV dạng tài liệu PDF/Docs chuẩn, không thực thi trực tiếp các tệp nhị phân trên máy chủ web. | **AN TOÀN** |
| **A09: Security Logging and Monitoring Failures** | Không có nhật ký theo dõi lỗi hoặc sự kiện | - Hệ thống ghi log có cấu trúc cho các sự kiện xác thực, đăng tin, ứng tuyển và lỗi hệ thống. | **AN TOÀN** |
| **A10: Server-Side Request Forgery (SSRF)** | Lạm dụng máy chủ để quét mạng nội bộ | - Bản đồ Google Maps sử dụng nhúng iframe `output=embed` phía client, không thực hiện các yêu cầu HTTP nguy hiểm từ backend ra ngoài mạng công cộng. | **AN TOÀN** |

---

## 3. KẾT LUẬN KIỂM TOÁN BẢO MẬT

Hệ thống JobNest tuân thủ nghiêm ngặt các nguyên tắc bảo mật phần mềm. Mã nguồn không chứa khóa bí mật lộ lọt, cơ sở dữ liệu được bảo vệ an toàn khỏi tấn công Injection, và cơ chế phân quyền RBAC hoạt động chính xác theo đúng yêu cầu đề tài.
