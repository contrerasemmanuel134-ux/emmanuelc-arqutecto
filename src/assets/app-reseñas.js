// 1. IMPORTAMOS LA INSTANCIA `db` Y LAS FUNCIONES NECESARIAS
import { db } from '../../firebase/client.js';
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('contenedor-reseñas');
    if (!contenedor) return;

    // 2. USAMOS LA INSTANCIA `db` IMPORTADA
    const testimoniosRef = collection(db, "testimonios");
    
    // 3. Consulta para traer solo los testimonios APROBADOS y ordenarlos
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
    if (!testimonio || typeof testimonio.calificacion !== 'number') {
        return ''; // No renderizar nada si el testimonio es inválido
    }
    const estrellas = '★'.repeat(testimonio.calificacion) + '☆'.repeat(5 - testimonio.calificacion);
    return `
    <blockquote class="testimonial-card-full">
        <div class="star-rating-display">${estrellas}</div>
        <p>"${testimonio.textoTestimonio}"</p>
        <figcaption>– ${testimonio.nombreCliente}</figcaption>
    </blockquote>
    `;
}
