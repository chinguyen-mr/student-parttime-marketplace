"""
JOBNEST — Presentation Generator Script (PPT Master Standard)
Generates native editable 16:9 PowerPoint presentation based on real project specs.
Requirements: pip install python-pptx
"""

import sys
import os

try:
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN
    from pptx.enum.shapes import MSO_SHAPE
except ImportError:
    print("[INFO] python-pptx is not installed. To generate PPTX, run: pip install python-pptx")
    sys.exit(0)

def create_deck(output_path="docs/presentation/JOBNEST_Project_Defense.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    COLOR_LAVENDER = RGBColor(117, 101, 168)   # #7565A8
    COLOR_PEACH = RGBColor(244, 185, 157)      # #F4B99D
    COLOR_DARK = RGBColor(41, 38, 58)          # #29263A
    COLOR_LIGHT = RGBColor(248, 247, 251)      # #F8F7FB
    COLOR_WHITE = RGBColor(255, 255, 255)

    slides_data = [
        {"title": "JOBNEST — Nền Tảng Việc Làm Cho Sinh Viên", "subtitle": "Báo cáo Đồ án Tốt nghiệp / Chuyên đề 2 | Nhóm tác giả: Nhóm Dự án JobNest", "bullets": ["Kết nối việc làm bán thời gian và thực tập cho sinh viên", "Kiến trúc 3-Tier chuẩn mực: React + Express + PostgreSQL", "Định hướng thiết kế: Soft Lavender & Peach"]},
        {"title": "1. Đặt Vấn Đề (Problem Statement)", "subtitle": "Thực trạng và nhu cầu cấp thiết của sinh viên", "bullets": ["Sinh viên gặp khó khăn khi tìm việc bán thời gian khớp lịch học linh hoạt", "Các nền tảng tuyển dụng truyền thống tràn lan tin tuyển dụng chưa xác minh", "Thiếu minh bạch về mức lương, địa điểm làm việc và đánh giá từ người đi trước"]},
        {"title": "2. Mục Tiêu & Phạm Vi (Objectives & Scope)", "subtitle": "Mục tiêu phát triển sản phẩm của JobNest", "bullets": ["Cung cấp giải pháp kết nối 2 chiều giữa Sinh viên & Nhà tuyển dụng đã xác thực", "Tối ưu hóa quy trình nộp CV và phản hồi trạng thái ứng tuyển theo thời gian thực", "Phạm vi: Web responsive hỗ trợ 3 đối tượng chính: Student, Employer, Admin"]},
        {"title": "3. Các Đối Tượng & Vai Trò (Stakeholders)", "subtitle": "Phân quyền và hành vi người dùng trong hệ thống", "bullets": ["Student: Tìm kiếm việc, lọc theo ca học, nộp CV 1-chạm, theo dõi trạng thái", "Employer: Đăng tin tuyển dụng, quản lý hồ sơ ứng viên, phân công công việc", "Admin: Duyệt tin đăng, quản lý xác thực doanh nghiệp, giám sát hệ thống"]},
        {"title": "4. Yêu Cầu Chức Năng (Functional Requirements)", "subtitle": "Bộ tính năng lõi được đặc tả trong SRS", "bullets": ["Xác thực & Quản lý hồ sơ (JWT Authentication, Profile Builder)", "Tìm kiếm & Lọc tin tuyển dụng theo mức lương, khoảng cách, thời gian", "Quy trình ứng tuyển, phỏng vấn, phê duyệt hồ sơ và phân công ca làm"]},
        {"title": "5. Sơ Đồ Use Case Tổng Quát", "subtitle": "Biểu diễn 10 luồng nghiệp vụ chính", "bullets": ["UC01-UC03: Quản lý tài khoản, hồ sơ cá nhân và xác thực doanh nghiệp", "UC04-UC06: Đăng tin, tìm kiếm việc làm và nộp hồ sơ ứng tuyển", "UC07-UC10: Đánh giá sinh viên, thông báo và kiểm duyệt quản trị"]},
        {"title": "6. Thiết Kế Cơ Sở Dữ Liệu & ERD", "subtitle": "Mô hình thực thể bám sát file chuẩn Data_v2.xlsx", "bullets": ["13 bảng dữ liệu lõi với quan hệ toàn vẹn khóa ngoại (FK) chặt chẽ", "Bao gồm: users, student_profiles, company_profiles, jobs, applications,...", "100% truy vấn qua Parameterized Queries đảm bảo không lỗi Injection"]},
        {"title": "7. Kiến Trúc Hệ Thống (System Architecture)", "subtitle": "Kiến trúc Client-Server hiện đại", "bullets": ["Frontend: Single Page Application (React 18 + Vite + Tailwind CSS)", "Backend: RESTful API (Express.js, Clean Architecture)", "Database: PostgreSQL 17 Containerized với mạng bridge độc lập"]},
        {"title": "8. Thiết Kế Giao Diện UI/UX (Design System)", "subtitle": "Bộ nhận diện thương hiệu Soft Lavender & Warm Peach", "bullets": ["Bảng màu Soft Lavender (#7565A8) kết hợp Warm Peach (#F4B99D)", "Đầy đủ 4 trạng thái tương tác: Loading Skeleton, Empty State, Error, Toast", "Responsive toàn diện trên Mobile (375px), Tablet (768px) và Desktop"]},
        {"title": "9. Công Nghệ & Môi Trường Triển Khai", "subtitle": "Stack công nghệ đồng nhất và tối ưu", "bullets": ["Ngôn ngữ: JavaScript (ES6+), Node.js v20+", "DevOps: Docker, Docker Compose, Nginx Reverse Proxy, Git/GitHub", "Kiểm thử: Bộ 31/31 Integration Tests tự động, Oxlint"]},
        {"title": "10. Kế Hoạch & Tiến Độ Triển Khai", "subtitle": "Quản lý tiến độ theo mô hình Agile/Scrum", "bullets": ["Sprint 0: Khởi động, hoàn thiện Use Case Spec, ERD và API Contract", "Sprint 1: Xây dựng Core API và phân hệ Sinh viên", "Sprint 2-3: Hoàn thiện phân hệ Tuyển dụng, Quản trị và kiểm thử an ninh"]},
        {"title": "11. Kịch Bản Trình Diễn (Demonstration)", "subtitle": "Các luồng demo trực tiếp trên hệ thống", "bullets": ["Demo 1: Sinh viên tìm việc, lọc theo mức lương và nộp hồ sơ ứng tuyển", "Demo 2: Doanh nghiệp đăng nhập, xem danh sách ứng viên và phê duyệt", "Demo 3: Quản trị viên duyệt tin đăng mới trên Admin Portal"]},
        {"title": "12. Kiểm Thử & Đảm Bảo Chất Lượng", "subtitle": "Kết quả kiểm toán an ninh và kiểm thử tự động", "bullets": ["31/31 Backend Integration Tests Pass 100%", "Security Audit đạt tiêu chuẩn OWASP Top 10 (0 lỗi Critical/High)", "Build Frontend hoàn tất trong 681ms với 0 cảnh báo"]},
        {"title": "13. Hạn Chế Hiện Tại (Limitations)", "subtitle": "Những điểm cần tiếp tục hoàn thiện", "bullets": ["Chưa tích hợp cổng thanh toán trực tuyến cho các gói tin VIP", "Thông báo hiện tại qua Database Polling, chưa dùng WebSocket real-time", "Ứng dụng di động Native (React Native) chưa phát triển"]},
        {"title": "14. Kết Luận & Định Hướng Phát Triển", "subtitle": "Kế hoạch nâng cấp trong giai đoạn tiếp theo", "bullets": ["Tích hợp AI Gợi ý việc làm thông minh dựa trên kỹ năng và lịch học", "Mở rộng hệ thống thông báo đẩy (Push Notifications) thời gian thực", "Hoàn thiện hồ sơ báo cáo khóa luận tốt nghiệp"]}
    ]

    for item in slides_data:
        slide = prs.slides.add_slide(blank_layout)
        
        # Header banner shape
        header_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.5))
        header_shape.fill.solid()
        header_shape.fill.fore_color.rgb = COLOR_LAVENDER
        header_shape.line.color.rgb = COLOR_LAVENDER

        tf = header_shape.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = item["title"]
        p.font.size = Pt(26)
        p.font.bold = True
        p.font.color.rgb = COLOR_WHITE
        p.alignment = PP_ALIGN.LEFT

        p2 = tf.add_paragraph()
        p2.text = item["subtitle"]
        p2.font.size = Pt(14)
        p2.font.color.rgb = COLOR_PEACH
        p2.alignment = PP_ALIGN.LEFT

        # Content Card
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1), Inches(2.2), Inches(11.333), Inches(4.5))
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_LIGHT
        card.line.color.rgb = COLOR_PEACH

        ctf = card.text_frame
        ctf.word_wrap = True
        for b_text in item["bullets"]:
            bp = ctf.add_paragraph()
            bp.text = "• " + b_text
            bp.font.size = Pt(20)
            bp.font.color.rgb = COLOR_DARK
            bp.space_before = Pt(18)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    prs.save(output_path)
    print(f"[SUCCESS] Native presentation created at: {output_path}")

if __name__ == "__main__":
    create_deck()

