import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import path from 'path';
import { fileURLToPath } from 'url';
import image from "@astrojs/image"; // Import the image integration

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), image()], // Add image() here
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/firebase')) {
              return 'firebase';
            }
          }
        }
      }
    }
  },
});
