# JobNest Design System Tokens Reference

Tài liệu tham chiếu chuẩn xác cho toàn bộ hệ thống màu sắc, kiểu chữ và kích thước giao diện trong JobNest.

---

## 1. Bảng màu thương hiệu (Brand Palette)
- **Primary — Soft Lavender:**
  - Base: `#7565A8` (Nút bấm chính, liên kết, trạng thái kích hoạt)
  - Light Tint: `#F1EEF8` (Nền active sidebar, badge nền nhạt)
  - Hover: `#635394`
  - Border: `#D8B4FE` / `#DDD6FE`
- **Accent — Warm Peach:**
  - Base: `#F4B99D` (Điểm nhấn ấm áp, sao đánh giá, việc làm gấp)
  - Light Tint: `#FDF2E9`
  - Dark Accent: `#EA580C`
- **Neutral Palette:**
  - Page Background: `#F8F7FB` (Tím xám nhạt) hoặc `#F8FAFC`
  - Card Surface: `#FFFFFF`
  - Text Primary: `#0F172A` / `#1E293B`
  - Text Secondary: `#475569` / `#64748B`
  - Text Muted: `#94A3B8`
  - Border: `#E2E8F0`

## 2. Thang đo Spacing (4px Base Grid)
- 4px (`gap-1`, `p-1`)
- 8px (`gap-2`, `p-2`)
- 12px (`gap-3`, `p-3`)
- 16px (`gap-4`, `p-4`)
- 24px (`gap-6`, `p-6`)
- 32px (`gap-8`, `p-8`)

## 3. Bo góc (Border Radius)
- Nút bấm & Badge: `6px` đến `8px` (`rounded-md` / `rounded-lg`)
- Thẻ Card & Hộp thoại: `12px` đến `14px` (`rounded-xl`)
- Tuyệt đối không dùng `rounded-3xl` hoặc bo tròn vô tội vạ cho các khối dữ liệu.

## 4. Tiêu chuẩn tiếp cận (Accessibility - WCAG 2.1 AA)
- Tỷ lệ tương phản chữ và nền $\ge 4.5:1$ cho văn bản thường và $\ge 3:1$ cho văn bản lớn.
- Kích thước vùng bấm tối thiểu: $44 \times 44\text{ px}$.

