const db = require('../config/db');

class ProfileRepository {
    async findByUserId(userId) {
        const res = await db.query(
            `SELECT p.*, u.email, u.full_name, u.phone, u.role, u.status 
             FROM profiles p
             JOIN users u ON u.id = p.user_id
             WHERE p.user_id = $1`,
            [userId]
        );
        return res.rows[0] || null;
    }

    async upsert(userId, { avatar_url, bio, skills, university, major, company_name, company_address, website }) {
        const res = await db.query(
            `INSERT INTO profiles (user_id, avatar_url, bio, skills, university, major, company_name, company_address, website)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (user_id) DO UPDATE SET
                avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
                bio = COALESCE(EXCLUDED.bio, profiles.bio),
                skills = COALESCE(EXCLUDED.skills, profiles.skills),
                university = COALESCE(EXCLUDED.university, profiles.university),
                major = COALESCE(EXCLUDED.major, profiles.major),
                company_name = COALESCE(EXCLUDED.company_name, profiles.company_name),
                company_address = COALESCE(EXCLUDED.company_address, profiles.company_address),
                website = COALESCE(EXCLUDED.website, profiles.website),
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [userId, avatar_url, bio, skills, university, major, company_name, company_address, website]
        );
        return res.rows[0];
    }
}

module.exports = new ProfileRepository();
