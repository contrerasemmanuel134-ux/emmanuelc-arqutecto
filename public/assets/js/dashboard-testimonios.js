// public/assets/js/dashboard-testimonios.js
import { collection, getDocs, orderBy, query, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from '/firebase/client.js';

document.addEventListener('DOMContentLoaded', () => {
    const collectionName = 'testimonios';

    const tbody = document.getElementById('testimonios-body');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    let currentDocId = '';

    const formTemplate = `
        <input type="hidden" name="id">
        <input type="text" name="nombreCliente" placeholder="Nombre del Cliente" class="form-input mb-4 w-full" required>
        <textarea name="textoTestimonio" placeholder="Texto del Testimonio" class="form-input mb-4 w-full"></textarea>
        <input type="number" name="calificacion" placeholder="Calificación (1-5)" class="form-input mb-4 w-full" min="1" max="5">
        <select name="estado" class="form-input mb-4 w-full"><option>pendiente</option><option>aprobado</option></select>
    `;

    const cargarTestimonios = async () => {
        const snapshot = await getDocs(query(collection(db, collectionName), orderBy("fechaCreacion", "desc")));
        const testimonios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderizarTabla(testimonios);
    };

    const renderizarTabla = (data) => {
        tbody.innerHTML = '';
        data.forEach(item => {
            tbody.innerHTML += `
                <tr data-id="${item.id}">
                    <td><strong>${item.nombreCliente}</strong><p class="text-sm text-gray-600">${item.textoTestimonio.substring(0, 50)}...</p></td>
                    <td>${'★'.repeat(item.calificacion)}${'☆'.repeat(5 - item.calificacion)}</td>
                    <td><span class="status-tag status--${item.estado}">${item.estado}</span></td>
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

    // No hay botón "Añadir Testimonio" en esta vista, se crean desde fuera.
    modal.querySelector('#cancel-btn').addEventListener('click', () => modal.classList.add('hidden'));

    tbody.addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        if (!row) return;
        const id = row.dataset.id;

        if (e.target.classList.contains('edit-btn')) {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);
            showModal(`Editar Testimonio`, { id, ...docSnap.data() });
        }
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('¿Estás seguro de eliminar este testimonio?')) {
                await deleteDoc(doc(db, collectionName, id));
                cargarTestimonios();
            }
        }
    });

    modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(modalForm);
        const data = Object.fromEntries(formData.entries());
        
        // La calificación debe ser un número
        if (data.calificacion) data.calificacion = Number(data.calificacion);

        if (currentDocId) {
            await updateDoc(doc(db, collectionName, currentDocId), data);
        } else {
            // No se crean testimonios desde aquí, pero se deja por si acaso
        }
        modal.classList.add('hidden');
        cargarTestimonios();
    });

    cargarTestimonios();
});