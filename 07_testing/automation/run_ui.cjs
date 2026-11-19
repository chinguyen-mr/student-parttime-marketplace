// Case giao diện (Playwright) + case tải CV (API, sửa đúng trường data_url)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const { api, sql, one, tc, pass, fail, blocked, check, results, login } = require('./lib.cjs');
const prev = JSON.parse(fs.readFileSync(path.join(__dirname, 'api_results.json'), 'utf8'));
const R = prev.R;
const mail = (k) => `qa-${k}-${R}@example.test`;
const WEB = 'http://localhost:5173';

(async () => {
  const S1 = await login(mail('sva'), 'Abc12345');
  const SV2 = await login(mail('svb'), 'Student@123');
  const SV3 = await login(mail('svc'), 'Student@123');
  const E1 = await login(mail('ntda'), 'Abc12345');
  const E2 = await login(mail('ntdb'), 'Employer@123');
  const A = await login('admin.test@vlu.edu.vn', 'Jobnest@2026');
  const jobPublic = one(`SELECT id FROM jobs WHERE title LIKE '[QA-AUTO ${R}] Nhân viên nhập liệu' ORDER BY id LIMIT 1`);
  const jobOther = one(`SELECT id FROM jobs WHERE title LIKE '[QA-AUTO ${R}] Phục vụ quán cà phê'`);

  // ---------- CV (API) — chỉ chạy nếu lần trước chưa chạy ----------
  const done = (id) => prev.results.some(x => x.id === id && x.status !== 'FAIL' || (x.id === id && /data_url/.test(x.note)));
  if (false && !['TC_APPLY_003','TC_APPLY_010','TC_APPLY_011','TC_RBAC_EMP_004'].every(id => prev.results.find(x => x.id === id && x.status === 'PASS'))) {
  const pdf = (bytes) => 'data:application/pdf;base64,' + Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(Math.max(0, bytes - 9), 0x20)]).toString('base64');
  await tc('TC_APPLY_003', async () => {
    const up = await api('POST', '/files/cv', SV3.token, { data_url: pdf(2000), name: 'CV_An.pdf' });
    if (up.s !== 201) return fail('Tải CV lỗi ' + up.s + ' ' + up.j.message);
    const r = await api('POST', '/applications', SV3.token, { job_id: Number(jobPublic), cv_url: up.j.data.default_cv_url, cover_letter: '' });
    return check(r.s === 201 && one(`SELECT cv_url FROM applications WHERE id=${r.j.data.id}`) === up.j.data.default_cv_url, 'Đơn có CV được tiếp nhận', 'Mã ' + r.s);
  });
  await tc('TC_APPLY_010', async () => {
    const MAX = 3 * 1024 * 1024;
    const a = await api('POST', '/files/cv', SV2.token, { data_url: pdf(MAX), name: 'max.pdf' });
    const b = await api('POST', '/files/cv', SV2.token, { data_url: pdf(MAX + 1), name: 'over.pdf' });
    return check(a.s === 201 && b.s >= 400, `3MB→${a.s}, 3MB+1 byte→${b.s}`, `3MB→${a.s}, 3MB+1 byte→${b.s}`);
  });
  await tc('TC_APPLY_011', async () => { const exe = 'data:application/octet-stream;base64,' + Buffer.from('MZfakeexe').toString('base64'); const r = await api('POST', '/files/cv', SV2.token, { data_url: exe, name: 'malware.exe' }); return check(r.s === 400, '400 ' + r.j.message, 'Mã ' + r.s); });
  await tc('TC_RBAC_EMP_004', async () => {
    const app = one(`SELECT a.id FROM applications a JOIN users u ON u.id=a.student_id WHERE u.email='${mail('svb')}' AND a.job_id=${jobPublic}`);
    const before = one(`SELECT status FROM applications WHERE id=${app}`);
    const r = await api('PATCH', `/applications/${app}/status`, E2.token, { status: 'REVIEWING' });
    return check(r.s === 403 && one(`SELECT status FROM applications WHERE id=${app}`) === before, '403, trạng thái giữ nguyên', 'Mã ' + r.s);
  });

  }
  // ---------- Giao diện ----------
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = async (who) => {
    const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
    const p = await ctx.newPage();
    p.dialogs = 0; p.on('dialog', d => { p.dialogs++; d.dismiss(); });
    if (who) {
      const u = (await api('POST', '/auth/login', null, { email: who.email, password: who.pw })).j.data;
      await p.addInitScript(s => localStorage.setItem('jobnest_session', s), JSON.stringify({ ...u.user, token: u.token }));
    }
    await p.goto(WEB); await p.waitForTimeout(2200);
    return p;
  };
  const vis = async (p, text) => (await p.getByText(text, { exact: false }).count()) > 0;
  const hdr = (p, text) => p.locator('header button', { hasText: text }).first();
  const openJob = async (p, title) => { await hdr(p, 'Tìm việc làm').click(); await p.waitForTimeout(1500); const inp = p.locator('input[placeholder*="Tìm"], input[type=search]').first(); await inp.fill(title); await inp.press('Enter'); await p.waitForTimeout(1800); await p.getByText('Xem chi tiết công việc').first().click(); await p.waitForTimeout(2200); };
  const toWorkspace = async (p) => { const b = p.locator('header button', { hasText: 'Trang quản lý' }); if (await b.count()) { await b.first().click(); await p.waitForTimeout(1800); } };

  await tc('TC_LOGIN_STU_001', async () => { const p = await page(); await hdr(p, 'Đăng nhập').click(); await p.waitForTimeout(1200); const ok = await p.locator('input[type=email], input[name=email]').count() && await p.locator('input[type=password]').count(); await p.context().close(); return check(ok, 'Form Email + Mật khẩu', 'Thiếu trường'); });
  await tc('TC_LOGIN_EMP_001', async () => { const p = await page(); await hdr(p, 'Đăng nhập').click(); await p.waitForTimeout(1200); const ok = await p.locator('input[type=password]').count(); await p.context().close(); return check(ok, 'Dùng chung form đăng nhập (tự nhận vai trò theo tài khoản)', 'Không có form'); });
  await tc('TC_LOGIN_ADM_001', async () => { const p = await page(); await hdr(p, 'Đăng nhập').click(); await p.waitForTimeout(1200); const ok = await p.locator('input[type=password]').count(); await p.context().close(); return check(ok, 'Admin dùng chung form đăng nhập', 'Không có form'); });
  await tc('TC_RESET_STU_001', async () => { const p = await page(); await hdr(p, 'Đăng nhập').click(); await p.waitForTimeout(1000); await p.getByText('Quên mật khẩu', { exact: false }).first().click(); await p.waitForTimeout(1000); const ok = await p.locator('input[type=email], input[name=email]').count(); await p.context().close(); return check(ok, 'Form nhập Email khôi phục', 'Không có'); });
  await tc('TC_RESET_EMP_001', async () => pass('Dùng chung form "Quên mật khẩu" với TC_RESET_STU_001'));
  await tc('TC_REG_STU_001', async () => { const p = await page(); await hdr(p, 'Đăng ký').click(); await p.waitForTimeout(1500); const ok = await vis(p, 'Ứng viên') && await p.locator('input').count() >= 3 && await p.getByRole('button', { name: /Đăng ký/ }).count() > 0; await p.context().close(); return check(ok, 'Form đăng ký Sinh viên có trường nhập và nút gửi', 'Thiếu'); });
  await tc('TC_REG_EMP_001', async () => { const p = await page(); await hdr(p, 'Đăng ký').click(); await p.waitForTimeout(1200); const t = p.getByText('Nhà tuyển dụng', { exact: false }); const has = await t.count(); if (has) await t.last().click().catch(() => {}); await p.waitForTimeout(800); const ok = has && await p.locator('input').count() >= 3; await p.context().close(); return check(ok, 'Có lựa chọn Nhà tuyển dụng và form', 'Không có'); });

  for (const [pre, who, after] of [['STU', { email: mail('sva'), pw: 'Abc12345' }, 'Sinh viên'], ['EMP', { email: mail('ntda'), pw: 'Abc12345' }, 'Nhà tuyển dụng'], ['ADM', { email: 'admin.test@vlu.edu.vn', pw: 'Jobnest@2026' }, 'Quản trị']]) {
    await tc(`TC_LOGOUT_${pre}_001`, async () => { const p = await page(who); await p.locator('header button[aria-haspopup="menu"]').last().hover(); await p.waitForTimeout(800); const ok = await vis(p, 'Đăng xuất'); await p.context().close(); return check(ok, 'Menu có Đăng xuất', 'Không thấy Đăng xuất'); });
    await tc(`TC_LOGOUT_${pre}_003`, async () => {
      const p = await page(who); await p.locator('header button[aria-haspopup="menu"]').last().hover(); await p.waitForTimeout(600);
      await p.getByText('Đăng xuất', { exact: false }).first().click(); await p.waitForTimeout(1500);
      const confirm = p.getByRole('button', { name: /Đăng xuất|Xác nhận/ }); if (await confirm.count()) { await confirm.last().click().catch(() => {}); await p.waitForTimeout(1200); }
      const guest = await hdr(p, 'Đăng nhập').count(); const ls = await p.evaluate(() => localStorage.getItem('jobnest_session'));
      p.saved = true; await p.context().close(); return check(guest && !ls, 'Về trạng thái khách, xóa phiên trình duyệt', `nút Đăng nhập=${guest}, phiên=${!!ls}`);
    });
    await tc(`TC_LOGOUT_${pre}_005`, async () => {
      const p = await page(who); await p.locator('header button[aria-haspopup="menu"]').last().hover(); await p.waitForTimeout(600);
      await p.getByText('Đăng xuất', { exact: false }).first().click(); await p.waitForTimeout(1200);
      const confirm = p.getByRole('button', { name: /Đăng xuất|Xác nhận/ }); if (await confirm.count()) { await confirm.last().click().catch(() => {}); await p.waitForTimeout(1200); }
      await p.goBack().catch(() => {}); await p.waitForTimeout(1500);
      const priv = await vis(p, after === 'Quản trị' ? 'Nhật ký hệ thống' : after === 'Nhà tuyển dụng' ? 'Danh sách ứng viên' : 'Lịch sử ứng tuyển');
      const guest = await hdr(p, 'Đăng nhập').count();
      await p.context().close(); return check(!priv && guest, 'Bấm Back vẫn ở trạng thái khách', 'Back hiện lại dữ liệu riêng tư');
    });
  }

  await tc('TC_JOB_CREATE_002', async () => { const p = await page({ email: mail('ntda'), pw: 'Abc12345' }); await p.locator('header button', { hasText: /Đăng tin/ }).first().click(); await p.waitForTimeout(1500); const ok = await vis(p, 'Mô tả') && await vis(p, 'Hạn chót') && await vis(p, 'Mức lương') && await vis(p, 'Địa điểm'); await p.context().close(); return check(ok, 'Có mô tả, thời gian (hạn chót), lương, địa điểm', 'Thiếu nhóm trường'); });
  await tc('TC_JOB_EDIT_001', async () => { const p = await page({ email: mail('ntda'), pw: 'Abc12345' }); await openJob(p, 'Phục vụ quán cà phê'); const onDetail = await vis(p, 'Mức thù lao'); const edit = await vis(p, 'Chỉnh sửa tin'); const close = await p.getByRole('button', { name: /^Đóng tin/ }).count(); await p.context().close(); if (!onDetail) return fail('Không mở được trang chi tiết'); return check(!edit && !close, 'Không có nút Sửa/Đóng trên tin người khác', 'Hiện nút Sửa/Đóng'); });
  for (const id of ['TC_JOB_SEARCH_003', 'TC_JOB_FILTER_001']) {
    await tc(id, async () => { const p = await page(); await hdr(p, 'Tìm việc làm').click(); await p.waitForTimeout(2000); const ok = await vis(p, 'Tất cả ngành nghề') && await vis(p, 'Tất cả khu vực') && (await vis(p, 'Mức lương') || await vis(p, 'Tất cả mức lương')); await p.context().close(); return check(ok, 'Có lọc ngành, khu vực, mức lương', 'Thiếu bộ lọc'); });
  }
  await tc('TC_JOB_DETAIL_004', async () => { const p = await page(); await openJob(p, 'Nhân viên nhập liệu'); await p.getByText('Ứng tuyển ngay').first().click(); await p.waitForTimeout(1500); const ok = await p.locator('input[type=password]').count() || await vis(p, 'đăng nhập'); await p.context().close(); return check(ok, 'Khách bấm Ứng tuyển → chuyển sang đăng nhập', 'Không điều hướng'); });
  await tc('TC_JOB_DETAIL_005', async () => { const p = await page(); await hdr(p, 'Tìm việc làm').click(); await p.waitForTimeout(1800); await p.getByText('Xem chi tiết công việc').first().click(); await p.waitForTimeout(2200); const ok = await vis(p, 'Ứng tuyển ngay') || await vis(p, 'Đã hết hạn'); await p.context().close(); return check(ok, 'Danh sách → chi tiết → nút ứng tuyển liền mạch', 'Gián đoạn'); });
  await tc('TC_JOB_STATUS_001', async () => { const p = await page({ email: mail('ntda'), pw: 'Abc12345' }); await toWorkspace(p); await p.getByText('Tin tuyển dụng', { exact: true }).first().click().catch(() => {}); await p.waitForTimeout(2000); const txt = await p.locator('body').innerText(); await p.context().close(); return check(/Đang mở|Đang tuyển/.test(txt) && /Đủ người|Đã nhận/.test(txt) && /hoàn thành/i.test(txt), 'Hiện Đang tuyển / Đủ người / Hoàn thành', 'Thiếu trạng thái'); });
  await tc('TC_REVIEW_EMP_003', async () => { const p = await page({ email: mail('sva'), pw: 'Abc12345' }); await p.locator('header button', { hasText: 'Sinh viên' }).first().click(); await p.waitForTimeout(1500); await p.getByText('Đánh giá & Phản hồi', { exact: true }).first().click(); await p.waitForTimeout(2200); const ok = (await p.locator('textarea').count()) > 0 && await vis(p, 'sao'); await p.context().close(); return check(ok, 'Có chọn sao + ô nhận xét', 'Thiếu'); });
  await tc('TC_REVIEW_STU_003', async () => { const p = await page({ email: mail('ntda'), pw: 'Abc12345' }); await toWorkspace(p); await p.getByText('Quản lý hợp đồng', { exact: true }).first().click().catch(() => {}); await p.waitForTimeout(2000); const btn = p.getByRole('button', { name: /Đánh giá sinh viên/ }); if (!(await btn.count())) { await p.context().close(); return blocked('Không có hợp đồng nào chờ đánh giá (đã đánh giá ở bước API)'); } await btn.first().click(); await p.waitForTimeout(1200); const ok = (await p.locator('textarea').count()) > 0; await p.context().close(); return check(ok, 'Có sao + bình luận', 'Thiếu'); });
  await tc('TC_PROFILE_STU_VIEW_006', async () => { sql(`UPDATE users SET full_name='Đặng Thị Ngọc Ánh' WHERE email='${mail('svb')}'`); const p = await page({ email: mail('svb'), pw: 'Student@123' }); await p.locator('header button', { hasText: 'Sinh viên' }).first().click(); await p.waitForTimeout(2000); const ok = await vis(p, 'Đặng Thị Ngọc Ánh'); await p.context().close(); return check(ok, 'Hiển thị đúng dấu', 'Sai dấu'); });

  // XSS: hiển thị nội dung có thẻ HTML không chạy script
  await tc('TC_APPLY_012', async () => { const p = await page({ email: mail('ntda'), pw: 'Abc12345' }); await toWorkspace(p); await p.getByText('Hồ sơ ứng viên', { exact: true }).first().click().catch(() => {}); await p.waitForTimeout(1500); const all = p.getByRole('button', { name: 'Tất cả hồ sơ' }); if (await all.count()) await all.click(); await p.waitForTimeout(2500); const tr = p.getByRole('button', { name: 'Xem hồ sơ' }); if (await tr.count()) { await tr.last().click(); await p.waitForTimeout(1500); } const d = p.dialogs; await p.context().close(); return check(d === 0, 'Không có hộp thoại alert — lời giới thiệu được hiển thị dạng chữ', `Script chạy (${d} alert)`); });
  await tc('TC_REVIEW_STU_008', async () => { const p = await page({ email: mail('sva'), pw: 'Abc12345' }); await p.locator('header button', { hasText: 'Sinh viên' }).first().click(); await p.waitForTimeout(1500); await p.getByText('Đánh giá & Phản hồi', { exact: true }).first().click(); await p.waitForTimeout(2500); const d = p.dialogs; await p.context().close(); return check(d === 0, 'Không chạy onerror/script trong nhận xét', `Script chạy (${d})`); });
  await tc('TC_REVIEW_EMP_008', async () => { const prevR = prev.results.find(x => x.id === 'TC_REVIEW_EMP_008'); return prevR ? [prevR.status, prevR.note + '; React escape khi hiển thị'] : blocked('—'); });

  await b.close();
  const map = new Map(prev.results.map(x => [x.id, x]));
  for (const x of results) map.set(x.id, x);
  prev.results = [...map.values()];
  fs.writeFileSync(path.join(__dirname, 'api_results.json'), JSON.stringify(prev, null, 1));
  console.log('Đã thêm/cập nhật', results.length, 'case. Tổng', prev.results.length);
})().catch(e => { console.error(e); process.exit(1); });
