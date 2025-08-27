//public/assets/admin-auth.js

// Usar la API global de Firebase Auth con la CDN
// Asegúrate de que los scripts de la CDN estén en el <head> de tu HTML
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>

const auth = firebase.auth();
const loginForm = document.getElementById('login-form');
const googleLoginBtn = document.getElementById('google-login-btn');
const errorMessage = document.getElementById('error-message');

// --- Lógica para la página de Login (admin.astro) ---
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then(() => { window.location.href = '/dashboard'; })
            .catch(() => { errorMessage.textContent = 'Error: Credenciales incorrectas.'; });
    });

    // Lógica para el botón de Google
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider)
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
if (window.location.pathname.includes('/dashboard')) {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = '/admin';
        }
    });

    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Cerrar Sesión';
    logoutButton.className = 'button button--secondary';
    logoutButton.style.position = 'fixed';
    logoutButton.style.bottom = '20px';
    logoutButton.style.right = '20px';

    logoutButton.addEventListener('click', () => {
        auth.signOut().then(() => { window.location.href = '/admin'; });
    });

    document.body.appendChild(logoutButton);
}