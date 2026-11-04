const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { verifyToken } = require('../../middleware/auth.middleware');
const { NotFoundError, ForbiddenError } = require('../../utils/app-error');

// GET /api/notifications & /api/v1/notifications (Lấy danh sách thông báo có phân trang & lọc unread)
router.get('/', verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
        const offset = (page - 1) * limit;
        const onlyUnread = req.query.unread === 'true';

        // 1. Đếm tổng số thông báo chưa đọc của user
        const unreadCountRes = await db.query(
            `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
            [userId]
        );
        const unreadCount = parseInt(unreadCountRes.rows[0].count, 10) || 0;

        // 2. Đếm tổng số thông báo theo bộ lọc
        let countSql = `SELECT COUNT(*) FROM notifications WHERE user_id = $1`;
        const countParams = [userId];
        if (onlyUnread) {
            countSql += ` AND read_at IS NULL`;
        }
        const totalCountRes = await db.query(countSql, countParams);
        const totalCount = parseInt(totalCountRes.rows[0].count, 10) || 0;

        // 3. Lấy dữ liệu phân trang
        let dataSql = `SELECT * FROM notifications WHERE user_id = $1`;
        const dataParams = [userId, limit, offset];
        if (onlyUnread) {
            dataSql += ` AND read_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        } else {
            dataSql += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        }

        const dataRes = await db.query(dataSql, dataParams);

        res.status(200).json({
            success: true,
            total: totalCount,
            unread_count: unreadCount,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit) || 1,
            },
            data: dataRes.rows,
        });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/notifications/read-all & /api/v1/notifications/read-all (Đánh dấu tất cả đã đọc)
router.patch('/read-all', verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            `UPDATE notifications 
             SET read_at = CURRENT_TIMESTAMP 
             WHERE user_id = $1 AND read_at IS NULL 
             RETURNING id`,
            [userId]
        );

        res.status(200).json({
            success: true,
            message: 'Đã đánh dấu tất cả thông báo là đã đọc',
            updated_count: result.rowCount || 0,
        });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/notifications/:id/read & /api/v1/notifications/:id/read (Đánh dấu 1 thông báo đã đọc)
router.patch('/:id/read', verifyToken, async (req, res, next) => {
    try {
        const notifId = parseInt(req.params.id, 10);
        const userId = req.user.id;

        // Kiểm tra tồn tại
        const existing = await db.query(`SELECT * FROM notifications WHERE id = $1`, [notifId]);
        if (existing.rows.length === 0) {
            throw new NotFoundError('Không tìm thấy thông báo');
        }

        if (existing.rows[0].user_id !== userId) {
            throw new ForbiddenError('Bạn không có quyền thao tác trên thông báo này');
        }

        const result = await db.query(
            `UPDATE notifications 
             SET read_at = CURRENT_TIMESTAMP 
             WHERE id = $1 
             RETURNING *`,
            [notifId]
        );

        res.status(200).json({
            success: true,
            message: 'Đã đánh dấu thông báo là đã đọc',
            data: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
