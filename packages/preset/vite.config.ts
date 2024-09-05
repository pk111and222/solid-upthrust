import { resolve } from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';

// import devtools from 'solid-devtools/vite';

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
      external: ["unocss"],
      output: {
        globals: {
          unocss: "unocss",
        },
      },
    },
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: "upthrust-ui-preset",
      fileName: "upthrust-ui-preset",
      formats: ["es", "umd", "cjs"],
    },
  },
  plugins: [
    dts({
      entryRoot: resolve(__dirname, 'src'),
      outDir: resolve(__dirname, 'types'),
      // rollupTypes: true
      // copyDtsFiles: true
    })
  ]
}));
