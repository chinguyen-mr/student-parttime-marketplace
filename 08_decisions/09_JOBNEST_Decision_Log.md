# JOBNEST — SỔ TAY QUYẾT ĐỊNH KIẾN TRÚC (ARCHITECTURE DECISION LOG - ADR)

**Tài liệu số:** `09_JOBNEST_Decision_Log`  
**Dự án:** JOBNEST - Student Part-time Job Marketplace  
**Đơn vị phát triển:** Nhóm Đồ Án Tốt Nghiệp / Chuyên Đề 2  
**Ngày phê duyệt:** 2026-11-03  
**Trạng thái:** APPROVED (Toàn bộ 10 ADRs chính thức có hiệu lực)  

---

## 1. TỔNG QUAN

Tài liệu Architecture Decision Records (ADR) nhằm mục đích ghi chép lại các quyết định kỹ thuật trọng yếu trong suốt vòng đời xây dựng và bảo trì hệ thống JOBNEST. Mỗi quyết định được xây dựng theo cấu trúc chuẩn:
- **Bối cảnh (Context):** Lý do và nhu cầu kỹ thuật đặt ra vấn đề.
- **Quyết định (Decision):** Phương án kỹ thuật được lựa chọn triển khai.
- **Hệ quả (Consequences):** Lợi ích, đánh giá tác động và các điểm cần lưu ý.
- **Trạng thái (Status):** APPROVED / PROPOSED / DEPRECATED.

---

## 2. DANH SÁCH CHI TIẾT CÁC QUYẾT ĐỊNH (ADRs)

### ADR-001: Lựa chọn Framework Frontend (React 19 + Vite + TailwindCSS)
- **Trạng thái:** `APPROVED` | **Ngày:** 2026-10-15
- **Bối cảnh:** Cần một thư viện/framework UI hiện đại, hiệu năng cao, tốc độ render nhanh, hỗ trợ Single Page Application (SPA) mượt mà cho sinh viên và nhà tuyển dụng.
- **Quyết định:** Sử dụng React 19 kết hợp Vite làm bundler công cụ phát triển nhanh, TailwindCSS cho styling linh hoạt, responsive và nhất quán theo chuẩn giao diện hiện đại.
- **Hệ quả:** Thời gian build cực nhanh (<1s), hỗ trợ Hot Module Replacement (HMR) mượt, cộng đồng thư viện lớn. Đòi hỏi đội ngũ tuân thủ cấu trúc component hóa chuẩn xác.

---

### ADR-002: Kiến trúc Backend (Node.js + Express.js theo mô hình 3-Tier Modular Monolith)
- **Trạng thái:** `APPROVED` | **Ngày:** 2026-10-16
- **Bối cảnh:** Hệ thống cần phục vụ lưu lượng truy cập cao, xử lý I/O bất đồng bộ liên tục khi sinh viên tìm việc, nhà tuyển dụng đăng tin và hệ thống gửi thông báo realtime.
- **Quyết định:** Triển khai REST API trên nền Node.js và Express.js, phân tách 3 lớp rõ ràng: Routing & Controller -> Service (Business Logic) -> Repository / Model (Data Access).
- **Hệ quả:** Mã nguồn dễ bảo trì, mở rộng và kiểm thử độc lập (unit/integration test). Không bị overhead như mô hình Microservices phân tán phức tạp ở giai đoạn hiện tại.

---

### ADR-003: Lựa chọn Hệ quản trị Cơ sở Dữ liệu (PostgreSQL 18)
- **Trạng thái:** `APPROVED` | **Ngày:** 2026-10-18
- **Bối cảnh:** Dữ liệu việc làm, hợp đồng/đề xuất tuyển dụng, giao dịch thanh toán và đánh giá yêu cầu tính toàn vẹn (ACID), khả năng mở rộng quan hệ phức tạp và hỗ trợ tìm kiếm GIS.
- **Quyết định:** Sử dụng PostgreSQL 18 với module kết nối node-postgres (pg Pool), chạy migrations bằng Knex.js hoặc SQL scripts chuẩn hóa.
- **Hệ quả:** Đảm bảo toàn vẹn dữ liệu giao dịch 100%, hỗ trợ chỉ mục không gian (spatial indexing) phục vụ tính năng tìm kiếm việc làm theo bán kính địa lý.

---

### ADR-004: Cơ chế Xác thực & Phân quyền (JWT + HttpOnly Cookie + RBAC)
- **Trạng thái:** `APPROVED` | **Ngày:** 2026-10-20
- **Bối cảnh:** Cần bảo vệ an toàn danh tính, chống lại các cuộc tấn công XSS và CSRF, đồng thời phân định quyền hạn chặt chẽ cho 4 nhóm tác nhân: Khách (Guest), Sinh viên (Student), Nhà tuyển dụng (Employer), Quản trị viên (Admin).
- **Quyết định:** Áp dụng cơ chế JWT Access Token (hạn ngắn 15 phút) lưu trong bộ nhớ và Refresh Token (hạn 7 ngày) lưu trong HttpOnly Secure Cookie. Phân quyền đa cấp Role-Based Access Control (RBAC) middleware kiểm tra trước mọi endpoint nhạy cảm.
- **Hệ quả:** Bảo mật an toàn tối đa trước các rủi ro đánh cắp token từ localStorage. Quá trình gia hạn token diễn ra hoàn toàn trong suốt với người dùng.

---

### ADR-005: Tích hợp Bản đồ & Tìm kiếm Địa điểm (Leaflet.js + OpenStreetMap)
- **Trạng thái:** `APPROVED` | **Ngày:** 2026-10-22
- **Bối cảnh:** Tính năng bản đồ tìm việc làm gần trường học / nơi ở của sinh viên là tính năng cốt lõi. Tuy nhiên, việc sử dụng Google Maps API phát sinh chi phí lớn theo lượt xem.
- **Quyết định:** Lựa chọn Leaflet.js kết hợp bản đồ nền mã nguồn mở OpenStreetMap (OSM) và Nominatim Geocoding API.
- **Hệ quả:** Hoàn toàn miễn phí bản quyền, tải trang nhẹ, không phụ thuộc vào khóa API thương mại, dễ tùy biến giao diện icon marker việc làm sinh động.

---

### ADR-006: Quy trình Ứng tuyển & Đấu thầu (Proposal & Job Assignment Flow)
- **Trạng thái:** `APPROVED` | **Ngày:** 2026-10-25
- **Bối cảnh:** Việc làm bán thời gian cần sự linh hoạt: cho phép sinh viên nộp hồ sơ kèm mức lương mong muốn (bidding/proposal), nhà tuyển dụng xem xét và xác nhận giao việc chính thức.
- **Quyết định:** Thiết kế luồng trạng thái máy hữu hạn: Application (PENDING -> ACCEPTED/REJECTED) -> Assignment (ASSIGNED -> IN_PROGRESS -> COMPLETED) -> Review & Payment Confirmation.
- **Hệ quả:** Minh bạch tuyệt đối quyền lợi cả hai bên, ngăn chặn tình trạng hủy việc đột ngột hoặc tranh chấp thù lao.

---

### ADR-007: Hệ thống Đánh giá & Danh tiếng Hai Chiều (Bi-directional Review)
- **Trạng thái:** `APPROVED` | **Ngày:** 2026-10-28
- **Bối cảnh:** Xây dựng môi trường tin cậy cho sinh viên tránh bẫy việc làm lừa đảo và nhà tuyển dụng tìm được ứng viên trách nhiệm.
- **Quyết định:** Chỉ cho phép đánh giá khi công việc hoàn thành (COMPLETED status). Sinh viên đánh giá độ uy tín/môi trường của NTD, NTD đánh giá năng lực/thái độ của Sinh viên (1-5 sao kèm nhận xét chi tiết).
- **Hệ quả:** Tăng cường tỷ lệ việc làm chất lượng cao, tạo huy hiệu tin cậy (Top Employer / Top Talent) thúc đẩy gắn bó nền tảng.

---

### ADR-008: Chiến lược Kiểm thử Tự động (Jest + Supertest cho Backend, Vitest cho Frontend)
- **Trạng thái:** `APPROVED` | **Ngày:** 2026-10-30
- **Bối cảnh:** Cần đảm bảo chất lượng hệ thống không bị hồi quy (regression) khi thêm tính năng mới hoặc tái cấu trúc mã nguồn.
- **Quyết định:** Xây dựng bộ kiểm thử tích hợp (integration tests) cho tất cả API Auth, Jobs, Applications bằng Jest và Supertest. Test chạy tự động trên môi trường in-memory / test DB sạch.
- **Hệ quả:** Đảm bảo 100% các API cốt lõi được kiểm tra kỹ lưỡng trước khi phát hành, giảm thiểu lỗi runtime.

---

### ADR-009: Quản lý Mã nguồn & Code Intelligence với GitNexus
- **Trạng thái:** `APPROVED` | **Ngày:** 2026-11-01
- **Bối cảnh:** Repository có nhiều symbol, module và quy trình nghiệp vụ đan xen giữa Frontend và Backend.
- **Quyết định:** Tích hợp GitNexus indexer theo dõi 380+ symbols, 680+ relationships. Bắt buộc thực hiện phân tích tác động (Impact Analysis) trước khi sửa đổi và kiểm tra thay đổi đồ thị trước khi commit.
- **Hệ quả:** Loại bỏ hoàn toàn rủi ro phá vỡ dependency ẩn, tối ưu hóa quy trình pair programming với AI Agent.

---

### ADR-010: Chiến lược Đóng gói & Triển khai (Docker, Nginx Reverse Proxy, GitHub Actions)
- **Trạng thái:** `APPROVED` | **Ngày:** 2026-11-03
- **Bối cảnh:** Đảm bảo ứng dụng chạy đồng nhất trên môi trường Development, Staging và Production.
- **Quyết định:** Đóng gói Client (Vite build) và Server (Node.js Alpine) thành các Docker image đa tầng (multi-stage build). Sử dụng Nginx làm reverse proxy điều hướng request /api về backend và phục vụ file tĩnh cho frontend. Tự động hóa CI qua GitHub Actions.
- **Hệ quả:** Dễ dàng khởi chạy toàn bộ hệ thống bằng một lệnh duy nhất (`docker-compose up -d`), đảm bảo khả năng mở rộng cao.
