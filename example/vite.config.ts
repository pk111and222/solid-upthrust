import { fileURLToPath, URL } from 'node:url';
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
    alias: [
      { find: /^upthrust-ui\/source\/(.+)$/, replacement: fileURLToPath(new URL('../packages/components/lib', import.meta.url)) + '/$1/index.tsx' },
      { find: 'upthrust-competence', replacement: fileURLToPath(new URL('../packages/competence/src/index.ts', import.meta.url)) },
      { find: 'solid-js/web', replacement: '@solidjs/web' },
    ],
    dedupe: ['solid-js', '@solidjs/web'],
  },
  server: {
    port: 5656,
  },
  build: {
    target: 'esnext',
  },
});
