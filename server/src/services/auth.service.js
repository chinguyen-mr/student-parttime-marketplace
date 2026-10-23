const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const profileRepository = require('../repositories/profile.repository');
const { ConflictError, UnauthorizedError, AppError } = require('../errors/app-error');

class AuthService {
    async register({ email, password, full_name, phone, role }) {
        // Business Rule: Email phải là duy nhất
        const existing = await userRepository.findByEmail(email);
        if (existing) {
            throw new ConflictError('Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.');
        }

        const password_hash = await bcrypt.hash(password, 10);
        const user = await userRepository.create({
            email,
            password_hash,
            full_name,
            phone,
            role,
        });

        // Tự động khởi tạo profile rỗng cho người dùng
        await profileRepository.upsert(user.id, {});

        const token = this.generateToken(user);
        return { user, token };
    }

    async login({ email, password }) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Email hoặc mật khẩu không chính xác');
        }

        if (user.status === 'BANNED') {
            throw new AppError('Tài khoản của bạn đã bị khóa bởi Quản trị viên', 403);
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new UnauthorizedError('Email hoặc mật khẩu không chính xác');
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
            process.env.JWT_SECRET || 'supersecretjwtkey_marketplace_cd2_vlu_2026',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
    }
}

module.exports = new AuthService();
