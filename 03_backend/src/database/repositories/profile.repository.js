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
            const student = res.rows[0];
            if (student) {
                try {
                    const avRes = await db.query(
                        'SELECT * FROM student_availabilities WHERE student_id = $1 AND is_active = TRUE ORDER BY day_of_week, start_time',
                        [userId]
                    );
                    student.availabilities = avRes.rows || [];
                } catch {
                    student.availabilities = [];
                }
            }
            return student || null;
        }
    }

    async upsert(userId, updateData = {}) {
        const uRes = await db.query('SELECT role, full_name, phone FROM users WHERE id = $1', [userId]);
        const user = uRes.rows[0];
        if (!user) return null;

        const {
            avatar_url, bio, skills, university, major, company_name, company_address, 
            website, display_name, school, location, account_type, tax_code, 
            business_license_file, student_code, experience, default_cv_url,
            // Extended 2-Step fields
            representative_name, representative_title, company_type, industry, 
            company_size, province, detailed_address, cover_url, recruiter_name, 
            recruiter_email, work_environment_desc, office_images, verification_status,
            date_of_birth, gender, interested_category, desired_position, languages, 
            desired_salary, desired_work_type, profile_completion_rate, is_profile_completed
        } = updateData;

        if (user.role === 'EMPLOYER') {
            const dName = display_name || company_name || user.full_name;
            const loc = location || province || company_address;
            const accType = company_type || account_type;

            try {
                // Try extended insert with all new fields
                const res = await db.query(
                    `INSERT INTO employer_profiles (
                        user_id, display_name, bio, location, avatar_url, account_type, 
                        tax_code, website, business_license_file, representative_name, 
                        representative_title, company_name, company_type, industry, 
                        company_size, province, detailed_address, cover_url, recruiter_name, 
                        recruiter_email, work_environment_desc, office_images, verification_status, 
                        profile_completion_rate, is_profile_completed, updated_at
                     )
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, NOW())
                     ON CONFLICT (user_id) DO UPDATE SET
                        display_name = COALESCE(EXCLUDED.display_name, employer_profiles.display_name),
                        bio = COALESCE(EXCLUDED.bio, employer_profiles.bio),
                        location = COALESCE(EXCLUDED.location, employer_profiles.location),
                        avatar_url = COALESCE(EXCLUDED.avatar_url, employer_profiles.avatar_url),
                        account_type = COALESCE(EXCLUDED.account_type, employer_profiles.account_type),
                        tax_code = COALESCE(EXCLUDED.tax_code, employer_profiles.tax_code),
                        website = COALESCE(EXCLUDED.website, employer_profiles.website),
                        business_license_file = COALESCE(EXCLUDED.business_license_file, employer_profiles.business_license_file),
                        representative_name = COALESCE(EXCLUDED.representative_name, employer_profiles.representative_name),
                        representative_title = COALESCE(EXCLUDED.representative_title, employer_profiles.representative_title),
                        company_name = COALESCE(EXCLUDED.company_name, employer_profiles.company_name),
                        company_type = COALESCE(EXCLUDED.company_type, employer_profiles.company_type),
                        industry = COALESCE(EXCLUDED.industry, employer_profiles.industry),
                        company_size = COALESCE(EXCLUDED.company_size, employer_profiles.company_size),
                        province = COALESCE(EXCLUDED.province, employer_profiles.province),
                        detailed_address = COALESCE(EXCLUDED.detailed_address, employer_profiles.detailed_address),
                        cover_url = COALESCE(EXCLUDED.cover_url, employer_profiles.cover_url),
                        recruiter_name = COALESCE(EXCLUDED.recruiter_name, employer_profiles.recruiter_name),
                        recruiter_email = COALESCE(EXCLUDED.recruiter_email, employer_profiles.recruiter_email),
                        work_environment_desc = COALESCE(EXCLUDED.work_environment_desc, employer_profiles.work_environment_desc),
                        office_images = COALESCE(EXCLUDED.office_images, employer_profiles.office_images),
                        verification_status = COALESCE(EXCLUDED.verification_status, employer_profiles.verification_status),
                        profile_completion_rate = COALESCE(EXCLUDED.profile_completion_rate, employer_profiles.profile_completion_rate),
                        is_profile_completed = COALESCE(EXCLUDED.is_profile_completed, employer_profiles.is_profile_completed),
                        updated_at = NOW()
                     RETURNING *, display_name AS company_name, location AS company_address`,
                    [
                        userId, dName, bio || null, loc || null, avatar_url || null, accType || null,
                        tax_code || null, website || null, business_license_file || null,
                        representative_name || null, representative_title || null, company_name || dName,
                        company_type || null, industry || null, company_size || null, province || loc || null,
                        detailed_address || null, cover_url || null, recruiter_name || null, recruiter_email || null,
                        work_environment_desc || null, office_images ? JSON.stringify(office_images) : '[]',
                        verification_status || 'UNVERIFIED', profile_completion_rate || 30,
                        is_profile_completed !== undefined ? Boolean(is_profile_completed) : false
                    ]
                );
                return res.rows[0];
            } catch (err) {
                // Base fallback if 005 columns not yet present in target db instance
                const fallbackRes = await db.query(
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
                    [userId, dName, bio || null, loc || null, avatar_url || null, accType || null, tax_code || null, website || null, business_license_file || null]
                );
                return fallbackRes.rows[0];
            }
        } else {
            const fName = user.full_name || 'Sinh viên';
            const sch = school || university;
            const prov = province || location;

            try {
                // Try extended insert with all new fields
                const res = await db.query(
                    `INSERT INTO student_profiles (
                        user_id, full_name, bio, school, major, avatar_url, student_code, 
                        experience, default_cv_url, skills, date_of_birth, gender, province, 
                        interested_category, desired_position, detailed_address, languages, 
                        desired_salary, desired_work_type, profile_completion_rate, 
                        is_profile_completed, updated_at
                     )
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW())
                     ON CONFLICT (user_id) DO UPDATE SET
                        bio = COALESCE(EXCLUDED.bio, student_profiles.bio),
                        school = COALESCE(EXCLUDED.school, student_profiles.school),
                        major = COALESCE(EXCLUDED.major, student_profiles.major),
                        avatar_url = COALESCE(EXCLUDED.avatar_url, student_profiles.avatar_url),
                        student_code = COALESCE(EXCLUDED.student_code, student_profiles.student_code),
                        experience = COALESCE(EXCLUDED.experience, student_profiles.experience),
                        default_cv_url = COALESCE(EXCLUDED.default_cv_url, student_profiles.default_cv_url),
                        skills = COALESCE(EXCLUDED.skills, student_profiles.skills),
                        date_of_birth = COALESCE(EXCLUDED.date_of_birth, student_profiles.date_of_birth),
                        gender = COALESCE(EXCLUDED.gender, student_profiles.gender),
                        province = COALESCE(EXCLUDED.province, student_profiles.province),
                        interested_category = COALESCE(EXCLUDED.interested_category, student_profiles.interested_category),
                        desired_position = COALESCE(EXCLUDED.desired_position, student_profiles.desired_position),
                        detailed_address = COALESCE(EXCLUDED.detailed_address, student_profiles.detailed_address),
                        languages = COALESCE(EXCLUDED.languages, student_profiles.languages),
                        desired_salary = COALESCE(EXCLUDED.desired_salary, student_profiles.desired_salary),
                        desired_work_type = COALESCE(EXCLUDED.desired_work_type, student_profiles.desired_work_type),
                        profile_completion_rate = COALESCE(EXCLUDED.profile_completion_rate, student_profiles.profile_completion_rate),
                        is_profile_completed = COALESCE(EXCLUDED.is_profile_completed, student_profiles.is_profile_completed),
                        updated_at = NOW()
                     RETURNING *, school AS university`,
                    [
                        userId, fName, bio || null, sch || null, major || null, avatar_url || null,
                        student_code || null, experience || null, default_cv_url || null, skills || null,
                        date_of_birth || null, gender || null, prov || null, interested_category || null,
                        desired_position || null, detailed_address || null, languages ? JSON.stringify(languages) : '[]',
                        desired_salary || null, desired_work_type || null, profile_completion_rate || 30,
                        is_profile_completed !== undefined ? Boolean(is_profile_completed) : false
                    ]
                );
                return res.rows[0];
            } catch (err) {
                // Base fallback if 005 columns not yet present in target db instance
                const fallbackRes = await db.query(
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
                    [userId, fName, bio || null, sch || null, major || null, avatar_url || null, student_code || null, experience || null, default_cv_url || null, skills || null]
                );
                return fallbackRes.rows[0];
            }
        }
    }
}

module.exports = new ProfileRepository();
