const fs = require('fs');
const path = require('path');
const { Client, Pool } = require('pg');
require('dotenv').config();

async function runMigration() {
    const dbName = process.env.DB_NAME || 'cd2_marketplace_db';
    console.log(`Checking if database "${dbName}" exists...`);

    const adminClient = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: 'postgres',
    });

    try {
        await adminClient.connect();
        const checkRes = await adminClient.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );

        if (checkRes.rowCount === 0) {
            console.log(`Database "${dbName}" does not exist. Creating...`);
            await adminClient.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database "${dbName}" created successfully!`);
        } else {
            console.log(`Database "${dbName}" already exists.`);
        }
    } catch (err) {
        console.error('Warning during DB existence check:', err.message);
    } finally {
        await adminClient.end();
    }

    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: dbName,
    });

    try {
        const migrationsDir = path.resolve(__dirname, '../../../02_database/migrations');
        // Define deterministic order for base tables and dependent migrations
        const orderedTableFiles = [
            'users.sql',
            'categories.sql',
            'employer_profiles.sql',
            'student_profiles.sql',
            'jobs.sql',
            'part_time_details.sql',
            'freelance_details.sql',
            'seasonal_details.sql',
            'job_skills.sql',
            'job_saved.sql',
            'job_views.sql',
            'applications.sql',
            'application_histories.sql',
            'freelance_proposals.sql',
            'proposal_histories.sql',
            'work_assignments.sql',
            'work_progress.sql',
            'work_deliverables.sql',
            'deliverable_reviews.sql',
            'reviews.sql',
            'reports.sql',
            'report_actions.sql',
            'notifications.sql',
            'admin_logs.sql',
            'student_cvs.sql',
            'student_educations.sql',
            'student_experiences.sql',
            'student_skills.sql',
            'verification_tokens.sql',
            'password_reset_tokens.sql',
            'update_columns_for_data_v2.sql',
            '003_create_schedules_and_availability.sql'
        ];

        // Ensure schema_migrations table exists for version tracking
        await pool.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                version VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const allSqlFiles = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql') && !f.toLowerCase().includes('rollback'));

        // Sort files according to orderedTableFiles, placing unlisted new migrations at the end
        const files = allSqlFiles.sort((a, b) => {
            const idxA = orderedTableFiles.indexOf(a);
            const idxB = orderedTableFiles.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });

        console.log(`Found ${files.length} forward migration files (rollback scripts excluded).`);

        for (const file of files) {
            const alreadyApplied = await pool.query(
                `SELECT 1 FROM schema_migrations WHERE version = $1`,
                [file]
            );

            if (alreadyApplied.rowCount > 0) {
                console.log(`- Skipping ${file} (already applied)`);
                continue;
            }

            console.log(`+ Applying migration: ${file}...`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            await pool.query(sql);
            await pool.query(
                `INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING`,
                [file]
            );
        }
        console.log('All migrations applied successfully!');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

runMigration();
