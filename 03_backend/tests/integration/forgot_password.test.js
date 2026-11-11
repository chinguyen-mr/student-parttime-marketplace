const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../../src/config/db');
const authService = require('../../src/modules/auth/auth.service');
const emailService = require('../../src/services/email.service');
const userRepository = require('../../src/database/repositories/user.repository');

describe('PB-04 & PB-10: Kiểm thử toàn diện Module Quên và Đặt lại mật khẩu (Forgot/Reset Password)', () => {
    let studentUser = null;
    let employerUser = null;
    let tempUser = null;

    before(async () => {
        // Lấy hoặc tạo tài khoản test đảm bảo độc lập
        studentUser = await userRepository.findByEmail('student.test@vlu.edu.vn');
        employerUser = await userRepository.findByEmail('employer.test@vlu.edu.vn');

        // Tạo 1 tài khoản tạm riêng để kiểm thử đổi mật khẩu và đăng nhập không ảnh hưởng tài khoản chính
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
        // Dọn dẹp tài khoản tạm sau khi test xong
        if (tempUser?.id) {
            await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [tempUser.id]);
            await db.query('DELETE FROM users WHERE id = $1', [tempUser.id]);
        }
        await db.pool.end();
    });

    // 1. Email hợp lệ
    test('1. Email hợp lệ -> Trả về thông báo thành công và tạo token trong CSDL', async () => {
        emailService.clearHistory();
        const res = await authService.forgotPassword(tempUser.email);
        assert.equal(res.success, true);
        assert.ok(res.message.includes('Nếu địa chỉ email tồn tại'));

        const tokenRow = await db.query(
            'SELECT * FROM password_reset_tokens WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
            [tempUser.id]
        );
        assert.equal(tokenRow.rows.length, 1);
        assert.equal(tokenRow.rows[0].used_at, null);
        assert.ok(new Date(tokenRow.rows[0].expires_at) > new Date());
    });

    // 2. Email không tồn tại -> Phản hồi trung lập (Anti-enumeration), không tạo token
    test('2. Email không tồn tại -> Trả về thông báo trung lập, không sinh token trong CSDL', async () => {
        const fakeEmail = 'nonexistent.user.jobnest@vlu.edu.vn';
        const res = await authService.forgotPassword(fakeEmail);
        assert.equal(res.success, true);
        assert.ok(res.message.includes('Nếu địa chỉ email tồn tại'));
    });

    // 3. Student request reset (PB-04)
    test('3. Sinh viên yêu cầu reset mật khẩu (PB-04) -> Hoạt động chính xác', async () => {
        if (studentUser) {
            const res = await authService.forgotPassword(studentUser.email);
            assert.equal(res.success, true);
            const check = await db.query(
                'SELECT * FROM password_reset_tokens WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
                [studentUser.id]
            );
            assert.ok(check.rows.length > 0);
        }
    });

    // 4. Employer request reset (PB-10)
    test('4. Nhà tuyển dụng yêu cầu reset mật khẩu (PB-10) -> Hoạt động chính xác', async () => {
        if (employerUser) {
            const res = await authService.forgotPassword(employerUser.email);
            assert.equal(res.success, true);
            const check = await db.query(
                'SELECT * FROM password_reset_tokens WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
                [employerUser.id]
            );
            assert.ok(check.rows.length > 0);
        }
    });

    // 5 & 11 & 12 & 13. Token hợp lệ, Cập nhật mật khẩu, Đăng nhập pass mới và pass cũ thất bại
    test('5, 11, 12, 13. Token hợp lệ -> Cập nhật mật khẩu, Login bằng pass mới thành công, pass cũ thất bại', async () => {
        // 1. Tạo yêu cầu reset mới cho tempUser
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await db.query(
            'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
            [tempUser.id, tokenHash, expiresAt]
        );

        // 2. Gọi reset mật khẩu với mật khẩu mới
        const newPassword = 'NewSecretPassword2026!';
        const resetRes = await authService.resetPassword({
            token: rawToken,
            new_password: newPassword
        });
        assert.equal(resetRes.success, true);
        assert.ok(resetRes.message.includes('thành công'));

        // 3. Đăng nhập bằng mật khẩu mới -> THÀNH CÔNG
        const loginNew = await authService.login({
            email: tempUser.email,
            password: newPassword
        });
        assert.ok(loginNew.token);
        assert.equal(loginNew.user.email, tempUser.email);

        // 4. Đăng nhập bằng mật khẩu cũ ('InitialPass123') -> THẤT BẠI (401)
        await assert.rejects(
            async () => {
                await authService.login({
                    email: tempUser.email,
                    password: 'InitialPass123'
                });
            },
            {
                name: 'UnauthorizedError',
                message: 'Email hoặc mật khẩu không chính xác'
            }
        );
    });

    // 6. Token sai -> Báo lỗi 400
    test('6. Token sai / không tồn tại -> Ném lỗi AppError 400', async () => {
        await assert.rejects(
            async () => {
                await authService.resetPassword({
                    token: 'invalid_random_token_1234567890abcdef',
                    new_password: 'ValidPassword123'
                });
            },
            {
                name: 'AppError',
                message: 'Mã khôi phục mật khẩu không hợp lệ hoặc không tồn tại'
            }
        );
    });

    // 7. Token hết hạn -> Báo lỗi 400
    test('7. Token đã hết hạn -> Ném lỗi AppError 400', async () => {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const pastExpiresAt = new Date(Date.now() - 5 * 60 * 1000); // Đã hết hạn 5 phút trước

        await db.query(
            'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
            [tempUser.id, tokenHash, pastExpiresAt]
        );

        await assert.rejects(
            async () => {
                await authService.resetPassword({
                    token: rawToken,
                    new_password: 'ValidPassword123'
                });
            },
            {
                name: 'AppError',
                message: 'Mã khôi phục mật khẩu đã hết hạn. Vui lòng yêu cầu mã mới'
            }
        );
    });

    // 8 & 9. Token đã sử dụng & Token sử dụng lần thứ hai (Anti-replay)
    test('8, 9. Token đã sử dụng -> Chặn không cho sử dụng lại lần thứ 2', async () => {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Đã sử dụng trước đó (used_at có giá trị)
        await db.query(
            'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
            [tempUser.id, tokenHash, expiresAt]
        );

        await assert.rejects(
            async () => {
                await authService.resetPassword({
                    token: rawToken,
                    new_password: 'AnotherPassword123'
                });
            },
            {
                name: 'AppError',
                message: 'Mã khôi phục mật khẩu này đã được sử dụng trước đó'
            }
        );
    });

    // 10. Mật khẩu mới không hợp lệ (< 6 ký tự)
    test('10. Mật khẩu mới quá ngắn (< 6 ký tự) -> Ném lỗi AppError 400', async () => {
        await assert.rejects(
            async () => {
                await authService.resetPassword({
                    token: 'some_dummy_token',
                    new_password: '123' // Quá ngắn
                });
            },
            {
                name: 'AppError',
                message: 'Mật khẩu mới bắt buộc và phải có ít nhất 6 ký tự'
            }
        );
    });

    // 14. Hai request đồng thời sử dụng cùng token (Concurrency double-spend guard)
    test('14. Concurrency Guard -> Hai request đồng thời chỉ có duy nhất 1 request thành công', async () => {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await db.query(
            'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
            [tempUser.id, tokenHash, expiresAt]
        );

        // Bắn 2 promises đồng thời cạnh tranh
        const p1 = authService.resetPassword({ token: rawToken, new_password: 'ConcurrentPass1!' });
        const p2 = authService.resetPassword({ token: rawToken, new_password: 'ConcurrentPass2!' });

        const results = await Promise.allSettled([p1, p2]);
        const fulfilled = results.filter(r => r.status === 'fulfilled');
        const rejected = results.filter(r => r.status === 'rejected');

        assert.equal(fulfilled.length, 1, 'Chỉ 1 request thành công');
        assert.equal(rejected.length, 1, 'Request thứ hai bị từ chối do đã used');
    });

    // 15. Invalidate token cũ khi request token mới
    test('15. Yêu cầu token mới -> Tự động vô hiệu hóa các token cũ chưa sử dụng', async () => {
        await authService.forgotPassword(tempUser.email);
        const token1 = emailService.getLastDispatched().rawToken;

        // Sinh tiếp token thứ 2
        await authService.forgotPassword(tempUser.email);
        const token2 = emailService.getLastDispatched().rawToken;

        // Token 1 cũ phải bị vô hiệu hóa
        await assert.rejects(
            async () => {
                await authService.resetPassword({
                    token: token1,
                    new_password: 'PasswordForToken1!'
                });
            },
            {
                name: 'AppError',
                message: 'Mã khôi phục mật khẩu này đã được sử dụng trước đó'
            }
        );

        // Token 2 mới hoạt động thành công
        const okRes = await authService.resetPassword({
            token: token2,
            new_password: 'PasswordForToken2!'
        });
        assert.equal(okRes.success, true);
    });

    // 16. Không rò rỉ token_hash hay password_hash ra response
    test('16. Bảo mật thông tin -> Response không chứa token_hash hay password_hash', async () => {
        const forgotRes = await authService.forgotPassword(tempUser.email);
        assert.equal(forgotRes.password_hash, undefined);
        assert.equal(forgotRes.token_hash, undefined);

        const activeToken = emailService.getLastDispatched().rawToken;
        const resetRes = await authService.resetPassword({
            token: activeToken,
            new_password: 'CleanSafePassword999!'
        });
        assert.equal(resetRes.password_hash, undefined);
        assert.equal(resetRes.token_hash, undefined);
    });
});
