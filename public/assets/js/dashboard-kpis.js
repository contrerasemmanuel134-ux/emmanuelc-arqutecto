// public/assets/js/dashboard-kpis.js
import { collection, getDocs, query } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from '/firebase/client.js';

document.addEventListener('DOMContentLoaded', () => {
    // db is now imported from client.js and ready to use.

    const cargarKPIs = async () => {
        const [proyectosSnapshot, testimoniosSnapshot, blogSnapshot] = await Promise.all([
            getDocs(query(collection(db, "proyectos"))),
            getDocs(query(collection(db, "testimonios"))),
            getDocs(query(collection(db, "blogPosts")))
        ]);

        const proyectos = proyectosSnapshot.docs.map(doc => doc.data());
        const testimonios = testimoniosSnapshot.docs.map(doc => doc.data());
        const blogPosts = blogSnapshot.docs.map(doc => doc.data());

        actualizarKPIs(proyectos, testimonios, blogPosts);
    };

    const actualizarKPIs = (proyectos, testimonios, blogPosts) => {
        const kpiProyectos = document.getElementById('kpi-proyectos');
        const kpiTestimonios = document.getElementById('kpi-testimonios');
        const kpiBlog = document.getElementById('kpi-blog');
        // const kpiLeads = document.getElementById('kpi-leads'); // Para el futuro

        if (kpiProyectos) {
            kpiProyectos.textContent = proyectos.filter(p => p.estado === 'Completado').length;
        }
        if (kpiTestimonios) {
            kpiTestimonios.textContent = testimonios.filter(t => t.estado === 'aprobado').length;
        }
        if (kpiBlog) {
            kpiBlog.textContent = blogPosts.length;
        }
        // if (kpiLeads) { /* Lógica para leads */ }
    };

    cargarKPIs();
});
