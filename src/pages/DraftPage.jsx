import React, { useState, useEffect } from 'react'; // 1. Add useEffect
import { useParams, Link } from 'react-router-dom';
import { auth, db } from '../firebaseService.js'; // 2. Import 'db' (singular)
import { getStockQuote, searchStock } from '../finnhubService.js';
import { addStockToPortfolio } from '../firebaseService.js'; // (singular)
import { doc, getDoc } from 'firebase/firestore'; // 3. Import getDoc

export default function DraftPage() {
  const { leagueId } = useParams(); // Gets 'test123' from the URL
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [portfolio, setPortfolio] = useState([]); // 4. Start with empty portfolio
  const [loading, setLoading] = useState(true); // 5. Add loading state
  const { currentUser } = useAuth(); // 6. Get current user

  // 7. Add useEffect to fetch portfolio on load
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (currentUser && leagueId) {
        setLoading(true);
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
    fetchPortfolio();
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
    if (!currentUser) return; // Make sure user is logged in
    
    // Check if portfolio is full
    if (portfolio.length >= 10) {
      alert("Your portfolio is full! You must remove a stock to add another.");
      return;
    }
    
    // Check if stock is already in portfolio
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
      
      // 3. Save it to Firebase (this will 'arrayUnion')
      await addStockToPortfolio(leagueId, currentUser.uid, stockToAdd);
      
      // 4. Update local state
      setPortfolio([...portfolio, stockToAdd]);
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
  const pageStyle = { padding: '20px', display: 'flex', gap: '40px' };
  const columnStyle = { flex: 1 };
  const buttonStyle = { padding: '4px 8px', cursor: 'pointer' };
  // item-box style is now in index.css

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
        />
        <h3>Search Results</h3>
        <div>
          {results.map(stock => (
            <div key={stock.symbol} className="item-box">
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
        {loading ? (
          <p>Loading portfolio...</p>
        ) : (
          <div>
            {portfolio.map(stock => (
              <div key={stock.symbol} className="item-box">
                <span>{stock.name} ({stock.symbol})</span>
                <button style={{...buttonStyle, backgroundColor: '#fdd'}} onClick={() => handleRemoveStock(stock.symbol)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
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