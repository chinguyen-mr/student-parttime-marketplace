/**
 * JOBNEST — Kiểm thử hồi quy P0 qua trình duyệt thật (sau nâng cấp UI/UX Premium).
 *
 * Mỗi bước có ASSERT thật (khác các script cũ trong thư mục này luôn ghi PASS).
 * Chạy khi backend (:5000, có DB demo) và Vite dev (:5173) đang chạy:
 *   npm i --no-save playwright-core      (hoặc đặt NODE_PATH tới nơi đã cài)
 *   node e2e_scripts/p0_ui_regression.js
 * Biến môi trường tùy chọn: BASE_URL, API_URL, CHROME_PATH, E2E_PASSWORD.
 *
 * Dữ liệu: tạo 1 tin "[E2E-UI] ..." của employer.test → admin duyệt → student.test ứng tuyển.
 * Cuối bài: từ chối đơn kiểm thử (kèm lý do) và đóng tin (dọn dữ liệu).
 */
const { chromium } = require('playwright-core');

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const API = process.env.API_URL || 'http://localhost:5000/api';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PASSWORD = process.env.E2E_PASSWORD || 'Jobnest@2026';
const ACC = { student: 'student.test@vlu.edu.vn', employer: 'employer.test@vlu.edu.vn', admin: 'admin.test@vlu.edu.vn' };

const results = [];
const record = (id, name, status, detail = '') => {
  results.push({ id, name, status, detail });
  console.log(`${status === 'PASS' ? '✔' : status === 'FAIL' ? '✖' : '–'} [${id}] ${name}${detail ? ' — ' + detail : ''}`);
};
async function step(id, name, fn) {
  try { const d = await fn(); record(id, name, 'PASS', d || ''); return true; }
  catch (e) { record(id, name, 'FAIL', e.message.split('\n')[0]); return false; }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

async function api(method, path, token, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* không phải JSON */ }
  return { status: res.status, data };
}
const login = async (email) => {
  const r = await api('POST', '/auth/login', null, { email, password: PASSWORD });
  assert(r.status === 200 && r.data?.data?.token, `Đăng nhập API thất bại cho ${email}`);
  return { ...r.data.data.user, token: r.data.data.token };
};
/** Mở thẳng 1 "trang" (activeTab) bằng cơ chế khôi phục F5 sẵn có của App. */
async function openTab(page, { session, tab, sel = {}, sub = {} }) {
  await page.goto(BASE);
  await page.evaluate(({ session, tab, sel, sub }) => {
    localStorage.clear();
    sessionStorage.clear();
    if (session) localStorage.setItem('jobnest_session', JSON.stringify(session));
    sessionStorage.setItem('jobnest_tab_app', tab);
    sessionStorage.setItem('jobnest_tab_app_sel', JSON.stringify(sel));
    Object.entries(sub).forEach(([k, v]) => sessionStorage.setItem(`jobnest_tab_${k}`, v));
  }, { session, tab, sel, sub });
  await page.reload();
}

(async () => {
  const stamp = Date.now().toString().slice(-6);
  const jobTitle = `[E2E-UI] Trợ lý nhập liệu part-time ${stamp}`;
  const S = {};
  for (const [k, email] of Object.entries(ACC)) S[k] = await login(email);

  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const consoleErrors = [];
  const newPage = async (width = 1366) => {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    page.on('pageerror', e => consoleErrors.push(e.message));
    return page;
  };

  // ---------- Chuẩn bị: doanh nghiệp đăng tin mới (chờ duyệt) ----------
  let jobId = null;
  const deadline = new Date(Date.now() + 20 * 864e5).toISOString().slice(0, 10);
  const created = await api('POST', '/jobs', S.employer.token, {
    title: jobTitle, description: 'Nhập liệu đơn hàng, đối soát bảng tính cho cửa hàng (kiểm thử tự động).',
    category: 'Hành chính / Văn phòng', location: '12 Nguyễn Văn Bảo, Gò Vấp, TP. Hồ Chí Minh',
    salary: 30000, salary_type: 'HOURLY', work_type: 'PART_TIME', headcount: 2, application_deadline: deadline,
  });
  jobId = created.data?.data?.id || created.data?.data?.job?.id || null;
  record('0', 'Chuẩn bị: Employer đăng tin mới qua API', jobId ? 'PASS' : 'FAIL', jobId ? `job #${jobId}` : JSON.stringify(created.data).slice(0, 200));
  if (!jobId) { await browser.close(); process.exit(1); }

  // ---------- 11. Admin kiểm duyệt tin (qua giao diện) ----------
  await step('11', 'Admin kiểm duyệt tin qua giao diện → tin chuyển OPEN', async () => {
    const page = await newPage();
    page.on('dialog', d => d.accept());
    await openTab(page, { session: S.admin, tab: 'admin', sub: { admin: 'moderation' } });
    const row = page.locator('tr', { hasText: jobTitle });
    await row.waitFor({ timeout: 15000 });
    await row.locator('button').last().click();
    // Quy trình mới: phải tick đủ tiêu chí duyệt thì nút "Phê duyệt tin" mới bật
    const criteria = page.locator('label:has(input[type="checkbox"])', { hasText: /Nội dung rõ ràng|Thù lao cụ thể|Địa điểm và ca|Đúng ngành nghề|Thông tin doanh nghiệp/ });
    await criteria.first().waitFor({ timeout: 10000 });
    for (const c of await criteria.all()) await c.locator('input').check();
    await page.getByRole('button', { name: /Phê duyệt tin/ }).click();
    for (let i = 0; i < 20; i++) {
      const j = await api('GET', `/jobs/${jobId}`);
      if ((j.data?.data?.status || j.data?.data?.job?.status) === 'OPEN') { await page.context().close(); return 'status=OPEN'; }
      await page.waitForTimeout(500);
    }
    throw new Error('Tin chưa chuyển sang OPEN sau khi bấm Phê duyệt');
  });

  // ---------- 1–5. Khách: danh sách → tìm → chi tiết → Ứng tuyển → đăng nhập → quay lại đúng tin ----------
  const guest = await newPage();
  await step('1', 'Guest xem trang chủ & danh sách việc làm', async () => {
    await guest.goto(BASE);
    await guest.locator('.jn-job-card').first().waitFor({ timeout: 15000 });
    await guest.getByRole('button', { name: 'Tìm việc làm', exact: true }).first().click();
    await guest.locator('.jn-job-card').first().waitFor({ timeout: 15000 });
    return `${await guest.locator('.jn-job-card').count()} thẻ việc làm`;
  });
  await step('1b', 'Guest tìm kiếm theo từ khóa', async () => {
    const box = guest.getByPlaceholder('Tìm kiếm theo vị trí, kỹ năng, công ty...');
    await box.fill(stamp);
    await box.press('Enter');
    await guest.locator('.jn-job-card', { hasText: jobTitle }).first().waitFor({ timeout: 15000 });
    return 'thấy tin vừa duyệt trong kết quả';
  });
  await step('2', 'Guest xem chi tiết công việc', async () => {
    await guest.locator('.jn-job-card', { hasText: jobTitle }).first().getByRole('button', { name: 'Xem chi tiết công việc' }).click();
    await guest.getByText(jobTitle).first().waitFor({ timeout: 15000 });
    await guest.getByRole('button', { name: /Ứng tuyển ngay/ }).first().waitFor({ timeout: 15000 });
  });
  await step('3-4', 'Guest bấm Ứng tuyển → chuyển sang Đăng nhập', async () => {
    await guest.getByRole('button', { name: /Ứng tuyển ngay/ }).first().click();
    await guest.locator('input[type="email"]').first().waitFor({ timeout: 10000 });
  });
  await step('5', 'Đăng nhập Sinh viên → quay lại đúng công việc đã chọn', async () => {
    await guest.locator('input[type="email"]').first().fill(ACC.student);
    await guest.locator('input[type="password"]').first().fill(PASSWORD);
    await guest.locator('form button[type="submit"]').first().click();
    await guest.getByRole('button', { name: /Ứng tuyển ngay/ }).first().waitFor({ timeout: 15000 });
    await guest.getByText(jobTitle).first().waitFor({ timeout: 5000 });
  });

  // ---------- 6–7. Hồ sơ đủ điều kiện → nộp đơn qua modal ----------
  await step('6', 'Sinh viên có hồ sơ hoàn thiện (điều kiện ứng tuyển)', async () => {
    const r = await api('GET', '/profile/me', S.student.token);
    const p = r.data?.data || {};
    assert(p.is_profile_completed || ((p.school || p.university) && p.major), 'Hồ sơ chưa hoàn thiện');
    return `trường=${p.school || p.university}, ngành=${p.major}`;
  });
  let appId = null;
  await step('7', 'Sinh viên gửi đơn ứng tuyển qua modal', async () => {
    await guest.getByRole('button', { name: /Ứng tuyển ngay/ }).first().click();
    const send = guest.getByRole('button', { name: /Gửi ứng tuyển/ });
    await send.waitFor({ timeout: 10000 });
    await send.click();
    for (let i = 0; i < 20; i++) {
      const r = await api('GET', '/applications/my-applications', S.student.token);
      const list = r.data?.data?.applications || r.data?.data || [];
      const a = list.find(x => Number(x.job_id) === Number(jobId));
      if (a) { appId = a.id; return `đơn #${a.id} trạng thái ${a.status}`; }
      await guest.waitForTimeout(500);
    }
    throw new Error('Không thấy đơn mới trong /applications/my-applications');
  });

  // ---------- 8–9. Doanh nghiệp xem & xử lý đơn ----------
  await step('8', 'Employer thấy đơn ứng tuyển (API + trang Ứng viên)', async () => {
    const r = await api('GET', `/applications/job/${jobId}`, S.employer.token);
    const list = r.data?.data?.applications || r.data?.data || [];
    assert(list.some(a => Number(a.id) === Number(appId)), 'Đơn không có trong danh sách ứng viên của tin');
    const page = await newPage();
    await openTab(page, { session: S.employer, tab: 'applicants' });
    await page.getByText(S.student.full_name).first().waitFor({ timeout: 15000 });
    await page.context().close();
    return 'tên sinh viên hiển thị trên trang Ứng viên';
  });
  // Ghi chú: nút "Từ chối" trong bảng này gửi thiếu lý do → backend trả 400 (lỗi có sẵn, xem
  // docs/JOBNEST_UI_UX_REGRESSION_REPORT.md). Bước này dùng nút "Rút gọn" (SHORTLISTED).
  await step('9', 'Employer bấm "Rút gọn" trên trang Ứng viên → đơn chuyển SHORTLISTED', async () => {
    const page = await newPage();
    page.on('dialog', d => d.accept());
    await openTab(page, { session: S.employer, tab: 'applicants' });
    const row = page.locator('tr', { hasText: S.student.full_name }).filter({ hasText: stamp });
    await row.first().waitFor({ timeout: 15000 });
    await row.first().getByRole('button', { name: 'Rút gọn' }).click();
    for (let i = 0; i < 20; i++) {
      const r = await api('GET', `/applications/${appId}`, S.student.token);
      const st = r.data?.data?.status || r.data?.data?.application?.status;
      if (st === 'SHORTLISTED') { await page.context().close(); return 'status=SHORTLISTED'; }
      await page.waitForTimeout(500);
    }
    throw new Error('Đơn chưa chuyển SHORTLISTED sau khi bấm Rút gọn');
  });
  await step('10', 'Sinh viên thấy trạng thái mới trên trang chi tiết đơn', async () => {
    const page = await newPage();
    await openTab(page, { session: S.student, tab: 'application_detail', sel: { applicationId: appId } });
    await page.getByText('Đã vào vòng rút gọn').first().waitFor({ timeout: 15000 });
    await page.context().close();
  });

  // ---------- 12. Phân quyền không đổi ----------
  await step('12', 'Phân quyền giữ nguyên (backend chặn sai vai trò)', async () => {
    const checks = [
      ['Student đổi trạng thái đơn', await api('PATCH', `/applications/${appId}/status`, S.student.token, { status: 'REJECTED' })],
      ['Employer nộp đơn', await api('POST', '/applications', S.employer.token, { job_id: jobId })],
      ['Student xem tin chờ duyệt (admin)', await api('GET', '/admin/jobs/pending', S.student.token)],
      ['Employer kiểm duyệt tin (admin)', await api('PATCH', `/admin/jobs/${jobId}/moderate`, S.employer.token, { moderation_status: 'APPROVED' })],
      ['Khách đăng tin', await api('POST', '/jobs', null, {})],
    ];
    const bad = checks.filter(([, r]) => ![401, 403].includes(r.status));
    assert(bad.length === 0, bad.map(([n, r]) => `${n}: HTTP ${r.status}`).join('; '));
    return checks.map(([n, r]) => `${n}=${r.status}`).join(', ');
  });

  // ---------- Kiểm tra mobile nhanh trên luồng chính ----------
  await step('M', 'Mobile 390px: trang chủ & chi tiết không tràn ngang', async () => {
    const page = await newPage(390);
    await openTab(page, { session: null, tab: 'home' });
    await page.locator('.jn-job-card').first().waitFor({ timeout: 15000 });
    const o1 = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    await openTab(page, { session: null, tab: 'job_detail', sel: { jobId } });
    await page.getByText(jobTitle).first().waitFor({ timeout: 15000 });
    const o2 = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert(o1 <= 0 && o2 <= 0, `overflow home=${o1}px, detail=${o2}px`);
    await page.context().close();
  });

  // ---------- Dọn dữ liệu: từ chối đơn kiểm thử (kèm lý do) và đóng tin ----------
  const rj = await api('PATCH', `/applications/${appId}/status`, S.employer.token, { status: 'REJECTED', reason: 'Dữ liệu kiểm thử tự động' });
  const c = await api('PATCH', `/jobs/${jobId}/status`, S.employer.token, { status: 'CLOSED' });
  record('C', 'Dọn dữ liệu (từ chối đơn kiểm thử, đóng tin)', 'INFO', `reject=${rj.status}, close=${c.status}`);

  await browser.close();
  record('E', 'Lỗi JavaScript trên trang (pageerror)', consoleErrors.length ? 'FAIL' : 'PASS', consoleErrors.slice(0, 3).join(' | '));
  const fail = results.filter(r => r.status === 'FAIL').length;
  console.log(`\nTỔNG: ${results.filter(r => r.status === 'PASS').length} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
