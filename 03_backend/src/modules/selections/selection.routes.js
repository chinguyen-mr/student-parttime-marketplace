const express = require('express');
const router = express.Router();
const selectionService = require('./selection.service');
const { validateSelections } = require('./selection.validator');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

// POST /api/v1/jobs/:jobId/selections (A3 RULE: Tuyến duy nhất chấp nhận ứng viên và tạo Assignment)
router.post('/:jobId/selections', verifyToken, requireRoles('EMPLOYER'), validateSelections, async (req, res, next) => {
    try {
        const jobId = parseInt(req.params.jobId, 10);
        const { applicationIds, proposalIds } = req.body;
        const result = await selectionService.createSelections(jobId, req.user.id, { applicationIds, proposalIds });

        res.status(200).json({
            success: true,
            message: result.message,
            data: result,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
