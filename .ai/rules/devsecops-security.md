# QUY CHUẨN AN TOÀN THÔNG TIN & DEVSECOPS (JOBNEST)

> **Phạm vi áp dụng:** Bắt buộc tuân thủ đối với mọi can thiệp vào cơ sở dữ liệu, backend, authentication, phân quyền RBAC và Docker container.

---

## 1. NGUYÊN TẮC AN TOÀN BẤT BIẾN (NON-DESTRUCTIVE)
1. **Kiểm toán hoàn toàn phi phá hủy:**
   - Tuyệt đối không xóa bảng (DROP TABLE), không xóa cơ sở dữ liệu, không xóa dữ liệu người dùng thật hoặc sửa đổi mật khẩu quản trị ngoài môi trường dev.
2. **Bảo mật bí mật và thông tin xác thực:**
   - Không commit các file `.env` chứa mật khẩu thật lên Git.
   - Luôn sử dụng biến môi trường cho `JWT_SECRET`, `DB_PASSWORD`, `TWENTY_API_KEY`.
3. **Phân quyền và bảo vệ Endpoint (RBAC & IDOR):**
   - Mọi endpoint nhạy cảm (ứng tuyển, đánh giá, kiểm duyệt, sửa đổi hồ sơ) phải qua middleware xác thực `authenticateToken` và kiểm tra quyền `requireRole`.
   - Luôn kiểm tra quyền sở hữu tài nguyên (Resource Ownership check): Doanh nghiệp chỉ có quyền quản lý công việc và ứng viên thuộc về tin của chính mình.

---

## 2. QUY TRÌNH KIỂM TOÁN 5 BƯỚC
Mọi đợt rà soát bảo mật lớn phải tuân thủ 5 pha:
1. `Recon`: Lập bản đồ ranh giới tin cậy và phân loại endpoint công khai / bảo vệ.
2. `Hunt`: Quét lỗ hổng theo danh mục OWASP Top 10 (SQLi, XSS, CSRF, IDOR, v.v.).
3. `Validate`: Xác minh dòng dữ liệu từ Source đến Sink, loại bỏ cảnh báo giả.
4. `Verify`: Chạy bộ kiểm thử tự động `npm test` để xác minh an toàn.
5. `Report`: Ghi nhận báo cáo tại thư mục `docs/security/`.

