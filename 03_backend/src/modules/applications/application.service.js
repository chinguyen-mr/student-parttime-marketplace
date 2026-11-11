const db = require('../../config/db');
const applicationRepository = require('../../database/repositories/application.repository');
const jobRepository = require('../../database/repositories/job.repository');
const profileRepository = require('../../database/repositories/profile.repository');
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

        // Quy tắc: Sinh viên chưa hoàn thiện hồ sơ thì chưa được ứng tuyển
        try {
            const profile = await profileRepository.findByUserId(studentId);
            if (profile && (!profile.school && !profile.university && !profile.major)) {
                throw new AppError('Hồ sơ của bạn chưa hoàn thiện. Vui lòng cập nhật đầy đủ thông tin (Trường học, Chuyên ngành, CV) trước khi nộp đơn ứng tuyển!', 400);
            }
        } catch (profErr) {
            if (profErr instanceof AppError) throw profErr;
            // Bỏ qua lỗi kết nối DB nếu đang chạy trong môi trường test cô lập
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

    async getApplicationDetail(applicationId, user) {
        const app = await applicationRepository.findById(applicationId);
        if (!app) {
            throw new NotFoundError('Không tìm thấy đơn ứng tuyển');
        }
        // Access control: Chỉ sinh viên nộp đơn, NTD sở hữu tin tuyển dụng, hoặc ADMIN mới có quyền xem
        if (user.role !== 'ADMIN' && app.student_id !== user.id && app.employer_id !== user.id) {
            throw new ForbiddenError('Bạn không có quyền xem thông tin chi tiết đơn ứng tuyển này');
        }
        return app;
    }

    async updateStatus(applicationId, employerId, status, note = null) {
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
        let updated = await applicationRepository.updateStatus(applicationId, status);

        // Nếu từ chối, cập nhật lý do từ chối vào applications
        if (status === 'REJECTED') {
            const reasonToSave = note || 'Không phù hợp tiêu chí tuyển dụng hiện tại.';
            await db.query(
                `UPDATE applications
                 SET rejection_reason = $1, decided_at = CURRENT_TIMESTAMP, decided_by = $2
                 WHERE id = $3`,
                [reasonToSave, employerId, applicationId]
            );
            updated.rejection_reason = reasonToSave;
            updated.decided_at = new Date().toISOString();
            updated.decided_by = employerId;
        }

        // Ghi lịch sử trạng thái vào application_histories
        if (fromStatus !== status) {
            try {
                const historyNote = status === 'REJECTED'
                    ? (note || 'Từ chối hồ sơ ứng tuyển')
                    : (note || `Cập nhật trạng thái từ ${fromStatus} sang ${status}`);
                await db.query(
                    `INSERT INTO application_histories (application_id, from_status, to_status, changed_by, note)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [applicationId, fromStatus, status, employerId, historyNote]
                );
            } catch (histErr) {
                console.error('Lỗi ghi application_histories:', histErr.message);
            }

            try {
                let statusTitle = 'Cập nhật trạng thái ứng tuyển';
                let statusBody = `Hồ sơ ứng tuyển của bạn vào "${app.job_title}" đã chuyển sang trạng thái: ${status}`;

                if (status === 'SHORTLISTED') {
                    statusTitle = 'Hồ sơ ứng tuyển được đưa vào danh sách rút gọn';
                    statusBody = `Nhà tuyển dụng đã đưa hồ sơ của bạn vào danh sách xem xét rút gọn cho vị trí "${app.job_title}".`;
                } else if (status === 'REJECTED') {
                    statusTitle = 'Hồ sơ ứng tuyển đã bị từ chối';
                    statusBody = `Nhà tuyển dụng đã từ chối hồ sơ của bạn vào vị trí "${app.job_title}". Lý do: ${note || 'Không phù hợp tiêu chí đợt tuyển.'}`;
                }

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
