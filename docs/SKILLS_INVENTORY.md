# KIỂM KÊ VÀ ĐÁNH GIÁ KỸ NĂNG AI (SKILLS INVENTORY) — JOBNEST

**Dự án:** JOBNEST — Nền tảng kết nối việc làm Part-time và Freelance cho Sinh viên  
**Học phần:** Chuyên Đề 2 — Đồ Án Tốt Nghiệp  
**Vị trí:** AI Coding Agent & Software Architect  
**Ngày thực hiện:** 02/11/2026  
**Phiên bản:** 1.0.0  

---

## 1. TỔNG QUAN HỆ THỐNG SKILLS TRONG DỰ ÁN

Hệ thống kỹ năng (Skills) cung cấp các bộ chỉ dẫn chuyên sâu theo từng ngữ cảnh kỹ thuật, giúp quá trình kiểm tra mã nguồn, phân tích tác động và thiết kế UI/UX đạt chuẩn chất lượng cao nhất mà không bị vi phạm các quy tắc nghiệp vụ.

---

## 2. BẢNG KIỂM KÊ CÁC SKILLS HIỆN CÓ

| Tên Skill | Đường dẫn / Nguồn | Vấn đề giải quyết | Giai đoạn áp dụng | Kết quả áp dụng vào JobNest |
|---|---|---|---|---|
| **better-web-ui** | `.agents/skills/better-web-ui/SKILL.md` | Xây dựng giao diện web đẳng cấp, phân cấp thị giác rõ ràng, bảng màu HSL hài hòa, tránh các mẫu thiết kế sơ sài kiểu AI | Giai đoạn 4 & 5 (Design System & Frontend) | Thiết lập hệ thống typography Inter, bo góc `12-14px`, đổ bóng nhẹ `0 1px 3px rgba(89,70,117,0.03)` và custom scrollbar tinh tế |
| **no-slop-ui** | `.agents/skills/no-slop-ui/SKILL.md` | Rà soát và loại bỏ các lỗi UI thường gặp của AI (màu sắc quá rực rỡ, gradient lòe loẹt, nút giả, layout vỡ) | Giai đoạn 4 & 8 (UI Review & Testing) | Giữ giao diện restrained, nền `#F8F7FB` thanh lịch, tông màu Soft Lavender & Peach tự nhiên |
| **frontend-design-workflow** | `.agents/skills/frontend-design-workflow/SKILL.md` | Quy trình thiết kế frontend bài bản từ nghiên cứu đối thủ, token hóa thiết kế, accessibility và responsive | Giai đoạn 4 (Design System) | Xây dựng token thiết kế CSS chuẩn mực, chuẩn hóa 14 Wireframe Screens |
| **gitnexus-impact-analysis** | `.claude/skills/gitnexus-impact-analysis/SKILL.md` | Phân tích đồ thị phụ thuộc (Call Graph) trước khi sửa đổi symbol, đánh giá phạm vi ảnh hưởng (Blast Radius) | Giai đoạn 1, 5, 6, 8 (Refactoring & Code Changes) | Phân tích tác động trước khi sửa `JobLocationMap`, `JobCard`, `JobQuickPreview`, đảm bảo 0 broken execution flows |
| **gitnexus-exploring** | `.claude/skills/gitnexus-exploring/SKILL.md` | Khám phá cấu trúc kiến trúc, cụm chức năng (Clusters) và quy trình thực thi (Processes) | Giai đoạn 1 & 2 (Audit & Tracing) | Hiểu sâu luồng dữ liệu 3 tầng của backend Express và quan hệ giữa các controller |
| **gitnexus-debugging** | `.claude/skills/gitnexus-debugging/SKILL.md` | Truy vết lỗi logic và sự cố tương tác | Giai đoạn 8 (Bug Fixing) | Hỗ trợ phân tích và khắc phục triệt để lỗi Quick Preview không tự đóng khi cuộn trang |
| **agy-customizations** | Built-in Antigravity | Hướng dẫn định dạng rules, customizations, skills và hooks | Toàn bộ dự án | Đảm bảo tuân thủ cấu trúc tùy biến chuẩn của Antigravity |

---

## 3. ĐÁNH GIÁ BẢO MẬT VÀ XUNG ĐỘT SKILLS

1. **Kiểm tra mã độc & Scripts thực thi:**
   - Tất cả các Skills trong `.agents/skills/` và `.claude/skills/` đều là các tài liệu Markdown hướng dẫn (Declarative Rules & Workflows), không chứa script thực thi nhị phân hoặc mã độc gây hại cho hệ thống.
2. **Kiểm tra xung đột quy tắc:**
   - Không có xung đột giữa các rules UI (`no-slop-ui`, `better-web-ui`) và các quy tắc kỹ thuật nghiêm ngặt trong `AGENTS.md`. Cả hai đều hướng đến tính chính xác, không dùng code giả và kiểm thử trước khi bàn giao.

---

## 4. KẾT LUẬN

Hệ thống Skills đã được tích hợp chặt chẽ vào quy trình phát triển của JobNest, đóng vai trò như các chuyên gia cố vấn cho từng khía cạnh: UI/UX, phân tích mã nguồn và bảo đảm chất lượng.
