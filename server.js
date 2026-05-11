// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
const port = process.env.PORT || 3005;
const distPath = path.join(__dirname, 'dist');

app.use(cors());
app.use(express.json());

async function handleConsent(page) {
  try {
    // 1. Essayer de cliquer via des sélecteurs connus (Didomi est courant sur Boursier)
    const selectors = [
      '#didomi-notice-agree-button',
      '.didomi-continue-without-agreeing',
      'button[id^="didomi"]',
      '#cmp-welcome-add-button',
      '.qc-cmp2-summary-buttons button[mode="primary"]'
    ];

    for (const selector of selectors) {
      const btn = await page.$(selector);
      if (btn) {
        await btn.click();
        console.log(`[DEBUG] Clicked consent selector: ${selector}`);
        await new Promise(r => setTimeout(r, 2000));
        return;
      }
    }

    // 2. Recherche textuelle dans tous les frames
    await page.evaluate(() => {
      const findAndClick = (doc) => {
        const texts = ['Accepter', 'Tout accepter', 'Continuer sans accepter', 'Agree'];
        const elements = Array.from(doc.querySelectorAll('button, a, span'));
        for (const el of elements) {
          const t = el.innerText.toLowerCase();
          if (texts.some(txt => t.includes(txt.toLowerCase())) && el.offsetWidth > 0) {
            el.click();
            return true;
          }
        }
        return false;
      };

      if (!findAndClick(document)) {
        // Chercher dans les iframes
        const iframes = Array.from(document.querySelectorAll('iframe'));
        for (const iframe of iframes) {
          try {
            if (findAndClick(iframe.contentDocument)) break;
          } catch (e) { }
        }
      }
    });
    await new Promise(r => setTimeout(r, 2500));
  } catch (e) {
    console.log(`[DEBUG] Consent error: ${e.message}`);
  }
}

async function scrapeStockData(isin) {
  // Optionnel: On peut utiliser Puppeteer uniquement comme plan B, 
  // mais ici on va privilégier l'API qui est instantanée.
  let result = { isin, companyName: 'N/A', high1y: 'N/A', low1y: 'N/A', high1yDate: 'N/A', low1yDate: 'N/A' };

  const cleanNum = (val) => {
    if (!val || val === 'N/A') return 'N/A';
    if (typeof val === 'number') return val.toFixed(4).replace(/\.?0+$/, ''); // Supprime les zéros inutiles
    return val.toString().replace(/[\s\u00A0]/g, '').replace(',', '.').replace(/[^\d.]/g, '');
  };

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    const d = new Date(ts * 1000);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  try {
    // --- SOURCE 1 : YAHOO FINANCE API (HISTORIQUE 1 AN) ---
    // Cette méthode est 100x plus rapide et donne les DATES !
    console.log(`[YAHOO API] Résolution ${isin}...`);
    const searchRes = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${isin}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const searchData = await searchRes.json();
    const symbol = searchData.quotes?.[0]?.symbol;
    const name = searchData.quotes?.[0]?.longname || searchData.quotes?.[0]?.shortname || 'N/A';

    if (symbol) {
      result.companyName = name;
      console.log(`[YAHOO API] Extraction historique pour ${symbol}...`);

      const chartRes = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?range=1y&interval=1d`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });

      if (chartRes.ok) {
        const chartData = await chartRes.json();
        const chartResult = chartData.chart?.result?.[0];

        if (chartResult && chartResult.timestamp && chartResult.indicators?.quote?.[0]) {
          const timestamps = chartResult.timestamp;
          const highs = chartResult.indicators.quote[0].high;
          const lows = chartResult.indicators.quote[0].low;

          let maxHigh = -Infinity;
          let minLow = Infinity;
          let maxHighTimestamp = null;
          let minLowTimestamp = null;

          for (let i = 0; i < timestamps.length; i++) {
            const high = highs[i];
            const low = lows[i];

            if (high !== null && high > maxHigh) {
              maxHigh = high;
              maxHighTimestamp = timestamps[i];
            }
            if (low !== null && low < minLow) {
              minLow = low;
              minLowTimestamp = timestamps[i];
            }
          }

          if (maxHigh !== -Infinity && minLow !== Infinity) {
            result.high1y = cleanNum(maxHigh);
            result.high1yDate = formatDate(maxHighTimestamp);
            result.low1y = cleanNum(minLow);
            result.low1yDate = formatDate(minLowTimestamp);
            console.log(`[OK YAHOO API] ${result.companyName} | H: ${result.high1y} (${result.high1yDate}) | B: ${result.low1y} (${result.low1yDate})`);
            return result;
          }
        }
      }
    }
  } catch (e) {
    console.log(`[SKIP YAHOO API] ${e.message}`);
  }

  // --- SOURCE 2 : PUPPETEER FALLBACK (Si l'API Yahoo ne répond pas) ---
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.setViewport({ width: 1920, height: 1080 });

    try {
      console.log(`[GOOGLE] Recherche ${isin}...`);
      await page.goto(`https://www.google.com/finance/quote/${isin}:EPA`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise(r => setTimeout(r, 3000));

      const gData = await page.evaluate(() => {
        const text = document.body.innerText;
        const match = text.match(/(?:52\s?semaines|52-week range|52\s?weeks)[\s\S]{0,100}?(\d+[\s,.]\d*)\s+-\s+(\d+[\s,.]\d*)/i);
        const name = document.querySelector('div[role="main"] h1')?.innerText || document.querySelector('h1')?.innerText || 'N/A';
        return { low: match ? match[1] : 'N/A', high: match ? match[2] : 'N/A', name };
      });

      if (gData.high !== 'N/A') {
        result.companyName = gData.name;
        result.high1y = cleanNum(gData.high);
        result.low1y = cleanNum(gData.low);
        console.log(`[OK GOOGLE] ${result.companyName} (Pas de dates dispo sur Google)`);
        return result;
      }
    } catch (e) { console.log(`[SKIP GOOGLE] ${e.message}`); }

    console.log(`[ECHEC] Pas de données pour ${isin}`);
    if (!fs.existsSync(distPath)) fs.mkdirSync(distPath, { recursive: true });
    await page.screenshot({ path: path.join(distPath, 'debug_fail.png') });

  } finally {
    await browser.close();
  }

  return result;
}

app.get('/api/scrape/:isin', async (req, res) => {
  try {
    const data = await scrapeStockData(req.params.isin);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

if (fs.existsSync(distPath)) app.use(express.static(distPath));

app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) res.sendFile(indexPath);
  else res.status(404).send('Veuillez lancer "npm run build".');
});

app.listen(port, () => {
  console.log(`\nBOURSIER SCRAPER v3.3 (ULTRA-ROBUST FALLBACK)`);
  console.log(`URL : http://localhost:${port}\n`);
});
