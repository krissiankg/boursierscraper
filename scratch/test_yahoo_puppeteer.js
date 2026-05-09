const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const symbol = 'AB.PA'; // AB Science
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`Testing Yahoo with ${symbol}...`);
    try {
        await page.goto(`https://finance.yahoo.com/quote/${symbol}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch(e) {
        console.log("Goto timeout caught!");
    }
    await new Promise(r => setTimeout(r, 4000));
    
    // Cookie consent for Yahoo
    try {
        await page.evaluate(() => {
            const btn = document.querySelector('.accept-all'); // Yahoo uses .accept-all sometimes
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 1000));
    } catch(e) {}

    const yData = await page.evaluate(() => {
        const text = document.body.innerText;
        const rangeMatch = text.match(/52 Week Range[\s\S]{0,100}?(\d+[\s,.]\d*)\s+-\s+(\d+[\s,.]\d*)/i) || 
                           text.match(/Plage sur 52 semaines[\s\S]{0,100}?(\d+[\s,.]\d*)\s+-\s+(\d+[\s,.]\d*)/i);
        return {
            low: rangeMatch ? rangeMatch[1] : 'N/A',
            high: rangeMatch ? rangeMatch[2] : 'N/A',
            text: text.substring(0, 1000)
        };
    });
    console.log("Yahoo data:", yData.high, yData.low);
    //console.log(yData.text);

  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
