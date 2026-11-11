const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const jobService = require('./job.service');
const { validateCreateJob, validateJobStatus } = require('./job.validator');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

// GET /api/jobs (UC-05: Tìm kiếm & Lọc tin tuyển dụng)
router.get('/', async (req, res, next) => {
    try {
        const { keyword, category, location, minSalary, maxSalary, workType, employerId, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const jobs = await jobService.searchJobs({
            keyword,
            category,
            location,
            minSalary: minSalary ? Number(minSalary) : null,
            maxSalary: maxSalary ? Number(maxSalary) : null,
            workType,
            employerId: employerId ? parseInt(employerId, 10) : null,
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
