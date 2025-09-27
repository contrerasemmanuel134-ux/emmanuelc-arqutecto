document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Unobserve the element after the animation to save resources
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Start animation when 10% of the element is visible
    });

    const sectionsToAnimate = document.querySelectorAll('.fade-in-section');
    sectionsToAnimate.forEach(section => {
        observer.observe(section);
    });
});
