const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123',
  database: process.env.DB_NAME || 'cd2_marketplace_db'
});

async function run() {
  const migrationPath = path.join(__dirname, '../../02_database/migrations/update_columns_for_data_v2.sql');
  console.log('Reading migration file:', migrationPath);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Connecting to database:', process.env.DB_NAME);
  await pool.query(sql);
  console.log('✅ Migration executed successfully!');

  const checkSql = `
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('employer_profiles', 'jobs', 'work_progress')
      AND column_name IN (
        'account_type', 'tax_code', 'website', 'business_license_file', 
        'application_deadline', 'job_banner_url', 'started_at'
      )
    ORDER BY table_name, column_name;
  `;
  const result = await pool.query(checkSql);
  console.log('\n--- VERIFIED COLUMNS IN DATABASE ---');
  result.rows.forEach(r => {
    console.log(`Table: [${r.table_name.padEnd(18)}] Column: [${r.column_name.padEnd(22)}] Type: [${r.data_type}]`);
  });
  await pool.end();
}

run().catch(err => {
  console.error('❌ Migration error:', err.message);
  pool.end();
  process.exit(1);
});
