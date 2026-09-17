import { defineConfig } from '@unocss/vite';
import presetIcons from '@unocss/preset-icons';
import { presetWind4 } from '@unocss/preset-wind4';
import presetUpthrust from 'upthrust-unocss-preset';

export default defineConfig({
  // Keep vendor-specific pseudo-elements out of ordinary selector lists.
  // An unsupported pseudo-element otherwise invalidates the whole rule.
  mergeSelectors: false,
  content: {
    filesystem: [
      'src/**/*.tsx',
      '../docs/src/examples/**/*.tsx',
      // workspace library sources — the demo renders the lib straight from
      // source through these aliases, so arbitrary variants used inside the
      // components (e.g. Search's [&>button]:!rounded-l-none) must be scanned
      // here too or the classes silently produce no CSS.
      '../packages/components/lib/**/*.tsx',
      '../packages/components/lib/**/*.ts',
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
