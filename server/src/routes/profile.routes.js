const express = require('express');
const router = express.Router();
const profileService = require('../services/profile.service');
const { verifyToken } = require('../middleware/auth.middleware');

// GET /api/profile/me (UC-03: Xem hồ sơ cá nhân)
router.get('/me', verifyToken, async (req, res, next) => {
    try {
        const profile = await profileService.getProfile(req.user.id);
        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/profile/:userId (Xem hồ sơ công khai của người dùng khác)
router.get('/:userId', async (req, res, next) => {
    try {
        const profile = await profileService.getProfile(parseInt(req.params.userId, 10));
        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (err) {
        next(err);
    }
});

// PUT /api/profile/me (UC-03: Cập nhật hồ sơ cá nhân)
router.put('/me', verifyToken, async (req, res, next) => {
    try {
        const updated = await profileService.updateProfile(req.user.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Cập nhật hồ sơ thành công',
            data: updated,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
