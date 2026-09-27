/** 走主题间距类的预设档位（small=8px，middle/medium=16px，large=24px）。 */
export type SpacePresetSize = "small" | "middle" | "medium" | "large";
/** 用 Set 判断而非对象下标，避免 "constructor" 之类的字符串命中原型链。 */
export declare const isPresetSize: (size: unknown) => size is SpacePresetSize;
/**
 * Space 根容器。gap/gapX/gapY 三组变体分别对应 size 的单值与 [水平, 垂直] 数组形式；
 * 所有类名都是 variants 下的字面量，保证 UnoCSS 静态扫描能提取。
 */
export declare const spaceVariants: (props?: ({
    block?: boolean | null | undefined;
    vertical?: boolean | null | undefined;
    wrap?: boolean | null | undefined;
    align?: "start" | "end" | "center" | "baseline" | null | undefined;
    gap?: "small" | "middle" | "large" | "medium" | null | undefined;
    gapX?: "small" | "middle" | "large" | "medium" | null | undefined;
    gapY?: "small" | "middle" | "large" | "medium" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** 每个子节点的包裹层：子节点渲染为空时整个 item 隐藏，不占间距。 */
export declare const SPACE_ITEM_CLASS = "space-item empty:hidden";
/** 分隔符包裹层：不参与伸缩。 */
export declare const SPACE_SEPARATOR_CLASS = "space-separator flex-none";
/**
 * Compact 让直接子元素首尾相接：内侧圆角清零 + 相邻重叠 1px，避免双线边框。
 * 选择器作用于任意子元素（Button、Input、Select…），`!` 压过子元素自身的圆角类；
 * 悬停/聚焦的子元素提升 z-index，使其高亮边框不被右侧（下方）邻居盖住。
 * 选择器只命中直接子元素：把边框画在内部节点上的控件（Input 无前后缀时的 input、
 * Select 的 combobox）须让内部节点 `rounded-[inherit]`，圆角覆盖才能传到真正的边框。
 */
export declare const compactVariants: (props?: ({
    block?: boolean | null | undefined;
    vertical?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/**
 * Space.Addon：紧凑组合里的带边框文本单元。不固定高度——Compact 的交叉轴默认
 * stretch，Addon 随相邻控件（small/middle/large）等高。
 */
export declare const SPACE_ADDON_CLASS: string[];
