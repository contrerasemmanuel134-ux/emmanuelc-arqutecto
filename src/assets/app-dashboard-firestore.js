// 1. IMPORTAMOS TODO LO NECESARIO
import { db, auth } from '../../firebase/client.js'; // Importamos desde nuestro cliente
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
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {

    // 2. PROTECCIÓN DE RUTA: Verificamos la autenticación del usuario
    const mainContent = document.getElementById('main-content');
    const loadingIndicator = document.getElementById('loading-indicator');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuario está logueado
            mainContent.style.display = 'block';
            loadingIndicator.style.display = 'none';
            iniciarDashboard(); // Función que contiene toda la lógica original
        } else {
            // Usuario no está logueado, redirigir al login
            window.location.href = '/admin';
        }
    });

    // 3. MOVEMOS TODA LA LÓGICA ORIGINAL A UNA FUNCIÓN `iniciarDashboard`
    const iniciarDashboard = async () => {
        // --- MANEJO DE PESTAÑAS ---
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

        // --- FUNCIÓN PARA ACTUALIZAR KPIs ---
        const actualizarKPIs = (proyectos, testimonios, blogPosts) => {
            const kpiContainer = document.getElementById('kpi-container');
            if (!kpiContainer) return;

            const proyectosCompletados = proyectos.filter(p => p.estado === 'Completado').length;
            const testimoniosPendientes = testimonios.filter(t => t.estado === 'pendiente').length;
            const totalArticulos = blogPosts.length;
            const calificacionPromedio = testimonios.length > 0
                ? (testimonios.reduce((acc, t) => acc + (t.calificacion || 0), 0) / testimonios.length).toFixed(1)
                : 'N/A';

            kpiContainer.innerHTML = `
                <div class="kpi-card"><span class="kpi-card__number">${proyectosCompletados}</span><span class="kpi-card__label">Proyectos Completados</span></div>
                <div class="kpi-card"><span class="kpi-card__number">${calificacionPromedio} / 5</span><span class="kpi-card__label">Calificación Promedio</span></div>
                <div class="kpi-card"><span class="kpi-card__number">${testimoniosPendientes}</span><span class="kpi-card__label">Testimonios Pendientes</span></div>
                <div class="kpi-card"><span class="kpi-card__number">${totalArticulos}</span><span class="kpi-card__label">Artículos Publicados</span></div>
            `;
        };

        // --- CARGA DE DATOS ---
        const cargarDatos = async () => {
            try {
                const [proyectosSnapshot, testimoniosSnapshot, blogSnapshot] = await Promise.all([
                    getDocs(query(collection(db, "proyectos"), orderBy("fechaCreacion", "desc"))),
                    getDocs(query(collection(db, "testimonios"), orderBy("fechaCreacion", "desc"))),
                    getDocs(query(collection(db, "blogPosts"), orderBy("fechaCreacion", "desc")))
                ]);

                const proyectos = proyectosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const testimonios = testimoniosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const blogPosts = blogSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                renderizarTabla('proyectos-body', proyectos, crearFilaProyecto, 'proyectos');
                renderizarTabla('testimonios-body', testimonios, crearFilaTestimonio, 'testimonios');
                renderizarTabla('blog-body', blogPosts, crearFilaBlog, 'blogPosts');

                actualizarKPIs(proyectos, testimonios, blogPosts);
            } catch (error) {
                console.error("Error al cargar los datos:", error);
                // Aquí podrías mostrar un mensaje de error al usuario
            }
        };

        const renderizarTabla = (tbodyId, data, crearFilaFn, collectionName) => {
            const tbody = document.getElementById(tbodyId);
            if (!tbody) return; // Añadimos una guarda
            tbody.innerHTML = '';
            data.forEach(item => {
                tbody.innerHTML += crearFilaFn(item, collectionName);
            });
        };

        // --- FUNCIONES PARA CREAR FILAS ---
        const crearFilaProyecto = (data, collectionName) => `
            <tr data-id="${data.id}" data-collection="${collectionName}">
                <td><strong>${data.nombre}</strong></td>
                <td><span class="status-tag status--${(data.estado || 'n-a').toLowerCase().replace(' ', '-')}">${data.estado}</span></td>
                <td><button class="edit-btn text-blue-500">Editar</button> <button class="delete-btn text-red-500">Eliminar</button></td>
            </tr>`;

        const crearFilaTestimonio = (data, collectionName) => `
            <tr data-id="${data.id}" data-collection="${collectionName}">
                <td><strong>${data.nombreCliente}</strong><p class="text-sm text-gray-600">${data.textoTestimonio.substring(0, 50)}...</p></td>
                <td>${'★'.repeat(data.calificacion || 0)}${'☆'.repeat(5 - (data.calificacion || 0))}</td>
                <td><span class="status-tag status--${data.estado}">${data.estado}</span></td>
                <td><button class="edit-btn text-blue-500">Editar</button> <button class="delete-btn text-red-500">Eliminar</button></td>
            </tr>`;

        const crearFilaBlog = (data, collectionName) => `
            <tr data-id="${data.id}" data-collection="${collectionName}">
                <td><strong>${data.titulo}</strong></td>
                <td>${data.categoria}</td>
                <td><button class="edit-btn text-blue-500">Editar</button> <button class="delete-btn text-red-500">Eliminar</button></td>
            </tr>`;

        // --- LÓGICA DEL MODAL ---
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalForm = document.getElementById('modal-form');
        let currentCollection = '';
        let currentDocId = '';

        const formTemplates = {
            proyectos: `
                <input type="hidden" name="id">
                <input type="text" name="nombre" placeholder="Nombre" class="form-input mb-4 w-full" required>
                <textarea name="descripcion" placeholder="Descripción" class="form-input mb-4 w-full"></textarea>
                <input type="text" name="tecnologias" placeholder="Tecnologías (separadas por coma)" class="form-input mb-4 w-full">
                <input type="text" name="url_live" placeholder="URL Proyecto" class="form-input mb-4 w-full">
                <input type="text" name="url_repo" placeholder="URL Repositorio" class="form-input mb-4 w-full">
                <input type="text" name="imagen" placeholder="URL Imagen" class="form-input mb-4 w-full">
                <select name="estado" class="form-input mb-4 w-full"><option>Propuesta</option><option>En Desarrollo</option><option>Completado</option><option>Pausado</option></select>`,
            testimonios: `
                <input type="hidden" name="id">
                <input type="text" name="nombreCliente" placeholder="Nombre del Cliente" class="form-input mb-4 w-full" required>
                <textarea name="textoTestimonio" placeholder="Texto del Testimonio" class="form-input mb-4 w-full"></textarea>
                <input type="number" name="calificacion" placeholder="Calificación (1-5)" class="form-input mb-4 w-full" min="1" max="5">
                <select name="estado" class="form-input mb-4 w-full"><option>pendiente</option><option>aprobado</option></select>`,
            blogPosts: `
                <input type="hidden" name="id">
                <input type="text" name="titulo" placeholder="Título" class="form-input mb-4 w-full" required>
                <input type="text" name="categoria" placeholder="Categoría" class="form-input mb-4 w-full" required>
                <textarea name="resumen" placeholder="Resumen" class="form-input mb-4 w-full"></textarea>
                <input type="text" name="slug" placeholder="URL (ej: /blog/mi-articulo)" class="form-input mb-4 w-full" required>`
        };

        const showModal = (title, collection, data = {}) => {
            currentCollection = collection;
            currentDocId = data.id || '';
            modalTitle.textContent = title;
            modalForm.innerHTML = formTemplates[collection];
            Object.keys(data).forEach(key => {
                if (modalForm.elements[key]) {
                    modalForm.elements[key].value = Array.isArray(data[key]) ? data[key].join(', ') : data[key];
                }
            });
            modal.classList.remove('hidden');
        };

        document.getElementById('add-project-btn').addEventListener('click', () => showModal('Añadir Proyecto', 'proyectos'));
        document.getElementById('add-blog-btn').addEventListener('click', () => showModal('Añadir Artículo', 'blogPosts'));
        modal.querySelector('#cancel-btn').addEventListener('click', () => modal.classList.add('hidden'));

        document.querySelector('#main-content').addEventListener('click', async (e) => {
            const row = e.target.closest('tr');
            if (!row) return;
            const id = row.dataset.id;
            const collection = row.dataset.collection;

            if (e.target.classList.contains('edit-btn')) {
                const docRef = doc(db, collection, id);
                const docSnap = await getDoc(docRef);
                showModal(`Editar ${collection}`, collection, { id, ...docSnap.data() });
            }
            if (e.target.classList.contains('delete-btn')) {
                if (confirm('¿Estás seguro de eliminar este elemento?')) {
                    await deleteDoc(doc(db, collection, id));
                    cargarDatos();
                }
            }
        });

        modalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(modalForm);
            let data = Object.fromEntries(formData.entries());

            if (data.tecnologias) data.tecnologias = data.tecnologias.split(',').map(t => t.trim());
            if (data.calificacion) data.calificacion = Number(data.calificacion);

            try {
                 if (currentDocId) {
                    await updateDoc(doc(db, currentCollection, currentDocId), data);
                } else {
                    data.fechaCreacion = serverTimestamp();
                    await addDoc(collection(db, currentCollection), data);
                }
                modal.classList.add('hidden');
                cargarDatos();
            } catch (error) {
                console.error("Error al guardar datos:", error);
                alert("Hubo un error al guardar los datos."); // Feedback al usuario
            }
        });

        cargarDatos();
    };
});
