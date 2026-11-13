const db = require('../../config/db');
const { AppError, NotFoundError, ForbiddenError } = require('../../utils/app-error');

// Loại tài khoản lưu dạng nhãn tiếng Việt từ form đăng ký → chuẩn hóa, không suy luận từ tên
const ACCOUNT_TYPES = {
    'Doanh nghiệp / Công ty': 'BUSINESS',
    'Hộ kinh doanh / Cá nhân': 'INDIVIDUAL',
    BUSINESS: 'BUSINESS',
    INDIVIDUAL: 'INDIVIDUAL',
};
const LEGAL_STATUSES = ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'];
const SOCIAL_KEYS = ['facebook', 'linkedin', 'tiktok', 'youtube', 'instagram'];

const str = (v, max) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s ? s.slice(0, max) : null;
};
const isHttpUrl = (v) => /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(v);
const asList = (v) => (Array.isArray(v) ? v : []);

/** Bỏ phần số nhà/tên đường, giữ tối đa 2 cấp cuối (quận/khu vực, tỉnh/thành) — dùng cho tài khoản cá nhân. */
const coarseLocation = (loc) => {
    if (!loc) return null;
    // Bỏ phần bắt đầu bằng số nhà ("27 Võ Văn Ngân", "Số 5 ...", "12/3A ..."); giữ "Quận 1", "Phường 13"
    const parts = String(loc).split(',').map(x => x.trim()).filter(x => x && !/^(số\s*)?\d/i.test(x));
    return parts.length ? parts.slice(-2).join(', ') : null;
};

/** Dữ liệu được phép công khai. Không có: email/SĐT đăng nhập, MST, giấy phép, người đại diện, trạng thái tài khoản nội bộ. */
function toPublicDto(row, openJobsCount) {
    const accountType = ACCOUNT_TYPES[row.account_type] || null;
    const legalStatus = LEGAL_STATUSES.includes(row.verification_status) ? row.verification_status : 'UNVERIFIED';
    const social = row.social_links && typeof row.social_links === 'object' ? row.social_links : {};
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
        benefits: row.benefits || null,
        hr_policies: row.hr_policies || null,
        office_images: asList(row.office_images).filter(u => typeof u === 'string' && u.startsWith('/api/files/')),
        branches: asList(row.branches).filter(b => typeof b === 'string' && b.trim()),
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

/** Kiểm tra dữ liệu phần "thông tin công khai" do nhà tuyển dụng nhập. */
function validatePublicInfo(body = {}) {
    const errors = [];
    const currentYear = new Date().getFullYear();
    const out = {
        brand_name: str(body.brand_name, 255),
        founded_year: body.founded_year === '' || body.founded_year === null || body.founded_year === undefined ? null : Number(body.founded_year),
        industry: str(body.industry, 255),
        company_size: str(body.company_size, 100),
        mission: str(body.mission, 3000),
        core_values: str(body.core_values, 3000),
        products_services: str(body.products_services, 3000),
        achievements: str(body.achievements, 3000),
        work_environment_desc: str(body.work_environment_desc, 3000),
        benefits: str(body.benefits, 3000),
        hr_policies: str(body.hr_policies, 3000),
        public_email: str(body.public_email, 255),
        public_phone: str(body.public_phone, 20),
        branches: asList(body.branches).map(b => str(b, 255)).filter(Boolean),
        social_links: {},
    };
    if (out.founded_year !== null && (!Number.isInteger(out.founded_year) || out.founded_year < 1800 || out.founded_year > currentYear)) {
        errors.push(`Năm thành lập phải từ 1800 đến ${currentYear}.`);
    }
    if (out.public_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.public_email)) errors.push('Email liên hệ không hợp lệ.');
    if (out.public_phone) {
        out.public_phone = out.public_phone.replace(/[\s.-]/g, '');
        if (!/^(\+84|0)\d{8,10}$/.test(out.public_phone)) errors.push('Số điện thoại liên hệ không hợp lệ.');
    }
    if (out.branches.length > 20) errors.push('Tối đa 20 chi nhánh.');
    // Tọa độ trụ sở: cả hai cùng có hoặc cùng trống; giới hạn trong lãnh thổ Việt Nam
    const hasLat = body.latitude !== undefined && body.latitude !== null && body.latitude !== '';
    const hasLng = body.longitude !== undefined && body.longitude !== null && body.longitude !== '';
    out.latitude = hasLat ? Number(body.latitude) : null;
    out.longitude = hasLng ? Number(body.longitude) : null;
    if (hasLat !== hasLng) errors.push('Cần đủ cả vĩ độ và kinh độ.');
    else if (hasLat && (Number.isNaN(out.latitude) || Number.isNaN(out.longitude)
        || out.latitude < 8 || out.latitude > 24 || out.longitude < 102 || out.longitude > 110)) {
        errors.push('Vị trí ghim phải nằm trong lãnh thổ Việt Nam.');
    }
    if (out.latitude !== null) {
        out.latitude = Math.round(out.latitude * 1e6) / 1e6;
        out.longitude = Math.round(out.longitude * 1e6) / 1e6;
    }
    const social = body.social_links && typeof body.social_links === 'object' ? body.social_links : {};
    for (const key of SOCIAL_KEYS) {
        const v = str(social[key], 255);
        if (!v) continue;
        if (!isHttpUrl(v)) errors.push(`Liên kết ${key} phải bắt đầu bằng http:// hoặc https://`);
        else out.social_links[key] = v;
    }
    if (errors.length) throw new AppError(errors[0], 400, errors);
    return out;
}

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
     * Nhà tuyển dụng cập nhật phần thông tin công khai.
     * Không đụng tới: thông tin pháp lý/xác minh, tên/giới thiệu/website/địa chỉ (do form hồ sơ cơ bản quản lý).
     */
    async updatePublicInfo(userId, body) {
        const u = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (!u.rows[0]) throw new NotFoundError('Người dùng không tồn tại');
        if (u.rows[0].role !== 'EMPLOYER') throw new ForbiddenError('Chỉ nhà tuyển dụng mới có hồ sơ công ty.');
        const p = validatePublicInfo(body);
        const res = await db.query(
            `UPDATE employer_profiles SET
                brand_name = $2, founded_year = $3, industry = $4, company_size = $5,
                mission = $6, core_values = $7, products_services = $8, achievements = $9,
                work_environment_desc = $10, benefits = $11, hr_policies = $12,
                public_email = $13, public_phone = $14, branches = $15, social_links = $16,
                latitude = $17, longitude = $18, updated_at = NOW()
             WHERE user_id = $1`,
            [userId, p.brand_name, p.founded_year, p.industry, p.company_size,
                p.mission, p.core_values, p.products_services, p.achievements,
                p.work_environment_desc, p.benefits, p.hr_policies,
                p.public_email, p.public_phone, JSON.stringify(p.branches), JSON.stringify(p.social_links),
                p.latitude, p.longitude]
        );
        if (res.rowCount === 0) throw new NotFoundError('Chưa có hồ sơ doanh nghiệp. Hãy hoàn tất thông tin cơ bản trước.');
        return this.getPublicProfile(userId);
    }
}

module.exports = new EmployerPublicService();
module.exports.toPublicDto = toPublicDto;
module.exports.validatePublicInfo = validatePublicInfo;
