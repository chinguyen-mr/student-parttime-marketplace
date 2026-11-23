// Bấm thông báo → mở đúng mục. target_type do backend ghi khi tạo thông báo.

/** Thông báo ADMIN_TASK (backend: notifications/admin-notify.js) → mục trong trang Admin. */
export const ADMIN_TASK_TABS = {
  EMPLOYER_VERIFICATION: 'employer_verification',
  JOB: 'moderation',
  REPORT: 'reports',
  USER_APPEAL: 'appeals',
  REVIEW_REPORT: 'reviews',
  COMPANY_REVIEW: 'reviews',
  JOB_REVIEW: 'reviews',
};

const EMPLOYER_TABS = {
  COMPANY_REVIEW: 'reviews',
  JOB_REVIEW: 'reviews',
  APPLICATION: 'applicants',
  PROPOSAL: 'applicants',
  ASSIGNMENT: 'assignments',
  JOB: 'jobs',
  EMPLOYER: 'verification', // kết quả xét duyệt xác minh doanh nghiệp
  USER: 'settings', // cảnh cáo vi phạm, khóa/mở khóa, kết quả khiếu nại tài khoản
};

/** Thông báo của nhà tuyển dụng → mục trong EmployerPortal. */
export function employerTabForNotification(item) {
  return EMPLOYER_TABS[item?.target_type] || 'notifications';
}
