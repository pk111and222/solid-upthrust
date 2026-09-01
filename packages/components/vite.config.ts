import { resolve } from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';

// import devtools from 'solid-devtools/vite';
import UnocssPlugin from '@unocss/vite';

const packageRoot = import.meta.dirname

export default defineConfig(({ command, mode }) => {
  const isPreserve = mode === 'preserve'

  if (isPreserve) {
    // Unbundled ES modules — preserves directory structure for tree-shaking
    return {
      resolve: {
        alias: {
          'lib': resolve(packageRoot, 'lib'),
          'utils': resolve(packageRoot, 'utils'),
        }
      },
      build: {
        target: 'esnext',
        outDir: 'dist/es',
        minify: false,
        sourcemap: true,
        emptyOutDir: true,
        lib: {
          entry: resolve(packageRoot, 'lib/index.ts'),
          formats: ['es'],
        },
        rollupOptions: {
          // dayjs AND its plugin subpaths must stay external — a bare string
          // only matches the exact specifier, so `dayjs/plugin/localeData`
          // would be inlined into dist with a node_modules/.pnpm relative
          // import no consumer can resolve (same fix as competence).
          external: ["solid-js", "solid-js/web", "@solidjs/web", "@solidjs/signals", "upthrust-competence", "class-variance-authority", "tailwind-merge", "clsx", "lodash", "qrcode-generator", /^dayjs(\/|$)/, /^virtual:/, /\buno\.css$/],
          output: {
            format: 'es',
            preserveModules: true,
            preserveModulesRoot: 'lib',
            entryFileNames: '[name].js',
          },
        },
      },
      plugins: [
        solidPlugin(),
        UnocssPlugin(),
      ],
    }
  }

  // Default: bundled outputs (es + umd + cjs)
  return {
    resolve: {
      alias: {
        'lib': resolve(packageRoot, 'lib'),
        'utils': resolve(packageRoot, 'utils'),
      }
    },
    build: {
      watch: mode === 'watch' ? {} : null,
      target: 'esnext',
      outDir: "dist",
      minify: mode === 'watch' ? false : true,
      sourcemap: true,
      rollupOptions: {
        external: ["solid-js", "solid-js/web", "@solidjs/web", "@solidjs/signals", "upthrust-competence", "dayjs"],
        output: {
          globals: {
            "solid-js": "Solid",
            "solid-js/web": "SolidWeb",
            "@solidjs/web": "SolidWeb",
            "@solidjs/signals": "SolidSignals",
          },
        },
      },
      lib: {
        entry: resolve(packageRoot, 'lib/index.ts'),
        name: "upthrust",
        fileName: "upthrust",
        formats: ["es", "umd", "cjs"],
      },
    },
    plugins: [
      solidPlugin(),
      dts({
        tsconfigPath: resolve(packageRoot, 'tsconfig.json'),
        entryRoot: resolve(packageRoot, 'lib'),
        outDirs: [resolve(packageRoot, 'types')],
      }),
      UnocssPlugin(),
    ]
  }
});
