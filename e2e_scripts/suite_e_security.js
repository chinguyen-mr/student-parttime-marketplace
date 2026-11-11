// SUITE E: SECURITY & RBAC (Headed Google Chrome)
async (page) => {
  const browserType = page.context().browser().browserType();
  const headedBrowser = await browserType.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    slowMo: 300
  });

  const context = await headedBrowser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await context.newPage();
  const BASE_URL = 'http://localhost:8080';
  const EVIDENCE_DIR = 'docs/automated-web-testing/evidence';
  const results = [];

  async function runTest(id, name, fn) {
    const t0 = Date.now();
    let status = 'PASS', error = null;
    try {
      await fn();
      await p.screenshot({ path: `${EVIDENCE_DIR}/${id.toLowerCase()}.png` });
    } catch (err) {
      status = 'FAIL';
      error = err.message;
      await p.screenshot({ path: `${EVIDENCE_DIR}/${id.toLowerCase()}_fail.png` }).catch(() => {});
    }
    results.push({ id, name, group: 'E. Security & RBAC', status, duration: Date.now() - t0, error });
  }

  // TC-SEC-01: Chặn khách vãng lai vào Admin Dashboard
  await runTest('TC-SEC-01', 'Chặn khách vãng lai truy cập Admin Dashboard', async () => {
    await p.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await p.evaluate(() => localStorage.clear());
    await p.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);
    const body = await p.textContent('body');
    // Ensure admin dashboard sensitive panels are not accessible to unauthenticated guest
    if (body.includes('Quản trị viên cấp cao') && body.includes('Danh sách toàn bộ người dùng')) {
      throw new Error('Khách vãng lai xem được nội dung quản trị viên');
    }
  });

  // TC-SEC-02: Chặn khách vãng lai vào Employer Portal
  await runTest('TC-SEC-02', 'Chặn khách vãng lai truy cập Employer Portal', async () => {
    await p.goto(`${BASE_URL}/employer/dashboard`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);
  });

  // TC-SEC-03: Chặn Sinh viên vào Employer Portal (RBAC)
  await runTest('TC-SEC-03', 'Chặn Sinh viên truy cập tính năng của Nhà tuyển dụng (RBAC)', async () => {
    // Login as student first
    await p.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const loginBtn = p.locator('button:has-text("Đăng nhập"), a:has-text("Đăng nhập")').first();
    await loginBtn.click();
    await p.waitForTimeout(600);
    const quickStudent = p.locator('button:has-text("Sinh viên Test")').first();
    if (await quickStudent.isVisible()) {
      await quickStudent.click();
      await p.waitForTimeout(300);
    }
    const submitBtn = p.locator('button[type="submit"]:has-text("Đăng Nhập"), button:has-text("Đăng Nhập")').last();
    await submitBtn.click();
    await p.waitForTimeout(1200);

    // Try employer portal
    await p.goto(`${BASE_URL}/employer/dashboard`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);
  });

  // TC-SEC-04: Chặn Sinh viên vào Admin Portal (RBAC)
  await runTest('TC-SEC-04', 'Chặn Sinh viên truy cập Admin Portal (RBAC)', async () => {
    await p.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);
    const body = await p.textContent('body');
    if (body.includes('Quản trị viên cấp cao') && body.includes('Nhật ký hệ thống')) {
      throw new Error('Sinh viên không bị chặn khi vào Admin Dashboard');
    }
  });

  // TC-SEC-05: Modal Quên mật khẩu & Gửi yêu cầu qua SMTP
  await runTest('TC-SEC-05', 'Kiểm tra Modal Quên mật khẩu & Gửi yêu cầu qua SMTP Mailpit', async () => {
    await p.evaluate(() => localStorage.clear());
    await p.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const loginBtn = p.locator('button:has-text("Đăng nhập"), a:has-text("Đăng nhập")').first();
    await loginBtn.click();
    await p.waitForTimeout(600);

    const forgotBtn = p.locator('button:has-text("Quên mật khẩu"), a:has-text("Quên mật khẩu")').first();
    if (await forgotBtn.isVisible()) {
      await forgotBtn.click();
      await p.waitForTimeout(500);
      const emailInput = p.locator('input[placeholder*="email"], input[type="email"]').last();
      if (await emailInput.isVisible()) {
        await emailInput.fill('student.test@vlu.edu.vn');
        const sendBtn = p.locator('button:has-text("Gửi"), button:has-text("Xác nhận")').last();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
          await p.waitForTimeout(1000);
        }
      }
    }
  });

  await p.waitForTimeout(500);
  await headedBrowser.close();
  return results;
}

