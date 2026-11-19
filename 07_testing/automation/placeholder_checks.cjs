// Thay 6 case trước đây "pass" không có kiểm tra thật bằng kiểm tra thực tế
const { chromium } = require('playwright-core');
const { api, sql, one, tc, check, results, login, futureDate } = require('./lib.cjs');
const R = 'ph' + Date.now().toString(36);
const mail = (k) => `qa-${k}-${R}@example.test`;
const phone = () => '09' + String(Date.now() + Math.floor(Math.random() * 1e5)).slice(-8);
const wait = (ms) => new Promise(s => setTimeout(s, ms));
(async () => {
  for (const k of ['sv']) await api('POST', '/auth/register', null, { email: mail(k), password: 'Student@123', full_name: 'QA SV', phone: phone(), role: 'STUDENT' });
  for (const k of ['e1', 'e2']) await api('POST', '/auth/register', null, { email: mail(k), password: 'Employer@123', full_name: 'QA NTD ' + k, phone: phone(), role: 'EMPLOYER', company_name: 'QA Co ' + k + R });
  const S = await login(mail('sv'), 'Student@123'), E1 = await login(mail('e1'), 'Employer@123'), E2 = await login(mail('e2'), 'Employer@123');

  // ---- Đăng xuất 2 lần với cùng token ----
  const twice = async (email, pw) => {
    const s = await login(email, pw);
    const a = await api('POST', '/auth/logout', s.token);
    const b = await api('POST', '/auth/logout', s.token);
    const me = await api('GET', '/auth/me', s.token);
    const leaked = JSON.stringify(b.j).match(/eyJ[\w-]+\.[\w-]+/);
    return { a: a.s, b: b.s, me: me.s, leaked: !!leaked };
  };
  for (const [id, email, pw] of [['TC_LOGOUT_STU_006', mail('sv'), 'Student@123'], ['TC_LOGOUT_EMP_006', mail('e1'), 'Employer@123'], ['TC_LOGOUT_ADM_006', 'admin.test@vlu.edu.vn', 'Jobnest@2026']]) {
    await tc(id, async () => { const r = await twice(email, pw); await wait(1100); return check(r.a === 200 && r.b === 401 && r.me === 401 && !r.leaked, `Lần 1: 200; lần 2: ${r.b} (từ chối an toàn, không cấp token mới); token cũ /auth/me ${r.me}`, JSON.stringify(r)); });
  }

  // ---- Chỉ NTD sở hữu tin được đánh giá sinh viên đã làm ----
  const s2 = await login(mail('sv'), 'Student@123'), e1 = await login(mail('e1'), 'Employer@123'), e2 = await login(mail('e2'), 'Employer@123');
  sql(`UPDATE employer_profiles SET verification_status='VERIFIED' WHERE user_id IN (${E1.id},${E2.id}); UPDATE student_profiles SET school='Đại học Văn Lang', major='CNTT' WHERE user_id=${S.id};`);
  const job = (await api('POST', '/jobs', e1.token, { title: `[QA-AUTO ${R}] Phục vụ`, description: 'Mô tả công việc kiểm thử đủ dài', category: 'Bán lẻ', location: 'TP. Hồ Chí Minh', salary: 30000, salary_type: 'HOURLY', work_type: 'PART_TIME', application_deadline: futureDate(20) })).j.data.id;
  sql(`UPDATE jobs SET moderation_status='APPROVED' WHERE id=${job}`);
  const app = (await api('POST', '/applications', s2.token, { job_id: job, cover_letter: 'Em muốn ứng tuyển.' })).j.data.id;
  await api('POST', `/jobs/${job}/selections`, e1.token, { applicationIds: [app] });
  const asg = one(`SELECT id FROM work_assignments WHERE application_id=${app}`);
  await api('PATCH', `/assignments/${asg}/status`, e1.token, { status: 'IN_PROGRESS' });
  await api('PATCH', `/assignments/${asg}/status`, e1.token, { status: 'COMPLETED' });
  await tc('TC_REVIEW_STU_002', async () => {
    const other = await api('POST', '/reviews', e2.token, { job_id: job, reviewee_id: S.id, rating: 4, comment: 'NTD khác đánh giá' });
    const owner = await api('POST', '/reviews', e1.token, { job_id: job, reviewee_id: S.id, rating: 5, comment: 'Làm việc chăm chỉ, đúng giờ' });
    const n = one(`SELECT count(*) FROM reviews WHERE job_id=${job} AND reviewee_id=${S.id}`);
    return check(other.s >= 400 && owner.s === 201 && n === '1', `NTD khác: ${other.s}; chủ tin: 201; chỉ 1 đánh giá trong phạm vi tin`, `khác=${other.s} chủ=${owner.s} số đánh giá=${n}`);
  });

  // ---- Admin chỉ có thao tác đã thống nhất (khóa/mở khóa, tick xác thực, ghi vi phạm) ----
  const A = await login('admin.test@vlu.edu.vn', 'Jobnest@2026');
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  await tc('TC_USER_ADMIN_003', async () => {
    const del = await api('DELETE', `/admin/users/${S.id}`, A.token);
    const role = await api('PATCH', `/admin/users/${S.id}/role`, A.token, { role: 'ADMIN' });
    const p = await (await b.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
    await p.addInitScript(s => localStorage.setItem('jobnest_session', s), JSON.stringify({ ...(await api('POST', '/auth/login', null, { email: 'admin.test@vlu.edu.vn', password: 'Jobnest@2026' })).j.data.user, token: A.token }));
    await p.goto('http://localhost:5173'); await p.waitForTimeout(2000);
    const ws = p.locator('header button', { hasText: /Trang quản lý|Bảng Quản trị/ }); if (await ws.count()) { await ws.first().click(); await p.waitForTimeout(1500); }
    await p.getByText('Người dùng', { exact: true }).first().click(); await p.waitForTimeout(2000);
    const labels = (await p.locator('main button, table button').allInnerTexts()).map(t => t.trim()).filter(Boolean);
    const bad = labels.filter(t => /xóa|xoá|đổi vai trò|cấp quyền admin|delete/i.test(t));
    await p.screenshot({ path: __dirname + '/ui_admin_users.png' });
    return check(del.s === 404 && role.s === 404 && bad.length === 0 && one(`SELECT role FROM users WHERE id=${S.id}`) === 'STUDENT',
      `Không có API xóa / đổi vai trò (404); giao diện không có nút ngoài phạm vi (${[...new Set(labels)].slice(0, 6).join(', ')}…)`, `del=${del.s} role=${role.s} nút lạ=${bad.join('|')}`);
  });

  // ---- Form quên mật khẩu từ màn hình đăng nhập Nhà tuyển dụng ----
  await tc('TC_RESET_EMP_001', async () => {
    const p = await (await b.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
    await p.goto('http://localhost:5173'); await p.waitForTimeout(2000);
    await p.locator('header').getByText('Dành cho nhà tuyển dụng', { exact: false }).first().click().catch(() => {}); await p.waitForTimeout(1200);
    await p.locator('header').getByText('Đăng nhập', { exact: false }).first().click(); await p.waitForTimeout(1200);
    await p.getByText('Quên mật khẩu', { exact: false }).first().click(); await p.waitForTimeout(800);
    const email = await p.locator('input[type=email]').count();
    const btn = await p.getByRole('button', { name: 'Gửi mã xác nhận' }).count();
    await p.screenshot({ path: __dirname + '/ui_reset_emp.png' });
    return check(email > 0 && btn > 0, 'Từ trang Nhà tuyển dụng → Đăng nhập → Quên mật khẩu: có ô Email khôi phục và nút Gửi mã xác nhận', `email=${email} btn=${btn}`);
  });
  await b.close();

  sql(`DELETE FROM jobs WHERE title LIKE '[QA-AUTO ${R}%'; DELETE FROM notifications WHERE user_id IN (${S.id},${E1.id},${E2.id}); DELETE FROM users WHERE email LIKE 'qa-%-${R}@example.test';`);
  require('fs').writeFileSync(__dirname + '/placeholder_checks.json', JSON.stringify(results, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
