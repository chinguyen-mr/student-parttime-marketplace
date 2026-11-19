// Case còn lại sau khi sửa: RBAC_EMP_002 (sửa tin người khác → 403) và REG_STU_001 (form đăng ký SV)
const { chromium } = require('playwright-core');
const { api, sql, one, tc, check, results, login, futureDate } = require('./lib.cjs');
const R = 'fc' + Date.now().toString(36);
const mail = (k) => `qa-${k}-${R}@example.test`;
const phone = () => '09' + String(Date.now() + Math.floor(Math.random() * 1e5)).slice(-8);
(async () => {
  for (const k of ['a', 'b']) await api('POST', '/auth/register', null, { email: mail(k), password: 'Employer@123', full_name: 'QA NTD ' + k, phone: phone(), role: 'EMPLOYER', company_name: 'QA Co ' + k + R });
  const EA = await login(mail('a'), 'Employer@123'), EB = await login(mail('b'), 'Employer@123');
  sql(`UPDATE employer_profiles SET verification_status='VERIFIED' WHERE user_id IN (${EA.id},${EB.id})`);
  const job = (await api('POST', '/jobs', EB.token, { title: `[QA-AUTO ${R}] Tin của NTD B`, description: 'Mô tả công việc kiểm thử đủ dài', category: 'Bán lẻ', location: 'TP. Hồ Chí Minh', salary: 30000, salary_type: 'HOURLY', work_type: 'PART_TIME', application_deadline: futureDate(20) })).j.data.id;
  await tc('TC_RBAC_EMP_002', async () => {
    const r = await api('PUT', `/jobs/${job}`, EA.token, { title: 'Sửa trái phép tin', description: 'mô tả trái phép đủ dài', category: 'Bán lẻ', location: 'HCM', salary: 50000 });
    const t = one(`SELECT title FROM jobs WHERE id=${job}`);
    return check(r.s === 403 && !/trái phép/.test(t), '403, tin không đổi', `Mã ${r.s}`);
  });
  await tc('TC_JOB_EDIT_KEEP_DEADLINE', async () => {
    const d0 = one(`SELECT application_deadline FROM jobs WHERE id=${job}`);
    const r = await api('PUT', `/jobs/${job}`, EB.token, { title: `[QA-AUTO ${R}] Tin của NTD B sửa`, description: 'Mô tả công việc kiểm thử đủ dài', category: 'Bán lẻ', location: 'TP. Hồ Chí Minh', salary: 35000 });
    return check(r.s === 200 && one(`SELECT application_deadline FROM jobs WHERE id=${job}`) === d0, 'Sửa tin không gửi hạn nộp → 200, giữ hạn cũ', `Mã ${r.s} ${r.j.message}`);
  });
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  await tc('TC_REG_STU_001', async () => {
    const p = await (await b.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
    await p.goto('http://localhost:5173'); await p.waitForTimeout(2000);
    await p.locator('header button', { hasText: 'Đăng ký' }).first().click(); await p.waitForTimeout(1500);
    const tab = await p.getByText('Ứng viên', { exact: true }).count();
    const inputs = await p.locator('input').count();
    const btn = await p.getByRole('button', { name: /Đăng ký/ }).count();
    return check(tab > 0 && inputs >= 5 && btn > 0, `Tab Ứng viên mặc định, ${inputs} ô nhập, có nút Đăng ký`, `tab=${tab} inputs=${inputs} btn=${btn}`);
  });
  await b.close();
  sql(`DELETE FROM jobs WHERE title LIKE '[QA-AUTO ${R}%'; DELETE FROM notifications WHERE user_id IN (${EA.id},${EB.id}); DELETE FROM users WHERE email LIKE 'qa-%-${R}@example.test';`);
  require('fs').writeFileSync(__dirname + '/final_checks.json', JSON.stringify(results, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
