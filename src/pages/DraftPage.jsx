import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth, db, getLeagueDetails, addStockToPortfolio } from '../firebaseService.js';
import { getStockQuote, searchStock } from '../finnhubService.js';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext.jsx';

export default function DraftPage() {
  const { leagueId } = useParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [isDraftOpen, setIsDraftOpen] = useState(false);

  // NEW POPUP STATE
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      if (currentUser && leagueId) {
        setLoading(true);

        const leagueData = await getLeagueDetails(leagueId);
        setIsDraftOpen(leagueData && leagueData.status === 'Open');

        const portfolioRef = doc(db, 'leagues', leagueId, 'portfolios', currentUser.uid);
        const docSnap = await getDoc(portfolioRef);

        if (docSnap.exists() && docSnap.data().stocks) {
          setPortfolio(docSnap.data().stocks);
        } else {
          setPortfolio([]);
        }
        setLoading(false);
      }
    };
    fetchPageData();
  }, [leagueId, currentUser]);

  const handleSearchChange = async (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.length > 0) {
      const searchResults = await searchStock(newQuery);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  };

  const handleAddStock = async (stock) => {
    if (!currentUser) return;

    if (portfolio.length >= 10) {
      alert("Your portfolio is full! You must remove a stock to add another.");
      return;
    }
    if (portfolio.find(s => s.symbol === stock.symbol)) {
      alert(`${stock.symbol} is already in your portfolio.`);
      return;
    }

    try {
      const quote = await getStockQuote(stock.symbol);
      if (!quote) throw new Error("Could not get stock price");

      const stockToAdd = {
        symbol: stock.symbol,
        name: stock.name,
        purchasePrice: quote.current
      };

      const success = await addStockToPortfolio(leagueId, currentUser.uid, stockToAdd);

      if (success) {
        setPortfolio([...portfolio, stockToAdd]);
      }
    } catch (error) {
      console.error("Error adding stock: ", error);
      alert("Failed to add stock. Please try again.");
    }
  };

  const handleRemoveStock = (stockSymbol) => {
    setPortfolio(portfolio.filter(s => s.symbol !== stockSymbol));
  };

  const pageStyle = { padding: '20px', display: 'flex', gap: '40px' };
  const columnStyle = { flex: 1 };

  if (loading) {
    return <div style={pageStyle}>Loading draft...</div>;
  }

  if (!isDraftOpen) {
    return (
      <div style={pageStyle}>
        <h2>The draft for this league is currently closed.</h2>
        <Link to={`/league/${leagueId}`}>Back to League Page</Link>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={columnStyle}>
        <h2>Draft Your Portfolio ({portfolio.length}/10 Stocks)</h2>
        <input
          type="text"
          placeholder="Search for a stock..."
          value={query}
          onChange={handleSearchChange}
          style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          disabled={!isDraftOpen}
        />
        <div>
          {results.map(stock => (
            <div key={stock.symbol} className="item-box">
              <div className="stock-info">
                <span className="stock-name">{stock.name}</span>
                <span className="stock-symbol">({stock.symbol})</span>
              </div>
              <button 
                className="button"
                onClick={() => handleAddStock(stock)}
                disabled={!isDraftOpen}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={columnStyle}>
        <h3 style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>Your Current Portfolio</span>

          {/* NEW BUTTON THAT OPENS POPUP */}
          <button className="button" onClick={() => setIsPopupOpen(true)}>
            AI Advisor <span class="white-text">✨</span>
          </button>

          <a href={`/league/${leagueId}`}>
            Leaderboard
          </a>
        </h3>

        {/* POPUP OVERLAY */}
        {isPopupOpen && (
          <div className="popup-overlay" onClick={() => setIsPopupOpen(false)}>
            <div className="popup-box" onClick={(e) => e.stopPropagation()}>
              <h3>AI Advisor Tips</h3>
              <p>Your portfolio is strong because you hold many leading, financially solid tech companies, but it’s heavily concentrated in one sector. This means you’re positioned well for tech growth, but you’re also more vulnerable if the tech industry dips. Adding stocks from other areas like healthcare, industrials, or energy would make your overall risk lower and your portfolio more balanced. Keep your long-term winners like AAPL, MSFT, and NVDA, but consider slowly expanding into non-tech sectors for better diversification.
</p>
              <button onClick={() => setIsPopupOpen(false)} className="popup-close">Close</button>
            </div>
          </div>
        )}

        <div>
          {portfolio.map(stock => (
            <div key={stock.symbol} className="item-box">
              <div className="stock-info">
                <span className="stock-name">{stock.name}</span>
                <span className="stock-symbol">({stock.symbol})</span>
                <span className="stock-percent">0.00%</span>
              </div>
              <button 
                className="button"
                onClick={() => handleRemoveStock(stock.symbol)}
                disabled={!isDraftOpen}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {portfolio.length === 10 && (
          <div style={{marginTop: '20px', color: 'green', fontWeight: 'bold'}}>
            Your portfolio is full!
          </div>
        )}
      </div>
    </div>
  );
}

