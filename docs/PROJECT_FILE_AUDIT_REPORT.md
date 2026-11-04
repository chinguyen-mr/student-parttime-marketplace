# BÁO CÁO KIỂM KÊ TOÀN DIỆN, PHÂN LOẠI & ĐÁNH GIÁ TÀI NGUYÊN DỰ ÁN (PROJECT FILE AUDIT REPORT)

**Dự án:** JobNest — Nền tảng Quản lý Freelance / Marketplace Việc làm Part-time cho Sinh viên  
**Chuyên đề Tốt nghiệp 2 — Khoa CNTT — Trường Đại học Văn Lang (VLU)**  
**Vai trò thực hiện:** Senior Software Architect, Repository Auditor & Software Engineer  
**Thời gian kiểm kê:** 03/11/2026  
**Phạm vi:** Toàn bộ cây thư mục `D:\Tai Lieu\DuLieuHoc\Đồ Án Tốt Nghiệp\Chuyên Đề 2`  

---

## 1. TỔNG QUAN KIỂM KÊ (EXECUTIVE SUMMARY)

Dự án đã được quét đệ quy toàn diện, bao gồm cả file thông thường, file ẩn, file cấu hình, tài nguyên mã nguồn mở, tài liệu nghiệp vụ, thư mục kỹ năng (Skills) của Agent và các artifacts kiểm thử.

- **Tổng số thư mục đã kiểm tra:** **126 thư mục** (không bao gồm các thư mục con sâu bên trong `node_modules` và `.git/objects`).
- **Tổng số file đã kiểm kê chi tiết:** **1.101 files** (đã loại trừ 10.000+ internal git object blobs để đảm bảo tính minh bạch theo file dự án thực tế).
- **Tổng dung lượng mã nguồn & tài nguyên dự án:** **~128,4 MB**.
- **Dung lượng ước tính có thể giải phóng an toàn:** **~39,23 MB** (tương đương **~30,5%** dung lượng lưu trữ không liên quan/rác).

---

## 2. THỐNG KÊ SỐ LƯỢNG FILE THEO TỪNG LOẠI & ĐỊNH DẠNG

### 2.1. Phân bổ theo thư mục cấp 1 (Top-level Folders)

| Thư mục / Vị trí | Số lượng File | Vai trò & Bản chất kỹ thuật |
|---|:---:|---|
| `.agents/` | 108 | Thư mục chứa Agent Skills (`better-web-ui`, `frontend-design-workflow`, `no-slop-ui`) — **Tuyệt đối bảo vệ** |
| `.claude/` | 6 | Cấu hình & hướng dẫn Skill GitNexus Code Intelligence cho Claude/Subagents — **Tuyệt đối bảo vệ** |
| `.gitnexus/` | 69 | Chỉ mục đồ thị tri thức mã nguồn (Knowledge Graph Index, CJS runner) — **Tuyệt đối bảo vệ** |
| `.kilo/` | 448 | Dữ liệu phiên làm việc Git Worktree của tiện ích Kilo Code IDE (`geode-suit`) — **Nhóm xem xét (NHÓM D)** |
| `.playwright-mcp/` | 250 | Logs kiểm thử trình duyệt, snapshots DOM (.yml) và ảnh chụp kiểm thử tự động — **Nhóm xem xét (NHÓM D)** |
| `client/` | 64 | Mã nguồn Frontend (React 19, Vite 8, Animate UI components, assets, pages, config) — **Bắt buộc giữ** |
| `server/` | 45 | Mã nguồn Backend (Express 4.21 3-Tier, PostgreSQL pg, routes, services, tests, migrations) — **Bắt buộc giữ** |
| `docs/` | 30 | Tài liệu chính thức: SRS, ERD, Agile Backlog, Traceability Matrix, Changelogs, Test Reports — **Bắt buộc giữ** |
| `Dự án/` | 14 | Bộ tài liệu nghiệm thu tốt nghiệp (DOCX, XLSX, DrawIO ERD & Wireframes) — **Bắt buộc giữ & Tham khảo** |
| `Tài Liệu/` | 40 | Bài giảng môn học Buổi 1-10, tài liệu đặc tả ban đầu, dữ liệu mẫu, file tải ngoài — **Tham khảo & Đề xuất lọc** |
| Thư mục gốc (Root) | 27 | File cấu hình gốc (`package.json`, `.gitignore`, `README.md`, `AGENTS.md`) và 20 ảnh minh chứng docs — **Bắt buộc giữ** |
| **TỔNG CỘNG** | **1.101** | |

### 2.2. Phân bổ theo định dạng mở rộng (Extensions)

- **Tài liệu Markdown (`.md`):** 291 files (Tài liệu nghiệp vụ, báo cáo kiến trúc, tài liệu hướng dẫn Skill).
- **Cấu hình & Dữ liệu (`.json`, `.yml`):** 259 files (22 JSON cấu hình dự án & package, 237 YAML snapshots của Playwright & Skill).
- **Hình ảnh & Đồ họa (`.png`, `.svg`, `.jpg`, `.jpgx`):** 211 files (191 PNG, 10 SVG, 6 JPG, 4 JPGX typo).
- **Mã nguồn JavaScript & TypeScript (`.js`, `.jsx`, `.cjs`):** 126 files (77 JS Backend & Scripts, 48 JSX Frontend Components, 1 CJS GitNexus).
- **Nhật ký & V8 Profile (`.log`, `.v8`):** 125 files (63 logs kiểm thử Playwright/Node, 62 V8 index files của GitNexus).
- **Tài liệu Văn phòng & Thiết kế (`.docx`, `.xlsx`, `.drawio`, `.pdf`):** 48 files (13 DOCX, 18 XLSX, 6 DrawIO, 11 PDF bài giảng môn học).
- **Cơ sở dữ liệu (`.sql`):** 12 files (4 Migrations cấu trúc bảng, 2 Seeds dữ liệu tuyển dụng, các bản snapshot SQL).
- **Tập tin không có phần mở rộng (`(no-ext)`):** 16 files (Git refs, config files).
- **File nhị phân ngoại lai (`.exe`, `.cube`):** 2 files (1 installer Python 3.14, 1 video LUT cube — **Không thuộc dự án**).

---

## 3. PHÂN LOẠI CHI TIẾT THEO 5 NHÓM QUY ĐỊNH

### 3.1. NHÓM A – BẮT BUỘC PHẢI GIỮ (MUST KEEP)
*Các file mã nguồn chính, cấu hình runtime, cơ sở dữ liệu, API, kiểm thử và tài liệu nghiệp vụ bắt buộc.*

1. **Root Configs & Manifests:**
   - [`package.json`](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/package.json): Cấu hình scripts thực thi toàn dự án.
   - [`package-lock.json`](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/package-lock.json): Khóa phiên bản dependency gốc.
   - [`.gitignore`](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/.gitignore): Khai báo bỏ qua file tạm cho Git.
   - [`README.md`](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/README.md): Hướng dẫn cài đặt, kiến trúc hệ thống và thành viên đề tài.
   - [`AGENTS.md`](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/AGENTS.md) & [`CLAUDE.md`](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/CLAUDE.md): Nguyên tắc kiểm soát tác động đồ thị và quy chuẩn kỹ thuật.

2. **Frontend Client (`client/` - 64 files):**
   - Config: `client/package.json`, `client/package-lock.json`, `client/vite.config.js`, `client/.env`, `client/.env.example`.
   - Core API: `client/src/config/api.js` (tập trung endpoint, health check, chuẩn hóa lỗi).
   - Application Core: `client/src/App.jsx`, `client/src/main.jsx`, `client/src/index.css`, `client/index.html`.
   - Pages: `client/src/pages/JobDetailPage.jsx`, `client/src/pages/LoginPage.jsx`, `client/src/pages/ComingSoonPage.jsx`.
   - Components Nghiệp vụ: `JobCard.jsx`, `JobDetailModal.jsx`, `JobQuickPreview.jsx`, `JobLocationMap.jsx`, `AuthModal.jsx`, `CustomDropdown.jsx`, `Footer.jsx`, `StudentProfileModal.jsx`, `EmployerProfileModal.jsx`, `ReviewModal.jsx`, `NotificationsDropdown.jsx`, `PolicyModal.jsx`, `SupportModal.jsx`, `ForgotPasswordModal.jsx`, `FloatingActions.jsx`, `CompanyLogo.jsx`.
   - UI Design Primitives (Animate UI): `client/src/components/ui/Button.jsx`, `AnimatedModal.jsx`, `AnimatedToast.jsx`.
   - Public Assets: `client/public/favicon.svg`, `icons.svg`, `manifest.json`, `logo.jpg`, `app-store-badge.png`, `google-play-badge.png`, `dadangky.png`.

3. **Backend Server (`server/` - 45 files):**
   - Config: `server/package.json`, `server/package-lock.json`, `server/.env`, `server/.env.example`, `server/src/config/db.js`, `migrate.js`, `seed.js`.
   - Core Application: `server/src/server.js`, `server/src/app.js`.
   - 3-Tier Layer:
     - Routes: `auth.routes.js`, `job.routes.js`, `application.routes.js`, `review.routes.js`, `profile.routes.js`, `admin.routes.js`.
     - Services: `auth.service.js`, `job.service.js`, `application.service.js`, `review.service.js`, `profile.service.js`, `admin.service.js`.
     - Repositories: `user.repository.js`, `job.repository.js`, `application.repository.js`, `review.repository.js`, `profile.repository.js`.
     - Validators: `auth.validator.js`, `job.validator.js`, `application.validator.js`, `review.validator.js`.
     - Middleware: `auth.middleware.js`, `error.middleware.js`, `errors/app-error.js`.
   - Database Migrations & Seeds: `migrations/001_initial_schema.sql`, `002_job_detail_and_saved_jobs.sql`, `003_add_banner_and_real_data_columns.sql`, `003_add_job_coordinates_and_address.sql`, `seeds/001_seed_data.sql`, `seeds/002_rich_jobs_seed.sql`.
   - Helper Scripts: `scripts/import_excel_data.js`, `scripts/seed_demo_helper.js`.
   - Automated Tests: `tests/auth.test.js`, `job.test.js`, `application.test.js`, `review.test.js`.

4. **Tài liệu Nghiệp vụ Bắt buộc (`docs/` - 30 files & `Dự án/`):**
   - SRS & Yêu cầu: `docs/buoi-02-phan-tich-yeu-cau-srs-rut-gon.md`, `Dự án/03_JOBNEST_SRS.docx`, `04_JOBNEST_Use_Case_Specification.docx`.
   - Agile Product Backlog: `docs/buoi-03-ke-hoach-agile-product-backlog.md`, `Dự án/02_JOBNEST_Product_Backlog_Sprint_Plan.docx`.
   - Kiến trúc & ERD: `docs/buoi-04-05-thiet-ke-kien-truc-erd-chi-tiet.md`, `docs/architecture.md`, `Dự án/07_JOBNEST_Database_ERD_Specification.docx`, `Dự án/ERD_JOBNEST_30_bang.drawio`.
   - Wireframes: `docs/wireframes.md`, `Dự án/05_JOBNEST_Wireframe_Specification_v3.3.docx`, `Dự án/jobnest_31_wireframes.drawio`, `JOBNEST_Wireframe_44.drawio`.
   - API Contract & Ma trận: `Dự án/06_JOBNEST_API_Contract.docx`, `Dự án/03_JOBNEST_Traceability_Matrix.xlsx`, `docs/REQUIREMENT_TRACEABILITY_MATRIX.md`, `docs/ma-tran-truy-vet-buoi-5.md`.
   - Báo cáo Kỹ thuật & Bàn giao: `docs/buoi-01-thong-tin-nhom-va-de-tai.md`, `docs/nhat-ky-thuc-hien-de-tai.md`, `docs/TEST_REPORT.md`, `Dự án/08_JOBNEST_Test_Plan_Workbook.xlsx`.

---

### 3.2. NHÓM B – ĐƯỢC BẢO VỆ TUYỆT ĐỐI / MÃ NGUỒN MỞ (PROTECTED / EXTERNAL SOURCE)
*Bảo vệ tuyệt đối theo Điều 3.1 & 3.2 của Quy tắc bảo vệ. Cấm xóa, sửa, đổi tên hoặc di chuyển.*

1. **Thư mục Agent Skills (`.agents/` - 108 files):**
   - `.agents/skills/better-web-ui/` (Kèm file cấu hình gốc `.better-web-ui.md`).
   - `.agents/skills/frontend-design-workflow/` (Kèm toàn bộ sub-skills, scripts, references).
   - `.agents/skills/no-slop-ui/` (Kèm checklist và hướng dẫn chống generic UI).
2. **Thư mục Claude Subagents (`.claude/` - 6 files):**
   - `.claude/skills/gitnexus-exploring/`
   - `.claude/skills/gitnexus-impact-analysis/`
   - `.claude/skills/gitnexus-debugging/`
   - `.claude/skills/gitnexus-refactoring/`
   - `.claude/skills/gitnexus-guide/`
   - `.claude/skills/gitnexus-cli/`
3. **Thư mục GitNexus Code Intelligence (`.gitnexus/` - 69 files):**
   - Chứa binary runtime `.gitnexus/run.cjs` và chỉ mục phân tích đồ thị mã nguồn 380 symbols, 680 relationships.
4. **Mã nguồn Mở & Thư viện đã tích hợp:**
   - Framework React 19, Vite 8, Express 4.21.
   - Thư viện Motion (`motion/react`), Lucide React (`lucide-react`), Animate UI primitives (`client/src/components/ui/*`).
   - Dependency PostgreSQL client (`pg`), Bcrypt (`bcryptjs`), JWT (`jsonwebtoken`), Excel parser (`xlsx`).

---

### 3.3. NHÓM C – GIỮ THAM KHẢO (KEEP / REFERENCE)
*Các file tài liệu nghiên cứu, bài giảng, bản nháp wireframe, ảnh minh chứng có giá trị cho quá trình bảo vệ đề tài.*

1. **Ảnh minh chứng giao diện được nhúng trong tài liệu (`docs/*.md`):**
   - 20 file PNG tại thư mục gốc: `custom-dropdown-open.png`, `custom-dropdown-selected.png`, `custom-dropdown-active-check.png`, `custom-dropdown-salary.png`, `custom-dropdown-screen10.png`, `custom-dropdown-screen11.png`, `custom-dropdown-screen12.png`, `custom-dropdown-support-modal.png`, `grid-job-listings.png`, `job-detail-page-bottom.png`, `job-detail-page-content.png`, `job-detail-page-top.png`, `job-detail-real-logo-banner.png`, `job-detail-related-jobs.png`, `mobile-job-list.png`, `quick-preview-hover.png`, `quick-preview-real-logo.png`, `real-logos-grid-top.png`, `real-logos-job-grid.png`, `saved-jobs-view.png`.
2. **Slide bài giảng môn học (`Tài Liệu/`):**
   - 10 tập tin bài giảng lý thuyết và hướng dẫn: `Buoi01_ChuyenDeTotNghiep2.pdf` đến `Buoi10_ChuyenDeTotNghiep2.pdf`.
   - File đề cương và phân công đề tài: `CHUYÊN ĐỀ TỐT NGHIỆP 2 - ĐỀ TÀI_TrungNguyen.pdf`.
3. **Bản thảo SRS, ERD, Wireframe & Dữ liệu tham chiếu ban đầu (`Tài Liệu/`):**
   - `CDTN2_ProductBacklog.xlsx`, `CDTN2_SRS (1).docx`, `CDTN2_SRS.docx`, `CDTN2_SRS.xlsx`, `CongNgheSD.xlsx`.
   - `Dac_ta.docx`, `Dac_ta_Use_Case_Nen_tang_Marketplace_Part_time_FINAL_CLEAN_V2.docx`.
   - `Data.xlsx`, `TestData_TuyenDung.xlsx`, `Marketplace_Parttime_TestData_Final.xlsx`, `TAMS_SRS_IP.xlsx`.
   - `PB_Cd2.xlsx`, `Product_Backlog.xlsx`, `Product_Backlog_1.xlsx`, `Product_Backlog_HThong.xlsx`.
   - `ProjectOverView (1).docx`, `ProjectOverView.docx`.
   - `ERD.drawio`, `WireFrame.drawio`, `WireFrameCDTN2.drawio`.
   - `Tài Liệu/dadangky.jpgx`, `Logo.jpg`, `app-store-badge.png`, `google-play-badge.png`.
4. **Báo cáo Thiết kế & Đánh giá chuyên sâu (`docs/`):**
   - `docs/UI_UX_DESIGN_SYSTEM.md`, `docs/OPEN_SOURCE_RESEARCH.md`, `docs/SECURITY_AUDIT.md`, `docs/SKILLS_INVENTORY.md`, `docs/FINAL_PROJECT_REVIEW.md`, `docs/jobnest-branding-update-report.md`, `docs/jobnest-custom-dropdown-report.md`, `docs/jobnest-footer-implementation-report.md`, `docs/jobnest-job-list-detail-implementation-report.md`, `docs/jobnest-coming-soon-implementation-report.md`, `docs/jobnest-quick-preview-scroll-bugfix.md`, `docs/jobnest-backend-connection-bugfix.md`.

---

### 3.4. NHÓM D – CẦN XEM XÉT THÊM (REVIEW BEFORE DELETE)
*Các file trạng thái workflow, phiên IDE hoặc log tạm chưa đủ căn cứ xóa tự động theo quy định.*

1. **Thư mục Kilo Code Agent Worktree (`.kilo/` - 448 files, 38,8 MB):**
   - Gồm `.kilo/agent-manager.json`, `.kilo/plans`, `.kilo/worktrees/geode-suit/...`
   - *Lý do giữ lại trong nhóm D:* Đây là trạng thái phiên làm việc song song của tiện ích Kilo Code trên VS Code của người dùng. Việc tự ý xóa thư mục này có thể làm lỗi phiên làm việc trong IDE của người dùng. Giữ nguyên theo nguyên tắc "Ưu tiên bảo toàn dự án".
2. **Thư mục Log & Snapshot kiểm thử Playwright (`.playwright-mcp/` - 250 files, 18,87 MB):**
   - Gồm 33 file `.log`, 136 file `.yml`, 81 file `.png`.
   - *Lý do giữ lại trong nhóm D:* Đây là nhật ký ghi lại các phiên kiểm thử E2E tương tác trình duyệt. Việc giữ lại giúp truy vết lỗi kiểm thử. Khuyến nghị thêm vào `.gitignore` để tránh đẩy lên Git remote.

---

### 3.5. NHÓM E – ĐỀ XUẤT XÓA AN TOÀN (SAFE TO DELETE)
*Chỉ gồm 7 file đã được xác minh bằng căn cứ kỹ thuật: Không liên quan đến dự án, không được import/tham chiếu, không ảnh hưởng runtime, build hay kiểm thử.*

| STT | Đường dẫn file tương đối | Kích thước | Căn cứ kỹ thuật & Lý do đề xuất xóa |
|:---:|---|:---:|---|
| **1** | `Tài Liệu/python-3.14.10-amd64.exe` | **33.498.520 B** (~31,95 MB) | **Tập tin cài đặt Windows độc lập của Python 3.14.** Dự án JobNest được xây dựng 100% trên nền tảng JavaScript/Node.js + React + PostgreSQL, hoàn toàn không có mã nguồn hay runtime Python. File được tải nhầm vào thư mục tài liệu môn học. Không có bất kỳ file nào tham chiếu tới. Xóa an toàn tuyệt đối. |
| **2** | `Tài Liệu/Wedding_Vol03_012_Rec709.cube` | **7.636.545 B** (~7,28 MB) | **Tập tin 3D Look-Up Table (LUT) chỉnh màu video đám cưới** (Adobe Premiere / DaVinci Resolve). Hoàn toàn ngoại lai, không liên quan đến hệ thống tuyển dụng việc làm JobNest. Không được tham chiếu trong mã nguồn, tài liệu hay cấu hình. Xóa an toàn tuyệt đối. |
| **3** | `Dự án/~$08_JOBNEST_Test_Plan_Workbook.xlsx` | **165 B** | **Tập tin khóa tạm (lock file) của Microsoft Excel.** Được sinh ra khi mở file Excel và bị bỏ rơi khi thoát ứng dụng. Chỉ chứa 165 bytes metadata tên người dùng mở file, không chứa dữ liệu bảng tính. Tập tin thật `08_JOBNEST_Test_Plan_Workbook.xlsx` vẫn tồn tại đầy đủ. |
| **4** | `Tài Liệu/~$Marketplace_Parttime_TestData_Final.xlsx` | **165 B** | **Tập tin khóa tạm của Microsoft Excel.** Bản sao thật `Marketplace_Parttime_TestData_Final.xlsx` tồn tại nguyên vẹn ngay bên cạnh. |
| **5** | `Tài Liệu/~$PB_Cd2.xlsx` | **165 B** | **Tập tin khóa tạm của Microsoft Excel.** Bản sao thật `PB_Cd2.xlsx` tồn tại nguyên vẹn ngay bên cạnh. |
| **6** | `Tài Liệu/~$Product_Backlog_HThong.xlsx` | **165 B** | **Tập tin khóa tạm của Microsoft Excel.** Bản sao thật `Product_Backlog_HThong.xlsx` tồn tại nguyên vẹn ngay bên cạnh. |
| **7** | `client/public/dadangky.jpgx` | **3.527 B** | **Tập tin dư thừa có đuôi mở rộng gõ nhầm (`.jpgx`).** Kiểm tra magic bytes xác nhận nội dung thực chất là file PNG (`\x89PNG\r\n\x1a\n`), trùng khớp 100% từng byte với file chuẩn `client/public/dadangky.png`. Tài liệu `docs/jobnest-coming-soon-implementation-report.md` đã ghi rõ file này đã được chuẩn hóa sang `dadangky.png`. Không còn component nào import file `.jpgx`. |

**Tổng dung lượng giải phóng ước tính:** **41.139.252 bytes (~39,23 MB)**.

---

## 4. QUAN HỆ PHỤ THUỘC ĐÃ KIỂM TRA (DEPENDENCY TRACEABILITY)

1. **Kiểm tra Import & Runtime:**
   - Đã quét chuỗi ký tự bằng `grep_search` và phân tích AST trên toàn bộ thư mục `client/src` và `server/src`. Không có bất kỳ import, dynamic import hay asset reference nào trỏ tới các file thuộc Nhóm E.
2. **Kiểm tra Script Package:**
   - File `package.json` của Root, Client và Server không có script nào gọi đến Python installer, cube LUT hay các file lock `~$*`.
3. **Kiểm tra Cấu hình Build & Asset Bundling:**
   - `client/vite.config.js` và `client/index.html` chỉ bundle các assets chuẩn từ `client/src/assets` và `client/public` (`dadangky.png`, `logo.jpg`, `app-store-badge.png`, `google-play-badge.png`).
4. **Kiểm tra Database Migrations & Seeds:**
   - Các file SQL và script import `import_excel_data.js` chỉ trỏ tới `Dự án/Data_v2.xlsx` và `Tài Liệu/TestData_TuyenDung.xlsx`. Không phụ thuộc vào các file lock tạm.

---

## 5. RỦI RO PHÁT HIỆN & BIỆN PHÁP KIỂM SOÁT

| Rủi ro tiềm ẩn | Mức độ rủi ro | Biện pháp kiểm soát & Phòng ngừa |
|---|:---:|---|
| Xóa nhầm file tài liệu bài giảng hoặc đề cương môn học | **CAO** | Đã phân loại toàn bộ 10 file PDF bài giảng và tài liệu đề tài vào **NHÓM C (Bảo vệ)**. Tuyệt đối không xóa. |
| Phá vỡ cấu trúc Agent Skills (`.agents`, `.claude`) | **CỰC KỲ CAO** | Khóa hoàn toàn thư mục `.agents`, `.claude`, `SKILL.md`. Tuyệt đối không can thiệp. |
| Xóa nhầm ảnh giao diện được dùng trong báo cáo | **TRUNG BÌNH** | Đã đối chiếu 20 file PNG ở thư mục gốc với các đường dẫn markdown trong `docs/`. Xác nhận là minh chứng báo cáo và đưa vào **NHÓM C**. |
| Xung đột Git Worktree của Kilo Code | **THẤP** | Không xóa thư mục `.kilo`, phân loại vào **NHÓM D** để người dùng chủ động quản lý phiên làm việc. |

---

## 6. KẾT LUẬN & ĐỀ XUẤT THỰC HIỆN

Kế hoạch dọn dẹp sẽ được thực thi có kiểm soát:
1. **Chỉ xóa duy nhất 7 file thuộc NHÓM E** đã được chứng minh căn cứ kỹ thuật ở Mục 3.5.
2. **Giữ nguyên 100%** mã nguồn ứng dụng (Frontend, Backend), cơ sở dữ liệu (PostgreSQL), tài liệu học tập & bảo vệ (SRS, ERD, Use Case, Backlog, Slide PDF), Agent Skills và thư viện mã nguồn mở.
3. Sau khi xóa, tiến hành chạy kiểm thử toàn diện: `npm test` (Backend), `npm run build` (Frontend) và kiểm tra tình trạng git.
