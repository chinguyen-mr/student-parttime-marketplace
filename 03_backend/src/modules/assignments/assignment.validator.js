const { AppError } = require('../../utils/app-error');

function validateUpdateAssignmentStatus(req, res, next) {
    const { status } = req.body;
    const allowed = ['IN_PROGRESS', 'COMPLETED', 'TERMINATED', 'RESIGNED'];

    if (!status || !allowed.includes(status)) {
        return next(new AppError(`Trạng thái cập nhật không hợp lệ. Chỉ chấp nhận: ${allowed.join(', ')}`, 400));
    }

    next();
}

module.exports = {
    validateUpdateAssignmentStatus,
};
