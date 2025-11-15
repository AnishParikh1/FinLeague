import React from 'react';
// --- ADD THESE IMPORTS ---
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebaseService.js'; // Note the path
import { createUserDocument } from '../firebaseService.js';

export default function LoginPage() {


  // --- REPLACE YOUR FAKE handleLogin ---
const handleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      if (result && result.user) {
        await createUserDocument(result.user);
      }
      // NO MORE navigate('/') HERE!
    } catch (error) {
      console.error("Sign-in failed", error);
    }
  };
  
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