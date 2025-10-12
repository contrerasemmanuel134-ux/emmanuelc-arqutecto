
// server.js - Punto de entrada para el contenedor Docker
import express from 'express';
import { handler as astroHandler } from './dist/server/entry.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Servir archivos estáticos (CSS, JS, imágenes) desde la carpeta 'dist/client'
app.use(express.static(path.join(__dirname, 'dist/client')));

// Usar el manejador de renderizado de Astro para todas las demás peticiones
app.use(astroHandler);

// Escuchar en el puerto definido por el entorno o en el 4000 por defecto
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`🚀 Servidor listo y escuchando en http://localhost:${port}`);
});
