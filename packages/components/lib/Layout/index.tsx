import { Component,  Show, createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createSider, type Breakpoint, type SiderCollapseType } from 'upthrust-competence'
import { layoutClass, headerClass, footerClass, contentClass, siderClass, siderTriggerClass, type SiderTheme } from './styles'
import { twMerge } from 'tailwind-merge'

export interface LayoutProps {
  hasSider?: boolean
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface HeaderProps {
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface FooterProps {
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface ContentProps {
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface SiderProps {
  width?: number | string
  collapsedWidth?: number | string
  collapsed?: boolean
  defaultCollapsed?: boolean
  collapsible?: boolean
  breakpoint?: Breakpoint
  onCollapse?: (collapsed: boolean, type: SiderCollapseType) => void
  onBreakpoint?: (broken: boolean) => void
  trigger?: JSX.Element | null
  reverseArrow?: boolean
  theme?: SiderTheme
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

const LayoutBase: Component<LayoutProps> = (rawProps) => {
  const props = merge({}, rawProps)

  const _class = createMemo(() =>
    twMerge(
      layoutClass({ direction: props.hasSider ? 'horizontal' : 'vertical' }),
      props.class || ''
    )
  )

  return (
    <section class={_class()} style={props.style}>
      {props.children}
    </section>
  )
}

export const Header: Component<HeaderProps> = (rawProps) => {
  const props = merge({}, rawProps)

  const _class = createMemo(() =>
    twMerge(headerClass({}), props.class || '')
  )

  return (
    <header class={_class()} style={props.style}>
      {props.children}
    </header>
  )
}

export const Footer: Component<FooterProps> = (rawProps) => {
  const props = merge({}, rawProps)

  const _class = createMemo(() =>
    twMerge(footerClass({}), props.class || '')
  )

  return (
    <footer class={_class()} style={props.style}>
      {props.children}
    </footer>
  )
}

export const Content: Component<ContentProps> = (rawProps) => {
  const props = merge({}, rawProps)

  const _class = createMemo(() =>
    twMerge(contentClass({}), props.class || '')
  )

  return (
    <main class={_class()} style={props.style}>
      {props.children}
    </main>
  )
}

export const Sider: Component<SiderProps> = (rawProps) => {
  const props = merge(
    { width: 200, collapsedWidth: 80, collapsible: false, reverseArrow: false, theme: 'dark' as const },
    rawProps
  )

  const sider = createSider({
    get collapsed() { return props.collapsed },
    get defaultCollapsed() { return props.defaultCollapsed },
    get breakpoint() { return props.breakpoint },
    get onCollapse() { return props.onCollapse },
    get onBreakpoint() { return props.onBreakpoint },
  })

  const isCollapsed = sider.collapsed

  const currentWidth = createMemo(() => {
    const w = isCollapsed() ? props.collapsedWidth : props.width
    return typeof w === 'number' ? `${w}px` : w
  })

  const _class = createMemo(() =>
    twMerge(siderClass({ theme: props.theme }), props.class || '')
  )

  const _style = createMemo((): JSX.CSSProperties => ({
    width: currentWidth(),
    'max-width': currentWidth(),
    'min-width': currentWidth(),
    ...props.style,
  }))

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      sider.toggle()
    }
  }

  return (
    <aside class={_class()} style={_style()}>
      <div class="h-full">{props.children}</div>
      <Show when={props.collapsible && props.trigger !== null}>
        <div
          class={siderTriggerClass({ theme: props.theme })}
          role="button"
          tabindex={0}
          aria-expanded={isCollapsed() ? 'false' : 'true'}
          aria-label="Toggle sidebar"
          onClick={() => sider.toggle()}
          onKeyDown={handleKeyDown}
        >
          <Show when={props.trigger} fallback={
            <Show
              when={isCollapsed()
                ? (props.reverseArrow ? 'i-mdi-chevron-left' : 'i-mdi-chevron-right')
                : (props.reverseArrow ? 'i-mdi-chevron-right' : 'i-mdi-chevron-left')}
              keyed
            >
              {(iconClass) => <div class={`${iconClass} text-xl`} />}
            </Show>
          }>
            {props.trigger}
          </Show>
        </div>
      </Show>
    </aside>
  )
}

const Layout = Object.assign(LayoutBase, { Header, Footer, Content, Sider })
export default Layout
