// Xuất test case bổ sung (new_features.cjs) + kết quả chạy (new_features_results.json) ra Excel
// theo đúng bố cục CDTN2_TestCases.xlsx (giữ trang bìa gốc).
// node build_new_testcases.cjs <thư mục node_modules có exceljs>
const path = require('path');
const ExcelJS = require(path.join(process.argv[2], 'exceljs'));
const T = [...require('./new_features.cjs').T, ...require('./new_features_ui.cjs').T];
const apiRun = require('./new_features_results.json');
const uiRun = require('./new_features_ui_results.json');
const run = { at: apiRun.at, results: [...apiRun.results, ...uiRun.results] };
const { cov } = require('./coverage_map.cjs');

const SRC = path.join(__dirname, '..', 'CDTN2_TestCases.xlsx');
const OUT = path.join(__dirname, '..', process.env.OUT_NAME || 'CDTN2_TestCases_BoSung.xlsx');
const START_NO = 315; // tiếp nối 314 test case của file gốc
const HEAD_FILL = 'FFDCEFFC';
const thin = { style: 'thin', color: { argb: 'FF000000' } };
const box = { top: thin, bottom: thin, left: thin, right: thin };
const resultOf = Object.fromEntries(run.results.map(r => [r.id, r]));
const runDate = new Date(run.at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

const BUGS = [
  { id: 'BUG-NEW-01', sev: 'High', kind: 'Lỗi chức năng', tc: 'TC_PROBE_001', feat: 'E17 – Chọn ứng viên & tạo hợp đồng',
    desc: 'Nhà tuyển dụng vẫn chọn được đơn ứng tuyển mà sinh viên đã RÚT; hệ thống tạo hợp đồng và báo "được chấp nhận" cho sinh viên đã rút đơn.',
    steps: '1) SV nộp đơn vào tin đang mở. 2) SV rút đơn (trạng thái WITHDRAWN). 3) NTD gọi POST /api/jobs/:jobId/selections với ID đơn đã rút.',
    exp: 'Trả lỗi 4xx "Đơn đã được rút"; không tạo hợp đồng.', act: 'Trả 200, tạo 1 hợp đồng (work_assignments) cho đơn đã rút.',
    cause: '03_backend/src/modules/selections/selection.service.js:55–60 — _processApplicationSelections chỉ chặn trạng thái ACCEPTED và REJECTED, bỏ sót WITHDRAWN.',
    fix: 'Chỉ cho chọn đơn ở trạng thái PENDING / REVIEWING / SHORTLISTED; báo lỗi với mọi trạng thái khác (gồm WITHDRAWN).' },
  { id: 'BUG-NEW-02', sev: 'Medium', kind: 'Lỗi chức năng', tc: 'TC_PROBE_006', feat: 'G02 – Tìm kiếm & lọc việc làm',
    desc: 'API tìm việc trả lỗi 500 khi tham số phân trang không hợp lệ; không giới hạn số tin trả về khi limit rất lớn.',
    steps: 'Gọi GET /api/jobs?page=-1, /api/jobs?page=abc, /api/jobs?limit=abc (khách, không cần đăng nhập).',
    exp: 'Trả 200 với trang mặc định (hoặc 400); limit bị giới hạn (tối đa 500 — trang Tìm việc tải 500 tin để lọc phía trình duyệt).', act: '500 "OFFSET must not be negative" / "invalid input syntax for type bigint: NaN". limit=100000 trả 200 không giới hạn.',
    cause: '03_backend/src/modules/jobs/job.routes.js:14–15 — page/limit đưa thẳng vào parseInt rồi vào câu SQL, không kiểm tra số âm/NaN, không chặn trần.',
    fix: 'page = max(1, số nguyên hợp lệ || 1); limit = min(500, max(1, số nguyên hợp lệ || 20)) trước khi tính offset.' },
  { id: 'BUG-NEW-05', sev: 'High', kind: 'Lỗi chức năng', tc: 'TC_VIOL_003', feat: 'H02 – Tự mở khóa khi hết hạn / A15 – Vi phạm 4 bậc',
    desc: 'Vi phạm lần 3 được thông báo là "tạm khóa 7 ngày" nhưng tài khoản không bao giờ tự mở — thực chất bị khóa vĩnh viễn cho tới khi Admin mở tay.',
    steps: '1) Admin ghi nhận 3 vi phạm cho 1 tài khoản. 2) Đặt hạn khóa về quá khứ (giả lập đã qua 7 ngày). 3) Người dùng đăng nhập.',
    exp: 'Đăng nhập thành công; trạng thái về ACTIVE.', act: '403 "Tài khoản của bạn đã bị khóa…"; trạng thái vẫn BANNED.',
    cause: '03_backend/src/modules/reports/admin.service.js:692–700 đặt status = BANNED cho bậc 3; middleware/auth.middleware.js:35 và auth.service.js:136 chỉ tự mở khóa trạng thái SUSPENDED.',
    fix: 'Bậc 3 đặt status = SUSPENDED (kèm suspension_expires_at 7 ngày); giữ BANNED cho bậc 4 và khóa thủ công.' },
  { id: 'BUG-NEW-06', sev: 'High', kind: 'Lỗi bảo mật', tc: 'TC_WEBHOOK_002', feat: 'H05 – Đồng bộ Twenty CRM (webhook)',
    desc: 'Webhook chấp nhận khóa API mặc định ghi cứng trong mã nguồn. Cấu hình Docker hiện tại không đặt khóa riêng nên bất kỳ ai đọc được repo đều tự đánh dấu doanh nghiệp bất kỳ là "Đã xác minh".',
    steps: 'POST /api/webhooks/twenty, header x-api-key: jobnest_twenty_secret_key_2026, body {event:"company.verified", data:{email:<email NTD>, verificationStatus:"VERIFIED"}}.',
    exp: '401 — chỉ khóa bí mật cấu hình riêng mới hợp lệ; trạng thái xác minh không đổi.', act: '200; doanh nghiệp chưa từng gửi giấy tờ chuyển sang VERIFIED (có huy hiệu trên trang công khai).',
    cause: '03_backend/src/modules/webhooks/webhook.routes.js:9 — dùng giá trị mặc định khi thiếu biến JOBNEST_SYNC_API_KEY / TWENTY_SYNC_API_KEY.',
    fix: 'Bỏ giá trị mặc định: thiếu biến môi trường thì tắt webhook; đặt khóa ngẫu nhiên đủ dài trong .env của máy chủ.' },
  { id: 'OBS-01', sev: 'Medium', kind: 'Rủi ro bảo mật (đọc code, chưa test)', tc: '—', feat: 'H02 – Chặn tài khoản bị khóa',
    desc: 'Khi truy vấn kiểm tra trạng thái tài khoản bị lỗi (DB chập chờn), middleware bỏ qua lỗi và cho request đi tiếp — tài khoản bị khóa có thể dùng tạm token cũ.',
    steps: 'Không tái hiện an toàn trên DB thật (cần làm hỏng kết nối DB).', exp: 'Lỗi kiểm tra → từ chối request (503).', act: 'Lỗi bị bỏ qua, request được xử lý tiếp.',
    cause: '03_backend/src/middleware/auth.middleware.js:47 — catch (dbErr) { } rỗng.', fix: 'Trả 503 khi không kiểm tra được trạng thái tài khoản.' },
  { id: 'BUG-NEW-03', sev: 'Medium', kind: 'Lỗi triển khai', tc: '— (phát hiện khi dựng DB thử)', feat: 'Cài đặt hệ thống',
    desc: 'Chạy migration trên CSDL trống bị dừng giữa chừng nên không dựng được DB mới bằng npm run migrate.',
    steps: 'Tạo PostgreSQL trống → cd 03_backend → npm run migrate.',
    exp: 'Tạo đủ toàn bộ bảng.', act: 'Dừng ở 006_normalize_work_type.sql: column "level" does not exist.',
    cause: '02_database/migrations/006_normalize_work_type.sql tham chiếu cột "level" chưa được migration nào trước đó tạo.',
    fix: 'Thêm "ADD COLUMN IF NOT EXISTS level" trước khi dùng, hoặc hướng dẫn máy mới nạp 02_database/jobnest_schema.sql.' },
  { id: 'BUG-NEW-04', sev: 'Low', kind: 'Lỗi triển khai', tc: '— (phát hiện khi dựng DB thử)', feat: 'Dữ liệu mẫu',
    desc: 'Nạp dữ liệu mẫu bị dừng ở seed 002_seed_proposals_notifications.sql.',
    steps: 'Sau khi có schema → npm run seed.', exp: 'Nạp đủ dữ liệu mẫu.',
    act: 'Lỗi khóa ngoại "proposals_student_id_fkey" trên bảng freelance_proposals.',
    cause: 'Seed tham chiếu ID sinh viên cố định chưa tồn tại trong DB mới.', fix: 'Lấy ID theo email bằng SELECT thay vì ID cố định.' },
  { id: 'GAP-01', sev: 'Low', kind: 'Chưa hoàn thiện', tc: '—', feat: 'G12 – Đăng nhập/đăng ký Google, Facebook, LinkedIn',
    desc: 'Nút đăng nhập/đăng ký mạng xã hội có trên giao diện nhưng chỉ hiện "Tính năng đang phát triển".',
    steps: 'Trang Đăng nhập → bấm "Google".', exp: 'Đăng nhập bằng Google (OAuth) hoặc không hiển thị nút.', act: 'Hiện trang "Đang phát triển".',
    cause: 'Chưa tích hợp OAuth (04_frontend/src/pages/guest/LoginPage.jsx, RegisterPage.jsx).', fix: 'Ẩn các nút khi demo/bàn giao hoặc tích hợp OAuth.' },
  { id: 'GAP-02', sev: 'Low', kind: 'Chưa hoàn thiện', tc: '—', feat: 'A15, A16 – Ghi nhận / xem lịch sử vi phạm',
    desc: 'API ghi nhận vi phạm 4 bậc và xem lịch sử vi phạm đã có nhưng trang Admin chưa có giao diện.',
    steps: 'Admin → Người dùng → tìm chức năng ghi nhận vi phạm.', exp: 'Có nút ghi nhận vi phạm và xem lịch sử.', act: 'Không có giao diện.',
    cause: 'POST/GET /api/admin/users/:id/violations chưa được gọi từ frontend.', fix: 'Thêm giao diện trong AdminUsersPage hoặc bỏ khỏi phạm vi bàn giao.' },
];

// Lỗi đã sửa (22/11/2026) và test case xác nhận sau khi sửa
const FIXED = {
  'BUG-NEW-01': 'Đã sửa — TC_PROBE_001 Passed',
  'BUG-NEW-02': 'Đã sửa — TC_PROBE_006, TC_PROBE_011 Passed',
  'BUG-NEW-05': 'Đã sửa — TC_VIOL_003, TC_VIOL_006 Passed',
  'BUG-NEW-06': 'Đã sửa — TC_WEBHOOK_001/002/003 Passed (cần đặt JOBNEST_SYNC_API_KEY trên máy chủ)',
};
const STEP1 = ['Chuẩn bị đúng các tài khoản, trạng thái đăng nhập, bản ghi và dịch vụ giả lập nêu trong Pre-conditions; làm sạch thay đổi của lần kiểm thử trước.', 'N/A', 'Môi trường thử và dữ liệu ban đầu sẵn sàng, không còn thay đổi từ ca thử trước.'];
const STEP2 = ['Mở trình duyệt hoặc công cụ API; điều hướng đến màn hình/endpoint của chức năng cần kiểm thử.', 'N/A', 'Đã xác định màn hình hoặc endpoint cần kiểm thử, sẵn sàng quan sát phản hồi hệ thống.'];
const STEP4 = ['Kiểm tra kết quả trên giao diện và API; tải lại hoặc đối chiếu DB/log/thông báo khi có dữ liệu liên quan.', 'N/A', 'Dữ liệu trong DB, thông báo và giao diện khớp kết quả mong đợi; không có thay đổi ngoài phạm vi ca kiểm thử.'];
const TYPE_LABEL = { Positive: 'Positive Case', Negative: 'Negative Case', Security: 'Security', Boundary: 'Boundary', UI: 'UI', Performance: 'Performance' };

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(SRC); // giữ nguyên Cover Page (logo, bố cục)
  const old = wb.getWorksheet('Test Cases');
  const widths = old.columns.map(c => c.width);
  wb.removeWorksheet(old.id);

  // ---------- Test Cases ----------
  const ws = wb.addWorksheet('Test Cases', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = widths.map(w => ({ width: w }));
  const head = ws.addRow(['No.', 'Test Requirement ID', 'Test Case ID', 'Test Objective', 'Pre-conditions', 'Step #', 'Step Action', 'Test Data', 'Expected Result', 'Notes']);
  head.height = 45;
  head.eachCell(c => { c.font = { bold: true, name: 'Times New Roman', size: 12 }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD_FILL } }; c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; c.border = box; });
  T.forEach((t, i) => {
    const no = START_NO + i;
    const steps = [STEP1, STEP2, [t.act, t.data, t.exp], STEP4];
    const first = ws.rowCount + 1;
    steps.forEach((s, k) => {
      const row = ws.addRow([no, t.tr, t.id, `[${t.type}] ${t.obj}`, t.pre, k + 1, s[0], s[1], s[2],
        k === 0 ? `${TYPE_LABEL[t.type] || t.type} | Priority: ${t.pri} | Nguồn: chức năng ${t.feat} (01_docs/10_JOBNEST_DanhSachChucNang.xlsx).` : '']);
      row.height = 43;
      row.eachCell({ includeEmpty: true }, (c, n) => {
        c.font = { name: 'Times New Roman', size: 12, bold: n === 1 || n === 6 };
        c.alignment = { vertical: 'middle', wrapText: true, horizontal: n === 1 || n === 6 ? 'center' : 'left' };
        c.border = box;
      });
    });
    for (const col of ['A', 'B', 'C', 'D', 'E', 'J']) ws.mergeCells(`${col}${first}:${col}${first + 3}`);
  });
  ws.autoFilter = { from: 'A1', to: `J${ws.rowCount}` };

  // ---------- Kết quả chạy ----------
  const rs = wb.addWorksheet('Kết quả chạy', { views: [{ state: 'frozen', ySplit: 4 }] });
  rs.columns = [{ width: 7 }, { width: 24 }, { width: 58 }, { width: 14 }, { width: 10 }, { width: 10 }, { width: 12 }, { width: 62 }];
  rs.mergeCells('A1:H1');
  rs.getCell('A1').value = 'KẾT QUẢ CHẠY TEST CASE BỔ SUNG (TỰ ĐỘNG – API/DB + GIAO DIỆN CHROME)';
  rs.getCell('A1').font = { bold: true, size: 14, name: 'Times New Roman' };
  rs.mergeCells('A2:H2');
  const c = (s) => run.results.filter(r => r.status === s).length;
  rs.getCell('A2').value = `Thời điểm chạy: ${runDate} · Môi trường: backend + frontend mã nguồn hiện tại (container tạm :5056, Vite :5174, Chrome headless) + PostgreSQL Docker jobnest-postgres · Tổng ${run.results.length}: Passed ${c('PASS')} · Failed ${c('FAIL')} · Script: 07_testing/automation/new_features.cjs, new_features_ui.cjs`;
  rs.getCell('A2').font = { italic: true, size: 11, name: 'Times New Roman' };
  rs.getCell('A2').alignment = { wrapText: true };
  rs.getRow(2).height = 32;
  const rh = rs.getRow(4);
  rh.values = ['No.', 'Test Case ID', 'Test Objective', 'Loại', 'Ưu tiên', 'Chức năng', 'Kết quả', 'Kết quả thực tế / Ghi chú'];
  rh.height = 30;
  rh.eachCell(x => { x.font = { bold: true, name: 'Times New Roman', size: 12 }; x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD_FILL } }; x.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; x.border = box; });
  T.forEach((t, i) => {
    const r = resultOf[t.id] || { status: 'NOT RUN', note: '' };
    const label = r.status === 'PASS' ? 'Passed' : r.status === 'FAIL' ? 'Failed' : 'Not Run';
    const bug = BUGS.find(b => b.tc === t.id);
    const row = rs.addRow([START_NO + i, t.id, `[${t.type}] ${t.obj}`, t.type, t.pri, t.feat, label, (r.note || '') + (bug ? ` → ${bug.id}` : '')]);
    row.eachCell({ includeEmpty: true }, (x, n) => { x.font = { name: 'Times New Roman', size: 12 }; x.border = box; x.alignment = { vertical: 'middle', wrapText: true, horizontal: [1, 4, 5, 6, 7].includes(n) ? 'center' : 'left' }; });
    const st = row.getCell(7);
    st.font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: label === 'Passed' ? 'FF15803D' : 'FFB91C1C' } };
    if (label !== 'Passed') st.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE2E2' } };
  });
  rs.autoFilter = { from: 'A4', to: `H${rs.rowCount}` };

  // ---------- Danh sách lỗi ----------
  const bs = wb.addWorksheet('Danh sách lỗi', { views: [{ state: 'frozen', ySplit: 3 }] });
  bs.columns = [{ width: 13 }, { width: 10 }, { width: 16 }, { width: 18 }, { width: 24 }, { width: 46 }, { width: 46 }, { width: 34 }, { width: 40 }, { width: 50 }, { width: 46 }, { width: 14 }];
  bs.mergeCells('A1:L1');
  bs.getCell('A1').value = `DANH SÁCH LỖI & ĐIỂM CHƯA HOÀN THIỆN (${BUGS.filter(b => b.id.startsWith('BUG')).length} lỗi, ${BUGS.filter(b => b.id.startsWith('OBS')).length} rủi ro đọc từ code, ${BUGS.filter(b => b.id.startsWith('GAP')).length} điểm chưa hoàn thiện)`;
  bs.getCell('A1').font = { bold: true, size: 14, name: 'Times New Roman' };
  const bh = bs.getRow(3);
  bh.values = ['Mã', 'Mức độ', 'Phân loại', 'Test Case', 'Chức năng', 'Mô tả', 'Bước tái hiện', 'Kết quả mong đợi', 'Kết quả thực tế', 'Nguyên nhân (vị trí code)', 'Đề xuất sửa', 'Trạng thái'];
  bh.height = 30;
  bh.eachCell(x => { x.font = { bold: true, name: 'Times New Roman', size: 12 }; x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD_FILL } }; x.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; x.border = box; });
  const SEV = { High: 'FFFDE2E2', Medium: 'FFFEF3C7', Low: 'FFF1F5F9' };
  BUGS.sort((a, b) => ['High', 'Medium', 'Low'].indexOf(a.sev) - ['High', 'Medium', 'Low'].indexOf(b.sev));
  for (const b of BUGS) {
    const row = bs.addRow([b.id, b.sev, b.kind, b.tc, b.feat, b.desc, b.steps, b.exp, b.act, b.cause, b.fix, FIXED[b.id] || 'Mở']);
    row.eachCell({ includeEmpty: true }, (x, n) => { x.font = { name: 'Times New Roman', size: 12, bold: n === 1 }; x.border = box; x.alignment = { vertical: 'top', wrapText: true, horizontal: [1, 2, 12].includes(n) ? 'center' : 'left' }; });
    row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SEV[b.sev] } };
  }

  // ---------- Tổng hợp ----------
  const sm = wb.addWorksheet('Tổng hợp');
  sm.columns = [{ width: 16 }, { width: 46 }, { width: 12 }, { width: 10 }, { width: 10 }];
  sm.mergeCells('A1:E1');
  sm.getCell('A1').value = 'TỔNG HỢP TEST CASE BỔ SUNG THEO NHÓM YÊU CẦU';
  sm.getCell('A1').font = { bold: true, size: 14, name: 'Times New Roman' };
  const sh = sm.getRow(3);
  sh.values = ['Requirement', 'Nhóm chức năng', 'Số TC', 'Passed', 'Failed'];
  sh.eachCell(x => { x.font = { bold: true, name: 'Times New Roman', size: 12 }; x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD_FILL } }; x.border = box; x.alignment = { horizontal: 'center' }; });
  const GROUPS = { PB40: 'Quản lý CV', PB41: 'Lịch rảnh & gợi ý việc làm', PB42: 'Lưu việc làm', PB43: 'Rút đơn ứng tuyển', PB44: 'Chọn ứng viên & tạo hợp đồng',
    PB45: 'Tiến độ & sản phẩm bàn giao', PB46: 'Trạng thái hợp đồng', PB47: 'Đánh giá hai chiều (bổ sung)', PB48: 'Đánh giá doanh nghiệp / công việc, phản hồi, báo cáo',
    PB49: 'Hồ sơ doanh nghiệp công khai & người đại diện', PB50: 'Gửi & duyệt xác minh doanh nghiệp', PB51: 'Đổi mật khẩu', PB52: 'Ảnh đại diện', PB53: 'Trung tâm thông báo',
    PB54: 'Báo cáo vi phạm & xử lý', PB55: 'Khóa tài khoản & khiếu nại', PB56: 'Hỗ trợ liên hệ', PB57: 'Thông báo việc cần Admin xử lý', PB58: 'Thống kê, sitemap, ca làm, tin liên quan',
    PB59: 'Dò lỗi: trạng thái sai, truy cập chéo, tham số bất thường', PB60: 'Lịch sử ứng tuyển & công việc của tôi', PB61: 'Quản lý đánh giá của tôi & kiểm duyệt đánh giá',
    PB62: 'Danh sách tin NTD, tổng quan đánh giá, giới thiệu & chính sách, ảnh', PB63: 'Vi phạm 4 bậc, tự mở khóa, khiếu nại khi đăng nhập', PB64: 'Tích hợp Twenty CRM (webhook)',
    PB65: 'Giao diện: trang chủ, giới thiệu, dashboard, cài đặt, xuất Excel, điều hướng thông báo' };
  for (const [pb, name] of Object.entries(GROUPS)) {
    const ts = T.filter(t => t.tr.includes(`-${pb}-`));
    const p = ts.filter(t => resultOf[t.id]?.status === 'PASS').length;
    const row = sm.addRow([`TR-${pb}`, name, ts.length, p, ts.length - p]);
    row.eachCell({ includeEmpty: true }, (x, n) => { x.font = { name: 'Times New Roman', size: 12, bold: n === 5 && ts.length - p > 0, color: n === 5 && ts.length - p > 0 ? { argb: 'FFB91C1C' } : undefined }; x.border = box; x.alignment = { horizontal: n === 2 ? 'left' : 'center' }; });
  }
  const tot = sm.addRow(['TỔNG', '', T.length, c('PASS'), c('FAIL')]);
  tot.eachCell({ includeEmpty: true }, x => { x.font = { bold: true, name: 'Times New Roman', size: 12 }; x.border = box; x.alignment = { horizontal: 'center' }; });

  // ---------- Ma trận phủ ----------
  const FEAT_NAMES = require('./feature_names.json');
  const mx = wb.addWorksheet('Ma trận phủ', { views: [{ state: 'frozen', ySplit: 3 }] });
  mx.columns = [{ width: 9 }, { width: 50 }, { width: 11 }, { width: 11 }, { width: 90 }];
  mx.mergeCells('A1:E1');
  mx.getCell('A1').value = 'MA TRẬN PHỦ: MỖI CHỨC NĂNG (01_docs/10_JOBNEST_DanhSachChucNang) ↔ TEST CASE (file gốc + file bổ sung)';
  mx.getCell('A1').font = { bold: true, size: 14, name: 'Times New Roman' };
  const mh = mx.getRow(3);
  mh.values = ['Mã CN', 'Chức năng', 'TC file gốc', 'TC bổ sung', 'Danh sách test case'];
  mh.eachCell(x => { x.font = { bold: true, name: 'Times New Roman', size: 12 }; x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD_FILL } }; x.border = box; x.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; });
  const newIds = new Set(T.map(t => t.id));
  for (const [code, name] of Object.entries(FEAT_NAMES)) {
    const ids = cov[code] || [];
    const nNew = ids.filter(i => newIds.has(i)).length;
    const row = mx.addRow([code, name, ids.length - nNew, nNew, ids.join(', ')]);
    row.eachCell({ includeEmpty: true }, (x, n) => { x.font = { name: 'Times New Roman', size: 11, bold: n === 1 }; x.border = box; x.alignment = { vertical: 'top', wrapText: true, horizontal: [1, 3, 4].includes(n) ? 'center' : 'left' }; });
    if (!ids.length) row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE2E2' } };
  }

  // Cover: ghi rõ đây là file bổ sung
  const cover = wb.getWorksheet('Cover Page');
  cover.getCell('A2').value = 'TestCase (Bổ sung)';
  wb.views = [{ activeTab: 0 }];
  await wb.xlsx.writeFile(OUT);
  console.log('OK', OUT, 'TC', T.length, 'rows', ws.rowCount, 'pass', c('PASS'), 'fail', c('FAIL'));
})();
