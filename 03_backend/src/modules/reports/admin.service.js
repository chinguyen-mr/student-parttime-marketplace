const userRepository = require('../../database/repositories/user.repository');
const jobRepository = require('../../database/repositories/job.repository');
const db = require('../../config/db');
const { NotFoundError, AppError } = require('../../utils/app-error');

class AdminService {
    // =========================================================================
    // 1. STATS (WF-A01)
    // =========================================================================
    async getSystemStats() {
        const [usersRes, jobsRes, appsRes, repRes, jobsByTypeRes, recentLogsRes] = await Promise.all([
            db.query(`SELECT role, status, COUNT(*) as count FROM users GROUP BY role, status`),
            db.query(`SELECT status, moderation_status, COUNT(*) as count FROM jobs GROUP BY status, moderation_status`),
            db.query(`SELECT status, COUNT(*) as count FROM applications GROUP BY status`),
            db.query(`SELECT status, COUNT(*) as count FROM reports GROUP BY status`),
            db.query(`SELECT COALESCE(work_type, 'PART_TIME') as work_type, COUNT(*) as count FROM jobs GROUP BY work_type`),
            db.query(`
                SELECT l.id, l.action, l.target_type, l.target_id, l.metadata, l.created_at,
                       COALESCE(u.full_name, 'Admin') as admin_name,
                       CASE l.target_type
                           WHEN 'USER' THEN COALESCE(NULLIF(tu.full_name, ''), tu.email)
                           WHEN 'JOB' THEN tj.title
                           WHEN 'CATEGORY' THEN tc.name
                       END AS target_label
                FROM admin_logs l
                LEFT JOIN users u ON l.admin_id = u.id
                LEFT JOIN users tu ON l.target_type = 'USER' AND tu.id = l.target_id
                LEFT JOIN jobs tj ON l.target_type = 'JOB' AND tj.id = l.target_id
                LEFT JOIN categories tc ON l.target_type = 'CATEGORY' AND tc.id = l.target_id
                ORDER BY l.created_at DESC
                LIMIT 8
            `)
        ]);

        return {
            users: usersRes.rows,
            jobs: jobsRes.rows,
            applications: appsRes.rows,
            reports: repRes.rows,
            jobs_by_type: jobsByTypeRes.rows,
            recent_activities: recentLogsRes.rows
        };
    }

    // =========================================================================
    // 2. USERS (WF-A02)
    // =========================================================================
    async listUsers(options = {}) {
        const { role, status, search, limit = 50, offset = 0 } = options;
        let query = `
            SELECT u.id, u.email, u.full_name, u.phone, u.role, u.status, u.created_at,
                   ep.display_name, ep.account_type,
                   CASE 
                     WHEN ep.email_verified_at IS NOT NULL AND ep.phone_verified_at IS NOT NULL THEN true
                     ELSE false
                   END as is_verified
            FROM users u
            LEFT JOIN employer_profiles ep ON u.id = ep.user_id
            WHERE 1=1
        `;
        const params = [];

        if (role && role !== 'ALL') {
            params.push(role);
            query += ` AND u.role = $${params.length}`;
        }

        if (status && status !== 'ALL') {
            params.push(status);
            query += ` AND u.status = $${params.length}`;
        }

        if (search && search.trim()) {
            params.push(`%${search.trim().toLowerCase()}%`);
            query += ` AND (LOWER(u.email) LIKE $${params.length} OR LOWER(u.full_name) LIKE $${params.length} OR u.phone LIKE $${params.length})`;
        }

        params.push(limit, offset);
        query += ` ORDER BY u.id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

        const res = await db.query(query, params);
        return res.rows;
    }

    async updateUserStatus(userId, status, adminId = null, reason = null) {
        if (!['ACTIVE', 'BANNED', 'PENDING'].includes(status)) {
            throw new AppError('Trạng thái tài khoản không hợp lệ (ACTIVE, BANNED, PENDING)', 400);
        }

        // Bắt buộc nhập lý do khi khóa tài khoản
        if (status === 'BANNED' && (!reason || !reason.trim())) {
            throw new AppError('Bắt buộc phải nhập lý do khi khóa tài khoản người dùng.', 400);
        }

        // Quy tắc Wireframe WF-A02: "Không thể khóa Admin cuối cùng."
        if (status === 'BANNED') {
            const targetUserRes = await db.query('SELECT id, role, status FROM users WHERE id = $1', [userId]);
            if (targetUserRes.rows.length === 0) {
                throw new NotFoundError('Không tìm thấy người dùng');
            }
            if (targetUserRes.rows[0].role === 'ADMIN') {
                const countAdminRes = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN' AND status = 'ACTIVE'");
                const activeAdmins = parseInt(countAdminRes.rows[0].count, 10);
                if (activeAdmins <= 1) {
                    throw new AppError('Không thể khóa Admin cuối cùng của hệ thống.', 400);
                }
            }
        }

        const user = await userRepository.updateStatus(userId, status);
        if (!user) {
            throw new NotFoundError('Không tìm thấy người dùng');
        }

        // Cập nhật thông tin lý do khóa / mở khóa
        if (status === 'BANNED') {
            await db.query(
                `UPDATE users 
                 SET suspension_reason = $1, suspended_at = CURRENT_TIMESTAMP 
                 WHERE id = $2`,
                [reason, userId]
            );

            // Gửi thông báo cho người dùng bị khóa kèm lý do và hướng dẫn khiếu nại
            try {
                await db.query(
                    `INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
                     VALUES ($1, 'ACCOUNT_BANNED', 'Tài khoản của bạn đã bị khóa', $2, 'USER', $1)`,
                    [
                        userId,
                        `Tài khoản của bạn đã bị khóa bởi Quản trị viên. Lý do: ${reason}. Bạn có thể gửi khiếu nại để được xem xét mở khóa.`
                    ]
                );
            } catch (notifErr) {
                console.warn('Lỗi gửi notification khóa user:', notifErr.message);
            }
        } else if (status === 'ACTIVE') {
            await db.query(
                `UPDATE users 
                 SET suspension_reason = NULL, suspended_at = NULL, suspension_expires_at = NULL 
                 WHERE id = $1`,
                [userId]
            );

            // Gửi thông báo mở khóa
            try {
                await db.query(
                    `INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
                     VALUES ($1, 'ACCOUNT_UNBANNED', 'Tài khoản đã được mở khóa', 'Tài khoản của bạn đã được Quản trị viên kích hoạt lại và có thể tiếp tục sử dụng hệ thống.', 'USER', $1)`,
                    [userId]
                );
            } catch (notifErr) {
                console.warn('Lỗi gửi notification mở khóa user:', notifErr.message);
            }
        }

        // Log action
        try {
            await db.query(
                `INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata)
                 VALUES ($1, $2, 'USER', $3, $4)`,
                [
                    adminId,
                    status === 'BANNED' ? 'BAN_USER' : 'UNBAN_USER',
                    userId,
                    JSON.stringify({ new_status: status, email: user.email, reason: reason || null })
                ]
            );
        } catch (e) {
            console.warn('Failed to insert admin log for updateUserStatus:', e.message);
        }

        return user;
    }

    async toggleUserVerification(userId, isVerified, adminId = null) {
        const userRes = await db.query('SELECT id, role FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            throw new NotFoundError('Không tìm thấy người dùng');
        }

        // Đảm bảo hồ sơ Employer tồn tại
        const profileRes = await db.query('SELECT id FROM employer_profiles WHERE user_id = $1', [userId]);
        if (profileRes.rows.length === 0) {
            await db.query(
                `INSERT INTO employer_profiles (user_id, email_verified_at, phone_verified_at)
                 VALUES ($1, $2, $3)`,
                [userId, isVerified ? new Date() : null, isVerified ? new Date() : null]
            );
        } else {
            await db.query(
                `UPDATE employer_profiles 
                 SET email_verified_at = $1, phone_verified_at = $2, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $3`,
                [isVerified ? new Date() : null, isVerified ? new Date() : null, userId]
            );
        }

        // Log action
        try {
            await db.query(
                `INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata)
                 VALUES ($1, $2, 'USER', $3, $4)`,
                [
                    adminId,
                    isVerified ? 'VERIFY_EMPLOYER' : 'UNVERIFY_EMPLOYER',
                    userId,
                    JSON.stringify({ is_verified: isVerified })
                ]
            );
        } catch (e) {
            console.warn('Failed to insert admin log for toggleUserVerification:', e.message);
        }

        return { user_id: userId, is_verified: isVerified };
    }

    // =========================================================================
    // 3. JOB MODERATION (WF-A03 & WF-A04)
    // =========================================================================
    async listPendingJobs(options = {}) {
        const { work_type, moderation_status = 'PENDING', limit = 50, offset = 0 } = options;
        let query = `
            SELECT j.*, 
                   u.full_name as employer_name, u.email as employer_email, u.phone as employer_phone,
                   ep.display_name as company_name,
                   COALESCE(j.work_type, 'PART_TIME') as work_type
            FROM jobs j
            LEFT JOIN users u ON j.employer_id = u.id
            LEFT JOIN employer_profiles ep ON u.id = ep.user_id
            WHERE 1=1
        `;
        const params = [];

        if (moderation_status && moderation_status !== 'ALL') {
            params.push(moderation_status);
            query += ` AND j.moderation_status = $${params.length}`;
        }

        if (work_type && work_type !== 'ALL') {
            params.push(work_type);
            query += ` AND j.work_type = $${params.length}`;
        }

        params.push(limit, offset);
        query += ` ORDER BY j.id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

        const res = await db.query(query, params);
        return res.rows;
    }

    async getJobDetail(jobId) {
        const res = await db.query(`
            SELECT j.*, 
                   u.full_name as employer_name, u.email as employer_email, u.phone as employer_phone,
                   ep.display_name as company_name, ep.bio as company_bio, ep.location as company_location
            FROM jobs j
            LEFT JOIN users u ON j.employer_id = u.id
            LEFT JOIN employer_profiles ep ON u.id = ep.user_id
            WHERE j.id = $1
        `, [jobId]);

        if (res.rows.length === 0) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }
        return res.rows[0];
    }

    async moderateJob(jobId, moderationStatus, moderationReason = null, adminId = null) {
        if (!['APPROVED', 'REJECTED'].includes(moderationStatus)) {
            throw new AppError('Trạng thái duyệt không hợp lệ (APPROVED hoặc REJECTED)', 400);
        }

        // Quy tắc Wireframe WF-A04: "Nút Từ chối bị disable khi chưa nhập moderation_reason. Bắt buộc khi từ chối."
        if (moderationStatus === 'REJECTED' && (!moderationReason || !moderationReason.trim())) {
            throw new AppError('Bắt buộc phải nhập lý do khi từ chối tin tuyển dụng.', 400);
        }

        const newJobStatus = moderationStatus === 'APPROVED' ? 'OPEN' : 'REJECTED';

        const res = await db.query(`
            UPDATE jobs
            SET moderation_status = $1,
                status = $2,
                moderation_reason = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `, [moderationStatus, newJobStatus, moderationReason, jobId]);

        const job = res.rows[0];
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }

        // Gửi Notification cho Nhà tuyển dụng
        try {
            await db.query(
                `INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    job.employer_id,
                    'JOB',
                    moderationStatus === 'APPROVED' ? 'Tin tuyển dụng đã được phê duyệt' : 'Tin tuyển dụng bị từ chối phê duyệt',
                    moderationStatus === 'APPROVED' 
                        ? `Tin tuyển dụng "${job.title}" đã được Quản trị viên duyệt và công khai trên thị trường việc làm.`
                        : `Tin tuyển dụng "${job.title}" không được phê duyệt. Lý do: ${moderationReason}`,
                    'JOB',
                    job.id
                ]
            );
        } catch (e) {
            console.warn('Failed to insert notification for job moderation:', e.message);
        }

        // Log vào admin_logs
        try {
            await db.query(
                `INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata)
                 VALUES ($1, $2, 'JOB', $3, $4)`,
                [
                    adminId,
                    moderationStatus === 'APPROVED' ? 'APPROVE_JOB' : 'REJECT_JOB',
                    jobId,
                    JSON.stringify({ title: job.title, moderation_status: moderationStatus, reason: moderationReason })
                ]
            );
        } catch (e) {
            console.warn('Failed to insert admin log for job moderation:', e.message);
        }

        return job;
    }

    // =========================================================================
    // 4. REPORTS (WF-A05 & WF-A06)
    // =========================================================================
    async listReports(options = {}) {
        const { status, target_type, limit = 50, offset = 0 } = options;
        let query = `
            SELECT r.*,
                   u.full_name as reporter_name, u.email as reporter_email,
                   CASE 
                     WHEN r.target_type = 'JOB' THEN (SELECT title FROM jobs WHERE id = r.target_id)
                     WHEN r.target_type = 'USER' THEN (SELECT full_name FROM users WHERE id = r.target_id)
                     ELSE 'N/A'
                   END as target_title
            FROM reports r
            LEFT JOIN users u ON r.reporter_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status && status !== 'ALL') {
            params.push(status);
            query += ` AND r.status = $${params.length}`;
        }

        if (target_type && target_type !== 'ALL') {
            params.push(target_type);
            query += ` AND r.target_type = $${params.length}`;
        }

        params.push(limit, offset);
        query += ` ORDER BY r.id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

        const res = await db.query(query, params);
        return res.rows;
    }

    async getReportDetail(reportId) {
        const repRes = await db.query(`
            SELECT r.*,
                   u.full_name as reporter_name, u.email as reporter_email, u.phone as reporter_phone
            FROM reports r
            LEFT JOIN users u ON r.reporter_id = u.id
            WHERE r.id = $1
        `, [reportId]);

        if (repRes.rows.length === 0) {
            throw new NotFoundError('Không tìm thấy báo cáo');
        }
        const report = repRes.rows[0];

        // Lấy thông tin preview của target (Job hoặc User)
        let targetPreview = null;
        if (report.target_type === 'JOB') {
            const jobRes = await db.query(`
                SELECT j.id, j.title, j.description, j.status, j.salary, j.work_type,
                       u.full_name as employer_name, u.email as employer_email
                FROM jobs j
                LEFT JOIN users u ON j.employer_id = u.id
                WHERE j.id = $1
            `, [report.target_id]);
            targetPreview = jobRes.rows[0] || null;
        } else if (report.target_type === 'USER') {
            const userRes = await db.query(`
                SELECT id, email, full_name, phone, role, status FROM users WHERE id = $1
            `, [report.target_id]);
            targetPreview = userRes.rows[0] || null;
        }

        // Lấy lịch sử xử lý từ report_actions
        const actionsRes = await db.query(`
            SELECT ra.*, u.full_name as admin_name
            FROM report_actions ra
            LEFT JOIN users u ON ra.admin_id = u.id
            WHERE ra.report_id = $1
            ORDER BY ra.created_at DESC
        `, [reportId]);

        return {
            report,
            target_preview: targetPreview,
            history: actionsRes.rows
        };
    }

    async resolveReport(reportId, { action, note }, adminId = null) {
        if (!['WARNING', 'BAN_USER', 'REMOVE_JOB', 'DISMISS'].includes(action)) {
            throw new AppError('Hành động xử lý không hợp lệ (WARNING, BAN_USER, REMOVE_JOB, DISMISS)', 400);
        }

        const repRes = await db.query('SELECT * FROM reports WHERE id = $1', [reportId]);
        if (repRes.rows.length === 0) {
            throw new NotFoundError('Không tìm thấy báo cáo');
        }
        const report = repRes.rows[0];

        // Thực thi hành động tương ứng
        if (action === 'BAN_USER') {
            let userIdToBan = report.target_type === 'USER' ? report.target_id : null;
            if (report.target_type === 'JOB') {
                const jRes = await db.query('SELECT employer_id FROM jobs WHERE id = $1', [report.target_id]);
                if (jRes.rows.length > 0) userIdToBan = jRes.rows[0].employer_id;
            }
            if (userIdToBan) {
                await db.query("UPDATE users SET status = 'BANNED', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [userIdToBan]);
            }
        } else if (action === 'REMOVE_JOB') {
            if (report.target_type === 'JOB') {
                await db.query("UPDATE jobs SET status = 'REJECTED', moderation_status = 'REJECTED', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [report.target_id]);
            }
        }

        // Cập nhật trạng thái báo cáo
        await db.query("UPDATE reports SET status = 'RESOLVED' WHERE id = $1", [reportId]);

        // Ghi vào report_actions
        const actRes = await db.query(`
            INSERT INTO report_actions (report_id, admin_id, action, note)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [reportId, adminId, action, note || 'Đã xử lý theo thẩm quyền Quản trị viên']);

        // Ghi vào admin_logs
        try {
            await db.query(`
                INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata)
                VALUES ($1, 'RESOLVE_REPORT', 'REPORT', $2, $3)
            `, [adminId, reportId, JSON.stringify({ action, note, target_type: report.target_type, target_id: report.target_id })]);
        } catch (e) {
            console.warn('Failed to insert admin log for resolveReport:', e.message);
        }

        return actRes.rows[0];
    }

    // =========================================================================
    // 5. CATEGORIES (WF-A07)
    // =========================================================================
    async listCategories() {
        const res = await db.query(`
            SELECT c.*, 
                   p.name as parent_name,
                   (SELECT COUNT(*) FROM jobs WHERE category = c.name) as job_count
            FROM categories c
            LEFT JOIN categories p ON c.parent_id = p.id
            ORDER BY c.id ASC
        `);
        return res.rows;
    }

    async createCategory({ name, parent_id = null, is_active = true }, adminId = null) {
        if (!name || !name.trim()) {
            throw new AppError('Tên ngành nghề không được để trống', 400);
        }
        const res = await db.query(`
            INSERT INTO categories (name, parent_id, is_active, created_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            RETURNING *
        `, [name.trim(), parent_id || null, is_active !== false]);
        
        const cat = res.rows[0];
        try {
            await db.query(`
                INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata)
                VALUES ($1, 'CREATE_CATEGORY', 'CATEGORY', $2, $3)
            `, [adminId, cat.id, JSON.stringify({ name: cat.name })]);
        } catch (e) {}

        return cat;
    }

    async updateCategory(id, { name, parent_id = null, is_active = true }, adminId = null) {
        const res = await db.query(`
            UPDATE categories
            SET name = COALESCE($1, name),
                parent_id = $2,
                is_active = $3
            WHERE id = $4
            RETURNING *
        `, [name ? name.trim() : null, parent_id || null, is_active, id]);

        if (res.rows.length === 0) {
            throw new NotFoundError('Không tìm thấy danh mục');
        }
        const cat = res.rows[0];
        try {
            await db.query(`
                INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata)
                VALUES ($1, 'UPDATE_CATEGORY', 'CATEGORY', $2, $3)
            `, [adminId, cat.id, JSON.stringify({ name: cat.name, is_active })]);
        } catch (e) {}

        return cat;
    }

    async deleteCategory(id, adminId = null) {
        const catRes = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
        if (catRes.rows.length === 0) {
            throw new NotFoundError('Không tìm thấy danh mục');
        }
        await db.query('DELETE FROM categories WHERE id = $1', [id]);
        try {
            await db.query(`
                INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata)
                VALUES ($1, 'DELETE_CATEGORY', 'CATEGORY', $2, $3)
            `, [adminId, id, JSON.stringify({ deleted_name: catRes.rows[0].name })]);
        } catch (e) {}

        return { id, success: true };
    }

    // =========================================================================
    // 6. ADMIN SYSTEM LOGS (WF-A08)
    // =========================================================================
    async listAdminLogs(options = {}) {
        const { action, limit = 50, offset = 0 } = options;
        let query = `
            SELECT l.*,
                   u.full_name as admin_name, u.email as admin_email,
                   -- Tên dễ đọc của đối tượng bị tác động (thay cho "USER #128")
                   CASE l.target_type
                       WHEN 'USER' THEN COALESCE(NULLIF(tu.full_name, ''), tu.email)
                       WHEN 'JOB' THEN tj.title
                       WHEN 'CATEGORY' THEN tc.name
                   END AS target_label
            FROM admin_logs l
            LEFT JOIN users u ON l.admin_id = u.id
            LEFT JOIN users tu ON l.target_type = 'USER' AND tu.id = l.target_id
            LEFT JOIN jobs tj ON l.target_type = 'JOB' AND tj.id = l.target_id
            LEFT JOIN categories tc ON l.target_type = 'CATEGORY' AND tc.id = l.target_id
            WHERE 1=1
        `;
        const params = [];

        if (action && action !== 'ALL') {
            params.push(action);
            query += ` AND l.action = $${params.length}`;
        }

        params.push(limit, offset);
        query += ` ORDER BY l.id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

        const res = await db.query(query, params);
        return res.rows;
    }

    // =========================================================================
    // 7. VIOLATION & APPEAL POLICY (4-TIER ENFORCEMENT)
    // =========================================================================
    async recordUserViolation(userId, payload, adminId = null) {
        const { violation_code, violation_type, severity = 'MEDIUM', reason, evidence } = payload;
        if (!reason || !reason.trim()) {
            throw new AppError('Bắt buộc phải nhập lý do khi ghi nhận vi phạm.', 400);
        }

        const userRes = await db.query('SELECT id, role, status, violation_count FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            throw new NotFoundError('Không tìm thấy người dùng');
        }
        const user = userRes.rows[0];

        const newCount = (user.violation_count || 0) + 1;
        let tier = 1;
        let newStatus = user.status;
        let title = '';
        let body = '';

        if (newCount === 1) {
            tier = 1;
            title = 'Cảnh báo vi phạm chính sách lần 1';
            body = `Hệ thống ghi nhận vi phạm lần 1: ${reason}. Vui lòng tuân thủ quy chuẩn cộng đồng JobNest.`;
        } else if (newCount === 2) {
            tier = 2;
            title = 'Cảnh cáo vi phạm chính sách lần 2';
            body = `Hệ thống phát cảnh cáo lần 2: ${reason}. Nếu tiếp tục vi phạm, tài khoản sẽ bị tạm khóa.`;
        } else if (newCount === 3) {
            tier = 3;
            newStatus = 'BANNED';
            title = 'Tài khoản bị tạm khóa 7 ngày (Vi phạm lần 3)';
            body = `Tài khoản của bạn đã bị tạm khóa do vi phạm lần 3: ${reason}. Bạn có thể gửi khiếu nại để được xem xét.`;
            await db.query(
                `UPDATE users 
                 SET status = 'BANNED', suspension_reason = $1, suspended_at = CURRENT_TIMESTAMP, 
                     suspension_expires_at = CURRENT_TIMESTAMP + INTERVAL '7 days' 
                 WHERE id = $2`,
                [reason, userId]
            );
        } else {
            tier = 4;
            newStatus = 'BANNED';
            title = 'Tài khoản bị khóa vĩnh viễn (Vi phạm lần 4)';
            body = `Tài khoản của bạn đã bị khóa vĩnh viễn do tích lũy 4 lần vi phạm: ${reason}. Quyết định có hiệu lực ngay lập tức.`;
            await db.query(
                `UPDATE users 
                 SET status = 'BANNED', suspension_reason = $1, suspended_at = CURRENT_TIMESTAMP, 
                     suspension_expires_at = NULL 
                 WHERE id = $2`,
                [reason, userId]
            );
        }

        await db.query(
            `UPDATE users SET violation_count = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [newCount, userId]
        );

        const violRes = await db.query(
            `INSERT INTO user_violations 
             (user_id, violation_code, violation_type, severity, tier, reason, evidence, handled_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [userId, violation_code || `VIOL-${Date.now().toString().slice(-6)}`, violation_type || 'CHÍNH SÁCH CHUNG', severity, tier, reason, evidence || null, adminId]
        );

        try {
            await db.query(
                `INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
                 VALUES ($1, 'VIOLATION_NOTICE', $2, $3, 'USER', $1)`,
                [userId, title, body]
            );
        } catch (notifErr) {}

        try {
            await db.query(
                `INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata)
                 VALUES ($1, 'RECORD_VIOLATION', 'USER', $2, $3)`,
                [adminId, userId, JSON.stringify({ tier, newCount, reason, violation_type })]
            );
        } catch (e) {}

        return {
            violation: violRes.rows[0],
            violation_count: newCount,
            tier,
            status: newStatus
        };
    }

    async listUserViolations(userId) {
        const res = await db.query(
            `SELECT v.*, u.full_name as handler_name
             FROM user_violations v
             LEFT JOIN users u ON v.handled_by = u.id
             WHERE v.user_id = $1
             ORDER BY v.created_at DESC`,
            [userId]
        );
        return res.rows;
    }

    async submitAppeal(userId, payload) {
        const { violation_id, appeal_reason, evidence_url } = payload;
        if (!appeal_reason || !appeal_reason.trim()) {
            throw new AppError('Bắt buộc phải nhập nội dung giải trình khi gửi khiếu nại.', 400);
        }

        const res = await db.query(
            `INSERT INTO user_appeals (user_id, violation_id, appeal_reason, evidence_url)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [userId, violation_id || null, appeal_reason, evidence_url || null]
        );

        return res.rows[0];
    }

    async listAppeals(options = {}) {
        const { status = 'ALL', limit = 50, offset = 0 } = options;
        let query = `
            SELECT a.*, u.email, u.full_name, u.role, u.status as user_status, u.violation_count, u.suspension_reason
            FROM user_appeals a
            JOIN users u ON a.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        if (status !== 'ALL') {
            params.push(status);
            query += ` AND a.status = $${params.length}`;
        }
        params.push(limit, offset);
        query += ` ORDER BY a.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

        const res = await db.query(query, params);
        return res.rows;
    }

    async resolveAppeal(appealId, payload, adminId = null) {
        const { status, admin_response } = payload;
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            throw new AppError('Quyết định giải quyết khiếu nại không hợp lệ (APPROVED hoặc REJECTED)', 400);
        }
        if (!admin_response || !admin_response.trim()) {
            throw new AppError('Bắt buộc phải nhập phản hồi của Quản trị viên.', 400);
        }

        const appealRes = await db.query('SELECT * FROM user_appeals WHERE id = $1', [appealId]);
        if (appealRes.rows.length === 0) {
            throw new NotFoundError('Không tìm thấy đơn khiếu nại');
        }
        const appeal = appealRes.rows[0];

        const updatedRes = await db.query(
            `UPDATE user_appeals
             SET status = $1, admin_response = $2, resolved_by = $3, resolved_at = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING *`,
            [status, admin_response, adminId, appealId]
        );

        if (status === 'APPROVED') {
            await db.query(
                `UPDATE users 
                 SET status = 'ACTIVE', suspension_reason = NULL, suspended_at = NULL, suspension_expires_at = NULL 
                 WHERE id = $1`,
                [appeal.user_id]
            );

            if (appeal.violation_id) {
                await db.query(`UPDATE user_violations SET status = 'REVOKED' WHERE id = $1`, [appeal.violation_id]);
            }

            try {
                await db.query(
                    `INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
                     VALUES ($1, 'APPEAL_APPROVED', 'Khiếu nại được chấp thuận', $2, 'USER', $1)`,
                    [
                        appeal.user_id,
                        `Khiếu nại của bạn đã được chấp thuận! Tài khoản đã được khôi phục. Phản hồi: ${admin_response}`
                    ]
                );
            } catch (e) {}
        } else {
            try {
                await db.query(
                    `INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
                     VALUES ($1, 'APPEAL_REJECTED', 'Khiếu nại bị từ chối', $2, 'USER', $1)`,
                    [
                        appeal.user_id,
                        `Khiếu nại của bạn đã bị từ chối. Lý do: ${admin_response}`
                    ]
                );
            } catch (e) {}
        }

        return updatedRes.rows[0];
    }
}

module.exports = new AdminService();
