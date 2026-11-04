const db = require('../../config/db');
const jobRepository = require('../../database/repositories/job.repository');
const { 
    NotFoundError, 
    ForbiddenError, 
    ConflictError, 
    StateTransitionInvalidError 
} = require('../../utils/app-error');

class ProposalService {
    /**
     * Nộp đề xuất cho công việc Freelance (Role STUDENT)
     */
    async createProposal(studentId, { job_id, proposal_text, estimated_duration, proposed_price }) {
        const jobId = parseInt(job_id, 10);
        const job = await jobRepository.findById(jobId);

        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }

        // Chặn: Job không phải hình thức FREELANCE
        if (job.work_type !== 'FREELANCE') {
            throw new StateTransitionInvalidError('Công việc này không phải hình thức Freelance, vui lòng nộp đơn ứng tuyển Part-time thông thường');
        }

        // Chặn: Job không ở trạng thái OPEN
        if (job.status !== 'OPEN') {
            throw new ConflictError('Tin tuyển dụng này hiện đã đóng hoặc không còn nhận đề xuất');
        }

        // Chặn: Sinh viên đã nộp đề xuất cho job này rồi (UNIQUE constraint)
        const checkExisting = await db.query(
            `SELECT id FROM freelance_proposals WHERE job_id = $1 AND student_id = $2`,
            [jobId, studentId]
        );
        if (checkExisting.rows.length > 0) {
            throw new ConflictError('Bạn đã nộp đề xuất cho công việc Freelance này rồi. Không thể nộp trùng (DUPLICATE_RESOURCE)');
        }

        // Insert proposal
        const price = proposed_price ? parseInt(proposed_price, 10) : null;
        const res = await db.query(
            `INSERT INTO freelance_proposals (job_id, student_id, proposal_text, estimated_duration, proposed_price, status)
             VALUES ($1, $2, $3, $4, $5, 'SUBMITTED')
             RETURNING *`,
            [jobId, studentId, proposal_text.trim(), estimated_duration || null, price]
        );

        const newProposal = res.rows[0];

        // Tạo thông báo cho Nhà tuyển dụng
        try {
            await db.query(
                `INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
                 VALUES ($1, 'PROPOSAL_RECEIVED', 'Bạn nhận được đề xuất Freelance mới', $2, 'PROPOSAL', $3)`,
                [job.employer_id, `Một sinh viên vừa gửi đề xuất báo giá cho dự án "${job.title}".`, newProposal.id]
            );
        } catch (e) {
            console.error('Lỗi tạo notification:', e.message);
        }

        return newProposal;
    }

    /**
     * Lấy chi tiết một Proposal
     */
    async getProposalById(proposalId, userId, userRole) {
        const id = parseInt(proposalId, 10);
        const res = await db.query(
            `SELECT p.*, j.title AS job_title, j.category, j.location, j.employer_id,
                    u.full_name AS student_name, u.email AS student_email, u.phone AS student_phone,
                    pr.school AS university, pr.major,
                    emp.full_name AS employer_name
             FROM freelance_proposals p
             JOIN jobs j ON j.id = p.job_id
             JOIN users u ON u.id = p.student_id
             LEFT JOIN student_profiles pr ON pr.user_id = u.id
             JOIN users emp ON emp.id = j.employer_id
             WHERE p.id = $1`,
            [id]
        );

        if (res.rows.length === 0) {
            throw new NotFoundError('Không tìm thấy đề xuất này');
        }

        const prop = res.rows[0];

        // Kiểm tra quyền: Chỉ student nộp hoặc employer sở hữu job mới được xem
        if (userRole !== 'ADMIN' && prop.student_id !== userId && prop.employer_id !== userId) {
            throw new ForbiddenError('Bạn không có quyền truy cập đề xuất này');
        }

        return prop;
    }

    /**
     * Cập nhật trạng thái Proposal (Employer review / reject)
     * A3 RULE: Tuyệt đối chặn ACCEPTED tại đây.
     */
    async updateStatus(proposalId, employerId, newStatus) {
        if (newStatus === 'ACCEPTED') {
            throw new StateTransitionInvalidError('ACCEPTED chỉ được set qua POST /jobs/:jobId/selections (A3 RULE)');
        }

        const id = parseInt(proposalId, 10);
        const res = await db.query(
            `SELECT p.*, j.employer_id, j.title AS job_title 
             FROM freelance_proposals p
             JOIN jobs j ON j.id = p.job_id
             WHERE p.id = $1`,
            [id]
        );

        if (res.rows.length === 0) {
            throw new NotFoundError('Không tìm thấy đề xuất này');
        }

        const prop = res.rows[0];

        if (prop.employer_id !== employerId) {
            throw new ForbiddenError('Bạn không có quyền cập nhật đề xuất của tin tuyển dụng khác');
        }

        if (!['SUBMITTED', 'REVIEWING'].includes(prop.status)) {
            throw new StateTransitionInvalidError(`Không thể chuyển trạng thái đề xuất từ "${prop.status}" sang "${newStatus}"`);
        }

        const fromStatus = prop.status;
        const updateRes = await db.query(
            `UPDATE freelance_proposals 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [newStatus, id]
        );

        if (fromStatus !== newStatus) {
            try {
                await db.query(
                    `INSERT INTO proposal_histories (proposal_id, from_status, to_status, changed_by, note)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [id, fromStatus, newStatus, employerId, `Cập nhật trạng thái từ ${fromStatus} sang ${newStatus}`]
                );
            } catch (histErr) {
                console.error('Lỗi ghi proposal_histories:', histErr.message);
            }
        }

        // Tạo thông báo cho sinh viên
        try {
            const notifTitle = newStatus === 'REVIEWING' ? 'Đề xuất của bạn đang được xem xét' : 'Thông báo về đề xuất Freelance';
            const notifBody = newStatus === 'REVIEWING' 
                ? `Nhà tuyển dụng đang đánh giá đề xuất của bạn cho dự án "${prop.job_title}".`
                : `Nhà tuyển dụng đã từ chối đề xuất của bạn cho dự án "${prop.job_title}".`;

            await db.query(
                `INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
                 VALUES ($1, 'PROPOSAL_STATUS_UPDATED', $2, $3, 'PROPOSAL', $4)`,
                [prop.student_id, notifTitle, notifBody, id]
            );
        } catch (e) {
            console.error('Lỗi tạo notification:', e.message);
        }

        return updateRes.rows[0];
    }

    /**
     * Danh sách proposals của sinh viên đăng nhập
     */
    async getStudentProposals(studentId) {
        const res = await db.query(
            `SELECT p.*, j.title AS job_title, j.category, j.location, j.work_type, j.status AS job_status,
                    u.full_name AS employer_name
             FROM freelance_proposals p
             JOIN jobs j ON j.id = p.job_id
             JOIN users u ON u.id = j.employer_id
             WHERE p.student_id = $1
             ORDER BY p.submitted_at DESC`,
            [studentId]
        );
        return res.rows;
    }

    /**
     * Danh sách proposals nộp vào một job của nhà tuyển dụng
     */
    async getJobProposals(jobId, employerId) {
        const job = await jobRepository.findById(jobId);
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }
        if (job.employer_id !== employerId) {
            throw new ForbiddenError('Bạn không có quyền xem danh sách đề xuất của công việc này');
        }

        const res = await db.query(
            `SELECT p.*, u.full_name AS student_name, u.email AS student_email, u.phone AS student_phone,
                    pr.school AS university, pr.major, pr.avatar_url AS student_avatar
             FROM freelance_proposals p
             JOIN users u ON u.id = p.student_id
             LEFT JOIN student_profiles pr ON pr.user_id = u.id
             WHERE p.job_id = $1
             ORDER BY p.submitted_at DESC`,
            [jobId]
        );
        return res.rows;
    }

    /**
     * Danh sách tất cả proposals thuộc về các jobs của employer
     */
    async getEmployerProposals(employerId) {
        const res = await db.query(
            `SELECT p.*, j.title AS job_title, j.category, j.work_type, j.status AS job_status,
                    u.full_name AS student_name, u.email AS student_email, u.phone AS student_phone,
                    pr.school AS university, pr.major
             FROM freelance_proposals p
             JOIN jobs j ON j.id = p.job_id
             JOIN users u ON u.id = p.student_id
             LEFT JOIN student_profiles pr ON pr.user_id = u.id
             WHERE j.employer_id = $1
             ORDER BY p.submitted_at DESC`,
            [employerId]
        );
        return res.rows;
    }
}

module.exports = new ProposalService();
