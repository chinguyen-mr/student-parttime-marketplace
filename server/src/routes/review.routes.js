const express = require('express');
const router = express.Router();
const reviewService = require('../services/review.service');
const { validateReview } = require('../validators/review.validator');
const { verifyToken } = require('../middleware/auth.middleware');

// POST /api/reviews (UC-09: Đánh giá sau khi hoàn thành công việc)
router.post('/', verifyToken, validateReview, async (req, res, next) => {
    try {
        const review = await reviewService.createReview(req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Gửi đánh giá thành công',
            data: review,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/reviews/user/:userId (Xem đánh giá & điểm uy tín của 1 người dùng)
router.get('/user/:userId', async (req, res, next) => {
    try {
        const result = await reviewService.getUserReviews(parseInt(req.params.userId, 10));
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
