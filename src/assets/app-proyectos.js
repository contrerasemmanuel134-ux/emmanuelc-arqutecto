// 1. IMPORTAMOS LA INSTANCIA `db` Y LAS FUNCIONES NECESARIAS
import { db } from '../../firebase/client.js';
import { collection, getDocs, orderBy, query } from "firebase/firestore";

document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.getElementById('contenedor-proyectos');

  if (!contenedor) {
    console.error('El contenedor de proyectos no se encontró.');
    return;
  }

  // 2. USAMOS LA INSTANCIA `db` IMPORTADA
  const proyectosRef = collection(db, "proyectos");
  const q = query(proyectosRef, orderBy("fechaCreacion", "desc")); // Ordena por los más recientes

  try {
    const querySnapshot = await getDocs(q);
    const proyectos = [];
    querySnapshot.forEach((doc) => {
        // Guardamos el id del documento junto con sus datos
        proyectos.push({ id: doc.id, ...doc.data() });
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
    contenedor.innerHTML = '<p class="text-center">Error al cargar los proyectos. Por favor, intenta de nuevo más tarde.</p>';
  }
});

function crearTarjetaProyecto(proyecto) {
  // Aseguramos que las tecnologías sean un array para evitar errores
  const tecnologias = Array.isArray(proyecto.tecnologias) ? proyecto.tecnologias : [];

  return `
    <article class="portfolio-card" id="${proyecto.id || ''}">
      ${proyecto.imagen ? `
        <img 
          src="${proyecto.imagen}" 
          alt="Visual del proyecto ${proyecto.nombre}" 
          class="portfolio-card__image" 
          loading="lazy">
      ` : ''}
      <div class="portfolio-card__content">
        <span class="portfolio-card__tag">${proyecto.tipo || 'Proyecto'}</span>
        <h2 class="portfolio-card__title">${proyecto.nombre}</h2>
        <p class="portfolio-card__description">${proyecto.descripcion || ''}</p>
        
        <div class="portfolio-card__tecnologias mb-6">
          ${tecnologias.map(tech => `<span class="tag">${tech}</span>`).join('')}
        </div>
        
        <div class="mt-auto">
          ${proyecto.url_live ? `<a href="${proyecto.url_live}" class="button button--primary">Ver Proyecto</a>` : ''}
          ${proyecto.url_repo ? `<a href="${proyecto.url_repo}" class="button button--secondary mt-2 sm:mt-0 sm:ml-2">Ver Código</a>` : ''}
        </div>
      </div>
    </article>
  `;
}

function generarSchemaPrincipal(proyectos) {
  if (!proyectos || proyectos.length === 0) return;

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

  // Remove existing schema script to avoid duplicates
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
