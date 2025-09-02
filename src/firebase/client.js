// src/firebase/client.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD1IN_OPtXDXo7h5xgdHoqexANhPW6UBSY",
    authDomain: "expanded-system-469904-v9.firebaseapp.com",
    projectId: "expanded-system-469904-v9",
    storageBucket: "expanded-system-469904-v9.firebasestorage.app",
    messagingSenderId: "546231550004",
    appId: "1:546231550004:web:0b9ffd3edbb711ad454a61",
    measurementId: "G-D1ZYSQ6PFZ",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar los servicios de Firebase que necesites
export const auth = getAuth(app);
export const functions = getFunctions(app);
