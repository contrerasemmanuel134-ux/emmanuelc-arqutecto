// public/assets/js/admin-auth.js

import { getFirebaseAuth } from '@/firebase/client.ts';

const loginForm = document.getElementById('login-form');
const googleLoginBtn = document.getElementById('google-login-btn');
const errorMessage = document.getElementById('error-message');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const auth = await getFirebaseAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then(() => { window.location.href = '/dashboard'; })
            .catch(() => { errorMessage.textContent = 'Error: Credenciales incorrectas.'; });
    });

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            const auth = await getFirebaseAuth();
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
    document.addEventListener('DOMContentLoaded', async () => {
        const auth = await getFirebaseAuth();
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.href = '/login';
            }
        });

        const logoutButton = document.createElement('button');
        logoutButton.textContent = 'Cerrar Sesión';
        logoutButton.className = 'btn btn--secondary';
        logoutButton.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000;';
        logoutButton.addEventListener('click', async () => {
            const auth = await getFirebaseAuth();
            signOut(auth).then(() => { window.location.href = '/login'; });
        });
        document.body.appendChild(logoutButton);
    });
}