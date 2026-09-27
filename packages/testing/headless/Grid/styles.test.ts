import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import { SCREEN_MIN_WIDTHS } from '../../../competence/src/breakpoint'
import {
  COL_BASE_CLASS, COL_DEFAULT_MAX_WIDTH_CLASS, COL_LAYER_CLASS, colVar, rowClass,
  type ColField, type ColLayer,
} from '../../../components/lib/Grid/styles'

const generator = createGenerator({ presets: [presetWind4(), presetUpthrust()] })
const stylesSource = readFileSync(resolve(import.meta.dirname, '../../../components/lib/Grid/styles.ts'), 'utf8')

const LAYERS: ColLayer[] = ['base', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl']
const FIELDS: [ColField, string][] = [
  ['flex', 'flex'], ['max-width', 'max-width'], ['offset', 'margin-inline-start'],
  ['push', 'inset-inline-start'], ['pull', 'inset-inline-end'], ['order', 'order'],
]

/** 生成单个类名的 CSS，并去掉空白方便断言声明。 */
const cssOf = async (className: string) => {
  const { css, matched } = await (await generator).generate(className, { preflights: false })
  expect(matched.has(className), `${className} 未生成 CSS`).toBe(true)
  return css.replace(/\s+/g, '')
}
const rowClasses = (options: Parameters<typeof rowClass>[0]) => rowClass(options).split(' ')

describe('Grid Row 样式生成', () => {
  // 默认只有 flex、min-w-0 与换行类；justify/align 未传时不输出类（交叉轴保持 CSS 默认 stretch）。
  it('[grid.style.row.defaults] emits only display, min-width and wrap classes by default', () => {
    expect(rowClasses({ wrap: true })).toEqual(['flex', 'min-w-0', 'flex-wrap'])
    expect(rowClasses({ wrap: false })).toEqual(['flex', 'min-w-0', 'flex-nowrap'])
  })

  // justify 的六个取值都生成对应的 justify-content 声明。
  it.each([
    ['start', 'flex-start'], ['end', 'flex-end'], ['center', 'center'],
    ['space-around', 'space-around'], ['space-between', 'space-between'], ['space-evenly', 'space-evenly'],
  ] as const)('[grid.style.row.justify] %s → justify-content:%s', async (justify, value) => {
    const [className] = rowClasses({ wrap: true, justify }).filter(name => name.startsWith('justify-'))
    expect(await cssOf(className)).toContain(`justify-content:${value};`)
  })

  // align 的 top/middle/bottom/stretch 分别映射到 align-items 的 flex-start/center/flex-end/stretch。
  it.each([
    ['top', 'flex-start'], ['middle', 'center'], ['bottom', 'flex-end'], ['stretch', 'stretch'],
  ] as const)('[grid.style.row.align] %s → align-items:%s', async (align, value) => {
    const [className] = rowClasses({ wrap: true, align }).filter(name => name.startsWith('items-'))
    expect(await cssOf(className)).toContain(`align-items:${value};`)
  })

  // 行容器的基础类都生成预期声明。
  it.each([
    ['flex', 'display:flex;'], ['flex-wrap', 'flex-wrap:wrap;'], ['flex-nowrap', 'flex-wrap:nowrap;'],
  ])('[grid.style.row.base] %s → %s', async (className, declaration) => {
    expect(await cssOf(className)).toContain(declaration)
  })

  // min-w-0 在 wind4 下写成 calc(var(--spacing)*0)：必须确认主题预检定义了 --spacing，否则整条声明失效回退为 auto。
  it('[grid.style.row.minWidth] min-w-0 resolves through a defined --spacing', async () => {
    expect(await cssOf('min-w-0')).toMatch(/min-width:(0|calc\(var\(--spacing\)\*0\));/)
    const { css } = await (await generator).generate('min-w-0', { preflights: true })
    expect(css.replace(/\s+/g, '')).toMatch(/--spacing:[^;]+;/)
  })
})

describe('Grid Col 样式生成', () => {
  // 列的基础类：relative 供 push/pull 定位，min-h-px 让空列也占位，max-w-full 为默认上限。
  it('[grid.style.col.base] base classes generate position, min-height and max-width', async () => {
    expect(COL_BASE_CLASS).toEqual(['relative', 'min-h-px'])
    expect(await cssOf('relative')).toContain('position:relative;')
    expect(await cssOf('min-h-px')).toContain('min-height:1px;')
    expect(await cssOf(COL_DEFAULT_MAX_WIDTH_CLASS)).toContain('max-width:100%;')
  })

  // 每层每个字段的类都消费同层同名 CSS 变量，且写到正确的 CSS 属性上。
  it.each(LAYERS.flatMap(layer => FIELDS.map(([field, property]) => [layer, field, property] as const)))(
    '[grid.style.col.var] %s/%s → %s:var(...)',
    async (layer, field, property) => {
      const css = await cssOf(COL_LAYER_CLASS[layer][field])
      expect(css).toContain(`${property}:var(${colVar(layer, field)})`)
    },
  )

  // 变量名：base 层不带断点前缀，断点层以 --ut-col-<bp>- 开头。
  it('[grid.style.col.varName] base vars omit the breakpoint segment', () => {
    expect(colVar('base', 'flex')).toBe('--ut-col-flex')
    expect(colVar('sm', 'max-width')).toBe('--ut-col-sm-max-width')
    expect(colVar('xxxl', 'order')).toBe('--ut-col-xxxl-order')
  })

  // 断点层包在 min-width 媒体查询里，阈值与 competence 的 SCREEN_MIN_WIDTHS 一致（0 前缀只影响排序，不改变数值）。
  it.each(LAYERS.filter(layer => layer !== 'base'))('[grid.style.col.media] %s layer uses its min-width threshold', async (layer) => {
    const width = SCREEN_MIN_WIDTHS[layer as Exclude<ColLayer, 'base'>]
    for (const key of ['flex', 'hidden', 'block'] as const) {
      const css = await cssOf(COL_LAYER_CLASS[layer][key])
      expect(css).toMatch(new RegExp(`@media\\(min-width:0*${width}px\\)`))
    }
  })

  // span 0 的隐藏类与后续断点恢复用的 block 类分别生成 display:none / display:block。
  it.each(LAYERS)('[grid.style.col.visibility] %s hidden/block toggle display', async (layer) => {
    expect(await cssOf(COL_LAYER_CLASS[layer].hidden)).toContain('display:none;')
    expect(await cssOf(COL_LAYER_CLASS[layer].block)).toContain('display:block;')
  })

  // 关键回归：所有层一起生成时，base 规则在前，媒体块按阈值从窄到宽排列，宽断点才能覆盖窄断点。
  it('[grid.style.col.order] base rules precede media blocks, which ascend by width', async () => {
    const all = LAYERS.flatMap(layer => Object.values(COL_LAYER_CLASS[layer]))
    const { css } = await (await generator).generate(all.join(' '), { preflights: false })
    const compact = css.replace(/\s+/g, '')
    const widths = [...compact.matchAll(/@media\(min-width:0*(\d+)px\)/g)].map(match => Number(match[1]))
    expect(widths).toEqual([576, 768, 992, 1200, 1600, 1920])
    const firstMedia = compact.indexOf('@media')
    expect(compact.indexOf('flex:var(--ut-col-flex)')).toBeLessThan(firstMedia)
    expect(compact.indexOf('max-width:var(--ut-col-max-width)')).toBeLessThan(firstMedia)
  })

  // UnoCSS 静态扫描 styles.ts 源文件时，能提取表里的每一个类（没有运行期拼接的类名）。
  it('[grid.style.extract] static scan of styles.ts extracts every class', async () => {
    const { matched } = await (await generator).generate(stylesSource, { preflights: false })
    const expected = [
      ...LAYERS.flatMap(layer => Object.values(COL_LAYER_CLASS[layer])),
      ...COL_BASE_CLASS, COL_DEFAULT_MAX_WIDTH_CLASS,
      'flex', 'min-w-0', 'flex-wrap', 'flex-nowrap',
      'justify-start', 'justify-end', 'justify-center', 'justify-around', 'justify-between', 'justify-evenly',
      'items-start', 'items-center', 'items-end', 'items-stretch',
    ]
    expect(expected.filter(name => !matched.has(name))).toEqual([])
  })
})
