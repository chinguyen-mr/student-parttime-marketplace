const db = require('../../config/db');

class ProfileRepository {
    async findByUserId(userId) {
        const uRes = await db.query('SELECT role, full_name FROM users WHERE id = $1', [userId]);
        const user = uRes.rows[0];
        if (!user) return null;

        if (user.role === 'EMPLOYER') {
            const res = await db.query(
                `SELECT ep.*, ep.display_name AS company_name, ep.location AS company_address,
                        ep.avatar_url AS company_logo_url,
                        u.email, u.full_name, u.phone, u.role, u.status 
                 FROM employer_profiles ep
                 JOIN users u ON u.id = ep.user_id
                 WHERE ep.user_id = $1`,
                [userId]
            );
            return res.rows[0] || null;
        } else {
            const res = await db.query(
                `SELECT sp.*, sp.school AS university,
                        u.email, u.full_name, u.phone, u.role, u.status 
                 FROM student_profiles sp
                 JOIN users u ON u.id = sp.user_id
                 WHERE sp.user_id = $1`,
                [userId]
            );
            return res.rows[0] || null;
        }
    }

    async upsert(userId, { avatar_url, bio, skills, university, major, company_name, company_address, website, display_name, school, location }) {
        const uRes = await db.query('SELECT role, full_name FROM users WHERE id = $1', [userId]);
        const user = uRes.rows[0];
        if (!user) return null;

        if (user.role === 'EMPLOYER') {
            const dName = display_name || company_name || user.full_name;
            const loc = location || company_address;
            const { account_type, tax_code, business_license_file } = arguments[1] || {};
            const res = await db.query(
                `INSERT INTO employer_profiles (user_id, display_name, bio, location, avatar_url, account_type, tax_code, website, business_license_file, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                 ON CONFLICT (user_id) DO UPDATE SET
                    display_name = COALESCE(EXCLUDED.display_name, employer_profiles.display_name),
                    bio = COALESCE(EXCLUDED.bio, employer_profiles.bio),
                    location = COALESCE(EXCLUDED.location, employer_profiles.location),
                    avatar_url = COALESCE(EXCLUDED.avatar_url, employer_profiles.avatar_url),
                    account_type = COALESCE(EXCLUDED.account_type, employer_profiles.account_type),
                    tax_code = COALESCE(EXCLUDED.tax_code, employer_profiles.tax_code),
                    website = COALESCE(EXCLUDED.website, employer_profiles.website),
                    business_license_file = COALESCE(EXCLUDED.business_license_file, employer_profiles.business_license_file),
                    updated_at = NOW()
                 RETURNING *, display_name AS company_name, location AS company_address`,
                [userId, dName, bio, loc, avatar_url, account_type || null, tax_code || null, website || null, business_license_file || null]
            );
            return res.rows[0];
        } else {
            const fName = user.full_name || 'Sinh viên';
            const sch = school || university;
            const { student_code, experience, default_cv_url } = arguments[1] || {};
            const res = await db.query(
                `INSERT INTO student_profiles (user_id, full_name, bio, school, major, avatar_url, student_code, experience, default_cv_url, skills, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
                 ON CONFLICT (user_id) DO UPDATE SET
                    bio = COALESCE(EXCLUDED.bio, student_profiles.bio),
                    school = COALESCE(EXCLUDED.school, student_profiles.school),
                    major = COALESCE(EXCLUDED.major, student_profiles.major),
                    avatar_url = COALESCE(EXCLUDED.avatar_url, student_profiles.avatar_url),
                    student_code = COALESCE(EXCLUDED.student_code, student_profiles.student_code),
                    experience = COALESCE(EXCLUDED.experience, student_profiles.experience),
                    default_cv_url = COALESCE(EXCLUDED.default_cv_url, student_profiles.default_cv_url),
                    skills = COALESCE(EXCLUDED.skills, student_profiles.skills),
                    updated_at = NOW()
                 RETURNING *, school AS university`,
                [userId, fName, bio, sch, major, avatar_url, student_code || null, experience || null, default_cv_url || null, skills || null]
            );
            return res.rows[0];
        }
    }
}

module.exports = new ProfileRepository();
