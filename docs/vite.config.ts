import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import UnoCSS from '@unocss/vite'
import { docsSsr } from './plugins/ssr.ts'
import { normalizeBase } from './src/routing.ts'

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: normalizeBase(process.env.DOCS_BASE),
  appType: 'custom',
  // The document is never hydrated; browser examples use independent render roots.
  // Disabling hydration markers also keeps raw-text elements such as <title> clean.
  plugins: [solid({ ssr: true, solid: { hydratable: false } }), UnoCSS(), docsSsr()],
  resolve: {
    alias: [
      { find: /^upthrust-ui\/source\/(.+)$/, replacement: fileURLToPath(new URL('../packages/components/lib', import.meta.url)) + '/$1/index.tsx' },
      { find: 'upthrust-competence', replacement: fileURLToPath(new URL('../packages/competence/src/index.ts', import.meta.url)) },
      { find: 'solid-js/web', replacement: '@solidjs/web' },
    ],
    dedupe: ['solid-js', '@solidjs/web'],
  },
  server: { port: 5657, strictPort: true },
  build: { target: 'esnext' },
})
