import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import source from '../../../components/lib/Dropdown/styles.ts?raw'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'

// 直接扫描 styles.ts 原文，确保视觉状态与十二种动画原点不是只能运行时拼出类名。
it('[dropdown.style.scanning] generates theme, state and placement CSS from source', async () => {
  expect(source.startsWith('// @unocss-include')).toBe(true)
  const uno = await createGenerator({ mergeSelectors: false, presets: [presetWind4(), presetUpthrust()] })
  const { css, matched } = await uno.generate(source)
  for (const token of ['bg-surface', 'rounded-lg', 'shadow', 'text-error', 'opacity-40', 'border-t', 'pointer-events-none', 'origin-top-left', 'origin-top-right', 'origin-bottom-left', 'origin-bottom-right', 'origin-left', 'origin-right', 'transition-overlay']) {
    expect(matched.has(token), token).toBe(true)
  }
  expect(css).toContain('var(--upthrust-colors-surface)')
  expect(css).toContain('var(--upthrust-colors-error)')
  expect(css).toMatch(/transition-property:opacity,\s*transform,\s*translate,\s*scale/)
  expect(css).not.toMatch(/\.transition-overlay\s*\{[^}]*transition-property:all/)
})
