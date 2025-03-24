// demo/vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/js/index.ts'),
      name: 'RevealDemoPlugin',
      formats: ['es', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'demo-plugin/demo-plugin.mjs';
        return 'demo-plugin/demo-plugin.js'; // UMD format
      }
    },
    rollupOptions: {
      external: ['reveal.js'],
      output: {
        globals: {
          'reveal.js': 'Reveal'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.names && /\.css$/.test(assetInfo.names[0])) {
            return 'demo-plugin/demo-plugin.css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    outDir: 'plugin'
  }
});