import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import { flexClass, isPresetGap, type FlexAlign, type FlexJustify } from '../../../components/lib/Flex/styles'

const generator = createGenerator({ presets: [presetWind4(), presetUpthrust()] })

/** 生成单个类名的 CSS，并去掉空白方便断言声明。 */
const cssOf = async (className: string) => {
  const { css, matched } = await (await generator).generate(className, { preflights: false })
  expect(matched.has(className), `${className} 未生成 CSS`).toBe(true)
  return css.replace(/\s+/g, '')
}
const classesOf = (options: Parameters<typeof flexClass>[0]) => flexClass(options).split(' ')
const base = { inline: false, vertical: false }

describe('Flex 样式生成', () => {
  // justify 的每个取值都必须生成对应的 justify-content 声明，而不是被 UnoCSS 静默丢弃。
  it.each<[FlexJustify, string]>([
    ['flex-start', 'flex-start'], ['flex-end', 'flex-end'], ['start', 'start'], ['end', 'end'],
    ['center', 'center'], ['space-between', 'space-between'], ['space-around', 'space-around'],
    ['space-evenly', 'space-evenly'], ['stretch', 'stretch'], ['normal', 'normal'], ['left', 'left'], ['right', 'right'],
  ])('[flex.style.justify] %s → justify-content:%s', async (justify, value) => {
    const [className] = classesOf({ ...base, justify }).filter(name => name.includes('justify'))
    expect(await cssOf(className)).toContain(`justify-content:${value};`)
  })

  // align 的每个取值都必须生成对应的 align-items 声明。
  it.each<[FlexAlign, string]>([
    ['flex-start', 'flex-start'], ['flex-end', 'flex-end'], ['start', 'start'], ['end', 'end'],
    ['self-start', 'self-start'], ['self-end', 'self-end'], ['center', 'center'],
    ['baseline', 'baseline'], ['stretch', 'stretch'], ['normal', 'normal'],
  ])('[flex.style.align] %s → align-items:%s', async (align, value) => {
    const [className] = classesOf({ ...base, align }).filter(name => name.includes('items') || name.includes('align-items'))
    expect(await cssOf(className)).toContain(`align-items:${value};`)
  })

  // 方向、换行、display 与空容器隐藏类都生成预期声明。
  it.each<[string, string]>([
    ['flex', 'display:flex;'], ['inline-flex', 'display:inline-flex;'],
    ['flex-row', 'flex-direction:row;'], ['flex-col', 'flex-direction:column;'],
    ['flex-wrap', 'flex-wrap:wrap;'], ['flex-nowrap', 'flex-wrap:nowrap;'], ['flex-wrap-reverse', 'flex-wrap:wrap-reverse;'],
    ['empty:hidden', 'display:none;'],
  ])('[flex.style.layout] %s → %s', async (className, declaration) => {
    const css = await cssOf(className)
    expect(css).toContain(declaration)
    if (className === 'empty:hidden') expect(css).toContain(':empty')
  })

  // 预设间距引用主题 spacing 变量：small=xs(8px)、middle/medium=md(16px)、large=lg(24px)。
  it.each<[ 'small' | 'middle' | 'medium' | 'large', string, string]>([
    ['small', 'xs', '8px'], ['middle', 'md', '16px'], ['medium', 'md', '16px'], ['large', 'lg', '24px'],
  ])('[flex.style.gap] %s → var(--spacing-%s) = %s', async (gap, token, px) => {
    const [className] = classesOf({ ...base, gap }).filter(name => name.startsWith('gap-'))
    const css = await cssOf(className)
    expect(css).toContain(`gap:var(--spacing-${token});`)
    const { css: themeCss } = await (await generator).generate(className, { preflights: true })
    expect(themeCss.replace(/\s+/g, '')).toContain(`--spacing-${token}:${px};`)
  })

  // 只有四个预设档位走类名；原型链上的键和其他字符串都当作自定义 CSS 值。
  it('[flex.style.gap.guard] recognises only own preset keys', () => {
    for (const gap of ['small', 'middle', 'medium', 'large']) expect(isPresetGap(gap)).toBe(true)
    for (const gap of ['constructor', 'toString', '__proto__', 'Small', '16px', 16, undefined, null]) expect(isPresetGap(gap)).toBe(false)
  })

  // 可选变体未传时不输出类，默认只剩 display、方向和空容器隐藏三类。
  it('[flex.style.defaults] emits only display, direction and empty classes by default', () => {
    expect(classesOf(base)).toEqual(['empty:hidden', 'flex', 'flex-row'])
    expect(classesOf({ inline: true, vertical: true })).toEqual(['empty:hidden', 'inline-flex', 'flex-col'])
  })
})
