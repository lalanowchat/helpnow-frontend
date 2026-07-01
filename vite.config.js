import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
 
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/data": {
        target: "http://127.0.0.1:8000/api/v1/data",
        changeOrigin: true,
      },
      "/resources": {
        target: "http://127.0.0.1:8000/api/v1",
        changeOrigin: true,
      },
      "/translate": {
        target: "https://api-free.deepl.com/v2/translate",
        changeOrigin: true,
      },
    }, // end proxy key
  }, // end server key
});