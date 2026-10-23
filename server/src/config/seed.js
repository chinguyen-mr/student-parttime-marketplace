const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function runSeed() {
    try {
        const seedPath = path.join(__dirname, '../../seeds/001_seed_data.sql');
        const sql = fs.readFileSync(seedPath, 'utf8');
        console.log(`Applying seed data from: ${seedPath}`);
        await pool.query(sql);
        console.log('Seed data inserted successfully!');
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

runSeed();
