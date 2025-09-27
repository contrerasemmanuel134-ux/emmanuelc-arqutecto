import { db } from '../firebase/client';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', async () => {
    const projectsTableBody = document.getElementById('projects-table-body');

    const renderProjects = async () => {
        const projectsCollection = collection(db, 'proyectos');
        const projectsSnapshot = await getDocs(projectsCollection);
        projectsTableBody.innerHTML = ''; // Clear table before rendering

        projectsSnapshot.forEach(doc => {
            const project = doc.data();
            const row = document.createElement('tr');
            row.className = 'project-row cursor-pointer hover:bg-gray-50';
            row.dataset.id = doc.id;
            // Store data needed for the preview in data attributes
            row.dataset.description = project.description || 'No hay descripción.';
            row.dataset.imageUrl = project.imageUrl || '';

            const statusClasses = {
                'completado': 'bg-green-200 text-green-800',
                'en-proceso': 'bg-yellow-200 text-yellow-800',
                'pendiente': 'bg-blue-200 text-blue-800',
                'pausado': 'bg-gray-200 text-gray-800',
            };
            const statusClass = statusClasses[project.estado] || 'bg-gray-200 text-gray-800';

            row.innerHTML = `
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${project.title}</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span class="relative inline-block px-3 py-1 font-semibold leading-tight ${statusClass} rounded-full">
                        <span class="relative">${project.estado || 'N/A'}</span>
                    </span>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <select class="status-select bg-gray-200 border border-gray-200 text-gray-700 py-1 px-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" data-id="${doc.id}">
                        <option value="pendiente" ${project.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="en-proceso" ${project.estado === 'en-proceso' ? 'selected' : ''}>En Proceso</option>
                        <option value="completado" ${project.estado === 'completado' ? 'selected' : ''}>Completado</option>
                        <option value="pausado" ${project.estado === 'pausado' ? 'selected' : ''}>Pausado</option>
                    </select>
                </td>
            `;
            projectsTableBody.appendChild(row);
        });

        // Add event listeners to the status dropdowns
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                e.stopPropagation(); // Prevent row click event from firing
                const id = e.target.dataset.id;
                const newStatus = e.target.value;
                const projectDocRef = doc(db, 'proyectos', id);
                
                try {
                    await updateDoc(projectDocRef, { estado: newStatus });
                    renderProjects(); 
                } catch (error) {
                    console.error("Error updating status: ", error);
                    alert("Hubo un error al cambiar el estado.");
                }
            });
        });
    };

    // Event listener for expanding/collapsing the preview
    projectsTableBody.addEventListener('click', (e) => {
        const row = e.target.closest('.project-row');
        if (!row || e.target.tagName === 'SELECT') return; // Ignore clicks on the select dropdown

        // Close any other open previews
        const allPreviews = document.querySelectorAll('.preview-row');
        allPreviews.forEach(preview => {
            if (preview.previousElementSibling !== row) {
                preview.remove();
            }
        });
        document.querySelectorAll('.project-row').forEach(r => {
            if (r !== row) r.classList.remove('preview-open');
        });

        const existingPreview = row.nextElementSibling;
        if (existingPreview && existingPreview.classList.contains('preview-row')) {
            existingPreview.remove();
            row.classList.remove('preview-open');
        } else {
            const description = row.dataset.description;
            const imageUrl = row.dataset.imageUrl;

            const previewRow = document.createElement('tr');
            previewRow.className = 'preview-row';
            previewRow.innerHTML = `
                <td colspan="3" class="p-5 border-b border-gray-200">
                    <div class="flex flex-col md:flex-row gap-5">
                        ${imageUrl ? `<img src="${imageUrl}" alt="Preview" class="w-full md:w-1/3 h-auto object-cover rounded-lg shadow-md">` : ''}
                        <p class="text-sm text-gray-700 flex-1">${description}</p>
                    </div>
                </td>
            `;
            row.parentNode.insertBefore(previewRow, row.nextSibling);
            row.classList.add('preview-open');
        }
    });

    // Initial render
    renderProjects();
});