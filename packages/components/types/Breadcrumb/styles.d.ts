/** 根：自定义 title / itemRender 里的裸 a 也使用 linkColor、无下划线（antd `.ant-breadcrumb a`）。 */
export declare const breadcrumbRootClass: (props?: import('class-variance-authority/types').ClassProp | undefined) => string;
/** ol 列表；children 写法下每项后都跟一个自动分隔符，隐藏最后一个。 */
export declare const breadcrumbListClass: (props?: ({
    legacy?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** 面包屑项 li：最后一项文字为 on-surface（children 写法下最后一项后面还有被隐藏的分隔符）。 */
export declare const breadcrumbItemClass: (props?: ({
    legacy?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** 链接 a 与纯文本 span（antd `-link`）；样式只作用于 a，span 仅继承 li 颜色。图标与文字间距 4px。 */
export declare const breadcrumbLinkClass: (props?: ({
    kind?: "anchor" | "text" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const breadcrumbSeparatorClass: (props?: import('class-variance-authority/types').ClassProp | undefined) => string;
/** 带下拉菜单的项：触发区 hover 时整体高亮，内部链接不再叠加背景。 */
export declare const breadcrumbOverlayClass: (props?: import('class-variance-authority/types').ClassProp | undefined) => string;
/** 下拉菜单项带 path 时渲染的链接：继承菜单项颜色、无下划线。 */
export declare const BREADCRUMB_MENU_LINK_CLASS: string[];
/** 下拉箭头（DownOutlined，fontSizeIcon 12px，左距 4px）。图标类单独导出，便于死类检测排除图标集。 */
export declare const BREADCRUMB_OVERLAY_ICON_CLASS: string[];
