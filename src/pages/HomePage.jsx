import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// 3. Import from 'firebaseService.js' (singular)
import { auth, createLeague, joinLeague, getUserLeagues } from '../firebaseService.js';
import { useAuth } from '../AuthContext.jsx';

export default function HomePage() {
  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [myLeagues, setMyLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get the logged-in user

  // Fetch the user's leagues when the component loads
  useEffect(() => {
    if (currentUser) {
      getUserLeagues(currentUser.uid).then(leagues => {
        setMyLeagues(leagues);
        setLoading(false);
      });
    }
  }, [currentUser]); // Re-run if the user changes

  // --- Placeholder Functions ---
  const handleCreateLeague = async (e) => {
    e.preventDefault();
    if (currentUser && createName) {
      try {
        const newLeagueId = await createLeague(createName, currentUser);
        if (newLeagueId) {
          alert(`League created! Your invite code is: ${newLeagueId}`);
          navigate(`/league/${newLeagueId}`); // Redirect to the real league
        } else {
          alert('Failed to create league.');
        }
      } catch (error) {
        console.error("Error creating league:", error);
        alert('Failed to create league.');
      }
    }
  };

  const handleJoinLeague = async (e) => {
    e.preventDefault();
    if (currentUser && joinCode) {
      try {
        const success = await joinLeague(joinCode, currentUser);
        if (success) {
          alert('Joined league!');
          navigate(`/league/${joinCode}`); // Redirect to the joined league
        } else {
          alert('Failed to join league. Check the code?');
        }
      } catch (error) {
        console.error("Error joining league:", error);
        alert('Failed to join league.');
      }
    }
  };

  // --- Styles ---
  // We can still use simple inline styles for layout
  const pageStyle = { padding: '20px', maxWidth: '800px', margin: '0 auto' };
  const inputStyle = { padding: '8px', marginRight: '10px' };
  const buttonStyle = { padding: '8px 12px', cursor: 'pointer' };
  const leagueLinkStyle = {
    display: 'block',
    padding: '15px',
    margin: '10px 0',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '5px',
    textDecoration: 'none',
    color: '#007bff',
    fontWeight: 'bold',
  };


  return (
    <div style={pageStyle}>
      <h2>Your Leagues</h2>
      {loading ? (
        <p>Loading your leagues...</p>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          {myLeagues.length === 0 ? (
            <p>You haven't joined any leagues yet.</p>
          ) : (
            myLeagues.map(league => (
              <Link to={`/league/${league.id}`} key={league.id} style={leagueLinkStyle}>
                {league.name}
              </Link>
            ))
          )}
        </div>
      )}

      <div className="form-box">
        <h3>Create a New League</h3>
        <form onSubmit={handleCreateLeague}>
          <input
            style={inputStyle}
            type="text"
            placeholder="League Name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />
          <button style={buttonStyle} type="submit">Create</button>
        </form>
      </div>

      <div className="form-box">
        <h3>Join an Existing League</h3>
        <form onSubmit={handleJoinLeague}>
          <input
            style={inputStyle}
            type="text"
            placeholder="Invite Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button style={buttonStyle} type="submit">Join</button>
        </form>
      </div>
    </div>
  );
}