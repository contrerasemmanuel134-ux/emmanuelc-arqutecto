import { db } from '../firebase/client';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
    const addProjectBtn = document.getElementById('add-project-btn');
    const projectModal = document.getElementById('project-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const projectForm = document.getElementById('project-form');
    const projectsTableBody = document.getElementById('projects-table-body');

    // Campos del formulario
    const projectIdField = document.getElementById('project-id');
    const projectTitleField = document.getElementById('project-title');
    const projectDescriptionField = document.getElementById('project-description');
    const projectImageUrlField = document.getElementById('project-image-url');
    const projectUrlSitioWebField = document.getElementById('project-url-sitio-web');
    const projectUrlRepositorioField = document.getElementById('project-url-repositorio');
    const projectStatusField = document.getElementById('project-status');

    const openModal = () => projectModal.classList.remove('hidden');
    const closeModal = () => projectModal.classList.add('hidden');

    addProjectBtn.addEventListener('click', () => {
        projectForm.reset();
        projectIdField.value = '';
        openModal();
    });

    closeModalBtn.addEventListener('click', closeModal);

    const renderProjects = async () => {
        const projectsCollection = collection(db, 'proyectos');
        const projectsSnapshot = await getDocs(projectsCollection);
        projectsTableBody.innerHTML = '';
        projectsSnapshot.forEach(doc => {
            const project = doc.data();
            const row = document.createElement('tr');
            
            const statusBg = project.estado === 'completado' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800';
            const statusText = project.estado === 'completado' ? 'Completado' : 'En Proceso';

            row.innerHTML = `
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${project.title}</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span class="relative inline-block px-3 py-1 font-semibold leading-tight ${statusBg} rounded-full">
                        <span aria-hidden class="absolute inset-0 opacity-50 rounded-full"></span>
                        <span class="relative">${statusText}</span>
                    </span>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button class="edit-btn bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded" data-id="${doc.id}">Editar</button>
                    <button class="delete-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded" data-id="${doc.id}">Eliminar</button>
                </td>
            `;
            projectsTableBody.appendChild(row);
        });

        // Re-asignar eventos a los botones de editar y eliminar
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const projectDocRef = doc(db, 'proyectos', id);
                const projectSnapshot = await getDoc(projectDocRef);
                const project = projectSnapshot.data();

                projectIdField.value = id;
                projectTitleField.value = project.title;
                projectDescriptionField.value = project.description;
                projectImageUrlField.value = project.imageUrl;
                projectUrlSitioWebField.value = project.urlSitioWeb || '';
                projectUrlRepositorioField.value = project.urlRepositorio || '';
                projectStatusField.value = project.estado || 'en-proceso';

                openModal();
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
                    await deleteDoc(doc(db, 'proyectos', id));
                    renderProjects();
                }
            });
        });
    };

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = projectIdField.value;
        const projectData = {
            title: projectTitleField.value,
            description: projectDescriptionField.value,
            imageUrl: projectImageUrlField.value,
            urlSitioWeb: projectUrlSitioWebField.value,
            urlRepositorio: projectUrlRepositorioField.value,
            estado: projectStatusField.value,
        };

        if (id) {
            // Actualizar
            const projectDoc = doc(db, 'proyectos', id);
            await updateDoc(projectDoc, projectData);
        } else {
            // Crear
            projectData.fechaCreacion = serverTimestamp(); // Añadir timestamp
            await addDoc(collection(db, 'proyectos'), projectData);
        }

        closeModal();
        renderProjects();
    });

    renderProjects();
});