import { For, Show, createEffect, createMemo, createSignal, merge, onCleanup, untrack } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createAnchor, type AnchorItem, type AnchorIns } from 'upthrust-competence'
import { mergeClass } from '../../common/merge'
import Affix from '../Affix'
import { anchorContainerClass, anchorInkClass, anchorLinkClass, anchorTitleClass, anchorWrapperClass } from './styles'

export type { AnchorIns }
export type AnchorDirection = 'vertical' | 'horizontal'
export type AnchorContainer = HTMLElement | Window

/** 锚点链接（antd AnchorLinkItemProps）。 */
export interface AnchorLinkItemProps {
  /** 唯一标识。 */
  key: string
  /** 锚点链接，形如 `#section`；以 http(s):// 开头视为外链。 */
  href: string
  title: JSX.Element
  /** 原生 a 的 target。 */
  target?: string
  /** 点击时替换当前历史记录而不是新增（覆盖 Anchor 的 replace）。 */
  replace?: boolean
  /** 嵌套链接；horizontal 方向下忽略。 */
  children?: AnchorLinkItemProps[]
}

/** 兼容旧名。 */
export type AnchorLinkItem = AnchorLinkItemProps

export interface AnchorProps {
  items: AnchorLinkItemProps[]
  /** 方向，默认 vertical。 */
  direction?: AnchorDirection
  /** 是否用 Affix 固定，默认 true。 */
  affix?: boolean
  /** 距离窗口顶部达到该值时固定（传给 Affix），同时作为 targetOffset 的默认值。 */
  offsetTop?: number
  /** 锚点滚动与高亮判定的偏移量，默认取 offsetTop，都未设为 0。 */
  targetOffset?: number
  /** 锚点区域边界（px），默认 5。 */
  bounds?: number
  /** 滚动容器，默认 window。 */
  getContainer?: () => AnchorContainer | undefined
  /** getContainer 的旧名，保留兼容。 */
  getScrollContainer?: () => AnchorContainer | undefined
  /** 自定义高亮：参数为滚动计算出的 href，返回要高亮的 href（兼容返回 key）。 */
  getCurrentAnchor?: (activeLink: string) => string
  /** 高亮链接变化，参数为 href（无高亮时为空字符串）。 */
  onChange?: (currentActiveLink: string) => void
  /** 点击链接；调用 e.preventDefault() 可阻止写入地址栏。 */
  onClick?: (e: MouseEvent, link: { title: JSX.Element; href: string }) => void
  /** 点击时替换历史记录，默认 false。 */
  replace?: boolean
  /** affix={false} 时是否仍显示 ink 指示条，默认 false（仅 vertical；horizontal 始终显示）。 */
  showInkInFixed?: boolean
  class?: string
  style?: JSX.CSSProperties
  /** 取得 headless 实例（activeKey / scrollTo）。 */
  ref?: (instance: AnchorIns) => void
}

type InkStyle = { top?: string; height?: string; left?: string; width?: string }

const isExternal = (href: string) => /^https?:\/\//.test(href)

const Anchor = (rawProps: AnchorProps) => {
  const props = merge({ direction: 'vertical' as AnchorDirection, affix: true, bounds: 5, replace: false, showInkInFixed: false }, rawProps)
  const horizontal = () => props.direction === 'horizontal'

  const flat = createMemo(() => {
    const result: AnchorLinkItemProps[] = []
    const walk = (list: AnchorLinkItemProps[] | undefined) => list?.forEach(item => { result.push(item); if (!horizontal()) walk(item.children) })
    walk(props.items)
    return result
  })
  const hrefOf = (key: string) => flat().find(item => item.key === key)?.href ?? ''
  /** getCurrentAnchor 返回 href；为兼容旧用法，也接受 key。 */
  const keyOf = (value: string) => flat().find(item => item.href === value)?.key ?? flat().find(item => item.key === value)?.key ?? ''
  /** Affix 的 target：未传容器时回落到 window（Affix 的 target 返回空值表示暂停固钉）。 */
  const container = () => (props.getContainer ?? props.getScrollContainer)?.() ?? (typeof window === 'undefined' ? undefined : window)

  let lastHref = ''
  const anchor = createAnchor({
    // horizontal 忽略 children：只对顶层链接做 scroll-spy。
    get items() { return (horizontal() ? props.items.map(({ children: _children, ...item }) => item) : props.items) as unknown as AnchorItem[] },
    get targetOffset() { return props.targetOffset ?? props.offsetTop ?? 0 },
    get bounds() { return props.bounds },
    get getScrollContainer() { return props.getContainer ?? props.getScrollContainer },
    get getCurrentAnchor() {
      const custom = props.getCurrentAnchor
      return custom ? (key: string) => keyOf(custom(hrefOf(key))) : undefined
    },
    // antd：onChange 收到的是经过 getCurrentAnchor 之后的 href，且只在它真正变化时触发。
    onChange: key => {
      const custom = props.getCurrentAnchor
      const href = custom ? hrefOf(keyOf(custom(hrefOf(key)))) : hrefOf(key)
      if (href === lastHref) return
      lastHref = href
      props.onChange?.(href)
    },
  })
  untrack(() => props.ref?.(anchor.refs))

  let listEl: HTMLDivElement | undefined
  const [ink, setInk] = createSignal<InkStyle | undefined>(undefined, { ownedWrite: true })
  const titleOf = (key: string) => [...(listEl?.querySelectorAll<HTMLElement>('a[data-anchor-key]') ?? [])].find(el => el.dataset.anchorKey === key)
  const measure = () => {
    const el = titleOf(anchor.activeKey())
    if (!el) { setInk(undefined); return }
    setInk(horizontal()
      ? { left: `${el.offsetLeft}px`, width: `${el.offsetWidth}px` }
      : { top: `${el.offsetTop}px`, height: `${el.offsetHeight}px` })
  }
  // Solid 2 的函数 ref 在 DOM 插入前执行：测量推迟到下一帧，激活项、方向或链接变化时重测。
  let frame: number | undefined
  const scheduleMeasure = () => {
    if (typeof window === 'undefined') return
    if (frame !== undefined) window.cancelAnimationFrame(frame)
    frame = window.requestAnimationFrame(() => { frame = undefined; measure() })
  }
  createEffect(() => [anchor.activeKey(), props.direction, props.items] as const, () => { scheduleMeasure() })
  const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => scheduleMeasure())
  onCleanup(() => {
    observer?.disconnect()
    if (frame !== undefined) window.cancelAnimationFrame(frame)
  })

  // antd：vertical 在 affix={false} 且未开 showInkInFixed 时隐藏 ink（wrapper 带 -fixed）；horizontal 始终显示。
  const inkVisible = () => !!anchor.activeKey() && !!ink() && (horizontal() || props.affix || props.showInkInFixed)

  const onLinkClick = (event: MouseEvent, item: AnchorLinkItemProps) => {
    props.onClick?.(event, { title: item.title, href: item.href })
    anchor.scrollTo(item.key)
    // 调用方 preventDefault 时不写地址栏（antd：支持点击锚点不记录历史）。
    if (event.defaultPrevented) return
    const replace = item.replace ?? props.replace
    if (isExternal(item.href)) {
      if (replace) { event.preventDefault(); window.location.replace(item.href) }
      return
    }
    event.preventDefault()
    window.history[replace ? 'replaceState' : 'pushState'](null, '', item.href)
  }

  const Link = (p: { item: AnchorLinkItemProps; nested: boolean }) => {
    const active = () => anchor.activeKey() === p.item.key
    return (
      <div class={anchorLinkClass({ layout: horizontal() ? 'horizontal' : p.nested ? 'nested' : 'vertical' })}>
        <a
          href={p.item.href} target={p.item.target} title={typeof p.item.title === 'string' ? p.item.title : undefined}
          data-anchor-key={p.item.key} aria-current={active() ? 'location' : undefined}
          class={anchorTitleClass({ state: active() ? 'active' : 'idle', spacing: horizontal() ? 'horizontal' : 'vertical' })}
          onClick={event => onLinkClick(event, p.item)}
        >
          {p.item.title}
        </a>
        <Show when={!horizontal() && p.item.children?.length}>
          <For each={p.item.children}>{child => <Link item={child} nested />}</For>
        </Show>
      </div>
    )
  }

  const content = () => (
    <div
      class={mergeClass(anchorWrapperClass({ direction: props.direction }), props.class)}
      style={{ 'max-height': horizontal() ? undefined : props.offsetTop ? `calc(100vh - ${props.offsetTop}px)` : '100vh', ...props.style }}
    >
      <div
        ref={el => { listEl = el; observer?.observe(el) }}
        class={anchorContainerClass({ direction: props.direction })}
        data-anchor-direction={props.direction}
      >
        <span aria-hidden="true" data-anchor-ink class={anchorInkClass({ direction: props.direction, visible: inkVisible() })} style={ink()} />
        <For each={props.items}>{item => <Link item={item} nested={false} />}</For>
      </div>
    </div>
  )

  return (
    <Show when={props.affix} fallback={content()}>
      <Affix offsetTop={props.offsetTop} target={container}>{content()}</Affix>
    </Show>
  )
}

export default Anchor
