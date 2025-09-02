import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Suppress Sass deprecation warnings for @import and color functions
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      }
    }
  }
})
