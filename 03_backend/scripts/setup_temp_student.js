const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

async function setupTempStudent() {
  console.log('--- KHỞI TẠO TÀI KHOẢN SINH VIÊN TẠM THỜI (chỉ INSERT nếu chưa tồn tại) ---');

  const email = 'student.test@vlu.edu.vn';
  const rawPassword = process.env.SEED_STUDENT_PASSWORD;
  if (!rawPassword) {
    console.error('❌ Thiếu biến môi trường SEED_STUDENT_PASSWORD.');
    console.error('   Ví dụ (PowerShell): $env:SEED_STUDENT_PASSWORD="..."; node scripts/setup_temp_student.js');
    console.error('   Ví dụ (Git Bash):   SEED_STUDENT_PASSWORD="..." node scripts/setup_temp_student.js');
    process.exit(1);
  }
  const fullName = 'Nguyễn Văn Chí (Sinh Viên Test)';
  const phone = '0901234567';
  const role = 'STUDENT';

  // 1. Nếu tài khoản đã tồn tại → KHÔNG sửa gì, thoát.
  const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);

  if (existingUser.rows.length > 0) {
    console.log(`ℹ️ Tài khoản sinh viên đã tồn tại (ID: ${existingUser.rows[0].id}).`);
    console.log('   Không thay đổi gì theo chính sách bảo vệ dữ liệu hiện có.');
    process.exit(0);
  }

  // 2. Tạo mới (email chưa tồn tại)
  const password_hash = await bcrypt.hash(rawPassword, 10);
  console.log('Tạo mới tài khoản sinh viên...');
  const insertRes = await db.query(
    `INSERT INTO users (email, password_hash, full_name, phone, role, status)
     VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
     RETURNING id`,
    [email, password_hash, fullName, phone, role]
  );
  const newUserId = insertRes.rows[0].id;
  console.log(`Đã tạo thành công User ID: ${newUserId}`);

  // 3. Tạo Student Profile (tài khoản mới nên chưa có profile)
  const defaultCvUrl = 'https://jobnest.vn/uploads/cv/CV_NguyenVanChi_Default.pdf';
  const skills = ['React.js', 'Node.js', 'Giao tiếp', 'Làm việc nhóm', 'SQL'];

  await db.query(
    `INSERT INTO student_profiles (user_id, full_name, student_code, school, major, bio, experience, default_cv_url, skills, updated_at)
     VALUES ($1, $2, '20110001', 'Trường Đại học Văn Lang (VLU)', 'Công nghệ Thông tin',
             'Sinh viên năm 4 đam mê lập trình web và ứng dụng thực tế.',
             'Đã hoàn thành dự án Website thương mại điện tử, có 6 tháng làm trợ lý kỹ thuật.',
             $3, $4, NOW())`,
    [newUserId, fullName, defaultCvUrl, skills]
  );
  console.log('Đã tạo mới Student Profile.');

  // 4. Tạo Applications và Assignments mẫu (1 PENDING, 1 IN_PROGRESS, 1 COMPLETED)
  // Tài khoản mới nên không cần DELETE dữ liệu cũ.

  // Đơn 1: PENDING (Job 110 - Data Entry part-time)
  const jobPending = await db.query("SELECT id, title, employer_id FROM jobs WHERE id = 110 OR status = 'OPEN' ORDER BY id DESC LIMIT 1");
  if (jobPending.rows.length > 0) {
    const jP = jobPending.rows[0];
    await db.query(
      `INSERT INTO applications (job_id, student_id, cover_letter, status, applied_at)
       VALUES ($1, $2, 'Em rất quan tâm đến vị trí này và mong muốn được cống hiến.', 'PENDING', NOW() - INTERVAL '1 day')`,
      [jP.id, newUserId]
    );
    console.log(`Đã tạo đơn ứng tuyển PENDING cho job "${jP.title}"`);
  }

  // Đơn 2: IN_PROGRESS (Job 109 - Nhân viên Trưng bày sản phẩm)
  const jobInProgress = await db.query("SELECT id, title, employer_id FROM jobs WHERE id = 109 LIMIT 1");
  if (jobInProgress.rows.length > 0) {
    const jIP = jobInProgress.rows[0];
    const appRes = await db.query(
      `INSERT INTO applications (job_id, student_id, cover_letter, status, applied_at)
       VALUES ($1, $2, 'Em đã có kinh nghiệm phù hợp và có thể bắt đầu ngay.', 'ACCEPTED', NOW() - INTERVAL '3 days')
       RETURNING id`,
      [jIP.id, newUserId]
    );
    const appId = appRes.rows[0].id;
    await db.query(
      `INSERT INTO work_assignments (job_id, student_id, application_id, status, created_at)
       VALUES ($1, $2, $3, 'IN_PROGRESS', NOW() - INTERVAL '2 days')`,
      [jIP.id, newUserId, appId]
    );
    console.log(`Đã tạo công việc được giao IN_PROGRESS cho job "${jIP.title}"`);
  }

  // Đơn 3: COMPLETED (Job 106 - Hoàn thành, sẵn sàng để Sinh viên đánh giá theo WF-S10)
  const jobCompleted = await db.query("SELECT id, title, employer_id FROM jobs WHERE id = 106 LIMIT 1");
  if (jobCompleted.rows.length > 0) {
    const jC = jobCompleted.rows[0];
    const appRes2 = await db.query(
      `INSERT INTO applications (job_id, student_id, cover_letter, status, applied_at)
       VALUES ($1, $2, 'Em đã hoàn thành xuất sắc toàn bộ ca làm việc và các hạng mục bàn giao.', 'ACCEPTED', NOW() - INTERVAL '7 days')
       RETURNING id`,
      [jC.id, newUserId]
    );
    const appId2 = appRes2.rows[0].id;
    await db.query(
      `INSERT INTO work_assignments (job_id, student_id, application_id, status, created_at)
       VALUES ($1, $2, $3, 'COMPLETED', NOW() - INTERVAL '5 days')`,
      [jC.id, newUserId, appId2]
    );
    console.log(`Đã tạo công việc COMPLETED cho job "${jC.title}" (phục vụ test WF-S10 Đánh giá)`);
  }

  // 5. Tạo thông báo mẫu
  await db.query(
    `INSERT INTO notifications (user_id, type, title, body, created_at)
     VALUES
      ($1, 'APPLICATION_STATUS', 'Đơn ứng tuyển được tiếp nhận', 'Nhà tuyển dụng đã xem hồ sơ của bạn cho vị trí Part-time.', NOW() - INTERVAL '2 hours'),
      ($1, 'SYSTEM', 'Chào mừng bạn đến với JobNest', 'Tài khoản sinh viên đã kích hoạt thành công. Bắt đầu tìm việc ngay!', NOW() - INTERVAL '1 day')`,
    [newUserId]
  );
  console.log('Đã tạo 2 thông báo mẫu.');

  console.log('------------------------------------------------------------');
  console.log('🎉 TÀI KHOẢN SINH VIÊN TẠM THỜI ĐÃ SẴN SÀNG:');
  console.log(`- Email: ${email}`);
  console.log('- Mật khẩu: (đặt từ SEED_STUDENT_PASSWORD, không hiển thị)');
  console.log(`- Họ và tên: ${fullName}`);
  console.log(`- Vai trò: ${role}`);
  console.log('------------------------------------------------------------');

  process.exit(0);
}

setupTempStudent().catch(err => {
  console.error('Lỗi khi thiết lập tài khoản tạm:', err);
  process.exit(1);
});
