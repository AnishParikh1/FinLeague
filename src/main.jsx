

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// 1. Import the provider
import { AuthProvider } from './AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap your App component */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);