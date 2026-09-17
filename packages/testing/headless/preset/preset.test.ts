import { describe, expect, it } from 'vitest'
import { createGenerator } from '@unocss/core'
import { generateSizeLevels } from '../../../preset/src/theme/gap'
import { camelToHyphen } from '../../../preset/src/utils/convert'
import { createRules } from '../../../preset/src/rules'
import { createSizeTokens } from '../../../preset/src/theme/size'
import { createStyleTokens } from '../../../preset/src/theme/style'

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


describe('arbitrary-value transition interceptor', () => {
  const generate = async (classes: string) => {
    const uno = await createGenerator({
      rules: createRules(createSizeTokens(), createStyleTokens()),
    } as any)
    const { css } = await uno.generate(classes)
    return css
  }

  it('generates a correct rule when the list names translate/scale (wind4 would emit nothing)', async () => {
    const css = await generate('transition-[opacity,transform,translate,scale]')
    expect(css).toContain('transition-property:opacity, transform, translate, scale')
  })

  it('keeps single individual-transform lists working', async () => {
    const css = await generate('transition-[scale]')
    expect(css).toContain('transition-property:scale')
  })

  it('ignores lists without individual transforms so wind4 handles them natively', async () => {
    const css = await generate('transition-[margin]')
    // our interceptor defers: the rule body must NOT come from us (no comma-joined
    // list signature); wind4 in this bare-rules generator also won't fire, so the
    // class produces nothing here either way — the important part is no bad output.
    expect(css).not.toContain('transition-property:margin')
  })

  it('rejects lists with unknown properties (falls back to wind4 behaviour)', async () => {
    const css = await generate('transition-[opacity,nonsense-prop]')
    expect(css).not.toContain('nonsense-prop')
  })

  it('supports rotate in the list', async () => {
    const css = await generate('transition-[transform,rotate]')
    expect(css).toContain('transition-property:transform, rotate')
  })

  it('overlay shorthands emit the full motion property sets', async () => {
    const css = await generate('transition-overlay transition-overlay-stack')
    expect(css).toContain('transition-property:opacity, transform, translate, scale')
    expect(css).toContain('transition-property:opacity, transform, translate, scale, margin, max-height, padding')
  })
})
