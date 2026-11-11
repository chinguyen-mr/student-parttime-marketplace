# Workflow: PPT Master Defense Presentation Generation

## 1. Mục tiêu
Tạo slide thuyết minh bảo vệ đồ án tốt nghiệp chuyên nghiệp, định dạng `.pptx` chuẩn DrawingML vector shapes, bám sát khung chương trình 15 slide.

## 2. Quy trình thực hiện
1. **Thu thập dữ liệu nguồn:**
   - Đọc dữ liệu từ `01_docs/`, `docs/architecture/`, `02_database/Data_v2.xlsx`.
   - Tuyệt đối không bịa đặt số liệu hoặc tính năng chưa có trong dự án.
2. **Khung 15 slide chuẩn bảo vệ:**
   - Slide 1: Bìa đề tài JobNest & Thông tin nhóm.
   - Slide 2: Đặt vấn đề & Nỗi đau thị trường việc làm sinh viên.
   - Slide 3: Mục tiêu & Phạm vi đề tài.
   - Slide 4: Khảo sát hiện trạng & Đối thủ cạnh tranh.
   - Slide 5: Tổng quan kiến trúc hệ thống 3-Tier.
   - Slide 6: Sơ đồ ERD & Cơ sở dữ liệu 13 bảng.
   - Slide 7: Luồng xác thực & Phân quyền bảo mật (RBAC).
   - Slide 8-10: Các phân hệ nghiệp vụ chính (Student, Employer, Admin).
   - Slide 11: Tích hợp Twenty CRM & Automation Webhooks.
   - Slide 12: Hệ thống sơ đồ kiến trúc Draw.io.
   - Slide 13: Quy trình kiểm thử & DevSecOps.
   - Slide 14: Kế hoạch triển khai & Docker Compose.
   - Slide 15: Kết luận & Hướng phát triển.
3. **Thực thi script sinh slide:**
   ```bash
   python scripts/generate_presentation.py
   ```
4. **Kiểm tra đầu ra:** Mở file `.pptx` kiểm tra độ sắc nét của vector shapes và màu sắc Soft Lavender & Warm Peach.

