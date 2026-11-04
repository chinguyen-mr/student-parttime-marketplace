/**
 * setup_temp_admin.js
 * Tạo tài khoản Test Quản trị viên (ADMIN) cố định trong Database:
 * Email: admin.test@vlu.edu.vn
 * Password: password123
 * Role: ADMIN
 * Status: ACTIVE
 * LƯU Ý: Tuyệt đối KHÔNG tự động xóa tài khoản này sau khi chạy!
 */

const path = require('path');
const autoBootstrap = require('./03_backend/src/config/auto-bootstrap');

async function setupAdmin() {
  console.log('--- KHỞI TẠO TÀI KHOẢN TEST ADMIN ---');

  // Đảm bảo CSDL và các bảng đã được kết nối & đồng bộ trước khi tạo Admin
  const isReady = await autoBootstrap();
  if (!isReady) {
    console.error('❌ Không thể khởi tạo Admin do Cơ sở dữ liệu PostgreSQL chưa sẵn sàng.');
    process.exit(1);
  }

  const dotenv = require('./03_backend/node_modules/dotenv');
  dotenv.config({ path: path.resolve(__dirname, '03_backend/.env') });

  const bcrypt = require('./03_backend/node_modules/bcryptjs');
  const db = require('./03_backend/src/config/db');

  try {
    const email = 'admin.test@vlu.edu.vn';
    const rawPassword = 'password123';
    const role = 'ADMIN';
    const fullName = 'Quản trị viên Hệ thống (Admin Test)';
    const phone = '0900000001';

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(rawPassword, saltRounds);

    // 1. Kiểm tra tài khoản đã tồn tại hay chưa
    const checkRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let adminUser;

    if (checkRes.rows.length > 0) {
      // Đã tồn tại -> Cập nhật mật khẩu, vai trò ADMIN và trạng thái ACTIVE
      const updateRes = await db.query(
        `UPDATE users 
         SET password_hash = $1, role = $2, status = 'ACTIVE', full_name = $3, phone = $4, updated_at = CURRENT_TIMESTAMP
         WHERE email = $5
         RETURNING id, email, full_name, phone, role, status, created_at`,
        [passwordHash, role, fullName, phone, email]
      );
      adminUser = updateRes.rows[0];
      console.log('✅ Đã cập nhật tài khoản Admin hiện có:', adminUser);
    } else {
      // Chưa tồn tại -> Insert mới
      const insertRes = await db.query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, status)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
         RETURNING id, email, full_name, phone, role, status, created_at`,
        [email, passwordHash, fullName, phone, role]
      );
      adminUser = insertRes.rows[0];
      console.log('✅ Đã tạo mới tài khoản Admin thành công:', adminUser);
    }

    // 2. Thử nghiệm kiểm tra hash
    const match = await bcrypt.compare(rawPassword, passwordHash);
    console.log('🔐 Xác thực mật khẩu:', match ? 'KHỚP (SUCCESS)' : 'KHÔNG KHỚP (FAILED)');

    console.log('\n=============================================');
    console.log('THÔNG TIN TÀI KHOẢN ADMIN ĐÃ SẴN SÀNG:');
    console.log(`- Email:    ${email}`);
    console.log(`- Mật khẩu: ${rawPassword}`);
    console.log(`- Vai trò:  ${role}`);
    console.log(`- Trạng thái: ${adminUser.status}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khởi tạo tài khoản Admin:', err.message || err);
    process.exit(1);
  }
}

setupAdmin();
