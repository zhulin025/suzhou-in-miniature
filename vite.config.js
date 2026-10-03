import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        suzhou: resolve('index.html'),
        cities: resolve('cities.html'),
        ...Object.fromEntries(readdirSync('cities', {withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>[e.name,resolve('cities',e.name,'index.html')])),
      },
      output: {
        manualChunks(id) {
          if(id.includes('/node_modules/three/'))return 'three';
          if(id.includes('/node_modules/lucide/'))return 'icons';
        },
      },
    },
  },
});
