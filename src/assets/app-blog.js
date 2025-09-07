// src/assets/app-dashboard-firestore.js

// 1. IMPORTAMOS TODO LO NECESARIO
// Importa la instancia 'db' directamente, sin la función asíncrona.
import { db } from '../firebase/client';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', async () => {
    // 2. AHORA 'db' ES ACCESIBLE DIRECTAMENTE
    const addPostBtn = document.getElementById('add-post-btn');
    const postModal = document.getElementById('post-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const postForm = document.getElementById('post-form');
    const postsTableBody = document.getElementById('posts-table-body');

    const postIdField = document.getElementById('post-id');
    const postTitleField = document.getElementById('post-title');
    const postContentField = document.getElementById('post-content');
    const postImageUrlField = document.getElementById('post-image-url');

    let easyMDEInstance = null;

    const openModal = () => {
        if (easyMDEInstance) {
            easyMDEInstance.toTextArea();
            easyMDEInstance = null;
        }
        postModal.classList.remove('hidden');
        easyMDEInstance = new EasyMDE({ element: postContentField, spellChecker: false });
    };

    const closeModal = () => {
        postModal.classList.add('hidden');
        if (easyMDEInstance) {
            easyMDEInstance.toTextArea();
            easyMDEInstance = null;
        }
    };

    addPostBtn.addEventListener('click', () => {
        postForm.reset();
        postIdField.value = '';
        if (easyMDEInstance) {
            easyMDEInstance.value('');
        }
        openModal();
    });

    closeModalBtn.addEventListener('click', closeModal);

    const renderPosts = async () => {
        const postsCollection = collection(db, 'blogPosts');
        const postsSnapshot = await getDocs(postsCollection);
        postsTableBody.innerHTML = '';
        postsSnapshot.forEach(doc => {
            const post = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${post.title}</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${post.content.substring(0, 50)}...</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button class="edit-btn bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded" data-id="${doc.id}">Editar</button>
                    <button class="delete-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded" data-id="${doc.id}">Eliminar</button>
                </td>
            `;
            postsTableBody.appendChild(row);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const postDoc = doc(db, 'blogPosts', id);
                const postSnapshot = await getDoc(postDoc);
                const post = postSnapshot.data();

                postIdField.value = id;
                postTitleField.value = post.title;
                postImageUrlField.value = post.imageUrl;

                openModal();
                if (easyMDEInstance) {
                    easyMDEInstance.value(post.content);
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm('¿Estás seguro de que quieres eliminar este post?')) {
                    await deleteDoc(doc(db, 'blogPosts', id));
                    renderPosts();
                }
            });
        });
    };

    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = postIdField.value;
        const postData = {
            title: postTitleField.value,
            content: easyMDEInstance ? easyMDEInstance.value() : postContentField.value,
            imageUrl: postImageUrlField.value,
        };

        if (id) {
            const postDoc = doc(db, 'blogPosts', id);
            await updateDoc(postDoc, postData);
        } else {
            await addDoc(collection(db, 'blogPosts'), postData);
        }

        closeModal();
        renderPosts();
    });

    renderPosts();
});