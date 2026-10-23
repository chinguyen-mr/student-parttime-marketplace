const db = require('../config/db');

class ApplicationRepository {
    async create(jobId, studentId, { cover_letter, cv_url }) {
        const res = await db.query(
            `INSERT INTO applications (job_id, student_id, cover_letter, cv_url)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [jobId, studentId, cover_letter || null, cv_url || null]
        );
        return res.rows[0];
    }

    async findById(id) {
        const res = await db.query(
            `SELECT a.*, j.title AS job_title, j.employer_id, j.status AS job_status,
                    u.full_name AS student_name, u.email AS student_email, u.phone AS student_phone
             FROM applications a
             JOIN jobs j ON j.id = a.job_id
             JOIN users u ON u.id = a.student_id
             WHERE a.id = $1`,
            [id]
        );
        return res.rows[0] || null;
    }

    async findByJobAndStudent(jobId, studentId) {
        const res = await db.query(
            `SELECT * FROM applications WHERE job_id = $1 AND student_id = $2`,
            [jobId, studentId]
        );
        return res.rows[0] || null;
    }

    async findByJobId(jobId) {
        const res = await db.query(
            `SELECT a.*, u.full_name AS student_name, u.email AS student_email, u.phone AS student_phone,
                    p.university, p.major, p.skills, p.avatar_url AS student_avatar
             FROM applications a
             JOIN users u ON u.id = a.student_id
             LEFT JOIN profiles p ON p.user_id = u.id
             WHERE a.job_id = $1
             ORDER BY a.applied_at DESC`,
            [jobId]
        );
        return res.rows;
    }

    async findByStudentId(studentId) {
        const res = await db.query(
            `SELECT a.*, j.title AS job_title, j.category, j.location, j.salary, j.salary_type, 
                    j.status AS job_status, u.full_name AS employer_name
             FROM applications a
             JOIN jobs j ON j.id = a.job_id
             JOIN users u ON u.id = j.employer_id
             WHERE a.student_id = $1
             ORDER BY a.applied_at DESC`,
            [studentId]
        );
        return res.rows;
    }

    async updateStatus(id, status) {
        const res = await db.query(
            `UPDATE applications
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );
        return res.rows[0] || null;
    }
}

module.exports = new ApplicationRepository();
