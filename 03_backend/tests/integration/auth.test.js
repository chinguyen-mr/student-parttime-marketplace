const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('UC-01 & UC-02: Xác thực và Phân quyền (Auth)', () => {
    test('Mã hóa mật khẩu bằng bcrypt phải tạo hash an toàn', async () => {
        const rawPassword = 'password123';
        const hash = await bcrypt.hash(rawPassword, 10);
        assert.notEqual(hash, rawPassword);
        assert.ok(hash.startsWith('$2'));

        const match = await bcrypt.compare(rawPassword, hash);
        assert.equal(match, true);

        const wrongMatch = await bcrypt.compare('wrongPassword', hash);
        assert.equal(wrongMatch, false);
    });

    test('Tạo JWT Token phải chứa đúng thông tin người dùng và vai trò', () => {
        const secret = 'test_secret_key_123';
        const user = {
            id: 1,
            email: 'student@vlu.edu.vn',
            role: 'STUDENT',
            full_name: 'Sinh Viên Test',
        };

        const token = jwt.sign(user, secret, { expiresIn: '1h' });
        assert.ok(token);

        const decoded = jwt.verify(token, secret);
        assert.equal(decoded.id, 1);
        assert.equal(decoded.email, 'student@vlu.edu.vn');
        assert.equal(decoded.role, 'STUDENT');
        assert.equal(decoded.full_name, 'Sinh Viên Test');
    });

    test('JWT Token giả hoặc sai secret key phải bị từ chối', () => {
        const token = jwt.sign({ id: 1 }, 'secret_a');
        assert.throws(() => {
            jwt.verify(token, 'secret_b');
        }, /invalid signature/);
    });
});
