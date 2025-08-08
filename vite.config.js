// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['bip39', 'bip32', 'buffer'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // 🛑 <--- This is what prevents deleting background.js!
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html')
      },
      plugins: [
        rollupNodePolyFill()
      ]
    }
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
      process: 'process/browser',
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  }
});




































// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react-swc';
// import { resolve } from 'path';

// export default defineConfig({
//   plugins: [react()],
//   build: {
//     outDir: 'dist',
//     rollupOptions: {
//       input: {
//         popup: resolve(__dirname, 'popup.html') // 👈 correct path
//       }
//     }
//   }
// });


