import { JSX } from '@solidjs/web';
import { createMenu, MenuClickInfo, MenuItem as HeadlessMenuItem, MenuMode, MenuSelectInfo, MenuTheme } from 'upthrust-competence';
import { SemanticInput } from '../../common/semantic';
import { TooltipProps } from '../Tooltip';
export type { MenuClickInfo, MenuMode, MenuSelectInfo, MenuTheme } from 'upthrust-competence';
/** 子菜单弹层自定义渲染（antd popupRender）：node 为默认弹层列表，keys 为根到该子菜单的 key 路径。 */
export type MenuPopupRender = (node: JSX.Element, info: {
    item: MenuItemType;
    keys: string[];
}) => JSX.Element;
/** 菜单项数据。菜单项 / 子菜单（有 children）/ 分组（type: 'group'）/ 分割线（type: 'divider'）。 */
export interface MenuItemType extends Omit<HeadlessMenuItem<JSX.Element>, 'children'> {
    children?: MenuItemType[];
    /** SubMenu：自定义弹层内容，优先于 Menu 的 popupRender。 */
    popupRender?: MenuPopupRender;
}
/** 兼容旧名。 */
export type MenuItem = MenuItemType;
type MenuSemanticSlots<T> = {
    root?: T;
    itemTitle?: T;
    list?: T;
    item?: T;
    itemIcon?: T;
    itemContent?: T;
};
/** 子菜单内的语义节点（antd subMenu）。 */
export type MenuSubMenuSemantic<T> = {
    item?: T;
    itemTitle?: T;
    list?: T;
    itemContent?: T;
    itemIcon?: T;
};
export type MenuClassNames = MenuSemanticSlots<string> & {
    popup?: string | {
        root?: string;
    };
    subMenu?: MenuSubMenuSemantic<string>;
};
export type MenuStyles = MenuSemanticSlots<JSX.CSSProperties> & {
    popup?: JSX.CSSProperties | {
        root?: JSX.CSSProperties;
    };
    subMenu?: MenuSubMenuSemantic<JSX.CSSProperties>;
};
export type MenuSemanticInfo = {
    props: MenuProps;
};
/** 收起时菜单项悬浮提示的配置（Tooltip 属性子集）。 */
export type MenuTooltipConfig = Partial<Omit<TooltipProps, 'children' | 'ref' | 'class' | 'style'>>;
export type MenuExpandIconInfo = MenuItemType & {
    isSubMenu: true;
    isOpen: boolean;
};
export interface MenuRef {
    menu: HTMLUListElement;
    /** 聚焦第一个可聚焦菜单项。 */
    focus: (options?: FocusOptions) => void;
}
type RootAttributes = Omit<JSX.HTMLAttributes<HTMLUListElement>, 'onClick' | 'onSelect' | 'children' | 'class' | 'style' | 'ref' | 'title' | 'id'>;
export interface MenuProps extends RootAttributes {
    items?: MenuItemType[];
    /** 默认 'vertical'。 */
    mode?: MenuMode;
    /** 默认 'light'。 */
    theme?: MenuTheme;
    selectedKeys?: string[];
    defaultSelectedKeys?: string[];
    openKeys?: string[];
    defaultOpenKeys?: string[];
    /** 是否允许多选，默认 false。 */
    multiple?: boolean;
    /** 是否允许选中，默认 true。 */
    selectable?: boolean;
    /** inline 时菜单是否收起；不传时跟随所在 Sider 的收起状态。 */
    inlineCollapsed?: boolean;
    /** inline 模式每级缩进 px，默认 24。 */
    inlineIndent?: number;
    /** 子菜单展开延时（秒），默认 0。 */
    subMenuOpenDelay?: number;
    /** 子菜单收起延时（秒），默认 0.1。 */
    subMenuCloseDelay?: number;
    /** 子菜单弹层的触发方式，默认 'hover'。 */
    triggerSubMenuAction?: 'hover' | 'click';
    /** 子菜单弹层在首次打开前也渲染 DOM。 */
    forceSubMenuRender?: boolean;
    /** 自定义子菜单展开图标；null / false 不渲染。 */
    expandIcon?: JSX.Element | ((info: MenuExpandIconInfo) => JSX.Element) | null | false;
    /** 收起时菜单项的悬浮提示；false 关闭。 */
    tooltip?: false | MenuTooltipConfig;
    /** 自定义子菜单弹层内容。 */
    popupRender?: MenuPopupRender;
    /** 把标签渲染为 JSX（例如原生导航链接）；分组标题同样生效。 */
    renderLabel?: (item: MenuItemType) => JSX.Element;
    onClick?: (info: MenuClickInfo<MenuItemType>) => void;
    onSelect?: (info: MenuSelectInfo<MenuItemType>) => void;
    onDeselect?: (info: MenuSelectInfo<MenuItemType>) => void;
    onOpenChange?: (openKeys: string[]) => void;
    classNames?: SemanticInput<MenuClassNames, MenuSemanticInfo>;
    styles?: SemanticInput<MenuStyles, MenuSemanticInfo>;
    id?: string;
    class?: string;
    style?: JSX.CSSProperties;
    ref?: (ref: MenuRef) => void;
}
type Menu = ReturnType<typeof createMenu<MenuItemType>>;
declare const Menu: (rawProps: MenuProps) => JSX.Element;
export default Menu;
