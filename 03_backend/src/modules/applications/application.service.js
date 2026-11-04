const db = require('../../config/db');
const applicationRepository = require('../../database/repositories/application.repository');
const jobRepository = require('../../database/repositories/job.repository');
const { NotFoundError, ForbiddenError, ConflictError, AppError, StateTransitionInvalidError } = require('../../utils/app-error');

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

        const newApp = await applicationRepository.create(job_id, studentId, { cover_letter, cv_url });

        // Tự động tạo thông báo cho Nhà tuyển dụng (Event: Student nộp đơn ứng tuyển)
        try {
            await db.query(
                `INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    job.employer_id,
                    'APPLICATION',
                    'Ứng viên mới nộp hồ sơ',
                    `Một sinh viên vừa nộp hồ sơ ứng tuyển vào vị trí "${job.title}".`,
                    'APPLICATION',
                    newApp.id
                ]
            );
        } catch (notifErr) {
            console.error('Lỗi tạo notification application:', notifErr.message);
        }

        return newApp;
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
        // A3 RULE: Chặn hoàn toàn việc set ACCEPTED qua PATCH /applications/:id/status
        if (status === 'ACCEPTED') {
            throw new StateTransitionInvalidError('ACCEPTED chỉ được set qua POST /jobs/:jobId/selections (A3 RULE)');
        }

        const app = await applicationRepository.findById(applicationId);
        if (!app) {
            throw new NotFoundError('Không tìm thấy đơn ứng tuyển');
        }

        if (app.employer_id !== employerId) {
            throw new ForbiddenError('Bạn không có quyền xét duyệt đơn ứng tuyển này');
        }

        const fromStatus = app.status;
        const updated = await applicationRepository.updateStatus(applicationId, status);

        // Ghi lịch sử trạng thái vào application_histories
        if (fromStatus !== status) {
            try {
                await db.query(
                    `INSERT INTO application_histories (application_id, from_status, to_status, changed_by, note)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [applicationId, fromStatus, status, employerId, `Cập nhật trạng thái từ ${fromStatus} sang ${status}`]
                );
            } catch (histErr) {
                console.error('Lỗi ghi application_histories:', histErr.message);
            }

            try {
                const statusTitle = status === 'SHORTLISTED' ? 'Hồ sơ ứng tuyển được đưa vào danh sách rút gọn' : 'Cập nhật trạng thái ứng tuyển';
                const statusBody = status === 'SHORTLISTED'
                    ? 'Nhà tuyển dụng đã đưa hồ sơ ứng tuyển của bạn vào danh sách xem xét rút gọn.'
                    : 'Hồ sơ ứng tuyển của bạn đã chuyển sang trạng thái: ' + status;
                await db.query(
                    'INSERT INTO notifications (user_id, type, title, body, target_type, target_id) VALUES ($1, $2, $3, $4, \'APPLICATION\', $5)',
                    [app.student_id, 'APPLICATION_' + status, statusTitle, statusBody, applicationId]
                );
            } catch (notifErr) {
                console.error('Lỗi tạo notification application status:', notifErr.message);
            }
        }

        return updated;
    }
}

module.exports = new ApplicationService();
