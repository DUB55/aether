// Firebase Connection Test
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  projectId: "aether-89251",
  appId: "1:335186915642:web:6542c45e0278a844aa2003",
  apiKey: "AIzaSyC8xWbyNYkBSSGadvydOBK6zctkidxkpSI",
  authDomain: "aether-89251.firebaseapp.com",
  firestoreDatabaseId: "aether-89251-default-rtdb",
  storageBucket: "aether-89251.firebasestorage.app",
  messagingSenderId: "335186915642",
  measurementId: "G-V5KFXSC1KJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Test functions
export async function testFirebaseConnection() {
  console.log('Testing Firebase connection...');
  
  try {
    // Test Firestore connection
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, { timestamp: new Date(), test: true });
    console.log('Firestore connection: SUCCESS');
    
    // Test Authentication
    const provider = new GoogleAuthProvider();
    console.log('Google Auth provider created: SUCCESS');
    
    return { success: true, message: 'Firebase connection successful' };
  } catch (error) {
    console.error('Firebase connection error:', error);
    return { success: false, error: error.message };
  }
}

export { app, auth, db };
