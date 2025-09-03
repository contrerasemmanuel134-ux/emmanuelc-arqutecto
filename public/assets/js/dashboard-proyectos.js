// public/assets/js/dashboard-proyectos.js
import { collection, getDocs, orderBy, query, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from '/firebase/client.js';

document.addEventListener('DOMContentLoaded', () => {
    const collectionName = 'proyectos';

    const tbody = document.getElementById('proyectos-body');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    let currentDocId = '';

    const formTemplate = `
        <input type="hidden" name="id">
        <input type="text" name="nombre" placeholder="Nombre" class="form-input mb-4 w-full" required>
        <textarea name="descripcion" placeholder="Descripción" class="form-input mb-4 w-full"></textarea>
        <input type="text" name="tecnologias" placeholder="Tecnologías (separadas por coma)" class="form-input mb-4 w-full">
        <input type="text" name="url_live" placeholder="URL Proyecto" class="form-input mb-4 w-full">
        <input type="text" name="url_repo" placeholder="URL Repositorio" class="form-input mb-4 w-full">
        <input type="text" name="imagen" placeholder="URL Imagen" class="form-input mb-4 w-full">
        <select name="estado" class="form-input mb-4 w-full"><option>Propuesta</option><option>En Desarrollo</option><option>Completado</option><option>Pausado</option></select>
    `;

    const cargarProyectos = async () => {
        const snapshot = await getDocs(query(collection(db, collectionName), orderBy("fechaCreacion", "desc")));
        const proyectos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderizarTabla(proyectos);
    };

    const renderizarTabla = (data) => {
        tbody.innerHTML = '';
        data.forEach(item => {
            tbody.innerHTML += `
                <tr data-id="${item.id}">
                    <td><strong>${item.nombre}</strong></td>
                    <td><span class="status-tag status--${(item.estado || 'n-a').toLowerCase().replace(' ', '-')}">${item.estado}</span></td>
                    <td><button class="edit-btn text-blue-500">Editar</button> <button class="delete-btn text-red-500">Eliminar</button></td>
                </tr>`;
        });
    };

    const showModal = (title, data = {}) => {
        currentDocId = data.id || '';
        modalTitle.textContent = title;
        modalForm.innerHTML = formTemplate;
        Object.keys(data).forEach(key => {
            if (modalForm.elements[key]) {
                modalForm.elements[key].value = Array.isArray(data[key]) ? data[key].join(', ') : data[key];
            }
        });
        modal.classList.remove('hidden');
    };

    document.getElementById('add-project-btn').addEventListener('click', () => showModal('Añadir Proyecto'));
    modal.querySelector('#cancel-btn').addEventListener('click', () => modal.classList.add('hidden'));

    tbody.addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        if (!row) return;
        const id = row.dataset.id;

        if (e.target.classList.contains('edit-btn')) {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);
            showModal(`Editar Proyecto`, { id, ...docSnap.data() });
        }
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('¿Estás seguro de eliminar este proyecto?')) {
                await deleteDoc(doc(db, collectionName, id));
                cargarProyectos();
            }
        }
    });

    modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(modalForm);
        let data = Object.fromEntries(formData.entries());
        if (data.tecnologias) data.tecnologias = data.tecnologias.split(',').map(t => t.trim());

        if (currentDocId) {
            await updateDoc(doc(db, collectionName, currentDocId), data);
        } else {
            data.fechaCreacion = serverTimestamp();
            await addDoc(collection(db, collectionName), data);
        }
        modal.classList.add('hidden');
        cargarProyectos();
    });

    cargarProyectos();
});