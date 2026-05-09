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

    console.log(`Testing Boursorama with ${isin}...`);
    try {
        await page.goto(`https://www.boursorama.com/cours/${isin}/`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch(e) {
        console.log("Goto timeout caught!");
    }
    await new Promise(r => setTimeout(r, 3000));
    
    // consent
    try {
        await page.evaluate(() => {
            const btn = document.querySelector('#didomi-notice-agree-button');
            if(btn) btn.click();
        });
    } catch(e) {}

    const boData = await page.evaluate(() => {
        const text = document.body.innerText;
        const findVal = (label) => {
          const regex = new RegExp(label + "[\\s\\S]{0,350}?(\\d+[\\s,.]?\\d*[,.]\\d+)", "i");
          const match = text.match(regex);
          return match ? match[1].trim() : 'N/A';
        };
        const name = document.querySelector('h1')?.innerText.trim() || 'N/A';
        const high = findVal('haut 52 sem');
        const low = findVal('bas 52 sem');
        return { name, high, low };
    });
    console.log("Boursorama data:", boData);

  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
