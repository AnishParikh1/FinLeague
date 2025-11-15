// src/finnhubService.js

// Get the API key from the .env.local file
const API_KEY = import.meta.env.VITE_FINNHUB_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

/**
 * Searches for a stock symbol.
 */
export const searchStock = async (query) => {
  try {
    const url = `${BASE_URL}/search?q=${query}&token=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();

    // Filter for cleaner results
    return data.result
      .filter(item => item.type === 'Common Stock' && !item.symbol.includes('.'))
      .map(item => ({
        symbol: item.symbol,
        name: item.description,
      }));
  } catch (error) {
    console.error("Error searching stock:", error);
    return []; // Return empty array on error
  }
};

/**
 * Gets the current quote for a stock.
 */
export const getStockQuote = async (symbol) => {
  try {
    const url = `${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();

    // Return only the data we need
    return {
      current: data.c, // Current price
      previousClose: data.pc,
      change: data.d,
    };
  } catch (error) {
    console.error("Error getting stock quote:", error);
    return null; // Return null on error
  }
};