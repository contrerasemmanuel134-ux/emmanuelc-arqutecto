import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import path from 'path';
import { fileURLToPath } from 'url';
import node from '@astrojs/node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  output: 'server', 
  adapter: node({
    mode: 'middleware',
  }),
  integrations: [
    tailwind(), 
    sitemap()
  ],
  site: 'https://emmanuel-contreras.com',

  server: {
    proxy: {
      '/generalKnowledgeQueryFlow': 'http://localhost:3400/generalKnowledgeQueryFlow',
    }
  },

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
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    }
  },
});