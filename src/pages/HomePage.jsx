import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  // --- Placeholder Functions ---
  const handleCreateLeague = (e) => {
    e.preventDefault();
    console.log(`TODO: Create league named: ${createName}`);
    // Simulate a redirect to the new league page
    const fakeNewLeagueId = 'new456';
    navigate(`/league/${fakeNewLeagueId}`);
  };

  const handleJoinLeague = (e) => {
    e.preventDefault();
    console.log(`TODO: Join league with code: ${joinCode}`);
    // Simulate a redirect to the joined league page
    navigate(`/league/${joinCode}`);
  };

  // --- Styles (inline for speed) ---
  const pageStyle = { 
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

const formStyle = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
  width: '300px',
  textAlign: 'center',
};
  const inputStyle = { padding: '8px', marginRight: '10px' };
  const buttonStyle = { padding: '8px 12px', cursor: 'pointer' };

  return (
    <div style={pageStyle}>
      <h2>Your Leagues</h2>
      {/* TODO: You would list the user's current leagues here */}

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
