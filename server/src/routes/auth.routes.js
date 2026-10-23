const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const { verifyToken } = require('../middleware/auth.middleware');

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

// GET /api/auth/me (Kiểm tra phiên đăng nhập hiện tại)
router.get('/me', verifyToken, async (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user,
    });
});

module.exports = router;
