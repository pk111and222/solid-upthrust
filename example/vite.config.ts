import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
// import devtools from 'solid-devtools/vite';
import UnocssPlugin from '@unocss/vite';

export default defineConfig({
  plugins: [
    solidPlugin({
      hot: true
    }),
    UnocssPlugin(),
  ],
  resolve: {
    alias: {
      'solid-js/web': '@solidjs/web',
    },
  },
  server: {
    port: 5656,
  },
  build: {
    target: 'esnext',
  },
});
