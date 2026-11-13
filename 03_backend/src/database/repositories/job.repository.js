const db = require('../../config/db');

// Số lượng tuyển: form gửi quantity_required, DB lưu ở cột headcount (1–50)
const toHeadcount = (v, fallback = 1) => {
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? Math.min(50, Math.max(1, n)) : fallback;
};

class JobRepository {
    async create(employerId, { title, description, requirements, category, location, salary_type, salary, work_type, application_deadline, job_banner_url, work_schedules, quantity_required, headcount }) {
        // Tin mới luôn chờ Admin duyệt (cột moderation_status mặc định 'APPROVED' khiến tin bỏ qua kiểm duyệt)
        const res = await db.query(
            `INSERT INTO jobs (employer_id, title, description, requirements, category, location, salary_type, salary, work_type, application_deadline, job_banner_url, headcount, moderation_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PENDING')
             RETURNING *, headcount AS quantity_required`,
            [employerId, title, description, requirements || null, category, location, salary_type || 'HOURLY', salary, work_type || 'PART_TIME', application_deadline || null, job_banner_url || null, toHeadcount(quantity_required ?? headcount)]
        );
        const job = res.rows[0];

        if (Array.isArray(work_schedules) && work_schedules.length > 0) {
            const insertedSchedules = [];
            for (const s of work_schedules) {
                const day = parseInt(s.day_of_week, 10);
                if (day >= 1 && day <= 7 && s.start_time && s.end_time && s.end_time > s.start_time) {
                    try {
                        const sRes = await db.query(
                            `INSERT INTO job_work_schedules (job_id, day_of_week, start_time, end_time, min_hours_per_shift, is_mandatory)
                             VALUES ($1, $2, $3, $4, $5, $6)
                             RETURNING *`,
                            [job.id, day, s.start_time, s.end_time, parseFloat(s.min_hours_per_shift || 0), s.is_mandatory !== false]
                        );
                        insertedSchedules.push(sRes.rows[0]);
                    } catch {
                        // ignore constraint duplicate in batch
                    }
                }
            }
            job.work_schedules = insertedSchedules;
        } else {
            job.work_schedules = [];
        }

        return job;
    }

    async update(jobId, { title, description, requirements, category, location, salary_type, salary, work_type, application_deadline, job_banner_url, work_schedules, headcount }) {
        // Tin bị Admin từ chối, khi doanh nghiệp sửa lại → tự gửi duyệt lại (PENDING)
        const res = await db.query(
            `UPDATE jobs
             SET title = $1,
                 description = $2,
                 requirements = $3,
                 category = $4,
                 location = $5,
                 salary_type = $6,
                 salary = $7,
                 work_type = $8,
                 application_deadline = $9,
                 job_banner_url = $10,
                 headcount = $12,
                 moderation_status = CASE WHEN moderation_status = 'REJECTED' THEN 'PENDING' ELSE moderation_status END,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $11
             RETURNING *, headcount AS quantity_required`,
            [
                title,
                description,
                requirements !== undefined ? requirements : null,
                category,
                location,
                salary_type || 'HOURLY',
                salary,
                work_type || 'PART_TIME',
                application_deadline || null,
                job_banner_url !== undefined ? job_banner_url : null,
                jobId,
                toHeadcount(headcount)
            ]
        );
        const updatedJob = res.rows[0];
        if (!updatedJob) return null;

        if (Array.isArray(work_schedules)) {
            await this.updateSchedules(jobId, work_schedules);
            try {
                const schedRes = await db.query(
                    'SELECT * FROM job_work_schedules WHERE job_id = $1 ORDER BY day_of_week, start_time',
                    [jobId]
                );
                updatedJob.work_schedules = schedRes.rows || [];
            } catch {
                updatedJob.work_schedules = [];
            }
        } else {
            try {
                const schedRes = await db.query(
                    'SELECT * FROM job_work_schedules WHERE job_id = $1 ORDER BY day_of_week, start_time',
                    [jobId]
                );
                updatedJob.work_schedules = schedRes.rows || [];
            } catch {
                updatedJob.work_schedules = [];
            }
        }

        return updatedJob;
    }

    async updateSchedules(jobId, schedules) {
        await db.query('DELETE FROM job_work_schedules WHERE job_id = $1', [jobId]);
        const inserted = [];
        if (Array.isArray(schedules)) {
            for (const s of schedules) {
                const day = parseInt(s.day_of_week, 10);
                if (day >= 1 && day <= 7 && s.start_time && s.end_time && s.end_time > s.start_time) {
                    const sRes = await db.query(
                        `INSERT INTO job_work_schedules (job_id, day_of_week, start_time, end_time, min_hours_per_shift, is_mandatory)
                         VALUES ($1, $2, $3, $4, $5, $6)
                         RETURNING *`,
                        [jobId, day, s.start_time, s.end_time, parseFloat(s.min_hours_per_shift || 0), s.is_mandatory !== false]
                    );
                    inserted.push(sRes.rows[0]);
                }
            }
        }
        return inserted;
    }

    async findById(id) {
        const res = await db.query(
            `SELECT j.*, u.full_name AS employer_name, u.email AS employer_email,
                    COALESCE(p.display_name, u.full_name) AS company_name, 
                    p.location AS company_address,
                    p.avatar_url AS employer_avatar,
                    p.avatar_url AS company_logo_url, p.verification_status AS employer_verification_status,
                    p.bio AS company_bio,
                    '25 - 99 nhân viên' AS company_size,
                    'Công nghệ & Dịch vụ' AS company_industry
             FROM jobs j
             JOIN users u ON u.id = j.employer_id
             LEFT JOIN employer_profiles p ON p.user_id = u.id
             WHERE j.id = $1`,
            [id]
        );
        const job = res.rows[0];
        if (!job) return null;

        try {
            const schedRes = await db.query(
                'SELECT * FROM job_work_schedules WHERE job_id = $1 ORDER BY day_of_week, start_time',
                [id]
            );
            job.work_schedules = schedRes.rows || [];
        } catch {
            job.work_schedules = [];
        }

        return job;
    }

    async findAllWithFilter({ keyword, category, location, minSalary, maxSalary, workType, employerId, status, moderationStatus = 'APPROVED', limit = 60, offset = 0 }) {
        let query = `
            SELECT j.*, u.full_name AS employer_name, 
                   COALESCE(p.display_name, u.full_name) AS company_name,
                   p.avatar_url AS employer_avatar,
                   p.avatar_url AS company_logo_url, p.verification_status AS employer_verification_status, 
                   p.location AS company_address,
                   '25 - 99 nhân viên' AS company_size, 
                   'Công nghệ & Dịch vụ' AS company_industry
            FROM jobs j
            JOIN users u ON u.id = j.employer_id
            LEFT JOIN employer_profiles p ON p.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (employerId) {
            params.push(employerId);
            query += ` AND j.employer_id = $${params.length}`;
        }

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

    async findRelatedJobs(jobId, category, location, limit = 4) {
        const res = await db.query(
            `SELECT j.*, u.full_name AS employer_name, 
                    COALESCE(p.display_name, u.full_name) AS company_name,
                    p.avatar_url AS employer_avatar,
                    p.avatar_url AS company_logo_url, p.verification_status AS employer_verification_status
             FROM jobs j
             JOIN users u ON u.id = j.employer_id
             LEFT JOIN employer_profiles p ON p.user_id = u.id
             WHERE j.id != $1 AND j.status = 'OPEN' AND j.moderation_status = 'APPROVED'
               AND (j.category = $2 OR j.location ILIKE $3)
             ORDER BY (CASE WHEN j.category = $2 THEN 1 ELSE 2 END), j.created_at DESC
             LIMIT $4`,
            [jobId, category, `%${location || ''}%`, limit]
        );
        return res.rows;
    }

    async toggleSavedJob(userId, jobId) {
        const existing = await db.query(
            'SELECT id FROM job_saved WHERE user_id = $1 AND job_id = $2',
            [userId, jobId]
        );
        if (existing.rows.length > 0) {
            await db.query('DELETE FROM job_saved WHERE user_id = $1 AND job_id = $2', [userId, jobId]);
            return { saved: false };
        } else {
            await db.query('INSERT INTO job_saved (user_id, job_id) VALUES ($1, $2)', [userId, jobId]);
            return { saved: true };
        }
    }

    async getSavedJobIds(userId) {
        const res = await db.query('SELECT job_id FROM job_saved WHERE user_id = $1', [userId]);
        return res.rows.map(r => r.job_id);
    }

    async getSavedJobs(userId) {
        const res = await db.query(
            `SELECT j.*, u.full_name AS employer_name, 
                    COALESCE(p.display_name, u.full_name) AS company_name,
                    p.avatar_url AS employer_avatar,
                    p.avatar_url AS company_logo_url, p.verification_status AS employer_verification_status
             FROM job_saved s
             JOIN jobs j ON j.id = s.job_id
             JOIN users u ON u.id = j.employer_id
             LEFT JOIN employer_profiles p ON p.user_id = u.id
             WHERE s.user_id = $1
             ORDER BY s.created_at DESC`,
            [userId]
        );
        return res.rows;
    }
}

module.exports = new JobRepository();
