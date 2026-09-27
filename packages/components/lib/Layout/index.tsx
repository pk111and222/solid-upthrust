import { Show, children as resolveChildren, createContext, createMemo, createSignal, omit, onCleanup, useContext } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createSider, type SiderBreakpoint, type SiderCollapseType } from 'upthrust-competence'
import { mergeClass } from '../../common/merge'
import {
  CONTENT_CLASS, FOOTER_CLASS, HEADER_CLASS, SIDER_BODY_CLASS,
  layoutVariants, siderTriggerVariants, siderVariants, siderZeroTriggerVariants,
  type SiderTheme,
} from './styles'

export type { SiderTheme }
export type { SiderBreakpoint, SiderCollapseType }

/** Sider 可语义化定制的节点：根节点 aside 与内容容器。 */
export type SiderSemanticName = 'root' | 'body'

type SectionAttributes<T extends HTMLElement> = Omit<JSX.HTMLAttributes<T>, 'class' | 'style' | 'children'>

export interface LayoutProps extends SectionAttributes<HTMLDivElement> {
  /**
   * 是否横向排列（含 Sider）。不传时根据是否有 Sider 注册自动判断；
   * 服务端渲染时 Sider 尚未注册，可显式传 true 避免首屏闪动。
   */
  hasSider?: boolean
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface HeaderProps extends SectionAttributes<HTMLElement> {
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface FooterProps extends SectionAttributes<HTMLElement> {
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface ContentProps extends SectionAttributes<HTMLElement> {
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface SiderProps extends Omit<SectionAttributes<HTMLElement>, 'onBreakpoint'> {
  /** 展开宽度，默认 200；数字与纯数字字符串按 px。 */
  width?: number | string
  /** 收起宽度，默认 80；为 0 时改用挂在外侧的零宽触发器。 */
  collapsedWidth?: number | string
  /** 当前是否收起（受控）。 */
  collapsed?: boolean
  /** 初始是否收起（非受控）。 */
  defaultCollapsed?: boolean
  /** 是否可收起：渲染底部触发器。 */
  collapsible?: boolean
  /** 翻转触发器箭头方向；零宽触发器改挂在左侧。用于放在右侧的 Sider。 */
  reverseArrow?: boolean
  /** 响应式断点：宽度低于该断点时自动收起，回到断点以上时展开。 */
  breakpoint?: SiderBreakpoint
  /** 收起状态变化：点击触发器为 'clickTrigger'，断点触发为 'responsive'。 */
  onCollapse?: (collapsed: boolean, type: SiderCollapseType) => void
  /** 断点命中变化；设置 breakpoint 后挂载时也会按当前宽度调用一次。 */
  onBreakpoint?: (broken: boolean) => void
  /** 自定义触发器内容；null 时不渲染触发器（可配合受控 collapsed 自建触发器）。 */
  trigger?: JSX.Element | null
  /** 零宽触发器的内联样式。 */
  zeroWidthTriggerStyle?: JSX.CSSProperties
  /** 主题，默认 dark。 */
  theme?: SiderTheme
  /** 语义化类名。 */
  classNames?: Partial<Record<SiderSemanticName, string>>
  /** 语义化内联样式。 */
  styles?: Partial<Record<SiderSemanticName, JSX.CSSProperties>>
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

/** Layout 向后代 Sider 暴露的注册入口：Sider 挂载时计数 +1，卸载时 −1。 */
interface LayoutContextValue {
  registerSider: () => void
}

// 可选注入：Sider 不在 Layout 内时拿到 null（Solid 2 无 Provider 且无默认值时会抛错）。
const LayoutContext = createContext<LayoutContextValue | null>(null)

const REGION_PROPS = ['class', 'style', 'children'] as const

const LayoutBase = (props: LayoutProps) => {
  const rest = omit(props, 'hasSider', ...REGION_PROPS)
  const [siderCount, setSiderCount] = createSignal(0, { ownedWrite: true })
  const hasSider = createMemo(() => typeof props.hasSider === 'boolean' ? props.hasSider : siderCount() > 0)
  const context: LayoutContextValue = {
    registerSider: () => {
      setSiderCount(count => count + 1)
      onCleanup(() => setSiderCount(count => count - 1))
    },
  }

  return (
    <LayoutContext value={context}>
      <div {...rest} class={mergeClass(layoutVariants({ hasSider: hasSider() }), props.class)} style={props.style}>
        {props.children}
      </div>
    </LayoutContext>
  )
}

export const Header = (props: HeaderProps) => {
  const rest = omit(props, ...REGION_PROPS)
  return <header {...rest} class={mergeClass(HEADER_CLASS, props.class)} style={props.style}>{props.children}</header>
}

export const Footer = (props: FooterProps) => {
  const rest = omit(props, ...REGION_PROPS)
  return <footer {...rest} class={mergeClass(FOOTER_CLASS, props.class)} style={props.style}>{props.children}</footer>
}

export const Content = (props: ContentProps) => {
  const rest = omit(props, ...REGION_PROPS)
  return <main {...rest} class={mergeClass(CONTENT_CLASS, props.class)} style={props.style}>{props.children}</main>
}

const SIDER_PROPS = [
  'width', 'collapsedWidth', 'collapsed', 'defaultCollapsed', 'collapsible', 'reverseArrow',
  'breakpoint', 'onCollapse', 'onBreakpoint', 'trigger', 'zeroWidthTriggerStyle', 'theme',
  'classNames', 'styles', ...REGION_PROPS,
] as const

/** 与 antd 一致：数字与纯数字字符串补 px，其余（%、rem、calc…）原样使用。 */
const toCssWidth = (value: number | string) =>
  !Number.isNaN(Number.parseFloat(String(value))) && Number.isFinite(Number(value)) ? `${value}px` : String(value)

export const Sider = (props: SiderProps) => {
  const rest = omit(props, ...SIDER_PROPS)
  useContext(LayoutContext)?.registerSider()

  const sider = createSider({
    get collapsed() { return props.collapsed },
    get defaultCollapsed() { return props.defaultCollapsed },
    get breakpoint() { return props.breakpoint },
    get onCollapse() { return props.onCollapse },
    get onBreakpoint() { return props.onBreakpoint },
  })

  const theme = () => props.theme ?? 'dark'
  const width = createMemo(() => toCssWidth(sider.collapsed() ? props.collapsedWidth ?? 80 : props.width ?? 200))
  /** collapsedWidth 为 0：收起后 Sider 完全消失，触发器改为挂在外侧的零宽触发器。 */
  const zeroWidth = createMemo(() => Number.parseFloat(String(props.collapsedWidth ?? 80)) === 0)
  /** 当前宽度为 0：内容不可见，设为 inert 使其不可聚焦、不进入无障碍树。 */
  const hidden = createMemo(() => Number.parseFloat(width()) === 0)
  // 触发器与 antd 同条件：collapsible 时总是渲染；非 collapsible 时仅在零宽模式且低于断点时渲染。
  const showTrigger = createMemo(() => props.trigger !== null && (!!props.collapsible || (zeroWidth() && sider.broken())))
  const customTrigger = resolveChildren(() => props.trigger)

  // 展开时箭头指向收起方向（默认向左），收起时相反；reverseArrow 整体翻转。
  const arrowIcon = () => sider.collapsed() !== !!props.reverseArrow ? 'i-mdi-chevron-right' : 'i-mdi-chevron-left'

  const rootStyle = createMemo((): JSX.CSSProperties => {
    const value = width()
    // 与 antd 一致：宽度由 width/collapsedWidth 决定，style 中的宽度声明不生效。
    return { ...props.styles?.root, ...props.style, flex: `0 0 ${value}`, 'max-width': value, 'min-width': value, width: value }
  })

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    sider.toggle()
  }

  return (
    <aside {...rest} class={mergeClass(siderVariants({ theme: theme() }), props.class, props.classNames?.root)} style={rootStyle()}>
      <div class={mergeClass(SIDER_BODY_CLASS, props.classNames?.body)} style={props.styles?.body} inert={hidden() || undefined}>
        {props.children}
      </div>
      <Show when={showTrigger()}>
        <Show
          when={zeroWidth()}
          fallback={
            <div
              role="button" tabindex={0} aria-expanded={sider.collapsed() ? 'false' : 'true'} aria-label="切换侧边栏"
              class={siderTriggerVariants({ theme: theme() })}
              onClick={() => sider.toggle()} onKeyDown={onTriggerKeyDown}
            >
              {customTrigger() ?? <span class={`${arrowIcon()} text-xl`} aria-hidden="true" />}
            </div>
          }
        >
          <span
            role="button" tabindex={0} aria-expanded={sider.collapsed() ? 'false' : 'true'} aria-label="切换侧边栏"
            onClick={() => sider.toggle()} onKeyDown={onTriggerKeyDown}
            class={siderZeroTriggerVariants({ scheme: `${props.reverseArrow ? 'start' : 'end'}-${theme()}` })}
            style={props.zeroWidthTriggerStyle}
          >
            {customTrigger() ?? <span class="i-mdi-menu" aria-hidden="true" />}
          </span>
        </Show>
      </Show>
    </aside>
  )
}

const Layout = Object.assign(LayoutBase, { Header, Footer, Content, Sider })
export default Layout
