import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Forward /api calls to the Node server, so no CORS setup is needed
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:4000" } },
});
