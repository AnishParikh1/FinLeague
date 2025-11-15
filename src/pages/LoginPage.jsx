import React from 'react';

export default function LoginPage() {
  // Simple inline styles for centering
  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '70vh',
    textAlign: 'center',
  };

  const buttonStyle = {
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  // This is the placeholder function
  const handleLogin = () => {
    console.log('TODO: Call signInWithGoogle()');
    // After login, you'll redirect the user
  };

  return (
    <div style={pageStyle}>
      <h1>Welcome to FinLeague 📈</h1>
      <p>The fantasy league for stocks.</p>
      <button style={buttonStyle} onClick={handleLogin}>
        Sign in with Google
      </button>
    </div>
  );
}