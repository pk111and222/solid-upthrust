import { defineConfig } from '@unocss/vite';
import { presetWind } from '@unocss/preset-wind';
// import transformerCompileClass from '@unocss/transformer-compile-class';

export default defineConfig({
  
  presets: [
    presetWind(),
  ],
  // transformers: [
  //   transformerCompileClass(),
  // ],
});
