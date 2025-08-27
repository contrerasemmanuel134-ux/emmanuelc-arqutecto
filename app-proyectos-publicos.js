
// assets/app-proyectos-publicos.js
// Usar la API global de Firebase Firestore con la CDN
// Asegúrate de que los scripts de la CDN estén en el <head> de tu HTML
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>

document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.getElementById('contenedor-proyectos-publicos');

  if (!contenedor) {
    console.error('El contenedor de proyectos públicos no se encontró.');
    return;
  }

  const db = firebase.firestore();

  try {
    // Consulta: solo proyectos completados, ordenados por fechaCreacion descendente
    const querySnapshot = await db.collection("proyectos")
      .where("estado", "==", "Completado")
      .orderBy("fechaCreacion", "desc")
      .get();

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
  return `
      <article class="portfolio-card">
          <img src="${proyecto.imagen}" alt="Visual del proyecto ${proyecto.nombre}" class="portfolio-card__image" loading="lazy">
          <div class="portfolio-card__content">
              <span class="portfolio-card__tag">${proyecto.tipo || 'Caso de Éxito'}</span>
              <h2 class="portfolio-card__title">${proyecto.nombre}</h2>
              <p class="portfolio-card__description">${proyecto.descripcion}</p>
              <div class="portfolio-card__tecnologias mb-6">
                  ${(proyecto.tecnologias || []).map(tech => `<span class="tag">${tech}</span>`).join('')}
              </div>
              <div class="mt-auto">
                  <a href="${proyecto.url_live}" class="button button--primary">Ver Detalles del Caso</a>
              </div>
          </div>
      </article>
    `;
}