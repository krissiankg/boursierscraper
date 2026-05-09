const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const isin = 'FR0010557264'; // AB Science
  console.log(`Diagnostic for ${isin} on ZoneBourse...`);
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    const url = `https://www.zonebourse.com/recherche/?q=${isin}`;
    console.log(`Fetching ${url}...`);
    // catch navigation errors
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch(e) {
        console.log("Goto timeout, continuing...");
    }
    await new Promise(r => setTimeout(r, 4000));
    
    // Cookie consent if any (Didomi is common)
    try {
        await page.evaluate(() => {
            const btn = document.querySelector('#didomi-notice-agree-button');
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 1000));
    } catch(e) {}
    
    await page.screenshot({ path: 'zonebourse_debug.png' });

    const zbData = await page.evaluate(() => {
      const text = document.body.innerText;
      return text;
    });

    console.log("ZB Text length:", zbData.length);
    
    // Try to extract high/low
    // On ZoneBourse, the 52w range is often "Plus Haut / Plus Bas" or similar
    
  } catch (e) {
    console.error("Fetch Error:", e.message);
  } finally {
    await browser.close();
  }
})();
