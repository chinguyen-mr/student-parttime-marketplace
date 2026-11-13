// Kiểm duyệt đánh giá doanh nghiệp / công việc — gắn tại /api/admin/reviews (chỉ ADMIN)
const express = require('express');
const router = express.Router();
const service = require('./experience-review.service');
const { parseReviewType } = require('./experience-review.policy');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

router.use(verifyToken, requireRoles('ADMIN'));

const wrap = (fn) => async (req, res, next) => {
    try { await fn(req, res); } catch (err) { next(err); }
};

router.get('/stats', wrap(async (req, res) => res.json({ success: true, data: await service.adminStats() })));

router.get('/reports', wrap(async (req, res) => {
    const r = await service.adminListReports(req.query);
    res.json({ success: true, data: r.data, pagination: r.pagination });
}));

router.post('/reports/:id(\\d+)/resolve', wrap(async (req, res) => {
    const data = await service.adminResolveReport(req.user.id, parseInt(req.params.id, 10), {
        action: String(req.body.action || '').toUpperCase(), note: req.body.note,
    });
    res.json({ success: true, message: 'Đã xử lý', data });
}));

router.get('/:type(company|job)', wrap(async (req, res) => {
    const r = await service.adminList(parseReviewType(req.params.type), req.query);
    res.json({ success: true, data: r.data, pagination: r.pagination });
}));

router.get('/:type(company|job)/:id(\\d+)', wrap(async (req, res) => {
    res.json({ success: true, data: await service.adminDetail(parseReviewType(req.params.type), parseInt(req.params.id, 10)) });
}));

router.post('/:type(company|job)/:id(\\d+)/moderate', wrap(async (req, res) => {
    const data = await service.adminModerate(req.user.id, parseReviewType(req.params.type), parseInt(req.params.id, 10), {
        action: String(req.body.action || '').toUpperCase(), reason: req.body.reason,
    });
    res.json({ success: true, message: 'Đã cập nhật trạng thái đánh giá', data });
}));

module.exports = router;
