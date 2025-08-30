// Script para menú desplegable por clic en el header (desktop)
document.addEventListener('DOMContentLoaded', () => {
    const dropdownBtn = document.querySelector('.dropdown > button');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (dropdownBtn && dropdownMenu) {
        let open = false;
        dropdownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            open = !open;
            dropdownMenu.classList.toggle('hidden', !open);
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.add('hidden');
                open = false;
            }
        });

        // Cerrar al seleccionar una opción
        dropdownMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                dropdownMenu.classList.add('hidden');
                open = false;
            });
        });
    }
});
