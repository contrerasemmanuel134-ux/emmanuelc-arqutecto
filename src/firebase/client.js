// src/firebase/client.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Los valores de configuración se leen desde las variables de entorno
// que Astro expone de forma segura (las que pusimos en el .env)
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Inicializamos la app de Firebase, pero solo si no se ha hecho antes
// Esto es importante para evitar errores en entornos de desarrollo con HMR (Hot Module Replacement)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exportamos los servicios que vamos a necesitar en el resto de la app
export const auth = getAuth(app);
export const db = getFirestore(app);
