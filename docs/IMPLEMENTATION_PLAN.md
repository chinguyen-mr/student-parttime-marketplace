# KẾ HOẠCH TRIỂN KHAI DỰ ÁN CHI TIẾT (IMPLEMENTATION PLAN) — JOBNEST

**Dự án:** JOBNEST — Nền tảng kết nối việc làm Part-time và Freelance cho Sinh viên  
**Học phần:** Chuyên Đề 2 — Đồ Án Tốt Nghiệp  
**Vị trí:** Senior Software Architect & Project Manager  
**Ngày lập kế hoạch:** 02/11/2026  
**Phiên bản:** 1.0.0  

---

## 1. MỤC TIÊU VÀ NGUYÊN TẮC THỰC HIỆN

Kế hoạch triển khai hướng tới hoàn thiện 100% sản phẩm JobNest theo đúng thứ tự ưu tiên học thuật:
1. **Yêu cầu giảng viên & Đề bài $\rightarrow$ SRS $\rightarrow$ Use Case $\rightarrow$ ERD $\rightarrow$ Product Backlog.**
2. **Không làm giao diện giả (No Mock UI / No Fake Data):** Mọi màn hình và nút bấm phải có chức năng thực tế hoặc điều hướng về Coming Soon / Support modal.
3. **Đồng bộ hóa 14 Wireframe Screens:** Tất cả 14 màn hình wireframe đều có component tương ứng, kết nối API và cơ sở dữ liệu PostgreSQL 18.
4. **Kiểm tra chặt chẽ sau từng Phase:** Build frontend và chạy test backend sau mỗi thay đổi lớn, đảm bảo không có broken flows.

---

## 2. LỘ TRÌNH 10 GIAI ĐOẠN TRIỂN KHAI (10 PHASES)

### Phase 1: Audit & Repository Inventory
- **Mục tiêu:** Kiểm kê toàn diện mã nguồn frontend, backend, CSDL, tài liệu trong `Tài Liệu/` và `docs/`.
- **Đầu ra:** `docs/PROJECT_AUDIT_REPORT.md` (Đã hoàn thành 100%).

### Phase 2: Requirement Mapping & Traceability
- **Mục tiêu:** Đối chiếu SRS 4 mục, 8 FRs, 4 NFRs, 10 Use Cases và 45 Product Backlog Items.
- **Đầu ra:** `docs/REQUIREMENT_TRACEABILITY_MATRIX.md` (Đã hoàn thành 100%).

### Phase 3: Open Source & Skills Research
- **Mục tiêu:** Nghiên cứu kiến trúc mã nguồn mở tuyển dụng thực tế và hệ thống AI Skills.
- **Đầu ra:** `docs/OPEN_SOURCE_RESEARCH.md` & `docs/SKILLS_INVENTORY.md` (Đã hoàn thành 100%).

### Phase 4: UI/UX Design System Standardization
- **Mục tiêu:** Chuẩn hóa bảng màu **Soft Lavender & Peach** (`#7565A8`, `#F4B99D`, `#F8F7FB`, `#29263A`), đồng bộ `index.css`, bắt buộc sử dụng `Tài Liệu/Logo.jpg`.
- **Đầu ra:** `docs/UI_UX_DESIGN_SYSTEM.md`, cập nhật `client/src/index.css` (Đã hoàn thành 100%).

### Phase 5: Frontend Refinement & Component Synchronization
- **Mục tiêu:** 
  - Rà soát toàn bộ 14 màn hình Wireframe trong `App.jsx`, `JobDetailPage.jsx`, `LoginPage.jsx`.
  - Tối ưu hóa Custom Dropdown, Quick Preview (với scroll suppression), Google Maps Embed.
  - Loại bỏ hoàn toàn các liên kết chết (dead buttons/links).
- **Đầu ra:** Client build thành công, responsive mượt mà từ 320px đến 1920px.

### Phase 6: Backend Verification & Business Rules Hardening
- **Mục tiêu:**
  - Kiểm tra 6 modules RESTful API: auth, jobs, applications, reviews, admin, profile.
  - Đảm bảo các ràng buộc: không ứng tuyển tin đã đóng, không tự ứng tuyển tin mình, không đánh giá khi chưa COMPLETED.
- **Đầu ra:** 10/10 test suites chạy bằng `node:test` vượt qua 100%.

### Phase 7: Frontend – Backend Integration Check
- **Mục tiêu:**
  - Kiểm tra kết nối luồng end-to-end từ client đến server (Port 5000) và PostgreSQL 18 (Port 5432).
  - Tự động fallback dữ liệu offline/seed khi server ngắt kết nối tạm thời.
- **Đầu ra:** Mọi hành động (Apply, Save, Post Job, Review, Moderation) phản hồi chuẩn HTTP status codes.

### Phase 8: Comprehensive Testing (Unit, Integration & E2E)
- **Mục tiêu:** Chạy toàn bộ test suites tự động và kiểm thử trực quan với Playwright MCP.
- **Đầu ra:** `docs/TEST_REPORT.md` (Báo cáo kết quả kiểm thử toàn diện).

### Phase 9: Security Audit & Optimization
- **Mục tiêu:** Rà soát OWASP Top 10, SQL Injection, XSS, CSRF, Password Hashing, JWT handling, và tối ưu bundle size.
- **Đầu ra:** `docs/SECURITY_AUDIT.md`.

### Phase 10: Final Review & Acceptance
- **Mục tiêu:** Tổng hợp toàn bộ thay đổi, đối chiếu sản phẩm với yêu cầu giảng viên và bàn giao.
- **Đầu ra:** `docs/IMPLEMENTATION_CHANGELOG.md` & `docs/FINAL_PROJECT_REVIEW.md`.

---

## 3. TIẾN ĐỘ THỰC HIỆN

| Phase | Nhiệm vụ chính | Trạng thái |
|---|---|---|
| **Phase 1** | Project Audit & Repository Inventory | **ĐÃ HOÀN THÀNH** |
| **Phase 2** | Requirement Traceability Matrix (SRS, UC, ERD, PB) | **ĐÃ HOÀN THÀNH** |
| **Phase 3** | Open Source Research & Skills Inventory | **ĐÃ HOÀN THÀNH** |
| **Phase 4** | UI/UX Design System & Soft Lavender Palette | **ĐÃ HOÀN THÀNH** |
| **Phase 5** | Frontend Refinement & 14 Wireframe Screens | **ĐANG TIẾN HÀNH** |
| **Phase 6** | Backend Verification & Domain Rules | **ĐÃ HOÀN THÀNH (10/10 Tests Passed)** |
| **Phase 7** | End-to-End Integration Check | **ĐÃ HOÀN THÀNH** |
| **Phase 8** | Testing Suite Execution & Documentation | **ĐANG TIẾN HÀNH** |
| **Phase 9** | Security Audit & Performance Tuning | **ĐANG TIẾN HÀNH** |
| **Phase 10** | Final Project Review & Changelog | **ĐANG TIẾN HÀNH** |
