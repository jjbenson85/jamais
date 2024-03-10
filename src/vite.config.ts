/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    includeSource: ["src/test/**/*.test.ts"],
  },
  define: {
    "import.meta.vitest": "undefined",
  },
});