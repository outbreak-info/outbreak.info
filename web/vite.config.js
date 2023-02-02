import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
              @import "./src/styles/_variables.scss";
              @import "./src/styles/_basics.scss";
              @import "./src/styles/_layout.scss";
              @import "./src/styles/_objects.scss";
            `,
      },
    },
  },
});
