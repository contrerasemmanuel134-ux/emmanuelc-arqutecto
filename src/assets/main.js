document.addEventListener('DOMContentLoaded', () => {
    const loadComponent = (id, url) => {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById(id).innerHTML = data;
                // Volver a ejecutar la lógica de la navegación después de cargar el header
                if (id === 'header-placeholder') {
                    initializeNavigation();
                }
            })
            .catch(error => console.error(`Error al cargar ${url}:`, error));
    };

    loadComponent('header-placeholder', '/_includes/header.html');
    loadComponent('footer-placeholder', '/_includes/footer.html');
});

const initializeNavigation = () => {
    // Lógica del menú móvil
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
            const isExpanded = !mobileMenu.classList.contains('hidden');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Lógica para marcar el enlace activo
    const currentPath = window.location.pathname.split('/').pop() || 'index.html'; // Asegura que 'index.html' sea el default
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });
};
// /assets/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // ... (tu código existente para cargar header y footer)
    const loadComponent = (id, url) => {
        // ...
    };

    loadComponent('header-placeholder', '/_includes/header.html');
    loadComponent('footer-placeholder', '/_includes/footer.html');

    // ¡AÑADE EL NUEVO CÓDIGO AQUÍ!
    initializeActiveNavOnScroll();
});

// --- NUEVA FUNCIÓN PARA EL ESTADO ACTIVO AL HACER SCROLL ---
const initializeActiveNavOnScroll = () => {
    // Nos aseguramos de que se ejecute solo si hay secciones con ID en la página
    const sections = document.querySelectorAll('main section[id]');
    if (sections.length === 0) return;

    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.id;
                navLinks.forEach(link => {
                    // Limpiamos la clase 'active' de todos los enlaces
                    link.classList.remove('active');

                    // Comprobamos si el href del enlace coincide con el ID de la sección visible
                    const linkHref = link.getAttribute('href').split('/').pop().replace('.html', '');
                    const sectionIdForLink = linkHref === 'index' ? 'hero-home' : linkHref; // Adaptar si es necesario

                    if (link.href.includes(activeId)) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-50% 0px -50% 0px' // Se activa cuando la sección está en el centro de la pantalla
    });

    sections.forEach(section => {
        observer.observe(section);
    });
};