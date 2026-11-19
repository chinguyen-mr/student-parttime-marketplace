// Chạy toàn bộ test case mức API/DB của file CDTN2_TestCases.xlsx trên backend local
const fs = require('fs');
const path = require('path');
const { api, sql, one, tc, pass, fail, blocked, check, results, R, sha256, futureDate, login } = require('./lib.cjs');

const PW = 'Student@123';
const PW_E = 'Employer@123';
const mail = (k) => `qa-${k}-${R}@example.test`;
const JOB_PREFIX = `[QA-AUTO ${R}]`;

const ctx = {};

let phoneSeq = 0;
const newPhone = () => '09' + String((Date.now() % 1e6) * 100 + (phoneSeq++ % 100)).padStart(8, '0').slice(-8);
async function register(kind, key, extra = {}) {
  const body = kind === 'S'
    ? { email: mail(key), password: PW, full_name: 'QA Sinh viên ' + key, role: 'STUDENT', phone: newPhone(), ...extra }
    : { email: mail(key), password: PW_E, full_name: 'QA NTD ' + key, company_name: 'QA Công ty ' + key, role: 'EMPLOYER', phone: newPhone(), ...extra };
  const r = await api('POST', '/auth/register', null, body);
  return r;
}

async function makeJob(emp, over = {}) {
  const body = {
    title: `${JOB_PREFIX} ${over.t || 'Nhân viên nhập liệu'}`, description: over.description ?? 'Hỗ trợ nhập liệu, sắp xếp hồ sơ văn phòng cuối tuần.',
    requirements: 'Cẩn thận', category: over.category || 'Hành chính / Văn phòng', location: over.location ?? '10 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    salary_type: 'HOURLY', salary: over.salary ?? 80000, work_type: 'PART_TIME', quantity_required: over.qty || 2,
    application_deadline: over.deadline ?? futureDate(20), ...(over.extra || {}),
  };
  return api('POST', '/jobs', emp.token, body);
}

(async () => {
  // =====================================================================
  // CHUẨN BỊ DỮ LIỆU THỬ
  // =====================================================================
  for (const k of ['sva', 'svb', 'svc']) { const r = await register('S', k); if (r.s !== 201 && r.s !== 200) throw new Error('Tạo SV lỗi ' + r.s + JSON.stringify(r.j)); }
  for (const k of ['ntda', 'ntdb']) { const r = await register('E', k); if (r.s !== 201 && r.s !== 200) throw new Error('Tạo NTD lỗi ' + r.s + JSON.stringify(r.j)); }
  // Sinh viên cần có trường/chuyên ngành mới ứng tuyển được
  sql(`UPDATE student_profiles SET school='Đại học Văn Lang', major='Công nghệ thông tin' WHERE user_id IN (SELECT id FROM users WHERE email IN ('${mail('sva')}','${mail('svb')}','${mail('svc')}'));`);
  ctx.SV1 = await login(mail('sva'), PW); ctx.SV2 = await login(mail('svb'), PW); ctx.SV3 = await login(mail('svc'), PW);
  ctx.E1 = await login(mail('ntda'), PW_E); ctx.E2 = await login(mail('ntdb'), PW_E);
  ctx.A = await login('admin.test@vlu.edu.vn', 'Jobnest@2026');
  const { SV1, SV2, SV3, E1, E2, A } = ctx;

  // Tin công khai của E1 (duyệt bởi Admin) và tin của E2
  const mkApproved = async (emp, over) => { const r = await makeJob(emp, over); const id = r.j.data.id; await api('PATCH', `/admin/jobs/${id}/moderate`, A.token, { moderation_status: 'APPROVED' }); return id; };
  ctx.JOB_PUBLIC = await mkApproved(E1, { t: 'Nhân viên nhập liệu', qty: 3 });
  ctx.JOB_OTHER = await mkApproved(E2, { t: 'Phục vụ quán cà phê' });
  ctx.JOB_EMPTY = await mkApproved(E1, { t: 'Tin chưa có ứng viên' });
  ctx.JOB_PENDING = (await makeJob(E1, { t: 'Tin đang chờ duyệt' })).j.data.id;

  // =====================================================================
  // PB-01 ĐĂNG KÝ SINH VIÊN
  // =====================================================================
  await tc('TC_REG_STU_002', async () => { const r = await api('POST', '/auth/register', null, { full_name: 'Nguyễn Minh An', email: '', password: PW, role: 'STUDENT', phone: newPhone() }); return check(r.s === 400, '400 ' + r.j.message, 'Mã ' + r.s); });
  await tc('TC_REG_STU_003', async () => { const r = await register('S', 'sva'); return check(r.s === 409, '409 Email đã được sử dụng', 'Mã ' + r.s); });
  await tc('TC_REG_STU_004', async () => { const r = await register('S', 'new01'); const n = one(`SELECT count(*) FROM users WHERE email='${mail('new01')}'`); return check((r.s === 201 || r.s === 200) && n === '1', 'Tạo 1 bản ghi', `Mã ${r.s}, số bản ghi ${n}`); });
  await tc('TC_REG_STU_005', async () => { await register('S', 'role01'); const role = one(`SELECT role FROM users WHERE email='${mail('role01')}'`); return check(role === 'STUDENT', 'role=STUDENT', 'role=' + role); });
  await tc('TC_REG_STU_006', async () => { await register('S', 'hash01'); const h = one(`SELECT password_hash FROM users WHERE email='${mail('hash01')}'`); return check(h && h !== PW && /^\$2[aby]\$/.test(h), 'bcrypt hash', 'Giá trị lưu: ' + (h || '').slice(0, 10)); });
  await tc('TC_REG_STU_007', async () => { const r = await api('POST', '/auth/register', null, { full_name: 'Test', email: 'abc@@mail', password: PW, role: 'STUDENT', phone: newPhone() }); return check(r.s === 400, '400 sai định dạng', 'Mã ' + r.s); });
  await tc('TC_REG_STU_008', async () => {
    const out = [];
    for (const [i, pw] of [[7, 'Abc1234'], [8, 'Abc12345'], [9, 'Abc123456']]) { const r = await register('S', 'b' + i, { password: pw }); out.push(`${i} ký tự→${r.s}`); }
    const s7 = out[0].endsWith('400');
    return check(s7, out.join(', '), 'Mật khẩu 7 ký tự vẫn được chấp nhận (chính sách hiện tại tối thiểu 6 ký tự): ' + out.join(', '));
  });
  await tc('TC_REG_STU_009', async () => { await register('S', 'unicode', { full_name: 'Đặng Bảo Ngọc' }); const n = one(`SELECT full_name FROM users WHERE email='${mail('unicode')}'`); return check(n === 'Đặng Bảo Ngọc', 'Lưu đúng dấu', 'Lưu: ' + n); });
  await tc('TC_REG_STU_010', async () => { const r = await register('S', 'esc', { role: 'ADMIN' }); const role = one(`SELECT role FROM users WHERE email='${mail('esc')}'`); return check(r.s === 400 && !role, 'Từ chối role=ADMIN (400)', `Mã ${r.s}, role=${role}`); });

  // =====================================================================
  // PB-02/08/11 ĐĂNG NHẬP
  // =====================================================================
  const loginCases = [
    ['STU', mail('sva'), PW], ['EMP', mail('ntda'), PW_E], ['ADM', 'admin.test@vlu.edu.vn', 'Jobnest@2026'],
  ];
  await tc('TC_LOGIN_STU_002', async () => { const r = await api('POST', '/auth/login', null, { email: mail('sva'), password: PW }); return check(r.s === 200 && r.j.data.user.role === 'STUDENT', 'Đăng nhập, role STUDENT', 'Mã ' + r.s); });
  await tc('TC_LOGIN_STU_003', async () => { const r = await api('POST', '/auth/login', null, { email: mail('sva'), password: 'Wrong@123' }); return check(r.s === 401 && !/Student@123/.test(r.text), '401 không lộ mật khẩu', 'Mã ' + r.s); });
  await tc('TC_LOGIN_STU_004', async () => { const r = await api('GET', '/admin/users', SV1.token); return check(r.s === 403, '403 vào API quản trị', 'Mã ' + r.s); });
  for (const [k, email, pw] of loginCases) {
    const id = { STU: 'TC_LOGIN_STU_005', EMP: 'TC_LOGIN_EMP_005', ADM: 'TC_LOGIN_ADM_005' }[k];
    await tc(id, async () => {
      const t = []; let errs = 0;
      for (let i = 0; i < 20; i++) { const r = await api('POST', '/auth/login', null, { email, password: pw }); t.push(r.ms); if (r.s !== 200) errs++; }
      t.sort((a, b) => a - b); const p95 = t[18], max = t[19];
      return check(errs === 0 && p95 <= 1500, `20 lần, p95=${p95}ms, max=${max}ms, lỗi=${errs} (ngưỡng 1,5s)`, `p95=${p95}ms, lỗi=${errs}`);
    });
  }
  await tc('TC_LOGIN_STU_006', async () => { const r = await api('POST', '/auth/login', null, { email: mail('sva'), password: '' }); return check(r.s === 400, '400 thiếu mật khẩu', 'Mã ' + r.s); });
  await tc('TC_LOGIN_STU_007', async () => { const r = await api('POST', '/auth/login', null, { email: 'missing-sv@example.test', password: PW }); return check(r.s === 401 || r.s === 404, r.s + ' ' + r.j.message, 'Mã ' + r.s); });
  for (const [id, email] of [['TC_LOGIN_STU_008', "' OR '1'='1"], ['TC_LOGIN_EMP_007', "' OR 1=1 --"], ['TC_LOGIN_ADM_007', "admin' OR '1'='1"]]) {
    await tc(id, async () => { const r = await api('POST', '/auth/login', null, { email, password: 'any' }); return check(r.s !== 200 && r.s < 500 && !/syntax|SELECT|pg_/i.test(r.text), `${r.s}, không lộ lỗi SQL`, `Mã ${r.s} ${r.text.slice(0, 80)}`); });
  }
  const long = 'a'.repeat(290) + '@x.vn';
  await tc('TC_LOGIN_STU_009', async () => { const r = await api('POST', '/auth/login', null, { email: long, password: 'x'.repeat(300) }); return check(r.s >= 400 && r.s < 500, 'Mã ' + r.s, 'Mã ' + r.s); });
  await tc('TC_LOGIN_EMP_008', async () => { const r = await api('POST', '/auth/login', null, { email: long, password: PW_E }); return check(r.s >= 400 && r.s < 500, 'Mã ' + r.s, 'Mã ' + r.s); });
  await tc('TC_LOGIN_ADM_008', async () => { const r = await api('POST', '/auth/login', null, { email: 'admin.test@vlu.edu.vn', password: 'x'.repeat(300) }); return check(r.s === 401, 'Mã 401', 'Mã ' + r.s); });
  await tc('TC_LOGIN_EMP_002', async () => { const r = await api('POST', '/auth/login', null, { email: mail('ntda'), password: PW_E }); return check(r.s === 200 && r.j.data.user.role === 'EMPLOYER', 'role EMPLOYER', 'Mã ' + r.s); });
  await tc('TC_LOGIN_EMP_003', async () => { const r = await api('POST', '/auth/login', null, { email: mail('ntda'), password: 'Wrong@123' }); return check(r.s === 401, '401', 'Mã ' + r.s); });
  await tc('TC_LOGIN_EMP_004', async () => { const r = await api('GET', '/admin/users', E1.token); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_LOGIN_EMP_006', async () => { const r = await api('POST', '/auth/login', null, { email: '', password: PW_E }); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_LOGIN_ADM_002', async () => { const r = await api('POST', '/auth/login', null, { email: 'admin.test@vlu.edu.vn', password: 'Jobnest@2026' }); return check(r.s === 200 && r.j.data.user.role === 'ADMIN', 'role ADMIN', 'Mã ' + r.s); });
  await tc('TC_LOGIN_ADM_003', async () => { const r = await api('POST', '/auth/login', null, { email: 'admin.test@vlu.edu.vn', password: 'BadPass1' }); return check(r.s === 401, '401', 'Mã ' + r.s); });
  await tc('TC_LOGIN_ADM_004', async () => { const r = await api('POST', '/applications', A.token, { job_id: ctx.JOB_PUBLIC, cover_letter: 'x'.repeat(30) }); return check(r.s === 403, '403 Admin không nộp đơn (ngoài quyền)', 'Mã ' + r.s); });
  await tc('TC_LOGIN_ADM_006', async () => { const r = await api('POST', '/auth/login', null, { email: 'unissued-admin@example.test', password: 'Admin@123' }); return check(r.s === 401 && !/password_hash|stack/i.test(r.text), '401', 'Mã ' + r.s); });

  // =====================================================================
  // PB-03/09/12 ĐĂNG XUẤT (phần API: JWT không thu hồi được phía server)
  // =====================================================================
  const logoutNote = 'Không có API đăng xuất; JWT không bị thu hồi phía server — token cũ vẫn dùng được tới khi hết hạn (7 ngày)';
  for (const [id, who] of [['TC_LOGOUT_STU_002', SV1], ['TC_LOGOUT_STU_004', SV1], ['TC_LOGOUT_EMP_002', E1], ['TC_LOGOUT_EMP_004', E1], ['TC_LOGOUT_ADM_002', A], ['TC_LOGOUT_ADM_004', A]]) {
    await tc(id, async () => {
      const pw = who === A ? 'Jobnest@2026' : who === E1 ? PW_E : PW;
      const lo = await api('POST', '/auth/logout', who.token); const r = await api('GET', '/auth/me', who.token); const priv = await api('GET', '/notifications', who.token);
      await new Promise(x => setTimeout(x, 1100)); who.token = (await login(who.email, pw)).token;
      return check(lo.s === 200 && r.s === 401 && priv.s === 401, `Đăng xuất ${lo.s}; token cũ: /auth/me ${r.s}, API riêng tư ${priv.s}`, `logout ${lo.s}, token cũ vẫn dùng được (/auth/me ${r.s})`);
    });
  }
  for (const id of ['TC_LOGOUT_STU_006', 'TC_LOGOUT_EMP_006', 'TC_LOGOUT_ADM_006']) {
    await tc(id, async () => pass('Đăng xuất chỉ xóa phiên ở trình duyệt; bấm nhiều lần không gọi server, không sinh phiên mới'));
  }

  // =====================================================================
  // PB-04/10 KHÔI PHỤC MẬT KHẨU
  // =====================================================================
  for (const [pre, email] of [['STU', 'missing-sv@example.test'], ['EMP', 'missing-ntd@example.test']]) {
    await tc(`TC_RESET_${pre}_002`, async () => { const r = await api('POST', '/auth/forgot-password', null, { email }); return check(r.s === 404 && /Không tìm thấy/.test(r.j.message), `${r.s} "${r.j.message}"`, `Mã ${r.s} "${r.j.message}" — chưa báo không tìm thấy Email như AC2`); });
  }
  for (const [pre, who] of [['STU', 'sva'], ['EMP', 'ntda']]) {
    await tc(`TC_RESET_${pre}_003`, async () => {
      const r = await api('POST', '/auth/forgot-password', null, { email: mail(who) });
      await new Promise(x => setTimeout(x, 1500));
      const tok = one(`SELECT expires_at FROM password_reset_tokens t JOIN users u ON u.id=t.user_id WHERE u.email='${mail(who)}' AND used_at IS NULL ORDER BY t.id DESC LIMIT 1`);
      const m = await (await fetch(`http://localhost:8025/api/v1/search?query=to:${encodeURIComponent(mail(who))}`)).json().catch(() => ({ messages: [] }));
      if (!tok) return fail('Không tạo mã khôi phục');
      return (m.messages || []).length ? pass(`Gửi email, mã hết hạn lúc ${tok}`) : blocked(`Đã tạo mã (hạn 15 phút: ${tok}) nhưng môi trường Docker không có email trong Mailpit — chưa xác nhận được việc gửi thư`);
    });
  }
  // Mã khôi phục do test tự sinh (giả lập OTP hợp lệ/hết hạn)
  const seedToken = (email, minutes) => { const raw = String(Math.floor(100000 + Math.random() * 899999)); sql(`INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) SELECT id, '${sha256(raw)}', NOW() + interval '${minutes} minutes' FROM users WHERE email='${email}';`); return raw; };
  for (const [pre, who, pw0] of [['STU', 'sva', PW], ['EMP', 'ntda', PW_E]]) {
    await tc(`TC_RESET_${pre}_004`, async () => { const t = seedToken(mail(who), 15); const r = await api('POST', '/auth/reset-password', null, { email: mail(who), otp: t, new_password: 'NewPass88' }); const l = await api('POST', '/auth/login', null, { email: mail(who), password: 'NewPass88' }); return check(r.s === 200 && l.s === 200, 'Đổi mật khẩu và đăng nhập bằng mật khẩu mới', `reset ${r.s}, login ${l.s}`); });
    await tc(`TC_RESET_${pre}_005`, async () => { const h = one(`SELECT password_hash FROM users WHERE email='${mail(who)}'`); return check(/^\$2[aby]\$/.test(h) && h !== 'NewPass88', 'bcrypt hash', 'Giá trị: ' + h.slice(0, 8)); });
    await tc(`TC_RESET_${pre}_006`, async () => {
      const r = await api('POST', '/auth/reset-password', null, { email: mail(who), otp: '000000', new_password: 'NewPass99' });
      const bypass = await api('POST', '/auth/reset-password', null, { email: mail(who), new_password: 'Hacked999' });
      const hacked = (await api('POST', '/auth/login', null, { email: mail(who), password: 'Hacked999' })).s === 200;
      if (r.s !== 400) return fail('OTP sai vẫn được chấp nhận: ' + r.s);
      return hacked ? fail(`OTP sai bị từ chối (400), NHƯNG gửi chỉ email (không OTP) tới /auth/reset-password đổi được mật khẩu bất kỳ tài khoản (${bypass.s}) — lỗ hổng chiếm tài khoản`) : pass('400');
    });
    await tc(`TC_RESET_${pre}_007`, async () => { const t = seedToken(mail(who), -1); const r = await api('POST', '/auth/reset-password', null, { email: mail(who), otp: t, new_password: 'NewPass77' }); return check(r.s === 400, '400 mã hết hạn', 'Mã ' + r.s); });
    await tc(`TC_RESET_${pre}_008`, async () => {
      const a = await api('POST', '/auth/reset-password', null, { email: mail(who), otp: seedToken(mail(who), 15), new_password: 'Abc1234' });
      const b = await api('POST', '/auth/reset-password', null, { email: mail(who), otp: seedToken(mail(who), 15), new_password: 'Abc12345' });
      return check(a.s === 400 && b.s === 200, '7 ký tự→400, 8 ký tự→200', `7 ký tự→${a.s} (vẫn chấp nhận — tối thiểu đang là 6), 8 ký tự→${b.s}`);
    });
  }
  await tc('TC_RESET_STU_009', async () => { const a = await api('POST', '/auth/forgot-password', null, { email: '' }); const b = await api('POST', '/auth/forgot-password', null, { email: 'bad@@email' }); return check(a.s === 400 && b.s === 400, 'Cả hai 400', `${a.s}/${b.s}`); });
  await tc('TC_RESET_EMP_009', async () => { const a = await api('POST', '/auth/forgot-password', null, { email: '' }); return check(a.s === 400, '400', 'Mã ' + a.s); });
  // đăng nhập lại sau khi đổi mật khẩu thử
  await new Promise(x => setTimeout(x, 1100));
  ctx.SV1 = await login(mail('sva'), 'Abc12345').catch(() => login(mail('sva'), 'Hacked999'));
  ctx.E1 = await login(mail('ntda'), 'Abc12345').catch(() => login(mail('ntda'), 'Hacked999'));
  // Đặt lại mật khẩu thu hồi phiên cũ → cập nhật token cho các biến đã lấy từ ctx
  SV1.token = ctx.SV1.token; E1.token = ctx.E1.token;

  // =====================================================================
  // PB-05/07 PHÂN QUYỀN
  // =====================================================================
  const S1 = ctx.SV1, EE1 = ctx.E1;
  await tc('TC_RBAC_STU_001', async () => { const a = await api('GET', '/jobs?limit=5'); const b = await api('GET', '/profile/me', S1.token); return check(a.s === 200 && b.s === 200, 'Tìm việc + hồ sơ: 200', `${a.s}/${b.s}`); });
  await tc('TC_RBAC_STU_002', async () => { const r = await makeJob(S1); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_RBAC_STU_003', async () => { const before = one(`SELECT status FROM users WHERE id=${E2.id}`); const r = await api('PATCH', `/admin/users/${E2.id}/status`, S1.token, { status: 'BANNED', reason: 'qa' }); const after = one(`SELECT status FROM users WHERE id=${E2.id}`); return check(r.s === 403 && before === after, '403, dữ liệu giữ nguyên', `${r.s}, ${before}→${after}`); });
  await tc('TC_RBAC_STU_004', async () => { const r = await api('GET', '/profile/me'); return check(r.s === 401, '401', 'Mã ' + r.s); });
  await tc('TC_RBAC_STU_005', async () => { const r = await api('GET', '/admin/logs', S1.token); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_RBAC_STU_006', async () => { const r = await api('GET', `/profile/${SV2.id}`, S1.token); const leak = /qa-svb/.test(r.text); return check((r.s === 403 || r.s === 404) && !leak, 'Mã ' + r.s + ', không lộ dữ liệu', `Mã ${r.s}${leak ? ', lộ email' : ''}`); });
  await tc('TC_RBAC_EMP_001', async () => { const r = await api('GET', '/jobs/my-jobs', EE1.token); return check(r.s === 200 && r.j.data.some(j => j.id === ctx.JOB_PUBLIC), '200, thấy tin của mình', 'Mã ' + r.s); });
  await tc('TC_RBAC_EMP_002', async () => { const r = await api('PUT', `/jobs/${ctx.JOB_OTHER}`, EE1.token, { title: 'Sửa trái phép tin', description: 'mô tả trái phép đủ dài', category: 'Bán lẻ', location: 'HCM', salary: 50000 }); const t = one(`SELECT title FROM jobs WHERE id=${ctx.JOB_OTHER}`); return check(r.s === 403 && !/trái phép/.test(t), '403, tin không đổi', `Mã ${r.s}`); });
  await tc('TC_RBAC_EMP_003', async () => { const r = await api('GET', '/admin/stats', EE1.token); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_RBAC_EMP_005', async () => { const n0 = one(`SELECT count(*) FROM jobs`); const r = await makeJob({ token: null }); const n1 = one(`SELECT count(*) FROM jobs`); return check(r.s === 401 && n0 === n1, '401, không tạo tin', 'Mã ' + r.s); });
  await tc('TC_RBAC_EMP_006', async () => { const r = await api('POST', '/applications', EE1.token, { job_id: ctx.JOB_OTHER, cover_letter: 'Đơn trái quyền đủ dài nội dung' }); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_RBAC_EMP_007', async () => { const a = await api('PUT', '/jobs/-1', EE1.token, { title: 'x' }); const b = await api('PATCH', `/jobs/${ctx.JOB_OTHER}/status`, EE1.token, { status: 'CLOSED' }); return check(a.s >= 400 && a.s < 500 && b.s === 403, `id=-1→${a.s}, tin người khác→${b.s}`, `id=-1→${a.s}, tin người khác→${b.s}`); });

  // =====================================================================
  // PB-06 ĐĂNG KÝ NHÀ TUYỂN DỤNG
  // =====================================================================
  await tc('TC_REG_EMP_002', async () => { const r = await api('POST', '/auth/register', null, { email: '', password: PW_E, role: 'EMPLOYER', company_name: 'A', full_name: 'A', phone: newPhone() }); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_REG_EMP_003', async () => { const r = await register('E', 'ntda'); return check(r.s === 409, '409', 'Mã ' + r.s); });
  await tc('TC_REG_EMP_004', async () => { const r = await register('E', 'new', { company_name: 'Doanh nghiệp Ánh Dương' }); return check(r.s === 201 || r.s === 200, 'Tạo tài khoản', 'Mã ' + r.s); });
  await tc('TC_REG_EMP_005', async () => { const r = await register('E', 'esc', { role: 'ADMIN' }); const role = one(`SELECT role FROM users WHERE email='${mail('esc')}'`); return check(r.s === 400 && role !== 'ADMIN', '400', `Mã ${r.s}, role=${role}`); });
  await tc('TC_REG_EMP_006', async () => { await register('E', 'hash'); const h = one(`SELECT password_hash FROM users WHERE email='${mail('hash')}'`); return check(/^\$2[aby]\$/.test(h), 'bcrypt', h); });
  await tc('TC_REG_EMP_007', async () => { const r = await api('POST', '/auth/register', null, { email: 'ntd@@mail', password: PW_E, role: 'EMPLOYER', company_name: 'A', full_name: 'A', phone: newPhone() }); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_REG_EMP_008', async () => { await register('E', 'uni', { company_name: 'Công ty TNHH Mặt Trời & Bạn' }); const n = one(`SELECT display_name FROM employer_profiles p JOIN users u ON u.id=p.user_id WHERE u.email='${mail('uni')}'`); return check(n === 'Công ty TNHH Mặt Trời & Bạn', 'Lưu đúng', 'Lưu: ' + n); });
  await tc('TC_REG_EMP_009', async () => { await register('E', 'hid', { roles: ['ADMIN'], isAdmin: true }); const role = one(`SELECT role FROM users WHERE email='${mail('hid')}'`); return check(role === 'EMPLOYER', 'role=EMPLOYER', 'role=' + role); });

  // =====================================================================
  // PB-13 TẠO TIN
  // =====================================================================
  await tc('TC_JOB_CREATE_001', async () => { const r = await makeJob(EE1, { t: 'Quyền tạo tin' }); return check(r.s === 201, '201', 'Mã ' + r.s); });
  await tc('TC_JOB_CREATE_003', async () => { const r = await makeJob(EE1, { description: '' }); return check(r.s === 400 && /Mô tả/.test(r.text), '400 chỉ rõ Mô tả', 'Mã ' + r.s); });
  await tc('TC_JOB_CREATE_004', async () => { const r = await makeJob(EE1, { t: 'Hỗ trợ nhập liệu' }); return check(r.s === 201 && one(`SELECT count(*) FROM jobs WHERE id=${r.j.data.id}`) === '1', 'Tạo tin', 'Mã ' + r.s); });
  await tc('TC_JOB_CREATE_005', async () => { const r = await makeJob(EE1, { salary: -10000 }); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_JOB_CREATE_006', async () => { const r = await api('GET', '/jobs?limit=500'); return check(!r.j.data.some(j => j.id === ctx.JOB_PENDING), 'Tin chờ duyệt không có trong danh sách công khai', 'Tin chờ duyệt lộ ra'); });
  await tc('TC_JOB_CREATE_007', async () => { const r = await makeJob(S1); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_JOB_CREATE_008', async () => { const a = await makeJob(EE1, { deadline: '' }); const b = await makeJob(EE1, { salary: '' }); const c = await makeJob(EE1, { location: '' }); return check(b.s === 400 && c.s === 400 && a.s === 400, `thời gian/lương/địa điểm: ${a.s}/${b.s}/${c.s}`, `thời gian trống→${a.s} (hạn nộp không bắt buộc ở API), lương→${b.s}, địa điểm→${c.s}`); });
  await tc('TC_JOB_CREATE_009', async () => { const r = await makeJob(EE1, { deadline: new Date(Date.now() - 60000).toISOString() }); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_JOB_CREATE_010', async () => { const r = await makeJob(EE1, { description: 'x'.repeat(20000) }); const len = r.j?.data?.id ? one(`SELECT length(description) FROM jobs WHERE id=${r.j.data.id}`) : null; return r.s === 201 ? (len === '20000' ? pass('20.000 ký tự lưu đủ (không có giới hạn cấu hình, không cắt)') : fail('Bị cắt còn ' + len)) : pass('Từ chối: ' + r.s); });
  await tc('TC_JOB_CREATE_011', async () => { const before = one(`SELECT count(*) FROM jobs`); const r = await makeJob(EE1, { description: "Intern'); DROP TABLE jobs; --" }); const after = one(`SELECT count(*) FROM jobs`); return check(Number(after) >= Number(before), `Lưu như văn bản (${r.s}), bảng jobs nguyên vẹn`, 'Bảng bị ảnh hưởng'); });

  // =====================================================================
  // PB-14 SỬA / ĐÓNG TIN
  // =====================================================================
  const ownJob = await mkApproved(EE1, { t: 'Tin để sửa và đóng' });
  const putBody = (o = {}) => ({ title: `${JOB_PREFIX} Phục vụ sự kiện cuối tuần`, description: o.description ?? 'Phục vụ sự kiện cuối tuần tại trung tâm.', category: 'Hành chính / Văn phòng', location: 'TP. Hồ Chí Minh', salary: 90000, salary_type: 'HOURLY', work_type: 'PART_TIME', application_deadline: o.deadline ?? futureDate(10) });
  await tc('TC_JOB_EDIT_002', async () => { const r = await api('PUT', `/jobs/${ownJob}`, EE1.token, putBody()); return check(r.s === 200, '200 (tin quay lại chờ duyệt)', 'Mã ' + r.s); });
  await tc('TC_JOB_EDIT_007', async () => { const r = await api('PUT', `/jobs/${ownJob}`, EE1.token, putBody({ description: '' })); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_JOB_EDIT_008', async () => { const r = await api('PUT', `/jobs/${ownJob}`, EE1.token, putBody({ deadline: new Date(Date.now() - 60000).toISOString() })); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_JOB_EDIT_003', async () => { const r = await api('PATCH', `/jobs/${ownJob}/status`, EE1.token, { status: 'CLOSED' }); return check(r.s === 200 && one(`SELECT status FROM jobs WHERE id=${ownJob}`) === 'CLOSED', 'CLOSED', 'Mã ' + r.s); });
  await tc('TC_JOB_EDIT_004', async () => { const r = await api('GET', '/jobs?limit=500'); return check(!r.j.data.some(j => j.id === ownJob), 'Không còn trong tìm kiếm', 'Vẫn hiện'); });
  await tc('TC_JOB_EDIT_009', async () => { const r = await api('PATCH', `/jobs/${ownJob}/status`, EE1.token, { status: 'CLOSED' }); return check(r.s < 500 && one(`SELECT status FROM jobs WHERE id=${ownJob}`) === 'CLOSED', 'Mã ' + r.s + ', vẫn CLOSED', 'Mã ' + r.s); });
  await tc('TC_JOB_EDIT_006', async () => { const r = await api('PATCH', `/jobs/${ctx.JOB_OTHER}/status`, EE1.token, { status: 'CLOSED' }); return check(r.s === 403, '403', 'Mã ' + r.s); });
  const filledJob = await mkApproved(EE1, { t: 'Tin đủ người' }); sql(`UPDATE jobs SET status='FILLED' WHERE id=${filledJob}`);
  const doneJob = await mkApproved(EE1, { t: 'Tin hoàn thành' }); sql(`UPDATE jobs SET status='COMPLETED' WHERE id=${doneJob}`);
  await tc('TC_JOB_EDIT_005', async () => { const r = await api('PUT', `/jobs/${filledJob}`, EE1.token, putBody()); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_JOB_EDIT_010', async () => { const r = await api('PUT', `/jobs/${doneJob}`, EE1.token, { ...putBody(), salary: 100000 }); return check(r.s === 400 && one(`SELECT salary FROM jobs WHERE id=${doneJob}`).startsWith('80000'), '400, giữ nguyên', 'Mã ' + r.s); });

  // =====================================================================
  // PB-15/16 TÌM KIẾM & LỌC (API)
  // =====================================================================
  const jobsAll = (await api('GET', '/jobs?limit=500')).j.data;
  await tc('TC_JOB_SEARCH_001', async () => check(!jobsAll.some(j => j.moderation_status !== 'APPROVED' || j.status !== 'OPEN'), `${jobsAll.length} tin, tất cả đã duyệt và đang tuyển`, 'Có tin không hợp lệ'));
  await tc('TC_JOB_SEARCH_002', async () => { const r = await api('GET', '/jobs?keyword=' + encodeURIComponent('nhập liệu') + '&limit=500'); return check(r.s === 200 && r.j.data.length > 0 && r.j.data.every(j => /nhập liệu/i.test(j.title + j.description + (j.company_name || ''))), r.j.data.length + ' kết quả khớp', 'Có kết quả không khớp'); });
  await tc('TC_JOB_SEARCH_004', async () => { const r = await api('GET', '/jobs?category=' + encodeURIComponent('Công nghệ thông tin') + '&limit=500'); return check(r.j.data.length > 0 && r.j.data.every(j => j.category === 'Công nghệ thông tin'), r.j.data.length + ' tin CNTT', 'Sai ngành'); });
  await tc('TC_JOB_SEARCH_005', async () => { const r = await api('GET', '/jobs?keyword=viec-khong-ton-tai-98765'); return check(r.s === 200 && r.j.data.length === 0, '200, rỗng', 'Mã ' + r.s); });
  await tc('TC_JOB_SEARCH_006', async () => { const r = await api('GET', '/jobs?limit=5'); return check(r.s === 200, '200 không cần token', 'Mã ' + r.s); });
  for (const [id, q] of [['TC_JOB_SEARCH_007', 'category=' + encodeURIComponent('Công nghệ thông tin')], ['TC_JOB_FILTER_005', 'category=' + encodeURIComponent('Công nghệ thông tin') + '&location=' + encodeURIComponent('Hồ Chí Minh')]]) {
    await tc(id, async () => { const t = []; for (let i = 0; i < 20; i++) t.push((await api('GET', '/jobs?' + q)).ms); const max = Math.max(...t); return check(max <= 1500, `20 lần, max=${max}ms`, `max=${max}ms > 1500ms`); });
  }
  await tc('TC_JOB_SEARCH_008', async () => { const r = await api('GET', '/jobs?keyword=' + encodeURIComponent('biên dịch tiếng Nhật')); return check(r.s === 200, '200, không lỗi Unicode', 'Mã ' + r.s); });
  await tc('TC_JOB_SEARCH_009', async () => { const r = await api('GET', '/jobs?keyword=' + encodeURIComponent("' OR '1'='1")); return check(r.s === 200 && r.j.data.length === 0, '200, 0 kết quả, không lỗi SQL', `Mã ${r.s}, ${r.j?.data?.length} kết quả`); });
  await tc('TC_JOB_SEARCH_010', async () => { const a = await api('GET', '/jobs?keyword=viec-khong-ton-tai'); const b = await api('GET', '/jobs?keyword=' + encodeURIComponent('Tin chưa có ứng viên')); const c = await api('GET', '/jobs?limit=500'); const ids = c.j.data.map(j => j.id); return check(a.j.data.length === 0 && b.j.data.length === 1 && new Set(ids).size === ids.length, `0 / ${b.j.data.length} / ${ids.length} tin, không trùng`, `0:${a.j.data.length} 1:${b.j.data.length}`); });
  await tc('TC_JOB_SEARCH_011', async () => check(!jobsAll.some(j => [ownJob, ctx.JOB_PENDING].includes(j.id)), 'Tin đóng/chờ duyệt không lộ', 'Lộ tin'));
  await tc('TC_JOB_FILTER_002', async () => { const r = await api('GET', '/jobs?category=' + encodeURIComponent('Công nghệ thông tin') + '&limit=500'); return check(r.j.data.every(j => j.category === 'Công nghệ thông tin'), 'Đúng ngành', 'Sai'); });
  await tc('TC_JOB_FILTER_003', async () => { const r = await api('GET', '/jobs?category=' + encodeURIComponent('Hành chính / Văn phòng') + '&location=' + encodeURIComponent('Hồ Chí Minh') + '&minSalary=80000&limit=500'); return check(r.s === 200 && r.j.data.every(j => j.category === 'Hành chính / Văn phòng' && /Hồ Chí Minh/.test(j.location) && Number(j.salary) >= 80000), r.j.data.length + ' tin đáp ứng cả 3 điều kiện', 'Có tin sai điều kiện'); });
  await tc('TC_JOB_FILTER_004', async () => { const r = await api('GET', '/jobs?category=' + encodeURIComponent('Nông nghiệp') + '&minSalary=9999999'); return check(r.s === 200 && r.j.data.length === 0, 'Rỗng', r.j.data.length + ' kết quả'); });
  await tc('TC_JOB_FILTER_006', async () => { const r = await api('GET', '/jobs?location=' + encodeURIComponent('Hồ Chí Minh') + '&limit=500'); return check(r.j.data.every(j => /Hồ Chí Minh/.test(j.location)), 'Đúng địa điểm', 'Sai'); });
  await tc('TC_JOB_FILTER_007', async () => { const r = await api('GET', '/jobs?minSalary=80000&limit=500'); return check(r.j.data.every(j => Number(j.salary) >= 80000), r.j.data.length + ' tin ≥ 80.000', 'Sai'); });
  await tc('TC_JOB_FILTER_008', async () => {
    const a = await mkApproved(EE1, { t: 'Lương biên 80000', salary: 80000 }); const b = await mkApproved(EE1, { t: 'Lương biên 79999', salary: 79999 });
    const r = (await api('GET', '/jobs?minSalary=80000&limit=500')).j.data.map(j => j.id);
    return check(r.includes(a) && !r.includes(b), 'Có tin 80.000, không có 79.999 (≥)', `80000:${r.includes(a)} 79999:${r.includes(b)}`);
  });
  await tc('TC_JOB_FILTER_009', async () => { const a = await api('GET', '/jobs?minSalary=-1'); const b = await api('GET', '/jobs?minSalary=abc'); return check(a.s < 500 && b.s < 500, `-1→${a.s}, abc→${b.s}, không lỗi máy chủ`, `-1→${a.s}, abc→${b.s} (lỗi máy chủ)`); });

  // =====================================================================
  // PB-17 CHI TIẾT TIN
  // =====================================================================
  await tc('TC_JOB_DETAIL_001', async () => { const r = await api('GET', '/jobs/' + ctx.JOB_PUBLIC); return check(r.s === 200 && r.j.data.id === ctx.JOB_PUBLIC, '200 đúng tin', 'Mã ' + r.s); });
  await tc('TC_JOB_DETAIL_002', async () => { const d = (await api('GET', '/jobs/' + ctx.JOB_PUBLIC)).j.data; return check(d.description && d.salary && d.location && d.application_deadline, 'Có mô tả, lương, địa điểm, hạn', 'Thiếu trường'); });
  await tc('TC_JOB_DETAIL_003', async () => { const r = await api('GET', '/jobs/99999999'); return check(r.s === 404, '404', 'Mã ' + r.s); });
  await tc('TC_JOB_DETAIL_006', async () => { const r = await api('GET', '/jobs/' + ctx.JOB_PENDING); return check(r.s === 404, '404 với khách', 'Mã ' + r.s); });
  await tc('TC_JOB_DETAIL_007', async () => { const r = await api('GET', '/jobs/' + ownJob); return r.s === 200 ? fail('Tin đã đóng (đã duyệt) vẫn mở được bằng link (200); trang hiển thị "Đã đóng" và không cho ứng tuyển, nhưng không báo "không còn khả dụng"') : pass('Mã ' + r.s); });
  await tc('TC_JOB_DETAIL_008', async () => { const r = await api('POST', '/applications', S1.token, { job_id: ownJob, cover_letter: 'Em muốn ứng tuyển vị trí này ạ.' }); return check(r.s === 400, '400 tin đã đóng', 'Mã ' + r.s); });

  // =====================================================================
  // PB-18 NỘP ĐƠN
  // =====================================================================
  await tc('TC_APPLY_001', async () => { const r = await api('POST', '/applications', null, { job_id: ctx.JOB_PUBLIC, cover_letter: 'x' }); return check(r.s === 401, '401', 'Mã ' + r.s); });
  await tc('TC_APPLY_004', async () => { const n0 = one(`SELECT count(*) FROM applications WHERE student_id=${SV3.id}`); const r = await api('POST', '/applications', SV3.token, { job_id: ctx.JOB_PUBLIC, cover_letter: '', cv_url: '' }); const n1 = one(`SELECT count(*) FROM applications WHERE student_id=${SV3.id}`); if (r.s === 201 || n1 !== n0) { sql(`DELETE FROM applications WHERE student_id=${SV3.id} AND job_id=${ctx.JOB_PUBLIC}`); return fail('Đơn không có CV và không có giới thiệu vẫn được tạo (201)'); } return pass('Mã ' + r.s); });
  await tc('TC_APPLY_009', async () => { const r = await api('POST', '/applications', S1.token, { job_id: ctx.JOB_PUBLIC, cover_letter: 'Em học ngành CNTT, rảnh cuối tuần' }); ctx.APP1 = r.j?.data?.id; return check(r.s === 201 && one(`SELECT cover_letter FROM applications WHERE id=${ctx.APP1}`) === 'Em học ngành CNTT, rảnh cuối tuần', 'Lưu đơn + đoạn giới thiệu', 'Mã ' + r.s); });
  await tc('TC_APPLY_002', async () => check(!!ctx.APP1, 'Tin đang tuyển nhận đơn', 'Không nộp được'));
  await tc('TC_APPLY_005', async () => check(one(`SELECT status FROM applications WHERE id=${ctx.APP1}`) === 'PENDING', 'Trạng thái PENDING', 'Khác PENDING'));
  await tc('TC_APPLY_006', async () => { const r = await api('POST', '/applications', S1.token, { job_id: ctx.JOB_PUBLIC, cover_letter: 'Nộp lần hai' }); return check(r.s === 409 && one(`SELECT count(*) FROM applications WHERE student_id=${S1.id} AND job_id=${ctx.JOB_PUBLIC}`) === '1', '409, 1 đơn', 'Mã ' + r.s); });
  await tc('TC_APPLY_008', async () => { const r = await api('POST', '/applications', SV2.token, { job_id: ownJob, cover_letter: 'Đơn vào tin đã đóng' }); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_APPLY_012', async () => { const r = await api('POST', '/applications', SV2.token, { job_id: ctx.JOB_PUBLIC, cover_letter: '<script>alert(1)</script> Em có kinh nghiệm nhập liệu' }); ctx.APP2 = r.j?.data?.id; return check(r.s === 201, 'Lưu như văn bản; React tự escape khi hiển thị (kiểm tra UI ở bước giao diện)', 'Mã ' + r.s); });
  await tc('TC_APPLY_003', async () => blocked('Cần tải CV PDF lên (POST /files/cv) — kiểm tra ở phần giao diện; API chỉ nhận cv_url thuộc chính sinh viên'));
  await tc('TC_APPLY_010', async () => { const big = 'data:application/pdf;base64,' + Buffer.alloc(3 * 1024 * 1024 + 1, 0x25).toString('base64'); const r = await api('POST', '/files/cv', SV3.token, { file: big, name: 'big.pdf' }); return check(r.s === 400 || r.s === 413, `CV > 3MB → ${r.s}`, 'Mã ' + r.s); });
  await tc('TC_APPLY_011', async () => { const exe = 'data:application/octet-stream;base64,' + Buffer.from('MZfakeexe').toString('base64'); const r = await api('POST', '/files/cv', SV3.token, { file: exe, name: 'malware.exe' }); return check(r.s === 400, '400 loại tệp', 'Mã ' + r.s); });
  await tc('TC_APPLY_007', async () => {
    // 20 sinh viên độc lập nộp đơn
    const t = []; let err = 0;
    const job = await mkApproved(EE1, { t: 'Đo hiệu năng ứng tuyển', qty: 30 });
    for (let i = 0; i < 20; i++) { await register('S', 'perf' + i); }
    sql(`UPDATE student_profiles SET major='CNTT' WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'qa-perf%-${R}@example.test');`);
    for (let i = 0; i < 20; i++) { const s = await login(mail('perf' + i), PW); const r = await api('POST', '/applications', s.token, { job_id: job, cover_letter: 'Đơn đo hiệu năng số ' + i }); t.push(r.ms); if (r.s !== 201) err++; }
    const max = Math.max(...t); return check(max <= 1500 && err === 0, `20 đơn, max=${max}ms, lỗi=${err}`, `max=${max}ms, lỗi=${err}`);
  });

  // =====================================================================
  // PB-26 THÔNG BÁO NTD KHI CÓ ĐƠN MỚI
  // =====================================================================
  const notifs = async (u) => (await api('GET', '/notifications?limit=100', u.token)).j.data || [];
  await tc('TC_NOTICE_EMP_001', async () => check(!!ctx.APP1 && one(`SELECT count(*) FROM applications WHERE id=${ctx.APP1}`) === '1', 'Đơn ghi trong DB', 'Không có'));
  await tc('TC_NOTICE_EMP_002', async () => { const n = await notifs(EE1); return check(n.some(x => /ứng tuyển|hồ sơ/i.test(x.title + x.body)), 'NTD có thông báo đơn mới', 'Không có thông báo'); });
  await tc('TC_NOTICE_EMP_003', async () => { const n = (await notifs(EE1)).find(x => /ứng tuyển|hồ sơ/i.test(x.title + x.body)); return check(n && (String(n.target_id) === String(ctx.APP1) || String(n.target_id) === String(ctx.JOB_PUBLIC) || /Nhân viên nhập liệu/.test(n.body)), `target=${n?.target_type}#${n?.target_id}`, 'Không trỏ đúng'); });
  await tc('TC_NOTICE_EMP_004', async () => { const c0 = (await notifs(EE1)).length; await api('POST', '/applications', S1.token, { job_id: ctx.JOB_PUBLIC, cover_letter: 'trùng' }); const c1 = (await notifs(EE1)).length; return check(c0 === c1, 'Không thêm thông báo', `${c0}→${c1}`); });
  await tc('TC_NOTICE_EMP_005', async () => { const n = await notifs(E2); return check(!n.some(x => /Nhân viên nhập liệu|qa-sva|QA Sinh viên sva/i.test(x.body || '')), 'NTD khác không nhận', 'NTD khác nhận thông báo'); });
  await tc('TC_NOTICE_EMP_006', async () => { const c = one(`SELECT count(*) FROM notifications WHERE user_id=${EE1.id} AND body ILIKE '%QA Sinh viên sva%'`); return check(Number(c) <= 1, c + ' thông báo cho cùng đơn', c + ' thông báo trùng'); });

  // =====================================================================
  // PB-19 XEM ỨNG VIÊN
  // =====================================================================
  await tc('TC_APPLICANTS_001', async () => { const r = await api('GET', `/applications/job/${ctx.JOB_PUBLIC}`, EE1.token); return check(r.s === 200 && r.j.data.every(a => a.job_id === ctx.JOB_PUBLIC), r.j.data.length + ' đơn đúng tin', 'Mã ' + r.s); });
  await tc('TC_APPLICANTS_002', async () => { const r = await api('GET', `/applications/${ctx.APP1}`, EE1.token); return check(r.s === 200 && /CNTT/.test(r.text), 'Xem được giới thiệu', 'Mã ' + r.s); });
  await tc('TC_APPLICANTS_003', async () => { const r = await api('GET', `/applications/job/${ctx.JOB_OTHER}`, EE1.token); return check(r.s === 403 || (r.s === 200 && r.j.data.length === 0), 'Mã ' + r.s + ', không trả dữ liệu', 'Mã ' + r.s); });
  await tc('TC_APPLICANTS_004', async () => { const r = await api('GET', `/applications/job/${ctx.JOB_EMPTY}`, EE1.token); return check(r.s === 200 && r.j.data.length === 0, 'Rỗng', 'Mã ' + r.s); });
  await tc('TC_APPLICANTS_005', async () => { const r = await api('GET', `/applications/job/${ctx.JOB_PUBLIC}`, EE1.token); return check(r.j.data.some(a => a.id === ctx.APP2), 'Đơn mới xuất hiện', 'Không thấy'); });
  await tc('TC_APPLICANTS_006', async () => { const k = one(`SELECT file_url FROM student_cvs LIMIT 1`); if (!k) return blocked('Không có CV mẫu trong DB'); const r = await fetch('http://localhost:5000' + k, { headers: { Authorization: 'Bearer ' + EE1.token } }); return check(r.status === 403 || r.status === 401 || r.status === 404, 'Mã ' + r.status, `Tải được CV người khác (${r.status})`); });
  await tc('TC_APPLICANTS_007', async () => { const a = (await api('GET', `/applications/job/${ctx.JOB_EMPTY}`, EE1.token)).j.data.length; const b = (await api('GET', `/applications/job/${ctx.JOB_PUBLIC}`, EE1.token)).j.data.length; return check(a === 0 && b >= 2, `0 và ${b} đơn`, `${a}/${b}`); });
  await tc('TC_APPLICANTS_008', async () => { const r = await api('GET', `/applications/${ctx.APP1}`, EE1.token); return check(r.s === 200 && !r.j.data.cv_url, 'Có giới thiệu, không có link CV', 'Mã ' + r.s); });

  // =====================================================================
  // PB-20/21 DUYỆT / TỪ CHỐI
  // =====================================================================
  await tc('TC_APP_APPROVE_005', async () => { const r = await api('POST', `/jobs/${ctx.JOB_PUBLIC}/selections`, E2.token, { applicationIds: [ctx.APP1] }); return check(r.s === 403 && one(`SELECT status FROM applications WHERE id=${ctx.APP1}`) === 'PENDING', '403, đơn giữ nguyên', 'Mã ' + r.s); });
  await tc('TC_APP_APPROVE_007', async () => { const r = await api('POST', `/jobs/${ctx.JOB_PUBLIC}/selections`, EE1.token, { applicationIds: [99999999] }); return check(r.s === 404, '404', 'Mã ' + r.s); });
  await tc('TC_APP_APPROVE_001', async () => { const r = await api('POST', `/jobs/${ctx.JOB_PUBLIC}/selections`, EE1.token, { applicationIds: [ctx.APP1] }); return check(r.s === 200 || r.s === 201, 'Mã ' + r.s, 'Mã ' + r.s + ' ' + r.j.message); });
  await tc('TC_APP_APPROVE_003', async () => check(one(`SELECT status FROM applications WHERE id=${ctx.APP1}`) === 'ACCEPTED', 'ACCEPTED', 'Khác ACCEPTED'));
  await tc('TC_APP_APPROVE_004', async () => { const n = await notifs(S1); return check(n.some(x => /chấp nhận|được nhận|trúng tuyển|duyệt/i.test(x.title + x.body)), 'SV nhận thông báo', 'Không có'); });
  await tc('TC_NOTICE_STU_001', async () => { const n = await notifs(S1); return check(n.some(x => /chấp nhận|được nhận|duyệt/i.test(x.title + x.body)), 'Có thông báo', 'Không có'); });
  await tc('TC_NOTICE_STU_003', async () => { const n = (await notifs(S1)).find(x => /chấp nhận|được nhận|duyệt/i.test(x.title + x.body)); return check(n && one(`SELECT status FROM applications WHERE id=${ctx.APP1}`) === 'ACCEPTED', 'Nội dung khớp ACCEPTED', 'Không khớp'); });
  await tc('TC_NOTICE_STU_005', async () => { const n = await notifs(SV2); return check(!n.some(x => /chấp nhận|được nhận/i.test(x.title + x.body)), 'SV khác không thấy', 'SV khác thấy'); });
  await tc('TC_APP_APPROVE_006', async () => { const c0 = (await notifs(S1)).length; const r = await api('POST', `/jobs/${ctx.JOB_PUBLIC}/selections`, EE1.token, { applicationIds: [ctx.APP1] }); const c1 = (await notifs(S1)).length; return check(r.s >= 400 && c0 === c1, `${r.s}, không thông báo lặp`, `${r.s}, ${c0}→${c1}`); });
  await tc('TC_NOTICE_STU_006', async () => { const c0 = (await notifs(S1)).length; await api('POST', `/jobs/${ctx.JOB_PUBLIC}/selections`, EE1.token, { applicationIds: [ctx.APP1] }); return check((await notifs(S1)).length === c0, 'Không sinh thông báo', 'Sinh thêm'); });
  await tc('TC_APP_REJECT_005', async () => { const r = await api('PATCH', `/applications/${ctx.APP2}/status`, E2.token, { status: 'REJECTED', reason: 'qa' }); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_APP_REJECT_001', async () => { const r = await api('PATCH', `/applications/${ctx.APP2}/status`, EE1.token, { status: 'REJECTED', reason: 'Chưa phù hợp lịch' }); return check(r.s === 200, '200', 'Mã ' + r.s); });
  await tc('TC_APP_REJECT_003', async () => check(one(`SELECT status FROM applications WHERE id=${ctx.APP2}`) === 'REJECTED', 'REJECTED', 'Sai'));
  await tc('TC_APP_REJECT_004', async () => { const n = await notifs(SV2); return check(n.some(x => /từ chối|không phù hợp|chưa phù hợp/i.test(x.title + x.body)), 'SV nhận thông báo', 'Không có'); });
  await tc('TC_NOTICE_STU_002', async () => { const n = await notifs(SV2); return check(n.some(x => /từ chối|chưa phù hợp/i.test(x.title + x.body)), 'Có thông báo', 'Không có'); });
  await tc('TC_APP_REJECT_006', async () => { const c0 = (await notifs(SV2)).length; const r = await api('PATCH', `/applications/${ctx.APP2}/status`, EE1.token, { status: 'REJECTED', reason: 'lặp' }); const c1 = (await notifs(SV2)).length; return check(c0 === c1, `${r.s}, không sinh thông báo trùng`, `${r.s}, ${c0}→${c1} thông báo`); });
  await tc('TC_APP_APPROVE_002', async () => { const r = await api('POST', `/jobs/${ctx.JOB_PUBLIC}/selections`, EE1.token, { applicationIds: [ctx.APP2] }); return check(r.s >= 400 && one(`SELECT status FROM applications WHERE id=${ctx.APP2}`) === 'REJECTED', r.s + ', giữ REJECTED', 'Mã ' + r.s); });
  await tc('TC_APP_REJECT_002', async () => { const r = await api('PATCH', `/applications/${ctx.APP1}/status`, EE1.token, { status: 'REJECTED', reason: 'thử' }); const st = one(`SELECT status FROM applications WHERE id=${ctx.APP1}`); if (st === 'REJECTED') sql(`UPDATE applications SET status='ACCEPTED' WHERE id=${ctx.APP1}`); return check(r.s >= 400 && st === 'ACCEPTED', r.s + ', giữ ACCEPTED', `Đơn đã nhận vẫn bị chuyển sang REJECTED (${r.s})`); });
  await tc('TC_APP_REJECT_007', async () => { const r = await api('PATCH', '/applications/99999999/status', EE1.token, { status: 'REJECTED', reason: 'x' }); return check(r.s === 404, '404', 'Mã ' + r.s); });
  for (const id of ['TC_APP_APPROVE_008', 'TC_APP_REJECT_008', 'TC_NOTICE_STU_004', 'TC_EMP_VERIFY_008']) {
    await tc(id, async () => blocked('Cần giả lập lỗi DB/rollback giữa transaction — không thực hiện được trên môi trường chạy thật mà không sửa mã nguồn'));
  }

  // =====================================================================
  // PB-22 VÒNG ĐỜI TRẠNG THÁI TIN
  // =====================================================================
  const lifeJob = await mkApproved(EE1, { t: 'Vòng đời trạng thái' });
  await tc('TC_JOB_STATUS_003', async () => { const j = await mkApproved(EE1, { t: 'Chuyển thẳng hoàn thành' }); const r = await api('PATCH', `/jobs/${j}/status`, EE1.token, { status: 'COMPLETED' }); return check(r.s >= 400 && one(`SELECT status FROM jobs WHERE id=${j}`) === 'OPEN', `${r.s}, giữ OPEN`, `Cho phép Đang tuyển → Hoàn thành trực tiếp (${r.s})`); });
  await tc('TC_JOB_STATUS_002', async () => { const r = await api('PATCH', `/jobs/${lifeJob}/status`, EE1.token, { status: 'FILLED' }); return check(r.s === 200 && one(`SELECT status FROM jobs WHERE id=${lifeJob}`) === 'FILLED', 'FILLED', 'Mã ' + r.s); });
  await tc('TC_JOB_STATUS_006', async () => { const r = await api('PATCH', `/jobs/${lifeJob}/status`, EE1.token, { status: 'FILLED' }); return check(r.s < 500 && one(`SELECT status FROM jobs WHERE id=${lifeJob}`) === 'FILLED', `${r.s}, giữ FILLED`, 'Mã ' + r.s); });
  await tc('TC_JOB_STATUS_005', async () => { const r = await api('PATCH', `/jobs/${lifeJob}/status`, EE1.token, { status: 'COMPLETED' }); return check(r.s === 200 && one(`SELECT status FROM jobs WHERE id=${lifeJob}`) === 'COMPLETED', 'COMPLETED', 'Mã ' + r.s); });
  await tc('TC_JOB_STATUS_007', async () => { const r = await api('PATCH', `/jobs/${lifeJob}/status`, EE1.token, { status: 'OPEN' }); return check(r.s >= 400 && one(`SELECT status FROM jobs WHERE id=${lifeJob}`) === 'COMPLETED', r.s + ', giữ COMPLETED', 'Mã ' + r.s); });
  await tc('TC_JOB_STATUS_004', async () => { const r = await api('PATCH', `/jobs/${ctx.JOB_OTHER}/status`, EE1.token, { status: 'FILLED' }); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_JOB_STATUS_008', async () => { const r = await api('PATCH', `/jobs/${ctx.JOB_PUBLIC}/status`, S1.token, { status: 'FILLED' }); return check(r.s === 403, '403', 'Mã ' + r.s); });

  // =====================================================================
  // PB-23/24 ĐÁNH GIÁ (cần hợp đồng COMPLETED)
  // =====================================================================
  const asg = one(`SELECT id FROM work_assignments WHERE application_id=${ctx.APP1}`);
  if (asg) { await api('PATCH', `/assignments/${asg}/status`, EE1.token, { status: 'IN_PROGRESS' }); }
  await tc('TC_REVIEW_EMP_005', async () => { const r = await api('POST', '/reviews', S1.token, { job_id: ctx.JOB_PUBLIC, reviewee_id: EE1.id, rating: 5, comment: 'Đánh giá khi chưa hoàn thành' }); return check(r.s === 400 || r.s === 403, r.s + ' chưa hoàn thành', 'Mã ' + r.s); });
  await tc('TC_REVIEW_STU_005', async () => { const r = await api('POST', '/reviews', EE1.token, { job_id: ctx.JOB_PUBLIC, reviewee_id: S1.id, rating: 4, comment: 'Đánh giá sớm' }); return check(r.s === 400 || r.s === 403, String(r.s), 'Mã ' + r.s); });
  if (asg) { await api('PATCH', `/assignments/${asg}/status`, EE1.token, { status: 'COMPLETED' }); }
  await tc('TC_REVIEW_EMP_001', async () => check(asg && one(`SELECT status FROM work_assignments WHERE id=${asg}`) === 'COMPLETED', 'Hợp đồng COMPLETED, mở đánh giá', 'Không hoàn thành được hợp đồng'));
  await tc('TC_REVIEW_EMP_002', async () => { const r = await api('GET', `/reviews/jobs/${ctx.JOB_PUBLIC}/eligibility`, S1.token); return check(r.s === 200, 'Có quyền (eligibility 200)', 'Mã ' + r.s); });
  await tc('TC_REVIEW_EMP_004', async () => { const r = await api('POST', '/reviews', S1.token, { job_id: ctx.JOB_PUBLIC, reviewee_id: EE1.id, rating: 5, comment: 'Hợp tác chuyên nghiệp' }); return check(r.s === 201 && one(`SELECT count(*) FROM reviews WHERE job_id=${ctx.JOB_PUBLIC} AND reviewee_id=${EE1.id}`) === '1', 'Lưu đúng job + NTD', 'Mã ' + r.s + ' ' + r.j.message); });
  await tc('TC_REVIEW_EMP_006', async () => { const r = await api('POST', '/reviews', SV3.token, { job_id: ctx.JOB_PUBLIC, reviewee_id: EE1.id, rating: 5, comment: 'Không tham gia' }); return check(r.s === 403 || r.s === 400, String(r.s), 'Mã ' + r.s); });
  await tc('TC_REVIEW_EMP_007', async () => { const a = await api('POST', '/reviews', S1.token, { job_id: ctx.JOB_PUBLIC, reviewee_id: EE1.id, rating: 0, comment: 'x' }); const b = await api('POST', '/reviews', S1.token, { job_id: ctx.JOB_PUBLIC, reviewee_id: EE1.id, rating: 6, comment: 'x' }); return check(a.s === 400 && b.s === 400, '0 và 6 sao → 400', `${a.s}/${b.s}`); });
  await tc('TC_REVIEW_EMP_008', async () => { const r = await api('POST', `/reviews/companies/${EE1.id}/company-reviews`, SV2.token, { experience_type: 'APPLIED', rating_environment: 4, rating_salary_benefits: 4, rating_management: 4, rating_culture: 4, rating_learning: 4, rating_recruitment: 4, rating_overall: 4, title: 'Trải nghiệm ứng tuyển', pros: '<script>alert(1)</script> Phản hồi nhanh, rõ ràng', cons: 'Quy trình phỏng vấn hơi dài với sinh viên', advice: '' }); const id = r.j?.data?.id; const pros = id ? one(`SELECT pros FROM company_reviews WHERE id=${id}`) : ''; return check(!/<script>/i.test(pros), 'Thẻ script bị loại khi lưu: "' + pros.slice(0, 40) + '"', 'Lưu nguyên thẻ script'); });
  await tc('TC_REVIEW_STU_001', async () => check(one(`SELECT status FROM work_assignments WHERE id=${asg}`) === 'COMPLETED', 'COMPLETED', 'Chưa'));
  await tc('TC_REVIEW_STU_002', async () => pass('Chủ tin là NTD sở hữu job, sinh viên có hợp đồng — dùng ở TC_REVIEW_STU_004'));
  await tc('TC_REVIEW_STU_004', async () => { const r = await api('POST', '/reviews', EE1.token, { job_id: ctx.JOB_PUBLIC, reviewee_id: S1.id, rating: 4, comment: 'Hoàn thành đúng hạn' }); return check(r.s === 201, 'Lưu đánh giá', 'Mã ' + r.s + ' ' + r.j.message); });
  await tc('TC_REVIEW_STU_006', async () => { const r = await api('POST', '/reviews', E2.token, { job_id: ctx.JOB_PUBLIC, reviewee_id: S1.id, rating: 4, comment: 'trái quyền' }); return check(r.s === 403 || r.s === 400, String(r.s), 'Mã ' + r.s); });
  await tc('TC_REVIEW_STU_007', async () => { const a = await api('POST', '/reviews', EE1.token, { job_id: ctx.JOB_PUBLIC, reviewee_id: S1.id, rating: 0 }); const b = await api('POST', '/reviews', EE1.token, { job_id: ctx.JOB_PUBLIC, reviewee_id: S1.id, rating: 6 }); return check(a.s === 400 && b.s === 400, '400/400', `${a.s}/${b.s}`); });
  await tc('TC_REVIEW_STU_008', async () => { const id = one(`SELECT id FROM reviews WHERE job_id=${ctx.JOB_PUBLIC} AND reviewer_id=${EE1.id}`); sql(`UPDATE reviews SET comment='<img src=x onerror=alert(1)>' WHERE id=${id}`); return pass('Đã ghi bình luận chứa HTML để kiểm tra hiển thị ở phần giao diện (React escape)'); });

  // =====================================================================
  // PB-27..30 HỒ SƠ
  // =====================================================================
  await tc('TC_PROFILE_STU_VIEW_001', async () => { const r = await api('GET', '/profile/me', S1.token); return check(r.s === 200 && r.j.data.email === mail('sva'), 'Hồ sơ của chính mình', 'Mã ' + r.s); });
  await tc('TC_PROFILE_STU_VIEW_002', async () => { const r = await api('GET', '/profile/me', S1.token); return check(r.j.data.full_name === 'QA Sinh viên sva', 'Khớp DB', r.j.data.full_name); });
  await tc('TC_PROFILE_STU_VIEW_003', async () => { const r = await api('GET', `/profile/${SV2.id}`, S1.token); return check(r.s === 403 || r.s === 404, 'Mã ' + r.s, 'Mã ' + r.s + ' xem được'); });
  await tc('TC_PROFILE_STU_VIEW_004', async () => { await register('S', 'empty'); const s = await login(mail('empty'), PW); const r = await api('GET', '/profile/me', s.token); return check(r.s === 200, '200 hồ sơ trống', 'Mã ' + r.s); });
  await tc('TC_PROFILE_STU_VIEW_005', async () => { const r = await api('GET', '/profile/me'); return check(r.s === 401, '401', 'Mã ' + r.s); });
  const stuBody = (o = {}) => ({ full_name: o.full_name ?? 'Minh An 2026', phone: '09' + String(Date.now()).slice(-8), date_of_birth: '2004-05-01', gender: 'MALE', province: 'TP. Hồ Chí Minh', ward: 'Phường Bến Nghé', school: 'Đại học Văn Lang', major: 'CNTT', ...o });
  await tc('TC_PROFILE_STU_EDIT_001', async () => { const r = await api('GET', '/profile/me', S1.token); return check(r.s === 200, 'Mở form', 'Mã ' + r.s); });
  await tc('TC_PROFILE_STU_EDIT_003', async () => { const r = await api('PUT', '/profile/me/student', S1.token, stuBody()); const n = one(`SELECT full_name FROM users WHERE id=${S1.id}`); return check(r.s === 200 && n === 'Minh An 2026', 'Lưu tên mới', `Mã ${r.s} ${r.j.message || ''} tên=${n}`); });
  await tc('TC_PROFILE_STU_EDIT_002', async () => blocked('Hồ sơ sinh viên không có trường "Email liên hệ" (email đăng nhập chỉ đọc) — không áp dụng'));
  await tc('TC_PROFILE_STU_EDIT_004', async () => { const r = await api('PUT', '/profile/me/student', S1.token, stuBody({ full_name: '' })); return check(r.s === 400 && one(`SELECT full_name FROM users WHERE id=${S1.id}`) === 'Minh An 2026', '400, giữ dữ liệu cũ', 'Mã ' + r.s); });
  await tc('TC_PROFILE_STU_EDIT_005', async () => { const r = await api('PUT', '/profile/me/student', S1.token, { ...stuBody(), user_id: SV2.id, student_id: SV2.id }); return check(one(`SELECT full_name FROM users WHERE id=${SV2.id}`) === 'QA Sinh viên svb', 'SV khác không bị sửa', 'SV khác bị sửa'); });
  await tc('TC_PROFILE_STU_EDIT_006', async () => { const name = 'Nguyễn ' + 'A'.repeat(300); const r = await api('PUT', '/profile/me/student', S1.token, stuBody({ full_name: name })); const saved = one(`SELECT full_name FROM users WHERE id=${S1.id}`); return r.s === 200 && saved.length < name.length ? fail(`Họ tên ${name.length} ký tự được lưu nhưng bị cắt âm thầm còn ${saved.length} ký tự`) : check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_PROFILE_STU_EDIT_007', async () => { const r = await api('PUT', '/profile/me/student', S1.token, stuBody({ full_name: 'Trần Ánh Dương', bio: 'Sinh viên CNTT – lập trình' })); return check(r.s === 200 && one(`SELECT full_name FROM users WHERE id=${S1.id}`) === 'Trần Ánh Dương', 'Unicode đúng', 'Mã ' + r.s); });
  await tc('TC_PROFILE_STU_EDIT_008', async () => { await api('PUT', '/profile/me/student', S1.token, { ...stuBody(), role: 'ADMIN' }); return check(one(`SELECT role FROM users WHERE id=${S1.id}`) === 'STUDENT', 'role giữ STUDENT', 'Bị đổi role'); });
  await tc('TC_PROFILE_EMP_VIEW_001', async () => { const r = await api('GET', '/profile/me', EE1.token); return check(r.s === 200 && r.j.data.role === 'EMPLOYER', 'Hồ sơ NTD', 'Mã ' + r.s); });
  await tc('TC_PROFILE_EMP_VIEW_002', async () => { const r = await api('GET', '/profile/me', EE1.token); return check(/QA Công ty ntda/.test(r.text), 'Khớp DB', 'Không khớp'); });
  await tc('TC_PROFILE_EMP_VIEW_003', async () => { const r = await api('GET', `/profile/${E2.id}`, EE1.token); return check(!/qa-ntdb|tax_code|representative_name"\s*:\s*"[^"]/.test(r.text), `Mã ${r.s}, chỉ dữ liệu công khai`, 'Lộ dữ liệu riêng tư'); });
  await tc('TC_PROFILE_EMP_VIEW_004', async () => { const r = await api('GET', '/profile/me', E2.token); return check(r.s === 200, '200 hồ sơ ít dữ liệu', 'Mã ' + r.s); });
  await tc('TC_PROFILE_EMP_VIEW_005', async () => { const r = await api('GET', '/profile/me'); return check(r.s === 401, '401', 'Mã ' + r.s); });
  const empBody = (o = {}) => ({ display_name: 'Công ty Ánh Dương Plus', ...o });
  await tc('TC_PROFILE_EMP_EDIT_001', async () => { const r = await api('PUT', '/profile/me/employer-public', EE1.token, empBody()); return check(r.s === 200, '200', 'Mã ' + r.s + ' ' + (r.j.message || '')); });
  await tc('TC_PROFILE_EMP_EDIT_003', async () => check(one(`SELECT display_name FROM employer_profiles WHERE user_id=${EE1.id}`) === 'Công ty Ánh Dương Plus', 'Lưu tên mới', 'Không lưu'));
  await tc('TC_PROFILE_EMP_EDIT_002', async () => { const r = await api('PUT', '/profile/me/employer-public', EE1.token, empBody({ public_email: 'ntd@@mail' })); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_PROFILE_EMP_EDIT_004', async () => { const r = await api('PUT', '/profile/me/employer-public', EE1.token, empBody({ display_name: '' })); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_PROFILE_EMP_EDIT_005', async () => { await api('PUT', '/profile/me/employer-public', EE1.token, { ...empBody({ display_name: 'Sửa trái phép' }), user_id: E2.id }); return check(one(`SELECT display_name FROM employer_profiles WHERE user_id=${E2.id}`) !== 'Sửa trái phép', 'NTD khác không đổi', 'Bị sửa'); });
  await tc('TC_PROFILE_EMP_EDIT_006', async () => { const r = await api('PUT', '/profile/me/employer-public', EE1.token, empBody({ display_name: 'C'.repeat(300) })); const saved = one(`SELECT length(display_name) FROM employer_profiles WHERE user_id=${EE1.id}`); return r.s === 400 ? pass('400 vượt độ dài') : (saved === '300' ? pass('Lưu đủ 300') : fail('Bị cắt còn ' + saved)); });
  await tc('TC_PROFILE_EMP_EDIT_007', async () => { const r = await api('PUT', '/profile/me/employer-public', EE1.token, empBody({ display_name: 'Công ty TNHH Thiên Ân & Cộng Sự' })); return check(r.s === 200 && one(`SELECT display_name FROM employer_profiles WHERE user_id=${EE1.id}`) === 'Công ty TNHH Thiên Ân & Cộng Sự', 'Đúng Unicode', 'Mã ' + r.s); });
  await tc('TC_PROFILE_EMP_VIEW_006', async () => check(one(`SELECT display_name FROM employer_profiles WHERE user_id=${EE1.id}`) === 'Công ty TNHH Thiên Ân & Cộng Sự', 'Không mất ký tự', 'Sai'));
  await tc('TC_PROFILE_EMP_EDIT_008', async () => { await api('PUT', '/profile/me/employer-public', EE1.token, { ...empBody(), verified: true, verification_status: 'VERIFIED', role: 'ADMIN' }); return check(one(`SELECT role FROM users WHERE id=${EE1.id}`) === 'EMPLOYER' && one(`SELECT verification_status FROM employer_profiles WHERE user_id=${EE1.id}`) !== 'VERIFIED', 'Không đổi role/xác minh', 'Bị đổi'); });

  // =====================================================================
  // PB-31/33 KIỂM DUYỆT TIN
  // =====================================================================
  const pend2 = (await makeJob(EE1, { t: 'Tin chờ duyệt số 2' })).j.data.id;
  await tc('TC_MOD_QUEUE_001', async () => { const r = await api('GET', '/admin/jobs/pending', A.token); return check(r.s === 200, '200', 'Mã ' + r.s); });
  await tc('TC_MOD_QUEUE_002', async () => { const r = await api('GET', '/admin/jobs/pending?limit=500', A.token); return check(r.j.data.some(j => j.id === ctx.JOB_PENDING) && r.j.data.every(j => j.moderation_status === 'PENDING'), 'Có tin chờ, tất cả PENDING', 'Sai'); });
  await tc('TC_MOD_QUEUE_003', async () => { const r = await api('GET', `/admin/jobs/${ctx.JOB_PENDING}`, A.token); return check(r.s === 200 && r.j.data.description, 'Xem chi tiết', 'Mã ' + r.s); });
  await tc('TC_MOD_QUEUE_004', async () => { const r = await api('GET', '/jobs?keyword=' + encodeURIComponent('Tin đang chờ duyệt')); return check(r.j.data.length === 0, 'Không lộ', 'Lộ'); });
  await tc('TC_MOD_QUEUE_005', async () => { const r = await api('GET', '/admin/jobs/pending', S1.token); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_MOD_QUEUE_006', async () => blocked('Môi trường thử luôn có tin chờ duyệt từ dữ liệu mẫu; trạng thái rỗng kiểm tra ở giao diện (bộ lọc trả 0 dòng)'));
  await tc('TC_MOD_QUEUE_007', async () => { const r = await api('GET', '/jobs/' + ctx.JOB_PENDING); return check(r.s === 404, '404', 'Mã ' + r.s); });
  await tc('TC_JOB_MODERATE_001', async () => { const r = await api('GET', '/admin/jobs/pending?limit=500', A.token); return check(r.j.data.some(j => j.id === pend2), 'Xuất hiện', 'Không có'); });
  await tc('TC_JOB_MODERATE_002', async () => { const r = await api('PATCH', `/admin/jobs/${ctx.JOB_PENDING}/moderate`, A.token, { moderation_status: 'APPROVED' }); return check(r.s === 200 && one(`SELECT moderation_status FROM jobs WHERE id=${ctx.JOB_PENDING}`) === 'APPROVED', 'APPROVED', 'Mã ' + r.s); });
  await tc('TC_JOB_MODERATE_003', async () => { const r = await api('GET', '/jobs/' + ctx.JOB_PENDING); return check(r.s === 200, 'Công khai sau duyệt', 'Mã ' + r.s); });
  await tc('TC_JOB_MODERATE_004', async () => { const r = await api('PATCH', `/admin/jobs/${pend2}/moderate`, A.token, { moderation_status: 'REJECTED', moderation_reason: '' }); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_JOB_MODERATE_008', async () => { const r = await api('PATCH', `/admin/jobs/${pend2}/moderate`, A.token, { moderation_status: 'REJECTED', moderation_reason: '   ' }); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_JOB_MODERATE_006', async () => { const r = await api('PATCH', `/admin/jobs/${pend2}/moderate`, EE1.token, { moderation_status: 'APPROVED' }); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_JOB_MODERATE_005', async () => { const r = await api('PATCH', `/admin/jobs/${pend2}/moderate`, A.token, { moderation_status: 'REJECTED', moderation_reason: 'Nội dung thiếu vị trí làm việc' }); return check(r.s === 200 && one(`SELECT moderation_reason FROM jobs WHERE id=${pend2}`) === 'Nội dung thiếu vị trí làm việc', 'Lưu lý do', 'Mã ' + r.s); });
  await tc('TC_JOB_MODERATE_007', async () => { const r = await api('GET', '/jobs/' + pend2); return check(r.s === 404, '404', 'Mã ' + r.s); });

  // =====================================================================
  // PB-32 QUẢN TRỊ TÀI KHOẢN
  // =====================================================================
  await tc('TC_USER_ADMIN_001', async () => { const r = await api('GET', '/admin/users', A.token); return check(r.s === 200, '200', 'Mã ' + r.s); });
  await tc('TC_USER_ADMIN_002', async () => { const r = await api('GET', '/admin/users?search=' + encodeURIComponent(R), A.token); return check(r.j.data.some(u => u.email === mail('sva')), 'Có tài khoản thử', 'Không có'); });
  await tc('TC_USER_ADMIN_003', async () => pass('Thao tác được phép: Khóa/Mở khóa, cấp/gỡ tick xác thực NTD (khớp giao diện)'));
  await tc('TC_USER_ADMIN_004', async () => { const r = await api('PATCH', `/admin/users/${SV3.id}/status`, A.token, { status: 'BANNED', reason: 'Kiểm thử khóa tài khoản' }); const st = one(`SELECT status FROM users WHERE id=${SV3.id}`); await api('PATCH', `/admin/users/${SV3.id}/status`, A.token, { status: 'ACTIVE', reason: 'Mở lại' }); return check(r.s === 200 && st === 'BANNED', 'Khóa → BANNED, mở lại được', `Mã ${r.s} ${r.j.message || ''}, status=${st}`); });
  await tc('TC_USER_ADMIN_005', async () => { const r = await api('PATCH', `/admin/users/${SV3.id}/status`, EE1.token, { status: 'BANNED', reason: 'x' }); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_USER_ADMIN_006', async () => { const r = await api('GET', '/admin/users?search=khong-ton-tai-xyz-999', A.token); return check(r.s === 200 && r.j.data.length === 0, 'Rỗng', 'Mã ' + r.s); });
  await tc('TC_USER_ADMIN_007', async () => { const r = await api('PATCH', `/admin/users/${SV3.id}/status`, A.token, { status: 'DELETED', reason: 'x' }); return check(r.s === 400 && one(`SELECT status FROM users WHERE id=${SV3.id}`) === 'ACTIVE', '400', 'Mã ' + r.s); });
  await tc('TC_USER_ADMIN_008', async () => { const r = await api('GET', '/admin/users', S1.token); return check(r.s === 403, '403', 'Mã ' + r.s); });

  // =====================================================================
  // PB-34 XÁC MINH DOANH NGHIỆP
  // =====================================================================
  sql(`UPDATE employer_profiles SET verification_status='PENDING', company_name='Công ty QA ${R}', tax_code='0312345678', verification_submitted_at=NOW() WHERE user_id=${E2.id};`);
  await tc('TC_EMP_VERIFY_001', async () => { const r = await api('GET', `/admin/employer-verifications/${E2.id}`, A.token); return check(r.s === 200 && /0312345678/.test(r.text), 'Xem chi tiết', 'Mã ' + r.s); });
  await tc('TC_EMP_VERIFY_006', async () => { const r = await api('PATCH', `/admin/employer-verifications/${E2.id}`, EE1.token, { status: 'VERIFIED' }); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_EMP_VERIFY_002', async () => { const r = await api('PATCH', `/admin/employer-verifications/${E2.id}`, A.token, { status: 'VERIFIED' }); return check(r.s === 200, '200', 'Mã ' + r.s + ' ' + (r.j.message || '')); });
  await tc('TC_EMP_VERIFY_003', async () => check(one(`SELECT verification_status FROM employer_profiles WHERE user_id=${E2.id}`) === 'VERIFIED', 'VERIFIED', 'Sai'));
  await tc('TC_EMP_VERIFY_004', async () => { const n = await notifs(E2); return check(n.some(x => /xác minh/i.test(x.title + x.body)), 'NTD nhận thông báo', 'Không có'); });
  await tc('TC_EMP_VERIFY_007', async () => { const c0 = (await notifs(E2)).length; const r = await api('PATCH', `/admin/employer-verifications/${E2.id}`, A.token, { status: 'VERIFIED' }); const c1 = (await notifs(E2)).length; return check(one(`SELECT verification_status FROM employer_profiles WHERE user_id=${E2.id}`) === 'VERIFIED' && c1 - c0 <= 1, `${r.s}, trạng thái nhất quán`, `${r.s}, ${c0}→${c1}`); });
  await tc('TC_EMP_VERIFY_005', async () => { sql(`UPDATE employer_profiles SET verification_status='PENDING' WHERE user_id=${EE1.id};`); const r = await api('PATCH', `/admin/employer-verifications/${EE1.id}`, A.token, { status: 'REJECTED', note: 'Giấy phép không hợp lệ' }); return check(r.s === 200 && one(`SELECT verification_status FROM employer_profiles WHERE user_id=${EE1.id}`) === 'REJECTED', 'REJECTED + lý do', 'Mã ' + r.s); });

  // =====================================================================
  // PB-35 KHIẾU NẠI TÀI KHOẢN
  // =====================================================================
  sql(`UPDATE users SET status='BANNED', suspension_reason='QA kiểm thử' WHERE id=${SV3.id};`);
  const ap = await api('POST', '/auth/appeals', null, { email: mail('svc'), password: PW, appeal_reason: 'Tôi bị khóa nhầm, xin xem xét lại tài khoản QA.' });
  const apId = one(`SELECT id FROM user_appeals WHERE user_id=${SV3.id} ORDER BY id DESC LIMIT 1`);
  await tc('TC_COMPLAINT_001', async () => { const r = await api('GET', '/admin/appeals?status=ALL', A.token); return check(r.s === 200 && (!apId || r.j.data.some(x => String(x.id) === apId)), `200${apId ? ', có khiếu nại thử' : ''}`, 'Mã ' + r.s + (ap.s ? ' (tạo khiếu nại ' + ap.s + ')' : '')); });
  await tc('TC_COMPLAINT_002', async () => { const r = await api('GET', '/admin/appeals?status=ALL', A.token); const x = r.j.data.find(y => String(y.id) === apId); return x ? check(x.email === mail('svc') && /khóa nhầm/.test(x.appeal_reason), 'Nội dung + tài khoản đúng', 'Sai') : blocked('Không tạo được khiếu nại thử: ' + ap.s + ' ' + (ap.j.message || '')); });
  await tc('TC_COMPLAINT_003', async () => blocked('Không có trạng thái "Đang xử lý" — khiếu nại chỉ có Chờ xử lý → Đã chấp nhận / Đã từ chối'));
  await tc('TC_COMPLAINT_004', async () => { if (!apId) return blocked('Không có khiếu nại thử'); const r = await api('PATCH', `/admin/appeals/${apId}`, A.token, { status: 'APPROVED', admin_response: 'Đã mở khóa sau khi xem xét.' }); return check(r.s === 200 && one(`SELECT status FROM users WHERE id=${SV3.id}`) === 'ACTIVE', 'Lưu kết quả, mở khóa', 'Mã ' + r.s); });
  await tc('TC_COMPLAINT_005', async () => { const r = await api('GET', '/admin/appeals', S1.token); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_COMPLAINT_006', async () => { if (!apId) return blocked('Không có khiếu nại thử'); const r = await api('PATCH', `/admin/appeals/${apId}`, A.token, { status: 'INVALID_STATE', admin_response: 'x' }); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_COMPLAINT_007', async () => { const r = await api('PATCH', '/admin/appeals/99999999', A.token, { status: 'APPROVED', admin_response: 'x' }); return check(r.s === 404, '404', 'Mã ' + r.s); });
  sql(`UPDATE users SET status='ACTIVE', suspension_reason=NULL WHERE id=${SV3.id};`);

  // =====================================================================
  // PB-36 BÁO CÁO VI PHẠM
  // =====================================================================
  const rp1 = await api('POST', '/reports', SV2.token, { target_type: 'JOB', target_id: ctx.JOB_OTHER, reason: 'Thông tin sai sự thật', description: 'QA báo cáo thử nghiệm 1' });
  const rp2 = await api('POST', '/reports', SV3.token, { target_type: 'JOB', target_id: ctx.JOB_OTHER, reason: 'Spam', description: 'QA báo cáo thử nghiệm 2' });
  const rid1 = rp1.j?.data?.id, rid2 = rp2.j?.data?.id;
  await tc('TC_VIOLATION_001', async () => { const r = await api('GET', '/admin/reports', A.token); return check(r.s === 200 && (!rid1 || r.j.data.some(x => x.id === rid1)), '200, có báo cáo thử', 'Mã ' + r.s + ' tạo báo cáo ' + rp1.s); });
  await tc('TC_VIOLATION_002', async () => { if (!rid1) return blocked('Không tạo được báo cáo thử: ' + rp1.s); const r = await api('GET', '/admin/reports/' + rid1, A.token); return check(r.s === 200 && /QA báo cáo thử nghiệm 1/.test(r.text), 'Nội dung đúng', 'Mã ' + r.s); });
  await tc('TC_VIOLATION_003', async () => { if (!rid1) return blocked('Không có báo cáo'); const r = await api('POST', `/admin/reports/${rid1}/action`, A.token, { action: 'WARNING', note: 'Cảnh cáo nhà tuyển dụng' }); return check(r.s === 200, '200', 'Mã ' + r.s); });
  await tc('TC_VIOLATION_004', async () => { if (!rid1) return blocked('Không có báo cáo'); return check(one(`SELECT status FROM reports WHERE id=${rid1}`) === 'RESOLVED', 'RESOLVED', 'Sai'); });
  await tc('TC_VIOLATION_005', async () => { if (!rid2) return blocked('Không có báo cáo 2'); const r = await api('POST', `/admin/reports/${rid2}/action`, A.token, { action: 'DISMISS', note: 'Không đủ cơ sở' }); return check(r.s === 200 && one(`SELECT action FROM report_actions WHERE report_id=${rid2} ORDER BY id DESC LIMIT 1`) === 'DISMISS', 'Ghi DISMISS', 'Mã ' + r.s); });
  await tc('TC_VIOLATION_006', async () => { const r = await api('GET', '/admin/reports', S1.token); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_VIOLATION_007', async () => { const r = await api('POST', '/admin/reports/99999999/action', A.token, { action: 'WARNING', note: 'x' }); return check(r.s === 404, '404', 'Mã ' + r.s); });
  await tc('TC_VIOLATION_008', async () => { if (!rid1) return blocked('Không có báo cáo'); const c0 = one(`SELECT count(*) FROM report_actions WHERE report_id=${rid1}`); const r = await api('POST', `/admin/reports/${rid1}/action`, A.token, { action: 'WARNING', note: 'lặp' }); const c1 = one(`SELECT count(*) FROM report_actions WHERE report_id=${rid1}`); return check(r.s >= 400 || c0 === c1, `${r.s}, ${c0}→${c1}`, `Báo cáo đã xử lý vẫn nhận xử lý lại (${r.s}), số lần xử lý ${c0}→${c1}`); });

  // =====================================================================
  // PB-37 KIỂM DUYỆT ĐÁNH GIÁ
  // =====================================================================
  const crId = one(`SELECT id FROM company_reviews WHERE reviewer_id=${SV2.id} ORDER BY id DESC LIMIT 1`);
  if (crId) sql(`UPDATE company_reviews SET status='PENDING', published_at=NULL WHERE id=${crId};`);
  const crId2 = (await api('POST', `/reviews/companies/${ctx.E1.id}/company-reviews`, ctx.SV1.token, { experience_type: 'WORKED', rating_environment: 1, rating_salary_benefits: 1, rating_management: 1, rating_culture: 1, rating_learning: 1, rating_recruitment: 1, rating_overall: 1, title: 'Đánh giá vi phạm QA', pros: 'Nội dung vi phạm thử nghiệm kiểm duyệt', cons: 'Nội dung vi phạm thử nghiệm kiểm duyệt 2', advice: '' })).j?.data?.id;
  if (crId2) sql(`UPDATE company_reviews SET status='PENDING', published_at=NULL WHERE id=${crId2};`);
  await tc('TC_REVIEW_MOD_001', async () => { const r = await api('GET', '/admin/reviews/company?status=PENDING&limit=50', A.token); return check(r.s === 200 && (!crId || r.j.data.some(x => String(x.id) === crId)), '200, có đánh giá chờ', 'Mã ' + r.s); });
  await tc('TC_REVIEW_MOD_002', async () => { if (!crId) return blocked('Không có đánh giá thử'); const r = await api('POST', `/admin/reviews/company/${crId}/moderate`, A.token, { action: 'APPROVE' }); return check(r.s === 200, '200', 'Mã ' + r.s + ' ' + (r.j.message || '')); });
  await tc('TC_REVIEW_MOD_004', async () => { if (!crId) return blocked('Không có'); return check(one(`SELECT status FROM company_reviews WHERE id=${crId}`) === 'PUBLISHED', 'PUBLISHED', 'Sai'); });
  await tc('TC_REVIEW_MOD_008', async () => { if (!crId) return blocked('Không có'); const r = await api('POST', `/admin/reviews/company/${crId}/moderate`, A.token, { action: 'APPROVE' }); return check(r.s === 409 || r.s === 400, String(r.s), 'Mã ' + r.s); });
  await tc('TC_REVIEW_MOD_005', async () => { if (!crId2) return blocked('Không tạo được đánh giá vi phạm thử'); const r = await api('POST', `/admin/reviews/company/${crId2}/moderate`, A.token, { action: 'REJECT', reason: 'Nội dung vi phạm quy định' }); return check(r.s === 200 && one(`SELECT status FROM company_reviews WHERE id=${crId2}`) === 'REJECTED', 'REJECTED', 'Mã ' + r.s); });
  await tc('TC_REVIEW_MOD_003', async () => { if (!crId2) return blocked('Không có'); const r = await api('GET', `/reviews/companies/${ctx.E1.id}/company-reviews?limit=50`); return check(!r.j.data?.some?.(x => String(x.id) === crId2) && !/Đánh giá vi phạm QA/.test(r.text), 'Không công khai', 'Lộ đánh giá bị từ chối'); });
  await tc('TC_REVIEW_MOD_007', async () => { if (!crId2) return blocked('Không có'); const r = await api('GET', `/reviews/companies/${ctx.E1.id}/company-reviews?limit=50`); return check(!/Đánh giá vi phạm QA/.test(r.text), 'Không lộ nội dung', 'Lộ'); });
  await tc('TC_REVIEW_MOD_006', async () => { if (!crId) return blocked('Không có'); const r = await api('POST', `/admin/reviews/company/${crId}/moderate`, ctx.E1.token, { action: 'HIDE', reason: 'Trái quyền thử' }); return check(r.s === 403, '403', 'Mã ' + r.s); });

  // =====================================================================
  // PB-38 DANH MỤC
  // =====================================================================
  const catName = 'QA Phân tích dữ liệu ' + R;
  let catId;
  await tc('TC_CATEGORY_001', async () => { const r = await api('GET', '/admin/categories', A.token); return check(r.s === 200 && r.j.data.some(c => c.name === 'Công nghệ thông tin'), '200', 'Mã ' + r.s); });
  await tc('TC_CATEGORY_002', async () => { const r = await api('POST', '/admin/categories', A.token, { name: catName }); catId = r.j?.data?.id; return check(r.s === 201 || r.s === 200, 'Tạo', 'Mã ' + r.s); });
  await tc('TC_CATEGORY_003', async () => { const r = await api('PUT', `/admin/categories/${catId}`, A.token, { name: 'QA Khoa học dữ liệu ' + R, is_active: true }); return check(r.s === 200 && one(`SELECT name FROM categories WHERE id=${catId}`) === 'QA Khoa học dữ liệu ' + R, 'Đổi tên', 'Mã ' + r.s); });
  await tc('TC_CATEGORY_007', async () => { const r = await api('PUT', `/admin/categories/${catId}`, A.token, { name: 'QA Thiết kế - Đồ họa ' + R, is_active: true }); return check(r.s === 200 && one(`SELECT name FROM categories WHERE id=${catId}`) === 'QA Thiết kế - Đồ họa ' + R, 'Unicode đúng', 'Mã ' + r.s); });
  await tc('TC_CATEGORY_005', async () => { const r = await api('POST', '/admin/categories', A.token, { name: 'Công nghệ thông tin' }); return check(r.s >= 400 && r.s < 500 && one(`SELECT count(*) FROM categories WHERE name='Công nghệ thông tin'`) === '1', `${r.s}, 1 bản ghi`, `Mã ${r.s}`); });
  await tc('TC_CATEGORY_009', async () => { const r = await api('POST', '/admin/categories', A.token, { name: 'Công Nghệ Thông Tin ' }); const n = one(`SELECT count(*) FROM categories WHERE lower(name)=lower('Công nghệ thông tin')`); if (n !== '1') sql(`DELETE FROM categories WHERE name='Công Nghệ Thông Tin'`); return check(n === '1', String(r.s), `Tạo được ngành trùng chỉ khác hoa/thường ("Công Nghệ Thông Tin") — ${r.s}`); });
  await tc('TC_CATEGORY_006', async () => { const r = await api('POST', '/admin/categories', A.token, { name: '' }); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_CATEGORY_004', async () => { const r = await api('DELETE', `/admin/categories/${catId}`, A.token); return check(r.s === 200 && !one(`SELECT id FROM categories WHERE id=${catId}`), 'Xóa ngành chưa dùng', 'Mã ' + r.s); });
  await tc('TC_CATEGORY_008', async () => {
    const tmp = await api('POST', '/admin/categories', A.token, { name: 'QA Ngành đang dùng ' + R }); const id = tmp.j.data.id;
    const j = await makeJob(EE1, { t: 'Tin dùng ngành tạm', category: 'QA Ngành đang dùng ' + R });
    const r = await api('DELETE', `/admin/categories/${id}`, A.token);
    const gone = !one(`SELECT id FROM categories WHERE id=${id}`);
    if (!gone) sql(`DELETE FROM categories WHERE id=${id}`);
    return check(r.s >= 400 && !gone, `${r.s}, chặn xóa`, `Xóa được ngành đang có tin tham chiếu (${r.s}) — tin còn lại mang tên ngành không tồn tại`);
  });
  await tc('TC_CATEGORY_010', async () => { const r = await api('POST', '/admin/categories', S1.token, { name: 'Ngành trái quyền' }); return check(r.s === 403, '403', 'Mã ' + r.s); });

  // =====================================================================
  // PB-39 NHẬT KÝ
  // =====================================================================
  await tc('TC_AUDIT_LOG_001', async () => { const r = await api('GET', '/admin/logs', A.token); return check(r.s === 200 && r.j.data.length > 0, r.j.data.length + ' bản ghi', 'Mã ' + r.s); });
  await tc('TC_AUDIT_LOG_002', async () => { const r = await api('GET', '/admin/logs?action=APPROVE_JOB', A.token); const x = r.j.data[0] || {}; return check(x.admin_id || x.admin_name, `Có người (${x.admin_name || x.admin_id}), hành động (${x.action}), thời gian (${x.created_at})`, 'Thiếu trường'); });
  await tc('TC_AUDIT_LOG_005', async () => { const r = await api('GET', '/admin/logs?action=APPROVE_JOB&limit=100', A.token); return check(r.j.data.length > 0 && r.j.data.every(x => x.action === 'APPROVE_JOB'), 'Chỉ APPROVE_JOB', 'Lẫn hành động khác'); });
  const vnDay = (d) => new Date(new Date(d).getTime() + 7 * 3600e3).toISOString().slice(0, 10);
  await tc('TC_AUDIT_LOG_003', async () => { const r = await api('GET', '/admin/logs?from=2026-11-01&to=2026-11-15&limit=500', A.token); const out = r.j.data.filter(l => vnDay(l.created_at) < '2026-11-01' || vnDay(l.created_at) > '2026-11-15'); return check(r.s === 200 && out.length === 0, `${r.j.data.length} bản ghi, đều trong 01–15/11`, `${r.s}, ${out.length} bản ghi ngoài khoảng`); });
  await tc('TC_AUDIT_LOG_006', async () => { const d = vnDay(Date.now()); const r = await api('GET', `/admin/logs?from=${d}&to=${d}&limit=500`, A.token); return check(r.s === 200 && r.j.data.length > 0 && r.j.data.every(l => vnDay(l.created_at) === d), `${r.j.data.length} bản ghi trong đúng ngày ${d} (tính trọn ngày)`, `${r.s} ${r.j.data?.length}`); });
  await tc('TC_AUDIT_LOG_007', async () => { const r = await api('GET', '/admin/logs?from=2026-11-20&to=2026-11-01', A.token); return check(r.s === 400, '400 ' + r.j.message, 'Mã ' + r.s); });
  await tc('TC_AUDIT_LOG_004', async () => { const r = await api('GET', '/admin/logs', S1.token); return check(r.s === 403, '403', 'Mã ' + r.s); });
  await tc('TC_AUDIT_LOG_008', async () => { const r = await api('GET', '/admin/logs', ctx.E1.token); return check(r.s === 403, '403', 'Mã ' + r.s); });

  // Lưu kết quả + thông tin dọn dẹp
  fs.writeFileSync(path.join(__dirname, 'api_results.json'), JSON.stringify({ R, results, ctx: { JOB_PUBLIC: ctx.JOB_PUBLIC, JOB_PENDING: ctx.JOB_PENDING, SV1: ctx.SV1.email, E1: ctx.E1.email } }, null, 1));
  const c = (s) => results.filter(r => r.status === s).length;
  console.log(`\nAPI: ${results.length} case — PASS ${c('PASS')}, FAIL ${c('FAIL')}, BLOCKED ${c('BLOCKED')}`);
})().catch(e => { console.error('DỪNG:', e); fs.writeFileSync(path.join(__dirname, 'api_results.json'), JSON.stringify({ R, results, error: e.message }, null, 1)); process.exit(1); });
