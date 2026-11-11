const express = require('express');
const router = express.Router();
const verificationService = require('./verification.service');
const { verifyToken } = require('../../middleware/auth.middleware');

// GET /api/verification/status
router.get('/status', verifyToken, async (req, res, next) => {
    try {
        const data = await verificationService.getVerificationStatus(req.user.id);
        res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/verification/send-otp
router.post('/send-otp', verifyToken, async (req, res, next) => {
    try {
        const { channel, phone } = req.body;
        const result = await verificationService.sendOtp({
            userId: req.user.id,
            channel: channel || 'EMAIL',
            phone
        });
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

// POST /api/verification/verify-otp
router.post('/verify-otp', verifyToken, async (req, res, next) => {
    try {
        const { channel, otp, phone } = req.body;
        const result = await verificationService.verifyOtp({
            userId: req.user.id,
            channel: channel || 'EMAIL',
            otp,
            phone
        });
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;

