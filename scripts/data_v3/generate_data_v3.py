"""
JobNest — Sinh bộ dữ liệu thực tế (Excel) khớp schema PostgreSQL hiện tại.

Mỗi sheet = 1 bảng DB, hàng tiêu đề = tên cột DB → import_data_v3.py nạp thẳng.
Dữ liệu liên kết nhất quán: ứng tuyển → phân công → tiến độ → đánh giá → thông báo,
vi phạm → khiếu nại, báo cáo → xử lý, nhật ký admin.

Kèm file thật (logo, ảnh bìa, ảnh văn phòng, ảnh đại diện, CV PDF, giấy tờ pháp lý PDF) trong
02_database/data_v3_files/ — sheet file_uploads trỏ tới các file này (xem assets_v3.py).

Chạy: xem scripts/data_v3/README.md (cần Pillow + fpdf2 → dùng Docker)
Ra:    02_database/JobNest_Data_v3.xlsx + 02_database/data_v3_files/
"""
import json
import random
import secrets
import sys
import unicodedata
from datetime import datetime, timedelta, date, time
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

import assets_v3 as A

if sys.platform.startswith('win'):
    sys.stdout.reconfigure(encoding='utf-8')

R = random.Random(2026)
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / '02_database' / 'JobNest_Data_v3.xlsx'
A.FILES_DIR = ROOT / '02_database' / 'data_v3_files'

NOW = datetime(2026, 11, 15, 9, 0, 0)
START = datetime(2026, 6, 1, 8, 0, 0)
DEMO_PASSWORD = 'Jobnest@2026'
# bcryptjs hash của DEMO_PASSWORD (cost 10) — tất cả tài khoản dùng chung mật khẩu demo.
PW_HASH = '$2b$10$Wsw9OBMsBZDSihXQgrut0efdtroxjy7gID8UaIfPZXfdR0tIOoHQW'

T = {}  # tên bảng -> list[dict]


def add(table, row):
    T.setdefault(table, []).append(row)
    return row


def nid(table):
    return len(T.get(table, [])) + 1


def rand_dt(a, b):
    if b <= a:
        return a
    return a + timedelta(seconds=R.randint(0, int((b - a).total_seconds())))


def slug(s):
    s = unicodedata.normalize('NFD', s.replace('đ', 'd').replace('Đ', 'D'))
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower()


def phone():
    return R.choice(['090', '091', '093', '094', '096', '097', '098', '070', '077', '079', '083', '085']) + ''.join(str(R.randint(0, 9)) for _ in range(7))


def upload(owner, kind, name, mime, rel_size, at):
    """Thêm 1 dòng file_uploads; cột data là đường dẫn file (tương đối thư mục chứa Excel)."""
    rel, size = rel_size
    fid = nid('file_uploads')
    add('file_uploads', dict(id=fid, owner_id=owner, kind=kind, original_name=name, mime_type=mime, size_bytes=size,
                             data=f'data_v3_files/{rel}', created_at=at))
    return fid


# ───────────────────────── DANH MỤC ─────────────────────────
HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Trương', 'Đinh', 'Lâm', 'Mai']
DEM_NAM = ['Văn', 'Minh', 'Quốc', 'Gia', 'Đức', 'Hoàng', 'Thành', 'Anh', 'Hữu', 'Tuấn']
DEM_NU = ['Thị', 'Ngọc', 'Thu', 'Thanh', 'Bảo', 'Mỹ', 'Khánh', 'Phương', 'Hồng', 'Kim']
TEN_NAM = ['Khang', 'Bảo', 'Huy', 'Khoa', 'Phúc', 'Nam', 'Long', 'Duy', 'Tài', 'Thịnh', 'Trí', 'Quân', 'Hiếu', 'Đạt', 'Tín', 'Vinh', 'Lộc', 'Phong', 'Sơn', 'Nhân']
TEN_NU = ['Anh', 'Vy', 'Trâm', 'Ngân', 'Linh', 'Thảo', 'Hân', 'Nhi', 'Trang', 'My', 'Uyên', 'Quỳnh', 'Yến', 'Hương', 'Giang', 'Thư', 'Ngọc', 'Phương', 'Tiên', 'Mai']

UNIS = [
    ('Trường Đại học Văn Lang', 'VLU', 'vanlanguni.vn'),
    ('Trường Đại học Kinh tế TP.HCM', 'UEH', 'st.ueh.edu.vn'),
    ('Trường Đại học Bách khoa – ĐHQG TP.HCM', 'HCMUT', 'hcmut.edu.vn'),
    ('Trường Đại học Khoa học Tự nhiên – ĐHQG TP.HCM', 'HCMUS', 'student.hcmus.edu.vn'),
    ('Trường Đại học Tôn Đức Thắng', 'TDTU', 'student.tdtu.edu.vn'),
    ('Trường Đại học Công nghiệp TP.HCM', 'IUH', 'student.iuh.edu.vn'),
    ('Trường Đại học Sư phạm TP.HCM', 'HCMUE', 'student.hcmue.edu.vn'),
    ('Trường Đại học Ngân hàng TP.HCM', 'HUB', 'st.hub.edu.vn'),
    ('Trường Đại học Hoa Sen', 'HSU', 'sv.hoasen.edu.vn'),
    ('Trường Đại học Công nghệ TP.HCM (HUTECH)', 'HUTECH', 'hutech.edu.vn'),
]
MAJORS = {
    'Công nghệ thông tin': ['JavaScript', 'ReactJS', 'Node.js', 'SQL', 'Git', 'Python', 'Hỗ trợ kỹ thuật IT', 'Kiểm thử phần mềm'],
    'Kỹ thuật phần mềm': ['Java', 'ReactJS', 'PostgreSQL', 'Git', 'Docker', 'REST API', 'TypeScript'],
    'Khoa học dữ liệu': ['Python', 'SQL', 'Phân tích dữ liệu', 'Excel nâng cao', 'Power BI'],
    'Thiết kế đồ họa': ['Adobe Photoshop', 'Adobe Illustrator', 'Figma', 'Canva', 'CapCut', 'Thiết kế ấn phẩm'],
    'Marketing': ['Content Marketing', 'Facebook Ads', 'Canva', 'Quản lý fanpage', 'TikTok Marketing', 'Tổ chức sự kiện'],
    'Quản trị kinh doanh': ['Bán hàng', 'Chăm sóc khách hàng', 'Đàm phán', 'Nghiên cứu thị trường', 'Excel nâng cao'],
    'Logistics và Quản lý chuỗi cung ứng': ['Quản lý kho', 'Nhập liệu', 'Excel nâng cao', 'Lập kế hoạch'],
    'Kế toán': ['Excel nâng cao', 'Phần mềm MISA', 'Nhập liệu chứng từ', 'Kiểm kê'],
    'Ngôn ngữ Anh': ['Tiếng Anh giao tiếp', 'Biên dịch', 'Gia sư ngoại ngữ', 'IELTS', 'Thuyết trình'],
    'Quản trị khách sạn': ['Lễ tân', 'Phục vụ bàn', 'Pha chế', 'Chăm sóc khách hàng', 'Tiếng Anh giao tiếp'],
    'Sư phạm Toán': ['Gia sư', 'Trợ giảng', 'Soạn giáo án', 'Kỹ năng sư phạm', 'Quản lý lớp học'],
    'Quan hệ công chúng': ['Tổ chức sự kiện', 'Content Marketing', 'Thuyết trình', 'Quản lý fanpage'],
}
MAJOR_TO_PREF = {
    'Công nghệ thông tin': 'Công nghệ thông tin / Phần mềm', 'Kỹ thuật phần mềm': 'Công nghệ thông tin / Phần mềm',
    'Khoa học dữ liệu': 'Công nghệ thông tin / Phần mềm', 'Thiết kế đồ họa': 'Thiết kế đồ họa / Multimedia',
    'Marketing': 'Marketing, Truyền thông & Sự kiện', 'Quan hệ công chúng': 'Marketing, Truyền thông & Sự kiện',
    'Quản trị kinh doanh': 'Bán hàng, Thu ngân & CSKH', 'Logistics và Quản lý chuỗi cung ứng': 'Giao hàng, Vận tải & Logistics',
    'Kế toán': 'Hành chính, Văn phòng & Nhập liệu', 'Ngôn ngữ Anh': 'Gia sư, Trợ giảng & Đào tạo',
    'Quản trị khách sạn': 'Dịch vụ & F&B (Nhà hàng, Quán cafe)', 'Sư phạm Toán': 'Gia sư, Trợ giảng & Đào tạo',
}

EXPERIENCE_POOL = [
    ('Highlands Coffee', 'Nhân viên phục vụ part-time', 'Phục vụ khách, pha chế đồ uống cơ bản, đóng ca và kiểm kê nguyên liệu cuối ngày.'),
    ('Circle K', 'Thu ngân ca tối', 'Tính tiền, đối soát két cuối ca, sắp xếp hàng hóa và hỗ trợ khách thanh toán ví điện tử.'),
    ('Trung tâm Anh ngữ ILA', 'Trợ giảng', 'Hỗ trợ giáo viên quản lý lớp 15 học viên, chấm bài và tổ chức hoạt động tương tác.'),
    ('Shopee Xpress', 'Nhân viên phân loại hàng', 'Quét mã, phân loại bưu kiện theo tuyến, đảm bảo đúng thời gian bàn giao.'),
    ('CLB Truyền thông khoa', 'Trưởng ban nội dung', 'Lên kế hoạch nội dung fanpage, viết bài và quay dựng video cho các sự kiện của khoa.'),
    ('Đoàn – Hội sinh viên trường', 'Tình nguyện viên Mùa hè xanh', 'Tham gia chiến dịch tình nguyện, dạy học cho trẻ em và hỗ trợ xây dựng nhà văn hóa.'),
    ('Lotteria', 'Nhân viên phục vụ', 'Nhận order, chuẩn bị món, giữ vệ sinh khu vực bán hàng theo tiêu chuẩn của chuỗi.'),
    ('Công ty TNHH Phần mềm Sao Mai', 'Thực tập sinh lập trình', 'Tham gia dự án web nội bộ, viết API và kiểm thử chức năng dưới sự hướng dẫn của mentor.'),
    ('Agency Sóng Media', 'Cộng tác viên thiết kế', 'Thiết kế ấn phẩm mạng xã hội và banner quảng cáo theo brief của khách hàng.'),
]
ACTIVITY_POOL = [
    'Chứng chỉ Tin học văn phòng MOS Excel', 'Chứng chỉ TOEIC 650', 'Giải Khuyến khích cuộc thi Ý tưởng khởi nghiệp cấp trường',
    'Thành viên đội tình nguyện Xuân tình nguyện 2025', 'Hoàn thành khóa Kỹ năng giao tiếp và làm việc nhóm',
    'Học bổng khuyến khích học tập học kỳ 1 năm 2025', 'Chứng chỉ Google Digital Marketing', 'Ban tổ chức Ngày hội việc làm của khoa',
    'Chứng chỉ IELTS 6.5', 'Hoàn thành khóa Vệ sinh an toàn thực phẩm',
]

# (phường/quận, đường, lat, lng) — TP.HCM
PLACES = [
    ('Phường Bến Nghé, Quận 1', 'Lê Lợi', 10.7745, 106.7010), ('Phường Bến Thành, Quận 1', 'Lê Thánh Tôn', 10.7725, 106.6980),
    ('Phường 6, Quận 3', 'Võ Văn Tần', 10.7769, 106.6905), ('Phường Võ Thị Sáu, Quận 3', 'Nam Kỳ Khởi Nghĩa', 10.7830, 106.6895),
    ('Phường 13, Quận Bình Thạnh', 'Đặng Thùy Trâm', 10.8270, 106.6990), ('Phường 25, Quận Bình Thạnh', 'Điện Biên Phủ', 10.8010, 106.7150),
    ('Phường 7, Quận Phú Nhuận', 'Phan Xích Long', 10.7990, 106.6870), ('Phường 4, Quận Tân Bình', 'Cộng Hòa', 10.8015, 106.6530),
    ('Phường Tân Phú, Quận 7', 'Nguyễn Văn Linh', 10.7295, 106.7210), ('Phường Thảo Điền, TP. Thủ Đức', 'Xuân Thủy', 10.8040, 106.7360),
    ('Phường Linh Trung, TP. Thủ Đức', 'Võ Văn Ngân', 10.8500, 106.7700), ('Phường 10, Quận Gò Vấp', 'Quang Trung', 10.8370, 106.6650),
    ('Phường 2, Quận 10', 'Ba Tháng Hai', 10.7680, 106.6700), ('Phường 4, Quận 5', 'An Dương Vương', 10.7590, 106.6820),
    ('Phường Tân Thành, Quận Tân Phú', 'Lũy Bán Bích', 10.7910, 106.6330),
]

CATEGORIES = ['Bán lẻ', 'F&B / Dịch vụ ăn uống', 'Công nghệ thông tin', 'Giáo dục / Đào tạo', 'Marketing / Truyền thông',
              'Logistics / Giao nhận', 'Hàng tiêu dùng / FMCG', 'Hành chính / Văn phòng', 'Thiết kế / Multimedia', 'Sản xuất / Kỹ thuật']

# Ngành công ty → (tiền tố tên, danh mục việc, industry form)
COMPANY_KINDS = [
    ('Cà phê', ['Mộc Lam', 'Sương Sớm', 'Gió Bấc', 'Hạt Nâu', 'Phố Cũ'], 'F&B / Dịch vụ ăn uống', 'Nhà hàng – Khách sạn – F&B'),
    ('Nhà hàng', ['Bếp Nhà Mây', 'Lửa Hồng', 'Quê Nội'], 'F&B / Dịch vụ ăn uống', 'Nhà hàng – Khách sạn – F&B'),
    ('Chuỗi bán lẻ', ['Tiện Lợi 24h Xanh', 'Mart An Khang Plus', 'Sạp Việt'], 'Bán lẻ', 'Bán lẻ & Thương mại'),
    ('Phần mềm', ['NovaSoft', 'BlueOcean Tech', 'CodeMint', 'Saigon Devhouse', 'Lotus AI Lab'], 'Công nghệ thông tin', 'Công nghệ thông tin'),
    ('Trung tâm Anh ngữ', ['Sunrise English', 'Bright Kids', 'EduPath'], 'Giáo dục / Đào tạo', 'Giáo dục & Đào tạo'),
    ('Truyền thông', ['Mây Media', 'Pixel Agency', 'Tiếng Vang Communication'], 'Marketing / Truyền thông', 'Marketing & Truyền thông'),
    ('Giao nhận', ['Tốc Hành Express', 'Kho Vận Phương Nam', 'Siêu Tốc Logistics'], 'Logistics / Giao nhận', 'Logistics & Vận tải'),
    ('Phân phối', ['Hương Việt Foods', 'Gạo Ngọc FMCG', 'Thực Phẩm Lành'], 'Hàng tiêu dùng / FMCG', 'Bán lẻ & Thương mại'),
    ('Dịch vụ văn phòng', ['Hồ Sơ Nhanh', 'Kế Toán Minh Bạch', 'Office Plus'], 'Hành chính / Văn phòng', 'Dịch vụ'),
    ('Studio', ['Khoảnh Khắc Studio', 'Frame Design', 'Mắt Xanh Creative'], 'Thiết kế / Multimedia', 'Marketing & Truyền thông'),
    ('Xưởng in', ['In Ấn Sắc Màu', 'Bao Bì Tân Tiến'], 'Sản xuất / Kỹ thuật', 'Sản xuất'),
]

# Danh mục → mẫu việc: (title, mô tả, yêu cầu, phúc lợi, skills, (lương min,max), salary_type, ca)
JOB_TEMPLATES = {
    'F&B / Dịch vụ ăn uống': [
        ('Nhân viên Phục vụ ca tối', 'Đón khách, ghi order, phục vụ món và dọn bàn. Phối hợp với quầy bar để đảm bảo món ra đúng thứ tự.', 'Nhanh nhẹn, thân thiện, chịu được áp lực giờ cao điểm. Không yêu cầu kinh nghiệm, được đào tạo.', 'Bao ăn ca, phụ cấp gửi xe, thưởng doanh thu cuối tháng.', ['Phục vụ bàn', 'Chăm sóc khách hàng'], (25000, 30000), 'HOURLY', 'evening'),
        ('Nhân viên Pha chế (Barista) part-time', 'Pha chế cà phê, trà trái cây theo công thức chuẩn của quán; giữ quầy bar sạch sẽ.', 'Ưu tiên bạn từng pha chế; cẩn thận, sạch sẽ.', 'Đào tạo pha chế miễn phí, giảm 50% đồ uống, xếp ca linh hoạt theo lịch học.', ['Pha chế', 'Vệ sinh an toàn thực phẩm'], (26000, 32000), 'HOURLY', 'morning'),
        ('Thu ngân ca sáng', 'Tính tiền, xuất hóa đơn, đối soát két cuối ca, hỗ trợ khách thanh toán qua ví điện tử.', 'Trung thực, cẩn thận, biết dùng máy tính cơ bản.', 'Phụ cấp chuyên cần 300.000đ/tháng, bao ăn ca.', ['Thu ngân', 'Chăm sóc khách hàng'], (25000, 28000), 'HOURLY', 'morning'),
    ],
    'Bán lẻ': [
        ('Nhân viên Bán hàng cửa hàng tiện lợi', 'Sắp xếp hàng hóa, kiểm hạn sử dụng, tính tiền và hỗ trợ khách tại cửa hàng.', 'Có thể làm tối thiểu 4 ca/tuần, ưu tiên ca tối và cuối tuần.', 'Thưởng lễ Tết, phụ cấp ca đêm, môi trường trẻ trung.', ['Bán hàng', 'Thu ngân'], (24000, 28000), 'HOURLY', 'evening'),
        ('Nhân viên Kho bán lẻ cuối tuần', 'Nhận hàng, kiểm đếm, sắp xếp kệ và cập nhật tồn kho trên phần mềm.', 'Sức khỏe tốt, cẩn thận, biết Excel cơ bản.', 'Lương tuần, hỗ trợ gửi xe.', ['Quản lý kho', 'Nhập liệu'], (25000, 30000), 'HOURLY', 'weekend'),
    ],
    'Công nghệ thông tin': [
        ('Thực tập sinh Frontend ReactJS', 'Xây dựng giao diện web theo thiết kế Figma, kết nối REST API, viết component tái sử dụng.', 'Nắm HTML/CSS, JavaScript, ReactJS cơ bản; biết dùng Git.', 'Phụ cấp thực tập, mentor 1-1, xác nhận thực tập, cơ hội lên chính thức.', ['ReactJS', 'JavaScript', 'Git'], (3000000, 5000000), 'MONTHLY', 'morning'),
        ('Cộng tác viên Kiểm thử phần mềm (Tester)', 'Viết test case, kiểm thử chức năng web/mobile, ghi nhận lỗi lên Jira.', 'Tư duy logic, cẩn thận; ưu tiên sinh viên CNTT năm 3-4.', 'Làm việc hybrid, được đào tạo quy trình kiểm thử.', ['Kiểm thử phần mềm', 'SQL'], (35000, 45000), 'HOURLY', 'afternoon'),
        ('Nhân viên Hỗ trợ IT Helpdesk part-time', 'Cài đặt phần mềm, xử lý sự cố máy tính, mạng nội bộ cho nhân viên văn phòng.', 'Hiểu biết phần cứng, Windows, mạng LAN cơ bản.', 'Phụ cấp ăn trưa, giờ làm cố định buổi sáng.', ['Hỗ trợ kỹ thuật IT'], (30000, 38000), 'HOURLY', 'morning'),
        ('Thực tập sinh Backend Node.js', 'Phát triển API với Node.js/Express và PostgreSQL, viết unit test.', 'Biết JavaScript, SQL; hiểu REST API.', 'Phụ cấp 4–6 triệu, laptop làm việc, review code hằng tuần.', ['Node.js', 'PostgreSQL', 'REST API'], (4000000, 6000000), 'MONTHLY', 'afternoon'),
    ],
    'Giáo dục / Đào tạo': [
        ('Trợ giảng tiếng Anh thiếu nhi', 'Hỗ trợ giáo viên chính trong lớp, quản lý lớp, chấm bài và tổ chức trò chơi học tập.', 'Phát âm chuẩn, IELTS 6.0+ hoặc tương đương; yêu trẻ.', 'Đào tạo phương pháp giảng dạy, lương theo buổi, thưởng học viên tái đăng ký.', ['Trợ giảng', 'Tiếng Anh giao tiếp'], (80000, 120000), 'HOURLY', 'evening'),
        ('Gia sư Toán THCS', 'Kèm 1-1 học sinh lớp 8-9 tại nhà, 3 buổi/tuần, theo giáo trình trung tâm.', 'Sinh viên khối ngành sư phạm/kỹ thuật, giỏi Toán.', 'Hỗ trợ đi lại, tài liệu giảng dạy có sẵn.', ['Gia sư', 'Kỹ năng sư phạm'], (100000, 150000), 'HOURLY', 'evening'),
    ],
    'Marketing / Truyền thông': [
        ('Cộng tác viên Viết nội dung (Content)', 'Viết bài fanpage, blog chuẩn SEO theo kế hoạch nội dung hằng tuần.', 'Viết tốt, sáng tạo; ưu tiên biết Canva.', 'Làm online, nhuận bút theo bài, được đào tạo SEO.', ['Content Marketing', 'Viết bài chuẩn SEO'], (2500000, 4000000), 'MONTHLY', 'afternoon'),
        ('Nhân viên Tổ chức sự kiện cuối tuần', 'Setup, check-in khách, điều phối hoạt động tại sự kiện ra mắt sản phẩm.', 'Năng động, giao tiếp tốt, chịu được cường độ cao.', 'Lương theo ngày, có suất ăn, giấy chứng nhận tham gia.', ['Tổ chức sự kiện'], (30000, 40000), 'HOURLY', 'weekend'),
        ('Thực tập sinh Quản lý Fanpage & TikTok', 'Lên lịch đăng bài, quay dựng video ngắn, báo cáo chỉ số tương tác hằng tuần.', 'Hiểu xu hướng mạng xã hội, biết CapCut.', 'Phụ cấp thực tập, được làm chiến dịch thật.', ['Quản lý fanpage', 'TikTok Marketing', 'CapCut'], (3000000, 4500000), 'MONTHLY', 'afternoon'),
    ],
    'Logistics / Giao nhận': [
        ('Nhân viên Phân loại hàng ca tối', 'Quét mã, phân loại bưu kiện theo tuyến, đóng bao và bàn giao cho tài xế.', 'Sức khỏe tốt, có thể làm ca 18h–22h.', 'Phụ cấp ca tối, bao ăn tối, lương tuần.', ['Quản lý kho'], (28000, 35000), 'HOURLY', 'evening'),
        ('Nhân viên Nhập liệu đơn hàng', 'Nhập đơn, đối soát COD, cập nhật trạng thái vận đơn trên hệ thống.', 'Gõ phím nhanh, thành thạo Excel.', 'Môi trường văn phòng, giờ giấc ổn định.', ['Nhập liệu', 'Excel nâng cao'], (25000, 30000), 'HOURLY', 'morning'),
    ],
    'Hàng tiêu dùng / FMCG': [
        ('Nhân viên PG/PB giới thiệu sản phẩm', 'Giới thiệu, mời dùng thử sản phẩm tại siêu thị cuối tuần.', 'Ngoại hình ưa nhìn, giao tiếp tốt.', 'Thưởng theo doanh số, đồng phục được cấp.', ['Bán hàng', 'Chăm sóc khách hàng'], (35000, 45000), 'HOURLY', 'weekend'),
        ('Cộng tác viên Khảo sát thị trường', 'Khảo sát giá, trưng bày sản phẩm tại các điểm bán, chụp ảnh báo cáo qua app.', 'Có xe máy, smartphone.', 'Hỗ trợ xăng xe, giờ giấc tự chủ.', ['Nghiên cứu thị trường'], (30000, 35000), 'HOURLY', 'flexible'),
    ],
    'Hành chính / Văn phòng': [
        ('Trợ lý hành chính part-time', 'Soạn thảo văn bản, lưu trữ hồ sơ, tiếp khách và nghe điện thoại.', 'Thành thạo Word/Excel, cẩn thận.', 'Làm giờ hành chính buổi sáng, phụ cấp ăn trưa.', ['Soạn thảo văn bản', 'Nhập liệu'], (25000, 30000), 'HOURLY', 'morning'),
        ('Cộng tác viên Kế toán nhập chứng từ', 'Nhập hóa đơn, chứng từ vào phần mềm MISA, đối chiếu công nợ.', 'Sinh viên kế toán năm 3-4, biết MISA.', 'Được kèm cặp bởi kế toán trưởng, xác nhận thực tập.', ['Phần mềm MISA', 'Nhập liệu chứng từ'], (3500000, 5000000), 'MONTHLY', 'morning'),
    ],
    'Thiết kế / Multimedia': [
        ('Cộng tác viên Thiết kế đồ họa', 'Thiết kế banner, ấn phẩm social, menu theo brief của khách hàng.', 'Thành thạo Photoshop/Illustrator, có portfolio.', 'Làm từ xa, giao việc qua Trello, thưởng theo dự án.', ['Adobe Photoshop', 'Adobe Illustrator'], (3000000, 6000000), 'MONTHLY', 'afternoon'),
        ('Trợ lý quay dựng video', 'Hỗ trợ setup ánh sáng, quay và dựng video ngắn cho thương hiệu.', 'Biết Premiere/CapCut, có máy ảnh là lợi thế.', 'Học nghề trực tiếp, phụ cấp theo buổi quay.', ['Quay dựng video', 'CapCut'], (35000, 50000), 'HOURLY', 'weekend'),
    ],
    'Sản xuất / Kỹ thuật': [
        ('Nhân viên Kiểm tra chất lượng (QC) part-time', 'Kiểm tra bản in, màu sắc, quy cách thành phẩm trước khi đóng gói.', 'Tỉ mỉ, mắt tốt, có thể đứng lâu.', 'Bao ăn ca, phụ cấp tăng ca.', ['Kiểm kê'], (26000, 32000), 'HOURLY', 'morning'),
    ],
}

# Tin Full-time (dành cho sinh viên năm cuối / mới tốt nghiệp): lương theo tháng, giờ hành chính
FULLTIME_TEMPLATES = {
    'Công nghệ thông tin': [
        ('Lập trình viên Frontend (Fresher) – Full-time', 'Phát triển giao diện web ReactJS cho sản phẩm SaaS, phối hợp với backend và designer theo quy trình Scrum.', 'Sinh viên năm cuối hoặc mới tốt nghiệp CNTT; nắm vững JavaScript, ReactJS, Git.', 'Lương 10–14 triệu, BHXH đầy đủ, 13 ngày phép/năm, laptop làm việc, đánh giá lương 6 tháng/lần.', ['ReactJS', 'JavaScript', 'Git'], (10000000, 14000000), 'MONTHLY', 'fulltime'),
        ('Kỹ sư Kiểm thử phần mềm (Junior QA) – Full-time', 'Lập kế hoạch kiểm thử, viết test case, kiểm thử API và giao diện, báo cáo lỗi trên Jira.', 'Tốt nghiệp CNTT; biết SQL, Postman; ưu tiên có chứng chỉ ISTQB.', 'Lương 9–12 triệu, BHXH, thưởng dự án, đào tạo kiểm thử tự động.', ['Kiểm thử phần mềm', 'SQL', 'REST API'], (9000000, 12000000), 'MONTHLY', 'fulltime'),
    ],
    'Logistics / Giao nhận': [('Nhân viên Điều phối vận đơn – Full-time', 'Điều phối tài xế theo tuyến, theo dõi trạng thái giao hàng, xử lý đơn phát sinh với khách hàng.', 'Tốt nghiệp khối Kinh tế/Logistics; thành thạo Excel, giao tiếp tốt.', 'Lương 8–10 triệu + phụ cấp, BHXH, du lịch công ty hằng năm.', ['Lập kế hoạch', 'Excel nâng cao'], (8000000, 10000000), 'MONTHLY', 'fulltime')],
    'Bán lẻ': [('Cửa hàng trưởng tập sự – Full-time', 'Quản lý ca, sắp xếp nhân sự, kiểm soát tồn kho và doanh thu cửa hàng dưới sự hướng dẫn của quản lý khu vực.', 'Tốt nghiệp Cao đẳng/Đại học; ưu tiên từng làm bán hàng part-time.', 'Lương 9–11 triệu + thưởng doanh số, lộ trình lên Cửa hàng trưởng sau 6 tháng.', ['Bán hàng', 'Quản lý kho', 'Chăm sóc khách hàng'], (9000000, 11000000), 'MONTHLY', 'fulltime')],
    'Marketing / Truyền thông': [('Nhân viên Digital Marketing – Full-time', 'Lập kế hoạch và chạy quảng cáo Facebook/Google, đo lường hiệu quả chiến dịch, phối hợp đội nội dung.', 'Tốt nghiệp Marketing; đã chạy quảng cáo thực tế là lợi thế.', 'Lương 9–12 triệu + KPI, BHXH, ngân sách học khóa học chuyên môn.', ['Facebook Ads', 'Google Analytics', 'Content Marketing'], (9000000, 12000000), 'MONTHLY', 'fulltime')],
    'Hành chính / Văn phòng': [('Nhân viên Hành chính – Nhân sự – Full-time', 'Quản lý hồ sơ nhân sự, chấm công, soạn thảo hợp đồng, hỗ trợ tuyển dụng.', 'Tốt nghiệp Quản trị nhân lực/Luật/Kinh tế; cẩn thận, thành thạo tin học văn phòng.', 'Lương 8–10 triệu, BHXH, 12 ngày phép, môi trường ổn định.', ['Soạn thảo văn bản', 'Nhập liệu'], (8000000, 10000000), 'MONTHLY', 'fulltime')],
    'Giáo dục / Đào tạo': [('Giáo viên tiếng Anh thiếu nhi – Full-time', 'Giảng dạy lớp tiếng Anh thiếu nhi theo giáo trình trung tâm, theo dõi tiến độ học viên và trao đổi với phụ huynh.', 'Tốt nghiệp Ngôn ngữ Anh/Sư phạm Anh; IELTS 7.0+.', 'Lương 11–15 triệu, BHXH, đào tạo phương pháp giảng dạy quốc tế.', ['Tiếng Anh giao tiếp', 'Kỹ năng sư phạm'], (11000000, 15000000), 'MONTHLY', 'fulltime')],
    'F&B / Dịch vụ ăn uống': [('Quản lý ca nhà hàng – Full-time', 'Điều hành ca, phân công nhân viên, xử lý phản hồi khách, kiểm soát chất lượng món và vệ sinh.', 'Tốt nghiệp Quản trị Nhà hàng – Khách sạn; có kinh nghiệm phục vụ là lợi thế.', 'Lương 9–12 triệu + service charge, bao ăn, BHXH.', ['Phục vụ bàn', 'Chăm sóc khách hàng'], (9000000, 12000000), 'MONTHLY', 'fulltime')],
    'Hàng tiêu dùng / FMCG': [('Nhân viên Kinh doanh kênh siêu thị – Full-time', 'Chăm sóc hệ thống siêu thị khu vực, theo dõi trưng bày, đặt hàng và triển khai khuyến mãi.', 'Tốt nghiệp khối Kinh tế; có xe máy, chịu khó di chuyển.', 'Lương 8–10 triệu + hoa hồng, phụ cấp xăng xe, BHXH.', ['Bán hàng', 'Đàm phán', 'Nghiên cứu thị trường'], (8000000, 10000000), 'MONTHLY', 'fulltime')],
    'Thiết kế / Multimedia': [('Graphic Designer – Full-time', 'Thiết kế nhận diện thương hiệu, ấn phẩm in và nội dung mạng xã hội cho khách hàng của studio.', 'Tốt nghiệp Thiết kế đồ họa; portfolio tốt; thành thạo Photoshop, Illustrator, Figma.', 'Lương 9–13 triệu, BHXH, thiết bị làm việc cấu hình cao.', ['Adobe Photoshop', 'Adobe Illustrator', 'Figma'], (9000000, 13000000), 'MONTHLY', 'fulltime')],
    'Sản xuất / Kỹ thuật': [('Kỹ thuật viên QA/QC – Full-time', 'Kiểm soát chất lượng đầu vào và thành phẩm, lập báo cáo lỗi, đề xuất cải tiến quy trình.', 'Tốt nghiệp Kỹ thuật/Công nghệ in; cẩn thận, chịu được áp lực.', 'Lương 8–10 triệu, bao ăn ca, BHXH, thưởng năng suất.', ['Kiểm kê'], (8000000, 10000000), 'MONTHLY', 'fulltime')],
}

# Ca làm theo quy ước của web: day_of_week 1 = Chủ nhật, 2 = Thứ 2 … 7 = Thứ 7.
# Giờ trùng 3 ca chuẩn của trang "Lịch rảnh" (Sáng 07:30–11:30, Chiều 13:00–17:00, Tối 18:00–22:00).
SANG, CHIEU, TOI = ('07:30', '11:30'), ('13:00', '17:00'), ('18:00', '22:00')
SHIFTS = {
    'morning': ([2, 3, 4, 5, 6], [SANG]), 'afternoon': ([2, 3, 4, 5, 6], [CHIEU]), 'evening': ([2, 3, 4, 5, 6, 7], [TOI]),
    'weekend': ([7, 1], [SANG, CHIEU]), 'flexible': ([3, 5, 7, 1], [SANG]), 'fulltime': ([2, 3, 4, 5, 6], [SANG, CHIEU]),
}
SHIFT_TEXT = {
    'morning': 'Ca sáng 7h30–11h30, Thứ 2 – Thứ 6', 'afternoon': 'Ca chiều 13h–17h, Thứ 2 – Thứ 6',
    'evening': 'Ca tối 18h–22h, Thứ 2 – Thứ 7', 'weekend': 'Cuối tuần (Thứ 7, Chủ nhật), 7h30–11h30 và 13h–17h',
    'flexible': 'Linh hoạt, buổi sáng Thứ 3, Thứ 5, Thứ 7, Chủ nhật', 'fulltime': 'Giờ hành chính 7h30–17h, Thứ 2 – Thứ 6',
}
DAY_NAME = {1: 'CN', 2: 'T2', 3: 'T3', 4: 'T4', 5: 'T5', 6: 'T6', 7: 'T7'}

# ───────────────────────── 1. CATEGORIES ─────────────────────────
for i, c in enumerate(CATEGORIES, 1):
    add('categories', dict(id=i, name=c, parent_id=None, is_active=True, created_at=START - timedelta(days=30)))

# ───────────────────────── 2. USERS ─────────────────────────
def mk_user(email, name, role, created, status='ACTIVE'):
    uid = nid('users')
    return add('users', dict(id=uid, email=email, password_hash=PW_HASH, full_name=name, phone=phone(), role=role, status=status,
                            created_at=created, updated_at=rand_dt(created, NOW), violation_count=0, suspension_reason=None,
                            suspended_at=None, suspension_expires_at=None))

admins = [mk_user('admin.test@vlu.edu.vn', 'Quản trị viên Hệ thống', 'ADMIN', START - timedelta(days=40)),
          mk_user('kiemduyet.lan@jobnest.vn', 'Trần Ngọc Lan (Kiểm duyệt)', 'ADMIN', START - timedelta(days=35)),
          mk_user('hotro.phuc@jobnest.vn', 'Lê Hoàng Phúc (Hỗ trợ)', 'ADMIN', START - timedelta(days=20))]
ADMIN_IDS = [a['id'] for a in admins]


def person(gender=None):
    g = gender or R.choice(['Nam', 'Nữ'])
    if g == 'Nam':
        return g, f"{R.choice(HO)} {R.choice(DEM_NAM)} {R.choice(TEN_NAM)}"
    return g, f"{R.choice(HO)} {R.choice(DEM_NU)} {R.choice(TEN_NU)}"


# ── Nhà tuyển dụng
employers = []  # dict: user, profile, cat
names_used = set()
company_specs = []
for kind, brands, cat, industry in COMPANY_KINDS:
    for b in brands:
        company_specs.append((kind, b, cat, industry))
R.shuffle(company_specs)
company_specs = company_specs[:36]
company_specs.insert(0, ('Phần mềm', 'VLU Tech', 'Công nghệ thông tin', 'Công nghệ thông tin'))

VERIF_PLAN = ['VERIFIED'] * 24 + ['PENDING'] * 5 + ['UNVERIFIED'] * 4 + ['NEEDS_INFO'] * 2 + ['REJECTED'] * 2
for idx, (kind, brand, cat, industry) in enumerate(company_specs):
    household = kind in ('Cà phê', 'Nhà hàng') and R.random() < 0.4
    ctype = 'Hộ kinh doanh cá thể' if household else R.choice(['Công ty TNHH', 'Công ty TNHH', 'Công ty Cổ phần'])
    legal = f"{'Hộ kinh doanh' if household else ctype} {kind} {brand}" if kind not in ('Phần mềm', 'Studio') else f"{ctype} {brand}"
    display = f"{kind} {brand}" if kind in ('Cà phê', 'Nhà hàng', 'Trung tâm Anh ngữ', 'Studio') else brand
    s = slug(brand).replace(' ', '')
    email = 'employer.test@vlu.edu.vn' if idx == 0 else f"tuyendung@{s}.vn"
    _, rep = person()
    created = rand_dt(START - timedelta(days=25), START + timedelta(days=60)) if idx else START - timedelta(days=30)
    u = mk_user(email, display, 'EMPLOYER', created)
    ward, street, lat, lng = R.choice(PLACES)
    addr = f"{R.randint(12, 420)} {street}, {ward}, TP. Hồ Chí Minh"
    v = 'VERIFIED' if idx == 0 else VERIF_PLAN[(idx - 1) % len(VERIF_PLAN)]
    size = R.choice(['Dưới 10 nhân viên', '10 – 49 nhân viên', '50 – 199 nhân viên', '200 – 499 nhân viên']) if not household else 'Dưới 10 nhân viên'
    founded = R.randint(2008, 2023)
    sub = rand_dt(created, created + timedelta(days=10)) if v != 'UNVERIFIED' else None
    rev = rand_dt(sub, sub + timedelta(days=4)) if v in ('VERIFIED', 'NEEDS_INFO', 'REJECTED') else None
    p = add('employer_profiles', dict(
        id=nid('employer_profiles'), user_id=u['id'], display_name=display,
        bio=f"{display} hoạt động trong lĩnh vực {cat.lower()} tại TP. Hồ Chí Minh từ năm {founded}. Chúng tôi ưu tiên tuyển sinh viên làm bán thời gian, xếp ca theo lịch học và đào tạo từ đầu.",
        location=addr, avatar_url=None, email_verified_at=created + timedelta(minutes=5),
        phone_verified_at=created + timedelta(minutes=8) if v == 'VERIFIED' else None,
        created_at=created, updated_at=rand_dt(created, NOW),
        account_type='Hộ kinh doanh / Cá nhân' if household else 'Doanh nghiệp / Công ty',
        tax_code=str(R.randint(3100000000, 3199999999)) if not household else str(R.randint(8000000000, 8999999999)),
        website=None if household else f"https://{s}.vn", business_license_file=None,
        representative_name=rep, representative_title='Chủ hộ kinh doanh' if household else 'Giám đốc',
        company_name=legal, company_type=ctype, industry=industry, company_size=size, province='TP. Hồ Chí Minh', detailed_address=addr,
        cover_url=None, recruiter_name=rep, recruiter_email=email,
        work_environment_desc='Không gian mở, đội ngũ trẻ, quản lý ca hỗ trợ tận tình. Có phòng nghỉ và khu ăn uống cho nhân viên.',
        office_images=[], verification_status=v, profile_completion_rate=R.choice([70, 80, 90, 100]) if v == 'VERIFIED' else R.choice([40, 50, 60]),
        is_profile_completed=v == 'VERIFIED', brand_name=brand, founded_year=founded,
        mission=f"Mang đến trải nghiệm {cat.split('/')[0].strip().lower()} chất lượng và tạo việc làm ổn định cho người trẻ.",
        core_values='Tận tâm – Trung thực – Học hỏi – Tôn trọng',
        products_services=f"Dịch vụ {cat.lower()} cho khách hàng cá nhân và doanh nghiệp.",
        achievements=R.choice([None, 'Top 10 thương hiệu được yêu thích tại quận năm 2025.', 'Mở rộng lên 5 chi nhánh trong 3 năm.']),
        benefits='Lương trả đúng hạn qua chuyển khoản; thưởng lễ Tết; đổi ca mùa thi.',
        hr_policies='Hợp đồng cộng tác rõ ràng; đánh giá tăng lương mỗi 6 tháng.',
        branches=[{'name': 'Trụ sở chính', 'address': addr, 'phone': u['phone'], 'email': email, 'latitude': lat, 'longitude': lng, 'is_active': True}],
        social_links={'facebook': f"https://facebook.com/{s}"}, public_email=email, public_phone=u['phone'],
        latitude=round(lat + R.uniform(-0.004, 0.004), 6), longitude=round(lng + R.uniform(-0.004, 0.004), 6),
        representative_avatar_url=None,
        internal_culture='Sinh nhật hằng tháng, team building mỗi quý, văn hóa góp ý thẳng thắn.',
        hr_policy_details={'student_support': 'Cho đổi ca trong mùa thi, hỗ trợ gửi xe.', 'training': '1 tuần đào tạo có hướng dẫn viên kèm.',
                           'flexible_schedule': 'Đăng ký ca theo tuần qua nhóm chat, tối thiểu 3 ca/tuần.',
                           'internship': 'Có xác nhận thực tập và phụ cấp cho sinh viên năm cuối.'},
        verification_note={'NEEDS_INFO': 'Giấy phép kinh doanh bị mờ, vui lòng tải lại bản rõ nét.',
                           'REJECTED': 'Mã số thuế không khớp với tên doanh nghiệp trên cổng thông tin thuế.'}.get(v),
        verification_submitted_at=sub, verification_reviewed_at=rev))
    # ── Ảnh & giấy tờ của doanh nghiệp
    uid = u['id']
    ekey = f'emp_{uid:03d}'
    fid = upload(uid, 'AVATAR', 'logo.png', 'image/png', A.logo(ekey, brand, idx), created + timedelta(hours=1))
    p['avatar_url'] = f'/api/files/{fid}'
    pool = A.PHOTOS[cat][:]
    R.shuffle(pool)
    fid = upload(uid, 'COVER', 'cover.jpg', 'image/jpeg', A.photo(pool[0], 'cover'), created + timedelta(hours=1))
    p['cover_url'] = f'/api/files/{fid}'
    p['office_images'] = [f"/api/files/{upload(uid, 'OFFICE_IMAGE', 'office.jpg', 'image/jpeg', A.photo(pid, 'office'), created + timedelta(hours=2))}"
                          for pid in pool[1:4]]
    fid = upload(uid, 'REP_AVATAR', 'representative.jpg', 'image/jpeg', A.avatar(f'rep_{uid:03d}', rep, None, 'reps'), created + timedelta(hours=1))
    p['representative_avatar_url'] = f'/api/files/representative-avatar?v={fid}'
    if v != 'UNVERIFIED':
        lic = f"Giay_chung_nhan_DKDN_{slug(brand).replace(' ', '_')}.pdf"
        upload(uid, 'LEGAL_DOC', lic, 'application/pdf',
               A.legal_pdf(ekey, dict(household=household, tax_code=p['tax_code'], founded=founded, legal_name=legal, brand=brand,
                                      company_type=ctype, address=addr, industry=industry, rep=rep, rep_title=p['representative_title'],
                                      phone=u['phone'])), sub)
        upload(uid, 'LEGAL_DOC', 'Anh_mat_tien_tru_so.jpg', 'image/jpeg', A.photo(pool[0], 'office'), sub)
        p['business_license_file'] = lic
    employers.append(dict(user=u, profile=p, cat=cat, lat=p['latitude'], lng=p['longitude'], addr=addr))
    add('employer_profile_changes', dict(id=nid('employer_profile_changes'), employer_id=u['id'], changed_by=u['id'], section='COMPANY',
                                         changes={'bio': {'from': None, 'to': 'cập nhật giới thiệu'}}, created_at=created + timedelta(hours=2)))
    if sub:
        add('employer_profile_changes', dict(id=nid('employer_profile_changes'), employer_id=u['id'], changed_by=u['id'], section='VERIFICATION',
                                             changes={'verification_status': {'from': 'UNVERIFIED', 'to': 'PENDING'}, 'documents': {'count': 2}}, created_at=sub))
    if rev:
        adm = R.choice(ADMIN_IDS[:2])
        add('employer_profile_changes', dict(id=nid('employer_profile_changes'), employer_id=u['id'], changed_by=adm, section='VERIFICATION_REVIEW',
                                             changes={'verification_status': {'from': 'PENDING', 'to': v}, 'note': p['verification_note']}, created_at=rev))
        add('admin_logs', dict(id=0, admin_id=adm, action='VERIFY_EMPLOYER' if v == 'VERIFIED' else 'UNVERIFY_EMPLOYER', target_type='USER',
                               target_id=u['id'], metadata={'company': display, 'decision': v}, created_at=rev))

# ── Sinh viên
students = []
N_STUDENTS = 130
for i in range(N_STUDENTS):
    gender, name = person()
    uni, code, dom = R.choice(UNIS) if i else UNIS[0]
    major = R.choice(list(MAJORS))
    year = 'Năm 3' if i == 0 else R.choice(['Năm 1', 'Năm 2', 'Năm 2', 'Năm 3', 'Năm 3', 'Năm 4', 'Đã tốt nghiệp'])
    sid = f"{R.choice(['21', '22', '23', '24'])}{code[:2]}{R.randint(100000, 999999)}"
    email = 'student.test@vlu.edu.vn' if i == 0 else f"{slug(name.split()[-1])}.{sid.lower()}@{dom}"
    created = START - timedelta(days=25) if i == 0 else rand_dt(START - timedelta(days=20), NOW - timedelta(days=5))
    status = 'ACTIVE'
    u = mk_user(email, name, 'STUDENT', created, status)
    skills = R.sample(MAJORS[major], k=min(len(MAJORS[major]), R.randint(2, 5)))
    langs = [{'language': 'Tiếng Anh', 'level': R.choice(['Cơ bản', 'Giao tiếp', 'Giao tiếp', 'Thành thạo'])}]
    if R.random() < 0.2:
        langs.append({'language': R.choice(['Tiếng Trung', 'Tiếng Nhật', 'Tiếng Hàn']), 'level': 'Cơ bản'})
    ward, street, _, _ = R.choice(PLACES)
    grad = {'Năm 1': 2030, 'Năm 2': 2029, 'Năm 3': 2028, 'Năm 4': 2027, 'Đã tốt nghiệp': 2026}[year]
    complete = i == 0 or R.random() < 0.8
    sp = add('student_profiles', dict(
        id=nid('student_profiles'), user_id=u['id'], full_name=name, date_of_birth=date(grad - 22, R.randint(1, 12), R.randint(1, 28)),
        school=uni, major=major,
        bio=f"Sinh viên {year.lower()} ngành {major}, {uni.replace('Trường ', '')}. Có thể làm {R.choice(['buổi tối', 'cuối tuần', 'buổi sáng các ngày không có tiết'])}, mong muốn tích lũy kinh nghiệm thực tế.",
        avatar_url=None, created_at=created, updated_at=rand_dt(created, NOW), student_code=sid,
        experience=None, default_cv_url=None, skills=skills, gender=gender, province='TP. Hồ Chí Minh',
        interested_category=MAJOR_TO_PREF[major], desired_position=None, detailed_address=f"{R.randint(5, 300)} {street}",
        languages=langs, desired_salary=R.choice(['25.000 – 30.000đ/giờ', '30.000 – 40.000đ/giờ', '3 – 5 triệu/tháng', 'Thỏa thuận']),
        desired_work_type='FULL_TIME' if year == 'Đã tốt nghiệp' else 'PART_TIME', profile_completion_rate=R.choice([80, 90, 100]) if complete else R.choice([30, 45, 60]),
        is_profile_completed=complete, year_of_study=year, graduation_year=grad,
        gpa=round(R.uniform(6.5, 9.2), 2) if R.random() < 0.85 else None, ward=ward.split(',')[0]))
    for sk in skills:
        add('student_skills', dict(id=nid('student_skills'), student_profile_id=sp['id'], skill_name=sk))
    add('student_educations', dict(id=nid('student_educations'), student_profile_id=sp['id'], institution=uni,
                                   degree=f"Cử nhân {major}", start_date=date(grad - 4, 9, 5), end_date=date(grad, 6, 30)))
    exps = []
    for _ in range(2 if i == 0 else R.choice([0, 1, 1, 2])):
        org, title, desc = R.choice(EXPERIENCE_POOL)
        st = date(R.choice([2024, 2025]), R.randint(1, 10), 1)
        ex = add('student_experiences', dict(id=nid('student_experiences'), student_profile_id=sp['id'], title=title, organization=org,
                                             description=desc, start_date=st, end_date=st + timedelta(days=R.randint(60, 240))))
        exps.append(ex)
    # Lịch rảnh: 1–2 ca chuẩn (trùng giờ với ca của tin để gợi ý khớp lịch)
    slots = set()
    for key in R.sample(['morning', 'afternoon', 'evening', 'weekend'], k=R.choice([1, 2, 2])):
        days, times = SHIFTS[key]
        slots.update((d, a, b) for d in days for a, b in times)
    for d, a, b in sorted(slots):
        add('student_availabilities', dict(id=nid('student_availabilities'), student_id=u['id'], day_of_week=d, start_time=a, end_time=b,
                                           is_active=True, created_at=created, updated_at=created))
    # Ảnh đại diện + CV PDF thật (link có khóa ngẫu nhiên, xem /api/files/cv/:key)
    ukey = f'stu_{u["id"]:03d}'
    av = A.avatar(ukey, name, gender)
    sp['avatar_url'] = f"/api/files/{upload(u['id'], 'AVATAR', 'avatar.jpg', 'image/jpeg', av, created + timedelta(hours=1))}"
    if complete:
        fname = f"CV_{slug(name).title().replace(' ', '_')}.pdf"
        by_day = {}
        for d, a, b in sorted(slots):
            by_day.setdefault(f'{a}–{b}', []).append(DAY_NAME[d])
        cv = A.cv_pdf(ukey, dict(
            name=name, position=f"Ứng tuyển: {sp['interested_category']}", year=year, major=major, school=uni.replace('Trường ', ''),
            phone=u['phone'], email=email, address=f"{sp['detailed_address']}, {ward}, TP. HCM", dob=sp['date_of_birth'].strftime('%d/%m/%Y'),
            gender=gender, skills=skills, languages=langs,
            availability=[f"{', '.join(ds)}: {t}" for t, ds in by_day.items()],
            objective=f"Sinh viên {year.lower()} ngành {major}, mong muốn tìm công việc {'toàn thời gian' if sp['desired_work_type'] == 'FULL_TIME' else 'bán thời gian phù hợp lịch học'} trong lĩnh vực {sp['interested_category'].lower()}, "
                      f"phát huy kỹ năng {', '.join(skills[:2]).lower()} và tích lũy kinh nghiệm thực tế.",
            degree=f"Cử nhân {major}", edu_years=f"{grad - 4} – {grad}", gpa=str(sp['gpa']).replace('.', ',') if sp['gpa'] else None, code=sid,
            experiences=[dict(title=e['title'], organization=e['organization'], description=e['description'],
                              period=f"{e['start_date']:%m/%Y} – {e['end_date']:%m/%Y}") for e in exps],
            activities=R.sample(ACTIVITY_POOL, 3)), f'avatars/{ukey}.jpg')
        fid = upload(u['id'], 'CV', fname, 'application/pdf', cv, created + timedelta(days=1))
        key = f"/api/files/cv/{fid}-{secrets.token_hex(16)}"
        add('student_cvs', dict(id=nid('student_cvs'), student_profile_id=sp['id'], file_key=key, original_name=fname,
                                mime_type='application/pdf', size_bytes=cv[1], is_default=True, created_at=created + timedelta(days=1)))
        sp['default_cv_url'] = key
    students.append(dict(user=u, profile=sp, major=major, pref=MAJOR_TO_PREF[major]))

# ───────────────────────── 3. JOBS ─────────────────────────
jobs = []
PREF_TO_CATS = {
    'Công nghệ thông tin / Phần mềm': ['Công nghệ thông tin'], 'Thiết kế đồ họa / Multimedia': ['Thiết kế / Multimedia', 'Marketing / Truyền thông'],
    'Marketing, Truyền thông & Sự kiện': ['Marketing / Truyền thông', 'Hàng tiêu dùng / FMCG'], 'Bán hàng, Thu ngân & CSKH': ['Bán lẻ', 'Hàng tiêu dùng / FMCG', 'F&B / Dịch vụ ăn uống'],
    'Giao hàng, Vận tải & Logistics': ['Logistics / Giao nhận', 'Bán lẻ'], 'Hành chính, Văn phòng & Nhập liệu': ['Hành chính / Văn phòng', 'Logistics / Giao nhận'],
    'Gia sư, Trợ giảng & Đào tạo': ['Giáo dục / Đào tạo'], 'Dịch vụ & F&B (Nhà hàng, Quán cafe)': ['F&B / Dịch vụ ăn uống', 'Bán lẻ'],
}
posting_emps = [e for e in employers if e['profile']['verification_status'] in ('VERIFIED', 'PENDING', 'UNVERIFIED', 'NEEDS_INFO')]
for e in posting_emps:
    verified = e['profile']['verification_status'] == 'VERIFIED'
    n = 6 if e['user']['email'] == 'employer.test@vlu.edu.vn' else (R.randint(3, 6) if verified else R.randint(1, 2))
    plan = [('PART_TIME', R.choice(JOB_TEMPLATES[e['cat']])) for _ in range(n)]
    # Doanh nghiệp đã xác minh: ~60% có thêm tin Full-time (NTD test luôn có 2 tin)
    ft = FULLTIME_TEMPLATES[e['cat']]
    if e['user']['email'] == 'employer.test@vlu.edu.vn':
        plan += [('FULL_TIME', t) for t in ft]
    elif verified and R.random() < 0.6:
        plan.append(('FULL_TIME', R.choice(ft)))
    for work_type, tpl in plan:
        title, desc, req, ben, skills, (smin, smax), stype, shift = tpl
        created = rand_dt(max(e['user']['created_at'], START), NOW - timedelta(days=1))
        age = (NOW - created).days
        if stype == 'HOURLY':
            salary = R.randrange(smin, smax + 1, 1000)
        else:
            salary = R.randrange(smin, smax + 1, 500000)
        r = R.random()
        mod, status, mreason = 'APPROVED', 'OPEN', None
        if age < 12 and r < 0.45:
            mod = 'PENDING'
        elif r < 0.05:
            mod, status, mreason = 'REJECTED', 'REJECTED', R.choice(['Mức lương thấp hơn lương tối thiểu vùng.', 'Mô tả công việc không rõ ràng, thiếu địa chỉ làm việc.', 'Yêu cầu ứng viên đóng phí giữ chỗ — vi phạm chính sách.'])
        elif age > 75:
            status = R.choice(['COMPLETED', 'COMPLETED', 'CLOSED', 'FILLED'])
        elif age > 40:
            status = R.choice(['OPEN', 'FILLED', 'COMPLETED', 'CLOSED'])
        deadline_d = (created + timedelta(days=R.choice([21, 30, 45]))).date()
        if status == 'OPEN' and deadline_d < NOW.date():
            deadline_d = (NOW + timedelta(days=R.randint(5, 25))).date()
        days, times = SHIFTS[shift]
        job = add('jobs', dict(
            id=nid('jobs'), employer_id=e['user']['id'], title=title,
            description=f"{desc}\n\nĐịa điểm: {e['addr']}.\nThời gian: {SHIFT_TEXT[shift]}.",
            requirements=req, category=e['cat'], location=e['addr'], salary_type=stype, salary=salary, work_type=work_type,
            status=status, moderation_status=mod, created_at=created, updated_at=rand_dt(created, NOW), benefits=ben,
            experience='Dưới 1 năm' if work_type == 'FULL_TIME' else R.choice(['Không yêu cầu kinh nghiệm', 'Không yêu cầu kinh nghiệm', 'Dưới 1 năm']),
            education='Đại học / Cao đẳng', headcount=R.choice([1, 2, 2, 3, 5]), level='Thực tập sinh' if 'Thực tập' in title else 'Nhân viên',
            deadline=deadline_d, work_schedule=SHIFT_TEXT[shift], banner_url=None, work_address=e['addr'],
            latitude=round(e['lat'] + R.uniform(-0.002, 0.002), 7), longitude=round(e['lng'] + R.uniform(-0.002, 0.002), 7),
            application_deadline=datetime.combine(deadline_d, time(23, 59)),
            job_banner_url=A.photo_url(R.choice(A.PHOTOS[e['cat']])), moderation_reason=mreason))
        for d in days:
            for a, b in times:
                add('job_work_schedules', dict(id=nid('job_work_schedules'), job_id=job['id'], day_of_week=d, start_time=a, end_time=b,
                                               min_hours_per_shift=4, is_mandatory=True, created_at=created, updated_at=created))
        for sk in skills:
            add('job_skills', dict(job_id=job['id'], skill_name=sk))
        if work_type == 'PART_TIME':
            add('part_time_details', dict(job_id=job['id'], shift_description=SHIFT_TEXT[shift],
                                          weekly_schedule=', '.join(DAY_NAME[d] for d in days), hours_per_week=len(days) * len(times) * 4))
        if mod != 'PENDING':
            add('admin_logs', dict(id=0, admin_id=R.choice(ADMIN_IDS[:2]), action='APPROVE_JOB' if mod == 'APPROVED' else 'REJECT_JOB', target_type='JOB',
                                   target_id=job['id'], metadata={'title': title, 'moderation_status': mod, **({'reason': mreason} if mreason else {})},
                                   created_at=created + timedelta(hours=R.randint(1, 20))))
            add('notifications', dict(id=0, user_id=e['user']['id'], type='JOB_APPROVED' if mod == 'APPROVED' else 'JOB', title='Tin tuyển dụng đã được duyệt' if mod == 'APPROVED' else 'Tin tuyển dụng bị từ chối',
                                      body=f'Tin "{title}" {"đã hiển thị công khai" if mod == "APPROVED" else "bị từ chối: " + mreason}.', target_type='JOB', target_id=job['id'],
                                      read_at=created + timedelta(days=1), created_at=created + timedelta(hours=R.randint(1, 20))))
        jobs.append(dict(job=job, emp=e, shift=shift))


def notify(uid, ntype, title, body, ttype, tid, at):
    at = min(at, NOW - timedelta(minutes=5))
    add('notifications', dict(id=0, user_id=uid, type=ntype, title=title, body=body, target_type=ttype, target_id=tid,
                              read_at=(at + timedelta(hours=R.randint(1, 48))) if (NOW - at).days > 3 or R.random() < 0.3 else None, created_at=at))


# ───────────────────────── 4. APPLICATIONS → ASSIGNMENTS ─────────────────────────
open_jobs = [j for j in jobs if j['job']['moderation_status'] == 'APPROVED']
assignments = []
for s in students:
    pref_cats = PREF_TO_CATS[s['pref']]
    senior = s['profile']['year_of_study'] in ('Năm 4', 'Đã tốt nghiệp')
    eligible = [j for j in open_jobs if senior or j['job']['work_type'] == 'PART_TIME']
    pool = [j for j in eligible if j['job']['category'] in pref_cats and j['job']['created_at'] < NOW - timedelta(hours=6)]
    if s['profile']['desired_work_type'] == 'FULL_TIME':  # SV đã tốt nghiệp ưu tiên tin Full-time
        pool = [j for j in pool if j['job']['work_type'] == 'FULL_TIME'] + [j for j in pool if j['job']['work_type'] == 'PART_TIME'][:2]
    others = [j for j in eligible if j not in pool]
    k = R.randint(1, 6)
    picks = R.sample(pool, k=min(len(pool), k)) + R.sample(others, k=R.randint(0, 2))
    forced = None
    if s['user']['email'] == 'student.test@vlu.edu.vn':
        test_pool = [j for j in open_jobs if j['job']['work_type'] == 'PART_TIME' and j['job']['created_at'] < NOW - timedelta(days=3)]
        picks = R.sample([j for j in test_pool if j['job']['status'] in ('COMPLETED', 'CLOSED', 'FILLED')], 4) + \
            R.sample([j for j in test_pool if j['job']['status'] == 'OPEN'], 6)
        forced = ['ACCEPTED', 'ACCEPTED', 'ACCEPTED', 'REJECTED', 'ACCEPTED', 'PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN']
    for pick_no, j in enumerate(picks):
        job = j['job']
        lo = max(job['created_at'], s['user']['created_at'])
        hi = min(job['application_deadline'], NOW - timedelta(hours=2), lo + timedelta(days=20))
        if hi <= lo:
            continue
        applied = rand_dt(lo, hi)
        done_job = job['status'] in ('COMPLETED', 'CLOSED', 'FILLED')
        r = R.random()
        if done_job:
            st = 'ACCEPTED' if r < 0.40 else 'REJECTED' if r < 0.88 else 'WITHDRAWN'
        else:
            st = ('PENDING' if r < 0.30 else 'REVIEWING' if r < 0.45 else 'SHORTLISTED' if r < 0.58 else
                  'ACCEPTED' if r < 0.75 else 'REJECTED' if r < 0.92 else 'WITHDRAWN')
        if forced:
            st = forced[pick_no]
        sp = s['profile']
        app = add('applications', dict(
            id=nid('applications'), job_id=job['id'], student_id=s['user']['id'],
            cover_letter=f"Kính gửi {j['emp']['profile']['display_name']}, em là {sp['full_name']}, sinh viên {sp['year_of_study'].lower()} ngành {sp['major']}. "
                         f"Em mong muốn ứng tuyển vị trí {job['title']} vì lịch làm ({job['work_schedule'].lower()}) phù hợp với thời khóa biểu của em. "
                         f"Em có kỹ năng {', '.join(sp['skills'][:2])} và sẵn sàng học hỏi thêm. Em xin cảm ơn!",
            cv_url=sp['default_cv_url'], status=st, applied_at=applied, updated_at=applied, rejection_reason=None, decided_at=None, decided_by=None,
            profile_snapshot={'full_name': sp['full_name'], 'school': sp['school'], 'major': sp['major'], 'year_of_study': sp['year_of_study'],
                              'skills': sp['skills'], 'gpa': float(sp['gpa']) if sp['gpa'] else None},
            withdrawn_at=None, withdraw_reason=None))
        emp_id = job['employer_id']
        notify(emp_id, 'NEW_APPLICATION', 'Ứng viên mới nộp hồ sơ', f'{sp["full_name"]} vừa ứng tuyển vị trí "{job["title"]}".', 'APPLICATION', app['id'], applied)
        add('application_histories', dict(id=nid('application_histories'), application_id=app['id'], from_status=None, to_status='PENDING',
                                          changed_by=s['user']['id'], note='Sinh viên nộp hồ sơ', created_at=applied))
        t = applied
        chain = {'PENDING': [], 'REVIEWING': ['REVIEWING'], 'SHORTLISTED': ['REVIEWING', 'SHORTLISTED'], 'ACCEPTED': ['REVIEWING', 'SHORTLISTED', 'ACCEPTED'],
                 'REJECTED': ['REVIEWING', 'REJECTED'], 'WITHDRAWN': ['WITHDRAWN']}[st]
        prev = 'PENDING'
        for nxt in chain:
            t = rand_dt(t + timedelta(hours=2), min(t + timedelta(days=3), NOW - timedelta(hours=1)))
            by = s['user']['id'] if nxt == 'WITHDRAWN' else emp_id
            note = {'REVIEWING': 'Nhà tuyển dụng đang xem hồ sơ', 'SHORTLISTED': 'Hồ sơ vào danh sách phỏng vấn',
                    'ACCEPTED': 'Chúc mừng! Hồ sơ được chấp nhận, vui lòng đến nhận ca theo lịch.',
                    'REJECTED': R.choice(['Lịch rảnh chưa khớp ca làm việc của cửa hàng.', 'Đã đủ số lượng ứng viên cho vị trí này.', 'Hồ sơ chưa đáp ứng yêu cầu kỹ năng.']),
                    'WITHDRAWN': R.choice(['Em đã nhận được công việc khác phù hợp hơn.', 'Lịch học kỳ mới thay đổi, không thể đi làm.', 'Khoảng cách đi lại quá xa.'])}[nxt]
            add('application_histories', dict(id=nid('application_histories'), application_id=app['id'], from_status=prev, to_status=nxt, changed_by=by, note=note, created_at=t))
            prev = nxt
        app['updated_at'] = t
        if st in ('ACCEPTED', 'REJECTED'):
            app['decided_at'], app['decided_by'] = t, emp_id
            if st == 'REJECTED':
                app['rejection_reason'] = note
            notify(s['user']['id'], 'APPLICATION_ACCEPTED' if st == 'ACCEPTED' else 'APPLICATION_REJECTED',
                   'Hồ sơ được chấp nhận' if st == 'ACCEPTED' else 'Hồ sơ chưa phù hợp', f'Vị trí "{job["title"]}": {note}', 'APPLICATION', app['id'], t)
        elif st == 'WITHDRAWN':
            app['withdrawn_at'], app['withdraw_reason'] = t, note
            notify(emp_id, 'APPLICATION_WITHDRAWN', 'Ứng viên rút hồ sơ', f'{sp["full_name"]} đã rút hồ sơ vị trí "{job["title"]}".', 'APPLICATION', app['id'], t)
        elif st in ('REVIEWING', 'SHORTLISTED'):
            notify(s['user']['id'], 'APPLICATION_STATUS', 'Cập nhật trạng thái hồ sơ', f'Hồ sơ vị trí "{job["title"]}": {note}.', 'APPLICATION', app['id'], t)

        if st == 'ACCEPTED':
            start_at = t + timedelta(days=R.randint(1, 4))
            if start_at > NOW:
                ast = 'NOT_STARTED'
            elif job['status'] in ('COMPLETED', 'CLOSED'):
                ast = R.choices(['COMPLETED', 'TERMINATED', 'RESIGNED'], [85, 7, 8])[0]
            else:
                ast = R.choices(['IN_PROGRESS', 'COMPLETED', 'RESIGNED'], [75, 20, 5])[0]
            end_at = None
            if ast in ('COMPLETED', 'TERMINATED', 'RESIGNED'):
                end_at = rand_dt(start_at + timedelta(days=14), min(start_at + timedelta(days=60), NOW - timedelta(hours=3)))
                if end_at <= start_at:
                    end_at = start_at + timedelta(days=1)
            wa = add('work_assignments', dict(
                id=nid('work_assignments'), job_id=job['id'], student_id=s['user']['id'], application_id=app['id'], status=ast,
                created_at=t, updated_at=end_at or (start_at if ast != 'NOT_STARTED' else t), proposal_id=None,
                started_at=start_at if ast != 'NOT_STARTED' else None, completed_at=end_at if ast == 'COMPLETED' else None,
                termination_reason={'TERMINATED': 'Vắng ca không báo trước nhiều lần.', 'RESIGNED': 'Sinh viên xin nghỉ do trùng lịch thi cuối kỳ.'}.get(ast),
                terminated_at=end_at if ast in ('TERMINATED', 'RESIGNED') else None))
            assignments.append(dict(wa=wa, job=job, stu=s, emp=j['emp']))
            if ast != 'NOT_STARTED':
                notify(s['user']['id'], 'ASSIGNMENT_IN_PROGRESS', 'Bắt đầu công việc', f'Bạn đã bắt đầu làm "{job["title"]}". Chúc bạn làm tốt!', 'ASSIGNMENT', wa['id'], start_at)
                for pct, txt in [(25, 'Đã hoàn thành tuần đào tạo, nắm quy trình làm việc.'), (50, 'Làm ca ổn định, được quản lý ca đánh giá tốt.'),
                                 (75, 'Tự đảm nhận ca một mình, hỗ trợ đào tạo bạn mới.'), (100, 'Hoàn thành công việc, đã nhận đủ lương.')]:
                    at = start_at + timedelta(days=pct // 25 * 7)
                    if ast == 'COMPLETED' or (at < NOW and pct < 100 and (end_at is None or at < end_at)):
                        if ast == 'COMPLETED' and pct == 100:
                            at = end_at
                        add('work_progress', dict(id=nid('work_progress'), assignment_id=wa['id'], updated_by=s['user']['id'], progress_percent=pct,
                                                  description=txt, created_at=min(at, NOW), started_at=start_at))
            if ast == 'COMPLETED':
                notify(s['user']['id'], 'ASSIGNMENT_COMPLETED', 'Công việc đã hoàn thành', f'"{job["title"]}" đã hoàn thành. Hãy để lại đánh giá cho nhà tuyển dụng nhé!', 'ASSIGNMENT', wa['id'], end_at)

# ───────────────────────── 5. ĐÁNH GIÁ ─────────────────────────
GOOD = ['Quản lý ca hướng dẫn rất kỹ, lương trả đúng ngày như cam kết. Đồng nghiệp thân thiện, sẵn sàng đổi ca khi mình có lịch thi.',
        'Công việc đúng như mô tả trong tin tuyển dụng. Giờ cao điểm hơi đông nhưng có phân công rõ ràng.',
        'Môi trường trẻ, học được nhiều kỹ năng giao tiếp và xử lý tình huống với khách.',
        'Được mentor review công việc hằng tuần, học được cách làm việc chuyên nghiệp.']
MID = ['Lương ổn nhưng ca tối kết thúc khá muộn, đi về hơi xa. Quản lý dễ chịu.',
       'Công việc hơi nhiều so với số người trong ca, nhưng được trả lương đúng hạn.']
BAD = ['Lịch ca hay bị đổi sát giờ, thông báo qua nhóm chat không kịp. Lương có lần trả trễ một tuần.']

reviewed_company = set()
for a in assignments:
    wa, job, s, e = a['wa'], a['job'], a['stu'], a['emp']
    sid, eid = s['user']['id'], e['user']['id']
    if wa['status'] not in ('COMPLETED', 'IN_PROGRESS', 'TERMINATED', 'RESIGNED'):
        continue
    end = wa['completed_at'] or wa['terminated_at'] or NOW - timedelta(hours=1)
    # Đánh giá 2 chiều (bảng reviews) khi đã kết thúc
    if wa['status'] == 'COMPLETED' and R.random() < 0.85:
        rate_s = R.choices([5, 4, 3], [55, 35, 10])[0]
        at = rand_dt(end, min(end + timedelta(days=5), NOW))
        add('reviews', dict(id=nid('reviews'), job_id=job['id'], reviewer_id=eid, reviewee_id=sid, rating=rate_s,
                            comment={5: 'Chăm chỉ, đúng giờ, chủ động học hỏi. Rất sẵn lòng hợp tác lại.', 4: 'Hoàn thành tốt công việc, cần tự tin hơn khi giao tiếp với khách.',
                                     3: 'Hoàn thành công việc ở mức đạt, đôi lúc còn đến trễ.'}[rate_s], created_at=at))
        notify(sid, 'REVIEW_RECEIVED', 'Bạn nhận được đánh giá mới', f'{e["profile"]["display_name"]} đã đánh giá bạn {rate_s} sao.', 'JOB', job['id'], at)
        if R.random() < 0.8:
            rate_e = R.choices([5, 4, 3, 2], [45, 35, 15, 5])[0]
            add('reviews', dict(id=nid('reviews'), job_id=job['id'], reviewer_id=sid, reviewee_id=eid, rating=rate_e,
                                comment=R.choice(GOOD if rate_e >= 4 else MID if rate_e == 3 else BAD), created_at=at + timedelta(hours=3)))
    # Đánh giá công việc (job_reviews)
    if R.random() < 0.55:
        ov = R.choices([5, 4, 3, 2], [40, 38, 15, 7])[0]
        sub_r = lambda: max(1, min(5, ov + R.choice([-1, 0, 0, 1])))
        at = rand_dt(min(end, NOW - timedelta(days=1)), NOW - timedelta(hours=1))
        st = R.choices(['PUBLISHED', 'PENDING', 'HIDDEN'], [85, 10, 5])[0]
        jr = add('job_reviews', dict(
            id=nid('job_reviews'), job_id=job['id'], employer_id=eid, reviewer_id=sid, assignment_id=wa['id'],
            experience_type='INTERNED' if 'Thực tập' in job['title'] else 'WORKED',
            rating_description_accuracy=sub_r(), rating_salary_accuracy=sub_r(), rating_schedule=sub_r(), rating_workload=sub_r(),
            rating_manager_support=sub_r(), rating_overall=ov, content=R.choice(GOOD if ov >= 4 else MID if ov == 3 else BAD),
            is_anonymous=R.random() < 0.7, is_verified=True, verification_source='WORK_ASSIGNMENT', status=st, moderation_flags=[],
            moderation_reason='Nội dung chứa thông tin cá nhân của quản lý.' if st == 'HIDDEN' else None, edit_count=0,
            published_at=at if st != 'PENDING' else None, created_at=at, updated_at=at))
        add('review_moderation_logs', dict(id=nid('review_moderation_logs'), company_review_id=None, job_review_id=jr['id'], actor_id=sid, actor_role='STUDENT',
                                           action='CREATED', from_status=None, to_status=st if st != 'HIDDEN' else 'PUBLISHED', reason=None, report_id=None, created_at=at))
        a['job_review'] = jr
    # Đánh giá công ty (company_reviews) — 1 lần / (công ty, sinh viên)
    if (eid, sid) not in reviewed_company and R.random() < 0.45:
        reviewed_company.add((eid, sid))
        ov = R.choices([5, 4, 3, 2], [35, 40, 18, 7])[0]
        sub_r = lambda: max(1, min(5, ov + R.choice([-1, 0, 0, 1])))
        at = rand_dt(min(end, NOW - timedelta(days=1)), NOW - timedelta(hours=1))
        cr = add('company_reviews', dict(
            id=nid('company_reviews'), employer_id=eid, reviewer_id=sid, experience_type='INTERNED' if 'Thực tập' in job['title'] else 'WORKED',
            rating_environment=sub_r(), rating_salary_benefits=sub_r(), rating_management=sub_r(), rating_culture=sub_r(),
            rating_learning=sub_r(), rating_recruitment=sub_r(), rating_overall=ov,
            title=R.choice(['Nơi làm thêm lý tưởng cho sinh viên', 'Môi trường thân thiện, học hỏi nhiều', 'Ổn để tích lũy kinh nghiệm', 'Cần cải thiện khâu xếp ca'])
            if ov >= 3 else 'Quản lý ca chưa chuyên nghiệp',
            pros=R.choice(['Xếp ca linh hoạt theo lịch học, lương đúng hạn.', 'Đồng nghiệp vui vẻ, được đào tạo bài bản.', 'Gần trường, có chỗ gửi xe miễn phí.']),
            cons=R.choice(['Giờ cao điểm khá áp lực.', 'Phụ cấp chưa nhiều.', 'Đôi khi đổi ca sát giờ.']),
            advice=R.choice([None, 'Nên có nhóm chat thông báo ca sớm hơn.', 'Tăng phụ cấp cho ca tối muộn.']),
            is_anonymous=R.random() < 0.75, is_verified=True, verification_source='WORK_ASSIGNMENT',
            status='PUBLISHED', moderation_flags=[], moderation_reason=None, edit_count=0, published_at=at, created_at=at, updated_at=at))
        add('review_moderation_logs', dict(id=nid('review_moderation_logs'), company_review_id=cr['id'], job_review_id=None, actor_id=sid, actor_role='STUDENT',
                                           action='CREATED', from_status=None, to_status='PUBLISHED', reason=None, report_id=None, created_at=at))
        a['company_review'] = cr

# Đánh giá công ty từ ứng viên đã phỏng vấn/ứng tuyển (không làm việc)
for app in R.sample([x for x in T['applications'] if x['status'] in ('REJECTED', 'SHORTLISTED')], 25):
    job = next(j['job'] for j in jobs if j['job']['id'] == app['job_id'])
    key = (job['employer_id'], app['student_id'])
    if key in reviewed_company:
        continue
    reviewed_company.add(key)
    ov = R.choice([3, 4, 4, 5])
    at = rand_dt(app['updated_at'], NOW - timedelta(hours=1))
    cr = add('company_reviews', dict(
        id=nid('company_reviews'), employer_id=job['employer_id'], reviewer_id=app['student_id'],
        experience_type='INTERVIEWED' if app['status'] == 'SHORTLISTED' else 'APPLIED',
        rating_environment=ov, rating_salary_benefits=ov, rating_management=ov, rating_culture=ov, rating_learning=ov,
        rating_recruitment=max(1, ov - R.choice([0, 1])), rating_overall=ov,
        title='Quy trình tuyển dụng nhanh, phản hồi rõ ràng' if ov >= 4 else 'Phản hồi hồ sơ hơi chậm',
        pros='Nhà tuyển dụng trả lời trong vòng 2-3 ngày, có lý do khi từ chối.', cons='Chưa ghi rõ số ca tối thiểu trong tin đăng.',
        advice=None, is_anonymous=True, is_verified=True, verification_source='APPLICATION', status=R.choice(['PUBLISHED', 'PUBLISHED', 'PENDING']),
        moderation_flags=[], moderation_reason=None, edit_count=0, published_at=None, created_at=at, updated_at=at))
    if cr['status'] == 'PUBLISHED':
        cr['published_at'] = at
    add('review_moderation_logs', dict(id=nid('review_moderation_logs'), company_review_id=cr['id'], job_review_id=None, actor_id=app['student_id'],
                                       actor_role='STUDENT', action='CREATED', from_status=None, to_status=cr['status'], reason=None, report_id=None, created_at=at))

# Phản hồi của doanh nghiệp + báo cáo đánh giá
REPLIES = ['Cảm ơn bạn đã dành thời gian chia sẻ! Chúng tôi rất vui khi được đồng hành cùng bạn và mong gặp lại bạn ở các ca sau.',
           'Cảm ơn góp ý của bạn. Quán đã lập nhóm chat thông báo lịch ca trước 48 giờ để khắc phục vấn đề này.',
           'Rất tiếc vì trải nghiệm chưa trọn vẹn. Bộ phận nhân sự sẽ liên hệ để lắng nghe thêm ý kiến của bạn.']
for cr in [c for c in T['company_reviews'] if c['status'] == 'PUBLISHED'] + [j for j in T['job_reviews'] if j['status'] == 'PUBLISHED']:
    if R.random() < 0.4:
        is_c = 'title' in cr
        at = rand_dt(cr['created_at'], min(cr['created_at'] + timedelta(days=4), NOW))
        add('review_replies', dict(id=nid('review_replies'), company_review_id=cr['id'] if is_c else None, job_review_id=None if is_c else cr['id'],
                                   employer_id=cr['employer_id'], content=R.choice(REPLIES[:2] if cr['rating_overall'] >= 4 else REPLIES[1:]),
                                   status='VISIBLE', created_at=at, updated_at=at))
low = [c for c in T['company_reviews'] + T['job_reviews'] if c['rating_overall'] <= 3]
for i, rv in enumerate(R.sample(low, min(8, len(low)))):
    is_c = 'title' in rv
    st = ['PENDING', 'PENDING', 'PENDING', 'RESOLVED', 'DISMISSED', 'DISMISSED', 'RESOLVED', 'PENDING'][i]
    at = rand_dt(rv['created_at'], NOW - timedelta(hours=2))
    reason = R.choice(['FALSE_INFO', 'OFFENSIVE', 'CONFLICT_OF_INTEREST', 'PERSONAL_INFO'])
    adm = R.choice(ADMIN_IDS)
    rr = add('review_reports', dict(id=nid('review_reports'), company_review_id=rv['id'] if is_c else None, job_review_id=None if is_c else rv['id'],
                                    reporter_id=rv['employer_id'], kind='REPORT', reason=reason,
                                    description={'FALSE_INFO': 'Đánh giá nêu lương trả trễ nhưng hệ thống chi trả của công ty luôn đúng hạn.',
                                                 'OFFENSIVE': 'Ngôn từ xúc phạm quản lý cửa hàng.', 'CONFLICT_OF_INTEREST': 'Nghi ngờ người viết là nhân viên đối thủ.',
                                                 'PERSONAL_INFO': 'Đánh giá nêu tên đầy đủ của quản lý ca.'}[reason],
                                    status=st, resolution_note={'RESOLVED': 'Đã ẩn đánh giá do vi phạm quy định nội dung.', 'DISMISSED': 'Đánh giá phản ánh trải nghiệm thật, không vi phạm.'}.get(st),
                                    resolved_by=adm if st != 'PENDING' else None, resolved_at=at + timedelta(days=1) if st != 'PENDING' else None, created_at=at))
    key = 'company_review_id' if is_c else 'job_review_id'
    other = 'job_review_id' if is_c else 'company_review_id'
    add('review_moderation_logs', dict(id=nid('review_moderation_logs'), **{key: rv['id'], other: None}, actor_id=rv['employer_id'], actor_role='EMPLOYER',
                                       action='REPORTED', from_status=rv['status'], to_status=rv['status'], reason=reason, report_id=rr['id'], created_at=at))
    if st != 'PENDING':
        to = 'HIDDEN' if st == 'RESOLVED' else rv['status']
        add('review_moderation_logs', dict(id=nid('review_moderation_logs'), **{key: rv['id'], other: None}, actor_id=adm, actor_role='ADMIN',
                                           action='HIDE' if st == 'RESOLVED' else 'DISMISS', from_status=rv['status'], to_status=to,
                                           reason=rr['resolution_note'], report_id=rr['id'], created_at=rr['resolved_at']))
        if st == 'RESOLVED':
            rv['status'], rv['moderation_reason'] = 'HIDDEN', rr['resolution_note']

# ───────────────────────── 6. LƯU VIỆC, LƯỢT XEM ─────────────────────────
public_jobs = [j['job'] for j in jobs if j['job']['moderation_status'] == 'APPROVED']
for s in students:
    for job in R.sample(public_jobs, R.randint(0, 5)):
        lo = max(job['created_at'], s['user']['created_at'])
        if lo < NOW:
            add('job_saved', dict(id=nid('job_saved'), user_id=s['user']['id'], job_id=job['id'], created_at=rand_dt(lo, NOW)))
for job in public_jobs:
    for _ in range(R.randint(8, 60)):
        viewer = R.choice(students)['user'] if R.random() < 0.7 else None
        at = rand_dt(job['created_at'], NOW)
        add('job_views', dict(id=nid('job_views'), job_id=job['id'], viewer_id=viewer['id'] if viewer and viewer['created_at'] < at else None, viewed_at=at))
for app in T['applications']:  # người ứng tuyển chắc chắn đã xem tin
    add('job_views', dict(id=nid('job_views'), job_id=app['job_id'], viewer_id=app['student_id'], viewed_at=app['applied_at'] - timedelta(minutes=R.randint(3, 90))))

# ───────────────────────── 7. VI PHẠM, KHÓA TK, KHIẾU NẠI ─────────────────────────
VIOL = [('LATE', 'Đi trễ', 'LOW'), ('NO_SHOW', 'Bỏ ca làm', 'MEDIUM'), ('ABANDON', 'Bỏ dở công việc', 'HIGH'),
        ('FAKE_INFO', 'Khai sai thông tin hồ sơ', 'HIGH'), ('SPAM', 'Spam ứng tuyển hàng loạt', 'MEDIUM')]
bad_assign = [a for a in assignments if a['wa']['status'] in ('TERMINATED', 'RESIGNED')]
viol_targets = [(a['stu']['user'], a['wa']['terminated_at']) for a in bad_assign]
viol_targets += [(s['user'], rand_dt(s['user']['created_at'], NOW - timedelta(days=2))) for s in R.sample(students[1:], 6)]
for i, (u, base) in enumerate(viol_targets):
    code, vtype, sev = VIOL[i % len(VIOL)] if i >= len(bad_assign) else (('NO_SHOW', 'Bỏ ca làm', 'MEDIUM') if i % 2 else ('ABANDON', 'Bỏ dở công việc', 'HIGH'))
    base = base or NOW - timedelta(days=3)
    tiers = 3 if i in (0, 2, 4, 6) else 2 if i % 3 == 0 else 1
    for tier in range(1, tiers + 1):
        at = min(base + timedelta(days=(tier - 1) * 6), NOW - timedelta(hours=5))
        adm = R.choice(ADMIN_IDS)
        v = add('user_violations', dict(id=nid('user_violations'), user_id=u['id'], violation_code=code, violation_type=vtype, severity=sev, tier=tier,
                                        reason=f"Cảnh cáo lần {tier}: {vtype.lower()}" + (' — tái phạm' if tier > 1 else ''),
                                        evidence='Báo cáo từ nhà tuyển dụng kèm bảng chấm công.' if code in ('NO_SHOW', 'ABANDON', 'LATE') else None,
                                        handled_by=adm, status='ACTIVE', created_at=at))
        u['violation_count'] += 1
        add('admin_logs', dict(id=0, admin_id=adm, action='RECORD_VIOLATION', target_type='USER', target_id=u['id'],
                               metadata={'code': code, 'tier': tier, 'severity': sev}, created_at=at))
        notify(u['id'], 'VIOLATION_NOTICE', 'Thông báo vi phạm', f'Tài khoản của bạn bị ghi nhận vi phạm "{vtype}" (lần {tier}).', 'USER', u['id'], at)
    if tiers == 3:
        u['status'], u['suspension_reason'], u['suspended_at'] = 'BANNED', f'Vi phạm "{vtype}" 3 lần', at
        add('admin_logs', dict(id=0, admin_id=adm, action='BAN_USER', target_type='USER', target_id=u['id'], metadata={'reason': u['suspension_reason']}, created_at=at))
        ap_at = at + timedelta(hours=10)
        if ap_at < NOW:
            approved = i == 4
            ap = add('user_appeals', dict(id=nid('user_appeals'), user_id=u['id'], violation_id=v['id'],
                                          appeal_reason='Em bị ốm đột xuất nên không thể đến ca, em có giấy khám bệnh của trạm y tế trường. Mong ban quản trị xem xét mở lại tài khoản.',
                                          evidence_url='https://storage.jobnest.vn/evidence/giay_kham_benh.pdf',
                                          status='APPROVED' if approved else 'PENDING',
                                          admin_response='Minh chứng hợp lệ, tài khoản đã được mở lại. Vui lòng báo nghỉ trước khi vắng ca.' if approved else None,
                                          resolved_by=ADMIN_IDS[0] if approved else None, created_at=ap_at, resolved_at=min(ap_at + timedelta(days=1), NOW - timedelta(hours=1)) if approved else None))
            if approved:
                u['status'], u['suspension_reason'], u['suspended_at'] = 'ACTIVE', None, None
                v['status'] = 'APPEALED'
                add('admin_logs', dict(id=0, admin_id=ADMIN_IDS[0], action='UNBAN_USER', target_type='USER', target_id=u['id'], metadata={'appeal_id': ap['id']}, created_at=ap['resolved_at']))
                notify(u['id'], 'APPEAL_APPROVED', 'Khiếu nại được chấp thuận', ap['admin_response'], 'USER', u['id'], ap['resolved_at'])
# Một vài tài khoản chưa kích hoạt
for s in R.sample(students[1:], 3):
    if s['user']['status'] == 'ACTIVE' and not s['user']['violation_count']:
        s['user']['status'] = 'PENDING'

# ───────────────────────── 8. BÁO CÁO VI PHẠM (reports) ─────────────────────────
REPORT_REASONS = [('JOB', 'Lương thực tế thấp hơn tin đăng', 'Khi đến phỏng vấn, quản lý báo lương chỉ 20.000đ/giờ thay vì như tin đăng.'),
                  ('JOB', 'Yêu cầu đóng phí', 'Nhà tuyển dụng yêu cầu nộp 200.000đ tiền đồng phục trước khi nhận việc.'),
                  ('JOB', 'Tin tuyển dụng trùng lặp', 'Tin được đăng lại nhiều lần với cùng nội dung.'),
                  ('USER', 'Ứng viên bỏ ca không báo', 'Ứng viên nhận ca nhưng không đến và không liên lạc được.'),
                  ('USER', 'Thông tin hồ sơ không trung thực', 'Ứng viên khai đã có kinh nghiệm pha chế nhưng thực tế chưa từng làm.')]
for i in range(14):
    ttype, reason, desc = REPORT_REASONS[i % len(REPORT_REASONS)]
    if ttype == 'JOB':
        job = R.choice(public_jobs)
        reporter, tid = R.choice(students)['user']['id'], job['id']
        lo = job['created_at']
    else:
        a = R.choice(assignments)
        reporter, tid = a['emp']['user']['id'], a['stu']['user']['id']
        lo = a['wa']['created_at']
    at = rand_dt(lo, NOW - timedelta(hours=3))
    st = 'OPEN' if i % 3 == 0 else 'RESOLVED'
    rp = add('reports', dict(id=nid('reports'), reporter_id=reporter, target_type=ttype, target_id=tid, reason=reason, description=desc, status=st, created_at=at))
    if st == 'RESOLVED':
        adm = R.choice(ADMIN_IDS)
        add('report_actions', dict(id=nid('report_actions'), report_id=rp['id'], admin_id=adm,
                                   action=R.choice(['WARN_USER', 'CLOSE_JOB', 'NO_VIOLATION']) if ttype == 'JOB' else R.choice(['WARN_USER', 'NO_VIOLATION']),
                                   note='Đã xác minh với hai bên và xử lý theo quy định nền tảng.', created_at=at + timedelta(days=1)))

# Admin quản lý danh mục
for c in T['categories'][-3:]:
    add('admin_logs', dict(id=0, admin_id=ADMIN_IDS[0], action='CREATE_CATEGORY', target_type='CATEGORY', target_id=c['id'], metadata={'name': c['name']}, created_at=c['created_at']))

# Nhắc hạn ứng tuyển + thông báo hệ thống
for s in students:
    if R.random() < 0.25:
        notify(s['user']['id'], 'SYSTEM', 'Hoàn thiện hồ sơ để tăng cơ hội', 'Hồ sơ đầy đủ (kỹ năng, lịch rảnh, CV) giúp nhà tuyển dụng chọn bạn nhanh hơn.', None, None,
               s['user']['created_at'] + timedelta(days=1))
for job in [j for j in public_jobs if j['status'] == 'OPEN']:
    saved = [x for x in T['job_saved'] if x['job_id'] == job['id']]
    for x in saved[:2]:
        at = job['application_deadline'] - timedelta(days=2)
        if at < NOW:
            notify(x['user_id'], 'REMINDER_DEADLINE', 'Sắp hết hạn ứng tuyển', f'Tin "{job["title"]}" bạn đã lưu sẽ hết hạn sau 2 ngày.', 'JOB', job['id'], at)

# Token đặt lại mật khẩu / xác thực (mẫu)
import hashlib
for u in R.sample(T['users'], 8):
    at = rand_dt(u['created_at'], NOW - timedelta(hours=1))
    add('password_reset_tokens', dict(id=nid('password_reset_tokens'), user_id=u['id'], token_hash=hashlib.sha256(f"reset-{u['id']}-{at}".encode()).hexdigest(),
                                      expires_at=at + timedelta(minutes=15), used_at=at + timedelta(minutes=R.randint(2, 10)) if R.random() < 0.7 else None, created_at=at))
for e in employers:
    at = e['user']['created_at']
    add('verification_tokens', dict(id=nid('verification_tokens'), user_id=e['user']['id'], channel='EMAIL',
                                    token_hash=hashlib.sha256(f"verify-{e['user']['id']}".encode()).hexdigest(),
                                    expires_at=at + timedelta(hours=24), used_at=at + timedelta(minutes=5), attempt_count=1, created_at=at))

# Đánh số id cho bảng sinh id=0 (sắp theo thời gian)
for tb in ('notifications', 'admin_logs'):
    T[tb].sort(key=lambda r: r['created_at'])
    for i, r in enumerate(T[tb], 1):
        r['id'] = i

# ───────────────────────── GHI EXCEL ─────────────────────────
ORDER = ['categories', 'users', 'file_uploads', 'employer_profiles', 'employer_profile_changes', 'student_profiles', 'student_skills', 'student_educations',
         'student_experiences', 'student_cvs', 'student_availabilities', 'jobs', 'job_work_schedules', 'job_skills', 'part_time_details',
         'job_saved', 'job_views', 'applications', 'application_histories', 'work_assignments', 'work_progress', 'reviews',
         'company_reviews', 'job_reviews', 'review_replies', 'review_reports', 'review_moderation_logs', 'notifications', 'reports',
         'report_actions', 'user_violations', 'user_appeals', 'admin_logs', 'password_reset_tokens', 'verification_tokens']
DESC = {
    'categories': 'Danh mục ngành nghề', 'file_uploads': 'File (logo, ảnh bìa, ảnh văn phòng, ảnh đại diện, CV, giấy tờ) — cột data trỏ tới data_v3_files/', 'users': 'Tài khoản (Admin / Nhà tuyển dụng / Sinh viên)', 'employer_profiles': 'Hồ sơ doanh nghiệp + xác minh pháp lý',
    'employer_profile_changes': 'Lịch sử thay đổi hồ sơ doanh nghiệp', 'student_profiles': 'Hồ sơ sinh viên', 'student_skills': 'Kỹ năng sinh viên',
    'student_educations': 'Học vấn', 'student_experiences': 'Kinh nghiệm', 'student_cvs': 'CV đã tải lên (metadata)',
    'student_availabilities': 'Lịch rảnh của sinh viên', 'jobs': 'Tin tuyển dụng', 'job_work_schedules': 'Ca làm việc của tin',
    'job_skills': 'Kỹ năng yêu cầu', 'part_time_details': 'Chi tiết part-time', 'job_saved': 'Tin đã lưu', 'job_views': 'Lượt xem tin',
    'applications': 'Hồ sơ ứng tuyển', 'application_histories': 'Lịch sử trạng thái ứng tuyển', 'work_assignments': 'Phân công công việc',
    'work_progress': 'Tiến độ công việc', 'reviews': 'Đánh giá 2 chiều (NTD ↔ SV)', 'company_reviews': 'Đánh giá doanh nghiệp',
    'job_reviews': 'Đánh giá công việc', 'review_replies': 'Phản hồi đánh giá của doanh nghiệp', 'review_reports': 'Báo cáo đánh giá',
    'review_moderation_logs': 'Nhật ký kiểm duyệt đánh giá', 'notifications': 'Thông báo', 'reports': 'Báo cáo vi phạm (tin/người dùng)',
    'report_actions': 'Xử lý báo cáo', 'user_violations': 'Vi phạm người dùng', 'user_appeals': 'Khiếu nại mở khóa',
    'admin_logs': 'Nhật ký quản trị', 'password_reset_tokens': 'Token đặt lại mật khẩu', 'verification_tokens': 'Token xác thực email',
}


def cell(v):
    if isinstance(v, (dict, list)):
        return json.dumps(v, ensure_ascii=False, default=str)
    if isinstance(v, datetime):
        return v.replace(microsecond=0)
    return v


HEAD_FILL = PatternFill('solid', fgColor='7565A8')
wb = Workbook()
ov = wb.active
ov.title = 'TongQuan'
ov.append(['BỘ DỮ LIỆU THỰC TẾ — JobNest (Marketplace việc làm part-time cho sinh viên)'])
ov['A1'].font = Font(bold=True, size=14, color='7565A8')
ov.append([f'Sinh lúc {datetime.now():%d/%m/%Y %H:%M} · Khoảng thời gian dữ liệu: {START:%d/%m/%Y} → {NOW:%d/%m/%Y}'])
ov.append([f'Mật khẩu chung mọi tài khoản: {DEMO_PASSWORD}'])
ov.append(['Tài khoản demo: admin.test@vlu.edu.vn (Admin) · employer.test@vlu.edu.vn (NTD) · student.test@vlu.edu.vn (Sinh viên)'])
ov.append([])
ov.append(['Sheet (= bảng DB)', 'Nội dung', 'Số dòng'])
for c in ov[6]:
    c.font, c.fill = Font(bold=True, color='FFFFFF'), HEAD_FILL
for tb in ORDER:
    ov.append([tb, DESC[tb], len(T.get(tb, []))])
ov.append([])
ov.append(['Thống kê nhanh'])
ov.cell(ov.max_row, 1).font = Font(bold=True)
cnt = lambda tb, k, v: sum(1 for r in T[tb] if r[k] == v)
for label, val in [
    ('Sinh viên', cnt('users', 'role', 'STUDENT')), ('Nhà tuyển dụng', cnt('users', 'role', 'EMPLOYER')), ('Admin', cnt('users', 'role', 'ADMIN')),
    ('Doanh nghiệp đã xác minh', cnt('employer_profiles', 'verification_status', 'VERIFIED')),
    ('Tin đang tuyển (OPEN + đã duyệt)', sum(1 for j in T['jobs'] if j['status'] == 'OPEN' and j['moderation_status'] == 'APPROVED')),
    ('Tin chờ duyệt', cnt('jobs', 'moderation_status', 'PENDING')),
    ('Hồ sơ ứng tuyển', len(T['applications'])), ('Ứng tuyển được chấp nhận', cnt('applications', 'status', 'ACCEPTED')),
    ('Công việc đã hoàn thành', cnt('work_assignments', 'status', 'COMPLETED')), ('Tài khoản bị khóa', cnt('users', 'status', 'BANNED')),
]:
    ov.append([label, None, val])
ov.column_dimensions['A'].width, ov.column_dimensions['B'].width, ov.column_dimensions['C'].width = 32, 48, 10

for tb in ORDER:
    rows = T.get(tb, [])
    ws = wb.create_sheet(tb[:31])
    cols = list(rows[0].keys())
    ws.append(cols)
    for c in ws[1]:
        c.font, c.fill = Font(bold=True, color='FFFFFF'), HEAD_FILL
    for r in rows:
        ws.append([cell(r[c]) for c in cols])
    ws.freeze_panes = 'A2'
    ws.auto_filter.ref = ws.dimensions
    for i, c in enumerate(cols, 1):
        sample = [len(str(r[c])) for r in rows[:50] if r[c] is not None]
        ws.column_dimensions[get_column_letter(i)].width = min(60, max(10, len(c) + 2, *(sample or [0])))
        if rows and isinstance(rows[0][c], (datetime,)):
            for row in ws.iter_rows(min_row=2, min_col=i, max_col=i):
                row[0].number_format = 'yyyy-mm-dd hh:mm:ss'
    for row in ws.iter_rows(min_row=2):
        for c in row:
            if isinstance(c.value, str) and len(c.value) > 60:
                c.alignment = Alignment(wrap_text=False)

OUT.parent.mkdir(parents=True, exist_ok=True)
wb.save(OUT)
print(f'Đã ghi {OUT}')
for tb in ORDER:
    print(f'  {tb:28s} {len(T.get(tb, [])):6d}')
