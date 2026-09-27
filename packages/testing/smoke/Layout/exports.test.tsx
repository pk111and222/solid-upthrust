import { afterEach, expect, it } from 'vitest'
import Layout, {
  Content, Footer, Header, Sider,
  type ContentProps, type FooterProps, type HeaderProps, type LayoutProps, type SiderBreakpoint,
  type SiderCollapseType, type SiderProps, type SiderSemanticName, type SiderTheme,
} from '../../../components/lib/Layout'
import type * as Public from '../../../components/lib'
import * as Competence from '../../../competence/src'
import { mount } from '../../utils/mount'

// 公开类型可从 barrel 取到，且与组件目录导出的类型一致（编译期校验）。
const theme: Public.SiderTheme = 'light' satisfies SiderTheme
const breakpoint: Public.SiderBreakpoint = 'xxxl' satisfies SiderBreakpoint
const collapseType: Public.SiderCollapseType = 'responsive' satisfies SiderCollapseType
const semantic: Public.SiderSemanticName = 'body' satisfies SiderSemanticName
const layoutProps: Public.LayoutProps = { hasSider: true, id: 'root' } satisfies LayoutProps
const headerProps: Public.HeaderProps = { role: 'banner' } satisfies HeaderProps
const footerProps: Public.FooterProps = { class: 'x' } satisfies FooterProps
const contentProps: Public.ContentProps = { style: { padding: '8px' } } satisfies ContentProps
const siderProps: Public.SiderProps = {
  theme, breakpoint, collapsible: true, width: '15rem', collapsedWidth: 0,
  classNames: { [semantic]: 'x' }, onCollapse: (_: boolean, type: SiderCollapseType) => void type,
} satisfies SiderProps
void collapseType

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })

// 默认导出挂载了四个子组件，且与具名导出、barrel 导出是同一实现。
it('[layout.exports.shape] static members match the named and barrel exports', () => {
  const PublicLayout: typeof Public.Layout = Layout
  expect(PublicLayout.Header).toBe(Header)
  expect(Layout.Footer).toBe(Footer)
  expect(Layout.Content).toBe(Content)
  expect(Layout.Sider).toBe(Sider)
  const PublicSider: typeof Public.Sider = Sider
  const PublicHeader: typeof Public.Header = Header
  expect([PublicSider, PublicHeader]).toEqual([Sider, Header])
})

// competence 入口导出 Sider 的状态机与断点工具，供自定义侧栏复用。
it('[layout.exports.competence] competence exposes the sider primitives', () => {
  expect(typeof Competence.createSider).toBe('function')
  expect(Competence.siderBreakpointQuery('md')).toBe('(max-width: 767.98px)')
  expect(Object.keys(Competence.SIDER_BREAKPOINT_MAX_WIDTHS)).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'])
})

// 公开组件真实挂载：五个区域按语义标签渲染；卸载后宿主无残留。
it('[layout.exports.mount] public components mount and clean up', () => {
  const view = mount(() => (
    <Layout {...layoutProps}>
      <Sider {...siderProps}>S</Sider>
      <Layout>
        <Header {...headerProps}>H</Header>
        <Content {...contentProps}>C</Content>
        <Footer {...footerProps}>F</Footer>
      </Layout>
    </Layout>
  ))
  dispose = view.dispose
  const root = view.host.firstElementChild as HTMLElement
  expect(root.id).toBe('root')
  expect([...view.host.querySelectorAll('aside,header,main,footer')].map(el => el.tagName)).toEqual(['ASIDE', 'HEADER', 'MAIN', 'FOOTER'])
  expect(root.textContent).toBe('SHCF')
  view.dispose(); dispose = () => {}
  expect(view.host.isConnected).toBe(false)
  expect(view.host.childNodes).toHaveLength(0)
})
