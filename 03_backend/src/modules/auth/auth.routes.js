const express = require('express');
const router = express.Router();
const authService = require('./auth.service');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('./auth.validator');
const { verifyToken } = require('../../middleware/auth.middleware');

// Đăng nhập không còn khóa tạm thời theo IP sau nhiều lần sai (theo yêu cầu): sai thông tin chỉ báo lỗi.

// In-memory Rate Limiting cho Forgot Password (chống spam request)
const forgotPasswordAttempts = new Map();

function rateLimitForgotPassword(req, res, next) {
    // Trong môi trường testing, cho phép bypass rate limit nếu có header x-test-bypass
    if (process.env.NODE_ENV === 'test' && req.headers['x-test-bypass-ratelimit']) {
        return next();
    }

    const key = req.ip || req.connection?.remoteAddress || 'global_ip';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 phút
    const maxRequests = 5;

    let record = forgotPasswordAttempts.get(key);
    if (!record || now > record.resetTime) {
        record = { count: 1, resetTime: now + windowMs };
        forgotPasswordAttempts.set(key, record);
        return next();
    }

    if (record.count >= maxRequests) {
        return res.status(429).json({
            success: false,
            message: 'Bạn đã yêu cầu khôi phục mật khẩu quá nhiều lần. Vui lòng thử lại sau 15 phút.'
        });
    }

    record.count++;
    next();
}

// POST /api/auth/register (UC-01)
router.post('/register', validateRegister, async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({
            success: true,
            message: 'Đăng ký tài khoản thành công',
            data: result,
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/login (UC-02)
router.post('/login', validateLogin, async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: result,
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/appeals — tài khoản bị khóa gửi khiếu nại (xác minh bằng email + mật khẩu, không cần token)
// Có kiểm tra mật khẩu → dùng chung giới hạn tần suất với quên mật khẩu để không bị dùng dò mật khẩu
router.post('/appeals', rateLimitForgotPassword, async (req, res, next) => {
    try {
        const data = await authService.submitAccountAppeal(req.body || {});
        res.status(201).json({ success: true, message: 'Đã gửi khiếu nại. Quản trị viên sẽ xem xét và phản hồi qua thông báo/email.', data: { id: data.id, status: data.status } });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/forgot-password (PB-04 / PB-10)
router.post('/forgot-password', rateLimitForgotPassword, validateForgotPassword, async (req, res, next) => {
    try {
        const result = await authService.forgotPassword(req.body.email);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/reset-password (PB-04 / PB-10)
router.post('/reset-password', validateResetPassword, async (req, res, next) => {
    try {
        const result = await authService.resetPassword(req.body);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/change-password (WF-X03: Đổi mật khẩu tài khoản)
router.post('/change-password', verifyToken, async (req, res, next) => {
    try {
        const result = await authService.changePassword(req.user.id, req.body);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

// GET /api/auth/me (Kiểm tra phiên đăng nhập hiện tại)
router.get('/me', verifyToken, async (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user,
    });
});

module.exports = router;
