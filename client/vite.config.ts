import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useProdData = env.USE_PROD_DATA === 'true'

  const config: any = {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: useProdData
            ? 'https://cedernaes.duckdns.org/vartarvipavag'
            : 'http://localhost:3001',
          changeOrigin: true,
          secure: useProdData,
        },
      },
    },
  }

  // Only set VITE_API_URL if USE_PROD_DATA is set
  if (useProdData) {
    config.define = {
      'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:3000')
    }
  }

  return config
})