import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Ứng dụng SPA có các URL sâu như /dang-nhap/hoc-sinh: asset phải luôn lấy từ gốc host.
  base: '/',
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/health': 'http://localhost:4000',
    },
  },
})
