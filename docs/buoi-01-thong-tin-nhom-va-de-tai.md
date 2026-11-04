# BÁO CÁO BÀN GIAO BUỔI 1: GIỚI THIỆU MÔN HỌC, PHÂN NHÓM VÀ LỰA CHỌN ĐỀ TÀI

**Học phần:** Chuyên đề Tốt nghiệp 2 (Khoa CNTT — Trường Đại học Văn Lang)  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Trung  
**Thời gian hoàn thành:** Buổi 1  

---

## 1. Thông tin Nhóm sinh viên

| STT | Họ và tên | Mã số sinh viên (MSSV) | Lớp | Vai trò trong nhóm | Kênh liên lạc chính |
|---|---|---|---|---|---|
| 1 | **Nguyễn Văn Chí** | **2374802010056** | 232_71ITBS40103 | **Nhóm trưởng** (Điều phối & Backend Lead) | Zalo / Email sinh viên |
| 2 | **Nguyễn Tấn Hoàng Thông** | **2374802010485** | 232_71ITBS40103 | Thành viên (Backend & Data Modeler) | Zalo / Email sinh viên |
| 3 | **Lê Quang Anh Tuấn** | **2374802010538** | 232_71ITBS40103 | Thành viên (Frontend Lead & UI/UX) | Zalo / Email sinh viên |

---

## 2. Thông tin Đề tài Đăng ký

- **Tên đề tài chính thức:** **Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên**.
- **Chuyên ngành:** Công nghệ phần mềm (CNPM).
- **Loại hình đề tài:** Xây dựng ứng dụng / hệ thống hoàn chỉnh theo quy trình chuyên nghiệp mô phỏng dự án CNTT thực tế (Discovery $\rightarrow$ Planning $\rightarrow$ Design $\rightarrow$ Build $\rightarrow$ Test $\rightarrow$ Deploy $\rightarrow$ Report).

---

## 3. Phác thảo Bài toán và Mục tiêu Ban đầu

### 3.1. Bối cảnh thực tiễn và Bài toán cần giải quyết
1. **Phía Sinh viên:** Nhu cầu tìm việc làm thêm (part-time) để trang trải học phí, tích lũy kinh nghiệm thực tế là rất lớn. Tuy nhiên, sinh viên thường gặp khó khăn khi tiếp cận các nguồn tuyển dụng uy tín, dễ đối mặt rủi ro lừa đảo từ các hội nhóm mạng xã hội chưa được xác minh.
2. **Phía Nhà tuyển dụng:** Các cá nhân, hộ kinh doanh, doanh nghiệp vừa và nhỏ (SME) có nhu cầu tuyển dụng nhân sự thời vụ ngắn hạn linh hoạt. Việc đăng tin trên các trang tuyển dụng lớn tốn kém và không nhắm trúng đối tượng sinh viên.
3. **Mục tiêu sản phẩm:** Xây dựng nền tảng web 2 chiều (two-sided marketplace) kết nối sinh viên và nhà tuyển dụng với cơ chế đánh giá (review/rating) minh bạch sau công việc để bảo vệ quyền lợi của cả hai bên.

### 3.2. Bốn (04) Tính năng cốt lõi dự kiến
1. **Quản lý Tài khoản & Phân quyền:** Đăng ký, đăng nhập bảo mật với 3 vai trò độc lập: Sinh viên, Nhà tuyển dụng, Quản trị viên.
2. **Kênh Đăng tin tuyển dụng:** Nhà tuyển dụng đăng tin part-time/freelance với mô tả, mức lương, địa điểm và thời gian làm việc.
3. **Kênh Tìm kiếm & Ứng tuyển:** Sinh viên tìm kiếm, lọc tin theo ngành nghề/khu vực/mức lương và nộp hồ sơ ứng tuyển trực tuyến.
4. **Quản lý Trạng thái & Đánh giá hai chiều:** Quản lý tiến độ việc làm (*Đang tuyển* $\rightarrow$ *Đã nhận người* $\rightarrow$ *Hoàn thành*) và đánh giá xếp hạng uy tín hai chiều sau khi công việc kết thúc.

---

## 4. Trả lời Câu hỏi Thảo luận nhanh & Quản trị Rủi ro (Theo Slide Buổi 1)

### Câu 1: Đề tài nhóm bạn chọn có điểm gì khác biệt so với đề tài mẫu hoặc đề tài của nhóm khác?
- **Tính đặc thù sinh viên:** Nền tảng được tinh chỉnh tập trung vào thị trường lao động sinh viên: công việc part-time thời vụ ngắn hạn, linh hoạt theo ca học, vị trí gần các cụm trường đại học (ưu tiên khu vực TP.HCM).
- **Cơ chế đánh giá 2 chiều minh bạch (Mutual Review):** Khác với các trang rao vặt một chiều, hệ thống chỉ mở khóa chức năng đánh giá khi công việc đạt trạng thái `COMPLETED` và người tham gia phải có quan hệ làm việc thực tế, giúp loại trừ hoàn toàn tình trạng review ảo hoặc tin tuyển dụng lừa đảo.
- **Quy trình ứng tuyển tức thời (Instant Application Flow):** Sinh viên có thể nộp đơn trực tiếp kèm hồ sơ/CV lưu sẵn trên hệ thống mà không cần các thủ tục phỏng vấn dài dòng như tuyển dụng full-time.

### Câu 2: Rủi ro lớn nhất mà nhóm dự đoán sẽ gặp phải trong 10 buổi tới là gì và giải pháp?
- **Rủi ro 1 — Rò rỉ phạm vi (Scope Creep):** Dễ bị sa đà vào việc tích hợp cổng thanh toán tiền thật hoặc chat real-time phức tạp.
  - *Giải pháp:* Nhóm và GVHD đã thống nhất giới hạn chặt chẽ phạm vi trong đồ án CD2, phân loại các tính năng này vào nhóm `Won't-have` trong Product Backlog MoSCoW.
- **Rủi ro 2 — Nghẽn tích hợp giữa Frontend và Backend:** Thành viên làm việc riêng rẽ dẫn đến việc ghép nối ở Buổi 6, 7 bị xung đột schema.
  - *Giải pháp:* Thiết kế và chốt hợp đồng API (API Contract) chi tiết 14 trường thông tin và tạo migration DDL + Seed data chuẩn ngay từ Buổi 5 trước khi viết code giao diện.

