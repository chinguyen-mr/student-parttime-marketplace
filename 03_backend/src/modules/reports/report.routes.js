const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { verifyToken } = require('../../middleware/auth.middleware');
const { AppError } = require('../../utils/app-error');

// POST /api/reports (WF-X01: Báo cáo vi phạm việc làm hoặc nhà tuyển dụng / người dùng)
router.post('/', verifyToken, async (req, res, next) => {
    try {
        const { target_type, target_id, reason, description } = req.body;

        if (!target_type || !['JOB', 'USER'].includes(target_type)) {
            throw new AppError('Loại đối tượng báo cáo không hợp lệ (phải là JOB hoặc USER)', 400);
        }

        const parsedId = parseInt(target_id, 10);
        if (isNaN(parsedId) || parsedId <= 0) {
            throw new AppError('Thiếu hoặc sai định dạng ID của đối tượng bị báo cáo', 400);
        }

        if (!reason || !reason.trim()) {
            throw new AppError('Vui lòng chọn lý do báo cáo vi phạm', 400);
        }

        // Kiểm tra đối tượng tồn tại
        if (target_type === 'JOB') {
            const jobCheck = await db.query('SELECT id, title FROM jobs WHERE id = $1', [parsedId]);
            if (jobCheck.rows.length === 0) {
                throw new AppError('Tin tuyển dụng bị báo cáo không tồn tại trong hệ thống', 404);
            }
        } else if (target_type === 'USER') {
            const userCheck = await db.query('SELECT id, full_name FROM users WHERE id = $1', [parsedId]);
            if (userCheck.rows.length === 0) {
                throw new AppError('Người dùng / Nhà tuyển dụng bị báo cáo không tồn tại', 404);
            }
            if (parsedId === req.user.id) {
                throw new AppError('Bạn không thể tự gửi báo cáo vi phạm chính mình', 400);
            }
        }

        // Chặn báo cáo trùng lặp khi báo cáo trước đó đang chờ xử lý (PENDING)
        const duplicateCheck = await db.query(
            `SELECT id FROM reports 
             WHERE reporter_id = $1 AND target_type = $2 AND target_id = $3 AND status = 'PENDING'`,
            [req.user.id, target_type, parsedId]
        );
        if (duplicateCheck.rows.length > 0) {
            throw new AppError('Bạn đã gửi một báo cáo cho đối tượng này và đang chờ Quản trị viên xử lý. Vui lòng không gửi trùng lặp.', 400);
        }

        const result = await db.query(
            `INSERT INTO reports (reporter_id, target_type, target_id, reason, description, status)
             VALUES ($1, $2, $3, $4, $5, 'PENDING')
             RETURNING id, reporter_id, target_type, target_id, reason, description, status, created_at`,
            [req.user.id, target_type, parsedId, reason.trim(), (description || '').trim()]
        );

        res.status(201).json({
            success: true,
            message: 'Báo cáo vi phạm đã được gửi thành công. Quản trị viên sẽ xem xét và xử lý theo quy định.',
            data: result.rows[0]
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;

