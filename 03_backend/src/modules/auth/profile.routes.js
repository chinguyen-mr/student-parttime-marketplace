const express = require('express');
const router = express.Router();
const profileService = require('./profile.service');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

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

// GET /api/profile/availability (Xem lịch rảnh sinh viên - bảo vệ RBAC: Chỉ STUDENT)
router.get('/availability', verifyToken, requireRoles('STUDENT'), async (req, res, next) => {
    try {
        const db = require('../../config/db');
        const result = await db.query(
            'SELECT * FROM student_availabilities WHERE student_id = $1 AND is_active = TRUE ORDER BY day_of_week, start_time',
            [req.user.id]
        );
        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
});

// PUT /api/profile/availability (Cập nhật lịch rảnh sinh viên - bảo vệ RBAC: Chỉ STUDENT)
router.put('/availability', verifyToken, requireRoles('STUDENT'), async (req, res, next) => {
    const db = require('../../config/db');
    const client = await db.pool.connect();
    try {
        const { slots } = req.body;
        if (!Array.isArray(slots)) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu slots phải là một mảng danh sách ca rảnh'
            });
        }

        // Validate các khung giờ
        for (const slot of slots) {
            const day = parseInt(slot.day_of_week, 10);
            if (isNaN(day) || day < 1 || day > 7) {
                return res.status(400).json({
                    success: false,
                    message: 'day_of_week phải từ 1 (Chủ Nhật) đến 7 (Thứ Bảy)'
                });
            }
            if (!slot.start_time || !slot.end_time || slot.end_time <= slot.start_time) {
                return res.status(400).json({
                    success: false,
                    message: `Khung giờ không hợp lệ (${slot.start_time} - ${slot.end_time}): Giờ kết thúc phải lớn hơn giờ bắt đầu`
                });
            }
        }

        await client.query('BEGIN');
        await client.query('DELETE FROM student_availabilities WHERE student_id = $1', [req.user.id]);

        const inserted = [];
        for (const slot of slots) {
            const insRes = await client.query(
                `INSERT INTO student_availabilities (student_id, day_of_week, start_time, end_time, is_active)
                 VALUES ($1, $2, $3, $4, TRUE)
                 RETURNING *`,
                [req.user.id, parseInt(slot.day_of_week, 10), slot.start_time, slot.end_time]
            );
            inserted.push(insRes.rows[0]);
        }
        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Cập nhật lịch rảnh thành công',
            data: inserted
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
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

// POST /api/profile/appeals (Người dùng nộp đơn khiếu nại tài khoản)
router.post('/appeals', verifyToken, async (req, res, next) => {
    try {
        const adminService = require('../reports/admin.service');
        const appeal = await adminService.submitAppeal(req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Đã gửi đơn khiếu nại thành công, Quản trị viên sẽ xem xét phản hồi.',
            data: appeal,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
