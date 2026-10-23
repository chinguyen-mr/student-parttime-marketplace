const { AppError } = require('../errors/app-error');

function validateRegister(req, res, next) {
    const { email, password, full_name, role } = req.body;
    const errors = [];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Email không hợp lệ hoặc bị bỏ trống');
    }

    if (!password || password.length < 6) {
        errors.push('Mật khẩu bắt buộc và phải có ít nhất 6 ký tự');
    }

    if (!full_name || full_name.trim().length === 0) {
        errors.push('Họ tên không được để trống');
    }

    if (!role || !['STUDENT', 'EMPLOYER'].includes(role)) {
        errors.push('Vai trò đăng ký không hợp lệ (chỉ chấp nhận STUDENT hoặc EMPLOYER)');
    }

    if (errors.length > 0) {
        return next(new AppError('Dữ liệu đăng ký không hợp lệ', 400, errors));
    }

    next();
}

function validateLogin(req, res, next) {
    const { email, password } = req.body;
    const errors = [];

    if (!email) errors.push('Email không được để trống');
    if (!password) errors.push('Mật khẩu không được để trống');

    if (errors.length > 0) {
        return next(new AppError('Dữ liệu đăng nhập không hợp lệ', 400, errors));
    }

    next();
}

module.exports = {
    validateRegister,
    validateLogin,
};
