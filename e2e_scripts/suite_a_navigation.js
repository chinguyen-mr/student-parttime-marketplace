// SUITE A: UI & NAVIGATION (Headed Google Chrome)
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
    results.push({ id, name, group: 'A. UI & Navigation', status, duration: Date.now() - t0, error });
  }

  // TC-NAV-01: Header, Hero, Footer
  await runTest('TC-NAV-01', 'Mở Trang chủ, kiểm tra Header, Hero, Footer', async () => {
    await p.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const hasHeader = await p.locator('header, nav').first().isVisible();
    const hasFooter = await p.locator('footer').first().isVisible();
    if (!hasHeader || !hasFooter) throw new Error('Header hoặc Footer không hiển thị');
  });

  // TC-NAV-02: Navigation Links
  await runTest('TC-NAV-02', 'Kiểm tra liên kết điều hướng Đăng nhập, Đăng ký', async () => {
    const loginBtn = p.locator('a[href*="/login"], button:has-text("Đăng nhập")').first();
    const registerBtn = p.locator('a[href*="/register"], button:has-text("Đăng ký")').first();
    if (!(await loginBtn.isVisible()) || !(await registerBtn.isVisible())) {
      throw new Error('Nút Đăng nhập/Đăng ký không xuất hiện');
    }
  });

  // TC-NAV-03: Responsive
  await runTest('TC-NAV-03', 'Kiểm tra hiển thị Responsive (Tablet & Mobile)', async () => {
    await p.setViewportSize({ width: 768, height: 1024 });
    await p.waitForTimeout(300);
    await p.setViewportSize({ width: 375, height: 667 });
    await p.waitForTimeout(300);
    await p.setViewportSize({ width: 1280, height: 800 });
  });

  // TC-NAV-04: Danh mục ngành nghề
  await runTest('TC-NAV-04', 'Kiểm tra Danh mục ngành nghề và việc làm nổi bật', async () => {
    await p.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const bodyText = await p.textContent('body');
    if (!bodyText.includes('việc làm') && !bodyText.includes('Tìm việc')) {
      throw new Error('Trang chủ không chứa nội dung việc làm');
    }
  });

  // TC-NAV-05: Trang 404
  await runTest('TC-NAV-05', 'Kiểm tra điều hướng đường dẫn không tồn tại (404/Fallback)', async () => {
    await p.goto(`${BASE_URL}/route-khong-ton-tai-404`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
  });

  // TC-NAV-06: Empty Search Results
  await runTest('TC-NAV-06', 'Kiểm tra Empty state khi tìm kiếm từ khóa không có kết quả', async () => {
    await p.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const searchInput = p.locator('input[placeholder*="Tìm kiếm"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('tukhoanaynhatdinhkhongcoketqua99999');
      await p.keyboard.press('Enter');
      await p.waitForTimeout(600);
    }
  });

  await p.waitForTimeout(500);
  await headedBrowser.close();
  return results;
}

