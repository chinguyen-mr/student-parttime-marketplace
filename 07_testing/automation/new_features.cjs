// Test case BỔ SUNG (PB40 → PB58) cho các chức năng chưa có trong CDTN2_TestCases.xlsx.
// Mỗi case khai báo cả nội dung (để xuất Excel) lẫn đoạn kiểm thử chạy thật trên API + DB.
// Chạy: API_URL=http://localhost:5056/api node new_features.cjs   → new_features_results.json
const fs = require('fs');
const path = require('path');
const { api, sql, one, tc, pass, fail, check, results, R, futureDate, login } = require('./lib.cjs');

const PW = 'Student@123';
const PW_E = 'Employer@123';
const mail = (k) => `qa-${k}-${R}@example.test`;
const JOB_PREFIX = `[QA-NEW ${R}]`;
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const PDF = `data:application/pdf;base64,${Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF').toString('base64')}`;
const FAKE_PDF = `data:application/pdf;base64,${Buffer.from('<html>khong phai pdf</html>').toString('base64')}`;
const FAKE_PNG = `data:image/png;base64,${Buffer.from('day la van ban').toString('base64')}`;
const BIG_PDF = `data:application/pdf;base64,${Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(3 * 1024 * 1024 + 10, 32)]).toString('base64')}`;

let phoneSeq = 0;
const newPhone = () => '09' + String((Date.now() % 1e6) * 100 + (phoneSeq++ % 100)).padStart(8, '0').slice(-8);
const ctx = {};
// Hồ sơ 100% (sinh viên: 11 mục; NTD: 11 mục + đã xác minh) — điều kiện để ứng tuyển / đăng tin
const readyStudent = (id) => sql(`UPDATE users SET phone = COALESCE(phone, '0901234567') WHERE id=${id};
  UPDATE student_profiles SET date_of_birth='2004-05-12', gender='Nam', province='TP. Hồ Chí Minh', ward='Phường Bến Nghé', school='Đại học Văn Lang',
  major='Công nghệ thông tin', bio='Sinh viên năm 3, chăm chỉ.', desired_position='Nhân viên phục vụ', skills=ARRAY['Giao tiếp'],
  languages='[{"language":"Tiếng Anh","level":"Giao tiếp"}]'::jsonb WHERE user_id=${id};`);
const readyEmployer = (id, status = 'VERIFIED') => sql(`UPDATE employer_profiles SET avatar_url='/api/files/1', cover_url='/api/files/2',
  office_images='["/api/files/1","/api/files/2","/api/files/3"]'::jsonb, industry='Dịch vụ', company_size='10 – 49 nhân viên', province='TP. Hồ Chí Minh',
  detailed_address='10 Lê Lợi, Quận 1', bio='Chuỗi cà phê dành cho sinh viên.', work_environment_desc='Thân thiện, linh hoạt ca.',
  hr_policy_details='{"internship":"Có xác nhận thực tập","training":"Kèm cặp 1 tuần"}'::jsonb, public_email='tuyendung@example.test',
  latitude=10.7769, longitude=106.7009, verification_status='${status}' WHERE user_id=${id};`);
const notif = (userId, type, extra = '') => Number(one(`SELECT count(*) FROM notifications WHERE user_id=${userId} AND type='${type}' ${extra}`));
const adminTask = (targetType, targetId) => Number(one(`SELECT count(*) FROM notifications WHERE user_id=${ctx.A.id} AND type='ADMIN_TASK' AND target_type='${targetType}' AND target_id=${targetId}`));

async function register(kind, key) {
  const body = kind === 'S'
    ? { email: mail(key), password: PW, full_name: 'QA Sinh viên ' + key, role: 'STUDENT', phone: newPhone() }
    : { email: mail(key), password: PW_E, full_name: 'QA NTD ' + key, company_name: 'QA Công ty ' + key, role: 'EMPLOYER', phone: newPhone() };
  const r = await api('POST', '/auth/register', null, body);
  if (r.s !== 201 && r.s !== 200) throw new Error(`Tạo ${key} lỗi ${r.s} ${JSON.stringify(r.j).slice(0, 200)}`);
  return login(mail(key), kind === 'S' ? PW : PW_E);
}
const jobBody = (over = {}) => ({
  title: `${JOB_PREFIX} ${over.t || 'Nhân viên phục vụ'}`, description: 'Phục vụ khách, dọn bàn, hỗ trợ thu ngân ca tối.',
  requirements: 'Nhanh nhẹn', category: 'Dịch vụ', location: '10 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
  salary_type: 'HOURLY', salary: 30000, work_type: 'PART_TIME', quantity_required: over.qty || 2, application_deadline: futureDate(20),
});
async function approvedJob(emp, over) {
  const r = await api('POST', '/jobs', emp.token, jobBody(over));
  if (r.s !== 201) throw new Error('Tạo tin lỗi ' + r.s + ' ' + JSON.stringify(r.j).slice(0, 200));
  await api('PATCH', `/admin/jobs/${r.j.data.id}/moderate`, ctx.A.token, { moderation_status: 'APPROVED' });
  return r.j.data.id;
}
const apply = (sv, jobId) => api('POST', '/applications', sv.token, { job_id: jobId, cover_letter: 'Em là sinh viên năm 3, có kinh nghiệm phục vụ quán cà phê.' });

// ---------------------------------------------------------------------------------------------------------------
// DANH SÁCH TEST CASE. Trường: tr, id, type, pri, feat (mã chức năng trong 10_JOBNEST_Danh_Sach_Chuc_Nang),
// obj, pre, act (bước thao tác), data, exp (kết quả mong đợi), run
// ---------------------------------------------------------------------------------------------------------------
const T = [];
const add = (o) => T.push(o);
const PRE_SV = 'Sinh viên SV_A đã đăng nhập, hồ sơ có trường/chuyên ngành.';
const PRE_E = 'Nhà tuyển dụng NTD_A đã đăng nhập.';
const PRE_A = 'Quản trị viên đã đăng nhập.';

// ---------- PB40: QUẢN LÝ CV ----------
add({ tr: 'TR-PB40-01', id: 'TC_CV_001', type: 'Positive', pri: 'High', feat: 'S03', obj: 'Tải CV PDF hợp lệ và đặt làm CV mặc định', pre: PRE_SV,
  act: 'Vào Quản lý CV → chọn file PDF → Tải lên', data: 'CV_SV_A.pdf (PDF hợp lệ, < 3MB)', exp: 'Tải lên thành công; mục CV mặc định hiển thị đúng tên file.',
  run: async () => { const r = await api('POST', '/files/cv', ctx.SV1.token, { data_url: PDF, name: 'CV_SV_A.pdf' }); const me = await api('GET', '/files/cv/me', ctx.SV1.token); ctx.cvKey = JSON.stringify(me.j.data || {}); return check(r.s === 201 && me.s === 200 && /CV_SV_A/.test(JSON.stringify(me.j)), 'CV lưu và trả về đúng', `upload ${r.s}, cv/me ${me.s} ${JSON.stringify(me.j).slice(0, 120)}`); } });
add({ tr: 'TR-PB40-02', id: 'TC_CV_002', type: 'Negative', pri: 'High', feat: 'S03', obj: 'Từ chối file đổi đuôi .pdf nhưng nội dung không phải PDF', pre: PRE_SV,
  act: 'Chọn file HTML đổi tên thành .pdf → Tải lên', data: 'fake.pdf (nội dung HTML)', exp: 'Báo lỗi "CV phải là file PDF", không lưu file.',
  run: async () => { const r = await api('POST', '/files/cv', ctx.SV1.token, { data_url: FAKE_PDF, name: 'fake.pdf' }); return check(r.s === 400, '400 ' + r.j.message, 'Mã ' + r.s); } });
add({ tr: 'TR-PB40-03', id: 'TC_CV_003', type: 'Boundary', pri: 'Medium', feat: 'S03', obj: 'Từ chối CV vượt 3MB', pre: PRE_SV,
  act: 'Tải lên file PDF lớn hơn 3MB', data: 'big.pdf (3MB + 10 byte)', exp: 'Báo lỗi dung lượng, không lưu file.',
  run: async () => { const r = await api('POST', '/files/cv', ctx.SV1.token, { data_url: BIG_PDF, name: 'big.pdf' }); return check(r.s === 400 || r.s === 413, `${r.s} ${r.j.message || ''}`, 'Mã ' + r.s); } });
add({ tr: 'TR-PB40-04', id: 'TC_CV_004', type: 'Security', pri: 'High', feat: 'S03', obj: 'Nhà tuyển dụng không gọi được API tải CV của sinh viên', pre: PRE_E,
  act: 'Gửi POST /api/files/cv bằng token NTD', data: 'Token NTD_A', exp: 'Trả 403, không tạo file.',
  run: async () => { const r = await api('POST', '/files/cv', ctx.E1.token, { data_url: PDF, name: 'x.pdf' }); return check(r.s === 403, '403', 'Mã ' + r.s); } });
add({ tr: 'TR-PB40-05', id: 'TC_CV_005', type: 'Security', pri: 'High', feat: 'S03', obj: 'Không đoán được link CV bằng khóa sai', pre: 'Có CV đã tải lên.',
  act: 'Mở /api/files/cv/<khóa ngẫu nhiên>', data: 'Khóa: 0000…', exp: 'Trả 404, không lộ CV.',
  run: async () => { const r = await api('GET', '/files/cv/00000000000000000000000000000000', null); return check(r.s === 404 || r.s === 400, String(r.s), 'Mã ' + r.s); } });

// ---------- PB41: LỊCH RẢNH & GỢI Ý ----------
const SLOTS = [{ day_of_week: 2, start_time: '18:00', end_time: '22:00' }, { day_of_week: 7, start_time: '08:00', end_time: '12:00' }];
add({ tr: 'TR-PB41-01', id: 'TC_AVAIL_001', type: 'Positive', pri: 'High', feat: 'S04', obj: 'Lưu lịch rảnh hợp lệ', pre: PRE_SV,
  act: 'Vào Lịch rảnh → thêm 2 khung giờ → Lưu', data: 'Thứ 2 18:00–22:00; Thứ 7 08:00–12:00', exp: 'Lưu thành công, tải lại vẫn thấy 2 khung giờ.',
  run: async () => { const r = await api('PUT', '/profile/availability', ctx.SV1.token, { slots: SLOTS }); const g = await api('GET', '/profile/availability', ctx.SV1.token); const n = (g.j.data || []).length ?? 0; return check(r.s === 200 && n === 2, 'Lưu 2 khung', `PUT ${r.s}, GET ${g.s} số khung ${n}`); } });
add({ tr: 'TR-PB41-02', id: 'TC_AVAIL_002', type: 'Negative', pri: 'Medium', feat: 'S04', obj: 'Từ chối ngày trong tuần ngoài 1–7', pre: PRE_SV,
  act: 'Gửi khung giờ day_of_week = 8', data: 'day_of_week: 8', exp: 'Trả 400 với thông báo ngày không hợp lệ.',
  run: async () => { const r = await api('PUT', '/profile/availability', ctx.SV1.token, { slots: [{ day_of_week: 8, start_time: '08:00', end_time: '10:00' }] }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB41-03', id: 'TC_AVAIL_003', type: 'Negative', pri: 'Medium', feat: 'S04', obj: 'Từ chối giờ kết thúc trước giờ bắt đầu', pre: PRE_SV,
  act: 'Nhập khung 22:00 → 18:00 rồi Lưu', data: 'start 22:00, end 18:00', exp: 'Trả 400; lịch rảnh cũ giữ nguyên.',
  run: async () => { const r = await api('PUT', '/profile/availability', ctx.SV1.token, { slots: [{ day_of_week: 3, start_time: '22:00', end_time: '18:00' }] }); const g = await api('GET', '/profile/availability', ctx.SV1.token); return check(r.s === 400 && (g.j.data || []).length === 2, '400, lịch cũ còn nguyên', `Mã ${r.s}, số khung sau lỗi ${(g.j.data || []).length}`); } });
add({ tr: 'TR-PB41-04', id: 'TC_AVAIL_004', type: 'Security', pri: 'Medium', feat: 'S04', obj: 'Nhà tuyển dụng không sửa được lịch rảnh', pre: PRE_E,
  act: 'Gửi PUT /api/profile/availability bằng token NTD', data: 'Token NTD_A', exp: 'Trả 403.',
  run: async () => { const r = await api('PUT', '/profile/availability', ctx.E1.token, { slots: SLOTS }); return check(r.s === 403, '403', 'Mã ' + r.s); } });
add({ tr: 'TR-PB41-05', id: 'TC_RECO_001', type: 'Positive', pri: 'High', feat: 'S05', obj: 'Gợi ý việc làm chỉ gồm tin đang mở và đã duyệt', pre: PRE_SV + ' Có tin chờ duyệt và tin đã duyệt.',
  act: 'Mở mục Gợi ý AI', data: 'Lịch rảnh đã lưu ở TC_AVAIL_001', exp: 'Danh sách gợi ý có điểm phù hợp; không chứa tin chờ duyệt/đã đóng.',
  run: async () => { const r = await api('GET', '/jobs/recommended', ctx.SV1.token); const list = r.j.data?.jobs || r.j.data || []; const ids = list.map(j => j.id); const bad = ids.filter(id => one(`SELECT (status<>'OPEN' OR moderation_status<>'APPROVED')::text FROM jobs WHERE id=${id}`) === 'true'); return check(r.s === 200 && Array.isArray(list) && !ids.includes(ctx.JOB_PENDING) && bad.length === 0, `${list.length} gợi ý hợp lệ`, `Mã ${r.s}, tin không hợp lệ: ${bad.join(',')}`); } });
add({ tr: 'TR-PB41-06', id: 'TC_RECO_002', type: 'Security', pri: 'Medium', feat: 'S05', obj: 'Khách không gọi được API gợi ý cá nhân', pre: 'Chưa đăng nhập.',
  act: 'Gọi GET /api/jobs/recommended không token', data: 'N/A', exp: 'Trả 401.',
  run: async () => { const r = await api('GET', '/jobs/recommended', null); return check(r.s === 401, '401', 'Mã ' + r.s); } });

// ---------- PB42: LƯU VIỆC LÀM ----------
add({ tr: 'TR-PB42-01', id: 'TC_SAVE_001', type: 'Positive', pri: 'Medium', feat: 'S06', obj: 'Lưu tin vào danh sách việc đã lưu', pre: PRE_SV,
  act: 'Mở chi tiết tin → bấm Lưu → vào Việc làm đã lưu', data: 'Tin JOB_PUBLIC', exp: 'Tin xuất hiện trong Việc làm đã lưu.',
  run: async () => { const r = await api('POST', `/jobs/${ctx.JOB_PUBLIC}/save`, ctx.SV1.token); const g = await api('GET', '/jobs/saved', ctx.SV1.token); const ids = g.j.data?.ids || []; return check(r.j.data?.saved === true && ids.includes(ctx.JOB_PUBLIC), 'Đã lưu', `save=${r.j.data?.saved}, ds=${ids}`); } });
add({ tr: 'TR-PB42-02', id: 'TC_SAVE_002', type: 'Positive', pri: 'Medium', feat: 'S06', obj: 'Bấm Lưu lần nữa thì bỏ lưu', pre: 'Tin đã được lưu (TC_SAVE_001).',
  act: 'Bấm lại nút Lưu', data: 'Tin JOB_PUBLIC', exp: 'Tin biến mất khỏi Việc làm đã lưu.',
  run: async () => { const r = await api('POST', `/jobs/${ctx.JOB_PUBLIC}/save`, ctx.SV1.token); const g = await api('GET', '/jobs/saved', ctx.SV1.token); const ids = g.j.data?.ids || []; return check(r.j.data?.saved === false && !ids.includes(ctx.JOB_PUBLIC), 'Đã bỏ lưu', `save=${r.j.data?.saved}`); } });
add({ tr: 'TR-PB42-03', id: 'TC_SAVE_003', type: 'Negative', pri: 'Medium', feat: 'S06', obj: 'Lưu tin không tồn tại', pre: PRE_SV,
  act: 'Gọi lưu tin có ID không tồn tại', data: 'job id 99999999', exp: 'Trả 404, không tạo bản ghi.',
  run: async () => { const r = await api('POST', '/jobs/99999999/save', ctx.SV1.token); return check(r.s === 404, '404', 'Mã ' + r.s + ' ' + (r.j.message || '')); } });

// ---------- PB43: RÚT ĐƠN ----------
add({ tr: 'TR-PB43-01', id: 'TC_WITHDRAW_001', type: 'Positive', pri: 'High', feat: 'S09', obj: 'Rút đơn đang chờ duyệt và báo cho NTD', pre: 'SV_C có đơn Chờ duyệt vào JOB_PUBLIC.',
  act: 'Lịch sử ứng tuyển → mở đơn → Rút đơn → Xác nhận', data: 'Đơn APP_WITHDRAW', exp: 'Đơn chuyển trạng thái đã rút; NTD nhận thông báo "Ứng viên đã hủy đơn".',
  run: async () => { const a = await apply(ctx.SV3, ctx.JOB_PUBLIC); const id = a.j.data?.id; const r = await api('PATCH', `/applications/${id}/withdraw`, ctx.SV3.token); const st = one(`SELECT status FROM applications WHERE id=${id}`); return check(r.s === 200 && /WITHDRAW|CANCEL/.test(st) && notif(ctx.E1.id, 'APPLICATION_WITHDRAWN', `AND target_id=${id}`) === 1, 'Trạng thái ' + st + ', NTD có thông báo', `apply ${a.s}, withdraw ${r.s}, status ${st}`); } });
add({ tr: 'TR-PB43-02', id: 'TC_WITHDRAW_002', type: 'Security', pri: 'High', feat: 'S09', obj: 'Không rút được đơn của sinh viên khác', pre: 'SV_A có đơn Chờ duyệt.',
  act: 'SV_B gọi PATCH /applications/<đơn SV_A>/withdraw', data: 'Token SV_B', exp: 'Trả 403; đơn SV_A giữ nguyên.',
  run: async () => { const r = await api('PATCH', `/applications/${ctx.APP1}/withdraw`, ctx.SV2.token); return check(r.s === 403 && one(`SELECT status FROM applications WHERE id=${ctx.APP1}`) === 'PENDING', '403, đơn giữ nguyên', 'Mã ' + r.s); } });
add({ tr: 'TR-PB43-03', id: 'TC_WITHDRAW_003', type: 'Negative', pri: 'Medium', feat: 'S09', obj: 'Không rút được đơn đã rút', pre: 'Đơn ở TC_WITHDRAW_001 đã rút.',
  act: 'Bấm Rút đơn lần nữa', data: 'Đơn đã rút', exp: 'Báo lỗi "Chỉ rút được đơn đang chờ duyệt".',
  run: async () => { const id = one(`SELECT id FROM applications WHERE student_id=${ctx.SV3.id} AND job_id=${ctx.JOB_PUBLIC}`); const r = await api('PATCH', `/applications/${id}/withdraw`, ctx.SV3.token); return check(r.s === 400 || r.s === 409, String(r.s), 'Mã ' + r.s); } });

// ---------- PB44: CHỌN ỨNG VIÊN & TẠO HỢP ĐỒNG ----------
add({ tr: 'TR-PB44-01', id: 'TC_SELECT_001', type: 'Negative', pri: 'Medium', feat: 'E17', obj: 'Không chọn khi danh sách đơn rỗng', pre: PRE_E,
  act: 'Bấm Chọn ứng viên mà không tick đơn nào', data: 'applicationIds: []', exp: 'Trả 400, không tạo hợp đồng.',
  run: async () => { const r = await api('POST', `/jobs/${ctx.JOB_PUBLIC}/selections`, ctx.E1.token, { applicationIds: [] }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB44-02', id: 'TC_SELECT_002', type: 'Security', pri: 'High', feat: 'E17', obj: 'NTD khác không chọn được ứng viên của tin không thuộc mình', pre: 'NTD_B đăng nhập; đơn SV_A thuộc tin NTD_A.',
  act: 'NTD_B gọi POST /jobs/<tin NTD_A>/selections', data: 'applicationIds: [đơn SV_A]', exp: 'Trả 403; đơn vẫn Chờ duyệt.',
  run: async () => { const r = await api('POST', `/jobs/${ctx.JOB_PUBLIC}/selections`, ctx.E2.token, { applicationIds: [ctx.APP1] }); return check((r.s === 403 || r.s === 404) && one(`SELECT status FROM applications WHERE id=${ctx.APP1}`) === 'PENDING', String(r.s), 'Mã ' + r.s); } });
add({ tr: 'TR-PB44-03', id: 'TC_SELECT_003', type: 'Positive', pri: 'High', feat: 'E17', obj: 'Chọn ứng viên → tạo hợp đồng và báo cho sinh viên', pre: 'Tin JOB_PUBLIC (cần 2 người) có đơn của SV_A và SV_B.',
  act: 'Hồ sơ ứng viên → tick SV_A, SV_B → Chọn ứng viên', data: 'applicationIds: [đơn SV_A, đơn SV_B]', exp: 'Tạo 2 hợp đồng; đơn chuyển Đã nhận; mỗi SV nhận thông báo; tin chuyển Đã nhận người vì đủ chỉ tiêu.',
  run: async () => { const r = await api('POST', `/jobs/${ctx.JOB_PUBLIC}/selections`, ctx.E1.token, { applicationIds: [ctx.APP1, ctx.APP2] }); ctx.WA1 = Number(one(`SELECT id FROM work_assignments WHERE application_id=${ctx.APP1}`)); ctx.WA2 = Number(one(`SELECT id FROM work_assignments WHERE application_id=${ctx.APP2}`)); const st = one(`SELECT status FROM jobs WHERE id=${ctx.JOB_PUBLIC}`); const n = notif(ctx.SV1.id, 'APPLICATION_ACCEPTED'); return check(r.s === 200 || r.s === 201 ? (ctx.WA1 > 0 && ctx.WA2 > 0 && st === 'FILLED' && n === 1) : false, `2 hợp đồng, tin ${st}, SV có thông báo`, `Mã ${r.s} ${r.j.message || ''}; WA ${ctx.WA1}/${ctx.WA2}; tin ${st}; thông báo ${n}`); } });
add({ tr: 'TR-PB44-04', id: 'TC_SELECT_004', type: 'Boundary', pri: 'High', feat: 'E17', obj: 'Không chọn vượt số lượng cần tuyển', pre: 'Tin JOB_PUBLIC đã đủ 2/2 người; SV_C nộp đơn mới vào tin khác cùng chỉ tiêu 1.',
  act: 'Chọn thêm ứng viên khi tin đã đủ người', data: 'Tin 1 chỉ tiêu, chọn 2 đơn', exp: 'Trả lỗi 400/409 vượt chỉ tiêu; không tạo hợp đồng nào.',
  run: async () => { const job = await approvedJob(ctx.E1, { t: 'Tin 1 chỉ tiêu', qty: 1 }); const a1 = await apply(ctx.SV2, job); const a2 = await apply(ctx.SV3, job); const r = await api('POST', `/jobs/${job}/selections`, ctx.E1.token, { applicationIds: [a1.j.data.id, a2.j.data.id] }); const n = one(`SELECT count(*) FROM work_assignments WHERE job_id=${job}`); return check((r.s === 400 || r.s === 409) && n === '0', `${r.s}, 0 hợp đồng`, `Mã ${r.s}, số hợp đồng ${n}`); } });

// ---------- PB45: TIẾN ĐỘ & SẢN PHẨM BÀN GIAO ----------
add({ tr: 'TR-PB45-01', id: 'TC_PROGRESS_001', type: 'Positive', pri: 'High', feat: 'S11', obj: 'Sinh viên cập nhật tiến độ, NTD được báo', pre: 'SV_A có hợp đồng WA1 đang hiệu lực.',
  act: 'Chi tiết công việc → nhập tiến độ 40% → Gửi', data: 'description: "Hoàn thành ca 1–2", progress_percent: 40', exp: 'Lưu tiến độ; NTD nhận thông báo cập nhật tiến độ.',
  run: async () => { const r = await api('POST', `/assignments/${ctx.WA1}/progress`, ctx.SV1.token, { description: 'Hoàn thành ca 1–2', progress_percent: 40 }); return check(r.s === 201 && notif(ctx.E1.id, 'ASSIGNMENT_PROGRESS', `AND target_id=${ctx.WA1}`) >= 1, 'Đã lưu, NTD có thông báo', `Mã ${r.s} ${r.j.message || ''}`); } });
add({ tr: 'TR-PB45-02', id: 'TC_PROGRESS_002', type: 'Boundary', pri: 'Medium', feat: 'S11', obj: 'Từ chối phần trăm tiến độ ngoài 0–100', pre: 'Như TC_PROGRESS_001.',
  act: 'Nhập tiến độ 150%', data: 'progress_percent: 150', exp: 'Trả 400.',
  run: async () => { const r = await api('POST', `/assignments/${ctx.WA1}/progress`, ctx.SV1.token, { description: 'Thử vượt ngưỡng', progress_percent: 150 }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB45-03', id: 'TC_PROGRESS_003', type: 'Security', pri: 'High', feat: 'S11', obj: 'Sinh viên ngoài hợp đồng không cập nhật được tiến độ', pre: 'SV_C không thuộc hợp đồng WA1.',
  act: 'SV_C gọi POST /assignments/WA1/progress', data: 'Token SV_C', exp: 'Trả 403/404; không ghi tiến độ.',
  run: async () => { const r = await api('POST', `/assignments/${ctx.WA1}/progress`, ctx.SV3.token, { description: 'Xâm nhập', progress_percent: 10 }); return check(r.s === 403 || r.s === 404, String(r.s), 'Mã ' + r.s); } });
add({ tr: 'TR-PB45-04', id: 'TC_DELIV_001', type: 'Negative', pri: 'Medium', feat: 'S12', obj: 'Từ chối link sản phẩm không phải http(s)', pre: 'SV_A có hợp đồng WA1.',
  act: 'Nộp sản phẩm với link sai định dạng', data: 'link: "ftp://abc"', exp: 'Trả 400.',
  run: async () => { const r = await api('POST', `/assignments/${ctx.WA1}/deliverables`, ctx.SV1.token, { link: 'ftp://abc' }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB45-05', id: 'TC_DELIV_002', type: 'Positive', pri: 'High', feat: 'S12', obj: 'Nộp sản phẩm bàn giao v1, NTD được báo', pre: 'SV_A có hợp đồng WA1.',
  act: 'Nộp sản phẩm với link Google Drive', data: 'link: https://drive.google.com/abc', exp: 'Lưu phiên bản 1 trạng thái chờ duyệt; NTD nhận thông báo.',
  run: async () => { const r = await api('POST', `/assignments/${ctx.WA1}/deliverables`, ctx.SV1.token, { link: 'https://drive.google.com/abc', description: 'Bản 1' }); ctx.D1 = r.j.data?.id || Number(one(`SELECT max(id) FROM assignment_deliverables WHERE assignment_id=${ctx.WA1}`)); return check(r.s === 201 && notif(ctx.E1.id, 'DELIVERABLE_SUBMITTED') >= 1, 'v1 đã nộp, NTD có thông báo', `Mã ${r.s} ${r.j.message || ''}`); } });
add({ tr: 'TR-PB45-06', id: 'TC_DELIV_003', type: 'Negative', pri: 'Medium', feat: 'S12', obj: 'Không nộp phiên bản mới khi bản trước đang chờ duyệt', pre: 'v1 đang chờ duyệt.',
  act: 'Nộp tiếp sản phẩm', data: 'link: https://drive.google.com/def', exp: 'Trả 400 "Phiên bản trước đang chờ duyệt".',
  run: async () => { const r = await api('POST', `/assignments/${ctx.WA1}/deliverables`, ctx.SV1.token, { link: 'https://drive.google.com/def' }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB45-07', id: 'TC_DELIV_004', type: 'Negative', pri: 'High', feat: 'E19', obj: 'Yêu cầu chỉnh sửa bắt buộc có lý do', pre: 'NTD_A xem sản phẩm v1.',
  act: 'Bấm Yêu cầu chỉnh sửa, bỏ trống lý do', data: 'decision: REVISION_REQUESTED, comment: ""', exp: 'Trả 400; sản phẩm vẫn chờ duyệt.',
  run: async () => { const r = await api('POST', `/assignments/${ctx.WA1}/deliverables/${ctx.D1}/review`, ctx.E1.token, { decision: 'REVISION_REQUESTED', comment: '' }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB45-08', id: 'TC_DELIV_005', type: 'Positive', pri: 'High', feat: 'E19', obj: 'Yêu cầu chỉnh sửa có lý do → SV được báo và nộp được v2', pre: 'v1 chờ duyệt.',
  act: 'Nhập lý do → Gửi yêu cầu chỉnh sửa; SV nộp lại v2', data: 'comment: "Thiếu báo cáo ca tối"', exp: 'SV nhận thông báo; v2 nộp thành công.',
  run: async () => { const r = await api('POST', `/assignments/${ctx.WA1}/deliverables/${ctx.D1}/review`, ctx.E1.token, { decision: 'REVISION_REQUESTED', comment: 'Thiếu báo cáo ca tối' }); const v2 = await api('POST', `/assignments/${ctx.WA1}/deliverables`, ctx.SV1.token, { link: 'https://drive.google.com/v2' }); ctx.D2 = v2.j.data?.id || Number(one(`SELECT max(id) FROM assignment_deliverables WHERE assignment_id=${ctx.WA1}`)); return check(r.s === 200 && v2.s === 201 && notif(ctx.SV1.id, 'DELIVERABLE_REVIEWED') >= 1, 'SV có thông báo, v2 đã nộp', `review ${r.s}, v2 ${v2.s}`); } });
add({ tr: 'TR-PB45-09', id: 'TC_DELIV_006', type: 'Boundary', pri: 'Medium', feat: 'E19', obj: 'Không duyệt lại phiên bản đã duyệt', pre: 'v2 vừa được Chấp nhận.',
  act: 'Chấp nhận v2, sau đó gửi duyệt v2 lần nữa', data: 'decision: ACCEPTED ×2', exp: 'Lần 1 thành công; lần 2 trả 400 "Phiên bản này đã được duyệt".',
  run: async () => { const a = await api('POST', `/assignments/${ctx.WA1}/deliverables/${ctx.D2}/review`, ctx.E1.token, { decision: 'ACCEPTED' }); const b = await api('POST', `/assignments/${ctx.WA1}/deliverables/${ctx.D2}/review`, ctx.E1.token, { decision: 'ACCEPTED' }); return check(a.s === 200 && b.s === 400, 'lần 1 200, lần 2 400', `${a.s} / ${b.s}`); } });

// ---------- PB46: TRẠNG THÁI HỢP ĐỒNG ----------
add({ tr: 'TR-PB46-01', id: 'TC_ASSIGN_001', type: 'Negative', pri: 'Medium', feat: 'E18', obj: 'Từ chối trạng thái hợp đồng không hợp lệ', pre: PRE_E,
  act: 'Gửi trạng thái "DONE"', data: 'status: DONE', exp: 'Trả 400.',
  run: async () => { const r = await api('PATCH', `/assignments/${ctx.WA1}/status`, ctx.E1.token, { status: 'DONE' }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB46-05', id: 'TC_ASSIGN_005', type: 'Negative', pri: 'Medium', feat: 'E18', obj: 'Không nhảy cóc Chưa bắt đầu → Hoàn thành', pre: 'Hợp đồng WA2 Chưa bắt đầu.',
  act: 'Bấm Hoàn thành khi hợp đồng chưa bắt đầu', data: 'status: COMPLETED', exp: 'Trả 409 "phải qua Đang làm".',
  run: async () => { const r = await api('PATCH', `/assignments/${ctx.WA2}/status`, ctx.E1.token, { status: 'COMPLETED' }); return check(r.s === 409 || r.s === 400, String(r.s), 'Mã ' + r.s); } });
add({ tr: 'TR-PB46-02', id: 'TC_ASSIGN_002', type: 'Security', pri: 'High', feat: 'E18', obj: 'Sinh viên không tự đổi trạng thái hợp đồng', pre: PRE_SV,
  act: 'SV_A gọi PATCH /assignments/WA1/status', data: 'status: COMPLETED', exp: 'Trả 403.',
  run: async () => { const r = await api('PATCH', `/assignments/${ctx.WA1}/status`, ctx.SV1.token, { status: 'COMPLETED' }); return check(r.s === 403, '403', 'Mã ' + r.s); } });
add({ tr: 'TR-PB46-03', id: 'TC_ASSIGN_003', type: 'Positive', pri: 'High', feat: 'E18', obj: 'Chuyển hợp đồng Đang làm → Hoàn thành, SV được báo', pre: 'WA1 mới tạo (Chưa bắt đầu).',
  act: 'Quản lý hợp đồng → Bắt đầu làm → Hoàn thành', data: 'status: IN_PROGRESS rồi COMPLETED', exp: 'Hợp đồng Hoàn thành; SV nhận thông báo.',
  run: async () => { await api('PATCH', `/assignments/${ctx.WA1}/status`, ctx.E1.token, { status: 'IN_PROGRESS' }); const r = await api('PATCH', `/assignments/${ctx.WA1}/status`, ctx.E1.token, { status: 'COMPLETED' }); return check(r.s === 200 && one(`SELECT status FROM work_assignments WHERE id=${ctx.WA1}`) === 'COMPLETED' && notif(ctx.SV1.id, 'ASSIGNMENT_COMPLETED') >= 1, 'COMPLETED, SV có thông báo', `Mã ${r.s} ${r.j.message || ''}`); } });
add({ tr: 'TR-PB46-04', id: 'TC_ASSIGN_004', type: 'Negative', pri: 'Medium', feat: 'S11', obj: 'Không cập nhật tiến độ sau khi hợp đồng kết thúc', pre: 'WA1 đã Hoàn thành.',
  act: 'SV_A gửi tiến độ mới', data: 'progress_percent: 100', exp: 'Trả 400 "Hợp đồng đã kết thúc".',
  run: async () => { const r = await api('POST', `/assignments/${ctx.WA1}/progress`, ctx.SV1.token, { description: 'Sau khi xong', progress_percent: 100 }); return check(r.s === 400, '400', 'Mã ' + r.s); } });

// ---------- PB47: ĐÁNH GIÁ HAI CHIỀU (bổ sung) ----------
add({ tr: 'TR-PB47-01', id: 'TC_REVIEW_TWOWAY_001', type: 'Positive', pri: 'High', feat: 'S13', obj: 'SV đánh giá NTD sau khi hợp đồng hoàn thành', pre: 'WA1 đã Hoàn thành.',
  act: 'Đánh giá & Phản hồi → chọn công việc → 5 sao + nhận xét → Gửi', data: 'rating 5, "Môi trường thân thiện"', exp: 'Lưu đánh giá; NTD nhận thông báo.',
  run: async () => { const r = await api('POST', '/reviews', ctx.SV1.token, { job_id: ctx.JOB_PUBLIC, reviewee_id: ctx.E1.id, rating: 5, comment: 'Môi trường thân thiện, trả lương đúng hẹn.' }); return check(r.s === 201, '201', 'Mã ' + r.s + ' ' + (r.j.message || '')); } });
add({ tr: 'TR-PB47-02', id: 'TC_REVIEW_TWOWAY_002', type: 'Negative', pri: 'Medium', feat: 'S13', obj: 'Không đánh giá cùng đối tác cùng công việc lần 2', pre: 'Đã có đánh giá ở TC_REVIEW_TWOWAY_001.',
  act: 'Gửi đánh giá lần nữa', data: 'rating 4', exp: 'Trả 409.',
  run: async () => { const r = await api('POST', '/reviews', ctx.SV1.token, { job_id: ctx.JOB_PUBLIC, reviewee_id: ctx.E1.id, rating: 4, comment: 'Gửi lại lần hai.' }); return check(r.s === 409, '409', 'Mã ' + r.s); } });
add({ tr: 'TR-PB47-03', id: 'TC_REVIEW_TWOWAY_003', type: 'Positive', pri: 'Medium', feat: 'S14', obj: 'Xem điểm uy tín và đánh giá nhận được', pre: 'NTD_A đánh giá SV_A 4 sao.',
  act: 'SV_A mở Đánh giá & Phản hồi', data: 'N/A', exp: 'Hiển thị điểm trung bình và nhận xét của NTD_A.',
  run: async () => { const e = await api('POST', '/reviews', ctx.E1.token, { job_id: ctx.JOB_PUBLIC, reviewee_id: ctx.SV1.id, rating: 4, comment: 'Chăm chỉ, đúng giờ.' }); const r = await api('GET', `/reviews/user/${ctx.SV1.id}`, null); const list = r.j.data?.reviews || []; return check(e.s === 201 && r.s === 200 && list.length >= 1, `${list.length} đánh giá, TB ${r.j.data?.stats?.average_rating ?? r.j.data?.stats?.avg ?? '?'}`, `NTD đánh giá ${e.s} ${e.j.message || ''}, GET ${r.s}`); } });

// ---------- PB48: ĐÁNH GIÁ DOANH NGHIỆP / CÔNG VIỆC ----------
const companyReview = (over = {}) => ({ experience_type: 'WORKED', rating_environment: 5, rating_salary_benefits: 4, rating_management: 4, rating_culture: 5, rating_learning: 4, rating_recruitment: 4, rating_overall: 4,
  title: 'Môi trường tốt cho sinh viên', pros: 'Quản lý hỗ trợ nhiệt tình, lịch làm linh hoạt theo lịch học.', cons: 'Cuối tuần đông khách nên khá mệt và áp lực.', is_anonymous: true, ...over });
add({ tr: 'TR-PB48-01', id: 'TC_CREVIEW_001', type: 'Negative', pri: 'Medium', feat: 'S15', obj: 'Tiêu đề đánh giá doanh nghiệp quá ngắn', pre: PRE_SV,
  act: 'Viết đánh giá với tiêu đề 3 ký tự', data: 'title: "Tốt"', exp: 'Trả 400, chỉ rõ trường Tiêu đề.',
  run: async () => { const r = await api('POST', `/reviews/companies/${ctx.E1.id}/company-reviews`, ctx.SV1.token, companyReview({ title: 'Tốt' })); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB48-02', id: 'TC_CREVIEW_002', type: 'Positive', pri: 'High', feat: 'S15', obj: 'Đánh giá doanh nghiệp đã từng làm việc được công khai', pre: 'SV_A đã làm hợp đồng WA1 cho NTD_A.',
  act: 'Trang doanh nghiệp → Viết đánh giá → chấm 7 tiêu chí → Gửi', data: 'Đánh giá hợp lệ, ẩn danh', exp: 'Đánh giá PUBLISHED, gắn nhãn đã xác thực; NTD nhận thông báo.',
  run: async () => { const r = await api('POST', `/reviews/companies/${ctx.E1.id}/company-reviews`, ctx.SV1.token, companyReview()); ctx.CR1 = r.j.data?.id; const st = ctx.CR1 && one(`SELECT status FROM company_reviews WHERE id=${ctx.CR1}`); return check(r.s === 201 && st === 'PUBLISHED', 'PUBLISHED', `Mã ${r.s}, trạng thái ${st} ${r.j.message || ''}`); } });
add({ tr: 'TR-PB48-03', id: 'TC_CREVIEW_003', type: 'Negative', pri: 'Medium', feat: 'S15', obj: 'Một sinh viên chỉ đánh giá một doanh nghiệp một lần', pre: 'Đã có đánh giá ở TC_CREVIEW_002.',
  act: 'Viết đánh giá mới cho cùng doanh nghiệp', data: 'Đánh giá hợp lệ', exp: 'Trả 409, gợi ý sửa đánh giá cũ.',
  run: async () => { const r = await api('POST', `/reviews/companies/${ctx.E1.id}/company-reviews`, ctx.SV1.token, companyReview()); return check(r.s === 409, '409', 'Mã ' + r.s); } });
add({ tr: 'TR-PB48-04', id: 'TC_CREVIEW_004', type: 'Positive', pri: 'High', feat: 'H04', obj: 'Đánh giá chứa từ ngữ thô tục tự chuyển Chờ duyệt và báo Admin', pre: 'SV_B đã làm hợp đồng WA2 cho NTD_A.',
  act: 'Viết đánh giá có từ "vcl" trong ưu điểm', data: 'pros chứa "vcl"', exp: 'Trạng thái Chờ duyệt (không công khai); Admin nhận việc cần kiểm duyệt.',
  run: async () => { const r = await api('POST', `/reviews/companies/${ctx.E1.id}/company-reviews`, ctx.SV2.token, companyReview({ pros: 'Lương ổn nhưng quản lý nói chuyện vcl khó chịu lắm luôn.' })); const id = r.j.data?.id; const st = id && one(`SELECT status FROM company_reviews WHERE id=${id}`); return check(r.s === 201 && st === 'PENDING' && adminTask('COMPANY_REVIEW', id) === 1, 'PENDING, Admin có thông báo', `Mã ${r.s}, trạng thái ${st}`); } });
add({ tr: 'TR-PB48-05', id: 'TC_CREVIEW_005', type: 'Security', pri: 'High', feat: 'S15', obj: 'Nhà tuyển dụng không viết đánh giá doanh nghiệp', pre: PRE_E,
  act: 'NTD_B gọi POST đánh giá doanh nghiệp NTD_A', data: 'Token NTD_B', exp: 'Trả 403.',
  run: async () => { const r = await api('POST', `/reviews/companies/${ctx.E1.id}/company-reviews`, ctx.E2.token, companyReview()); return check(r.s === 403, '403', 'Mã ' + r.s); } });
add({ tr: 'TR-PB48-06', id: 'TC_JREVIEW_001', type: 'Security', pri: 'High', feat: 'S16', obj: 'Chỉ người đã làm công việc mới đánh giá công việc', pre: 'SV_C chưa từng được nhận vào JOB_PUBLIC.',
  act: 'SV_C viết đánh giá công việc JOB_PUBLIC', data: 'Đánh giá hợp lệ', exp: 'Trả 403.',
  run: async () => { const r = await api('POST', `/reviews/jobs/${ctx.JOB_PUBLIC}/job-reviews`, ctx.SV3.token, { experience_type: 'WORKED', rating_description_accuracy: 4, rating_salary_accuracy: 4, rating_schedule: 4, rating_workload: 4, rating_manager_support: 4, rating_overall: 4, content: 'Công việc đúng mô tả, giờ giấc linh hoạt, quản lý hỗ trợ tốt.' }); return check(r.s === 403, '403', 'Mã ' + r.s); } });
add({ tr: 'TR-PB48-07', id: 'TC_JREVIEW_002', type: 'Positive', pri: 'High', feat: 'S16', obj: 'Người đã làm công việc đánh giá công việc thành công', pre: 'SV_A đã làm WA1.',
  act: 'Viết đánh giá công việc 6 tiêu chí → Gửi', data: 'content ≥ 30 ký tự', exp: 'Trả 201; đánh giá gắn đúng công việc.',
  run: async () => { const r = await api('POST', `/reviews/jobs/${ctx.JOB_PUBLIC}/job-reviews`, ctx.SV1.token, { experience_type: 'WORKED', rating_description_accuracy: 5, rating_salary_accuracy: 4, rating_schedule: 4, rating_workload: 4, rating_manager_support: 5, rating_overall: 4, content: 'Công việc đúng mô tả, giờ giấc linh hoạt, quản lý hỗ trợ tốt.' }); return check(r.s === 201, '201', 'Mã ' + r.s + ' ' + (r.j.message || '')); } });
add({ tr: 'TR-PB48-08', id: 'TC_RREPLY_001', type: 'Negative', pri: 'Medium', feat: 'E21', obj: 'Phản hồi đánh giá quá ngắn', pre: 'NTD_A có đánh giá CR1 công khai.',
  act: 'Nhập phản hồi 5 ký tự', data: 'content: "Cảm ơn"', exp: 'Trả 400 (cần 10–2000 ký tự).',
  run: async () => { const r = await api('PUT', `/reviews/company/${ctx.CR1}/reply`, ctx.E1.token, { content: 'Cảm ơn' }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB48-09', id: 'TC_RREPLY_002', type: 'Security', pri: 'High', feat: 'E21', obj: 'Không phản hồi đánh giá của doanh nghiệp khác', pre: 'NTD_B đăng nhập.',
  act: 'NTD_B phản hồi đánh giá CR1 của NTD_A', data: 'Phản hồi hợp lệ', exp: 'Trả 403.',
  run: async () => { const r = await api('PUT', `/reviews/company/${ctx.CR1}/reply`, ctx.E2.token, { content: 'Phản hồi giả mạo từ doanh nghiệp khác.' }); return check(r.s === 403, '403', 'Mã ' + r.s); } });
add({ tr: 'TR-PB48-10', id: 'TC_RREPLY_003', type: 'Positive', pri: 'High', feat: 'E21', obj: 'Doanh nghiệp phản hồi đánh giá, SV được báo', pre: 'NTD_A có đánh giá CR1.',
  act: 'Đánh giá → Phản hồi → nhập nội dung → Lưu', data: 'content: "Cảm ơn bạn đã góp ý, chúng tôi sẽ cải thiện."', exp: 'Lưu phản hồi; người viết đánh giá nhận thông báo.',
  run: async () => { const r = await api('PUT', `/reviews/company/${ctx.CR1}/reply`, ctx.E1.token, { content: 'Cảm ơn bạn đã góp ý, chúng tôi sẽ cải thiện.' }); return check(r.s === 200 && notif(ctx.SV1.id, 'REVIEW', "AND title LIKE '%phản hồi%'") >= 1, 'Đã lưu, SV có thông báo', 'Mã ' + r.s); } });
add({ tr: 'TR-PB48-11', id: 'TC_RREPORT_001', type: 'Negative', pri: 'Medium', feat: 'S18', obj: 'Báo cáo lý do "Khác" phải có mô tả', pre: 'NTD_A xem đánh giá CR1.',
  act: 'Báo cáo đánh giá, chọn Khác, bỏ trống mô tả', data: 'reason: OTHER', exp: 'Trả 400.',
  run: async () => { const r = await api('POST', `/reviews/company/${ctx.CR1}/reports`, ctx.E1.token, { reason: 'OTHER', description: '' }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB48-12', id: 'TC_RREPORT_002', type: 'Positive', pri: 'High', feat: 'S18', obj: 'Báo cáo đánh giá → Admin được báo', pre: 'NTD_A xem đánh giá CR1.',
  act: 'Báo cáo đánh giá với lý do Sai sự thật', data: 'reason: FALSE_INFO', exp: 'Trả 201; Admin nhận việc "Báo cáo đánh giá mới".',
  run: async () => { const r = await api('POST', `/reviews/company/${ctx.CR1}/reports`, ctx.E1.token, { reason: 'FALSE_INFO', description: 'Chúng tôi chưa từng làm việc cuối tuần.' }); return check(r.s === 201 && adminTask('REVIEW_REPORT', r.j.data?.id) === 1, '201, Admin có thông báo', 'Mã ' + r.s); } });
add({ tr: 'TR-PB48-13', id: 'TC_RREPORT_003', type: 'Negative', pri: 'Medium', feat: 'S18', obj: 'Không báo cáo trùng khi báo cáo trước đang chờ', pre: 'Đã báo cáo ở TC_RREPORT_002.',
  act: 'Báo cáo lại cùng đánh giá', data: 'reason: SPAM', exp: 'Trả 409.',
  run: async () => { const r = await api('POST', `/reviews/company/${ctx.CR1}/reports`, ctx.E1.token, { reason: 'SPAM' }); return check(r.s === 409, '409', 'Mã ' + r.s); } });
add({ tr: 'TR-PB48-14', id: 'TC_RREPORT_004', type: 'Security', pri: 'Medium', feat: 'S18', obj: 'Không tự báo cáo đánh giá của mình', pre: 'SV_A là người viết CR1.',
  act: 'SV_A báo cáo đánh giá CR1', data: 'reason: SPAM', exp: 'Trả 403.',
  run: async () => { const r = await api('POST', `/reviews/company/${ctx.CR1}/reports`, ctx.SV1.token, { reason: 'SPAM' }); return check(r.s === 403, '403', 'Mã ' + r.s); } });
add({ tr: 'TR-PB48-15', id: 'TC_PUBREVIEW_001', type: 'Security', pri: 'High', feat: 'G05', obj: 'Đánh giá ẩn danh không lộ danh tính người viết', pre: 'CR1 là đánh giá ẩn danh, đã công khai.',
  act: 'Khách mở trang doanh nghiệp → mục Đánh giá', data: 'N/A', exp: 'Thấy đánh giá; không có tên/email/ID của SV_A.',
  run: async () => { const r = await api('GET', `/reviews/companies/${ctx.E1.id}/company-reviews`, null); const t = JSON.stringify(r.j); return check(r.s === 200 && t.includes('Môi trường tốt cho sinh viên') && !t.includes(mail('sva')) && !t.includes('QA Sinh viên sva') && !new RegExp(`"reviewer_id":${ctx.SV1.id}\\b`).test(t), 'Hiển thị, không lộ danh tính', `Mã ${r.s}; có lộ: ${t.includes('QA Sinh viên sva') || t.includes(mail('sva'))}`); } });

// ---------- PB49: HỒ SƠ DOANH NGHIỆP CÔNG KHAI ----------
const pub = (over = {}) => ({ display_name: 'QA Cafe Sài Gòn', industry: 'Nhà hàng – Khách sạn – F&B', founded_year: 2018, website: 'https://qacafe.vn', public_email: 'tuyendung@qacafe.vn', public_phone: '028 3838 8888',
  bio: 'Chuỗi cà phê dành cho sinh viên.', detailed_address: '27 Võ Văn Ngân, Thủ Đức', province: 'TP. Hồ Chí Minh', branches: [{ name: 'CN Quận 1', address: '10 Lê Lợi, Quận 1', phone: '0901234567', is_active: true }], ...over });
add({ tr: 'TR-PB49-01', id: 'TC_COMPANY_001', type: 'Positive', pri: 'High', feat: 'E03', obj: 'Lưu thông tin công khai doanh nghiệp hợp lệ', pre: PRE_E,
  act: 'Hồ sơ doanh nghiệp → nhập Thông tin chung, Liên hệ, Chi nhánh → Lưu hồ sơ', data: 'Tên, lĩnh vực, năm 2018, website, email, SĐT, 1 chi nhánh', exp: 'Lưu thành công; trang công khai hiển thị đúng.',
  run: async () => { const r = await api('PUT', '/profile/me/employer-public', ctx.E1.token, pub()); const p = await api('GET', `/profile/${ctx.E1.id}`, null); return check(r.s === 200 && p.j.data?.display_name === 'QA Cafe Sài Gòn' && p.j.data?.branches?.length === 1, 'Lưu và công khai đúng', `PUT ${r.s} ${r.j.message || ''}`); } });
add({ tr: 'TR-PB49-02', id: 'TC_COMPANY_002', type: 'Negative', pri: 'Medium', feat: 'E06', obj: 'Website phải bắt đầu bằng http(s)', pre: PRE_E,
  act: 'Nhập website "qacafe.vn" → Lưu', data: 'website: qacafe.vn', exp: 'Trả 400; dữ liệu cũ giữ nguyên.',
  run: async () => { const r = await api('PUT', '/profile/me/employer-public', ctx.E1.token, pub({ website: 'qacafe.vn' })); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB49-03', id: 'TC_COMPANY_003', type: 'Boundary', pri: 'Medium', feat: 'E03', obj: 'Năm thành lập ngoài khoảng 1800–năm hiện tại', pre: PRE_E,
  act: 'Nhập năm thành lập 1700 rồi năm sau năm hiện tại', data: 'founded_year: 1700 / năm hiện tại + 1', exp: 'Cả hai trả 400.',
  run: async () => { const a = await api('PUT', '/profile/me/employer-public', ctx.E1.token, pub({ founded_year: 1700 })); const b = await api('PUT', '/profile/me/employer-public', ctx.E1.token, pub({ founded_year: new Date().getFullYear() + 1 })); return check(a.s === 400 && b.s === 400, '400 / 400', `${a.s} / ${b.s}`); } });
add({ tr: 'TR-PB49-04', id: 'TC_COMPANY_004', type: 'Negative', pri: 'Medium', feat: 'E07', obj: 'Chi nhánh bắt buộc có địa chỉ', pre: PRE_E,
  act: 'Thêm chi nhánh chỉ có tên → Lưu', data: 'branches: [{name: "CN Thủ Đức"}]', exp: 'Trả 400 "Chi nhánh 1: cần nhập địa chỉ".',
  run: async () => { const r = await api('PUT', '/profile/me/employer-public', ctx.E1.token, pub({ branches: [{ name: 'CN Thủ Đức' }] })); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB49-05', id: 'TC_COMPANY_005', type: 'Boundary', pri: 'Medium', feat: 'E07', obj: 'Tối đa 20 chi nhánh', pre: PRE_E,
  act: 'Gửi 21 chi nhánh', data: '21 chi nhánh hợp lệ', exp: 'Trả 400 hoặc chỉ lưu 20; không lưu quá 20.',
  run: async () => { const br = Array.from({ length: 21 }, (_, i) => ({ name: `CN ${i + 1}`, address: `${i + 1} Lê Lợi, Quận 1` })); const r = await api('PUT', '/profile/me/employer-public', ctx.E1.token, pub({ branches: br })); const n = Number(one(`SELECT jsonb_array_length(COALESCE(branches,'[]'::jsonb)) FROM employer_profiles WHERE user_id=${ctx.E1.id}`)); return check(r.s === 400 || n <= 20, r.s === 400 ? '400' : `Lưu ${n} chi nhánh`, `Mã ${r.s}, đã lưu ${n} chi nhánh`); } });
add({ tr: 'TR-PB49-06', id: 'TC_COMPANY_006', type: 'Negative', pri: 'Medium', feat: 'E08', obj: 'Tọa độ trụ sở phải nằm trong Việt Nam', pre: PRE_E,
  act: 'Ghim vị trí ở Singapore → Lưu', data: 'lat 1.29, lng 103.85', exp: 'Trả 400.',
  run: async () => { const r = await api('PUT', '/profile/me/employer-public', ctx.E1.token, pub({ latitude: 1.29, longitude: 103.85 })); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB49-07', id: 'TC_COMPANY_007', type: 'Security', pri: 'High', feat: 'G04', obj: 'Trang công khai không lộ thông tin riêng tư', pre: 'NTD_A đã khai MST và người đại diện.',
  act: 'Khách mở trang doanh nghiệp NTD_A', data: 'N/A', exp: 'Không có email/SĐT đăng nhập, mã số thuế, người đại diện.',
  run: async () => { const p = await api('GET', `/profile/${ctx.E1.id}`, null); const t = JSON.stringify(p.j.data || {}); const leak = ['tax_code', 'representative_name', mail('ntda'), 'password'].filter(k => t.includes(k)); return check(p.s === 200 && leak.length === 0, 'Không lộ', 'Lộ: ' + leak.join(', ')); } });
add({ tr: 'TR-PB49-08', id: 'TC_COMPANY_008', type: 'Security', pri: 'High', feat: 'E03', obj: 'Sinh viên không sửa được hồ sơ doanh nghiệp', pre: PRE_SV,
  act: 'SV_A gọi PUT /profile/me/employer-public', data: 'Token SV_A', exp: 'Trả 403.',
  run: async () => { const r = await api('PUT', '/profile/me/employer-public', ctx.SV1.token, pub()); return check(r.s === 403, '403', 'Mã ' + r.s); } });
add({ tr: 'TR-PB49-09', id: 'TC_COMPANY_009', type: 'Security', pri: 'High', feat: 'E02', obj: 'Ảnh thư viện: chặn file giả và không xóa được ảnh của doanh nghiệp khác', pre: 'NTD_A và NTD_B đăng nhập.',
  act: 'NTD_A tải ảnh giả; NTD_A tải ảnh thật; NTD_B xóa ảnh của NTD_A', data: 'fake.png (văn bản), anh.png (PNG thật)', exp: 'Ảnh giả bị 400; ảnh thật lưu được; NTD_B xóa bị chặn.',
  run: async () => { const fake = await api('POST', '/files/office-images', ctx.E1.token, { image: FAKE_PNG }); const ok = await api('POST', '/files/office-images', ctx.E1.token, { image: PNG }); const url = (ok.j.data?.office_images || []).slice(-1)[0] || ''; const del = await api('DELETE', `/files/office-images/${url.split('/').pop()}`, ctx.E2.token); return check(fake.s === 400 && ok.s === 200 && del.s >= 400, `giả ${fake.s}, thật ${ok.s}, xóa chéo ${del.s}`, `giả ${fake.s}, thật ${ok.s}, xóa chéo ${del.s}`); } });
add({ tr: 'TR-PB49-10', id: 'TC_REP_001', type: 'Positive', pri: 'Medium', feat: 'E11', obj: 'Cập nhật thông tin người đại diện (không công khai)', pre: PRE_E,
  act: 'Thông tin người đại diện → nhập họ tên, chức vụ → Lưu', data: 'Nguyễn Văn Đại Diện, Giám đốc', exp: 'Lưu thành công; trang công khai không hiển thị.',
  run: async () => { const r = await api('PUT', '/profile/me/representative', ctx.E1.token, { representative_name: 'Nguyễn Văn Đại Diện', representative_title: 'Giám đốc' }); const p = await api('GET', `/profile/${ctx.E1.id}`, null); return check(r.s === 200 && !JSON.stringify(p.j).includes('Nguyễn Văn Đại Diện'), 'Lưu, không công khai', `Mã ${r.s} ${r.j.message || ''}`); } });

// ---------- PB50: GỬI XÁC MINH DOANH NGHIỆP ----------
add({ tr: 'TR-PB50-01', id: 'TC_VERIFY_SUB_001', type: 'Negative', pri: 'High', feat: 'E10', obj: 'Mã số thuế sai định dạng', pre: PRE_E,
  act: 'Xác minh doanh nghiệp → nhập MST "123" → Lưu', data: 'tax_code: 123', exp: 'Trả 400.',
  run: async () => { sql(`UPDATE employer_profiles SET verification_status='UNVERIFIED' WHERE user_id=${ctx.E1.id};`); const r = await api('PUT', '/profile/me/verification', ctx.E1.token, { company_name: 'Công ty TNHH QA Cafe', tax_code: '123' }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB50-02', id: 'TC_VERIFY_SUB_002', type: 'Negative', pri: 'High', feat: 'E10', obj: 'Không gửi xác minh khi chưa có tài liệu', pre: 'NTD_A đã khai MST hợp lệ, chưa tải tài liệu.',
  act: 'Bấm Gửi xác minh', data: 'MST 0312345678, 0 tài liệu', exp: 'Trả 400 "Cần tải lên ít nhất 1 tài liệu".',
  run: async () => { await api('PUT', '/profile/me/verification', ctx.E1.token, { company_name: 'Công ty TNHH QA Cafe', tax_code: '0312345678' }); const r = await api('POST', '/profile/me/verification/submit', ctx.E1.token); return check(r.s === 400 && /tài liệu/.test(r.j.message || ''), '400 ' + r.j.message, 'Mã ' + r.s); } });
add({ tr: 'TR-PB50-03', id: 'TC_VERIFY_SUB_003', type: 'Negative', pri: 'High', feat: 'E10', obj: 'Từ chối tài liệu giả (đổi đuôi .pdf)', pre: PRE_E,
  act: 'Tải tài liệu HTML đổi tên .pdf', data: 'gpkd.pdf (nội dung HTML)', exp: 'Trả 400, không lưu.',
  run: async () => { const r = await api('POST', '/files/legal-documents', ctx.E1.token, { file: FAKE_PDF, name: 'gpkd.pdf' }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB50-04', id: 'TC_VERIFY_SUB_004', type: 'Positive', pri: 'High', feat: 'E10', obj: 'Gửi hồ sơ xác minh hợp lệ → Chờ duyệt, Admin được báo', pre: 'NTD_A có MST hợp lệ.',
  act: 'Tải GPKD (PDF) → Gửi xác minh', data: 'gpkd.pdf (PDF thật)', exp: 'Trạng thái Chờ duyệt; Admin nhận việc "Hồ sơ xác minh doanh nghiệp mới".',
  run: async () => { const d = await api('POST', '/files/legal-documents', ctx.E1.token, { file: PDF, name: 'gpkd.pdf' }); const r = await api('POST', '/profile/me/verification/submit', ctx.E1.token); return check(d.s === 201 && r.s === 200 && r.j.data?.status === 'PENDING' && adminTask('EMPLOYER_VERIFICATION', ctx.E1.id) === 1, 'PENDING, Admin có thông báo', `tài liệu ${d.s}, gửi ${r.s}`); } });
add({ tr: 'TR-PB50-05', id: 'TC_VERIFY_SUB_005', type: 'Security', pri: 'High', feat: 'E10', obj: 'Khóa sửa MST khi hồ sơ đang chờ duyệt', pre: 'Hồ sơ NTD_A đang Chờ duyệt.',
  act: 'Sửa MST', data: 'tax_code: 0312345670', exp: 'Trả 403; MST giữ nguyên.',
  run: async () => { const r = await api('PUT', '/profile/me/verification', ctx.E1.token, { company_name: 'Khác', tax_code: '0312345670' }); return check(r.s === 403 && one(`SELECT tax_code FROM employer_profiles WHERE user_id=${ctx.E1.id}`) === '0312345678', '403, MST giữ nguyên', 'Mã ' + r.s); } });
add({ tr: 'TR-PB50-06', id: 'TC_VERIFY_SUB_006', type: 'Negative', pri: 'High', feat: 'A05', obj: 'Admin yêu cầu bổ sung phải ghi lý do', pre: PRE_A + ' Hồ sơ NTD_A Chờ duyệt.',
  act: 'Chọn Yêu cầu bổ sung, bỏ trống lý do', data: 'status: NEEDS_INFO, note: ""', exp: 'Trả 400.',
  run: async () => { const r = await api('PATCH', `/admin/employer-verifications/${ctx.E1.id}`, ctx.A.token, { status: 'NEEDS_INFO' }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB50-07', id: 'TC_VERIFY_SUB_007', type: 'Positive', pri: 'High', feat: 'A05', obj: 'Admin duyệt xác minh → NTD được báo, huy hiệu công khai', pre: 'Hồ sơ NTD_A Chờ duyệt.',
  act: 'Admin → Xác minh doanh nghiệp → Duyệt', data: 'status: VERIFIED', exp: 'Trạng thái Đã xác minh; NTD nhận thông báo; trang công khai có huy hiệu.',
  run: async () => { const r = await api('PATCH', `/admin/employer-verifications/${ctx.E1.id}`, ctx.A.token, { status: 'VERIFIED' }); const p = await api('GET', `/profile/${ctx.E1.id}`, null); return check(r.s === 200 && p.j.data?.verification?.legal === true && notif(ctx.E1.id, 'VERIFICATION') >= 1, 'VERIFIED, có thông báo', `Mã ${r.s}`); } });

// ---------- PB51: ĐỔI MẬT KHẨU ----------
add({ tr: 'TR-PB51-01', id: 'TC_CHGPW_001', type: 'Negative', pri: 'High', feat: 'C01', obj: 'Sai mật khẩu hiện tại', pre: 'SV_C đăng nhập.',
  act: 'Cài đặt tài khoản → Đổi mật khẩu với mật khẩu cũ sai', data: 'currentPassword: Sai@12345', exp: 'Trả 400; mật khẩu không đổi.',
  run: async () => { const r = await api('POST', '/auth/change-password', ctx.SV3.token, { currentPassword: 'Sai@12345', newPassword: 'Moi@123456' }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB51-02', id: 'TC_CHGPW_002', type: 'Boundary', pri: 'High', feat: 'C01', obj: 'Mật khẩu mới dưới 8 ký tự', pre: 'SV_C đăng nhập.',
  act: 'Nhập mật khẩu mới 7 ký tự', data: 'newPassword: Ab@1234', exp: 'Trả 400.',
  run: async () => { const r = await api('POST', '/auth/change-password', ctx.SV3.token, { currentPassword: PW, newPassword: 'Ab@1234' }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB51-03', id: 'TC_CHGPW_003', type: 'Positive', pri: 'High', feat: 'C01', obj: 'Đổi mật khẩu thành công, đăng nhập bằng mật khẩu mới', pre: 'SV_C đăng nhập.',
  act: 'Nhập đúng mật khẩu cũ, mật khẩu mới 10 ký tự → Lưu; đăng nhập lại', data: 'newPassword: Moi@123456', exp: 'Đổi thành công; mật khẩu cũ không đăng nhập được, mật khẩu mới đăng nhập được.',
  run: async () => { const r = await api('POST', '/auth/change-password', ctx.SV3.token, { currentPassword: PW, newPassword: 'Moi@123456' }); const oldL = await api('POST', '/auth/login', null, { email: mail('svc'), password: PW }); const newL = await api('POST', '/auth/login', null, { email: mail('svc'), password: 'Moi@123456' }); if (newL.j.data?.token) ctx.SV3 = { ...ctx.SV3, token: newL.j.data.token }; return check(r.s === 200 && oldL.s === 401 && newL.s === 200, 'Đổi xong, chỉ mật khẩu mới dùng được', `đổi ${r.s}, cũ ${oldL.s}, mới ${newL.s}`); } });
add({ tr: 'TR-PB51-04', id: 'TC_CHGPW_004', type: 'Security', pri: 'High', feat: 'C01', obj: 'Khách không gọi được API đổi mật khẩu', pre: 'Chưa đăng nhập.',
  act: 'Gọi POST /auth/change-password không token', data: 'N/A', exp: 'Trả 401.',
  run: async () => { const r = await api('POST', '/auth/change-password', null, { currentPassword: PW, newPassword: 'Moi@123456' }); return check(r.s === 401, '401', 'Mã ' + r.s); } });

// ---------- PB52: ẢNH ĐẠI DIỆN ----------
add({ tr: 'TR-PB52-01', id: 'TC_AVATAR_001', type: 'Positive', pri: 'Medium', feat: 'C03', obj: 'Tải ảnh đại diện hợp lệ', pre: PRE_SV,
  act: 'Hồ sơ → bấm ảnh đại diện → chọn ảnh PNG → Lưu', data: 'avatar.png (PNG thật)', exp: 'Ảnh mới hiển thị, link /api/files/<id> mở được.',
  run: async () => { const r = await api('PUT', '/files/avatar', ctx.SV1.token, { image: PNG }); const url = r.j.data?.avatar_url || ''; const g = url ? await fetch(process.env.API_URL.replace(/\/api$/, '') + url) : { status: 0 }; return check(r.s === 200 && g.status === 200, 'Lưu và mở được ảnh', `PUT ${r.s}, GET ảnh ${g.status}`); } });
add({ tr: 'TR-PB52-02', id: 'TC_AVATAR_002', type: 'Negative', pri: 'Medium', feat: 'C03', obj: 'Từ chối file giả mạo ảnh', pre: PRE_SV,
  act: 'Chọn file văn bản đổi đuôi .png', data: 'fake.png', exp: 'Trả 400, ảnh cũ giữ nguyên.',
  run: async () => { const r = await api('PUT', '/files/avatar', ctx.SV1.token, { image: FAKE_PNG }); return check(r.s === 400, '400', 'Mã ' + r.s); } });

// ---------- PB53: TRUNG TÂM THÔNG BÁO ----------
add({ tr: 'TR-PB53-01', id: 'TC_NOTI_001', type: 'Positive', pri: 'Medium', feat: 'C04', obj: 'Danh sách thông báo kèm số chưa đọc', pre: 'SV_A có ít nhất 1 thông báo chưa đọc.',
  act: 'Bấm chuông thông báo', data: 'N/A', exp: 'Hiển thị danh sách mới nhất trước và số chưa đọc đúng với DB.',
  run: async () => { const r = await api('GET', '/notifications', ctx.SV1.token); const unread = r.j.unread_count ?? r.j.meta?.unread_count ?? r.j.data?.unread_count; const db = Number(one(`SELECT count(*) FROM notifications WHERE user_id=${ctx.SV1.id} AND read_at IS NULL`)); return check(r.s === 200 && Number(unread) === db && db > 0, `${db} chưa đọc`, `API ${unread}, DB ${db}`); } });
add({ tr: 'TR-PB53-02', id: 'TC_NOTI_002', type: 'Security', pri: 'High', feat: 'C04', obj: 'Không đánh dấu đọc thông báo của người khác', pre: 'SV_B đăng nhập; có ID thông báo của SV_A.',
  act: 'SV_B gọi PATCH /notifications/<id của SV_A>/read', data: 'Token SV_B', exp: 'Trả 403; thông báo SV_A vẫn chưa đọc.',
  run: async () => { const id = one(`SELECT id FROM notifications WHERE user_id=${ctx.SV1.id} AND read_at IS NULL LIMIT 1`); const r = await api('PATCH', `/notifications/${id}/read`, ctx.SV2.token); return check(r.s === 403 && one(`SELECT (read_at IS NULL)::text FROM notifications WHERE id=${id}`) === 'true', '403', 'Mã ' + r.s); } });
add({ tr: 'TR-PB53-03', id: 'TC_NOTI_003', type: 'Positive', pri: 'Medium', feat: 'C04', obj: 'Đánh dấu đã đọc tất cả', pre: 'SV_A có thông báo chưa đọc.',
  act: 'Bấm "Đánh dấu tất cả đã đọc"', data: 'N/A', exp: 'Số chưa đọc về 0.',
  run: async () => { const r = await api('PATCH', '/notifications/read-all', ctx.SV1.token); const n = one(`SELECT count(*) FROM notifications WHERE user_id=${ctx.SV1.id} AND read_at IS NULL`); return check(r.s === 200 && n === '0', 'Còn 0 chưa đọc', `Mã ${r.s}, còn ${n}`); } });

// ---------- PB54: BÁO CÁO VI PHẠM (phía người gửi) ----------
add({ tr: 'TR-PB54-01', id: 'TC_REPORT_001', type: 'Positive', pri: 'High', feat: 'C05', obj: 'Báo cáo tin vi phạm → Admin được báo', pre: PRE_SV,
  act: 'Chi tiết tin → Báo cáo vi phạm → chọn lý do → Gửi', data: 'Tin JOB_OTHER, lý do "Lừa đảo"', exp: 'Trả 201; Admin nhận việc "Báo cáo vi phạm mới".',
  run: async () => { const r = await api('POST', '/reports', ctx.SV2.token, { target_type: 'JOB', target_id: ctx.JOB_OTHER, reason: 'Lừa đảo, yêu cầu đóng phí', description: 'Tin yêu cầu đóng 200k phí giữ chỗ.' }); ctx.REP1 = r.j.data?.id; return check(r.s === 201 && adminTask('REPORT', ctx.REP1) === 1, '201, Admin có thông báo', 'Mã ' + r.s); } });
add({ tr: 'TR-PB54-02', id: 'TC_REPORT_002', type: 'Negative', pri: 'Medium', feat: 'C05', obj: 'Không báo cáo trùng khi báo cáo trước đang chờ', pre: 'Đã báo cáo ở TC_REPORT_001.',
  act: 'Báo cáo lại cùng tin', data: 'Tin JOB_OTHER', exp: 'Trả 400, thông báo đang chờ xử lý.',
  run: async () => { const r = await api('POST', '/reports', ctx.SV2.token, { target_type: 'JOB', target_id: ctx.JOB_OTHER, reason: 'Lừa đảo' }); return check(r.s === 400 || r.s === 409, String(r.s), 'Mã ' + r.s); } });
add({ tr: 'TR-PB54-03', id: 'TC_REPORT_003', type: 'Negative', pri: 'Medium', feat: 'C05', obj: 'Không tự báo cáo chính mình', pre: PRE_SV,
  act: 'Gửi báo cáo USER với ID của chính mình', data: 'target_id = ID SV_A', exp: 'Trả 400.',
  run: async () => { const r = await api('POST', '/reports', ctx.SV1.token, { target_type: 'USER', target_id: ctx.SV1.id, reason: 'Thử' }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB54-04', id: 'TC_REPORT_004', type: 'Negative', pri: 'Medium', feat: 'C05', obj: 'Thiếu lý do / loại đối tượng sai', pre: PRE_SV,
  act: 'Gửi báo cáo bỏ trống lý do; gửi target_type "REVIEW"', data: 'reason: "", target_type: REVIEW', exp: 'Cả hai trả 400.',
  run: async () => { const a = await api('POST', '/reports', ctx.SV1.token, { target_type: 'JOB', target_id: ctx.JOB_OTHER, reason: '  ' }); const b = await api('POST', '/reports', ctx.SV1.token, { target_type: 'REVIEW', target_id: 1, reason: 'x' }); return check(a.s === 400 && b.s === 400, '400 / 400', `${a.s} / ${b.s}`); } });
add({ tr: 'TR-PB54-05', id: 'TC_REPORT_005', type: 'Security', pri: 'High', feat: 'C05', obj: 'Khách không gửi được báo cáo', pre: 'Chưa đăng nhập.',
  act: 'Gọi POST /reports không token', data: 'N/A', exp: 'Trả 401.',
  run: async () => { const r = await api('POST', '/reports', null, { target_type: 'JOB', target_id: ctx.JOB_OTHER, reason: 'x' }); return check(r.s === 401, '401', 'Mã ' + r.s); } });
add({ tr: 'TR-PB54-06', id: 'TC_REPORT_006', type: 'Positive', pri: 'High', feat: 'A07', obj: 'Admin cảnh cáo → đối tượng và người báo cáo đều được báo', pre: PRE_A + ' Có báo cáo REP1.',
  act: 'Admin → Báo cáo → chọn Cảnh cáo → Xác nhận', data: 'action: WARNING, note: "Thu phí trái quy định"', exp: 'Báo cáo Đã xử lý; NTD_B nhận cảnh cáo; SV_B nhận kết quả.',
  run: async () => { const r = await api('POST', `/admin/reports/${ctx.REP1}/action`, ctx.A.token, { action: 'WARNING', note: 'Thu phí trái quy định' }); return check(r.s === 200 && notif(ctx.E2.id, 'VIOLATION_NOTICE') >= 1 && notif(ctx.SV2.id, 'REPORT_RESOLVED') >= 1, 'Cả hai có thông báo', `Mã ${r.s}`); } });
add({ tr: 'TR-PB54-07', id: 'TC_REPORT_007', type: 'Positive', pri: 'High', feat: 'A07', obj: 'Admin gỡ tin bị báo cáo → tin ẩn khỏi tìm kiếm, NTD được báo', pre: 'Có báo cáo mới về JOB_OTHER.',
  act: 'Admin → Báo cáo → Gỡ tin', data: 'action: REMOVE_JOB', exp: 'Tin không còn trong tìm kiếm; NTD_B nhận thông báo kèm lý do.',
  run: async () => { const rep = await api('POST', '/reports', ctx.SV3.token, { target_type: 'JOB', target_id: ctx.JOB_OTHER, reason: 'Thu phí' }); const r = await api('POST', `/admin/reports/${rep.j.data?.id}/action`, ctx.A.token, { action: 'REMOVE_JOB', note: 'Thu phí ứng viên' }); const s = await api('GET', `/jobs?keyword=${encodeURIComponent(JOB_PREFIX)}&limit=100`, null); const ids = (s.j.data?.jobs || s.j.data || []).map(j => j.id); return check(r.s === 200 && !ids.includes(ctx.JOB_OTHER) && notif(ctx.E2.id, 'JOB', "AND title LIKE '%gỡ%'") >= 1, 'Tin ẩn, NTD có thông báo', `Mã ${r.s}, tin còn hiện: ${ids.includes(ctx.JOB_OTHER)}`); } });

// ---------- PB55: KHÓA TÀI KHOẢN & KHIẾU NẠI ----------
add({ tr: 'TR-PB55-01', id: 'TC_BAN_001', type: 'Negative', pri: 'High', feat: 'A03', obj: 'Khóa tài khoản bắt buộc có lý do', pre: PRE_A,
  act: 'Người dùng → Khóa SV_B, bỏ trống lý do', data: 'status: BANNED, reason: ""', exp: 'Trả 400; tài khoản vẫn hoạt động.',
  run: async () => { const r = await api('PATCH', `/admin/users/${ctx.SV2.id}/status`, ctx.A.token, { status: 'BANNED' }); return check(r.s === 400 && one(`SELECT status FROM users WHERE id=${ctx.SV2.id}`) === 'ACTIVE', '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB55-02', id: 'TC_BAN_002', type: 'Positive', pri: 'High', feat: 'A03', obj: 'Khóa tài khoản → phiên đang mở bị chặn ngay', pre: 'SV_B đang đăng nhập.',
  act: 'Admin khóa SV_B kèm lý do; SV_B tải lại trang', data: 'reason: "Spam báo cáo"', exp: 'SV_B nhận thông báo bị khóa; mọi API của SV_B bị chặn.',
  run: async () => { const r = await api('PATCH', `/admin/users/${ctx.SV2.id}/status`, ctx.A.token, { status: 'BANNED', reason: 'Spam báo cáo' }); const me = await api('GET', '/auth/me', ctx.SV2.token); return check(r.s === 200 && (me.s === 401 || me.s === 403) && notif(ctx.SV2.id, 'ACCOUNT_BANNED') === 1, `Phiên bị chặn (${me.s})`, `khóa ${r.s}, /auth/me ${me.s}`); } });
add({ tr: 'TR-PB55-03', id: 'TC_BAN_003', type: 'Negative', pri: 'High', feat: 'G07', obj: 'Tài khoản bị khóa không đăng nhập được', pre: 'SV_B đang bị khóa.',
  act: 'Đăng nhập bằng SV_B', data: 'Đúng email/mật khẩu', exp: 'Bị từ chối, hiện lý do khóa.',
  run: async () => { const r = await api('POST', '/auth/login', null, { email: mail('svb'), password: PW }); return check(r.s === 403 || r.s === 401, `${r.s} ${r.j.message}`, 'Mã ' + r.s); } });
add({ tr: 'TR-PB55-04', id: 'TC_BAN_004', type: 'Positive', pri: 'High', feat: 'G09', obj: 'Tài khoản bị khóa gửi khiếu nại không cần đăng nhập', pre: 'SV_B đang bị khóa.',
  act: 'Trang đăng nhập → Gửi khiếu nại → nhập email, mật khẩu, nội dung', data: 'Nội dung ≥ 10 ký tự', exp: 'Trả 201; Admin nhận việc "Khiếu nại tài khoản mới".',
  run: async () => { const r = await api('POST', '/auth/appeals', null, { email: mail('svb'), password: PW, appeal_reason: 'Tôi gửi báo cáo vì thấy tin lừa đảo thật.' }); return check(r.s === 201 && adminTask('USER_APPEAL', r.j.data?.id) === 1, '201, Admin có thông báo', 'Mã ' + r.s + ' ' + (r.j.message || '')); } });
add({ tr: 'TR-PB55-05', id: 'TC_BAN_005', type: 'Negative', pri: 'Medium', feat: 'G09', obj: 'Không gửi khiếu nại thứ hai khi đơn trước chưa có kết quả', pre: 'SV_B đã có khiếu nại đang chờ.',
  act: 'Gửi khiếu nại lần nữa', data: 'Nội dung mới', exp: 'Trả 409.',
  run: async () => { const r = await api('POST', '/auth/appeals', null, { email: mail('svb'), password: PW, appeal_reason: 'Xin xem xét lại lần nữa giúp tôi.' }); return check(r.s === 409, '409', 'Mã ' + r.s); } });
add({ tr: 'TR-PB55-06', id: 'TC_BAN_006', type: 'Security', pri: 'High', feat: 'G09', obj: 'Sai mật khẩu khi gửi khiếu nại không lộ tài khoản', pre: 'SV_B đang bị khóa.',
  act: 'Gửi khiếu nại với mật khẩu sai', data: 'password: Sai@12345', exp: 'Trả 401 "Email hoặc mật khẩu không chính xác".',
  run: async () => { const r = await api('POST', '/auth/appeals', null, { email: mail('svb'), password: 'Sai@12345', appeal_reason: 'Thử mật khẩu sai xem sao.' }); return check(r.s === 401, '401', 'Mã ' + r.s); } });
add({ tr: 'TR-PB55-07', id: 'TC_BAN_007', type: 'Positive', pri: 'High', feat: 'A03', obj: 'Mở khóa tài khoản → đăng nhập lại được', pre: 'SV_B đang bị khóa.',
  act: 'Admin → Người dùng → Mở khóa SV_B; SV_B đăng nhập', data: 'status: ACTIVE', exp: 'SV_B nhận thông báo mở khóa và đăng nhập được.',
  run: async () => { const r = await api('PATCH', `/admin/users/${ctx.SV2.id}/status`, ctx.A.token, { status: 'ACTIVE' }); const l = await api('POST', '/auth/login', null, { email: mail('svb'), password: PW }); return check(r.s === 200 && l.s === 200 && notif(ctx.SV2.id, 'ACCOUNT_UNBANNED') === 1, 'Đăng nhập lại được', `mở ${r.s}, login ${l.s}`); } });
add({ tr: 'TR-PB55-08', id: 'TC_BAN_008', type: 'Security', pri: 'High', feat: 'A07', obj: 'Admin không tự khóa mình qua xử lý báo cáo', pre: 'Có báo cáo nhắm vào tài khoản Admin.',
  act: 'Admin xử lý báo cáo đó bằng Khóa tài khoản', data: 'action: BAN_USER', exp: 'Trả 400; Admin vẫn hoạt động; báo cáo vẫn mở.',
  run: async () => { const rep = await api('POST', '/reports', ctx.SV1.token, { target_type: 'USER', target_id: ctx.A.id, reason: 'Thử khóa admin' }); const r = await api('POST', `/admin/reports/${rep.j.data?.id}/action`, ctx.A.token, { action: 'BAN_USER' }); const st = one(`SELECT status FROM reports WHERE id=${rep.j.data?.id}`); sql(`DELETE FROM reports WHERE id=${rep.j.data?.id}`); return check(r.s === 400 && one(`SELECT status FROM users WHERE id=${ctx.A.id}`) === 'ACTIVE' && st === 'PENDING', '400, báo cáo vẫn mở', `Mã ${r.s}, báo cáo ${st}`); } });
add({ tr: 'TR-PB55-09', id: 'TC_TICK_001', type: 'Positive', pri: 'Low', feat: 'A04', obj: 'Cấp và hủy tick xanh uy tín', pre: PRE_A,
  act: 'Người dùng → NTD_B → Cấp tick xanh, rồi Hủy', data: 'is_verified: true → false', exp: 'Cả hai thao tác thành công và ghi nhật ký.',
  run: async () => { const a = await api('PATCH', `/admin/users/${ctx.E2.id}/verify`, ctx.A.token, { is_verified: true }); const b = await api('PATCH', `/admin/users/${ctx.E2.id}/verify`, ctx.A.token, { is_verified: false }); return check(a.s === 200 && b.s === 200, '200 / 200', `${a.s} / ${b.s}`); } });

// ---------- PB56: HỖ TRỢ LIÊN HỆ ----------
add({ tr: 'TR-PB56-01', id: 'TC_SUPPORT_001', type: 'Negative', pri: 'Medium', feat: 'G10', obj: 'Nội dung hỗ trợ quá ngắn', pre: 'Khách mở Trung tâm hỗ trợ.',
  act: 'Nhập nội dung 5 ký tự → Gửi', data: 'message: "Giúp"', exp: 'Trả 400.',
  run: async () => { const r = await api('POST', '/notifications/support', null, { name: 'Khách QA', email: 'khach@example.test', topic: 'OTHER', message: 'Giúp' }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB56-02', id: 'TC_SUPPORT_002', type: 'Positive', pri: 'High', feat: 'G10', obj: 'Gửi yêu cầu hỗ trợ hợp lệ → Admin được báo', pre: 'Khách mở Trung tâm hỗ trợ.',
  act: 'Nhập họ tên, email, chủ đề, nội dung → Gửi', data: `Nội dung chứa mã ${R}`, exp: 'Trả 2xx; yêu cầu xuất hiện ở Admin → Hỗ trợ liên hệ.',
  run: async () => { const r = await api('POST', '/notifications/support', null, { name: 'Khách QA', email: 'khach@example.test', topic: 'TECHNICAL_HELP', message: `Không đăng nhập được, mã ${R}` }); const l = await api('GET', '/admin/support-requests', ctx.A.token); ctx.SUP = (l.j.data || []).find(x => (x.message || '').includes(R)); return check(r.s < 300 && Boolean(ctx.SUP), 'Admin thấy yêu cầu', `gửi ${r.s}, danh sách ${l.s}`); } });
add({ tr: 'TR-PB56-03', id: 'TC_SUPPORT_003', type: 'Positive', pri: 'Medium', feat: 'A10', obj: 'Admin trả lời yêu cầu hỗ trợ', pre: 'Có yêu cầu ở TC_SUPPORT_002.',
  act: 'Admin → Hỗ trợ liên hệ → nhập trả lời → Gửi', data: 'message ≥ 10 ký tự', exp: 'Lưu câu trả lời vào lịch sử yêu cầu.',
  run: async () => { const r = await api('POST', `/admin/support-requests/${ctx.SUP?.id}/reply`, ctx.A.token, { message: 'Bạn vui lòng dùng chức năng Quên mật khẩu.' }); return check(r.s === 200 || r.s === 201, String(r.s), 'Mã ' + r.s + ' ' + (r.j.message || '')); } });
add({ tr: 'TR-PB56-04', id: 'TC_SUPPORT_004', type: 'Security', pri: 'High', feat: 'A10', obj: 'Sinh viên không xem được danh sách yêu cầu hỗ trợ', pre: PRE_SV,
  act: 'SV_A gọi GET /admin/support-requests', data: 'Token SV_A', exp: 'Trả 403.',
  run: async () => { const r = await api('GET', '/admin/support-requests', ctx.SV1.token); return check(r.s === 403, '403', 'Mã ' + r.s); } });

// ---------- PB57: THÔNG BÁO VIỆC CẦN ADMIN XỬ LÝ ----------
add({ tr: 'TR-PB57-01', id: 'TC_ADMIN_NOTI_001', type: 'Positive', pri: 'High', feat: 'A13', obj: 'Đăng tin mới → Admin được báo tin chờ duyệt', pre: PRE_E,
  act: 'NTD_A đăng tin mới', data: 'Tin hợp lệ', exp: 'Mỗi Admin đang hoạt động nhận 1 thông báo trỏ tới tin mới.',
  run: async () => check(adminTask('JOB', ctx.JOB_PENDING) === 1, 'Có 1 thông báo', 'Số thông báo ' + adminTask('JOB', ctx.JOB_PENDING)) });
add({ tr: 'TR-PB57-02', id: 'TC_ADMIN_NOTI_002', type: 'Positive', pri: 'High', feat: 'A13', obj: 'Sửa nội dung tin → Admin được báo duyệt lại', pre: 'Tin JOB_PENDING của NTD_A.',
  act: 'Sửa tiêu đề tin → Lưu', data: 'Tiêu đề mới', exp: 'Tin về Chờ duyệt; Admin nhận thêm 1 thông báo.',
  run: async () => { const r = await api('PUT', `/jobs/${ctx.JOB_PENDING}`, ctx.E1.token, jobBody({ t: 'Tin chờ duyệt (đã sửa)' })); return check(r.s === 200 && adminTask('JOB', ctx.JOB_PENDING) === 2, '2 thông báo', `Mã ${r.s}, số thông báo ${adminTask('JOB', ctx.JOB_PENDING)}`); } });
add({ tr: 'TR-PB57-03', id: 'TC_ADMIN_NOTI_003', type: 'Security', pri: 'High', feat: 'A13', obj: 'Thông báo việc cần xử lý chỉ gửi cho Admin', pre: 'Đã có thông báo ADMIN_TASK.',
  act: 'Kiểm tra người nhận các thông báo ADMIN_TASK của lần chạy', data: 'N/A', exp: 'Không SV/NTD nào nhận ADMIN_TASK.',
  run: async () => { const n = one(`SELECT count(*) FROM notifications n JOIN users u ON u.id=n.user_id WHERE n.type='ADMIN_TASK' AND u.role<>'ADMIN'`); return check(n === '0', '0 người ngoài Admin', `${n} thông báo gửi nhầm`); } });

// ---------- PB58: THỐNG KÊ, SEO, CA LÀM, TIN LIÊN QUAN ----------
add({ tr: 'TR-PB58-01', id: 'TC_STATS_001', type: 'Positive', pri: 'Medium', feat: 'A01', obj: 'Admin xem bảng thống kê', pre: PRE_A,
  act: 'Admin → Tổng quan', data: 'N/A', exp: 'Trả 200 với số người dùng, tin, đơn.',
  run: async () => { const r = await api('GET', '/admin/stats', ctx.A.token); return check(r.s === 200 && r.j.data && Object.keys(r.j.data).length > 0, 'Có số liệu', 'Mã ' + r.s); } });
add({ tr: 'TR-PB58-02', id: 'TC_STATS_002', type: 'Security', pri: 'High', feat: 'A01', obj: 'NTD không xem được thống kê quản trị', pre: PRE_E,
  act: 'NTD_A gọi GET /admin/stats', data: 'Token NTD_A', exp: 'Trả 403.',
  run: async () => { const r = await api('GET', '/admin/stats', ctx.E1.token); return check(r.s === 403, '403', 'Mã ' + r.s); } });
add({ tr: 'TR-PB58-03', id: 'TC_SITEMAP_001', type: 'Positive', pri: 'Low', feat: 'H06', obj: 'Sitemap chỉ chứa tin đang tuyển đã duyệt', pre: 'Có tin chờ duyệt JOB_PENDING và tin đã duyệt.',
  act: 'Mở /api/jobs/sitemap.xml', data: 'N/A', exp: 'XML hợp lệ; không chứa tin chờ duyệt.',
  run: async () => { const r = await api('GET', '/jobs/sitemap.xml', null); return check(r.s === 200 && r.text.includes('<urlset') && !r.text.includes(`/${ctx.JOB_PENDING}<`) && !r.text.includes(`=${ctx.JOB_PENDING}<`), 'XML hợp lệ', 'Mã ' + r.s); } });
add({ tr: 'TR-PB58-04', id: 'TC_SCHED_001', type: 'Negative', pri: 'Medium', feat: 'E12', obj: 'Ca làm việc có giờ kết thúc trước giờ bắt đầu', pre: PRE_E,
  act: 'Sửa ca làm việc của tin: 22:00 → 18:00', data: 'day_of_week 2, 22:00–18:00', exp: 'Trả 400.',
  run: async () => { const r = await api('PUT', `/jobs/${ctx.JOB_PENDING}/schedules`, ctx.E1.token, { schedules: [{ day_of_week: 2, start_time: '22:00', end_time: '18:00' }] }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB58-05', id: 'TC_SCHED_002', type: 'Security', pri: 'High', feat: 'E12', obj: 'NTD khác không sửa được ca làm việc của tin', pre: 'NTD_B đăng nhập.',
  act: 'NTD_B gọi PUT /jobs/<tin NTD_A>/schedules', data: 'Ca hợp lệ', exp: 'Trả 403.',
  run: async () => { const r = await api('PUT', `/jobs/${ctx.JOB_PENDING}/schedules`, ctx.E2.token, { schedules: [{ day_of_week: 2, start_time: '18:00', end_time: '22:00' }] }); return check(r.s === 403, '403', 'Mã ' + r.s); } });
add({ tr: 'TR-PB58-06', id: 'TC_RELATED_001', type: 'Positive', pri: 'Low', feat: 'G03', obj: 'Việc làm liên quan không chứa chính tin đang xem và tin chưa duyệt', pre: 'Có nhiều tin cùng ngành.',
  act: 'Mở chi tiết JOB_EMPTY → xem mục Việc làm liên quan', data: 'N/A', exp: 'Danh sách không chứa JOB_EMPTY và không chứa tin chờ duyệt.',
  run: async () => { const r = await api('GET', `/jobs/${ctx.JOB_EMPTY}/related`, null); const ids = (r.j.data || []).map(j => j.id); return check(r.s === 200 && !ids.includes(ctx.JOB_EMPTY) && !ids.includes(ctx.JOB_PENDING), `${ids.length} tin liên quan`, `Mã ${r.s}, ids ${ids}`); } });

// ---------- PB59: DÒ LỖI (trạng thái sai, truy cập chéo, tham số bất thường) ----------
add({ tr: 'TR-PB59-01', id: 'TC_PROBE_001', type: 'Negative', pri: 'High', feat: 'E17', obj: 'Không chọn được đơn mà sinh viên đã rút', pre: 'SV_C đã rút đơn vào tin JOB_EMPTY.',
  act: 'NTD_A chọn đơn đã rút', data: 'applicationIds: [đơn đã rút]', exp: 'Trả lỗi 4xx; không tạo hợp đồng.',
  run: async () => { const a = await apply(ctx.SV3, ctx.JOB_EMPTY); await api('PATCH', `/applications/${a.j.data.id}/withdraw`, ctx.SV3.token); const r = await api('POST', `/jobs/${ctx.JOB_EMPTY}/selections`, ctx.E1.token, { applicationIds: [a.j.data.id] }); const n = one(`SELECT count(*) FROM work_assignments WHERE application_id=${a.j.data.id}`); return check(r.s >= 400 && r.s < 500 && n === '0', `${r.s}, 0 hợp đồng`, `Mã ${r.s}, tạo ${n} hợp đồng`); } });
add({ tr: 'TR-PB59-02', id: 'TC_PROBE_002', type: 'Negative', pri: 'High', feat: 'S07', obj: 'Không ứng tuyển tin đã đủ người', pre: 'Tin JOB_PUBLIC đã chuyển Đã nhận người.',
  act: 'SV_C ứng tuyển JOB_PUBLIC', data: 'job_id = JOB_PUBLIC', exp: 'Trả 400, không tạo đơn.',
  run: async () => { const r = await apply(ctx.SV3, ctx.JOB_PUBLIC); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB59-03', id: 'TC_PROBE_003', type: 'Security', pri: 'High', feat: 'E19', obj: 'NTD khác không duyệt được sản phẩm của hợp đồng không thuộc mình', pre: 'Có sản phẩm D2 thuộc hợp đồng WA1 của NTD_A.',
  act: 'NTD_B gửi duyệt sản phẩm D2', data: 'decision: ACCEPTED', exp: 'Trả 403/404.',
  run: async () => { const r = await api('POST', `/assignments/${ctx.WA1}/deliverables/${ctx.D2}/review`, ctx.E2.token, { decision: 'ACCEPTED' }); return check(r.s === 403 || r.s === 404, String(r.s), 'Mã ' + r.s); } });
add({ tr: 'TR-PB59-04', id: 'TC_PROBE_004', type: 'Security', pri: 'High', feat: 'E18', obj: 'NTD khác không xem được tiến độ và sản phẩm của hợp đồng', pre: 'Hợp đồng WA1 thuộc NTD_A.',
  act: 'NTD_B gọi GET tiến độ và sản phẩm của WA1', data: 'Token NTD_B', exp: 'Cả hai trả 403/404.',
  run: async () => { const a = await api('GET', `/assignments/${ctx.WA1}/progress`, ctx.E2.token); const b = await api('GET', `/assignments/${ctx.WA1}/deliverables`, ctx.E2.token); return check([403, 404].includes(a.s) && [403, 404].includes(b.s), `${a.s} / ${b.s}`, `${a.s} / ${b.s}`); } });
add({ tr: 'TR-PB59-05', id: 'TC_PROBE_005', type: 'Security', pri: 'High', feat: 'E16', obj: 'NTD không xem được hồ sơ sinh viên chưa từng nộp đơn vào tin của mình', pre: 'SV_C chưa nộp đơn nào vào tin NTD_B.',
  act: 'NTD_B mở /profile/<SV_C>', data: 'Token NTD_B', exp: 'Trả 403.',
  run: async () => { const r = await api('GET', `/profile/${ctx.SV3.id}`, ctx.E2.token); return check(r.s === 403, '403', 'Mã ' + r.s); } });
add({ tr: 'TR-PB59-06', id: 'TC_PROBE_006', type: 'Boundary', pri: 'Medium', feat: 'G02', obj: 'Tham số phân trang bất thường không làm sập API tìm kiếm', pre: 'Khách.',
  act: 'Gọi /jobs với page=-1, limit=100000, limit=abc', data: 'page=-1; limit=100000; limit=abc', exp: 'Trả 200 (hoặc 400), không 500; số kết quả bị giới hạn.',
  run: async () => { const a = await api('GET', '/jobs?page=-1&limit=100000', null); const b = await api('GET', '/jobs?limit=abc', null); const n = (a.j.data?.jobs || a.j.data || []).length; return check(a.s < 500 && b.s < 500, `${a.s}/${b.s}, ${n} tin`, `${a.s}/${b.s}`); } });
add({ tr: 'TR-PB59-07', id: 'TC_PROBE_007', type: 'Negative', pri: 'Medium', feat: 'A06', obj: 'Kiểm duyệt tin không tồn tại / trạng thái không hợp lệ', pre: PRE_A,
  act: 'Duyệt tin id 99999999; duyệt tin với trạng thái "OK"', data: 'moderation_status: APPROVED / OK', exp: '404 và 400; không lỗi 500.',
  run: async () => { const a = await api('PATCH', '/admin/jobs/99999999/moderate', ctx.A.token, { moderation_status: 'APPROVED' }); const b = await api('PATCH', `/admin/jobs/${ctx.JOB_PENDING}/moderate`, ctx.A.token, { moderation_status: 'OK' }); return check(a.s === 404 && b.s === 400, '404 / 400', `${a.s} / ${b.s}`); } });
add({ tr: 'TR-PB59-08', id: 'TC_PROBE_008', type: 'Security', pri: 'High', feat: 'E03', obj: 'Mã HTML/script trong giới thiệu doanh nghiệp không bị lưu thành mã chạy được', pre: PRE_E,
  act: 'Nhập giới thiệu chứa <script> → Lưu → mở trang công khai', data: 'bio: <script>alert(1)</script>', exp: 'Lưu dạng văn bản; giao diện hiển thị nguyên văn, không chạy script (React tự escape).',
  run: async () => { const r = await api('PUT', '/profile/me/employer-public', ctx.E1.token, pub({ bio: '<script>alert(1)</script> Chuỗi cà phê' })); const p = await api('GET', `/profile/${ctx.E1.id}`, null); return check(r.s === 200 && p.s === 200, 'Lưu dạng văn bản (giao diện React escape khi hiển thị)', `Mã ${r.s}`); } });
add({ tr: 'TR-PB59-09', id: 'TC_PROBE_009', type: 'Negative', pri: 'Medium', feat: 'S07', obj: 'Sinh viên chưa có trường/chuyên ngành không ứng tuyển được', pre: 'Tài khoản SV mới, hồ sơ trống.',
  act: 'Đăng ký SV mới → ứng tuyển ngay', data: 'Hồ sơ trống', exp: 'Trả 400 yêu cầu hoàn thiện hồ sơ.',
  run: async () => { const sv = await register('S', 'svd'); const r = await apply(sv, ctx.JOB_EMPTY); return check(r.s === 400, '400 ' + (r.j.message || '').slice(0, 50), 'Mã ' + r.s); } });
add({ tr: 'TR-PB59-10', id: 'TC_PROBE_010', type: 'Security', pri: 'High', feat: 'S09', obj: 'NTD không rút đơn hộ sinh viên', pre: 'Có đơn Chờ duyệt.',
  act: 'NTD_A gọi PATCH /applications/<id>/withdraw', data: 'Token NTD_A', exp: 'Trả 403.',
  run: async () => { const a = await apply(ctx.SV1, ctx.JOB_EMPTY); const r = await api('PATCH', `/applications/${a.j.data?.id}/withdraw`, ctx.E1.token); return check(r.s === 403, '403', 'Mã ' + r.s); } });

// ---------- PB60: LỊCH SỬ ỨNG TUYỂN & CÔNG VIỆC CỦA TÔI ----------
add({ tr: 'TR-PB60-01', id: 'TC_MYAPPS_001', type: 'Positive', pri: 'High', feat: 'S08', obj: 'Lịch sử ứng tuyển chỉ gồm đơn của chính sinh viên, đúng trạng thái', pre: 'SV_A có đơn ACCEPTED (JOB_PUBLIC); SV_B có đơn khác.',
  act: 'SV_A mở Lịch sử ứng tuyển', data: 'N/A', exp: 'Thấy đơn của mình với trạng thái Đã duyệt; không thấy đơn của SV_B.',
  run: async () => { const r = await api('GET', '/applications/my-applications', ctx.SV1.token); const list = r.j.data?.applications || r.j.data || []; const mine = list.find(a => (a.id ?? a.application_id) === ctx.APP1); const foreign = list.some(a => (a.id ?? a.application_id) === ctx.APP2); return check(r.s === 200 && mine && mine.status === 'ACCEPTED' && !foreign, `${list.length} đơn, đơn JOB_PUBLIC = ACCEPTED`, `Mã ${r.s}, thấy đơn mình: ${Boolean(mine)} (${mine?.status}), thấy đơn người khác: ${foreign}`); } });
add({ tr: 'TR-PB60-02', id: 'TC_MYAPPS_002', type: 'Security', pri: 'High', feat: 'S08', obj: 'Không xem chi tiết đơn ứng tuyển của sinh viên khác', pre: 'SV_C đăng nhập.',
  act: 'SV_C gọi GET /applications/<đơn của SV_A>', data: 'Token SV_C', exp: 'Trả 403.',
  run: async () => { const r = await api('GET', `/applications/${ctx.APP1}`, ctx.SV3.token); return check(r.s === 403, '403', 'Mã ' + r.s); } });
add({ tr: 'TR-PB60-03', id: 'TC_MYWORK_001', type: 'Positive', pri: 'High', feat: 'S10', obj: 'Công việc của tôi hiển thị hợp đồng đã nhận', pre: 'SV_A có hợp đồng WA1.',
  act: 'SV_A mở Công việc của tôi', data: 'N/A', exp: 'Danh sách có hợp đồng WA1 với tên công việc và trạng thái; không có hợp đồng của SV_B.',
  run: async () => { const r = await api('GET', '/assignments/my-assignments', ctx.SV1.token); const ids = (r.j.data?.assignments || r.j.data || []).map(a => a.id); return check(r.s === 200 && ids.includes(ctx.WA1) && !ids.includes(ctx.WA2), `${ids.length} hợp đồng`, `Mã ${r.s}, ids ${ids}`); } });
add({ tr: 'TR-PB60-04', id: 'TC_MYWORK_002', type: 'Security', pri: 'High', feat: 'S10', obj: 'Không xem chi tiết hợp đồng của người khác', pre: 'SV_C đăng nhập.',
  act: 'SV_C gọi GET /assignments/WA1', data: 'Token SV_C', exp: 'Trả 403/404.',
  run: async () => { const r = await api('GET', `/assignments/${ctx.WA1}`, ctx.SV3.token); return check(r.s === 403 || r.s === 404, String(r.s), 'Mã ' + r.s); } });

// ---------- PB61: QUẢN LÝ ĐÁNH GIÁ CỦA TÔI & KIỂM DUYỆT ĐÁNH GIÁ ----------
add({ tr: 'TR-PB61-01', id: 'TC_MYREVIEW_001', type: 'Positive', pri: 'Medium', feat: 'S17', obj: 'Xem danh sách đánh giá mình đã viết kèm trạng thái và phản hồi', pre: 'SV_A có đánh giá CR1 đã được NTD phản hồi.',
  act: 'Đánh giá & Phản hồi → Đánh giá của tôi', data: 'N/A', exp: 'Thấy CR1, trạng thái Công khai, có phản hồi của doanh nghiệp, số lần sửa còn lại.',
  run: async () => { const r = await api('GET', '/reviews/mine', ctx.SV1.token); const t = JSON.stringify(r.j); return check(r.s === 200 && t.includes('Môi trường tốt cho sinh viên') && t.includes('chúng tôi sẽ cải thiện'), 'Có đánh giá và phản hồi', `Mã ${r.s}`); } });
add({ tr: 'TR-PB61-02', id: 'TC_MYREVIEW_002', type: 'Positive', pri: 'Medium', feat: 'S17', obj: 'Sửa đánh giá đã viết', pre: 'CR1 đang công khai.',
  act: 'Sửa tiêu đề đánh giá → Lưu', data: 'title: "Môi trường tốt, quản lý tận tâm"', exp: 'Lưu thành công; số lần sửa tăng 1.',
  run: async () => { const r = await api('PUT', `/reviews/company/${ctx.CR1}`, ctx.SV1.token, companyReview({ title: 'Môi trường tốt, quản lý tận tâm' })); const n = one(`SELECT edit_count FROM company_reviews WHERE id=${ctx.CR1}`); return check(r.s === 200 && n === '1', 'Đã sửa, edit_count=1', `Mã ${r.s} ${r.j.message || ''}, edit_count ${n}`); } });
add({ tr: 'TR-PB61-03', id: 'TC_MYREVIEW_003', type: 'Boundary', pri: 'Medium', feat: 'S17', obj: 'Mỗi đánh giá chỉ được sửa tối đa 5 lần', pre: 'CR1 đã sửa 1 lần.',
  act: 'Sửa thêm 4 lần (đủ 5), rồi sửa lần thứ 6', data: '6 lần sửa liên tiếp', exp: 'Lần 2–5 thành công; lần 6 trả 403.',
  run: async () => { const codes = []; for (let i = 2; i <= 6; i++) codes.push((await api('PUT', `/reviews/company/${ctx.CR1}`, ctx.SV1.token, companyReview({ title: `Sửa lần thứ ${i} cho đánh giá` }))).s); return check(codes.slice(0, 4).every(s => s === 200) && codes[4] === 403, codes.join(','), codes.join(',')); } });
add({ tr: 'TR-PB61-04', id: 'TC_MYREVIEW_004', type: 'Security', pri: 'High', feat: 'S17', obj: 'Không sửa được đánh giá của người khác', pre: 'SV_B đăng nhập.',
  act: 'SV_B gọi PUT đánh giá CR1 của SV_A', data: 'Token SV_B', exp: 'Trả 403/404.',
  run: async () => { const r = await api('PUT', `/reviews/company/${ctx.CR1}`, ctx.SV2.token, companyReview()); return check(r.s === 403 || r.s === 404, String(r.s), 'Mã ' + r.s); } });
add({ tr: 'TR-PB61-05', id: 'TC_REVMOD_001', type: 'Negative', pri: 'Medium', feat: 'A08', obj: 'Admin xử lý báo cáo đánh giá phải có ghi chú ≥ 5 ký tự', pre: PRE_A + ' Có báo cáo đánh giá đang chờ (TC_RREPORT_002).',
  act: 'Bác bỏ báo cáo, ghi chú "ok"', data: 'action: DISMISS, note: "ok"', exp: 'Trả 400.',
  run: async () => { ctx.RR = one(`SELECT id FROM review_reports WHERE company_review_id=${ctx.CR1} AND kind='REPORT' AND status='PENDING' LIMIT 1`); const r = await api('POST', `/admin/reviews/reports/${ctx.RR}/resolve`, ctx.A.token, { action: 'DISMISS', note: 'ok' }); return check(r.s === 400, '400', 'Mã ' + r.s); } });
add({ tr: 'TR-PB61-06', id: 'TC_REVMOD_002', type: 'Positive', pri: 'High', feat: 'A08', obj: 'Admin ẩn đánh giá bị báo cáo → người viết và người báo cáo được báo', pre: 'Báo cáo RR đang chờ.',
  act: 'Admin → Kiểm duyệt đánh giá → Báo cáo → Ẩn đánh giá, ghi chú lý do', data: 'action: HIDE, note: "Nội dung chưa kiểm chứng"', exp: 'Đánh giá chuyển Đã ẩn; không còn trên trang công khai; người viết và người báo cáo nhận thông báo.',
  run: async () => { const r = await api('POST', `/admin/reviews/reports/${ctx.RR}/resolve`, ctx.A.token, { action: 'HIDE', note: 'Nội dung chưa kiểm chứng' }); const st = one(`SELECT status FROM company_reviews WHERE id=${ctx.CR1}`); const pubList = await api('GET', `/reviews/companies/${ctx.E1.id}/company-reviews`, null); return check(r.s === 200 && st === 'HIDDEN' && !JSON.stringify(pubList.j).includes('Sửa lần thứ') && notif(ctx.E1.id, 'REVIEW', "AND title LIKE '%xử lý%'") >= 1, 'HIDDEN, ẩn khỏi trang công khai', `Mã ${r.s}, trạng thái ${st}`); } });
add({ tr: 'TR-PB61-07', id: 'TC_REVMOD_003', type: 'Positive', pri: 'High', feat: 'S17', obj: 'Khiếu nại đánh giá bị ẩn → Admin chấp nhận → đánh giá được khôi phục', pre: 'CR1 đang Đã ẩn.',
  act: 'SV_A gửi khiếu nại (≥20 ký tự); Admin chấp nhận khiếu nại', data: 'description: "Tôi làm việc ở đó 3 tháng, nội dung là sự thật."', exp: 'Khiếu nại được tạo; Admin nhận việc; sau khi chấp nhận đánh giá về Công khai.',
  run: async () => { const a = await api('POST', `/reviews/company/${ctx.CR1}/appeal`, ctx.SV1.token, { description: 'Tôi làm việc ở đó 3 tháng, nội dung là sự thật.' }); const notified = adminTask('REVIEW_REPORT', a.j.data?.id); const r = await api('POST', `/admin/reviews/reports/${a.j.data?.id}/resolve`, ctx.A.token, { action: 'ACCEPT', note: 'Đã đối chiếu hợp đồng, nội dung đúng' }); const st = one(`SELECT status FROM company_reviews WHERE id=${ctx.CR1}`); return check(a.s < 300 && notified === 1 && r.s === 200 && st === 'PUBLISHED', 'Khôi phục PUBLISHED', `khiếu nại ${a.s}, admin báo ${notified}, xử lý ${r.s}, trạng thái ${st}`); } });
add({ tr: 'TR-PB61-08', id: 'TC_REVMOD_004', type: 'Negative', pri: 'Medium', feat: 'A08', obj: 'Không xử lý lại báo cáo đã xử lý', pre: 'Báo cáo RR đã xử lý.',
  act: 'Admin xử lý RR lần nữa', data: 'action: DISMISS', exp: 'Trả 409.',
  run: async () => { const r = await api('POST', `/admin/reviews/reports/${ctx.RR}/resolve`, ctx.A.token, { action: 'DISMISS', note: 'Xử lý lần hai' }); return check(r.s === 409, '409', 'Mã ' + r.s); } });

// ---------- PB62: DANH SÁCH TIN CỦA NTD, TỔNG QUAN ĐÁNH GIÁ, GIỚI THIỆU & CHÍNH SÁCH ----------
add({ tr: 'TR-PB62-01', id: 'TC_MYJOBS_001', type: 'Positive', pri: 'High', feat: 'E14', obj: 'Danh sách tin chỉ gồm tin của chính NTD, đủ mọi trạng thái', pre: 'NTD_A có tin đã duyệt, chờ duyệt, đã nhận người.',
  act: 'NTD_A mở Tin tuyển dụng', data: 'N/A', exp: 'Thấy JOB_PUBLIC, JOB_EMPTY, JOB_PENDING; không thấy tin của NTD_B.',
  run: async () => { const r = await api('GET', '/jobs/my-jobs', ctx.E1.token); const ids = (r.j.data?.jobs || r.j.data || []).map(j => j.id); return check(r.s === 200 && [ctx.JOB_PUBLIC, ctx.JOB_EMPTY, ctx.JOB_PENDING].every(i => ids.includes(i)) && !ids.includes(ctx.JOB_OTHER), `${ids.length} tin`, `Mã ${r.s}, ids ${ids}`); } });
add({ tr: 'TR-PB62-02', id: 'TC_MYJOBS_002', type: 'Security', pri: 'High', feat: 'E14', obj: 'Sinh viên không gọi được danh sách tin của NTD', pre: PRE_SV,
  act: 'SV_A gọi GET /jobs/my-jobs', data: 'Token SV_A', exp: 'Trả 403.',
  run: async () => { const r = await api('GET', '/jobs/my-jobs', ctx.SV1.token); return check(r.s === 403, '403', 'Mã ' + r.s); } });
add({ tr: 'TR-PB62-03', id: 'TC_EREVIEW_001', type: 'Positive', pri: 'Medium', feat: 'E21', obj: 'Tổng quan đánh giá của doanh nghiệp', pre: 'NTD_A có đánh giá công khai.',
  act: 'NTD_A mở mục Đánh giá', data: 'N/A', exp: 'Có điểm trung bình, số đánh giá 30 ngày, số chưa phản hồi, biểu đồ theo tháng.',
  run: async () => { const r = await api('GET', '/reviews/employer/overview', ctx.E1.token); return check(r.s === 200 && r.j.data && typeof r.j.data === 'object', 'Có số liệu tổng quan', 'Mã ' + r.s); } });
add({ tr: 'TR-PB62-04', id: 'TC_EREVIEW_002', type: 'Positive', pri: 'Medium', feat: 'E21', obj: 'Xóa phản hồi đánh giá', pre: 'CR1 có phản hồi của NTD_A.',
  act: 'Đánh giá → Xóa phản hồi → Xác nhận', data: 'N/A', exp: 'Phản hồi bị xóa; đánh giá vẫn còn.',
  run: async () => { const r = await api('DELETE', `/reviews/company/${ctx.CR1}/reply`, ctx.E1.token); const n = one(`SELECT count(*) FROM review_replies WHERE company_review_id=${ctx.CR1} `); return check(r.s === 200 && n === '0', 'Đã xóa', `Mã ${r.s}, còn ${n} phản hồi`); } });
add({ tr: 'TR-PB62-05', id: 'TC_COMPANY_010', type: 'Positive', pri: 'Medium', feat: 'E04', obj: 'Lưu mục Giới thiệu & văn hóa và hiển thị công khai', pre: PRE_E,
  act: 'Giới thiệu & văn hóa → nhập Sứ mệnh, Giá trị cốt lõi, Văn hóa → Lưu', data: 'mission, core_values, internal_culture', exp: 'Trang công khai hiển thị đúng 3 mục.',
  run: async () => { const r = await api('PUT', '/profile/me/employer-public', ctx.E1.token, pub({ mission: 'Mang việc làm linh hoạt đến sinh viên', core_values: 'Tôn trọng, đúng hẹn', internal_culture: 'Sinh nhật nhân viên hằng tháng' })); const p = (await api('GET', `/profile/${ctx.E1.id}`, null)).j.data || {}; return check(r.s === 200 && p.mission === 'Mang việc làm linh hoạt đến sinh viên' && p.internal_culture === 'Sinh nhật nhân viên hằng tháng', 'Hiển thị đúng', `Mã ${r.s}`); } });
add({ tr: 'TR-PB62-06', id: 'TC_COMPANY_011', type: 'Boundary', pri: 'Low', feat: 'E04', obj: 'Giới thiệu dài hơn 5000 ký tự không lưu quá giới hạn', pre: PRE_E,
  act: 'Dán giới thiệu 5001 ký tự → Lưu', data: 'bio 5001 ký tự', exp: 'Trả 400 hoặc chỉ lưu tối đa 5000 ký tự.',
  run: async () => { const r = await api('PUT', '/profile/me/employer-public', ctx.E1.token, pub({ bio: 'a'.repeat(5001) })); const n = Number(one(`SELECT length(bio) FROM employer_profiles WHERE user_id=${ctx.E1.id}`)); return check(r.s === 400 || n <= 5000, r.s === 400 ? '400' : `Lưu ${n} ký tự`, `Mã ${r.s}, lưu ${n} ký tự`); } });
add({ tr: 'TR-PB62-07', id: 'TC_COMPANY_012', type: 'Positive', pri: 'Medium', feat: 'E05', obj: 'Lưu chính sách nhân sự và chỉ công khai mục có nội dung', pre: PRE_E,
  act: 'Chính sách nhân sự → nhập Chính sách thực tập, Hỗ trợ sinh viên; để trống Full-time → Lưu', data: 'hr_policy_details.internship, student_support', exp: 'Trang công khai có 2 chính sách đã nhập, không có mục trống.',
  run: async () => { const r = await api('PUT', '/profile/me/employer-public', ctx.E1.token, pub({ hr_policy_details: { internship: 'Có xác nhận thực tập', student_support: 'Đổi ca mùa thi', full_time: '   ' } })); const d = (await api('GET', `/profile/${ctx.E1.id}`, null)).j.data?.hr_policy_details || {}; return check(r.s === 200 && d.internship && d.student_support && !('full_time' in d), 'Đúng 2 mục', `Mã ${r.s}, ${JSON.stringify(d)}`); } });
add({ tr: 'TR-PB62-08', id: 'TC_COMPANY_013', type: 'Negative', pri: 'Medium', feat: 'E06', obj: 'Liên kết mạng xã hội phải là http(s); SĐT/email công khai phải hợp lệ', pre: PRE_E,
  act: 'Nhập Facebook "facebook.com/qa", SĐT "123", email "abc" → Lưu', data: 'social_links.facebook, public_phone, public_email sai', exp: 'Trả 400 cho từng trường sai.',
  run: async () => { const a = await api('PUT', '/profile/me/employer-public', ctx.E1.token, pub({ social_links: { facebook: 'facebook.com/qa' } })); const b = await api('PUT', '/profile/me/employer-public', ctx.E1.token, pub({ public_phone: '123' })); const c2 = await api('PUT', '/profile/me/employer-public', ctx.E1.token, pub({ public_email: 'abc' })); return check(a.s === 400 && b.s === 400 && c2.s === 400, '400/400/400', `${a.s}/${b.s}/${c2.s}`); } });
add({ tr: 'TR-PB62-09', id: 'TC_COMPANY_014', type: 'Security', pri: 'High', feat: 'G04', obj: 'Hộ kinh doanh/cá nhân không bị lộ số nhà và tọa độ', pre: 'NTD_B là tài khoản "Hộ kinh doanh / Cá nhân", địa chỉ có số nhà.',
  act: 'Khách mở trang doanh nghiệp NTD_B', data: 'location: "27 Võ Văn Ngân, Linh Chiểu, Thủ Đức"', exp: 'Chỉ hiện khu vực (Linh Chiểu, Thủ Đức), không có số nhà, không có tọa độ.',
  run: async () => { sql(`UPDATE employer_profiles SET account_type='Hộ kinh doanh / Cá nhân', latitude=10.85, longitude=106.77 WHERE user_id=${ctx.E2.id}; UPDATE employer_profiles SET location='27 Võ Văn Ngân, Linh Chiểu, Thủ Đức' WHERE user_id=${ctx.E2.id};`); await api('PUT', '/profile/me/employer-public', ctx.E2.token, { detailed_address: '27 Võ Văn Ngân, Linh Chiểu, Thủ Đức' }); const p = (await api('GET', `/profile/${ctx.E2.id}`, null)).j.data || {}; const t = JSON.stringify(p); return check(!t.includes('27 Võ Văn Ngân') && p.latitude == null && p.longitude == null, `location="${p.location}"`, `Lộ: ${t.includes('27 Võ Văn Ngân') ? 'số nhà ' : ''}${p.latitude != null ? 'tọa độ' : ''}`); } });
add({ tr: 'TR-PB62-10', id: 'TC_COMPANY_015', type: 'Positive', pri: 'Medium', feat: 'E02', obj: 'Ảnh bìa và sắp xếp thư viện ảnh', pre: 'NTD_A có 1 ảnh thư viện.',
  act: 'Tải ảnh bìa; thêm ảnh thư viện thứ 2; đổi thứ tự; gửi danh sách thứ tự giả mạo', data: 'cover.png; order đảo ngược; order chứa URL lạ', exp: 'Ảnh bìa lưu; đổi thứ tự thành công; thứ tự giả mạo bị 400.',
  run: async () => { const cv = await api('PUT', '/files/cover', ctx.E1.token, { image: PNG }); const add2 = await api('POST', '/files/office-images', ctx.E1.token, { image: PNG }); const list = add2.j.data?.office_images || []; const ord = await api('PUT', '/files/office-images/order', ctx.E1.token, { order: [...list].reverse() }); const bad = await api('PUT', '/files/office-images/order', ctx.E1.token, { order: ['/api/files/999999999', ...list.slice(1)] }); return check(cv.s === 200 && ord.s === 200 && bad.s === 400, `bìa ${cv.s}, đổi ${ord.s}, giả mạo ${bad.s}`, `bìa ${cv.s}, đổi ${ord.s}, giả mạo ${bad.s}`); } });
add({ tr: 'TR-PB62-11', id: 'TC_BANNER_001', type: 'Positive', pri: 'Low', feat: 'E12', obj: 'Tải ảnh banner cho tin; SV không tải được', pre: PRE_E,
  act: 'Đăng tin → tải banner; SV gọi cùng API', data: 'banner.png', exp: 'NTD 200; SV 403.',
  run: async () => { const a = await api('POST', '/files/job-banner', ctx.E1.token, { image: PNG }); const b = await api('POST', '/files/job-banner', ctx.SV1.token, { image: PNG }); return check(a.s === 200 && b.s === 403, `${a.s} / ${b.s}`, `${a.s} / ${b.s}`); } });

// ---------- PB63: VI PHẠM 4 BẬC, TỰ MỞ KHÓA, KHIẾU NẠI KHI ĐÃ ĐĂNG NHẬP ----------
add({ tr: 'TR-PB63-01', id: 'TC_APPEAL_LOGGED_001', type: 'Positive', pri: 'High', feat: 'C06', obj: 'Gửi khiếu nại khi đang đăng nhập → Admin được báo; không gửi trùng', pre: 'NTD_B đã nhận cảnh cáo (TC_REPORT_006).',
  act: 'Cài đặt tài khoản → Khiếu nại → Gửi; gửi lần 2', data: 'appeal_reason ≥ 20 ký tự', exp: 'Lần 1: 201 và Admin nhận việc; lần 2: 409.',
  run: async () => { const a = await api('POST', '/profile/appeals', ctx.E2.token, { appeal_reason: 'Chúng tôi đã gỡ yêu cầu thu phí khỏi tin tuyển dụng.' }); const b = await api('POST', '/profile/appeals', ctx.E2.token, { appeal_reason: 'Gửi lại lần hai cho chắc chắn.' }); return check(a.s === 201 && adminTask('USER_APPEAL', a.j.data?.id) === 1 && b.s === 409, '201 + báo Admin, lần 2 409', `${a.s} / ${b.s}`); } });
add({ tr: 'TR-PB63-02', id: 'TC_VIOL_001', type: 'Positive', pri: 'High', feat: 'A15', obj: 'Ghi nhận vi phạm lần 1, 2 → cảnh cáo, tài khoản vẫn hoạt động', pre: PRE_A + ' SV_C chưa có vi phạm.',
  act: 'Ghi nhận 2 vi phạm cho SV_C', data: 'reason: "Spam tin nhắn"', exp: 'Bậc 1 rồi bậc 2; SV_C nhận 2 cảnh cáo; vẫn ACTIVE.',
  run: async () => { const a = await api('POST', `/admin/users/${ctx.SV3.id}/violations`, ctx.A.token, { reason: 'Spam tin nhắn', violation_type: 'SPAM' }); const b = await api('POST', `/admin/users/${ctx.SV3.id}/violations`, ctx.A.token, { reason: 'Spam tin nhắn', violation_type: 'SPAM' }); return check([200, 201].includes(a.s) && a.j.data?.tier === 1 && b.j.data?.tier === 2 && one(`SELECT status FROM users WHERE id=${ctx.SV3.id}`) === 'ACTIVE' && notif(ctx.SV3.id, 'VIOLATION_NOTICE') === 2, 'Bậc 1, 2; ACTIVE', `${a.s}/${b.s} bậc ${a.j.data?.tier}/${b.j.data?.tier}`); } });
add({ tr: 'TR-PB63-03', id: 'TC_VIOL_002', type: 'Positive', pri: 'High', feat: 'A15', obj: 'Vi phạm lần 3 → tạm khóa 7 ngày', pre: 'SV_C đã có 2 vi phạm.',
  act: 'Ghi nhận vi phạm thứ 3', data: 'reason: "Spam tin nhắn"', exp: 'Bậc 3; tài khoản bị khóa có hạn 7 ngày; đăng nhập bị chặn.',
  run: async () => { const r = await api('POST', `/admin/users/${ctx.SV3.id}/violations`, ctx.A.token, { reason: 'Spam tin nhắn', violation_type: 'SPAM' }); const row = sql(`SELECT status, (suspension_expires_at - now() > interval '6 days')::text FROM users WHERE id=${ctx.SV3.id}`)[0]; return check(r.j.data?.tier === 3 && row[1] === 'true' && ['BANNED', 'SUSPENDED'].includes(row[0]), `Bậc 3, ${row[0]}, hạn 7 ngày`, `bậc ${r.j.data?.tier}, ${row}`); } });
add({ tr: 'TR-PB63-04', id: 'TC_VIOL_003', type: 'Positive', pri: 'High', feat: 'H02', obj: 'Hết hạn tạm khóa 7 ngày → tài khoản tự mở, đăng nhập lại được', pre: 'SV_C bị tạm khóa do vi phạm lần 3.',
  act: 'Giả lập đã qua 7 ngày (đặt hạn khóa về quá khứ) → SV_C đăng nhập', data: 'suspension_expires_at = hôm qua', exp: 'Đăng nhập thành công; tài khoản về ACTIVE.',
  run: async () => { sql(`UPDATE users SET suspension_expires_at = now() - interval '1 day' WHERE id=${ctx.SV3.id};`); const l = await api('POST', '/auth/login', null, { email: mail('svc'), password: 'Moi@123456' }); const st = one(`SELECT status FROM users WHERE id=${ctx.SV3.id}`); return check(l.s === 200 && st === 'ACTIVE', 'Tự mở khóa', `Đăng nhập ${l.s} "${(l.j.message || '').slice(0, 70)}", trạng thái vẫn ${st}`); } });
add({ tr: 'TR-PB63-05', id: 'TC_VIOL_004', type: 'Positive', pri: 'Medium', feat: 'A16', obj: 'Xem lịch sử vi phạm của người dùng', pre: 'SV_C có 3 vi phạm.',
  act: 'Admin xem lịch sử vi phạm SV_C; SV_C tự gọi API này', data: 'N/A', exp: 'Admin thấy 3 bản ghi theo bậc; SV_C bị 403.',
  run: async () => { const r = await api('GET', `/admin/users/${ctx.SV3.id}/violations`, ctx.A.token); const s = await api('GET', `/admin/users/${ctx.SV3.id}/violations`, ctx.SV1.token); const n = (r.j.data || []).length; return check(r.s === 200 && n === 3 && s.s === 403, `${n} bản ghi; SV 403`, `${r.s} (${n}) / ${s.s}`); } });
add({ tr: 'TR-PB63-06', id: 'TC_VIOL_005', type: 'Negative', pri: 'Medium', feat: 'A15', obj: 'Ghi nhận vi phạm bắt buộc có lý do', pre: PRE_A,
  act: 'Ghi nhận vi phạm bỏ trống lý do', data: 'reason: ""', exp: 'Trả 400; số vi phạm không đổi.',
  run: async () => { const r = await api('POST', `/admin/users/${ctx.SV1.id}/violations`, ctx.A.token, { reason: '' }); return check(r.s === 400 && one(`SELECT COALESCE(violation_count,0) FROM users WHERE id=${ctx.SV1.id}`) === '0', '400', 'Mã ' + r.s); } });

// ---------- PB64: TÍCH HỢP TWENTY CRM (WEBHOOK) ----------
add({ tr: 'TR-PB64-01', id: 'TC_WEBHOOK_001', type: 'Security', pri: 'High', feat: 'H05', obj: 'Webhook từ chối yêu cầu không có / sai khóa API', pre: 'Webhook /api/webhooks/twenty đang bật.',
  act: 'Gửi sự kiện company.verified không kèm khóa, rồi kèm khóa sai', data: 'x-api-key: (trống) / "sai"', exp: 'Cả hai trả 401; trạng thái doanh nghiệp không đổi.',
  run: async () => { const body = { event: 'company.verified', data: { email: mail('ntdb'), verificationStatus: 'VERIFIED' } }; const a = await api('POST', '/webhooks/twenty', null, body); const b = await api('POST', '/webhooks/twenty', null, body, { 'x-api-key': 'sai' }); return check([401, 403].includes(a.s) && [401, 403].includes(b.s), `${a.s} / ${b.s}`, `${a.s} / ${b.s}`); } });
add({ tr: 'TR-PB64-02', id: 'TC_WEBHOOK_002', type: 'Security', pri: 'High', feat: 'H05', obj: 'Khóa mặc định ghi trong mã nguồn không được dùng để xác minh doanh nghiệp', pre: 'Máy chủ chạy theo cấu hình Docker hiện tại.',
  act: 'Gửi company.verified cho NTD_B (chưa xác minh) với khóa "jobnest_twenty_secret_key_2026" công khai trong repo', data: 'x-api-key: jobnest_twenty_secret_key_2026', exp: 'Bị từ chối (401); NTD_B vẫn chưa xác minh — chỉ khóa bí mật cấu hình riêng mới được chấp nhận.',
  run: async () => { const r = await api('POST', '/webhooks/twenty', null, { event: 'company.verified', data: { email: mail('ntdb'), verificationStatus: 'VERIFIED' } }, { 'x-api-key': 'jobnest_twenty_secret_key_2026' }); const st = one(`SELECT verification_status FROM employer_profiles WHERE user_id=${ctx.E2.id}`); return check(r.s === 401 || r.s === 403, String(r.s), `Mã ${r.s}: khóa công khai được chấp nhận, NTD_B chuyển ${st}`); } });

add({ tr: 'TR-PB64-03', id: 'TC_WEBHOOK_003', type: 'Positive', pri: 'High', feat: 'H05', obj: 'Webhook nhận đúng khóa bí mật cấu hình trên máy chủ → cập nhật xác minh', pre: 'Máy chủ đặt JOBNEST_SYNC_API_KEY riêng (lần chạy thử: biến QA_WEBHOOK_KEY).',
  act: 'Gửi company.verified cho NTD_B kèm khóa bí mật đúng', data: 'x-api-key: <JOBNEST_SYNC_API_KEY>', exp: 'Trả 200; NTD_B chuyển Đã xác minh.',
  run: async () => { if (!process.env.QA_WEBHOOK_KEY) return ['FAIL', 'Thiếu biến QA_WEBHOOK_KEY khi chạy']; sql(`UPDATE employer_profiles SET verification_status='UNVERIFIED' WHERE user_id=${ctx.E2.id};`); const r = await api('POST', '/webhooks/twenty', null, { event: 'company.verified', data: { email: mail('ntdb'), verificationStatus: 'VERIFIED' } }, { 'x-api-key': process.env.QA_WEBHOOK_KEY }); const st = one(`SELECT verification_status FROM employer_profiles WHERE user_id=${ctx.E2.id}`); return check(r.s === 200 && st === 'VERIFIED', '200, VERIFIED', `Mã ${r.s} ${r.j.message || ''}, trạng thái ${st}`); } });
add({ tr: 'TR-PB63-07', id: 'TC_VIOL_006', type: 'Negative', pri: 'High', feat: 'A03', obj: 'Khóa tay sau khóa tạm → thành khóa vĩnh viễn, không tự mở', pre: 'SV_C từng có hạn khóa tạm.',
  act: 'Đặt hạn khóa cũ của SV_C; Admin khóa tay SV_C; giả lập hạn khóa cũ đã qua; SV_C đăng nhập', data: 'Khóa tay, lý do "Tái phạm"', exp: 'Hạn khóa bị xóa (khóa vĩnh viễn); đăng nhập vẫn bị chặn.',
  run: async () => { sql(`UPDATE users SET suspension_expires_at = now() + interval '3 day' WHERE id=${ctx.SV3.id};`); const b = await api('PATCH', `/admin/users/${ctx.SV3.id}/status`, ctx.A.token, { status: 'BANNED', reason: 'Tái phạm' }); const exp = one(`SELECT COALESCE(suspension_expires_at::text,'NULL') FROM users WHERE id=${ctx.SV3.id}`); const l = await api('POST', '/auth/login', null, { email: mail('svc'), password: 'Moi@123456' }); return check(b.s === 200 && exp === 'NULL' && l.s === 403, 'Khóa vĩnh viễn, đăng nhập bị chặn', `khóa ${b.s}, hạn ${exp}, đăng nhập ${l.s}`); } });
add({ tr: 'TR-PB59-11', id: 'TC_PROBE_011', type: 'Boundary', pri: 'Medium', feat: 'G02', obj: 'Số tin trả về mỗi lần bị giới hạn', pre: 'Khách.',
  act: 'Gọi /jobs?limit=100000', data: 'limit=100000', exp: 'Trả 200; tối đa 500 tin.',
  run: async () => { const r = await api('GET', '/jobs?limit=100000', null); const n = (r.j.data?.jobs || r.j.data || []).length; return check(r.s === 200 && n <= 500, `${n} tin`, `Mã ${r.s}, ${n} tin`); } });

// ---------- PB-13 / PB-18: HỒ SƠ 100% MỚI ĐƯỢC ĐĂNG TIN / ỨNG TUYỂN ----------
add({ tr: 'TR-PB13-12', id: 'TC_JOB_GATE_001', type: 'Negative', pri: 'High', feat: 'E12', obj: 'NTD hồ sơ doanh nghiệp trống không đăng tin được', pre: 'NTD_G vừa đăng ký, hồ sơ doanh nghiệp trống.',
  act: 'Tin tuyển dụng → Đăng tin mới → gửi tin hợp lệ', data: 'Tin hợp lệ', exp: 'Trả 403; báo hồ sơ 0% và đủ 11 mục còn thiếu; không tạo tin.',
  run: async () => { ctx.EG = await register('E', 'ntdg'); const me = await api('GET', '/profile/me', ctx.EG.token); const r = await api('POST', '/jobs', ctx.EG.token, jobBody({ t: 'Tin NTD chưa đủ hồ sơ' })); const n = one(`SELECT count(*) FROM jobs WHERE employer_id=${ctx.EG.id}`); return check(r.s === 403 && r.j.details?.missing?.length === 11 && me.j.data?.posting_readiness?.rate === 0 && n === '0', '403, thiếu 11 mục, 0 tin', `Mã ${r.s}, thiếu ${r.j.details?.missing?.length}, số tin ${n}`); } });
add({ tr: 'TR-PB13-13', id: 'TC_JOB_GATE_002', type: 'Negative', pri: 'High', feat: 'E12', obj: 'NTD đủ 10 mục nhưng chưa được Admin xác minh vẫn không đăng tin được', pre: 'NTD_G đã hoàn thiện hồ sơ, hồ sơ xác minh đang Chờ duyệt.',
  act: 'Gửi tin hợp lệ', data: 'verification_status = PENDING', exp: 'Trả 403; chỉ còn thiếu "Xác minh doanh nghiệp (Admin đã duyệt)"; hồ sơ 91%.',
  run: async () => { readyEmployer(ctx.EG.id, 'PENDING'); const r = await api('POST', '/jobs', ctx.EG.token, jobBody({ t: 'Tin NTD chờ xác minh' })); return check(r.s === 403 && r.j.details?.rate === 91 && r.j.details?.missing?.join() === 'Xác minh doanh nghiệp (Admin đã duyệt)', '403, chỉ thiếu xác minh', `Mã ${r.s} ${JSON.stringify(r.j.details?.missing)}`); } });
add({ tr: 'TR-PB13-14', id: 'TC_JOB_GATE_003', type: 'Positive', pri: 'High', feat: 'E12', obj: 'NTD hồ sơ 100% và đã được xác minh thì đăng tin được', pre: 'NTD_G đủ 11 mục, Admin đã xác minh.',
  act: 'Gửi tin hợp lệ', data: 'verification_status = VERIFIED', exp: 'Trả 201; tin ở trạng thái chờ duyệt.',
  run: async () => { readyEmployer(ctx.EG.id, 'VERIFIED'); const r = await api('POST', '/jobs', ctx.EG.token, jobBody({ t: 'Tin NTD đủ hồ sơ' })); return check(r.s === 201, '201', 'Mã ' + r.s + ' ' + (r.j.message || '')); } });
add({ tr: 'TR-PB18-13', id: 'TC_APPLY_GATE_001', type: 'Negative', pri: 'High', feat: 'S07', obj: 'SV hồ sơ chưa đạt 100% không ứng tuyển được, báo đúng mục còn thiếu', pre: 'SV_G đủ 10/11 mục, thiếu "Vị trí mong muốn".',
  act: 'Bấm Ứng tuyển ngay ở tin đang tuyển', data: 'desired_position trống', exp: 'Trả 400; hồ sơ 91%, còn thiếu "Vị trí mong muốn"; không tạo đơn.',
  run: async () => { ctx.SG = await register('S', 'svg'); readyStudent(ctx.SG.id); sql(`UPDATE student_profiles SET desired_position=NULL WHERE user_id=${ctx.SG.id};`); const me = await api('GET', '/profile/me', ctx.SG.token); const r = await apply(ctx.SG, ctx.JOB_EMPTY); return check(r.s === 400 && r.j.details?.code === 'PROFILE_INCOMPLETE' && me.j.data?.completion?.rate === 91 && /Vị trí mong muốn/.test(r.j.message), '400, 91%, thiếu Vị trí mong muốn', `Mã ${r.s}, % ${me.j.data?.completion?.rate}`); } });
add({ tr: 'TR-PB18-14', id: 'TC_APPLY_GATE_002', type: 'Positive', pri: 'High', feat: 'S07', obj: 'SV hồ sơ đạt 100% thì ứng tuyển được', pre: 'SV_G bổ sung đủ "Vị trí mong muốn".',
  act: 'Bấm Ứng tuyển ngay lần nữa', data: 'desired_position = Nhân viên phục vụ', exp: 'Trả 201; đơn ở trạng thái Chờ duyệt.',
  run: async () => { readyStudent(ctx.SG.id); const r = await apply(ctx.SG, ctx.JOB_EMPTY); return check(r.s === 201, '201', 'Mã ' + r.s + ' ' + (r.j.message || '')); } });
add({ tr: 'TR-PB18-15', id: 'TC_APPLY_GATE_003', type: 'Boundary', pri: 'Medium', feat: 'S02', obj: '% hoàn thiện tính từ dữ liệu thật, không dùng con số cũ lưu sẵn', pre: 'SV_G có cột profile_completion_rate = 100 nhưng thiếu Kỹ năng.',
  act: 'Xóa kỹ năng, đặt profile_completion_rate = 100 trong DB; mở hồ sơ và ứng tuyển tin khác', data: 'skills = {}', exp: '/profile/me báo 91%, thiếu Kỹ năng; ứng tuyển trả 400.',
  run: async () => { sql(`UPDATE student_profiles SET skills='{}', profile_completion_rate=100 WHERE user_id=${ctx.SG.id};`); const me = await api('GET', '/profile/me', ctx.SG.token); const r = await apply(ctx.SG, ctx.JOB_OTHER); return check(me.j.data?.completion?.rate === 91 && me.j.data?.completion?.missing?.join() === 'Kỹ năng' && r.s === 400, '91%, thiếu Kỹ năng, 400', `% ${me.j.data?.completion?.rate}, apply ${r.s}`); } });

module.exports = { T };

// ---------------------------------------------------------------------------------------------------------------
if (require.main === module) (async () => {
  ctx.A = await login('admin.test@vlu.edu.vn', 'Jobnest@2026');
  ctx.SV1 = await register('S', 'sva'); ctx.SV2 = await register('S', 'svb'); ctx.SV3 = await register('S', 'svc');
  ctx.E1 = await register('E', 'ntda'); ctx.E2 = await register('E', 'ntdb');
  for (const sv of [ctx.SV1, ctx.SV2, ctx.SV3]) readyStudent(sv.id);
  readyEmployer(ctx.E1.id); readyEmployer(ctx.E2.id);
  ctx.JOB_PUBLIC = await approvedJob(ctx.E1, { t: 'Nhân viên phục vụ', qty: 2 });
  ctx.JOB_OTHER = await approvedJob(ctx.E2, { t: 'Tin của NTD_B' });
  ctx.JOB_EMPTY = await approvedJob(ctx.E1, { t: 'Tin chưa có ứng viên' });
  ctx.JOB_PENDING = (await api('POST', '/jobs', ctx.E1.token, jobBody({ t: 'Tin chờ duyệt' }))).j.data.id;
  ctx.APP1 = (await apply(ctx.SV1, ctx.JOB_PUBLIC)).j.data.id;
  ctx.APP2 = (await apply(ctx.SV2, ctx.JOB_PUBLIC)).j.data.id;

  try {
    for (const t of T) await tc(t.id, t.run);
  } finally {
    // Dọn dữ liệu thử của lần chạy này (tin trước, người dùng sau vì ràng buộc khóa ngoại)
    const cl = require('child_process').spawnSync('bash', [path.join(__dirname, 'new_features_cleanup.sh'), R], { encoding: 'utf8' });
    console.log('Dọn dữ liệu:', (cl.stdout || '').replace(/\s+/g, ' ').trim() || cl.stderr);
  }
  fs.writeFileSync(path.join(__dirname, 'new_features_results.json'), JSON.stringify({ run: R, at: new Date().toISOString(), results }, null, 2));
  const c = (s) => results.filter(r => r.status === s).length;
  console.log(`\nTỔNG: ${results.length} · PASS ${c('PASS')} · FAIL ${c('FAIL')}`);
})();
