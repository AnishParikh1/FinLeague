import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { db, updateUserProfile } from '../firebaseService.js';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfilePage() {
  const { currentUser } = useAuth(); // Get the logged-in user
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(''); // For success/error messages

  // Load the user's current profile name from Firestore
  useEffect(() => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      getDoc(userRef).then(docSnap => {
        if (docSnap.exists()) {
          setDisplayName(docSnap.data().displayName || '');
        }
        setLoading(false);
      });
    }
  }, [currentUser]); // Re-run if the user changes

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear old messages
    if (!currentUser) return;

    // Call the update function from firebaseService.js
    const success = await updateUserProfile(currentUser.uid, {
      displayName: displayName
    });

    if (success) {
      setMessage('Your name has been updated successfully!');
    } else {
      setMessage('An error occurred. Please try again.');
    }
  };

  // --- Styles ---
  const pageStyle = { padding: '20px', maxWidth: '600px', margin: '0 auto' };
  const inputStyle = { 
    width: '100%', 
    padding: '10px', 
    fontSize: '16px', 
    marginBottom: '15px',
    boxSizing: 'border-box', // Important for 100% width
  };
  const buttonStyle = { 
    padding: '10px 15px', 
    fontSize: '16px', 
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px'
  };

  if (loading) {
    return <div style={pageStyle}>Loading profile...</div>;
  }

  return (
    <div style={pageStyle}>
      <h2>Manage Your Profile</h2>
      <form onSubmit={handleSubmit} className="form-box">
        <label htmlFor="displayName" style={{fontWeight: 'bold', marginBottom: '5px', display: 'block'}}>
          Your Display Name
        </label>
        <input
          id="displayName"
          type="text"
          style={inputStyle}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <button type="submit" style={buttonStyle}>
          Save Changes
        </button>
        {message && <p style={{marginTop: '15px', color: 'green'}}>{message}</p>}
      </form>
    </div>
  );
}