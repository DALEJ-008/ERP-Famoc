import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  server: {
    // En desarrollo, las peticiones a /api se reenvían a Django.
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
=======
>>>>>>> a36f6c2f35f83d7e04bb0f8a9f5950043995571f
})
