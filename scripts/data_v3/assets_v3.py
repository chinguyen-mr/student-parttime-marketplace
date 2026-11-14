"""
Tạo file thật cho bộ dữ liệu v3: logo, ảnh bìa, ảnh văn phòng, ảnh đại diện, CV PDF, giấy tờ pháp lý PDF.
Dùng Pillow + fpdf2 (chạy trong Docker, xem README trong thư mục này).

File lưu ở 02_database/data_v3_files/<loại>/..., đường dẫn tương đối được ghi vào cột file_uploads.data
của Excel; import_data_v3.py đọc file và nạp vào cột bytea.
"""
import io
import os
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from fpdf import FPDF

FILES_DIR: Path = None  # gán bởi generator
FONT_DIR = Path(os.environ.get('FONT_DIR', '/winfonts'))
LAVENDER = (117, 101, 168)
LAVENDER_SOFT = (241, 238, 248)
PEACH = (244, 185, 157)
INK = (30, 41, 59)
MUTED = (100, 116, 139)
PALETTE = [(117, 101, 168), (37, 99, 235), (5, 150, 105), (217, 119, 6), (190, 24, 93), (14, 116, 144),
           (124, 58, 237), (220, 38, 38), (71, 85, 105), (21, 128, 61)]

# Ảnh thật theo ngành (Unsplash, đã kiểm tra tồn tại và đúng chủ đề)
PHOTOS = {
    'F&B / Dịch vụ ăn uống': ['1501339847302-ac426a4a7cbb', '1554118811-1e0d58224f24', '1521017432531-fbd92d768814',
                              '1453614512568-c4024d13c247', '1517248135467-4c7edcad34c4', '1552566626-52f8b828add9', '1445116572660-236099ec97a0'],
    'Bán lẻ': ['1604719312566-8912e9227c6a', '1534723452862-4c874018d66d', '1441986300917-64674bd600d8', '1578916171728-46686eac8d58'],
    'Công nghệ thông tin': ['1497366216548-37526070297c', '1497366811353-6870744d04b2', '1522071820081-009f0129c71c',
                            '1531482615713-2afd69097998', '1517694712202-14dd9538aa97', '1498050108023-c5249f4df085'],
    'Giáo dục / Đào tạo': ['1524178232363-1fb2b075b655', '1509062522246-3755977927d7', '1503676260728-1c00da094a0b', '1427504494785-3a9ca7044f45'],
    'Marketing / Truyền thông': ['1552664730-d307ca884978', '1557804506-669a67965ba0', '1533750349088-cd871a92f312', '1600880292203-757bb62b4baf'],
    'Logistics / Giao nhận': ['1586528116311-ad8dd3c8310d', '1553413077-190dd305871c', '1566576721346-d4a3b4eaeb55', '1565793298595-6a879b1d9492'],
    'Hàng tiêu dùng / FMCG': ['1542838132-92c53300491e', '1578916171728-46686eac8d58', '1604719312566-8912e9227c6a'],
    'Hành chính / Văn phòng': ['1454165804606-c3d57bc86b40', '1486312338219-ce68d2c6f44d', '1497366811353-6870744d04b2'],
    'Thiết kế / Multimedia': ['1581291518857-4e27b48ff24e', '1558655146-d09347e92766', '1513258496099-48168024aec0'],
    'Sản xuất / Kỹ thuật': ['1581091226825-a6a2a5aee158', '1565793298595-6a879b1d9492', '1586528116311-ad8dd3c8310d'],
}


def photo_url(pid, w=1200):
    return f'https://images.unsplash.com/photo-{pid}?w={w}&q=80&auto=format&fit=crop'


def font(bold=False, size=20):
    for name in (['arialbd.ttf', 'segoeuib.ttf'] if bold else ['arial.ttf', 'segoeui.ttf']):
        p = FONT_DIR / name
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default(size)


def _fetch(url, cache: Path):
    if not cache.exists():
        cache.parent.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request(url, headers={'User-Agent': 'JobNest-seed/1.0'})
        cache.write_bytes(urllib.request.urlopen(req, timeout=60).read())
    return cache.read_bytes()


def _save(img: Image.Image, rel: str, fmt='JPEG', **kw):
    p = FILES_DIR / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    img.save(p, fmt, **kw)
    return rel, p.stat().st_size


def _fit(img, w, h):
    """Cắt giữa ảnh rồi thu về đúng w×h."""
    sw, sh = img.size
    scale = max(w / sw, h / sh)
    img = img.resize((int(sw * scale) + 1, int(sh * scale) + 1), Image.LANCZOS)
    l, t = (img.width - w) // 2, (img.height - h) // 2
    return img.crop((l, t, l + w, t + h))


def photo(pid, kind):
    """Ảnh bìa (1200×400) hoặc ảnh văn phòng (900×600) từ kho ảnh ngành. Trả (đường_dẫn, kích_thước)."""
    raw = _fetch(photo_url(pid, 1600), FILES_DIR / '_cache' / f'{pid}.jpg')
    img = Image.open(io.BytesIO(raw)).convert('RGB')
    w, h = (1200, 400) if kind == 'cover' else (900, 600)
    return _save(_fit(img, w, h), f'photos/{pid}_{kind}.jpg', quality=82, optimize=True)


def _initials(name, n=2):
    words = [w for w in name.replace('&', ' ').split() if w[:1].isalnum()]
    return ''.join(w[0] for w in words[:n]).upper() or 'J'


def logo(key, brand, idx):
    """Logo vuông 512px: nền gradient theo màu thương hiệu + chữ cái đầu + vòng tròn nhấn màu đào."""
    c1 = PALETTE[idx % len(PALETTE)]
    c2 = tuple(max(0, int(v * 0.62)) for v in c1)
    img = Image.new('RGB', (512, 512), c1)
    d = ImageDraw.Draw(img)
    for y in range(512):
        t = y / 511
        d.line([(0, y), (512, y)], fill=tuple(int(c1[i] * (1 - t) + c2[i] * t) for i in range(3)))
    d.ellipse([330, 300, 600, 570], fill=PEACH)
    d.ellipse([-80, -80, 150, 150], outline=(255, 255, 255), width=10)
    text = _initials(brand)
    f = font(True, 210 if len(text) == 1 else 170)
    box = d.textbbox((0, 0), text, font=f)
    d.text(((512 - (box[2] - box[0])) / 2 - box[0], (512 - (box[3] - box[1])) / 2 - box[1] - 10), text, font=f, fill='white')
    return _save(img, f'logos/{key}.png', 'PNG', optimize=True)


AVATAR_BG = ['c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'b6e3f4']


def avatar(key, name, gender, folder='avatars'):
    """Ảnh đại diện minh họa (DiceBear 'notionists', không phải ảnh người thật); lỗi mạng → ảnh chữ cái."""
    seed = f'{key}-{name}'
    url = (f'https://api.dicebear.com/9.x/notionists/png?seed={urllib.request.quote(seed)}&size=320'
           f'&backgroundColor={",".join(AVATAR_BG)}&backgroundType=solid')
    try:
        raw = _fetch(url, FILES_DIR / '_cache' / folder / f'{key}.png')
        img = Image.open(io.BytesIO(raw)).convert('RGB')
    except Exception:
        img = Image.new('RGB', (320, 320), PALETTE[hash(seed) % len(PALETTE)])
        d = ImageDraw.Draw(img)
        t = _initials(name.split()[-1] + ' ' + name.split()[0], 1)
        f = font(True, 150)
        b = d.textbbox((0, 0), t, font=f)
        d.text(((320 - b[2] + b[0]) / 2 - b[0], (320 - b[3] + b[1]) / 2 - b[1]), t, font=f, fill='white')
    return _save(img, f'{folder}/{key}.jpg', quality=88)


# ─────────────────────────────── PDF ───────────────────────────────
class _PDF(FPDF):
    def __init__(self):
        super().__init__('P', 'mm', 'A4')
        self.add_font('VN', '', str(FONT_DIR / 'arial.ttf'))
        self.add_font('VN', 'B', str(FONT_DIR / 'arialbd.ttf'))
        self.add_font('VN', 'I', str(FONT_DIR / 'ariali.ttf'))
        self.set_auto_page_break(True, 14)
        self.set_margins(0, 0, 0)


def cv_pdf(key, s, avatar_rel):
    """CV 1 trang A4. s: dict thông tin sinh viên (xem generator)."""
    pdf = _PDF()
    pdf.add_page()
    # Cột trái nền tím nhạt
    pdf.set_fill_color(*LAVENDER_SOFT)
    pdf.rect(0, 0, 70, 297, 'F')
    # Băng tiêu đề
    pdf.set_fill_color(*LAVENDER)
    pdf.rect(70, 0, 140, 52, 'F')
    pdf.set_fill_color(*PEACH)
    pdf.rect(70, 52, 140, 1.6, 'F')
    pdf.image(str(FILES_DIR / avatar_rel), x=12, y=12, w=46, h=46)
    pdf.set_text_color(255, 255, 255)
    pdf.set_xy(78, 13)
    pdf.set_font('VN', 'B', 22)
    pdf.cell(126, 10, s['name'].upper())
    pdf.set_xy(78, 25)
    pdf.set_font('VN', '', 12)
    pdf.cell(126, 7, s['position'])
    pdf.set_xy(78, 34)
    pdf.set_font('VN', '', 9.5)
    pdf.multi_cell(126, 5, f"{s['year']} · {s['major']}\n{s['school']}")

    def left_title(y, text):
        pdf.set_xy(10, y)
        pdf.set_text_color(*LAVENDER)
        pdf.set_font('VN', 'B', 11)
        pdf.cell(52, 6, text.upper())
        pdf.set_draw_color(*LAVENDER)
        pdf.line(10, y + 7, 60, y + 7)
        return y + 10

    def left_lines(y, lines, size=9):
        pdf.set_text_color(*INK)
        pdf.set_font('VN', '', size)
        for ln in lines:
            pdf.set_xy(10, y)
            pdf.multi_cell(52, 4.6, ln)
            y = pdf.get_y() + 1.2
        return y + 3

    y = left_title(66, 'Liên hệ')
    y = left_lines(y, [f"Điện thoại: {s['phone']}", f"Email: {s['email']}", f"Địa chỉ: {s['address']}",
                       f"Ngày sinh: {s['dob']}", f"Giới tính: {s['gender']}"], 8.6)
    y = left_title(y, 'Kỹ năng')
    y = left_lines(y, [f"• {k}" for k in s['skills']])
    y = left_title(y, 'Ngoại ngữ')
    y = left_lines(y, [f"• {l['language']}: {l['level']}" for l in s['languages']])
    y = left_title(y, 'Lịch có thể làm')
    y = left_lines(y, s['availability'], 8.6)

    def right_title(y, text):
        pdf.set_xy(78, y)
        pdf.set_text_color(*LAVENDER)
        pdf.set_font('VN', 'B', 12.5)
        pdf.cell(124, 7, text.upper())
        pdf.set_fill_color(*PEACH)
        pdf.rect(78, y + 7.5, 18, 1.1, 'F')
        return y + 11

    def para(y, text, size=9.6, style=''):
        pdf.set_xy(78, y)
        pdf.set_text_color(*INK)
        pdf.set_font('VN', style, size)
        pdf.multi_cell(124, 5, text)
        return pdf.get_y() + 1.5

    y = right_title(62, 'Mục tiêu nghề nghiệp')
    y = para(y, s['objective']) + 3
    y = right_title(y, 'Học vấn')
    y = para(y, s['school'], 10.2, 'B')
    y = para(y, f"{s['degree']}  ·  {s['edu_years']}" + (f"  ·  GPA: {s['gpa']}/10" if s['gpa'] else ''))
    y = para(y, f"Mã số sinh viên: {s['code']}", 9) + 3
    y = right_title(y, 'Kinh nghiệm')
    if s['experiences']:
        for e in s['experiences']:
            y = para(y, f"{e['title']} — {e['organization']}", 10.2, 'B')
            pdf.set_text_color(*MUTED)
            y = para(y, e['period'], 8.8, 'I')
            y = para(y, e['description']) + 1.5
    else:
        y = para(y, 'Chưa có kinh nghiệm đi làm chính thức; đã tham gia các dự án môn học và hoạt động tình nguyện tại trường.') + 1.5
    y += 1.5
    y = right_title(y, 'Hoạt động & chứng chỉ')
    for a in s['activities']:
        y = para(y, f"• {a}")
    # Chân trang (tắt ngắt trang tự động để dòng này không bị đẩy sang trang 2)
    pdf.set_auto_page_break(False)
    pdf.set_xy(78, 286)
    pdf.set_text_color(*MUTED)
    pdf.set_font('VN', 'I', 7.5)
    pdf.cell(124, 4, 'CV tạo từ hồ sơ JobNest · Dữ liệu demo phục vụ đồ án', align='R')
    rel = f'cv/{key}.pdf'
    p = FILES_DIR / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(p))
    return rel, p.stat().st_size


def legal_pdf(key, e):
    """Giấy chứng nhận ĐKDN MẪU (hư cấu, đóng dấu 'BẢN MẪU DEMO') để minh họa luồng xét duyệt pháp lý."""
    pdf = _PDF()
    pdf.set_margins(20, 18, 20)
    pdf.add_page()
    pdf.set_text_color(*INK)
    pdf.set_font('VN', 'B', 11)
    pdf.cell(0, 6, 'SỞ KẾ HOẠCH VÀ ĐẦU TƯ (MẪU MINH HỌA)', align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('VN', '', 10)
    pdf.cell(0, 6, 'Phòng Đăng ký kinh doanh — TP. Hồ Chí Minh', align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(6)
    pdf.set_font('VN', 'B', 16)
    title = 'GIẤY CHỨNG NHẬN ĐĂNG KÝ HỘ KINH DOANH' if e['household'] else 'GIẤY CHỨNG NHẬN ĐĂNG KÝ DOANH NGHIỆP'
    pdf.multi_cell(0, 8, title, align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('VN', '', 10.5)
    pdf.cell(0, 6, f"Mã số: {e['tax_code']}  ·  Đăng ký lần đầu: 15/03/{e['founded']}", align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(6)
    rows = [('1. Tên doanh nghiệp', e['legal_name']), ('2. Tên viết tắt / thương hiệu', e['brand']),
            ('3. Loại hình', e['company_type']), ('4. Địa chỉ trụ sở', e['address']),
            ('5. Ngành nghề kinh doanh chính', e['industry']), ('6. Người đại diện theo pháp luật', f"{e['rep']} — {e['rep_title']}"),
            ('7. Điện thoại liên hệ', e['phone'])]
    for k, v in rows:
        pdf.set_font('VN', 'B', 10.5)
        pdf.cell(62, 8, k)
        pdf.set_font('VN', '', 10.5)
        pdf.multi_cell(0, 8, v, new_x='LMARGIN', new_y='NEXT')
    pdf.ln(10)
    pdf.set_font('VN', 'I', 10)
    pdf.cell(0, 6, f"TP. Hồ Chí Minh, ngày 15 tháng 03 năm {e['founded']}", align='R', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('VN', 'B', 10.5)
    pdf.cell(0, 6, 'TRƯỞNG PHÒNG (mẫu)', align='R', new_x='LMARGIN', new_y='NEXT')
    # Dấu "BẢN MẪU DEMO"
    pdf.set_draw_color(220, 38, 38)
    pdf.set_text_color(220, 38, 38)
    pdf.set_line_width(1.2)
    pdf.rect(45, 200, 120, 28)
    pdf.set_xy(45, 203)
    pdf.set_font('VN', 'B', 20)
    pdf.cell(120, 11, 'BẢN MẪU DEMO', align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.set_x(45)
    pdf.set_font('VN', 'B', 10)
    pdf.cell(120, 8, 'Dữ liệu hư cấu — không có giá trị pháp lý', align='C')
    rel = f'legal/{key}.pdf'
    p = FILES_DIR / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(p))
    return rel, p.stat().st_size
