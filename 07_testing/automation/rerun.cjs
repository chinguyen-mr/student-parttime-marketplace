// Chạy lại các case mà lần đầu bị sai do script (giá trị giới tính, tên cột, giới hạn tần suất)
const fs = require('fs');
const path = require('path');
const { api, sql, one, tc, pass, fail, blocked, check, results, login } = require('./lib.cjs');
const prev = JSON.parse(fs.readFileSync(path.join(__dirname, 'api_results.json'), 'utf8'));
const R = prev.R;
const mail = (k) => `qa-${k}-${R}@example.test`;

(async () => {
  const S1 = await login(mail('sva'), 'Abc12345');
  const SV2 = await login(mail('svb'), 'Student@123');
  const SV3 = await login(mail('svc'), 'Student@123');
  const E1 = await login(mail('ntda'), 'Abc12345');
  const A = await login('admin.test@vlu.edu.vn', 'Jobnest@2026');
  const app1 = one(`SELECT a.id FROM applications a JOIN users u ON u.id=a.student_id WHERE u.email='${mail('sva')}' ORDER BY a.id LIMIT 1`);

  await tc('TC_RESET_STU_009', async () => { const a = await api('POST', '/auth/forgot-password', null, { email: '' }); const b = await api('POST', '/auth/forgot-password', null, { email: 'bad@@email' }); return check(a.s === 400 && b.s === 400, 'Cả hai 400', `${a.s}/${b.s}`); });
  await tc('TC_RESET_EMP_009', async () => { const a = await api('POST', '/auth/forgot-password', null, { email: '' }); return check(a.s === 400, '400', 'Mã ' + a.s); });

  await tc('TC_NOTICE_EMP_003', async () => { const n = (await api('GET', '/notifications?limit=200', E1.token)).j.data; const x = n.find(y => y.target_type === 'APPLICATION' && String(y.target_id) === String(app1)); return check(!!x, `Thông báo trỏ APPLICATION#${app1}: "${x?.body?.slice(0, 60)}"`, 'Không có thông báo trỏ đúng đơn'); });

  await tc('TC_APPLICANTS_006', async () => {
    const k = one(`SELECT file_key FROM student_cvs LIMIT 1`);
    if (!k) return blocked('Không có CV mẫu trong DB');
    const r = await fetch(`http://localhost:5000/api/files/cv/${k}`, { headers: { Authorization: 'Bearer ' + E1.token } });
    return check([401, 403, 404].includes(r.status), 'Mã ' + r.status + ' — không tải được CV không thuộc quyền', `Tải được CV của sinh viên không ứng tuyển vào tin mình (${r.status})`);
  });

  const stuBody = (o = {}) => ({ full_name: 'Minh An 2026', phone: '09' + String(Date.now()).slice(-8), date_of_birth: '2004-05-01', gender: 'Nam', province: 'TP. Hồ Chí Minh', ward: 'Phường Bến Nghé', school: 'Đại học Văn Lang', major: 'CNTT', ...o });
  await tc('TC_PROFILE_STU_EDIT_003', async () => { const r = await api('PUT', '/profile/me/student', S1.token, stuBody()); const n = one(`SELECT full_name FROM users WHERE id=${S1.id}`); return check(r.s === 200 && n === 'Minh An 2026', 'Lưu tên mới', `Mã ${r.s} ${r.j.message || ''} ${JSON.stringify(r.j.details || '')}`); });
  await tc('TC_PROFILE_STU_EDIT_004', async () => { const r = await api('PUT', '/profile/me/student', S1.token, stuBody({ full_name: '' })); return check(r.s === 400 && one(`SELECT full_name FROM users WHERE id=${S1.id}`) === 'Minh An 2026', '400, giữ dữ liệu cũ', 'Mã ' + r.s); });
  await tc('TC_PROFILE_STU_EDIT_006', async () => {
    const name = 'Nguyễn ' + 'A'.repeat(300);
    const r = await api('PUT', '/profile/me/student', S1.token, stuBody({ full_name: name }));
    const saved = one(`SELECT full_name FROM users WHERE id=${S1.id}`);
    if (r.s === 400) return pass('400 vượt độ dài');
    return saved.length < name.length ? fail(`Họ tên ${name.length} ký tự trả 200 nhưng bị cắt âm thầm còn ${saved.length} ký tự`) : pass('Lưu đủ');
  });
  await tc('TC_PROFILE_STU_EDIT_007', async () => { const r = await api('PUT', '/profile/me/student', S1.token, stuBody({ full_name: 'Trần Ánh Dương', bio: 'Sinh viên CNTT – lập trình' })); return check(r.s === 200 && one(`SELECT full_name FROM users WHERE id=${S1.id}`) === 'Trần Ánh Dương', 'Unicode đúng', `Mã ${r.s} ${JSON.stringify(r.j.details || r.j.message)}`); });
  await tc('TC_PROFILE_STU_EDIT_008', async () => { await api('PUT', '/profile/me/student', S1.token, { ...stuBody(), role: 'ADMIN' }); return check(one(`SELECT role FROM users WHERE id=${S1.id}`) === 'STUDENT', 'role giữ STUDENT', 'Bị đổi role'); });
  await tc('TC_PROFILE_STU_EDIT_005', async () => { await api('PUT', '/profile/me/student', S1.token, { ...stuBody({ full_name: 'Sửa trái phép SV khác' }), user_id: SV2.id, student_id: SV2.id }); return check(one(`SELECT full_name FROM users WHERE id=${SV2.id}`) !== 'Sửa trái phép SV khác', 'SV khác không bị sửa', 'SV khác bị sửa'); });

  // Khiếu nại tài khoản
  sql(`UPDATE users SET status='BANNED', suspension_reason='QA kiểm thử' WHERE id=${SV3.id};`);
  const ap = await api('POST', '/auth/appeals', null, { email: mail('svc'), password: 'Student@123', appeal_reason: 'Tôi bị khóa nhầm, xin xem xét lại tài khoản QA.' });
  const apId = one(`SELECT id FROM user_appeals WHERE user_id=${SV3.id} ORDER BY id DESC LIMIT 1`);
  await tc('TC_COMPLAINT_001', async () => { const r = await api('GET', '/admin/appeals?status=ALL', A.token); return check(r.s === 200 && r.j.data.some(x => String(x.id) === apId), '200, có khiếu nại thử', `Mã ${r.s}, tạo khiếu nại ${ap.s} ${ap.j.message || ''}`); });
  await tc('TC_COMPLAINT_002', async () => { const r = await api('GET', '/admin/appeals?status=ALL', A.token); const x = r.j.data.find(y => String(y.id) === apId); return x ? check(x.email === mail('svc') && /khóa nhầm/.test(x.appeal_reason), 'Nội dung + tài khoản đúng', 'Sai') : fail('Không tạo được khiếu nại: ' + ap.s); });
  await tc('TC_COMPLAINT_006', async () => { const r = await api('PATCH', `/admin/appeals/${apId}`, A.token, { status: 'INVALID_STATE', admin_response: 'x' }); return check(r.s === 400, '400', 'Mã ' + r.s); });
  await tc('TC_COMPLAINT_004', async () => { const r = await api('PATCH', `/admin/appeals/${apId}`, A.token, { status: 'APPROVED', admin_response: 'Đã mở khóa sau khi xem xét.' }); const again = (await api('GET', '/admin/appeals?status=ALL', A.token)).j.data.find(y => String(y.id) === apId); return check(r.s === 200 && again?.status === 'APPROVED' && one(`SELECT status FROM users WHERE id=${SV3.id}`) === 'ACTIVE', 'Lưu APPROVED, tra cứu lại được, tài khoản mở khóa', 'Mã ' + r.s); });
  sql(`UPDATE users SET status='ACTIVE', suspension_reason=NULL WHERE id=${SV3.id};`);

  // Ghi đè kết quả lần đầu
  const map = new Map(prev.results.map(x => [x.id, x]));
  for (const x of results) map.set(x.id, x);
  prev.results = [...map.values()];
  fs.writeFileSync(path.join(__dirname, 'api_results.json'), JSON.stringify(prev, null, 1));
  console.log('Đã cập nhật', results.length, 'case');
})().catch(e => { console.error(e); process.exit(1); });
