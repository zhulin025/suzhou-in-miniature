import { defineConfig } from 'vite';
export default defineConfig({base:'/v2/',server:{host:'127.0.0.1',port:5174,strictPort:true},build:{outDir:'../dist/v2',emptyOutDir:false,rollupOptions:{output:{manualChunks(id){if(id.includes('/node_modules/three/'))return 'three';if(id.includes('/node_modules/lucide/'))return 'icons';}}}}});
