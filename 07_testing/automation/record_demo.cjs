// Quay video kiểm thử giao diện JobNest theo 4 vai trò (Khách, Sinh viên, Nhà tuyển dụng, Admin).
// Mỗi bước có phụ đề ở cuối màn hình; bước lỗi hiện rõ lỗi trên video và trong log.
// Chạy: API_URL=http://localhost:5056/api WEB=http://localhost:5174 PW_CORE=<playwright-core> node record_demo.cjs
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require(process.env.PW_CORE || 'playwright-core');
const { api, sql, one, R, futureDate } = require('./lib.cjs');

const WEB = process.env.WEB || 'http://localhost:5174';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.join(__dirname, '..', 'videos');
const mail = (k) => `qa-${k}-${R}@example.test`;
const TAG = `(Demo ${R})`;
const SIZE = { width: 1280, height: 720 };
const log = [];
// Hồ sơ 100% (SV 11 mục; NTD 11 mục + đã xác minh) — điều kiện ứng tuyển / đăng tin
const readyStudent = (id) => sql(`UPDATE users SET phone = COALESCE(phone, '0901234567') WHERE id=${id};
  UPDATE student_profiles SET date_of_birth='2004-05-12', gender='Nam', province='TP. Hồ Chí Minh', ward='Phường Bến Nghé', school='Đại học Văn Lang',
  major='Công nghệ thông tin', bio='Sinh viên năm 3, chăm chỉ.', desired_position='Nhân viên phục vụ', skills=ARRAY['Giao tiếp'],
  languages='[{"language":"Tiếng Anh","level":"Giao tiếp"}]'::jsonb WHERE user_id=${id};`);
const readyEmployer = (id) => sql(`UPDATE employer_profiles SET avatar_url='/api/files/1', cover_url='/api/files/2',
  office_images='["/api/files/1","/api/files/2","/api/files/3"]'::jsonb, industry='Dịch vụ', company_size='10 – 49 nhân viên', province='TP. Hồ Chí Minh',
  detailed_address='10 Lê Lợi, Quận 1', bio='Chuỗi cà phê dành cho sinh viên.', work_environment_desc='Thân thiện, linh hoạt ca.',
  hr_policy_details='{"internship":"Có xác nhận thực tập","training":"Kèm cặp 1 tuần"}'::jsonb, public_email='tuyendung@example.test',
  latitude=10.7769, longitude=106.7009, verification_status='VERIFIED' WHERE user_id=${id};`);


// Phụ đề: lưu ở sessionStorage để còn hiện sau khi tải lại trang.
// Đặt trong shadow DOM ĐÓNG → bộ chọn của Playwright (getByText…) không nhìn thấy, không bấm nhầm vào phụ đề.
const CAPTION_INIT = () => {
  let el = null;
  const draw = () => {
    const text = sessionStorage.getItem('qa_cap');
    if (!text || !document.body) return;
    if (!el || !el.isConnected) {
      const host = document.createElement('div');
      host.style.cssText = 'position:fixed;left:0;right:0;bottom:18px;z-index:2147483647;pointer-events:none;display:flex;justify-content:center';
      const root = host.attachShadow({ mode: 'closed' });
      el = document.createElement('div');
      el.style.cssText = 'max-width:92%;background:rgba(41,38,58,.92);color:#fff;font:600 17px/1.45 system-ui,Segoe UI,sans-serif;'
        + 'padding:10px 18px;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.35);text-align:center;border-left:6px solid #F4B99D';
      root.appendChild(el);
      document.body.appendChild(host);
      el._host = host;
    }
    if (el.textContent !== text) el.textContent = text;
    el.style.borderLeftColor = text.startsWith('✖') ? '#DC2626' : text.startsWith('✔') ? '#16A34A' : '#F4B99D';
  };
  window.__qaCapDraw = draw;
  document.addEventListener('DOMContentLoaded', draw);
  setInterval(draw, 400);
};
const cap = (page, text) => page.evaluate((t) => { sessionStorage.setItem('qa_cap', t); if (window.__qaCapDraw) window.__qaCapDraw(); }, text).catch(() => {});
const pause = (page, ms = 1800) => page.waitForTimeout(ms);

async function step(page, video, name, fn) {
  await cap(page, `▶ ${name}`);
  try {
    const note = await fn();
    await cap(page, `✔ ${name}${note ? ' — ' + note : ''}`);
    log.push({ video, step: name, ok: true, note: note || '' });
    await pause(page, 1600);
  } catch (e) {
    const msg = e.message.split('\n')[0].slice(0, 140);
    if (process.env.DEBUG_STEPS) console.log(`--- ${name}\n${e.message.split('\n').slice(0, 14).join('\n')}`);
    await cap(page, `✖ ${name} — LỖI: ${msg}`);
    log.push({ video, step: name, ok: false, note: msg });
    await page.screenshot({ path: path.join(OUT, `LOI_${video}_${log.length}.png`) }).catch(() => {});
    await pause(page, 3000);
  }
}
// Đi tới mục trong app (giống người dùng đang ở mục đó rồi tải lại trang)
async function go(page, tabs) {
  await page.evaluate((t) => { for (const [k, v] of Object.entries(t)) sessionStorage.setItem('jobnest_tab_' + k, v); }, tabs);
  await page.reload();
  await page.waitForLoadState('networkidle');
}
async function loginUI(page, email, password) {
  await page.goto(WEB + '/');
  await go(page, { app: 'login' });
  await page.getByPlaceholder('name@sinhvien.vlu.edu.vn hoặc email doanh nghiệp').fill(email);
  await page.getByPlaceholder('Nhập mật khẩu').fill(password);
  await pause(page, 600);
  await page.getByPlaceholder('Nhập mật khẩu').press('Enter');
  await page.waitForFunction(() => Boolean(localStorage.getItem('jobnest_session')), null, { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}
const sidebar = (page, label) => page.locator('aside button, nav button').filter({ hasText: label }).first().click();
const visible = (page, text, timeout = 8000) => page.getByText(text, { exact: false }).filter({ visible: true }).first().waitFor({ state: 'visible', timeout });

async function record(browser, name, fn) {
  const context = await browser.newContext({ viewport: SIZE, recordVideo: { dir: OUT, size: SIZE }, acceptDownloads: true, locale: 'vi-VN' });
  await context.addInitScript(CAPTION_INIT);
  const page = await context.newPage();
  page.on('pageerror', (e) => log.push({ video: name, step: 'Lỗi JavaScript trên trang', ok: false, note: e.message.slice(0, 140) }));
  try { await fn(page); } finally {
    await cap(page, `Kết thúc video: ${name}`);
    await pause(page, 1500);
    const v = page.video();
    await context.close();
    const target = path.join(OUT, `${name}.webm`);
    fs.renameSync(await v.path(), target);
    console.log('🎬', target);
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  // ---------- Dữ liệu demo ----------
  const reg = async (body) => { const r = await api('POST', '/auth/register', null, body); if (r.s !== 201) throw new Error('Đăng ký lỗi ' + r.s + ' ' + r.j.message); };
  const SV = { email: mail('demosv'), password: 'Student@123' };
  const NTD = { email: mail('demontd'), password: 'Employer@123' };
  await reg({ ...SV, full_name: 'Nguyễn Minh An', role: 'STUDENT', phone: '09' + String(Date.now()).slice(-8) });
  await reg({ ...NTD, full_name: 'Trần Thị Bình', company_name: 'Cà phê Sài Gòn Xanh', role: 'EMPLOYER', phone: '08' + String(Date.now() + 7).slice(-8) });
  const svId = one(`SELECT id FROM users WHERE email='${SV.email}'`);
  readyStudent(svId);
  const ntdLogin = (await api('POST', '/auth/login', null, NTD)).j.data;
  readyEmployer(ntdLogin.user.id);
  const admin = (await api('POST', '/auth/login', null, { email: 'admin.test@vlu.edu.vn', password: 'Jobnest@2026' })).j.data;
  const job = (t, d) => ({ title: `${t} ${TAG}`, description: d, requirements: 'Nhanh nhẹn, giao tiếp tốt', category: 'Dịch vụ', location: '10 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    salary_type: 'HOURLY', salary: 30000, work_type: 'PART_TIME', quantity_required: 2, application_deadline: futureDate(20) });
  const jobTitle = `Nhân viên phục vụ quán cà phê ${TAG}`;
  const j1 = (await api('POST', '/jobs', ntdLogin.token, job('Nhân viên phục vụ quán cà phê', 'Phục vụ khách, pha chế đồ uống cơ bản, ca tối 18h–22h.'))).j.data.id;
  await api('PATCH', `/admin/jobs/${j1}/moderate`, admin.token, { moderation_status: 'APPROVED' });
  await api('POST', '/jobs', ntdLogin.token, job('Trợ giảng tiếng Anh cuối tuần', 'Hỗ trợ giáo viên lớp thiếu nhi sáng thứ 7, chủ nhật.'));

  const browser = await chromium.launch({ executablePath: CHROME, headless: true, slowMo: 120 });
  try {
    // ================= 1. KHÁCH =================
    await record(browser, '01_Khach_chua_dang_nhap', async (page) => {
      await page.goto(WEB + '/');
      await page.waitForLoadState('networkidle');
      await step(page, 'Khách', 'Trang chủ hiển thị việc làm', async () => { await visible(page, 'việc làm'); await page.mouse.wheel(0, 900); await pause(page, 1200); await page.mouse.wheel(0, -900); });
      await step(page, 'Khách', 'Tìm việc: thấy tin vừa được duyệt', async () => { await go(page, { app: 'jobs' }); await visible(page, jobTitle, 10000); });
      await step(page, 'Khách', 'Tin chờ duyệt KHÔNG hiển thị cho khách', async () => { const n = await page.getByText(`Trợ giảng tiếng Anh cuối tuần ${TAG}`).count(); if (n) throw new Error('Tin chờ duyệt đang bị hiển thị'); });
      await step(page, 'Khách', 'Mở chi tiết tin tuyển dụng', async () => { await page.getByText(jobTitle).filter({ visible: true }).first().click(); await visible(page, 'Phục vụ khách, pha chế'); await page.mouse.wheel(0, 700); await pause(page, 1200); });
      await step(page, 'Khách', 'Chân trang → Hỏi đáp (FAQ)', async () => { await go(page, { app: 'home' }); await page.getByText('Hỏi đáp (FAQ)').first().click(); await visible(page, 'Câu hỏi thường gặp'); });
      await step(page, 'Khách', 'Nút "Trung tâm hỗ trợ" mở form gửi yêu cầu', async () => { await page.getByLabel('Trung tâm hỗ trợ').first().click(); await visible(page, 'Chủ đề'); await pause(page, 1200); await page.keyboard.press('Escape'); });
      await step(page, 'Khách', 'Đăng nhập Google: báo "đang phát triển" (GAP-01)', async () => { await go(page, { app: 'login' }); await page.getByRole('button', { name: /Google/i }).first().click(); await visible(page, 'đang'); return 'chức năng chưa làm'; });
    });

    // ================= 2. SINH VIÊN =================
    await record(browser, '02_Sinh_vien', async (page) => {
      await step(page, 'Sinh viên', 'Đăng nhập bằng email + mật khẩu', async () => { await loginUI(page, SV.email, SV.password); });
      await step(page, 'Sinh viên', 'Bảng điều khiển sinh viên', async () => { await go(page, { app: 'student_dashboard', student: 'dashboard' }); await visible(page, 'Lịch sử ứng tuyển'); });
      await step(page, 'Sinh viên', 'Hồ sơ xin việc', async () => { await sidebar(page, 'Hồ sơ xin việc'); await visible(page, 'Đại học Văn Lang'); });
      await step(page, 'Sinh viên', 'Lịch rảnh & Gợi ý AI', async () => { await sidebar(page, 'Lịch rảnh'); await pause(page, 1500); });
      await step(page, 'Sinh viên', 'Tìm việc → mở tin → bấm "Ứng tuyển ngay"', async () => { await go(page, { app: 'jobs' }); await page.getByText(jobTitle).filter({ visible: true }).first().click(); await page.getByText('Ứng tuyển ngay').filter({ visible: true }).first().click(); await visible(page, 'Đơn ứng tuyển công việc'); });
      await step(page, 'Sinh viên', 'Nhập thư giới thiệu và nộp hồ sơ', async () => {
        await page.getByPlaceholder('Giới thiệu về kỹ năng, kinh nghiệm và thời gian bạn có thể làm việc...').fill('Em là sinh viên năm 3, từng phục vụ quán cà phê 6 tháng, rảnh các buổi tối trong tuần.');
        await page.getByRole('button', { name: 'Gửi ứng tuyển' }).click();
        await visible(page, 'Nộp hồ sơ ứng tuyển thành công');
      });
      await step(page, 'Sinh viên', 'Nộp lại lần 2 → hệ thống chặn đơn trùng', async () => { await page.getByText('Ứng tuyển ngay').filter({ visible: true }).first().click().catch(() => {}); await pause(page, 1500); const n = Number(one(`SELECT count(*) FROM applications WHERE student_id=${svId} AND job_id=${j1}`)); if (n !== 1) throw new Error(`Có ${n} đơn`); await page.keyboard.press('Escape'); return 'vẫn chỉ 1 đơn'; });
      await step(page, 'Sinh viên', 'Lịch sử ứng tuyển có đơn vừa nộp (Chờ duyệt)', async () => { await go(page, { app: 'student_dashboard', student: 'applications' }); await visible(page, 'Nhân viên phục vụ quán cà phê'); });
      await step(page, 'Sinh viên', 'Cài đặt tài khoản: form đổi mật khẩu', async () => { await sidebar(page, 'Cài đặt tài khoản'); await page.locator('input[type="password"]').first().waitFor(); });
    });

    // ================= 3. NHÀ TUYỂN DỤNG =================
    await record(browser, '03_Nha_tuyen_dung', async (page) => {
      await step(page, 'NTD', 'Đăng nhập nhà tuyển dụng', async () => { await loginUI(page, NTD.email, NTD.password); });
      await step(page, 'NTD', 'Tổng quan nhà tuyển dụng', async () => { await go(page, { app: 'employer_dashboard', employer: 'dashboard' }); await visible(page, 'Quản lý hợp đồng'); });
      await step(page, 'NTD', 'Hồ sơ doanh nghiệp: thanh mức độ hoàn thiện', async () => { await sidebar(page, 'Hồ sơ doanh nghiệp'); await visible(page, 'Mức độ hoàn thiện hồ sơ'); });
      await step(page, 'NTD', 'Hồ sơ đạt 100% và đã xác minh (điều kiện để đăng tin)', async () => { await visible(page, '100%'); });
      await step(page, 'NTD', 'Phân vùng Chi nhánh', async () => { await page.getByRole('tab', { name: /Chi nhánh/ }).click(); await visible(page, 'Thêm chi nhánh'); });
      await step(page, 'NTD', 'Tin tuyển dụng: tin đã duyệt và tin chờ duyệt', async () => { await sidebar(page, 'Tin tuyển dụng'); await visible(page, 'Trợ giảng tiếng Anh cuối tuần'); });
      await step(page, 'NTD', 'Bấm "Đăng tin mới" → mở được form đăng tin (hồ sơ đã đủ điều kiện)', async () => { await page.getByRole('button', { name: /Đăng tin mới/ }).first().click(); await visible(page, 'Đăng tin tuyển dụng mới'); await sidebar(page, 'Tin tuyển dụng'); });
      await step(page, 'NTD', 'Chuông → thông báo ứng tuyển mới → mở Hồ sơ ứng viên', async () => {
        await page.getByTitle('Thông báo').first().click(); await pause(page, 1200);
        const t = one(`SELECT title FROM notifications WHERE user_id=${ntdLogin.user.id} AND target_type='APPLICATION' ORDER BY id DESC LIMIT 1`);
        await page.getByText(t).first().click(); await pause(page, 1200);
        const active = await page.locator('nav button[aria-current="page"]').first().innerText();
        if (!/Hồ sơ ứng viên/.test(active)) throw new Error('Đang ở mục ' + active);
      });
      await step(page, 'NTD', 'Thấy ứng viên Nguyễn Minh An', async () => { await visible(page, 'Nguyễn Minh An', 10000); });
      await step(page, 'NTD', 'Xuất danh sách ứng viên ra Excel', async () => {
        await page.getByRole('button', { name: /Xuất báo cáo/ }).first().click();
        const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.getByRole('menuitem', { name: /Excel/ }).click()]);
        return dl.suggestedFilename();
      });
      await step(page, 'NTD', 'Mục Đánh giá từ ứng viên', async () => { await sidebar(page, 'Đánh giá'); await pause(page, 1500); });
    });

    // ================= 4. ADMIN =================
    await record(browser, '04_Quan_tri_vien', async (page) => {
      await step(page, 'Admin', 'Đăng nhập quản trị viên', async () => { await loginUI(page, 'admin.test@vlu.edu.vn', 'Jobnest@2026'); });
      await step(page, 'Admin', 'Tổng quan thống kê', async () => { await go(page, { app: 'admin', admin: 'dashboard' }); await pause(page, 1500); });
      await step(page, 'Admin', 'Chuông → "Tin tuyển dụng mới chờ duyệt" → mở Kiểm duyệt tin', async () => {
        await page.getByTitle('Thông báo').first().click(); await pause(page, 1200);
        await page.getByText('Tin tuyển dụng mới chờ duyệt').first().click(); await pause(page, 1200);
        await visible(page, 'Trợ giảng tiếng Anh cuối tuần');
      });
      await step(page, 'Admin', 'Xác minh doanh nghiệp', async () => { await sidebar(page, 'Xác minh doanh nghiệp'); await pause(page, 1500); });
      await step(page, 'Admin', 'Quản lý người dùng: tìm tài khoản demo', async () => { await sidebar(page, 'Người dùng'); await page.getByPlaceholder('Tìm theo email, họ tên, số điện thoại...').fill('Nguyễn Minh An'); await visible(page, mail('demosv')); });
      await step(page, 'Admin', 'Báo cáo vi phạm', async () => { await sidebar(page, 'Báo cáo'); await pause(page, 1500); });
      await step(page, 'Admin', 'Kiểm duyệt đánh giá', async () => { await sidebar(page, 'Kiểm duyệt đánh giá'); await pause(page, 1500); });
      await step(page, 'Admin', 'Hỗ trợ liên hệ', async () => { await sidebar(page, 'Hỗ trợ liên hệ'); await pause(page, 1500); });
      await step(page, 'Admin', 'Nhật ký hệ thống (có lượt duyệt tin vừa rồi)', async () => { await sidebar(page, 'Nhật ký hệ thống'); await pause(page, 1800); });
    });
  } finally {
    await browser.close();
    // Dọn dữ liệu demo: tin trước, rồi tài khoản (+ thông báo mồ côi)
    try { sql(`DELETE FROM jobs WHERE title LIKE '%${TAG}';`); } catch (e) { console.log('dọn tin:', e.message.slice(0, 120)); }
    const cl = spawnSync('bash', [path.join(__dirname, 'new_features_cleanup.sh'), R], { encoding: 'utf8' });
    console.log('Dọn dữ liệu:', (cl.stdout || '').replace(/\s+/g, ' ').trim() || cl.stderr);
  }
  fs.writeFileSync(path.join(OUT, 'ket_qua_quay_video.json'), JSON.stringify({ run: R, at: new Date().toISOString(), steps: log }, null, 2));
  console.log('\nBƯỚC:', log.length, '· ĐẠT', log.filter(l => l.ok).length, '· LỖI', log.filter(l => !l.ok).length);
  for (const l of log.filter(x => !x.ok)) console.log('✖', l.video, '|', l.step, '|', l.note);
})();
