// Compatibility for running Vitest directly from the components package.
import { createTestingConfig } from '../testing/vitest.config'

export default createTestingConfig(['render/**/*.{test,spec}.{ts,tsx}'])
