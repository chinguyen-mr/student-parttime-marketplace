const express = require('express');
const router = express.Router();
const jobService = require('../services/job.service');
const { validateCreateJob, validateJobStatus } = require('../validators/job.validator');
const { verifyToken, requireRoles } = require('../middleware/auth.middleware');

// GET /api/jobs (UC-05: Tìm kiếm & Lọc tin tuyển dụng)
router.get('/', async (req, res, next) => {
    try {
        const { keyword, category, location, minSalary, maxSalary, workType, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const jobs = await jobService.searchJobs({
            keyword,
            category,
            location,
            minSalary: minSalary ? Number(minSalary) : null,
            maxSalary: maxSalary ? Number(maxSalary) : null,
            workType,
            status: 'OPEN',
            moderationStatus: 'APPROVED',
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

// GET /api/jobs/my-jobs (Nhà tuyển dụng xem danh sách tin của mình)
router.get('/my-jobs', verifyToken, requireRoles('EMPLOYER'), async (req, res, next) => {
    try {
        const jobs = await jobService.getEmployerJobs(req.user.id);
        res.status(200).json({
            success: true,
            data: jobs,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/jobs/:id (Xem chi tiết tin tuyển dụng)
router.get('/:id', async (req, res, next) => {
    try {
        const job = await jobService.getJobById(parseInt(req.params.id, 10));
        res.status(200).json({
            success: true,
            data: job,
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/jobs (UC-04: Nhà tuyển dụng đăng tin tuyển dụng)
router.post('/', verifyToken, requireRoles('EMPLOYER'), validateCreateJob, async (req, res, next) => {
    try {
        const newJob = await jobService.createJob(req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Đăng tin tuyển dụng thành công',
            data: newJob,
        });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/jobs/:id/status (UC-08: Cập nhật trạng thái công việc)
router.patch('/:id/status', verifyToken, requireRoles('EMPLOYER'), validateJobStatus, async (req, res, next) => {
    try {
        const updated = await jobService.updateJobStatus(
            parseInt(req.params.id, 10),
            req.user.id,
            req.body.status
        );
        res.status(200).json({
            success: true,
            message: `Cập nhật trạng thái công việc thành "${req.body.status}" thành công`,
            data: updated,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
