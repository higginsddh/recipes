import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
  },
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
      },
      manifestFilename: "manifest.json",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Higgins Shopping List",
        short_name: "ShoppingList",
        description: "Higgins Shopping List",
        theme_color: "#ffffff",
        display: "browser",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
