// Kiểm tra lại các case từng FAIL/BLOCKED sau khi sửa
const { api, sql, one, tc, pass, fail, check, results, login, futureDate } = require('./lib.cjs');
const R = 'fx' + Date.now().toString(36);
const mail = (k) => `qa-${k}-${R}@example.test`;
const phone = () => '09' + String(Date.now() + Math.floor(Math.random() * 1e4)).slice(-8);
const mailpit = async (to) => {
  for (let i = 0; i < 10; i++) {
    const r = await fetch('http://localhost:8025/api/v1/search?query=' + encodeURIComponent('to:' + to)).then(x => x.json()).catch(() => null);
    const m = r?.messages?.[0];
    if (m) { const full = await fetch('http://localhost:8025/api/v1/message/' + m.ID).then(x => x.json()); return full.Text || ''; }
    await new Promise(s => setTimeout(s, 500));
  }
  return null;
};
const reg = (k, role, pw, extra = {}) => api('POST', '/auth/register', null, { email: mail(k), password: pw, full_name: 'QA ' + k, phone: phone(), role, ...(role === 'EMPLOYER' ? { company_name: 'QA Co ' + k } : {}), ...extra });

(async () => {
  await tc('TC_REG_STU_008', async () => {
    const a = await reg('p7', 'STUDENT', 'Abc1234'), b = await reg('p8', 'STUDENT', 'Abc12345'), c = await reg('p9', 'STUDENT', 'Abc123456');
    return check(a.s === 400 && b.s === 201 && c.s === 201, '7→400, 8→201, 9→201', `${a.s}/${b.s}/${c.s}`);
  });
  await reg('emp', 'EMPLOYER', 'Employer@123');
  const S = await login(mail('p8'), 'Abc12345');
  const E = await login(mail('emp'), 'Employer@123');
  const A = await login('admin.test@vlu.edu.vn', 'Jobnest@2026');

  // Đăng xuất thu hồi token
  await new Promise(s => setTimeout(s, 1100));
  for (const [id, who, email, pw] of [['TC_LOGOUT_STU_002', S, mail('p8'), 'Abc12345'], ['TC_LOGOUT_EMP_002', E, mail('emp'), 'Employer@123']]) {
    await tc(id, async () => {
      const lo = await api('POST', '/auth/logout', who.token);
      const me = await api('GET', '/auth/me', who.token);
      await new Promise(s => setTimeout(s, 1100));
      const again = await login(email, pw); const me2 = await api('GET', '/auth/me', again.token);
      who.token = again.token;
      return check(lo.s === 200 && me.s === 401 && me2.s === 200, 'logout 200, token cũ 401, đăng nhập lại dùng được', `${lo.s}/${me.s}/${me2.s}`);
    });
  }

  // Quên mật khẩu
  await tc('TC_RESET_STU_002', async () => { const r = await api('POST', '/auth/forgot-password', null, { email: 'missing-' + R + '@example.test' }); return check(r.s === 404 && /Không tìm thấy/.test(r.j.message), r.j.message, `${r.s} ${r.j.message}`); });
  await tc('TC_RESET_STU_003', async () => { const r = await api('POST', '/auth/forgot-password', null, { email: mail('p8') }); const t = await mailpit(mail('p8')); const code = t && (t.match(/\b(\d{6})\b/) || [])[1]; return check(r.s === 200 && !!code, `Mailpit nhận thư có mã ${code}`, `${r.s}, thư: ${t ? 'có, không thấy mã' : 'không có'}`); });
  await tc('TC_RESET_STU_006', async () => {
    const h0 = one(`SELECT password_hash FROM users WHERE email='${mail('p8')}'`);
    const noOtp = await api('POST', '/auth/reset-password', null, { email: mail('p8'), new_password: 'Hacked123' });
    const bad = await api('POST', '/auth/reset-password', null, { email: mail('p8'), otp: '000000', new_password: 'Hacked123' });
    const h1 = one(`SELECT password_hash FROM users WHERE email='${mail('p8')}'`);
    return check(noOtp.s === 400 && bad.s === 400 && h0 === h1, 'Không OTP→400, OTP sai→400, mật khẩu giữ nguyên', `${noOtp.s}/${bad.s} đổi=${h0 !== h1}`);
  });
  await tc('TC_RESET_STU_008', async () => {
    await api('POST', '/auth/forgot-password', null, { email: mail('p8') });
    const t = await mailpit(mail('p8')); const code = (t.match(/\b(\d{6})\b/) || [])[1];
    const a = await api('POST', '/auth/reset-password', null, { email: mail('p8'), otp: code, new_password: 'Abc1234' });
    const b = await api('POST', '/auth/reset-password', null, { email: mail('p8'), otp: code, new_password: 'Abc12345' });
    const reuse = await api('POST', '/auth/reset-password', null, { email: mail('p8'), otp: code, new_password: 'Abc99999' });
    return check(a.s === 400 && b.s === 200 && reuse.s === 400, '7→400, 8→200, dùng lại mã→400', `${a.s}/${b.s}/${reuse.s}`);
  });
  await tc('RESET_BRUTE', async () => {
    await api('POST', '/auth/forgot-password', null, { email: mail('emp') });
    let last; for (let i = 0; i < 5; i++) last = await api('POST', '/auth/reset-password', null, { email: mail('emp'), otp: '11111' + i, new_password: 'Employer@999' });
    const t = await mailpit(mail('emp')); const code = (t.match(/\b(\d{6})\b/) || [])[1];
    const after = await api('POST', '/auth/reset-password', null, { email: mail('emp'), otp: code, new_password: 'Employer@999' });
    return check(after.s === 400 && /quá nhiều/.test(last.j.message), 'Sai 5 lần → mã bị hủy', `${after.s} ${last.j.message}`);
  });

  await new Promise(r => setTimeout(r, 1100)); S.token = (await login(mail('p8'), 'Abc12345')).token; E.token = (await login(mail('emp'), 'Employer@123')).token;
  // Tin tuyển dụng
  sql(`UPDATE employer_profiles SET verification_status='VERIFIED' WHERE user_id=${E.id}`);
  const job = (o = {}) => ({ title: '[QA-AUTO ' + R + '] Nhân viên phục vụ', description: 'Mô tả công việc kiểm thử đủ dài', category: 'Nhà hàng / Khách sạn', location: 'TP. Hồ Chí Minh', salary: 30000, salary_type: 'HOURLY', work_type: 'PART_TIME', headcount: 2, application_deadline: futureDate(20), ...o });
  await tc('TC_JOB_CREATE_008', async () => { const a = await api('POST', '/jobs', E.token, job({ application_deadline: '' })); const b = await api('POST', '/jobs', E.token, job({ salary: '' })); const c = await api('POST', '/jobs', E.token, job({ location: '' })); return check(a.s === 400 && b.s === 400 && c.s === 400, 'Cả 3 → 400', `${a.s}/${b.s}/${c.s} ${JSON.stringify(a.j.details || a.j.message)}`); });
  const cj = await api('POST', '/jobs', E.token, job());
  const jobId = cj.j.data?.id;
  if (!jobId) console.log('Tạo tin lỗi', cj.s, JSON.stringify(cj.j).slice(0, 300));
  await tc('TC_JOB_STATUS_003', async () => { const r = await api('PATCH', `/jobs/${jobId}/status`, E.token, { status: 'COMPLETED' }); return check(r.s === 400 && one(`SELECT status FROM jobs WHERE id=${jobId}`) === 'OPEN', '400, giữ OPEN', `${r.s} ${one(`SELECT status FROM jobs WHERE id=${jobId}`)}`); });

  // Ứng tuyển
  sql(`UPDATE jobs SET moderation_status='APPROVED' WHERE id=${jobId}`);
  sql(`UPDATE student_profiles SET school='Đại học Văn Lang', major='CNTT' WHERE user_id=${S.id}`);
  await tc('TC_APPLY_004', async () => { const r = await api('POST', '/applications', S.token, { job_id: jobId, cover_letter: '', cv_url: '' }); return check(r.s === 400, r.j.message, 'Mã ' + r.s); });
  const ap = await api('POST', '/applications', S.token, { job_id: jobId, cover_letter: 'Em muốn ứng tuyển vị trí này.' });
  const appId = ap.j.data?.id;
  await tc('TC_APP_REJECT_002', async () => {
    sql(`UPDATE applications SET status='ACCEPTED' WHERE id=${appId}`);
    const r = await api('PATCH', `/applications/${appId}/status`, E.token, { status: 'REJECTED', reason: 'thử' });
    return check(r.s >= 400 && one(`SELECT status FROM applications WHERE id=${appId}`) === 'ACCEPTED', `${r.s}, giữ ACCEPTED`, `${r.s} ${one(`SELECT status FROM applications WHERE id=${appId}`)}`);
  });

  // Độ dài tên
  await tc('TC_PROFILE_STU_EDIT_006', async () => {
    const base = { phone: phone(), gender: 'Nam', province: 'TP. Hồ Chí Minh', school: 'Đại học Văn Lang', major: 'CNTT' };
    const ok = await api('PUT', '/profile/me/student', S.token, { ...base, full_name: 'N'.repeat(255) });
    const bad = await api('PUT', '/profile/me/student', S.token, { ...base, full_name: 'N'.repeat(256) });
    return check(ok.s === 200 && bad.s === 400, '255→200, 256→400', `${ok.s}/${bad.s} ${bad.j.message}`);
  });
  await tc('TC_PROFILE_EMP_EDIT_006', async () => { const r = await api('PUT', '/profile/me/employer-public', E.token, { display_name: 'C'.repeat(256) }); return check(r.s === 400, r.j.message, 'Mã ' + r.s); });

  // Báo cáo vi phạm
  await tc('TC_VIOLATION_008', async () => {
    const rid = one(`SELECT id FROM reports WHERE status='RESOLVED' LIMIT 1`);
    const c0 = one(`SELECT count(*) FROM report_actions WHERE report_id=${rid}`);
    const r = await api('POST', `/admin/reports/${rid}/action`, A.token, { action: 'WARNING', note: 'lặp' });
    const c1 = one(`SELECT count(*) FROM report_actions WHERE report_id=${rid}`);
    return check(r.s === 409 && c0 === c1, `409, số lần xử lý giữ ${c0}`, `${r.s} ${c0}→${c1}`);
  });

  // Danh mục
  await tc('TC_CATEGORY_009', async () => { const ex = one(`SELECT name FROM categories LIMIT 1`); const r = await api('POST', '/admin/categories', A.token, { name: '  ' + ex.toUpperCase() + ' ' }); return check(r.s === 409, r.j.message, 'Mã ' + r.s); });
  await tc('TC_CATEGORY_008', async () => { const id = one(`SELECT c.id FROM categories c WHERE EXISTS (SELECT 1 FROM jobs j WHERE j.category=c.name) LIMIT 1`); const r = await api('DELETE', `/admin/categories/${id}`, A.token); return check(r.s === 409 && one(`SELECT count(*) FROM categories WHERE id=${id}`) === '1', r.j.message, 'Mã ' + r.s); });

  // Nhật ký
  await tc('TC_AUDIT_LOG_003', async () => {
    const r = await api('GET', '/admin/logs?from=2026-11-01&to=2026-11-15&limit=500', A.token);
    const bad = r.j.data.filter(l => { const d = new Date(new Date(l.created_at).getTime() + 7 * 3600e3).toISOString().slice(0, 10); return d < '2026-11-01' || d > '2026-11-15'; });
    return check(r.s === 200 && bad.length === 0, `${r.j.data.length} bản ghi, đều trong khoảng`, `${r.s}, ${bad.length} ngoài khoảng`);
  });
  await tc('TC_AUDIT_LOG_006', async () => { const today = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10); const r = await api('GET', `/admin/logs?from=${today}&to=${today}&limit=500`, A.token); return check(r.s === 200 && r.j.data.length > 0, `${r.j.data.length} bản ghi trong ngày ${today}`, `${r.s} ${r.j.data?.length}`); });
  await tc('TC_AUDIT_LOG_007', async () => { const r = await api('GET', '/admin/logs?from=2026-11-20&to=2026-11-01', A.token); return check(r.s === 400, r.j.message, 'Mã ' + r.s); });

  // Dọn dẹp
  sql(`DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'qa-%-${R}@example.test'); DELETE FROM jobs WHERE title LIKE '[QA-AUTO ${R}%'; DELETE FROM users WHERE email LIKE 'qa-%-${R}@example.test';`);
  const f = results.filter(r => r.status !== 'PASS');
  console.log(`\n${results.length - f.length}/${results.length} PASS`);
  require('fs').writeFileSync(__dirname + '/verify_results.json', JSON.stringify(results, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
