const express = require('express');
const router = express.Router();
const adminService = require('./admin.service');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

// Mọi route bên dưới đều bắt buộc quyền ADMIN (UC-10)
router.use(verifyToken, requireRoles('ADMIN'));

// =============================================================================
// 1. STATS (WF-A01)
// =============================================================================
// GET /api/admin/stats
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

// =============================================================================
// 2. USERS (WF-A02)
// =============================================================================
// GET /api/admin/users
router.get('/users', async (req, res, next) => {
    try {
        const { role, status, search, limit = 50, page = 1 } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const users = await adminService.listUsers({
            role,
            status,
            search,
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
            req.body.status,
            req.user?.id
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

// PATCH /api/admin/users/:id/verify (Cấp tick xanh xác thực uy tín cho Employer)
router.patch('/users/:id/verify', async (req, res, next) => {
    try {
        const isVerified = Boolean(req.body.is_verified);
        const result = await adminService.toggleUserVerification(
            parseInt(req.params.id, 10),
            isVerified,
            req.user?.id
        );
        res.status(200).json({
            success: true,
            message: isVerified ? 'Đã cấp xác thực uy tín cho tài khoản' : 'Đã hủy xác thực uy tín của tài khoản',
            data: result,
        });
    } catch (err) {
        next(err);
    }
});

// =============================================================================
// 3. JOB MODERATION (WF-A03 & WF-A04)
// =============================================================================
// GET /api/admin/jobs/pending
router.get('/jobs/pending', async (req, res, next) => {
    try {
        const { work_type, moderation_status = 'PENDING', limit = 50, page = 1 } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const jobs = await adminService.listPendingJobs({
            work_type,
            moderation_status,
            limit: parseInt(limit, 10),
            offset,
        });
        res.status(200).json({
            success: true,
            data: jobs,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/admin/jobs/:id (Xem chi tiết tin tuyển dụng chờ duyệt)
router.get('/jobs/:id', async (req, res, next) => {
    try {
        const job = await adminService.getJobDetail(parseInt(req.params.id, 10));
        res.status(200).json({
            success: true,
            data: job,
        });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/admin/jobs/:id/moderate (Kiểm duyệt tin đăng: APPROVED hoặc REJECTED kèm moderation_reason)
router.patch('/jobs/:id/moderate', async (req, res, next) => {
    try {
        const moderatedJob = await adminService.moderateJob(
            parseInt(req.params.id, 10),
            req.body.moderation_status,
            req.body.moderation_reason || req.body.moderation_note,
            req.user?.id
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

// =============================================================================
// 4. REPORTS (WF-A05 & WF-A06)
// =============================================================================
// GET /api/admin/reports
router.get('/reports', async (req, res, next) => {
    try {
        const { status, target_type, limit = 50, page = 1 } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const reports = await adminService.listReports({
            status,
            target_type,
            limit: parseInt(limit, 10),
            offset,
        });
        res.status(200).json({
            success: true,
            data: reports,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/admin/reports/:id
router.get('/reports/:id', async (req, res, next) => {
    try {
        const detail = await adminService.getReportDetail(parseInt(req.params.id, 10));
        res.status(200).json({
            success: true,
            data: detail,
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/admin/reports/:id/action
router.post('/reports/:id/action', async (req, res, next) => {
    try {
        const result = await adminService.resolveReport(
            parseInt(req.params.id, 10),
            {
                action: req.body.action,
                note: req.body.note,
            },
            req.user?.id
        );
        res.status(200).json({
            success: true,
            message: 'Đã xử lý báo cáo vi phạm thành công',
            data: result,
        });
    } catch (err) {
        next(err);
    }
});

// =============================================================================
// 5. CATEGORIES (WF-A07)
// =============================================================================
// GET /api/admin/categories
router.get('/categories', async (req, res, next) => {
    try {
        const categories = await adminService.listCategories();
        res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/admin/categories
router.post('/categories', async (req, res, next) => {
    try {
        const category = await adminService.createCategory(req.body, req.user?.id);
        res.status(201).json({
            success: true,
            message: 'Đã tạo danh mục ngành nghề mới',
            data: category,
        });
    } catch (err) {
        next(err);
    }
});

// PUT /api/admin/categories/:id
router.put('/categories/:id', async (req, res, next) => {
    try {
        const category = await adminService.updateCategory(
            parseInt(req.params.id, 10),
            req.body,
            req.user?.id
        );
        res.status(200).json({
            success: true,
            message: 'Đã cập nhật danh mục ngành nghề',
            data: category,
        });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/admin/categories/:id
router.delete('/categories/:id', async (req, res, next) => {
    try {
        const result = await adminService.deleteCategory(
            parseInt(req.params.id, 10),
            req.user?.id
        );
        res.status(200).json({
            success: true,
            message: 'Đã xóa danh mục ngành nghề',
            data: result,
        });
    } catch (err) {
        next(err);
    }
});

// =============================================================================
// 6. ADMIN SYSTEM LOGS (WF-A08)
// =============================================================================
// GET /api/admin/logs
router.get('/logs', async (req, res, next) => {
    try {
        const { action, limit = 50, page = 1 } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const logs = await adminService.listAdminLogs({
            action,
            limit: parseInt(limit, 10),
            offset,
        });
        res.status(200).json({
            success: true,
            data: logs,
        });
    } catch (err) {
        next(err);
    }
});

// =============================================================================
// 7. VIOLATIONS & APPEALS (POLICY ENFORCEMENT)
// =============================================================================
// POST /api/admin/users/:id/violations (Ghi nhận vi phạm & tính toán bậc xử lý)
router.post('/users/:id/violations', async (req, res, next) => {
    try {
        const result = await adminService.recordUserViolation(
            parseInt(req.params.id, 10),
            req.body,
            req.user?.id
        );
        res.status(201).json({
            success: true,
            message: `Đã ghi nhận vi phạm lần ${result.violation_count} (Bậc ${result.tier}) thành công.`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/admin/users/:id/violations (Xem lịch sử vi phạm của một người dùng)
router.get('/users/:id/violations', async (req, res, next) => {
    try {
        const violations = await adminService.listUserViolations(parseInt(req.params.id, 10));
        res.status(200).json({
            success: true,
            data: violations,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/admin/appeals (Xem danh sách đơn khiếu nại)
router.get('/appeals', async (req, res, next) => {
    try {
        const { status, limit = 50, page = 1 } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const appeals = await adminService.listAppeals({
            status,
            limit: parseInt(limit, 10),
            offset,
        });
        res.status(200).json({
            success: true,
            data: appeals,
        });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/admin/appeals/:id (Giải quyết đơn khiếu nại: APPROVED / REJECTED)
router.patch('/appeals/:id', async (req, res, next) => {
    try {
        const resolved = await adminService.resolveAppeal(
            parseInt(req.params.id, 10),
            req.body,
            req.user?.id
        );
        res.status(200).json({
            success: true,
            message: `Đã xử lý khiếu nại: ${req.body.status}`,
            data: resolved,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
