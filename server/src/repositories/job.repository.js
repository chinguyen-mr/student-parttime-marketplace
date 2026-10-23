const db = require('../config/db');

class JobRepository {
    async create(employerId, { title, description, requirements, category, location, salary_type, salary, work_type }) {
        const res = await db.query(
            `INSERT INTO jobs (employer_id, title, description, requirements, category, location, salary_type, salary, work_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [employerId, title, description, requirements || null, category, location, salary_type || 'HOURLY', salary, work_type || 'PART_TIME']
        );
        return res.rows[0];
    }

    async findById(id) {
        const res = await db.query(
            `SELECT j.*, u.full_name AS employer_name, u.email AS employer_email,
                    p.company_name, p.company_address, p.avatar_url AS employer_avatar
             FROM jobs j
             JOIN users u ON u.id = j.employer_id
             LEFT JOIN profiles p ON p.user_id = u.id
             WHERE j.id = $1`,
            [id]
        );
        return res.rows[0] || null;
    }

    async findAllWithFilter({ keyword, category, location, minSalary, maxSalary, workType, status, moderationStatus = 'APPROVED', limit = 20, offset = 0 }) {
        let query = `
            SELECT j.*, u.full_name AS employer_name, p.company_name
            FROM jobs j
            JOIN users u ON u.id = j.employer_id
            LEFT JOIN profiles p ON p.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (moderationStatus) {
            params.push(moderationStatus);
            query += ` AND j.moderation_status = $${params.length}`;
        }

        if (status) {
            params.push(status);
            query += ` AND j.status = $${params.length}`;
        }

        if (category) {
            params.push(category);
            query += ` AND j.category = $${params.length}`;
        }

        if (location) {
            params.push(`%${location}%`);
            query += ` AND j.location ILIKE $${params.length}`;
        }

        if (workType) {
            params.push(workType);
            query += ` AND j.work_type = $${params.length}`;
        }

        if (minSalary) {
            params.push(minSalary);
            query += ` AND j.salary >= $${params.length}`;
        }

        if (maxSalary) {
            params.push(maxSalary);
            query += ` AND j.salary <= $${params.length}`;
        }

        if (keyword) {
            params.push(`%${keyword}%`);
            query += ` AND (j.title ILIKE $${params.length} OR j.description ILIKE $${params.length})`;
        }

        query += ` ORDER BY j.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const res = await db.query(query, params);
        return res.rows;
    }

    async findByEmployerId(employerId) {
        const res = await db.query(
            `SELECT j.*, 
                    (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS total_applicants
             FROM jobs j
             WHERE j.employer_id = $1
             ORDER BY j.created_at DESC`,
            [employerId]
        );
        return res.rows;
    }

    async updateStatus(id, status) {
        const res = await db.query(
            `UPDATE jobs 
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );
        return res.rows[0] || null;
    }

    async updateModerationStatus(id, moderationStatus) {
        const res = await db.query(
            `UPDATE jobs 
             SET moderation_status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [moderationStatus, id]
        );
        return res.rows[0] || null;
    }
}

module.exports = new JobRepository();
