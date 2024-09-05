import { defineConfig } from '@unocss/vite';
import { presetIcons, presetUno } from 'unocss'
import presetUpthrust from 'upthrust-unocss-preset';

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      prefix: 'i-',
      collections: {
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
      }
    }),
    presetUpthrust()
  ],
  // transformers: [
  //   transformerCompileClass(),
  // ],
});
