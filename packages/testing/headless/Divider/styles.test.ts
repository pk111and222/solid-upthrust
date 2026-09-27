import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import { dividerContentVariants, dividerRailVariants, dividerVariants } from '../../../components/lib/Divider/styles'

const generator = createGenerator({ presets: [presetWind4(), presetUpthrust()] })
const stylesSource = readFileSync(resolve(import.meta.dirname, '../../../components/lib/Divider/styles.ts'), 'utf8')

/** 生成单个类名的 CSS，并去掉空白方便断言声明。 */
const cssOf = async (className: string) => {
  const { css, matched } = await (await generator).generate(className, { preflights: false })
  expect(matched.has(className), `${className} 未生成 CSS`).toBe(true)
  return css.replace(/\s+/g, '')
}
const split = (value: string) => value.split(' ')

describe('Divider 样式生成', () => {
  // 三种布局：无标题水平线画顶边；带标题时自身不画线；垂直线画左边、行内 0.9em 高。
  it('[divider.style.layout] each layout emits its own classes', () => {
    expect(split(dividerVariants({ layout: 'horizontal', variant: 'solid', spacing: 'large' }))).toEqual([
      'border-0', 'border-outline-variant/40', 'flex', 'w-full', 'min-w-full', 'border-t', 'border-solid', 'my-lg',
    ])
    const titled = split(dividerVariants({ layout: 'titled', variant: 'solid', spacing: 'middle' }))
    expect(titled).not.toContain('border-t')
    expect(titled).toEqual(expect.arrayContaining(['items-center', 'whitespace-nowrap', 'text-on-surface', 'my-md']))
    const vertical = split(dividerVariants({ layout: 'vertical', variant: 'dashed', spacing: 'none' }))
    expect(vertical).toEqual(expect.arrayContaining(['inline-block', 'h-[0.9em]', 'border-l', 'mx-xs', 'border-dashed']))
    expect(vertical.some(name => name.startsWith('my-'))).toBe(false)
  })

  // 线宽来自 border-0 + border-t/border-l：先清零四边再单独打开一边，保证只有 1px 单边。
  it('[divider.style.border] border-0 resets then one side is re-enabled', async () => {
    expect(await cssOf('border-0')).toContain('border-width:0')
    expect(await cssOf('border-t')).toContain('border-top-width:1px;')
    expect(await cssOf('border-l')).toContain('border-left-width:1px;')
    // 同时生成时 border-0 必须排在单边宽度之前，否则单边会被清零。
    const { css } = await (await generator).generate('border-t border-l border-0', { preflights: false })
    const compact = css.replace(/\s+/g, '')
    expect(compact.indexOf('border-width:0')).toBeLessThan(compact.indexOf('border-top-width:1px'))
    expect(compact.indexOf('border-width:0')).toBeLessThan(compact.indexOf('border-left-width:1px'))
  })

  // 线色：outline-variant 以 40% 透明度混合，走主题变量而不是写死颜色。
  it('[divider.style.color] line color uses the outline-variant token at 40%', async () => {
    const css = await cssOf('border-outline-variant/40')
    expect(css).toContain('--upthrust-colors-outline-variant')
    expect(css).toMatch(/40%|0\.4/)
  })

  // rail 不写死颜色而是继承 root 的 border-color（antd 的 border-block-start-color: inherit）。
  it('[divider.style.railColor] rail color inherits from root', async () => {
    for (const extent of ['fill', 'short', 'none'] as const) {
      const rail = split(dividerRailVariants({ variant: 'solid', extent }))
      expect(rail).toContain('border-[inherit]')
      expect(rail.some(name => name.startsWith('border-outline'))).toBe(false)
    }
    expect(await cssOf('border-[inherit]')).toContain('border-color:inherit;')
  })

  // 三种线型分别生成 border-style。
  it.each([['solid', 'solid'], ['dashed', 'dashed'], ['dotted', 'dotted']] as const)(
    '[divider.style.variant] %s → border-style:%s',
    async (variant, value) => {
      const [className] = split(dividerVariants({ layout: 'horizontal', variant, spacing: 'none' })).filter(name => name.startsWith('border-') && !name.includes('outline') && name !== 'border-0' && name !== 'border-t')
      expect(await cssOf(className)).toContain(`border-style:${value};`)
      const [railClass] = split(dividerRailVariants({ variant, extent: 'fill' })).filter(name => name === `border-${value}`)
      expect(railClass).toBe(`border-${value}`)
    },
  )

  // 间距档位：small=8px、middle=16px、large=24px，均为上下外边距。
  it.each([['small', 'my-xs', 'xs'], ['middle', 'my-md', 'md'], ['large', 'my-lg', 'lg']] as const)(
    '[divider.style.spacing] %s → %s',
    async (spacing, className, token) => {
      expect(split(dividerVariants({ layout: 'horizontal', variant: 'solid', spacing }))).toContain(className)
      const css = await cssOf(className)
      expect(css).toContain(`margin-block:var(--spacing-${token});`)
    },
  )

  // 垂直线的尺寸与对齐：0.9em 高、上移 0.06em、左右 8px。
  it.each([
    ['h-[0.9em]', 'height:0.9em;'], ['top-[-0.06em]', 'top:-0.06em;'], ['mx-xs', 'margin-inline:var(--spacing-xs);'],
    ['align-middle', 'vertical-align:middle;'], ['inline-block', 'display:inline-block;'],
  ])('[divider.style.verticalCss] %s → %s', async (className, declaration) => {
    expect(await cssOf(className)).toContain(declaration)
  })

  // rail：fill 占满剩余，short 为靠边时 5% 的短线，none 为 orientationMargin 时收为 0 宽。
  it.each([
    ['fill', ['flex-1'], [['flex-1', 'flex:1']]],
    ['short', ['flex-none', 'w-[5%]'], [['w-[5%]', 'width:5%;']]],
    ['none', ['flex-none', 'w-0'], [['w-0', 'width:calc(var(--spacing)*0);']]],
  ] as const)('[divider.style.rail] %s extent', async (extent, classes, declarations) => {
    expect(split(dividerRailVariants({ variant: 'solid', extent }))).toEqual(expect.arrayContaining([...classes, 'border-t', 'border-0']))
    for (const [className, declaration] of declarations) expect(await cssOf(className)).toContain(declaration)
  })

  // 标题：默认 medium 字重 + body-lg 字号；plain 为常规字重 + body 字号；两者都保留 text-on-surface 颜色。
  it('[divider.style.content] plain switches weight and size, color stays', async () => {
    const heading = split(dividerContentVariants({ plain: false }))
    const plain = split(dividerContentVariants({ plain: true }))
    expect(heading).toEqual(['inline-block', 'px-[1em]', 'text-on-surface', 'font-medium', 'text-body-lg'])
    expect(plain).toEqual(['inline-block', 'px-[1em]', 'text-on-surface', 'font-normal', 'text-body'])
    expect(await cssOf('font-medium')).toContain('font-weight:')
    expect(await cssOf('text-body')).toContain('font-size:')
    expect(await cssOf('text-body-lg')).toContain('font-size:')
    expect(await cssOf('px-[1em]')).toContain('padding-inline:1em;')
  })

  // UnoCSS 静态扫描 styles.ts 源文件，能提取三个 cva 里的全部类名。
  it('[divider.style.extract] static scan of styles.ts extracts every class', async () => {
    const { matched } = await (await generator).generate(stylesSource, { preflights: false })
    const expected = new Set<string>()
    for (const layout of ['horizontal', 'titled', 'vertical'] as const)
      for (const variant of ['solid', 'dashed', 'dotted'] as const)
        for (const spacing of ['none', 'small', 'middle', 'large'] as const)
          split(dividerVariants({ layout, variant, spacing })).forEach(name => expected.add(name))
    for (const extent of ['fill', 'short', 'none'] as const) split(dividerRailVariants({ variant: 'dotted', extent })).forEach(name => expected.add(name))
    for (const plain of [true, false]) split(dividerContentVariants({ plain })).forEach(name => expected.add(name))
    expect([...expected].filter(name => !matched.has(name))).toEqual([])
  })
})
