// public/firebase/client.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getFunctions, connectFunctionsEmulator } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

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
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Conectar a los emuladores si estamos en localhost
if (location.hostname === "localhost") {
    console.log("Localhost detectado, conectando a los emuladores de Firebase...");
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    connectFunctionsEmulator(functions, "localhost", 5001);
}
