// 1. IMPORTAMOS LA INSTANCIA `db` Y LAS FUNCIONES NECESARIAS
import { db } from '../../firebase/client.js';
import { collection, getDocs, query, orderBy } from "firebase/firestore";

document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('blog-posts-container');

    if (!contenedor) {
        console.error('El contenedor de artículos del blog no se encontró.');
        return;
    }

    // 2. USAMOS LA INSTANCIA `db` IMPORTADA
    const blogRef = collection(db, "blogPosts");
    const q = query(blogRef, orderBy("fechaCreacion", "desc")); // Ordenar por fecha descendente

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            contenedor.innerHTML = '<p class="text-center col-span-full">Aún no hay artículos en el blog. ¡Vuelve pronto!</p>';
            return;
        }

        let tarjetasHTML = '';
        querySnapshot.forEach((doc) => {
            const post = { id: doc.id, ...doc.data() }; // Incluimos el ID del documento
            tarjetasHTML += crearTarjetaBlog(post);
        });
        contenedor.innerHTML = tarjetasHTML;

    } catch (error) {
        console.error("Error al obtener los artículos del blog:", error);
        contenedor.innerHTML = '<p class="text-center col-span-full">Hubo un error al cargar los artículos. Intenta de nuevo más tarde.</p>';
    }
});

// Esta función crea el HTML para cada tarjeta de artículo
function crearTarjetaBlog(post) {
    // Usamos el slug para el enlace, asegurándonos de que sea una ruta válida
    const postUrl = post.slug.startsWith('/') ? post.slug : `/blog/${post.slug}`;

    return `
    <article class="portfolio-card">
        <div class="portfolio-card__content">
            <span class="portfolio-card__tag">${post.categoria || 'Artículo'}</span>
            <h2 class="portfolio-card__title">${post.titulo}</h2>
            <p class="portfolio-card__description">${post.resumen || ''}</p>
            <a href="${postUrl}" class="button button--primary mt-auto">Leer Artículo</a>
        </div>
    </article>
  `;
}
