const db = require('../src/config/db');

async function deleteTempStudent() {
  console.log('--- XÓA TÀI KHOẢN SINH VIÊN TẠM THỜI (DELETE TEMP STUDENT ACCOUNT) ---');
  
  const email = 'student.test@vlu.edu.vn';

  const userRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (userRes.rows.length === 0) {
    console.log(`Không tìm thấy tài khoản với email: ${email}`);
    process.exit(0);
  }

  const userId = userRes.rows[0].id;
  console.log(`Đang xóa toàn bộ dữ liệu liên quan đến User ID: ${userId} (${email})...`);

  // Xóa các dữ liệu con
  await db.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM work_assignments WHERE student_id = $1', [userId]);
  await db.query('DELETE FROM proposals WHERE student_id = $1', [userId]);
  await db.query('DELETE FROM applications WHERE student_id = $1', [userId]);
  await db.query('DELETE FROM student_profiles WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM users WHERE id = $1', [userId]);

  console.log('✅ Đã xóa hoàn toàn tài khoản sinh viên tạm thời và tất cả dữ liệu liên quan thành công.');
  process.exit(0);
}

deleteTempStudent().catch(err => {
  console.error('Lỗi khi xóa tài khoản tạm:', err);
  process.exit(1);
});
