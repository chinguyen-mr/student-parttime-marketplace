// Dùng chung cho các phân vùng Hồ sơ doanh nghiệp (kiểu dáng + gọi API + kiểm tra dữ liệu).
import { API_BASE } from '../../config/api';

export const COMPANY_TYPES = ['Công ty TNHH', 'Công ty Cổ phần', 'Doanh nghiệp tư nhân', 'Doanh nghiệp có vốn đầu tư nước ngoài (FDI)',
  'Cơ quan nhà nước / Tổ chức phi lợi nhuận', 'Hộ kinh doanh cá thể', 'Khác'];
export const COMPANY_SIZES = ['Dưới 10 nhân viên', '10 – 49 nhân viên', '50 – 199 nhân viên', '200 – 499 nhân viên', '500 – 999 nhân viên', 'Trên 1.000 nhân viên'];
export const INDUSTRIES = ['Công nghệ thông tin', 'Giáo dục & Đào tạo', 'Nhà hàng – Khách sạn – F&B', 'Bán lẻ & Thương mại', 'Marketing & Truyền thông',
  'Logistics & Vận tải', 'Tài chính – Ngân hàng', 'Sản xuất', 'Dịch vụ'];
export const SOCIALS = [
  { key: 'facebook', label: 'Facebook' }, { key: 'linkedin', label: 'LinkedIn' }, { key: 'tiktok', label: 'TikTok' },
  { key: 'instagram', label: 'Instagram' }, { key: 'youtube', label: 'YouTube' },
];
export const ABOUT_FIELDS = [
  ['bio', 'Giới thiệu doanh nghiệp', 'Doanh nghiệp làm gì, phục vụ ai, điểm khác biệt.'],
  ['mission', 'Sứ mệnh & tầm nhìn'],
  ['core_values', 'Giá trị cốt lõi'],
  ['products_services', 'Sản phẩm & dịch vụ'],
  ['achievements', 'Thành tựu nổi bật'],
  ['work_environment_desc', 'Môi trường làm việc', 'Không gian, công cụ, cách làm việc hằng ngày.'],
  ['internal_culture', 'Văn hóa nội bộ', 'Hoạt động gắn kết, truyền thống, cách đội ngũ đối xử với nhau.'],
];
// Chính sách nhân sự — ưu tiên thông tin sinh viên quan tâm. Key "benefits"/"hr_policies" là cột riêng, còn lại nằm trong hr_policy_details.
export const POLICY_FIELDS = [
  ['internship', 'Chính sách thực tập', 'Phụ cấp, xác nhận thực tập, cơ hội ở lại làm chính thức.'],
  ['training', 'Đào tạo nhân viên mới', 'Thời gian hướng dẫn, người kèm cặp.'],
  ['student_support', 'Hỗ trợ sinh viên', 'Đổi ca mùa thi, hỗ trợ đi lại, ăn ca…'],
  ['flexible_schedule', 'Lịch làm việc linh hoạt', 'Cách đăng ký ca, số ca tối thiểu/tuần.'],
  ['part_time', 'Chính sách Part-time'],
  ['full_time', 'Chính sách Full-time'],
  ['benefits', 'Phúc lợi'],
  ['career_growth', 'Cơ hội phát triển nghề nghiệp', 'Lộ trình thăng tiến, đánh giá định kỳ.'],
  ['hr_policies', 'Chính sách khác'],
];
export const POLICY_DETAIL_KEYS = ['internship', 'training', 'student_support', 'flexible_schedule', 'part_time', 'full_time', 'career_growth'];
export const OFFICE_MAX = 8;
export const BRANCHES_MAX = 20;

export const inVietnam = (lat, lng) => lat >= 8 && lat <= 24 && lng >= 102 && lng <= 110;
const isHttpUrl = (v) => /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(v);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => /^(\+84|0)\d{8,10}$/.test(String(v).replace(/[\s.-]/g, ''));

/** Gọi API JSON có token; ném lỗi kèm thông báo của server. */
export async function apiJson(token, path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${token}` },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { /* phản hồi không phải JSON */ }
  if (!res.ok || data.success === false) {
    const err = new Error(data.message || `Yêu cầu thất bại (${res.status}).`);
    err.details = Array.isArray(data.details) ? data.details : null;
    err.status = res.status;
    throw err;
  }
  return data.data;
}

/** Tải file riêng tư (cần token) → object URL. Người gọi phải revoke khi không dùng nữa. */
export async function fetchPrivateBlobUrl(token, path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Không tải được file.');
  return URL.createObjectURL(await res.blob());
}

export const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => reject(new Error('Không đọc được file.'));
  r.readAsDataURL(file);
});

const s = (v) => (v === null || v === undefined ? '' : String(v));
export const emptyBranch = () => ({ name: '', address: '', phone: '', email: '', latitude: '', longitude: '', is_active: true });

/** Dữ liệu /profile/me → state form. Chi nhánh dạng chuỗi (dữ liệu cũ) được coi là địa chỉ. */
export function companyFormFromApi(p = {}) {
  const policies = p.hr_policy_details && typeof p.hr_policy_details === 'object' ? p.hr_policy_details : {};
  return {
    display_name: s(p.display_name), brand_name: s(p.brand_name), company_type: s(p.company_type), industry: s(p.industry),
    company_size: s(p.company_size), founded_year: s(p.founded_year), province: s(p.province), detailed_address: s(p.detailed_address),
    website: s(p.website), bio: s(p.bio), mission: s(p.mission), core_values: s(p.core_values), products_services: s(p.products_services),
    achievements: s(p.achievements), work_environment_desc: s(p.work_environment_desc), internal_culture: s(p.internal_culture),
    benefits: s(p.benefits), hr_policies: s(p.hr_policies),
    hr_policy_details: Object.fromEntries(POLICY_DETAIL_KEYS.map(k => [k, s(policies[k])])),
    public_email: s(p.public_email), public_phone: s(p.public_phone),
    social_links: Object.fromEntries(SOCIALS.map(({ key }) => [key, s((p.social_links || {})[key])])),
    latitude: s(p.latitude), longitude: s(p.longitude),
    branches: (Array.isArray(p.branches) ? p.branches : []).map(b => (typeof b === 'string'
      ? { ...emptyBranch(), address: b }
      : { ...emptyBranch(), ...Object.fromEntries(Object.entries(b || {}).map(([k, v]) => [k, k === 'is_active' ? v !== false : s(v)])) })),
  };
}

/** Kiểm tra phía trình duyệt (server kiểm tra lại). Trả về { đường_dẫn_trường: thông báo }. */
export function validateCompanyForm(f) {
  const e = {};
  const year = new Date().getFullYear();
  if (!f.display_name.trim()) e.display_name = 'Bắt buộc. Đây là tên ứng viên nhìn thấy.';
  if (f.founded_year && (!/^\d{4}$/.test(f.founded_year) || Number(f.founded_year) < 1800 || Number(f.founded_year) > year)) e.founded_year = `Từ 1800 đến ${year}.`;
  if (f.website && !isHttpUrl(f.website.trim())) e.website = 'Phải bắt đầu bằng http:// hoặc https://';
  if (f.public_email && !isEmail(f.public_email.trim())) e.public_email = 'Email không hợp lệ.';
  if (f.public_phone && !isPhone(f.public_phone)) e.public_phone = 'Số điện thoại không hợp lệ (VD: 028 3838 8888).';
  for (const { key, label } of SOCIALS) {
    const v = (f.social_links[key] || '').trim();
    if (v && !isHttpUrl(v)) e[`social_links.${key}`] = `Liên kết ${label} phải bắt đầu bằng https://`;
  }
  f.branches.forEach((b, i) => {
    const blank = !b.name.trim() && !b.address.trim() && !b.phone.trim() && !b.email.trim();
    if (blank) return;
    if (!b.address.trim()) e[`branches.${i}.address`] = 'Cần nhập địa chỉ.';
    if (b.phone && !isPhone(b.phone)) e[`branches.${i}.phone`] = 'Số điện thoại không hợp lệ.';
    if (b.email && !isEmail(b.email.trim())) e[`branches.${i}.email`] = 'Email không hợp lệ.';
  });
  return e;
}

/** Tiến độ hoàn thiện: mỗi mục 1 điểm; trả về danh sách mục còn thiếu kèm phân vùng để dẫn tới. */
export function completionOf(saved, media, legalStatus) {
  const pol = saved.hr_policy_details || {};
  const policyCount = POLICY_DETAIL_KEYS.filter(k => pol[k]?.trim()).length + (saved.benefits.trim() ? 1 : 0);
  const items = [
    ['Logo doanh nghiệp', Boolean(media.logo), 'media'],
    ['Ảnh bìa', Boolean(media.cover), 'media'],
    ['Ít nhất 3 ảnh thư viện', media.office.length >= 3, 'media'],
    ['Lĩnh vực & quy mô', Boolean(saved.industry && saved.company_size), 'general'],
    ['Địa chỉ trụ sở', Boolean(saved.detailed_address.trim()), 'general'],
    ['Giới thiệu doanh nghiệp', Boolean(saved.bio.trim()), 'about'],
    ['Môi trường hoặc văn hóa', Boolean(saved.work_environment_desc.trim() || saved.internal_culture.trim()), 'about'],
    ['Ít nhất 2 chính sách nhân sự', policyCount >= 2, 'policies'],
    ['Email hoặc SĐT tuyển dụng', Boolean(saved.public_email || saved.public_phone), 'contact'],
    ['Ghim vị trí trụ sở', Boolean(saved.latitude), 'map'],
    ['Xác minh doanh nghiệp', legalStatus === 'VERIFIED', 'verification'],
  ];
  const done = items.filter(i => i[1]).length;
  return { percent: Math.round((done / items.length) * 100), missing: items.filter(i => !i[1]).map(([label, , section]) => ({ label, section })) };
}

// ---------- Kiểu dáng ----------
export const card = { background: '#ffffff', borderRadius: 14, border: '1px solid var(--color-border, #E2E8F0)', padding: '20px 22px' };
export const input = {
  width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--color-border, #E2E8F0)',
  fontSize: 13.5, background: '#ffffff', boxSizing: 'border-box', fontFamily: 'inherit', color: 'var(--color-text)',
};
export const inputError = { ...input, borderColor: '#DC2626' };
export const labelStyle = { display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 };
export const hintStyle = { fontSize: 12, color: '#64748B', margin: '4px 0 0 0', lineHeight: 1.5 };
export const errorStyle = { fontSize: 12, color: '#B91C1C', margin: '4px 0 0 0' };
export const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 };
export const btn = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #7565A8',
  background: '#ffffff', color: '#7565A8', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
};
export const btnDanger = { ...btn, borderColor: '#FECACA', color: '#DC2626' };
export const btnPrimary = { ...btn, border: 'none', background: '#7565A8', color: '#ffffff', padding: '9px 16px', fontSize: 13.5 };
export const sectionTitle = { fontSize: 16, fontWeight: 800, margin: '0 0 4px 0', color: 'var(--color-text)' };
