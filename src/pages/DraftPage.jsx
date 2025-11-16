import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth, db, getLeagueDetails, addStockToPortfolio } from '../firebaseService.js';
import { getStockQuote, searchStock } from '../finnhubService.js'; // <-- This import will now work
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext.jsx';

export default function DraftPage() {
  const { leagueId } = useParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [isDraftOpen, setIsDraftOpen] = useState(false); // <-- NEW: Track draft status

  // 7. Add useEffect to fetch portfolio AND league status on load
  useEffect(() => {
    const fetchPageData = async () => {
      if (currentUser && leagueId) {
        setLoading(true);
        
        // 1. Fetch League Status
        const leagueData = await getLeagueDetails(leagueId);
        if (leagueData && leagueData.status === 'DRAFT_OPEN') {
          setIsDraftOpen(true);
        } else {
          setIsDraftOpen(false);
        }
        
        // 2. Fetch Portfolio
        const portfolioRef = doc(db, 'leagues', leagueId, 'portfolios', currentUser.uid);
        const docSnap = await getDoc(portfolioRef);
        
        if (docSnap.exists() && docSnap.data().stocks) {
          setPortfolio(docSnap.data().stocks);
        } else {
          setPortfolio([]); // User has no portfolio yet
        }
        setLoading(false);
      }
    };
    fetchPageData();
  }, [leagueId, currentUser]); // Re-run if these change

  const handleSearchChange = async (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (newQuery.length > 0) {
      const searchResults = await searchStock(newQuery); // Call real API
      setResults(searchResults);
    } else {
      setResults([]); // Clear results on empty
    }
  };

  const handleAddStock = async (stock) => {
    if (!currentUser) return;
    
// ... (portfolio checks) ...
    if (portfolio.length >= 10) {
      alert("Your portfolio is full! You must remove a stock to add another.");
      return;
    }
    if (portfolio.find(s => s.symbol === stock.symbol)) {
      alert(`${stock.symbol} is already in your portfolio.`);
      return;
    }

    try {
      // 1. Get the current price
      const quote = await getStockQuote(stock.symbol);
      if (!quote) throw new Error("Could not get stock price");

      // 2. Create the stock object
      const stockToAdd = {
        symbol: stock.symbol,
        name: stock.name, // Get name from the search result 'stock' object
        purchasePrice: quote.current
      };
      
      // 3. Save it to Firebase (this will now check status on the backend)
      const success = await addStockToPortfolio(leagueId, currentUser.uid, stockToAdd);
      
      // 4. Update local state ONLY if save was successful
      if (success) {
        setPortfolio([...portfolio, stockToAdd]);
      }
    } catch (error) {
      console.error("Error adding stock: ", error);
      alert("Failed to add stock. Please try again.");
    }
  };

  const handleRemoveStock = (stockSymbol) => {
    // TODO: This only removes from the local state.
    // For a real app, you'd need a 'removeStockFromPortfolio' function.
    alert("Note: This only removes from the local view for now.");
    setPortfolio(portfolio.filter(s => s.symbol !== stockSymbol));
  };

  // --- Styles ---
// ... (pageStyle, columnStyle, buttonStyle) ...
  const pageStyle = { padding: '20px', display: 'flex', gap: '40px' };
  const columnStyle = { flex: 1 };
  // item-box style is now in index.css

  // --- NEW: Show loading message ---
  if (loading) {
    return <div style={pageStyle}>Loading draft...</div>
  }

  // --- NEW: Show "Draft Closed" message ---
  if (!isDraftOpen) {
    return (
      <div style={pageStyle}>
        <h2>The draft for this league is currently closed.</h2>
        <Link to={`/league/${leagueId}`}>Back to League Page</Link>
      </div>
    )
  }

  // --- Render the main page if draft is open ---
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
          disabled={!isDraftOpen} // <-- Disable if draft is closed
        />
        <div>
          {results.map(stock => (
            <div key={stock.symbol} className="item-box">
              {/* --- UPDATED THIS BLOCK --- */}
              <div className="stock-info">
                <span className="stock-name">{stock.name}</span>
                <span className="stock-symbol">({stock.symbol})</span>
              </div>
              {/* --- END OF UPDATE --- */}
              <button 
                className="button"
                onClick={() => handleAddStock(stock)}
                disabled={!isDraftOpen} // <-- Disable if draft is closed
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={columnStyle}>
        <h3>Your Current Portfolio <span style="float;right;">
          <Link to={`/league/${leagueId}`} style={{marginLeft: '10px'}}>
              See Leaderboard
          </Link></span>
        </h3>
        {/* We already handled loading above, so we can remove it here */}
        <div>
          {portfolio.map(stock => (
            <div key={stock.symbol} className="item-box">
              {/* --- UPDATED THIS BLOCK --- */}
              <div className="stock-info">
                <span className="stock-name">{stock.name}</span>
                <span className="stock-symbol">({stock.symbol})</span>
              </div>
              {/* --- END OF UPDATE --- */}
              <button 
                className="button"
                onClick={() => handleRemoveStock(stock.symbol)}
                disabled={!isDraftOpen} // <-- Disable if draft is closed
              >
                Remove
              </button>
            </div>
          ))}
          </div>
        {portfolio.length === 10 && (
// ... (portfolio full message) ...
          <div style={{marginTop: '20px', color: 'green', fontWeight: 'bold'}}>
            Your portfolio is full!
            
          </div>
        )}
      </div>
    </div>
  );
}
