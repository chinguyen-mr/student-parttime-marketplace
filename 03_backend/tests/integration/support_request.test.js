const { test, describe, after } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../../src/config/db');
const { submitSupportRequest } = require('../../src/modules/notifications/support.service');

describe('Form Trung tâm hỗ trợ → thông báo cho Admin', () => {
    const marker = `E2E-SUPPORT-${Date.now()}`;

    after(async () => {
        await db.query(`DELETE FROM notifications WHERE type = 'SUPPORT_REQUEST' AND body LIKE $1`, [`%${marker}%`]);
    });

    test('Gửi hợp lệ → mỗi Admin đang hoạt động nhận 1 thông báo có tên, email, nội dung', async () => {
        const admins = await db.query(`SELECT id FROM users WHERE role = 'ADMIN' AND status = 'ACTIVE'`);
        const count = await submitSupportRequest({
            name: 'Nguyễn Văn A', email: 'a@example.com', topic: 'TECHNICAL_HELP', message: `Không đăng nhập được ${marker}`,
        });
        assert.equal(count, admins.rowCount);
        const rows = await db.query(`SELECT user_id, title, body FROM notifications WHERE body LIKE $1`, [`%${marker}%`]);
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
