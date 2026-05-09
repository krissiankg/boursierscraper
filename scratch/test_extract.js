const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const isin = 'FR0011040500'; // Air France
  console.log(`Diagnostic for ${isin}...`);
  
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${isin}`;
    console.log(`Fetching ${url}...`);
    const searchRes = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    
    if (!searchRes.ok) {
        console.log(`API Error: ${searchRes.status} ${searchRes.statusText}`);
        const errorText = await searchRes.text();
        console.log("Error details:", errorText);
        return;
    }
    
    const data = await searchRes.json();
    console.log("API Response quotes count:", data.quotes?.length);
    
    if (data.quotes && data.quotes.length > 0) {
        const symbol = data.quotes[0].symbol;
        const name = data.quotes[0].longname || data.quotes[0].shortname;
        console.log(`Resolved: ${symbol} (${name})`);
    } else {
        console.log("No quotes found for this ISIN.");
    }
    
  } catch (e) {
    console.error("Fetch Error:", e.message);
  }
})();
