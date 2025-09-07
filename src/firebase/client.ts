import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth as _getAuth } from "firebase/auth"; // Rename to avoid conflict
import { getFirestore as _getFirestore } from "firebase/firestore"; // Rename
import { getStorage as _getStorage } from "firebase/storage"; // Rename

// TODO: Replace with your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1IN_OPtXDXo7h5xgdHoqexANhPW6UBSY",
  authDomain: "expanded-system-469904-v9.firebaseapp.com",
  projectId: "expanded-system-469904-v9",
  storageBucket: "expanded-system-469904-v9.firebasestorage.app",
  messagingSenderId: "546231550004",
  appId: "1:546231550004:web:867fb0e8078d329b454a61"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Synchronous exports for build-time use (e.g., getStaticPaths)
export const auth = _getAuth(app);
export const db = _getFirestore(app);
export const storage = _getStorage(app);

// Asynchronous getters for client-side dynamic imports
export const getFirebaseAuth = async () => {
  const { getAuth } = await import("firebase/auth");
  return getAuth(app);
};

export const getFirebaseFirestore = async () => {
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(app);
};

export const getFirebaseStorage = async () => {
  const { getStorage } = await import("firebase/storage");
  return getStorage(app);
};
