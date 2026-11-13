const db = require('../../config/db');
const { AppError, ForbiddenError, NotFoundError } = require('../../utils/app-error');

const GENDERS = ['Nam', 'Nữ', 'Khác'];
const WORK_TYPES = ['PART_TIME', 'FULL_TIME'];
const MAX_SKILLS = 30;
const MAX_EXPERIENCES = 20;
const MAX_LANGUAGES = 10;

const str = (v, max = 255) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s ? s.slice(0, max) : null;
};
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const isMonth = (v) => /^\d{4}-\d{2}$/.test(v);

/** Kiểm tra và chuẩn hóa dữ liệu form hồ sơ. Ném BadRequestError kèm danh sách lỗi. */
function validate(body = {}) {
    const errors = [];
    const out = {
        full_name: str(body.full_name, 255),
        phone: str(body.phone, 20),
        date_of_birth: str(body.date_of_birth, 10),
        gender: str(body.gender, 10),
        province: str(body.province, 255),
        ward: str(body.ward, 255),
        detailed_address: str(body.detailed_address, 500),
        school: str(body.school, 255),
        major: str(body.major, 255),
        year_of_study: str(body.year_of_study, 30),
        graduation_year: body.graduation_year ? Number(body.graduation_year) : null,
        gpa: body.gpa !== undefined && body.gpa !== null && body.gpa !== '' ? Number(body.gpa) : null,
        student_code: str(body.student_code, 50),
        bio: str(body.bio, 3000),
        desired_position: str(body.desired_position, 255),
        interested_category: str(body.interested_category, 255),
        desired_work_type: str(body.desired_work_type, 20),
        desired_salary: str(body.desired_salary, 100),
    };

    if (!out.full_name || out.full_name.length < 2) errors.push('Họ và tên phải có ít nhất 2 ký tự.');
    if (out.phone && !/^(\+84|0)\d{9,10}$/.test(out.phone.replace(/[\s.-]/g, ''))) errors.push('Số điện thoại không hợp lệ.');
    if (out.phone) out.phone = out.phone.replace(/[\s.-]/g, '');
    if (out.date_of_birth) {
        if (!isDate(out.date_of_birth)) errors.push('Ngày sinh không hợp lệ.');
        else {
            const age = (Date.now() - Date.parse(out.date_of_birth)) / (365.25 * 24 * 3600 * 1000);
            if (age < 15 || age > 70) errors.push('Ngày sinh không hợp lệ (tuổi phải từ 15 đến 70).');
        }
    }
    if (out.gender && !GENDERS.includes(out.gender)) errors.push('Giới tính không hợp lệ.');
    if (out.ward && !out.province) errors.push('Chọn Tỉnh/Thành phố trước khi chọn Phường/Xã.');
    if (out.graduation_year !== null && (!Number.isInteger(out.graduation_year) || out.graduation_year < 1990 || out.graduation_year > 2100)) {
        errors.push('Năm tốt nghiệp không hợp lệ.');
    }
    if (out.gpa !== null && (Number.isNaN(out.gpa) || out.gpa < 0 || out.gpa > 10)) errors.push('GPA phải nằm trong khoảng 0 – 10.');
    if (out.desired_work_type && !WORK_TYPES.includes(out.desired_work_type)) errors.push('Loại hình mong muốn chỉ có thể là Part-time hoặc Full-time.');

    // Kỹ năng: danh sách chuỗi, bỏ trùng (không phân biệt hoa thường)
    const seen = new Set();
    out.skills = (Array.isArray(body.skills) ? body.skills : [])
        .map(s => str(s, 60))
        .filter(s => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()));
    if (out.skills.length > MAX_SKILLS) errors.push(`Tối đa ${MAX_SKILLS} kỹ năng.`);

    out.languages = (Array.isArray(body.languages) ? body.languages : [])
        .map(l => ({ language: str(l?.language, 60), level: str(l?.level, 60) }))
        .filter(l => l.language);
    if (out.languages.length > MAX_LANGUAGES) errors.push(`Tối đa ${MAX_LANGUAGES} ngoại ngữ.`);

    // Kinh nghiệm: tháng dạng YYYY-MM; end trống = đang làm
    out.experiences = (Array.isArray(body.experiences) ? body.experiences : []).map((e, i) => {
        const exp = {
            title: str(e?.title, 255),
            organization: str(e?.organization, 255),
            description: str(e?.description, 2000),
            start_month: str(e?.start_month, 7),
            end_month: str(e?.end_month, 7),
        };
        if (!exp.title) errors.push(`Kinh nghiệm #${i + 1}: cần nhập vị trí/công việc.`);
        if (exp.start_month && !isMonth(exp.start_month)) errors.push(`Kinh nghiệm #${i + 1}: tháng bắt đầu không hợp lệ.`);
        if (exp.end_month && !isMonth(exp.end_month)) errors.push(`Kinh nghiệm #${i + 1}: tháng kết thúc không hợp lệ.`);
        if (exp.start_month && exp.end_month && exp.end_month < exp.start_month) errors.push(`Kinh nghiệm #${i + 1}: thời gian kết thúc trước thời gian bắt đầu.`);
        return exp;
    });
    if (out.experiences.length > MAX_EXPERIENCES) errors.push(`Tối đa ${MAX_EXPERIENCES} mục kinh nghiệm.`);

    if (errors.length) throw new AppError(errors[0], 400, errors);
    return out;
}

/** % hoàn thiện hồ sơ dựa trên các mục nhà tuyển dụng hay xem. */
function completionRate(p) {
    const checks = [
        p.full_name, p.phone, p.date_of_birth, p.gender, p.province && p.ward,
        p.school, p.major, p.bio, p.desired_position,
        p.skills.length > 0, p.experiences.length > 0 || p.languages.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

class StudentProfileService {
    async getExperiences(profileId) {
        const res = await db.query(
            `SELECT id, title, organization, description,
                    to_char(start_date, 'YYYY-MM') AS start_month,
                    to_char(end_date, 'YYYY-MM') AS end_month
             FROM student_experiences WHERE student_profile_id = $1
             ORDER BY start_date DESC NULLS LAST, id`,
            [profileId]
        );
        return res.rows;
    }

    async update(userId, body) {
        const userRes = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (!userRes.rows[0]) throw new NotFoundError('Người dùng không tồn tại');
        if (userRes.rows[0].role !== 'STUDENT') throw new ForbiddenError('Chỉ sinh viên mới có hồ sơ xin việc.');

        const p = validate(body);
        const rate = completionRate(p);
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(
                'UPDATE users SET full_name = $2, phone = $3, updated_at = NOW() WHERE id = $1',
                [userId, p.full_name, p.phone]
            );
            const prof = await client.query(
                `INSERT INTO student_profiles (
                    user_id, full_name, date_of_birth, gender, province, ward, detailed_address,
                    school, major, year_of_study, graduation_year, gpa, student_code, bio,
                    desired_position, interested_category, desired_work_type, desired_salary,
                    skills, languages, profile_completion_rate, is_profile_completed, updated_at
                 ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,NOW())
                 ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name, date_of_birth = EXCLUDED.date_of_birth,
                    gender = EXCLUDED.gender, province = EXCLUDED.province, ward = EXCLUDED.ward,
                    detailed_address = EXCLUDED.detailed_address, school = EXCLUDED.school,
                    major = EXCLUDED.major, year_of_study = EXCLUDED.year_of_study,
                    graduation_year = EXCLUDED.graduation_year, gpa = EXCLUDED.gpa,
                    student_code = EXCLUDED.student_code, bio = EXCLUDED.bio,
                    desired_position = EXCLUDED.desired_position,
                    interested_category = EXCLUDED.interested_category,
                    desired_work_type = EXCLUDED.desired_work_type,
                    desired_salary = EXCLUDED.desired_salary, skills = EXCLUDED.skills,
                    languages = EXCLUDED.languages,
                    profile_completion_rate = EXCLUDED.profile_completion_rate,
                    is_profile_completed = EXCLUDED.is_profile_completed,
                    updated_at = NOW()
                 RETURNING id`,
                [
                    userId, p.full_name, p.date_of_birth, p.gender, p.province, p.ward, p.detailed_address,
                    p.school, p.major, p.year_of_study, p.graduation_year, p.gpa, p.student_code, p.bio,
                    p.desired_position, p.interested_category, p.desired_work_type, p.desired_salary,
                    p.skills, JSON.stringify(p.languages), rate, rate >= 80,
                ]
            );
            const profileId = prof.rows[0].id;

            // Danh sách kinh nghiệm: thay toàn bộ theo form
            await client.query('DELETE FROM student_experiences WHERE student_profile_id = $1', [profileId]);
            for (const e of p.experiences) {
                await client.query(
                    `INSERT INTO student_experiences (student_profile_id, title, organization, description, start_date, end_date)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [profileId, e.title, e.organization, e.description,
                        e.start_month ? `${e.start_month}-01` : null, e.end_month ? `${e.end_month}-01` : null]
                );
            }
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
        return this.getMyProfile(userId);
    }

    /** Bản chụp hồ sơ gửi kèm đơn ứng tuyển (chỉ các trường nhà tuyển dụng cần xem). */
    async buildSnapshot(userId) {
        const p = await this.getMyProfile(userId);
        if (!p) return null;
        const pick = [
            'full_name', 'email', 'phone', 'avatar_url', 'date_of_birth', 'gender', 'province', 'ward', 'detailed_address',
            'school', 'major', 'year_of_study', 'graduation_year', 'gpa', 'bio', 'desired_position',
            'interested_category', 'desired_work_type', 'desired_salary', 'skills', 'languages',
        ];
        const snap = Object.fromEntries(pick.map(k => [k, p[k] ?? null]));
        snap.experiences = (p.experiences || []).map(({ title, organization, description, start_month, end_month }) => ({ title, organization, description, start_month, end_month }));
        snap.captured_at = new Date().toISOString();
        return snap;
    }

    async getMyProfile(userId) {
        const res = await db.query(
            `SELECT sp.*, sp.school AS university, u.email, u.full_name, u.phone, u.role, u.status,
                    to_char(sp.date_of_birth, 'YYYY-MM-DD') AS date_of_birth
             FROM student_profiles sp JOIN users u ON u.id = sp.user_id
             WHERE sp.user_id = $1`,
            [userId]
        );
        const profile = res.rows[0];
        if (!profile) return null;
        profile.experiences = await this.getExperiences(profile.id);
        return profile;
    }
}

module.exports = new StudentProfileService();
module.exports.validate = validate;
