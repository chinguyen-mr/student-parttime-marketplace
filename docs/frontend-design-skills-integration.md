# BÁO CÁO TÍCH HỢP BỘ SKILL THIẾT KẾ FRONTEND CHỐNG GIAO DIỆN AI ĐẠI TRÀ
**Học phần:** Chuyên đề Tốt nghiệp 2 (Khoa CNTT — Trường Đại học Văn Lang)  
**Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên  
**Ngày thực hiện:** 30/10/2026  
**Trạng thái:** Đã hoàn thành và cài đặt trực tiếp vào Workspace

---

## 1. TỔNG QUAN CÁC REPOSITORY ĐÃ NGHIÊN CỨU

Nhóm đã khảo sát, clone và phân tích chi tiết mã nguồn, giấy phép và tài liệu của 3 repository mã nguồn mở hàng đầu về chống giao diện rập khuôn do AI tạo ra:

| STT | Repository | Giấy phép | Commit Hash khảo sát | Trọng tâm nghiên cứu |
|---|---|---|---|---|
| 1 | [LeoStehlik/no-slop-ui](https://github.com/LeoStehlik/no-slop-ui) | **MIT License** | `3c8f9e5ef5ca18f5632f7b9ad8f95e2d68188bcf` | **Bộ quy tắc cấm khắt khe (Hard Rules) & Banned Patterns:** Cấm gradient tím/xanh, cấm glassmorphism, cấm card bo tròn quá mức, cấm bóng đổ kịch tính, chuẩn hóa bảng màu restrained (Linear/Stripe style). |
| 2 | [nexlabz/frontend-design-workflow](https://github.com/nexlabz/frontend-design-workflow) | **MIT License** | `ccae16cc7b7ae50e8b6c0ff5ed8aa8b7ce5e1d56` | **Quy trình thiết kế trước khi viết code (Phase 0 $\rightarrow$ Phase 6):** Nghiên cứu đối thủ, chọn donor tương đồng nghiệp vụ (marketplace du lịch/đặt phòng), Art direction, xây dựng Design System tokens và Quality Gates. |
| 3 | [aladicf/better-web-ui](https://github.com/aladicf/better-web-ui) | **Apache 2.0 / Modified MIT** | `af21dcfa71d83104a9e0beb04ffedf79f800f53c` | **Thư viện kỹ thuật thành phần UI chuyên sâu (86+ tài liệu tham khảo):** Triết lý *Refactoring UI* (phân cấp xám trước, màu sau), cấu trúc giải phẫu component (`component-anatomy.md`), trạng thái empty states, form UX, accessibility (a11y), và permissions-and-roles-ux. |

---

## 2. PHƯƠNG ÁN LỰA CHỌN VÀ KIẾN TRÚC TÍCH HỢP TRONG DỰ ÁN

Để đảm bảo vừa có quy tắc kiểm soát chặt chẽ (chống AI Slop), vừa có quy trình nghiên cứu chuẩn mực và thư viện giải phẫu component phong phú, toàn bộ tinh hoa của **cả 3 repository** đã được chọn lọc và tích hợp trực tiếp vào dự án:

1. **`no-slop-ui`:** Đóng vai trò là "Bộ lọc an toàn thị giác" (Visual Safety Filter) ngăn chặn ngay từ đầu các thói quen xấu của AI.
2. **`frontend-design-workflow`:** Đóng vai trò là "Quy trình thiết kế có phương pháp" giúp nghiên cứu bối cảnh, chọn donor nghiệp vụ tương đồng và lập Art Direction trước khi viết mã JSX.
3. **`better-web-ui`:** Đóng vai trò là "Cẩm nang kỹ thuật giao diện" hướng dẫn chi tiết về cấu trúc thẻ, phân cấp thị giác, trạng thái rỗng, form validation và tiêu chuẩn tương thích.
4. **`anti-ai-slop-frontend.md` (Workspace Rule):** Quy chuẩn kích hoạt mặc định trong thư mục `.agents/rules/` để Antigravity luôn tự động tuân thủ.
5. **`.better-web-ui.md` (Project Design Context):** Định vị cụ thể Design DNA của thương hiệu Marketplace Sinh viên Văn Lang (tông màu Slate-900 / Blue-600 / Amber-500, font chữ chuẩn, không dùng hình ảnh giả).

---

## 3. ĐƯỜNG DẪN CÀI ĐẶT THỰC TẾ TRONG DỰ ÁN

Tuân thủ đúng chuẩn cấu trúc Customization của Google Antigravity (`.agents/skills/` và `.agents/rules/` tại Workspace Root):

```text
Chuyên Đề 2/
├── .agents/                                      # Thư mục cấu hình Agent ở cấp độ dự án
│   ├── rules/
│   │   └── anti-ai-slop-frontend.md              # Quy chuẩn thiết kế bắt buộc cho mọi prompt UI
│   └── skills/
│       ├── no-slop-ui/                           # Skill chống AI Slop
│       │   ├── SKILL.md                          # Hướng dẫn kích hoạt & Hard rules
│       │   ├── LICENSE                           # Bản quyền MIT
│       │   └── references/
│       │       ├── banned-patterns.md            # Danh mục các mẫu UI bị cấm kèm ví dụ
│       │       └── colour-palettes.md            # Bảng màu chuẩn không đại trà
│       │
│       ├── frontend-design-workflow/             # Skill quy trình thiết kế chuyên nghiệp
│       │   ├── SKILL.md                          # Lộ trình 6 pha thiết kế
│       │   ├── LICENSE                           # Bản quyền MIT
│       │   ├── assets/                           # Mẫu Brief, Direction, Build Kickoff
│       │   └── references/                       # 8 tài liệu định hướng, SEO, Motion, Quality Gates
│       │
│       └── better-web-ui/                        # Skill giải phẫu component & Refactoring UI
│           ├── SKILL.md                          # Hướng dẫn Refactoring UI Operating Model
│           ├── LICENSE                           # Bản quyền dự án
│           └── reference/                        # 86 tài liệu kỹ thuật UI chuyên sâu
│
├── .better-web-ui.md                             # Ngữ cảnh thiết kế riêng của Marketplace VLU
├── docs/
│   └── frontend-design-skills-integration.md     # Tài liệu báo cáo tích hợp này
```

---

## 4. DANH SÁCH CÁC FILE ĐÃ THÊM

| Đường dẫn tệp tin | Nguồn gốc / Đóng góp | Mục đích sử dụng |
|---|---|---|
| `.agents/rules/anti-ai-slop-frontend.md` | Tổng hợp từ 3 repos | Quy tắc thường trực (Always-on Rule) cho agent khi viết mã frontend |
| `.better-web-ui.md` | Ngữ cảnh thực tế Đề tài | Hồ sơ Design DNA thương hiệu (đối tượng, tông màu, thang khoảng cách) |
| `.agents/skills/no-slop-ui/SKILL.md` | `LeoStehlik/no-slop-ui` | File hướng dẫn kích hoạt skill No Slop UI |
| `.agents/skills/no-slop-ui/references/banned-patterns.md` | `LeoStehlik/no-slop-ui` | Danh sách 14 mẫu giao diện bị cấm tuyệt đối |
| `.agents/skills/no-slop-ui/references/colour-palettes.md` | `LeoStehlik/no-slop-ui` | Bảng màu chuyên nghiệp tinh tế (Solid/Restrained) |
| `.agents/skills/frontend-design-workflow/SKILL.md` | `nexlabz/frontend-design-workflow` | Workflow nghiên cứu & định hướng trước khi code |
| `.agents/skills/frontend-design-workflow/references/*` | `nexlabz/frontend-design-workflow` | Bộ 8 cẩm nang Architecture, Design System, Motion, Quality |
| `.agents/skills/better-web-ui/SKILL.md` | `aladicf/better-web-ui` | Phương pháp Refactoring UI (Grayscale hierarchy first) |
| `.agents/skills/better-web-ui/reference/*` | `aladicf/better-web-ui` | 86 tài liệu giải phẫu Component, Empty State, Form validation |

> **Bảo toàn cấu hình:** Không ghi đè tệp `AGENTS.md` (giữ nguyên chỉ mục GitNexus) và thư mục `.claude/`.

---

## 5. CÁCH ANTIGRAVITY KÍCH HOẠT VÀ SỬ DỤNG BỘ SKILL

Theo cơ chế **Progressive Disclosure** của Antigravity:
1. **Tự động nhận diện (Model Decision):** Khi người dùng yêu cầu thiết kế giao diện, chỉnh sửa component hoặc tạo trang mới (ví dụ: *"thiết kế màn hình chi tiết công việc"*, *"làm giao diện nộp đơn ứng tuyển"*), Antigravity đọc thẻ `description` trong YAML frontmatter của `.agents/skills/*/SKILL.md` để tự động nạp skill phù hợp vào ngữ cảnh.
2. **Quy tắc thường trực (Rules enforcement):** Tệp `.agents/rules/anti-ai-slop-frontend.md` tự động được nạp để kiểm tra mọi đoạn mã JSX/Tailwind trước khi xuất ra.
3. **Đọc ngữ cảnh thương hiệu:** Agent sẽ tự động nạp `.better-web-ui.md` để lấy bảng màu chuẩn (`slate-900`, `blue-600`, `amber-500`), cấu trúc phân cấp, không bao giờ tự ý tạo bảng màu tím/hồng ngẫu nhiên.

---

## 6. KẾT QUẢ KIỂM CHỨNG SAU KHI CÀI ĐẶT

1. **Kiểm tra cú pháp YAML Frontmatter của các Skill:**
   - `no-slop-ui`: Hợp lệ, trường `name` và `description` chuẩn YAML.
   - `frontend-design-workflow`: Hợp lệ, trường `name` và `description` chuẩn YAML.
   - `better-web-ui`: Đã cập nhật `name: better-web-ui` duy nhất, không xung đột tên gọi.
2. **Kiểm tra tính toàn vẹn của mã nguồn dự án:**
   - **Backend Unit Tests:** Chạy `npm test` $\rightarrow$ **10/10 test cases PASS (100%)** trong 368ms.
   - **Frontend Production Build:** Chạy `npm --prefix client run build` $\rightarrow$ **Vite build thành công 100% trong 516ms, 0 lỗi**.
   - **Cú pháp linter:** Chạy `npm --prefix client run lint` $\rightarrow$ **0 lỗi cú pháp**.
3. **Kiểm tra trạng thái Git:**
   - **Tuyệt đối không commit:** Toàn bộ các file mới được giữ nguyên ở trạng thái uncommitted đúng theo yêu cầu của bạn, để thành viên nhóm tự xem xét và commit bằng tài khoản cá nhân.

---

## 7. HƯỚNG DẪN ÁP DỤNG CHO NHỮNG LẦN PHÁT TRIỂN TIẾP THEO

Khi bắt đầu code một màn hình mới ở Buổi 6 hoặc các buổi tiếp theo, Agent và lập trình viên sẽ thực hiện theo 4 bước chuẩn hóa:

```
[Bước 1: Đọc Design Context (.better-web-ui.md)]
                    │
                    ▼
[Bước 2: Phân cấp Grayscale & Bố cục không màu (Refactoring UI)]
                    │
                    ▼
[Bước 3: Tra cứu Component Anatomy & Banned Patterns]
  - Thẻ việc làm: Bo góc tối đa 12px, viền 1px, badge lương nổi bật
  - Nút bấm: Solid fill rõ ràng, focus ring chuẩn WCAG
  - Trạng thái: Có Skeleton shimmer khi loading, Empty state có hình + CTA
                    │
                    ▼
[Bước 4: Đối chiếu với Checklist Quality Gates trước khi hoàn tất]
```
