import { JSX } from '@solidjs/web';
import { MasonryColumns, MasonryGutter, MasonryGutterValue } from 'upthrust-competence';
export type { MasonryColumns, MasonryGutter, MasonryGutterValue };
export type MasonryKey = string | number;
/** 数据项：key 必须稳定且唯一；column 固定到某一列（从 0 开始，超出范围取最后一列）。 */
export interface MasonryItem<T = unknown> {
    key: MasonryKey;
    column?: number;
    /** 直接给出内容；优先于 itemRender。 */
    children?: JSX.Element;
    data?: T;
}
/** itemRender 的参数：column 是响应式 getter，列变化时只更新读取它的地方，不重建内容。 */
export type MasonryItemRenderInfo<T = unknown> = MasonryItem<T> & {
    index: number;
    readonly column: number;
};
/** onLayoutChange 的参数：原数据项加上当前所在列。 */
export type MasonryLayoutItem<T = unknown> = Omit<MasonryItem<T>, 'column'> & {
    column: number;
};
type DivAttributes = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children' | 'ref'>;
export interface MasonryProps<T = unknown> extends DivAttributes {
    /** 列数，默认 3；对象形式按断点取值，未命中时取 xs，再退回 1。 */
    columns?: MasonryColumns;
    /** 间距（px 或 small / middle / large），默认 0；数组为 [水平, 垂直]，垂直缺省时同水平；支持按断点取值。 */
    gutter?: MasonryGutter | [MasonryGutter, MasonryGutter];
    /** 数据项；设置后忽略 children。 */
    items?: MasonryItem<T>[];
    /** 渲染数据项（item.children 为空时使用）。 */
    itemRender?: (info: MasonryItemRenderInfo<T>) => JSX.Element;
    /** 监听每一项自身的尺寸变化（内容异步变高时开启）。 */
    fresh?: boolean;
    /** 本库扩展：按阅读顺序均衡分列（12 项 5 列 → 3,3,2,2,2），不再按最短列放置。 */
    sequential?: boolean;
    /** 全部项完成定位后、且各项所在列发生变化时触发。 */
    onLayoutChange?: (items: MasonryLayoutItem<T>[]) => void;
    classNames?: {
        root?: string;
        item?: string;
    };
    styles?: {
        root?: JSX.CSSProperties;
        item?: JSX.CSSProperties;
    };
    ref?: (el: HTMLDivElement) => void;
    class?: string;
    style?: JSX.CSSProperties;
    /** 旧用法：每个子节点为一项（key 为下标）；items 存在时忽略。 */
    children?: JSX.Element;
}
/** 瀑布流：按最短列依次放置不等高的内容，列数与间距支持响应式。 */
declare const Masonry: <T>(props: MasonryProps<T>) => JSX.Element;
export default Masonry;
