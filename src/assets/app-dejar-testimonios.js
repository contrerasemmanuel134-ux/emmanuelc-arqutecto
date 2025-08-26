// assets/js/app-testimonios.js

// Importamos las funciones de Firestore que necesitamos para AÑADIR datos.
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// "Escuchamos" para asegurarnos de que toda la página se haya cargado primero.
document.addEventListener('DOMContentLoaded', () => {
    const testimonialForm = document.getElementById('testimonial-form');
    const formMessage = document.getElementById('form-message');

    if (testimonialForm) {
        // Cuando el usuario haga clic en el botón "Enviar", ejecutamos esta función.
        testimonialForm.addEventListener('submit', async (e) => {
            // 1. Prevenimos que la página se recargue (comportamiento por defecto del formulario).
            e.preventDefault();

            // 2. Recolectamos todos los datos del formulario.
            const nombreCliente = document.getElementById('nombreCliente').value;
            const textoTestimonio = document.getElementById('textoTestimonio').value;
            const calificacion = document.querySelector('input[name="rating"]:checked').value;

            // 3. Obtenemos una referencia a nuestra base de datos.
            const db = getFirestore();

            try {
                // 4. Creamos un nuevo "documento" (el testimonio) con todos los datos.
                await addDoc(collection(db, "testimonios"), {
                    nombreCliente: nombreCliente,
                    textoTestimonio: textoTestimonio,
                    calificacion: parseInt(calificacion), // Convertimos la calificación a número
                    estado: "pendiente",                  // El estado inicial para tu aprobación
                    fechaCreacion: serverTimestamp()      // Firestore pone la fecha automáticamente
                });

                // 5. Mostramos un mensaje de éxito y deshabilitamos el formulario.
                formMessage.textContent = '¡Gracias! Tu testimonio ha sido enviado y será revisado.';
                formMessage.style.color = 'green';
                testimonialForm.reset();
                testimonialForm.style.pointerEvents = 'none'; // Bloquea más envíos

            } catch (error) {
                // Si algo sale mal, mostramos un mensaje de error.
                console.error("Error al guardar el testimonio: ", error);
                formMessage.textContent = 'Hubo un error al enviar tu testimonio. Por favor, intenta de nuevo.';
                formMessage.style.color = 'red';
            }
        });
    }
});