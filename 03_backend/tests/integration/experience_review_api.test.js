// Kiểm thử tích hợp API đánh giá doanh nghiệp / công việc trên PostgreSQL thật.
// Tự tạo dữ liệu kiểm thử tạm (email *@review-it.test) và xóa sạch sau khi chạy — không để lại dữ liệu giả.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const db = require('../../src/config/db');
const app = require('../../src/app');
const { getJwtSecret } = require('../../src/config/jwt.config');
const service = require('../../src/modules/reviews/experience-review.service');

const TAG = `rv${Date.now()}`;
const U = {};
let jobId;
let otherJobId;
let server;
let base;
let dbOk = false;

const token = (u) => jwt.sign({ id: u.id, email: u.email, role: u.role, full_name: u.full_name }, getJwtSecret(), { expiresIn: '1h' });
async function call(method, path, user, body) {
    const res = await fetch(`${base}/api${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: `Bearer ${token(user)}` } : {}) },
        body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json() };
}

const companyBody = (over = {}) => ({
    experience_type: 'WORKED',
    rating_environment: 4, rating_salary_benefits: 3, rating_management: 4, rating_culture: 5,
    rating_learning: 4, rating_recruitment: 3, rating_overall: 4,
    title: 'Môi trường làm việc thân thiện',
    pros: 'Đồng nghiệp hỗ trợ nhiệt tình, quản lý giao việc rõ ràng.',
    cons: 'Lương tăng chậm, một số ca tối kéo dài hơn dự kiến.',
    advice: 'Nên hỏi kỹ lịch ca trước khi nhận việc.',
    ...over,
});
const jobBody = (over = {}) => ({
    experience_type: 'WORKED',
    rating_description_accuracy: 5, rating_salary_accuracy: 4, rating_schedule: 4,
    rating_workload: 3, rating_manager_support: 4, rating_overall: 5,
    content: 'Công việc đúng như mô tả, lương trả đúng hạn, ca làm ổn định và quản lý dễ trao đổi.',
    ...over,
});

async function mkUser(key, role, name) {
    const r = await db.query(
        `INSERT INTO users (email, password_hash, full_name, role, status) VALUES ($1, 'x', $2, $3, 'ACTIVE') RETURNING id, email, role, full_name`,
        [`${key}.${TAG}@review-it.test`, name, role]
    );
    U[key] = r.rows[0];
}

before(async () => {
    try {
        await db.query('SELECT 1 FROM company_reviews LIMIT 1');
        dbOk = true;
    } catch {
        return;
    }
    await mkUser('emp', 'EMPLOYER', 'Công ty Kiểm Thử');
    await mkUser('emp2', 'EMPLOYER', 'Công ty Khác');
    await mkUser('worker', 'STUDENT', 'Sinh Viên Đã Làm');
    await mkUser('applicant', 'STUDENT', 'Sinh Viên Ứng Tuyển');
    await mkUser('stranger', 'STUDENT', 'Sinh Viên Chưa Liên Hệ');
    await mkUser('admin', 'ADMIN', 'Quản Trị Kiểm Thử');
    for (const k of ['emp', 'emp2']) {
        await db.query(`INSERT INTO employer_profiles (user_id, display_name, account_type) VALUES ($1, $2, 'Doanh nghiệp / Công ty')`, [U[k].id, U[k].full_name]);
    }
    const job = await db.query(
        `INSERT INTO jobs (employer_id, title, description, category, location, salary, status)
         VALUES ($1, 'Nhân viên phục vụ (kiểm thử)', 'Mô tả', 'F&B', 'TP. Hồ Chí Minh', 30000, 'OPEN') RETURNING id`, [U.emp.id]
    );
    jobId = job.rows[0].id;
    const job2 = await db.query(
        `INSERT INTO jobs (employer_id, title, description, category, location, salary, status)
         VALUES ($1, 'Thu ngân (kiểm thử)', 'Mô tả', 'F&B', 'TP. Hồ Chí Minh', 30000, 'OPEN') RETURNING id`, [U.emp.id]
    );
    otherJobId = job2.rows[0].id;
    const app1 = await db.query(`INSERT INTO applications (job_id, student_id, status) VALUES ($1, $2, 'ACCEPTED') RETURNING id`, [jobId, U.worker.id]);
    await db.query(`INSERT INTO work_assignments (job_id, student_id, application_id, status) VALUES ($1, $2, $3, 'IN_PROGRESS')`, [jobId, U.worker.id, app1.rows[0].id]);
    await db.query(`INSERT INTO applications (job_id, student_id, status) VALUES ($1, $2, 'REJECTED')`, [jobId, U.applicant.id]);

    server = app.listen(0);
    base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    if (server) server.close();
    if (dbOk && U.admin) {
        const ids = Object.values(U).map(u => u.id);
        await db.query('DELETE FROM admin_logs WHERE admin_id = $1', [U.admin.id]);
        await db.query('DELETE FROM jobs WHERE employer_id = ANY($1)', [ids]);
        await db.query('DELETE FROM users WHERE id = ANY($1)', [ids]);
        const left = await db.query(`SELECT COUNT(*) FROM users WHERE email LIKE $1`, [`%.${TAG}@review-it.test`]);
        assert.equal(Number(left.rows[0].count), 0, 'dữ liệu kiểm thử phải được xóa hết');
    }
    await db.pool.end();
});

const ids = {};

describe('Đánh giá doanh nghiệp & công việc (API + DB thật)', () => {
    test('1. Ứng viên đã làm việc đánh giá doanh nghiệp → xác thực, công khai ngay', async (t) => {
        if (!dbOk) return t.skip('DB không khả dụng');
        const r = await call('POST', `/reviews/companies/${U.emp.id}/company-reviews`, U.worker, companyBody());
        assert.equal(r.status, 201, JSON.stringify(r.body));
        assert.equal(r.body.data.status, 'PUBLISHED');
        assert.equal(r.body.data.is_verified, true);
        ids.workerCompany = r.body.data.id;
    });

    test('2. Ứng viên đã làm công việc đánh giá công việc → xác thực, công khai', async (t) => {
        if (!dbOk) return t.skip();
        const r = await call('POST', `/reviews/jobs/${jobId}/job-reviews`, U.worker, jobBody());
        assert.equal(r.status, 201, JSON.stringify(r.body));
        assert.equal(r.body.data.status, 'PUBLISHED');
        assert.equal(r.body.data.job_id, jobId);
        ids.workerJob = r.body.data.id;
        // Chưa làm công việc thứ 2 → không được đánh giá
        const r2 = await call('POST', `/reviews/jobs/${otherJobId}/job-reviews`, U.worker, jobBody());
        assert.equal(r2.status, 403);
    });

    test('3. Chưa đăng nhập → 401; eligibility trả LOGIN_REQUIRED', async (t) => {
        if (!dbOk) return t.skip();
        assert.equal((await call('POST', `/reviews/companies/${U.emp.id}/company-reviews`, null, companyBody())).status, 401);
        const e = await call('GET', `/reviews/companies/${U.emp.id}/eligibility`, null);
        assert.equal(e.body.data.reason, 'LOGIN_REQUIRED');
    });

    test('4. Không phải ứng viên (Employer/Admin) → 403', async (t) => {
        if (!dbOk) return t.skip();
        assert.equal((await call('POST', `/reviews/companies/${U.emp.id}/company-reviews`, U.emp2, companyBody())).status, 403);
        assert.equal((await call('POST', `/reviews/companies/${U.emp.id}/company-reviews`, U.admin, companyBody())).status, 403);
        // Employer không được sửa review của ứng viên
        assert.equal((await call('PUT', `/reviews/company/${ids.workerCompany}`, U.emp, companyBody({ rating_overall: 5 }))).status, 403);
    });

    test('5. Employer tự đánh giá doanh nghiệp mình → bị chặn', async (t) => {
        if (!dbOk) return t.skip();
        const e = await call('GET', `/reviews/companies/${U.emp.id}/eligibility`, U.emp);
        assert.equal(e.body.data.reason, 'SELF_REVIEW');
        await assert.rejects(service.createCompanyReview(U.emp.id, U.emp.id, companyBody()), (err) => err.statusCode === 403);
    });

    test('6. Đánh giá trùng lặp → 409', async (t) => {
        if (!dbOk) return t.skip();
        assert.equal((await call('POST', `/reviews/companies/${U.emp.id}/company-reviews`, U.worker, companyBody())).status, 409);
        assert.equal((await call('POST', `/reviews/jobs/${jobId}/job-reviews`, U.worker, jobBody())).status, 409);
    });

    test('7. Thiếu tiêu chí → 400', async (t) => {
        if (!dbOk) return t.skip();
        const { rating_management, ...missing } = companyBody();
        const r = await call('POST', `/reviews/companies/${U.emp2.id}/company-reviews`, U.applicant, missing);
        assert.equal(r.status, 400);
        assert.ok(r.body.details.some(d => d.includes('rating_management')));
    });

    test('8 + 17. Nội dung vi phạm → chờ duyệt; đánh giá có tên (không ẩn danh)', async (t) => {
        if (!dbOk) return t.skip();
        const r = await call('POST', `/reviews/companies/${U.emp.id}/company-reviews`, U.applicant, companyBody({
            experience_type: 'APPLIED', rating_overall: 2, is_anonymous: false,
            pros: 'Phản hồi hồ sơ nhanh, liên hệ 0901234567 để hỏi thêm.',
        }));
        assert.equal(r.status, 201);
        assert.equal(r.body.data.status, 'PENDING');
        assert.equal(r.body.data.is_verified, true); // có đơn ứng tuyển thật → xác thực "đã ứng tuyển"
        assert.ok(!('moderation_flags' in r.body.data), 'không lộ cờ nội bộ cho tác giả');
        ids.applicantCompany = r.body.data.id;
    });

    test('18. Không có dữ liệu xác thực → không gắn nhãn xác thực, chờ duyệt', async (t) => {
        if (!dbOk) return t.skip();
        const r = await call('POST', `/reviews/companies/${U.emp.id}/company-reviews`, U.stranger, companyBody({ experience_type: 'INTERVIEWED', rating_overall: 1 }));
        assert.equal(r.status, 201);
        assert.equal(r.body.data.is_verified, false);
        assert.equal(r.body.data.status, 'PENDING');
        ids.strangerCompany = r.body.data.id;
        // Tự khai "đã làm việc" nhưng không có work assignment → vẫn không xác thực
        const e = await call('GET', `/reviews/companies/${U.emp2.id}/eligibility`, U.stranger);
        assert.deepEqual(e.body.data.verifiable_experiences, []);
        assert.equal((await call('POST', `/reviews/jobs/${jobId}/job-reviews`, U.stranger, jobBody())).status, 403);
    });

    test('9. Review chờ duyệt không hiển thị công khai, không tính điểm', async (t) => {
        if (!dbOk) return t.skip();
        const list = await call('GET', `/reviews/companies/${U.emp.id}/company-reviews`, null);
        assert.deepEqual(list.body.data.map(r => r.id), [ids.workerCompany]);
        const s = await call('GET', `/reviews/companies/${U.emp.id}/summary`, null);
        assert.equal(s.body.data.company.total, 1);
        assert.equal(s.body.data.company.average_overall, 4);
    });

    test('10. Admin từ chối (bắt buộc lý do) → tác giả sửa → chờ duyệt lại', async (t) => {
        if (!dbOk) return t.skip();
        assert.equal((await call('POST', `/admin/reviews/company/${ids.strangerCompany}/moderate`, U.admin, { action: 'REJECT' })).status, 400);
        const r = await call('POST', `/admin/reviews/company/${ids.strangerCompany}/moderate`, U.admin, { action: 'REJECT', reason: 'Không đủ cơ sở về trải nghiệm' });
        assert.equal(r.status, 200);
        assert.equal(r.body.data.status, 'REJECTED');
        const mine = await call('GET', '/reviews/mine', U.stranger);
        assert.equal(mine.body.data.company[0].moderation_reason, 'Không đủ cơ sở về trải nghiệm');
        const ed = await call('PUT', `/reviews/company/${ids.strangerCompany}`, U.stranger, companyBody({ experience_type: 'INTERVIEWED', rating_overall: 2 }));
        assert.equal(ed.body.data.status, 'PENDING');
        assert.equal(ed.body.data.edits_left, 4);
        // Không phải Admin → không kiểm duyệt được
        assert.equal((await call('POST', `/admin/reviews/company/${ids.strangerCompany}/moderate`, U.emp, { action: 'APPROVE' })).status, 403);
    });

    test('11. Admin duyệt → công khai, tính vào điểm', async (t) => {
        if (!dbOk) return t.skip();
        const r = await call('POST', `/admin/reviews/company/${ids.applicantCompany}/moderate`, U.admin, { action: 'APPROVE' });
        assert.equal(r.body.data.status, 'PUBLISHED');
        const list = await call('GET', `/reviews/companies/${U.emp.id}/company-reviews`, null);
        const named = list.body.data.find(x => x.id === ids.applicantCompany);
        assert.equal(named.author_name, 'Sinh Viên Ứng Tuyển');
        assert.equal(list.body.data.find(x => x.id === ids.workerCompany).author_name, null, 'mặc định ẩn danh');
    });

    test('12. Employer phản hồi; employer khác không phản hồi được', async (t) => {
        if (!dbOk) return t.skip();
        assert.equal((await call('PUT', `/reviews/company/${ids.workerCompany}/reply`, U.emp2, { content: 'Cảm ơn bạn đã chia sẻ.' })).status, 403);
        const r = await call('PUT', `/reviews/company/${ids.workerCompany}/reply`, U.emp, { content: 'Cảm ơn bạn đã chia sẻ, chúng tôi sẽ cải thiện lịch ca.' });
        assert.equal(r.status, 200);
        const list = await call('GET', `/reviews/companies/${U.emp.id}/company-reviews`, null);
        assert.match(list.body.data.find(x => x.id === ids.workerCompany).reply.content, /cải thiện lịch ca/);
        const notif = await db.query(`SELECT 1 FROM notifications WHERE user_id = $1 AND target_type = 'COMPANY_REVIEW'`, [U.worker.id]);
        assert.ok(notif.rows.length > 0, 'tác giả nhận thông báo phản hồi');
    });

    test('13 + 14. Employer báo cáo → Admin bác bỏ / ẩn; tác giả khiếu nại → Admin khôi phục', async (t) => {
        if (!dbOk) return t.skip();
        assert.equal((await call('POST', `/reviews/company/${ids.applicantCompany}/reports`, U.applicant, { reason: 'SPAM' })).status, 403, 'không tự báo cáo');
        const rep = await call('POST', `/reviews/company/${ids.applicantCompany}/reports`, U.emp, { reason: 'PERSONAL_INFO', description: 'Đánh giá chứa số điện thoại.' });
        assert.equal(rep.status, 201);
        assert.equal((await call('POST', `/reviews/company/${ids.applicantCompany}/reports`, U.emp, { reason: 'SPAM' })).status, 409);
        // Báo cáo không tự ẩn review
        let s = await call('GET', `/reviews/companies/${U.emp.id}/summary`, null);
        assert.equal(s.body.data.company.total, 2);
        const hide = await call('POST', `/admin/reviews/reports/${rep.body.data.id}/resolve`, U.admin, { action: 'HIDE', note: 'Chứa thông tin liên hệ cá nhân' });
        assert.equal(hide.body.data.review_status, 'HIDDEN');
        s = await call('GET', `/reviews/companies/${U.emp.id}/summary`, null);
        assert.equal(s.body.data.company.total, 1, 'review bị ẩn không tính điểm');
        // Khiếu nại
        assert.equal((await call('POST', `/reviews/company/${ids.applicantCompany}/appeal`, U.applicant, { description: 'ngắn' })).status, 400);
        const ap = await call('POST', `/reviews/company/${ids.applicantCompany}/appeal`, U.applicant, { description: 'Tôi đã xóa số điện thoại, mong được hiển thị lại.' });
        assert.equal(ap.status, 201);
        const res = await call('POST', `/admin/reviews/reports/${ap.body.data.id}/resolve`, U.admin, { action: 'ACCEPT', note: 'Chấp nhận khiếu nại' });
        assert.equal(res.body.data.review_status, 'PUBLISHED');
        // Báo cáo khác bị bác bỏ → review giữ nguyên
        const rep2 = await call('POST', `/reviews/company/${ids.workerCompany}/reports`, U.emp, { reason: 'FALSE_INFO' });
        const dis = await call('POST', `/admin/reviews/reports/${rep2.body.data.id}/resolve`, U.admin, { action: 'DISMISS', note: 'Nội dung là ý kiến cá nhân hợp lệ' });
        assert.equal(dis.body.data.review_status, 'PUBLISHED');
        // Lịch sử kiểm duyệt có lý do
        const d = await call('GET', `/admin/reviews/company/${ids.applicantCompany}`, U.admin);
        const actions = d.body.data.logs.map(l => l.action);
        for (const a of ['CREATED', 'APPROVE', 'REPORTED', 'HIDE', 'APPEALED', 'RESTORE']) assert.ok(actions.includes(a), `thiếu log ${a}`);
        assert.ok(d.body.data.logs.find(l => l.action === 'HIDE').reason.includes('liên hệ'));
    });

    test('15. Điểm tổng hợp chính xác, điểm công việc tính riêng', async (t) => {
        if (!dbOk) return t.skip();
        const s = (await call('GET', `/reviews/companies/${U.emp.id}/summary`, null)).body.data;
        // 2 review công khai: overall 4 và 2
        assert.equal(s.company.total, 2);
        assert.equal(s.company.average_overall, 3);
        assert.deepEqual(s.company.distribution, { 1: 0, 2: 1, 3: 0, 4: 1, 5: 0 });
        assert.equal(s.company.criteria.rating_culture, 5);
        assert.equal(s.jobs.total, 1);
        assert.equal(s.jobs.average_overall, 5);
        const js = (await call('GET', `/reviews/jobs/${jobId}/summary`, null)).body.data;
        assert.equal(js.criteria.rating_workload, 3);
        const empty = (await call('GET', `/reviews/jobs/${otherJobId}/summary`, null)).body.data;
        assert.equal(empty.average_overall, null, 'không có review → không có điểm');
    });

    test('16. Phân trang & bộ lọc', async (t) => {
        if (!dbOk) return t.skip();
        const p1 = (await call('GET', `/reviews/companies/${U.emp.id}/company-reviews?limit=1&page=1`, null)).body;
        const p2 = (await call('GET', `/reviews/companies/${U.emp.id}/company-reviews?limit=1&page=2`, null)).body;
        assert.equal(p1.pagination.totalPages, 2);
        assert.notEqual(p1.data[0].id, p2.data[0].id);
        assert.deepEqual((await call('GET', `/reviews/companies/${U.emp.id}/company-reviews?experience=APPLIED`, null)).body.data.map(r => r.id), [ids.applicantCompany]);
        assert.equal((await call('GET', `/reviews/companies/${U.emp.id}/company-reviews?rating=4`, null)).body.data.length, 1);
        const jr = (await call('GET', `/reviews/companies/${U.emp.id}/job-reviews`, null)).body;
        assert.deepEqual(jr.jobs.map(j => j.job_id), [jobId]);
        const ov = (await call('GET', '/reviews/employer/overview', U.emp)).body.data;
        assert.equal(ov.unreplied, 2); // review của ứng viên ứng tuyển + review công việc
        assert.ok(ov.monthly.length >= 1);
    });

    test('Ẩn danh: Admin vẫn thấy danh tính để kiểm duyệt', async (t) => {
        if (!dbOk) return t.skip();
        const d = await call('GET', `/admin/reviews/company/${ids.workerCompany}`, U.admin);
        assert.equal(d.body.data.review.is_anonymous, true);
        assert.equal(d.body.data.review.reviewer_email, U.worker.email);
        assert.equal(d.body.data.evidence.assignments.length, 1);
    });
});
