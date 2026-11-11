const { pool } = require('../src/config/db');

const tables = [
    'users',
    'student_profiles',
    'employer_profiles',
    'jobs',
    'job_work_schedules',
    'student_availabilities',
    'applications',
    'freelance_proposals',
    'assignments',
    'notifications',
    'admin_audit_logs',
    'categories',
    'job_reports',
    'reviews'
];

async function main() {
    try {
        const counts = {};
        for (const t of tables) {
            try {
                const res = await pool.query(`SELECT COUNT(*) FROM "${t}"`);
                counts[t] = parseInt(res.rows[0].count, 10);
            } catch (err) {
                counts[t] = `ERROR: ${err.message}`;
            }
        }
        console.log(JSON.stringify(counts, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

main();

