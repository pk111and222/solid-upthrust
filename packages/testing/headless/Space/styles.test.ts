import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import {
  SPACE_ADDON_CLASS, SPACE_ITEM_CLASS, SPACE_SEPARATOR_CLASS, compactVariants, isPresetSize, spaceVariants,
} from '../../../components/lib/Space/styles'

const generator = createGenerator({ presets: [presetWind4(), presetUpthrust()] })
const stylesSource = readFileSync(resolve(import.meta.dirname, '../../../components/lib/Space/styles.ts'), 'utf8')

/** 生成单个类名的 CSS，并去掉空白方便断言声明。 */
const cssOf = async (className: string) => {
  const { css, matched } = await (await generator).generate(className, { preflights: false })
  expect(matched.has(className), `${className} 未生成 CSS`).toBe(true)
  return css.replace(/\s+/g, '')
}
const spaceClasses = (options: Parameters<typeof spaceVariants>[0]) => spaceVariants(options).split(' ')
const base = { block: false, vertical: false, wrap: false }

describe('Space 样式生成', () => {
  // 默认只输出 inline-flex 与方向类；block/vertical/wrap 分别切换 display、方向与换行。
  it('[space.style.layout] block, vertical and wrap toggle their classes', () => {
    expect(spaceClasses(base)).toEqual(['inline-flex', 'flex-row'])
    expect(spaceClasses({ block: true, vertical: true, wrap: true })).toEqual(['flex', 'w-full', 'flex-col', 'flex-wrap'])
  })

  // 布局类都生成预期声明。
  it.each([
    ['inline-flex', 'display:inline-flex;'], ['flex', 'display:flex;'], ['w-full', 'width:100%;'],
    ['flex-row', 'flex-direction:row;'], ['flex-col', 'flex-direction:column;'], ['flex-wrap', 'flex-wrap:wrap;'],
  ])('[space.style.layoutCss] %s → %s', async (className, declaration) => {
    expect(await cssOf(className)).toContain(declaration)
  })

  // align 的四个取值映射到 align-items。
  it.each([
    ['start', 'flex-start'], ['center', 'center'], ['end', 'flex-end'], ['baseline', 'baseline'],
  ] as const)('[space.style.align] %s → align-items:%s', async (align, value) => {
    const [className] = spaceClasses({ ...base, align }).filter(name => name.startsWith('items-'))
    expect(await cssOf(className)).toContain(`align-items:${value};`)
  })

  // 预设档位引用主题 spacing：small=xs(8px)、middle/medium=md(16px)、large=lg(24px)，单值、水平、垂直三组一致。
  it.each([
    ['small', 'xs', '8px'], ['middle', 'md', '16px'], ['medium', 'md', '16px'], ['large', 'lg', '24px'],
  ] as const)('[space.style.gap] %s → var(--spacing-%s) = %s', async (size, token, px) => {
    const [gap] = spaceClasses({ ...base, gap: size }).filter(name => name.startsWith('gap-'))
    const [gapX] = spaceClasses({ ...base, gapX: size }).filter(name => name.startsWith('gap-x-'))
    const [gapY] = spaceClasses({ ...base, gapY: size }).filter(name => name.startsWith('gap-y-'))
    expect(await cssOf(gap)).toContain(`gap:var(--spacing-${token});`)
    expect(await cssOf(gapX)).toContain(`column-gap:var(--spacing-${token});`)
    expect(await cssOf(gapY)).toContain(`row-gap:var(--spacing-${token});`)
    const { css: themeCss } = await (await generator).generate(gap, { preflights: true })
    expect(themeCss.replace(/\s+/g, '')).toContain(`--spacing-${token}:${px};`)
  })

  // 只认四个预设档位的自有值；原型链键、大小写变体、数字和空值都当作自定义尺寸。
  it('[space.style.size.guard] recognises only preset keys', () => {
    for (const size of ['small', 'middle', 'medium', 'large']) expect(isPresetSize(size)).toBe(true)
    for (const size of ['constructor', 'toString', '__proto__', 'Small', '16px', 16, 0, undefined, null]) expect(isPresetSize(size)).toBe(false)
  })

  // 子项包裹层渲染为空时隐藏（不占间距），分隔符不参与伸缩。
  it('[space.style.item] item hides when empty and separator does not flex', async () => {
    expect(SPACE_ITEM_CLASS.split(' ')).toContain('empty:hidden')
    const empty = await cssOf('empty:hidden')
    expect(empty).toContain(':empty')
    expect(empty).toContain('display:none;')
    expect(SPACE_SEPARATOR_CLASS.split(' ')).toContain('flex-none')
    expect(await cssOf('flex-none')).toContain('flex:none;')
  })
})

describe('Space.Compact 样式生成', () => {
  const compact = (vertical: boolean) => compactVariants({ block: false, vertical }).split(' ')

  // 水平紧凑：首项去右圆角、末项去左圆角、中间项全去圆角，并以 !important 压过子元素自身圆角；相邻项左移 1px 合并边框。
  it('[space.style.compact.horizontal] strips inner corners and overlaps borders', async () => {
    const classes = compact(false)
    const first = await cssOf('[&>*:first-child:not(:last-child)]:!rounded-r-none')
    expect(first).toMatch(/>\*:first-child:not\(:last-child\)\{/)
    expect(first).toMatch(/border-top-right-radius:(0(px)?|var\(--radius-none\))!important;/)
    expect(first).toMatch(/border-bottom-right-radius:(0(px)?|var\(--radius-none\))!important;/)
    const last = await cssOf('[&>*:last-child:not(:first-child)]:!rounded-l-none')
    expect(last).toMatch(/border-top-left-radius:(0(px)?|var\(--radius-none\))!important;/)
    const middle = await cssOf('[&>*:not(:first-child):not(:last-child)]:!rounded-none')
    expect(middle).toMatch(/border-radius:(0(px)?|var\(--radius-none\))!important;/)
    const overlap = await cssOf('[&>*:not(:first-child)]:-ml-px')
    expect(overlap).toContain('margin-left:-1px;')
    expect(classes).toEqual(expect.arrayContaining(['inline-flex', 'flex-row']))
    // wind4 把 none 写成 var(--radius-none)，主题预检必须把它定义为 0。
    const { css } = await (await generator).generate('!rounded-none', { preflights: true })
    expect(css.replace(/\s+/g, '')).toContain('--radius-none:0;')
  })

  // 垂直紧凑：改为去上下圆角，相邻项上移 1px。
  it('[space.style.compact.vertical] vertical compact strips top/bottom corners', async () => {
    expect(compact(true)).toEqual(expect.arrayContaining(['flex-col', '[&>*:not(:first-child)]:-mt-px']))
    expect(await cssOf('[&>*:first-child:not(:last-child)]:!rounded-b-none')).toMatch(/border-bottom-left-radius:(0(px)?|var\(--radius-none\))!important;/)
    expect(await cssOf('[&>*:last-child:not(:first-child)]:!rounded-t-none')).toMatch(/border-top-left-radius:(0(px)?|var\(--radius-none\))!important;/)
    expect(await cssOf('[&>*:not(:first-child)]:-mt-px')).toContain('margin-top:-1px;')
  })

  // 悬停/聚焦的子元素提升层级，高亮边框不被后一个邻居的重叠边盖住。
  it.each(['[&>*:hover]:z-1', '[&>*:focus-within]:z-1', '[&>*:focus]:z-1'])('[space.style.compact.zIndex] %s raises z-index', async (className) => {
    const css = await cssOf(className)
    expect(css).toContain('z-index:1;')
    expect(css).toMatch(/>\*:(hover|focus-within|focus)\{/)
  })

  // Addon 的类都能生成：带边框、浅填充底色、正文字号且不换行。
  it('[space.style.addon] addon classes all generate', async () => {
    const { matched } = await (await generator).generate(SPACE_ADDON_CLASS.join(' '), { preflights: false })
    expect(SPACE_ADDON_CLASS.filter(name => !matched.has(name))).toEqual([])
  })

  // UnoCSS 静态扫描 styles.ts 源文件，能提取 Space / Compact / Addon 的全部类名。
  it('[space.style.extract] static scan of styles.ts extracts every class', async () => {
    const { matched } = await (await generator).generate(stylesSource, { preflights: false })
    const expected = [
      ...compact(false), ...compact(true),
      ...compactVariants({ block: true, vertical: false }).split(' '),
      ...SPACE_ADDON_CLASS, ...SPACE_ITEM_CLASS.split(' ').filter(name => name !== 'space-item'),
      'flex-none', 'gap-xs', 'gap-md', 'gap-lg', 'gap-x-xs', 'gap-x-md', 'gap-x-lg', 'gap-y-xs', 'gap-y-md', 'gap-y-lg',
      'items-start', 'items-center', 'items-end', 'items-baseline', 'flex-wrap', 'w-full',
    ]
    expect(expected.filter(name => !matched.has(name))).toEqual([])
  })
})
