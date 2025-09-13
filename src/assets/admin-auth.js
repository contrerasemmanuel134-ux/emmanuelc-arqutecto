import { app } from '../firebase/client';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

document.addEventListener('DOMContentLoaded', () => {
    const auth = getAuth(app);

    // --- Elementos del DOM ---
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const googleLoginBtn = document.getElementById('google-login-btn');

    // --- Lógica de Autenticación ---

    // 1. Observador del estado de autenticación
    onAuthStateChanged(auth, (user) => {
        const currentPath = window.location.pathname;

        if (user) {
            // Si el usuario está logueado...
            console.log('Usuario autenticado:', user.email);
            // Y está en la página de login, redirigir al dashboard
            if (currentPath.startsWith('/login')) {
                window.location.href = '/dashboard';
            }
        } else {
            // Si el usuario NO está logueado...
            console.log('No hay usuario autenticado.');
            // Y está en una página del dashboard (que no sea login), redirigir a login
            if (currentPath.startsWith('/dashboard')) {
                window.location.href = '/login';
            }
        }
    });

    // 2. Login con Email y Contraseña
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!emailInput.value || !passwordInput.value) {
                errorMessage.textContent = 'Por favor, completa ambos campos.';
                return;
            }

            try {
                const userCredential = await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
                // El observador onAuthStateChanged se encargará de la redirección
                console.log('Inicio de sesión exitoso:', userCredential.user);
            } catch (error) {
                console.error('Error en el inicio de sesión:', error);
                errorMessage.textContent = 'Error en el inicio de sesión. Verifica tus credenciales.';
            }
        });
    }

    // 3. Login con Google
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            const provider = new GoogleAuthProvider();
            try {
                const result = await signInWithPopup(auth, provider);
                // El observador onAuthStateChanged se encargará de la redirección
                console.log('Inicio de sesión con Google exitoso:', result.user);
            } catch (error) {
                console.error('Error en el inicio de sesión con Google:', error);
                errorMessage.textContent = 'Error al iniciar sesión con Google.';
            }
        });
    }
});
