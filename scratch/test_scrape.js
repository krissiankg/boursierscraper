const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape(isin) {
  try {
    const searchUrl = `https://www.boursier.com/recherche?q=${isin}`;
    console.log(`Searching for: ${searchUrl}`);
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      maxRedirects: 5
    });

    const finalUrl = response.request.res.responseUrl;
    console.log(`Final URL: ${finalUrl}`);

    const $ = cheerio.load(response.data);
    
    // Example: extraction of company name
    const companyName = $('h1').text().trim();
    console.log(`Company: ${companyName}`);

    // Find the 1Y high/low
    // In Boursier, it's often in a table with class or near text
    let high1y = 'N/A';
    let low1y = 'N/A';
    let high1yDate = 'N/A';
    let low1yDate = 'N/A';

    $('td, th, span').each((i, el) => {
      const text = $(el).text().trim();
      if (text.includes('Plus haut (1 an)') || text.includes('Plus haut 1 an')) {
        high1y = $(el).next().text().trim();
      }
      if (text.includes('Plus bas (1 an)') || text.includes('Plus bas 1 an')) {
        low1y = $(el).next().text().trim();
      }
    });

    console.log({ companyName, high1y, low1y });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testScrape('FR0000120404');
