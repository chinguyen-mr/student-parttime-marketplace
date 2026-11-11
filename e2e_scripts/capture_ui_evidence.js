async (page) => {
  const BASE_URL = 'http://localhost:8080';
  const API_BASE = 'http://localhost:8080/api';

  // 1. Employer Login & Capture Applicants Page with Rejection modal
  const empLogin = await page.request.post(`${API_BASE}/auth/login`, {
    data: { email: 'employer.test@vlu.edu.vn', password: 'password123' }
  });
  const empToken = (await empLogin.json())?.data?.token;

  await page.goto(`${BASE_URL}/`);
  await page.evaluate((token) => {
    localStorage.setItem('jobnest_auth_token', token);
    localStorage.setItem('user', JSON.stringify({ role: 'EMPLOYER', email: 'employer.test@vlu.edu.vn', full_name: 'VLU Tech' }));
  }, empToken);
  
  await page.goto(`${BASE_URL}/employer/applicants`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow2_01_employer_applicants.png' });

  // 2. Employer Assignments Page
  await page.goto(`${BASE_URL}/employer/assignments`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow3_01_employer_assignments.png' });

  // 3. Admin Login & Capture Admin Dashboard, Users, Moderation, Reports, Appeals, Logs
  const adminLogin = await page.request.post(`${API_BASE}/auth/login`, {
    data: { email: 'admin.test@vlu.edu.vn', password: 'password123' }
  });
  const adminToken = (await adminLogin.json())?.data?.token;

  await page.evaluate((token) => {
    localStorage.setItem('jobnest_auth_token', token);
    localStorage.setItem('user', JSON.stringify({ role: 'ADMIN', email: 'admin.test@vlu.edu.vn', full_name: 'Admin Test' }));
  }, adminToken);

  await page.goto(`${BASE_URL}/admin/dashboard`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow7_01_admin_dashboard.png' });

  await page.goto(`${BASE_URL}/admin/users`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow7_02_admin_users.png' });

  await page.goto(`${BASE_URL}/admin/moderation`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow6_01_admin_moderation.png' });

  await page.goto(`${BASE_URL}/admin/reports`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow4_01_admin_reports.png' });

  await page.goto(`${BASE_URL}/admin/logs`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow7_03_admin_logs.png' });

  // 4. Student Login & Capture Student Dashboard, Assignments, Notifications
  const studentLogin = await page.request.post(`${API_BASE}/auth/login`, {
    data: { email: 'student.test@vlu.edu.vn', password: 'password123' }
  });
  const studentToken = (await studentLogin.json())?.data?.token;

  await page.evaluate((token) => {
    localStorage.setItem('jobnest_auth_token', token);
    localStorage.setItem('user', JSON.stringify({ role: 'STUDENT', email: 'student.test@vlu.edu.vn', full_name: 'Nguyễn Văn Chí' }));
  }, studentToken);

  await page.goto(`${BASE_URL}/student/dashboard`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow1_09_student_dashboard.png' });

  await page.goto(`${BASE_URL}/student/assignments`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow3_02_student_assignments.png' });

  return { success: true, count: 8 };
}

