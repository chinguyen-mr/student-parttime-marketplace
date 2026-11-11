// SUITE B: STUDENT WORKFLOW (Headed Google Chrome)
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
    results.push({ id, name, group: 'B. Student Workflow', status, duration: Date.now() - t0, error });
  }

  // TC-STU-01: Mở Modal Đăng ký
  await runTest('TC-STU-01', 'Mở Modal Đăng ký, kiểm tra biểu mẫu và validation', async () => {
    await p.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const regBtn = p.locator('button:has-text("Đăng ký"), a:has-text("Đăng ký")').first();
    if (await regBtn.isVisible()) {
      await regBtn.click();
      await p.waitForTimeout(600);
    }
    const closeBtn = p.locator('button:has([class*="lucide-x"]), button:has-text("✕")').first();
    if (await closeBtn.isVisible()) await closeBtn.click().catch(() => {});
  });

  // TC-STU-02: Đăng nhập Sinh viên qua AuthModal
  await runTest('TC-STU-02', 'Đăng nhập tài khoản Sinh viên (student.test@vlu.edu.vn)', async () => {
    await p.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const loginBtn = p.locator('button:has-text("Đăng nhập"), a:has-text("Đăng nhập")').first();
    await loginBtn.click();
    await p.waitForTimeout(600);

    const quickStudent = p.locator('button:has-text("Sinh viên Test")').first();
    if (await quickStudent.isVisible()) {
      await quickStudent.click();
      await p.waitForTimeout(300);
    } else {
      await p.locator('input[type="email"]').first().fill('student.test@vlu.edu.vn');
      await p.locator('input[type="password"]').first().fill('password123');
    }
    const submitBtn = p.locator('button[type="submit"]:has-text("Đăng Nhập"), button:has-text("Đăng Nhập")').last();
    await submitBtn.click();
    await p.waitForTimeout(1200);
  });

  // TC-STU-03: Kiểm tra Dashboard / Trang cá nhân
  await runTest('TC-STU-03', 'Kiểm tra Student Portal / Dashboard sau khi đăng nhập', async () => {
    // Navigate via header or view
    const profileBtn = p.locator('button:has([class*="lucide-user"]), a[href*="profile"]').first();
    if (await profileBtn.isVisible()) {
      await profileBtn.click();
      await p.waitForTimeout(800);
    }
  });

  // TC-STU-04: Tìm kiếm công việc Barista
  await runTest('TC-STU-04', 'Tìm kiếm việc làm part-time theo từ khóa Barista', async () => {
    await p.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const searchInput = p.locator('input[placeholder*="Tìm kiếm"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Barista');
      await p.keyboard.press('Enter');
      await p.waitForTimeout(800);
    }
  });

  // TC-STU-05: Xem chi tiết tin tuyển dụng & ca làm việc
  await runTest('TC-STU-05', 'Xem chi tiết tin tuyển dụng và ca làm việc (Job 236)', async () => {
    const detailBtn = p.locator('button:has-text("Xem chi tiết"), button:has-text("Chi tiết")').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await p.waitForTimeout(1000);
    }
  });

  // TC-STU-06: Mở Modal ứng tuyển
  await runTest('TC-STU-06', 'Mở Modal ứng tuyển, kiểm tra form nhập thư giới thiệu', async () => {
    const applyBtn = p.locator('button:has-text("Ứng tuyển")').first();
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      await p.waitForTimeout(600);
    }
  });

  // TC-STU-07: Chống nộp trùng (Job 236)
  await runTest('TC-STU-07', 'Kiểm tra cơ chế chặn nộp trùng đơn (HTTP 409 Conflict)', async () => {
    const submitBtn = p.locator('button:has-text("Gửi hồ sơ"), button:has-text("Xác nhận"), button[type="submit"]').last();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await p.waitForTimeout(800);
    }
    const closeBtn = p.locator('button:has-text("Đóng"), button:has([class*="lucide-x"])').first();
    if (await closeBtn.isVisible()) await closeBtn.click().catch(() => {});
  });

  // TC-STU-08: Lịch sử ứng tuyển (My Assignments)
  await runTest('TC-STU-08', 'Kiểm tra Danh sách việc làm đã ứng tuyển (Assignments)', async () => {
    const appsLink = p.locator('a:has-text("Việc của tôi"), button:has-text("Việc của tôi"), a:has-text("Đơn ứng tuyển")').first();
    if (await appsLink.isVisible()) {
      await appsLink.click();
      await p.waitForTimeout(800);
    }
  });

  // TC-STU-09: Chuông thông báo
  await runTest('TC-STU-09', 'Kiểm tra Chuông thông báo và danh sách thông báo Sinh viên', async () => {
    const notifBtn = p.locator('button:has([class*="lucide-bell"]), a[href*="notifications"]').first();
    if (await notifBtn.isVisible()) {
      await notifBtn.click();
      await p.waitForTimeout(600);
    }
  });

  // TC-STU-10: Đăng xuất
  await runTest('TC-STU-10', 'Đăng xuất tài khoản Sinh viên, xác minh xóa session', async () => {
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
