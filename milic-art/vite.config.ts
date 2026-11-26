import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Para el artifact de una sola pieza (docs/milicenda/build_artifact.mjs): las imágenes se incrustan.
  build: process.env.ARTIFACT ? { assetsInlineLimit: 100_000_000, cssCodeSplit: false, modulePreload: false } : {},
});
