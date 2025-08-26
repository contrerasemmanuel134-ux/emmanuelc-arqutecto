// assets/js/app-blog.js

import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('blog-posts-container');

    if (!contenedor) {
        console.error('El contenedor de artículos del blog no se encontró.');
        return;
    }

    const db = getFirestore();
    const blogRef = collection(db, "blogPosts");
    // Creamos una consulta para ordenar los artículos por fecha de creación, del más nuevo al más viejo
    const q = query(blogRef, orderBy("fechaCreacion", "desc"));

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            contenedor.innerHTML = '<p class="text-center col-span-full">Aún no hay artículos en el blog. ¡Vuelve pronto!</p>';
            return;
        }

        let tarjetasHTML = '';
        querySnapshot.forEach((doc) => {
            const post = doc.data();
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
    return `
    <article class="portfolio-card">
        <div class="portfolio-card__content">
            <span class="portfolio-card__tag">${post.categoria || 'Artículo'}</span>
            <h2 class="portfolio-card__title">${post.titulo}</h2>
            <p class="portfolio-card__description">${post.resumen}</p>
            <a href="${post.slug}" class="button button--primary mt-auto">Leer Artículo</a>
        </div>
    </article>
  `;
}