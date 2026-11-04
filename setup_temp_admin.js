/**
 * setup_temp_admin.js
 * Tạo tài khoản Test Quản trị viên (ADMIN) — CHỈ KHI CHƯA TỒN TẠI.
 *
 * Quy tắc:
 * - Mật khẩu đọc từ biến môi trường SEED_ADMIN_PASSWORD (bắt buộc).
 * - KHÔNG in mật khẩu ra console.
 * - Tài khoản đã tồn tại → KHÔNG sửa gì, chỉ báo và thoát.
 * - Chỉ chạy khi người quản trị chủ động thực thi lệnh này.
 */

const path = require('path');
const autoBootstrap = require('./03_backend/src/config/auto-bootstrap');

async function setupAdmin() {
  console.log('--- KHỞI TẠO TÀI KHOẢN TEST ADMIN (chỉ INSERT nếu chưa tồn tại) ---');

  // 1. Kiểm tra CSDL sẵn sàng (chế độ check — không ghi dữ liệu)
  const isReady = await autoBootstrap();
  if (!isReady) {
    console.error('❌ Không thể khởi tạo Admin do Cơ sở dữ liệu PostgreSQL chưa sẵn sàng.');
    process.exit(1);
  }

  const dotenv = require('./03_backend/node_modules/dotenv');
  dotenv.config({ path: path.resolve(__dirname, '03_backend/.env') });

  const bcrypt = require('./03_backend/node_modules/bcryptjs');
  const db = require('./03_backend/src/config/db');

  // 2. Email + mật khẩu bắt buộc từ biến môi trường
  const email = process.env.SEED_ADMIN_EMAIL;
  const rawPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error('❌ Thiếu hoặc sai định dạng SEED_ADMIN_EMAIL.');
    console.error('   Đặt email admin hợp lệ trong biến môi trường trước khi chạy.');
    process.exit(1);
  }
  if (!rawPassword) {
    console.error('❌ Thiếu biến môi trường SEED_ADMIN_PASSWORD.');
    console.error('   Ví dụ (PowerShell):  $env:SEED_ADMIN_PASSWORD="..."; node setup_temp_admin.js');
    console.error('   Ví dụ (Git Bash):    SEED_ADMIN_PASSWORD="..." node setup_temp_admin.js');
    process.exit(1);
  }

  try {
    const role = 'ADMIN';
    const fullName = 'Quản trị viên Hệ thống (Admin Test)';
    const phone = '0900000001';

    // 3. Chỉ INSERT khi chưa tồn tại — KHÔNG UPDATE tài khoản hiện hữu
    const checkRes = await db.query('SELECT id, email, status FROM users WHERE email = $1', [email]);

    if (checkRes.rows.length > 0) {
      const existing = checkRes.rows[0];
      console.log(`ℹ️ Tài khoản Admin đã tồn tại (ID: ${existing.id}, status: ${existing.status}).`);
      console.log('   Không thay đổi gì theo chính sách bảo vệ dữ liệu hiện có.');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const insertRes = await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status)
       VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
       RETURNING id, email, role, status`,
      [email, passwordHash, fullName, phone, role]
    );
    const adminUser = insertRes.rows[0];
    console.log(`✅ Đã tạo mới tài khoản Admin (ID: ${adminUser.id}, email: ${adminUser.email}).`);
    console.log('   Mật khẩu đã được thiết lập từ biến môi trường (không hiển thị).');

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khởi tạo tài khoản Admin:', err.message || err);
    process.exit(1);
  }
}

setupAdmin();
