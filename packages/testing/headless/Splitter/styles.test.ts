import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import {
  PANEL_STANDALONE_CLASS, SPLITTER_COLLAPSE_ICON, SPLITTER_MARKER,
  splitterBarVariants, splitterCollapseVariants, splitterDraggerIconVariants, splitterDraggerVariants,
  splitterMaskVariants, splitterPanelVariants, splitterPreviewVariants, splitterVariants,
} from '../../../components/lib/Splitter/styles'

const generator = createGenerator({ presets: [presetWind4(), presetUpthrust()] })
const stylesSource = readFileSync(resolve(import.meta.dirname, '../../../components/lib/Splitter/styles.ts'), 'utf8')
/** 标记类与 group 名称本身不产生 CSS。 */
const markers = new Set<string>([...Object.values(SPLITTER_MARKER), 'group/bar'])

/** 生成单个类名的 CSS，并去掉空白方便断言声明。 */
const cssOf = async (className: string) => {
  const { css, matched } = await (await generator).generate(className, { preflights: false })
  expect(matched.has(className), `${className} 未生成 CSS`).toBe(true)
  return css.replace(/\s+/g, '')
}

const split = (value: string) => value.split(' ').filter(Boolean)
const orientations = ['horizontal', 'vertical'] as const
const states = ['idle', 'active', 'disabled'] as const
const placements = ['horizontal-start', 'horizontal-end', 'vertical-start', 'vertical-end'] as const

/** 所有变体组合展开后的完整类名集合（标记类除外）。 */
const allClasses = [...new Set([
  ...orientations.flatMap(orientation => [
    ...split(splitterVariants({ orientation })),
    ...split(splitterBarVariants({ orientation })),
    ...split(splitterPreviewVariants({ orientation })),
    ...split(splitterMaskVariants({ orientation })),
    ...states.flatMap(state => [true, false].flatMap(customize =>
      split(splitterDraggerVariants({ orientation, state, customize })))),
  ]),
  ...[true, false].flatMap(collapsed => [true, false].flatMap(motion => split(splitterPanelVariants({ collapsed, motion })))),
  ...states.flatMap(state => split(splitterDraggerIconVariants({ state }))),
  ...placements.flatMap(placement => (['default', 'customize'] as const).flatMap(appearance =>
    (['visible', 'hidden', 'hover'] as const).flatMap(visibility =>
      split(splitterCollapseVariants({ placement, appearance, visibility }))))),
  ...PANEL_STANDALONE_CLASS,
])].filter(name => !markers.has(name))

/** 图标类由组件包的 presetIcons 生成（testing 不依赖它）：直接对组件包安装的 mdi 集合核对图标名。 */
const mdiIcons = (JSON.parse(readFileSync(
  resolve(import.meta.dirname, '../../../components/node_modules/@iconify-json/mdi/icons.json'), 'utf8',
)) as { icons: Record<string, unknown> }).icons

describe('Splitter 样式生成', () => {
  // 每个节点的根类都带标记类，供嵌套选择器与消费方定位。
  it('[splitter.style.markers] every node carries its marker class', () => {
    expect(split(splitterVariants())).toContain(SPLITTER_MARKER.root)
    expect(split(splitterPanelVariants())).toContain(SPLITTER_MARKER.panel)
    expect(split(splitterBarVariants())).toContain(SPLITTER_MARKER.bar)
    expect(split(splitterDraggerVariants())).toContain(SPLITTER_MARKER.dragger)
    expect(split(splitterDraggerIconVariants())).toContain(SPLITTER_MARKER.draggerIcon)
    expect(split(splitterPreviewVariants())).toContain(SPLITTER_MARKER.preview)
    expect(split(splitterCollapseVariants())).toContain(SPLITTER_MARKER.collapse)
    expect(split(splitterMaskVariants())).toContain(SPLITTER_MARKER.mask)
    expect(PANEL_STANDALONE_CLASS).toContain(SPLITTER_MARKER.panel)
  })

  // 所有非标记类都能被 UnoCSS 生成（静态扫描可达、token 存在）。
  it.each(allClasses)('[splitter.style.generated] %s generates CSS', async (className) => {
    await cssOf(className)
  })

  // 方向：根节点切换主轴；分隔条在主轴上宽 / 高为 0；拖拽热区 6px、光标随方向变化。
  it('[splitter.style.orientation] switches axis, bar thickness and cursor', () => {
    expect(split(splitterVariants({ orientation: 'horizontal' }))).toContain('flex-row')
    expect(split(splitterVariants({ orientation: 'vertical' }))).toContain('flex-col')
    expect(split(splitterBarVariants({ orientation: 'horizontal' }))).toContain('w-0')
    expect(split(splitterBarVariants({ orientation: 'vertical' }))).toContain('h-0')
    expect(split(splitterDraggerVariants({ orientation: 'horizontal' })))
      .toEqual(expect.arrayContaining(['w-[6px]', 'h-full', 'cursor-col-resize']))
    expect(split(splitterDraggerVariants({ orientation: 'vertical' })))
      .toEqual(expect.arrayContaining(['h-[6px]', 'w-full', 'cursor-row-resize']))
    expect(split(splitterMaskVariants({ orientation: 'vertical' }))).toContain('cursor-row-resize')
  })

  // 关键几何与层级声明。
  it.each([
    ['w-[6px]', 'width:6px;'], ['h-[6px]', 'height:6px;'], ['before:w-[2px]', 'width:2px;'], ['after:h-5', 'height:calc(var(--spacing)*5)'],
    ['right-[3px]', 'right:3px;'], ['bottom-[3px]', 'bottom:3px;'], ['z-1000', 'z-index:1000;'], ['touch-none', 'touch-action:none;'],
    ['fixed', 'position:fixed;'], ['inset-0', 'inset:calc(var(--spacing)*0)'], ['left-[-1px]', 'left:-1px;'],
    ['[scrollbar-width:thin]', 'scrollbar-width:thin;'], ['rounded-[2px]', 'border-radius:2px;'],
  ])('[splitter.style.geometry] %s → %s', async (className, declaration) => {
    expect(await cssOf(className)).toContain(declaration)
  })

  // 折叠过渡只作用于 flex-basis，且尊重减少动效偏好（wind4 的 transition-[flex-basis] 不生成 CSS，必须用任意属性写法）。
  it('[splitter.style.motion] transitions only flex-basis and honours reduced motion', async () => {
    const motion = split(splitterPanelVariants({ motion: true }))
    const transition = motion.find(name => name.startsWith('[transition:'))!
    expect(await cssOf(transition)).toContain('transition:flex-basis0.3scubic-bezier(0.645,0.045,0.355,1)')
    expect(motion).toContain('motion-reduce:transition-none')
    expect(await cssOf('motion-reduce:transition-none')).toContain('prefers-reduced-motion:reduce')
    expect(split(splitterPanelVariants({ motion: false })).some(name => name.includes('transition'))).toBe(false)
  })

  // 只含一个嵌套 Splitter 的面板不滚动（:has 子选择器）；折叠的面板裁剪溢出。
  it('[splitter.style.nested] hides scrollbars around a single nested splitter', async () => {
    expect(await cssOf('[&:has(>.upthrust-splitter:only-child)]:overflow-hidden'))
      .toContain(':has(>.upthrust-splitter:only-child)')
    expect(split(splitterPanelVariants({ collapsed: true }))).toContain('overflow-hidden')
  })

  // 拖拽状态：idle 悬停变浅主色、active 加深并提升层级、disabled 隐藏抓手；自定义图标同样隐藏默认抓手。
  it('[splitter.style.dragger-state] maps idle / active / disabled / customize', () => {
    expect(split(splitterDraggerVariants({ state: 'idle' }))).toContain('hover:before:bg-primary-container')
    expect(split(splitterDraggerVariants({ state: 'active' }))).toEqual(expect.arrayContaining(['z-2', 'before:bg-primary/30']))
    const disabled = split(splitterDraggerVariants({ state: 'disabled' }))
    expect(disabled).toEqual(expect.arrayContaining(['cursor-default', 'after:hidden']))
    expect(disabled).not.toContain('hover:before:bg-primary-container')
    expect(split(splitterDraggerVariants({ customize: true }))).toContain('after:hidden')
    expect(split(splitterDraggerIconVariants({ state: 'active' }))).toContain('text-primary')
    expect(split(splitterDraggerIconVariants({ state: 'disabled' }))).toContain('hidden')
  })

  // 键盘可达：分隔条聚焦时分隔线变主色，折叠按钮有 focus-visible 轮廓。
  it('[splitter.style.focus] dragger and collapse buttons show focus styles', async () => {
    expect(split(splitterDraggerVariants())).toContain('focus-visible:before:bg-primary')
    expect(await cssOf('focus-visible:before:bg-primary')).toContain(':focus-visible')
    expect(split(splitterCollapseVariants())).toEqual(expect.arrayContaining(['focus-visible:outline-2', 'focus-visible:outline-primary']))
  })

  // 折叠按钮：hover 模式靠 group/bar 悬停 / 聚焦显示，触屏设备常显；hidden 不渲染；visible 常显。
  it('[splitter.style.collapse-visibility] reveals hover buttons via the bar group', async () => {
    const hover = split(splitterCollapseVariants({ visibility: 'hover' }))
    expect(hover).toEqual(expect.arrayContaining([
      'opacity-0', 'group-hover/bar:opacity-100', 'group-focus-within/bar:opacity-100', '[@media(hover:none)]:opacity-100',
    ]))
    expect(await cssOf('group-hover/bar:opacity-100')).toContain('.group\\/bar:hover')
    expect(await cssOf('[@media(hover:none)]:opacity-100')).toContain('@media(hover:none)')
    expect(split(splitterCollapseVariants({ visibility: 'hidden' }))).toContain('hidden')
    expect(split(splitterCollapseVariants({ visibility: 'visible' }))).toContain('opacity-100')
  })

  // 折叠按钮位置与图标：横向挂在分隔条左右，纵向挂在上下；图标方向与之对应。
  it('[splitter.style.collapse-placement] places buttons on both sides of the bar', () => {
    expect(split(splitterCollapseVariants({ placement: 'horizontal-start' }))).toEqual(expect.arrayContaining(['right-[3px]', 'w-3', 'h-6']))
    expect(split(splitterCollapseVariants({ placement: 'horizontal-end' }))).toContain('left-[3px]')
    expect(split(splitterCollapseVariants({ placement: 'vertical-start' }))).toEqual(expect.arrayContaining(['bottom-[3px]', 'w-6', 'h-3']))
    expect(split(splitterCollapseVariants({ placement: 'vertical-end' }))).toContain('top-[3px]')
    expect(SPLITTER_COLLAPSE_ICON).toEqual({
      'horizontal-start': 'i-mdi-chevron-left',
      'horizontal-end': 'i-mdi-chevron-right',
      'vertical-start': 'i-mdi-chevron-up',
      'vertical-end': 'i-mdi-chevron-down',
    })
  })

  // 默认折叠图标都存在于 mdi 集合中（名称拼错会渲染出空按钮）。
  it.each(Object.values(SPLITTER_COLLAPSE_ICON))('[splitter.style.icon] %s exists in the mdi collection', (className) => {
    expect(className.startsWith('i-mdi-')).toBe(true)
    expect(mdiIcons[className.slice('i-mdi-'.length)]).toBeDefined()
  })

  // 自定义图标的按钮背景透明；默认按钮不在图标元素本身加 bg（mask 图标会被 bg 覆盖）。
  it('[splitter.style.collapse-appearance] customize drops the default background', () => {
    const custom = split(splitterCollapseVariants({ appearance: 'customize' }))
    expect(custom).toContain('bg-transparent')
    expect(custom).not.toContain('bg-on-surface/4')
    for (const icon of Object.values(SPLITTER_COLLAPSE_ICON)) expect(icon).not.toMatch(/\bbg-/)
  })

  // 源码约定：首行 @unocss-include，且不使用 compoundVariants。
  it('[splitter.style.source] follows the UnoCSS scanning conventions', () => {
    expect(stylesSource.startsWith('// @unocss-include')).toBe(true)
    expect(stylesSource).not.toContain('compoundVariants')
  })
})
