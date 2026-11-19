// Kiểm tra lại 2 case đối chiếu chưa đạt: TC_JOB_FILTER_009 (lương lọc sai) và TC_APPLICANTS_007 (0 / 1 / 25 ứng viên)
const { chromium } = require('playwright-core');
const { api, sql, one, tc, check, results, login, futureDate } = require('./lib.cjs');
const R = 'au' + Date.now().toString(36);
const mail = (k) => `qa-${k}-${R}@example.test`;
let seq = 0; const phone = () => '09' + String((Date.now() % 1e6) * 100 + (seq++ % 100)).padStart(8, '0').slice(-8);
(async () => {
  await tc('TC_JOB_FILTER_009', async () => {
    const a = await api('GET', '/jobs?minSalary=-1'), b = await api('GET', '/jobs?minSalary=abc'), c = await api('GET', '/jobs?minSalary=50000&maxSalary=10000');
    const ok = await api('GET', '/jobs?minSalary=80000');
    const okAll = ok.s === 200 && ok.j.data.every(j => Number(j.salary) >= 80000);
    return check(a.s === 400 && b.s === 400 && c.s === 400 && okAll, `-1→400, abc→400, min>max→400 ("${a.j.message}"); 80.000 hợp lệ → ${ok.j.data.length} tin đều ≥ 80.000`, `-1→${a.s}, abc→${b.s}, min>max→${c.s}, hợp lệ đúng=${okAll}`);
  });

  // 0, 1, 25 ứng viên
  await api('POST', '/auth/register', null, { email: mail('emp'), password: 'Employer@123', full_name: 'QA NTD', phone: phone(), role: 'EMPLOYER', company_name: 'QA Co ' + R });
  const E = await login(mail('emp'), 'Employer@123');
  sql(`UPDATE employer_profiles SET verification_status='VERIFIED' WHERE user_id=${E.id}`);
  const mk = async (t) => { const id = (await api('POST', '/jobs', E.token, { title: `[QA-AUTO ${R}] ${t}`, description: 'Mô tả công việc kiểm thử đủ dài', category: 'Bán lẻ', location: 'TP. Hồ Chí Minh', salary: 30000, salary_type: 'HOURLY', work_type: 'PART_TIME', quantity_required: 30, application_deadline: futureDate(20) })).j.data.id; sql(`UPDATE jobs SET moderation_status='APPROVED' WHERE id=${id}`); return id; };
  const J0 = await mk('Không ứng viên'), J1 = await mk('Một ứng viên'), J25 = await mk('Nhiều ứng viên');
  const students = [];
  for (let i = 0; i < 25; i++) {
    await api('POST', '/auth/register', null, { email: mail('s' + i), password: 'Student@123', full_name: 'QA Ứng viên ' + i, phone: phone(), role: 'STUDENT' });
    students.push(await login(mail('s' + i), 'Student@123'));
  }
  sql(`UPDATE student_profiles SET school='Đại học Văn Lang', major='CNTT' WHERE user_id IN (${students.map(s => s.id).join(',')})`);
  await api('POST', '/applications', students[0].token, { job_id: J1, cover_letter: 'Ứng viên duy nhất' });
  for (const s of students) await api('POST', '/applications', s.token, { job_id: J25, cover_letter: 'Ứng tuyển ' + s.email });
  await tc('TC_APPLICANTS_007', async () => {
    const out = [];
    for (const [j, want] of [[J0, 0], [J1, 1], [J25, 25]]) {
      const r = await api('GET', `/applications/job/${j}`, E.token);
      const ids = r.j.data.map(a => a.id);
      const db = Number(one(`SELECT count(*) FROM applications WHERE job_id=${j}`));
      out.push({ want, api: ids.length, uniq: new Set(ids).size, db });
    }
    // Giao diện: trang Hồ sơ ứng viên của NTD hiển thị đủ 26 đơn (0 + 1 + 25)
    const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
    const p = await (await b.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
    const u = (await api('POST', '/auth/login', null, { email: mail('emp'), password: 'Employer@123' })).j.data;
    await p.addInitScript(s => localStorage.setItem('jobnest_session', s), JSON.stringify({ ...u.user, token: u.token }));
    await p.goto('http://localhost:5173'); await p.waitForTimeout(2000);
    const ws = p.locator('header button', { hasText: /Trang quản lý/ }); if (await ws.count()) { await ws.first().click(); await p.waitForTimeout(1500); }
    await p.getByText('Hồ sơ ứng viên', { exact: true }).first().click(); await p.waitForTimeout(2500);
    const body = await p.locator('body').innerText();
    const shown = students.filter((s, i) => body.includes('QA Ứng viên ' + i)).length;
    await p.screenshot({ path: __dirname + '/ui_applicants_25.png', fullPage: true });
    await b.close();
    const good = out.every(o => o.api === o.want && o.uniq === o.want && o.db === o.want);
    return check(good && shown === 25, `API: 0/1/25 đơn đúng số, không trùng, khớp DB; giao diện hiện đủ 25 ứng viên khác nhau`, `${JSON.stringify(out)} UI=${shown}/25`);
  });

  sql(`DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'qa-%-${R}@example.test'); DELETE FROM jobs WHERE title LIKE '[QA-AUTO ${R}%'; DELETE FROM users WHERE email LIKE 'qa-%-${R}@example.test';`);
  require('fs').writeFileSync(__dirname + '/audit_checks.json', JSON.stringify(results, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
