const db = require('../../config/db');
const { AppError } = require('../../utils/app-error');

// Chủ đề trùng với lựa chọn trong form "Trung tâm hỗ trợ" (SupportModal.jsx)
const SUPPORT_TOPICS = {
    STUDENT_INQUIRY: 'Hướng dẫn tìm việc & ứng tuyển',
    EMPLOYER_INQUIRY: 'Tư vấn đăng tin & tìm ứng viên',
    DISPUTE_COMPLAINT: 'Khiếu nại thù lao / hợp đồng',
    TECHNICAL_HELP: 'Lỗi kỹ thuật tài khoản / đăng nhập',
    OTHER: 'Câu hỏi khác',
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Tin nhắn từ form hỗ trợ → thông báo (bảng notifications sẵn có) cho mọi Admin đang hoạt động.
 * @returns {Promise<number>} số Admin đã nhận thông báo
 */
async function submitSupportRequest({ name, email, topic, message }) {
    const senderName = String(name || '').trim();
    const senderEmail = String(email || '').trim();
    const content = String(message || '').trim();
    const errors = [];
    if (senderName.length < 2 || senderName.length > 100) errors.push('Họ và tên cần từ 2 đến 100 ký tự');
    if (!EMAIL_RE.test(senderEmail) || senderEmail.length > 150) errors.push('Email nhận phản hồi không hợp lệ');
    if (!SUPPORT_TOPICS[topic]) errors.push('Chủ đề hỗ trợ không hợp lệ');
    if (content.length < 10 || content.length > 2000) errors.push('Nội dung cần từ 10 đến 2000 ký tự');
    if (errors.length) throw new AppError('Dữ liệu yêu cầu hỗ trợ không hợp lệ', 400, errors);

    const result = await db.query(
        `INSERT INTO notifications (user_id, type, title, body)
         SELECT id, 'SUPPORT_REQUEST', $1, $2 FROM users WHERE role = 'ADMIN' AND status = 'ACTIVE'`,
        [`Yêu cầu hỗ trợ: ${SUPPORT_TOPICS[topic]}`, `${senderName} (${senderEmail}): ${content}`]
    );
    if (!result.rowCount) throw new AppError('Hiện chưa có quản trị viên tiếp nhận. Vui lòng gọi hotline hoặc gửi email.', 503);
    return result.rowCount;
}

module.exports = { submitSupportRequest, SUPPORT_TOPICS };
