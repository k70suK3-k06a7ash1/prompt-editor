import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
// https://vite.dev/config/
export default defineConfig({
    optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
    worker: {
    format: 'es',
  },
  plugins: [react(), tailwindcss()],
  base: '/prompt-editor/',
  build: {
    outDir: 'dist',
  },
   resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
