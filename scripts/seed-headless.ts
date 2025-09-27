import admin from 'firebase-admin';
import serviceAccount from '../functions/service-account.json' assert { type: 'json' };

// --- Inicialización del SDK de Administrador ---
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();
console.log("✅ Conectado a Firebase con privilegios de Administrador.");

// --- DATOS PARA LA NUEVA ARQUITECTURA ---

// 1. Documento de Configuración Global
const configData = {
  siteTitle: "Emmanuel Contreras - Arquitecto Digital",
  mainLogoUrl: "/src/assets/logo-emmanuel-contreras.png", // Ruta local o URL completa
  heroSection: {
    title: "Emmanuel Contreras: Arquitecto Digital",
    description: "Convierto tu visión de negocio en plataformas digitales robustas, intuitivas y que generan resultados medibles.",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/expanded-system-469904-v9.firebasestorage.app/o/hero-index.webp?alt=media&token=ac5e28b1-5dc2-425f-b348-13f4395b640c",
    callToActionText: "Ver Mi Proceso",
    callToActionLink: "/proceso"
  },
  footerText: "© 2025 Emmanuel Contreras. Todos los derechos reservados."
};

// 2. Colección de Páginas con Bloques de Contenido
const pagesData = [
  {
    id: "servicios", // El slug de la URL
    title: "Servicios de Arquitectura Digital",
    metaDescription: "Ofrezco servicios de arquitectura digital: desde la consultoría y estrategia hasta el desarrollo a medida y optimización.",
    contentBlocks: [
      {
        type: 'hero-interior',
        props: {
          title: 'Servicios de Arquitectura Digital',
          description: 'Tu negocio es único y tu plataforma digital también debería serlo. Mis servicios son el resultado de un proceso estratégico diseñado para construir el puente tecnológico entre tus metas de negocio y tus clientes.'
        }
      },
      {
        type: 'service-item',
        props: {
          title: 'Estrategia y Consultoría de Transformación Digital',
          description: 'Como tu Arquitecto Digital, mi primer paso nunca es el código, es el plano. Analizamos tus objetivos para diseñar una hoja de ruta tecnológica que garantice el retorno de tu inversión.',
          imageUrl: 'https://firebasestorage.googleapis.com/v0/b/expanded-system-469904-v9.firebasestorage.app/o/estratefia%20y%20consultoria.webp?alt=media&token=d794ea95-fb90-438c-9c02-414c1fe47658'
        }
      },
      {
        type: 'service-item',
        props: {
          title: 'Desarrollo de Plataformas Web a Medida',
          description: 'Construyo plataformas web que no solo lucen bien, sino que rinden bajo presión y crecen contigo. Materializo tu visión en un activo digital robusto, rápido y totalmente escalable.',
          imageUrl: 'https://firebasestorage.googleapis.com/v0/b/expanded-system-469904-v9.firebasestorage.app/o/Un-diagrama-de-arquitectura-de-software-profesional-y-limpio%20(1).webp?alt=media&token=c03624e5-3945-44c3-af0b-05e112a3b42e'
        }
      },
      {
        type: 'service-item',
        props: {
          title: 'Optimización de Rendimiento y Procesos',
          description: 'Un sitio web lento o un proceso de compra complicado te están costando dinero. Auditamos y optimizamos tu plataforma existente para que sea más rápida, más eficiente y convierta más.',
          imageUrl: 'https://firebasestorage.googleapis.com/v0/b/expanded-system-469904-v9.firebasestorage.app/o/optimisacion.webp?alt=media&token=a46e7a25-afad-41ef-9013-128d9a1a4a58'
        }
      }
    ]
  },
  // Puedes añadir más páginas como 'proceso', 'sobre-mi', etc. aquí
];


// --- FUNCIÓN DE SIEMBRA ---

async function seedDatabase() {
  try {
    console.log("\nIniciando el proceso de siembra Headless...");

    // Sembrar documento de configuración global
    console.log("Sembrando documento 'config/website'...");
    await db.collection('config').doc('website').set(configData);
    console.log("¡Documento de configuración sembrado!");

    // Sembrar colección de páginas
    console.log("\nSembrando colección 'pages'...");
    const pagesCollectionRef = db.collection('pages');
    const batch = db.batch();

    // Borrar páginas existentes para evitar duplicados
    const snapshot = await pagesCollectionRef.get();
    if (!snapshot.empty) {
      console.log(`Borrando ${snapshot.size} páginas existentes...`);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    // Añadir las nuevas páginas
    const newBatch = db.batch();
    pagesData.forEach(page => {
      const docRef = pagesCollectionRef.doc(page.id); // Usar el slug como ID
      newBatch.set(docRef, {
        title: page.title,
        metaDescription: page.metaDescription,
        contentBlocks: page.contentBlocks
      });
    });
    await newBatch.commit();
    console.log(`¡${pagesData.length} páginas sembradas exitosamente!`);

    console.log("\n✅ Proceso de siembra Headless completado.");

  } catch (error) {
    console.error("\n❌ Error durante el proceso de siembra:", error);
  }
}

seedDatabase();
