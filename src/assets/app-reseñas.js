// /assets/js/app-reseñas.js

import { getFirestore, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('contenedor-reseñas');
    if (!contenedor) return;

    const db = getFirestore();
    const testimoniosRef = collection(db, "testimonios");
    
    // Consulta para traer solo los testimonios APROBADOS y ordenarlos
    const q = query(testimoniosRef, 
        where("estado", "==", "aprobado"), 
        orderBy("fechaCreacion", "desc")
    );

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            contenedor.innerHTML = '<p class="text-center">Aún no hay testimonios públicos. ¡Gracias por la confianza!</p>';
            return;
        }

        let tarjetasHTML = '';
        querySnapshot.forEach((doc) => {
            tarjetasHTML += crearTarjetaReseña(doc.data());
        });
        contenedor.innerHTML = tarjetasHTML;

    } catch (error) {
        console.error("Error al obtener los testimonios:", error);
        contenedor.innerHTML = '<p class="text-center">Hubo un error al cargar los testimonios.</p>';
    }
});

function crearTarjetaReseña(testimonio) {
    const estrellas = '★'.repeat(testimonio.calificacion) + '☆'.repeat(5 - testimonio.calificacion);
    return `
    <blockquote class="testimonial-card-full">
        <div class="star-rating-display">${estrellas}</div>
        <p>"${testimonio.textoTestimonio}"</p>
        <figcaption>– ${testimonio.nombreCliente}</figcaption>
    </blockquote>
    `;
}