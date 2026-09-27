import { afterEach, expect, it } from 'vitest'
import Masonry, {
  type MasonryColumns, type MasonryGutter, type MasonryGutterValue, type MasonryItem, type MasonryItemRenderInfo,
  type MasonryKey, type MasonryLayoutItem, type MasonryProps,
} from '../../../components/lib/Masonry'
import type * as Public from '../../../components/lib'
import * as Competence from '../../../competence/src'
import { mount } from '../../utils/mount'

// 公开类型可从 barrel 取到，且与组件目录导出的类型一致（编译期校验）。
const columns: Public.MasonryColumns = { xs: 1, md: 3 } satisfies MasonryColumns
const gutterValue: Public.MasonryGutterValue = 'middle' satisfies MasonryGutterValue
const gutter: Public.MasonryGutter = { xs: 8, lg: gutterValue } satisfies MasonryGutter
const key: Public.MasonryKey = 'a' satisfies MasonryKey
const item: Public.MasonryItem<{ h: number }> = { key, data: { h: 40 }, column: 1 } satisfies MasonryItem<{ h: number }>
const render = (info: Public.MasonryItemRenderInfo<{ h: number }>) => `${info.key}:${info.index}:${info.data?.h}` satisfies string
const report = (items: Public.MasonryLayoutItem<{ h: number }>[]) => void items satisfies void
const props: Public.MasonryProps<{ h: number }> = {
  columns, gutter: [gutter, 16], items: [item], itemRender: (info: MasonryItemRenderInfo<{ h: number }>) => render(info),
  onLayoutChange: (items: MasonryLayoutItem<{ h: number }>[]) => report(items), id: 'root',
} satisfies MasonryProps<{ h: number }>

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })

// 默认导出与 barrel 导出是同一实现。
it('[masonry.exports.shape] default export matches the barrel export', () => {
  const PublicMasonry: typeof Public.Masonry = Masonry
  expect(PublicMasonry).toBe(Masonry)
})

// competence 入口导出布局纯函数与间距解析，供自定义瀑布流复用。
it('[masonry.exports.competence] competence exposes the masonry primitives', () => {
  expect(typeof Competence.createMasonry).toBe('function')
  expect(Competence.DEFAULT_MASONRY_COLUMNS).toBe(3)
  expect(Competence.resolveMasonryGutter('small', null)).toEqual([8, 8])
  expect(Competence.computeMasonryLayout([10, 20], 2, 0).positions.map(p => p.column)).toEqual([0, 1])
  expect(Competence.sequentialColumns(3, 2)).toEqual([0, 0, 1])
})

// 公开组件真实挂载：items 经 itemRender 渲染；卸载后宿主无残留。
it('[masonry.exports.mount] public component mounts and cleans up', () => {
  const view = mount(() => <Masonry {...props} />)
  dispose = view.dispose
  const root = view.host.firstElementChild as HTMLElement
  expect(root.id).toBe('root')
  expect(root.textContent).toBe('a:0:40')
  view.dispose(); dispose = () => {}
  expect(view.host.isConnected).toBe(false)
  expect(view.host.childNodes).toHaveLength(0)
})
