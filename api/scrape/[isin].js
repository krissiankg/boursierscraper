const { scrapeStockDataAPI } = require('../../lib/scraper');

module.exports = async function (req, res) {
  try {
    const { isin } = req.query;
    
    if (!isin) {
      return res.status(400).json({ error: 'ISIN manquant' });
    }

    const data = await scrapeStockDataAPI(isin);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
