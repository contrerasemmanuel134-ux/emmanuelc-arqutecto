import { db } from '../../firebase/client';
import { collection, getDocs, query, where, orderBy, doc, deleteDoc, getDoc } from 'firebase/firestore';

// Main function to run on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log("Cargando propuestas del agente...");
    fetchProposals();
});

// Fetches proposals from Firestore
async function fetchProposals() {
    try {
        const proposalsRef = collection(db, 'propuestas_de_cambio');
        const q = query(proposalsRef, where("status", "==", "pendiente"), orderBy("timestamp", "desc"));
        
        const querySnapshot = await getDocs(q);
        
        const proposalsList = document.getElementById('proposals-list');
        if (querySnapshot.empty) {
            proposalsList.innerHTML = '<p class="text-center text-gray-500 py-8">No hay propuestas pendientes en este momento.</p>';
            return;
        }

        const proposals = [];
        querySnapshot.forEach((doc) => {
            proposals.push({ id: doc.id, ...doc.data() });
        });

        renderProposals(proposals);

    } catch (error) {
        console.error("Error al obtener las propuestas:", error);
        document.getElementById('proposals-list').innerHTML = '<p class="text-center text-red-500 py-8">Error al cargar las propuestas.</p>';
    }
}

// Renders the proposals into the DOM
function renderProposals(proposals) {
    const proposalsList = document.getElementById('proposals-list');
    proposalsList.innerHTML = ''; // Clear the list

    proposals.forEach(proposal => {
        const card = document.createElement('div');
        card.className = 'proposal-card';
        card.innerHTML = `
            <div class="proposal-card__header">
                <h3 class="proposal-card__title">Propuesta de Cambio</h3>
                <span class="proposal-card__timestamp">${new Date(proposal.timestamp.toDate()).toLocaleString('es-ES')}</span>
            </div>
            <div class="proposal-card__body">
                <p><strong>Razón del Agente:</strong> ${proposal.reason}</p>
                <div class="proposal-details">
                    <p><strong>Colección:</strong> <code>${proposal.target_collection}</code></p>
                    <p><strong>Documento:</strong> <code>${proposal.target_document_id}</code></p>
                    <p><strong>Campo:</strong> <code>${proposal.target_field}</code></p>
                </div>
                <div class="proposal-diff">
                    <h4 class="font-semibold">Valor Propuesto:</h4>
                    <div class="proposed-value">
                        ${proposal.proposed_value}
                    </div>
                </div>
            </div>
            <div class="proposal-card__actions">
                <button class="button button--danger" data-action="reject" data-id="${proposal.id}">Rechazar</button>
                <button class="button button--primary" data-action="approve" data-id="${proposal.id}">Aprobar</button>
            </div>
        `;
        proposalsList.appendChild(card);
    });

    // Add event listeners after rendering
    addEventListeners();
}

// Adds event listeners to the buttons
function addEventListeners() {
    document.querySelectorAll('[data-action="reject"]').forEach(button => {
        button.addEventListener('click', (e) => rejectProposal(e.target.dataset.id));
    });

    document.querySelectorAll('[data-action="approve"]').forEach(button => {
        button.addEventListener('click', (e) => approveProposal(e.target.dataset.id));
    });
}

// Handles proposal rejection
async function rejectProposal(proposalId) {
    if (!confirm('¿Estás seguro de que quieres rechazar esta propuesta?')) return;

    try {
        await deleteDoc(doc(db, 'propuestas_de_cambio', proposalId));
        console.log(`Propuesta ${proposalId} rechazada y eliminada.`);
        fetchProposals(); // Refresh the list
    } catch (error) {
        console.error("Error al rechazar la propuesta:", error);
        alert("Error al rechazar la propuesta.");
    }
}

import { getFunctions, httpsCallable } from 'firebase/functions';

// ... (el resto del archivo hasta la función approveProposal)

// Handles proposal approval
async function approveProposal(proposalId) {
    if (!confirm('¿Estás seguro de que quieres APROBAR y APLICAR esta propuesta?')) return;

    console.log(`Iniciando aprobación para la propuesta ${proposalId}...`);
    
    const functions = getFunctions();
    const approveProposalCallable = httpsCallable(functions, 'approveProposal');

    try {
        const result = await approveProposalCallable({ proposalId });
        console.log("Resultado de la función:", result.data);
        alert("¡Propuesta aprobada y aplicada con éxito!");
        fetchProposals(); // Refresh the list
    } catch (error) {
        console.error("Error al aprobar la propuesta:", error);
        alert(`Error al aprobar la propuesta: ${error.message}`);
    }
}