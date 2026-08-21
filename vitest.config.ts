import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Resolve solid-js to the browser dev build so client-side reactivity
    // (createEffect etc.) actually runs in tests instead of the server no-op.
    conditions: ['browser', 'development', 'import'],
  },
  ssr: {
    resolve: {
      conditions: ['browser', 'development', 'import'],
    },
  },
  test: {
    environment: 'happy-dom',
    server: {
      deps: {
        inline: ['solid-js'],
      },
    },
  },
})
