// public/assets/js/dashboard-blog.js
import { collection, getDocs, orderBy, query, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from '/firebase/client.js';

document.addEventListener('DOMContentLoaded', () => {
    const collectionName = 'blogPosts';

    const tbody = document.getElementById('blog-body');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    let currentDocId = '';

    const formTemplate = `
        <input type="hidden" name="id">
        <input type="text" name="titulo" placeholder="Título" class="form-input mb-4 w-full" required>
        <input type="text" name="categoria" placeholder="Categoría" class="form-input mb-4 w-full" required>
        <textarea name="resumen" placeholder="Resumen" class="form-input mb-4 w-full"></textarea>
        <textarea name="contenido" placeholder="Contenido (Markdown)" class="form-input mb-4 w-full" rows="10"></textarea>
        <input type="text" name="slug" placeholder="URL (ej: mi-articulo)" class="form-input mb-4 w-full" required>
    `;

    const cargarBlogPosts = async () => {
        const snapshot = await getDocs(query(collection(db, collectionName), orderBy("fechaCreacion", "desc")));
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderizarTabla(posts);
    };

    const renderizarTabla = (data) => {
        tbody.innerHTML = '';
        data.forEach(item => {
            tbody.innerHTML += `
                <tr data-id="${item.id}">
                    <td><strong>${item.titulo}</strong></td>
                    <td>${item.categoria}</td>
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
                modalForm.elements[key].value = data[key];
            }
        });
        modal.classList.remove('hidden');
    };

    document.getElementById('add-blog-btn').addEventListener('click', () => showModal('Añadir Artículo'));
    modal.querySelector('#cancel-btn').addEventListener('click', () => modal.classList.add('hidden'));

    tbody.addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        if (!row) return;
        const id = row.dataset.id;

        if (e.target.classList.contains('edit-btn')) {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);
            showModal(`Editar Artículo`, { id, ...docSnap.data() });
        }
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('¿Estás seguro de eliminar este artículo?')) {
                await deleteDoc(doc(db, collectionName, id));
                cargarBlogPosts();
            }
        }
    });

    modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(modalForm);
        const data = Object.fromEntries(formData.entries());

        if (currentDocId) {
            await updateDoc(doc(db, collectionName, currentDocId), data);
        } else {
            data.fechaCreacion = serverTimestamp();
            await addDoc(collection(db, collectionName), data);
        }
        modal.classList.add('hidden');
        cargarBlogPosts();
    });

    cargarBlogPosts();
});