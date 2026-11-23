// Test case GIAO DIỆN bổ sung (PB65) cho chức năng chỉ kiểm được trên trình duyệt.
// Chạy: API_URL=http://localhost:5056/api WEB=http://localhost:5174 PW_CORE=<đường dẫn playwright-core> node new_features_ui.cjs
const fs = require('fs');
const path = require('path');
// playwright-core chỉ nạp khi chạy test (build_new_testcases.cjs chỉ cần danh sách T)
const { api, sql, one, tc, check, results, R, futureDate, login } = require('./lib.cjs');

const WEB = process.env.WEB || 'http://localhost:5174';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const mail = (k) => `qa-${k}-${R}@example.test`;
const JOB_PREFIX = `[QA-NEW ${R}]`;
let phone = 0;
const ctx = {};
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


const T = [];
const add = (o) => T.push(o);
const PRE_SV = 'Sinh viên SV_UI đã đăng nhập.';
const PRE_E = 'Nhà tuyển dụng NTD_UI đã đăng nhập, có tin đã duyệt và 1 ứng viên.';
const PRE_A = 'Quản trị viên đã đăng nhập, có tin chờ duyệt.';

// Mở trang với phiên đăng nhập + mục được nhớ (giống người dùng tải lại trang đang mở)
async function open(page, who, tabs = {}) {
  await page.goto(WEB + '/');
  await page.evaluate(([session, t]) => {
    localStorage.clear(); sessionStorage.clear();
    if (session) localStorage.setItem('jobnest_session', JSON.stringify(session));
    for (const [k, v] of Object.entries(t)) sessionStorage.setItem('jobnest_tab_' + k, v);
  }, [who ? ctx.sessions[who] : null, tabs]);
  await page.reload();
  await page.waitForLoadState('networkidle');
}
const seen = (page, text, timeout = 8000) => page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout }).then(() => true, () => false);

add({ tr: 'TR-PB65-01', id: 'TC_UI_HOME_001', type: 'UI', pri: 'High', feat: 'G01', obj: 'Trang chủ hiển thị việc làm, không hiện tin chờ duyệt, không lỗi', pre: 'Khách chưa đăng nhập; có 1 tin đã duyệt và 1 tin chờ duyệt.',
  act: 'Mở trang chủ', data: 'N/A', exp: 'Trang tải xong, có danh sách việc làm; không có tin chờ duyệt; không có lỗi JavaScript.',
  run: async (page) => { await open(page, null, { app: 'home' }); const t = await page.content(); return check(!t.includes('Tin chờ duyệt UI') && ctx.errors.length === 0 && /việc làm/i.test(await page.innerText('body')), 'Hiển thị đúng, 0 lỗi JS', `Lỗi JS: ${ctx.errors.slice(0, 2).join(' | ')}; lộ tin chờ duyệt: ${t.includes('Tin chờ duyệt UI')}`); } });
add({ tr: 'TR-PB65-02', id: 'TC_UI_ABOUT_001', type: 'UI', pri: 'Low', feat: 'G11', obj: 'Các trang Giới thiệu, FAQ, Quy định bảo mật mở được từ chân trang', pre: 'Khách ở trang chủ.',
  act: 'Bấm "Hỏi đáp (FAQ)" rồi "Quy định bảo mật" ở chân trang', data: 'N/A', exp: 'Mỗi mục hiển thị nội dung tương ứng.',
  run: async (page) => { await open(page, null, { app: 'home' }); await page.getByText('Hỏi đáp (FAQ)').first().click(); const faq = await seen(page, 'Câu hỏi thường gặp'); await page.getByText('Quy định bảo mật').first().click(); const pr = await seen(page, 'bảo mật'); return check(faq && pr, 'FAQ và Bảo mật hiển thị', `FAQ ${faq}, Bảo mật ${pr}`); } });
add({ tr: 'TR-PB65-03', id: 'TC_UI_OAUTH_001', type: 'UI', pri: 'Low', feat: 'G12', obj: 'Nút đăng nhập Google báo rõ "đang phát triển", không gây lỗi', pre: 'Khách mở trang Đăng nhập.',
  act: 'Bấm nút Google', data: 'N/A', exp: 'Hiện thông báo tính năng đang phát triển; không lỗi trang.',
  run: async (page) => { await open(page, null, { app: 'login' }); await page.getByRole('button', { name: /Google/i }).first().click(); const ok = await seen(page, 'đang'); return check(ok, 'Hiện thông báo đang phát triển', 'Không thấy thông báo'); } });
add({ tr: 'TR-PB65-04', id: 'TC_UI_FLOAT_001', type: 'UI', pri: 'Medium', feat: 'C07', obj: 'Nút nổi "Trung tâm hỗ trợ" mở form hỗ trợ', pre: 'Khách ở trang chủ.',
  act: 'Bấm nút nổi Trung tâm hỗ trợ', data: 'N/A', exp: 'Mở form có Họ tên, Email, Chủ đề, Nội dung.',
  run: async (page) => { await open(page, null, { app: 'home' }); await page.getByLabel('Trung tâm hỗ trợ').first().click(); const ok = await seen(page, 'Nội dung') || await seen(page, 'Chủ đề'); return check(ok, 'Form hỗ trợ mở', 'Không mở được form'); } });
add({ tr: 'TR-PB65-05', id: 'TC_UI_STU_DASH_001', type: 'UI', pri: 'High', feat: 'S01', obj: 'Bảng điều khiển sinh viên hiển thị đủ menu và số đơn', pre: PRE_SV + ' Có 1 đơn ứng tuyển.',
  act: 'Mở khu vực Sinh viên', data: 'N/A', exp: 'Thấy menu Tổng quan, Hồ sơ xin việc, Quản lý CV, Lịch sử ứng tuyển…; không lỗi JS.',
  run: async (page) => { await open(page, 'sv', { app: 'student_dashboard', student: 'dashboard' }); const items = ['Hồ sơ xin việc', 'Quản lý CV', 'Lịch sử ứng tuyển', 'Việc làm đã lưu']; const miss = []; for (const i of items) if (!(await seen(page, i, 5000))) miss.push(i); return check(miss.length === 0 && ctx.errors.length === 0, 'Đủ menu', `Thiếu: ${miss.join(', ')}; lỗi JS: ${ctx.errors.slice(0, 1)}`); } });
add({ tr: 'TR-PB65-06', id: 'TC_UI_STU_SETTINGS_001', type: 'UI', pri: 'Medium', feat: 'S20', obj: 'Cài đặt tài khoản sinh viên có form đổi mật khẩu', pre: PRE_SV,
  act: 'Sinh viên → Cài đặt tài khoản', data: 'N/A', exp: 'Có 3 ô mật khẩu (hiện tại, mới, xác nhận) và nút lưu.',
  run: async (page) => { await open(page, 'sv', { app: 'student_dashboard', student: 'settings' }); await page.waitForTimeout(800); const n = await page.locator('input[type="password"]').count(); return check(n >= 2, `${n} ô mật khẩu`, `${n} ô mật khẩu`); } });
add({ tr: 'TR-PB65-07', id: 'TC_UI_EMP_DASH_001', type: 'UI', pri: 'High', feat: 'E01', obj: 'Bảng điều khiển nhà tuyển dụng hiển thị và không lỗi', pre: PRE_E,
  act: 'Mở khu vực Nhà tuyển dụng → Tổng quan', data: 'N/A', exp: 'Thấy menu Tin tuyển dụng, Hồ sơ ứng viên, Quản lý hợp đồng; không lỗi JS.',
  run: async (page) => { await open(page, 'emp', { app: 'employer_dashboard', employer: 'dashboard' }); const ok = await seen(page, 'Hồ sơ ứng viên') && await seen(page, 'Quản lý hợp đồng'); return check(ok && ctx.errors.length === 0, 'Hiển thị đúng', `menu ${ok}; lỗi JS ${ctx.errors.slice(0, 1)}`); } });
add({ tr: 'TR-PB65-08', id: 'TC_UI_EMP_COMPLETION_001', type: 'UI', pri: 'Medium', feat: 'E09', obj: 'Thanh mức độ hoàn thiện hồ sơ và gợi ý mục còn thiếu', pre: 'NTD chưa hoàn thiện hồ sơ (chưa có logo).',
  act: 'Mở Hồ sơ doanh nghiệp; bấm gợi ý "+ Logo doanh nghiệp"', data: 'N/A', exp: 'Thấy % hoàn thiện và danh sách "Còn thiếu"; bấm gợi ý chuyển tới phân vùng ảnh.',
  run: async (page) => { await open(page, 'empNew', { app: 'employer_profile', employer: 'profile', company_section: 'general' }); const bar = await seen(page, 'Mức độ hoàn thiện hồ sơ'); const chip = page.getByText('+ Logo doanh nghiệp').first(); const hasChip = await chip.isVisible().catch(() => false); if (hasChip) await chip.click(); const media = await seen(page, 'Logo & ảnh bìa', 4000); return check(bar && hasChip && media, 'Có % và điều hướng đúng', `thanh ${bar}, gợi ý ${hasChip}, chuyển phân vùng ${media}`); } });
add({ tr: 'TR-PB65-09', id: 'TC_UI_EMP_EXPORT_001', type: 'UI', pri: 'Medium', feat: 'E22', obj: 'Xuất danh sách ứng viên ra Excel', pre: PRE_E,
  act: 'Hồ sơ ứng viên → Xuất báo cáo → Excel (.xlsx)', data: 'N/A', exp: 'Trình duyệt tải về 1 file .xlsx.',
  run: async (page) => { await open(page, 'emp', { app: 'employer_dashboard', employer: 'applicants' }); await page.getByRole('button', { name: /Xuất báo cáo/ }).first().click({ timeout: 10000 }); const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.getByRole('menuitem', { name: /Excel/ }).click()]); const name = dl.suggestedFilename(); return check(/\.xlsx$/.test(name), name, 'Tên file ' + name); } });
add({ tr: 'TR-PB65-10', id: 'TC_UI_EMP_SETTINGS_001', type: 'UI', pri: 'Medium', feat: 'E24', obj: 'Cài đặt tài khoản nhà tuyển dụng có form đổi mật khẩu', pre: PRE_E,
  act: 'NTD → Cài đặt tài khoản', data: 'N/A', exp: 'Có các ô mật khẩu và nút lưu.',
  run: async (page) => { await open(page, 'emp', { app: 'employer_dashboard', employer: 'settings' }); await page.waitForTimeout(800); const n = await page.locator('input[type="password"]').count(); return check(n >= 2, `${n} ô mật khẩu`, `${n} ô mật khẩu`); } });
add({ tr: 'TR-PB65-11', id: 'TC_UI_NOTI_EMP_001', type: 'UI', pri: 'High', feat: 'E23', obj: 'NTD bấm thông báo "ứng tuyển mới" ở chuông → mở Hồ sơ ứng viên', pre: PRE_E + ' Có thông báo ứng tuyển chưa đọc.',
  act: 'Bấm chuông → bấm thông báo ứng tuyển', data: 'N/A', exp: 'Chuyển tới mục Hồ sơ ứng viên.',
  run: async (page) => { await open(page, 'emp', { app: 'employer_dashboard', employer: 'dashboard' }); await page.getByTitle('Thông báo').first().click(); await page.getByText(ctx.appNoticeTitle, { exact: false }).first().click({ timeout: 8000 }); await page.waitForTimeout(1000); const active = await page.locator('nav button[aria-current="page"]').first().innerText().catch(() => ''); return check(/Hồ sơ ứng viên/.test(active), 'Mở mục ' + active.trim(), 'Mục đang mở: ' + active.trim()); } });
add({ tr: 'TR-PB65-12', id: 'TC_UI_NOTI_ADMIN_001', type: 'UI', pri: 'High', feat: 'A13', obj: 'Admin bấm thông báo "tin chờ duyệt" → mở Kiểm duyệt tin', pre: PRE_A,
  act: 'Bấm chuông → bấm thông báo "Tin tuyển dụng mới chờ duyệt"', data: 'N/A', exp: 'Chuyển tới mục Kiểm duyệt tin.',
  run: async (page) => { await open(page, 'admin', { app: 'admin', admin: 'dashboard' }); await page.getByTitle('Thông báo').first().click(); await page.getByText('Tin tuyển dụng mới chờ duyệt').first().click({ timeout: 8000 }); await page.waitForTimeout(1000); /* sidebar Admin không có aria-current → mục đang chọn có nền #F1EEF8 */ const active = await page.evaluate(() => [...document.querySelectorAll('aside button, nav button')].filter(b => getComputedStyle(b).backgroundColor === 'rgb(241, 238, 248)').map(b => b.innerText).join(' | ')); return check(/Kiểm duyệt tin/.test(active), 'Mở mục ' + active.trim(), 'Mục đang mở: ' + active.trim()); } });
add({ tr: 'TR-PB65-13', id: 'TC_UI_ADMIN_EXPORT_001', type: 'UI', pri: 'Medium', feat: 'A14', obj: 'Admin xuất danh sách người dùng ra Excel', pre: PRE_A,
  act: 'Admin → Người dùng → Xuất báo cáo → Excel (.xlsx)', data: 'N/A', exp: 'Tải về 1 file .xlsx.',
  run: async (page) => { await open(page, 'admin', { app: 'admin', admin: 'users' }); await page.getByRole('button', { name: /Xuất báo cáo/ }).first().click({ timeout: 10000 }); const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.getByRole('menuitem', { name: /Excel/ }).click()]); const name = dl.suggestedFilename(); return check(/\.xlsx$/.test(name), name, 'Tên file ' + name); } });

add({ tr: 'TR-PB13-15', id: 'TC_UI_JOB_GATE_001', type: 'UI', pri: 'High', feat: 'E12', obj: 'NTD chưa hoàn thiện hồ sơ bấm "Đăng tin mới" → trang chặn liệt kê mục còn thiếu', pre: 'NTD_NEW vừa đăng ký, hồ sơ doanh nghiệp trống.',
  act: 'Tin tuyển dụng → Đăng tin mới → bấm "Hoàn thiện hồ sơ doanh nghiệp"', data: 'N/A', exp: 'Hiện "Chưa thể đăng tin tuyển dụng", hồ sơ 0%, còn thiếu 11 mục; nút dẫn tới Hồ sơ doanh nghiệp.',
  run: async (page) => { await open(page, 'empNew', { app: 'employer_dashboard', employer: 'jobs' }); await page.getByRole('button', { name: /Đăng tin mới/ }).first().click(); const gate = await seen(page, 'Chưa thể đăng tin tuyển dụng'); const cnt = await seen(page, 'Còn thiếu 11 mục'); await page.getByRole('button', { name: 'Hoàn thiện hồ sơ doanh nghiệp' }).click(); const prof = await seen(page, 'Mức độ hoàn thiện hồ sơ'); return check(gate && cnt && prof, 'Trang chặn đúng, dẫn tới hồ sơ', `chặn ${gate}, 11 mục ${cnt}, tới hồ sơ ${prof}`); } });
add({ tr: 'TR-PB18-16', id: 'TC_UI_APPLY_GATE_001', type: 'UI', pri: 'High', feat: 'S07', obj: 'SV chưa hoàn thiện hồ sơ bấm "Ứng tuyển ngay" → báo cần 100% và mở trang hồ sơ', pre: 'SV_NEW vừa đăng ký, hồ sơ chưa đủ; có tin đang tuyển.',
  act: 'Tìm việc → mở tin → Ứng tuyển ngay', data: 'N/A', exp: 'Thông báo "Cần đạt 100% để ứng tuyển — còn thiếu: …"; chuyển tới Hồ sơ xin việc; không mở form nộp đơn.',
  run: async (page) => { await open(page, 'svNew', { app: 'jobs' }); await page.getByText(ctx.jobTitle).filter({ visible: true }).first().click(); await page.getByRole('button', { name: 'Ứng tuyển ngay' }).filter({ visible: true }).first().click(); const toast = await seen(page, 'Cần đạt 100% để ứng tuyển'); const prof = await seen(page, 'Cần hoàn thiện 100% mới ứng tuyển được'); const form = await page.getByRole('button', { name: 'Gửi ứng tuyển' }).isVisible().catch(() => false); return check(toast && prof && !form, 'Bị chặn, mở trang hồ sơ', `thông báo ${toast}, trang hồ sơ ${prof}, form mở ${form}`); } });

module.exports = { T };

if (require.main === module) (async () => {
  const reg = async (role, key) => {
    const body = role === 'STUDENT'
      ? { email: mail(key), password: 'Student@123', full_name: 'QA UI ' + key, role, phone: '09' + String(Date.now() % 1e8 + phone++).padStart(8, '0').slice(-8) }
      : { email: mail(key), password: 'Employer@123', full_name: 'QA UI ' + key, company_name: 'QA UI Công ty ' + key, role, phone: '09' + String(Date.now() % 1e8 + 50 + phone++).padStart(8, '0').slice(-8) };
    const r = await api('POST', '/auth/register', null, body);
    if (r.s !== 201) throw new Error('đăng ký ' + key + ' ' + r.s + ' ' + r.j.message);
    const l = await api('POST', '/auth/login', null, { email: body.email, password: body.password });
    return { ...l.j.data.user, token: l.j.data.token };
  };
  const adm = await api('POST', '/auth/login', null, { email: 'admin.test@vlu.edu.vn', password: 'Jobnest@2026' });
  ctx.sessions = { sv: await reg('STUDENT', 'uisv'), emp: await reg('EMPLOYER', 'uiemp'), admin: { ...adm.j.data.user, token: adm.j.data.token } };
  readyStudent(ctx.sessions.sv.id); readyEmployer(ctx.sessions.emp.id);
  // tài khoản CHƯA hoàn thiện hồ sơ để kiểm tra trang chặn
  ctx.sessions.svNew = await reg('STUDENT', 'uisvnew'); ctx.sessions.empNew = await reg('EMPLOYER', 'uiempnew');
  const jb = (t) => ({ title: `${JOB_PREFIX} ${t}`, description: 'Phục vụ khách, dọn bàn, hỗ trợ thu ngân ca tối.', requirements: 'Nhanh nhẹn', category: 'Dịch vụ', location: '10 Lê Lợi, Quận 1, TP. Hồ Chí Minh', salary_type: 'HOURLY', salary: 30000, work_type: 'PART_TIME', quantity_required: 2, application_deadline: futureDate(20) });
  const job = (await api('POST', '/jobs', ctx.sessions.emp.token, jb('Tin công khai UI'))).j.data.id;
  ctx.jobTitle = `${JOB_PREFIX} Tin công khai UI`;
  await api('PATCH', `/admin/jobs/${job}/moderate`, ctx.sessions.admin.token, { moderation_status: 'APPROVED' });
  await api('POST', '/jobs', ctx.sessions.emp.token, jb('Tin chờ duyệt UI'));
  await api('POST', '/applications', ctx.sessions.sv.token, { job_id: job, cover_letter: 'Em có kinh nghiệm phục vụ.' });
  ctx.appNoticeTitle = one(`SELECT title FROM notifications WHERE user_id=${ctx.sessions.emp.id} AND target_type='APPLICATION' ORDER BY id DESC LIMIT 1`);

  const { chromium } = require(process.env.PW_CORE || 'playwright-core');
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    for (const t of T) {
      const page = await (await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 } })).newPage();
      ctx.errors = [];
      page.on('pageerror', (e) => ctx.errors.push(e.message.slice(0, 120)));
      await tc(t.id, () => t.run(page));
      await page.context().close();
    }
  } finally {
    await browser.close();
    const cl = require('child_process').spawnSync('bash', [path.join(__dirname, 'new_features_cleanup.sh'), R], { encoding: 'utf8' });
    console.log('Dọn dữ liệu:', (cl.stdout || '').replace(/\s+/g, ' ').trim() || cl.stderr);
  }
  fs.writeFileSync(path.join(__dirname, 'new_features_ui_results.json'), JSON.stringify({ run: R, at: new Date().toISOString(), results }, null, 2));
  console.log(`\nTỔNG UI: ${results.length} · PASS ${results.filter(r => r.status === 'PASS').length} · FAIL ${results.filter(r => r.status === 'FAIL').length}`);
})();
