import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // prevent Vite from watching Visual Studio workspace files which can be locked
    watch: {
      ignored: ['**/.vs/**', '**/.git/**', '**/node_modules/**'],
    },
    // no backend proxy (backend removed)
  },
})
