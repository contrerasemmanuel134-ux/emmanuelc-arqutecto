document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const isExpanded = !mobileMenu.classList.contains('hidden');
            menuToggle.setAttribute('aria-expanded', String(isExpanded));
        });
    }

    // --- Dropdown Menu Logic ---
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const button = dropdown.querySelector('button');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (button && menu) {
            // Toggle on click
            button.addEventListener('click', (event) => {
                // prevent the document click listener from closing it immediately
                event.stopPropagation(); 
                menu.classList.toggle('hidden');
            });
        }
    });

    // --- Close dropdowns when clicking outside ---
    document.addEventListener('click', (event) => {
        document.querySelectorAll('.dropdown-menu:not(.hidden)').forEach(menu => {
            const dropdown = menu.closest('.dropdown');
            if (!dropdown || !dropdown.contains(event.target)) {
                 menu.classList.add('hidden');
            }
        });
    });
});
