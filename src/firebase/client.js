// src/firebase/client.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 1. Importamos la configuración desde el nuevo archivo centralizado.
import { firebaseConfig } from './config.js';

// 2. Ya no se leen las variables de entorno aquí.

// Inicializamos la app de Firebase, pero solo si no se ha hecho antes
// Esto es importante para evitar errores en entornos de desarrollo con HMR (Hot Module Replacement)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exportamos los servicios que vamos a necesitar en el resto de la app
export const auth = getAuth(app);
export const db = getFirestore(app);
