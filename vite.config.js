// import path from "path";
// import { fileURLToPath } from 'url';
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // Convert import.meta.url to __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
//   server: {
//     proxy: {
//       '/api': {
//         target: 'https://legal-ai-backend-draft-drh9bmergvh7a4a9.southeastasia-01.azurewebsites.net',
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, '')
//       }
//     }
//   }
// });

import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target:
          "https://legal-ai-backend-draft-drh9bmergvh7a4a9.southeastasia-01.azurewebsites.net",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/court-api": {
        target: "https://apis.akshit.net",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/court-api/, ""),
      },
      "/legal-api": {
        target: "http://localhost:3000", // Node server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
