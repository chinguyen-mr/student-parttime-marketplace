// API đánh giá doanh nghiệp & công việc — gắn tại /api/reviews (cùng namespace với đánh giá UC-09 cũ, không trùng đường dẫn)
const express = require('express');
const router = express.Router();
const service = require('./experience-review.service');
const { parseReviewType } = require('./experience-review.policy');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

const optionalAuth = (req, res, next) => (req.headers.authorization ? verifyToken(req, res, next) : next());
const id = (v) => parseInt(v, 10);
const wrap = (fn) => async (req, res, next) => {
    try { await fn(req, res); } catch (err) { next(err); }
};
const ok = (res, data, extra = {}, status = 200) => res.status(status).json({ success: true, ...extra, data });

// ---------- Công khai (chỉ review PUBLISHED) ----------
router.get('/companies/:employerId(\\d+)/summary', wrap(async (req, res) => ok(res, await service.companySummary(id(req.params.employerId)))));

router.get('/companies/:employerId(\\d+)/company-reviews', wrap(async (req, res) => {
    const r = await service.listCompanyReviews(id(req.params.employerId), req.query);
    ok(res, r.data, { pagination: r.pagination });
}));

router.get('/companies/:employerId(\\d+)/job-reviews', wrap(async (req, res) => {
    const r = await service.listEmployerJobReviews(id(req.params.employerId), req.query);
    ok(res, r.data, { jobs: r.jobs, pagination: r.pagination });
}));

router.get('/jobs/:jobId(\\d+)/summary', wrap(async (req, res) => ok(res, await service.jobSummary(id(req.params.jobId)))));

router.get('/jobs/:jobId(\\d+)/job-reviews', wrap(async (req, res) => {
    const r = await service.listJobReviews(id(req.params.jobId), req.query);
    ok(res, r.data, { pagination: r.pagination });
}));

// ---------- Điều kiện đánh giá (khách xem được lý do: cần đăng nhập) ----------
router.get('/companies/:employerId(\\d+)/eligibility', optionalAuth, wrap(async (req, res) => (
    ok(res, await service.companyEligibility(req.user || null, id(req.params.employerId)))
)));
router.get('/jobs/:jobId(\\d+)/eligibility', optionalAuth, wrap(async (req, res) => (
    ok(res, await service.jobEligibility(req.user || null, id(req.params.jobId)))
)));

// ---------- Ứng viên ----------
router.post('/companies/:employerId(\\d+)/company-reviews', verifyToken, requireRoles('STUDENT'), wrap(async (req, res) => {
    const review = await service.createCompanyReview(req.user.id, id(req.params.employerId), req.body);
    ok(res, review, { message: review.status === 'PUBLISHED' ? 'Đánh giá đã được đăng' : 'Đánh giá đã gửi và đang chờ kiểm duyệt' }, 201);
}));

router.post('/jobs/:jobId(\\d+)/job-reviews', verifyToken, requireRoles('STUDENT'), wrap(async (req, res) => {
    const review = await service.createJobReview(req.user.id, id(req.params.jobId), req.body);
    ok(res, review, { message: review.status === 'PUBLISHED' ? 'Đánh giá đã được đăng' : 'Đánh giá đã gửi và đang chờ kiểm duyệt' }, 201);
}));

router.get('/mine', verifyToken, requireRoles('STUDENT'), wrap(async (req, res) => ok(res, await service.listMine(req.user.id))));

router.put('/:type(company|job)/:id(\\d+)', verifyToken, requireRoles('STUDENT'), wrap(async (req, res) => {
    const review = await service.updateReview(req.user.id, parseReviewType(req.params.type), id(req.params.id), req.body);
    ok(res, review, { message: review.status === 'PUBLISHED' ? 'Đã cập nhật đánh giá' : 'Đã cập nhật, đánh giá đang chờ kiểm duyệt' });
}));

router.post('/:type(company|job)/:id(\\d+)/appeal', verifyToken, requireRoles('STUDENT'), wrap(async (req, res) => {
    ok(res, await service.appealReview(req.user.id, parseReviewType(req.params.type), id(req.params.id), req.body),
        { message: 'Đã gửi khiếu nại, quản trị viên sẽ xem xét' }, 201);
}));

// ---------- Báo cáo vi phạm (mọi người dùng đã đăng nhập, trừ tác giả) ----------
router.post('/:type(company|job)/:id(\\d+)/reports', verifyToken, requireRoles('STUDENT', 'EMPLOYER'), wrap(async (req, res) => {
    ok(res, await service.reportReview(req.user, parseReviewType(req.params.type), id(req.params.id), req.body),
        { message: 'Đã gửi báo cáo, quản trị viên sẽ xem xét' }, 201);
}));

// ---------- Nhà tuyển dụng: chỉ xem, phản hồi, báo cáo (không sửa review) ----------
router.get('/employer/overview', verifyToken, requireRoles('EMPLOYER'), wrap(async (req, res) => ok(res, await service.employerOverview(req.user.id))));

router.get('/employer/:type(company|job)', verifyToken, requireRoles('EMPLOYER'), wrap(async (req, res) => {
    const r = await service.employerList(req.user.id, parseReviewType(req.params.type), req.query);
    ok(res, r.data, { pagination: r.pagination });
}));

router.put('/:type(company|job)/:id(\\d+)/reply', verifyToken, requireRoles('EMPLOYER'), wrap(async (req, res) => {
    ok(res, await service.upsertReply(req.user.id, parseReviewType(req.params.type), id(req.params.id), req.body), { message: 'Đã lưu phản hồi' });
}));

router.delete('/:type(company|job)/:id(\\d+)/reply', verifyToken, requireRoles('EMPLOYER'), wrap(async (req, res) => {
    await service.deleteReply(req.user.id, parseReviewType(req.params.type), id(req.params.id));
    ok(res, null, { message: 'Đã xóa phản hồi' });
}));

module.exports = router;
