const db = require('../config/db');

class UserRepository {
    async findByEmail(email) {
        const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows[0] || null;
    }

    async findById(id) {
        const res = await db.query(
            'SELECT id, email, full_name, phone, role, status, created_at FROM users WHERE id = $1',
            [id]
        );
        return res.rows[0] || null;
    }

    async create({ email, password_hash, full_name, phone, role }) {
        const res = await db.query(
            `INSERT INTO users (email, password_hash, full_name, phone, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, full_name, phone, role, status, created_at`,
            [email, password_hash, full_name, phone || null, role]
        );
        return res.rows[0];
    }

    async updateStatus(id, status) {
        const res = await db.query(
            `UPDATE users 
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id, email, full_name, role, status, updated_at`,
            [status, id]
        );
        return res.rows[0] || null;
    }

    async findAll({ limit = 50, offset = 0, role = null }) {
        let query = `SELECT id, email, full_name, phone, role, status, created_at FROM users`;
        const params = [];

        if (role) {
            params.push(role);
            query += ` WHERE role = $${params.length}`;
        }

        params.push(limit, offset);
        query += ` ORDER BY id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

        const res = await db.query(query, params);
        return res.rows;
    }
}

module.exports = new UserRepository();
