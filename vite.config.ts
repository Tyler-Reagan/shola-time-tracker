import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/shola-time-tracker/", // GitHub Pages base path
  build: {
    outDir: "docs",
    assetsDir: "assets",
  },
});
