import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './',
  root: 'src/renderer',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
      '@shared': resolve(__dirname, 'src/shared')
    }
  },
  server: {
    port: 5173,
    strictPort: true
  },
  define: {
    'process.env': {}
  }
})
