const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function runSeed() {
    try {
        const seedsDir = path.resolve(__dirname, '../../../02_database/seeds');
        const seedFiles = fs.readdirSync(seedsDir)
            .filter(f => f.endsWith('.sql') && !f.toLowerCase().includes('rollback'))
            .sort((a, b) => a.localeCompare(b));

        console.log(`Found ${seedFiles.length} seed files in ${seedsDir}`);
        for (const file of seedFiles) {
            const seedPath = path.join(seedsDir, file);
            console.log(`Applying seed: ${file}...`);
            const sql = fs.readFileSync(seedPath, 'utf8');
            await pool.query(sql);
        }
        console.log('All seed data inserted successfully!');
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

runSeed();
