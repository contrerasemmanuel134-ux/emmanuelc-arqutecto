import { db } from '../firebase/client';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
    const addReviewBtn = document.getElementById('add-review-btn');
    const reviewModal = document.getElementById('review-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const reviewForm = document.getElementById('review-form');
    const reviewsTableBody = document.getElementById('reviews-table-body');

    const reviewIdField = document.getElementById('review-id');
    const reviewAuthorField = document.getElementById('review-author');
    const reviewTextField = document.getElementById('review-text');

    const openModal = () => reviewModal.classList.remove('hidden');
    const closeModal = () => reviewModal.classList.add('hidden');

    addReviewBtn.addEventListener('click', () => {
        reviewForm.reset();
        reviewIdField.value = '';
        openModal();
    });

    closeModalBtn.addEventListener('click', closeModal);

    const renderReviews = async () => {
        const reviewsCollection = collection(db, 'testimonios');
        const reviewsSnapshot = await getDocs(reviewsCollection);
        reviewsTableBody.innerHTML = '';
        reviewsSnapshot.forEach(doc => {
            const review = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${review.nombreCliente}</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${review.textoTestimonio}</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button class="edit-btn bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded" data-id="${doc.id}">Editar</button>
                    <button class="delete-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded" data-id="${doc.id}">Eliminar</button>
                </td>
            `;
            reviewsTableBody.appendChild(row);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const reviewDoc = doc(db, 'testimonios', id);
                const reviewSnapshot = await getDoc(reviewDoc);
                const review = reviewSnapshot.data();

                reviewIdField.value = id;
                reviewAuthorField.value = review.nombreCliente;
                reviewTextField.value = review.textoTestimonio;

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
        const reviewData = {
            nombreCliente: reviewAuthorField.value,
            textoTestimonio: reviewTextField.value,
        };

        if (id) {
            // Update
            const reviewDoc = doc(db, 'testimonios', id);
            await updateDoc(reviewDoc, reviewData);
        } else {
            // Create
            await addDoc(collection(db, 'testimonios'), reviewData);
        }

        closeModal();
        renderReviews();
    });

    renderReviews();
});