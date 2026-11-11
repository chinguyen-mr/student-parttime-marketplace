const { AppError } = require('../../utils/app-error');

function validateRegister(req, res, next) {
    const { 
        email, 
        password, 
        full_name, 
        representative_name, 
        company_name,
        role, 
        phone 
    } = req.body;
    const errors = [];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
        errors.push('Email không hợp lệ hoặc bị bỏ trống');
    }

    if (!password || String(password).length < 6) {
        errors.push('Mật khẩu bắt buộc và phải có ít nhất 6 ký tự');
    }

    const name = full_name || representative_name;
    if (!name || String(name).trim().length === 0) {
        errors.push('Họ tên không được để trống');
    }

    if (!role || !['STUDENT', 'EMPLOYER'].includes(role)) {
        errors.push('Vai trò đăng ký không hợp lệ (chỉ chấp nhận STUDENT hoặc EMPLOYER)');
    }

    if (!phone || !/^[0-9+() -]{8,20}$/.test(String(phone).trim())) {
        errors.push('Số điện thoại không hợp lệ hoặc bị để trống');
    }

    if (role === 'EMPLOYER' && (!company_name || String(company_name).trim().length === 0)) {
        errors.push('Tên doanh nghiệp không được để trống');
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

function validateForgotPassword(req, res, next) {
    const { email } = req.body;
    const errors = [];

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.push('Địa chỉ email không hợp lệ hoặc bị để trống');
    }

    if (errors.length > 0) {
        return next(new AppError('Dữ liệu yêu cầu khôi phục mật khẩu không hợp lệ', 400, errors));
    }

    next();
}

function validateResetPassword(req, res, next) {
    const { token, email, new_password, password } = req.body;
    const targetPassword = new_password || password;
    const errors = [];

    if (!token && !email) {
        errors.push('Vui lòng cung cấp email tài khoản hoặc mã token');
    }

    if (email && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) {
        errors.push('Địa chỉ email không hợp lệ');
    }

    if (!targetPassword || typeof targetPassword !== 'string' || targetPassword.length < 6) {
        errors.push('Mật khẩu mới bắt buộc và phải có ít nhất 6 ký tự');
    }

    if (errors.length > 0) {
        return next(new AppError('Dữ liệu đặt lại mật khẩu không hợp lệ', 400, errors));
    }

    next();
}

module.exports = {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
};
