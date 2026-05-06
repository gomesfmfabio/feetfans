const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 600, height: 600 },
    deviceScaleFactor: 2 // Higher quality (1200x1200 internal, scaled to 600x600)
  });

  const htmlPath = 'file://' + path.resolve(__dirname, 'thumbnail.html');
  await page.goto(htmlPath);

  // Wait for fonts to load
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.resolve(__dirname, 'mra-thumbnail.png'),
    fullPage: false
  });

  console.log('✅ Thumbnail saved: mra-thumbnail.png');
  await browser.close();
})();
