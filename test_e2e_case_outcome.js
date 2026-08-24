const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5173/case-outcome', { waitUntil: 'networkidle' });
  
  console.log("Filling form...");
  await page.fill('textarea', "This is a synthetic case description regarding a property dispute between two siblings over a plot of land located in Bangalore. The appellant claims the will was forged, while the respondent argues it was properly registered. The high court had ruled in favor of the respondent, and this appeal challenges that decision on the grounds of lack of evidence for the signature's authenticity.");
  
  console.log("Submitting...");
  await page.click('button[type="submit"]');
  
  console.log("Waiting for result...");
  try {
    await page.waitForSelector('text=Historical Pattern', { timeout: 10000 });
    console.log("Result card appeared!");
    const content = await page.innerText('.glass-panel:nth-of-type(2)'); // roughly the result panel
    console.log("RESULT CONTENT:\n" + content);
  } catch (e) {
    console.log("Timeout waiting for result card. Error: ", e.message);
  }
  
  await browser.close();
})();
