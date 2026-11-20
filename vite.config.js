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
    build: {
      target: 'es2022',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('@toast-ui/editor')) {
              return 'toastui-editor'
            }
            if (id.includes('sweetalert2')) {
              return 'sweetalert2'
            }
            if (id.includes('@tabler/icons-react')) {
              return 'tabler-icons'
            }
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
        },
      },
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
