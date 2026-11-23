const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const jobService = require('./job.service');
const { validateCreateJob, validateJobStatus } = require('./job.validator');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../../config/jwt.config');
const { NotFoundError, AppError } = require('../../utils/app-error');

// GET /api/jobs (UC-05: Tìm kiếm & Lọc tin tuyển dụng)
router.get('/', async (req, res, next) => {
    try {
        const { keyword, category, location, minSalary, maxSalary, workType, employerId } = req.query;
        // Phân trang: giá trị sai/âm → mặc định (trước đây NaN/số âm làm lỗi 500).
        // Trần 500 tin/lần: trang Tìm việc tải 500 tin rồi lọc phía trình duyệt (App.jsx fetchJobs).
        const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limitNum = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const offset = (pageNum - 1) * limitNum;

        // Mức lương lọc phải là số không âm; giá trị sai không bị bỏ qua âm thầm (trả về toàn bộ tin là kết quả sai)
        const salaryParam = (v) => (v === undefined || v === '' ? null : Number(v));
        const min = salaryParam(minSalary), max = salaryParam(maxSalary);
        if ([min, max].some(v => v !== null && (!Number.isFinite(v) || v < 0))) {
            throw new AppError('Mức lương lọc không hợp lệ: phải là số không âm', 400);
        }
        if (min !== null && max !== null && min > max) {
            throw new AppError('Mức lương tối thiểu không được lớn hơn mức tối đa', 400);
        }

        const jobs = await jobService.searchJobs({
            keyword,
            category,
            location,
            minSalary: min || null,
            maxSalary: max || null,
            workType,
            employerId: employerId ? parseInt(employerId, 10) : null,
            status: 'OPEN',
            moderationStatus: 'APPROVED',
            limit: limitNum,
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

// GET /api/jobs/saved (Lấy danh sách tin tuyển dụng đã lưu)
router.get('/saved', verifyToken, async (req, res, next) => {
    try {
        const savedJobIds = await jobService.getSavedJobIds(req.user.id);
        const savedJobs = await jobService.getSavedJobs(req.user.id);
        res.status(200).json({
            success: true,
            data: {
                ids: savedJobIds,
                jobs: savedJobs,
            },
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/jobs/recommended (Gợi ý việc làm cá nhân hóa theo lịch rảnh và chuyên ngành sinh viên - Chỉ STUDENT)
router.get('/recommended', verifyToken, requireRoles('STUDENT'), async (req, res, next) => {
    try {
        const matchingService = require('./matching.service');
        const { limit = 20, page = 1 } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const result = await matchingService.getRecommendedJobs(req.user.id, {
            limit: parseInt(limit, 10),
            offset
        });
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/jobs/recommended/preview — gợi ý theo lịch rảnh đang chọn (chưa lưu). Body: { slots: [...] }
router.post('/recommended/preview', verifyToken, requireRoles('STUDENT'), async (req, res, next) => {
    try {
        const raw = Array.isArray(req.body?.slots) ? req.body.slots : null;
        const TIME = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
        if (!raw || raw.length > 50 || !raw.every(s => Number.isInteger(s?.day_of_week) && s.day_of_week >= 1 && s.day_of_week <= 7
            && TIME.test(s.start_time) && TIME.test(s.end_time) && s.start_time < s.end_time)) {
            return res.status(400).json({ success: false, message: 'Lịch rảnh không hợp lệ' });
        }
        const slots = raw.map(s => ({ day_of_week: s.day_of_week, start_time: s.start_time, end_time: s.end_time, is_active: true }));
        const matchingService = require('./matching.service');
        const result = await matchingService.getRecommendedJobs(req.user.id, { limit: 20, offset: 0, slots });
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

// Helpers cho SEO-05: Dynamic XML Sitemap
function escapeXml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe).replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function generateSitemapXml(jobs = [], baseUrl = 'https://jobnest.edu.vn') {
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const staticRoutes = [
        { loc: `${cleanBaseUrl}/`, changefreq: 'daily', priority: '1.0' },
        { loc: `${cleanBaseUrl}/?tab=jobs`, changefreq: 'hourly', priority: '0.9' },
        { loc: `${cleanBaseUrl}/?tab=about`, changefreq: 'weekly', priority: '0.7' }
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static base URLs
    for (const r of staticRoutes) {
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(r.loc)}</loc>\n`;
        xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
        xml += `    <priority>${r.priority}</priority>\n`;
        xml += '  </url>\n';
    }

    // Dynamic eligible job URLs
    if (Array.isArray(jobs)) {
        for (const job of jobs) {
            if (!job || !job.id) continue;
            const jobUrl = `${cleanBaseUrl}/?jobId=${job.id}`;
            let lastmod = '';
            if (job.updated_at || job.created_at) {
                try {
                    lastmod = new Date(job.updated_at || job.created_at).toISOString();
                } catch {
                    lastmod = '';
                }
            }

            xml += '  <url>\n';
            xml += `    <loc>${escapeXml(jobUrl)}</loc>\n`;
            if (lastmod) {
                xml += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;
            }
            xml += '    <changefreq>daily</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        }
    }

    xml += '</urlset>';
    return xml;
}

// GET /api/jobs/sitemap.xml (SEO-05: Dynamic XML Sitemap)
router.get('/sitemap.xml', async (req, res) => {
    const baseUrl = process.env.PUBLIC_APP_URL || 'https://jobnest.edu.vn';
    try {
        const query = `
            SELECT id, title, updated_at, created_at, application_deadline, deadline
            FROM jobs
            WHERE (status = 'OPEN' OR status = 'PUBLISHED')
              AND moderation_status = 'APPROVED'
              AND (application_deadline IS NULL OR application_deadline > NOW())
              AND (deadline IS NULL OR deadline >= CURRENT_DATE)
            ORDER BY updated_at DESC
        `;
        const result = await db.query(query);
        const xml = generateSitemapXml(result.rows, baseUrl);
        res.set('Content-Type', 'application/xml; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=3600');
        res.status(200).send(xml);
    } catch (err) {
        console.error('[Sitemap] Database query error:', err.message);
        // Fallback: Return valid static XML rather than crashing crawlers with HTTP 500
        const fallbackXml = generateSitemapXml([], baseUrl);
        res.set('Content-Type', 'application/xml; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=300');
        res.status(200).send(fallbackXml);
    }
});

// GET /api/jobs/categories — ngành nghề đang hoạt động (do admin quản lý) kèm số tin đang tuyển
router.get('/categories', async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT c.id, c.name,
                   (SELECT COUNT(*)::int FROM jobs j
                     WHERE j.category = c.name
                       AND (j.status = 'OPEN' OR j.status = 'PUBLISHED')
                       AND j.moderation_status = 'APPROVED') AS job_count
            FROM categories c
            WHERE c.is_active = TRUE
            ORDER BY job_count DESC, c.name ASC
        `);
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        next(err);
    }
});

// GET /api/jobs/:id/related (Lấy các công việc liên quan cùng ngành nghề / địa điểm)
router.get('/:id/related', async (req, res, next) => {
    try {
        const related = await jobService.getRelatedJobs(parseInt(req.params.id, 10));
        res.status(200).json({
            success: true,
            data: related,
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/jobs/:id/save (Lưu / Bỏ lưu tin tuyển dụng)
router.post('/:id/save', verifyToken, async (req, res, next) => {
    try {
        const result = await jobService.toggleSavedJob(req.user.id, parseInt(req.params.id, 10));
        res.status(200).json({
            success: true,
            message: result.saved ? 'Đã lưu công việc vào danh sách yêu thích' : 'Đã bỏ lưu công việc',
            data: result,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/jobs/:id (Xem chi tiết tin tuyển dụng)
router.get('/:id', async (req, res, next) => {
    try {
        const job = await jobService.getJobById(parseInt(req.params.id, 10));

        // Tin chưa được Admin duyệt (PENDING/REJECTED) chỉ NTD đăng tin và Admin xem được;
        // người khác nhận 404 như tin không tồn tại (không lộ tin qua link trực tiếp)
        if (job.moderation_status !== 'APPROVED') {
            let viewer = null;
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try { viewer = jwt.verify(authHeader.split(' ')[1], getJwtSecret()); } catch { viewer = null; }
            }
            const canView = viewer && (viewer.role === 'ADMIN' || String(viewer.id) === String(job.employer_id));
            if (!canView) {
                throw new NotFoundError('Không tìm thấy tin tuyển dụng này');
            }
        }

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

// PUT /api/jobs/:id (PB-14: Nhà tuyển dụng chỉnh sửa thông tin tin tuyển dụng)
router.put('/:id', verifyToken, requireRoles('EMPLOYER'), validateCreateJob, async (req, res, next) => {
    try {
        const updated = await jobService.updateJob(
            parseInt(req.params.id, 10),
            req.user.id,
            req.body
        );
        res.status(200).json({
            success: true,
            message: 'Cập nhật tin tuyển dụng thành công',
            data: updated,
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

// PUT /api/jobs/:id/schedules (Quản lý ca làm việc của tin tuyển dụng - Chỉ EMPLOYER sở hữu)
router.put('/:id/schedules', verifyToken, requireRoles('EMPLOYER'), async (req, res, next) => {
    try {
        const schedules = await jobService.updateJobSchedules(
            parseInt(req.params.id, 10),
            req.user.id,
            req.body.schedules
        );
        res.status(200).json({
            success: true,
            message: 'Cập nhật danh sách ca làm việc thành công',
            data: schedules,
        });
    } catch (err) {
        next(err);
    }
});

router.escapeXml = escapeXml;
router.generateSitemapXml = generateSitemapXml;

module.exports = router;
