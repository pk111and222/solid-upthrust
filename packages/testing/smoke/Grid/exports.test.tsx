import { afterEach, expect, it } from 'vitest'
import Grid, {
  Col, Row, useBreakpoint,
  type ColProps, type ColSize, type ColSpanType, type Gutter, type GutterValue, type ResponsiveValue,
  type RowAlign, type RowJustify, type RowProps, type ScreenMap,
} from '../../../components/lib/Grid'
import type * as Public from '../../../components/lib'
import * as Competence from '../../../competence/src'
import { mount } from '../../utils/mount'

// 公开类型可从 barrel 取到，且与组件目录导出的类型一致（编译期校验）。
const justify: Public.RowJustify = 'space-between' satisfies RowJustify
const align: Public.RowAlign = 'middle' satisfies RowAlign
const gutterValue: Public.GutterValue = '1rem' satisfies GutterValue
const gutter: Public.Gutter = { xs: 8, md: gutterValue } satisfies Gutter
const responsive: Public.ResponsiveValue<number> = { lg: 3 } satisfies ResponsiveValue<number>
const span: Public.ColSpanType = '12' satisfies ColSpanType
const size: Public.ColSize = { span: 6, offset: 1, flex: 'auto' } satisfies ColSize
const screens: Public.ScreenMap = { md: true } satisfies ScreenMap
const rowProps: Public.RowProps = { gutter: [gutter, 16], justify, align, wrap: false } satisfies RowProps
const colProps: Public.ColProps = { span, md: size, order: responsive.lg } satisfies ColProps
void screens

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })

// 默认导出的命名空间与具名导出是同一组实现；公开签名与目录实现一致。
it('[grid.exports.shape] namespace and named exports are the same functions', () => {
  const PublicRow: typeof Public.Row = Row
  const PublicCol: typeof Public.Col = Col
  const PublicUseBreakpoint: typeof Public.useBreakpoint = useBreakpoint
  expect(Grid).toEqual({ Row: PublicRow, Col: PublicCol, useBreakpoint: PublicUseBreakpoint })
})

// competence 入口导出断点能力，供 Grid 以外的消费方复用。
it('[grid.exports.competence] competence exposes the breakpoint primitives', () => {
  expect(typeof Competence.createBreakpoint).toBe('function')
  expect(typeof Competence.resolveResponsive).toBe('function')
  expect(Competence.SCREEN_KEYS).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'])
})

// 公开组件真实挂载：Row 写负外边距，Col 写对应内边距与宽度变量；卸载后宿主无残留。
it('[grid.exports.mount] public Row/Col mount, lay out and clean up', () => {
  const view = mount(() => (
    <Row {...rowProps} gutter={16}>
      <Col {...colProps}>A</Col>
      <Col span={12}>B</Col>
    </Row>
  ))
  dispose = view.dispose
  const row = view.host.firstElementChild as HTMLElement
  expect(row.style.marginLeft).toBe('-8px')
  const [a, b] = [...row.children] as HTMLElement[]
  expect(a.style.paddingLeft).toBe('8px')
  expect(b.style.getPropertyValue('--ut-col-max-width')).toBe('50%')
  expect(row.textContent).toBe('AB')
  view.dispose(); dispose = () => {}
  expect(view.host.isConnected).toBe(false)
  expect(view.host.childNodes).toHaveLength(0)
})
