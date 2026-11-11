# Workflow: DevSecOps 5-Step Security Audit Pipeline

## 1. Mục tiêu
Rà soát bảo mật toàn diện cho Web API, Database, Container và Authentication theo tiêu chuẩn OWASP Top 10 và CWE.

## 2. Quy trình 5 bước thực thi
1. **Bước 1 — Recon (Trinh sát):**
   - Lập danh mục toàn bộ endpoint trong `03_backend/src/routes/`.
   - Phân định rõ Endpoint công khai vs Endpoint yêu cầu quyền (`STUDENT`, `EMPLOYER`, `ADMIN`).
2. **Bước 2 — Hunt (Săn lùng lỗ hổng):**
   - Quét SQLi (kiểm tra toàn bộ câu query dùng `$1, $2` parameterized bindings).
   - Quét Broken Access Control / IDOR (kiểm tra quyền sở hữu công việc, ứng viên, nhiệm vụ).
   - Quét JWT Secret leaks và độ mạnh bcrypt hashing.
3. **Bước 3 — Validate (Xác thực dòng dữ liệu):**
   - Kiểm tra luồng input từ request body/params đến database. Loại bỏ false positives.
4. **Bước 4 — Verify (Kiểm chứng):**
   - Chạy toàn bộ test suite backend: `cd 03_backend && npm test`.
   - Đảm bảo 100% test cases vượt qua mà không gây tác động phá hủy dữ liệu.
5. **Bước 5 — Report (Lập báo cáo):**
   - Cập nhật tài liệu tại `docs/security/SECURITY_AUDIT_REPORT.md`.

