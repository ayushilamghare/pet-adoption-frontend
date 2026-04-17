import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5342,
    proxy: {
      "/api": "https://pet-adoption-backend-15iv.onrender.com"
    }
  }
});
