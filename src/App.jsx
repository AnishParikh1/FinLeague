import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import LeaguePage from './pages/LeaguePage';
import DraftPage from './pages/DraftPage';

// A simple Navbar to help you test navigation
function NavBar() {
  // Simple inline styles for the nav
  const navStyle = {
    padding: '10px',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ccc',
    marginBottom: '20px',
  };
  const linkStyle = {
    margin: '0 10px',
    textDecoration: 'none',
    fontWeight: 'bold',
  };

  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle}>Home (Leagues)</Link>
      <Link to="/league/test123" style={linkStyle}>My League</Link>
      <Link to="/league/test123/draft" style={linkStyle}>Draft Page</Link>
      <Link to="/login" style={linkStyle}>Login</Link>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavBar /> {/* Add the nav bar to every page */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/league/:leagueId" element={<LeaguePage />} />
        <Route path="/league/:leagueId/draft" element={<DraftPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;