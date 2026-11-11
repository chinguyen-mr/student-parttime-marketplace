import { emailService } from '../src/services/email.service.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runE2E() {
  console.log('--- BẮT ĐẦU KIỂM THỬ E2E LIVE CHO PB-04 VÀ PB-10 ---');

  // ==========================================
  // PB-04: STUDENT FORGOT & RESET PASSWORD
  // ==========================================
  console.log('\n[PB-04] 1. Sinh viên (student.test@vlu.edu.vn) yêu cầu đặt lại mật khẩu:');
  const studentForgotRes = await post('/auth/forgot-password', { email: 'student.test@vlu.edu.vn' });
  console.log('Response status:', studentForgotRes.status, 'Message:', studentForgotRes.data.message);
  if (studentForgotRes.status !== 200) throw new Error('PB-04 Forgot password request failed');

  const studentLastEmail = emailService.getLastDispatched();
  console.log('Email dispatched to:', studentLastEmail.to, 'with token length:', studentLastEmail.rawToken?.length);
  const studentToken = studentLastEmail.rawToken;
  if (!studentToken) throw new Error('No raw token captured in emailService for Student');

  console.log('[PB-04] 2. Sinh viên gửi token và mật khẩu mới (NewStudentPass123!):');
  const studentResetRes = await post('/auth/reset-password', {
    token: studentToken,
    new_password: 'NewStudentPass123!',
  });
  console.log('Response status:', studentResetRes.status, 'Message:', studentResetRes.data.message);
  if (studentResetRes.status !== 200) throw new Error('PB-04 Reset password failed');

  console.log('[PB-04] 3. Thử đăng nhập với mật khẩu cũ (password123) -> Kỳ vọng 401:');
  const studentOldLogin = await post('/auth/login', {
    email: 'student.test@vlu.edu.vn',
    password: 'password123',
  });
  console.log('Old login status:', studentOldLogin.status, '(Kỳ vọng 401)');
  if (studentOldLogin.status !== 401) throw new Error('PB-04 Old password was still accepted!');

  console.log('[PB-04] 4. Đăng nhập với mật khẩu mới (NewStudentPass123!) -> Kỳ vọng 200:');
  const studentNewLogin = await post('/auth/login', {
    email: 'student.test@vlu.edu.vn',
    password: 'NewStudentPass123!',
  });
  console.log('New login status:', studentNewLogin.status, 'Role:', studentNewLogin.data?.data?.user?.role);
  if (studentNewLogin.status !== 200) throw new Error('PB-04 New password login failed');

  console.log('[PB-04] 5. Khôi phục lại mật khẩu mặc định (password123) để bảo toàn dữ liệu demo:');
  await post('/auth/forgot-password', { email: 'student.test@vlu.edu.vn' });
  const restoreTokenStudent = emailService.getLastDispatched().rawToken;
  await post('/auth/reset-password', { token: restoreTokenStudent, new_password: 'password123' });
  const verifyRestoreStudent = await post('/auth/login', { email: 'student.test@vlu.edu.vn', password: 'password123' });
  if (verifyRestoreStudent.status !== 200) throw new Error('Failed to restore student default password');
  console.log('Khôi phục mật khẩu Student về password123 thành công!');

  // ==========================================
  // PB-10: EMPLOYER FORGOT & RESET PASSWORD
  // ==========================================
  console.log('\n[PB-10] 1. Nhà tuyển dụng (employer.test@vlu.edu.vn) yêu cầu đặt lại mật khẩu:');
  const empForgotRes = await post('/auth/forgot-password', { email: 'employer.test@vlu.edu.vn' });
  console.log('Response status:', empForgotRes.status, 'Message:', empForgotRes.data.message);
  if (empForgotRes.status !== 200) throw new Error('PB-10 Forgot password request failed');

  const empLastEmail = emailService.getLastDispatched();
  console.log('Email dispatched to:', empLastEmail.to, 'with token length:', empLastEmail.rawToken?.length);
  const empToken = empLastEmail.rawToken;
  if (!empToken) throw new Error('No raw token captured in emailService for Employer');

  console.log('[PB-10] 2. Nhà tuyển dụng gửi token và mật khẩu mới (NewEmployerPass123!):');
  const empResetRes = await post('/auth/reset-password', {
    token: empToken,
    new_password: 'NewEmployerPass123!',
  });
  console.log('Response status:', empResetRes.status, 'Message:', empResetRes.data.message);
  if (empResetRes.status !== 200) throw new Error('PB-10 Reset password failed');

  console.log('[PB-10] 3. Thử đăng nhập với mật khẩu cũ (password123) -> Kỳ vọng 401:');
  const empOldLogin = await post('/auth/login', {
    email: 'employer.test@vlu.edu.vn',
    password: 'password123',
  });
  console.log('Old login status:', empOldLogin.status, '(Kỳ vọng 401)');
  if (empOldLogin.status !== 401) throw new Error('PB-10 Old password was still accepted!');

  console.log('[PB-10] 4. Đăng nhập với mật khẩu mới (NewEmployerPass123!) -> Kỳ vọng 200:');
  const empNewLogin = await post('/auth/login', {
    email: 'employer.test@vlu.edu.vn',
    password: 'NewEmployerPass123!',
  });
  console.log('New login status:', empNewLogin.status, 'Role:', empNewLogin.data?.data?.user?.role);
  if (empNewLogin.status !== 200) throw new Error('PB-10 New password login failed');

  console.log('[PB-10] 5. Khôi phục lại mật khẩu mặc định (password123) để bảo toàn dữ liệu demo:');
  await post('/auth/forgot-password', { email: 'employer.test@vlu.edu.vn' });
  const restoreTokenEmp = emailService.getLastDispatched().rawToken;
  await post('/auth/reset-password', { token: restoreTokenEmp, new_password: 'password123' });
  const verifyRestoreEmp = await post('/auth/login', { email: 'employer.test@vlu.edu.vn', password: 'password123' });
  if (verifyRestoreEmp.status !== 200) throw new Error('Failed to restore employer default password');
  console.log('Khôi phục mật khẩu Employer về password123 thành công!');

  console.log('\n>>> TẤT CẢ CÁC BƯỚC KIỂM THỬ LIVE E2E CHO PB-04 VÀ PB-10 ĐỀU ĐẠT 100%! <<<');
}

runE2E().catch((err) => {
  console.error('LỖI KIỂM THỬ:', err);
  process.exit(1);
});

