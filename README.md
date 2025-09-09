# Emmanuel Contreras - Arquitecto Digital

Este es el repositorio del sitio web personal de Emmanuel Contreras, un Arquitecto Digital. El sitio está diseñado para ser una plataforma rápida y eficiente que muestra servicios, casos de éxito, un blog y permite la gestión de contenido a través de un panel de administración.

## ✨ Características

-   **Desarrollo Frontend con Astro:** Construido con Astro para un rendimiento óptimo, generación de sitios estáticos y una experiencia de usuario rápida.
-   **Backend con Firebase:** Utiliza Firebase para la gestión de datos (Firestore), funciones de servidor (Firebase Functions) y almacenamiento de medios (Firebase Storage).
-   **Panel de Administración:** Un panel personalizado para gestionar fácilmente el contenido del blog, proyectos y otros datos.
-   **Sección de Blog:** Artículos y publicaciones gestionables con soporte para contenido HTML.
-   **Casos de Éxito/Portafolio:** Muestra proyectos y casos de éxito con detalles y enlaces.
-   **Diseño Responsivo:** Implementado con Tailwind CSS para una experiencia de usuario fluida en todos los dispositivos.
-   **SEO Optimizado:** Estructura y configuración pensadas para una buena indexación en motores de búsqueda.

## 🚀 Estructura del Proyecto

```text
/
├── public/                 # Archivos estáticos (imágenes, favicon, JS del cliente)
├── src/                    # Código fuente de la aplicación
│   ├── assets/             # Imágenes y JS del cliente
│   ├── components/         # Componentes Astro reutilizables
│   ├── firebase/           # Configuración de Firebase para el cliente
│   ├── layouts/            # Plantillas de diseño para las páginas
│   ├── pages/              # Páginas del sitio (rutas)
│   └── styles/             # Archivos CSS (Tailwind CSS y estilos personalizados)
├── functions/              # Funciones de Firebase (API de backend)
├── .firebaserc             # Configuración de Firebase CLI
├── firebase.json           # Configuración de Firebase Hosting y Functions
├── astro.config.mjs        # Configuración de Astro
├── tailwind.config.mjs     # Configuración de Tailwind CSS
├── package.json            # Dependencias y scripts del proyecto
└── README.md               # Este archivo
```

## 🛠️ Configuración e Instalación

Para configurar y ejecutar el proyecto localmente, sigue estos pasos:

1.  **Clonar el repositorio:**

    ```bash
    git clone [URL_DEL_REPOSITORIO]
    cd emmanuelc-arqutecto
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    cd functions
    npm install
    cd ..
    ```

3.  **Configurar Firebase:**

    *   Asegúrate de tener la CLI de Firebase instalada: `npm install -g firebase-tools`
    *   Inicia sesión en Firebase: `firebase login`
    *   Usa tu proyecto de Firebase: `firebase use --add` (selecciona tu proyecto de la lista)
    *   Asegúrate de que tu archivo `src/firebase/client.ts` esté configurado con las credenciales de tu proyecto Firebase.

4.  **Ejecutar emuladores de Firebase (opcional pero recomendado para desarrollo local):**

    ```bash
    firebase emulators:start
    ```

## ⚙️ Comandos de Desarrollo

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando             | Acción                                            |
| :------------------ | :------------------------------------------------ |
| `npm run dev`       | Inicia el servidor de desarrollo local en `localhost:4321` |
| `npm run build`     | Compila el sitio para producción en `./dist/`     |
| `npm run preview`   | Previsualiza la compilación localmente           |

## 🚀 Despliegue

Para desplegar el sitio y las funciones de Firebase:

```bash
firebase deploy
```

Esto desplegará tu sitio en Firebase Hosting y tus funciones en Firebase Functions.

## 📄 Licencia

[Especifica tu licencia aquí, por ejemplo: MIT]