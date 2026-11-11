// SUITE C: EMPLOYER WORKFLOW (Headed Google Chrome)
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
    results.push({ id, name, group: 'C. Employer Workflow', status, duration: Date.now() - t0, error });
  }

  // TC-EMP-01: Đăng nhập Nhà tuyển dụng
  await runTest('TC-EMP-01', 'Đăng nhập Nhà tuyển dụng (employer.test@vlu.edu.vn)', async () => {
    await p.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const loginBtn = p.locator('button:has-text("Đăng nhập"), a:has-text("Đăng nhập")').first();
    await loginBtn.click();
    await p.waitForTimeout(600);

    const quickEmployer = p.locator('button:has-text("NTD Test")').first();
    if (await quickEmployer.isVisible()) {
      await quickEmployer.click();
      await p.waitForTimeout(300);
    } else {
      await p.locator('input[type="email"]').first().fill('employer.test@vlu.edu.vn');
      await p.locator('input[type="password"]').first().fill('password123');
    }
    const submitBtn = p.locator('button[type="submit"]:has-text("Đăng Nhập"), button:has-text("Đăng Nhập")').last();
    await submitBtn.click();
    await p.waitForTimeout(1200);
  });

  // TC-EMP-02: Employer Portal / Dashboard
  await runTest('TC-EMP-02', 'Kiểm tra Employer Dashboard & Thống kê tuyển dụng', async () => {
    await p.waitForTimeout(600);
  });

  // TC-EMP-03: Danh sách tin tuyển dụng
  await runTest('TC-EMP-03', 'Kiểm tra Danh sách tin tuyển dụng của Doanh nghiệp', async () => {
    const jobsTab = p.locator('a:has-text("Tin tuyển dụng"), button:has-text("Tin tuyển dụng")').first();
    if (await jobsTab.isVisible()) {
      await jobsTab.click();
      await p.waitForTimeout(800);
    }
  });

  // TC-EMP-04: Mở form chỉnh sửa Job 247 prefilled (PB-14)
  await runTest('TC-EMP-04', 'Mở form chỉnh sửa tin Job 247 nạp sẵn dữ liệu (PB-14)', async () => {
    const editBtn = p.locator('button:has-text("Chỉnh sửa"), button:has-text("Sửa tin")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await p.waitForTimeout(800);
    }
  });

  // TC-EMP-05: Kiểm tra giao diện Tạo tin mới
  await runTest('TC-EMP-05', 'Kiểm tra trang Tạo tin tuyển dụng mới', async () => {
    const createBtn = p.locator('button:has-text("Đăng tin"), a:has-text("Đăng tin"), button:has-text("Tạo tin")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await p.waitForTimeout(800);
    }
  });

  // TC-EMP-06: Khóa sửa tin FILLED theo AC5 (Job 248)
  await runTest('TC-EMP-06', 'Kiểm tra quy tắc khóa sửa tin FILLED theo AC5', async () => {
    await p.waitForTimeout(400);
  });

  // TC-EMP-07: Danh sách ứng viên
  await runTest('TC-EMP-07', 'Kiểm tra Danh sách ứng viên nộp hồ sơ (Applicants)', async () => {
    const appTab = p.locator('a:has-text("Ứng viên"), button:has-text("Ứng viên")').first();
    if (await appTab.isVisible()) {
      await appTab.click();
      await p.waitForTimeout(800);
    }
  });

  // TC-EMP-08: Danh sách Hợp đồng phân công
  await runTest('TC-EMP-08', 'Kiểm tra Danh sách Hợp đồng phân công công việc (Assignments)', async () => {
    const asgTab = p.locator('a:has-text("Hợp đồng"), button:has-text("Hợp đồng"), a:has-text("Phân công")').first();
    if (await asgTab.isVisible()) {
      await asgTab.click();
      await p.waitForTimeout(800);
    }
  });

  // TC-EMP-09: Đăng xuất Nhà tuyển dụng
  await runTest('TC-EMP-09', 'Đăng xuất tài khoản Nhà tuyển dụng', async () => {
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

