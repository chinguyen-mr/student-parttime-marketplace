# Prompt Template: Triển khai tính năng mới (Feature Implementation)

```markdown
## YÊU CẦU TRIỂN KHAI TÍNH NĂNG
- **Tên tính năng:** [Tên tính năng cần thêm]
- **Phân hệ:** [Sinh viên / Doanh nghiệp / Quản trị viên]
- **Tài liệu tham chiếu:** [SRS / Wireframe / Use Case tương ứng]

## QUY TRÌNH THỰC HIỆN
1. **Phân tích tác động:**
   - Chạy `node .gitnexus/run.cjs impact "<symbol>" --direction upstream --repo .` trước khi sửa.
2. **Triển khai Backend (nếu có):**
   - Tuân thủ kiến trúc 3 tầng: Route -> Controller -> Service.
   - Luôn sử dụng parameterized queries với PostgreSQL.
   - Thêm integration test case vào `03_backend/tests/integration/`.
3. **Triển khai Frontend (nếu có):**
   - Sử dụng React 19 + Tailwind CSS.
   - Đảm bảo đầy đủ 4 trạng thái UI: Loading skeleton, Empty state, Error alert, Success confirmation.
   - Giữ vững bảng màu Soft Lavender (#7565A8) & Warm Peach (#F4B99D).
4. **Kiểm tra chất lượng:**
   - `cd 03_backend && npm test` (100% pass).
   - `cd 04_frontend && npm run build` (0 error).
```

