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

async function scrapeStockDataAPI(isin) {
    let result = { isin, companyName: 'N/A', high1y: 'N/A', low1y: 'N/A', high1yDate: 'N/A', low1yDate: 'N/A' };

    try {
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
                        return result;
                    }
                }
            }
        }
    } catch (e) {
        console.error(`[ERREUR] Impossible d'extraire ${isin}:`, e.message);
    }
    return result;
}

module.exports = { scrapeStockDataAPI };
