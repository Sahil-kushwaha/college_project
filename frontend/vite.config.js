import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  //  server: {
  //   proxy: {
  //     // Proxy requests from http://localhost:5173/api to http://localhost:3000/api
  //     '/api': {
  //       target: 'http://localhost:3000', // The address of your backend server
  //       changeOrigin: true, // Needed for virtual hosted sites
  //       rewrite: (path) => path.replace(/^\/api/, ''), // Optional: rewrites the path
  //     },
  //   },
  // },
});
