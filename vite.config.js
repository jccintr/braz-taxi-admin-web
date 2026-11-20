import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from 'flowbite-react/plugin/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), flowbiteReact()],
    server: {
      port: 5176,
      // Em desenvolvimento, /api vai para a API (sem CORS e sem VITE_API_URL).
      // A API do Braz Taxi não tem prefixo /api: o proxy remove o prefixo antes de repassar.
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
