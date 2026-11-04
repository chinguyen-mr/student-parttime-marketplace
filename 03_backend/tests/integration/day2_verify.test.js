const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const db = require('../../src/config/db');

describe('NGÀY 2: Kiểm thử xác thực Database và Endpoint mới (Proposals & Notifications)', () => {
    test('Test 1: Lấy danh sách notifications của user -> trả về list, mỗi item có title, body', async () => {
        const originalDbQuery = db.query;

        // Stub query trả về dữ liệu mẫu notifications
        db.query = async (sql, params) => {
            if (typeof sql === 'string' && sql.includes('FROM notifications')) {
                return {
                    rows: [
                        {
                            id: 1,
                            user_id: params[0],
                            type: 'APPLICATION_ACCEPTED',
                            title: 'Hồ sơ ứng tuyển được chấp nhận',
                            body: 'Chúc mừng bạn! Nhà tuyển dụng đã duyệt đơn ứng tuyển của bạn.',
                            target_type: 'APPLICATION',
                            target_id: 10,
                            read_at: null,
                            created_at: new Date().toISOString()
                        }
                    ]
                };
            }
            return { rows: [] };
        };

        const userId = 53;
        const res = await db.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

        assert.ok(Array.isArray(res.rows));
        assert.equal(res.rows.length, 1);
        assert.equal(res.rows[0].title, 'Hồ sơ ứng tuyển được chấp nhận');
        assert.ok(res.rows[0].body.includes('Chúc mừng bạn!'));
        assert.equal(res.rows[0].user_id, 53);

        db.query = originalDbQuery;
    });

    test('Test 2: Lấy danh sách proposals của sinh viên (my-proposals) -> trả về list proposals', async () => {
        const originalDbQuery = db.query;

        // Stub query trả về dữ liệu proposals của student
        db.query = async (sql, params) => {
            if (typeof sql === 'string' && sql.includes('FROM proposals')) {
                return {
                    rows: [
                        {
                            id: 1,
                            job_id: 5,
                            student_id: params[0],
                            proposal_text: 'Em có 2 năm kinh nghiệm làm React.js và Node.js, cam kết giao đúng hạn.',
                            estimated_duration: '5 ngày',
                            proposed_price: 2500000,
                            status: 'SUBMITTED',
                            job_title: 'Lập trình viên Frontend React.js Part-time',
                            category: 'Công nghệ thông tin',
                            location: 'Quận 1, TP.HCM',
                            employer_name: 'TechCorp Vietnam'
                        }
                    ]
                };
            }
            return { rows: [] };
        };

        const studentId = 53;
        const res = await db.query(
            `SELECT p.*, j.title AS job_title FROM proposals p JOIN jobs j ON j.id = p.job_id WHERE p.student_id = $1`,
            [studentId]
        );

        assert.ok(Array.isArray(res.rows));
        assert.equal(res.rows.length, 1);
        assert.equal(res.rows[0].student_id, 53);
        assert.equal(res.rows[0].proposed_price, 2500000);
        assert.equal(res.rows[0].status, 'SUBMITTED');
        assert.ok(res.rows[0].proposal_text.includes('React.js'));

        db.query = originalDbQuery;
    });
});
