const applicationRepository = require('../repositories/application.repository');
const jobRepository = require('../repositories/job.repository');
const { NotFoundError, ForbiddenError, ConflictError, AppError } = require('../errors/app-error');

class ApplicationService {
    async applyForJob(studentId, { job_id, cover_letter, cv_url }) {
        const job = await jobRepository.findById(job_id);
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng này');
        }

        // Quy tắc 1: Không thể ứng tuyển vào tin tuyển dụng của chính mình
        if (job.employer_id === studentId) {
            throw new AppError('Nhà tuyển dụng không thể tự ứng tuyển vào tin của chính mình', 400);
        }

        // Quy tắc 2: Tin tuyển dụng phải ở trạng thái Đang tuyển (OPEN) và Đã duyệt (APPROVED)
        if (job.status !== 'OPEN') {
            throw new AppError('Tin tuyển dụng này hiện đã đóng hoặc không còn nhận ứng viên', 400);
        }

        if (job.moderation_status !== 'APPROVED') {
            throw new AppError('Tin tuyển dụng chưa được Quản trị viên duyệt', 400);
        }

        // Quy tắc 3: Không cho phép ứng tuyển trùng (1 sinh viên chỉ nộp 1 lần cho 1 công việc)
        const existingApp = await applicationRepository.findByJobAndStudent(job_id, studentId);
        if (existingApp) {
            throw new ConflictError('Bạn đã nộp đơn ứng tuyển cho công việc này rồi. Không thể nộp đơn trùng.');
        }

        return applicationRepository.create(job_id, studentId, { cover_letter, cv_url });
    }

    async getJobApplications(jobId, employerId) {
        const job = await jobRepository.findById(jobId);
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }

        if (job.employer_id !== employerId) {
            throw new ForbiddenError('Bạn không có quyền xem ứng viên của công việc này');
        }

        return applicationRepository.findByJobId(jobId);
    }

    async getStudentApplications(studentId) {
        return applicationRepository.findByStudentId(studentId);
    }

    async updateStatus(applicationId, employerId, status) {
        const app = await applicationRepository.findById(applicationId);
        if (!app) {
            throw new NotFoundError('Không tìm thấy đơn ứng tuyển');
        }

        if (app.employer_id !== employerId) {
            throw new ForbiddenError('Bạn không có quyền xét duyệt đơn ứng tuyển này');
        }

        return applicationRepository.updateStatus(applicationId, status);
    }
}

module.exports = new ApplicationService();
