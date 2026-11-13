const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getJwtSecret } = require('../../config/jwt.config');
const userRepository = require('../../database/repositories/user.repository');
const profileRepository = require('../../database/repositories/profile.repository');
const emailService = require('../../services/email.service');
const db = require('../../config/db');
const { ConflictError, UnauthorizedError, AppError } = require('../../utils/app-error');

class AuthService {
    async register(registerData) {
        const {
            email,
            password,
            full_name,
            representative_name,
            representative_title,
            phone,
            role,
            // Candidate specific
            date_of_birth,
            gender,
            province,
            interested_category,
            desired_position,
            // Employer specific
            company_name,
            company_type,
            industry,
            company_size,
        } = registerData;

        // Business Rule: Email phải là duy nhất
        const cleanEmail = String(email).trim().toLowerCase();
        const existingEmail = await userRepository.findByEmail(cleanEmail);
        if (existingEmail) {
            throw new ConflictError('Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.');
        }

        // Business Rule: Số điện thoại phải là duy nhất nếu được cung cấp
        const cleanPhone = phone ? String(phone).trim() : null;
        if (cleanPhone) {
            const existingPhone = await userRepository.findByPhone(cleanPhone);
            if (existingPhone) {
                throw new ConflictError('Số điện thoại này đã được đăng ký tài khoản trên hệ thống.');
            }
        }

        const userFullName = (full_name || representative_name || company_name || 'Người dùng').trim();
        const password_hash = await bcrypt.hash(password, 10);
        const user = await userRepository.create({
            email: cleanEmail,
            password_hash,
            full_name: userFullName,
            phone: cleanPhone,
            role,
        });

        // Khởi tạo hồ sơ ban đầu cho Candidate hoặc Employer với dữ liệu Bước 1
        try {
            if (role === 'EMPLOYER') {
                await profileRepository.upsert(user.id, {
                    display_name: company_name || userFullName,
                    company_name: company_name || userFullName,
                    representative_name: representative_name || userFullName,
                    representative_title: representative_title || null,
                    company_type: company_type || null,
                    account_type: company_type || null,
                    industry: industry || null,
                    company_size: company_size || null,
                    location: province || null,
                    province: province || null,
                    verification_status: 'UNVERIFIED',
                    profile_completion_rate: 30,
                    is_profile_completed: false
                });
            } else {
                await profileRepository.upsert(user.id, {
                    full_name: userFullName,
                    date_of_birth: date_of_birth || null,
                    gender: gender || null,
                    province: province || null,
                    location: province || null,
                    interested_category: interested_category || null,
                    desired_position: desired_position || null,
                    profile_completion_rate: 30,
                    is_profile_completed: false
                });
            }
        } catch (profileErr) {
            console.warn('[AuthService.register] Warning initializing profile:', profileErr.message);
        }

        const token = this.generateToken(user);
        return { 
            user, 
            token,
            is_profile_completed: false,
            step: 2
        };
    }

    async login({ email, password }) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Email hoặc mật khẩu không chính xác');
        }

        // Kiểm tra mật khẩu TRƯỚC khi báo trạng thái khóa → người chỉ biết email không xem được tài khoản bị khóa / lý do
        const passwordOk = await bcrypt.compare(password, user.password_hash);
        if (!passwordOk) {
            throw new UnauthorizedError('Email hoặc mật khẩu không chính xác');
        }

        if (user.status === 'BANNED') {
            // Kèm kết quả khiếu nại gần nhất: người bị khóa không đăng nhập được nên không xem được thông báo
            let appeal = null;
            try {
                const a = await db.query(
                    `SELECT status, admin_response, created_at FROM user_appeals WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
                    [user.id]
                );
                appeal = a.rows[0] || null;
            } catch { /* bảng chưa có → bỏ qua */ }
            throw new AppError(
                `Tài khoản của bạn đã bị khóa bởi Quản trị viên. Lý do: ${user.suspension_reason || 'Vi phạm điều khoản dịch vụ'}`,
                403,
                { code: 'ACCOUNT_BANNED', appeal } // frontend dựa vào mã này để mở form khiếu nại
            );
        }

        if (user.status === 'SUSPENDED') {
            if (user.suspension_expires_at && new Date(user.suspension_expires_at) <= new Date()) {
                const db = require('../../config/db');
                await db.query("UPDATE users SET status = 'ACTIVE', suspension_reason = NULL, suspended_at = NULL, suspension_expires_at = NULL WHERE id = $1", [user.id]);
                user.status = 'ACTIVE';
            } else {
                const expireStr = user.suspension_expires_at ? new Date(user.suspension_expires_at).toLocaleDateString('vi-VN') : '7 ngày';
                throw new AppError(`Tài khoản của bạn đang bị tạm ngưng hoạt động đến ngày ${expireStr}. Lý do: ${user.suspension_reason || 'Vi phạm quy định hệ thống'}`, 403);
            }
        }

        const token = this.generateToken(user);
        const { password_hash, ...safeUser } = user;

        return { user: safeUser, token };
    }

    generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
            },
            getJwtSecret(),
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
    }

    /**
     * Khiếu nại khi tài khoản bị khóa/tạm ngưng. Người bị khóa không có token nên xác minh bằng email + mật khẩu.
     * Trả lời giống nhau cho mọi sai sót đăng nhập để không lộ tài khoản tồn tại hay không.
     */
    async submitAccountAppeal({ email, password, appeal_reason }) {
        const user = email ? await userRepository.findByEmail(String(email).trim().toLowerCase()) : null;
        if (!user || !password || !(await bcrypt.compare(String(password), user.password_hash))) {
            throw new UnauthorizedError('Email hoặc mật khẩu không chính xác');
        }
        if (!['BANNED', 'SUSPENDED'].includes(user.status)) {
            throw new AppError('Tài khoản của bạn đang hoạt động bình thường, không cần gửi khiếu nại.', 400);
        }
        const reason = String(appeal_reason || '').trim().slice(0, 2000);
        if (reason.length < 10) {
            throw new AppError('Vui lòng trình bày nội dung khiếu nại (ít nhất 10 ký tự).', 400);
        }
        const pending = await db.query(`SELECT 1 FROM user_appeals WHERE user_id = $1 AND status = 'PENDING' LIMIT 1`, [user.id]);
        if (pending.rowCount > 0) {
            throw new ConflictError('Bạn đã có một khiếu nại đang chờ Quản trị viên xử lý.');
        }
        const adminService = require('../reports/admin.service');
        return adminService.submitAppeal(user.id, { appeal_reason: reason });
    }

    async forgotPassword(email) {
        const cleanEmail = String(email || '').trim().toLowerCase();
        const genericMessage = 'Nếu địa chỉ email tồn tại trên hệ thống, liên kết khôi phục mật khẩu đã được gửi đến hộp thư của bạn.';

        const user = await userRepository.findByEmail(cleanEmail);
        if (!user || user.status === 'BANNED') {
            return {
                success: true,
                message: genericMessage
            };
        }

        // Sinh token ngẫu nhiên bảo mật 32 bytes (64 hex characters)
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

        // Vô hiệu hóa các reset token cũ chưa sử dụng của user này
        await db.query(
            `UPDATE password_reset_tokens 
             SET used_at = CURRENT_TIMESTAMP 
             WHERE user_id = $1 AND used_at IS NULL`,
            [user.id]
        );

        // Lưu bản ghi token mới với hash SHA-256
        await db.query(
            `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
             VALUES ($1, $2, $3)`,
            [user.id, tokenHash, expiresAt]
        );

        // Gửi email chứa liên kết khôi phục
        const clientUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:8080';
        const resetUrl = `${clientUrl}/?token=${rawToken}`;
        await emailService.sendPasswordResetEmail(cleanEmail, resetUrl, rawToken);

        const response = {
            success: true,
            message: genericMessage
        };

        // Ở môi trường development hoặc test, trả về dev_token để kiểm thử E2E tự động
        if (process.env.NODE_ENV !== 'production') {
            response.dev_token = rawToken;
            response.dev_reset_url = resetUrl;
        }

        return response;
    }

    async resetPassword({ token, email, new_password, password }) {
        const targetPassword = new_password || password;
        if (!targetPassword || targetPassword.length < 6) {
            throw new AppError('Mật khẩu mới bắt buộc và phải có ít nhất 6 ký tự', 400);
        }

        const cleanToken = String(token || '').trim();
        const cleanEmail = String(email || '').trim().toLowerCase();

        // 1. Chế độ đặt lại mật khẩu trực tiếp qua Email (Không cần mã OTP / Token)
        if (!cleanToken && cleanEmail) {
            const userRes = await db.query(
                'SELECT id, email, status FROM users WHERE LOWER(email) = LOWER($1)',
                [cleanEmail]
            );
            if (userRes.rows.length === 0) {
                throw new AppError('Không tìm thấy tài khoản với địa chỉ email này.', 404);
            }
            const user = userRes.rows[0];
            const password_hash = await bcrypt.hash(targetPassword, 10);
            await db.query(
                'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [password_hash, user.id]
            );

            return {
                success: true,
                message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.'
            };
        }

        if (!cleanToken) {
            throw new AppError('Vui lòng cung cấp địa chỉ email tài khoản hoặc mã xác thực', 400);
        }

        const tokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Khóa dòng token để chống race condition (double-spend)
            const res = await client.query(
                `SELECT * FROM password_reset_tokens 
                 WHERE token_hash = $1 
                 FOR UPDATE`,
                [tokenHash]
            );

            if (res.rows.length === 0) {
                throw new AppError('Mã khôi phục mật khẩu không hợp lệ hoặc không tồn tại', 400);
            }

            const tokenRecord = res.rows[0];

            if (tokenRecord.used_at) {
                throw new AppError('Mã khôi phục mật khẩu này đã được sử dụng trước đó', 400);
            }

            if (new Date(tokenRecord.expires_at) <= new Date()) {
                throw new AppError('Mã khôi phục mật khẩu đã hết hạn. Vui lòng yêu cầu mã mới', 400);
            }

            // Băm mật khẩu mới bằng bcrypt với cost factor 10 chuẩn của hệ thống
            const password_hash = await bcrypt.hash(targetPassword, 10);

            // Cập nhật mật khẩu mới cho user
            await client.query(
                `UPDATE users 
                 SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $2`,
                [password_hash, tokenRecord.user_id]
            );

            // Đánh dấu token hiện tại đã sử dụng
            await client.query(
                `UPDATE password_reset_tokens 
                 SET used_at = CURRENT_TIMESTAMP 
                 WHERE id = $1`,
                [tokenRecord.id]
            );

            // Vô hiệu hóa toàn bộ các token còn hiệu lực khác của user này
            await client.query(
                `UPDATE password_reset_tokens 
                 SET used_at = CURRENT_TIMESTAMP 
                 WHERE user_id = $1 AND id != $2 AND used_at IS NULL`,
                [tokenRecord.user_id, tokenRecord.id]
            );

            await client.query('COMMIT');

            return {
                success: true,
                message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.'
            };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async changePassword(userId, { currentPassword, newPassword }) {
        if (!currentPassword || !newPassword) {
            throw new AppError('Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới', 400);
        }
        if (newPassword.length < 6) {
            throw new AppError('Mật khẩu mới phải có ít nhất 6 ký tự', 400);
        }
        // findById cố ý không trả password_hash → lấy riêng (trước đây so với undefined nên luôn lỗi 500)
        const user = await userRepository.findCredentialsById(userId);
        if (!user) {
            throw new AppError('Người dùng không tồn tại', 404);
        }
        const isMatch = await bcrypt.compare(String(currentPassword), user.password_hash);
        if (!isMatch) {
            throw new AppError('Mật khẩu hiện tại không chính xác', 400);
        }
        if (currentPassword === newPassword) {
            throw new AppError('Mật khẩu mới không được trùng với mật khẩu hiện tại', 400);
        }
        const password_hash = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [password_hash, userId]);
        return {
            success: true,
            message: 'Đổi mật khẩu thành công. Vui lòng sử dụng mật khẩu mới cho các lần đăng nhập tiếp theo.'
        };
    }
}

module.exports = new AuthService();
