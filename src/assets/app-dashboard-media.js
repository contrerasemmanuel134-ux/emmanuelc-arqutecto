// Importa onAuthStateChanged y la instancia de auth directamente
import { onAuthStateChanged } from "firebase/auth";
import { auth, storage } from '../firebase/client';
import { ref, listAll, getDownloadURL, deleteObject, uploadBytesResumable } from "firebase/storage";


document.addEventListener('DOMContentLoaded', async () => {

    onAuthStateChanged(auth, (user) => {
        if (user) {
            initMediaPage();
        } else {
            // Si no está autenticado, no hacer nada o redirigir
            console.log("Usuario no autenticado.");
            const gallery = document.getElementById('media-gallery');
            gallery.innerHTML = '<p>Necesitas iniciar sesión para ver los archivos.</p>';
        }
    });
});

const initMediaPage = () => {
    const gallery = document.getElementById('media-gallery');
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const progressBar = document.getElementById('upload-progress');

    const loadMedia = async () => {
        if (!gallery) return;
        gallery.innerHTML = '<p>Cargando imágenes...</p>';

        try {
            const storageRef = ref(storage); // Apuntamos a la RAÍZ del bucket
            const result = await listAll(storageRef);

            gallery.innerHTML = ''; // Limpiar galería

            if (result.items.length === 0) {
                gallery.innerHTML = '<p>No hay imágenes. Sube la primera.</p>';
                return;
            }

            for (const itemRef of result.items) {
                const url = await getDownloadURL(itemRef);
                const itemElement = document.createElement('div');
                itemElement.className = 'media-item';
                itemElement.innerHTML = `
                    <img src="${url}" alt="${itemRef.name}" loading="lazy">
                    <div class="media-info">
                        <p title="${itemRef.name}">${itemRef.name}</p>
                        <input type="text" readonly value="${url}" class="media-url-input" />
                        <div class="media-actions">
                            <button class="copy-url-btn" data-url="${url}">Copiar URL</button>
                            <button class="delete-media-btn" data-path="${itemRef.fullPath}">Eliminar</button>
                        </div>
                    </div>
                `;
                gallery.appendChild(itemElement);
            }
        } catch (error) {
            console.error("Error al cargar los medios:", error);
            gallery.innerHTML = '<p>Error al cargar los medios.</p>';
        }
    };

    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        if (!file) return;

        progressBar.style.display = 'block';
        progressBar.value = 0;

        const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.value = progress;
            },
            (error) => {
                console.error("Error al subir archivo:", error);
                alert('Error al subir el archivo.');
                progressBar.style.display = 'none';
            },
            () => {
                alert('¡Archivo subido con éxito!');
                progressBar.style.display = 'none';
                uploadForm.reset();
                loadMedia(); // Recargar la galería
            }
        );
    });

    gallery.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-media-btn')) {
            const filePath = e.target.dataset.path;
            if (confirm(`¿Seguro que quieres eliminar este archivo?`)) {
                try {
                    const fileRef = ref(storage, filePath);
                    await deleteObject(fileRef);
                    alert('Archivo eliminado.');
                    loadMedia();
                } catch (error) {
                    console.error("Error al eliminar:", error);
                    alert('Error al eliminar el archivo.');
                }
            }
        }

        if (e.target.classList.contains('copy-url-btn')) {
            const url = e.target.dataset.url;
            navigator.clipboard.writeText(url).then(() => {
                alert('URL copiada al portapapeles.');
            }).catch(err => {
                alert('No se pudo copiar la URL.');
            });
        }
    });

    loadMedia();
};