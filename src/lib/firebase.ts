import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

/**
 * Firebase configuration object
 * All values come from environment variables starting with VITE_FIREBASE_
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Initialize Firebase app
 * Only initializes if config is present (not in .env.example placeholder)
 */
const app = initializeApp(firebaseConfig);

/**
 * Get Firebase Auth instance
 */
const auth = getAuth(app);

/**
 * Get Firebase Realtime Database instance
 */
const database = getDatabase(app);

/**
 * Sign in anonymously - creates a new user without any credentials
 */
export const signInAnon = () => signInAnonymously(auth);

/**
 * Auth state change listener
 */
export const onAuthChange = (callback: (user: import('firebase/auth').User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export { auth, database, firebaseConfig };