import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// iframe で WordPress 固定ページに埋め込むため、相対パスでビルドする
export default defineConfig({
  plugins: [react()],
  base: './',
})
