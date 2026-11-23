const db = require('../../config/db');

/**
 * Báo cho mọi Admin đang hoạt động có việc cần xử lý (type 'ADMIN_TASK').
 * target_type quyết định mục mở ra khi Admin bấm thông báo (App.jsx → ADMIN_TASK_TABS):
 *   EMPLOYER_VERIFICATION, JOB, REPORT, USER_APPEAL, REVIEW_REPORT, COMPANY_REVIEW, JOB_REVIEW.
 * Gọi SAU khi giao dịch chính đã COMMIT; lỗi chỉ ghi log, không làm hỏng thao tác của người dùng.
 */
async function notifyAdmins(title, body, targetType, targetId = null) {
    try {
        await db.query(
            `INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
             SELECT id, 'ADMIN_TASK', $1, $2, $3, $4 FROM users WHERE role = 'ADMIN' AND status = 'ACTIVE'`,
            [String(title).slice(0, 255), body, targetType, targetId]
        );
    } catch (err) {
        console.error('[admin-notify] Không gửi được thông báo cho Admin:', err.message);
    }
}

module.exports = { notifyAdmins };
