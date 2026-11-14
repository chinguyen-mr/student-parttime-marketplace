const { AppError } = require('../../utils/app-error');

function validateSelections(req, res, next) {
    const jobId = parseInt(req.params.jobId, 10);
    const { applicationIds } = req.body;
    const errors = [];

    if (!jobId || isNaN(jobId) || jobId <= 0) {
        errors.push('Mã công việc (jobId) trên đường dẫn không hợp lệ');
    }

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
        errors.push('Yêu cầu cung cấp applicationIds (danh sách đơn ứng tuyển được chọn)');
    } else if (applicationIds.some(id => !id || isNaN(parseInt(id, 10)) || parseInt(id, 10) <= 0)) {
        errors.push('Một số mã đơn ứng tuyển trong applicationIds không hợp lệ');
    }

    if (errors.length > 0) {
        return next(new AppError('Dữ liệu lựa chọn ứng viên không hợp lệ', 400, errors));
    }

    next();
}

module.exports = {
    validateSelections,
};
