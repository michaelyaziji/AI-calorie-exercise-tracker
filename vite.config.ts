import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'wouter', '@tanstack/react-query'],
          ui: ['@radix-ui/react-slot', '@radix-ui/react-label', 'lucide-react'],
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@radix-ui/react-slot',
      '@radix-ui/react-label',
      'react-icons/si',
      'recharts',
      'date-fns',
      'framer-motion',
      'embla-carousel-react',
      '@radix-ui/react-dropdown-menu'
    ]
  },
  server: {
    fs: {
      strict: false
    },
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? process.env.API_URL || 'http://localhost:10000'
          : 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
});
