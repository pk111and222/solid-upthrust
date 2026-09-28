import { type Component, For, Show, createContext, createMemo, merge, useContext } from 'solid-js'
import type { JSX } from '@solidjs/web'
import Dropdown, { type DropdownMenuItem, type DropdownProps } from '../Dropdown'
import { mergeClass } from '../../common/merge'
import { numberToText } from '../../common/renderable'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'
import {
  BREADCRUMB_MENU_LINK_CLASS, BREADCRUMB_OVERLAY_ICON_CLASS,
  breadcrumbItemClass, breadcrumbLinkClass, breadcrumbListClass, breadcrumbOverlayClass, breadcrumbRootClass, breadcrumbSeparatorClass,
} from './styles'

/**
 * Breadcrumb 面包屑（对齐 antd 6）。
 *
 * 结构：nav > ol > li（项）+ li[aria-hidden]（分隔符）；最后一项后不渲染分隔符。
 * 有 href（或由 path 累积出 href）的项渲染为 a，其余为 span；两者都接收 onClick。
 * path 规则与 antd 一致：带 path 的项依次累积 paths，href 被覆盖为 `#/${paths.join('/')}`；
 * path 与字符串 title 中的 `:name` 用 params 替换。
 */

/** 下拉菜单项：title 是 label 的别名；path 时渲染为 `<a href={item.href + path}>`。 */
export interface BreadcrumbMenuItem {
  key?: string
  label?: JSX.Element
  title?: JSX.Element
  path?: string
  icon?: string
  disabled?: boolean
  danger?: boolean
  type?: 'divider'
  onClick?: () => void
}

export interface BreadcrumbMenuProps {
  items: BreadcrumbMenuItem[]
  onClick?: (key: string) => void
}

/** 透传给 Dropdown 的属性（placement 默认 'bottom'，trigger 默认 'hover'）。 */
export type BreadcrumbDropdownProps = Partial<Pick<DropdownProps,
  'trigger' | 'placement' | 'open' | 'defaultOpen' | 'onOpenChange' | 'disabled' | 'overlayClass' | 'overlayStyle'>>

export interface BreadcrumbItemType {
  key?: string
  /** 项内容；字符串中的 `:name` 用 params 替换。为 null / undefined 时整项（含其后分隔符）不渲染。 */
  title?: JSX.Element
  /** 链接地址；存在时渲染为 a。 */
  href?: string
  /** 路由片段：与前面各项的 path 拼接为 `#/a/b`，覆盖 href。 */
  path?: string
  /** 下拉菜单。 */
  menu?: BreadcrumbMenuProps
  /** 下拉菜单的 Dropdown 属性。 */
  dropdownProps?: BreadcrumbDropdownProps
  onClick?: (e: MouseEvent) => void
  /** 作用于该项的 a / span（与 antd className 一致；itemRender 时由调用方自行处理）。 */
  class?: string
  style?: JSX.CSSProperties
  /** `'separator'`：独立分隔符项，内容为 separator。 */
  type?: 'separator'
  /** type 为 'separator' 时的分隔符内容，默认 '/'。 */
  separator?: JSX.Element
  /** @deprecated 渲染该节点替代 title（旧版本兼容）；请改用 menu。 */
  dropdownRender?: JSX.Element
}

export type BreadcrumbParams = Record<string, string>

export type BreadcrumbItemRender = (
  route: BreadcrumbItemType, params: BreadcrumbParams, routes: BreadcrumbItemType[], paths: string[],
) => JSX.Element

export interface BreadcrumbClassNames { root?: string; item?: string; separator?: string }
export interface BreadcrumbStyles { root?: JSX.CSSProperties; item?: JSX.CSSProperties; separator?: JSX.CSSProperties }
export interface BreadcrumbSemanticInfo { props: BreadcrumbProps }

export interface BreadcrumbProps {
  /** 路由栈。传入时忽略 children。 */
  items?: BreadcrumbItemType[]
  /** 分隔符，默认 '/'。 */
  separator?: JSX.Element
  /** 路由参数。 */
  params?: BreadcrumbParams
  /** 自定义每项内容（替代默认的 a / span）。 */
  itemRender?: BreadcrumbItemRender
  classNames?: SemanticInput<BreadcrumbClassNames, BreadcrumbSemanticInfo>
  styles?: SemanticInput<BreadcrumbStyles, BreadcrumbSemanticInfo>
  class?: string
  style?: JSX.CSSProperties
  /** 旧写法：`<Breadcrumb.Item>` 子元素。 */
  children?: JSX.Element
}

export interface BreadcrumbItemProps {
  href?: string
  onClick?: (e: MouseEvent) => void
  menu?: BreadcrumbMenuProps
  dropdownProps?: BreadcrumbDropdownProps
  /** 覆盖该项后的分隔符。 */
  separator?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

/** antd getPath：去掉开头的 /，替换 :param。 */
const resolvePath = (params: BreadcrumbParams, path?: string) => {
  if (path === undefined) return undefined
  let merged = path.replace(/^\//, '')
  for (const key of Object.keys(params)) merged = merged.replace(`:${key}`, params[key]!)
  return merged
}

/** antd getBreadcrumbName：只替换字符串标题里的已知参数，未知参数原样保留。 */
const resolveTitle = (params: BreadcrumbParams, title: JSX.Element) => {
  if (title === undefined || title === null) return title
  if (typeof title !== 'string' && typeof title !== 'number') return title
  const keys = Object.keys(params)
  if (!keys.length) return String(title)
  const escaped = keys.map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  return String(title).replace(new RegExp(`:(${escaped})`, 'g'), (whole, key: string) => params[key] || whole)
}

const toDropdownItems = (items: BreadcrumbMenuItem[], href?: string): DropdownMenuItem[] =>
  items.map((item, index) => {
    const label = item.label ?? item.title
    return {
      key: item.key ?? String(index),
      label: item.path ? <a class={mergeClass(BREADCRUMB_MENU_LINK_CLASS)} href={`${href ?? ''}${item.path}`}>{numberToText(label)}</a> : numberToText(label) as JSX.Element,
      icon: item.icon, disabled: item.disabled, danger: item.danger, type: item.type, onClick: item.onClick,
    }
  })

/** 带 menu 的项：Dropdown 包住内容与下拉箭头。 */
const WithMenu = (p: { menu?: BreadcrumbMenuProps; dropdownProps?: BreadcrumbDropdownProps; href?: string; children: JSX.Element }) => (
  <Show when={p.menu} fallback={p.children}>
    {menu => (
      <Dropdown placement="bottom" {...p.dropdownProps} menu={{ items: toDropdownItems(menu().items, p.href), onClick: menu().onClick }}>
        <span class={breadcrumbOverlayClass()}>
          {p.children}
          <span aria-hidden="true" class={mergeClass(BREADCRUMB_OVERLAY_ICON_CLASS)} />
        </span>
      </Dropdown>
    )}
  </Show>
)

/** antd defaultItemRender：有 href 渲染 a，否则 span；onClick / class / style 两者都保留。 */
const Link = (p: { href?: string; onClick?: (e: MouseEvent) => void; class?: string; style?: JSX.CSSProperties; children: JSX.Element }) => (
  <Show
    when={p.href !== undefined}
    fallback={<span class={mergeClass(breadcrumbLinkClass({ kind: 'text' }), p.class)} style={p.style} onClick={e => p.onClick?.(e)}>{p.children}</span>}
  >
    <a class={mergeClass(breadcrumbLinkClass({ kind: 'anchor' }), p.class)} style={p.style} href={p.href} onClick={e => p.onClick?.(e)}>{p.children}</a>
  </Show>
)

/** 旧 children 写法：Item 自带其后的分隔符，列表用 CSS 隐藏最后一个。 */
const BreadcrumbContext = createContext<{ separator: () => JSX.Element; classNames: () => Partial<BreadcrumbClassNames>; styles: () => Partial<BreadcrumbStyles> } | null>(null)

const BreadcrumbItem: Component<BreadcrumbItemProps> = props => {
  const ctx = useContext(BreadcrumbContext)
  const separator = () => props.separator !== undefined ? props.separator : ctx?.separator() ?? '/'
  return (
    <>
      <li class={mergeClass(breadcrumbItemClass({ legacy: true }), ctx?.classNames().item, props.class)} style={{ ...ctx?.styles().item, ...props.style }}>
        <WithMenu menu={props.menu} dropdownProps={props.dropdownProps} href={props.href}>
          <Link href={props.href} onClick={props.onClick}>{numberToText(props.children)}</Link>
        </WithMenu>
      </li>
      <li data-breadcrumb-auto aria-hidden="true" class={mergeClass(breadcrumbSeparatorClass(), ctx?.classNames().separator)} style={ctx?.styles().separator}>
        {numberToText(separator())}
      </li>
    </>
  )
}

type Entry = { item: BreadcrumbItemType; index: number; href?: string; paths: string[] }

const Breadcrumb = (rawProps => {
  // Solid 2 的 merge 中显式传入的 undefined 会覆盖默认值；antd 的 separator={undefined} 仍回落到 '/'，故用 getter 兜底。
  const props = merge(rawProps, {
    get separator(): JSX.Element { return rawProps.separator === undefined ? '/' : rawProps.separator },
  })
  const info = (): BreadcrumbSemanticInfo => ({ props })
  const classNames = createMemo(() => resolveSemantic(props.classNames, info()))
  const styles = createMemo(() => resolveSemantic(props.styles, info()))
  const params = () => props.params ?? {}

  const entries = createMemo((): Entry[] => {
    const paths: string[] = []
    const pr = params()
    return (props.items ?? []).map((item, index) => {
      const path = resolvePath(pr, item.path)
      if (path !== undefined) paths.push(path)
      const href = item.type !== 'separator' && paths.length && path !== undefined ? `#/${paths.join('/')}` : item.href
      return { item, index, href, paths: [...paths] }
    })
  })
  const count = () => props.items?.length ?? 0

  const content = (entry: Entry): JSX.Element => {
    const { item } = entry
    if (props.itemRender) return props.itemRender(item, params(), props.items ?? [], entry.paths)
    if (item.dropdownRender !== undefined && !item.menu) return item.dropdownRender
    const title = resolveTitle(params(), item.title)
    if (title === undefined || title === null) return title
    return <Link href={entry.href} onClick={item.onClick} class={item.class} style={item.style}>{title}</Link>
  }

  const separatorLi = (node: JSX.Element) => (
    <li aria-hidden="true" class={mergeClass(breadcrumbSeparatorClass(), classNames().separator)} style={styles().separator}>{numberToText(node)}</li>
  )

  return (
    <nav aria-label="breadcrumb" class={mergeClass(breadcrumbRootClass(), props.class, classNames().root)} style={{ ...styles().root, ...props.style }}>
      <Show
        when={props.items}
        fallback={
          <BreadcrumbContext value={{ separator: () => props.separator, classNames, styles }}>
            <ol class={breadcrumbListClass({ legacy: true })}>{props.children}</ol>
          </BreadcrumbContext>
        }
      >
        <ol class={breadcrumbListClass({ legacy: false })}>
          <For each={entries()}>
            {entry => {
              const { item } = entry
              if (item.type === 'separator') return separatorLi(item.separator ?? '/')
              // 标题为 null / undefined（itemRender 也返回空）时整项不渲染，与 antd 一致。
              const node = createMemo(() => content(entry))
              // antd：每个非末项后追加分隔符；分隔符为空串 / null 时不渲染（配合 type:'separator' 自定义分隔用）。
              const last = () => entry.index === count() - 1
              const hasSeparator = () => !last() && props.separator !== '' && props.separator !== null && props.separator !== undefined && props.separator !== false
              return (
                <Show when={node() !== undefined && node() !== null}>
                  <li class={mergeClass(breadcrumbItemClass({ legacy: false }), classNames().item)} style={styles().item}>
                    <WithMenu menu={item.menu} dropdownProps={item.dropdownProps} href={entry.href}>{numberToText(node())}</WithMenu>
                  </li>
                  <Show when={hasSeparator()}>{separatorLi(props.separator)}</Show>
                </Show>
              )
            }}
          </For>
        </ol>
      </Show>
    </nav>
  )
}) as Component<BreadcrumbProps> & { Item: typeof BreadcrumbItem }

Breadcrumb.Item = BreadcrumbItem

export { BreadcrumbItem }
export default Breadcrumb
