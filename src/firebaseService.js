// src/firebaseService.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut 
} from "firebase/auth";
import { 
  getFirestore,
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  collection, 
  updateDoc, // Added this import
  arrayUnion, 
  serverTimestamp,
  getDocs,
  query,
  where
} from 'firebase/firestore';

// 1. YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 2. INITIALIZE AND EXPORT SERVICES
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 3. AUTH FUNCTIONS
const provider = new GoogleAuthProvider(); // <-- THIS LINE WAS MISSING
export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};
export const logOut = () => {
  return signOut(auth);
};


// 4. USER FUNCTIONS
// --- THIS FUNCTION WAS BROKEN ---
export const createUserDocument = async (user) => { // <-- THIS LINE WAS MISSING
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { displayName, email, photoURL } = user;
    try {
      await setDoc(userRef, {
        displayName,
        email,
        photoURL,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  }
};
// --- END OF FIX ---

/**
 * Updates a user's profile information in the 'users' collection.
 * @param {string} userId - The user's UID.
 * @param {object} data - The data to update (e.g., { displayName: "New Name" }).
 */
export const updateUserProfile = async (userId, data) => {
  if (!userId) return;

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data); // Updates the document
    console.log("User profile updated!");
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
};


// 5. LEAGUE & PORTFOLIO FUNCTIONS

export const createLeague = async (leagueName, user) => {
  if (!leagueName || !user) return;
  try {
    const leagueRef = await addDoc(collection(db, 'leagues'), {
      name: leagueName,
      commissionerId: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp(),
      status: 'Pre-Draft' // <-- ADD THIS: Set initial draft status
    });
    return leagueRef.id; // This ID is the "Invite Code"
  } catch (error) {
    console.error("Error creating league:", error);
  }
};

export const joinLeague = async (leagueId, user) => {
  if (!leagueId || !user) return;
  try {
    const leagueRef = doc(db, 'leagues', leagueId);
    const leagueSnap = await getDoc(leagueRef);
    if (!leagueSnap.exists()) throw new Error("League not found!");
    await updateDoc(leagueRef, {
      members: arrayUnion(user.uid)
    });
    return true;
  } catch (error) {
    console.error("Error joining league:", error);
    return false;
  }
};

// --- UPDATED THIS FUNCTION ---
export const addStockToPortfolio = async (leagueId, userId, stock) => {
  if (!leagueId || !userId || !stock) return false;

  const leagueRef = doc(db, 'leagues', leagueId);
  const portfolioRef = doc(db, 'leagues', leagueId, 'portfolios', userId);

  try {
    // 1. Check the league's status BEFORE adding a stock
    const leagueSnap = await getDoc(leagueRef);
    if (!leagueSnap.exists() || leagueSnap.data().status !== 'Open') {
      alert("The draft is not currently open!");
      return false; // Stop the function
    }

    // 2. If draft is open, proceed with adding the stock
    await setDoc(portfolioRef, {
      stocks: arrayUnion(stock)
    }, { merge: true });
    console.log("Stock added!");
    return true; // Return success
  } catch (error) {
    console.error("Error adding stock:", error);
    return false; // Return failure
  }
};

export const getLeaguePortfolios = async (leagueId) => {
  if (!leagueId) return [];
  try {
    const portfoliosRef = collection(db, 'leagues', leagueId, 'portfolios');
    const snapshot = await getDocs(portfoliosRef);
    const portfolios = [];
    snapshot.forEach(doc => {
      portfolios.push({
        userId: doc.id,
        ...doc.data()
      });
    });
    return portfolios;
  } catch (error) {
    console.error("Error getting league portfolios:", error);
    return [];
  }
};

// 6. NEW FUNCTION TO GET A USER'S LEAGUES
export const getUserLeagues = async (userId) => {
  if (!userId) return [];
  try {
    const leaguesRef = collection(db, 'leagues');
    // Create a query against the collection
    const q = query(leaguesRef, where("members", "array-contains", userId));

    const querySnapshot = await getDocs(q);
    const leagues = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      leagues.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return leagues;
  } catch (error) {
    console.error("Error getting user's leagues:", error);
    return [];
  }
};

// --- ADD THESE 2 NEW FUNCTIONS ---

/**
 * Gets all details for a single league (like its status).
 * @param {string} leagueId - The ID of the league.
 */
export const getLeagueDetails = async (leagueId) => {
  if (!leagueId) return null;
  try {
    const leagueRef = doc(db, 'leagues', leagueId);
    const leagueSnap = await getDoc(leagueRef);
    
    if (leagueSnap.exists()) {
      return leagueSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting league details:", error);
    return null;
  }
};

/**
 * Updates the status of a league (commissioner only).
 * @param {string} leagueId - The ID of the league.
 * @param {string} newStatus - The new status ('PRE_DRAFT', 'DRAFT_OPEN', 'DRAFT_CLOSED').
 */
export const updateLeagueStatus = async (leagueId, newStatus) => {
  if (!leagueId || !newStatus) return;
  try {
    const leagueRef = doc(db, 'leagues', leagueId);
    await updateDoc(leagueRef, {
      status: newStatus
    });
    console.log("League status updated!");
  } catch (error) {
    console.error("Error updating league status:", error);
  }
};