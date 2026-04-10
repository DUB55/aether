import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, onSnapshot, getDocFromServer, Timestamp } from 'firebase/firestore';
// Firebase configuration from environment variables or fallback to config file
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyC8xWbyNYkBSSGadvydOBK6zctkidxkpSI',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'aether-89251.firebaseapp.com',
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || 'https://aether-89251-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'aether-89251',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:335186915642:web:6542c45e0278a844aa2003',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-V5KFXSC1KJ',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '335186915642',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'aether-89251.firebasestorage.app',
  firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID || 'aether-89251-default-rtdb'
};

// Initialize Firebase SDK with proper configuration
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. ");
      } else if (error.message.includes('ERR_BLOCKED_BY_CLIENT') || error.message.includes('blocked')) {
        console.warn("Firebase connection blocked by browser extension. Some features may be limited.");
      }
    }
  }
}

export type { FirebaseUser };
