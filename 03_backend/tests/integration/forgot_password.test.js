const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../../src/config/db');
const authService = require('../../src/modules/auth/auth.service');
const emailService = require('../../src/services/email.service');
const userRepository = require('../../src/database/repositories/user.repository');

const INVALID_CODE = /Mã xác nhận không đúng hoặc đã hết hạn/;

describe('PB-04 & PB-10: Kiểm thử toàn diện Module Quên và Đặt lại mật khẩu (OTP 6 số qua email)', () => {
    let studentUser = null;
    let employerUser = null;
    let tempUser = null;

    // Ghi trực tiếp một mã OTP cho tempUser (giả lập thư đã gửi)
    const insertCode = async (code, { expired = false, used = false } = {}) => {
        const hash = crypto.createHash('sha256').update(code).digest('hex');
        await db.query('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND used_at IS NULL', [tempUser.id]);
        await db.query(
            `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used_at)
             VALUES ($1, $2, $3, ${used ? 'CURRENT_TIMESTAMP' : 'NULL'})`,
            [tempUser.id, hash, new Date(Date.now() + (expired ? -5 : 15) * 60 * 1000)]
        );
    };

    before(async () => {
        studentUser = await userRepository.findByEmail('student.test@vlu.edu.vn');
        employerUser = await userRepository.findByEmail('employer.test@vlu.edu.vn');

        // Tài khoản tạm riêng để đổi mật khẩu không ảnh hưởng tài khoản chính
        const tempEmail = `test.reset.${Date.now()}@vlu.edu.vn`;
        const initialPasswordHash = await bcrypt.hash('InitialPass123', 10);
        const res = await db.query(
            `INSERT INTO users (email, password_hash, full_name, role, status)
             VALUES ($1, $2, 'Tài Khoản Test Reset Pass', 'STUDENT', 'ACTIVE')
             RETURNING *`,
            [tempEmail, initialPasswordHash]
        );
        tempUser = res.rows[0];
    });

    after(async () => {
        if (tempUser?.id) {
            await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [tempUser.id]);
            await db.query('DELETE FROM users WHERE id = $1', [tempUser.id]);
        }
        await db.pool.end();
    });

    test('1. Email hợp lệ -> Gửi mã 6 số, lưu bản băm trong CSDL', async () => {
        emailService.clearHistory();
        const res = await authService.forgotPassword(tempUser.email);
        assert.equal(res.success, true);
        assert.match(res.message, /Mã xác nhận/);

        const code = emailService.getLastDispatched().rawToken;
        assert.match(code, /^\d{6}$/);
        const tokenRow = await db.query(
            'SELECT * FROM password_reset_tokens WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
            [tempUser.id]
        );
        assert.equal(tokenRow.rows.length, 1);
        assert.equal(tokenRow.rows[0].used_at, null);
        assert.equal(tokenRow.rows[0].token_hash, crypto.createHash('sha256').update(code).digest('hex'));
        assert.ok(new Date(tokenRow.rows[0].expires_at) > new Date());
    });

    test('2. Email không tồn tại -> Báo không tìm thấy email (AC2), không sinh mã', async () => {
        await assert.rejects(
            () => authService.forgotPassword('nonexistent.user.jobnest@vlu.edu.vn'),
            { name: 'NotFoundError', message: /Không tìm thấy tài khoản/ }
        );
    });

    test('3. Sinh viên yêu cầu reset mật khẩu (PB-04) -> Hoạt động chính xác', async () => {
        if (studentUser) {
            const res = await authService.forgotPassword(studentUser.email);
            assert.equal(res.success, true);
            const check = await db.query('SELECT 1 FROM password_reset_tokens WHERE user_id = $1', [studentUser.id]);
            assert.ok(check.rows.length > 0);
        }
    });

    test('4. Nhà tuyển dụng yêu cầu reset mật khẩu (PB-10) -> Hoạt động chính xác', async () => {
        if (employerUser) {
            const res = await authService.forgotPassword(employerUser.email);
            assert.equal(res.success, true);
            const check = await db.query('SELECT 1 FROM password_reset_tokens WHERE user_id = $1', [employerUser.id]);
            assert.ok(check.rows.length > 0);
        }
    });

    test('5, 11, 12, 13. Mã hợp lệ -> Cập nhật mật khẩu, login pass mới thành công, pass cũ thất bại', async () => {
        await insertCode('123456');
        const newPassword = 'NewSecretPassword2026!';
        const resetRes = await authService.resetPassword({ email: tempUser.email, otp: '123456', new_password: newPassword });
        assert.equal(resetRes.success, true);
        assert.ok(resetRes.message.includes('thành công'));

        const loginNew = await authService.login({ email: tempUser.email, password: newPassword });
        assert.ok(loginNew.token);
        assert.equal(loginNew.user.email, tempUser.email);

        await assert.rejects(
            () => authService.login({ email: tempUser.email, password: 'InitialPass123' }),
            { name: 'UnauthorizedError', message: 'Email hoặc mật khẩu không chính xác' }
        );
    });

    test('6. Mã sai -> 400, mật khẩu giữ nguyên; thiếu mã -> 400 (không còn đặt lại chỉ bằng email)', async () => {
        await insertCode('654321');
        const before = (await db.query('SELECT password_hash FROM users WHERE id = $1', [tempUser.id])).rows[0].password_hash;
        await assert.rejects(
            () => authService.resetPassword({ email: tempUser.email, otp: '000000', new_password: 'ValidPassword123' }),
            { name: 'AppError', message: INVALID_CODE }
        );
        await assert.rejects(
            () => authService.resetPassword({ email: tempUser.email, new_password: 'ValidPassword123' }),
            { name: 'AppError', message: /email và mã xác nhận/ }
        );
        const after = (await db.query('SELECT password_hash FROM users WHERE id = $1', [tempUser.id])).rows[0].password_hash;
        assert.equal(after, before);
    });

    test('7. Mã đã hết hạn -> Ném lỗi AppError 400', async () => {
        await insertCode('111222', { expired: true });
        await assert.rejects(
            () => authService.resetPassword({ email: tempUser.email, otp: '111222', new_password: 'ValidPassword123' }),
            { name: 'AppError', message: INVALID_CODE }
        );
    });

    test('8, 9. Mã đã sử dụng -> Chặn không cho sử dụng lại lần thứ 2', async () => {
        await insertCode('333444');
        await authService.resetPassword({ email: tempUser.email, otp: '333444', new_password: 'AnotherPassword123' });
        await assert.rejects(
            () => authService.resetPassword({ email: tempUser.email, otp: '333444', new_password: 'AnotherPassword456' }),
            { name: 'AppError', message: INVALID_CODE }
        );
    });

    test('10. Mật khẩu mới dưới 8 ký tự -> Ném lỗi AppError 400', async () => {
        await assert.rejects(
            () => authService.resetPassword({ email: tempUser.email, otp: '123456', new_password: 'Abc1234' }),
            { name: 'AppError', message: 'Mật khẩu mới bắt buộc và phải có ít nhất 8 ký tự' }
        );
    });

    test('14. Concurrency Guard -> Hai request đồng thời chỉ có duy nhất 1 request thành công', async () => {
        await insertCode('555666');
        const p1 = authService.resetPassword({ email: tempUser.email, otp: '555666', new_password: 'ConcurrentPass1!' });
        const p2 = authService.resetPassword({ email: tempUser.email, otp: '555666', new_password: 'ConcurrentPass2!' });
        const results = await Promise.allSettled([p1, p2]);
        assert.equal(results.filter(r => r.status === 'fulfilled').length, 1, 'Chỉ 1 request thành công');
        assert.equal(results.filter(r => r.status === 'rejected').length, 1, 'Request thứ hai bị từ chối');
    });

    test('15. Yêu cầu mã mới -> Tự động vô hiệu hóa mã cũ chưa sử dụng', async () => {
        await authService.forgotPassword(tempUser.email);
        const code1 = emailService.getLastDispatched().rawToken;
        await authService.forgotPassword(tempUser.email);
        const code2 = emailService.getLastDispatched().rawToken;

        if (code1 !== code2) {
            await assert.rejects(
                () => authService.resetPassword({ email: tempUser.email, otp: code1, new_password: 'PasswordForToken1!' }),
                { name: 'AppError', message: INVALID_CODE }
            );
        }
        const okRes = await authService.resetPassword({ email: tempUser.email, otp: code2, new_password: 'PasswordForToken2!' });
        assert.equal(okRes.success, true);
    });

    test('16. Bảo mật thông tin -> Response không chứa token_hash hay password_hash', async () => {
        const forgotRes = await authService.forgotPassword(tempUser.email);
        assert.equal(forgotRes.password_hash, undefined);
        assert.equal(forgotRes.token_hash, undefined);

        const code = emailService.getLastDispatched().rawToken;
        const resetRes = await authService.resetPassword({ email: tempUser.email, otp: code, new_password: 'CleanSafePassword999!' });
        assert.equal(resetRes.password_hash, undefined);
        assert.equal(resetRes.token_hash, undefined);
    });

    test('17. Dò mã: sai 5 lần -> mã bị hủy, mã đúng cũng không dùng được nữa', async () => {
        await insertCode('777888');
        for (let i = 0; i < 4; i++) {
            await assert.rejects(() => authService.resetPassword({ email: tempUser.email, otp: '00000' + i, new_password: 'BruteForce123' }), { message: INVALID_CODE });
        }
        await assert.rejects(() => authService.resetPassword({ email: tempUser.email, otp: '000009', new_password: 'BruteForce123' }), { message: /quá nhiều lần/ });
        await assert.rejects(() => authService.resetPassword({ email: tempUser.email, otp: '777888', new_password: 'BruteForce123' }), { message: INVALID_CODE });
    });

    test('18. Đặt lại mật khẩu kết thúc các phiên đăng nhập cũ', async () => {
        await insertCode('246810');
        await authService.resetPassword({ email: tempUser.email, otp: '246810', new_password: 'SessionReset123' });
        const row = (await db.query('SELECT tokens_valid_after FROM users WHERE id = $1', [tempUser.id])).rows[0];
        assert.ok(row.tokens_valid_after, 'Phải ghi mốc thu hồi token');
    });
});
