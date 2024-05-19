/// <reference types="vitest" />
import { resolve } from 'path'
import { URL, fileURLToPath } from "url";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@jamais': fileURLToPath(new URL('./src/index', import.meta.url)),
      '@helpers': fileURLToPath(new URL('./src/helpers', import.meta.url))
    },
  },
  test: {
    includeSource: ["src/test/**/*.test.ts"],
  },
  define: {
    "import.meta.vitest": "undefined",
  },
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Jamais',
      // the proper extensions will be added
      fileName: 'jamais',
    },
    // rollupOptions: {
    //   // make sure to externalize deps that shouldn't be bundled
    //   // into your library
    //   external: ['vue'],
    //   output: {
    //     // Provide global variables to use in the UMD build
    //     // for externalized deps
    //     globals: {
    //       vue: 'Vue',
    //     },
    //   },
    // },
  },
});
