// src/assets/app-dashboard-firestore.js

// 1. IMPORTAMOS TODO LO NECESARIO
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { auth } from '@/firebase/client.ts';

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


// URL base de tu API de Firebase Functions.
// ¡¡¡IMPORTANTE!!! Reemplaza esto con la URL real de tu función 'api'.
const API_BASE_URL = 'https://us-central1-expanded-system-469904-v9.cloudfunctions.net/api'; // <-- ¡REEMPLAZA ESTO!

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
        document.getElementById('kpi-proyectos').textContent = proyectos.length;
        // document.getElementById('kpi-testimonios').textContent = testimonios.length;
        document.getElementById('kpi-blog').textContent = blogPosts.length;
    };

    // --- FUNCIÓN AUXILIAR PARA LLAMAR A LA API ---
    const apiFetch = async (endpoint, options = {}) => {
        const user = auth.currentUser;
        if (!user && !options.isPublic) { // No requerir token para rutas públicas
            throw new Error("Usuario no autenticado.");
        }

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (user && !options.isPublic) {
            const token = await getIdToken(user);
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error en la API [${endpoint}]: ${response.status} ${errorText}`);
            throw new Error(`Error en la API: ${errorText}`);
        }

        // Si la respuesta no tiene contenido (ej. DELETE), devuelve null
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }

        return response.json();
    };

    // --- CARGA DE DATOS (MODIFICADO PARA USAR LA API) ---
    const cargarDatos = async () => {
        try {
            const [proyectos, blogPosts] = await Promise.all([
                apiFetch('/projects', { isPublic: true }), // GET /projects es público
                apiFetch('/blogs', { isPublic: true })      // GET /blogs es público
            ]);
            renderizarTabla('proyectos-tbody', proyectos, crearFilaProyecto, 'proyectos');
            renderizarTabla('blog-tbody', blogPosts, crearFilaBlog, 'blogPosts');
            actualizarKPIs(proyectos, [], blogPosts); // Ajustado para no tener testimonios
        } catch (error) {
            console.error("Error al cargar datos desde la API:", error);
            alert("No se pudieron cargar los datos. Revisa la consola.");
        }
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
        <tr data-id="${data.id}" data-collection="proyectos">
            <td><strong>${data.nombre}</strong></td>
            <td><span class="status-tag status--${(data.estado || 'n-a').toLowerCase().replace(' ', '-')}">${data.estado}</span></td>
            <td>
                <button class="edit-btn btn btn--secondary btn--sm">Editar</button> 
                <button class="delete-btn btn btn--danger btn--sm">Eliminar</button>
            </td>
        </tr>`;

    const crearFilaTestimonio = (data, collectionName) => ``; // (sin cambios)
    const crearFilaBlog = (data, collectionName) => `
        <tr data-id="${data.id}" data-collection="blogPosts">
            <td><strong>${data.titulo}</strong></td>
            <td>${data.slug}</td>
            <td>
                <button class="edit-btn btn btn--secondary btn--sm">Editar</button> 
                <button class="delete-btn btn btn--danger btn--sm">Eliminar</button>
            </td>
        </tr>
    `;

    // --- LÓGICA DEL MODAL ---
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    let currentCollection = '';
    let currentDocId = '';
    let easyMDEInstance = null; // Variable para guardar la instancia del editor

    const formTemplates = {
        proyectos: `
            <div class="form-group"><label>Nombre del Proyecto</label><input type="text" name="name" class="form-input" required></div>
            <div class="form-group"><label>Descripción</label><textarea name="descripcion" class="form-input"></textarea></div>
            <div class="form-group"><label>Tecnologías (separadas por coma)</label><input type="text" name="tecnologias" class="form-input"></div>
            <div class="form-group"><label>URL del Proyecto en vivo</label><input type="url" name="url_live" class="form-input"></div>
            <div class="form-group"><label>URL del Repositorio</label><input type="url" name="url_repo" class="form-input"></div>
            <div class="form-group"><label>URL de la Imagen</label><input type="url" name="imagen" class="form-input"></div>
            <div class="form-group"><label>Estado</label><select name="estado" class="form-input"><option>Propuesta</option><option>En Desarrollo</option><option>Completado</option><option>Pausado</option></select></div>
        `, // Nota: el nombre del campo es 'name' para coincidir con la API
        testimonios: ``, // (sin cambios)
        blogPosts: `
            <div class="form-group"><label>Título</label><input type="text" name="titulo" class="form-input" required></div>
            <div class="form-group"><label>Slug (URL amigable)</label><input type="text" name="slug" class="form-input" required></div>
            <div class="form-group"><label>Contenido (Markdown)</label><textarea name="contenido" rows="10" class="form-input"></textarea></div>
            <div class="form-group"><label>URL de la Imagen Principal</label><input type="url" name="imagen" class="form-input"></div>
            <div class="form-group"><label>Categoría</label><input type="text" name="categoria" class="form-input"></div>
            <div class="form-group"><label>Etiquetas (separadas por coma)</label><input type="text" name="tags" class="form-input"></div>
            <div class="form-group"><label>Publicado</label><input type="checkbox" name="publicado"></div>
        `
    };

    const showModal = (title, collection, data = {}) => {
        currentCollection = collection;
        currentDocId = data.id || '';
        modalTitle.textContent = title;

        // Destruir la instancia anterior de EasyMDE si existe
        if (easyMDEInstance) {
            easyMDEInstance.toTextArea();
            easyMDEInstance = null;
        }

        modalForm.innerHTML = formTemplates[collection];

        // Llenamos el formulario con los datos existentes si estamos editando
        if (data.id) {
            Object.keys(data).forEach(key => {
                if (modalForm.elements[key]) {
                    if (modalForm.elements[key].type === 'checkbox') {
                        modalForm.elements[key].checked = !!data[key];
                        return;
                    }
                    // Si es un array (como tecnologías), lo unimos con comas
                    modalForm.elements[key].value = Array.isArray(data[key]) ? data[key].join(', ') : data[key];
                }
            });
        }

        // Si es el modal de blog, inicializamos el editor de Markdown
        if (collection === 'blogPosts') {
            const contentTextArea = modalForm.querySelector('textarea[name="contenido"]');
            if (contentTextArea) {
                easyMDEInstance = new EasyMDE({ element: contentTextArea, spellChecker: false });
            }
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
            try {
                // La API no tiene un endpoint GET /:id, así que buscamos en los datos ya cargados
                const data = await apiFetch(`/${collection}/${id}`, { method: 'GET', isPublic: true }); // Asumiendo que tienes un GET por ID
                showModal(`Editar ${collection.slice(0, -1)}`, collection, data);
            } catch (error) {
                alert("No se pudo cargar el elemento para editar. Es posible que necesites un endpoint GET /<coleccion>/:id en tu API.");
            }
        }

        // Si se hace clic en Eliminar
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.')) {
                try {
                    await apiFetch(`/${collection}/${id}`, { method: 'DELETE' });
                    alert('Elemento eliminado correctamente.');
                    cargarDatos(); // Recargamos los datos para reflejar el cambio
                } catch (error) {
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

        // Si estamos guardando un post de blog, obtenemos el valor del editor
        if (currentCollection === 'blogPosts' && easyMDEInstance) {
            data.contenido = easyMDEInstance.value();
        }

        // Procesamos los datos antes de enviarlos
        Object.keys(data).forEach(key => {
            if (data[key] === 'on' && modalForm.elements[key].type === 'checkbox') {
                data[key] = true;
            }
            if (key === 'tecnologias' || key === 'tags') {
                data[key] = data[key].split(',').map(t => t.trim()).filter(Boolean);
            }
        });

        try {
            if (currentDocId) {
                // Actualizando un documento existente
                await apiFetch(`/${currentCollection}/${currentDocId}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                alert('¡Actualizado con éxito!');
            } else {
                // Creando un nuevo documento
                await apiFetch(`/${currentCollection}`, {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
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