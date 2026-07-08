import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'version-json',
      closeBundle() {
        fs.writeFileSync('dist/version.json', JSON.stringify({ v: Date.now() }))
      },
    },
  ],
})
