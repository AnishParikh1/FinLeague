import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebaseService.js'; // Corrected import
import { getStockQuote } from '../finnhubService.js';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'; // Make sure getDocs is imported

// HELPER FUNCTION: Gets a user's name from their ID
const fetchUserName = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().displayName || 'Unnamed User';
    }
  } catch (error) {
    console.error("Error fetching user name:", error);
  }
  return 'Unknown User';
};

// HELPER FUNCTION: Calculates a portfolio's gain
const calculatePortfolioGain = async (portfolio) => {
  // Return early if no stocks
  if (!portfolio.stocks || portfolio.stocks.length === 0) {
    const name = await fetchUserName(portfolio.userId);
    return { userId: portfolio.userId, gain: 0, name: name };
  }

  let totalGain = 0;
  let stockCount = 0;

  // We use Promise.all to fetch all stock quotes in parallel (it's fast)
  await Promise.all(portfolio.stocks.map(async (stock) => {
    try {
      const quote = await getStockQuote(stock.symbol);
      if (quote && quote.current) {
        const gain = ((quote.current - stock.purchasePrice) / stock.purchasePrice) * 100;
        totalGain += gain;
        stockCount++;
      }
    } catch (error) {
      console.error(`Failed to get quote for ${stock.symbol}`, error);
    }
  }));

  const userName = await fetchUserName(portfolio.userId);

  return {
    userId: portfolio.userId,
    gain: stockCount > 0 ? totalGain / stockCount : 0, // Average gain
    name: userName,
  };
};

// Helper function to get all portfolios for a league
const getLeaguePortfolios = async (leagueId) => {
  if (!leagueId) return [];
  try {
    const portfoliosRef = collection(db, 'leagues', leagueId, 'portfolios');
    const snapshot = await getDocs(portfoliosRef);
    const portfolios = [];
    snapshot.forEach(doc => {
      portfolios.push({
        userId: doc.id,
        ...doc.data()
      });
    });
    return portfolios;
  } catch (error) {
    console.error("Error getting league portfolios:", error);
    return [];
  }
};


export default function LeaguePage() {
  const { leagueId } = useParams();
  
  // State for the page
  const [leaderboard, setLeaderboard] = useState([]);
  const [leagueName, setLeagueName] = useState('Loading League...');
  const [loading, setLoading] = useState(true);

  // This block runs ONCE when the page loads.
  useEffect(() => {
    // We define an async function inside so we can use 'await'
    const fetchLeaderboardData = async () => {
      if (!leagueId) return;
      setLoading(true);
      
      try {
        // --- 1. Fetch the League's Name ---
        const leagueRef = doc(db, 'leagues', leagueId);
        const leagueSnap = await getDoc(leagueRef);
        
        let leagueMembers = [];
        if (leagueSnap.exists()) {
          setLeagueName(leagueSnap.data().name); // <-- Sets the REAL name
          leagueMembers = leagueSnap.data().members || []; // <-- Get the list of members
        } else {
          setLeagueName('League Not Found');
          setLoading(false);
          return;
        }

        // --- 2. Fetch all portfolios FOR THE MEMBERS IN THE LEAGUE ---
        const portfolioPromises = leagueMembers.map(async (memberId) => {
          const portfolioRef = doc(db, 'leagues', leagueId, 'portfolios', memberId);
          const portfolioSnap = await getDoc(portfolioRef);

          if (portfolioSnap.exists()) {
            // This user has a portfolio
            return { userId: memberId, ...portfolioSnap.data() };
          } else {
            // This user has joined but not drafted, create a "dummy" portfolio
            return { userId: memberId, stocks: [] };
          }
        });

        const portfolios = await Promise.all(portfolioPromises);
        
        // --- 3. Calculate the gain for every portfolio ---
        const gainPromises = portfolios.map(calculatePortfolioGain);
        const calculatedLeaderboard = await Promise.all(gainPromises);

        // --- 4. Sort the final leaderboard ---
        calculatedLeaderboard.sort((a, b) => b.gain - a.gain);
        
        // --- 5. Update the state ---
        setLeaderboard(calculatedLeaderboard);
        
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
        setLeagueName("Error loading league");
      }
      
      setLoading(false);
    };

    // --- THIS IS THE FIX ---
    // It now correctly calls 'fetchLeaderboardData'
    fetchLeaderboardData();
    
  }, [leagueId]); // The [leagueId] tells it to re-run if the URL ID changes

  
  // --- STYLES (for quick setup) ---
  const pageStyle = { padding: '20px', maxWidth: '800px', margin: '0 auto' };
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px'
  };
  const buttonStyle = {
    padding: '10px 15px',
    fontSize: '16px',
    cursor: 'pointer',
    textDecoration: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '5px'
  };
  const itemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: '5px',
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '10px',
  };

  // 4. Handle the loading state
  if (loading) {
    return <div style={pageStyle}><h2>Calculating leaderboard...</h2></div>;
  }

  // --- JSX RENDER ---
  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h2>{leagueName}</h2> {/* <-- Uses the REAL name */}
        <Link to={`/league/${leagueId}/draft`} style={buttonStyle}>
          Go to Draft
        </Link>
      </div>
      
      <p style={{color: '#555'}}>League ID: <strong>{leagueId}</strong></p>

      <ol style={{listStyle: 'none', padding: 0}}>
        {leaderboard.map((player, index) => (
          <li key={player.userId} style={itemStyle}>
            <span>{index + 1}. {player.name}</span>
            <span style={{ color: player.gain >= 0 ? 'green' : 'red' }}>
              {player.gain.toFixed(2)}%
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}