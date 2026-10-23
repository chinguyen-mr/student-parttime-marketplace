# NHẬT KÝ THỰC HIỆN ĐỀ TÀI (PROJECT LOG) — TỪ BUỔI 1 ĐẾN BUỔI 5
**Minh chứng phục vụ Đánh giá Giữa kỳ lần 1 (Rubric 2: 30%)**

**Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên  
**Học phần:** Chuyên đề Tốt nghiệp 2 (Khoa CNTT — Trường Đại học Văn Lang)  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Trung  
**Nhóm sinh viên thực hiện:**
- Nguyễn Văn Chí (MSSV: 2374802010056) — Nhóm trưởng
- Nguyễn Tấn Hoàng Thông (MSSV: 2374802010485)
- Lê Quang Anh Tuấn (MSSV: 2374802010538)

---

## Buổi 1: Giới thiệu môn học, Phân nhóm và Lựa chọn đề tài
- **Thời gian thực hiện:** Tuần 1.
- **Nội dung thực hiện:**
  - Nhóm 3 sinh viên ghép nhóm, bầu Nguyễn Văn Chí làm nhóm trưởng chịu trách nhiệm điều phối.
  - Thảo luận và thống nhất đăng ký đề tài: *Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên* (chuyên ngành CNPM).
  - Phác thảo mục tiêu bài toán: kết nối sinh viên tìm việc làm thêm uy tín với nhà tuyển dụng/hộ kinh doanh cần tuyển nhân sự ngắn hạn.
  - Thống nhất kênh trao đổi thông tin chính (Zalo) và bắt đầu ghi chép nhật ký đề tài.
- **Kết quả đạt được:** Hoàn thành bản đăng ký đề tài và phác thảo 4 tính năng cốt lõi ban đầu ([buoi-01-thong-tin-nhom-va-de-tai.md](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/docs/buoi-01-thong-tin-nhom-va-de-tai.md)).
- **Khó khăn / Góp ý của GVHD:** Cần kiểm soát chặt chẽ phạm vi, tránh đưa các tính năng quá phức tạp như thanh toán tiền thật hoặc chat socket nâng cao vào đồ án ngắn hạn 10 buổi.

---

## Buổi 2: Phân tích yêu cầu đề tài
- **Thời gian thực hiện:** Tuần 2.
- **Nội dung thực hiện:**
  - Thu thập và phân tích chi tiết yêu cầu người dùng, xác định 3 Actor: Sinh viên, Nhà tuyển dụng, Quản trị viên.
  - Phân tích và mã hóa danh mục yêu cầu chức năng từ FR-01 đến FR-08.
  - Viết tài liệu đặc tả chi tiết 10 Use Case (`UC-01` $\rightarrow$ `UC-10`) với đầy đủ Pre-condition, Post-condition, Main Flow, Exception Flow và Business Rules.
- **Kết quả đạt được:** Hoàn thiện tài liệu `CDTN2_SRS.docx` và `Dac_ta.docx`.
- **Khó khăn / Góp ý của GVHD:** Quy định thống nhất UC-06 là "Ứng tuyển việc làm"; bước xem chi tiết tin thuộc Main Flow của UC-05/UC-06 chứ không tách thành Use Case độc lập.

---

## Buổi 3: Lập kế hoạch dự án theo Agile/Scrum rút gọn
- **Thời gian thực hiện:** Tuần 3.
- **Nội dung thực hiện:**
  - Chuyển toàn bộ yêu cầu chức năng (FR-01 $\rightarrow$ FR-08) thành danh mục Product Backlog cụ thể (PB-01 $\rightarrow$ PB-14).
  - Áp dụng kỹ thuật phân loại ưu tiên **MoSCoW**:
    - Must-have: Xác thực (PB-01, PB-02), Đăng tin (PB-04), Tìm kiếm/Lọc (PB-05, PB-06), Ứng tuyển (PB-07, PB-08), Quản lý ứng viên (PB-09), Trạng thái công việc (PB-10).
    - Should-have: Đánh giá sau việc (PB-11, PB-12), Quản trị viên (PB-13), Hồ sơ chi tiết (PB-03).
    - Won't-have: Thanh toán tiền thật, Mobile app native riêng.
  - Lập bảng kế hoạch Sprint ánh xạ theo lộ trình 10 buổi học.
  - Phân vai trò kỹ thuật rõ ràng:
    - Nguyễn Văn Chí: Backend Lead & System Architecture.
    - Nguyễn Tấn Hoàng Thông: Backend Developer & Data Modeler.
    - Lê Quang Anh Tuấn: Frontend Lead & UI/UX Designer.
- **Kết quả đạt được:** Tài liệu bàn giao [buoi-03-ke-hoach-agile-product-backlog.md](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/docs/buoi-03-ke-hoach-agile-product-backlog.md).
- **Khó khăn / Góp ý của GVHD:** Cần ước lượng story point hợp lý, không dồn quá nhiều việc vào Sprint 1 gây quá tải.

---

## Buổi 4: Thiết kế kiến trúc tổng thể
- **Thời gian thực hiện:** Tuần 4.
- **Nội dung thực hiện:**
  - Thiết kế kiến trúc phân tầng 3 tầng (3-Tier Layered Architecture): Presentation Layer (React.js + Tailwind CSS) $\rightarrow$ Application Layer (Express.js Routes, Services, Repositories, Validators) $\rightarrow$ Database Layer (PostgreSQL 18).
  - Phân tích và chốt bộ công nghệ chính thức: Node.js + Express.js + PostgreSQL + React.js.
  - Phác thảo sơ đồ thực thể liên kết (ERD) sơ bộ với 5 bảng cốt lõi: `users`, `profiles`, `jobs`, `applications`, `reviews`.
- **Kết quả đạt được:** Hoàn thành sơ đồ kiến trúc tổng thể và giải trình công nghệ tại [docs/architecture.md](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/docs/architecture.md).
- **Khó khăn / Góp ý của GVHD:** Đảm bảo tầng Service chỉ chứa logic nghiệp vụ, tuyệt đối không phụ thuộc vào `req, res` của Express; các câu lệnh SQL bắt buộc phải dùng tham số hóa (Parameterized queries) để chống SQL Injection.

---

## Buổi 5: Thiết kế chi tiết (Mốc đánh giá giữa kỳ - lần 1)
- **Thời gian thực hiện:** Tuần 5.
- **Nội dung thực hiện:**
  - Hoàn thiện thiết kế chi tiết CSDL: Bảng thuộc tính, kiểu dữ liệu, khóa chính, khóa ngoại `ON DELETE CASCADE`, ràng buộc `UNIQUE (job_id, student_id)` chống ứng tuyển trùng, và các chỉ mục (Indexes).
  - Xây dựng đặc tả chi tiết toàn bộ API Contract chuẩn RESTful cho 10 Use Case với mã HTTP chuẩn (200, 201, 400, 401, 403, 404, 409).
  - Vẽ sơ đồ tuần tự (Sequence Diagram) cho các luồng then chốt: Đăng nhập JWT, Ứng tuyển việc làm, Đánh giá đối tác.
  - Cài đặt và chuẩn bị môi trường phát triển:
    - Tạo database `cd2_marketplace_db` trên PostgreSQL 18 local.
    - Viết script migration `npm run migrate` và nạp dữ liệu mẫu `npm run seed`.
    - Viết bộ Unit Test bằng `node:test` đạt kết quả **10/10 test cases PASS (100%)**.
    - Build thử nghiệm Frontend React bằng Vite đạt **0 lỗi trong 366ms**.
- **Kết quả đạt được:** Hoàn thiện toàn bộ hồ sơ thiết kế chi tiết [buoi-04-05-thiet-ke-kien-truc-erd-chi-tiet.md](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/docs/buoi-04-05-thiet-ke-kien-truc-erd-chi-tiet.md) và mã nguồn nền tảng sẵn sàng cho Sprint xây dựng (Buổi 6).
- **Tự đánh giá theo Rubric 2:**
  - Thiết kế chi tiết CSDL và API: Hoàn thành 100%, có bằng chứng DDL SQL và kiểm thử tự động.
  - Nhật ký thực hiện đề tài: Đầy đủ, minh bạch từ Buổi 1 đến Buổi 5.
  - Môi trường phát triển: Đã thiết lập hoàn tất, có thể chạy và tái lập trên máy của GVHD.
