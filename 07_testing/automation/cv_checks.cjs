// Case tải CV + nộp đơn có CV (TC_APPLY_003/010/011) và NTD khác không đổi được đơn (TC_RBAC_EMP_004)
const { api, sql, one, tc, fail, check, results, login, futureDate } = require('./lib.cjs');
const R = 'cv' + Date.now().toString(36);
const mail = (k) => `qa-${k}-${R}@example.test`;
const phone = () => '09' + String(Date.now() + Math.floor(Math.random() * 1e5)).slice(-8);
const pdf = (bytes) => 'data:application/pdf;base64,' + Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(Math.max(0, bytes - 9), 0x20)]).toString('base64');
(async () => {
  for (const k of ['s1', 's2']) await api('POST', '/auth/register', null, { email: mail(k), password: 'Student@123', full_name: 'QA SV ' + k, phone: phone(), role: 'STUDENT' });
  for (const k of ['e1', 'e2']) await api('POST', '/auth/register', null, { email: mail(k), password: 'Employer@123', full_name: 'QA NTD ' + k, phone: phone(), role: 'EMPLOYER', company_name: 'QA Co ' + k + R });
  const S1 = await login(mail('s1'), 'Student@123'), S2 = await login(mail('s2'), 'Student@123');
  const E1 = await login(mail('e1'), 'Employer@123'), E2 = await login(mail('e2'), 'Employer@123');
  sql(`UPDATE employer_profiles SET verification_status='VERIFIED' WHERE user_id IN (${E1.id},${E2.id}); UPDATE student_profiles SET school='Đại học Văn Lang', major='CNTT' WHERE user_id IN (${S1.id},${S2.id});`);
  const job = (await api('POST', '/jobs', E1.token, { title: `[QA-AUTO ${R}] Nhập liệu`, description: 'Mô tả công việc kiểm thử đủ dài', category: 'Bán lẻ', location: 'TP. Hồ Chí Minh', salary: 30000, salary_type: 'HOURLY', work_type: 'PART_TIME', application_deadline: futureDate(20) })).j.data.id;
  sql(`UPDATE jobs SET moderation_status='APPROVED' WHERE id=${job}`);

  await tc('TC_APPLY_003', async () => {
    const up = await api('POST', '/files/cv', S1.token, { data_url: pdf(2000), name: 'CV_An.pdf' });
    if (up.s !== 201) return fail('Tải CV lỗi ' + up.s + ' ' + up.j.message);
    const r = await api('POST', '/applications', S1.token, { job_id: job, cv_url: up.j.data.default_cv_url, cover_letter: '' });
    return check(r.s === 201 && one(`SELECT cv_url FROM applications WHERE id=${r.j.data.id}`) === up.j.data.default_cv_url, 'Đơn chỉ có CV (không lời giới thiệu) được tiếp nhận', 'Mã ' + r.s + ' ' + r.j.message);
  });
  await tc('TC_APPLY_010', async () => {
    const MAX = 3 * 1024 * 1024;
    const a = await api('POST', '/files/cv', S2.token, { data_url: pdf(MAX), name: 'max.pdf' });
    const b = await api('POST', '/files/cv', S2.token, { data_url: pdf(MAX + 1), name: 'over.pdf' });
    return check(a.s === 201 && b.s >= 400, `3MB→${a.s}, 3MB+1 byte→${b.s}`, `3MB→${a.s}, 3MB+1 byte→${b.s}`);
  });
  await tc('TC_APPLY_011', async () => { const exe = 'data:application/octet-stream;base64,' + Buffer.from('MZfakeexe').toString('base64'); const r = await api('POST', '/files/cv', S2.token, { data_url: exe, name: 'malware.exe' }); return check(r.s === 400, '400 ' + r.j.message, 'Mã ' + r.s); });
  await tc('TC_RBAC_EMP_004', async () => {
    const app = (await api('POST', '/applications', S2.token, { job_id: job, cover_letter: 'Em muốn ứng tuyển.' })).j.data.id;
    const before = one(`SELECT status FROM applications WHERE id=${app}`);
    const r = await api('PATCH', `/applications/${app}/status`, E2.token, { status: 'REVIEWING' });
    return check(r.s === 403 && one(`SELECT status FROM applications WHERE id=${app}`) === before, '403, trạng thái giữ nguyên', 'Mã ' + r.s);
  });
  sql(`DELETE FROM jobs WHERE title LIKE '[QA-AUTO ${R}%'; DELETE FROM notifications WHERE user_id IN (${[S1, S2, E1, E2].map(x => x.id).join(',')}); DELETE FROM users WHERE email LIKE 'qa-%-${R}@example.test';`);
  require('fs').writeFileSync(__dirname + '/cv_checks.json', JSON.stringify(results, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
