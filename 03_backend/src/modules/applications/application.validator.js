const { AppError, StateTransitionInvalidError } = require('../../utils/app-error');

function validateApply(req, res, next) {
    const { job_id, cover_letter } = req.body;
    const errors = [];

    if (!job_id || isNaN(parseInt(job_id, 10))) {
        errors.push('Mã công việc (job_id) không hợp lệ');
    }

    if (cover_letter && cover_letter.trim().length > 2000) {
        errors.push('Thư giới thiệu không được vượt quá 2000 ký tự');
    }

    if (errors.length > 0) {
        return next(new AppError('Dữ liệu ứng tuyển không hợp lệ', 400, errors));
    }

    next();
}

function validateApplicationStatus(req, res, next) {
    const { status } = req.body;
    
    // A3 RULE: Chặn hoàn toàn việc set ACCEPTED qua PATCH /applications/:id/status
    if (status === 'ACCEPTED') {
        return next(new StateTransitionInvalidError('ACCEPTED chỉ được set qua POST /jobs/:jobId/selections (A3 RULE)'));
    }

    const allowed = ['REVIEWING', 'SHORTLISTED', 'REJECTED'];

    if (!status || !allowed.includes(status)) {
        return next(new AppError(`Trạng thái xử lý ứng viên không hợp lệ. Chỉ chấp nhận: ${allowed.join(', ')}`, 400));
    }

    next();
}


module.exports = {
    validateApply,
    validateApplicationStatus,
};
