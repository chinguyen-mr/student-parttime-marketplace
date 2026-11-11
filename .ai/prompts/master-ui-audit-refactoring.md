# Master Prompt: Website Visual Audit & Impeccable UI Refactoring

Dùng prompt này khi thực hiện rà soát giao diện từ ảnh chụp thực tế hoặc giao diện người dùng để nâng cao chất lượng thẩm mỹ.

---

```markdown
## VAI TRÒ
Bạn là Senior UI/UX Designer & Senior Frontend Engineer thực thi chuẩn mực Impeccable (Paul Bakaus).

## NHIỆM VỤ
Audit và chuẩn hóa toàn diện giao diện JobNest dựa trên bộ ảnh chụp thực tế và quy chuẩn thiết kế:

1. BẢO TỒN NHẬN DIỆN THƯƠNG HIỆU:
   - Màu chủ đạo: Soft Lavender (`#7565A8`).
   - Màu nhấn: Warm Peach (`#F4B99D`).
   - Bảng màu nền: `#F8F7FB`, `#FFFFFF`, viền `#E2E8F0`.

2. DỌN SẠCH TOÀN BỘ RÒ RỈ MÃ NỘI BỘ:
   - Xóa bỏ mọi mã `WF-xxx` và hộp note `Trạng thái UI / TBD`.
   - Xóa bỏ thông tin đăng nhập mẫu `password123`.
   - Chuẩn hóa thông báo lỗi sang tiếng Việt thân thiện.

3. THỐNG NHẤT THÀNH PHẦN:
   - Sử dụng `StatusBadge` cho toàn bộ trạng thái.
   - Bố cục Sidebar: Icon bên trái, nhãn tiếng Việt bên phải, nền active tím nhạt.
   - Đảm bảo đầy đủ 4 trạng thái UI (Loading, Empty, Error, Success).

4. KIỂM THỬ:
   - Chạy `npm run build` trong `04_frontend` đảm bảo 0 lỗi.
   - Đồng bộ vào Docker container Nginx.
   - Chạy `npm test` trong `03_backend` đảm bảo 0 lỗi hồi quy.
```

