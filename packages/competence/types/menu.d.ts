/**
 * Headless logic for Menu — the rc-menu (@rc-component/menu 1.5) state core.
 *
 *  - key-path registry derived from the items tree (groups are NOT part of a
 *    path, dividers are skipped); keyless groups / dividers get stable
 *    positional keys so the UI can iterate the same normalized tree
 *  - selection: selectable / multiple, onClick fires BEFORE onSelect /
 *    onDeselect, and (single-select, non-inline) any click closes every open
 *    popup — whether or not the menu is selectable
 *  - open keys: remove-then-push ordering, closing a popup in non-inline mode
 *    also closes its sub-path popups, callbacks fire only when the list changed
 *  - mode derivation: inline / vertical + inlineCollapsed → internal vertical
 *    + collapsed; after mount a mode change restores the cached inline open
 *    keys when entering inline, otherwise clears them (onOpenChange fires)
 *  - keyboard: the rc useAccessibility port, DOM-driven through
 *    `data-menu-owner` / `data-menu-key` markers so portaled popups take part
 *
 * Imperative reads go through synchronous mirrors because Solid 2 commits
 * signal writes in batches: a click right after an open-change in the same
 * tick must see the pending keys.
 */
export type MenuMode = 'vertical' | 'horizontal' | 'inline';
export type MenuTheme = 'light' | 'dark';
export type MenuItemKind = 'item' | 'submenu' | 'group' | 'divider';
/**
 * Item shape shared by the headless and UI layers. `Node` is the renderable
 * node type (JSX.Element in the UI layer); the headless layer never renders.
 */
export type MenuItem<Node = unknown> = {
    /** Unique key. Optional for groups and dividers. */
    key?: string;
    label?: Node;
    icon?: Node | string;
    /** Collapsed tooltip title; `false` disables the tooltip for this item. */
    title?: string | false;
    extra?: Node;
    disabled?: boolean;
    danger?: boolean;
    /** Divider only: dashed line. */
    dashed?: boolean;
    type?: 'item' | 'submenu' | 'group' | 'divider';
    children?: MenuItem<Node>[];
    /** SubMenu only: popup theme, inherits from the menu by default. */
    theme?: MenuTheme;
    /** SubMenu only: extra class on the popup (no effect in inline mode). */
    popupClassName?: string;
    /** SubMenu only: [x, y] popup offset in px (no effect in inline mode). */
    popupOffset?: [number, number];
    /** SubMenu only: title click callback. */
    onTitleClick?: (info: {
        key: string;
        domEvent: MouseEvent | KeyboardEvent;
    }) => void;
};
export type MenuNode<Item extends MenuItem<any> = MenuItem> = {
    key: string;
    item: Item;
    kind: MenuItemKind;
    /** Root-first key path; groups are skipped. For a group: its parent's path. */
    path: string[];
    children: MenuNode<Item>[];
};
export type MenuClickInfo<Item extends MenuItem<any> = MenuItem> = {
    key: string;
    /** Leaf-first key path (rc / antd legacy order). */
    keyPath: string[];
    domEvent?: MouseEvent | KeyboardEvent;
    /** The item object this key was declared with. */
    item: Item;
    /** antd 6 name for `item` (same object). */
    itemData: Item;
};
export type MenuSelectInfo<Item extends MenuItem<any> = MenuItem> = MenuClickInfo<Item> & {
    selectedKeys: string[];
};
export type MenuConfig<Item extends MenuItem<any> = MenuItem> = {
    items?: Item[];
    /** Default 'vertical'. */
    mode?: MenuMode;
    /** Already merged with the Sider context by the UI layer. */
    inlineCollapsed?: boolean;
    /** Default true. */
    selectable?: boolean;
    multiple?: boolean;
    selectedKeys?: string[];
    defaultSelectedKeys?: string[];
    openKeys?: string[];
    defaultOpenKeys?: string[];
    onClick?: (info: MenuClickInfo<Item>) => void;
    onSelect?: (info: MenuSelectInfo<Item>) => void;
    onDeselect?: (info: MenuSelectInfo<Item>) => void;
    onOpenChange?: (openKeys: string[]) => void;
    /** DOM marker id; generated when omitted. */
    id?: string;
    /** Frame scheduler for keyboard focus moves (tests inject a sync one). */
    raf?: (cb: () => void) => void;
};
export type MenuIns = {
    selectedKeys: () => string[];
    openKeys: () => string[];
    select: (key: string) => void;
    toggleOpen: (key: string) => void;
};
/** Normalize an items tree into render nodes with resolved keys and paths. Pure. */
export declare const buildMenuNodes: <Item extends MenuItem<any>>(items: readonly Item[] | undefined, parentPath?: string[], prefix?: string) => MenuNode<Item>[];
type Offset = {
    offset: number;
    sibling: boolean;
} | {
    inlineTrigger: true;
} | null;
/** rc-menu getOffset (LTR): what a key means for the focused level. Pure. */
export declare const getMenuKeyOffset: (mode: MenuMode, isRootLevel: boolean, key: string) => Offset;
export declare const createMenu: <Item extends MenuItem<any> = MenuItem>(config: MenuConfig<Item>) => {
    id: string;
    nodes: import('solid-js').SourceAccessor<MenuNode<Item>[]>;
    registry: import('solid-js').SourceAccessor<Map<string, MenuNode<Item>>>;
    pathOf: (key: string) => string[];
    subPathKeys: (key: string) => Set<string>;
    mode: import('solid-js').SourceAccessor<"vertical" | "horizontal" | "inline">;
    inlineCollapsed: import('solid-js').SourceAccessor<boolean>;
    selectedKeys: import('solid-js').SourceAccessor<string[]>;
    openKeys: import('solid-js').SourceAccessor<string[]>;
    isSelected: (key: string) => boolean;
    isChildSelected: (key: string) => boolean;
    isOpen: (key: string) => boolean;
    click: (key: string, domEvent?: MouseEvent | KeyboardEvent) => void;
    titleClick: (key: string, domEvent: MouseEvent | KeyboardEvent) => void;
    openChange: (key: string, open: boolean) => void;
    onKeyDown: (event: KeyboardEvent, root: HTMLElement | undefined) => void;
    focus: (root: HTMLElement | undefined, options?: FocusOptions) => void;
    select: (key: string) => void;
    toggleOpen: (key: string) => void;
    openSub: (key: string) => void;
    closeSub: (key: string) => void;
    refs: MenuIns;
};
export declare const menuSplits: (keyof MenuConfig)[];
export {};
