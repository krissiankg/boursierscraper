import * as XLSX from 'xlsx';
import { ScrapeResult } from '../types';

/**
 * Generates an XLSX file in memory and returns it as a Blob.
 * This is useful for downloading the file directly from the browser.
 * @param {ScrapeResult[]} data - The data to be included in the XLSX file.
 * @returns {Blob} - The generated XLSX file as a Blob.
 */
export function generateXlsxBlob(data: ScrapeResult[]): Blob {
  // Translate headers and select data
  const formattedData = data.map(item => ({
    "ISIN": item.isin,
    "Nom de l'entreprise": item.companyName,
    "Plus Haut 1A": item.high1y,
    "Date Haut 1A": item.high1yDate,
    "Plus Bas 1A": item.low1y,
    "Date Bas 1A": item.low1yDate,
    "Statut": item.status,
    "Message d'erreur": item.errorMessage || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  const columnWidths = [
    { wch: 15 }, // ISIN
    { wch: 30 }, // Nom de l'entreprise
    { wch: 15 }, // Plus Haut 1A
    { wch: 15 }, // Date Haut 1A
    { wch: 15 }, // Plus Bas 1A
    { wch: 15 }, // Date Bas 1A
    { wch: 10 }, // Statut
    { wch: 40 }, // Message d'erreur
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  const today = new Date().toISOString().split('T')[0];
  const sheetName = `Données ${today}`;
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Use XLSX.write to create the file in memory
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  return new Blob([wbout], { type: 'application/octet-stream' });
}


/**
 * Triggers a browser download for the generated XLSX file.
 * @param {ScrapeResult[]} data - The data to be included in the file.
 */
export function exportToXlsx(data: ScrapeResult[]): void {
  const blob = generateXlsxBlob(data);
  const today = new Date().toISOString().split('T')[0];
  const fileName = `donnees_boursieres_${today}.xlsx`;

  // Create a temporary link to trigger the download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}