const { AppError, StateTransitionInvalidError } = require('../../utils/app-error');

function validateCreateProposal(req, res, next) {
    const { job_id, proposal_text, proposed_price } = req.body;
    const errors = [];

    if (!job_id || isNaN(parseInt(job_id, 10))) {
        errors.push('Mã công việc (job_id) không hợp lệ');
    }

    if (!proposal_text || typeof proposal_text !== 'string' || proposal_text.trim().length < 20) {
        errors.push('Nội dung đề xuất (proposal_text) phải có tối thiểu 20 ký tự');
    }

    if (proposed_price !== undefined && proposed_price !== null) {
        const priceNum = parseInt(proposed_price, 10);
        if (isNaN(priceNum) || priceNum <= 0) {
            errors.push('Mức thù lao đề xuất (proposed_price) phải là số dương lớn hơn 0');
        }
    }

    if (errors.length > 0) {
        return next(new AppError('Dữ liệu đề xuất không hợp lệ', 400, errors));
    }

    next();
}

function validateUpdateProposalStatus(req, res, next) {
    const { status } = req.body;

    // A3 RULE: Chặn hoàn toàn việc set ACCEPTED qua PATCH /proposals/:id/status
    if (status === 'ACCEPTED') {
        return next(new StateTransitionInvalidError('ACCEPTED chỉ được set qua POST /jobs/:jobId/selections (A3 RULE)'));
    }

    const allowed = ['REVIEWING', 'REJECTED', 'WITHDRAWN'];
    if (!status || !allowed.includes(status)) {
        return next(new AppError(`Trạng thái đề xuất không hợp lệ. Chỉ chấp nhận: ${allowed.join(', ')}`, 400));
    }

    next();
}

module.exports = {
    validateCreateProposal,
    validateUpdateProposalStatus,
};
