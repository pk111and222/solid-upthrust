import { Component, JSX, Show, createMemo, createSignal, mergeProps, children as resolveChildren } from 'solid-js'
import { layoutClass, headerClass, footerClass, contentClass, siderClass } from './styles'
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
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  onCollapse?: (collapsed: boolean) => void
  trigger?: JSX.Element | null
  reverseArrow?: boolean
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

const LayoutBase: Component<LayoutProps> = (rawProps) => {
  const props = mergeProps({}, rawProps)

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
  const props = mergeProps({}, rawProps)

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
  const props = mergeProps({}, rawProps)

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
  const props = mergeProps({}, rawProps)

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
  const props = mergeProps(
    { width: 200, collapsedWidth: 80, collapsible: false, reverseArrow: false },
    rawProps
  )

  const [collapsed, setCollapsed] = createSignal(props.defaultCollapsed ?? props.collapsed ?? false)

  const isCollapsed = createMemo(() => props.collapsed !== undefined ? props.collapsed : collapsed())

  const currentWidth = createMemo(() => {
    const w = isCollapsed() ? props.collapsedWidth : props.width
    return typeof w === 'number' ? `${w}px` : w
  })

  const _class = createMemo(() =>
    twMerge(siderClass({ collapsed: isCollapsed() }), props.class || '')
  )

  const _style = createMemo((): JSX.CSSProperties => ({
    width: currentWidth(),
    'max-width': currentWidth(),
    'min-width': currentWidth(),
    ...props.style,
  }))

  const handleToggle = () => {
    const next = !isCollapsed()
    setCollapsed(next)
    props.onCollapse?.(next)
  }

  return (
    <aside class={_class()} style={_style()}>
      <div class="h-full">{props.children}</div>
      <Show when={props.collapsible && props.trigger !== null}>
        <div
          class="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-center cursor-pointer border-t border-solid border-outline/10 bg-surface-variant/20 hover:bg-surface-variant/40 transition-colors"
          onClick={handleToggle}
        >
          <Show when={props.trigger} fallback={
            <div class={`i-mdi-chevron-${isCollapsed() ? (props.reverseArrow ? 'left' : 'right') : (props.reverseArrow ? 'right' : 'left')} text-xl text-on-surface-variant`} />
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
