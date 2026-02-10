import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild'
    },
    // Only define in production build to avoid overriding dev
    define: mode === 'production' ? {
      'import.meta.env.VITE_API_URL': JSON.stringify('https://api.schooldost.com/api')
    } : {
        // In dev, let it fall back to .env or code default
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
