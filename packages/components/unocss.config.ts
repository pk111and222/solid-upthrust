import { defineConfig } from '@unocss/vite';
import { presetWind4 } from '@unocss/preset-wind4';
import presetIcons from '@unocss/preset-icons';
import presetUpthrust from 'upthrust-unocss-preset';


export default defineConfig({
  presets: [
    presetWind4(),
    presetIcons({
      prefix: 'i-',
      collections: {
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
      }
    }),
    presetUpthrust(),
  ],
});
