/**
 * Quy tắc: sinh viên chỉ ứng tuyển khi hồ sơ hoàn thiện 100%;
 * nhà tuyển dụng chỉ đăng tin khi hồ sơ doanh nghiệp hoàn thiện 100% VÀ đã được Admin xác minh.
 * Tự tạo tài khoản tạm và xóa sau khi chạy.
 */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const db = require('../../src/config/db');
const app = require('../../src/app');
const { makeStudentReady, makeEmployerReady } = require('../helpers/ready-profiles');

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
        [`${key}.${stamp}@profile-gate.test`, `Test ${key}`, role]
    );
    users[key] = r.rows[0];
    if (role === 'EMPLOYER') {
        await db.query(`INSERT INTO employer_profiles (user_id, display_name, company_name, account_type, office_images, verification_status)
                        VALUES ($1, $2, $3, 'Doanh nghiệp / Công ty', '[]'::jsonb, 'UNVERIFIED')`, [r.rows[0].id, `Công ty ${key}`, `Công ty TNHH ${key}`]);
    } else {
        await db.query('INSERT INTO student_profiles (user_id, full_name) VALUES ($1, $2)', [r.rows[0].id, `Test ${key}`]);
    }
}
const jobBody = () => ({
    title: `Phục vụ quán cà phê ${stamp}`, description: 'Phục vụ khách, dọn bàn, ca tối.', category: 'Dịch vụ', location: 'TP. Hồ Chí Minh',
    salary_type: 'HOURLY', salary: 30000, work_type: 'PART_TIME', application_deadline: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
});

describe('Hồ sơ phải hoàn thiện 100% mới được ứng tuyển / đăng tin', () => {
    before(async () => {
        await createUser('emp', 'EMPLOYER');
        await createUser('student', 'STUDENT');
        await createUser('admin', 'ADMIN');
        await new Promise((resolve) => { server = app.listen(0, resolve); });
        base = `http://127.0.0.1:${server.address().port}/api`;
    });
    after(async () => {
        const ids = Object.values(users).map(u => u.id);
        await db.query(`DELETE FROM notifications WHERE type = 'ADMIN_TASK' AND target_type = 'JOB' AND target_id IN (SELECT id FROM jobs WHERE employer_id = ANY($1::int[]))`, [ids]);
        await db.query('DELETE FROM jobs WHERE employer_id = ANY($1::int[])', [ids]);
        await db.query('DELETE FROM users WHERE id = ANY($1::int[])', [ids]);
        await new Promise((resolve) => server.close(resolve));
        await db.pool.end();
    });

    test('NTD hồ sơ trống → không đăng tin được (403), báo 0% và đủ 11 mục còn thiếu', async () => {
        const me = await call('GET', '/profile/me', 'emp');
        assert.deepEqual([me.body.data.posting_readiness.complete, me.body.data.posting_readiness.rate, me.body.data.posting_readiness.missing.length], [false, 0, 11]);
        const r = await call('POST', '/jobs', 'emp', jobBody());
        assert.equal(r.status, 403);
        assert.equal(r.body.details.code, 'EMPLOYER_PROFILE_INCOMPLETE');
        assert.equal((await db.query('SELECT count(*)::int AS n FROM jobs WHERE employer_id = $1', [users.emp.id])).rows[0].n, 0);
    });

    test('NTD đủ 10 mục nhưng chưa được Admin xác minh → vẫn không đăng tin được', async () => {
        await makeEmployerReady(db, users.emp.id);
        await db.query(`UPDATE employer_profiles SET verification_status = 'PENDING' WHERE user_id = $1`, [users.emp.id]);
        const r = await call('POST', '/jobs', 'emp', jobBody());
        assert.equal(r.status, 403);
        assert.deepEqual(r.body.details.missing, ['Xác minh doanh nghiệp (Admin đã duyệt)']);
        assert.equal(r.body.details.rate, 91);
    });

    test('NTD đủ 100% và đã xác minh → đăng tin được', async () => {
        await db.query(`UPDATE employer_profiles SET verification_status = 'VERIFIED' WHERE user_id = $1`, [users.emp.id]);
        const me = await call('GET', '/profile/me', 'emp');
        assert.equal(me.body.data.posting_readiness.complete, true);
        const r = await call('POST', '/jobs', 'emp', jobBody());
        assert.equal(r.status, 201, JSON.stringify(r.body));
        users.job = r.body.data.id;
        await db.query(`UPDATE jobs SET moderation_status = 'APPROVED' WHERE id = $1`, [users.job]);
    });

    test('NTD bị thiếu 1 ảnh thư viện (2/3) → bị chặn lại', async () => {
        await db.query(`UPDATE employer_profiles SET office_images = '["/api/files/1", "/api/files/2"]'::jsonb WHERE user_id = $1`, [users.emp.id]);
        const r = await call('POST', '/jobs', 'emp', jobBody());
        assert.equal(r.status, 403);
        assert.deepEqual(r.body.details.missing, ['Ít nhất 3 ảnh thư viện']);
        await makeEmployerReady(db, users.emp.id);
    });

    test('SV hồ sơ chưa đủ → không ứng tuyển được (400), /profile/me trả đúng % và mục thiếu', async () => {
        await makeStudentReady(db, users.student.id);
        await db.query(`UPDATE student_profiles SET desired_position = NULL WHERE user_id = $1`, [users.student.id]);
        const me = await call('GET', '/profile/me', 'student');
        assert.deepEqual(me.body.data.completion, { rate: 91, missing: ['Vị trí mong muốn'], complete: false });
        const r = await call('POST', '/applications', 'student', { job_id: users.job, cover_letter: 'Em rảnh buổi tối.' });
        assert.equal(r.status, 400);
        assert.equal(r.body.details.code, 'PROFILE_INCOMPLETE');
        assert.match(r.body.message, /91%.*Vị trí mong muốn/);
    });

    test('SV hồ sơ 100% → ứng tuyển được', async () => {
        await db.query(`UPDATE student_profiles SET desired_position = 'Nhân viên phục vụ' WHERE user_id = $1`, [users.student.id]);
        const r = await call('POST', '/applications', 'student', { job_id: users.job, cover_letter: 'Em rảnh buổi tối.' });
        assert.equal(r.status, 201, JSON.stringify(r.body));
    });
});
