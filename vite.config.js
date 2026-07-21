import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative assets work both on a custom domain and under a GitHub Pages repo path.
  base: './',
})
