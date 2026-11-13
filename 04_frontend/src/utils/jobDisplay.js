// Định dạng thông tin tin tuyển dụng dùng chung cho thẻ việc làm và popup xem nhanh.
// Chỉ dùng dữ liệu thật của tin, không tự điền giá trị mặc định.

// Quy ước ngày trong tuần của backend/database: 1 = Chủ nhật, 2 = Thứ 2 … 7 = Thứ 7
export const DAY_SHORT = { 1: 'CN', 2: 'T2', 3: 'T3', 4: 'T4', 5: 'T5', 6: 'T6', 7: 'T7' };
// Thứ tự hiển thị: Thứ 2 → Chủ nhật
export const WEEK_ORDER = [2, 3, 4, 5, 6, 7, 1];
const weekRank = (d) => WEEK_ORDER.indexOf(d);
const DAY_MS = 86400000;

export const salaryAmount = (job) => Number(job?.salary || 0);

/** "35.000 đ/giờ", "18 triệu/tháng", "Thỏa thuận" (lương = 0) */
export function formatSalary(job) {
  const n = salaryAmount(job);
  if (!n) return 'Thỏa thuận';
  if (job.salary_type === 'HOURLY') return `${n.toLocaleString('vi-VN')} đ/giờ`;
  if (job.salary_type === 'DAILY') return `${n.toLocaleString('vi-VN')} đ/ngày`;
  if (n >= 1000000) return `${(Math.round((n / 1000000) * 10) / 10).toLocaleString('vi-VN')} triệu/tháng`;
  return `${n.toLocaleString('vi-VN')} đ/tháng`;
}

export function salaryCaption(job) {
  if (!salaryAmount(job)) return 'Trao đổi khi phỏng vấn';
  if (job.salary_type === 'HOURLY') return 'Lương theo giờ';
  if (job.salary_type === 'DAILY') return 'Lương theo ngày';
  return 'Lương theo tháng';
}

export const workTypeLabel = (job) => (job?.work_type === 'FULL_TIME' ? 'Full-time' : 'Part-time');

/** Phần đầu (số nhà/đường) + tỉnh/thành */
export function shortLocation(job) {
  const parts = String(job?.location || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!parts.length) return null;
  return parts.length > 1 ? `${parts[0]}, ${parts[parts.length - 1]}` : parts[0];
}

/** "Đăng hôm nay" / "Đăng 2 ngày trước" / ... ; null nếu không có ngày */
export function postedLabel(job) {
  if (!job?.created_at) return null; // new Date(null) = 1970, không phải lỗi
  const t = new Date(job.created_at);
  if (Number.isNaN(t.getTime())) return null;
  const days = Math.floor((Date.now() - t.getTime()) / DAY_MS);
  if (days <= 0) return 'Đăng hôm nay';
  if (days === 1) return 'Đăng hôm qua';
  if (days < 7) return `Đăng ${days} ngày trước`;
  if (days < 30) return `Đăng ${Math.floor(days / 7)} tuần trước`;
  return `Đăng ngày ${t.toLocaleDateString('vi-VN')}`;
}

/** Hạn nhận hồ sơ: ưu tiên application_deadline, sau đó deadline. null nếu tin không có hạn. */
export function deadlineInfo(job) {
  const raw = job?.application_deadline || job?.deadline;
  if (!raw) return null;
  const t = new Date(raw);
  if (Number.isNaN(t.getTime())) return null;
  // So sánh theo ngày: hạn là hết ngày đó
  const end = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59);
  const daysLeft = Math.ceil((end.getTime() - Date.now()) / DAY_MS) - 1;
  return { date: t.toLocaleDateString('vi-VN'), daysLeft, expired: end.getTime() < Date.now(), urgent: daysLeft >= 0 && daysLeft <= 3 };
}

/** Tin còn nhận hồ sơ? Trả về lý do nếu không. */
export function applyBlockReason(job) {
  if (!job) return 'Không tìm thấy tin tuyển dụng.';
  if (job.status && job.status !== 'OPEN') return 'Tin tuyển dụng này đã ngừng nhận hồ sơ.';
  const d = deadlineInfo(job);
  if (d?.expired) return `Tin tuyển dụng đã hết hạn nhận hồ sơ (${d.date}).`;
  return null;
}

/** Ca làm việc: gộp các ngày cùng khung giờ → ["T2, T4, T6 · 08:00–11:30", ...] */
export function formatSchedules(schedules) {
  if (!Array.isArray(schedules) || !schedules.length) return [];
  const byTime = new Map();
  for (const s of schedules) {
    const key = `${String(s.start_time).slice(0, 5)}–${String(s.end_time).slice(0, 5)}`;
    if (!byTime.has(key)) byTime.set(key, []);
    byTime.get(key).push(s.day_of_week);
  }
  return [...byTime.entries()].map(([time, days]) => {
    const sorted = [...new Set(days)].sort((a, b) => weekRank(a) - weekRank(b));
    const dayText = sorted.length === 7 ? 'Cả tuần'
      : sorted.join() === '2,3,4,5,6,7' ? 'T2 – T7'
      : sorted.join() === '2,3,4,5,6' ? 'T2 – T6'
      : sorted.map(d => DAY_SHORT[d]).join(', ');
    return `${dayText} · ${time}`;
  });
}

// Bộ lọc mức lương theo loại hình: Part-time tính theo giờ/tháng, Full-time theo tháng
export const SALARY_FILTERS = {
  PART_TIME: [
    { value: 'PT_H_UNDER_25K', label: 'Dưới 25.000đ/giờ', test: (s, t) => t === 'HOURLY' && s > 0 && s < 25000 },
    { value: 'PT_H_25_35K', label: '25.000 – 35.000đ/giờ', test: (s, t) => t === 'HOURLY' && s >= 25000 && s <= 35000 },
    { value: 'PT_H_ABOVE_35K', label: 'Trên 35.000đ/giờ', test: (s, t) => t === 'HOURLY' && s > 35000 },
    { value: 'PT_M_UNDER_4M', label: 'Lương tháng dưới 4 triệu', test: (s, t) => t !== 'HOURLY' && s > 0 && s < 4000000 },
    { value: 'PT_M_ABOVE_4M', label: 'Lương tháng từ 4 triệu', test: (s, t) => t !== 'HOURLY' && s >= 4000000 },
  ],
  FULL_TIME: [
    { value: 'FT_UNDER_8M', label: 'Dưới 8 triệu/tháng', test: (s) => s > 0 && s < 8000000 },
    { value: 'FT_8_12M', label: '8 – 12 triệu/tháng', test: (s) => s >= 8000000 && s <= 12000000 },
    { value: 'FT_12_20M', label: '12 – 20 triệu/tháng', test: (s) => s > 12000000 && s <= 20000000 },
    { value: 'FT_ABOVE_20M', label: 'Trên 20 triệu/tháng', test: (s) => s > 20000000 },
  ],
};
const WORK_TYPE_SHORT = { PART_TIME: 'Part-time', FULL_TIME: 'Full-time' };

/** Lựa chọn mức lương hiển thị theo loại hình đang lọc ('' = cả hai, có ghi nhóm). */
export function salaryOptionsFor(workType) {
  const groups = workType ? [workType] : ['PART_TIME', 'FULL_TIME'];
  const opts = groups.flatMap(g => SALARY_FILTERS[g].map(o => ({
    value: o.value,
    label: workType ? o.label : `${WORK_TYPE_SHORT[g]} · ${o.label}`,
  })));
  return [{ value: '', label: 'Tất cả mức lương' }, ...opts, { value: 'NEGOTIABLE', label: 'Thỏa thuận' }];
}

/** Tin có khớp lựa chọn mức lương (giá trị từ salaryOptionsFor) không. */
export function matchesSalaryFilter(job, value) {
  if (!value) return true;
  const sal = Number(job?.salary) || 0;
  if (value === 'NEGOTIABLE') return sal === 0;
  for (const [group, options] of Object.entries(SALARY_FILTERS)) {
    const opt = options.find(o => o.value === value);
    if (opt) return job.work_type === group && opt.test(sal, job.salary_type);
  }
  return true;
}
