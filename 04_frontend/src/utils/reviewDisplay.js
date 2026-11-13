// Nhãn & tiện ích hiển thị cho đánh giá doanh nghiệp / công việc (đồng bộ với backend experience-review.policy.js)

export const COMPANY_CRITERIA = [
  ['rating_environment', 'Môi trường làm việc'],
  ['rating_salary_benefits', 'Lương & phúc lợi'],
  ['rating_management', 'Quản lý & hỗ trợ'],
  ['rating_culture', 'Văn hóa doanh nghiệp'],
  ['rating_learning', 'Cơ hội học hỏi & phát triển'],
  ['rating_recruitment', 'Minh bạch tuyển dụng'],
  ['rating_overall', 'Mức độ hài lòng chung'],
];

export const JOB_CRITERIA = [
  ['rating_description_accuracy', 'Mô tả công việc đúng thực tế'],
  ['rating_salary_accuracy', 'Lương đúng thỏa thuận'],
  ['rating_schedule', 'Lịch làm việc đúng như cam kết'],
  ['rating_workload', 'Khối lượng công việc hợp lý'],
  ['rating_manager_support', 'Hỗ trợ từ quản lý'],
  ['rating_overall', 'Trải nghiệm công việc chung'],
];

export const EXPERIENCE_LABEL = {
  WORKED: 'Đã làm việc',
  INTERNED: 'Đã thực tập',
  INTERVIEWED: 'Đã phỏng vấn',
  APPLIED: 'Đã ứng tuyển',
};

export const COMPANY_EXPERIENCES = ['WORKED', 'INTERNED', 'INTERVIEWED', 'APPLIED'];
export const JOB_EXPERIENCES = ['WORKED', 'INTERNED'];

export const STATUS_LABEL = {
  PENDING: ['Đang chờ kiểm duyệt', '#B45309', '#FEF3C7'],
  PUBLISHED: ['Đang hiển thị công khai', '#047857', '#ECFDF5'],
  REJECTED: ['Không được duyệt', '#B91C1C', '#FEF2F2'],
  HIDDEN: ['Đã bị ẩn', '#475569', '#F1F5F9'],
  REMOVED: ['Đã bị gỡ', '#B91C1C', '#FEF2F2'],
};

export const REPORT_REASONS = [
  ['SPAM', 'Spam / quảng cáo / nội dung không liên quan'],
  ['OFFENSIVE', 'Ngôn từ xúc phạm, thù địch'],
  ['FALSE_INFO', 'Thông tin sai sự thật'],
  ['PERSONAL_INFO', 'Lộ thông tin cá nhân'],
  ['CONFLICT_OF_INTEREST', 'Người viết có xung đột lợi ích'],
  ['OTHER', 'Lý do khác'],
];

export const FLAG_LABEL = {
  CONTAINS_LINK: 'Chứa đường dẫn',
  CONTAINS_CONTACT: 'Chứa SĐT / email',
  PROFANITY: 'Ngôn từ thô tục',
  REPEATED_CHARACTERS: 'Ký tự lặp bất thường',
  DUPLICATE_CONTENT: 'Trùng nội dung đã gửi',
};

// Lý do không thể viết đánh giá → câu thông báo cho người dùng
export const ELIGIBILITY_MESSAGE = {
  LOGIN_REQUIRED: 'Đăng nhập bằng tài khoản ứng viên để viết đánh giá.',
  ROLE_NOT_ALLOWED: 'Chỉ tài khoản ứng viên mới có thể viết đánh giá.',
  SELF_REVIEW: 'Bạn không thể đánh giá doanh nghiệp của chính mình.',
  ALREADY_REVIEWED: 'Bạn đã gửi đánh giá.',
  NO_WORK_EXPERIENCE: 'Chỉ ứng viên đã được nhận và làm công việc này mới có thể đánh giá công việc.',
};

export const formatRating = (n) => (n === null || n === undefined || Number.isNaN(Number(n)) ? '—' : Number(n).toFixed(1).replace('.', ','));

export function reviewDate(d) {
  if (!d) return '';
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? '' : t.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Tỉ lệ (0–100) cho thanh phân phối số sao
export function distributionPercent(distribution, star, total) {
  if (!total) return 0;
  return Math.round(((distribution?.[star] || 0) / total) * 100);
}

// Tạo form rỗng (không điền điểm mặc định — người dùng phải tự chấm từng tiêu chí)
export function emptyReviewForm(type, existing = null) {
  const criteria = type === 'company' ? COMPANY_CRITERIA : JOB_CRITERIA;
  const form = {
    experience_type: existing?.experience_type || '',
    is_anonymous: existing ? existing.is_anonymous : true,
  };
  for (const [key] of criteria) form[key] = existing?.[key] || 0;
  if (type === 'company') {
    form.title = existing?.title || '';
    form.pros = existing?.pros || '';
    form.cons = existing?.cons || '';
    form.advice = existing?.advice || '';
  } else {
    form.content = existing?.content || '';
  }
  return form;
}

// Kiểm tra phía client (backend vẫn kiểm tra lại) — trả danh sách lỗi
export function validateReviewForm(type, form) {
  const errors = [];
  const criteria = type === 'company' ? COMPANY_CRITERIA : JOB_CRITERIA;
  const experiences = type === 'company' ? COMPANY_EXPERIENCES : JOB_EXPERIENCES;
  if (!experiences.includes(form.experience_type)) errors.push('Chọn trạng thái trải nghiệm');
  const missing = criteria.filter(([k]) => !(form[k] >= 1 && form[k] <= 5)).map(([, label]) => label);
  if (missing.length) errors.push(`Chưa chấm điểm: ${missing.join(', ')}`);
  const len = (s) => String(s || '').trim().length;
  if (type === 'company') {
    if (len(form.title) < 5 || len(form.title) > 120) errors.push('Tiêu đề cần 5–120 ký tự');
    if (len(form.pros) < 20) errors.push('Ưu điểm cần tối thiểu 20 ký tự');
    if (len(form.cons) < 20) errors.push('Hạn chế cần tối thiểu 20 ký tự');
    if (len(form.advice) > 1000) errors.push('Lời khuyên tối đa 1000 ký tự');
  } else if (len(form.content) < 30 || len(form.content) > 3000) {
    errors.push('Nội dung nhận xét cần 30–3000 ký tự');
  }
  return errors;
}
