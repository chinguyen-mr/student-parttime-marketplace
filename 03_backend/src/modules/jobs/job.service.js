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

    async updateJob(jobId, employerId, jobData) {
        const job = await jobRepository.findById(jobId);
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }

        // AC1 & IDOR check: Chỉ Nhà tuyển dụng tạo ra tin mới được chỉnh sửa
        if (job.employer_id !== employerId) {
            throw new ForbiddenError('Bạn không có quyền chỉnh sửa tin tuyển dụng của nhà tuyển dụng khác');
        }

        // AC5: Khóa chức năng chỉnh sửa nếu Job đã ở trạng thái "Đã nhận người" (FILLED) hoặc "Hoàn thành" (COMPLETED)
        if (['FILLED', 'COMPLETED'].includes(job.status)) {
            throw new AppError('Không thể chỉnh sửa tin tuyển dụng đã nhận người hoặc đã hoàn thành', 400);
        }

        // Merge fields while preserving existing values if not specified
        const updatePayload = {
            title: jobData.title !== undefined ? jobData.title : job.title,
            description: jobData.description !== undefined ? jobData.description : job.description,
            requirements: jobData.requirements !== undefined ? jobData.requirements : job.requirements,
            category: jobData.category !== undefined ? jobData.category : job.category,
            location: jobData.location !== undefined ? jobData.location : job.location,
            salary_type: jobData.salary_type !== undefined ? jobData.salary_type : job.salary_type,
            salary: jobData.salary !== undefined ? Number(jobData.salary) : job.salary,
            work_type: jobData.work_type !== undefined ? jobData.work_type : job.work_type,
            application_deadline: jobData.application_deadline !== undefined ? jobData.application_deadline : job.application_deadline,
            job_banner_url: jobData.job_banner_url !== undefined ? jobData.job_banner_url : job.job_banner_url,
            work_schedules: jobData.work_schedules !== undefined ? jobData.work_schedules : undefined,
        };

        return jobRepository.update(jobId, updatePayload);
    }

    async updateJobSchedules(jobId, employerId, schedules) {
        const job = await jobRepository.findById(jobId);
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }

        if (job.employer_id !== employerId) {
            throw new ForbiddenError('Bạn không có quyền chỉnh sửa ca làm việc của tin tuyển dụng khác');
        }

        if (!Array.isArray(schedules)) {
            throw new AppError('Dữ liệu schedules phải là một mảng ca làm việc', 400);
        }

        // Validate các ca làm việc
        for (const s of schedules) {
            const day = parseInt(s.day_of_week, 10);
            if (isNaN(day) || day < 1 || day > 7) {
                throw new AppError('day_of_week phải từ 1 (Chủ Nhật) đến 7 (Thứ Bảy)', 400);
            }
            if (!s.start_time || !s.end_time || s.end_time <= s.start_time) {
                throw new AppError(`Khung giờ ca không hợp lệ (${s.start_time} - ${s.end_time}): Giờ kết thúc phải lớn hơn giờ bắt đầu`, 400);
            }
            if (s.min_hours_per_shift !== undefined && parseFloat(s.min_hours_per_shift) < 0) {
                throw new AppError('Thời lượng ca tối thiểu (min_hours_per_shift) không được âm', 400);
            }
        }

        return jobRepository.updateSchedules(jobId, schedules);
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
