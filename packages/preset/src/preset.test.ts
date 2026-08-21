import { describe, expect, it } from 'vitest'
import { createGenerator } from '@unocss/core'
import { generateSizeLevels } from './theme/gap'
import { camelToHyphen } from './utils/convert'
import { createRules } from './rules'
import { createSizeTokens } from './theme/size'
import { createStyleTokens } from './theme/style'

describe('preset utilities', () => {
  it('keeps the unit when generating spacing levels', () => {
    expect(Object.values(generateSizeLevels('16px')).every((value) => value.endsWith('px'))).toBe(true)
    expect(Object.values(generateSizeLevels('1rem')).every((value) => value.endsWith('rem'))).toBe(true)
  })

  it('converts camel case utility names', () => {
    expect(camelToHyphen('backgroundColor')).toBe('background-color')
  })
})

describe('createRules token wiring', () => {
  const generate = async (rules: ReturnType<typeof createRules>, classes: string) => {
    const uno = await createGenerator({ rules } as any)
    const { css } = await uno.generate(classes)
    return css
  }

  it('emits default token values for control heights and motion', async () => {
    const css = await generate(
      createRules(createSizeTokens(), createStyleTokens()),
      'h-control h-control-sm h-control-lg transition-upthrust duration-mid ease-upthrust',
    )
    expect(css).toContain('height:32px')
    expect(css).toContain('height:24px')
    expect(css).toContain('height:40px')
    expect(css).toContain('0.2s')
    expect(css).toContain('cubic-bezier(0.645, 0.045, 0.355, 1)')
  })

  it('respects sizeTokens / styleTokens overrides', async () => {
    const css = await generate(
      createRules(
        createSizeTokens({ controlHeight: '48px' }),
        createStyleTokens({ motionDurationMid: '0.4s', motionEaseInOut: 'linear' }),
      ),
      'h-control transition-upthrust duration-mid ease-upthrust',
    )
    expect(css).toContain('48px')
    expect(css).toContain('0.4s')
    expect(css).toContain('linear')
    expect(css).not.toContain('height:32px')
    expect(css).not.toContain('0.2s')
  })
})

