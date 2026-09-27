import { Accessor } from 'solid-js';
import { JSX } from '@solidjs/web';
import { ResponsiveValue, ScreenMap } from 'upthrust-competence';
import { ColSize, ColSpanType, GutterValue } from './layout';
export type { ColSize, ColSpanType, GutterValue } from './layout';
export type { ResponsiveValue, ScreenMap } from 'upthrust-competence';
/** 主轴对齐（justify-content）。 */
export type RowJustify = 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly';
/** 交叉轴对齐（align-items）。 */
export type RowAlign = 'top' | 'middle' | 'bottom' | 'stretch';
/** 单方向间距：数字（px）、CSS 长度字符串，或按断点取值的对象。 */
export type Gutter = GutterValue | ResponsiveValue<GutterValue>;
export interface RowProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children'> {
    /** 栅格间距；数组形式为 [水平, 垂直]。数字按 px，字符串为 CSS 长度，对象按断点取值。 */
    gutter?: Gutter | [Gutter, Gutter];
    /** 水平排列方式，支持按断点取值。 */
    justify?: RowJustify | ResponsiveValue<RowJustify>;
    /** 垂直对齐方式，支持按断点取值；不传时为 CSS 默认的 stretch。 */
    align?: RowAlign | ResponsiveValue<RowAlign>;
    /** 是否自动换行。默认 true。 */
    wrap?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface ColProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children'> {
    /** 栅格占位格数（共 24 格），0 隐藏；不传时宽度由内容决定。 */
    span?: ColSpanType;
    /** 左侧间隔格数。 */
    offset?: ColSpanType;
    /** 向右移动格数。 */
    push?: ColSpanType;
    /** 向左移动格数。 */
    pull?: ColSpanType;
    /** 栅格顺序（CSS order）。 */
    order?: ColSpanType;
    /** flex 布局属性：数字 n → `n n auto`，长度 → `0 0 长度`，其余原样。 */
    flex?: number | string;
    /** 屏幕 < 576px，无媒体查询，与基础 props 合并。 */
    xs?: ColSpanType | ColSize;
    /** 屏幕 ≥ 576px。 */
    sm?: ColSpanType | ColSize;
    /** 屏幕 ≥ 768px。 */
    md?: ColSpanType | ColSize;
    /** 屏幕 ≥ 992px。 */
    lg?: ColSpanType | ColSize;
    /** 屏幕 ≥ 1200px。 */
    xl?: ColSpanType | ColSize;
    /** 屏幕 ≥ 1600px。 */
    xxl?: ColSpanType | ColSize;
    /** 屏幕 ≥ 1920px。 */
    xxxl?: ColSpanType | ColSize;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export declare const Row: (props: RowProps) => JSX.Element;
export declare const Col: (props: ColProps) => JSX.Element;
/**
 * 当前命中的断点表 `{ xs, sm, md, lg, xl, xxl, xxxl }`，随窗口变化更新；
 * 没有 matchMedia（SSR）时为空对象。须在组件或 createRoot 内调用。
 */
export declare const useBreakpoint: () => Accessor<ScreenMap>;
declare const Grid: {
    Row: (props: RowProps) => JSX.Element;
    Col: (props: ColProps) => JSX.Element;
    useBreakpoint: () => Accessor<ScreenMap>;
};
export default Grid;
