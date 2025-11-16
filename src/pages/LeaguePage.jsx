import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebaseService.js';
import { getStockQuote } from '../finnhubService.js';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'; // Make sure getDocs is imported

// HELPER FUNCTION: Gets a user's name from their ID
const getUserName = async (userId) => {
  if (!userId) return "Unknown User";
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().displayName || "Unnamed User";
    }
    return "Unknown User";
  } catch (error) {
    console.error("Error getting user name:", error);
    return "Unknown User";
  }
};

export default function LeaguePage() {
  const { leagueId } = useParams(); // Gets the ID from the URL
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leagueName, setLeagueName] = useState('Loading League...');
  
  // This is the main function to fetch all data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (!leagueId) return;
      setLoading(true);

      try {
        // 1. Fetch the league's details
        const leagueRef = doc(db, 'leagues', leagueId);
        const leagueSnap = await getDoc(leagueRef);
        if (!leagueSnap.exists()) {
          setLeagueName('League Not Found');
          setLoading(false);
          return;
        }
        
        const leagueData = leagueSnap.data();
        setLeagueName(leagueData.name);
        
        const memberIds = leagueData.members || [];
        
        // 2. Fetch all portfolios in this league
        const portfoliosRef = collection(db, 'leagues', leagueId, 'portfolios');
        const portfoliosSnap = await getDocs(portfoliosRef);
        
        const portfolioData = {}; // Use a map for easy lookup
        portfoliosSnap.forEach(doc => {
          portfolioData[doc.id] = doc.data().stocks || [];
        });

        // 3. Create a profile for every member
        const memberProfiles = await Promise.all(memberIds.map(async (memberId) => {
          const name = await getUserName(memberId);
          const portfolio = portfolioData[memberId] || []; // Get their portfolio or an empty one
          
          let totalGain = 0;
          let stockCount = 0;

          if (portfolio.length > 0) {
            // Calculate gain for each stock
            const stockGains = await Promise.all(portfolio.map(async (stock) => {
              const quote = await getStockQuote(stock.symbol);
              if (quote && quote.current && stock.purchasePrice > 0) {
                return (quote.current - stock.purchasePrice) / stock.purchasePrice;
              }
              return 0; // No gain if data is missing
            }));

            // Average the gains
            stockCount = portfolio.length;
            totalGain = stockGains.reduce((acc, gain) => acc + gain, 0) / stockCount;
          }
          
          return {
            userId: memberId,
            name: name,
            gain: totalGain * 100, // Convert to percentage
            stockCount: stockCount,
          };
        }));

        // 4. Sort and set the final leaderboard
        const sortedLeaderboard = memberProfiles.sort((a, b) => b.gain - a.gain);
        setLeaderboard(sortedLeaderboard);

      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        // Check console for "Missing Index" error
      }
      
      setLoading(false);
    };

    fetchLeaderboardData();
  }, [leagueId]); // Re-run if leagueId changes

  // --- Styles ---
  const pageStyle = { padding: '20px' };
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  // item-box style is now in index.css

  if (loading) {
    return <div style={pageStyle}>Loading leaderboard...</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h2>{leagueName} Leaderboard</h2>
        <Link to={`/league/${leagueId}/draft`} style={buttonStyle}>
          Go to Draft
        </Link>
      </div>
      
      <p>This page is for league: <strong>{leagueId}</strong></p>

      <ol style={{listStyleType: 'none', padding: 0}}>
        {leaderboard.map((player, index) => (
          <li key={player.userId} className="item-box">
            <span>{index + 1}. {player.name} ({player.stockCount} stocks)</span>
            <span style={{ color: player.gain > 0 ? 'green' : (player.gain < 0 ? 'red' : 'gray') }}>
              {player.gain.toFixed(1)}%
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}