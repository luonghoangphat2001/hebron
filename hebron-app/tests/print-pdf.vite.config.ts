import path from 'node:path';
import { defineConfig } from 'vite';

// Isolated dependency cache: never race the user's running app optimizer while
// exercising a PDF fixture after installing/changing PDF dependencies.
export default defineConfig({
  root: path.resolve(import.meta.dirname, '..'),
  cacheDir: 'node_modules/.vite-print-fixture',
  resolve: { alias: { '@': path.resolve(import.meta.dirname, '../src') } },
  optimizeDeps: { include: ['konva', 'jspdf', 'opentype.js', 'svg2pdf.js', 'lucide-react'] },
  server: { host: '127.0.0.1', port: 5006, strictPort: true },
  build: {
    outDir: process.env.PRINT_PDF_TEST_OUTPUT || path.resolve(import.meta.dirname, '../node_modules/.cache/print-pdf-fixture'),
    emptyOutDir: true,
    rollupOptions: { input: path.resolve(import.meta.dirname, 'print-pdf-fixture.html') },
  },
});
