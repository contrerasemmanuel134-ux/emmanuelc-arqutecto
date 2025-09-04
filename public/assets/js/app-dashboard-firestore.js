// src/assets/app-dashboard-firestore.js

// 1. IMPORTAMOS TODO LO NECESARIO
import { db, auth } from '../../firebase/client.js';
import {
    collection,
    getDocs,
    orderBy,
    query,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 2. LÓGICA DE AUTENTICACIÓN (SE MANTIENE IGUAL)
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const loadingIndicator = document.getElementById('loading-indicator');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            mainContent.style.display = 'block';
            loadingIndicator.style.display = 'none';
            iniciarDashboard();
        } else {
            window.location.href = '/admin';
        }
    });
});


// 3. LÓGICA PRINCIPAL DEL DASHBOARD
const iniciarDashboard = async () => {
    // --- MANEJO DE PESTAÑAS (SE MANTIENE IGUAL) ---
    const tabs = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.tab-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-panel`).classList.add('active');
        });
    });

    // --- FUNCIÓN PARA ACTUALIZAR KPIs (SE MANTIENE IGUAL) ---
    const actualizarKPIs = (proyectos, testimonios, blogPosts) => {
        // ... (código sin cambios)
    };

    // --- CARGA DE DATOS (SE MANTIENE IGUAL) ---
    const cargarDatos = async () => {
        // ... (código sin cambios)
    };

    const renderizarTabla = (tbodyId, data, crearFilaFn, collectionName) => {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;
        tbody.innerHTML = '';
        data.forEach(item => {
            tbody.innerHTML += crearFilaFn(item, collectionName);
        });
    };

    // --- FUNCIONES PARA CREAR FILAS (SE MANTIENEN IGUAL) ---
    const crearFilaProyecto = (data, collectionName) => `
        <tr data-id="${data.id}" data-collection="${collectionName}">
            <td><strong>${data.nombre}</strong></td>
            <td><span class="status-tag status--${(data.estado || 'n-a').toLowerCase().replace(' ', '-')}">${data.estado}</span></td>
            <td>
                <button class="edit-btn btn btn--secondary btn--sm">Editar</button> 
                <button class="delete-btn btn btn--danger btn--sm">Eliminar</button>
            </td>
        </tr>`;

    const crearFilaTestimonio = (data, collectionName) => `...`; // (sin cambios)
    const crearFilaBlog = (data, collectionName) => `...`; // (sin cambios)

    // --- LÓGICA DEL MODAL ---
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    let currentCollection = '';
    let currentDocId = '';

    const formTemplates = {
        proyectos: `
            <input type="hidden" name="id">
            <div class="form-group"><label>Nombre del Proyecto</label><input type="text" name="nombre" class="form-input" required></div>
            <div class="form-group"><label>Descripción</label><textarea name="descripcion" class="form-input"></textarea></div>
            <div class="form-group"><label>Tecnologías (separadas por coma)</label><input type="text" name="tecnologias" class="form-input"></div>
            <div class="form-group"><label>URL del Proyecto en vivo</label><input type="url" name="url_live" class="form-input"></div>
            <div class="form-group"><label>URL del Repositorio</label><input type="url" name="url_repo" class="form-input"></div>
            <div class="form-group"><label>URL de la Imagen</label><input type="url" name="imagen" class="form-input"></div>
            <div class="form-group"><label>Estado</label><select name="estado" class="form-input"><option>Propuesta</option><option>En Desarrollo</option><option>Completado</option><option>Pausado</option></select></div>
        `,
        testimonios: `...`, // (sin cambios)
        blogPosts: `...`     // (sin cambios)
    };

    const showModal = (title, collection, data = {}) => {
        currentCollection = collection;
        currentDocId = data.id || '';
        modalTitle.textContent = title;
        modalForm.innerHTML = formTemplates[collection];

        // Llenamos el formulario con los datos existentes si estamos editando
        if (data.id) {
            Object.keys(data).forEach(key => {
                if (modalForm.elements[key]) {
                    // Si es un array (como tecnologías), lo unimos con comas
                    modalForm.elements[key].value = Array.isArray(data[key]) ? data[key].join(', ') : data[key];
                }
            });
        }

        modal.classList.remove('hidden');
    };

    modal.querySelector('#cancel-btn').addEventListener('click', () => modal.classList.add('hidden'));

    // Event listener para el botón de Añadir Proyecto
    document.getElementById('add-project-btn').addEventListener('click', () => showModal('Añadir Nuevo Proyecto', 'proyectos'));

    // (Puedes mantener el de blog si quieres)
    document.getElementById('add-blog-btn').addEventListener('click', () => showModal('Añadir Artículo', 'blogPosts'));


    // --- MANEJO DE EVENTOS DE EDICIÓN Y ELIMINACIÓN ---
    document.querySelector('#main-content').addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        const id = row.dataset.id;
        const collection = row.dataset.collection;

        // Si se hace clic en Editar
        if (e.target.classList.contains('edit-btn')) {
            const docRef = doc(db, collection, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                showModal(`Editar ${collection.slice(0, -1)}`, collection, { id, ...docSnap.data() });
            }
        }

        // Si se hace clic en Eliminar
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.')) {
                try {
                    await deleteDoc(doc(db, collection, id));
                    alert('Elemento eliminado correctamente.');
                    cargarDatos(); // Recargamos los datos para reflejar el cambio
                } catch (error) {
                    console.error("Error al eliminar el documento:", error);
                    alert("Hubo un error al eliminar el elemento.");
                }
            }
        }
    });

    // --- MANEJO DEL ENVÍO DEL FORMULARIO DEL MODAL ---
    modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(modalForm);
        const data = Object.fromEntries(formData.entries());

        // Procesamos los datos antes de enviarlos
        if (data.tecnologias) {
            data.tecnologias = data.tecnologias.split(',').map(t => t.trim()).filter(Boolean); // Filtramos vacíos
        }
        if (data.calificacion) {
            data.calificacion = Number(data.calificacion);
        }

        try {
            if (currentDocId) {
                // Actualizando un documento existente
                const docRef = doc(db, currentCollection, currentDocId);
                await updateDoc(docRef, data);
                alert('¡Actualizado con éxito!');
            } else {
                // Creando un nuevo documento
                data.fechaCreacion = serverTimestamp(); // Añadimos la fecha de creación
                await addDoc(collection(db, currentCollection), data);
                alert('¡Creado con éxito!');
            }
            modal.classList.add('hidden');
            cargarDatos(); // Recargamos todo para ver los cambios
        } catch (error) {
            console.error("Error al guardar en Firestore:", error);
            alert("Hubo un error al guardar los datos.");
        }
    });

    // Carga inicial de datos
    cargarDatos();
};