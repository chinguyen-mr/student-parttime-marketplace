/**
 * Centralized formatting utilities and unified Status Badge mappings for JobNest.
 * Enforces Soft Lavender (#7565A8) and Peach (#F4B99D) design standards.
 */

export const STATUS_MAP = {
  // Applications & Moderation
  PENDING: { label: 'Chờ duyệt', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' },
  APPLIED: { label: 'Chờ duyệt', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' },
  ACCEPTED: { label: 'Đã duyệt', color: '#047857', bg: '#D1FAE5', border: '#A7F3D0' },
  APPROVED: { label: 'Đã duyệt', color: '#047857', bg: '#D1FAE5', border: '#A7F3D0' },
  REJECTED: { label: 'Bị từ chối', color: '#B91C1C', bg: '#FEE2E2', border: '#FECACA' },
  SHORTLISTED: { label: 'Đã vào danh sách rút gọn', color: '#1D4ED8', bg: '#DBEAFE', border: '#BFDBFE' },
  WITHDRAWN: { label: 'Đã rút hồ sơ', color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB' },
  REVIEWING: { label: 'Đang xem xét', color: '#6D28D9', bg: '#EDE9FE', border: '#DDD6FE' },
  
  // Work Assignments
  NOT_STARTED: { label: 'Chưa bắt đầu', color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB' },
  IN_PROGRESS: { label: 'Đang thực hiện', color: '#1D4ED8', bg: '#DBEAFE', border: '#BFDBFE' },
  COMPLETED: { label: 'Đã hoàn thành', color: '#047857', bg: '#D1FAE5', border: '#A7F3D0' },
  CANCELLED: { label: 'Đã hủy', color: '#B91C1C', bg: '#FEE2E2', border: '#FECACA' },

  // Jobs
  PUBLISHED: { label: 'Đang mở', color: '#047857', bg: '#D1FAE5', border: '#A7F3D0' },
  OPEN: { label: 'Đang mở', color: '#047857', bg: '#D1FAE5', border: '#A7F3D0' },
  DRAFT: { label: 'Bản nháp', color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB' },
  CLOSED: { label: 'Đã đóng', color: '#B91C1C', bg: '#FEE2E2', border: '#FECACA' },
  EXPIRED: { label: 'Hết hạn', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' },

  // Job Types (chỉ Part-time và Full-time)
  PART_TIME: { label: 'Part-time', color: '#7565A8', bg: '#F1EEF8', border: '#D8B4FE' },
  FULL_TIME: { label: 'Full-time', color: '#B45309', bg: '#FEF7EE', border: '#F9DAA8' },

  // User Accounts
  ACTIVE: { label: 'Hoạt động', color: '#047857', bg: '#D1FAE5', border: '#A7F3D0' },
  LOCKED: { label: 'Đã khóa', color: '#B91C1C', bg: '#FEE2E2', border: '#FECACA' },
  BANNED: { label: 'Đã khóa', color: '#B91C1C', bg: '#FEE2E2', border: '#FECACA' },
  UNVERIFIED: { label: 'Chờ xác thực', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' },
  VERIFIED: { label: 'Đã xác thực', color: '#047857', bg: '#D1FAE5', border: '#A7F3D0' },
};

/**
 * Returns label, color, background and border for any system enum status.
 */
export function getStatusInfo(status) {
  if (!status) return { label: 'Không xác định', color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB' };
  const key = String(status).toUpperCase().trim();
  if (STATUS_MAP[key]) return STATUS_MAP[key];

  // Fallback for human-readable string without enum
  return {
    label: status,
    color: '#4B5563',
    bg: '#F3F4F6',
    border: '#E5E7EB'
  };
}

/**
 * Formats a monetary amount cleanly without ugly .00 decimals.
 * Examples:
 *   formatMoney(3500000.00, 'dự án') => "3.500.000 đ/dự án"
 *   formatMoney(45000.00, 'giờ') => "45.000 đ/giờ"
 *   formatMoney("3500000.00 VNĐ") => "3.500.000 đ"
 */
export function formatMoney(amount, unit = '') {
  if (amount === undefined || amount === null || amount === '') return 'Thỏa thuận';
  
  if (typeof amount === 'string' && (amount.includes('Thỏa thuận') || amount.includes('thỏa thuận'))) {
    return 'Thỏa thuận';
  }

  // Clean raw string numbers (remove non-digits except dot)
  const cleaned = String(amount).replace(/,/g, '').trim();
  const numeric = parseFloat(cleaned);

  if (isNaN(numeric) || numeric <= 0) return 'Thỏa thuận';

  const formatted = Math.round(numeric).toLocaleString('vi-VN');
  
  let unitSuffix = '';
  if (unit) {
    const cleanUnit = unit.replace(/^\/?(VNĐ|VND|\đ)?\/?/i, '').trim();
    if (cleanUnit) {
      unitSuffix = cleanUnit.startsWith('/') ? cleanUnit : `/${cleanUnit}`;
    }
  }

  return `${formatted} đ${unitSuffix}`;
}

