const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const isin = 'FR0010557264'; // AB Science
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`Testing Boursier with ${isin}...`);
    try {
        await page.goto(`https://www.boursier.com/actions/cours/${isin}.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch(e) {
        console.log("Goto timeout caught!");
    }
    await new Promise(r => setTimeout(r, 4000));
    
    // Cookie consent if any (Didomi is common)
    try {
        await page.evaluate(() => {
            const btn = document.querySelector('#didomi-notice-agree-button');
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 2000));
    } catch(e) {}

    const data = await page.evaluate(() => {
        const text = document.body.innerText;
        const findVal = (label) => {
            const regex = new RegExp(label + "[\\s\\S]{0,100}?(\\d+[\\s,.]\\d*)", "i");
            const match = text.match(regex);
            return match ? match[1] : 'N/A';
        };
        const name = document.querySelector('h1')?.innerText.trim() || 'N/A';
        const high = findVal('Plus Haut 1 an');
        const low = findVal('Plus Bas 1 an');
        return { name, high, low, textPreview: text.substring(0, 300) };
    });
    console.log("Boursier data:", data.name, data.high, data.low);
    //console.log(data.textPreview);

  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
