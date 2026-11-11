const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function createPool() {
    if (process.env.DATABASE_URL) {
        const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');
        return new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: isLocal ? false : { rejectUnauthorized: false },
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
    }

    return new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'cd2_marketplace_db',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });
}

let pool = createPool();

pool.on('error', (err) => {
    console.error(`[DB] Unexpected error on idle PostgreSQL client (${err.code || 'UNKNOWN'})`);
});

async function testConnection() {
    try {
        await pool.query('SELECT 1');
        return { ok: true };
    } catch (err) {
        let hint = 'Không xác định được nguyên nhân.';
        if (err.code === 'ECONNREFUSED') {
            hint = 'PostgreSQL chưa chạy hoặc DB_PORT sai.';
        } else if (err.code === '28P01') {
            hint = 'Sai DB_USER/DB_PASSWORD.';
        } else if (err.code === '3D000') {
            hint = `Database "${process.env.DB_NAME}" chưa tồn tại. Chạy: npm run migrate`;
        } else if (err.code === 'ENOTFOUND') {
            hint = 'DB_HOST không phân giải được.';
        }
        console.error(`[DB] Kết nối thất bại (${err.code || 'UNKNOWN'}): ${hint}`);
        return { ok: false, code: err.code || 'UNKNOWN', hint };
    }
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    get pool() {
        return pool;
    },
    set pool(val) {
        pool = val;
    },
    refreshPool: () => {
        try {
            pool.end().catch(() => {});
        } catch (e) {}
        pool = createPool();
        pool.on('error', (err) => {
            console.error(`[DB] Unexpected error on idle PostgreSQL client (${err.code || 'UNKNOWN'})`);
        });
        return pool;
    },
    testConnection,
};
