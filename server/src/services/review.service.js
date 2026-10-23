const reviewRepository = require('../repositories/review.repository');
const jobRepository = require('../repositories/job.repository');
const applicationRepository = require('../repositories/application.repository');
const { NotFoundError, ForbiddenError, ConflictError, AppError } = require('../errors/app-error');

class ReviewService {
    async createReview(reviewerId, { job_id, reviewee_id, rating, comment }) {
        const job = await jobRepository.findById(job_id);
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin công việc');
        }

        // Quy tắc 1: Công việc phải hoàn thành mới được đánh giá
        if (job.status !== 'COMPLETED') {
            throw new AppError('Chỉ có thể đánh giá sau khi công việc đã được xác nhận Hoàn thành (COMPLETED)', 400);
        }

        // Quy tắc 2: Tự đánh giá chính mình là không hợp lệ
        if (reviewerId === reviewee_id) {
            throw new AppError('Không thể tự đánh giá chính mình', 400);
        }

        // Quy tắc 3: Kiểm tra quan hệ việc làm
        const isEmployer = job.employer_id === reviewerId;
        if (isEmployer) {
            // Nhà tuyển dụng đánh giá sinh viên: Sinh viên phải có đơn ACCEPTED trong việc này
            const app = await applicationRepository.findByJobAndStudent(job_id, reviewee_id);
            if (!app || app.status !== 'ACCEPTED') {
                throw new ForbiddenError('Chỉ có thể đánh giá sinh viên đã được nhận làm công việc này');
            }
        } else {
            // Sinh viên đánh giá nhà tuyển dụng: reviewee_id phải là employer_id và sinh viên phải có đơn ACCEPTED
            if (reviewee_id !== job.employer_id) {
                throw new AppError('Đối tượng đánh giá không phải là nhà tuyển dụng của công việc này', 400);
            }
            const app = await applicationRepository.findByJobAndStudent(job_id, reviewerId);
            if (!app || app.status !== 'ACCEPTED') {
                throw new ForbiddenError('Chỉ sinh viên đã được nhận làm công việc này mới có quyền đánh giá');
            }
        }

        // Quy tắc 4: Mỗi bên chỉ được đánh giá 1 lần cho mỗi công việc
        const existingReview = await reviewRepository.findByJobAndUsers(job_id, reviewerId, reviewee_id);
        if (existingReview) {
            throw new ConflictError('Bạn đã gửi đánh giá cho đối tác này trong công việc này rồi');
        }

        return reviewRepository.create(job_id, reviewerId, reviewee_id, rating, comment);
    }

    async getUserReviews(userId) {
        const reviews = await reviewRepository.findByUserId(userId);
        const stats = await reviewRepository.getAverageRating(userId);
        return {
            stats: {
                average_rating: stats.avg_rating || 0,
                total_reviews: parseInt(stats.total_reviews, 10) || 0,
            },
            reviews,
        };
    }
}

module.exports = new ReviewService();
