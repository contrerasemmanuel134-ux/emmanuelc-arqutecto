//public/assets/js/admin-auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// Importa las funciones de Firebase que necesitas (¡hemos añadido nuevas!)
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const auth = getAuth(app);
const loginForm = document.getElementById('login-form');
const googleLoginBtn = document.getElementById('google-login-btn'); // Nuevo botón
const errorMessage = document.getElementById('error-message');

// --- Lógica para la página de Login (admin.astro) ---
if (loginForm) {
    // Lógica para el formulario de email/contraseña (la mantenemos)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => { window.location.href = '/dashboard'; })
            .catch(() => { errorMessage.textContent = 'Error: Credenciales incorrectas.'; });
    });

    // --- ¡NUEVA LÓGICA PARA EL BOTÓN DE GOOGLE! ---
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
                .then((result) => {
                    // Inicio de sesión con Google exitoso, redirige al dashboard
                    window.location.href = '/dashboard';
                })
                .catch((error) => {
                    errorMessage.textContent = 'Error al iniciar sesión con Google.';
                    console.error("Error con Google Popup:", error);
                });
        });
    }
}

// --- Lógica para Proteger Rutas y Cerrar Sesión (sin cambios) ---
if (window.location.pathname.includes('/dashboard')) {
    onAuthStateChanged(auth, (user) => {
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
        signOut(auth).then(() => { window.location.href = '/admin'; });
    });

    document.body.appendChild(logoutButton);
}