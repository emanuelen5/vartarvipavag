import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // Use fake data if VITE_USE_FAKE_DATA is 'true'
  const useFakeData = env.VITE_USE_FAKE_DATA === 'true'
  
  // Backend URL - defaults to localhost if not set
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:3001'

  const config: any = {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_USE_FAKE_DATA': JSON.stringify(useFakeData)
    }
  }

  // Only set up proxy if not using fake data
  if (!useFakeData) {
    const isSecure = backendUrl.startsWith('https://')
    
    config.server = {
      port: 3000,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: isSecure,
        },
      },
    }

    // Set VITE_API_URL so requests go through proxy
    config.define['import.meta.env.VITE_API_URL'] = JSON.stringify('http://localhost:3000')
  } else {
    // Fake data mode - still need server config for dev server
    config.server = {
      port: 3000,
    }
  }

  return config
})