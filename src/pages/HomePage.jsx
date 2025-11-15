import React, { useState, useEffect } from 'react'; // 1. Import useEffect
import { useNavigate, Link } from 'react-router-dom'; // 2. Import Link
// 3. Import from 'firebaseService.js' (singular)
import { auth, createLeague, joinLeague, getUserLeagues } from '../firebaseService.js';
import { useAuth } from '../AuthContext.jsx'; // 4. Import useAuth

export default function HomePage() {
  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [myLeagues, setMyLeagues] = useState([]); // 5. State for leagues
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // 6. Get the current user

  // 7. This effect runs on page load
  useEffect(() => {
    if (currentUser) {
      const fetchLeagues = async () => {
        setLoading(true);
        const leagues = await getUserLeagues(currentUser.uid);
        setMyLeagues(leagues);
        setLoading(false);
      };
      fetchLeagues();
    }
  }, [currentUser]); // Re-run if the user changes

  // 2. Update the 'Create League' function
  const handleCreateLeague = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user && createName) {
      try {
        const newLeagueId = await createLeague(createName, user);
        if (newLeagueId) {
          alert(`League created! Your invite code is: ${newLeagueId}`);
          navigate(`/league/${newLeagueId}`); // Redirect to the new league
        }
      } catch (error) {
        console.error("Error creating league:", error);
        alert("Failed to create league.");
      }
    }
  };

  // 3. Update the 'Join League' function
  const handleJoinLeague = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user && joinCode) {
      try {
        const success = await joinLeague(joinCode, user);
        if (success) {
          alert('Successfully joined league!');
          navigate(`/league/${joinCode}`); // Redirect to the joined league
        } else {
          alert('Failed to join league. Check the invite code.');
        }
      } catch (error) {
        console.error("Error joining league:", error);
        alert('Failed to join league.');
      }
    }
  };

  // --- Styles (these can stay the same) ---
  const pageStyle = { padding: '20px' };
  const formStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  };
  const inputStyle = { padding: '8px', marginRight: '10px', minWidth: '200px' };
  const buttonStyle = { padding: '8px 12px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' };
  const leagueLinkStyle = {
    display: 'block',
    padding: '12px 15px',
    border: '1px solid #eee',
    borderRadius: '5px',
    textDecoration: 'none',
    color: '#333',
    fontWeight: 'bold',
    marginBottom: '10px',
  };

  return (
    <div style={pageStyle}>
      <h2>Your Leagues</h2>
      {/* 8. Render the list of leagues */}
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

      <div style={formStyle}>
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

      <div style={formStyle}>
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