import React from 'react';
import { useParams, Link } from 'react-router-dom';

// FAKE data that Player 2's functions will eventually provide
const FAKE_LEADERBOARD = [
  { userId: '456', name: 'Player 2 (Backend)', gain: 5.1 },
  { userId: '789', name: 'Demo User 3', gain: -2.3 },
  { userId: '123', name: 'Player 1 (You)', gain: 8.4 },
];

const FAKE_LEAGUE_NAME = "Hackathon Heroes"; // Fake league name

export default function LeaguePage() {
  const { leagueId } = useParams(); // Gets the ID from the URL

  // Sort the fake data by gain, descending
  const sortedLeaderboard = [...FAKE_LEADERBOARD].sort((a, b) => b.gain - a.gain);

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
  const itemStyle = {
    padding: '15px',
    border: '1px solid #eee',
    fontSize: '18px',
    fontWeight: '500',
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h2>{FAKE_LEAGUE_NAME} Leaderboard</h2>
        <Link to={`/league/${leagueId}/draft`} style={buttonStyle}>
          Go to Draft
        </Link>
      </div>
      
      <p>This page is for league: <strong>{leagueId}</strong></p>

      <ol>
        {sortedLeaderboard.map((player, index) => (
          <li key={player.userId} style={itemStyle}>
            <span>{index + 1}. {player.name}</span>
            <span style={{ float: 'right', color: player.gain > 0 ? 'green' : 'red' }}>
              {player.gain.toFixed(1)}%
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}