import { JSX } from '@solidjs/web';
import { SplitterCollapseType, SplitterCollapsibleIconMode, SplitterOrientation, SplitterPanelCollapsible, SplitterSize } from 'upthrust-competence';
export type { SplitterCollapseType, SplitterCollapsibleIconMode, SplitterOrientation, SplitterPanelCollapsible, SplitterSize };
type DivAttributes = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children' | 'ref'>;
/** 折叠配置：motion 开启面板尺寸过渡；icon 替换折叠按钮的图标。 */
export interface SplitterCollapsibleConfig {
    motion?: boolean;
    icon?: {
        start?: JSX.Element;
        end?: JSX.Element;
    };
}
/** 语义化类名：dragger 传字符串等同 `{ default }`，active 只在拖拽中追加。 */
export interface SplitterClassNames {
    root?: string;
    panel?: string;
    dragger?: string | {
        default?: string;
        active?: string;
    };
}
export interface SplitterStyles {
    root?: JSX.CSSProperties;
    panel?: JSX.CSSProperties;
    dragger?: {
        default?: JSX.CSSProperties;
        active?: JSX.CSSProperties;
    };
}
export interface SplitterPanelProps extends DivAttributes {
    /** 受控尺寸：数字或纯数字字符串按 px，'30%' 按容器百分比。任一面板设置 size 时全部面板受控。 */
    size?: SplitterSize;
    /** 初始尺寸（非受控）；未设置的面板平分剩余空间。 */
    defaultSize?: SplitterSize;
    /** 最小尺寸。 */
    min?: SplitterSize;
    /** 最大尺寸。 */
    max?: SplitterSize;
    /** 是否可拖拽调整，默认 true；相邻两个面板都可调时分隔条才可拖拽。 */
    resizable?: boolean;
    /** 快速折叠：true 两个方向都可折叠；对象形式分别配置 start / end 与按钮显示方式。 */
    collapsible?: SplitterPanelCollapsible;
    /** 折叠（尺寸为 0）时卸载内容；不设置时继承 Splitter 的 destroyOnHidden。 */
    destroyOnHidden?: boolean;
    ref?: (el: HTMLDivElement) => void;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface SplitterProps extends Omit<DivAttributes, 'onResize'> {
    /** 排列方向，默认 horizontal。 */
    orientation?: SplitterOrientation;
    /** 等同 orientation="vertical"；同时设置时 orientation 优先。 */
    vertical?: boolean;
    /** @deprecated 请使用 orientation。 */
    layout?: SplitterOrientation;
    /** 延迟模式：拖拽中只显示预览线，松开后才调整尺寸（期间不触发 onResize）。 */
    lazy?: boolean;
    /** 面板折叠时卸载内容（面板自身的 destroyOnHidden 优先）。 */
    destroyOnHidden?: boolean;
    /** 自定义拖拽抓手图标（替换默认短线）。 */
    draggerIcon?: JSX.Element;
    /** 折叠动画与折叠按钮图标。 */
    collapsible?: SplitterCollapsibleConfig;
    /** @deprecated 请使用 collapsible.icon。 */
    collapsibleIcon?: {
        start?: JSX.Element;
        end?: JSX.Element;
    };
    /** 键盘方向键每次移动的像素，默认 16（本库扩展）。 */
    keyboardStep?: number;
    /** 双击拖拽条。 */
    onDraggerDoubleClick?: (index: number) => void;
    /** 开始拖拽，参数为拖拽前各面板像素尺寸。 */
    onResizeStart?: (sizes: number[]) => void;
    /** 尺寸变化中（lazy 模式下不触发）。 */
    onResize?: (sizes: number[]) => void;
    /** 拖拽结束 / 键盘调整 / 折叠后的最终尺寸。 */
    onResizeEnd?: (sizes: number[]) => void;
    /** 点击折叠按钮后触发；collapsed[i] 表示第 i 个面板尺寸为 0。 */
    onCollapse?: (collapsed: boolean[], sizes: number[]) => void;
    classNames?: SplitterClassNames;
    styles?: SplitterStyles;
    ref?: (el: HTMLDivElement) => void;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export declare const Panel: (props: SplitterPanelProps) => JSX.Element;
/** 分隔面板：拖拽分隔条调整相邻面板尺寸，支持受控尺寸、折叠、延迟模式与键盘操作。 */
declare const Splitter: ((props: SplitterProps) => JSX.Element) & {
    Panel: (props: SplitterPanelProps) => JSX.Element;
};
export default Splitter;
