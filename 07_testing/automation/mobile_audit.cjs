// Kiểm tra hiển thị trên điện thoại: mở từng trang ở khổ 390×844, đo tràn ngang, chỉ ra phần tử gây tràn, chụp ảnh.
// Chạy: API_URL=… WEB=… PW_CORE=… OUT=<thư mục ảnh> node mobile_audit.cjs   (chỉ xem, không sửa dữ liệu)
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_CORE || 'playwright-core');
const { api } = require('./lib.cjs');

const WEB = process.env.WEB || 'http://localhost:5174';
const OUT = process.env.OUT || path.join(__dirname, '..', 'mobile_audit');
const W = Number(process.env.VW || 390);
const PAGES = [
  ['khach', 'Trang chủ', { app: 'home' }],
  ['khach', 'Tìm việc', { app: 'jobs' }],
  ['khach', 'Giới thiệu', { app: 'about' }],
  ['khach', 'Đăng nhập', { app: 'login' }],
  ['khach', 'Đăng ký', { app: 'register' }],
  ['khach', 'Chi tiết tin', { app: 'jobs' }, 'openJob'],
  ['sv', 'SV · Tổng quan', { app: 'student_dashboard', student: 'dashboard' }],
  ['sv', 'SV · Lịch rảnh', { app: 'student_dashboard', student: 'availability' }],
  ['sv', 'SV · Hồ sơ xin việc', { app: 'student_dashboard', student: 'profile' }],
  ['sv', 'SV · Quản lý CV', { app: 'student_dashboard', student: 'cv' }],
  ['sv', 'SV · Việc đã lưu', { app: 'student_dashboard', student: 'saved_jobs' }],
  ['sv', 'SV · Lịch sử ứng tuyển', { app: 'student_dashboard', student: 'applications' }],
  ['sv', 'SV · Đánh giá', { app: 'student_dashboard', student: 'reviews' }],
  ['sv', 'SV · Thông báo', { app: 'student_dashboard', student: 'notifications' }],
  ['sv', 'SV · Cài đặt', { app: 'student_dashboard', student: 'settings' }],
  ['ntd', 'NTD · Tổng quan', { app: 'employer_dashboard', employer: 'dashboard' }],
  ['ntd', 'NTD · Hồ sơ DN (ảnh)', { app: 'employer_profile', employer: 'profile', company_section: 'media' }],
  ['ntd', 'NTD · Hồ sơ DN (thông tin chung)', { app: 'employer_profile', employer: 'profile', company_section: 'general' }],
  ['ntd', 'NTD · Hồ sơ DN (chi nhánh)', { app: 'employer_profile', employer: 'profile', company_section: 'branches' }],
  ['ntd', 'NTD · Xác minh', { app: 'employer_profile', employer: 'verification' }],
  ['ntd', 'NTD · Tin tuyển dụng', { app: 'employer_dashboard', employer: 'jobs' }],
  ['ntd', 'NTD · Đăng tin mới', { app: 'employer_dashboard', employer: 'jobs' }, 'createJob'],
  ['ntd', 'NTD · Hồ sơ ứng viên', { app: 'employer_dashboard', employer: 'applicants' }],
  ['ntd', 'NTD · Hợp đồng', { app: 'employer_dashboard', employer: 'assignments' }],
  ['ntd', 'NTD · Đánh giá', { app: 'employer_dashboard', employer: 'reviews' }],
  ['ntd', 'NTD · Thông báo', { app: 'employer_dashboard', employer: 'notifications' }],
  ['ntd', 'NTD · Người đại diện', { app: 'employer_dashboard', employer: 'representative' }],
  ['ntd', 'NTD · Cài đặt', { app: 'employer_dashboard', employer: 'settings' }],
  ['admin', 'Admin · Tổng quan', { app: 'admin', admin: 'dashboard' }],
  ['admin', 'Admin · Người dùng', { app: 'admin', admin: 'users' }],
  ['admin', 'Admin · Xác minh DN', { app: 'admin', admin: 'employer_verification' }],
  ['admin', 'Admin · Khiếu nại', { app: 'admin', admin: 'appeals' }],
  ['admin', 'Admin · Hỗ trợ', { app: 'admin', admin: 'support' }],
  ['admin', 'Admin · Kiểm duyệt tin', { app: 'admin', admin: 'moderation' }],
  ['admin', 'Admin · Báo cáo', { app: 'admin', admin: 'reports' }],
  ['admin', 'Admin · Kiểm duyệt đánh giá', { app: 'admin', admin: 'reviews' }],
  ['admin', 'Admin · Danh mục', { app: 'admin', admin: 'categories' }],
  ['admin', 'Admin · Nhật ký', { app: 'admin', admin: 'logs' }],
  // Trạng thái mở trên điện thoại: ngăn ☰ và danh sách mục
  ['khach', 'Mở menu ☰ (khách)', { app: 'home' }, 'openMenu'],
  ['sv', 'Mở menu ☰ (SV)', { app: 'jobs' }, 'openMenu'],
  ['ntd', 'Mở menu ☰ (NTD)', { app: 'employer_dashboard', employer: 'dashboard' }, 'openMenu'],
  ['sv', 'SV · mở danh sách mục', { app: 'student_dashboard', student: 'applications' }, 'openSection'],
  ['ntd', 'NTD · mở danh sách mục', { app: 'employer_dashboard', employer: 'jobs' }, 'openSection'],
  ['admin', 'Admin · mở danh sách mục', { app: 'admin', admin: 'users' }, 'openSection'],
];

// Phần tử "gốc" bị cắt / tràn: vượt mép phải màn hình. body có overflow-x: clip nên tràn KHÔNG tạo cuộn ngang mà bị cắt mất
// → không dựa vào scrollWidth. Bỏ qua phần tử nằm trong vùng cuộn ngang thật (auto/scroll) hoặc khung cắt nằm gọn trong màn hình.
const FIND = (vw) => {
  const scrollable = (el) => {
    for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o === 'auto' || o === 'scroll') return true;
      if ((o === 'hidden' || o === 'clip') && p.getBoundingClientRect().right <= vw + 1) return true;
    }
    return false;
  };
  const over = [];
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (!r.width || r.right <= vw + 1 || getComputedStyle(el).position === 'fixed') continue;
    if (scrollable(el)) continue;
    over.push(el);
  }
  const roots = over.filter(el => !over.includes(el.parentElement));
  return roots.slice(0, 6).map(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { tag: el.tagName.toLowerCase(), cls: (el.className && String(el.className).slice(0, 40)) || '', w: Math.round(r.width), right: Math.round(r.right),
      css: [cs.display, cs.gridTemplateColumns !== 'none' ? 'grid:' + cs.gridTemplateColumns.slice(0, 60) : '', cs.minWidth !== '0px' && cs.minWidth !== 'auto' ? 'min-w:' + cs.minWidth : '', el.style.width ? 'w:' + el.style.width : ''].filter(Boolean).join(' '),
      text: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 50) };
  });
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const login = async (email, password) => { const r = await api('POST', '/auth/login', null, { email, password }); return { ...r.j.data.user, token: r.j.data.token }; };
  const S = { khach: null, sv: await login('student.test@vlu.edu.vn', 'Jobnest@2026'), ntd: await login('employer.test@vlu.edu.vn', 'Jobnest@2026'), admin: await login('admin.test@vlu.edu.vn', 'Jobnest@2026') };
  const browser = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const report = [];
  const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null; // VD ONLY="Người dùng|Tin tuyển dụng"
  for (const [who, name, tabs, action] of PAGES) {
    if (ONLY && !ONLY.test(name)) continue;
    const ctx = await browser.newContext({ viewport: { width: W, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message.slice(0, 100)));
    await page.goto(WEB + '/');
    await page.evaluate(([s, t]) => { localStorage.clear(); sessionStorage.clear(); if (s) localStorage.setItem('jobnest_session', JSON.stringify(s)); for (const [k, v] of Object.entries(t)) sessionStorage.setItem('jobnest_tab_' + k, v); }, [S[who], tabs]);
    await page.reload(); await page.waitForLoadState('networkidle').catch(() => {}); await page.waitForTimeout(500);
    try {
      if (action === 'openJob') { await page.locator('h3, h4').filter({ visible: true }).first().click({ timeout: 5000 }); await page.waitForTimeout(1200); }
      if (action === 'createJob') { await page.getByRole('button', { name: /Đăng tin mới/ }).filter({ visible: true }).first().click({ timeout: 5000 }); await page.waitForTimeout(1500); }
      if (action === 'openMenu') { await page.locator('.jn-mobile-menu-btn').click({ timeout: 5000 }); await page.waitForTimeout(500); }
      if (action === 'openSection') { await page.locator('.jn-section-bar').click({ timeout: 5000 }); await page.waitForTimeout(500); }
    } catch (e) { errors.push('thao tác: ' + e.message.split('\n')[0].slice(0, 80)); }
    const culprits = await page.evaluate(FIND, W);
    const cut = culprits.length ? Math.max(...culprits.map(c => c.right)) - W : 0;
    const file = name.replace(/[^\p{L}\p{N}]+/gu, '_') + '.png';
    await page.screenshot({ path: path.join(OUT, file), fullPage: false });
    report.push({ who, name, overflow: cut, culprits, errors, file });
    console.log(`${cut > 1 ? '✖' : '✔'} ${name.padEnd(34)}${cut > 1 ? ` bị cắt ${cut}px (${culprits.length} vùng)` : ' vừa màn hình'}${errors.length ? ' · lỗi: ' + errors[0] : ''}`);
    for (const c of culprits.slice(0, 3)) console.log(`     ↳ <${c.tag}> rộng ${c.w} tới ${c.right} | ${c.css} | "${c.text}"`);
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`\nTràn ngang: ${report.filter(r => r.overflow > 1).length}/${report.length} trang · ảnh: ${OUT}`);
})();
