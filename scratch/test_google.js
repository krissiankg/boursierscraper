const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const isin = 'FR0011040500'; 
  console.log(`Diagnostic for ${isin} on Google Finance...`);
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    const url = `https://www.google.com/finance/quote/${isin}:EPA`;
    console.log(`Fetching ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000));
    
    // Screenshot to see what's rendering
    await page.screenshot({ path: 'google_finance_debug.png' });

    const gData = await page.evaluate(() => {
      const text = document.body.innerText;
      return text;
    });

    console.log("Extracted text snippet:", gData.substring(0, 500));
    
    const match = gData.match(/52\s?semaines[\s\S]{0,100}?(\d+[\s,.]\d*)\s+-\s+(\d+[\s,.]\d*)/i) ||
                  gData.match(/52-week range[\s\S]{0,100}?(\d+[\s,.]\d*)\s+-\s+(\d+[\s,.]\d*)/i);
    
    console.log("Match:", match);
    
  } catch (e) {
    console.error("Fetch Error:", e.message);
  } finally {
    await browser.close();
  }
})();
