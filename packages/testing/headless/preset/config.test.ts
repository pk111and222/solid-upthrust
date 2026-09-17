import { describe, expect, it } from 'vitest'
import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { presetUpthrust } from '../../../preset/src/index'
describe('custom preset theme', () => {
  it('emits overridden color variables rather than just changing configuration metadata', async () => {
    const generator = await createGenerator({ presets: [presetWind4(), presetUpthrust({ theme: { colors: { primary: '#123456' } } })] })
    const { css } = await generator.generate('text-primary bg-primary')
    expect(css).toContain('--upthrust-colors-primary:18 52 86')
    expect(css).toContain('var(--upthrust-colors-primary)')
  })

  it('merges external UnoCSS tokens without dropping built-in tokens', () => {
    const preset = presetUpthrust({ theme: { colors: { brand: '#123456' }, radius: { card: '12px' }, spacing: { custom: '18px' } } })
    expect(preset.theme?.colors?.brand).toBe('#123456'); expect(preset.theme?.colors?.primary).toBeDefined()
    expect(preset.theme?.radius?.card).toBe('12px'); expect(preset.theme?.radius?.sm).toBeDefined()
    expect(preset.theme?.spacing?.custom).toBe('18px')
  })
  it('reads custom default palette colors from the theme colors branch', () => {
    const preset = presetUpthrust({ defaultTheme: 'brand', switchedTheme: { selectors: { brand: '.brand' }, prefix: '--upthrust', theme: { brand: { colors: { primary: '#123456' } } } } })
    expect(preset.theme?.colors?.primary).toBe('#123456')
  })
})
