# QUY CHUẨN THIẾT KẾ GIAO DIỆN FRONTEND (CHỐNG GIAO DIỆN AI ĐẠI TRÀ)

> **Phạm vi áp dụng:** Áp dụng bắt buộc cho tất cả các tác vụ thiết kế và lập trình giao diện Frontend (React.js, Tailwind CSS) trong dự án Marketplace Việc làm Part-time Sinh viên.

---

## 1. NGUYÊN TẮC CỐT LÕI (CORE PRINCIPLES)

1. **Hierarchy beats decoration (Thứ bậc quan trọng hơn trang trí):** Thiết lập độ rõ ràng của bố cục bằng khoảng cách, kích thước, độ đậm nhạt và độ tương phản đen-trắng trước khi thêm màu sắc.
2. **Restraint beats trend-chasing (Tiết chế hơn chạy theo trào lưu):** Giao diện hướng đến tính trung thực, nghiêm túc, tốc độ cao như *Linear, Stripe, Raycast, GitHub*.
3. **Design DNA riêng cho Nền tảng:** Phù hợp với đối tượng sinh viên đại học (ĐH Văn Lang) và nhà tuyển dụng địa phương: trực quan, tin cậy, rõ ràng mức lương theo giờ/ca, vị trí cụ thể và quy trình ứng tuyển minh bạch.

---

## 2. CÁC MẪU BỊ CẤM TUYỆT ĐỐI (BANNED PATTERNS — ANTI-AI SLOP)

❌ **1. Không lạm dụng Gradient:** Cấm dùng gradient tím/xanh bão hòa (`from-purple-600 to-indigo-600`) làm nền hoặc nút bấm đại trà. Ưu tiên màu nền phẳng (solid), sạch sẽ (`bg-white`, `bg-slate-50`, `bg-slate-900`).  
❌ **2. Không lạm dụng Glassmorphism:** Cấm dùng nền kính mờ trôi nổi (`backdrop-blur-md bg-white/10`) với viền phát sáng (glow) gây nhức mắt và khó đọc dữ liệu.  
❌ **3. Không bo góc quá mức:** Giới hạn bo góc card tối đa 8px–12px (`rounded-lg` hoặc `rounded-xl`). Cấm dùng `rounded-3xl` hoặc bo tròn dạng viên thuốc (pill) bừa bãi cho card dữ liệu.  
❌ **4. Không dùng bóng đổ kịch tính:** Cấm shadow quá đậm hoặc blur 24px+. Chỉ dùng shadow tinh tế: `shadow-sm` hoặc `0 1px 3px rgba(0,0,0,0.08)`.  
❌ **5. Không đặt nhãn thừa (Eyebrow labels):** Cấm các dòng chữ nhỏ vô nghĩa in hoa trên tiêu đề (`<small>DISCOVER YOUR FUTURE</small>`).  
❌ **6. Không dùng nội dung giả vô nghĩa (Filler/Lorem Ipsum):** Mọi tin tuyển dụng, mức lương, địa chỉ và đánh giá phải là dữ liệu thực tế mô phỏng sát thị trường việc làm sinh viên TP.HCM.

---

## 3. BẢNG MÀU & HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM)

- **Màu thương hiệu chủ đạo (Primary):** `Navy Blue / Indigo trầm` (`#1e293b`, `#0f172a`, `#2563eb`) đại diện cho sự tin cậy học thuật và tính chuyên nghiệp.
- **Màu nhấn hành động (Accent/Highlight):** `Amber / Emerald` (`#f59e0b`, `#10b981`) cho trạng thái lương thưởng, đánh giá sao, và tin tuyển dụng đang mở.
- **Màu nền & Viền:** 
  - Nền trang: `#f8fafc` (slate-50) hoặc `#ffffff`.
  - Nền thẻ/Card: `#ffffff` với viền mảnh 1px `#e2e8f0` (slate-200).
- **Thang khoảng cách (Spacing Scale):** Tuân thủ nghiêm ngặt bội số 4px: `4px (1)`, `8px (2)`, `12px (3)`, `16px (4)`, `24px (6)`, `32px (8)`. Không dùng margin/padding ngẫu nhiên.
- **Hiệu ứng chuyển động (Motion):** Tối đa 150ms–200ms `ease-out`. Chỉ chuyển đổi opacity hoặc màu nền; cấm hiệu ứng nảy (bouncy) hoặc xoay chuyển biến dạng (transform rotate).

---

## 4. BẮT BUỘC ĐẦY ĐỦ CÁC TRẠNG THÁI GIAO DIỆN (UI STATES)

Mỗi màn hình và component phải có đủ 6 trạng thái:
1. **Normal / Default:** Rõ ràng, độ tương phản văn bản đạt chuẩn WCAG AA ($\ge 4.5:1$).
2. **Hover:** Tăng nhẹ độ đậm màu viền hoặc chuyển màu nền nhẹ nhàng (`hover:bg-slate-100`).
3. **Focus:** Vành focus rõ ràng (`focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`).
4. **Disabled:** Giảm opacity xuống 50%, con trỏ `cursor-not-allowed`, cấm kích hoạt sự kiện.
5. **Loading:** Dùng Skeleton shimmer có cấu trúc tương ứng với nội dung thật, không dùng spinner quay đơn điệu ở giữa trang.
6. **Empty / Error:** Có thông điệp hướng dẫn rõ ràng kèm nút hành động khắc phục (Action CTA), ví dụ: *"Chưa có đơn ứng tuyển nào — Hãy tìm và nộp hồ sơ vào các việc làm mới nhất"*.

---

## 5. THỰC THI TRONG QUY TRÌNH KHI AGENT PHÁT TRIỂN CODE
Trước khi viết markup hoặc component:
1. Tham chiếu skill `no-slop-ui` và `.agents/skills/no-slop-ui/references/banned-patterns.md`.
2. Kiểm tra ngữ cảnh dự án trong `.better-web-ui.md`.
3. Áp dụng component anatomy từ `.agents/skills/better-web-ui/reference/component-anatomy.md`.
