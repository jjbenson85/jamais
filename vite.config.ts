/// <reference types="vitest" />
import { URL, fileURLToPath } from "url";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@helpers': fileURLToPath(new URL('./src/helpers', import.meta.url))
    },
  },
  test: {
    includeSource: ["src/test/**/*.test.ts"],
  },
  define: {
    "import.meta.vitest": "undefined",
  },
});
