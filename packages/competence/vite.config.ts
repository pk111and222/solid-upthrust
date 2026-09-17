import { resolve } from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';

// import devtools from 'solid-devtools/vite';

const packageRoot = import.meta.dirname

export default defineConfig(({ command, mode }) => {
  const isPreserve = mode === 'preserve'

  if (isPreserve) {
    return {
      build: {
        target: 'esnext',
        outDir: 'dist/es',
        minify: false,
        sourcemap: true,
        emptyOutDir: true,
        lib: {
          entry: resolve(packageRoot, 'src/index.ts'),
          formats: ['es'],
        },
        rollupOptions: {
          // dayjs AND its plugin subpaths must stay external — a bare string
          // only matches the exact specifier, and `dayjs/plugin/weekday`
          // would otherwise be bundled into dist (with a
          // node_modules/.pnpm/... relative path no consumer can resolve).
          external: [
            "solid-js", "solid-js/web", "@solidjs/web", "@solidjs/signals", "lodash",
            /^dayjs(\/|$)/,
            /^async-validator(\/|$)/,
          ],
          output: {
            format: 'es',
            preserveModules: true,
            preserveModulesRoot: 'src',
            entryFileNames: '[name].js',
          },
        },
      },
      plugins: [
        solidPlugin(),
      ],
    }
  }

  return {
    build: {
      watch: mode === 'watch' ? {} : null,
      target: 'esnext',
      outDir: "dist",
      minify: mode === 'watch' ? false : true,
      sourcemap: true,
      rollupOptions: {
        external: ["solid-js", "solid-js/web", "@solidjs/web", "@solidjs/signals", "dayjs", /^async-validator(\/|$)/],
        output: {
          globals: {
            "solid-js": "Solid",
          },
        },
      },
      lib: {
        entry: resolve(packageRoot, 'src/index.ts'),
        name: "upthrust-competence",
        fileName: "upthrust-competence",
        formats: ["es", "umd", "cjs"],
      },
    },
    plugins: [
      solidPlugin(),
      dts({
        tsconfigPath: resolve(packageRoot, 'tsconfig.json'),
        entryRoot: resolve(packageRoot, 'src'),
        outDirs: [resolve(packageRoot, 'types')],
      })
    ]
  }
});
