const { chromium } = require('playwright-core');
const { tc, check, results } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  await tc('TC_RESET_EMP_001', async () => {
    const p = await (await b.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
    await p.goto('http://localhost:5173'); await p.waitForTimeout(2000);
    await p.getByText('Dành cho nhà tuyển dụng', { exact: false }).first().click(); await p.waitForTimeout(1500);
    await p.locator('button, a', { hasText: /^Đăng nhập/ }).first().click(); await p.waitForTimeout(1500);
    await p.getByText('Quên mật khẩu', { exact: false }).first().click(); await p.waitForTimeout(800);
    const email = await p.locator('input[type=email]').count();
    const btn = await p.getByRole('button', { name: 'Gửi mã xác nhận' }).count();
    await p.screenshot({ path: __dirname + '/ui_reset_emp.png' });
    return check(email > 0 && btn > 0, 'Trang Nhà tuyển dụng → Đăng nhập → Quên mật khẩu: có ô Email khôi phục và nút Gửi mã xác nhận', `email=${email} btn=${btn}`);
  });
  await b.close();
  const fs = require('fs'); const f = __dirname + '/placeholder_checks.json';
  const prev = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : [];
  fs.writeFileSync(f, JSON.stringify([...prev.filter(r => r.id !== 'TC_RESET_EMP_001'), ...results], null, 1));
})();
