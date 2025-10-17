import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import rollupNodePolyFill from "rollup-plugin-polyfill-node";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["bip39", "bip32", "buffer"]
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        content: resolve(__dirname, "src/content.js"),
        injected: resolve(__dirname, "src/injected.js")
      },
      output: {
        entryFileNames: chunk => {
          if (["content", "injected"].includes(chunk.name)) return `${chunk.name}.js`;
          return "[name].js";
        }
      },
      plugins: [rollupNodePolyFill()]
    }
  },
  resolve: {
    alias: {
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      buffer: "buffer",
      process: "process/browser"
    }
  },
  define: {
    global: "globalThis",
    "process.env": {}
  }
});
