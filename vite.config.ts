/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon-32x32.png',
        'favicon-16x16.png',
        'icon.svg',
        'apple-touch-icon.png',
        'logo-giaa.png',
      ],
      manifest: {
        id: '/',
        name: "Catatan Keuangan · Gia's Patisserie",
        short_name: "Gia's Patisserie",
        description: "Catat keuangan harian dan simpan resep toko kue Gia's Patisserie.",
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fff5f8',
        theme_color: '#d0346d',
        icons: [
          { src: 'logo-giaa.png?v=5', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-192.png?v=5', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png?v=5', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-512.png?v=5', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
