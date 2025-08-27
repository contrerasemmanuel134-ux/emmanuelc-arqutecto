
// /assets/app-reseñas.js
// Usar la API global de Firebase Firestore con la CDN
// Asegúrate de que los scripts de la CDN estén en el <head> de tu HTML
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>

document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('contenedor-reseñas');
    if (!contenedor) return;

    const db = firebase.firestore();
    // Consulta para traer solo los testimonios APROBADOS y ordenarlos
    try {
        const querySnapshot = await db.collection("testimonios")
            .where("estado", "==", "aprobado")
            .orderBy("fechaCreacion", "desc")
            .get();

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