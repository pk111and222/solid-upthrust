import { defineConfig } from '@unocss/vite';
import presetIcons from '@unocss/preset-icons';
import { presetWind4 } from '@unocss/preset-wind4';
import presetUpthrust from 'upthrust-unocss-preset';

export default defineConfig({
  content: {
    filesystem: [
      'src/**/*.tsx',
    ],
  },
  presets: [
    presetWind4(),
    presetIcons({
      prefix: 'i-',
      autoInstall: true,
      collections: {
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
      }
    }),
    presetUpthrust()
  ],
});
