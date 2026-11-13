// Chuyển một dòng nhật ký quản trị (mã nội bộ: BAN_USER, USER #128, metadata JSON) thành câu tiếng Việt dễ hiểu.
// Không bao giờ hiển thị mã hành động, ID hay tên trường kỹ thuật ra giao diện.

// tone: good (xanh) | bad (đỏ) | warn (cam) | neutral (xám)
const ACTIONS = {
  APPROVE_JOB: ['Duyệt tin tuyển dụng', 'good'],
  REJECT_JOB: ['Từ chối tin tuyển dụng', 'bad'],
  REMOVE_JOB: ['Gỡ tin tuyển dụng', 'bad'],
  BAN_USER: ['Khóa tài khoản', 'bad'],
  UNBAN_USER: ['Mở khóa tài khoản', 'good'],
  VERIFY_EMPLOYER: ['Xác nhận email & SĐT nhà tuyển dụng', 'good'],
  UNVERIFY_EMPLOYER: ['Hủy xác nhận email & SĐT nhà tuyển dụng', 'warn'],
  RECORD_VIOLATION: ['Ghi nhận vi phạm', 'warn'],
  RESOLVE_REPORT: ['Xử lý báo cáo vi phạm', 'neutral'],
  CREATE_CATEGORY: ['Thêm danh mục ngành nghề', 'neutral'],
  UPDATE_CATEGORY: ['Sửa danh mục ngành nghề', 'neutral'],
  DELETE_CATEGORY: ['Xóa danh mục ngành nghề', 'warn'],
  LEGAL_VERIFICATION_VERIFIED: ['Xác minh pháp lý doanh nghiệp', 'good'],
  LEGAL_VERIFICATION_NEEDS_INFO: ['Yêu cầu doanh nghiệp bổ sung hồ sơ pháp lý', 'warn'],
  LEGAL_VERIFICATION_REJECTED: ['Từ chối xác minh pháp lý doanh nghiệp', 'bad'],
  SYSTEM_INIT: ['Khởi tạo hệ thống quản trị', 'neutral'],
};

// Kiểm duyệt đánh giá: mã dạng REVIEW_<thao tác>
const REVIEW_ACTIONS = {
  APPROVE: ['Duyệt đánh giá', 'good'],
  REJECT: ['Từ chối đánh giá', 'bad'],
  HIDE: ['Ẩn đánh giá', 'warn'],
  REMOVE: ['Gỡ đánh giá', 'bad'],
  RESTORE: ['Khôi phục đánh giá', 'good'],
  HIDE_REPLY: ['Ẩn phản hồi của doanh nghiệp', 'warn'],
  SHOW_REPLY: ['Hiện lại phản hồi của doanh nghiệp', 'good'],
  REPORT_DISMISS: ['Bác bỏ báo cáo về đánh giá', 'neutral'],
  APPEAL_DENY: ['Từ chối khiếu nại về đánh giá', 'bad'],
};

const TARGET_TYPES = {
  USER: 'Tài khoản', JOB: 'Tin tuyển dụng', CATEGORY: 'Danh mục', REPORT: 'Báo cáo',
  COMPANY_REVIEW: 'Đánh giá doanh nghiệp', JOB_REVIEW: 'Đánh giá công việc', SYSTEM: 'Hệ thống',
};

const REPORT_MEASURES = { WARNING: 'Cảnh cáo', BAN_USER: 'Khóa tài khoản', REMOVE_JOB: 'Gỡ tin', DISMISS: 'Bác bỏ báo cáo' };
const STATUS_WORDS = {
  PUBLISHED: 'Công khai', PENDING: 'Chờ duyệt', REJECTED: 'Từ chối', HIDDEN: 'Đã ẩn', REMOVED: 'Đã gỡ',
  APPROVED: 'Đã duyệt', ACTIVE: 'Hoạt động', BANNED: 'Bị khóa',
};

const text = (v) => (v === null || v === undefined ? '' : String(v).trim());

/** Mô tả 1 dòng nhật ký: { label, tone, target, detail }. */
export function describeAdminLog(log = {}) {
  const code = String(log.action || '');
  let [label, tone] = ACTIONS[code] || [];
  if (!label && code.startsWith('REVIEW_')) [label, tone] = REVIEW_ACTIONS[code.slice(7)] || ['Kiểm duyệt đánh giá', 'neutral'];
  if (!label) [label, tone] = ['Thao tác quản trị khác', 'neutral'];

  let meta = log.metadata;
  if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch { meta = { message: meta }; } }
  meta = meta && typeof meta === 'object' ? meta : {};

  const typeLabel = TARGET_TYPES[log.target_type] || '';
  const name = text(log.target_label) || text(meta.title) || text(meta.name);
  const target = name ? (typeLabel ? `${typeLabel}: ${name}` : name) : typeLabel;

  const parts = [];
  if (meta.action && REPORT_MEASURES[meta.action]) parts.push(`Biện pháp: ${REPORT_MEASURES[meta.action]}`);
  if (text(meta.violation_type)) parts.push(`Loại vi phạm: ${text(meta.violation_type)}${meta.newCount ? ` (lần thứ ${meta.newCount})` : ''}`);
  if (meta.from && meta.to && STATUS_WORDS[meta.from] && STATUS_WORDS[meta.to]) parts.push(`${STATUS_WORDS[meta.from]} → ${STATUS_WORDS[meta.to]}`);
  if (text(meta.reason)) parts.push(`Lý do: ${text(meta.reason)}`);
  if (text(meta.note)) parts.push(`Ghi chú: ${text(meta.note)}`);
  if (text(meta.message)) parts.push(text(meta.message));

  return { label, tone, target, detail: parts.join(' · ') };
}

export const TONE_STYLE = {
  good: { background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC' },
  bad: { background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5' },
  warn: { background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' },
  neutral: { background: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1' },
};

/** Lựa chọn cho bộ lọc (giá trị là mã gửi lên API, chỉ hiển thị nhãn tiếng Việt). */
export const ADMIN_LOG_FILTERS = [
  ['APPROVE_JOB', 'Duyệt tin tuyển dụng'], ['REJECT_JOB', 'Từ chối tin tuyển dụng'],
  ['BAN_USER', 'Khóa tài khoản'], ['UNBAN_USER', 'Mở khóa tài khoản'],
  ['VERIFY_EMPLOYER', 'Xác nhận email & SĐT nhà tuyển dụng'], ['UNVERIFY_EMPLOYER', 'Hủy xác nhận nhà tuyển dụng'],
  ['LEGAL_VERIFICATION_VERIFIED', 'Xác minh pháp lý doanh nghiệp'], ['RECORD_VIOLATION', 'Ghi nhận vi phạm'],
  ['RESOLVE_REPORT', 'Xử lý báo cáo vi phạm'], ['CREATE_CATEGORY', 'Thêm danh mục'], ['UPDATE_CATEGORY', 'Sửa danh mục'],
  ['DELETE_CATEGORY', 'Xóa danh mục'],
];
