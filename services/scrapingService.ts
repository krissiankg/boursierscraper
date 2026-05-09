import { StockData } from '../types';

/**
 * Fetches stock data for a given ISIN by calling the local scraping API.
 * @param {string} isin - The ISIN code of the stock to look up.
 * @returns {Promise<StockData>} - A promise that resolves to the extracted stock data.
 */
export async function fetchStockDataForIsin(isin: string): Promise<StockData> {
  console.log(`[SCRAPER] Recherche de données pour ${isin}...`);
  // Use the local server API instead of Gemini
  const response = await fetch(`http://localhost:3000/api/scrape/${isin}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur serveur: ${response.status}`);
  }

  const data = await response.json();
  console.log(`[SCRAPER] Données reçues pour ${isin}:`, data);
  
  // Ensure all required fields are present
  const missingFields = ['companyName', 'high1y', 'high1yDate', 'low1y', 'low1yDate']
    .filter(field => data[field] === undefined || data[field] === null || data[field] === 'N/A');

  if (missingFields.length > 0) {
    // Note: We might want to be less strict if some data is really missing on the site
    console.warn(`Données incomplètes pour ${isin}: ${missingFields.join(', ')}`);
  }
  
  return {
    isin: isin,
    companyName: data.companyName || 'N/A',
    high1y: data.high1y || 'N/A',
    high1yDate: data.high1yDate || 'N/A',
    low1y: data.low1y || 'N/A',
    low1yDate: data.low1yDate || 'N/A',
  };
}
