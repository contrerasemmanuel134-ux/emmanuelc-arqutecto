import { db } from '../../firebase/client';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Cargando propuestas del agente...");
    fetchProposals();
});

async function fetchProposals() {
    try {
        const proposalsRef = collection(db, 'propuestas_de_cambio');
        const q = query(proposalsRef, where("status", "==", "pendiente"), orderBy("timestamp", "desc"));
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.log("No se encontraron propuestas pendientes.");
            // Aquí actualizaremos la UI para mostrar el mensaje
            return;
        }

        const proposals = [];
        querySnapshot.forEach((doc) => {
            proposals.push({ id: doc.id, ...doc.data() });
        });

        console.log("Propuestas pendientes encontradas:", proposals);
        // Aquí llamaremos a una función para renderizar las propuestas en la UI
        // renderProposals(proposals);

    } catch (error) {
        console.error("Error al obtener las propuestas:", error);
        // Aquí podríamos mostrar un error en la UI
    }
}
