import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
const middlewareMode = process.env.VITE_MIDDLEWARE_MODE === "true";

export default defineConfig({
  envPrefix: ["VITE_", "PUBLIC_"],
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "श्रम सेवा — Nepal Manpower",
        short_name: "श्रम सेवा",
        description: "Nepal Local Government Manpower Platform",
        theme_color: "#7C1D2B",
        background_color: "#FAF7F0",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("framer-motion")) {
            return "motion";
          }

          if (id.includes("@tanstack/react-router")) {
            return "router";
          }

          if (id.includes("@tanstack/react-query")) {
            return "query";
          }

          if (id.includes("lucide-react")) {
            return "icons";
          }

          if (id.includes("@radix-ui")) {
            return "radix";
          }

          if (id.includes("react") || id.includes("scheduler")) {
            return "react-vendor";
          }

          return "vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "@tanstack/react-query": path.resolve(
        __dirname,
        "node_modules/@tanstack/react-query",
      ),
    },
    dedupe: ["react", "react-dom", "@tanstack/react-query"],
  },
  server: {
    fs: {
      // Ensure linked workspace packages outside apps/web are watchable in dev.
      allow: [
        path.resolve(__dirname),
        path.resolve(__dirname, "../../packages"),
      ],
    },
    ...(middlewareMode
      ? {
          middlewareMode: true,
        }
      : {}),
  },
});
