// assets/js/app-proyectos-publicos.js

import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getFirebaseFirestore } from '../firebase/client';

document.addEventListener('DOMContentLoaded', async () => {
    const db = await getFirebaseFirestore();
    const contenedor = document.getElementById('contenedor-proyectos-publicos');

    if (!contenedor) {
        console.error('El contenedor de proyectos públicos no se encontró.');
        return;
    }

    const proyectosRef = collection(db, "proyectos");
    // La consulta ahora filtra por 'completado' (minúsculas) y ordena por fecha.
    const q = query(proyectosRef, where("estado", "==", "completado"), orderBy("fechaCreacion", "desc"));

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            contenedor.innerHTML = '<p class="text-center">Aún no hay casos de éxito públicos. ¡Pronto habrá nuevos proyectos completados!</p>';
            return;
        }

        let tarjetasHTML = '';
        querySnapshot.forEach((doc) => {
            const proyecto = doc.data();
            tarjetasHTML += crearTarjetaProyecto(proyecto);
        });
        contenedor.innerHTML = tarjetasHTML;

    } catch (error) {
        console.error("Error al obtener los casos de éxito:", error);
        contenedor.innerHTML = '<p class="text-center">Hubo un error al cargar los proyectos. Intenta de nuevo más tarde.</p>';
    }
});

function crearTarjetaProyecto(proyecto) {
    // Usamos los nombres de campo correctos: title, imageUrl, description, urlSitioWeb
    return `
      <article class="portfolio-card">
          <img src="${proyecto.imageUrl}" alt="Visual del proyecto ${proyecto.title}" class="portfolio-card__image" loading="lazy">
          <div class="portfolio-card__content">
              <h2 class="portfolio-card__title">${proyecto.title}</h2>
              <p class="portfolio-card__description">${proyecto.description}</p>
              <div class="mt-auto">
                  <a href="${proyecto.urlSitioWeb}" class="button button--primary" target="_blank" rel="noopener noreferrer">Ver Proyecto en Vivo</a>
              </div>
          </div>
      </article>
    `;
}
