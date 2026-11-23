const { test, describe, after } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../../src/config/db');
const { submitSupportRequest, listSupportRequests, replySupportRequest } = require('../../src/modules/notifications/support.service');

describe('Form Trung tâm hỗ trợ → thông báo cho Admin', () => {
    const marker = `E2E-SUPPORT-${Date.now()}`;

    after(async () => {
        const ids = await db.query(`SELECT id FROM notifications WHERE type = 'SUPPORT_REQUEST' AND body LIKE $1`, [`%${marker}%`]);
        await db.query(`DELETE FROM admin_logs WHERE action = 'SUPPORT_REPLY' AND target_id = ANY($1::int[])`, [ids.rows.map(r => r.id)]);
        await db.query(`DELETE FROM notifications WHERE (type = 'SUPPORT_REQUEST' AND body LIKE $1) OR (type = 'SUPPORT_REPLY' AND body LIKE $1)`, [`%${marker}%`]);
    });

    test('Admin xem danh sách và trả lời → lưu nhật ký, người gửi có tài khoản nhận thông báo trong ứng dụng', async () => {
        const student = (await db.query(`SELECT id, email FROM users WHERE email = 'student.test@vlu.edu.vn'`)).rows[0];
        const admin = (await db.query(`SELECT id FROM users WHERE role = 'ADMIN' AND status = 'ACTIVE' LIMIT 1`)).rows[0];
        await submitSupportRequest({ name: 'Sinh viên Test', email: student.email, topic: 'STUDENT_INQUIRY', message: `Cần hướng dẫn ứng tuyển ${marker}` });

        const req = (await listSupportRequests()).find(r => r.message.includes(marker));
        assert.ok(req, 'yêu cầu phải có trong danh sách (1 dòng dù nhiều Admin)');
        assert.equal((await listSupportRequests()).filter(r => r.message.includes(marker)).length, 1);
        assert.equal(req.email, student.email);
        assert.equal(req.topic, 'Hướng dẫn tìm việc & ứng tuyển');
        assert.deepEqual(req.replies, []);

        await assert.rejects(replySupportRequest(req.id, admin.id, 'ngắn'), err => err.statusCode === 400);
        await assert.rejects(replySupportRequest(-1, admin.id, 'Câu trả lời đủ dài'), err => err.statusCode === 404);

        const result = await replySupportRequest(req.id, admin.id, `Bạn vào mục Tìm việc làm rồi bấm Ứng tuyển ngay ${marker}`);
        assert.equal(result.in_app, true);
        assert.equal(result.email, student.email);

        const after = (await listSupportRequests()).find(r => r.id === req.id);
        assert.equal(after.replies.length, 1);
        assert.match(after.replies[0].message, /Ứng tuyển ngay/);
        const inbox = await db.query(`SELECT body FROM notifications WHERE user_id = $1 AND type = 'SUPPORT_REPLY' AND body LIKE $2`, [student.id, `%${marker}%`]);
        assert.equal(inbox.rowCount, 1);
        assert.match(inbox.rows[0].body, /Ứng tuyển ngay .* — Câu hỏi của bạn: Cần hướng dẫn ứng tuyển/);
    });

    test('Gửi hợp lệ → mỗi Admin đang hoạt động nhận 1 thông báo có tên, email, nội dung', async () => {
        const admins = await db.query(`SELECT id FROM users WHERE role = 'ADMIN' AND status = 'ACTIVE'`);
        const count = await submitSupportRequest({
            name: 'Nguyễn Văn A', email: 'a@example.com', topic: 'TECHNICAL_HELP', message: `Không đăng nhập được ${marker}`,
        });
        assert.equal(count, admins.rowCount);
        const rows = await db.query(`SELECT user_id, title, body FROM notifications WHERE type = 'SUPPORT_REQUEST' AND body LIKE $1`, [`%Không đăng nhập được ${marker}%`]);
        assert.equal(rows.rowCount, admins.rowCount);
        assert.deepEqual(rows.rows.map(r => r.user_id).sort(), admins.rows.map(r => r.id).sort());
        assert.match(rows.rows[0].title, /Lỗi kỹ thuật/);
        assert.match(rows.rows[0].body, /Nguyễn Văn A \(a@example\.com\): Không đăng nhập được/);
    });

    test('Dữ liệu sai → 400, không tạo thông báo', async () => {
        for (const bad of [
            { name: 'A', email: 'a@example.com', topic: 'OTHER', message: `Nội dung đủ dài ${marker}` },
            { name: 'Nguyễn Văn A', email: 'khong-phai-email', topic: 'OTHER', message: `Nội dung đủ dài ${marker}` },
            { name: 'Nguyễn Văn A', email: 'a@example.com', topic: 'HACK', message: `Nội dung đủ dài ${marker}` },
            { name: 'Nguyễn Văn A', email: 'a@example.com', topic: 'OTHER', message: 'ngắn' },
        ]) {
            await assert.rejects(submitSupportRequest(bad), err => err.statusCode === 400);
        }
        const rows = await db.query(`SELECT 1 FROM notifications WHERE body LIKE $1 AND title LIKE '%Câu hỏi khác%'`, [`%${marker}%`]);
        assert.equal(rows.rowCount, 0);
    });
});
