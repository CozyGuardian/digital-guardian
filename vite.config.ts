import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  root: "frontend",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "frontend") },
  },
  test: {
    environment: "node",
  },
});
