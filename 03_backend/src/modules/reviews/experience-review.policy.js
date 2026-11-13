// Chính sách đánh giá doanh nghiệp / công việc — hàm thuần (không truy cập DB) để dễ kiểm thử.
const { AppError } = require('../../utils/app-error');

const COMPANY_CRITERIA = [
    'rating_environment', 'rating_salary_benefits', 'rating_management',
    'rating_culture', 'rating_learning', 'rating_recruitment', 'rating_overall',
];
const JOB_CRITERIA = [
    'rating_description_accuracy', 'rating_salary_accuracy', 'rating_schedule',
    'rating_workload', 'rating_manager_support', 'rating_overall',
];
const COMPANY_EXPERIENCES = ['WORKED', 'INTERNED', 'INTERVIEWED', 'APPLIED'];
const JOB_EXPERIENCES = ['WORKED', 'INTERNED'];
const REPORT_REASONS = ['SPAM', 'OFFENSIVE', 'FALSE_INFO', 'PERSONAL_INFO', 'CONFLICT_OF_INTEREST', 'OTHER'];
const STATUSES = ['PENDING', 'PUBLISHED', 'REJECTED', 'HIDDEN', 'REMOVED'];

const LIMITS = {
    title: [5, 120],
    pros: [20, 2000],
    cons: [20, 2000],
    advice: [0, 1000],
    content: [30, 3000],
    reply: [10, 2000],
    reportDescription: [0, 1000],
    reason: [5, 500],
};
// Chống spam theo tần suất (đếm trong DB, cửa sổ 24 giờ)
const RATE = { reviewsPerDay: 5, reportsPerDay: 10, maxEdits: 5 };

const PROFANITY = ['địt', 'đụ ', 'đéo', 'lồn', 'cặc', 'đcm', 'dcm', 'đmm', 'vcl', 'vkl', 'clgt', 'óc chó', 'súc vật', 'mẹ mày', 'con đĩ'];

// Bỏ thẻ HTML, ký tự điều khiển; chuẩn hóa khoảng trắng. React vẫn escape khi hiển thị — đây là lớp bảo vệ thứ hai.
function sanitizeText(value) {
    if (value === undefined || value === null) return '';
    return String(value)
        .replace(/<[^>]*>/g, '')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function checkLength(errors, label, text, [min, max], required = true) {
    if (!text) {
        if (required) errors.push(`${label} là bắt buộc`);
        return;
    }
    if (text.length < min) errors.push(`${label} cần tối thiểu ${min} ký tự`);
    if (text.length > max) errors.push(`${label} tối đa ${max} ký tự`);
}

function readRatings(body, criteria, errors) {
    const out = {};
    for (const key of criteria) {
        const raw = body[key];
        const n = Number(raw);
        if (raw === undefined || raw === null || raw === '' || !Number.isInteger(n) || n < 1 || n > 5) {
            errors.push(`Thiếu hoặc sai điểm tiêu chí: ${key} (1–5 sao)`);
        } else {
            out[key] = n;
        }
    }
    return out;
}

function fail(errors) {
    if (errors.length) throw new AppError('Dữ liệu đánh giá không hợp lệ', 400, errors);
}

function validateCompanyReview(body = {}) {
    const errors = [];
    const experience_type = String(body.experience_type || '').toUpperCase();
    if (!COMPANY_EXPERIENCES.includes(experience_type)) errors.push('Trạng thái trải nghiệm không hợp lệ');
    const ratings = readRatings(body, COMPANY_CRITERIA, errors);
    const title = sanitizeText(body.title);
    const pros = sanitizeText(body.pros);
    const cons = sanitizeText(body.cons);
    const advice = sanitizeText(body.advice);
    checkLength(errors, 'Tiêu đề', title, LIMITS.title);
    checkLength(errors, 'Ưu điểm', pros, LIMITS.pros);
    checkLength(errors, 'Hạn chế', cons, LIMITS.cons);
    checkLength(errors, 'Lời khuyên', advice, LIMITS.advice, false);
    fail(errors);
    return {
        experience_type, ...ratings, title, pros, cons, advice: advice || null,
        is_anonymous: body.is_anonymous === undefined ? true : body.is_anonymous === true || body.is_anonymous === 'true',
    };
}

function validateJobReview(body = {}) {
    const errors = [];
    const experience_type = String(body.experience_type || '').toUpperCase();
    if (!JOB_EXPERIENCES.includes(experience_type)) errors.push('Trạng thái trải nghiệm không hợp lệ (đã làm việc hoặc thực tập)');
    const ratings = readRatings(body, JOB_CRITERIA, errors);
    const content = sanitizeText(body.content);
    checkLength(errors, 'Nội dung nhận xét', content, LIMITS.content);
    fail(errors);
    return {
        experience_type, ...ratings, content,
        is_anonymous: body.is_anonymous === undefined ? true : body.is_anonymous === true || body.is_anonymous === 'true',
    };
}

// Dấu hiệu cần kiểm duyệt thủ công. Không tự gỡ — chỉ chuyển sang chờ duyệt.
// Điểm thấp KHÔNG phải là dấu hiệu vi phạm.
function detectFlags(texts, previousTexts = []) {
    const joined = texts.filter(Boolean).join('\n');
    const lower = joined.toLowerCase();
    const flags = [];
    if (/(https?:\/\/|www\.)\S+/i.test(joined)) flags.push('CONTAINS_LINK');
    if (/(?:\+?84|0)(?:[\s.-]?\d){8,10}\b/.test(joined) || /[\w.+-]+@[\w-]+\.[\w.]+/.test(joined)) flags.push('CONTAINS_CONTACT');
    if (PROFANITY.some(w => lower.includes(w))) flags.push('PROFANITY');
    if (/(.)\1{7,}/u.test(joined)) flags.push('REPEATED_CHARACTERS');
    const norm = (t) => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const mine = texts.map(norm).filter(t => t.length >= 20);
    if (previousTexts.map(norm).some(p => p.length >= 20 && mine.includes(p))) flags.push('DUPLICATE_CONTENT');
    return flags;
}

// Trạng thái sau khi gửi/sửa:
// - Đã xác thực + không có dấu hiệu vi phạm → công khai ngay (vẫn có thể bị báo cáo).
// - Chưa xác thực hoặc có dấu hiệu → chờ quản trị viên duyệt.
// - Review đã bị từ chối khi sửa lại → luôn chờ duyệt lại.
function decideStatus({ verified, flags, previousStatus = null }) {
    if (previousStatus === 'REJECTED') return 'PENDING';
    return verified && flags.length === 0 ? 'PUBLISHED' : 'PENDING';
}

const EDITABLE_STATUSES = ['PENDING', 'PUBLISHED', 'REJECTED'];
const APPEALABLE_STATUSES = ['REJECTED', 'HIDDEN', 'REMOVED'];

// Hành động kiểm duyệt của Admin: trạng thái hợp lệ trước → trạng thái sau, có bắt buộc lý do không
const MODERATION_ACTIONS = {
    APPROVE: { from: ['PENDING'], to: 'PUBLISHED', reasonRequired: false },
    REJECT: { from: ['PENDING'], to: 'REJECTED', reasonRequired: true },
    HIDE: { from: ['PUBLISHED'], to: 'HIDDEN', reasonRequired: true },
    RESTORE: { from: ['HIDDEN', 'REJECTED', 'REMOVED'], to: 'PUBLISHED', reasonRequired: true },
    REMOVE: { from: ['PENDING', 'PUBLISHED', 'HIDDEN', 'REJECTED'], to: 'REMOVED', reasonRequired: true },
};

function moderationTransition(action, currentStatus, reason) {
    const rule = MODERATION_ACTIONS[action];
    if (!rule) throw new AppError('Hành động kiểm duyệt không hợp lệ', 400);
    if (!rule.from.includes(currentStatus)) {
        throw new AppError(`Không thể thực hiện "${action}" khi đánh giá đang ở trạng thái ${currentStatus}`, 409);
    }
    const cleanReason = sanitizeText(reason);
    if (rule.reasonRequired && cleanReason.length < LIMITS.reason[0]) {
        throw new AppError('Vui lòng nhập lý do (tối thiểu 5 ký tự)', 400);
    }
    if (cleanReason.length > LIMITS.reason[1]) throw new AppError('Lý do tối đa 500 ký tự', 400);
    return { to: rule.to, reason: cleanReason || null };
}

function avg(n) {
    return n === null || n === undefined ? null : Math.round(Number(n) * 10) / 10;
}

// DTO công khai: ẩn danh → không trả bất kỳ thông tin định danh nào của người viết.
function toPublicReview(row, type) {
    const base = {
        id: row.id,
        type,
        experience_type: row.experience_type,
        rating_overall: row.rating_overall,
        is_verified: row.is_verified === true,
        is_anonymous: row.is_anonymous === true,
        author_name: row.is_anonymous ? null : (row.reviewer_name || null),
        published_at: row.published_at,
        edited: Boolean(row.edit_count > 0),
        reply: row.reply_content && row.reply_status === 'VISIBLE'
            ? { content: row.reply_content, updated_at: row.reply_updated_at }
            : null,
    };
    if (type === 'company') {
        for (const k of COMPANY_CRITERIA) base[k] = row[k];
        return { ...base, title: row.title, pros: row.pros, cons: row.cons, advice: row.advice || null };
    }
    for (const k of JOB_CRITERIA) base[k] = row[k];
    return { ...base, job_id: row.job_id, job_title: row.job_title || null, content: row.content };
}

// Tổng hợp điểm từ một hàng kết quả SQL (đã lọc PUBLISHED). Không có review → null, không tạo điểm giả.
function toSummary(row, criteria) {
    const total = Number(row?.total || 0);
    if (!total) return { total: 0, average_overall: null, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, criteria: null, verified_count: 0 };
    const criteriaOut = {};
    for (const k of criteria) criteriaOut[k] = avg(row[`avg_${k}`]);
    return {
        total,
        average_overall: avg(row.avg_rating_overall),
        distribution: { 1: Number(row.d1), 2: Number(row.d2), 3: Number(row.d3), 4: Number(row.d4), 5: Number(row.d5) },
        criteria: criteriaOut,
        verified_count: Number(row.verified_count || 0),
    };
}

function parsePaging(query = {}, defLimit = 10, maxLimit = 50) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defLimit));
    return { page, limit, offset: (page - 1) * limit };
}

function parseReviewType(value) {
    if (value === 'company' || value === 'job') return value;
    throw new AppError('Loại đánh giá không hợp lệ (company | job)', 400);
}

module.exports = {
    COMPANY_CRITERIA, JOB_CRITERIA, COMPANY_EXPERIENCES, JOB_EXPERIENCES, REPORT_REASONS, STATUSES,
    LIMITS, RATE, EDITABLE_STATUSES, APPEALABLE_STATUSES, MODERATION_ACTIONS,
    sanitizeText, validateCompanyReview, validateJobReview, detectFlags, decideStatus,
    moderationTransition, toPublicReview, toSummary, parsePaging, parseReviewType,
};
