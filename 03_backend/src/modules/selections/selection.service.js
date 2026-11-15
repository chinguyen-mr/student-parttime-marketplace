const db = require('../../config/db');
const jobRepository = require('../../database/repositories/job.repository');
const applicationRepository = require('../../database/repositories/application.repository');
const { 
    NotFoundError, 
    ForbiddenError, 
    ConflictError, 
    QuantityExceededError, 
    StateTransitionInvalidError 
} = require('../../utils/app-error');

class SelectionService {
    /**
     * A3 RULE: CHỈ endpoint này được phép chuyển Application sang ACCEPTED 
     * và khởi tạo Work Assignment chính thức.
     */
    async createSelections(jobId, employerId, payload) {
        // Payload: mảng applicationIds hoặc object { applicationIds }
        const applicationIds = Array.isArray(payload) ? payload : payload?.applicationIds;

        // 1. Kiểm tra sự tồn tại của Job
        const job = await jobRepository.findById(jobId);
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }

        // 2. Verify Employer sở hữu job này (403 FORBIDDEN)
        if (job.employer_id !== employerId) {
            throw new ForbiddenError('Bạn không có quyền lựa chọn ứng viên cho tin tuyển dụng của nhà tuyển dụng khác');
        }

        // 3. Verify job status = OPEN (409 CONFLICT)
        if (job.status !== 'OPEN') {
            throw new ConflictError('Tin tuyển dụng không ở trạng thái mở nhận việc (OPEN)');
        }

        return await this._processApplicationSelections(job, applicationIds);
    }

    async _processApplicationSelections(job, applicationIds) {
        const jobId = job.id;
        const uniqueAppIds = [...new Set(applicationIds.map(id => parseInt(id, 10)))];
        const validApplications = [];

        for (const appId of uniqueAppIds) {
            const app = await applicationRepository.findById(appId);
            if (!app) {
                throw new NotFoundError(`Không tìm thấy đơn ứng tuyển #${appId}`);
            }

            if (parseInt(app.job_id, 10) !== parseInt(jobId, 10)) {
                throw new ConflictError(`Đơn ứng tuyển #${appId} không thuộc tin tuyển dụng này`);
            }

            if (app.status === 'ACCEPTED') {
                throw new StateTransitionInvalidError(`Đơn ứng tuyển #${appId} đã được chấp nhận trước đó`);
            }
            if (app.status === 'REJECTED') {
                throw new StateTransitionInvalidError(`Đơn ứng tuyển #${appId} đã bị từ chối, không thể chấp nhận`);
            }

            validApplications.push(app);
        }

        let currentAcceptedCount = 0;
        try {
            const countRes = await db.query(
                `SELECT COUNT(*) FROM applications WHERE job_id = $1 AND status = 'ACCEPTED'`,
                [jobId]
            );
            currentAcceptedCount = parseInt(countRes.rows[0].count, 10) || 0;
        } catch (e) {
            currentAcceptedCount = 0;
        }

        const maxQuantity = parseInt(job.headcount || job.quantity_required || job.quantity || 10, 10);
        if (currentAcceptedCount + validApplications.length > maxQuantity) {
            throw new QuantityExceededError(
                `Số lượng ứng viên lựa chọn (${currentAcceptedCount + validApplications.length}) vượt quá chỉ tiêu tuyển dụng (${maxQuantity})`
            );
        }

        const client = await db.pool.connect();
        const createdAssignments = [];
        try {
            await client.query('BEGIN');

            for (const app of validApplications) {
                await client.query(
                    `UPDATE applications 
                     SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $1`,
                    [app.id]
                );

                const assignRes = await client.query(
                    `INSERT INTO work_assignments (job_id, student_id, application_id, status)
                     VALUES ($1, $2, $3, 'NOT_STARTED')
                     ON CONFLICT (application_id) DO UPDATE SET status = 'NOT_STARTED', updated_at = CURRENT_TIMESTAMP
                     RETURNING *`,
                    [jobId, app.student_id, app.id]
                );
                createdAssignments.push(assignRes.rows[0]);
            }

            // Tự động chuyển trạng thái tin tuyển dụng sang FILLED khi tuyển đủ chỉ tiêu
            if (currentAcceptedCount + validApplications.length >= maxQuantity) {
                await client.query(
                    `UPDATE jobs SET status = 'FILLED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                    [jobId]
                );
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        for (const app of validApplications) {
            try {
                await db.query(
                    `INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
                     VALUES ($1, 'APPLICATION_ACCEPTED', 'Ứng tuyển được chấp nhận', $2, 'APPLICATION', $3)`,
                    [
                        app.student_id,
                        `Đơn ứng tuyển của bạn cho công việc "${job.title}" đã được chấp nhận! Hợp đồng làm việc đã được khởi tạo.`,
                        app.id
                    ]
                );
            } catch (notifErr) {
                // Ignore notif error
            }
        }

        return {
            job_id: jobId,
            accepted_count: validApplications.length,
            assignments: createdAssignments,
            message: `Lựa chọn thành công ${validApplications.length} ứng viên và đã khởi tạo hợp đồng làm việc`
        };
    }
}

module.exports = new SelectionService();
