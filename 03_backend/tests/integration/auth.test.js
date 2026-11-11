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

describe('SEC-01 / WP-01: Giới hạn tần suất đăng nhập (Login Rate Limiting)', () => {
    const authRoutes = require('../../src/modules/auth/auth.routes');
    const { rateLimitLogin, recordFailedLogin, resetLoginAttempts, cleanupExpiredLoginAttempts, loginAttempts } = authRoutes;

    function createMockContext({ ip = '10.0.0.1', headers = {} } = {}) {
        let statusCode = 200;
        let responseJson = null;
        let responseHeaders = {};
        let nextCalled = false;

        const req = {
            ip,
            headers: { ...headers },
            connection: { remoteAddress: ip }
        };

        const res = {
            status(code) {
                statusCode = code;
                return this;
            },
            set(key, val) {
                responseHeaders[key] = val;
                return this;
            },
            json(data) {
                responseJson = data;
                return this;
            },
            get statusCode() { return statusCode; },
            get responseJson() { return responseJson; },
            get responseHeaders() { return responseHeaders; }
        };

        const next = () => {
            nextCalled = true;
        };

        return { req, res, next, wasNextCalled: () => nextCalled };
    }

    test('1. 5 lần thử đăng nhập thất bại đầu tiên được thông qua middleware', () => {
        const testIp = '10.0.1.10';
        resetLoginAttempts(testIp);

        for (let i = 1; i <= 5; i++) {
            const ctx = createMockContext({ ip: testIp });
            rateLimitLogin(ctx.req, ctx.res, ctx.next);
            assert.equal(ctx.wasNextCalled(), true, `Lần thử ${i} phải được gọi next()`);
            assert.equal(ctx.res.statusCode, 200);

            // Giả lập route handler ghi nhận lỗi sai mật khẩu
            recordFailedLogin(testIp);
        }

        const record = loginAttempts.get(testIp);
        assert.ok(record);
        assert.equal(record.count, 5);
    });

    test('2. Lần thử đăng nhập thất bại thứ 6 bị chặn với HTTP 429 Too Many Requests', () => {
        const testIp = '10.0.1.20';
        resetLoginAttempts(testIp);

        // Ghi nhận trước 5 lần thất bại
        for (let i = 0; i < 5; i++) {
            recordFailedLogin(testIp);
        }

        // Lần thứ 6 gửi request đến middleware
        const ctx = createMockContext({ ip: testIp });
        rateLimitLogin(ctx.req, ctx.res, ctx.next);

        assert.equal(ctx.wasNextCalled(), false, 'Lần thứ 6 không được gọi next()');
        assert.equal(ctx.res.statusCode, 429, 'Phải trả về HTTP 429');
        assert.equal(ctx.res.responseJson.success, false);
        assert.match(ctx.res.responseJson.message, /quá 5 lần/);
        assert.ok(ctx.res.responseHeaders['Retry-After'], 'Phải có header Retry-After');
    });

    test('3. Đăng nhập thành công reset bộ đếm thất bại về 0', () => {
        const testIp = '10.0.1.30';
        resetLoginAttempts(testIp);

        // Giả lập 4 lần sai
        for (let i = 0; i < 4; i++) {
            recordFailedLogin(testIp);
        }
        assert.equal(loginAttempts.get(testIp).count, 4);

        // Người dùng nhớ ra mật khẩu và đăng nhập thành công
        resetLoginAttempts(testIp);
        assert.equal(loginAttempts.has(testIp), false, 'Bộ đếm của IP phải bị xóa');

        // Lần tiếp theo hoạt động bình thường
        const ctx = createMockContext({ ip: testIp });
        rateLimitLogin(ctx.req, ctx.res, ctx.next);
        assert.equal(ctx.wasNextCalled(), true);
    });

    test('4. Các địa chỉ IP khác nhau có bộ đếm độc lập', () => {
        const ipA = '10.0.2.1';
        const ipB = '10.0.2.2';
        resetLoginAttempts(ipA);
        resetLoginAttempts(ipB);

        // IP A đã sai 5 lần (sắp bị chặn)
        for (let i = 0; i < 5; i++) {
            recordFailedLogin(ipA);
        }

        // IP B mới đăng nhập lần đầu
        const ctxB = createMockContext({ ip: ipB });
        rateLimitLogin(ctxB.req, ctxB.res, ctxB.next);
        assert.equal(ctxB.wasNextCalled(), true, 'IP B không được bị ảnh hưởng bởi IP A');
        assert.equal(ctxB.res.statusCode, 200);

        // IP A gửi request thứ 6 -> Bị chặn 429
        const ctxA = createMockContext({ ip: ipA });
        rateLimitLogin(ctxA.req, ctxA.res, ctxA.next);
        assert.equal(ctxA.wasNextCalled(), false);
        assert.equal(ctxA.res.statusCode, 429);
    });

    test('5. Bộ đếm hết hạn TTL (15 phút) tự động được giải phóng', () => {
        const testIp = '10.0.3.1';
        resetLoginAttempts(testIp);

        // Tạo bản ghi đã quá hạn 1 giây
        loginAttempts.set(testIp, {
            count: 5,
            resetTime: Date.now() - 1000
        });

        // Khi quét dọn
        cleanupExpiredLoginAttempts();
        assert.equal(loginAttempts.has(testIp), false, 'Bản ghi hết hạn phải bị dọn dẹp');

        // Request mới sau khi hết hạn phải được cấp phép
        const ctx = createMockContext({ ip: testIp });
        rateLimitLogin(ctx.req, ctx.res, ctx.next);
        assert.equal(ctx.wasNextCalled(), true);
        assert.equal(ctx.res.statusCode, 200);
    });

    test('6. Header bypass hoạt động trong môi trường test (NODE_ENV=test)', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'test';
        try {
            const testIp = '10.0.4.1';
            resetLoginAttempts(testIp);

            // Ghi nhận 5 lần sai
            for (let i = 0; i < 5; i++) {
                recordFailedLogin(testIp);
            }

            // Gửi request có header bypass
            const ctx = createMockContext({
                ip: testIp,
                headers: { 'x-test-bypass-ratelimit': 'true' }
            });
            rateLimitLogin(ctx.req, ctx.res, ctx.next);

            assert.equal(ctx.wasNextCalled(), true, 'Trong test env, có header bypass phải được next()');
        } finally {
            process.env.NODE_ENV = originalEnv;
        }
    });

    test('7. Header bypass bị BỎ QUA TUYỆT ĐỐI trong môi trường production (NODE_ENV=production)', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        try {
            const testIp = '10.0.5.1';
            resetLoginAttempts(testIp);

            // Ghi nhận 5 lần sai
            for (let i = 0; i < 5; i++) {
                recordFailedLogin(testIp);
            }

            // Hacker/Client cố tình gửi header x-test-bypass-ratelimit trong production
            const ctx = createMockContext({
                ip: testIp,
                headers: { 'x-test-bypass-ratelimit': 'true' }
            });
            rateLimitLogin(ctx.req, ctx.res, ctx.next);

            assert.equal(ctx.wasNextCalled(), false, 'Production không bao giờ được chấp nhận bypass header');
            assert.equal(ctx.res.statusCode, 429, 'Production phải chặn với 429');
        } finally {
            process.env.NODE_ENV = originalEnv;
        }
    });

    test('8. Xử lý nhiều request đồng thời (Concurrent Requests Safety)', () => {
        const testIp = '10.0.6.1';
        resetLoginAttempts(testIp);

        // Giả lập 10 request đồng thời ghi nhận lỗi
        for (let i = 0; i < 10; i++) {
            recordFailedLogin(testIp);
        }

        const record = loginAttempts.get(testIp);
        assert.equal(record.count, 10, 'Bộ đếm phải tích lũy đủ 10 lần');

        // Bất kỳ request nào sau đó đều phải nhận 429
        const ctx = createMockContext({ ip: testIp });
        rateLimitLogin(ctx.req, ctx.res, ctx.next);
        assert.equal(ctx.wasNextCalled(), false);
        assert.equal(ctx.res.statusCode, 429);
    });
});
