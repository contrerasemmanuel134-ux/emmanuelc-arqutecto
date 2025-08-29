// 1. IMPORTAMOS LA INSTANCIA `db` Y LAS FUNCIONES NECESARIAS
import { db } from '../../firebase/client.js';
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.getElementById('contenedor-proyectos-publicos');

  if (!contenedor) {
    console.error('El contenedor de proyectos públicos no se encontró.');
    return;
  }

  // 2. USAMOS LA INSTANCIA `db` IMPORTADA
  const proyectosRef = collection(db, "proyectos");
  // 3. Creamos una consulta para obtener solo proyectos "Completado"
  const q = query(proyectosRef, where("estado", "==", "Completado"), orderBy("fechaCreacion", "desc"));

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      contenedor.innerHTML = '<p class="text-center">Aún no hay casos de éxito públicos. ¡Pronto habrá nuevos proyectos completados!</p>';
      return;
    }

    let tarjetasHTML = '';
    querySnapshot.forEach((doc) => {
      const proyecto = { id: doc.id, ...doc.data() }; // Incluimos el ID
      tarjetasHTML += crearTarjetaProyecto(proyecto);
    });
    contenedor.innerHTML = tarjetasHTML;

  } catch (error) {
    console.error("Error al obtener los casos de éxito:", error);
    contenedor.innerHTML = '<p class="text-center">Hubo un error al cargar los proyectos. Intenta de nuevo más tarde.</p>';
  }
});

function crearTarjetaProyecto(proyecto) {
  const tecnologias = Array.isArray(proyecto.tecnologias) ? proyecto.tecnologias : [];
  
  return `
      <article class="portfolio-card">
          ${proyecto.imagen ? `<img src="${proyecto.imagen}" alt="Visual del proyecto ${proyecto.nombre}" class="portfolio-card__image" loading="lazy">` : ''}
          <div class="portfolio-card__content">
              <span class="portfolio-card__tag">${proyecto.tipo || 'Caso de Éxito'}</span>
              <h2 class="portfolio-card__title">${proyecto.nombre}</h2>
              <p class="portfolio-card__description">${proyecto.descripcion || ''}</p>
              <div class="portfolio-card__tecnologias mb-6">
                  ${tecnologias.map(tech => `<span class="tag">${tech}</span>`).join('')}
              </div>
              <div class="mt-auto">
                  ${proyecto.url_live ? `<a href="${proyecto.url_live}" class="button button--primary">Ver Detalles del Caso</a>` : ''}
              </div>
          </div>
      </article>
    `;
}
