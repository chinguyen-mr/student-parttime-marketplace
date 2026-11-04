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
        const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
        console.log(`Applying ${files.length} migrations from: ${migrationsDir}`);
        for (const file of files) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            await pool.query(sql);
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
