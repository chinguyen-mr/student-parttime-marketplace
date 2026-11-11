async (page) => {
  await page.goto('http://localhost:8080/');
  const title = await page.title();
  await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow1_01_home.png' });
  return { status: 'SUCCESS', title };
}

