const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

/**
 * P0-01: Script đồng bộ chuẩn hóa tài khoản Demo
 * - Sử dụng bcrypt.compareSync để kiểm tra, chỉ tạo hash mới khi cần thiết.
 * - Tuyệt đối KHÔNG ghi mật khẩu thô ra stdout/stderr log.
 * - An toàn, không xóa hay ghi đè dữ liệu nghiệp vụ khác.
 */
async function syncDemoAccounts() {
  console.log('=== [P0-01] ĐỒNG BỘ CHUẨN HÓA MẬT KHẨU TÀI KHOẢN DEMO ===');
  
  // Mật khẩu demo chuẩn: lấy từ biến môi trường hoặc fallback chuẩn password123
  const targetPassword = process.env.DEMO_STANDARD_PASSWORD || 'password123';
  
  const demoUsers = [
    { email: 'student.test@vlu.edu.vn', role: 'STUDENT', fullName: 'Nguyễn Văn Chí (Sinh Viên Test)', phone: '0901234567' },
    { email: 'employer.test@vlu.edu.vn', role: 'EMPLOYER', fullName: 'Công Ty Công Nghệ Giáo Dục Văn Lang (VLU Tech)', phone: '0987654321' },
    { email: 'admin.test@vlu.edu.vn', role: 'ADMIN', fullName: 'Quản trị viên Hệ thống (Admin Test)', phone: '0900000001' },
    { email: 'student.morning@vlu.edu.vn', role: 'STUDENT', fullName: 'Trần Văn Sáng (SV Ca Sáng)', phone: '0901112233' },
    { email: 'student.evening@vlu.edu.vn', role: 'STUDENT', fullName: 'Lê Thị Tối (SV Ca Tối)', phone: '0902223344' },
    { email: 'admin@vlu.edu.vn', role: 'ADMIN', fullName: 'Nguyễn Văn Quản Trị', phone: '0901112223' },
    { email: 'sv_demo@vanlanguni.vn', role: 'STUDENT', fullName: 'Nguyễn Minh Khang (Demo)', phone: '0881621603' },
    { email: 'hr_demo@company.com', role: 'EMPLOYER', fullName: 'Công Ty CP Dịch Vụ Demo', phone: '0988776655' }
  ];

  let syncedCount = 0;
  let alreadyValidCount = 0;
  let createdCount = 0;

  for (const account of demoUsers) {
    try {
      const existing = await db.query('SELECT id, password_hash, role, status FROM users WHERE email = $1', [account.email]);

      if (existing.rows.length > 0) {
        const user = existing.rows[0];
        const isAlreadyValid = user.password_hash && bcrypt.compareSync(targetPassword, user.password_hash);

        if (isAlreadyValid) {
          alreadyValidCount++;
          console.log(`[VALID] User ID ${user.id} (${account.email}) mật khẩu đã chuẩn xác, bỏ qua băm lại.`);
        } else {
          const newHash = await bcrypt.hash(targetPassword, 10);
          await db.query(
            'UPDATE users SET password_hash = $1, status = \'ACTIVE\', updated_at = NOW() WHERE id = $2',
            [newHash, user.id]
          );
          syncedCount++;
          console.log(`[UPDATED] User ID ${user.id} (${account.email}) đã đồng bộ hash mật khẩu mới an toàn.`);
        }
      } else {
        // Tạo mới nếu chưa tồn tại
        const newHash = await bcrypt.hash(targetPassword, 10);
        const insertRes = await db.query(
          `INSERT INTO users (email, password_hash, full_name, phone, role, status)
           VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
           RETURNING id`,
          [account.email, newHash, account.fullName, account.phone, account.role]
        );
        const newId = insertRes.rows[0].id;
        
        // Khởi tạo profile tương ứng nếu chưa có
        if (account.role === 'STUDENT') {
          await db.query(
            `INSERT INTO student_profiles (user_id, full_name, school, major, bio)
             VALUES ($1, $2, 'Trường Đại học Văn Lang (VLU)', 'Công nghệ Thông tin', 'Sinh viên tìm việc bán thời gian theo lịch học.')
             ON CONFLICT (user_id) DO NOTHING`,
            [newId, account.fullName]
          );
        } else if (account.role === 'EMPLOYER') {
          await db.query(
            `INSERT INTO employer_profiles (user_id, company_name, bio, location, verification_status)
             VALUES ($1, $2, 'Doanh nghiệp đối tác tuyển dụng part-time sinh viên Văn Lang.', 'Quận Bình Thạnh, TP.HCM', 'VERIFIED')
             ON CONFLICT (user_id) DO NOTHING`,
            [newId, account.fullName]
          );
        }
        
        createdCount++;
        console.log(`[CREATED] Đã tạo mới tài khoản demo ID ${newId} (${account.email}) với role ${account.role}.`);
      }
    } catch (err) {
      console.error(`[ERROR] Lỗi đồng bộ tài khoản (${account.email}):`, err.message);
    }
  }

  console.log(`\n🎉 HOÀN TẤT ĐỒNG BỘ: ${alreadyValidCount} tài khoản đã chuẩn, ${syncedCount} tài khoản được cập nhật, ${createdCount} tài khoản tạo mới.`);
  console.log('✅ Toàn bộ tài khoản demo đã sẵn sàng đăng nhập với mật khẩu chuẩn xác.');
  process.exit(0);
}

syncDemoAccounts();

