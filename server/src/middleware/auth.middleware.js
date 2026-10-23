const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../errors/app-error');

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new UnauthorizedError('Vui lòng đăng nhập để tiếp tục (Thiếu Token)'));
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_marketplace_cd2_vlu_2026');
        req.user = decoded; // { id, email, role, full_name }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new UnauthorizedError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại'));
        }
        return next(new UnauthorizedError('Token không hợp lệ'));
    }
}

function requireRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedError('Yêu cầu xác thực tài khoản'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new ForbiddenError(`Bạn không có quyền thực hiện hành động này. Yêu cầu vai trò: ${allowedRoles.join(', ')}`));
        }
        next();
    };
}

module.exports = {
    verifyToken,
    requireRoles,
};
