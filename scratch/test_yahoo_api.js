const isin = 'FR0011040500'; 
(async () => {
  try {
    const searchRes = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${isin}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const searchData = await searchRes.json();
    const symbol = searchData.quotes?.[0]?.symbol;
    const name = searchData.quotes?.[0]?.longname || searchData.quotes?.[0]?.shortname;
    
    console.log(`Resolved ISIN ${isin} to Symbol: ${symbol}, Name: ${name}`);

    if (symbol) {
        const quoteRes = await fetch(`https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const quoteData = await quoteRes.json();
        
        const summary = quoteData.quoteSummary?.result?.[0]?.summaryDetail;
        
        const fiftyTwoWeekHigh = summary?.fiftyTwoWeekHigh?.raw;
        const fiftyTwoWeekLow = summary?.fiftyTwoWeekLow?.raw;
        
        console.log(`High: ${fiftyTwoWeekHigh}, Low: ${fiftyTwoWeekLow}`);
    }
  } catch (e) {
    console.error(e);
  }
})();
