import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwincss from 'tailwindcss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwincss()
  ],
})
