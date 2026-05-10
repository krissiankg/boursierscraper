// email-report-server/server.js
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
const port = process.env.PORT || 3001;

// Path to ISIN list
const isinsPath = path.join(__dirname, '../data/isins.json');

// --- LOGIQUE DE SCRAPING (Identique au serveur principal pour la cohérence) ---
async function scrapeStockData(isin) {
    let result = { isin, companyName: 'N/A', high1y: 'N/A', low1y: 'N/A', high1yDate: 'N/A', low1yDate: 'N/A' };

    const cleanNum = (val) => {
        if (!val || val === 'N/A') return 'N/A';
        if (typeof val === 'number') return val.toFixed(4).replace(/\.?0+$/, '');
        return val.toString().replace(/[\s\u00A0]/g, '').replace(',', '.').replace(/[^\d.]/g, '');
    };

    const formatDate = (ts) => {
        if (!ts) return 'N/A';
        const d = new Date(ts * 1000);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    try {
        // YAHOO API
        const searchRes = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${isin}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const searchData = await searchRes.json();
        const symbol = searchData.quotes?.[0]?.symbol;
        const name = searchData.quotes?.[0]?.longname || searchData.quotes?.[0]?.shortname || 'N/A';

        if (symbol) {
            result.companyName = name;
            const chartRes = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?range=1y&interval=1d`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (chartRes.ok) {
                const chartData = await chartRes.json();
                const chartResult = chartData.chart?.result?.[0];
                if (chartResult && chartResult.timestamp && chartResult.indicators?.quote?.[0]) {
                    const timestamps = chartResult.timestamp;
                    const highs = chartResult.indicators.quote[0].high;
                    const lows = chartResult.indicators.quote[0].low;
                    let maxHigh = -Infinity; let minLow = Infinity;
                    let maxHighTs = null; let minLowTs = null;

                    for (let i = 0; i < timestamps.length; i++) {
                        const h = highs[i];
                        const l = lows[i];
                        if (h !== null && h > maxHigh) { maxHigh = h; maxHighTs = timestamps[i]; }
                        if (l !== null && l < minLow) { minLow = l; minLowTs = timestamps[i]; }
                    }
                    if (maxHigh !== -Infinity) {
                        result.high1y = cleanNum(maxHigh);
                        result.high1yDate = formatDate(maxHighTs);
                        result.low1y = cleanNum(minLow);
                        result.low1yDate = formatDate(minLowTs);
                        return result;
                    }
                }
            }
        }
    } catch (e) { console.log(`[YAHOO ERR] ${isin}: ${e.message}`); }

    // PUPPETEER FALLBACK
    const browser = await puppeteer.launch({ 
        headless: "new", 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        await page.goto(`https://www.google.com/finance/quote/${isin}:EPA`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await new Promise(r => setTimeout(r, 2000));
        const gData = await page.evaluate(() => {
            const text = document.body.innerText;
            const match = text.match(/(?:52\s?semaines|52-week range|52\s?weeks)[\s\S]{0,100}?(\d+[\s,.]\d*)\s+-\s+(\d+[\s,.]\d*)/i);
            const name = document.querySelector('h1')?.innerText || 'N/A';
            return { low: match ? match[1] : 'N/A', high: match ? match[2] : 'N/A', name };
        });
        if (gData.high !== 'N/A') {
            result.companyName = gData.name;
            result.high1y = cleanNum(gData.high);
            result.low1y = cleanNum(gData.low);
        }
    } catch (e) { console.log(`[PUPPETEER ERR] ${isin}: ${e.message}`); }
    finally { await browser.close(); }

    return result;
}

// --- LOGIQUE D'ENVOI D'EMAIL ---
async function sendReport(overrideEmail = null) {
    const recipient = overrideEmail || process.env.RECIPIENT_EMAIL;
    console.log(`[REPORT] Démarrage du scan automatique pour ${recipient}...`);
    
    if (!fs.existsSync(isinsPath)) {
        console.error("Fichier isins.json introuvable !");
        return;
    }

    const isins = JSON.parse(fs.readFileSync(isinsPath, 'utf8'));
    const results = [];

    for (const isin of isins) {
        console.log(`[REPORT] Scraping ${isin}...`);
        const data = await scrapeStockData(isin);
        results.push(data);
        await new Promise(r => setTimeout(r, 2000)); // Petit délai pour éviter le ban
    }

    // Création du Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(results.map(r => ({
        "ISIN": r.isin,
        "Entreprise": r.companyName,
        "Plus Haut 1A": r.high1y,
        "Date Haut": r.high1yDate,
        "Plus Bas 1A": r.low1y,
        "Date Bas": r.low1yDate
    })));
    XLSX.utils.book_append_sheet(wb, ws, "Rapport");
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Configuration SMTP optimisée pour Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const today = new Date().toLocaleDateString('fr-FR');
    
    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: recipient,
        subject: `📊 Rapport Boursier Quotidien - ${today}`,
        text: `Bonjour,\n\nVeuillez trouver ci-joint le rapport d'extraction des données boursières pour la journée du ${today}.\n\nNombre d'ISIN traités : ${results.length}\n\nCordialement,\nBoursier Scraper Bot`,
        attachments: [
            {
                filename: `Rapport_Boursier_${today.replace(/\//g, '-')}.xlsx`,
                content: buffer
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[SUCCESS] Rapport envoyé à ${recipient}`);
    } catch (error) {
        console.error(`[ERROR] Échec de l'envoi :`, error);
    }
}

// --- PLANIFICATION (Cron) ---
// S'exécute tous les jours à 18:00 (Paris Time - UTC+2 en été)
// Note: Le serveur doit être sur le bon fuseau horaire
cron.schedule('0 18 * * *', () => {
    sendReport();
}, {
    scheduled: true,
    timezone: "Europe/Paris"
});

// Endpoint pour déclenchement manuel
app.get('/trigger-report', async (req, res) => {
    const targetEmail = req.query.email || null;
    sendReport(targetEmail);
    res.send(`Scan et envoi de rapport lancés en arrière-plan vers ${targetEmail || "l'email par défaut"}.`);
});

app.listen(port, () => {
    console.log(`Serveur d'email actif sur le port ${port}`);
    console.log(`Prochain scan programmé à 18:00 (Europe/Paris)`);
});
