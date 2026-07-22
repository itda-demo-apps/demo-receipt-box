import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    // PWA: 오프라인 동작 — 영수증 데이터·사진은 전부 기기 안(localStorage + IndexedDB)
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png", "favicon.svg"],
      manifest: {
        name: "영수증 정리함",
        short_name: "영수증함",
        description: "영수증 사진을 드래그하면 분류·집계 — 데이터는 내 기기에만",
        lang: "ko",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        background_color: "#1E2126",
        theme_color: "#1E2126",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
        globIgnores: ["splash/**", "og.png"],
        navigateFallbackDenylist: [/\.[a-z0-9]+$/i],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-css" },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-woff",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: { host: true },
});
