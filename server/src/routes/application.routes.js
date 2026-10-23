const express = require('express');
const router = express.Router();
const applicationService = require('../services/application.service');
const { validateApply, validateApplicationStatus } = require('../validators/application.validator');
const { verifyToken, requireRoles } = require('../middleware/auth.middleware');

// POST /api/applications (UC-06: Sinh viên ứng tuyển việc làm)
router.post('/', verifyToken, requireRoles('STUDENT'), validateApply, async (req, res, next) => {
    try {
        const application = await applicationService.applyForJob(req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Nộp hồ sơ ứng tuyển thành công',
            data: application,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/applications/my-applications (Sinh viên xem lịch sử ứng tuyển)
router.get('/my-applications', verifyToken, requireRoles('STUDENT'), async (req, res, next) => {
    try {
        const applications = await applicationService.getStudentApplications(req.user.id);
        res.status(200).json({
            success: true,
            data: applications,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/applications/job/:jobId (UC-07: Nhà tuyển dụng xem danh sách ứng viên của tin)
router.get('/job/:jobId', verifyToken, requireRoles('EMPLOYER'), async (req, res, next) => {
    try {
        const applications = await applicationService.getJobApplications(
            parseInt(req.params.jobId, 10),
            req.user.id
        );
        res.status(200).json({
            success: true,
            data: applications,
        });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/applications/:id/status (UC-07: Nhà tuyển dụng duyệt/từ chối ứng viên)
router.patch('/:id/status', verifyToken, requireRoles('EMPLOYER'), validateApplicationStatus, async (req, res, next) => {
    try {
        const updated = await applicationService.updateStatus(
            parseInt(req.params.id, 10),
            req.user.id,
            req.body.status
        );
        res.status(200).json({
            success: true,
            message: `Hồ sơ đã được chuyển sang trạng thái: "${req.body.status}"`,
            data: updated,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
