import { resolve } from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';

// import devtools from 'solid-devtools/vite';

const packageRoot = import.meta.dirname

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
        exports: 'named',
      },
    },
    lib: {
      entry: resolve(packageRoot, 'src/index.ts'),
      name: "upthrust-ui-preset",
      fileName: "upthrust-ui-preset",
      formats: ["es", "umd", "cjs"],
    },
  },
  plugins: [
    dts({
      tsconfigPath: resolve(packageRoot, 'tsconfig.json'),
      entryRoot: resolve(packageRoot, 'src'),
      outDirs: resolve(packageRoot, 'types'),
      // rollupTypes: true
      // copyDtsFiles: true
    })
  ]
}));
