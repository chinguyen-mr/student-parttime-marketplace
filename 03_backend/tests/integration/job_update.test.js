const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../../src/config/db');
const jobService = require('../../src/modules/jobs/job.service');
const jobRepository = require('../../src/database/repositories/job.repository');
const userRepository = require('../../src/database/repositories/user.repository');
const { validateCreateJob } = require('../../src/modules/jobs/job.validator');
const jwt = require('jsonwebtoken');

describe('PB-14: Đóng và Chỉnh sửa tin tuyển dụng (Job Update & Closure Acceptance Test)', () => {
    let employerA = null;
    let employerB = null;
    let studentUser = null;
    let testJobId = null;
    let tokenEmployerA = null;
    let tokenEmployerB = null;
    let tokenStudent = null;

    before(async () => {
        // Lấy tài khoản Employer A và Student từ database
        employerA = await userRepository.findByEmail('employer.test@vlu.edu.vn');
        studentUser = await userRepository.findByEmail('student.test@vlu.edu.vn');

        // Tạo tài khoản Employer B tạm để kiểm thử chống IDOR
        const tempEmailB = `employer.b.${Date.now()}@vlu.edu.vn`;
        const resB = await db.query(
            `INSERT INTO users (email, password_hash, full_name, role, status)
             VALUES ($1, 'hash_placeholder', 'Nhà Tuyển Dụng B (IDOR Check)', 'EMPLOYER', 'ACTIVE')
             RETURNING *`,
            [tempEmailB]
        );
        employerB = resB.rows[0];

        // Tạo JWT tokens
        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
        tokenEmployerA = jwt.sign({ id: employerA.id, role: employerA.role, email: employerA.email }, jwtSecret, { expiresIn: '1h' });
        tokenEmployerB = jwt.sign({ id: employerB.id, role: employerB.role, email: employerB.email }, jwtSecret, { expiresIn: '1h' });
        tokenStudent = jwt.sign({ id: studentUser.id, role: studentUser.role, email: studentUser.email }, jwtSecret, { expiresIn: '1h' });

        // Tạo 1 Job mẫu thuộc Employer A để thực hiện kiểm thử
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const jobRes = await db.query(
            `INSERT INTO jobs (employer_id, title, description, requirements, category, location, salary_type, salary, work_type, status, application_deadline)
             VALUES ($1, 'Nhân viên phục vụ part-time ca sáng', 'Phục vụ bàn và hỗ trợ khách hàng tại quán cà phê', 'Nhanh nhẹn, chăm chỉ', 'Phục vụ & F&B', 'Quận 1, TP.HCM', 'HOURLY', 35000, 'PART_TIME', 'OPEN', $2)
             RETURNING *`,
            [employerA.id, futureDate.toISOString()]
        );
        testJobId = jobRes.rows[0].id;

        // Gán 1 ca làm việc mẫu
        await db.query(
            `INSERT INTO job_work_schedules (job_id, day_of_week, start_time, end_time, min_hours_per_shift, is_mandatory)
             VALUES ($1, 2, '08:00', '12:00', 4, true)`,
            [testJobId]
        );
    });

    after(async () => {
        // Dọn dẹp Job mẫu và Employer B
        if (testJobId) {
            await db.query('DELETE FROM job_work_schedules WHERE job_id = $1', [testJobId]);
            await db.query('DELETE FROM jobs WHERE id = $1', [testJobId]);
        }
        if (employerB?.id) {
            await db.query('DELETE FROM users WHERE id = $1', [employerB.id]);
        }
        await db.pool.end();
    });

    // 1. Chỉnh sửa tin tuyển dụng thành công bởi chính chủ (200 OK)
    test('1. AC1: Chủ sở hữu Job (Employer A) cập nhật thông tin tin tuyển dụng thành công', async () => {
        const futureDeadline = new Date();
        futureDeadline.setDate(futureDeadline.getDate() + 45);

        const updatePayload = {
            title: 'Trưởng nhóm phục vụ part-time ca sáng (Đã sửa)',
            description: 'Phụ trách điều phối bàn và hỗ trợ khách hàng tại chi nhánh Quận 1',
            requirements: 'Nhanh nhẹn, có kinh nghiệm phục vụ trên 6 tháng',
            category: 'Phục vụ & F&B',
            location: '123 Lê Lợi, Phường Bến Nghé, Quận 1',
            salary_type: 'HOURLY',
            salary: 45000,
            work_type: 'PART_TIME',
            application_deadline: futureDeadline.toISOString(),
            job_banner_url: 'https://images.unsplash.com/photo-example',
        };

        const updated = await jobService.updateJob(testJobId, employerA.id, updatePayload);

        assert.equal(updated.id, testJobId);
        assert.equal(updated.title, updatePayload.title);
        assert.equal(updated.description, updatePayload.description);
        assert.equal(updated.location, updatePayload.location);
        assert.equal(Number(updated.salary), 45000);
        assert.ok(updated.updated_at !== null, 'updated_at phải được làm mới');
    });

    // 2. Chặn IDOR: Employer B không thể sửa Job của Employer A (403 Forbidden)
    test('2. Chống IDOR: Employer B không thể sửa tin tuyển dụng của Employer A -> 403 ForbiddenError', async () => {
        await assert.rejects(
            async () => {
                await jobService.updateJob(testJobId, employerB.id, {
                    title: 'Hacked title by Employer B',
                    description: 'Mô tả độc hại cố gắng tấn công IDOR',
                    category: 'CNTT',
                    location: 'Quận 1',
                    salary: 50000,
                });
            },
            {
                name: 'ForbiddenError',
                message: 'Bạn không có quyền chỉnh sửa tin tuyển dụng của nhà tuyển dụng khác',
            }
        );
    });

    // 3. Chặn sửa nếu Job có trạng thái FILLED (AC5)
    test('3. AC5: Khóa chức năng chỉnh sửa khi Job ở trạng thái "Đã nhận người" (FILLED) -> 400 AppError', async () => {
        // Cập nhật trạng thái Job sang FILLED
        await db.query('UPDATE jobs SET status = $1 WHERE id = $2', ['FILLED', testJobId]);

        await assert.rejects(
            async () => {
                await jobService.updateJob(testJobId, employerA.id, {
                    title: 'Cố tình sửa Job đã nhận người',
                    description: 'Mô tả mới cho job đã filled',
                    category: 'Phục vụ & F&B',
                    location: 'Quận 1',
                    salary: 50000,
                });
            },
            {
                name: 'AppError',
                statusCode: 400,
                message: 'Không thể chỉnh sửa tin tuyển dụng đã nhận người hoặc đã hoàn thành',
            }
        );

        // Khôi phục lại trạng thái OPEN
        await db.query('UPDATE jobs SET status = $1 WHERE id = $2', ['OPEN', testJobId]);
    });

    // 4. Chặn sửa nếu Job có trạng thái COMPLETED (AC5)
    test('4. AC5: Khóa chức năng chỉnh sửa khi Job ở trạng thái "Hoàn thành" (COMPLETED) -> 400 AppError', async () => {
        // Cập nhật trạng thái Job sang COMPLETED
        await db.query('UPDATE jobs SET status = $1 WHERE id = $2', ['COMPLETED', testJobId]);

        await assert.rejects(
            async () => {
                await jobService.updateJob(testJobId, employerA.id, {
                    title: 'Cố tình sửa Job đã hoàn thành',
                    description: 'Mô tả mới cho job completed',
                    category: 'Phục vụ & F&B',
                    location: 'Quận 1',
                    salary: 50000,
                });
            },
            {
                name: 'AppError',
                statusCode: 400,
                message: 'Không thể chỉnh sửa tin tuyển dụng đã nhận người hoặc đã hoàn thành',
            }
        );

        // Khôi phục lại trạng thái OPEN
        await db.query('UPDATE jobs SET status = $1 WHERE id = $2', ['OPEN', testJobId]);
    });

    // 5. AC2: Form validation - Tiêu đề < 5 ký tự bị chặn
    test('5. AC2: Validation - Tiêu đề quá ngắn (< 5 ký tự) bị chặn bởi validator', () => {
        const req = {
            body: {
                title: 'ABC',
                description: 'Mô tả công việc đủ dài trên 10 ký tự',
                category: 'Phục vụ',
                location: 'Quận 1',
                salary: 40000,
            }
        };
        let caughtErr = null;
        validateCreateJob(req, {}, (err) => { caughtErr = err; });

        assert.ok(caughtErr, 'Phải ném lỗi validation');
        assert.equal(caughtErr.statusCode, 400);
        assert.ok((caughtErr.details || []).some(e => e.includes('Tiêu đề')));
    });

    // 6. AC2: Form validation - Mô tả < 10 ký tự bị chặn
    test('6. AC2: Validation - Mô tả công việc quá ngắn (< 10 ký tự) bị chặn bởi validator', () => {
        const req = {
            body: {
                title: 'Tiêu đề hợp lệ',
                description: 'Ngắn',
                category: 'Phục vụ',
                location: 'Quận 1',
                salary: 40000,
            }
        };
        let caughtErr = null;
        validateCreateJob(req, {}, (err) => { caughtErr = err; });

        assert.ok(caughtErr, 'Phải ném lỗi validation');
        assert.equal(caughtErr.statusCode, 400);
        assert.ok((caughtErr.details || []).some(e => e.includes('Mô tả')));
    });

    // 7. AC2: Form validation - Mức lương <= 0 hoặc âm bị chặn
    test('7. AC2: Validation - Mức lương <= 0 hoặc không phải số dương bị chặn bởi validator', () => {
        const req = {
            body: {
                title: 'Tiêu đề hợp lệ',
                description: 'Mô tả công việc hợp lệ dài trên 10 ký tự',
                category: 'Phục vụ',
                location: 'Quận 1',
                salary: 0,
            }
        };
        let caughtErr = null;
        validateCreateJob(req, {}, (err) => { caughtErr = err; });

        assert.ok(caughtErr, 'Phải ném lỗi validation');
        assert.equal(caughtErr.statusCode, 400);
        assert.ok((caughtErr.details || []).some(e => e.includes('Mức lương')));
    });

    // 8. AC2: Form validation - Hạn nộp ở quá khứ bị chặn
    test('8. AC2: Validation - Hạn nộp hồ sơ ở quá khứ bị chặn bởi validator', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 5);

        const req = {
            body: {
                title: 'Tiêu đề hợp lệ',
                description: 'Mô tả công việc hợp lệ dài trên 10 ký tự',
                category: 'Phục vụ',
                location: 'Quận 1',
                salary: 40000,
                application_deadline: pastDate.toISOString(),
            }
        };
        let caughtErr = null;
        validateCreateJob(req, {}, (err) => { caughtErr = err; });

        assert.ok(caughtErr, 'Phải ném lỗi validation');
        assert.equal(caughtErr.statusCode, 400);
        assert.ok((caughtErr.details || []).some(e => e.includes('tương lai')));
    });

    // 9. Dữ liệu ca làm việc (Schedules) được bảo toàn khi chỉnh sửa Job
    test('9. Cấu trúc liên kết - Ca làm việc (Job Work Schedules) được bảo toàn sau khi cập nhật thông tin Job', async () => {
        const jobBefore = await jobRepository.findById(testJobId);
        assert.ok(jobBefore.work_schedules.length > 0, 'Phải có ca làm việc trước đó');

        await jobService.updateJob(testJobId, employerA.id, {
            title: 'Trưởng nhóm phục vụ part-time ca sáng',
            salary: 48000,
        });

        const jobAfter = await jobRepository.findById(testJobId);
        assert.equal(jobAfter.work_schedules.length, jobBefore.work_schedules.length);
        assert.equal(jobAfter.work_schedules[0].day_of_week, jobBefore.work_schedules[0].day_of_week);
        assert.equal(jobAfter.work_schedules[0].start_time, jobBefore.work_schedules[0].start_time);
    });

    // 10. AC3: Đóng tin tuyển dụng đổi trạng thái sang CLOSED
    test('10. AC3: Đóng tin tuyển dụng chuyển trạng thái thành CLOSED thành công', async () => {
        const closedJob = await jobService.updateJobStatus(testJobId, employerA.id, 'CLOSED');
        assert.equal(closedJob.status, 'CLOSED');

        const dbRow = await db.query('SELECT status FROM jobs WHERE id = $1', [testJobId]);
        assert.equal(dbRow.rows[0].status, 'CLOSED');
    });

    // 11. AC4: Job "Đã đóng" (CLOSED) lập tức biến mất khỏi kết quả tìm kiếm của Sinh viên
    test('11. AC4: Job trạng thái CLOSED không xuất hiện trong danh sách tìm kiếm việc làm (searchJobs status=OPEN)', async () => {
        const searchResults = await jobService.searchJobs({
            keyword: 'Trưởng nhóm phục vụ',
            status: 'OPEN',
            moderationStatus: 'APPROVED',
            limit: 50,
            offset: 0
        });

        const found = searchResults.some(j => j.id === testJobId);
        assert.equal(found, false, 'Tin đã đóng tuyệt đối không được hiển thị cho sinh viên');

        // Mở lại Job
        await jobService.updateJobStatus(testJobId, employerA.id, 'OPEN');
        const reopenedResults = await jobService.searchJobs({
            keyword: 'Trưởng nhóm phục vụ',
            status: 'OPEN',
            moderationStatus: 'APPROVED',
            limit: 50,
            offset: 0
        });
        const foundReopened = reopenedResults.some(j => j.id === testJobId);
        assert.equal(foundReopened, true, 'Tin mở lại phải hiển thị cho sinh viên');
    });

    // 12. Kiểm thử Endpoint HTTP PUT /api/jobs/:id thông qua fetch nội bộ
    test('12. HTTP Endpoint: PUT /api/jobs/:id với JWT Employer A trả 200 OK, còn Student trả 403', async (t) => {
        // Chạy app ngay trong tiến trình test (cùng DB với test) thay vì gọi server đang chạy ở cổng 5000
        const app = require('../../src/app');
        const server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
        t.after(() => server.close());
        const base = `http://127.0.0.1:${server.address().port}`;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 20);

        // Gửi request bằng Employer A
        const resA = await fetch(`${base}/api/jobs/${testJobId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokenEmployerA}`
            },
            body: JSON.stringify({
                title: 'Tuyển nhân viên ca sáng (HTTP Test OK)',
                description: 'Mô tả công việc kiểm thử thông qua HTTP PUT endpoint đầy đủ',
                category: 'Phục vụ & F&B',
                location: 'Quận 1, TP.HCM',
                salary: 42000,
                salary_type: 'HOURLY',
                work_type: 'PART_TIME',
                application_deadline: futureDate.toISOString()
            })
        });

        assert.equal(resA.status, 200);
        const dataA = await resA.json();
        assert.equal(dataA.success, true);
        assert.equal(dataA.data.title, 'Tuyển nhân viên ca sáng (HTTP Test OK)');

        // Gửi request bằng Student -> 403 Forbidden
        const resStudent = await fetch(`${base}/api/jobs/${testJobId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokenStudent}`
            },
            body: JSON.stringify({
                title: 'Student cố tình sửa job',
                description: 'Mô tả từ student không có quyền',
                category: 'Phục vụ',
                location: 'Quận 1',
                salary: 50000,
            })
        });

        assert.equal(resStudent.status, 403);
    });

    // 13. Khách vãng lai không có token gọi PUT /api/jobs/:id -> 401 Unauthorized
    test('13. HTTP Endpoint: Khách vãng lai (không có token) gọi PUT /api/jobs/:id -> 401 Unauthorized', async (t) => {
        const app = require('../../src/app');
        const server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
        t.after(() => server.close());
        const base = `http://127.0.0.1:${server.address().port}`;
        const resGuest = await fetch(`${base}/api/jobs/${testJobId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Guest cố tình sửa',
                description: 'Mô tả từ khách vãng lai',
                category: 'Phục vụ',
                location: 'Quận 1',
                salary: 50000,
            })
        });

        assert.equal(resGuest.status, 401);
    });
});
