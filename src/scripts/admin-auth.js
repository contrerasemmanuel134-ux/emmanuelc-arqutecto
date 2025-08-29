// src/scripts/admin-auth.js (Versión corregida en src)

// 1. IMPORTAMOS AUTH CON LA RUTA RELATIVA CORRECTA
import { auth } from '../firebase/client.js'; 
import { 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "firebase/auth";

// --- Referencias al DOM ---
const loginForm = document.getElementById('login-form');
const googleLoginBtn = document.getElementById('google-login-btn');
const errorMessage = document.getElementById('error-message');

// --- Lógica para la página de Login (admin.astro) ---
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => { window.location.href = '/dashboard'; })
            .catch((error) => { 
                console.error(error.code);
                errorMessage.textContent = 'Error: Credenciales incorrectas o usuario no encontrado.'; 
            });
    });

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
                .then(() => {
                    window.location.href = '/dashboard';
                })
                .catch((error) => {
                    errorMessage.textContent = 'Error al iniciar sesión con Google.';
                    console.error("Error con Google Popup:", error);
                });
        });
    }
}

// --- Lógica para Proteger Rutas y Cerrar Sesión ---
if (window.location.pathname.startsWith('/dashboard')) {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = '/admin';
        }
    });

    const logoutButton = document.getElementById('logout-btn'); 
    
    if(logoutButton){
        logoutButton.addEventListener('click', () => {
            signOut(auth).then(() => { 
                window.location.href = '/admin'; 
            });
        });
    }
}
