// src/firebase/client.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

// Inicializa la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Exporta las instancias de los servicios que necesitas
export const auth = getAuth(app);
export const db = getFirestore(app);
