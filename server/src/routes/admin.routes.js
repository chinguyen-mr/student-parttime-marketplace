const express = require('express');
const router = express.Router();
const adminService = require('../services/admin.service');
const { verifyToken, requireRoles } = require('../middleware/auth.middleware');

// Mọi route bên dưới đều bắt buộc quyền ADMIN (UC-10)
router.use(verifyToken, requireRoles('ADMIN'));

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
    try {
        const { role, limit = 50, page = 1 } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const users = await adminService.listUsers({
            role,
            limit: parseInt(limit, 10),
            offset,
        });
        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/admin/users/:id/status (Khóa hoặc kích hoạt tài khoản)
router.patch('/users/:id/status', async (req, res, next) => {
    try {
        const updatedUser = await adminService.updateUserStatus(
            parseInt(req.params.id, 10),
            req.body.status
        );
        res.status(200).json({
            success: true,
            message: `Cập nhật trạng thái tài khoản thành: ${req.body.status}`,
            data: updatedUser,
        });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/admin/jobs/:id/moderate (Kiểm duyệt tin đăng: APPROVED hoặc REJECTED)
router.patch('/jobs/:id/moderate', async (req, res, next) => {
    try {
        const moderatedJob = await adminService.moderateJob(
            parseInt(req.params.id, 10),
            req.body.moderation_status
        );
        res.status(200).json({
            success: true,
            message: `Kiểm duyệt tin đăng thành: ${req.body.moderation_status}`,
            data: moderatedJob,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/admin/stats (Thống kê hệ thống)
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await adminService.getSystemStats();
        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
