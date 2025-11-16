import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import './index.css';
// Page Imports
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LeaguePage from './pages/LeaguePage.jsx';
import DraftPage from './pages/DraftPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx'; 

// Auth Imports
import { useAuth } from './AuthContext.jsx';
import { logOut } from './firebaseService.js';

// ... (ProtectedRoute component is here) ...
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  return children;
}


function App() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      {currentUser && <NavBar />}
      
      <Routes>
        <Route 
          path="/login" 
          element={
            currentUser ? <Navigate to="/" /> : <LoginPage />
          } 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/league/:leagueId" 
          element={
            <ProtectedRoute>
              <LeaguePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/league/:leagueId/draft" 
          element={
            <ProtectedRoute>
              <DraftPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

      </Routes>
    </BrowserRouter>
  );
}

// --- UPDATED NAVBAR FUNCTION ---
function NavBar() {
  const { currentUser } = useAuth(); // Get the current user

  const navStyle = {
    padding: '10px 20px',
    background: 'var(--button-gradient)',
    borderBottom: '1px solid #ccc',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between', // Pushes left and right sides apart
    alignItems: 'center',
  };
  
  const linkStyle = {
    margin: '0 10px',
    textDecoration: 'none',
    fontWeight: 'bold',
    color: 'white',
  };

  const navRightStyle = { // New style for the right-hand group
    display: 'flex',
    alignItems: 'center',
  };
  
  const buttonStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    marginLeft: '15px', // Adds space between "Profile" and "Log Out"
  };

  const nameStyle = {
    color: 'white',
    marginRight: '15px',
    fontWeight: 'bold',
  };

  return (
    <nav style={navStyle}>
      {/* --- Left Side --- */}
      <div>
        <Link to="/" style={linkStyle}>Home</Link>
      </div>
      
      {/* --- Right Side --- */}
      <div style={navRightStyle}>
        {currentUser && <span style={nameStyle}>{currentUser.displayName}</span>}
        <Link to="/profile" style={linkStyle}>Profile</Link>
        <button style={buttonStyle} onClick={logOut}>
          Log Out
        </button>
      </div>
    </nav>
  );
}

export default App;
