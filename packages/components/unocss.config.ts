import { defineConfig } from '@unocss/vite';
import { presetWind } from '@unocss/preset-wind';
import presetIcons from '@unocss/preset-icons';
import presetUpthrust from 'upthrust-unocss-preset';


export default defineConfig({
  presets: [
    presetWind(),
    presetIcons({
      prefix: 'i-',
      collections: {
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
      }
    }),
    presetUpthrust(),
  ],
  // transformers: [
  //   transformerCompileClass(),
  // ],
});
