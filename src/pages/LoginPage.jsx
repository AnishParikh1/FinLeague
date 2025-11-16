import React from 'react';
// --- ADD THESE IMPORTS ---
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebaseService.js'; // Note the path
import { createUserDocument } from '../firebaseService.js';

export default function LoginPage() {


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

  return (
    <div style={pageStyle}>
      <h1><span class="gradient-text">Welcome to FinLeague </span>📈</h1>
      <p>The fantasy league for stocks.</p>
      <button className="button" onClick={handleLogin}>
        Sign in with Google
      </button>
    </div>
  );
}
