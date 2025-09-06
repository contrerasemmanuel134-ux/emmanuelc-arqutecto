import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
