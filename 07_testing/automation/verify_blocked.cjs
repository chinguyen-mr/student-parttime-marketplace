// Chạy các case trước đây BLOCKED: mô phỏng lỗi DB bằng trigger tạm thời, hàng đợi rỗng, form đánh giá, khiếu nại "Đang xử lý"
const fs = require('fs');
const { chromium } = require('playwright-core');
const { api, sql, one, tc, pass, fail, check, results, login, futureDate } = require('./lib.cjs');
const WEB = 'http://localhost:5173';
const R = 'bl' + Date.now().toString(36);
const mail = (k) => `qa-${k}-${R}@example.test`;
const phone = () => '09' + String(Date.now() + Math.floor(Math.random() * 1e5)).slice(-8);
const wait = (ms) => new Promise(s => setTimeout(s, ms));
const notiCount = (uid, since) => one(`SELECT count(*) FROM notifications WHERE user_id=${uid} AND created_at >= '${since}'`);
const dbNow = () => one(`SELECT NOW()::timestamp(6)::text`);
const FAULT_FN = `CREATE OR REPLACE FUNCTION qa_fault() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'QA fault injection'; END $$ LANGUAGE plpgsql;`;
const withFault = async (table, cond, fn) => {
  sql(`${FAULT_FN} DROP TRIGGER IF EXISTS qa_fault_trg ON ${table}; CREATE TRIGGER qa_fault_trg BEFORE UPDATE ON ${table} FOR EACH ROW WHEN (${cond}) EXECUTE FUNCTION qa_fault();`);
  try { return await fn(); } finally { sql(`DROP TRIGGER IF EXISTS qa_fault_trg ON ${table};`); }
};
const mailCode = async (to) => {
  for (let i = 0; i < 12; i++) {
    const r = await fetch('http://localhost:8025/api/v1/search?query=' + encodeURIComponent('to:' + to)).then(x => x.json()).catch(() => null);
    const m = r?.messages?.[0];
    if (m) { const t = (await fetch('http://localhost:8025/api/v1/message/' + m.ID).then(x => x.json())).Text; return (t.match(/\b(\d{6})\b/) || [])[1]; }
    await wait(500);
  }
  return null;
};

(async () => {
  // ---- Dữ liệu thử ----
  await api('POST', '/auth/register', null, { email: mail('emp'), password: 'Employer@123', full_name: 'QA NTD', phone: phone(), role: 'EMPLOYER', company_name: 'QA Co ' + R });
  await api('POST', '/auth/register', null, { email: mail('sv'), password: 'Student@123', full_name: 'QA Sinh Viên', phone: phone(), role: 'STUDENT' });
  await api('POST', '/auth/register', null, { email: mail('ban'), password: 'Student@123', full_name: 'QA Bị Khóa', phone: phone(), role: 'STUDENT' });
  const E = await login(mail('emp'), 'Employer@123');
  const S = await login(mail('sv'), 'Student@123');
  const A = await login('admin.test@vlu.edu.vn', 'Jobnest@2026');
  sql(`UPDATE employer_profiles SET verification_status='VERIFIED' WHERE user_id=${E.id}; UPDATE student_profiles SET school='Đại học Văn Lang', major='CNTT' WHERE user_id=${S.id};`);
  const cj = await api('POST', '/jobs', E.token, { title: `[QA-AUTO ${R}] Phục vụ ca sáng`, description: 'Mô tả công việc kiểm thử đủ dài', category: 'Nhà hàng / Khách sạn', location: 'TP. Hồ Chí Minh', salary: 30000, salary_type: 'HOURLY', work_type: 'PART_TIME', headcount: 2, application_deadline: futureDate(20) });
  const jobId = cj.j.data.id;
  sql(`UPDATE jobs SET moderation_status='APPROVED' WHERE id=${jobId}`);
  const appId = (await api('POST', '/applications', S.token, { job_id: jobId, cover_letter: 'Em muốn ứng tuyển ca sáng.' })).j.data.id;

  // ---- Mô phỏng lỗi DB khi cập nhật trạng thái đơn ----
  await tc('TC_APP_APPROVE_008', async () => withFault('applications', `OLD.id = ${appId}`, async () => {
    const t0 = dbNow();
    const r = await api('POST', `/jobs/${jobId}/selections`, E.token, { applicationIds: [appId] });
    const st = one(`SELECT status FROM applications WHERE id=${appId}`);
    const n = notiCount(S.id, t0);
    const asg = one(`SELECT count(*) FROM work_assignments WHERE application_id=${appId}`);
    return check(r.s >= 400 && st === 'PENDING' && n === '0' && asg === '0', `Lỗi ${r.s}; đơn giữ PENDING, 0 thông báo, 0 hợp đồng`, `Mã ${r.s}, status=${st}, thông báo=${n}, hợp đồng=${asg}`);
  }));
  for (const id of ['TC_APP_REJECT_008', 'TC_NOTICE_STU_004']) {
    await tc(id, async () => withFault('applications', `OLD.id = ${appId}`, async () => {
      const t0 = dbNow();
      const r = await api('PATCH', `/applications/${appId}/status`, E.token, { status: id === 'TC_APP_REJECT_008' ? 'REJECTED' : 'REVIEWING', reason: 'Không phù hợp lịch' });
      const st = one(`SELECT status FROM applications WHERE id=${appId}`);
      const n = notiCount(S.id, t0);
      return check(r.s >= 400 && st === 'PENDING' && n === '0', `Lỗi ${r.s}; đơn giữ PENDING, không phát thông báo`, `Mã ${r.s}, status=${st}, thông báo=${n}`);
    }));
  }

  // ---- Mô phỏng lỗi khi ghi trạng thái xác minh doanh nghiệp ----
  sql(`UPDATE employer_profiles SET verification_status='PENDING', company_name='Công ty QA ${R}', tax_code='0312345678', verification_submitted_at=NOW() WHERE user_id=${E.id}`);
  await tc('TC_EMP_VERIFY_008', async () => withFault('employer_profiles', `OLD.user_id = ${E.id}`, async () => {
    const t0 = dbNow();
    const r = await api('PATCH', `/admin/employer-verifications/${E.id}`, A.token, { status: 'VERIFIED' });
    const st = one(`SELECT verification_status FROM employer_profiles WHERE user_id=${E.id}`);
    const n = notiCount(E.id, t0);
    return check(r.s >= 400 && st === 'PENDING' && n === '0', `Lỗi ${r.s}; giữ PENDING, không có thông báo xác minh`, `Mã ${r.s}, status=${st}, thông báo=${n}`);
  }));
  sql(`UPDATE employer_profiles SET verification_status='VERIFIED' WHERE user_id=${E.id}`);

  // ---- Gửi OTP cho nhà tuyển dụng ----
  await tc('TC_RESET_EMP_003', async () => {
    const r = await api('POST', '/auth/forgot-password', null, { email: mail('emp') });
    const code = await mailCode(mail('emp'));
    const exp = one(`SELECT round(extract(epoch from t.expires_at - t.created_at)/60) FROM password_reset_tokens t JOIN users u ON u.id=t.user_id WHERE u.email='${mail('emp')}' ORDER BY t.id DESC LIMIT 1`);
    return check(r.s === 200 && /^\d{6}$/.test(code || '') && exp === '15', `Mailpit nhận mã ${code}, hiệu lực ${exp} phút`, `${r.s} mã=${code} hạn=${exp}`);
  });

  // ---- Hồ sơ sai định dạng (hồ sơ SV không có ô email liên hệ → kiểm tra bằng SĐT, trường liên hệ duy nhất) ----
  await tc('TC_PROFILE_STU_EDIT_002', async () => {
    const before = one(`SELECT phone FROM users WHERE id=${S.id}`);
    const r = await api('PUT', '/profile/me/student', S.token, { full_name: 'QA Sinh Viên', phone: 'bad@@phone', gender: 'Nam', province: 'TP. Hồ Chí Minh', school: 'Đại học Văn Lang', major: 'CNTT' });
    return check(r.s === 400 && one(`SELECT phone FROM users WHERE id=${S.id}`) === before, `400 "${(r.j.details || [r.j.message]).join('; ')}", dữ liệu cũ giữ nguyên`, `Mã ${r.s}`);
  });

  // ---- Khiếu nại: Chờ xử lý → Đang xử lý → Chấp nhận ----
  const BAN = await login(mail('ban'), 'Student@123');
  sql(`UPDATE users SET status='BANNED', suspension_reason='QA kiểm thử' WHERE id=${BAN.id}`);
  await api('POST', '/auth/appeals', null, { email: mail('ban'), password: 'Student@123', appeal_reason: 'Tôi bị khóa nhầm, xin xem xét lại tài khoản QA.' });
  const apId = one(`SELECT id FROM user_appeals WHERE user_id=${BAN.id} ORDER BY id DESC LIMIT 1`);

  // ---- Giao diện ----
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const open = async (who, pw) => {
    const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
    const p = await ctx.newPage(); p.on('dialog', d => d.accept());
    const u = (await api('POST', '/auth/login', null, { email: who, password: pw })).j.data;
    await p.addInitScript(s => localStorage.setItem('jobnest_session', s), JSON.stringify({ ...u.user, token: u.token }));
    await p.goto(WEB); await p.waitForTimeout(2000);
    const ws = p.locator('header button', { hasText: /Trang quản lý|Bảng Quản trị/ }); if (await ws.count()) { await ws.first().click(); await p.waitForTimeout(1500); }
    return p;
  };

  await tc('TC_COMPLAINT_003', async () => {
    const p = await open('admin.test@vlu.edu.vn', 'Jobnest@2026');
    await p.getByText('Khiếu nại tài khoản', { exact: true }).first().click(); await p.waitForTimeout(1500);
    const card = p.locator('div', { hasText: mail('ban') }).filter({ has: p.getByRole('button', { name: 'Nhận xử lý' }) }).last();
    await card.getByRole('button', { name: 'Nhận xử lý' }).click(); await p.waitForTimeout(1500);
    const st1 = one(`SELECT status FROM user_appeals WHERE id=${apId}`);
    await p.getByRole('button', { name: 'Đang xử lý', exact: true }).click(); await p.waitForTimeout(1500);
    const shown = await p.getByText(mail('ban')).count();
    await p.screenshot({ path: __dirname + '/ui_appeal_inreview.png' });
    const again = await api('PATCH', `/admin/appeals/${apId}`, A.token, { status: 'IN_REVIEW' });
    const done = await api('PATCH', `/admin/appeals/${apId}`, A.token, { status: 'APPROVED', admin_response: 'Đã mở khóa sau khi xem xét.' });
    const relock = await api('PATCH', `/admin/appeals/${apId}`, A.token, { status: 'REJECTED', admin_response: 'Đổi ý' });
    await p.context().close();
    return check(st1 === 'IN_REVIEW' && shown > 0 && again.s === 409 && done.s === 200 && relock.s === 409 && one(`SELECT status FROM users WHERE id=${BAN.id}`) === 'ACTIVE',
      'Nhận xử lý → IN_REVIEW, lọc "Đang xử lý" thấy; rồi chấp nhận mở khóa; đã có kết quả không đổi lại được',
      `st=${st1} shown=${shown} again=${again.s} done=${done.s} relock=${relock.s}`);
  });

  await tc('TC_MOD_QUEUE_006', async () => {
    const held = sql(`SELECT id FROM jobs WHERE moderation_status='PENDING'`).map(r => r[0]);
    if (held.length) sql(`UPDATE jobs SET moderation_status='APPROVED' WHERE id IN (${held.join(',')})`);
    try {
      const r = await api('GET', '/admin/jobs/pending', A.token);
      const p = await open('admin.test@vlu.edu.vn', 'Jobnest@2026');
      await p.getByText('Kiểm duyệt tin', { exact: true }).first().click(); await p.waitForTimeout(1800);
      const empty = await p.getByText('Hàng đợi kiểm duyệt đang trống').count();
      await p.screenshot({ path: __dirname + '/ui_mod_empty.png' });
      await p.context().close();
      return check(r.j.data.length === 0 && empty > 0, `Tạm ẩn ${held.length} tin chờ; API 0 tin, giao diện hiện "Hàng đợi kiểm duyệt đang trống"`, `api=${r.j.data.length} empty=${empty}`);
    } finally {
      if (held.length) sql(`UPDATE jobs SET moderation_status='PENDING' WHERE id IN (${held.join(',')})`);
    }
  });

  await tc('TC_REVIEW_STU_003', async () => {
    const sel = await api('POST', `/jobs/${jobId}/selections`, E.token, { applicationIds: [appId] });
    const asg = one(`SELECT id FROM work_assignments WHERE application_id=${appId}`);
    await api('PATCH', `/assignments/${asg}/status`, E.token, { status: 'IN_PROGRESS' });
    await api('PATCH', `/assignments/${asg}/status`, E.token, { status: 'COMPLETED' });
    const p = await open(mail('emp'), 'Employer@123');
    await p.getByText('Quản lý hợp đồng', { exact: true }).first().click(); await p.waitForTimeout(1800);
    await p.getByRole('button', { name: /Đánh giá sinh viên/ }).first().click(); await p.waitForTimeout(1000);
    const stars = await p.locator('[role=dialog] svg.lucide-star, .modal svg.lucide-star, svg.lucide-star').count();
    const ta = await p.locator('textarea').count();
    await p.screenshot({ path: __dirname + '/ui_review_form.png' });
    await p.context().close();
    return check(sel.s < 300 && ta > 0 && stars >= 5, `Form có ${stars} biểu tượng sao và ô bình luận`, `sel=${sel.s} stars=${stars} textarea=${ta}`);
  });

  await b.close();
  sql(`DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'qa-%-${R}@example.test'); DELETE FROM jobs WHERE title LIKE '[QA-AUTO ${R}%'; DELETE FROM user_appeals WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'qa-%-${R}@example.test'); DELETE FROM users WHERE email LIKE 'qa-%-${R}@example.test';`);
  fs.writeFileSync(__dirname + '/verify_blocked.json', JSON.stringify(results, null, 1));
  console.log(results.filter(r => r.status === 'PASS').length + '/' + results.length + ' PASS');
})().catch(e => { console.error(e); try { sql(`DROP TRIGGER IF EXISTS qa_fault_trg ON applications; DROP TRIGGER IF EXISTS qa_fault_trg ON employer_profiles;`); } catch {} process.exit(1); });
