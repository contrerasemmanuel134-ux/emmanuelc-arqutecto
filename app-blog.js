
// assets/app-blog.js

// Usar la API global de Firebase Firestore con la CDN
// Asegúrate de que los scripts de la CDN estén en el <head> de tu HTML
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>

document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('blog-posts-container');

    if (!contenedor) {
        console.error('El contenedor de artículos del blog no se encontró.');
        return;
    }

    const db = firebase.firestore();
    // Ordenar por fechaCreacion descendente
    try {
        const querySnapshot = await db.collection("blogPosts").orderBy("fechaCreacion", "desc").get();

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