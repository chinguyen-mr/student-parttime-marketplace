const jobRepository = require('../../database/repositories/job.repository');
const { NotFoundError, ForbiddenError, AppError } = require('../../utils/app-error');

class JobService {
    async createJob(employerId, jobData) {
        return jobRepository.create(employerId, jobData);
    }

    async getJobById(jobId) {
        const job = await jobRepository.findById(jobId);
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng này');
        }
        return job;
    }

    async searchJobs(filters) {
        return jobRepository.findAllWithFilter(filters);
    }

    async getEmployerJobs(employerId) {
        return jobRepository.findByEmployerId(employerId);
    }

    async updateJobStatus(jobId, employerId, newStatus) {
        const job = await jobRepository.findById(jobId);
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }

        if (job.employer_id !== employerId) {
            throw new ForbiddenError('Bạn không có quyền chỉnh sửa tin tuyển dụng của nhà tuyển dụng khác');
        }

        // Quy tắc chuyển đổi trạng thái:
        // OPEN -> FILLED / CLOSED
        // FILLED -> COMPLETED / CLOSED
        // COMPLETED -> không thể mở lại thành OPEN
        if (job.status === 'COMPLETED' && newStatus === 'OPEN') {
            throw new AppError('Công việc đã hoàn thành không thể chuyển lại trạng thái Đang tuyển', 400);
        }

        return jobRepository.updateStatus(jobId, newStatus);
    }

    async getRelatedJobs(jobId) {
        const job = await jobRepository.findById(jobId);
        if (!job) return [];
        return jobRepository.findRelatedJobs(jobId, job.category, job.location, 4);
    }

    async toggleSavedJob(userId, jobId) {
        const job = await jobRepository.findById(jobId);
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng để lưu');
        }
        return jobRepository.toggleSavedJob(userId, jobId);
    }

    async getSavedJobIds(userId) {
        return jobRepository.getSavedJobIds(userId);
    }

    async getSavedJobs(userId) {
        return jobRepository.getSavedJobs(userId);
    }
}

module.exports = new JobService();
