const db = require('../../config/db');
const { AppError, NotFoundError, ForbiddenError } = require('../../utils/app-error');
const { diffFields, logProfileChange } = require('./employer-audit');

// Loại tài khoản lưu dạng nhãn tiếng Việt từ form đăng ký → chuẩn hóa, không suy luận từ tên
const ACCOUNT_TYPES = {
    'Doanh nghiệp / Công ty': 'BUSINESS',
    'Hộ kinh doanh / Cá nhân': 'INDIVIDUAL',
    BUSINESS: 'BUSINESS',
    INDIVIDUAL: 'INDIVIDUAL',
};
// Trạng thái xác minh pháp lý nội bộ. Ra ngoài chỉ công khai VERIFIED / PENDING / UNVERIFIED.
const LEGAL_STATUSES = ['UNVERIFIED', 'PENDING', 'VERIFIED', 'NEEDS_INFO', 'REJECTED'];
const PUBLIC_LEGAL_STATUSES = ['UNVERIFIED', 'PENDING', 'VERIFIED'];
const SOCIAL_KEYS = ['facebook', 'linkedin', 'tiktok', 'youtube', 'instagram'];
// Chính sách nhân sự chi tiết (ưu tiên sinh viên); "Phúc lợi" = cột benefits, "Chính sách khác" = hr_policies
const POLICY_KEYS = ['internship', 'training', 'student_support', 'flexible_schedule', 'part_time', 'full_time', 'career_growth'];
const BRANCHES_MAX = 20;

const str = (v, max) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s ? s.slice(0, max) : null;
};
const isHttpUrl = (v) => /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(v);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const asList = (v) => (Array.isArray(v) ? v : []);
const asObject = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const inVietnam = (lat, lng) => lat >= 8 && lat <= 24 && lng >= 102 && lng <= 110;
const round6 = (n) => Math.round(n * 1e6) / 1e6;

/** Trạng thái pháp lý đã lưu → một trong LEGAL_STATUSES (giá trị cũ/lạ như 'PENDING_VERIFICATION' = chưa gửi hồ sơ). */
const normalizeLegalStatus = (v) => (LEGAL_STATUSES.includes(v) ? v : 'UNVERIFIED');

/** Số điện thoại VN: bỏ khoảng trắng/dấu chấm/gạch → null nếu không hợp lệ. */
const normalizePhone = (v) => {
    const s = String(v).replace(/[\s.-]/g, '');
    return /^(\+84|0)\d{8,10}$/.test(s) ? s : null;
};

/** Chi nhánh: dữ liệu cũ là chuỗi → coi chuỗi đó là địa chỉ. */
function readBranch(b) {
    if (typeof b === 'string') {
        const address = str(b, 255);
        return address ? { name: null, address, phone: null, email: null, latitude: null, longitude: null, is_active: true } : null;
    }
    const o = asObject(b);
    const address = str(o.address, 255);
    const name = str(o.name, 120);
    if (!address && !name) return null;
    const lat = o.latitude === null || o.latitude === undefined || o.latitude === '' ? null : Number(o.latitude);
    const lng = o.longitude === null || o.longitude === undefined || o.longitude === '' ? null : Number(o.longitude);
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
    return {
        name, address,
        phone: str(o.phone, 20), email: str(o.email, 255),
        latitude: hasCoords ? lat : null, longitude: hasCoords ? lng : null,
        is_active: o.is_active !== false,
    };
}
const readBranches = (raw) => asList(raw).map(readBranch).filter(Boolean);

const readPolicies = (raw) => {
    const o = asObject(raw);
    return Object.fromEntries(POLICY_KEYS.map(k => [k, str(o[k], 3000)]).filter(([, v]) => v));
};

/** Bỏ phần số nhà/tên đường, giữ tối đa 2 cấp cuối (quận/khu vực, tỉnh/thành) — dùng cho tài khoản cá nhân. */
const coarseLocation = (loc) => {
    if (!loc) return null;
    // Bỏ phần bắt đầu bằng số nhà ("27 Võ Văn Ngân", "Số 5 ...", "12/3A ..."); giữ "Quận 1", "Phường 13"
    const parts = String(loc).split(',').map(x => x.trim()).filter(x => x && !/^(số\s*)?\d/i.test(x));
    return parts.length ? parts.slice(-2).join(', ') : null;
};

/**
 * Dữ liệu được phép công khai. Không có: email/SĐT đăng nhập, MST, giấy phép/tài liệu pháp lý,
 * thông tin người đại diện, ghi chú xét duyệt, trạng thái tài khoản nội bộ.
 */
function toPublicDto(row, openJobsCount) {
    const accountType = ACCOUNT_TYPES[row.account_type] || null;
    const stored = normalizeLegalStatus(row.verification_status);
    const legalStatus = PUBLIC_LEGAL_STATUSES.includes(stored) ? stored : 'UNVERIFIED';
    const social = asObject(row.social_links);
    return {
        id: row.user_id,
        display_name: row.display_name || row.company_name || row.full_name,
        company_name: row.company_name || null,
        brand_name: row.brand_name || null,
        account_type: accountType,
        company_type: row.company_type || null,
        industry: row.industry || null,
        company_size: row.company_size || null,
        founded_year: row.founded_year || null,
        province: row.province || null,
        // Hộ kinh doanh/cá nhân: địa chỉ có thể là nhà riêng → chỉ công khai khu vực, không có số nhà
        location: accountType === 'BUSINESS' ? (row.location || null) : coarseLocation(row.location),
        // Hộ kinh doanh/cá nhân có thể là địa chỉ nhà riêng → chỉ công khai tỉnh/thành
        headquarters: accountType === 'BUSINESS' ? (row.detailed_address || row.location || null) : null,
        // Tọa độ do doanh nghiệp tự ghim; tài khoản cá nhân không công khai (có thể là nhà riêng)
        latitude: accountType === 'BUSINESS' && row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : null,
        longitude: accountType === 'BUSINESS' && row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : null,
        logo_url: row.avatar_url || null,
        cover_url: row.cover_url || null,
        bio: row.bio || null,
        mission: row.mission || null,
        core_values: row.core_values || null,
        products_services: row.products_services || null,
        achievements: row.achievements || null,
        work_environment_desc: row.work_environment_desc || null,
        internal_culture: row.internal_culture || null,
        benefits: row.benefits || null,
        hr_policies: row.hr_policies || null,
        hr_policy_details: readPolicies(row.hr_policy_details),
        office_images: asList(row.office_images).filter(u => typeof u === 'string' && u.startsWith('/api/files/')),
        // Chỉ chi nhánh đang hoạt động; không kèm cờ nội bộ
        branches: readBranches(row.branches).filter(b => b.is_active && b.address)
            .map(({ is_active, ...b }) => ({ ...b, phone: b.phone && normalizePhone(b.phone) ? b.phone : null, email: b.email && isEmail(b.email) ? b.email : null })),
        website: row.website && isHttpUrl(row.website) ? row.website : null,
        public_email: row.public_email || null,
        public_phone: row.public_phone || null,
        social_links: Object.fromEntries(SOCIAL_KEYS.filter(k => typeof social[k] === 'string' && isHttpUrl(social[k])).map(k => [k, social[k]])),
        verification: {
            email: Boolean(row.email_verified_at),
            phone: Boolean(row.phone_verified_at),
            legal: legalStatus === 'VERIFIED',
            legal_status: legalStatus,
        },
        joined_at: row.user_created_at,
        open_jobs_count: openJobsCount,
    };
}

function validateBranch(b, i, errors) {
    const o = typeof b === 'string' ? { address: b } : asObject(b);
    const label = `Chi nhánh ${i + 1}`;
    const out = {
        name: str(o.name, 120),
        address: str(o.address, 255),
        phone: str(o.phone, 20),
        email: str(o.email, 255),
        latitude: null,
        longitude: null,
        is_active: o.is_active !== false && o.is_active !== 'false',
    };
    if (!out.name && !out.address && !out.phone && !out.email) return null; // dòng trống → bỏ qua
    if (!out.address) errors.push(`${label}: cần nhập địa chỉ.`);
    if (out.phone) {
        out.phone = normalizePhone(out.phone);
        if (!out.phone) errors.push(`${label}: số điện thoại không hợp lệ.`);
    }
    if (out.email && !isEmail(out.email)) errors.push(`${label}: email không hợp lệ.`);
    const hasLat = o.latitude !== undefined && o.latitude !== null && o.latitude !== '';
    const hasLng = o.longitude !== undefined && o.longitude !== null && o.longitude !== '';
    if (hasLat !== hasLng) errors.push(`${label}: cần đủ cả vĩ độ và kinh độ.`);
    else if (hasLat) {
        const lat = Number(o.latitude);
        const lng = Number(o.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || !inVietnam(lat, lng)) errors.push(`${label}: vị trí ghim phải nằm trong lãnh thổ Việt Nam.`);
        else { out.latitude = round6(lat); out.longitude = round6(lng); }
    }
    return out;
}

/**
 * Kiểm tra dữ liệu phần "Hồ sơ doanh nghiệp" do nhà tuyển dụng nhập.
 * Trả về giá trị đã chuẩn hóa cho mọi trường; `present` = các cột thực sự có trong body (chỉ cột đó được ghi).
 */
function validatePublicInfo(body = {}) {
    const errors = [];
    const has = (k) => Object.prototype.hasOwnProperty.call(body, k);
    const currentYear = new Date().getFullYear();
    const out = {
        display_name: str(body.display_name, 255),
        company_type: str(body.company_type, 100),
        bio: str(body.bio, 5000),
        website: str(body.website, 500),
        province: str(body.province, 255),
        detailed_address: str(body.detailed_address, 500),
        brand_name: str(body.brand_name, 255),
        founded_year: body.founded_year === '' || body.founded_year === null || body.founded_year === undefined ? null : Number(body.founded_year),
        industry: str(body.industry, 255),
        company_size: str(body.company_size, 100),
        mission: str(body.mission, 3000),
        core_values: str(body.core_values, 3000),
        products_services: str(body.products_services, 3000),
        achievements: str(body.achievements, 3000),
        work_environment_desc: str(body.work_environment_desc, 3000),
        internal_culture: str(body.internal_culture, 3000),
        benefits: str(body.benefits, 3000),
        hr_policies: str(body.hr_policies, 3000),
        hr_policy_details: readPolicies(body.hr_policy_details),
        public_email: str(body.public_email, 255),
        public_phone: str(body.public_phone, 20),
        branches: [],
        social_links: {},
    };
    if (has('display_name') && !out.display_name) errors.push('Tên hiển thị doanh nghiệp không được để trống.');
    if (out.website && !isHttpUrl(out.website)) errors.push('Website phải bắt đầu bằng http:// hoặc https://');
    if (out.founded_year !== null && (!Number.isInteger(out.founded_year) || out.founded_year < 1800 || out.founded_year > currentYear)) {
        errors.push(`Năm thành lập phải từ 1800 đến ${currentYear}.`);
    }
    if (out.public_email && !isEmail(out.public_email)) errors.push('Email liên hệ không hợp lệ.');
    if (out.public_phone) {
        const phone = normalizePhone(out.public_phone);
        if (!phone) errors.push('Số điện thoại liên hệ không hợp lệ.');
        else out.public_phone = phone;
    }
    const rawBranches = asList(body.branches);
    if (rawBranches.length > BRANCHES_MAX) errors.push(`Tối đa ${BRANCHES_MAX} chi nhánh.`);
    else out.branches = rawBranches.map((b, i) => validateBranch(b, i, errors)).filter(Boolean);
    // Tọa độ trụ sở: cả hai cùng có hoặc cùng trống; giới hạn trong lãnh thổ Việt Nam
    const hasLat = body.latitude !== undefined && body.latitude !== null && body.latitude !== '';
    const hasLng = body.longitude !== undefined && body.longitude !== null && body.longitude !== '';
    out.latitude = hasLat ? Number(body.latitude) : null;
    out.longitude = hasLng ? Number(body.longitude) : null;
    if (hasLat !== hasLng) errors.push('Cần đủ cả vĩ độ và kinh độ.');
    else if (hasLat && (Number.isNaN(out.latitude) || Number.isNaN(out.longitude) || !inVietnam(out.latitude, out.longitude))) {
        errors.push('Vị trí ghim phải nằm trong lãnh thổ Việt Nam.');
    }
    if (out.latitude !== null) {
        out.latitude = round6(out.latitude);
        out.longitude = round6(out.longitude);
    }
    const social = asObject(body.social_links);
    for (const key of SOCIAL_KEYS) {
        const v = str(social[key], 255);
        if (!v) continue;
        if (!isHttpUrl(v)) errors.push(`Liên kết ${key} phải bắt đầu bằng http:// hoặc https://`);
        else out.social_links[key] = v;
    }
    if (errors.length) throw new AppError(errors[0], 400, errors);
    const present = Object.keys(out).filter(k => has(k));
    if (has('latitude') || has('longitude')) present.push('latitude', 'longitude');
    return Object.defineProperty(out, 'present', { value: [...new Set(present)], enumerable: false });
}

const JSON_COLUMNS = new Set(['branches', 'social_links', 'hr_policy_details']);
// Thông tin quan trọng ghi giá trị cũ/mới vào lịch sử; văn bản dài chỉ ghi "đã cập nhật"
const AUDIT_FIELDS = ['display_name', 'brand_name', 'company_type', 'industry', 'company_size', 'founded_year', 'website',
    'province', 'detailed_address', 'public_email', 'public_phone', 'latitude', 'longitude', 'social_links', 'branches'];
const AUDIT_LONG_FIELDS = ['bio', 'mission', 'core_values', 'products_services', 'achievements', 'work_environment_desc',
    'internal_culture', 'benefits', 'hr_policies', 'hr_policy_details'];

class EmployerPublicService {
    async getPublicProfile(userId) {
        const res = await db.query(
            `SELECT ep.*, u.full_name, u.created_at AS user_created_at
             FROM users u JOIN employer_profiles ep ON ep.user_id = u.id
             WHERE u.id = $1 AND u.role <> 'STUDENT' AND u.status <> 'BANNED'`, // dữ liệu mẫu có tin do tài khoản ADMIN đăng
            [userId]
        );
        const row = res.rows[0];
        if (!row) throw new NotFoundError('Không tìm thấy nhà tuyển dụng');
        // Đếm tin thật sự đang nhận hồ sơ (đang mở, đã duyệt, chưa quá hạn)
        const jobs = await db.query(
            `SELECT COUNT(*)::int AS n FROM jobs
             WHERE employer_id = $1 AND status = 'OPEN'
               AND (moderation_status = 'APPROVED' OR moderation_status IS NULL)
               AND (application_deadline IS NULL OR application_deadline >= CURRENT_DATE)`,
            [userId]
        );
        return toPublicDto(row, jobs.rows[0].n);
    }

    /**
     * Nhà tuyển dụng cập nhật Hồ sơ doanh nghiệp. Chỉ ghi các trường có trong body.
     * Không đụng tới: tên pháp nhân/MST/tài liệu & trạng thái xác minh (mục Xác minh), ảnh (API /files),
     * thông tin người đại diện, email/SĐT đăng nhập.
     */
    async updatePublicInfo(userId, body) {
        const u = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (!u.rows[0]) throw new NotFoundError('Người dùng không tồn tại');
        if (u.rows[0].role !== 'EMPLOYER') throw new ForbiddenError('Chỉ nhà tuyển dụng mới có hồ sơ công ty.');
        const p = validatePublicInfo(body);
        const before = (await db.query('SELECT * FROM employer_profiles WHERE user_id = $1', [userId])).rows[0];
        if (!before) throw new NotFoundError('Chưa có hồ sơ doanh nghiệp. Hãy hoàn tất thông tin cơ bản trước.');
        if (p.present.length) {
            const cols = p.present;
            // Tên cột lấy từ danh sách trường đã kiểm tra (không lấy từ body) → không thể chèn SQL
            const sets = cols.map((c, i) => `${c} = $${i + 2}`);
            const values = cols.map(c => (JSON_COLUMNS.has(c) ? JSON.stringify(p[c]) : p[c]));
            await db.query(`UPDATE employer_profiles SET ${sets.join(', ')}, updated_at = NOW() WHERE user_id = $1`, [userId, ...values]);
            const changes = diffFields(before, p, AUDIT_FIELDS.filter(f => cols.includes(f)), AUDIT_LONG_FIELDS.filter(f => cols.includes(f)));
            await logProfileChange(db, userId, userId, 'COMPANY', changes);
        }
        return this.getPublicProfile(userId);
    }
}

module.exports = new EmployerPublicService();
module.exports.toPublicDto = toPublicDto;
module.exports.validatePublicInfo = validatePublicInfo;
module.exports.normalizeLegalStatus = normalizeLegalStatus;
module.exports.normalizePhone = normalizePhone;
module.exports.readBranches = readBranches;
module.exports.LEGAL_STATUSES = LEGAL_STATUSES;
module.exports.POLICY_KEYS = POLICY_KEYS;
