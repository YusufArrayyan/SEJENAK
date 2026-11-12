import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "icons/apple-touch-icon.png"],
      manifest: {
        name: "SEJENAK",
        short_name: "SEJENAK",
        description: "Berhenti sebentar untuk memeriksa kebiasaan digitalmu.",
        lang: "id",
        start_url: "/",
        display: "standalone",
        background_color: "#fbfbfa",
        theme_color: "#fbfbfa",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: { navigateFallback: "/index.html", globPatterns: ["**/*.{js,css,html,png,woff2,svg}"] },
    }),
  ],
});
