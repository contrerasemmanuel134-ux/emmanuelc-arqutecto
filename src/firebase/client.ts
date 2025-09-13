import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth as _getAuth } from "firebase/auth";
import { getFirestore as _getFirestore } from "firebase/firestore"; // Rename
import { getStorage as _getStorage } from "firebase/storage"; // Rename

// Get Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Synchronous exports for build-time use (e.g., getStaticPaths)
export const auth = _getAuth(app);
export const db = _getFirestore(app);
export const storage = _getStorage(app);

