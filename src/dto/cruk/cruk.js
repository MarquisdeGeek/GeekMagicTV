const axios = require('axios');
const cheerio = require('cheerio');

const logger = require('../../lib/logger');


async function extractFundraisingTotal(teamURL) {
  try {
    // 1. Fetch the raw HTML from the donation page
    const cacheBusterUrl = `${teamURL}?_=${Date.now()}`;
    const { data } = await axios.get(cacheBusterUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    const ch = cheerio.load(data);

    // 1. Target the Total Amount Raised 
    let raisedAmount = ch('.amount-raised, [data-testid="amount-raised"], .total').text().trim();

    // 2. Target the Fundraising Target Amount
    let targetAmount = ch('.fundraising-target, [data-testid="fundraising-target"], .target-amount, .target').text().trim();

    // 3. Robust Regex Fallbacks (runs if the HTML structure modifications break the class selectors)
    if (!raisedAmount || !targetAmount) {
      const pageText = ch.text();
      
      // Look for standard phrases like "raised of £1,000" or similar text boundaries
      if (!raisedAmount) {
        const raisedMatch = pageText.match(/£[0-9,]+(?=\s+raised)/i);
        if (raisedMatch) raisedAmount = raisedMatch[0];
      }
      
      if (!targetAmount) {
        const targetMatch = pageText.match(/(?:target of|of)\s+(£[0-9,]+)/i);
        if (targetMatch) targetAmount = targetMatch[1];
      }
    }

    return {
      raised: raisedAmount || null,
      target: targetAmount || null
    };

  } catch (error) {
    logger.error(`Failed to execute HTML scraping sequence: ${error.message}`);
    return null;
  }
}



module.exports = { extractFundraisingTotal };
