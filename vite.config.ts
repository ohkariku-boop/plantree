import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/plantree/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icon-192-v3.png', 'icon-512-v3.png'],
      manifest: {
        name: 'Plantree – Your Personal Plant Expert',
        short_name: 'Plantree',
        description: 'Identify plants, diagnose problems, track growth, and get care advice.',
        theme_color: '#4a7c59',
        background_color: '#f7f5f0',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192-v3.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-192-v3.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icon-512-v3.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512-v3.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})
