import { resolve } from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';

// import devtools from 'solid-devtools/vite';
import UnocssPlugin from '@unocss/vite';

export default defineConfig(({ command, mode }) => ({
  build: {
    watch: mode === 'watch' ? {} : null,
    target: 'esnext',
    //打包后文件目录
    outDir: "dist",
    //压缩
    minify: mode === 'watch' ? false : true,
    sourcemap: true,
    rollupOptions: {
      //忽略打包vue文件
      external: ["solid"],
      output: {
        globals: {
          solid: "Solid",
        },
      },
    },
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: "upthrust",
      fileName: "upthrust",
      formats: ["es", "umd", "cjs"],
    },
  },
  plugins: [
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    solidPlugin(),
    dts({
      entryRoot: resolve(__dirname, 'lib'),
      outDir: resolve(__dirname, 'types'),
      // rollupTypes: true
      // copyDtsFiles: true
    }),
    UnocssPlugin({
      // your config or in uno.config.ts
    })
  ]
}));
