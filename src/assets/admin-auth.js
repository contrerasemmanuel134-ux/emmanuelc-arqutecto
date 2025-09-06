// public/assets/js/admin-auth.js

import { signInWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from '@/firebase/client.ts';

const loginForm = document.getElementById('login-form');
const googleLoginBtn = document.getElementById('google-login-btn');
const errorMessage = document.getElementById('error-message');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => { window.location.href = '/dashboard'; })
            .catch(() => { errorMessage.textContent = 'Error: Credenciales incorrectas.'; });
    });

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
                .then(() => { window.location.href = '/dashboard'; })
                .catch((error) => {
                    errorMessage.textContent = 'Error al iniciar sesión con Google.';
                    console.error("Error con Google Popup:", error);
                });
        });
    }
}

// --- Lógica para Proteger Rutas y Cerrar Sesión ---
if (window.location.pathname.includes('/dashboard')) {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = '/login';
        }
    });

    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Cerrar Sesión';
    logoutButton.className = 'btn btn--secondary';
    logoutButton.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000;';
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => { window.location.href = '/login'; });
    });
    document.body.appendChild(logoutButton);
}