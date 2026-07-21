// src/services/marketData.js

/**
 * Fetches historical price data using CORS proxies.
 * Follows the fallback sequence defined in the specification (F-01).
 *
 * @param {string} symbol - The Yahoo Finance symbol (e.g., 'SOL-USD', 'BSOL-USD')
 * @returns {Promise<Object>} - Object containing timestamp array and close array
 */
export async function fetchHistoricalData(symbol, range = '2y') {
  const directUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=1d`;
  const targetUrl = encodeURIComponent(directUrl);

  const proxy1 = `https://corsproxy.io/?${targetUrl}`;
  const proxy2 = `https://api.allorigins.win/raw?url=${targetUrl}`;

  const fetchWithUrl = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  };

  // 1. Try direct fetch first (works when CORS is not restricted or in dev/node environment)
  try {
    return await fetchWithUrl(directUrl);
  } catch (directErr) {
    // 2. Try primary CORS proxy
    try {
      return await fetchWithUrl(proxy1);
    } catch (error) {
      console.warn('Primary proxy failed, trying fallback 1', error);
      try {
        return await fetchWithUrl(proxy2);
      } catch (fallbackError) {
        console.error('All proxies failed', fallbackError);
        throw new Error('Failed to fetch market data. Please try again later.');
      }
    }
  }
}

/**
 * Extracts and aligns the data from the API response into a workable format.
 */
function extractSeries(apiData) {
  if (!apiData?.chart?.result?.[0]) return { timestamps: [], prices: [] };
  
  const result = apiData.chart.result[0];
  const timestamps = result.timestamp || [];
  const prices = result.indicators.quote[0].close || [];
  
  return { timestamps, prices };
}

/**
 * Merges SOL and BSOL data, keeping only overlapping weekday trading days.
 * Date formatting into YYYY-MM-DD ensures exact day matching.
 */
export async function loadRatioData() {
  const [solData, bsolData] = await Promise.all([
    fetchHistoricalData('SOL-USD', '2y'),
    fetchHistoricalData('BSOL', '2y')
  ]);

  const solSeries = extractSeries(solData);
  const bsolSeries = extractSeries(bsolData);

  // Map dates to prices for quick lookup
  const solMap = new Map();
  solSeries.timestamps.forEach((ts, idx) => {
    // Yahoo Finance timestamps are in seconds
    const date = new Date(ts * 1000).toISOString().split('T')[0];
    if (solSeries.prices[idx] !== null) {
      solMap.set(date, solSeries.prices[idx]);
    }
  });

  const mergedData = [];
  bsolSeries.timestamps.forEach((ts, idx) => {
    const dateObj = new Date(ts * 1000);
    const dayOfWeek = dateObj.getUTCDay(); // 0 = Sun, 6 = Sat
    const date = dateObj.toISOString().split('T')[0];
    const bsolPrice = bsolSeries.prices[idx];
    const solPrice = solMap.get(date);

    // Only include weekday trading days (Mon-Fri) where BOTH prices exist (F-02 Missing Trading Days)
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && bsolPrice != null && solPrice != null && solPrice > 0) {
      mergedData.push({
        date,
        timestamp: ts * 1000,
        solPrice,
        bsolPrice,
        ratio: bsolPrice / solPrice
      });
    }
  });

  // Sort by date ascending
  mergedData.sort((a, b) => a.timestamp - b.timestamp);
  
  return mergedData;
}


