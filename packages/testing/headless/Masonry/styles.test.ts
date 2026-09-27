import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import { masonryItemVariants, masonryVariants } from '../../../components/lib/Masonry/styles'

const generator = createGenerator({ presets: [presetWind4(), presetUpthrust()] })
const stylesSource = readFileSync(resolve(import.meta.dirname, '../../../components/lib/Masonry/styles.ts'), 'utf8')
const markers = new Set(['upthrust-masonry', 'upthrust-masonry-item'])

/** 生成单个类名的 CSS，并去掉空白方便断言声明。 */
const cssOf = async (className: string) => {
  const { css, matched } = await (await generator).generate(className, { preflights: false })
  expect(matched.has(className), `${className} 未生成 CSS`).toBe(true)
  return css.replace(/\s+/g, '')
}

const split = (value: string) => value.split(' ').filter(Boolean)

/** 所有变体组合展开后的完整类名集合（标记类除外）。 */
const allClasses = [...new Set([
  ...(['grid', 'absolute'] as const).flatMap(mode => split(masonryVariants({ mode }))),
  ...(['static', 'placed', 'pending'] as const).flatMap(state => split(masonryItemVariants({ state }))),
])].filter(name => !markers.has(name))

describe('Masonry 样式生成', () => {
  // 根节点与单项都带标记类。
  it('[masonry.style.markers] root and items carry marker classes', () => {
    expect(split(masonryVariants())).toContain('upthrust-masonry')
    expect(split(masonryItemVariants())).toContain('upthrust-masonry-item')
  })

  // 所有非标记类都能被 UnoCSS 生成。
  it.each(allClasses)('[masonry.style.generated] %s generates CSS', async (className) => {
    await cssOf(className)
  })

  // 两种模式：测量前为等宽网格（顶部对齐），测量后为相对定位容器。
  it('[masonry.style.mode] grid fallback before measuring, relative container after', () => {
    expect(split(masonryVariants({ mode: 'grid' }))).toEqual(expect.arrayContaining(['grid', 'items-start']))
    const absolute = split(masonryVariants({ mode: 'absolute' }))
    expect(absolute).toContain('relative')
    expect(absolute).not.toContain('grid')
  })

  // 单项状态：static 交给网格；placed 绝对定位并过渡 left/top/opacity；pending 绝对定位、透明且无过渡。
  it('[masonry.style.state] maps static / placed / pending', async () => {
    expect(split(masonryItemVariants({ state: 'static' }))).toContain('min-w-0')
    const placed = split(masonryItemVariants({ state: 'placed' }))
    expect(placed).toEqual(expect.arrayContaining(['absolute', 'motion-reduce:transition-none']))
    const transition = placed.find(name => name.startsWith('[transition:'))!
    const css = await cssOf(transition)
    for (const property of ['left', 'top', 'opacity']) {
      expect(css).toContain(`${property}0.3scubic-bezier(0.215,0.61,0.355,1)`)
    }
    // 不能是 transition-property:all，否则 width 变化也会被过渡。
    expect(css).not.toContain('all')
    const pending = split(masonryItemVariants({ state: 'pending' }))
    expect(pending).toEqual(expect.arrayContaining(['absolute', 'opacity-0']))
    expect(pending.some(name => name.includes('transition'))).toBe(false)
  })

  // 源码约定：首行 @unocss-include，且不使用 compoundVariants。
  it('[masonry.style.source] follows the UnoCSS scanning conventions', () => {
    expect(stylesSource.startsWith('// @unocss-include')).toBe(true)
    expect(stylesSource).not.toContain('compoundVariants')
  })
})
