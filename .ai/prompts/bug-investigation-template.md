# Prompt Template: Điều tra và khắc phục sự cố (Bug Investigation)

```markdown
## YÊU CẦU ĐIỀU TRA SỰ CỐ
- **Hiện tượng lỗi:** [Mô tả chi tiết lỗi gặp phải]
- **Mã lỗi / Thông báo:** [HTTP code, console error, hoặc stack trace]
- **Môi trường xảy ra:** [Frontend (port 8080) / Backend (port 5000) / Database (port 5433)]

## QUY TRÌNH XỬ LÝ
1. **Truy vết nguyên nhân gốc rễ (Root Cause Analysis):**
   - Sử dụng kỹ năng `gitnexus-debugging` hoặc `graphify explain` để khoanh vùng.
   - Không đoán mò; đọc kỹ logs và error trace.
2. **Sửa đổi phẫu thuật (Surgical Fix):**
   - Chỉ chỉnh sửa đúng vị trí phát sinh lỗi.
   - Không format lại code xung quanh hoặc thay đổi logic không liên quan.
3. **Kiểm chứng hồi quy:**
   - Viết test case tái hiện lỗi và đảm bảo test pass sau khi sửa.
   - Chạy `cd 03_backend && npm test`.
   - Chạy `cd 04_frontend && npm run build`.
```

