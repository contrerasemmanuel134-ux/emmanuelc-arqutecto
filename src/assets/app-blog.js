import { db } from '../firebase/client';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', async () => {
    const postsTableBody = document.getElementById('posts-table-body');

    const renderPosts = async () => {
        const postsCollection = collection(db, 'blogPosts');
        const postsSnapshot = await getDocs(postsCollection);
        postsTableBody.innerHTML = ''; // Clear table

        postsSnapshot.forEach(doc => {
            const post = doc.data();
            const row = document.createElement('tr');
            row.className = 'blog-row cursor-pointer hover:bg-gray-50';
            row.dataset.id = doc.id;
            // Store data for preview
            row.dataset.content = post.content || 'No hay contenido.';
            row.dataset.imageUrl = post.imageUrl || '';

            const isPublished = post.publicado === true;
            const statusText = isPublished ? 'Publicado' : 'Borrador';
            const statusClass = isPublished ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800';

            const buttonText = isPublished ? 'Despublicar' : 'Publicar';
            const buttonClass = isPublished ? 'bg-gray-500 hover:bg-gray-700' : 'bg-green-500 hover:bg-green-700';

            // Shorten content for table view
            const contentSnippet = post.content ? post.content.substring(0, 100) + '...' : 'N/A';

            row.innerHTML = `
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${post.title}</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${contentSnippet}</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span class="relative inline-block px-3 py-1 font-semibold leading-tight ${statusClass} rounded-full">
                        <span class="relative">${statusText}</span>
                    </span>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button class="toggle-publish-btn ${buttonClass} text-white font-bold py-1 px-2 rounded" data-id="${doc.id}" data-published="${isPublished}">
                        ${buttonText}
                    </button>
                </td>
            `;
            postsTableBody.appendChild(row);
        });

        // Add event listeners for the toggle buttons
        document.querySelectorAll('.toggle-publish-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation(); // Prevent row click
                const id = e.target.dataset.id;
                const currentStatus = e.target.dataset.published === 'true';
                const postDocRef = doc(db, 'blogPosts', id);

                try {
                    await updateDoc(postDocRef, { publicado: !currentStatus });
                    renderPosts();
                } catch (error) {
                    console.error("Error updating status: ", error);
                    alert("Hubo un error al cambiar el estado de la publicación.");
                }
            });
        });
    };

    // Event listener for expanding/collapsing the preview
    postsTableBody.addEventListener('click', (e) => {
        const row = e.target.closest('.blog-row');
        if (!row || e.target.tagName === 'BUTTON') return; // Ignore clicks on the button

        // Close other previews
        const allPreviews = document.querySelectorAll('.preview-row');
        allPreviews.forEach(preview => {
            if (preview.previousElementSibling !== row) {
                preview.remove();
            }
        });
        document.querySelectorAll('.blog-row').forEach(r => {
            if (r !== row) r.classList.remove('preview-open');
        });

        const existingPreview = row.nextElementSibling;
        if (existingPreview && existingPreview.classList.contains('preview-row')) {
            existingPreview.remove();
            row.classList.remove('preview-open');
        } else {
            const content = row.dataset.content;
            const imageUrl = row.dataset.imageUrl;

            const previewRow = document.createElement('tr');
            previewRow.className = 'preview-row';
            // Using innerHTML for content, assuming it's trusted HTML/Markdown from the agent
            previewRow.innerHTML = `
                <td colspan="4" class="p-5 border-b border-gray-200">
                    <div class="prose max-w-none">
                        ${imageUrl ? `<img src="${imageUrl}" alt="Preview" class="w-full md:w-1/2 float-left mr-5 mb-5 rounded-lg shadow-md">` : ''}
                        ${content}
                    </div>
                </td>
            `;
            row.parentNode.insertBefore(previewRow, row.nextSibling);
            row.classList.add('preview-open');
        }
    });

    // Initial render
    renderPosts();
});