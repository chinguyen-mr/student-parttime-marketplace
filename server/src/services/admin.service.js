const userRepository = require('../repositories/user.repository');
const jobRepository = require('../repositories/job.repository');
const db = require('../config/db');
const { NotFoundError, AppError } = require('../errors/app-error');

class AdminService {
    async listUsers(options) {
        return userRepository.findAll(options);
    }

    async updateUserStatus(userId, status) {
        if (!['ACTIVE', 'BANNED', 'PENDING'].includes(status)) {
            throw new AppError('Trạng thái tài khoản không hợp lệ', 400);
        }
        const user = await userRepository.updateStatus(userId, status);
        if (!user) {
            throw new NotFoundError('Không tìm thấy người dùng');
        }
        return user;
    }

    async moderateJob(jobId, moderationStatus) {
        if (!['APPROVED', 'REJECTED'].includes(moderationStatus)) {
            throw new AppError('Trạng thái duyệt không hợp lệ (APPROVED hoặc REJECTED)', 400);
        }
        const job = await jobRepository.updateModerationStatus(jobId, moderationStatus);
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }
        return job;
    }

    async getSystemStats() {
        const [usersRes, jobsRes, appsRes] = await Promise.all([
            db.query(`SELECT role, COUNT(*) as count FROM users GROUP BY role`),
            db.query(`SELECT status, moderation_status, COUNT(*) as count FROM jobs GROUP BY status, moderation_status`),
            db.query(`SELECT status, COUNT(*) as count FROM applications GROUP BY status`),
        ]);

        return {
            users: usersRes.rows,
            jobs: jobsRes.rows,
            applications: appsRes.rows,
        };
    }
}

module.exports = new AdminService();
