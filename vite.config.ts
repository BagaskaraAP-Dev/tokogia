/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

function localApiPlugin(): Plugin {
  return {
    name: 'local-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req: any, res: any, next) => {
        const url = req.url || '';
        if (url.startsWith('/api/')) {
          let body = {};
          if (req.method === 'POST') {
            body = await new Promise((resolve) => {
              let raw = '';
              req.on('data', (c: any) => {
                raw += c;
              });
              req.on('end', () => {
                try {
                  resolve(raw ? JSON.parse(raw) : {});
                } catch {
                  resolve({});
                }
              });
            });
          }
          req.body = body;
          res.status = (code: number) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };

          try {
            if (url.startsWith('/api/laporan')) {
              const { default: handler } = await import('./api/laporan');
              return await handler(req, res);
            }
            if (url.startsWith('/api/transaksi')) {
              const { default: handler } = await import('./api/transaksi');
              return await handler(req, res);
            }
            if (url.startsWith('/api/sync')) {
              const { default: handler } = await import('./api/sync');
              return await handler(req, res);
            }
          } catch (err: any) {
            console.error('API Error:', err);
            return res.status(500).json({ error: err.message });
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    localApiPlugin(),
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
        navigateFallbackDenylist: [/^\/api/],
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'dexie', 'dexie-react-hooks', 'lucide-react'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
