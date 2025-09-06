import { db } from '../firebase/client';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
    const addProjectBtn = document.getElementById('add-project-btn');
    const projectModal = document.getElementById('project-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveProjectBtn = document.getElementById('save-project-btn');
    const projectForm = document.getElementById('project-form');
    const projectsTableBody = document.getElementById('projects-table-body');

    const projectIdField = document.getElementById('project-id');
    const projectTitleField = document.getElementById('project-title');
    const projectDescriptionField = document.getElementById('project-description');
    const projectImageUrlField = document.getElementById('project-image-url');

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
            row.innerHTML = `
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${project.title}</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${project.description}</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button class="edit-btn bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded" data-id="${doc.id}">Editar</button>
                    <button class="delete-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded" data-id="${doc.id}">Eliminar</button>
                </td>
            `;
            projectsTableBody.appendChild(row);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const projectDoc = doc(db, 'proyectos', id);
                const projectSnapshot = await getDoc(projectDoc);
                const project = projectSnapshot.data();

                projectIdField.value = id;
                projectTitleField.value = project.title;
                projectDescriptionField.value = project.description;
                projectImageUrlField.value = project.imageUrl;

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
        };

        if (id) {
            // Update
            const projectDoc = doc(db, 'proyectos', id);
            await updateDoc(projectDoc, projectData);
        } else {
            // Create
            await addDoc(collection(db, 'proyectos'), projectData);
        }

        closeModal();
        renderProjects();
    });

    renderProjects();
});