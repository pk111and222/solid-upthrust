import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'

const packageRoot = import.meta.dirname
const unitPatterns = [
  'headless/**/*.{test,spec}.{ts,tsx}',
  'smoke/**/*.{test,spec}.{ts,tsx}',
  'render/**/*.{test,spec}.{ts,tsx}',
]

/** One configuration for the package, root entry and legacy package commands. */
export function createTestingConfig(include: string[] = unitPatterns) {
  return defineConfig({
    root: packageRoot,
    plugins: [solid()],
    resolve: {
      alias: {
        'solid-js/web': '@solidjs/web',
        'upthrust-competence': resolve(packageRoot, '../competence/src/index.ts'),
      },
      // Keep client-side Solid reactivity active in the simulated DOM.
      conditions: ['browser', 'development', 'import'],
    },
    ssr: {
      resolve: {
        conditions: ['browser', 'development', 'import'],
      },
    },
    test: {
      environment: 'happy-dom',
      // Browser/E2E tests deliberately belong to a separate future runner.
      include,
      server: {
        deps: {
          inline: ['solid-js', 'solid-material-color'],
        },
      },
    },
  })
}

export default createTestingConfig()
