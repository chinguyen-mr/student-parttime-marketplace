const db = require('../../config/db');
const { 
    NotFoundError, 
    ForbiddenError, 
    StateTransitionInvalidError 
} = require('../../utils/app-error');

class AssignmentService {
    /**
     * Danh sách hợp đồng/công việc của Sinh viên
     */
    async getMyAssignments(studentId) {
        const res = await db.query(
            `SELECT wa.*, 
                    j.title AS job_title, j.category, j.work_type, j.location, j.salary, j.salary_type,
                    emp.full_name AS employer_name, emp.email AS employer_email, emp.phone AS employer_phone,
                    app.cover_letter,
                    prop.proposal_text, prop.proposed_price, prop.estimated_duration
             FROM work_assignments wa
             JOIN jobs j ON j.id = wa.job_id
             JOIN users emp ON emp.id = j.employer_id
             LEFT JOIN applications app ON app.id = wa.application_id
             LEFT JOIN freelance_proposals prop ON prop.id = wa.proposal_id
             WHERE wa.student_id = $1
             ORDER BY wa.created_at DESC`,
            [studentId]
        );
        return res.rows;
    }

    /**
     * Danh sách hợp đồng/công việc thuộc các tin của Nhà tuyển dụng
     */
    async getEmployerAssignments(employerId) {
        const res = await db.query(
            `SELECT wa.*, 
                    j.title AS job_title, j.category, j.work_type, j.location,
                    stu.full_name AS student_name, stu.email AS student_email, stu.phone AS student_phone,
                    pr.school AS university, pr.major,
                    app.cover_letter,
                    prop.proposal_text, prop.proposed_price, prop.estimated_duration
             FROM work_assignments wa
             JOIN jobs j ON j.id = wa.job_id
             JOIN users stu ON stu.id = wa.student_id
             LEFT JOIN student_profiles pr ON pr.user_id = stu.id
             LEFT JOIN applications app ON app.id = wa.application_id
             LEFT JOIN freelance_proposals prop ON prop.id = wa.proposal_id
             WHERE j.employer_id = $1
             ORDER BY wa.created_at DESC`,
            [employerId]
        );
        return res.rows;
    }

    /**
     * Xem chi tiết một Assignment
     */
    async getAssignmentById(assignmentId, userId, userRole) {
        const id = parseInt(assignmentId, 10);
        const res = await db.query(
            `SELECT wa.*, 
                    j.title AS job_title, j.category, j.work_type, j.location, j.salary, j.salary_type, j.employer_id,
                    emp.full_name AS employer_name, emp.email AS employer_email, emp.phone AS employer_phone,
                    stu.full_name AS student_name, stu.email AS student_email, stu.phone AS student_phone,
                    pr.school AS university, pr.major,
                    app.cover_letter,
                    prop.proposal_text, prop.proposed_price, prop.estimated_duration
             FROM work_assignments wa
             JOIN jobs j ON j.id = wa.job_id
             JOIN users emp ON emp.id = j.employer_id
             JOIN users stu ON stu.id = wa.student_id
             LEFT JOIN student_profiles pr ON pr.user_id = stu.id
             LEFT JOIN applications app ON app.id = wa.application_id
             LEFT JOIN freelance_proposals prop ON prop.id = wa.proposal_id
             WHERE wa.id = $1`,
            [id]
        );

        if (res.rows.length === 0) {
            throw new NotFoundError('Không tìm thấy hợp đồng công việc');
        }

        const assignment = res.rows[0];

        if (userRole !== 'ADMIN' && assignment.student_id !== userId && assignment.employer_id !== userId) {
            throw new ForbiddenError('Bạn không có quyền truy cập hợp đồng công việc này');
        }

        return assignment;
    }

    /**
     * Cập nhật trạng thái Assignment (NOT_STARTED -> IN_PROGRESS -> COMPLETED)
     */
    async updateStatus(assignmentId, employerId, newStatus) {
        const id = parseInt(assignmentId, 10);
        const res = await db.query(
            `SELECT wa.*, j.employer_id, j.title AS job_title 
             FROM work_assignments wa
             JOIN jobs j ON j.id = wa.job_id
             WHERE wa.id = $1`,
            [id]
        );

        if (res.rows.length === 0) {
            throw new NotFoundError('Không tìm thấy hợp đồng công việc');
        }

        const wa = res.rows[0];

        // Verify employer owns the job
        if (wa.employer_id !== employerId) {
            throw new ForbiddenError('Bạn không có quyền cập nhật hợp đồng của tin tuyển dụng khác');
        }

        const currentStatus = wa.status;

        // Verify State Transitions
        if (currentStatus === 'NOT_STARTED') {
            if (newStatus === 'COMPLETED') {
                throw new StateTransitionInvalidError('Không thể chuyển thẳng từ NOT_STARTED sang COMPLETED (phải qua IN_PROGRESS)');
            }
            if (!['IN_PROGRESS', 'TERMINATED', 'RESIGNED'].includes(newStatus)) {
                throw new StateTransitionInvalidError(`Không thể chuyển trạng thái từ "${currentStatus}" sang "${newStatus}"`);
            }
        } else if (currentStatus === 'IN_PROGRESS') {
            if (!['COMPLETED', 'TERMINATED', 'RESIGNED'].includes(newStatus)) {
                throw new StateTransitionInvalidError(`Không thể chuyển trạng thái từ "${currentStatus}" sang "${newStatus}"`);
            }
        } else if (['COMPLETED', 'TERMINATED', 'RESIGNED'].includes(currentStatus)) {
            throw new StateTransitionInvalidError(`Không thể thay đổi trạng thái hợp đồng đã kết thúc (${currentStatus})`);
        }

        const updateRes = await db.query(
            `UPDATE work_assignments 
             SET status = $1, 
                 completed_at = CASE WHEN $1 = 'COMPLETED' THEN CURRENT_TIMESTAMP ELSE completed_at END,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [newStatus, id]
        );

        // Tự động chuyển trạng thái tin tuyển dụng sang COMPLETED nếu mọi phân công đều đã hoàn thành
        if (newStatus === 'COMPLETED') {
            try {
                const uncompletedRes = await db.query(
                    `SELECT COUNT(*) FROM work_assignments WHERE job_id = $1 AND status != 'COMPLETED'`,
                    [wa.job_id]
                );
                const count = uncompletedRes?.rows?.[0]?.count ? parseInt(uncompletedRes.rows[0].count, 10) : null;
                if (count === 0) {
                    await db.query(
                        `UPDATE jobs SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                        [wa.job_id]
                    );
                }
            } catch (jobErr) {
                // Safe catch for mock DB environments
            }
        }

        // Tạo thông báo cho Sinh viên
        try {
            const title = newStatus === 'IN_PROGRESS' 
                ? 'Công việc đã bắt đầu' 
                : 'Công việc đã hoàn thành';
            const body = newStatus === 'IN_PROGRESS'
                ? `Công việc "${wa.job_title}" đã chuyển sang trạng thái đang thực hiện (IN_PROGRESS).`
                : `Công việc "${wa.job_title}" đã được xác nhận hoàn thành (COMPLETED). Hãy để lại nhận xét đánh giá!`;

            await db.query(
                `INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
                 VALUES ($1, $2, $3, $4, 'ASSIGNMENT', $5)`,
                [wa.student_id, `ASSIGNMENT_${newStatus}`, title, body, id]
            );
        } catch (notifErr) {
            console.error('Lỗi tạo notification assignment:', notifErr.message);
        }

        return updateRes.rows[0];
    }
}

module.exports = new AssignmentService();
