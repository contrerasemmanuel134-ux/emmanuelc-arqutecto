// 1. IMPORTAMOS NUESTRA INSTANCIA DE DB Y LAS FUNCIONES NECESARIAS
import { db } from '../../firebase/client.js';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

document.addEventListener('DOMContentLoaded', () => {
    const testimonialForm = document.getElementById('testimonial-form');
    const formMessage = document.getElementById('form-message');

    if (testimonialForm) {
        testimonialForm.addEventListener('submit', async (e) => {
            // 1. Prevenimos que la página se recargue
            e.preventDefault();

            // 2. Recolectamos los datos del formulario
            const nombreCliente = document.getElementById('nombreCliente').value;
            const textoTestimonio = document.getElementById('textoTestimonio').value;
            const ratingInput = document.querySelector('input[name="rating"]:checked');

            if (!ratingInput) {
                formMessage.textContent = 'Por favor, selecciona una calificación.';
                formMessage.style.color = 'red';
                return; // Detenemos la ejecución si no hay calificación
            }
            const calificacion = ratingInput.value;

            try {
                // 3. Usamos la instancia `db` importada para añadir el documento
                await addDoc(collection(db, "testimonios"), {
                    nombreCliente: nombreCliente,
                    textoTestimonio: textoTestimonio,
                    calificacion: parseInt(calificacion), // Convertimos a número
                    estado: "pendiente",                  // Estado inicial para tu aprobación
                    fechaCreacion: serverTimestamp()      // Firestore pone la fecha
                });

                // 4. Mostramos mensaje de éxito y reseteamos el formulario
                formMessage.textContent = '¡Gracias! Tu testimonio ha sido enviado para revisión.';
                formMessage.style.color = 'green';
                testimonialForm.reset();
                testimonialForm.querySelector('button[type="submit"]').disabled = true; // Deshabilitamos el botón

            } catch (error) {
                // Si algo sale mal, mostramos un mensaje de error
                console.error("Error al guardar el testimonio: ", error);
                formMessage.textContent = 'Hubo un error al enviar tu testimonio. Por favor, intenta de nuevo.';
                formMessage.style.color = 'red';
            }
        });
    }
});
