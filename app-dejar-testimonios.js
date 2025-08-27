
// assets/app-dejar-testimonios.js
// Usar la API global de Firebase Firestore con la CDN
// Asegúrate de que los scripts de la CDN estén en el <head> de tu HTML
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>

document.addEventListener('DOMContentLoaded', () => {
    const testimonialForm = document.getElementById('testimonial-form');
    const formMessage = document.getElementById('form-message');

    if (testimonialForm) {
        testimonialForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombreCliente = document.getElementById('nombreCliente').value;
            const textoTestimonio = document.getElementById('textoTestimonio').value;
            const calificacion = document.querySelector('input[name="rating"]:checked').value;

            const db = firebase.firestore();

            try {
                await db.collection("testimonios").add({
                    nombreCliente: nombreCliente,
                    textoTestimonio: textoTestimonio,
                    calificacion: parseInt(calificacion),
                    estado: "pendiente",
                    fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
                });

                formMessage.textContent = '¡Gracias! Tu testimonio ha sido enviado y será revisado.';
                formMessage.style.color = 'green';
                testimonialForm.reset();
                testimonialForm.style.pointerEvents = 'none';

            } catch (error) {
                console.error("Error al guardar el testimonio: ", error);
                formMessage.textContent = 'Hubo un error al enviar tu testimonio. Por favor, intenta de nuevo.';
                formMessage.style.color = 'red';
            }
        });
    }
});