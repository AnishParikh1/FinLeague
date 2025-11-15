// src/firebaseServices.js
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
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  getDocs 
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
const provider = new GoogleAuthProvider();
export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};
export const logOut = () => {
  return signOut(auth);
};

// 4. USER FUNCTIONS
export const createUserDocument = async (user) => {
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

// 5. LEAGUE & PORTFOLIO FUNCTIONS

export const createLeague = async (leagueName, user) => {
  if (!leagueName || !user) return;
  try {
    const leagueRef = await addDoc(collection(db, 'leagues'), {
      name: leagueName,
      commissionerId: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp(),
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

export const addStockToPortfolio = async (leagueId, userId, stock) => {
  if (!leagueId || !userId || !stock) return;
  const portfolioRef = doc(db, 'leagues', leagueId, 'portfolios', userId);
  try {
    await setDoc(portfolioRef, {
      stocks: arrayUnion(stock)
    }, { merge: true }); // merge:true creates doc if it doesn't exist
    console.log("Stock added!");
  } catch (error) {
    console.error("Error adding stock:", error);
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