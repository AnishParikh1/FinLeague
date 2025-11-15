// src/AuthContext.jsx

import React, { useContext, useState, useEffect, createContext } from 'react';
import { auth } from './firebaseService.js'; // Import your auth from firebase.js
import { onAuthStateChanged } from 'firebase/auth';

// 1. Create the Context
const AuthContext = createContext();

// 2. Create a custom hook to make it easy to use
export function useAuth() {
  return useContext(AuthContext);
}

// 3. Create the Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // This is the core Firebase listener
    // It runs when the component mounts, and when auth state changes
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    // This cleans up the listener when the component unmounts
    return unsubscribe;
  }, []);

  // The 'value' is what all children components will get
  const value = {
    currentUser,
  };

  // We return the provider, but only render children when not loading
  // This prevents the app from "flickering" to the login page
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}