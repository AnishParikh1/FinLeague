// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LeaguePage from './pages/LeaguePage.jsx';
import DraftPage from './pages/DraftPage.jsx';
// 1. Import the hook
import { useAuth } from './AuthContext.jsx';

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

// (Your NavBar component can stay the same)
function NavBar() {
  // ... (your nav bar code) ...
  return (
    <nav>
      {/* ... your links ... */}
    </nav>
  );
}

export default App;