const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const twentyWebhookService = require('../../src/modules/webhooks/twenty-webhook.service');
const db = require('../../src/config/db');

describe('TWENTY CRM WEBHOOK & NOTIFICATION DISPATCHER (APPROVED PROPOSAL)', () => {
    test('1. Báo lỗi BadRequestError nếu payload webhook rỗng hoặc thiếu data', async () => {
        await assert.rejects(
            async () => {
                await twentyWebhookService.handleCompanyVerifiedEvent(null);
            },
            {
                name: 'BadRequestError',
            }
        );

        await assert.rejects(
            async () => {
                await twentyWebhookService.handleCompanyVerifiedEvent({ event: 'test' });
            },
            {
                name: 'BadRequestError',
            }
        );
    });

    test('2. Báo lỗi NotFoundError nếu không tìm thấy nhà tuyển dụng tương ứng trong JobNest', async () => {
        const originalQuery = db.query;
        db.query = async (sql, params) => {
            return { rows: [] };
        };

        try {
            await assert.rejects(
                async () => {
                    await twentyWebhookService.handleCompanyVerifiedEvent({
                        event: 'company.verified',
                        data: {
                            email: 'nonexistent@company.com',
                            taxCode: '0000000000',
                        },
                    });
                },
                {
                    name: 'NotFoundError',
                }
            );
        } finally {
            db.query = originalQuery;
        }
    });

    test('3. Xử lý thành công webhook company.verified: Cập nhật CSDL, tạo thông báo In-App và phát tin SMS/Email', async () => {
        const originalQuery = db.query;
        const executedQueries = [];

        db.query = async (sql, params) => {
            executedQueries.push({ sql, params });

            // 1. SELECT user
            if (sql.includes('SELECT u.id, u.email')) {
                return {
                    rows: [
                        {
                            id: 88,
                            email: 'hr@starbucks.vn',
                            phone: '0901234567',
                            full_name: 'Nguyễn Văn Tuyển',
                            display_name: 'Starbucks Vietnam',
                            tax_code: '0312345678',
                        },
                    ],
                };
            }

            // 2. UPDATE employer_profiles
            if (sql.includes('UPDATE employer_profiles')) {
                return { rowCount: 1 };
            }

            // 3. INSERT INTO notifications
            if (sql.includes('INSERT INTO notifications')) {
                return {
                    rows: [
                        {
                            id: 999,
                            title: 'Xác thực doanh nghiệp thành công (Twenty CRM)',
                            created_at: new Date(),
                        },
                    ],
                };
            }

            // 4. INSERT INTO audit_logs
            if (sql.includes('INSERT INTO audit_logs')) {
                return { rowCount: 1 };
            }

            return { rows: [] };
        };

        try {
            const payload = {
                event: 'company.verified',
                data: {
                    employerId: 88,
                    email: 'hr@starbucks.vn',
                    taxCode: '0312345678',
                    companyName: 'Starbucks Vietnam',
                    verificationStatus: 'VERIFIED',
                },
            };

            const result = await twentyWebhookService.handleCompanyVerifiedEvent(payload);

            assert.equal(result.success, true);
            assert.equal(result.employer.id, 88);
            assert.equal(result.employer.company_name, 'Starbucks Vietnam');
            assert.equal(result.employer.verification_status, 'VERIFIED');
            assert.equal(result.notification_id, 999);

            // Kiểm tra kênh phát tin Email & SMS
            assert.equal(result.dispatched_channels.length, 2);
            const emailChannel = result.dispatched_channels.find((c) => c.channel === 'EMAIL');
            const smsChannel = result.dispatched_channels.find((c) => c.channel === 'SMS');

            assert.ok(emailChannel);
            assert.equal(emailChannel.recipient, 'hr@starbucks.vn');
            assert.equal(emailChannel.status, 'DELIVERED');

            assert.ok(smsChannel);
            assert.equal(smsChannel.recipient, '0901234567');
            assert.equal(smsChannel.status, 'DELIVERED');

            // Kiểm tra các câu truy vấn thực thi
            assert.ok(executedQueries.some((q) => q.sql.includes('UPDATE employer_profiles')));
            assert.ok(executedQueries.some((q) => q.sql.includes('INSERT INTO notifications')));
        } finally {
            db.query = originalQuery;
        }
    });
});
