import { defineConfig } from '@unocss/vite'
import { presetWind4 } from '@unocss/preset-wind4'
import presetIcons from '@unocss/preset-icons'
// Load the source preset so docs builds never depend on stale dist artifacts.
import presetUpthrust from '../packages/preset/src/index.ts'

export default defineConfig({
  // Keep vendor-specific pseudo-elements out of ordinary selector lists.
  // An unsupported pseudo-element otherwise invalidates the whole rule.
  mergeSelectors: false,
  content: { filesystem: ['src/**/*.{ts,tsx}', '../packages/components/lib/**/*.{ts,tsx}'] },
  presets: [
    presetWind4(),
    presetIcons({ collections: { mdi: () => import('@iconify-json/mdi/icons.json').then(module => module.default) } }),
    presetUpthrust(),
  ],
})
