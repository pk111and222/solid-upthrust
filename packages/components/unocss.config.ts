import { defineConfig } from '@unocss/vite';
import { presetWind4 } from '@unocss/preset-wind4';
import presetIcons from '@unocss/preset-icons';
import presetUpthrust from 'upthrust-unocss-preset';


export default defineConfig({
  presets: [
    // No preflights in the LIBRARY stylesheet: consumers load a reset of
    // their own (the example app imports @unocss/reset/tailwind-compat.css).
    // Shipping wind4's preflights here emits a top-level unlayered
    // `* { margin: 0; ... }` that overrides every layered utility in the
    // CONSUMER's uno.css (unlayered rules always beat @layer rules) —
    // space-y-*, my-* and friends silently collapse to zero app-wide.
    // preflights: reset/property stay OFF (top-level `* { margin: 0 }` would
    // override every layered utility in the CONSUMER's uno.css — unlayered
    // rules always beat @layer rules). `theme` stays ON: it emits the CSS
    // variable DEFINITIONS our compiled rules reference (bg-black/85 uses
    // var(--colors-black)) in @layer theme — variable definitions only, no
    // element rules, so it cannot fight the consumer's stylesheet.
    presetWind4({ preflights: { reset: false, property: false, theme: true } }),
    presetIcons({
      prefix: 'i-',
      collections: {
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
      }
    }),
    presetUpthrust(),
  ],
});
