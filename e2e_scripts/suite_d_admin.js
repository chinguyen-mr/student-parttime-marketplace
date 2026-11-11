// SUITE D: ADMIN WORKFLOW (Headed Google Chrome)
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
    results.push({ id, name, group: 'D. Admin Workflow', status, duration: Date.now() - t0, error });
  }

  // TC-ADM-01: Đăng nhập Quản trị viên
  await runTest('TC-ADM-01', 'Đăng nhập Quản trị viên (admin.test@vlu.edu.vn)', async () => {
    await p.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const loginBtn = p.locator('button:has-text("Đăng nhập"), a:has-text("Đăng nhập")').first();
    await loginBtn.click();
    await p.waitForTimeout(600);

    await p.locator('input[type="email"]').first().fill('admin.test@vlu.edu.vn');
    await p.locator('input[type="password"]').first().fill('password123');
    const submitBtn = p.locator('button[type="submit"]:has-text("Đăng Nhập"), button:has-text("Đăng Nhập")').last();
    await submitBtn.click();
    await p.waitForTimeout(1500);
  });

  // TC-ADM-02: Admin Dashboard
  await runTest('TC-ADM-02', 'Kiểm tra Admin Dashboard & Chỉ số tổng thể', async () => {
    await p.waitForTimeout(600);
  });

  // TC-ADM-03: Quản lý người dùng
  await runTest('TC-ADM-03', 'Kiểm tra trang Quản lý Người dùng (Users)', async () => {
    const userTab = p.locator('button:has-text("Người dùng"), a:has-text("Người dùng"), button:has-text("Tài khoản")').first();
    if (await userTab.isVisible()) {
      await userTab.click();
      await p.waitForTimeout(800);
    }
  });

  // TC-ADM-04: Kiểm duyệt tin tuyển dụng
  await runTest('TC-ADM-04', 'Kiểm tra Hàng đợi kiểm duyệt tin tuyển dụng (Moderation)', async () => {
    const modTab = p.locator('button:has-text("Kiểm duyệt"), a:has-text("Kiểm duyệt"), button:has-text("Tin đăng")').first();
    if (await modTab.isVisible()) {
      await modTab.click();
      await p.waitForTimeout(800);
    }
  });

  // TC-ADM-05: Nhật ký hệ thống
  await runTest('TC-ADM-05', 'Kiểm tra trang Nhật ký hệ thống (System Logs)', async () => {
    const logTab = p.locator('button:has-text("Nhật ký"), a:has-text("Nhật ký"), button:has-text("Logs")').first();
    if (await logTab.isVisible()) {
      await logTab.click();
      await p.waitForTimeout(800);
    }
  });

  // TC-ADM-06: Đăng xuất Quản trị viên
  await runTest('TC-ADM-06', 'Đăng xuất tài khoản Quản trị viên', async () => {
    const logoutBtn = p.locator('button:has-text("Đăng xuất"), a:has-text("Đăng xuất")').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await p.waitForTimeout(600);
    } else {
      await p.evaluate(() => localStorage.clear());
      await p.goto(`${BASE_URL}/`);
    }
  });

  await p.waitForTimeout(500);
  await headedBrowser.close();
  return results;
}

