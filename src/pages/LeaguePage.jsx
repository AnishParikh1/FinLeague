import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, updateLeagueStatus } from '../firebaseService.js'; // <-- Import updateLeagueStatus
import { getStockQuote } from '../finnhubService.js';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../AuthContext.jsx'; // <-- Import useAuth to check user ID

// ... (getUserName helper function) ...
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
  const { leagueId } = useParams();
  const { currentUser } = useAuth(); // <-- Get the current user
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leagueData, setLeagueData] = useState(null); // <-- Store all league data
  
  // This is the main function to fetch all data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      // ... (rest of the function) ...
      if (!leagueId) return;
      setLoading(true);

      try {
        // 1. Fetch the league's details
        const leagueRef = doc(db, 'leagues', leagueId);
        const leagueSnap = await getDoc(leagueRef);
        if (!leagueSnap.exists()) {
          setLeagueData(null);
          setLoading(false);
          return;
        }
        
        const data = leagueSnap.data();
        setLeagueData(data); // <-- Store all league data here
        
        const memberIds = data.members || [];
        
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

  // --- NEW: Handle Draft Status Change ---
  const handleStatusChange = async (newStatus) => {
    if (!leagueId) return;
    setLoading(true); // Re-set loading
    await updateLeagueStatus(leagueId, newStatus);
    // Refresh the league data
    const leagueRef = doc(db, 'leagues', leagueId);
    const leagueSnap = await getDoc(leagueRef);
    if (leagueSnap.exists()) {
      setLeagueData(leagueSnap.data());
    }
    setLoading(false);
  };

  // --- Styles ---
// ... (pageStyle, headerStyle, buttonStyle) ...
  const pageStyle = { padding: '20px' };
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  // NEW: Admin panel style
  const adminBoxStyle = {
    border: '2px solid #007bff',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
    backgroundColor: '#f0f8ff',
  };

  if (loading) {
    return <div style={pageStyle}>Loading leaderboard...</div>;
  }

  // Check if league exists
  if (!leagueData) {
    return <div style={pageStyle}><h2>League Not Found</h2></div>;
  }
  
  const isCommissioner = currentUser.uid === leagueData.commissionerId;
  const isDraftOpen = leagueData.status === 'DRAFT_OPEN';

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h2>{leagueData.name} Leaderboard</h2>
        <Link 
          to={`/league/${leagueId}/draft`} 
          className={`button ${!isDraftOpen ? 'disabled' : ''}`}
          onClick={(e) => !isDraftOpen && e.preventDefault()}
        >
          Go to Draft
        </Link>
      </div>
      
      <p>This page is for league: <strong>{leagueId}</strong></p>
      <p><strong>Draft Status:</strong> {leagueData.status}</p>

      {/* --- NEW: Commissioner Admin Panel --- */}
      {isCommissioner && (
        <div style={adminBoxStyle}>
          <h3>Commissioner Controls</h3>
          {leagueData.status === 'PRE_DRAFT' && (
            <button className="button" onClick={() => handleStatusChange('DRAFT_OPEN')}>
              Open Draft
            </button>
          )}
          {leagueData.status === 'DRAFT_OPEN' && (
            <button className="button" onClick={() => handleStatusChange('DRAFT_CLOSED')}>
              Close Draft
            </button>
          )}
          {leagueData.status === 'DRAFT_CLOSED' && (
            <button className="button" onClick={() => handleStatusChange('DRAFT_OPEN')}>
              Re-Open Draft
            </button>
          )}
        </div>
      )}

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
