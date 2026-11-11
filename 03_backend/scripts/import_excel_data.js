const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const XLSX = require('xlsx');
const { pool } = require('../src/config/db');

// Path to Excel file (Chỉ sử dụng Data_v2.xlsx trong 02_database)
const EXCEL_PATH = path.join(__dirname, '../../02_database/Data_v2.xlsx');

const DEFAULT_BCRYPT_HASH = '$2b$10$71YiwSCn2zYmMvUwKYoWu.tgrK8Dc/Tquy4JLS6e4OFcvpk1O17Ua'; // '123456'

// High-resolution Unsplash CDN fallback maps by category
const CATEGORY_BANNERS = {
  'Công nghệ thông tin': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  'Thiết kế đồ họa': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
  'F&B / Dịch vụ ăn uống': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
  'Bán lẻ': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
  'Logistics / Giao nhận': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  'Sản xuất / Kỹ thuật': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
  'Giáo dục / Đào tạo': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
  'Hàng tiêu dùng / FMCG': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
};

function parseSalary(salaryRange) {
  if (!salaryRange) return { salary: 35000, salary_type: 'HOURLY' };
  const str = String(salaryRange).trim();
  const digits = str.replace(/[^\d]/g, '');
  const num = parseInt(digits, 10) || 35000;
  if (str.includes('giờ')) {
    return { salary: num, salary_type: 'HOURLY' };
  }
  if (str.includes('tháng')) {
    return { salary: num, salary_type: 'MONTHLY' };
  }
  return { salary: num, salary_type: 'PROJECT' };
}

async function runImport() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('File not found:', EXCEL_PATH);
    process.exit(1);
  }

  console.log('Loading Excel file:', EXCEL_PATH);
  const wb = XLSX.readFile(EXCEL_PATH);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. IMPORT NguoiDung (Users)
    console.log('--- 1. Importing NguoiDung (Users) ---');
    const usersSheet = XLSX.utils.sheet_to_json(wb.Sheets['NguoiDung'] || []);
    let usersInserted = 0;
    let usersUpdated = 0;

    for (const u of usersSheet) {
      const userId = Number(u.user_id);
      const email = String(u.email || '').trim().toLowerCase();
      const fullName = String(u.full_name || '').trim();
      const phone = u.phone ? String(u.phone).trim() : null;
      const role = String(u.role || 'STUDENT').trim().toUpperCase();
      const status = String(u.status || 'ACTIVE').trim().toUpperCase();

      // Check if user exists by id or email
      const existing = await client.query('SELECT id FROM users WHERE id = $1 OR email = $2', [userId, email]);
      if (existing.rows.length > 0) {
        await client.query(
          `UPDATE users 
           SET email = $1, full_name = $2, phone = $3, role = $4, status = $5, updated_at = NOW()
           WHERE id = $6`,
          [email, fullName, phone, role, status, existing.rows[0].id]
        );
        usersUpdated++;
      } else {
        await client.query(
          `INSERT INTO users (id, email, password_hash, full_name, phone, role, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
          [userId, email, DEFAULT_BCRYPT_HASH, fullName, phone, role, status]
        );
        usersInserted++;
      }
    }
    console.log(`Users: ${usersInserted} inserted, ${usersUpdated} updated.`);

    // 2. IMPORT NhaTuyenDung (Employers / Profiles with Real Logos)
    console.log('--- 2. Importing NhaTuyenDung (Profiles with Real Logos) ---');
    const employersSheet = XLSX.utils.sheet_to_json(wb.Sheets['NhaTuyenDung'] || []);
    let employersProcessed = 0;

    for (const emp of employersSheet) {
      const employerId = Number(emp.employer_id);
      const companyName = String(emp.company_name || '').trim();
      const logoUrl = emp.company_logo_url ? String(emp.company_logo_url).trim() : null;
      const industry = emp.industry ? String(emp.industry).trim() : 'Bán lẻ & Dịch vụ';
      const address = emp.google_maps_address ? String(emp.google_maps_address).trim() : (emp.city || 'TP. Hồ Chí Minh');
      const website = emp.website ? String(emp.website).trim() : null;
      const bio = emp.company_description ? String(emp.company_description).trim() : null;
      const companySize = '100 - 499 nhân viên';

      // Check if user exists first
      const userCheck = await client.query('SELECT id FROM users WHERE id = $1', [employerId]);
      if (userCheck.rows.length === 0) {
        continue;
      }

      // Upsert profile
      const profCheck = await client.query('SELECT id FROM profiles WHERE user_id = $1', [employerId]);
      if (profCheck.rows.length > 0) {
        await client.query(
          `UPDATE profiles 
           SET company_name = $1, company_address = $2, website = $3,
               company_size = $4, company_industry = $5, bio = $6,
               company_logo_url = $7, avatar_url = $7, updated_at = NOW()
           WHERE user_id = $8`,
          [companyName, address, website, companySize, industry, bio, logoUrl, employerId]
        );
      } else {
        await client.query(
          `INSERT INTO profiles (user_id, company_name, company_address, website, company_size, company_industry, bio, company_logo_url, avatar_url, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, NOW())`,
          [employerId, companyName, address, website, companySize, industry, bio, logoUrl]
        );
      }
      employersProcessed++;
    }

    // Also enrich existing demo employer profiles (TechCorp Vietnam & Coffee House) with real logos!
    await client.query(
      `UPDATE profiles
       SET company_logo_url = 'https://logo.clearbit.com/fpt.com.vn',
           avatar_url = 'https://logo.clearbit.com/fpt.com.vn',
           company_size = '250 - 500 nhân viên',
           company_industry = 'Công nghệ phần mềm & Giải pháp Thiết kế số',
           updated_at = NOW()
       WHERE user_id = 2`
    );

    await client.query(
      `UPDATE profiles
       SET company_logo_url = 'https://logo.clearbit.com/highlandscoffee.com.vn',
           avatar_url = 'https://logo.clearbit.com/highlandscoffee.com.vn',
           company_size = '100 - 250 nhân viên',
           company_industry = 'Chuỗi F&B & Dịch vụ đồ uống',
           updated_at = NOW()
       WHERE user_id = 3`
    );

    console.log(`Employers processed: ${employersProcessed}. Demo employers enriched with real logos.`);

    // 3. IMPORT TinTuyenDung (Jobs with Unsplash Banners)
    console.log('--- 3. Importing TinTuyenDung (Jobs with Banners) ---');
    const jobsSheet = XLSX.utils.sheet_to_json(wb.Sheets['TinTuyenDung'] || []);
    let jobsInserted = 0;
    let jobsUpdated = 0;

    for (const j of jobsSheet) {
      const jobId = Number(j.job_id);
      const employerId = Number(j.employer_id);
      const title = String(j.title || '').trim();
      const category = String(j.category || 'Công nghệ thông tin').trim();
      const location = String(j.exact_google_address || j.province_city || 'TP. Hồ Chí Minh').trim();
      const description = String(j.description || '').trim();
      const requirements = String(j.requirements || '').trim();
      const { salary, salary_type } = parseSalary(j.salary_range);
      const workSchedule = String(j.work_time || 'Ca làm việc linh hoạt').trim();
      const bannerUrl = j.job_banner_url ? String(j.job_banner_url).trim() : (CATEGORY_BANNERS[category] || CATEGORY_BANNERS['Công nghệ thông tin']);
      const deadline = j.application_deadline ? new Date(j.application_deadline) : new Date('2026-11-30');
      const createdAt = j.posted_date ? new Date(j.posted_date) : new Date();

      // Check employer exists
      const empCheck = await client.query('SELECT id FROM users WHERE id = $1', [employerId]);
      if (empCheck.rows.length === 0) {
        continue;
      }

      const existingJob = await client.query('SELECT id FROM jobs WHERE id = $1', [jobId]);
      if (existingJob.rows.length > 0) {
        await client.query(
          `UPDATE jobs 
           SET employer_id = $1, title = $2, category = $3, location = $4,
               description = $5, requirements = $6, salary = $7, salary_type = $8,
               work_schedule = $9, banner_url = $10, deadline = $11, status = 'OPEN',
               moderation_status = 'APPROVED', updated_at = NOW()
           WHERE id = $12`,
          [employerId, title, category, location, description, requirements, salary, salary_type, workSchedule, bannerUrl, deadline, jobId]
        );
        jobsUpdated++;
      } else {
        await client.query(
          `INSERT INTO jobs (id, employer_id, title, category, location, description, requirements,
                             salary, salary_type, work_type, work_schedule, banner_url, deadline,
                             status, moderation_status, created_at, updated_at,
                             benefits, experience, education, headcount, level)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PART_TIME', $10, $11, $12, 'OPEN', 'APPROVED', $13, NOW(),
                   $14, $15, $16, 3, 'Thực tập sinh / Bán thời gian')`,
          [
            jobId, employerId, title, category, location, description, requirements,
            salary, salary_type, workSchedule, bannerUrl, deadline, createdAt,
            '• Thù lao rõ ràng, thanh toán đúng hạn.\n• Được cấp giấy xác nhận thực tập / làm việc từ doanh nghiệp.\n• Thời gian làm việc linh hoạt phù hợp lịch học.\n• Đánh giá uy tín hai chiều trên nền tảng JobNest.',
            'Không yêu cầu kinh nghiệm',
            'Sinh viên Cao đẳng / Đại học'
          ]
        );
        jobsInserted++;
      }
    }

    // Also enrich existing jobs 1, 2, 3, 4 with high-res Unsplash banners
    await client.query(
      `UPDATE jobs 
       SET banner_url = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'
       WHERE id = 1 AND (banner_url IS NULL OR banner_url = '')`
    );
    await client.query(
      `UPDATE jobs 
       SET banner_url = 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80'
       WHERE id = 2 AND (banner_url IS NULL OR banner_url = '')`
    );
    await client.query(
      `UPDATE jobs 
       SET banner_url = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'
       WHERE id = 3 AND (banner_url IS NULL OR banner_url = '')`
    );
    await client.query(
      `UPDATE jobs 
       SET banner_url = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
       WHERE id = 4 AND (banner_url IS NULL OR banner_url = '')`
    );

    console.log(`Jobs: ${jobsInserted} inserted, ${jobsUpdated} updated.`);

    // 4. IMPORT HoSoUngTuyen (Applications)
    console.log('--- 4. Importing HoSoUngTuyen (Applications) ---');
    const appsSheet = XLSX.utils.sheet_to_json(wb.Sheets['HoSoUngTuyen'] || []);
    let appsInserted = 0;

    for (const app of appsSheet) {
      const appId = Number(app.application_id);
      const jobId = Number(app.job_id);
      const studentId = Number(app.student_id);
      const coverLetter = String(app.cover_letter || '').trim();
      const cvUrl = String(app.cv_file_name || '').trim();
      const status = String(app.status || 'PENDING').trim().toUpperCase();
      const appliedAt = app.applied_date ? new Date(app.applied_date) : new Date();

      // Ensure job and student exist
      const jobCheck = await client.query('SELECT id FROM jobs WHERE id = $1', [jobId]);
      const studentCheck = await client.query('SELECT id FROM users WHERE id = $1', [studentId]);
      if (jobCheck.rows.length === 0 || studentCheck.rows.length === 0) {
        continue;
      }

      const existingApp = await client.query('SELECT id FROM applications WHERE id = $1', [appId]);
      if (existingApp.rows.length === 0) {
        await client.query(
          `INSERT INTO applications (id, job_id, student_id, cover_letter, cv_url, status, applied_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [appId, jobId, studentId, coverLetter, cvUrl, status, appliedAt]
        );
        appsInserted++;
      }
    }
    console.log(`Applications inserted: ${appsInserted}.`);

    // 5. IMPORT DanhGiaHaiChieu (Reviews)
    console.log('--- 5. Importing DanhGiaHaiChieu (Reviews) ---');
    const reviewsSheet = XLSX.utils.sheet_to_json(wb.Sheets['DanhGiaHaiChieu'] || []);
    let reviewsInserted = 0;

    for (const r of reviewsSheet) {
      const jobId = Number(r.job_id);
      const rating = Math.min(5, Math.max(1, Number(r.rating) || 5));
      const comment = String(r.comment || '').trim();
      const createdAt = r.created_date ? new Date(r.created_date) : new Date();

      // Find job and employer
      const jobRes = await client.query('SELECT id, employer_id FROM jobs WHERE id = $1', [jobId]);
      if (jobRes.rows.length === 0) continue;
      const employerId = jobRes.rows[0].employer_id;

      // Find an applicant student for this job if possible
      const appRes = await client.query('SELECT student_id FROM applications WHERE job_id = $1 LIMIT 1', [jobId]);
      const studentId = appRes.rows.length > 0 ? appRes.rows[0].student_id : 4; // fallback student ID

      const reviewerId = r.reviewer_type === 'STUDENT' ? studentId : employerId;
      const revieweeId = r.reviewer_type === 'STUDENT' ? employerId : studentId;

      await client.query(
        `INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [jobId, reviewerId, revieweeId, rating, comment, createdAt]
      );
      reviewsInserted++;
    }
    console.log(`Reviews inserted: ${reviewsInserted}.`);

    // 6. Reset all sequences to MAX(id)
    console.log('--- 6. Syncing PostgreSQL Primary Key Sequences ---');
    await client.query(`SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));`);
    await client.query(`SELECT setval(pg_get_serial_sequence('jobs', 'id'), COALESCE((SELECT MAX(id) FROM jobs), 1));`);
    await client.query(`SELECT setval(pg_get_serial_sequence('applications', 'id'), COALESCE((SELECT MAX(id) FROM applications), 1));`);
    await client.query(`SELECT setval(pg_get_serial_sequence('profiles', 'id'), COALESCE((SELECT MAX(id) FROM profiles), 1));`);
    await client.query(`SELECT setval(pg_get_serial_sequence('reviews', 'id'), COALESCE((SELECT MAX(id) FROM reviews), 1));`);

    await client.query('COMMIT');
    console.log('✅ ALL DATA FROM Data_v2.xlsx SUCCESSFULLY IMPORTED!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Import failed, rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runImport();
