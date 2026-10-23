const { AppError } = require('../errors/app-error');

function validateReview(req, res, next) {
    const { job_id, reviewee_id, rating, comment } = req.body;
    const errors = [];

    if (!job_id || isNaN(parseInt(job_id, 10))) {
        errors.push('Mã công việc (job_id) không hợp lệ');
    }

    if (!reviewee_id || isNaN(parseInt(reviewee_id, 10))) {
        errors.push('Mã người được đánh giá (reviewee_id) không hợp lệ');
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        errors.push('Điểm đánh giá phải từ 1 đến 5 sao');
    }

    if (!comment || comment.trim().length < 5) {
        errors.push('Nội dung nhận xét tối thiểu 5 ký tự');
    }

    if (errors.length > 0) {
        return next(new AppError('Dữ liệu đánh giá không hợp lệ', 400, errors));
    }

    next();
}

module.exports = {
    validateReview,
};
