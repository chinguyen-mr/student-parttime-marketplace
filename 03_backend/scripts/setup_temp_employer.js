const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

async function setupTempEmployer() {
  console.log('=== KHỞI TẠO TÀI KHOẢN EMPLOYER TEST VĨNH VIỄN (KHÔNG TỰ ĐỘNG XÓA) ===');
  
  const email = 'employer.test@vlu.edu.vn';
  const rawPassword = 'password123';
  const fullName = 'Công Ty Công Nghệ Giáo Dục Văn Lang (VLU Tech)';
  const phone = '0987654321';
  const role = 'EMPLOYER';

  try {
    // 1. Kiểm tra tài khoản trong bảng users
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    let userId;

    const password_hash = await bcrypt.hash(rawPassword, 10);

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      console.log(`Đã tìm thấy tài khoản (ID: ${userId}), đang cập nhật trạng thái ACTIVE & mật khẩu...`);
      await db.query(
        `UPDATE users 
         SET password_hash = $1, full_name = $2, phone = $3, role = $4, status = 'ACTIVE', updated_at = NOW()
         WHERE id = $5`,
        [password_hash, fullName, phone, role, userId]
      );
    } else {
      console.log('Tạo mới tài khoản Employer...');
      const insertRes = await db.query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, status)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
         RETURNING id`,
        [email, password_hash, fullName, phone, role]
      );
      userId = insertRes.rows[0].id;
      console.log(`Đã tạo thành công User ID: ${userId}`);
    }

    // 2. Tạo hoặc cập nhật Employer Profile (VERIFIED, Doanh nghiệp / Công ty, MST, Website, GPKD)
    const profileCheck = await db.query('SELECT user_id FROM employer_profiles WHERE user_id = $1', [userId]);
    const companyName = 'Tập Đoàn Giáo Dục & Công Nghệ VLU Enterprise';
    const bio = 'Doanh nghiệp đối tác chiến lược của Đại học Văn Lang chuyên cung cấp các dự án phần mềm, truyền thông sự kiện và cơ hội việc làm bán thời gian cho sinh viên.';
    const location = '69/68 Đặng Thùy Trâm, Phường 13, Quận Bình Thạnh, TP. Hồ Chí Minh';
    const avatarUrl = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop';
    const accountType = 'Doanh nghiệp / Công ty';
    const taxCode = '0316889977';
    const website = 'https://vlu.edu.vn/enterprise';
    const businessLicenseFile = '/uploads/licenses/GPKD_VLU_ENTERPRISE_2026.pdf';

    if (profileCheck.rows.length > 0) {
      await db.query(
        `UPDATE employer_profiles
         SET display_name = $1, bio = $2, location = $3, avatar_url = $4,
             account_type = $5, tax_code = $6, website = $7, business_license_file = $8,
             email_verified_at = NOW(), phone_verified_at = NOW(), updated_at = NOW()
         WHERE user_id = $9`,
        [companyName, bio, location, avatarUrl, accountType, taxCode, website, businessLicenseFile, userId]
      );
      console.log('Đã cập nhật Employer Profile: Trạng thái VERIFIED, Loại tài khoản: Doanh nghiệp / Công ty.');
    } else {
      await db.query(
        `INSERT INTO employer_profiles (
           user_id, display_name, bio, location, avatar_url, 
           account_type, tax_code, website, business_license_file, 
           email_verified_at, phone_verified_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())`,
        [userId, companyName, bio, location, avatarUrl, accountType, taxCode, website, businessLicenseFile]
      );
      console.log('Đã tạo mới Employer Profile: Trạng thái VERIFIED, Loại tài khoản: Doanh nghiệp / Công ty.');
    }

    // 3. Khởi tạo dữ liệu mẫu cho Employer test
    // 3.1. Tạo 2 Jobs: 1 Part-time OPEN, 1 Freelance OPEN
    let jobPtId, jobFlId;
    const ptCheck = await db.query("SELECT id FROM jobs WHERE employer_id = $1 AND work_type = 'PART_TIME'", [userId]);
    if (ptCheck.rows.length > 0) {
      jobPtId = ptCheck.rows[0].id;
    } else {
      const insPt = await db.query(
        `INSERT INTO jobs (
           employer_id, title, description, requirements, category, location,
           salary_type, salary, work_type, status, moderation_status,
           application_deadline, job_banner_url
         ) VALUES (
           $1, 'Lập trình viên Frontend React.js Part-time',
           'Phát triển các component giao diện React cho hệ thống JobNest, hỗ trợ sinh viên học hỏi thực tế.',
           'Biết HTML/CSS/JavaScript, React cơ bản. Nhiệt tình, có trách nhiệm.',
           'Công nghệ thông tin', 'Quận Bình Thạnh, TP.HCM',
           'HOURLY', 45000, 'PART_TIME', 'OPEN', 'APPROVED',
           NOW() + INTERVAL '30 days', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'
         ) RETURNING id`,
        [userId]
      );
      jobPtId = insPt.rows[0].id;
    }

    const flCheck = await db.query("SELECT id FROM jobs WHERE employer_id = $1 AND work_type = 'FREELANCE'", [userId]);
    if (flCheck.rows.length > 0) {
      jobFlId = flCheck.rows[0].id;
    } else {
      const insFl = await db.query(
        `INSERT INTO jobs (
           employer_id, title, description, requirements, category, location,
           salary_type, salary, work_type, status, moderation_status,
           application_deadline, job_banner_url
         ) VALUES (
           $1, 'Thiết kế Banner Sự Kiện & UI Landing Page',
           'Thiết kế bộ nhận diện truyền thông và wireframe giao diện Figma cho sự kiện VLU Job Fair 2026.',
           'Sử dụng thành thạo Figma/Photoshop, có portfolio sản phẩm trước đó.',
           'Thiết kế đồ họa', 'Làm việc từ xa (Remote)',
           'FIXED', 3500000, 'FREELANCE', 'OPEN', 'APPROVED',
           NOW() + INTERVAL '20 days', 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800'
         ) RETURNING id`,
        [userId]
      );
      jobFlId = insFl.rows[0].id;
    }
    console.log(`Kiểm tra Jobs: Job Part-time #${jobPtId}, Job Freelance #${jobFlId}`);

    // 3.2. Lấy tài khoản sinh viên có sẵn để tạo Application & Proposal & Assignment
    const studentsRes = await db.query("SELECT id, full_name, email FROM users WHERE role = 'STUDENT' LIMIT 3");
    if (studentsRes.rows.length > 0) {
      const student1 = studentsRes.rows[0];
      const student2 = studentsRes.rows[1] || studentsRes.rows[0];

      // Tạo Application cho Job Part-time (PENDING)
      let appId;
      const appCheck = await db.query('SELECT id FROM applications WHERE job_id = $1 AND student_id = $2', [jobPtId, student1.id]);
      if (appCheck.rows.length === 0) {
        const insApp = await db.query(
          `INSERT INTO applications (job_id, student_id, cover_letter, status, applied_at)
           VALUES ($1, $2, 'Em là sinh viên năm 3 khoa CNTT, rất đam mê ReactJS và muốn cống hiến cho công ty.', 'PENDING', NOW() - INTERVAL '2 hours')
           RETURNING id`,
          [jobPtId, student1.id]
        );
        appId = insApp.rows[0].id;
        console.log(`Đã tạo Application mẫu của sinh viên ${student1.full_name} cho Job #${jobPtId}`);
      } else {
        appId = appCheck.rows[0].id;
      }

      // Tạo Proposal cho Job Freelance (SUBMITTED)
      let propId;
      const propCheck = await db.query('SELECT id FROM freelance_proposals WHERE job_id = $1 AND student_id = $2', [jobFlId, student2.id]);
      if (propCheck.rows.length === 0) {
        const insProp = await db.query(
          `INSERT INTO freelance_proposals (job_id, student_id, proposal_text, proposed_price, estimated_duration, status, submitted_at)
           VALUES ($1, $2, 'Em có kinh nghiệm thiết kế UI/UX trên Figma 1 năm, cam kết bàn giao đúng hạn.', 3200000, '7 ngày', 'SUBMITTED', NOW() - INTERVAL '4 hours')
           RETURNING id`,
          [jobFlId, student2.id]
        );
        propId = insProp.rows[0].id;
        console.log(`Đã tạo Proposal mẫu của sinh viên ${student2.full_name} cho Job #${jobFlId}`);
      } else {
        propId = propCheck.rows[0].id;
      }

      // Tạo Work Assignment (IN_PROGRESS) để test WF-E09, WF-E10, WF-E11
      const assignCheck = await db.query('SELECT id FROM work_assignments WHERE job_id = $1 AND student_id = $2', [jobPtId, student1.id]);
      if (assignCheck.rows.length === 0 && appId) {
        const insAssign = await db.query(
          `INSERT INTO work_assignments (job_id, student_id, application_id, status, started_at, created_at, updated_at)
           VALUES ($1, $2, $3, 'IN_PROGRESS', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW())
           RETURNING id`,
          [jobPtId, student1.id, appId]
        );
        const assignId = insAssign.rows[0].id;
        console.log(`Đã tạo Work Assignment mẫu #${assignId} trạng thái IN_PROGRESS`);

        // Tạo 1 deliverable mẫu trong work_deliverables
        try {
          await db.query(
            `INSERT INTO work_deliverables (assignment_id, file_url, note, version, status, submitted_at)
             VALUES ($1, 'https://github.com/vlu-student/jobnest-frontend', 'Bàn giao giao diện trang chủ và chi tiết theo hợp đồng.', 1, 'SUBMITTED', NOW() - INTERVAL '1 day')`,
            [assignId]
          );
          console.log(`Đã tạo Deliverable mẫu bàn giao cho Assignment #${assignId}`);
        } catch (e) {
          // Bỏ qua nếu bảng chưa có
        }
      }

      // Tạo Notification cho Employer
      const notifCheck = await db.query('SELECT id FROM notifications WHERE user_id = $1 LIMIT 1', [userId]);
      if (notifCheck.rows.length === 0) {
        await db.query(
          `INSERT INTO notifications (user_id, title, body, type, read_at, created_at)
           VALUES ($1, 'Ứng viên mới nộp hồ sơ', $2, 'APPLICATION', NULL, NOW())`,
          [userId, `Sinh viên ${student1.full_name} vừa nộp đơn ứng tuyển cho tin tuyển dụng #${jobPtId}`]
        );
        console.log('Đã tạo Notification mẫu cho Employer');
      }
    }

    console.log('================================================================');
    console.log('KHỞI TẠO THÀNH CÔNG TÀI KHOẢN EMPLOYER TEST VĨNH VIỄN:');
    console.log(' - Email:         employer.test@vlu.edu.vn');
    console.log(' - Mật khẩu:      password123');
    console.log(' - Role:          EMPLOYER');
    console.log(' - Trạng thái:    ACTIVE');
    console.log(' - Xác minh:      VERIFIED (Đầy đủ email, phone, GPKD)');
    console.log(' - Loại tài khoản: Doanh nghiệp / Công ty');
    console.log(' - User ID:       ' + userId);
    console.log('================================================================');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khởi tạo tài khoản employer.test:', err);
    process.exit(1);
  }
}

setupTempEmployer();
