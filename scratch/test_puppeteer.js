const puppeteer = require('puppeteer');

async function testPuppeteer(isin) {
    console.log(`Starting Puppeteer for ISIN: ${isin}`);
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    try {
        // Use a real User Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('Navigating to search...');
        await page.goto(`https://www.boursier.com/recherche?q=${isin}`, { waitUntil: 'networkidle2', timeout: 30000 });
        
        console.log(`Current URL: ${page.url()}`);

        // Handle Cookie Consent
        try {
            const cookieButton = await page.waitForSelector('#didomi-notice-agree-button', { timeout: 5000 });
            if (cookieButton) {
                await cookieButton.click();
                console.log('Cookies accepted');
            }
        } catch (e) {
            console.log('Cookie banner not found or already accepted');
        }

        // Wait for company name
        await page.waitForSelector('h1', { timeout: 10000 });
        const companyName = await page.$eval('h1', el => el.innerText.trim());
        console.log(`Company: ${companyName}`);

        // Try to find the 1Y High/Low
        // On Boursier, it's often in a table with performances
        const data = await page.evaluate(() => {
            const findValue = (label) => {
                const elements = Array.from(document.querySelectorAll('td, th, span, div'));
                const el = elements.find(e => e.innerText.trim() === label);
                if (el) {
                    // Try next sibling or parent's next sibling
                    let val = el.nextElementSibling ? el.nextElementSibling.innerText.trim() : '';
                    if (!val) {
                        const parent = el.parentElement;
                        const siblings = Array.from(parent.children);
                        const index = siblings.indexOf(el);
                        if (siblings[index + 1]) val = siblings[index+1].innerText.trim();
                    }
                    return val;
                }
                return null;
            };

            // Boursier structure: 1 an High is often in a specific table
            // Let's look for "Plus haut" and "1 an" context
            const allRows = Array.from(document.querySelectorAll('tr'));
            let high1y = 'N/A', low1y = 'N/A', high1yDate = 'N/A', low1yDate = 'N/A';
            
            // Search in tables
            for (const row of allRows) {
                const text = row.innerText;
                if (text.includes('Plus haut') && text.includes('1 an')) {
                    const cells = Array.from(row.querySelectorAll('td'));
                    if (cells.length >= 2) high1y = cells[1].innerText.trim();
                }
                if (text.includes('Plus bas') && text.includes('1 an')) {
                    const cells = Array.from(row.querySelectorAll('td'));
                    if (cells.length >= 2) low1y = cells[1].innerText.trim();
                }
            }

            return { high1y, low1y, high1yDate, low1yDate };
        });

        console.log('Extracted Data:', data);

    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await browser.close();
    }
}

testPuppeteer('FR0000120404');
