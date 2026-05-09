const isin = 'FR0010557264';

(async () => {
    try {
        // 1. Resolve ISIN to Symbol
        const searchRes = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${isin}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const searchData = await searchRes.json();
        const symbol = searchData.quotes?.[0]?.symbol;
        const name = searchData.quotes?.[0]?.longname || searchData.quotes?.[0]?.shortname;

        console.log(`Symbol: ${symbol}, Name: ${name}`);

        if (symbol) {
            // 2. Fetch 1-year historical data
            const chartRes = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?range=1y&interval=1d`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            const chartData = await chartRes.json();
            
            const result = chartData.chart.result[0];
            const timestamps = result.timestamp;
            const highs = result.indicators.quote[0].high;
            const lows = result.indicators.quote[0].low;

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

            const formatDate = (ts) => {
                if (!ts) return 'N/A';
                const d = new Date(ts * 1000);
                return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
            };

            console.log(`High 1Y: ${maxHigh.toFixed(2)} on ${formatDate(maxHighTimestamp)}`);
            console.log(`Low 1Y: ${minLow.toFixed(2)} on ${formatDate(minLowTimestamp)}`);
        }
    } catch (e) {
        console.error(e);
    }
})();
