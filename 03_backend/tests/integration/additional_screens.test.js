const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const authService = require('../../src/modules/auth/auth.service');
const applicationService = require('../../src/modules/applications/application.service');
const applicationRepository = require('../../src/database/repositories/application.repository');
const userRepository = require('../../src/database/repositories/user.repository');
const db = require('../../src/config/db');

describe('JOBNEST — 8 Additional Screens Logic & Security Verification', () => {

    describe('1. WF-X01: Báo cáo vi phạm (Report Validation & Logic)', () => {
        const reportRoutes = require('../../src/modules/reports/report.routes');

        function createMockContext({ user = { id: 10, role: 'STUDENT' }, body = {} } = {}) {
            let statusCode = 200;
            let responseJson = null;
            let error = null;

            const req = {
                user,
                body
            };

            const res = {
                status(code) {
                    statusCode = code;
                    return this;
                },
                json(data) {
                    responseJson = data;
                    return this;
                }
            };

            const next = (err) => {
                error = err;
            };

            return { req, res, next, getResult: () => ({ statusCode, responseJson, error }) };
        }

        it('1.1. Từ chối nếu target_type không hợp lệ (không phải JOB hoặc USER)', async () => {
            const ctx = createMockContext({
                body: { target_type: 'INVALID', target_id: 1, reason: 'Spam' }
            });

            // Find route handler for POST /
            const handler = reportRoutes.stack.find(s => s.route?.methods?.post)?.route?.stack?.slice(-1)[0]?.handle;
            assert.ok(handler, 'Route POST /api/reports handler must exist');

            await handler(ctx.req, ctx.res, ctx.next);
            const { error } = ctx.getResult();
            assert.ok(error);
            assert.equal(error.statusCode, 400);
            assert.match(error.message, /Loại đối tượng báo cáo không hợp lệ/);
        });

        it('1.2. Từ chối nếu thiếu lý do báo cáo', async () => {
            const ctx = createMockContext({
                body: { target_type: 'JOB', target_id: 1, reason: '   ' }
            });

            const handler = reportRoutes.stack.find(s => s.route?.methods?.post)?.route?.stack?.slice(-1)[0]?.handle;
            await handler(ctx.req, ctx.res, ctx.next);
            const { error } = ctx.getResult();
            assert.ok(error);
            assert.equal(error.statusCode, 400);
            assert.match(error.message, /chọn lý do báo cáo/);
        });

        it('1.3. Từ chối nếu người dùng tự báo cáo chính mình', async () => {
            const originalQuery = db.query;
            db.query = async (sql, params) => {
                if (sql.includes('FROM users WHERE id = $1')) {
                    return { rows: [{ id: 10, full_name: 'Sinh viên A' }] };
                }
                return { rows: [] };
            };

            try {
                const ctx = createMockContext({
                    user: { id: 10, role: 'STUDENT' },
                    body: { target_type: 'USER', target_id: 10, reason: 'Lừa đảo' }
                });

                const handler = reportRoutes.stack.find(s => s.route?.methods?.post)?.route?.stack?.slice(-1)[0]?.handle;
                await handler(ctx.req, ctx.res, ctx.next);
                const { error } = ctx.getResult();
                assert.ok(error);
                assert.equal(error.statusCode, 400);
                assert.match(error.message, /tự gửi báo cáo vi phạm chính mình/);
            } finally {
                db.query = originalQuery;
            }
        });

        it('1.4. Chặn báo cáo trùng lặp khi báo cáo trước đó đang PENDING', async () => {
            const originalQuery = db.query;
            db.query = async (sql, params) => {
                if (sql.includes('FROM jobs WHERE id = $1')) {
                    return { rows: [{ id: 5, title: 'Việc làm part-time' }] };
                }
                if (sql.includes('FROM reports') && sql.includes("status = 'PENDING'")) {
                    return { rows: [{ id: 99 }] }; // Duplicate found
                }
                return { rows: [] };
            };

            try {
                const ctx = createMockContext({
                    user: { id: 10, role: 'STUDENT' },
                    body: { target_type: 'JOB', target_id: 5, reason: 'Thông tin giả mạo' }
                });

                const handler = reportRoutes.stack.find(s => s.route?.methods?.post)?.route?.stack?.slice(-1)[0]?.handle;
                await handler(ctx.req, ctx.res, ctx.next);
                const { error } = ctx.getResult();
                assert.ok(error);
                assert.equal(error.statusCode, 400);
                assert.match(error.message, /không gửi trùng lặp/);
            } finally {
                db.query = originalQuery;
            }
        });

        it('1.5. Chấp nhận lưu báo cáo hợp lệ và trả về 201 Created', async () => {
            const originalQuery = db.query;
            db.query = async (sql, params) => {
                if (sql.includes('FROM jobs WHERE id = $1')) {
                    return { rows: [{ id: 5, title: 'Việc làm part-time' }] };
                }
                if (sql.includes('FROM reports') && sql.includes("status = 'PENDING'")) {
                    return { rows: [] }; // No duplicate
                }
                if (sql.includes('INSERT INTO reports')) {
                    return {
                        rows: [{
                            id: 101,
                            reporter_id: 10,
                            target_type: params[1],
                            target_id: params[2],
                            reason: params[3],
                            description: params[4],
                            status: 'PENDING'
                        }]
                    };
                }
                return { rows: [] };
            };

            try {
                const ctx = createMockContext({
                    user: { id: 10, role: 'STUDENT' },
                    body: { target_type: 'JOB', target_id: 5, reason: 'Thông tin sai lệch', description: 'Mô tả chi tiết' }
                });

                const handler = reportRoutes.stack.find(s => s.route?.methods?.post)?.route?.stack?.slice(-1)[0]?.handle;
                await handler(ctx.req, ctx.res, ctx.next);
                const { statusCode, responseJson, error } = ctx.getResult();
                assert.equal(error, null);
                assert.equal(statusCode, 201);
                assert.equal(responseJson.success, true);
                assert.equal(responseJson.data.status, 'PENDING');
            } finally {
                db.query = originalQuery;
            }
        });
    });

    describe('2. WF-X03: Đổi mật khẩu (Password Change Service)', () => {
        it('2.1. Từ chối nếu thiếu mật khẩu hiện tại hoặc mật khẩu mới', async () => {
            await assert.rejects(
                () => authService.changePassword(1, { currentPassword: '', newPassword: 'newPassword123' }),
                /Vui lòng cung cấp mật khẩu/
            );
        });

        it('2.2. Từ chối nếu mật khẩu mới dưới 6 ký tự', async () => {
            await assert.rejects(
                () => authService.changePassword(1, { currentPassword: 'oldPassword123', newPassword: '123' }),
                /ít nhất 6 ký tự/
            );
        });

        it('2.3. Từ chối nếu mật khẩu mới trùng mật khẩu hiện tại', async () => {
            const originalFindById = userRepository.findById;
            userRepository.findById = async () => ({
                id: 1,
                password_hash: await bcrypt.hash('samePassword123', 10)
            });

            try {
                await assert.rejects(
                    () => authService.changePassword(1, { currentPassword: 'samePassword123', newPassword: 'samePassword123' }),
                    /không được trùng/
                );
            } finally {
                userRepository.findById = originalFindById;
            }
        });

        it('2.4. Từ chối nếu mật khẩu hiện tại sai lệch so với hash trong CSDL', async () => {
            const originalFindById = userRepository.findById;
            userRepository.findById = async () => ({
                id: 1,
                password_hash: await bcrypt.hash('correctPassword123', 10)
            });

            try {
                await assert.rejects(
                    () => authService.changePassword(1, { currentPassword: 'wrongPassword123', newPassword: 'newValidPassword456' }),
                    /Mật khẩu hiện tại không chính xác/
                );
            } finally {
                userRepository.findById = originalFindById;
            }
        });

        it('2.5. Cập nhật mật khẩu thành công khi mật khẩu hiện tại đúng', async () => {
            const originalFindById = userRepository.findById;
            const originalQuery = db.query;
            let updatedHash = null;

            userRepository.findById = async () => ({
                id: 1,
                password_hash: await bcrypt.hash('oldSecret123', 10)
            });

            db.query = async (sql, params) => {
                if (sql.includes('UPDATE users SET password_hash')) {
                    updatedHash = params[0];
                    return { rowCount: 1 };
                }
                return { rows: [] };
            };

            try {
                const result = await authService.changePassword(1, {
                    currentPassword: 'oldSecret123',
                    newPassword: 'newSecurePassword789'
                });

                assert.equal(result.success, true);
                assert.ok(updatedHash);
                assert.ok(await bcrypt.compare('newSecurePassword789', updatedHash));
            } finally {
                userRepository.findById = originalFindById;
                db.query = originalQuery;
            }
        });
    });

    describe('3. WF-S12: Chi tiết đơn ứng tuyển (Application Detail RBAC)', () => {
        it('3.1. Ném NotFoundError nếu đơn ứng tuyển không tồn tại', async () => {
            const origFindById = applicationRepository.findById;
            applicationRepository.findById = async () => null;

            try {
                await assert.rejects(
                    () => applicationService.getApplicationDetail(9999, { id: 1, role: 'STUDENT' }),
                    /Không tìm thấy đơn ứng tuyển/
                );
            } finally {
                applicationRepository.findById = origFindById;
            }
        });

        it('3.2. Chặn 403 Forbidden nếu sinh viên khác xem đơn ứng tuyển của người khác', async () => {
            const origFindById = applicationRepository.findById;
            applicationRepository.findById = async () => ({
                id: 10,
                student_id: 1, // Thuộc sinh viên 1
                employer_id: 2 // Thuộc nhà tuyển dụng 2
            });

            try {
                // Sinh viên 999 cố xem
                await assert.rejects(
                    () => applicationService.getApplicationDetail(10, { id: 999, role: 'STUDENT' }),
                    /không có quyền xem/
                );
            } finally {
                applicationRepository.findById = origFindById;
            }
        });

        it('3.3. Cho phép sinh viên chính chủ xem đơn ứng tuyển của mình', async () => {
            const origFindById = applicationRepository.findById;
            applicationRepository.findById = async () => ({
                id: 10,
                student_id: 5,
                employer_id: 2,
                job_title: 'Lập trình viên React',
                status: 'PENDING'
            });

            try {
                const app = await applicationService.getApplicationDetail(10, { id: 5, role: 'STUDENT' });
                assert.equal(app.id, 10);
                assert.equal(app.job_title, 'Lập trình viên React');
            } finally {
                applicationRepository.findById = origFindById;
            }
        });

        it('3.4. Cho phép Nhà tuyển dụng sở hữu tin xem đơn ứng tuyển', async () => {
            const origFindById = applicationRepository.findById;
            applicationRepository.findById = async () => ({
                id: 10,
                student_id: 5,
                employer_id: 8,
                job_title: 'Nhân viên pha chế',
                status: 'SHORTLISTED'
            });

            try {
                const app = await applicationService.getApplicationDetail(10, { id: 8, role: 'EMPLOYER' });
                assert.equal(app.id, 10);
                assert.equal(app.employer_id, 8);
            } finally {
                applicationRepository.findById = origFindById;
            }
        });
    });

    describe('4. WF-G06: Lọc việc làm theo employerId', () => {
        const jobRepository = require('../../src/database/repositories/job.repository');

        it('4.1. Câu lệnh query SQL chứa điều kiện employer_id khi truyền employerId', async () => {
            const originalQuery = db.query;
            let capturedSql = '';
            let capturedParams = [];

            db.query = async (sql, params) => {
                capturedSql = sql;
                capturedParams = params;
                return { rows: [] };
            };

            try {
                await jobRepository.findAllWithFilter({
                    employerId: 42,
                    status: 'OPEN'
                });

                assert.ok(capturedSql.includes('j.employer_id = $'));
                assert.ok(capturedParams.includes(42));
            } finally {
                db.query = originalQuery;
            }
        });
    });
});
