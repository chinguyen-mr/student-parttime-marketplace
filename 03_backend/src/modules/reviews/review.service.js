const reviewRepository = require('../../database/repositories/review.repository');
const jobRepository = require('../../database/repositories/job.repository');
const applicationRepository = require('../../database/repositories/application.repository');
const { NotFoundError, ForbiddenError, ConflictError, AppError } = require('../../utils/app-error');

class ReviewService {
    async createReview(reviewerId, body) {
        // Body JSON có thể gửi ID dạng chuỗi → chuẩn hóa để so sánh === đúng
        const job_id = parseInt(body.job_id, 10);
        const reviewee_id = parseInt(body.reviewee_id, 10);
        const { rating, comment } = body;
        const job = await jobRepository.findById(job_id);
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin công việc');
        }

        // Quy tắc 1: Công việc phải hoàn thành mới được đánh giá — cả tin đã COMPLETED,
        // hoặc phần việc của chính sinh viên này đã COMPLETED (tin tuyển nhiều người chưa đóng)
        if (job.status !== 'COMPLETED') {
            const studentId = job.employer_id === reviewerId ? reviewee_id : reviewerId;
            const db = require('../../config/db');
            const wa = await db.query(
                `SELECT status FROM work_assignments WHERE job_id = $1 AND student_id = $2 ORDER BY id DESC LIMIT 1`,
                [job_id, studentId]
            ).catch(() => ({ rows: [] }));
            if (wa.rows[0]?.status !== 'COMPLETED') {
                throw new AppError('Chỉ có thể đánh giá sau khi công việc đã được xác nhận Hoàn thành (COMPLETED)', 400);
            }
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

        const newReview = await reviewRepository.create(job_id, reviewerId, reviewee_id, rating, comment);

        // Tạo thông báo cho đối tác nhận được đánh giá
        try {
            const db = require('../../config/db');
            await db.query(
                `INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
                 VALUES ($1, 'REVIEW', 'Bạn nhận được đánh giá mới', $2, 'REVIEW', $3)`,
                [
                    reviewee_id,
                    `Đối tác đã đánh giá ${rating} sao cho bạn trong công việc "${job.title}".`,
                    newReview.id
                ]
            );
        } catch (notifErr) {
            console.error('Lỗi gửi notification review:', notifErr.message);
        }

        return newReview;
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
