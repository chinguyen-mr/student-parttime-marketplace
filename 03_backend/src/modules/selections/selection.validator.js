const { AppError } = require('../../utils/app-error');

function validateSelections(req, res, next) {
    const jobId = parseInt(req.params.jobId, 10);
    const { applicationIds, proposalIds } = req.body;
    const errors = [];

    if (!jobId || isNaN(jobId) || jobId <= 0) {
        errors.push('Mã công việc (jobId) trên đường dẫn không hợp lệ');
    }

    const hasAppIds = Array.isArray(applicationIds) && applicationIds.length > 0;
    const hasPropIds = Array.isArray(proposalIds) && proposalIds.length > 0;

    if (!hasAppIds && !hasPropIds) {
        errors.push('Yêu cầu cung cấp applicationIds (Part-time) hoặc proposalIds (Freelance)');
    } else if (hasAppIds && hasPropIds) {
        errors.push('Không được gửi đồng thời cả applicationIds và proposalIds (XOR)');
    } else if (hasAppIds) {
        const invalidIds = applicationIds.filter(id => !id || isNaN(parseInt(id, 10)) || parseInt(id, 10) <= 0);
        if (invalidIds.length > 0) {
            errors.push('Một số mã đơn ứng tuyển trong applicationIds không hợp lệ');
        }
    } else if (hasPropIds) {
        const invalidIds = proposalIds.filter(id => !id || isNaN(parseInt(id, 10)) || parseInt(id, 10) <= 0);
        if (invalidIds.length > 0) {
            errors.push('Một số mã đề xuất trong proposalIds không hợp lệ');
        }
    }

    if (errors.length > 0) {
        return next(new AppError('Dữ liệu lựa chọn ứng viên không hợp lệ', 400, errors));
    }

    next();
}

module.exports = {
    validateSelections,
};
