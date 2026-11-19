// Chụp từng màn hình của web thật và trích xuất bố cục (khung, chữ, ảnh, icon) để dựng wireframe draw.io + SVG cho Figma.
// Chạy: NODE_PATH=<thư mục có playwright-core> node scripts/wireframes/capture.js [BASE_URL] [API_URL]
// Ra:   05_wireframes/_capture/<id>.json + 05_wireframes/screens/<id>.png
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'http://localhost:5173';
const API = process.argv[3] || 'http://localhost:5000';
const ROOT = path.resolve(__dirname, '../..');
const CAP = path.join(ROOT, '05_wireframes', '_capture');
const PNG = path.join(ROOT, '05_wireframes', 'screens');
fs.mkdirSync(CAP, { recursive: true });
fs.mkdirSync(PNG, { recursive: true });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;

const IDS = { job: 6, jobApply: 6, employer: 4, application: 6, student: 41 };
const click = (text, opts = {}) => async (p) => { await p.getByText(text, opts).first().click(); await p.waitForTimeout(1500); };
const role = (r, name) => async (p) => { await p.getByRole(r, { name }).first().click(); await p.waitForTimeout(1500); };
const seq = (...fns) => async (p) => { for (const f of fns) await f(p); };

// id, tên, vai trò đăng nhập, tab app, khu vực, tab con, sel, thao tác thêm, fullPage
const S = [];
const add = (id, name, who, app, area, tab, opts = {}) => S.push({ id, name, who, app, area, tab, ...opts });
// ── Khách
add('G01', 'Trang chủ', null, 'home', null, null, { full: true });
add('G02', 'Tìm việc làm', null, 'jobs', null, null, { full: true });
add('G03', 'Chi tiết việc làm', null, 'job_detail', null, null, { sel: { jobId: IDS.job }, full: true });
add('G04', 'Hồ sơ công ty công khai', null, 'employer_public_profile', null, null, { sel: { employerId: IDS.employer }, full: true });
add('G05', 'Việc làm theo lịch rảnh', null, 'home', null, null, { act: role('button', /Việc làm theo lịch rảnh/) });
add('G06', 'Giới thiệu', null, 'about', null, null, { full: true });
add('G07', 'Trang nội dung (Điều khoản/Chính sách)', null, 'static_content', null, null, { full: true });
add('G08', 'Đăng nhập', null, 'login', null, null);
add('G09', 'Quên mật khẩu', null, 'login', null, null, { act: click(/Quên mật khẩu/) });
add('G10', 'Đăng ký – Sinh viên', null, 'register', null, null, { full: true });
add('G11', 'Đăng ký – Nhà tuyển dụng', null, 'register', null, null, { act: click(/^Nhà tuyển dụng$/), full: true });
add('G15', 'Quên mật khẩu – nhập mã OTP', null, 'login', null, null, { act: seq(click(/Quên mật khẩu/), async (p) => { await p.locator('input[type=email]').first().fill('student.test@vlu.edu.vn'); }, role('button', /Gửi mã xác nhận/)) });
add('G14', 'Tính năng sắp ra mắt', null, 'coming_soon', null, null);
// ── Sinh viên
const st = (id, name, tab, o) => add(id, name, 'student', 'student_dashboard', 'student', tab, o);
st('S01', 'Tổng quan sinh viên', 'dashboard', { full: true });
st('S02', 'Lịch rảnh & gợi ý việc', 'availability', { full: true });
st('S03', 'Hồ sơ xin việc', 'profile', { full: true });
st('S04', 'Quản lý CV', 'cv', { full: true });
st('S05', 'Việc làm đã lưu', 'saved_jobs', { full: true });
st('S06', 'Lịch sử ứng tuyển', 'applications', { full: true });
st('S10', 'Đánh giá & phản hồi', 'reviews', { full: true });
st('S11', 'Thông báo', 'notifications', { full: true });
st('S12', 'Cài đặt tài khoản', 'settings', { full: true });
add('S13', 'Chi tiết đơn ứng tuyển', 'student', 'application_detail', null, null, { sel: { applicationId: IDS.application }, full: true });
add('S14', 'Form ứng tuyển (popup)', 'student', 'job_detail', null, null, { sel: { jobId: IDS.jobApply }, act: role('button', /Ứng tuyển ngay/) });
add('S15', 'Menu tài khoản', 'student', 'home', null, null, { act: async (p) => { await p.locator('button[aria-haspopup="menu"]').first().hover(); await p.waitForTimeout(1000); } });
add('S16', 'Thông báo nhanh (chuông)', 'student', 'home', null, null, { act: async (p) => { await p.locator('header button[aria-label*="hông báo"], header button:has(svg.lucide-bell)').first().click(); await p.waitForTimeout(1200); } });
// ── Nhà tuyển dụng
const em = (id, name, tab, o) => add(id, name, 'employer', 'employer_dashboard', 'employer', tab, o);
em('E01', 'Tổng quan nhà tuyển dụng', 'dashboard', { full: true });
[['media', 'Logo, ảnh bìa & thư viện'], ['general', 'Thông tin chung'], ['about', 'Giới thiệu & văn hóa'], ['policies', 'Chính sách nhân sự'],
  ['contact', 'Liên hệ công khai'], ['branches', 'Chi nhánh'], ['map', 'Vị trí trụ sở'], ['verification', 'Xác minh doanh nghiệp']]
  .forEach(([k, n], i) => em(`E02${String.fromCharCode(97 + i)}`, `Hồ sơ doanh nghiệp – ${n}`, 'profile', { extra: { jobnest_tab_company_section: k }, full: true }));
em('E03', 'Thông tin người đại diện', 'representative', { full: true });
em('E04', 'Tin tuyển dụng', 'jobs', { full: true });
em('E05', 'Đăng tin tuyển dụng mới', 'jobs', { act: role('button', /Đăng tin mới|Đăng tin tuyển dụng mới/), full: true });
em('E06', 'Hồ sơ ứng viên', 'applicants', { full: true });
em('E07', 'Xem hồ sơ ứng viên (popup)', 'applicants', { act: role('button', /^Xem hồ sơ$/) });
em('E08', 'Tuyển chọn ứng viên (popup)', 'applicants', { act: role('button', /Tuyển chọn ứng viên chính thức/) });
add('E09', 'Hồ sơ sinh viên (trang)', 'employer', 'student_profile_view', null, null, { sel: { studentId: IDS.student }, full: true });
em('E10', 'Quản lý hợp đồng', 'assignments', { full: true });
em('E12', 'Đánh giá', 'reviews', { full: true });
em('E13', 'Thông báo', 'notifications', { full: true });
em('E14', 'Cài đặt tài khoản', 'settings', { full: true });
// ── Quản trị
const ad = (id, name, tab, o) => add(id, name, 'admin', 'admin', 'admin', tab, o);
ad('A01', 'Tổng quan quản trị', 'dashboard', { full: true });
ad('A02', 'Quản lý người dùng', 'users', { full: true });
ad('A03', 'Xác minh doanh nghiệp', 'employer_verification', { full: true });
ad('A04', 'Chi tiết hồ sơ xác minh (popup)', 'employer_verification', { act: seq(role('button', /^Tất cả$/), role('button', 'Xem hồ sơ')) });
ad('A05', 'Khiếu nại tài khoản', 'appeals', { act: role('button', /^Tất cả$/), full: true });
ad('A06', 'Kiểm duyệt tin', 'moderation', { full: true });
ad('A07', 'Chi tiết tin chờ duyệt', 'moderation', { act: role('button', /Xem|Duyệt|Chi tiết/), full: true });
ad('A08', 'Báo cáo vi phạm', 'reports', { full: true });
ad('A09', 'Chi tiết báo cáo vi phạm', 'reports', { act: role('button', /Xem|Xử lý|Chi tiết/), full: true });
ad('A10', 'Kiểm duyệt đánh giá', 'reviews', { full: true });
ad('A11', 'Chi tiết đánh giá', 'reviews', { act: async (p) => { await p.locator('.admin-reviews-layout button').first().click(); await p.waitForTimeout(1500); }, full: true });
ad('A12', 'Danh mục ngành nghề', 'categories', { full: true });
ad('A13', 'Tin theo danh mục (popup)', 'categories', { act: role('button', /\d+ tin/) });
ad('A14', 'Nhật ký hệ thống', 'logs', { full: true });
ad('A15', 'Menu xuất báo cáo', 'moderation', { act: role('button', /Xuất báo cáo/) });

// Trích xuất bố cục trong trang
function extract() {
  const out = [];
  const col = (c) => (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent' ? c : null);
  const px = (v) => parseFloat(v) || 0;
  const sx = window.scrollX, sy = window.scrollY;
  const R = (r) => ({ x: Math.round(r.left + sx), y: Math.round(r.top + sy), w: Math.round(r.width), h: Math.round(r.height) });
  const inter = (a, b) => {
    if (!b) return a;
    const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y), x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + a.h, b.y + b.h);
    return x2 > x && y2 > y ? { x, y, w: x2 - x, h: y2 - y } : null;
  };
  const grad = (bgi) => {
    if (!bgi || !bgi.includes('gradient')) return null;
    const cs = bgi.match(/rgba?\([^)]+\)/g);
    return cs && cs.length >= 2 ? [cs[0], cs[cs.length - 1]] : null;
  };
  const textOf = (el, cs) => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (['checkbox', 'radio', 'file', 'hidden', 'range', 'color'].includes(el.type)) return null;
      return el.value ? { t: el.value, ph: false } : (el.placeholder ? { t: el.placeholder, ph: true } : null);
    }
    if (el.tagName === 'SELECT') return el.selectedOptions[0] ? { t: el.selectedOptions[0].text, ph: false } : null;
    return null;
  };
  const font = (cs) => ({ fs: px(cs.fontSize), fw: parseInt(cs.fontWeight, 10) || 400, ff: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), c: cs.color, it: cs.fontStyle === 'italic' });
  const walk = (el, clip, opac) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const op = opac * parseFloat(cs.opacity || '1');
    if (op < 0.05) return;
    const rect = R(el.getBoundingClientRect());
    const vis = rect.w > 0 && rect.h > 0 ? inter(rect, clip) : null;
    const tag = el.tagName;
    if (tag === 'svg' || tag === 'SVG') {
      if (vis) {
        const clone = el.cloneNode(true);
        clone.setAttribute('color', cs.color);
        out.push({ k: 'svg', ...rect, m: clone.outerHTML.replace(/currentColor/g, cs.color), c: cs.color, op });
      }
      return;
    }
    if (vis) {
      const bg = col(cs.backgroundColor), g = grad(cs.backgroundImage);
      const sides = ['Top', 'Right', 'Bottom', 'Left'].map(s => ({ w: px(cs[`border${s}Width`]), c: col(cs[`border${s}Color`]), st: cs[`border${s}Style`] }))
        .map(b => (b.w > 0 && b.c && b.st !== 'none' ? b : null));
      const all = sides.every(b => b && b.w === sides[0].w && b.c === sides[0].c);
      const r = px(cs.borderTopLeftRadius);
      if (bg || g || all) out.push({ k: 'box', ...rect, bg, g, bc: all ? sides[0].c : null, bw: all ? sides[0].w : 0, dash: all && sides[0].st === 'dashed', r: Math.min(r, rect.w / 2, rect.h / 2), op, sh: cs.boxShadow !== 'none' });
      if (!all) sides.forEach((b, i) => {
        if (!b) return;
        const L = [[rect.x, rect.y, rect.x + rect.w, rect.y], [rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h],
          [rect.x, rect.y + rect.h, rect.x + rect.w, rect.y + rect.h], [rect.x, rect.y, rect.x, rect.y + rect.h]][i];
        out.push({ k: 'line', x1: L[0], y1: L[1], x2: L[2], y2: L[3], c: b.c, w: b.w, op });
      });
      if (tag === 'IMG' && el.currentSrc && el.naturalWidth) out.push({ k: 'img', ...rect, src: el.currentSrc, r: Math.min(r, rect.w / 2), fit: cs.objectFit, op });
      const bu = cs.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
      if (bu) out.push({ k: 'img', ...rect, src: new URL(bu[1], location.href).href, r, fit: cs.backgroundSize === 'contain' ? 'contain' : 'cover', op });
      const ft = textOf(el, cs);
      if (ft) {
        const f = font(cs);
        out.push({ k: 'text', x: rect.x + px(cs.paddingLeft) + px(cs.borderLeftWidth), y: rect.y, w: rect.w, h: rect.h, t: ft.t, ...f, c: ft.ph ? 'rgb(148, 163, 184)' : f.c, op, mid: true });
      }
      if (tag === 'CANVAS' || tag === 'IFRAME' || tag === 'VIDEO') out.push({ k: 'img', ...rect, src: null, op });
    }
    let childClip = clip;
    if (['hidden', 'auto', 'scroll', 'clip'].includes(cs.overflowX) || ['hidden', 'auto', 'scroll', 'clip'].includes(cs.overflowY)) childClip = vis || { x: 0, y: 0, w: 0, h: 0 };
    for (const n of el.childNodes) {
      if (n.nodeType === 1) walk(n, childClip, op);
      else if (n.nodeType === 3 && n.data.trim()) {
        const f = font(cs);
        const tt = cs.textTransform;
        const tf = (s) => (tt === 'uppercase' ? s.toUpperCase() : tt === 'lowercase' ? s.toLowerCase() : s);
        const lines = new Map();
        const re = /\S+/g; let m;
        while ((m = re.exec(n.data))) {
          const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
          const rr = rg.getClientRects()[0];
          if (!rr || rr.width === 0) continue;
          const b = R(rr);
          if (childClip && !inter(b, childClip)) continue;
          const key = Math.round(b.y / 3);
          const L = lines.get(key);
          if (L) { L.t += ' ' + m[0]; L.x2 = Math.max(L.x2, b.x + b.w); L.h = Math.max(L.h, b.h); } else lines.set(key, { x: b.x, y: b.y, x2: b.x + b.w, h: b.h, t: m[0] });
        }
        for (const L of lines.values()) out.push({ k: 'text', x: L.x, y: L.y, w: L.x2 - L.x, h: L.h, t: tf(L.t), ...f, op: op });
      }
    }
  };
  walk(document.body, null, 1);
  return { w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, nodes: out };
}

async function login(email) {
  const r = await (await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'Jobnest@2026' }) })).json();
  return { ...r.data.user, token: r.data.token };
}

(async () => {
  const sessions = {
    student: await login('student.test@vlu.edu.vn'),
    employer: await login('employer.test@vlu.edu.vn'),
    admin: await login('admin.test@vlu.edu.vn'),
  };
  const browser = await chromium.launch({ ...(process.env.PW_EXE ? { executablePath: process.env.PW_EXE } : { channel: process.env.PW_CHANNEL || 'msedge' }), headless: true });
  const index = [];
  for (const s of S) {
    if (ONLY && !ONLY.includes(s.id)) continue;
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    if (s.who) await ctx.addInitScript((x) => localStorage.setItem('jobnest_session', JSON.stringify(x)), sessions[s.who]);
    const page = await ctx.newPage();
    let status = 'ok';
    try {
      await page.goto(BASE + '/');
      await page.evaluate(([a, ar, t, sel, extra]) => {
        sessionStorage.setItem('jobnest_tab_app', a);
        if (ar) sessionStorage.setItem(`jobnest_tab_${ar}`, t);
        if (sel) sessionStorage.setItem('jobnest_tab_app_sel', JSON.stringify(sel));
        Object.entries(extra || {}).forEach(([k, v]) => sessionStorage.setItem(k, v));
      }, [s.app, s.area, s.tab, s.sel, s.extra]);
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2200);
      if (s.act) await s.act(page);
      await page.waitForTimeout(800);
      // Ẩn nút hỗ trợ nổi để khung gọn hơn
      await page.addStyleTag({ content: '*{caret-color:transparent!important}' });
      const data = await page.evaluate(extract);
      const full = Boolean(s.full) && !s.act?.toString().includes('popup');
      if (!full) { data.h = 900; data.nodes = data.nodes.filter(n => (n.y ?? n.y1) < 900); }
      await page.screenshot({ path: path.join(PNG, `${s.id}.png`), fullPage: full });
      data.id = s.id; data.name = s.name; data.role = s.who || 'guest';
      fs.writeFileSync(path.join(CAP, `${s.id}.json`), JSON.stringify(data));
      index.push({ id: s.id, name: s.name, role: data.role, w: data.w, h: data.h, nodes: data.nodes.length });
    } catch (e) {
      status = 'LỖI: ' + e.message.split('\n')[0];
    }
    console.log(`${s.id} ${s.name}: ${status}`);
    await ctx.close();
  }
  if (!ONLY) fs.writeFileSync(path.join(CAP, 'index.json'), JSON.stringify(index, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
