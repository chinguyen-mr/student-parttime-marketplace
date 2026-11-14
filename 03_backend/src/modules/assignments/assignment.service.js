const db = require('../../config/db');
const {
    NotFoundError,
    ForbiddenError,
    BadRequestError,
    StateTransitionInvalidError
} = require('../../utils/app-error');

const ACTIVE_STATUSES = ['NOT_STARTED', 'IN_PROGRESS'];
const isHttpUrl = (v) => /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(String(v || ''));

async function notify(userId, type, title, body, assignmentId) {
    await db.query(
        `INSERT INTO notifications (user_id, type, title, body, target_type, target_id) VALUES ($1, $2, $3, $4, 'ASSIGNMENT', $5)`,
        [userId, type, title, body, assignmentId]
    );
}

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
                    myr.rating AS my_review_rating, myr.comment AS my_review_comment, myr.created_at AS my_review_at
             FROM work_assignments wa
             JOIN jobs j ON j.id = wa.job_id
             JOIN users emp ON emp.id = j.employer_id
             LEFT JOIN applications app ON app.id = wa.application_id
             LEFT JOIN LATERAL (SELECT rating, comment, created_at FROM reviews rv
                                WHERE rv.job_id = wa.job_id AND rv.reviewer_id = wa.student_id AND rv.reviewee_id = j.employer_id
                                ORDER BY rv.id DESC LIMIT 1) myr ON true
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
                    pr.school AS university, pr.major, pr.avatar_url AS student_avatar,
                    app.cover_letter,
                    myr.rating AS my_review_rating, myr.comment AS my_review_comment, myr.created_at AS my_review_at
             FROM work_assignments wa
             JOIN jobs j ON j.id = wa.job_id
             JOIN users stu ON stu.id = wa.student_id
             LEFT JOIN student_profiles pr ON pr.user_id = stu.id
             LEFT JOIN applications app ON app.id = wa.application_id
             LEFT JOIN LATERAL (SELECT rating, comment, created_at FROM reviews rv
                                WHERE rv.job_id = wa.job_id AND rv.reviewer_id = j.employer_id AND rv.reviewee_id = wa.student_id
                                ORDER BY rv.id DESC LIMIT 1) myr ON true
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
                    app.cover_letter
             FROM work_assignments wa
             JOIN jobs j ON j.id = wa.job_id
             JOIN users emp ON emp.id = j.employer_id
             JOIN users stu ON stu.id = wa.student_id
             LEFT JOIN student_profiles pr ON pr.user_id = stu.id
             LEFT JOIN applications app ON app.id = wa.application_id
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
             SET status = $1::varchar,
                 completed_at = CASE WHEN $1::varchar = 'COMPLETED' THEN CURRENT_TIMESTAMP ELSE completed_at END,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [newStatus, id]
        );

        // Tự động chuyển trạng thái tin tuyển dụng sang COMPLETED nếu mọi phân công đều đã hoàn thành
        if (newStatus === 'COMPLETED') {
            try {
                const uncompletedRes = await db.query(
                    // Người nghỉ việc / bị chấm dứt cũng là đã kết thúc → không chặn việc đóng tin
                    `SELECT COUNT(*) FROM work_assignments WHERE job_id = $1 AND status NOT IN ('COMPLETED', 'TERMINATED', 'RESIGNED')`,
                    [wa.job_id]
                );
                const count = uncompletedRes?.rows?.[0]?.count ? parseInt(uncompletedRes.rows[0].count, 10) : null;
                if (count === 0) {
                    await db.query(
                        // Chỉ tin đã tuyển đủ (FILLED) mới tự hoàn thành; tin còn chỉ tiêu vẫn tiếp tục nhận đơn
                        `UPDATE jobs SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'FILLED'`,
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

    // ---------- Tiến độ & sản phẩm bàn giao (lưu DB, cả 2 bên cùng xem) ----------

    /** Hợp đồng + kiểm tra người gọi là sinh viên hoặc nhà tuyển dụng của hợp đồng (admin được xem). */
    async getParticipantAssignment(assignmentId, user) {
        const res = await db.query(
            `SELECT wa.id, wa.student_id, wa.status, wa.started_at, j.employer_id, j.title AS job_title
             FROM work_assignments wa JOIN jobs j ON j.id = wa.job_id WHERE wa.id = $1`,
            [parseInt(assignmentId, 10)]
        );
        const wa = res.rows[0];
        if (!wa) throw new NotFoundError('Không tìm thấy hợp đồng công việc');
        if (user.role !== 'ADMIN' && wa.student_id !== user.id && wa.employer_id !== user.id) {
            throw new ForbiddenError('Bạn không có quyền truy cập hợp đồng công việc này');
        }
        return wa;
    }

    async listProgress(assignmentId, user) {
        const wa = await this.getParticipantAssignment(assignmentId, user);
        const res = await db.query(
            `SELECT wp.id, wp.progress_percent, wp.description, wp.created_at, wp.updated_by,
                    u.full_name AS updated_by_name, u.role AS updated_by_role
             FROM work_progress wp JOIN users u ON u.id = wp.updated_by
             WHERE wp.assignment_id = $1 ORDER BY wp.created_at DESC, wp.id DESC`,
            [wa.id]
        );
        return res.rows;
    }

    async addProgress(assignmentId, user, body = {}) {
        const wa = await this.getParticipantAssignment(assignmentId, user);
        if (user.role === 'ADMIN') throw new ForbiddenError('Quản trị viên không cập nhật tiến độ');
        if (!ACTIVE_STATUSES.includes(wa.status)) throw new BadRequestError('Hợp đồng đã kết thúc, không thể cập nhật tiến độ.');
        const description = String(body.description || '').trim();
        if (description.length < 3 || description.length > 1000) throw new BadRequestError('Nội dung tiến độ cần từ 3 đến 1000 ký tự.');
        let percent = null;
        if (body.progress_percent !== undefined && body.progress_percent !== null && body.progress_percent !== '') {
            percent = Number(body.progress_percent);
            if (!Number.isInteger(percent) || percent < 0 || percent > 100) throw new BadRequestError('Phần trăm tiến độ phải là số nguyên 0–100.');
        }
        const ins = await db.query(
            `INSERT INTO work_progress (assignment_id, updated_by, progress_percent, description, started_at)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [wa.id, user.id, percent, description, wa.started_at]
        );
        const other = user.id === wa.student_id ? wa.employer_id : wa.student_id;
        try {
            await notify(other, 'ASSIGNMENT_PROGRESS', 'Cập nhật tiến độ công việc', `Công việc "${wa.job_title}": ${description.slice(0, 160)}`, wa.id);
        } catch (e) { console.error('Lỗi thông báo tiến độ:', e.message); }
        return ins.rows[0];
    }

    async listDeliverables(assignmentId, user) {
        const wa = await this.getParticipantAssignment(assignmentId, user);
        const res = await db.query(
            `SELECT d.id, d.version_no, d.file_key, d.description, d.status, d.submitted_at,
                    rv.decision AS review_decision, rv.comment AS review_comment, rv.created_at AS reviewed_at
             FROM work_deliverables d
             LEFT JOIN LATERAL (SELECT decision, comment, created_at FROM deliverable_reviews r
                                WHERE r.deliverable_id = d.id ORDER BY r.id DESC LIMIT 1) rv ON true
             WHERE d.assignment_id = $1 ORDER BY d.version_no DESC`,
            [wa.id]
        );
        return res.rows;
    }

    /** Sinh viên nộp sản phẩm: đường link (Google Drive, GitHub, Figma…) + mô tả. */
    async addDeliverable(assignmentId, user, body = {}) {
        const wa = await this.getParticipantAssignment(assignmentId, user);
        if (wa.student_id !== user.id) throw new ForbiddenError('Chỉ sinh viên của hợp đồng mới nộp sản phẩm.');
        if (!ACTIVE_STATUSES.includes(wa.status)) throw new BadRequestError('Hợp đồng đã kết thúc, không thể nộp sản phẩm.');
        const link = String(body.link || '').trim();
        if (!isHttpUrl(link) || link.length > 500) throw new BadRequestError('Đường link sản phẩm phải bắt đầu bằng http:// hoặc https:// (tối đa 500 ký tự).');
        const description = String(body.description || '').trim().slice(0, 1000) || 'Nộp sản phẩm bàn giao';
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('SELECT id FROM work_assignments WHERE id = $1 FOR UPDATE', [wa.id]);
            const pending = await client.query(`SELECT 1 FROM work_deliverables WHERE assignment_id = $1 AND status = 'SUBMITTED'`, [wa.id]);
            if (pending.rows.length) throw new BadRequestError('Phiên bản trước đang chờ nhà tuyển dụng duyệt.');
            const ver = await client.query('SELECT COALESCE(MAX(version_no), 0) + 1 AS n FROM work_deliverables WHERE assignment_id = $1', [wa.id]);
            const ins = await client.query(
                `INSERT INTO work_deliverables (assignment_id, submitted_by, version_no, file_key, description, status)
                 VALUES ($1, $2, $3, $4, $5, 'SUBMITTED') RETURNING *`,
                [wa.id, user.id, ver.rows[0].n, link, description]
            );
            await client.query('COMMIT');
            try {
                await notify(wa.employer_id, 'DELIVERABLE_SUBMITTED', 'Sinh viên nộp sản phẩm bàn giao',
                    `Công việc "${wa.job_title}": đã nộp phiên bản v${ins.rows[0].version_no}.`, wa.id);
            } catch (e) { console.error('Lỗi thông báo bàn giao:', e.message); }
            return ins.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    /** Nhà tuyển dụng duyệt: ACCEPTED hoặc REVISION_REQUESTED (bắt buộc lý do). */
    async reviewDeliverable(assignmentId, deliverableId, user, body = {}) {
        const wa = await this.getParticipantAssignment(assignmentId, user);
        if (wa.employer_id !== user.id) throw new ForbiddenError('Chỉ nhà tuyển dụng của hợp đồng mới duyệt sản phẩm.');
        const decision = String(body.decision || '').toUpperCase();
        if (!['ACCEPTED', 'REVISION_REQUESTED'].includes(decision)) throw new BadRequestError('Quyết định không hợp lệ.');
        const comment = String(body.comment || '').trim().slice(0, 1000);
        if (decision === 'REVISION_REQUESTED' && comment.length < 5) throw new BadRequestError('Vui lòng nhập lý do yêu cầu chỉnh sửa (tối thiểu 5 ký tự).');
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const d = await client.query(
                'SELECT id, version_no, status FROM work_deliverables WHERE id = $1 AND assignment_id = $2 FOR UPDATE',
                [parseInt(deliverableId, 10), wa.id]
            );
            if (!d.rows[0]) throw new NotFoundError('Không tìm thấy sản phẩm bàn giao.');
            if (d.rows[0].status !== 'SUBMITTED') throw new BadRequestError('Phiên bản này đã được duyệt.');
            await client.query(
                'INSERT INTO deliverable_reviews (deliverable_id, reviewed_by, decision, comment) VALUES ($1, $2, $3, $4)',
                [d.rows[0].id, user.id, decision, comment || null]
            );
            await client.query('UPDATE work_deliverables SET status = $2 WHERE id = $1', [d.rows[0].id, decision]);
            await client.query('COMMIT');
            try {
                await notify(wa.student_id, 'DELIVERABLE_REVIEWED',
                    decision === 'ACCEPTED' ? 'Sản phẩm bàn giao được chấp nhận' : 'Nhà tuyển dụng yêu cầu chỉnh sửa',
                    `Công việc "${wa.job_title}" – v${d.rows[0].version_no}${comment ? `: ${comment.slice(0, 160)}` : ''}`, wa.id);
            } catch (e) { console.error('Lỗi thông báo duyệt bàn giao:', e.message); }
            return { id: d.rows[0].id, status: decision };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = new AssignmentService();
