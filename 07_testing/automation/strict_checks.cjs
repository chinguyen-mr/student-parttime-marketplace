// Kiểm chứng chặt các case trước đây kiểm yếu / có thể "pass rỗng":
//  - case [UI] chỉ kiểm qua API: JOB_DETAIL_002, PROFILE_EMP_VIEW_006, AUDIT_LOG_002
//  - case có thể đạt mà không thấy dữ liệu: LOGOUT_*_005, APPLY_012, REVIEW_STU_008, REVIEW_EMP_003, REVIEW_STU_003, JOB_STATUS_001
//  - case dựng dữ liệu tắt / chưa kiểm hết ý: APP_REJECT_002 (nhận đơn qua luồng thật), EMP_VERIFY_005 (lưu lý do)
const { chromium } = require('playwright-core');
const { api, sql, one, tc, check, fail, results, login, futureDate } = require('./lib.cjs');
const WEB = 'http://localhost:5173';
const R = 'st' + Date.now().toString(36);
const mail = (k) => `qa-${k}-${R}@example.test`;
let seq = 0; const phone = () => '09' + String((Date.now() % 1e6) * 100 + (seq++ % 100)).padStart(8, '0').slice(-8);
const wait = (ms) => new Promise(s => setTimeout(s, ms));
const COMPANY = 'Công ty Cầu Nối & Công Nghệ';

(async () => {
  // ---------- Dữ liệu qua luồng thật (API) ----------
  await api('POST', '/auth/register', null, { email: mail('emp'), password: 'Employer@123', full_name: 'QA Chủ Tin', phone: phone(), role: 'EMPLOYER', company_name: 'QA Co ' + R });
  await api('POST', '/auth/register', null, { email: mail('emp2'), password: 'Employer@123', full_name: 'QA NTD Xác Minh', phone: phone(), role: 'EMPLOYER', company_name: 'QA Co2 ' + R });
  for (const k of ['s1', 's2']) await api('POST', '/auth/register', null, { email: mail(k), password: 'Student@123', full_name: 'QA Sinh Viên ' + k.toUpperCase(), phone: phone(), role: 'STUDENT' });
  const E = await login(mail('emp'), 'Employer@123'), E2 = await login(mail('emp2'), 'Employer@123');
  const S1 = await login(mail('s1'), 'Student@123'), S2 = await login(mail('s2'), 'Student@123');
  const A = await login('admin.test@vlu.edu.vn', 'Jobnest@2026');
  sql(`UPDATE employer_profiles SET verification_status='VERIFIED' WHERE user_id=${E.id}`); // điều kiện tiền đề: NTD đã xác minh
  for (const s of [S1, S2]) await api('PUT', '/profile/me/student', s.token, { full_name: s === S1 ? 'QA Sinh Viên S1' : 'QA Sinh Viên S2', phone: phone(), gender: 'Nam', province: 'TP. Hồ Chí Minh', school: 'Đại học Văn Lang', major: 'CNTT' });
  const pub = await api('PUT', '/profile/me/employer-public', E.token, { display_name: COMPANY });
  if (pub.s !== 200) console.log('Đặt tên doanh nghiệp lỗi', pub.s, pub.j.message);
  const DEADLINE = futureDate(25);
  const mk = async (t, qty) => {
    const r = await api('POST', '/jobs', E.token, { title: `[QA-AUTO ${R}] ${t}`, description: `Mô tả kiểm chứng ${R}: phục vụ khách, sắp xếp bàn ghế`, category: 'Bán lẻ', location: '12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', salary: 30000, salary_type: 'HOURLY', work_type: 'PART_TIME', quantity_required: qty, application_deadline: DEADLINE });
    const id = r.j.data.id;
    await api('PATCH', `/admin/jobs/${id}/moderate`, A.token, { moderation_status: 'APPROVED' }); // duyệt qua API thật → có nhật ký
    return id;
  };
  const J_open = await mk('Tin đang tuyển', 3), J_fill = await mk('Tin đủ người', 1), J_done = await mk('Tin hoàn thành', 1);
  const XSS_LETTER = '<script>alert(1)</script> Em có kinh nghiệm phục vụ';
  const appOpen = (await api('POST', '/applications', S1.token, { job_id: J_open, cover_letter: XSS_LETTER })).j.data.id;
  const appFill = (await api('POST', '/applications', S1.token, { job_id: J_fill, cover_letter: 'Đơn tin đủ người' })).j.data.id;
  const appDone = (await api('POST', '/applications', S2.token, { job_id: J_done, cover_letter: 'Đơn tin hoàn thành' })).j.data.id;
  const sel1 = await api('POST', `/jobs/${J_fill}/selections`, E.token, { applicationIds: [appFill] });
  const sel2 = await api('POST', `/jobs/${J_done}/selections`, E.token, { applicationIds: [appDone] });
  const asg = one(`SELECT id FROM work_assignments WHERE application_id=${appDone}`);
  await api('PATCH', `/assignments/${asg}/status`, E.token, { status: 'IN_PROGRESS' });
  await api('PATCH', `/assignments/${asg}/status`, E.token, { status: 'COMPLETED' });
  console.log('Trạng thái tin:', one(`SELECT string_agg(id||'='||status, ', ' ORDER BY id) FROM jobs WHERE id IN (${J_open},${J_fill},${J_done})`), '| chọn', sel1.s, sel2.s);

  // ---------- Kiểm API chặt ----------
  await tc('TC_APP_REJECT_002', async () => {
    const st0 = one(`SELECT status FROM applications WHERE id=${appFill}`);
    const r = await api('PATCH', `/applications/${appFill}/status`, E.token, { status: 'REJECTED', reason: 'Thử từ chối đơn đã nhận' });
    const st1 = one(`SELECT status FROM applications WHERE id=${appFill}`);
    return check(st0 === 'ACCEPTED' && r.s === 409 && st1 === 'ACCEPTED', `Đơn được nhận qua luồng chọn ứng viên thật (${st0}); từ chối → 409, giữ ACCEPTED`, `trước=${st0} mã=${r.s} sau=${st1}`);
  });
  await tc('TC_EMP_VERIFY_005', async () => {
    const legal = await api('PUT', '/profile/me/verification', E2.token, { company_name: 'Công ty QA Không Đủ Chứng Cứ', tax_code: '0312345679' });
    const submit = await api('POST', '/profile/me/verification/submit', E2.token, {});
    const st0 = one(`SELECT verification_status FROM employer_profiles WHERE user_id=${E2.id}`);
    if (st0 !== 'PENDING') sql(`UPDATE employer_profiles SET verification_status='PENDING', company_name='Công ty QA Không Đủ Chứng Cứ', tax_code='0312345679', verification_submitted_at=NOW() WHERE user_id=${E2.id}`);
    const NOTE = 'Giấy phép kinh doanh không khớp mã số thuế';
    const r = await api('PATCH', `/admin/employer-verifications/${E2.id}`, A.token, { status: 'REJECTED', note: NOTE });
    const row = sql(`SELECT verification_status, verification_note FROM employer_profiles WHERE user_id=${E2.id}`)[0] || [];
    const noti = one(`SELECT count(*) FROM notifications WHERE user_id=${E2.id}`);
    return check(r.s === 200 && row[0] === 'REJECTED' && row[1] === NOTE && Number(noti) > 0,
      `Lưu REJECTED + lý do "${row[1]}", NTD nhận thông báo (gửi hồ sơ qua API: ${legal.s}/${submit.s}${st0 !== 'PENDING' ? ', đưa về chờ duyệt bằng SQL' : ''})`, `mã=${r.s} trạng thái=${row[0]} lý do=${row[1]} thông báo=${noti}`);
  });

  // ---------- Giao diện ----------
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const open = async (who) => {
    const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
    const p = await ctx.newPage(); p.dialogs = 0; p.on('dialog', d => { p.dialogs++; d.dismiss(); });
    if (who) { const u = (await api('POST', '/auth/login', null, { email: who.email, password: who.pw })).j.data; p.user = u.user; await p.addInitScript(s => localStorage.setItem('jobnest_session', s), JSON.stringify({ ...u.user, token: u.token })); }
    await p.goto(WEB); await p.waitForTimeout(2000); return p;
  };
  const toWorkspace = async (p) => { const ws = p.locator('header button', { hasText: /Trang quản lý|Bảng Quản trị/ }); if (await ws.count()) { await ws.first().click(); await p.waitForTimeout(1600); } };
  const side = async (p, label) => { await p.getByText(label, { exact: true }).first().click(); await p.waitForTimeout(2200); };
  const body = (p) => p.locator('body').innerText();
  const shot = (p, n) => p.screenshot({ path: __dirname + `/strict_${n}.png` });

  await tc('TC_JOB_DETAIL_002', async () => {
    const p = await open(null);
    await p.locator('header button', { hasText: 'Tìm việc làm' }).first().click(); await p.waitForTimeout(1500);
    const inp = p.locator('input[placeholder*="Tìm"], input[type=search]').first(); await inp.fill(`[QA-AUTO ${R}] Tin đang tuyển`); await inp.press('Enter'); await p.waitForTimeout(1800);
    await p.getByText('Xem chi tiết công việc').first().click(); await p.waitForTimeout(2200);
    const t = await body(p); await shot(p, 'job_detail');
    const [y, m, d] = DEADLINE.split('-');
    const has = { mo_ta: t.includes(`Mô tả kiểm chứng ${R}`), luong: /30\.000/.test(t), dia_diem: t.includes('Nguyễn Huệ'), han: t.includes(`${d}/${m}/${y}`) || t.includes(`${Number(d)}/${Number(m)}/${y}`) };
    await p.context().close();
    return check(Object.values(has).every(Boolean), `Trang chi tiết hiện đúng mô tả, lương 30.000, địa điểm, hạn ${d}/${m}/${y}`, JSON.stringify(has));
  });

  await tc('TC_PROFILE_EMP_VIEW_006', async () => {
    const saved = one(`SELECT display_name FROM employer_profiles WHERE user_id=${E.id}`);
    const p = await open({ email: mail('emp'), pw: 'Employer@123' }); await toWorkspace(p); await side(p, 'Hồ sơ doanh nghiệp');
    const t = await body(p); const inInputs = await p.evaluate((n) => [...document.querySelectorAll('input,textarea')].some(i => i.value === n), COMPANY);
    await shot(p, 'emp_profile'); await p.context().close();
    return check(saved === COMPANY && (t.includes(COMPANY) || inInputs), `DB và trang hồ sơ hiển thị nguyên văn "${COMPANY}"`, `DB="${saved}" trên trang=${t.includes(COMPANY) || inInputs}`);
  });

  await tc('TC_AUDIT_LOG_002', async () => {
    const p = await open({ email: 'admin.test@vlu.edu.vn', pw: 'Jobnest@2026' }); await toWorkspace(p); await side(p, 'Nhật ký hệ thống');
    const rowText = await p.evaluate((title) => { const tr = [...document.querySelectorAll('tr')].find(r => r.innerText.includes(title)); return tr ? tr.innerText : ''; }, `[QA-AUTO ${R}] Tin đang tuyển`);
    await shot(p, 'audit_row'); await p.context().close();
    const ok = /Quản trị viên/.test(rowText) && /duyệt/i.test(rowText) && /\d{2}:\d{2}/.test(rowText) && /\d{2}\/\d{2}\/\d{4}/.test(rowText);
    return check(ok, `Dòng nhật ký: ${rowText.replace(/\s+/g, ' ').slice(0, 110)}`, `Không đủ người/hành động/thời gian: "${rowText.replace(/\s+/g, ' ').slice(0, 120)}"`);
  });

  await tc('TC_JOB_STATUS_001', async () => {
    const p = await open({ email: mail('emp'), pw: 'Employer@123' }); await toWorkspace(p); await side(p, 'Tin tuyển dụng');
    const get = (title) => p.evaluate((title) => { let el = [...document.querySelectorAll('body *')].find(e => e.children.length === 0 && e.textContent.includes(title)); for (let i = 0; el && i < 8; i++) { if (/Đang tuyển|Đang mở|Đủ người|Đã hoàn thành/.test(el.innerText)) return el.innerText; el = el.parentElement; } return ''; }, title);
    const s = { open: await get(`[QA-AUTO ${R}] Tin đang tuyển`), fill: await get(`[QA-AUTO ${R}] Tin đủ người`), done: await get(`[QA-AUTO ${R}] Tin hoàn thành`) };
    await shot(p, 'job_status'); await p.context().close();
    const ok = /Đang tuyển|Đang mở/.test(s.open) && /Đủ người/.test(s.fill) && /Đã hoàn thành/.test(s.done);
    const db = one(`SELECT string_agg(status, '/' ORDER BY id) FROM jobs WHERE id IN (${J_open},${J_fill},${J_done})`);
    return check(ok && db === 'OPEN/FILLED/COMPLETED', `3 tin thật đi qua luồng (DB ${db}); giao diện hiện đúng nhãn Đang tuyển / Đủ người / Đã hoàn thành. Lưu ý: Đủ người & Hoàn thành do hệ thống tự chuyển, không có nút đổi tay`, `DB=${db} UI=${JSON.stringify(s).slice(0, 160)}`);
  });

  await tc('TC_APPLY_012', async () => {
    const stored = one(`SELECT cover_letter FROM applications WHERE id=${appOpen}`);
    const p = await open({ email: mail('emp'), pw: 'Employer@123' }); await toWorkspace(p); await side(p, 'Hồ sơ ứng viên');
    const all = p.getByRole('button', { name: 'Tất cả hồ sơ' }); if (await all.count()) { await all.click(); await p.waitForTimeout(1500); }
    const card = p.locator('tr, div', { hasText: 'QA Sinh Viên S1' }).filter({ has: p.getByRole('button', { name: 'Xem hồ sơ' }) }).last();
    await card.getByRole('button', { name: 'Xem hồ sơ' }).first().click(); await p.waitForTimeout(1800);
    const t = await body(p); await shot(p, 'xss_letter');
    const shown = t.includes('Em có kinh nghiệm phục vụ'); const d = p.dialogs; const scriptTags = await p.evaluate(() => [...document.querySelectorAll('script')].some(s => s.textContent.includes('alert(1)')));
    await p.context().close();
    return check(shown && d === 0 && !scriptTags, `Lời giới thiệu chứa thẻ script hiển thị dạng chữ (lưu: "${stored.slice(0, 45)}"), không hộp thoại, không chèn thẻ script vào trang`, `hiện=${shown} hộp thoại=${d} thẻ script=${scriptTags}`);
  });

  // Form đánh giá sinh viên (NTD) — trước khi có đánh giá
  await tc('TC_REVIEW_STU_003', async () => {
    const p = await open({ email: mail('emp'), pw: 'Employer@123' }); await toWorkspace(p); await side(p, 'Quản lý hợp đồng');
    await p.getByRole('button', { name: /Đánh giá sinh viên/ }).first().click(); await p.waitForTimeout(1200);
    const info = await p.evaluate(() => { const ta = document.querySelector('textarea'); let box = ta; while (box && !(box.querySelectorAll('svg.lucide-star').length >= 5 && box.innerText.length > 20)) box = box.parentElement; return box ? { stars: box.querySelectorAll('button svg.lucide-star').length || box.querySelectorAll('svg.lucide-star').length, text: box.innerText.slice(0, 80) } : null; });
    await shot(p, 'review_form_emp'); await p.context().close();
    return check(info && info.stars === 5, `Form đánh giá có đúng 5 sao + ô bình luận`, `form=${JSON.stringify(info)}`);
  });

  // Sinh viên mở form đánh giá NTD
  await tc('TC_REVIEW_EMP_003', async () => {
    const p = await open({ email: mail('s2'), pw: 'Student@123' });
    await p.locator('header button', { hasText: 'Sinh viên' }).first().click(); await p.waitForTimeout(1500); await side(p, 'Đánh giá & Phản hồi');
    const info = await p.evaluate(() => { const ta = document.querySelector('textarea'); let box = ta; while (box && box.querySelectorAll('svg.lucide-star').length < 5) box = box.parentElement; return ta && box ? { stars: box.querySelectorAll('svg.lucide-star').length } : null; });
    await shot(p, 'review_form_stu'); await p.context().close();
    return check(info && info.stars >= 5, `Form đánh giá NTD có ${info?.stars} biểu tượng sao chọn được + ô bình luận`, `form=${JSON.stringify(info)}`);
  });

  // NTD đánh giá sinh viên, rồi ghi đè bình luận HTML trực tiếp trong DB (vượt bộ lọc khi lưu) để kiểm khâu hiển thị
  await tc('TC_REVIEW_STU_008', async () => {
    const rv = await api('POST', '/reviews', E.token, { job_id: J_done, reviewee_id: S2.id, rating: 5, comment: 'Chăm chỉ, đúng giờ' });
    const PAY = '<img src=x onerror=alert(1)> Nhận xét kiểm chứng';
    sql(`UPDATE reviews SET comment='${PAY}' WHERE job_id=${J_done} AND reviewee_id=${S2.id}`);
    const p = await open({ email: mail('s2'), pw: 'Student@123' });
    await p.locator('header button', { hasText: 'Sinh viên' }).first().click(); await p.waitForTimeout(1500); await side(p, 'Đánh giá & Phản hồi');
    const t = await body(p); await shot(p, 'xss_review');
    const shown = t.includes('Nhận xét kiểm chứng'); const imgs = await p.evaluate(() => document.querySelectorAll('img[src="x"]').length);
    await p.context().close();
    if (!shown) return fail(`Trang không hiện nhận xét nên chưa kiểm được hiển thị (tạo đánh giá ${rv.s})`);
    return check(p.dialogs === 0 && imgs === 0, 'Bình luận HTML hiển thị dạng chữ: không chạy onerror, không tạo thẻ <img>', `hộp thoại=${p.dialogs} thẻ img=${imgs}`);
  });

  // Đăng xuất rồi Back: trước khi đăng xuất phải thấy dữ liệu riêng tư
  for (const [pre, who, enter, marker] of [
    ['STU', { email: mail('s1'), pw: 'Student@123' }, async (p) => { await p.locator('header button', { hasText: 'Sinh viên' }).first().click(); await p.waitForTimeout(1800); }, 'QA Sinh Viên S1'],
    ['EMP', { email: mail('emp'), pw: 'Employer@123' }, async (p) => { await toWorkspace(p); }, COMPANY],
    ['ADM', { email: 'admin.test@vlu.edu.vn', pw: 'Jobnest@2026' }, async (p) => { await toWorkspace(p); }, 'admin.test@vlu.edu.vn'],
  ]) {
    await tc(`TC_LOGOUT_${pre}_005`, async () => {
      const p = await open(who); await enter(p);
      const before = (await body(p)).includes(marker);
      const avatar = p.locator('header button[aria-haspopup="menu"]').last(); await avatar.click(); await p.waitForTimeout(500);
      await p.getByText('Đăng xuất', { exact: true }).last().click(); await p.waitForTimeout(1500);
      const confirm = p.getByRole('button', { name: /^(Đăng xuất|Xác nhận)$/ }); if (await confirm.count()) { await confirm.last().click().catch(() => {}); await p.waitForTimeout(1200); }
      await p.goBack().catch(() => {}); await p.waitForTimeout(1800);
      const after = (await body(p)).includes(marker); const guest = await p.locator('header button', { hasText: 'Đăng nhập' }).count();
      await shot(p, 'logout_back_' + pre); await p.context().close();
      await wait(1100);
      return check(before && !after && guest > 0, `Trước khi đăng xuất thấy "${marker}"; đăng xuất + Back: không còn, về trạng thái khách`, `trước=${before} sau Back=${after} nút Đăng nhập=${guest}`);
    });
  }
  await b.close();

  sql(`DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'qa-%-${R}@example.test'); DELETE FROM jobs WHERE title LIKE '[QA-AUTO ${R}%'; DELETE FROM users WHERE email LIKE 'qa-%-${R}@example.test';`);
  require('fs').writeFileSync(__dirname + '/strict_checks.json', JSON.stringify(results, null, 1));
  console.log(results.filter(r => r.status === 'PASS').length + '/' + results.length + ' PASS');
})().catch(e => { console.error(e); process.exit(1); });
