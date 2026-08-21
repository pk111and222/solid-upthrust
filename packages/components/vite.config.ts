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
          external: ["solid-js", "solid-js/web", "@solidjs/web", "@solidjs/signals", "upthrust-competence", "class-variance-authority", "tailwind-merge", "clsx", "lodash", /^virtual:/, /\buno\.css$/],
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
        external: ["solid-js", "solid-js/web", "@solidjs/web", "@solidjs/signals"],
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
