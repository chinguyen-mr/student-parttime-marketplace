const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const P = require('../../src/modules/reviews/experience-review.policy');

const companyBody = {
    experience_type: 'WORKED',
    rating_environment: 4, rating_salary_benefits: 3, rating_management: 4, rating_culture: 5,
    rating_learning: 4, rating_recruitment: 3, rating_overall: 4,
    title: 'Môi trường thân thiện',
    pros: 'Đồng nghiệp hỗ trợ nhiệt tình, quản lý rõ ràng.',
    cons: 'Lương tăng chậm, ca tối đôi khi kéo dài.',
};
const jobBody = {
    experience_type: 'WORKED',
    rating_description_accuracy: 5, rating_salary_accuracy: 4, rating_schedule: 4,
    rating_workload: 3, rating_manager_support: 4, rating_overall: 4,
    content: 'Công việc đúng mô tả, lương trả đúng hạn, ca làm ổn định.',
};

describe('Đánh giá: validate', () => {
    test('Đánh giá doanh nghiệp hợp lệ, mặc định ẩn danh', () => {
        const v = P.validateCompanyReview(companyBody);
        assert.equal(v.rating_overall, 4);
        assert.equal(v.is_anonymous, true);
        assert.equal(v.advice, null);
    });

    test('Thiếu tiêu chí → lỗi 400 liệt kê tiêu chí thiếu', () => {
        const { rating_culture, ...missing } = companyBody;
        assert.throws(() => P.validateCompanyReview(missing), (err) => err.statusCode === 400 && err.details.some(d => d.includes('rating_culture')));
        assert.throws(() => P.validateJobReview({ ...jobBody, rating_workload: 6 }), (err) => err.details.some(d => d.includes('rating_workload')));
        assert.throws(() => P.validateJobReview({ ...jobBody, rating_overall: 3.5 }), /không hợp lệ/);
    });

    test('Trạng thái trải nghiệm: job review chỉ nhận WORKED / INTERNED', () => {
        assert.throws(() => P.validateJobReview({ ...jobBody, experience_type: 'APPLIED' }), /không hợp lệ/);
        assert.equal(P.validateCompanyReview({ ...companyBody, experience_type: 'interviewed' }).experience_type, 'INTERVIEWED');
    });

    test('Loại bỏ thẻ HTML / script (XSS) trước khi lưu', () => {
        const v = P.validateCompanyReview({ ...companyBody, title: '<script>alert(1)</script>Tốt lắm <b>nhé</b>' });
        assert.equal(v.title, 'alert(1)Tốt lắm nhé');
        assert.ok(!v.title.includes('<'));
    });

    test('Độ dài nội dung', () => {
        assert.throws(() => P.validateCompanyReview({ ...companyBody, pros: 'ngắn' }), (e) => e.details.some(d => d.startsWith('Ưu điểm')));
        assert.throws(() => P.validateJobReview({ ...jobBody, content: 'x'.repeat(3001) }), (e) => e.details.some(d => d.includes('tối đa')));
    });
});

describe('Đánh giá: phát hiện dấu hiệu vi phạm', () => {
    test('Nội dung sạch, điểm thấp KHÔNG bị gắn cờ', () => {
        assert.deepEqual(P.detectFlags(['Quản lý thiếu hỗ trợ, lương trả chậm 2 tuần.']), []);
    });
    test('Link, số điện thoại, email, ngôn từ thô tục, ký tự lặp, nội dung trùng', () => {
        assert.ok(P.detectFlags(['xem thêm tại https://abc.vn']).includes('CONTAINS_LINK'));
        assert.ok(P.detectFlags(['gọi 0901 234 567 nhé']).includes('CONTAINS_CONTACT'));
        assert.ok(P.detectFlags(['mail hr@abc.vn']).includes('CONTAINS_CONTACT'));
        assert.ok(P.detectFlags(['công ty vcl']).includes('PROFANITY'));
        assert.ok(P.detectFlags(['tệệệệệệệệệệ']).includes('REPEATED_CHARACTERS'));
        const text = 'Đây là nội dung đánh giá giống hệt lần trước';
        assert.ok(P.detectFlags([text], [text]).includes('DUPLICATE_CONTENT'));
    });
});

describe('Đánh giá: trạng thái kiểm duyệt', () => {
    test('Đã xác thực + sạch → công khai; chưa xác thực hoặc có cờ → chờ duyệt', () => {
        assert.equal(P.decideStatus({ verified: true, flags: [] }), 'PUBLISHED');
        assert.equal(P.decideStatus({ verified: false, flags: [] }), 'PENDING');
        assert.equal(P.decideStatus({ verified: true, flags: ['PROFANITY'] }), 'PENDING');
        assert.equal(P.decideStatus({ verified: true, flags: [], previousStatus: 'REJECTED' }), 'PENDING');
    });

    test('Chuyển trạng thái hợp lệ / không hợp lệ, bắt buộc lý do', () => {
        assert.equal(P.moderationTransition('APPROVE', 'PENDING').to, 'PUBLISHED');
        assert.throws(() => P.moderationTransition('REJECT', 'PENDING', ''), /lý do/);
        assert.equal(P.moderationTransition('HIDE', 'PUBLISHED', 'Lộ thông tin cá nhân').to, 'HIDDEN');
        assert.throws(() => P.moderationTransition('HIDE', 'PENDING', 'Lý do bất kỳ'), (e) => e.statusCode === 409);
        assert.throws(() => P.moderationTransition('DELETE', 'PENDING', 'x'), /không hợp lệ/);
    });
});

describe('Đánh giá: DTO công khai & tổng hợp', () => {
    test('Ẩn danh → không trả tên người viết; phản hồi bị ẩn không hiển thị', () => {
        const row = { id: 1, ...companyBody, is_anonymous: true, is_verified: true, reviewer_name: 'Nguyễn A', reviewer_id: 9,
            published_at: new Date(), edit_count: 0, reply_content: 'Cảm ơn bạn', reply_status: 'HIDDEN' };
        const dto = P.toPublicReview(row, 'company');
        assert.equal(dto.author_name, null);
        assert.equal(dto.reply, null);
        assert.ok(!('reviewer_id' in dto) && !('moderation_flags' in dto) && !('status' in dto));
        assert.equal(P.toPublicReview({ ...row, is_anonymous: false }, 'company').author_name, 'Nguyễn A');
    });

    test('Không có review → không tạo điểm mặc định', () => {
        const s = P.toSummary({ total: '0' }, P.COMPANY_CRITERIA);
        assert.equal(s.average_overall, null);
        assert.equal(s.criteria, null);
        assert.equal(s.total, 0);
    });

    test('Phân trang có giới hạn', () => {
        assert.deepEqual(P.parsePaging({ page: '3', limit: '500' }), { page: 3, limit: 50, offset: 100 });
        assert.deepEqual(P.parsePaging({ page: '-1' }), { page: 1, limit: 10, offset: 0 });
    });
});
