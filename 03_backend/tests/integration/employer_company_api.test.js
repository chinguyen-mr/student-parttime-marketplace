/**
 * Kiểm thử API Hồ sơ doanh nghiệp / Người đại diện / Xác minh pháp lý (cần PostgreSQL đã chạy migration 017).
 * Tự tạo tài khoản tạm và xóa sau khi chạy — không đụng tới dữ liệu có sẵn.
 */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const db = require('../../src/config/db');
const app = require('../../src/app');

// PNG 1×1 hợp lệ và PDF tối thiểu (đúng magic bytes)
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const PDF = `data:application/pdf;base64,${Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF').toString('base64')}`;
const FAKE_PDF = `data:application/pdf;base64,${Buffer.from('<html>not a pdf</html>').toString('base64')}`;

const stamp = Date.now();
const users = {};
let server;
let base;

const tokenOf = (u) => jwt.sign({ id: u.id, role: u.role, email: u.email }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production', { expiresIn: '1h' });

async function call(method, path, who, body) {
    const res = await fetch(`${base}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...(who ? { Authorization: `Bearer ${tokenOf(users[who])}` } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const type = res.headers.get('content-type') || '';
    return { status: res.status, headers: res.headers, body: type.includes('json') ? await res.json() : await res.arrayBuffer() };
}

async function createUser(key, role, phone = null) {
    const r = await db.query(
        `INSERT INTO users (email, password_hash, full_name, role, status, phone)
         VALUES ($1, 'x', $2, $3, 'ACTIVE', $4) RETURNING id, email, role`,
        [`${key}.${stamp}@restructure.test`, `Test ${key}`, role, phone]
    );
    users[key] = r.rows[0];
    if (role === 'EMPLOYER') {
        await db.query(
            `INSERT INTO employer_profiles (user_id, display_name, company_name, account_type, office_images, verification_status)
             VALUES ($1, $2, $3, 'Doanh nghiệp / Công ty', '[]'::jsonb, 'UNVERIFIED')`,
            [r.rows[0].id, `Công ty ${key}`, `Công ty TNHH ${key}`]
        );
    }
}

describe('API Hồ sơ doanh nghiệp & Người đại diện', () => {
    before(async () => {
        await createUser('empA', 'EMPLOYER', `09${String(stamp).slice(-8)}`);
        await createUser('empB', 'EMPLOYER');
        await createUser('student', 'STUDENT');
        await createUser('admin', 'ADMIN');
        await new Promise((resolve) => { server = app.listen(0, resolve); });
        base = `http://127.0.0.1:${server.address().port}/api`;
    });

    after(async () => {
        const ids = Object.values(users).map(u => u.id);
        await db.query('DELETE FROM admin_logs WHERE admin_id = ANY($1::int[])', [ids]);
        await db.query('DELETE FROM users WHERE id = ANY($1::int[])', [ids]); // CASCADE: hồ sơ, file, thông báo, lịch sử
        await new Promise((resolve) => server.close(resolve));
        await db.pool.end();
    });

    test('PUT /profile/me không cho tự đặt trạng thái xác minh, ảnh; không ghi đè dữ liệu không gửi lên', async () => {
        await db.query(`UPDATE employer_profiles SET office_images = '["/api/files/1"]'::jsonb WHERE user_id = $1`, [users.empA.id]);
        const r = await call('PUT', '/profile/me', 'empA', { bio: 'Giới thiệu mới', verification_status: 'VERIFIED', avatar_url: 'https://evil.example/x.png', office_images: [] });
        assert.equal(r.status, 200);
        const row = (await db.query('SELECT * FROM employer_profiles WHERE user_id = $1', [users.empA.id])).rows[0];
        assert.equal(row.verification_status, 'UNVERIFIED');
        assert.equal(row.avatar_url, null);
        assert.deepEqual(row.office_images, ['/api/files/1']);
        assert.equal(row.display_name, 'Công ty empA', 'tên hiển thị không bị thay bằng tên tài khoản');
        assert.equal(row.company_name, 'Công ty TNHH empA', 'tên pháp nhân không bị ghi đè');
        assert.equal(row.bio, 'Giới thiệu mới');
        await db.query(`UPDATE employer_profiles SET office_images = '[]'::jsonb WHERE user_id = $1`, [users.empA.id]);
    });

    test('Người đại diện: lưu + ghi lịch sử; sinh viên bị chặn; dữ liệu sai báo 400', async () => {
        const ok = await call('PUT', '/profile/me/representative', 'empA', { representative_name: 'Nguyễn Văn A', representative_title: 'Trưởng phòng nhân sự' });
        assert.equal(ok.status, 200);
        assert.equal((await call('PUT', '/profile/me/representative', 'empA', { representative_name: 'A' })).status, 400);
        assert.equal((await call('PUT', '/profile/me/representative', 'student', { representative_name: 'Nguyễn Văn A' })).status, 403);
        const log = await db.query(`SELECT changes FROM employer_profile_changes WHERE employer_id = $1 AND section = 'REPRESENTATIVE'`, [users.empA.id]);
        assert.equal(log.rows[0].changes.representative_name.to, 'Nguyễn Văn A');
        // Không lộ ra trang công khai
        const pub = await call('GET', `/profile/${users.empA.id}`, null);
        assert.ok(!JSON.stringify(pub.body).includes('Nguyễn Văn A'));
    });

    test('Hồ sơ doanh nghiệp: thông tin chung, chi nhánh, chính sách → trang công khai', async () => {
        const r = await call('PUT', '/profile/me/employer-public', 'empA', {
            display_name: 'ABC Coffee', bio: 'Chuỗi cà phê', website: 'https://abc.vn', detailed_address: '1 Lê Lợi, Quận 1',
            internal_culture: 'Sinh nhật hằng tháng',
            hr_policy_details: { internship: 'Thực tập có lương', part_time: 'Ca 4 tiếng', bogus: 'x' },
            branches: [
                { name: 'CN Thủ Đức', address: '1 Võ Văn Ngân', phone: '0901 234 567', is_active: true },
                { name: 'CN tạm đóng', address: '2 Lê Lợi', is_active: false },
            ],
        });
        assert.equal(r.status, 200, JSON.stringify(r.body));
        const pub = (await call('GET', `/profile/${users.empA.id}`, null)).body.data;
        assert.equal(pub.display_name, 'ABC Coffee');
        assert.equal(pub.internal_culture, 'Sinh nhật hằng tháng');
        assert.deepEqual(pub.hr_policy_details, { internship: 'Thực tập có lương', part_time: 'Ca 4 tiếng' });
        assert.deepEqual(pub.branches.map(b => b.name), ['CN Thủ Đức']);
        assert.equal(pub.branches[0].phone, '0901234567');
        for (const k of ['tax_code', 'representative_name', 'verification_note', 'email', 'phone']) assert.ok(!(k in pub), k);
        // Chỉ ghi trường có gửi: brand_name không bị xóa khi không gửi
        await call('PUT', '/profile/me/employer-public', 'empA', { brand_name: 'ABC' });
        await call('PUT', '/profile/me/employer-public', 'empA', { bio: 'Chuỗi cà phê sinh viên' });
        assert.equal((await call('GET', `/profile/${users.empA.id}`, null)).body.data.brand_name, 'ABC');
        const bad = await call('PUT', '/profile/me/employer-public', 'empA', { branches: [{ name: 'Thiếu địa chỉ' }] });
        assert.equal(bad.status, 400);
        const log = await db.query(`SELECT changes FROM employer_profile_changes WHERE employer_id = $1 AND section = 'COMPANY' ORDER BY id`, [users.empA.id]);
        assert.ok(log.rows[0].changes.display_name);
        assert.deepEqual(log.rows[0].changes.bio, { updated: true });
    });

    test('Thư viện ảnh: thêm, đổi thứ tự (kiểm tra hoán vị), không xóa được ảnh của doanh nghiệp khác', async () => {
        const a = (await call('POST', '/files/office-images', 'empA', { image: PNG })).body.data.office_images;
        const b = (await call('POST', '/files/office-images', 'empA', { image: PNG })).body.data.office_images;
        assert.equal(b.length, 2);
        const reordered = await call('PUT', '/files/office-images/order', 'empA', { order: [b[1], a[0]] });
        assert.deepEqual(reordered.body.data.office_images, [b[1], a[0]]);
        assert.equal((await call('PUT', '/files/office-images/order', 'empA', { order: [b[1]] })).status, 400);
        assert.equal((await call('PUT', '/files/office-images/order', 'empA', { order: [b[1], '/api/files/999999'] })).status, 400);
        const otherId = b[1].split('/').pop();
        assert.equal((await call('DELETE', `/files/office-images/${otherId}`, 'empB')).status, 404);
    });

    test('Ảnh người đại diện: chỉ chính chủ xem được, không phát qua link công khai', async () => {
        const up = await call('PUT', '/files/representative-avatar', 'empA', { image: PNG });
        assert.equal(up.status, 200);
        const own = await call('GET', '/files/representative-avatar', 'empA');
        assert.equal(own.status, 200);
        assert.equal(own.headers.get('cache-control'), 'private, no-store');
        assert.equal((await call('GET', '/files/representative-avatar', 'empB')).status, 404);
        const fileId = (await db.query(`SELECT id FROM file_uploads WHERE owner_id = $1 AND kind = 'REP_AVATAR'`, [users.empA.id])).rows[0].id;
        assert.equal((await call('GET', `/files/${fileId}`, null)).status, 404);
    });

    test('Tài liệu pháp lý: kiểm tra định dạng thật, chỉ chính chủ + admin tải được', async () => {
        assert.equal((await call('POST', '/files/legal-documents', 'empA', { file: FAKE_PDF, name: 'gpkd.pdf' })).status, 400);
        assert.equal((await call('POST', '/files/legal-documents', 'student', { file: PDF, name: 'x.pdf' })).status, 403);
        const doc = await call('POST', '/files/legal-documents', 'empA', { file: PDF, name: '../../GPKD ABC.pdf' });
        assert.equal(doc.status, 201);
        assert.equal(doc.body.data.name, 'GPKD ABC.pdf');
        const id = doc.body.data.id;
        assert.equal((await call('GET', `/files/legal-documents/${id}`, 'empA')).status, 200);
        assert.equal((await call('GET', `/files/legal-documents/${id}`, 'admin')).status, 200);
        assert.equal((await call('GET', `/files/legal-documents/${id}`, 'empB')).status, 404);
        assert.equal((await call('GET', `/files/legal-documents/${id}`, null)).status, 401);
        assert.equal((await call('GET', `/files/${id}`, null)).status, 404, 'không phát qua link ảnh công khai');
        assert.equal((await call('DELETE', `/files/legal-documents/${id}`, 'empB')).status, 404);
    });

    test('Quy trình xác minh: gửi → khóa sửa → admin yêu cầu bổ sung → gửi lại → duyệt', async () => {
        // Thiếu MST → không gửi được
        assert.equal((await call('POST', '/profile/me/verification/submit', 'empA')).status, 400);
        assert.equal((await call('PUT', '/profile/me/verification', 'empA', { company_name: 'Công ty TNHH ABC', tax_code: '123' })).status, 400);
        const saved = await call('PUT', '/profile/me/verification', 'empA', { company_name: 'Công ty TNHH ABC', tax_code: '0312345678' });
        assert.equal(saved.status, 200);
        assert.equal(saved.body.data.status, 'UNVERIFIED');
        // B chưa có tài liệu → không gửi được
        await call('PUT', '/profile/me/verification', 'empB', { company_name: 'Công ty TNHH B', tax_code: '0312345679' });
        assert.match((await call('POST', '/profile/me/verification/submit', 'empB')).body.message, /tài liệu/);

        const sub = await call('POST', '/profile/me/verification/submit', 'empA');
        assert.equal(sub.status, 200);
        assert.equal(sub.body.data.status, 'PENDING');
        assert.equal(sub.body.data.editable, false);
        // Đang chờ duyệt: khóa sửa MST/tài liệu (cả qua PUT /me)
        assert.equal((await call('PUT', '/profile/me/verification', 'empA', { company_name: 'Khác', tax_code: '0312345670' })).status, 403);
        assert.equal((await call('POST', '/files/legal-documents', 'empA', { file: PDF, name: 'them.pdf' })).status, 403);
        await call('PUT', '/profile/me', 'empA', { tax_code: '9999999999', company_name: 'Đổi lén' });
        const locked = (await db.query('SELECT tax_code, company_name FROM employer_profiles WHERE user_id = $1', [users.empA.id])).rows[0];
        assert.deepEqual(locked, { tax_code: '0312345678', company_name: 'Công ty TNHH ABC' });
        assert.equal((await call('GET', `/profile/${users.empA.id}`, null)).body.data.verification.legal_status, 'PENDING');

        // Chỉ admin được duyệt; lý do bắt buộc khi không duyệt
        assert.equal((await call('PATCH', `/admin/employer-verifications/${users.empA.id}`, 'empA', { status: 'VERIFIED' })).status, 403);
        assert.equal((await call('PATCH', `/admin/employer-verifications/${users.empA.id}`, 'admin', { status: 'NEEDS_INFO' })).status, 400);
        const list = await call('GET', '/admin/employer-verifications?status=PENDING', 'admin');
        assert.ok(list.body.data.some(r => r.user_id === users.empA.id && r.document_count === 1));
        const need = await call('PATCH', `/admin/employer-verifications/${users.empA.id}`, 'admin', { status: 'NEEDS_INFO', note: 'Ảnh giấy phép bị mờ' });
        assert.equal(need.status, 200);
        const mine = (await call('GET', '/profile/me/verification', 'empA')).body.data;
        assert.equal(mine.status, 'NEEDS_INFO');
        assert.equal(mine.note, 'Ảnh giấy phép bị mờ');
        assert.equal(mine.editable, true);
        const notif = await db.query(`SELECT title FROM notifications WHERE user_id = $1 AND type = 'VERIFICATION'`, [users.empA.id]);
        assert.equal(notif.rowCount, 1);
        // Trạng thái nội bộ không lộ ra ngoài
        const pubNeed = (await call('GET', `/profile/${users.empA.id}`, null)).body.data;
        assert.equal(pubNeed.verification.legal_status, 'UNVERIFIED');
        assert.ok(!JSON.stringify(pubNeed).includes('bị mờ'));

        assert.equal((await call('POST', '/profile/me/verification/submit', 'empA')).body.data.status, 'PENDING');
        // Không duyệt lại được hồ sơ chưa ở trạng thái chờ
        assert.equal((await call('PATCH', `/admin/employer-verifications/${users.empB.id}`, 'admin', { status: 'VERIFIED' })).status, 400);
        assert.equal((await call('PATCH', `/admin/employer-verifications/${users.empA.id}`, 'admin', { status: 'VERIFIED' })).status, 200);
        const pub = (await call('GET', `/profile/${users.empA.id}`, null)).body.data;
        assert.equal(pub.verification.legal, true);
        const history = await call('GET', `/admin/employers/${users.empA.id}/profile-changes`, 'admin');
        assert.ok(history.body.data.some(h => h.section === 'VERIFICATION_REVIEW' && h.changes.verification_status.to === 'VERIFIED'));
        assert.equal((await call('GET', `/admin/employers/${users.empA.id}/profile-changes`, 'empA')).status, 403);
    });

    test('Email/SĐT đăng nhập không đổi được qua API hồ sơ', async () => {
        const before = (await db.query('SELECT email, phone FROM users WHERE id = $1', [users.empA.id])).rows[0];
        await call('PUT', '/profile/me', 'empA', { email: 'hijack@evil.test', phone: '0900000000' });
        await call('PUT', '/profile/me/representative', 'empA', { representative_name: 'Nguyễn Văn A', email: 'hijack@evil.test', phone: '0900000000' });
        const after = (await db.query('SELECT email, phone FROM users WHERE id = $1', [users.empA.id])).rows[0];
        assert.deepEqual(after, before);
    });
});
