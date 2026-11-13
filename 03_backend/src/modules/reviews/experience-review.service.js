// Đánh giá doanh nghiệp (company) và đánh giá công việc (job) của ứng viên.
// Tách khỏi bảng `reviews` cũ (UC-09). Xem 02_database/migrations/014_company_job_reviews.sql.
const db = require('../../config/db');
const { AppError, NotFoundError, ForbiddenError, ConflictError } = require('../../utils/app-error');
const P = require('./experience-review.policy');

const TABLE = { company: 'company_reviews', job: 'job_reviews' };
const FK = { company: 'company_review_id', job: 'job_review_id' };
const TARGET = { company: 'COMPANY_REVIEW', job: 'JOB_REVIEW' };
const CRITERIA = { company: P.COMPANY_CRITERIA, job: P.JOB_CRITERIA };
const EMPLOYER_NAME = `COALESCE(NULLIF(ep.display_name, ''), NULLIF(ep.company_name, ''), eu.full_name)`;

class TooManyRequestsError extends AppError {
    constructor(message) { super(message, 429); }
}

// Cột trả về cho danh sách công khai (kèm phản hồi doanh nghiệp)
function publicSelect(type) {
    const t = TABLE[type];
    const jobCols = type === 'job' ? ', j.title AS job_title' : '';
    const jobJoin = type === 'job' ? ' JOIN jobs j ON j.id = r.job_id' : '';
    return `SELECT r.*, u.full_name AS reviewer_name, rp.content AS reply_content, rp.status AS reply_status,
                   rp.updated_at AS reply_updated_at${jobCols}
            FROM ${t} r
            JOIN users u ON u.id = r.reviewer_id${jobJoin}
            LEFT JOIN review_replies rp ON rp.${FK[type]} = r.id`;
}

function summarySql(type, whereCol) {
    const avgCols = CRITERIA[type].map(k => `AVG(${k}) AS avg_${k}`).join(', ');
    return `SELECT COUNT(*) AS total, ${avgCols},
                   COUNT(*) FILTER (WHERE rating_overall = 1) AS d1, COUNT(*) FILTER (WHERE rating_overall = 2) AS d2,
                   COUNT(*) FILTER (WHERE rating_overall = 3) AS d3, COUNT(*) FILTER (WHERE rating_overall = 4) AS d4,
                   COUNT(*) FILTER (WHERE rating_overall = 5) AS d5, COUNT(*) FILTER (WHERE is_verified) AS verified_count
            FROM ${TABLE[type]} WHERE ${whereCol} = $1 AND status = 'PUBLISHED'`;
}

async function notify(client, userId, title, body, targetType, targetId) {
    try {
        await client.query(
            `INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
             VALUES ($1, 'REVIEW', $2, $3, $4, $5)`,
            [userId, title, body, targetType, targetId]
        );
    } catch (err) {
        console.error('[reviews] Không gửi được thông báo:', err.message);
    }
}

async function log(client, type, reviewId, { actorId, actorRole, action, from = null, to = null, reason = null, reportId = null }) {
    await client.query(
        `INSERT INTO review_moderation_logs (${FK[type]}, actor_id, actor_role, action, from_status, to_status, reason, report_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [reviewId, actorId, actorRole, action, from, to, reason, reportId]
    );
}

async function withTransaction(fn) {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        if (err.code === '23505') throw new ConflictError('Bạn đã gửi đánh giá / yêu cầu này rồi');
        throw err;
    } finally {
        client.release();
    }
}

class ExperienceReviewService {
    // ------------------------------------------------------------------ helpers
    async getEmployer(employerId) {
        const res = await db.query(
            `SELECT eu.id, ${EMPLOYER_NAME} AS name
             FROM users eu JOIN employer_profiles ep ON ep.user_id = eu.id
             WHERE eu.id = $1 AND eu.role <> 'STUDENT' AND eu.status <> 'BANNED'`,
            [employerId]
        );
        return res.rows[0] || null;
    }

    // Bằng chứng trải nghiệm thật trong hệ thống (không dựa vào lời khai của người dùng)
    async getEvidence(studentId, employerId) {
        const [assignments, applications] = await Promise.all([
            db.query(
                `SELECT wa.id, wa.job_id, wa.status, j.title
                 FROM work_assignments wa JOIN jobs j ON j.id = wa.job_id
                 WHERE wa.student_id = $1 AND j.employer_id = $2 AND wa.status IN ('IN_PROGRESS', 'COMPLETED')
                 ORDER BY wa.id`,
                [studentId, employerId]
            ),
            db.query(
                `SELECT a.id, a.job_id, a.status FROM applications a JOIN jobs j ON j.id = a.job_id
                 WHERE a.student_id = $1 AND j.employer_id = $2`,
                [studentId, employerId]
            ),
        ]);
        return { assignments: assignments.rows, applications: applications.rows };
    }

    // Đã làm / thực tập → cần work_assignment; đã ứng tuyển → cần đơn ứng tuyển.
    // Đã phỏng vấn: hệ thống chưa lưu dữ liệu phỏng vấn nên không thể xác thực.
    verificationFor(experienceType, evidence) {
        if (['WORKED', 'INTERNED'].includes(experienceType) && evidence.assignments.length) return 'WORK_ASSIGNMENT';
        if (experienceType === 'APPLIED' && evidence.applications.length) return 'APPLICATION';
        return null;
    }

    async assertRate(reviewerId) {
        const res = await db.query(
            `SELECT (SELECT COUNT(*) FROM company_reviews WHERE reviewer_id = $1 AND created_at > NOW() - INTERVAL '24 hours')
                  + (SELECT COUNT(*) FROM job_reviews WHERE reviewer_id = $1 AND created_at > NOW() - INTERVAL '24 hours') AS n`,
            [reviewerId]
        );
        if (Number(res.rows[0].n) >= P.RATE.reviewsPerDay) {
            throw new TooManyRequestsError(`Bạn chỉ có thể gửi tối đa ${P.RATE.reviewsPerDay} đánh giá trong 24 giờ`);
        }
    }

    async previousTexts(reviewerId, exclude = null) {
        const res = await db.query(
            `SELECT unnest(ARRAY[title, pros, cons, advice]) AS t FROM company_reviews
               WHERE reviewer_id = $1 AND NOT ($2::text = 'company' AND id = $3::int)
             UNION ALL
             SELECT content FROM job_reviews WHERE reviewer_id = $1 AND NOT ($2::text = 'job' AND id = $3::int)`,
            [reviewerId, exclude?.type || '', exclude?.id || 0]
        );
        return res.rows.map(r => r.t).filter(Boolean);
    }

    texts(type, payload) {
        return type === 'company' ? [payload.title, payload.pros, payload.cons, payload.advice] : [payload.content];
    }

    async loadOwn(type, id, reviewerId) {
        const res = await db.query(`SELECT * FROM ${TABLE[type]} WHERE id = $1`, [id]);
        const row = res.rows[0];
        if (!row || row.reviewer_id !== reviewerId) throw new NotFoundError('Không tìm thấy đánh giá của bạn');
        return row;
    }

    // DTO cho chính tác giả: thêm trạng thái kiểm duyệt (không lộ cờ nội bộ)
    toOwnerDto(row, type) {
        const dto = P.toPublicReview(row, type);
        return {
            ...dto,
            author_name: row.reviewer_name || null,
            employer_id: row.employer_id,
            employer_name: row.employer_name || null,
            status: row.status,
            moderation_reason: ['REJECTED', 'HIDDEN', 'REMOVED'].includes(row.status) ? row.moderation_reason : null,
            created_at: row.created_at,
            updated_at: row.updated_at,
            edits_left: Math.max(0, P.RATE.maxEdits - row.edit_count),
            can_edit: P.EDITABLE_STATUSES.includes(row.status) && row.edit_count < P.RATE.maxEdits,
            can_appeal: P.APPEALABLE_STATUSES.includes(row.status) && !row.pending_appeal,
            pending_appeal: Boolean(row.pending_appeal),
        };
    }

    async ownerView(type, id) {
        const jobCols = type === 'job' ? ', j.title AS job_title' : '';
        const jobJoin = type === 'job' ? ' JOIN jobs j ON j.id = r.job_id' : '';
        const res = await db.query(
            `SELECT r.*, u.full_name AS reviewer_name, ${EMPLOYER_NAME} AS employer_name,
                    rp.content AS reply_content, rp.status AS reply_status, rp.updated_at AS reply_updated_at,
                    EXISTS (SELECT 1 FROM review_reports x WHERE x.${FK[type]} = r.id AND x.kind = 'APPEAL' AND x.status = 'PENDING') AS pending_appeal
                    ${jobCols}
             FROM ${TABLE[type]} r
             JOIN users u ON u.id = r.reviewer_id
             JOIN users eu ON eu.id = r.employer_id
             LEFT JOIN employer_profiles ep ON ep.user_id = r.employer_id
             LEFT JOIN review_replies rp ON rp.${FK[type]} = r.id${jobJoin}
             WHERE r.id = $1`,
            [id]
        );
        return res.rows[0] ? this.toOwnerDto(res.rows[0], type) : null;
    }

    // ------------------------------------------------------------------ eligibility
    async companyEligibility(user, employerId) {
        const employer = await this.getEmployer(employerId);
        if (!employer) throw new NotFoundError('Không tìm thấy nhà tuyển dụng');
        if (!user) return { can_review: false, reason: 'LOGIN_REQUIRED', existing: null };
        if (user.id === employerId) return { can_review: false, reason: 'SELF_REVIEW', existing: null };
        if (user.role !== 'STUDENT') return { can_review: false, reason: 'ROLE_NOT_ALLOWED', existing: null };
        const existingRow = (await db.query('SELECT id FROM company_reviews WHERE employer_id = $1 AND reviewer_id = $2', [employerId, user.id])).rows[0];
        const evidence = await this.getEvidence(user.id, employerId);
        const verifiable = P.COMPANY_EXPERIENCES.filter(e => this.verificationFor(e, evidence));
        return {
            can_review: !existingRow,
            reason: existingRow ? 'ALREADY_REVIEWED' : null,
            existing: existingRow ? await this.ownerView('company', existingRow.id) : null,
            verifiable_experiences: verifiable,
            // Công việc đã làm ở doanh nghiệp này → có thể đánh giá từng công việc
            worked_jobs: evidence.assignments.map(a => ({ job_id: a.job_id, title: a.title })),
        };
    }

    async jobEligibility(user, jobId) {
        const job = (await db.query('SELECT id, employer_id, title FROM jobs WHERE id = $1', [jobId])).rows[0];
        if (!job) throw new NotFoundError('Không tìm thấy công việc');
        if (!user) return { can_review: false, reason: 'LOGIN_REQUIRED', existing: null };
        if (user.id === job.employer_id) return { can_review: false, reason: 'SELF_REVIEW', existing: null };
        if (user.role !== 'STUDENT') return { can_review: false, reason: 'ROLE_NOT_ALLOWED', existing: null };
        const existingRow = (await db.query('SELECT id FROM job_reviews WHERE job_id = $1 AND reviewer_id = $2', [jobId, user.id])).rows[0];
        if (existingRow) return { can_review: false, reason: 'ALREADY_REVIEWED', existing: await this.ownerView('job', existingRow.id) };
        const assignment = await this.findAssignment(user.id, jobId);
        return { can_review: Boolean(assignment), reason: assignment ? null : 'NO_WORK_EXPERIENCE', existing: null };
    }

    async findAssignment(studentId, jobId) {
        const res = await db.query(
            `SELECT id FROM work_assignments WHERE student_id = $1 AND job_id = $2 AND status IN ('IN_PROGRESS', 'COMPLETED')
             ORDER BY id LIMIT 1`,
            [studentId, jobId]
        );
        return res.rows[0] || null;
    }

    // ------------------------------------------------------------------ candidate: tạo / sửa
    async createCompanyReview(reviewerId, employerId, body) {
        const employer = await this.getEmployer(employerId);
        if (!employer) throw new NotFoundError('Không tìm thấy nhà tuyển dụng');
        if (employerId === reviewerId) throw new ForbiddenError('Không thể tự đánh giá doanh nghiệp của mình');
        const payload = P.validateCompanyReview(body);
        const dup = await db.query('SELECT 1 FROM company_reviews WHERE employer_id = $1 AND reviewer_id = $2', [employerId, reviewerId]);
        if (dup.rows.length) throw new ConflictError('Bạn đã đánh giá doanh nghiệp này. Bạn có thể chỉnh sửa đánh giá đã gửi.');
        await this.assertRate(reviewerId);

        const evidence = await this.getEvidence(reviewerId, employerId);
        const source = this.verificationFor(payload.experience_type, evidence);
        const flags = P.detectFlags(this.texts('company', payload), await this.previousTexts(reviewerId));
        const status = P.decideStatus({ verified: Boolean(source), flags });

        const id = await withTransaction(async (client) => {
            const ins = await client.query(
                `INSERT INTO company_reviews (employer_id, reviewer_id, experience_type, rating_environment, rating_salary_benefits,
                    rating_management, rating_culture, rating_learning, rating_recruitment, rating_overall, title, pros, cons, advice,
                    is_anonymous, is_verified, verification_source, status, moderation_flags, published_at)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::varchar,$19, CASE WHEN $18::varchar = 'PUBLISHED' THEN NOW() END)
                 RETURNING id`,
                [employerId, reviewerId, payload.experience_type, payload.rating_environment, payload.rating_salary_benefits,
                    payload.rating_management, payload.rating_culture, payload.rating_learning, payload.rating_recruitment,
                    payload.rating_overall, payload.title, payload.pros, payload.cons, payload.advice, payload.is_anonymous,
                    Boolean(source), source, status, flags]
            );
            const newId = ins.rows[0].id;
            await log(client, 'company', newId, { actorId: reviewerId, actorRole: 'STUDENT', action: 'CREATED', to: status,
                reason: flags.length ? `Tự động chuyển chờ duyệt: ${flags.join(', ')}` : (source ? null : 'Chưa xác thực trải nghiệm') });
            if (status === 'PUBLISHED') {
                await notify(client, employerId, 'Doanh nghiệp có đánh giá mới',
                    `Một ứng viên vừa đánh giá doanh nghiệp ${payload.rating_overall}/5 sao.`, 'COMPANY_REVIEW', newId);
            }
            return newId;
        });
        return this.ownerView('company', id);
    }

    async createJobReview(reviewerId, jobId, body) {
        const job = (await db.query('SELECT id, employer_id, title FROM jobs WHERE id = $1', [jobId])).rows[0];
        if (!job) throw new NotFoundError('Không tìm thấy công việc');
        if (job.employer_id === reviewerId) throw new ForbiddenError('Không thể tự đánh giá công việc của mình');
        const payload = P.validateJobReview(body);
        const assignment = await this.findAssignment(reviewerId, jobId);
        if (!assignment) throw new ForbiddenError('Chỉ ứng viên đã được nhận và làm công việc này mới có thể đánh giá công việc');
        const dup = await db.query('SELECT 1 FROM job_reviews WHERE job_id = $1 AND reviewer_id = $2', [jobId, reviewerId]);
        if (dup.rows.length) throw new ConflictError('Bạn đã đánh giá công việc này. Bạn có thể chỉnh sửa đánh giá đã gửi.');
        await this.assertRate(reviewerId);

        const flags = P.detectFlags(this.texts('job', payload), await this.previousTexts(reviewerId));
        const status = P.decideStatus({ verified: true, flags });

        const id = await withTransaction(async (client) => {
            const ins = await client.query(
                `INSERT INTO job_reviews (job_id, employer_id, reviewer_id, assignment_id, experience_type, rating_description_accuracy,
                    rating_salary_accuracy, rating_schedule, rating_workload, rating_manager_support, rating_overall, content,
                    is_anonymous, is_verified, verification_source, status, moderation_flags, published_at)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, TRUE, 'WORK_ASSIGNMENT', $14::varchar, $15, CASE WHEN $14::varchar = 'PUBLISHED' THEN NOW() END)
                 RETURNING id`,
                [jobId, job.employer_id, reviewerId, assignment.id, payload.experience_type, payload.rating_description_accuracy,
                    payload.rating_salary_accuracy, payload.rating_schedule, payload.rating_workload, payload.rating_manager_support,
                    payload.rating_overall, payload.content, payload.is_anonymous, status, flags]
            );
            const newId = ins.rows[0].id;
            await log(client, 'job', newId, { actorId: reviewerId, actorRole: 'STUDENT', action: 'CREATED', to: status,
                reason: flags.length ? `Tự động chuyển chờ duyệt: ${flags.join(', ')}` : null });
            if (status === 'PUBLISHED') {
                await notify(client, job.employer_id, 'Công việc có đánh giá mới',
                    `Công việc "${job.title}" vừa nhận đánh giá ${payload.rating_overall}/5 sao.`, 'JOB_REVIEW', newId);
            }
            return newId;
        });
        return this.ownerView('job', id);
    }

    async updateReview(reviewerId, type, id, body) {
        const row = await this.loadOwn(type, id, reviewerId);
        if (!P.EDITABLE_STATUSES.includes(row.status)) {
            throw new ForbiddenError('Đánh giá đã bị ẩn hoặc gỡ nên không thể chỉnh sửa. Bạn có thể gửi khiếu nại.');
        }
        if (row.edit_count >= P.RATE.maxEdits) throw new ForbiddenError(`Mỗi đánh giá chỉ được chỉnh sửa tối đa ${P.RATE.maxEdits} lần`);
        const payload = type === 'company' ? P.validateCompanyReview(body) : P.validateJobReview(body);

        let source;
        if (type === 'company') {
            source = this.verificationFor(payload.experience_type, await this.getEvidence(reviewerId, row.employer_id));
        } else {
            source = (await this.findAssignment(reviewerId, row.job_id)) ? 'WORK_ASSIGNMENT' : null;
            if (!source) throw new ForbiddenError('Không còn dữ liệu xác nhận bạn đã làm công việc này');
        }
        const flags = P.detectFlags(this.texts(type, payload), await this.previousTexts(reviewerId, { type, id }));
        const status = P.decideStatus({ verified: Boolean(source), flags, previousStatus: row.status });

        const fields = type === 'company'
            ? ['experience_type', ...P.COMPANY_CRITERIA, 'title', 'pros', 'cons', 'advice', 'is_anonymous']
            : ['experience_type', ...P.JOB_CRITERIA, 'content', 'is_anonymous'];
        const sets = fields.map((f, i) => `${f} = $${i + 1}`);
        const values = fields.map(f => payload[f]);
        const n = values.length;

        await withTransaction(async (client) => {
            const locked = await client.query(`SELECT status, edit_count FROM ${TABLE[type]} WHERE id = $1 FOR UPDATE`, [id]);
            if (locked.rows[0].status !== row.status || locked.rows[0].edit_count !== row.edit_count) {
                throw new ConflictError('Đánh giá vừa được cập nhật ở nơi khác. Vui lòng tải lại.');
            }
            await client.query(
                `UPDATE ${TABLE[type]} SET ${sets.join(', ')},
                    is_verified = $${n + 1}, verification_source = $${n + 2}, status = $${n + 3}::varchar, moderation_flags = $${n + 4},
                    moderation_reason = CASE WHEN $${n + 3}::varchar = 'PUBLISHED' THEN NULL ELSE moderation_reason END,
                    published_at = CASE WHEN $${n + 3}::varchar = 'PUBLISHED' THEN COALESCE(published_at, NOW()) ELSE published_at END,
                    edit_count = edit_count + 1, updated_at = NOW()
                 WHERE id = $${n + 5}`,
                [...values, Boolean(source), source, status, flags, id]
            );
            await log(client, type, id, { actorId: reviewerId, actorRole: 'STUDENT', action: 'EDITED', from: row.status, to: status,
                reason: flags.length ? `Tự động chuyển chờ duyệt: ${flags.join(', ')}` : null });
        });
        return this.ownerView(type, id);
    }

    async listMine(reviewerId) {
        const [c, j] = await Promise.all([
            db.query('SELECT id FROM company_reviews WHERE reviewer_id = $1 ORDER BY created_at DESC', [reviewerId]),
            db.query('SELECT id FROM job_reviews WHERE reviewer_id = $1 ORDER BY created_at DESC', [reviewerId]),
        ]);
        return {
            company: await Promise.all(c.rows.map(r => this.ownerView('company', r.id))),
            job: await Promise.all(j.rows.map(r => this.ownerView('job', r.id))),
        };
    }

    // ------------------------------------------------------------------ công khai
    async companySummary(employerId) {
        if (!(await this.getEmployer(employerId))) throw new NotFoundError('Không tìm thấy nhà tuyển dụng');
        const [summary, byExp, jobs] = await Promise.all([
            db.query(summarySql('company', 'employer_id'), [employerId]),
            db.query(`SELECT experience_type, COUNT(*) AS n FROM company_reviews WHERE employer_id = $1 AND status = 'PUBLISHED' GROUP BY 1`, [employerId]),
            db.query(summarySql('job', 'employer_id'), [employerId]),
        ]);
        return {
            company: {
                ...P.toSummary(summary.rows[0], P.COMPANY_CRITERIA),
                experience_counts: Object.fromEntries(byExp.rows.map(r => [r.experience_type, Number(r.n)])),
            },
            // Điểm công việc tính riêng, không gộp vào điểm doanh nghiệp
            jobs: P.toSummary(jobs.rows[0], P.JOB_CRITERIA),
        };
    }

    async listCompanyReviews(employerId, query) {
        if (!(await this.getEmployer(employerId))) throw new NotFoundError('Không tìm thấy nhà tuyển dụng');
        const { page, limit, offset } = P.parsePaging(query);
        const where = ['r.employer_id = $1', "r.status = 'PUBLISHED'"];
        const params = [employerId];
        const exp = String(query.experience || '').toUpperCase();
        if (P.COMPANY_EXPERIENCES.includes(exp)) { params.push(exp); where.push(`r.experience_type = $${params.length}`); }
        const rating = parseInt(query.rating, 10);
        if (rating >= 1 && rating <= 5) { params.push(rating); where.push(`r.rating_overall = $${params.length}`); }
        if (query.verified === 'true') where.push('r.is_verified');
        const order = { highest: 'r.rating_overall DESC, r.published_at DESC', lowest: 'r.rating_overall ASC, r.published_at DESC' }[query.sort]
            || 'r.published_at DESC';
        const whereSql = where.join(' AND ');
        const [rows, count] = await Promise.all([
            db.query(`${publicSelect('company')} WHERE ${whereSql} ORDER BY ${order}, r.id DESC LIMIT ${limit} OFFSET ${offset}`, params),
            db.query(`SELECT COUNT(*) FROM company_reviews r WHERE ${whereSql}`, params),
        ]);
        const total = Number(count.rows[0].count);
        return { data: rows.rows.map(r => P.toPublicReview(r, 'company')), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
    }

    // Đánh giá công việc của một doanh nghiệp, nhóm theo từng công việc (liên kết job_id)
    async listEmployerJobReviews(employerId, query) {
        if (!(await this.getEmployer(employerId))) throw new NotFoundError('Không tìm thấy nhà tuyển dụng');
        const { page, limit, offset } = P.parsePaging(query);
        const params = [employerId];
        let jobFilter = '';
        const jobId = parseInt(query.job_id, 10);
        if (jobId > 0) { params.push(jobId); jobFilter = ` AND r.job_id = $2`; }
        const [jobs, rows, count] = await Promise.all([
            db.query(
                `SELECT r.job_id, j.title, COUNT(*) AS total, ROUND(AVG(r.rating_overall), 1) AS average_overall
                 FROM job_reviews r JOIN jobs j ON j.id = r.job_id
                 WHERE r.employer_id = $1 AND r.status = 'PUBLISHED' GROUP BY r.job_id, j.title ORDER BY COUNT(*) DESC, r.job_id`,
                [employerId]
            ),
            db.query(`${publicSelect('job')} WHERE r.employer_id = $1 AND r.status = 'PUBLISHED'${jobFilter}
                      ORDER BY r.published_at DESC, r.id DESC LIMIT ${limit} OFFSET ${offset}`, params),
            db.query(`SELECT COUNT(*) FROM job_reviews r WHERE r.employer_id = $1 AND r.status = 'PUBLISHED'${jobFilter}`, params),
        ]);
        const total = Number(count.rows[0].count);
        return {
            jobs: jobs.rows.map(r => ({ job_id: r.job_id, title: r.title, total: Number(r.total), average_overall: Number(r.average_overall) })),
            data: rows.rows.map(r => P.toPublicReview(r, 'job')),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
        };
    }

    async jobSummary(jobId) {
        const job = (await db.query('SELECT id FROM jobs WHERE id = $1', [jobId])).rows[0];
        if (!job) throw new NotFoundError('Không tìm thấy công việc');
        const res = await db.query(summarySql('job', 'job_id'), [jobId]);
        return P.toSummary(res.rows[0], P.JOB_CRITERIA);
    }

    async listJobReviews(jobId, query) {
        const { page, limit, offset } = P.parsePaging(query, 5);
        const [rows, count] = await Promise.all([
            db.query(`${publicSelect('job')} WHERE r.job_id = $1 AND r.status = 'PUBLISHED'
                      ORDER BY r.published_at DESC, r.id DESC LIMIT ${limit} OFFSET ${offset}`, [jobId]),
            db.query(`SELECT COUNT(*) FROM job_reviews WHERE job_id = $1 AND status = 'PUBLISHED'`, [jobId]),
        ]);
        const total = Number(count.rows[0].count);
        return { data: rows.rows.map(r => P.toPublicReview(r, 'job')), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
    }

    // ------------------------------------------------------------------ báo cáo & khiếu nại
    async reportReview(user, type, id, body) {
        const row = (await db.query(`SELECT id, reviewer_id, status FROM ${TABLE[type]} WHERE id = $1`, [id])).rows[0];
        if (!row || row.status !== 'PUBLISHED') throw new NotFoundError('Không tìm thấy đánh giá');
        if (row.reviewer_id === user.id) throw new ForbiddenError('Bạn không thể báo cáo đánh giá của chính mình');
        const reason = String(body.reason || '').toUpperCase();
        if (!P.REPORT_REASONS.includes(reason)) throw new AppError('Vui lòng chọn lý do báo cáo hợp lệ', 400);
        const description = P.sanitizeText(body.description);
        if (description.length > P.LIMITS.reportDescription[1]) throw new AppError('Mô tả tối đa 1000 ký tự', 400);
        if (reason === 'OTHER' && description.length < 10) throw new AppError('Vui lòng mô tả lý do (tối thiểu 10 ký tự)', 400);
        const rate = await db.query(
            `SELECT COUNT(*) FROM review_reports WHERE reporter_id = $1 AND kind = 'REPORT' AND created_at > NOW() - INTERVAL '24 hours'`,
            [user.id]
        );
        if (Number(rate.rows[0].count) >= P.RATE.reportsPerDay) {
            throw new TooManyRequestsError(`Bạn chỉ có thể gửi tối đa ${P.RATE.reportsPerDay} báo cáo trong 24 giờ`);
        }
        const dup = await db.query(
            `SELECT 1 FROM review_reports WHERE ${FK[type]} = $1 AND reporter_id = $2 AND kind = 'REPORT' AND status = 'PENDING'`,
            [id, user.id]
        );
        if (dup.rows.length) throw new ConflictError('Bạn đã báo cáo đánh giá này và đang chờ quản trị viên xử lý');
        return withTransaction(async (client) => {
            const ins = await client.query(
                `INSERT INTO review_reports (${FK[type]}, reporter_id, kind, reason, description)
                 VALUES ($1, $2, 'REPORT', $3, $4) RETURNING id, reason, status, created_at`,
                [id, user.id, reason, description || null]
            );
            await log(client, type, id, { actorId: user.id, actorRole: user.role, action: 'REPORTED', reason, reportId: ins.rows[0].id });
            return ins.rows[0];
        });
    }

    async appealReview(reviewerId, type, id, body) {
        const row = await this.loadOwn(type, id, reviewerId);
        if (!P.APPEALABLE_STATUSES.includes(row.status)) throw new AppError('Chỉ có thể khiếu nại đánh giá bị từ chối, bị ẩn hoặc bị gỡ', 400);
        const description = P.sanitizeText(body.description);
        if (description.length < 20 || description.length > 1000) throw new AppError('Nội dung khiếu nại cần từ 20 đến 1000 ký tự', 400);
        const dup = await db.query(
            `SELECT 1 FROM review_reports WHERE ${FK[type]} = $1 AND kind = 'APPEAL' AND status = 'PENDING'`, [id]
        );
        if (dup.rows.length) throw new ConflictError('Khiếu nại trước đó của bạn đang chờ xử lý');
        return withTransaction(async (client) => {
            const ins = await client.query(
                `INSERT INTO review_reports (${FK[type]}, reporter_id, kind, reason, description)
                 VALUES ($1, $2, 'APPEAL', 'APPEAL', $3) RETURNING id, status, created_at`,
                [id, reviewerId, description]
            );
            await log(client, type, id, { actorId: reviewerId, actorRole: 'STUDENT', action: 'APPEALED', reason: description, reportId: ins.rows[0].id });
            return ins.rows[0];
        });
    }

    // ------------------------------------------------------------------ employer
    async employerOverview(employerId) {
        const summary = await this.companySummary(employerId);
        const [recent, unreplied, monthly] = await Promise.all([
            db.query(
                `SELECT (SELECT COUNT(*) FROM company_reviews WHERE employer_id = $1 AND status = 'PUBLISHED' AND published_at > NOW() - INTERVAL '30 days')
                      + (SELECT COUNT(*) FROM job_reviews WHERE employer_id = $1 AND status = 'PUBLISHED' AND published_at > NOW() - INTERVAL '30 days') AS n`,
                [employerId]
            ),
            db.query(
                `SELECT (SELECT COUNT(*) FROM company_reviews r WHERE r.employer_id = $1 AND r.status = 'PUBLISHED'
                           AND NOT EXISTS (SELECT 1 FROM review_replies x WHERE x.company_review_id = r.id))
                      + (SELECT COUNT(*) FROM job_reviews r WHERE r.employer_id = $1 AND r.status = 'PUBLISHED'
                           AND NOT EXISTS (SELECT 1 FROM review_replies x WHERE x.job_review_id = r.id)) AS n`,
                [employerId]
            ),
            db.query(
                `SELECT kind, to_char(date_trunc('month', published_at), 'YYYY-MM') AS month, COUNT(*) AS total, ROUND(AVG(rating_overall), 2) AS average
                 FROM (SELECT 'company' AS kind, published_at, rating_overall FROM company_reviews WHERE employer_id = $1 AND status = 'PUBLISHED'
                       UNION ALL
                       SELECT 'job', published_at, rating_overall FROM job_reviews WHERE employer_id = $1 AND status = 'PUBLISHED') x
                 WHERE published_at >= date_trunc('month', NOW()) - INTERVAL '11 months'
                 GROUP BY 1, 2 ORDER BY 2`,
                [employerId]
            ),
        ]);
        return {
            ...summary,
            new_last_30_days: Number(recent.rows[0].n),
            unreplied: Number(unreplied.rows[0].n),
            monthly: monthly.rows.map(r => ({ kind: r.kind, month: r.month, total: Number(r.total), average: Number(r.average) })),
        };
    }

    async employerList(employerId, type, query) {
        const { page, limit, offset } = P.parsePaging(query);
        const where = ['r.employer_id = $1', "r.status = 'PUBLISHED'"];
        if (query.replied === 'yes') where.push('rp.id IS NOT NULL');
        if (query.replied === 'no') where.push('rp.id IS NULL');
        const whereSql = where.join(' AND ');
        const select = publicSelect(type).replace('SELECT r.*,', `SELECT r.*, rp.id AS reply_id,
            EXISTS (SELECT 1 FROM review_reports x WHERE x.${FK[type]} = r.id AND x.reporter_id = $1 AND x.kind = 'REPORT' AND x.status = 'PENDING') AS my_report_pending,`);
        const [rows, count] = await Promise.all([
            db.query(`${select} WHERE ${whereSql} ORDER BY r.published_at DESC, r.id DESC LIMIT ${limit} OFFSET ${offset}`, [employerId]),
            db.query(`SELECT COUNT(*) FROM ${TABLE[type]} r LEFT JOIN review_replies rp ON rp.${FK[type]} = r.id WHERE ${whereSql}`, [employerId]),
        ]);
        const total = Number(count.rows[0].count);
        return {
            data: rows.rows.map(r => ({
                ...P.toPublicReview(r, type),
                // Doanh nghiệp xem được cả phản hồi của mình kể cả khi bị ẩn (kèm trạng thái)
                my_reply: r.reply_id ? { content: r.reply_content, status: r.reply_status, updated_at: r.reply_updated_at } : null,
                my_report_pending: r.my_report_pending,
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
        };
    }

    async upsertReply(employerId, type, id, body) {
        const content = P.sanitizeText(body.content);
        if (content.length < P.LIMITS.reply[0] || content.length > P.LIMITS.reply[1]) {
            throw new AppError(`Phản hồi cần từ ${P.LIMITS.reply[0]} đến ${P.LIMITS.reply[1]} ký tự`, 400);
        }
        const row = (await db.query(`SELECT id, employer_id, reviewer_id, status FROM ${TABLE[type]} WHERE id = $1`, [id])).rows[0];
        if (!row || row.status !== 'PUBLISHED') throw new NotFoundError('Không tìm thấy đánh giá');
        if (row.employer_id !== employerId) throw new ForbiddenError('Bạn chỉ có thể phản hồi đánh giá về doanh nghiệp của mình');
        return withTransaction(async (client) => {
            const existing = (await client.query(`SELECT id, status FROM review_replies WHERE ${FK[type]} = $1 FOR UPDATE`, [id])).rows[0];
            if (existing?.status === 'HIDDEN') throw new ForbiddenError('Phản hồi đã bị quản trị viên ẩn nên không thể chỉnh sửa');
            let reply;
            if (existing) {
                reply = (await client.query('UPDATE review_replies SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [content, existing.id])).rows[0];
            } else {
                reply = (await client.query(
                    `INSERT INTO review_replies (${FK[type]}, employer_id, content) VALUES ($1, $2, $3) RETURNING *`, [id, employerId, content]
                )).rows[0];
                await notify(client, row.reviewer_id, 'Doanh nghiệp đã phản hồi đánh giá của bạn',
                    'Nhà tuyển dụng vừa phản hồi đánh giá bạn đã gửi.', TARGET[type], id);
            }
            await log(client, type, id, { actorId: employerId, actorRole: 'EMPLOYER', action: existing ? 'REPLY_EDITED' : 'REPLIED' });
            return { content: reply.content, status: reply.status, updated_at: reply.updated_at };
        });
    }

    async deleteReply(employerId, type, id) {
        return withTransaction(async (client) => {
            const res = await client.query(
                `DELETE FROM review_replies WHERE ${FK[type]} = $1 AND employer_id = $2 AND status = 'VISIBLE' RETURNING id`, [id, employerId]
            );
            if (!res.rows.length) throw new NotFoundError('Không tìm thấy phản hồi có thể xóa');
            await log(client, type, id, { actorId: employerId, actorRole: 'EMPLOYER', action: 'REPLY_DELETED' });
            return true;
        });
    }

    // ------------------------------------------------------------------ admin
    async adminStats() {
        const res = await db.query(
            `SELECT (SELECT COUNT(*) FROM company_reviews WHERE status = 'PENDING') AS pending_company,
                    (SELECT COUNT(*) FROM job_reviews WHERE status = 'PENDING') AS pending_job,
                    (SELECT COUNT(*) FROM review_reports WHERE status = 'PENDING' AND kind = 'REPORT') AS pending_reports,
                    (SELECT COUNT(*) FROM review_reports WHERE status = 'PENDING' AND kind = 'APPEAL') AS pending_appeals`
        );
        return Object.fromEntries(Object.entries(res.rows[0]).map(([k, v]) => [k, Number(v)]));
    }

    async adminList(type, query) {
        const { page, limit, offset } = P.parsePaging(query, 20);
        const where = ['TRUE'];
        const params = [];
        const status = String(query.status || '').toUpperCase();
        if (P.STATUSES.includes(status)) { params.push(status); where.push(`r.status = $${params.length}`); }
        if (query.verified === 'true') where.push('r.is_verified');
        if (query.verified === 'false') where.push('NOT r.is_verified');
        if (query.flagged === 'true') where.push('cardinality(r.moderation_flags) > 0');
        if (query.reported === 'true') where.push(`EXISTS (SELECT 1 FROM review_reports x WHERE x.${FK[type]} = r.id AND x.status = 'PENDING' AND x.kind = 'REPORT')`);
        const whereSql = where.join(' AND ');
        const jobCols = type === 'job' ? ', j.title AS job_title' : '';
        const jobJoin = type === 'job' ? ' JOIN jobs j ON j.id = r.job_id' : '';
        const [rows, count] = await Promise.all([
            db.query(
                `SELECT r.*, u.full_name AS reviewer_name, u.email AS reviewer_email, ${EMPLOYER_NAME} AS employer_name,
                        (SELECT COUNT(*) FROM review_reports x WHERE x.${FK[type]} = r.id AND x.status = 'PENDING' AND x.kind = 'REPORT') AS pending_reports${jobCols}
                 FROM ${TABLE[type]} r JOIN users u ON u.id = r.reviewer_id JOIN users eu ON eu.id = r.employer_id
                 LEFT JOIN employer_profiles ep ON ep.user_id = r.employer_id${jobJoin}
                 WHERE ${whereSql} ORDER BY r.created_at DESC, r.id DESC LIMIT ${limit} OFFSET ${offset}`,
                params
            ),
            db.query(`SELECT COUNT(*) FROM ${TABLE[type]} r WHERE ${whereSql}`, params),
        ]);
        const total = Number(count.rows[0].count);
        return { data: rows.rows.map(r => ({ ...r, pending_reports: Number(r.pending_reports) })), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
    }

    async adminDetail(type, id) {
        const jobCols = type === 'job' ? ', j.title AS job_title' : '';
        const jobJoin = type === 'job' ? ' JOIN jobs j ON j.id = r.job_id' : '';
        const row = (await db.query(
            `SELECT r.*, u.full_name AS reviewer_name, u.email AS reviewer_email, ${EMPLOYER_NAME} AS employer_name${jobCols}
             FROM ${TABLE[type]} r JOIN users u ON u.id = r.reviewer_id JOIN users eu ON eu.id = r.employer_id
             LEFT JOIN employer_profiles ep ON ep.user_id = r.employer_id${jobJoin} WHERE r.id = $1`,
            [id]
        )).rows[0];
        if (!row) throw new NotFoundError('Không tìm thấy đánh giá');
        const [evidence, reports, logs, reply] = await Promise.all([
            this.getEvidence(row.reviewer_id, row.employer_id),
            db.query(
                `SELECT x.*, u.full_name AS reporter_name, u.role AS reporter_role FROM review_reports x JOIN users u ON u.id = x.reporter_id
                 WHERE x.${FK[type]} = $1 ORDER BY x.created_at DESC`, [id]
            ),
            db.query(
                `SELECT l.*, u.full_name AS actor_name FROM review_moderation_logs l LEFT JOIN users u ON u.id = l.actor_id
                 WHERE l.${FK[type]} = $1 ORDER BY l.created_at DESC, l.id DESC`, [id]
            ),
            db.query(`SELECT * FROM review_replies WHERE ${FK[type]} = $1`, [id]),
        ]);
        return { review: row, evidence, reports: reports.rows, logs: logs.rows, reply: reply.rows[0] || null };
    }

    // Áp dụng chuyển trạng thái trong transaction đã khóa hàng
    async applyModeration(client, type, row, action, reason, adminId, reportId = null) {
        const { to, reason: cleanReason } = P.moderationTransition(action, row.status, reason);
        await client.query(
            `UPDATE ${TABLE[type]} SET status = $1::varchar,
                moderation_reason = CASE WHEN $1::varchar = 'PUBLISHED' THEN NULL ELSE $2::text END,
                published_at = CASE WHEN $1::varchar = 'PUBLISHED' THEN COALESCE(published_at, NOW()) ELSE published_at END,
                updated_at = NOW()
             WHERE id = $3`,
            [to, cleanReason, row.id]
        );
        await log(client, type, row.id, { actorId: adminId, actorRole: 'ADMIN', action, from: row.status, to, reason: cleanReason, reportId });
        await client.query(
            `INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata) VALUES ($1, $2, $3, $4, $5)`,
            [adminId, `REVIEW_${action}`, TARGET[type], row.id, JSON.stringify({ from: row.status, to, reason: cleanReason, report_id: reportId })]
        );
        // Ẩn/gỡ → đóng các báo cáo đang chờ trên cùng review
        if (to === 'HIDDEN' || to === 'REMOVED') {
            await client.query(
                `UPDATE review_reports SET status = 'RESOLVED', resolution_note = $1, resolved_by = $2, resolved_at = NOW()
                 WHERE ${FK[type]} = $3 AND kind = 'REPORT' AND status = 'PENDING'`,
                [`Đã xử lý: ${action} — ${cleanReason}`, adminId, row.id]
            );
        }
        const messages = {
            PUBLISHED: ['Đánh giá của bạn đã được công khai', 'Đánh giá của bạn đã được duyệt và hiển thị công khai.'],
            REJECTED: ['Đánh giá của bạn chưa được duyệt', `Lý do: ${cleanReason}`],
            HIDDEN: ['Đánh giá của bạn đã bị ẩn', `Lý do: ${cleanReason}`],
            REMOVED: ['Đánh giá của bạn đã bị gỡ', `Lý do: ${cleanReason}`],
        };
        await notify(client, row.reviewer_id, messages[to][0], messages[to][1], TARGET[type], row.id);
        if (to === 'PUBLISHED' && row.status === 'PENDING') {
            await notify(client, row.employer_id, 'Doanh nghiệp có đánh giá mới', 'Một đánh giá mới vừa được công khai.', TARGET[type], row.id);
        }
        return to;
    }

    async adminModerate(adminId, type, id, { action, reason }) {
        return withTransaction(async (client) => {
            const row = (await client.query(`SELECT * FROM ${TABLE[type]} WHERE id = $1 FOR UPDATE`, [id])).rows[0];
            if (!row) throw new NotFoundError('Không tìm thấy đánh giá');
            if (action === 'HIDE_REPLY' || action === 'SHOW_REPLY') {
                const clean = P.sanitizeText(reason);
                if (clean.length < 5) throw new AppError('Vui lòng nhập lý do (tối thiểu 5 ký tự)', 400);
                const target = action === 'HIDE_REPLY' ? 'HIDDEN' : 'VISIBLE';
                const upd = await client.query(
                    `UPDATE review_replies SET status = $1, updated_at = NOW() WHERE ${FK[type]} = $2 RETURNING id`, [target, id]
                );
                if (!upd.rows.length) throw new NotFoundError('Đánh giá này chưa có phản hồi');
                await log(client, type, id, { actorId: adminId, actorRole: 'ADMIN', action, reason: clean });
                await client.query(
                    `INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata) VALUES ($1, $2, $3, $4, $5)`,
                    [adminId, `REVIEW_${action}`, TARGET[type], id, JSON.stringify({ reason: clean })]
                );
                return { status: row.status, reply_status: target };
            }
            const to = await this.applyModeration(client, type, row, action, reason, adminId);
            return { status: to };
        });
    }

    async adminListReports(query) {
        const { page, limit, offset } = P.parsePaging(query, 20);
        const where = ['TRUE'];
        const params = [];
        const status = String(query.status || 'PENDING').toUpperCase();
        if (['PENDING', 'RESOLVED', 'DISMISSED'].includes(status)) { params.push(status); where.push(`x.status = $${params.length}`); }
        const kind = String(query.kind || '').toUpperCase();
        if (['REPORT', 'APPEAL'].includes(kind)) { params.push(kind); where.push(`x.kind = $${params.length}`); }
        const whereSql = where.join(' AND ');
        const [rows, count] = await Promise.all([
            db.query(
                `SELECT x.*, u.full_name AS reporter_name, u.role AS reporter_role,
                        CASE WHEN x.company_review_id IS NOT NULL THEN 'company' ELSE 'job' END AS review_type,
                        COALESCE(x.company_review_id, x.job_review_id) AS review_id,
                        COALESCE(cr.status, jr.status) AS review_status,
                        COALESCE(cr.title, LEFT(jr.content, 120)) AS review_excerpt,
                        COALESCE(cr.rating_overall, jr.rating_overall) AS review_rating
                 FROM review_reports x JOIN users u ON u.id = x.reporter_id
                 LEFT JOIN company_reviews cr ON cr.id = x.company_review_id
                 LEFT JOIN job_reviews jr ON jr.id = x.job_review_id
                 WHERE ${whereSql} ORDER BY x.created_at DESC, x.id DESC LIMIT ${limit} OFFSET ${offset}`,
                params
            ),
            db.query(`SELECT COUNT(*) FROM review_reports x WHERE ${whereSql}`, params),
        ]);
        const total = Number(count.rows[0].count);
        return { data: rows.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
    }

    // REPORT: DISMISS | HIDE | REMOVE — APPEAL: ACCEPT (khôi phục công khai) | DENY
    async adminResolveReport(adminId, reportId, { action, note }) {
        const clean = P.sanitizeText(note);
        if (clean.length < 5) throw new AppError('Vui lòng nhập ghi chú xử lý (tối thiểu 5 ký tự)', 400);
        return withTransaction(async (client) => {
            const rep = (await client.query('SELECT * FROM review_reports WHERE id = $1 FOR UPDATE', [reportId])).rows[0];
            if (!rep) throw new NotFoundError('Không tìm thấy báo cáo');
            if (rep.status !== 'PENDING') throw new ConflictError('Báo cáo này đã được xử lý');
            const type = rep.company_review_id ? 'company' : 'job';
            const reviewId = rep.company_review_id || rep.job_review_id;
            const row = (await client.query(`SELECT * FROM ${TABLE[type]} WHERE id = $1 FOR UPDATE`, [reviewId])).rows[0];
            const allowed = rep.kind === 'REPORT' ? ['DISMISS', 'HIDE', 'REMOVE'] : ['ACCEPT', 'DENY'];
            if (!allowed.includes(action)) throw new AppError(`Hành động không hợp lệ. Chọn một trong: ${allowed.join(', ')}`, 400);

            let reviewStatus = row.status;
            if (action === 'HIDE' || action === 'REMOVE' || action === 'ACCEPT') {
                reviewStatus = await this.applyModeration(client, type, row, action === 'ACCEPT' ? 'RESTORE' : action, clean, adminId, rep.id);
            } else {
                await log(client, type, reviewId, { actorId: adminId, actorRole: 'ADMIN', action: rep.kind === 'REPORT' ? 'REPORT_DISMISSED' : 'APPEAL_DENIED', reason: clean, reportId: rep.id });
                await client.query(
                    `INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata) VALUES ($1, $2, $3, $4, $5)`,
                    [adminId, `REVIEW_${rep.kind}_${action}`, TARGET[type], reviewId, JSON.stringify({ report_id: rep.id, note: clean })]
                );
            }
            const finalStatus = ['DISMISS', 'DENY'].includes(action) ? 'DISMISSED' : 'RESOLVED';
            await client.query(
                `UPDATE review_reports SET status = $1, resolution_note = $2, resolved_by = $3, resolved_at = NOW() WHERE id = $4`,
                [finalStatus, clean, adminId, rep.id]
            );
            if (rep.kind === 'APPEAL' && action === 'DENY') {
                await notify(client, rep.reporter_id, 'Khiếu nại đánh giá không được chấp nhận', `Lý do: ${clean}`, TARGET[type], reviewId);
            }
            if (rep.kind === 'REPORT') {
                await notify(client, rep.reporter_id, 'Báo cáo đánh giá đã được xử lý',
                    action === 'DISMISS' ? 'Quản trị viên đã xem xét và giữ nguyên đánh giá.' : 'Quản trị viên đã xử lý đánh giá bạn báo cáo.', TARGET[type], reviewId);
            }
            return { report_status: finalStatus, review_status: reviewStatus };
        });
    }
}

module.exports = new ExperienceReviewService();
module.exports.TooManyRequestsError = TooManyRequestsError;
