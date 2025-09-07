import { db } from '../firebase/client';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', async () => {
    // `db` is now imported directly and is ready to use.
    const reviewModal = document.getElementById('review-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const reviewForm = document.getElementById('review-form');
    const reviewsTableBody = document.getElementById('reviews-table-body');

    // Form fields
    const reviewIdField = document.getElementById('review-id');
    const reviewAuthorField = document.getElementById('review-author');
    const reviewTextField = document.getElementById('review-text');
    const reviewStatusField = document.getElementById('review-status');

    // We hide the add button, as reviews come from an external form.
    const addReviewBtn = document.getElementById('add-review-btn');
    if (addReviewBtn) {
        addReviewBtn.style.display = 'none';
    }

    const openModal = () => reviewModal.classList.remove('hidden');
    const closeModal = () => reviewModal.classList.add('hidden');

    closeModalBtn.addEventListener('click', closeModal);

    const updateReviewStatus = async (id, newStatus) => {
        const reviewDoc = doc(db, 'testimonios', id);
        await updateDoc(reviewDoc, { estado: newStatus });
        renderReviews(); // Reload the table
    };

    const renderReviews = async () => {
        const reviewsCollection = collection(db, 'testimonios');
        const reviewsSnapshot = await getDocs(reviewsCollection);
        reviewsTableBody.innerHTML = '';
        reviewsSnapshot.forEach(doc => {
            const review = doc.data();
            const row = document.createElement('tr');

            const status = review.estado || 'pendiente';
            const statusBg = status === 'aprobado' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800';
            const statusText = status === 'aprobado' ? 'Aprobado' : 'Pendiente';

            row.innerHTML = `
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${review.nombreCliente}</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${review.textoTestimonio}</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span class="relative inline-block px-3 py-1 font-semibold leading-tight ${statusBg} rounded-full">
                        <span class="relative">${statusText}</span>
                    </span>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm space-x-2">
                    <button class="approve-btn bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded" data-id="${doc.id}" ${status === 'aprobado' ? 'disabled' : ''}>Aprobar</button>
                    <button class="pending-btn bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded" data-id="${doc.id}" ${status === 'pendiente' ? 'disabled' : ''}>Pendiente</button>
                    <button class="edit-btn bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded" data-id="${doc.id}">Editar</button>
                    <button class="delete-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded" data-id="${doc.id}">Eliminar</button>
                </td>
            `;
            reviewsTableBody.appendChild(row);
        });

        // --- Assign events to buttons --- 

        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', (e) => updateReviewStatus(e.target.dataset.id, 'aprobado'));
        });

        document.querySelectorAll('.pending-btn').forEach(button => {
            button.addEventListener('click', (e) => updateReviewStatus(e.target.dataset.id, 'pendiente'));
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const reviewDocRef = doc(db, 'testimonios', id);
                const reviewSnapshot = await getDoc(reviewDocRef);
                const review = reviewSnapshot.data();

                reviewIdField.value = id;
                reviewAuthorField.value = review.nombreCliente;
                reviewTextField.value = review.textoTestimonio;
                reviewStatusField.value = review.estado || 'pendiente';

                openModal();
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
                    await deleteDoc(doc(db, 'testimonios', id));
                    renderReviews();
                }
            });
        });
    };

    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = reviewIdField.value;
        if (!id) return;

        const reviewData = {
            nombreCliente: reviewAuthorField.value,
            textoTestimonio: reviewTextField.value,
            estado: reviewStatusField.value,
        };

        const reviewDoc = doc(db, 'testimonios', id);
        await updateDoc(reviewDoc, reviewData);

        closeModal();
        renderReviews();
    });

    renderReviews();
});