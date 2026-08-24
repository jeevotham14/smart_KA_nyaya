const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5173/directory', { waitUntil: 'networkidle' });
  
  // Wait a bit to see if error boundary triggers
  await page.waitForTimeout(2000);
  
  const content = await page.content();
  if (content.includes('Error Details')) {
    console.log("Error boundary found on page!");
    // click summary to expand error details
    await page.click('summary');
    await page.waitForTimeout(500);
    const details = await page.innerText('details');
    console.log("DETAILS:\n", details);
  } else {
    console.log("No error boundary found.");
  }
  
  await browser.close();
})();
