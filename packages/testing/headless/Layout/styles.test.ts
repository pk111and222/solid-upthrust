import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import {
  CONTENT_CLASS, FOOTER_CLASS, HEADER_CLASS, LAYOUT_MARKER, SIDER_BODY_CLASS,
  layoutVariants, siderTriggerVariants, siderVariants, siderZeroTriggerVariants,
} from '../../../components/lib/Layout/styles'

const generator = createGenerator({ presets: [presetWind4(), presetUpthrust()] })
const stylesSource = readFileSync(resolve(import.meta.dirname, '../../../components/lib/Layout/styles.ts'), 'utf8')
const markers = new Set<string>(Object.values(LAYOUT_MARKER))

/** 生成单个类名的 CSS，并去掉空白方便断言声明。 */
const cssOf = async (className: string) => {
  const { css, matched } = await (await generator).generate(className, { preflights: false })
  expect(matched.has(className), `${className} 未生成 CSS`).toBe(true)
  return css.replace(/\s+/g, '')
}

const split = (value: string) => value.split(' ').filter(Boolean)

/** 所有变体组合展开后的完整类名集合（标记类除外）。 */
const allClasses = [...new Set([
  ...split(layoutVariants({ hasSider: true })), ...split(layoutVariants({ hasSider: false })),
  ...HEADER_CLASS, ...FOOTER_CLASS, ...CONTENT_CLASS, ...SIDER_BODY_CLASS,
  ...split(siderVariants({ theme: 'dark' })), ...split(siderVariants({ theme: 'light' })),
  ...split(siderTriggerVariants({ theme: 'dark' })), ...split(siderTriggerVariants({ theme: 'light' })),
  ...(['end-dark', 'start-dark', 'end-light', 'start-light'] as const)
    .flatMap(scheme => split(siderZeroTriggerVariants({ scheme }))),
])].filter(name => !markers.has(name))

describe('Layout 样式生成', () => {
  // 每个区域的根类都带标记类，供 has-sider 子选择器与消费方定位。
  it('[layout.style.markers] every region carries its marker class', () => {
    expect(split(layoutVariants({ hasSider: false }))).toContain('upthrust-layout')
    expect(HEADER_CLASS).toContain('upthrust-layout-header')
    expect(FOOTER_CLASS).toContain('upthrust-layout-footer')
    expect(CONTENT_CLASS).toContain('upthrust-layout-content')
    expect(split(siderVariants({ theme: 'dark' }))).toContain('upthrust-layout-sider')
  })

  // 所有非标记类都能被 UnoCSS 生成（静态扫描可达、token 存在）。
  it.each(allClasses)('[layout.style.generated] %s generates CSS', async (className) => {
    await cssOf(className)
  })

  // hasSider 切换主轴方向；横向时直接子级 Layout / Content 宽度归零（子选择器）。
  it('[layout.style.has-sider] switches direction and zeroes nested widths', async () => {
    expect(split(layoutVariants({ hasSider: false }))).toContain('flex-col')
    const row = split(layoutVariants({ hasSider: true }))
    expect(row).toContain('flex-row')
    expect(row).not.toContain('flex-col')
    const content = await cssOf('[&>.upthrust-layout-content]:w-0')
    expect(content).toContain('>.upthrust-layout-content')
    expect(content).toContain('width:calc(var(--spacing)*0)')
    expect(await cssOf('[&>.upthrust-layout]:w-0')).toContain('>.upthrust-layout{')
  })

  // 关键几何声明：顶栏 64px、触发器 48px 且 sticky 贴底、零宽触发器挂在外侧 40px、距顶 64px。
  it.each([
    ['h-[64px]', 'height:64px;'], ['h-[48px]', 'height:48px;'], ['sticky', 'position:sticky;'],
    ['bottom-0', 'bottom:calc(var(--spacing)*0)'], ['right-[-40px]', 'right:-40px;'], ['left-[-40px]', 'left:-40px;'],
    ['top-[64px]', 'top:64px;'], ['overflow-x-hidden', 'overflow-x:hidden;'], ['overflow-y-auto', 'overflow-y:auto;'],
    ['min-h-0', 'min-height:calc(var(--spacing)*0)'], ['flex-none', 'flex:none;'], ['flex-auto', 'flex:11auto;'],
  ])('[layout.style.geometry] %s → %s', async (className, declaration) => {
    expect(await cssOf(className)).toContain(declaration)
  })

  // 零宽触发器四种 scheme：方位决定 left/right 与圆角侧，主题决定配色；浅色补三边边框。
  it('[layout.style.zero-trigger] merges side and theme into one variant key', () => {
    const endDark = split(siderZeroTriggerVariants({ scheme: 'end-dark' }))
    const startLight = split(siderZeroTriggerVariants({ scheme: 'start-light' }))
    expect(endDark).toEqual(expect.arrayContaining(['right-[-40px]', 'rounded-r-lg', 'bg-inverse-surface']))
    expect(endDark).not.toContain('border')
    expect(startLight).toEqual(expect.arrayContaining(['left-[-40px]', 'rounded-l-lg', 'bg-surface', 'border', 'border-r-0']))
  })

  // 触发器背景必须不透明：sticky 时它覆盖在内容上方，半透明会透出底下的菜单。
  it('[layout.style.trigger-opaque] trigger backgrounds have no alpha modifier', () => {
    for (const theme of ['dark', 'light'] as const) {
      const backgrounds = split(siderTriggerVariants({ theme })).filter(name => /(^|:)bg-/.test(name))
      expect(backgrounds.length).toBeGreaterThan(0)
      for (const name of backgrounds) expect(name, `${theme} ${name}`).not.toContain('/')
    }
  })

  // 键盘可达：两种触发器都带 focus-visible 轮廓。
  it('[layout.style.focus] both triggers show a focus-visible outline', async () => {
    for (const classes of [siderTriggerVariants({ theme: 'dark' }), siderZeroTriggerVariants({ scheme: 'end-light' })]) {
      expect(split(classes)).toEqual(expect.arrayContaining(['focus-visible:outline-2', 'focus-visible:outline-primary']))
    }
    expect(await cssOf('focus-visible:outline-primary')).toContain(':focus-visible')
  })

  // 源码约定：首行 @unocss-include，且不使用 compoundVariants。
  it('[layout.style.source] follows the UnoCSS scanning conventions', () => {
    expect(stylesSource.startsWith('// @unocss-include')).toBe(true)
    expect(stylesSource).not.toContain('compoundVariants')
  })
})
