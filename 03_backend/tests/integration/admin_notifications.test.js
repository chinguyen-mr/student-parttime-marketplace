/**
 * Luồng "việc cần Admin xử lý" → thông báo ADMIN_TASK cho mọi Admin, và kết quả xử lý báo cáo → người liên quan.
 * Tự tạo tài khoản tạm và xóa sau khi chạy — không đụng tới dữ liệu có sẵn.
 */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const db = require('../../src/config/db');
const app = require('../../src/app');
const adminService = require('../../src/modules/reports/admin.service');
const { makeEmployerReady } = require('../helpers/ready-profiles');

const PDF = `data:application/pdf;base64,${Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF').toString('base64')}`;
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
    return { status: res.status, body: await res.json().catch(() => ({})) };
}
async function createUser(key, role) {
    const r = await db.query(
        `INSERT INTO users (email, password_hash, full_name, role, status) VALUES ($1, 'x', $2, $3, 'ACTIVE') RETURNING id, email, role`,
        [`${key}.${stamp}@admin-notify.test`, `Test ${key}`, role]
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
const adminTasks = (targetType, targetId) => db.query(
    `SELECT user_id FROM notifications WHERE user_id = $1 AND type = 'ADMIN_TASK' AND target_type = $2 AND target_id = $3`,
    [users.admin.id, targetType, targetId]
);
const inbox = (who, type) => db.query(`SELECT title, body, target_type, target_id FROM notifications WHERE user_id = $1 AND type = $2`, [users[who].id, type]);

describe('Thông báo cho Admin & kết quả xử lý báo cáo', () => {
    before(async () => {
        await createUser('admin', 'ADMIN');
        await createUser('emp', 'EMPLOYER');
        await createUser('student', 'STUDENT');
        await createUser('student2', 'STUDENT');
        await makeEmployerReady(db, users.emp.id); // hồ sơ 100% + đã xác minh → được đăng tin
        await new Promise((resolve) => { server = app.listen(0, resolve); });
        base = `http://127.0.0.1:${server.address().port}/api`;
    });

    after(async () => {
        const ids = Object.values(users).map(u => u.id);
        // Thông báo ADMIN_TASK gửi tới mọi Admin (kể cả Admin thật) trỏ tới dữ liệu thử → xóa trước khi xóa dữ liệu
        await db.query(
            `DELETE FROM notifications WHERE type = 'ADMIN_TASK' AND (
                (target_type = 'REPORT' AND target_id IN (SELECT id FROM reports WHERE reporter_id = ANY($1::int[])))
             OR (target_type = 'USER_APPEAL' AND target_id IN (SELECT id FROM user_appeals WHERE user_id = ANY($1::int[])))
             OR (target_type = 'JOB' AND target_id IN (SELECT id FROM jobs WHERE employer_id = ANY($1::int[])))
             OR (target_type = 'EMPLOYER_VERIFICATION' AND target_id = ANY($1::int[])))`,
            [ids]
        );
        await db.query('DELETE FROM report_actions WHERE admin_id = ANY($1::int[])', [ids]);
        await db.query('DELETE FROM reports WHERE reporter_id = ANY($1::int[])', [ids]);
        await db.query('DELETE FROM user_appeals WHERE user_id = ANY($1::int[])', [ids]);
        await db.query('DELETE FROM jobs WHERE employer_id = ANY($1::int[])', [ids]);
        await db.query('DELETE FROM admin_logs WHERE admin_id = ANY($1::int[]) OR target_id = ANY($1::int[])', [ids]);
        await db.query(`DELETE FROM notifications WHERE type = 'ADMIN_TASK' AND body LIKE '%' || $1 || '%'`, [String(stamp)]);
        await db.query('DELETE FROM users WHERE id = ANY($1::int[])', [ids]);
        await new Promise((resolve) => server.close(resolve));
        await db.pool.end();
    });

    test('Đăng tin & sửa tin → Admin nhận việc "chờ duyệt" trỏ tới đúng tin', async () => {
        const deadline = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
        const created = await call('POST', '/jobs', 'emp', {
            title: `Phục vụ quán cà phê ${stamp}`, description: 'Phục vụ khách, dọn bàn, ca tối.', category: 'Dịch vụ',
            location: 'TP. Hồ Chí Minh', salary_type: 'HOURLY', salary: 30000, work_type: 'PART_TIME', application_deadline: deadline,
        });
        assert.equal(created.status, 201, JSON.stringify(created.body));
        const jobId = created.body.data.id;
        assert.equal((await adminTasks('JOB', jobId)).rowCount, 1);

        const edited = await call('PUT', `/jobs/${jobId}`, 'emp', {
            title: `Phục vụ quán cà phê ${stamp} (sửa)`, description: 'Phục vụ khách, dọn bàn, ca tối.', category: 'Dịch vụ',
            location: 'TP. Hồ Chí Minh', salary_type: 'HOURLY', salary: 32000, work_type: 'PART_TIME', application_deadline: deadline,
        });
        assert.equal(edited.status, 200, JSON.stringify(edited.body));
        assert.equal((await adminTasks('JOB', jobId)).rowCount, 2, 'mỗi lần sửa nội dung phải báo Admin duyệt lại');
        users.job = { id: jobId };
    });

    test('Gửi hồ sơ xác minh doanh nghiệp → Admin nhận việc trỏ tới doanh nghiệp', async () => {
        await db.query(`UPDATE employer_profiles SET verification_status = 'UNVERIFIED' WHERE user_id = $1`, [users.emp.id]);
        assert.equal((await call('PUT', '/profile/me/verification', 'emp', { company_name: 'Công ty TNHH Thông Báo', tax_code: '0312345678' })).status, 200);
        assert.equal((await call('POST', '/files/legal-documents', 'emp', { file: PDF, name: 'gpkd.pdf' })).status, 201);
        assert.equal((await call('POST', '/profile/me/verification/submit', 'emp')).status, 200);
        assert.equal((await adminTasks('EMPLOYER_VERIFICATION', users.emp.id)).rowCount, 1);
    });

    test('Báo cáo vi phạm → Admin nhận việc; Cảnh cáo → người bị báo cáo & người báo cáo đều được báo', async () => {
        const rep = await call('POST', '/reports', 'student', { target_type: 'JOB', target_id: users.job.id, reason: `Thông tin sai sự thật ${stamp}` });
        assert.equal(rep.status, 201);
        assert.equal((await adminTasks('REPORT', rep.body.data.id)).rowCount, 1);

        await adminService.resolveReport(rep.body.data.id, { action: 'WARNING', note: 'Mô tả lương không đúng thực tế' }, users.admin.id);
        const warn = await inbox('emp', 'VIOLATION_NOTICE');
        assert.equal(warn.rowCount, 1);
        assert.match(warn.rows[0].body, /Mô tả lương không đúng thực tế/);
        assert.deepEqual([warn.rows[0].target_type, warn.rows[0].target_id], ['JOB', users.job.id]);
        const done = await inbox('student', 'REPORT_RESOLVED');
        assert.equal(done.rowCount, 1);
        assert.match(done.rows[0].body, /xác nhận và xử lý/);
        await assert.rejects(adminService.resolveReport(rep.body.data.id, { action: 'DISMISS' }, users.admin.id), err => err.statusCode === 409);
    });

    test('Khóa qua báo cáo dùng luồng khóa chuẩn: lưu lý do + báo người bị khóa; không tự khóa chính mình', async () => {
        const self = await db.query(
            `INSERT INTO reports (reporter_id, target_type, target_id, reason, status) VALUES ($1, 'USER', $2, 'Thử tự khóa', 'PENDING') RETURNING id`,
            [users.student.id, users.admin.id]
        );
        await assert.rejects(adminService.resolveReport(self.rows[0].id, { action: 'BAN_USER' }, users.admin.id), err => err.statusCode === 400);
        assert.equal((await db.query('SELECT status FROM reports WHERE id = $1', [self.rows[0].id])).rows[0].status, 'PENDING', 'lỗi → báo cáo vẫn mở');

        const rep = await call('POST', '/reports', 'student', { target_type: 'USER', target_id: users.student2.id, reason: 'Quấy rối nhà tuyển dụng' });
        assert.equal(rep.status, 201);
        await adminService.resolveReport(rep.body.data.id, { action: 'BAN_USER', note: 'Đã xác minh tin nhắn quấy rối' }, users.admin.id);
        const u = (await db.query('SELECT status, suspension_reason FROM users WHERE id = $1', [users.student2.id])).rows[0];
        assert.equal(u.status, 'BANNED');
        assert.match(u.suspension_reason, /Đã xác minh tin nhắn quấy rối/);
        assert.equal((await inbox('student2', 'ACCOUNT_BANNED')).rowCount, 1);
    });

    test('Khiếu nại tài khoản → Admin nhận việc; khiếu nại thứ 2 khi chưa có kết quả bị chặn', async () => {
        const first = await call('POST', '/profile/appeals', 'emp', { appeal_reason: 'Tôi đã sửa lại mô tả lương theo đúng thực tế.' });
        assert.equal(first.status, 201);
        assert.equal((await adminTasks('USER_APPEAL', first.body.data.id)).rowCount, 1);
        const second = await call('POST', '/profile/appeals', 'emp', { appeal_reason: 'Gửi lại lần nữa cho chắc chắn.' });
        assert.equal(second.status, 409);
        assert.equal((await call('POST', '/profile/appeals', 'student', { appeal_reason: '   ' })).status, 400);
    });
});
