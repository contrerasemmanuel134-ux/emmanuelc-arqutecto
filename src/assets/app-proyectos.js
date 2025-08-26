// ... (resto del código anterior)

import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.getElementById('contenedor-proyectos');

  if (!contenedor) {
    console.error('El contenedor de proyectos no se encontró.');
    return;
  }

  const db = getFirestore();
  const proyectosRef = collection(db, "proyectos");
  const q = query(proyectosRef, orderBy("fechaCreacion", "desc")); // Ordena por los más recientes

  try {
    const querySnapshot = await getDocs(q);
    const proyectos = [];
    querySnapshot.forEach((doc) => {
      proyectos.push(doc.data());
    });

    generarSchemaPrincipal(proyectos); // SEO Técnico 

    if (proyectos.length === 0) {
      contenedor.innerHTML = '<p class="text-center">Actualmente no hay proyectos para mostrar. ¡Vuelve pronto!</p>';
      return;
    }

    let tarjetasHTML = '';
    proyectos.forEach(proyecto => {
      tarjetasHTML += crearTarjetaProyecto(proyecto);
    });
    contenedor.innerHTML = tarjetasHTML;

  } catch (error) {
    console.error("Error al obtener los proyectos:", error);
    contenedor.innerHTML = '<p class="text-center">Error al cargar los proyectos.</p>';
  }
});

function crearTarjetaProyecto(proyecto) {
  return `
    <article class="portfolio-card" id="${proyecto.id || ''}">
      ${proyecto.imagen ? `
        <img 
          src="${proyecto.imagen}" 
          alt="Visual del proyecto ${proyecto.nombre}" 
          class="portfolio-card__image" 
          loading="lazy"> ` : ''}
      <div class="portfolio-card__content">
        <span class="portfolio-card__tag">${proyecto.tipo}</span>
        <h2 class="portfolio-card__title">${proyecto.nombre}</h2>
        <p class="portfolio-card__description">${proyecto.descripcion}</p>
        
        <div class="portfolio-card__tecnologias mb-6">
          ${(proyecto.tecnologias || []).map(tech => `<span class="tag">${tech}</span>`).join('')}
        </div>
        
        <div class="mt-auto"> ${proyecto.url_live ? `<a href="${proyecto.url_live}" class="button button--primary">Ver Proyecto</a>` : ''}
          ${proyecto.url_repo ? `<a href="${proyecto.url_repo}" class="button button--secondary mt-2 sm:mt-0 sm:ml-2">Ver Código</a>` : ''}
        </div>
      </div>
    </article>
  `;
}

function generarSchemaPrincipal(proyectos) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Proyectos de Emmanuel Contreras",
    "description": "Portafolio de proyectos de desarrollo web y arquitectura digital de Emmanuel Contreras.",
    "url": window.location.href,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": proyectos.map((proyecto, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "CreativeWork",
          "name": proyecto.nombre,
          "description": proyecto.descripcion,
          "image": proyecto.imagen,
          "url": proyecto.url_live,
          "codeRepository": proyecto.url_repo
        }
      }))
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
