const db = require('../../config/db');
const { AppError } = require('../../utils/app-error');
const emailService = require('../../services/email.service');

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

// body do submitSupportRequest ghi: "Họ tên (email): nội dung"
function parseBody(body = '') {
    const m = String(body).match(/^(.*?) \(([^()\s]+@[^()\s]+)\): ([\s\S]*)$/);
    return m ? { name: m[1], email: m[2], message: m[3] } : { name: '', email: '', message: String(body) };
}
const topicOf = (title) => String(title || '').replace(/^Yêu cầu hỗ trợ:\s*/, '');

/**
 * Danh sách yêu cầu hỗ trợ cho trang Admin. Mỗi yêu cầu = 1 nhóm thông báo SUPPORT_REQUEST
 * (cùng tiêu đề, nội dung, thời điểm — mỗi Admin 1 bản); mã yêu cầu = id nhỏ nhất của nhóm.
 * Câu trả lời lưu ở admin_logs (action SUPPORT_REPLY) → không cần bảng mới.
 */
async function listSupportRequests() {
    const reqs = await db.query(
        `SELECT MIN(id) AS id, title, body, created_at FROM notifications
         WHERE type = 'SUPPORT_REQUEST' GROUP BY title, body, created_at
         ORDER BY created_at DESC LIMIT 300`
    );
    const ids = reqs.rows.map(r => r.id);
    const replies = ids.length ? await db.query(
        `SELECT l.target_id, l.metadata, l.created_at, u.full_name AS admin_name FROM admin_logs l
         JOIN users u ON u.id = l.admin_id
         WHERE l.action = 'SUPPORT_REPLY' AND l.target_type = 'SUPPORT_REQUEST' AND l.target_id = ANY($1::int[])
         ORDER BY l.created_at ASC`,
        [ids]
    ) : { rows: [] };
    return reqs.rows.map(r => ({
        id: r.id,
        topic: topicOf(r.title),
        ...parseBody(r.body),
        created_at: r.created_at,
        replies: replies.rows.filter(x => x.target_id === r.id).map(x => ({
            message: x.metadata?.reply || '',
            emailed: Boolean(x.metadata?.emailed),
            in_app: Boolean(x.metadata?.in_app),
            admin_name: x.admin_name,
            created_at: x.created_at,
        })),
    }));
}

/**
 * Admin trả lời 1 yêu cầu: gửi email (nếu có SMTP), báo trong ứng dụng nếu email trùng tài khoản JobNest,
 * và lưu câu trả lời vào admin_logs.
 */
async function replySupportRequest(requestId, adminId, replyText) {
    const reply = String(replyText || '').trim();
    if (reply.length < 5 || reply.length > 3000) throw new AppError('Câu trả lời cần từ 5 đến 3000 ký tự', 400);
    const found = await db.query(`SELECT id, title, body FROM notifications WHERE id = $1 AND type = 'SUPPORT_REQUEST'`, [requestId]);
    if (!found.rows.length) throw new AppError('Không tìm thấy yêu cầu hỗ trợ', 404);
    const { name, email, message } = parseBody(found.rows[0].body);
    const topic = topicOf(found.rows[0].title);
    if (!email) throw new AppError('Yêu cầu không có email người gửi', 400);

    const mail = await emailService.sendSupportReply(email, { name, topic, question: message, reply });
    const inApp = await db.query(
        `INSERT INTO notifications (user_id, type, title, body)
         SELECT id, 'SUPPORT_REPLY', $2, $3 FROM users WHERE LOWER(email) = LOWER($1)`,
        // Kèm trích câu hỏi gốc để người nhận nhớ mình đã hỏi gì
        [email, `Phản hồi từ Trung tâm hỗ trợ: ${topic}`, `${reply} — Câu hỏi của bạn: ${message.length > 160 ? `${message.slice(0, 160)}…` : message}`]
    );
    const result = { emailed: mail.success, email_reason: mail.success ? null : mail.reason, in_app: inApp.rowCount > 0, email };
    await db.query(
        `INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata) VALUES ($1, 'SUPPORT_REPLY', 'SUPPORT_REQUEST', $2, $3)`,
        [adminId, requestId, JSON.stringify({ reply, to: email, title: topic, emailed: result.emailed, in_app: result.in_app })]
    );
    return result;
}

module.exports = { submitSupportRequest, listSupportRequests, replySupportRequest, SUPPORT_TOPICS };
