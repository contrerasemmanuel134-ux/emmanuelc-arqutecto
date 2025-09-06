document.addEventListener('DOMContentLoaded', () => {
    const loadComponent = (id, url) => {
        fetch(url)
            .then(response => response.ok ? response.text() : Promise.reject(`Error: ${response.status}`))
            .then(data => {
                const element = document.getElementById(id);
                if (element) {
                    element.innerHTML = data;
                    // Si se cargó el header, inicializamos toda la navegación
                    if (id === 'header-placeholder') {
                        initializeNavigation();
                        initializeActiveNavOnScroll();
                    }
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
            const isExpanded = mobileMenu.classList.toggle('hidden');
            menuToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Lógica para marcar el enlace activo basado en la URL
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkPath = (link.getAttribute('href') || '').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });
};

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
                    link.classList.remove('active');
                    // Comprueba si el href termina con el ID de la sección (ej: /#about)
                    // O si es la página de inicio y la sección es el hero.
                    const linkHref = link.getAttribute('href');
                    const isHomePageLink = linkHref === '/' || linkHref === '/index.html';
                    if (linkHref.endsWith(`#${activeId}`) || (isHomePageLink && activeId === 'hero-home')) {
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