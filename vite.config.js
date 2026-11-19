import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Reverse proxy rute /api ke Backend (port 8081). Dipakai oleh `vite dev` dan `vite preview`.
  const apiProxy = {
    '/api': {
      target: env.VITE_API_PROXY_TARGET || 'http://localhost:8081',
      changeOrigin: true,
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5174,
      strictPort: true,
      proxy: apiProxy,
    },
    preview: {
      port: 5174,
      strictPort: true,
      proxy: apiProxy,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/main.jsx', 'src/setupTests.js', '**/*.test.{js,jsx}'],
        thresholds: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  }
})
