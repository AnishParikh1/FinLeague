import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// FAKE data that matches what Player 2's finnhubService.js will provide
const FAKE_SEARCH_RESULTS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
];

export default function DraftPage() {
  const { leagueId } = useParams(); // Gets 'test123' from the URL
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [portfolio, setPortfolio] = useState([
    { symbol: 'NVDA', name: 'Nvidia Corp.' } // Start with one fake stock
  ]);

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    // In the real app, you'll call Player 2's 'searchStock(newQuery)'
    if (newQuery.length > 0) {
      setResults(FAKE_SEARCH_RESULTS); // Show fake data on any search
    } else {
      setResults([]); // Clear results on empty
    }
  };

  const handleAddStock = (stock) => {
    // TODO: Player 2 will make this function get the REAL price
    console.log(`TODO: Add ${stock.symbol} and get real price`);
    if (portfolio.length < 10 && !portfolio.find(s => s.symbol === stock.symbol)) {
      setPortfolio([...portfolio, stock]);
    }
  };

  const handleRemoveStock = (stockSymbol) => {
    setPortfolio(portfolio.filter(s => s.symbol !== stockSymbol));
  };

  // --- Styles ---
  const pageStyle = { padding: '20px', display: 'flex', gap: '40px' };
  const columnStyle = { flex: 1 };
  const stockItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px',
    border: '1px solid #eee',
  };
  const buttonStyle = { padding: '4px 8px', cursor: 'pointer' };

  return (
    <div style={pageStyle}>
      <div style={columnStyle}>
        <h2>Draft Your Portfolio ({portfolio.length}/10 Stocks)</h2>
        <input
          type="text"
          placeholder="Search for a stock..."
          value={query}
          onChange={handleSearchChange}
          style={{ width: '100%', padding: '8px' }}
        />
        <h3>Search Results</h3>
        <div>
          {results.map(stock => (
            <div key={stock.symbol} style={stockItemStyle}>
              <span>{stock.name} ({stock.symbol})</span>
              <button style={buttonStyle} onClick={() => handleAddStock(stock)}>
                Add
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={columnStyle}>
        <h3>Your Current Portfolio</h3>
        {portfolio.map(stock => (
          <div key={stock.symbol} style={stockItemStyle}>
            <span>{stock.name} ({stock.symbol})</span>
            <button style={{...buttonStyle, backgroundColor: '#fdd'}} onClick={() => handleRemoveStock(stock.symbol)}>
              Remove
            </button>
          </div>
        ))}
        {portfolio.length === 10 && (
          <div style={{marginTop: '20px', color: 'green', fontWeight: 'bold'}}>
            Your portfolio is full!
            <Link to={`/league/${leagueId}`} style={{marginLeft: '10px'}}>
              See Leaderboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}