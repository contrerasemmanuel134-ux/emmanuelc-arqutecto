import { auth } from '../../firebase/client.js';
import { onAuthStateChanged, getIdToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const API_BASE_URL = 'https://us-central1-expanded-system-469904-v9.cloudfunctions.net/api';

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            initMediaPage();
        } else {
            window.location.href = '/admin';
        }
    });
});

const apiFetch = async (endpoint, options = {}) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado.");

    const token = await getIdToken(user);
    const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en la API [${endpoint}]: ${response.status} ${errorText}`);
    }
    if (response.status === 204) return null;
    return response.json();
};

const initMediaPage = () => {
    const gallery = document.getElementById('media-gallery');
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const progressBar = document.getElementById('upload-progress');

    const loadMedia = async () => {
        try {
            const mediaItems = await apiFetch('/media');
            gallery.innerHTML = ''; // Limpiar galería
            if (mediaItems.length === 0) {
                gallery.innerHTML = '<p>No hay imágenes en la galería. ¡Sube la primera!</p>';
                return;
            }
            mediaItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'media-item';
                itemElement.innerHTML = `
                    <img src="${item.url}" alt="${item.name}" loading="lazy">
                    <div class="media-info">
                        <p>${item.name}</p>
                        <button class="delete-media-btn" data-filename="${item.name}">Eliminar</button>
                    </div>
                `;
                gallery.appendChild(itemElement);
            });
        } catch (error) {
            console.error("Error al cargar medios:", error);
            gallery.innerHTML = '<p>Error al cargar las imágenes.</p>';
        }
    };

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        if (!file) return;

        progressBar.style.display = 'block';
        progressBar.value = 0;

        try {
            // En una implementación más avanzada, obtendríamos una URL firmada para subir directamente.
            // Por simplicidad aquí, podrías enviar el archivo a una función que lo suba.
            // Esta es una simplificación y no es la forma más eficiente.
            // La forma recomendada es:
            // 1. Cliente pide a la API una URL firmada para subir (nuevo endpoint POST /media/signed-url).
            // 2. API genera y devuelve la URL firmada de Storage.
            // 3. Cliente sube el archivo directamente a esa URL con PUT.
            alert("La subida de archivos requiere un endpoint de URL firmada que no está implementado en este ejemplo. Consulta la documentación de Firebase Storage para 'Signed URLs'.");

        } catch (error) {
            console.error("Error al subir archivo:", error);
            alert('Error al subir el archivo.');
        } finally {
            progressBar.style.display = 'none';
            uploadForm.reset();
        }
    });

    gallery.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-media-btn')) {
            const fileName = e.target.dataset.filename;
            if (confirm(`¿Seguro que quieres eliminar "${fileName}"?`)) {
                try {
                    await apiFetch(`/media/${fileName}`, { method: 'DELETE' });
                    alert('Archivo eliminado.');
                    loadMedia();
                } catch (error) {
                    alert('Error al eliminar el archivo.');
                }
            }
        }
    });

    loadMedia();
};
