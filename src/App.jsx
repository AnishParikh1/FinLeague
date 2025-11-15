// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LeaguePage from './pages/LeaguePage.jsx';
import DraftPage from './pages/DraftPage.jsx';
// 1. Import the hook
import { useAuth } from './AuthContext.jsx';

// ADD THIS IMPORT
import { logOut } from './firebaseService.js';

// This is a new component to protect your routes
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    // If no user, redirect to login
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  // 2. Get the current user from the context
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      {/* 3. Only show the Nav Bar if the user is logged in */}
      {currentUser && <NavBar />}
      
      <Routes>
        {/* 4. The Login page is special */}
        <Route 
          path="/login" 
          element={
            currentUser ? <Navigate to="/" /> : <LoginPage />
            // If user IS logged in, redirect to home
            // If user is NOT logged in, show LoginPage
          } 
        />
        
        {/* 5. Wrap your private pages in the ProtectedRoute */}
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
      </Routes>
    </BrowserRouter>
  );
}


function NavBar() {
  // Simple inline styles for the nav
  const navStyle = {
    padding: '10px 20px', // Added more padding
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ccc',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between', // This splits items
    alignItems: 'center',       // This centers them vertically
  };
  
  const linkStyle = {
    margin: '0 10px',
    textDecoration: 'none',
    fontWeight: 'bold',
    color: '#333',
  };
  
  const buttonStyle = {
    background: 'none',
    border: 'none',
    color: 'blue',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '1em', // Makes it match text size
    fontWeight: 'bold',
  };

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={linkStyle}>Home</Link>
        {/* You'll need to make this link dynamic later */}
        <Link to="/league/test123" style={linkStyle}>My League</Link>
      </div>
      
      {/* ADD THIS BUTTON */}
      <button style={buttonStyle} onClick={logOut}>
        Log Out
      </button>
    </nav>
  );
}

export default App;