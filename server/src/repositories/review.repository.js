const db = require('../config/db');

class ReviewRepository {
    async create(jobId, reviewerId, revieweeId, rating, comment) {
        const res = await db.query(
            `INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [jobId, reviewerId, revieweeId, rating, comment]
        );
        return res.rows[0];
    }

    async findByJobAndUsers(jobId, reviewerId, revieweeId) {
        const res = await db.query(
            `SELECT * FROM reviews 
             WHERE job_id = $1 AND reviewer_id = $2 AND reviewee_id = $3`,
            [jobId, reviewerId, revieweeId]
        );
        return res.rows[0] || null;
    }

    async findByUserId(userId) {
        const res = await db.query(
            `SELECT r.*, u.full_name AS reviewer_name, j.title AS job_title
             FROM reviews r
             JOIN users u ON u.id = r.reviewer_id
             JOIN jobs j ON j.id = r.job_id
             WHERE r.reviewee_id = $1
             ORDER BY r.created_at DESC`,
            [userId]
        );
        return res.rows;
    }

    async getAverageRating(userId) {
        const res = await db.query(
            `SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as total_reviews
             FROM reviews
             WHERE reviewee_id = $1`,
            [userId]
        );
        return res.rows[0];
    }
}

module.exports = new ReviewRepository();
