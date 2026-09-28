import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { For, Show, createContext, createEffect, createMemo, createSignal, merge, omit, untrack, useContext } from 'solid-js'
import type { JSX } from '@solidjs/web'
import {
  createMenu, createTooltip, createTrigger,
  type MenuClickInfo, type MenuItem as HeadlessMenuItem, type MenuMode, type MenuNode, type MenuSelectInfo, type MenuTheme,
  type TriggerPlacement,
} from 'upthrust-competence'
import { mergeClass } from '../../common/merge'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'
import { numberToText } from '../../common/renderable'
import { SiderContext } from '../Layout/context'
import type { TooltipProps } from '../Tooltip'
import { tooltipArrowClass, tooltipOverlayClass } from '../Tooltip/styles'
import {
  MENU_GROUP_CLASS, MENU_GROUP_LIST_CLASS, MENU_LABEL_CLASS, MENU_NOICON_CLASS, MENU_TOOLTIP_CLASS,
  menuArrowClass, menuContentClass, menuDividerClass, menuExtraClass, menuGroupTitleClass, menuIconClass,
  menuInlineCollapseClass, menuInlineListClass, menuItemClass, menuPopupLayerClass, menuPopupListClass,
  menuRootClass, menuSubmenuClass,
} from './styles'

export type { MenuClickInfo, MenuMode, MenuSelectInfo, MenuTheme } from 'upthrust-competence'

/** 子菜单弹层自定义渲染（antd popupRender）：node 为默认弹层列表，keys 为根到该子菜单的 key 路径。 */
export type MenuPopupRender = (node: JSX.Element, info: { item: MenuItemType; keys: string[] }) => JSX.Element

/** 菜单项数据。菜单项 / 子菜单（有 children）/ 分组（type: 'group'）/ 分割线（type: 'divider'）。 */
export interface MenuItemType extends Omit<HeadlessMenuItem<JSX.Element>, 'children'> {
  children?: MenuItemType[]
  /** SubMenu：自定义弹层内容，优先于 Menu 的 popupRender。 */
  popupRender?: MenuPopupRender
}
/** 兼容旧名。 */
export type MenuItem = MenuItemType

type MenuSemanticSlots<T> = { root?: T; itemTitle?: T; list?: T; item?: T; itemIcon?: T; itemContent?: T }
/** 子菜单内的语义节点（antd subMenu）。 */
export type MenuSubMenuSemantic<T> = { item?: T; itemTitle?: T; list?: T; itemContent?: T; itemIcon?: T }
export type MenuClassNames = MenuSemanticSlots<string> & {
  popup?: string | { root?: string }
  subMenu?: MenuSubMenuSemantic<string>
}
export type MenuStyles = MenuSemanticSlots<JSX.CSSProperties> & {
  popup?: JSX.CSSProperties | { root?: JSX.CSSProperties }
  subMenu?: MenuSubMenuSemantic<JSX.CSSProperties>
}
export type MenuSemanticInfo = { props: MenuProps }

/** 收起时菜单项悬浮提示的配置（Tooltip 属性子集）。 */
export type MenuTooltipConfig = Partial<Omit<TooltipProps, 'children' | 'ref' | 'class' | 'style'>>

export type MenuExpandIconInfo = MenuItemType & { isSubMenu: true; isOpen: boolean }

export interface MenuRef {
  menu: HTMLUListElement
  /** 聚焦第一个可聚焦菜单项。 */
  focus: (options?: FocusOptions) => void
}

type RootAttributes = Omit<JSX.HTMLAttributes<HTMLUListElement>, 'onClick' | 'onSelect' | 'children' | 'class' | 'style' | 'ref' | 'title' | 'id'>

export interface MenuProps extends RootAttributes {
  items?: MenuItemType[]
  /** 默认 'vertical'。 */
  mode?: MenuMode
  /** 默认 'light'。 */
  theme?: MenuTheme
  selectedKeys?: string[]
  defaultSelectedKeys?: string[]
  openKeys?: string[]
  defaultOpenKeys?: string[]
  /** 是否允许多选，默认 false。 */
  multiple?: boolean
  /** 是否允许选中，默认 true。 */
  selectable?: boolean
  /** inline 时菜单是否收起；不传时跟随所在 Sider 的收起状态。 */
  inlineCollapsed?: boolean
  /** inline 模式每级缩进 px，默认 24。 */
  inlineIndent?: number
  /** 子菜单展开延时（秒），默认 0。 */
  subMenuOpenDelay?: number
  /** 子菜单收起延时（秒），默认 0.1。 */
  subMenuCloseDelay?: number
  /** 子菜单弹层的触发方式，默认 'hover'。 */
  triggerSubMenuAction?: 'hover' | 'click'
  /** 子菜单弹层在首次打开前也渲染 DOM。 */
  forceSubMenuRender?: boolean
  /** 自定义子菜单展开图标；null / false 不渲染。 */
  expandIcon?: JSX.Element | ((info: MenuExpandIconInfo) => JSX.Element) | null | false
  /** 收起时菜单项的悬浮提示；false 关闭。 */
  tooltip?: false | MenuTooltipConfig
  /** 自定义子菜单弹层内容。 */
  popupRender?: MenuPopupRender
  /** 把标签渲染为 JSX（例如原生导航链接）；分组标题同样生效。 */
  renderLabel?: (item: MenuItemType) => JSX.Element
  onClick?: (info: MenuClickInfo<MenuItemType>) => void
  onSelect?: (info: MenuSelectInfo<MenuItemType>) => void
  onDeselect?: (info: MenuSelectInfo<MenuItemType>) => void
  onOpenChange?: (openKeys: string[]) => void
  classNames?: SemanticInput<MenuClassNames, MenuSemanticInfo>
  styles?: SemanticInput<MenuStyles, MenuSemanticInfo>
  id?: string
  class?: string
  style?: JSX.CSSProperties
  ref?: (ref: MenuRef) => void
}

type Menu = ReturnType<typeof createMenu<MenuItemType>>

type MenuContextValue = {
  props: MenuProps
  menu: Menu
  classNames: () => Partial<MenuClassNames>
  styles: () => Partial<MenuStyles>
  /** Sider 收起或 inlineCollapsed：决定一级菜单项是否显示悬浮提示。 */
  tooltipCollapsed: () => boolean
}

const MenuContext = createContext<MenuContextValue | null>(null)
const useMenu = () => useContext(MenuContext)!

/** 每个节点所处的位置：是否在子菜单内、是否在弹层内、所在表面的主题、是否在分组内。 */
type NodeProps = {
  node: MenuNode<MenuItemType>
  firstLevel: boolean
  inPopup: boolean
  theme: MenuTheme
  grouped: boolean
}

type ItemLayout = 'block' | 'popup' | 'collapsed' | 'horizontal'

const hasNode = (value: unknown) => value !== undefined && value !== null && value !== false && value !== ''

const layoutOf = (menu: Menu, p: NodeProps): ItemLayout => {
  if (p.inPopup) return 'popup'
  if (menu.mode() === 'horizontal') return 'horizontal'
  if (menu.inlineCollapsed() && p.firstLevel) return 'collapsed'
  return 'block'
}

const inlinePadding = (ctx: MenuContextValue, node: MenuNode<MenuItemType>): JSX.CSSProperties | undefined =>
  ctx.menu.mode() === 'inline' ? { 'padding-left': `${node.path.length * (ctx.props.inlineIndent ?? 24)}px` } : undefined

const renderLabelOf = (ctx: MenuContextValue, item: MenuItemType) =>
  numberToText(ctx.props.renderLabel ? ctx.props.renderLabel(item) : item.label)

const IconSlot = (p: { icon: JSX.Element | string; collapsed: boolean; class?: string; style?: JSX.CSSProperties }) => (
  <Show
    when={typeof p.icon === 'string'}
    fallback={<span class={mergeClass(menuIconClass({ collapsed: p.collapsed }), p.class)} style={p.style}>{p.icon}</span>}
  >
    <span class={mergeClass(menuIconClass({ collapsed: p.collapsed }), p.icon as string, p.class)} style={p.style} aria-hidden="true" />
  </Show>
)

/** 图标 + 标题内容（菜单项与子菜单标题共用），含收起时无图标的首字符。 */
const ItemBody = (p: {
  item: MenuItemType
  firstLevel: boolean
  theme: MenuTheme
  iconClass?: string
  iconStyle?: JSX.CSSProperties
  contentClass?: string
  contentStyle?: JSX.CSSProperties
}) => {
  const ctx = useMenu()
  const collapsedFirst = () => ctx.menu.inlineCollapsed() && p.firstLevel
  const withIcon = () => hasNode(p.item.icon)
  const withExtra = () => p.item.extra !== undefined && p.item.extra !== null && p.item.extra !== false
  const noicon = () => collapsedFirst() && !withIcon() && typeof p.item.label === 'string' && p.item.label !== ''
  const label = createMemo(() => renderLabelOf(ctx, p.item))
  return (
    <>
      <Show when={withIcon()}>
        <IconSlot icon={p.item.icon!} collapsed={collapsedFirst()} class={p.iconClass} style={p.iconStyle} />
      </Show>
      <Show
        when={!noicon()}
        fallback={<div class={mergeClass(MENU_NOICON_CLASS)}>{(p.item.label as string).charAt(0)}</div>}
      >
        <span
          class={mergeClass(menuContentClass({ withIcon: withIcon(), withExtra: withExtra(), collapsed: collapsedFirst() }), p.contentClass)}
          style={p.contentStyle}
        >
          <Show when={withExtra()} fallback={label()}>
            <span class={mergeClass(MENU_LABEL_CLASS)}>{label()}</span>
            <span class={menuExtraClass({ theme: p.theme })}>{numberToText(p.item.extra)}</span>
          </Show>
        </span>
      </Show>
    </>
  )
}

// ---- item ----------------------------------------------------------------------
const ItemNode = (p: NodeProps) => {
  const ctx = useMenu()
  const { menu } = ctx
  const item = p.node.item
  const key = p.node.key
  const layout = () => layoutOf(menu, p)
  const selected = () => menu.isSelected(key)
  const tone = () => {
    const axis = layout() === 'horizontal' ? 'h' : 'v'
    const state = item.disabled ? 'disabled'
      : item.danger ? selected() ? 'danger-selected' : 'danger'
        : selected() ? 'selected' : 'idle'
    return `${p.theme}-${axis}-${state}` as const
  }
  const semantic = () => p.firstLevel ? ctx.classNames() : ctx.classNames().subMenu ?? {}
  const semanticStyle = () => p.firstLevel ? ctx.styles() : ctx.styles().subMenu ?? {}

  // ---- 收起时的悬浮提示（仅不在子菜单内的项；antd #56528：收起状态变化时复位受控 open）----
  const tooltipConfig = () => ctx.props.tooltip === false ? undefined : ctx.props.tooltip
  const tooltipTitle = (): JSX.Element => {
    const config = tooltipConfig()
    if (config?.title !== undefined) return config.title
    if (item.title === false) return ''
    if (typeof item.title === 'string') return item.title
    if (typeof item.label === 'string' || typeof item.label === 'number') return String(item.label)
    // 标签是 DOM 节点时不能同时挂在两处：renderLabel 重新渲染一份，否则取文本。
    if (ctx.props.renderLabel) return ctx.props.renderLabel(item)
    return item.label instanceof Node ? item.label.textContent ?? '' : ''
  }
  const hasTooltip = () => {
    if (ctx.props.tooltip === false || !ctx.tooltipCollapsed()) return false
    const config = tooltipConfig()
    if (config?.title !== undefined) return hasNode(config.title)
    return item.title !== false && (typeof item.title === 'string' ? item.title !== '' : hasNode(item.label))
  }
  const tip = p.firstLevel ? (() => {
    const [open, setOpen] = createSignal(false, { ownedWrite: true })
    createEffect(ctx.tooltipCollapsed, () => { setOpen(false) })
    const tooltip = createTooltip({
      get open() { return hasTooltip() ? tooltipConfig()?.open ?? open() : false },
      get disabled() { return !hasTooltip() },
      get placement(): TriggerPlacement { return tooltipConfig()?.placement ?? 'right' },
      get mouseEnterDelay() { return tooltipConfig()?.mouseEnterDelay },
      get mouseLeaveDelay() { return tooltipConfig()?.mouseLeaveDelay },
      onOpenChange: (value) => {
        setOpen(value)
        tooltipConfig()?.onOpenChange?.(value)
      },
    })
    return tooltip
  })() : undefined

  const setItem = (el: HTMLLIElement) => {
    tip?.triggerRef(el)
  }

  return (
    <>
      <li
        ref={setItem}
        role="menuitem"
        tabindex={item.disabled ? undefined : -1}
        aria-disabled={item.disabled ? 'true' : undefined}
        aria-selected={selected() ? 'true' : undefined}
        data-menu-owner={menu.id}
        data-menu-key={key}
        title={typeof item.title === 'string' ? item.title : undefined}
        class={mergeClass(
          menuItemClass({ layout: layout(), grouped: p.grouped && layout() !== 'horizontal', arrow: false, tone: tone() }),
          semantic().item,
        )}
        style={{ ...inlinePadding(ctx, p.node), ...semanticStyle().item }}
        onClick={(event: MouseEvent) => menu.click(key, event)}
      >
        <ItemBody
          item={item}
          firstLevel={p.firstLevel}
          theme={p.theme}
          iconClass={semantic().itemIcon}
          iconStyle={semanticStyle().itemIcon}
          contentClass={semantic().itemContent}
          contentStyle={semanticStyle().itemContent}
        />
      </li>
      <Show when={tip}>
        {(tooltip) => {
          const visible = () => tooltip().open() && hasTooltip()
          return (
            <Portal mount={tooltipConfig()?.getContainer?.()}>
              <Show when={tooltip().mounted()}>
                <div
                  ref={(el) => { tooltip().layerRef(el); tooltip().bindLayerHover() }}
                  class={mergeClass(
                    tooltipOverlayClass({ visible: visible(), placement: tooltip().actualPlacement() }),
                    MENU_TOOLTIP_CLASS,
                    tooltipConfig()?.overlayClass,
                  )}
                  style={{ ...tooltip().layerStyle(), ...tooltipConfig()?.overlayStyle }}
                  role="tooltip"
                  aria-hidden={!visible() ? 'true' : undefined}
                  inert={!visible()}
                >
                  {tooltipTitle()}
                  <Show when={tooltip().arrow()}>
                    {(arrow) => (
                      <span
                        class={tooltipArrowClass(arrow().side)}
                        style={arrow().side === 'left' || arrow().side === 'right' ? { top: `${arrow().y}px` } : { left: `${arrow().x}px` }}
                      />
                    )}
                  </Show>
                </div>
              </Show>
            </Portal>
          )
        }}
      </Show>
    </>
  )
}

// ---- submenu ---------------------------------------------------------------------
const SubMenuNode = (p: NodeProps) => {
  const ctx = useMenu()
  const { menu } = ctx
  const item = p.node.item
  const key = p.node.key
  const popupId = `${menu.id}-${key}-popup`
  const isInline = () => menu.mode() === 'inline'
  const horizontalRoot = () => menu.mode() === 'horizontal' && !p.inPopup
  const open = () => menu.isOpen(key)
  const layout = () => layoutOf(menu, p)
  /** 弹层主题：子菜单自身 theme，否则跟随 Menu（与 antd 一致，不继承父弹层）。 */
  const popupTheme = (): MenuTheme => item.theme ?? ctx.props.theme ?? 'light'
  const clickAction = () => ctx.props.triggerSubMenuAction === 'click'

  const tone = () => {
    const axis = layout() === 'horizontal' ? 'h' : 'v'
    const active = menu.isChildSelected(key) || (horizontalRoot() && open())
    const state = item.disabled ? 'disabled' : active ? 'active' : 'idle'
    return `${p.theme}-${axis}-${state}` as const
  }
  const semantic = () => ctx.classNames().subMenu ?? {}
  const semanticStyle = () => ctx.styles().subMenu ?? {}

  // 非 inline 模式的弹层：hover 由 createTrigger 处理；click 模式标题自行切换，
  // trigger 设为 manual 只负责定位与外部点击关闭（trigger 的 click 监听会阻止冒泡，吞掉标题 onClick）。
  const trigger = createTrigger({
    get open() { return open() },
    get disabled() { return !!item.disabled || isInline() },
    get action() { return clickAction() ? 'manual' : 'hover' },
    get placement(): TriggerPlacement { return horizontalRoot() ? 'bottomLeft' : 'rightTop' },
    offset: 0,
    get hoverOpenDelay() { return (ctx.props.subMenuOpenDelay ?? 0) * 1000 },
    get hoverDelay() { return (ctx.props.subMenuCloseDelay ?? 0.1) * 1000 },
    get lazyMount() { return !ctx.props.forceSubMenuRender },
    onOpenChange: (value) => menu.openChange(key, value),
  })

  let liEl: HTMLLIElement | undefined
  const setLi = (el: HTMLLIElement) => {
    liEl = el
    trigger.triggerRef(el)
  }

  const onTitleClick = (event: MouseEvent) => {
    if (item.disabled) return
    menu.titleClick(key, event)
    if (!isInline() && clickAction()) menu.toggleOpen(key)
  }

  const expandIcon = (): JSX.Element => {
    if (horizontalRoot()) return null
    const icon = ctx.props.expandIcon
    const collapsed = menu.inlineCollapsed() && p.firstLevel
    if (icon === null || icon === false) return null
    if (typeof icon === 'function') return icon({ ...item, isSubMenu: true, isOpen: open() })
    if (icon !== undefined) return <span class={menuArrowClass({ direction: 'down', collapsed })}>{icon}</span>
    const direction = isInline() ? open() ? 'up' : 'down' : 'right'
    return <span class={mergeClass(menuArrowClass({ direction, collapsed }), 'i-mdi-chevron-down')} aria-hidden="true" />
  }

  const children = (inPopup: boolean, theme: MenuTheme) => (
    <NodeList nodes={p.node.children} firstLevel={false} inPopup={inPopup} theme={theme} grouped={false} />
  )

  const popupClass = () => {
    const value = ctx.classNames().popup
    return typeof value === 'string' ? value : value?.root
  }
  const popupStyle = (): JSX.CSSProperties | undefined => {
    const value = ctx.styles().popup as { root?: JSX.CSSProperties } & JSX.CSSProperties | undefined
    return value && 'root' in value ? value.root : value
  }
  const popupOffset = (): JSX.CSSProperties | undefined => {
    const offset = item.popupOffset
    return offset ? { 'margin-left': `${offset[0]}px`, 'margin-top': `${offset[1]}px` } : undefined
  }
  // 水平一级弹层最小宽度与标题同宽（rc popupStyle minWidth），不低于 160。
  const listMinWidth = () => horizontalRoot() && trigger.open() && liEl ? { 'min-width': `max(160px, ${liEl.offsetWidth}px)` } : undefined

  const popupContent = () => {
    const list = (
      <ul
        role="menu"
        data-menu-list=""
        id={popupId}
        class={mergeClass(menuPopupListClass({ theme: popupTheme() }), semantic().list)}
        style={{ ...listMinWidth(), ...semanticStyle().list }}
      >
        {children(true, popupTheme())}
      </ul>
    )
    const render = item.popupRender ?? ctx.props.popupRender
    return render ? render(list, { item, keys: p.node.path }) : list
  }

  const layer = () => {
    const visible = () => trigger.open()
    return (
      <Show when={trigger.mounted()}>
        <div
          ref={(el) => { trigger.layerRef(el); trigger.bindLayerHover() }}
          class={mergeClass(
            menuPopupLayerClass({ visible: visible(), placement: trigger.actualPlacement() }),
            item.popupClassName,
            popupClass(),
          )}
          style={{ ...trigger.layerStyle(), ...popupOffset(), ...popupStyle() }}
          aria-hidden={!visible() ? 'true' : undefined}
          inert={!visible()}
        >
          {popupContent()}
        </div>
      </Show>
    )
  }

  return (
    <li ref={setLi} role="none" class={menuSubmenuClass({ horizontal: horizontalRoot() })}>
      <div
        role="menuitem"
        tabindex={item.disabled ? undefined : -1}
        aria-expanded={open() ? 'true' : 'false'}
        aria-haspopup="true"
        aria-controls={popupId}
        aria-disabled={item.disabled ? 'true' : undefined}
        data-menu-owner={menu.id}
        data-menu-key={key}
        title={typeof item.label === 'string' ? item.label : undefined}
        class={menuItemClass({
          layout: layout(),
          grouped: p.grouped && layout() !== 'horizontal',
          arrow: layout() !== 'horizontal' && !(menu.inlineCollapsed() && p.firstLevel),
          tone: tone(),
        })}
        style={inlinePadding(ctx, p.node)}
        onClick={onTitleClick}
      >
        <ItemBody
          item={item}
          firstLevel={p.firstLevel}
          theme={p.theme}
          iconClass={ctx.classNames().itemIcon}
          iconStyle={ctx.styles().itemIcon}
        />
        {expandIcon()}
      </div>
      <Show
        when={isInline()}
        fallback={
          // 嵌套弹层直接渲染在父弹层内（以其为定位祖先）：不被父列表 overflow 裁剪，
          // hover 从标题移入子弹层时不离开 li；一级弹层走 Portal 脱离 Sider 等裁剪容器。
          <Show when={p.inPopup} fallback={<Portal>{layer()}</Portal>}>
            {layer()}
          </Show>
        }
      >
        <div class={menuInlineCollapseClass({ open: open() })}>
          <ul
            role="menu"
            data-menu-list=""
            id={popupId}
            class={mergeClass(menuInlineListClass({ theme: p.theme }), semantic().list)}
            style={semanticStyle().list}
            inert={!open()}
          >
            {children(false, p.theme)}
          </ul>
        </div>
      </Show>
    </li>
  )
}

// ---- group / divider ---------------------------------------------------------------
const GroupNode = (p: NodeProps) => {
  const ctx = useMenu()
  const item = p.node.item
  const inset = () => ctx.menu.inlineCollapsed() && p.firstLevel ? 'collapsed'
    : ctx.menu.mode() === 'inline' && p.node.path.length > 0 ? 'inline-sub' : 'root'
  const semantic = () => p.firstLevel ? ctx.classNames() : ctx.classNames().subMenu ?? {}
  const semanticStyle = () => p.firstLevel ? ctx.styles() : ctx.styles().subMenu ?? {}
  return (
    <li role="presentation" class={mergeClass(MENU_GROUP_CLASS)} onClick={(event: MouseEvent) => event.stopPropagation()}>
      <div
        role="presentation"
        title={typeof item.label === 'string' ? item.label : undefined}
        class={mergeClass(menuGroupTitleClass({ theme: p.theme, inset: inset() }), semantic().itemTitle)}
        style={semanticStyle().itemTitle}
      >
        {renderLabelOf(ctx, item)}
      </div>
      <ul role="group" class={mergeClass(MENU_GROUP_LIST_CLASS, semantic().list)} style={semanticStyle().list}>
        <NodeList nodes={p.node.children} firstLevel={p.firstLevel} inPopup={p.inPopup} theme={p.theme} grouped />
      </ul>
    </li>
  )
}

const NodeView = (p: NodeProps) => {
  switch (p.node.kind) {
    case 'divider':
      return <li role="separator" class={menuDividerClass({ theme: p.theme, dashed: !!p.node.item.dashed })} />
    case 'group':
      return <GroupNode {...p} />
    case 'submenu':
      return <SubMenuNode {...p} />
    default:
      return <ItemNode {...p} />
  }
}

const NodeList = (p: Omit<NodeProps, 'node'> & { nodes: MenuNode<MenuItemType>[] }) => (
  <For each={p.nodes}>
    {(node) => <NodeView node={node} firstLevel={p.firstLevel} inPopup={p.inPopup} theme={p.theme} grouped={p.grouped} />}
  </For>
)

// ---- root ------------------------------------------------------------------------
const OWN_PROPS = [
  'items', 'mode', 'theme', 'selectedKeys', 'defaultSelectedKeys', 'openKeys', 'defaultOpenKeys', 'multiple',
  'selectable', 'inlineCollapsed', 'inlineIndent', 'subMenuOpenDelay', 'subMenuCloseDelay', 'triggerSubMenuAction',
  'forceSubMenuRender', 'expandIcon', 'tooltip', 'popupRender', 'renderLabel', 'onClick', 'onSelect', 'onDeselect',
  'onOpenChange', 'classNames', 'styles', 'id', 'class', 'style', 'ref',
] as const

const Menu = (rawProps: MenuProps) => {
  const sider = useContext(SiderContext)
  const props = merge({ mode: 'vertical' as MenuMode, theme: 'light' as MenuTheme, inlineIndent: 24 }, rawProps)
  const rest = omit(props, ...OWN_PROPS)
  const mergedInlineCollapsed = () => props.inlineCollapsed ?? sider?.siderCollapsed

  const menu = createMenu<MenuItemType>({
    get items() { return props.items },
    get mode() { return props.mode },
    get inlineCollapsed() { return mergedInlineCollapsed() },
    get selectable() { return props.selectable },
    get multiple() { return props.multiple },
    get selectedKeys() { return props.selectedKeys },
    get defaultSelectedKeys() { return props.defaultSelectedKeys },
    get openKeys() { return props.openKeys },
    get defaultOpenKeys() { return props.defaultOpenKeys },
    get onClick() { return props.onClick },
    get onSelect() { return props.onSelect },
    get onDeselect() { return props.onDeselect },
    get onOpenChange() { return props.onOpenChange },
    get id() { return props.id },
  })

  const semanticInfo: MenuSemanticInfo = { props }
  const classNames = createMemo(() => resolveSemantic(props.classNames, semanticInfo))
  const styles = createMemo(() => resolveSemantic(props.styles, semanticInfo))

  const context: MenuContextValue = {
    props,
    menu,
    classNames,
    styles,
    tooltipCollapsed: () => !!(sider?.siderCollapsed || mergedInlineCollapsed()),
  }

  let rootEl: HTMLUListElement | undefined
  const setRoot = (el: HTMLUListElement) => {
    rootEl = el
    untrack(() => props.ref?.({ menu: el, focus: (options) => menu.focus(el, options) }))
  }

  return (
    <MenuContext value={context}>
      <ul
        {...rest}
        ref={setRoot}
        role="menu"
        tabindex={0}
        data-menu-list=""
        id={menu.id}
        class={mergeClass(
          menuRootClass({ scheme: `${props.theme}-${menu.mode()}`, collapsed: menu.inlineCollapsed() }),
          classNames().root,
          props.class,
        )}
        style={{ ...styles().root, ...props.style }}
        onKeyDown={(event: KeyboardEvent) => menu.onKeyDown(event, rootEl)}
      >
        <NodeList nodes={menu.nodes()} firstLevel inPopup={false} theme={props.theme} grouped={false} />
      </ul>
    </MenuContext>
  )
}

export default Menu
