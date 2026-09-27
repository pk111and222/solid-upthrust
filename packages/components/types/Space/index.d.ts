import { JSX } from '@solidjs/web';
import { SpacePresetSize } from './styles';
export type { SpacePresetSize } from './styles';
/** 排列方向。 */
export type SpaceOrientation = 'horizontal' | 'vertical';
/** 间距：预设档位走主题 token，数字按 px，其余字符串原样写入 CSS。 */
export type SpaceSize = SpacePresetSize | number | (string & {});
/** 交叉轴对齐。 */
export type SpaceAlign = 'start' | 'end' | 'center' | 'baseline';
/** 可语义化定制的节点。 */
export type SpaceSemanticName = 'root' | 'item' | 'separator';
export interface SpaceProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children'> {
    /** 排列方向，优先级高于 vertical 与 direction。 */
    orientation?: SpaceOrientation;
    /** 是否纵向排列；优先级高于 direction。 */
    vertical?: boolean;
    /** 旧写法，等价于 orientation。 */
    direction?: SpaceOrientation;
    /** 间距；数组形式为 [水平, 垂直]。默认 'small'（8px）。 */
    size?: SpaceSize | [SpaceSize, SpaceSize];
    /** 交叉轴对齐；水平方向默认 center，纵向默认不设置（stretch）。 */
    align?: SpaceAlign;
    /** 是否自动换行（仅水平方向有意义）。 */
    wrap?: boolean;
    /** 撑满父容器宽度（display:flex + width:100%）。 */
    block?: boolean;
    /** 相邻子节点之间的分隔内容（antd 6 名称）。 */
    separator?: JSX.Element;
    /** 同 separator，保留的旧名称；两者同时传入时 separator 优先。 */
    split?: JSX.Element;
    /** 语义化类名。 */
    classNames?: Partial<Record<SpaceSemanticName, string>>;
    /** 语义化内联样式。 */
    styles?: Partial<Record<SpaceSemanticName, JSX.CSSProperties>>;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface SpaceCompactProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children'> {
    /** 排列方向，优先级高于 vertical 与 direction。 */
    orientation?: SpaceOrientation;
    /** 是否纵向排列；优先级高于 direction。 */
    vertical?: boolean;
    /** 旧写法，等价于 orientation。 */
    direction?: SpaceOrientation;
    /** 撑满父容器宽度。 */
    block?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
/** @deprecated 使用 SpaceCompactProps。 */
export type CompactProps = SpaceCompactProps;
export interface SpaceAddonProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
    class?: string;
    children?: JSX.Element;
}
/** 紧凑布局：子元素首尾相接、合并边框与圆角，常用于按钮组、输入框组合。 */
export declare const Compact: (props: SpaceCompactProps) => JSX.Element;
/** 紧凑组合里的文本单元（如 URL 前缀、单位），与按钮/输入框拼接。 */
export declare const Addon: (props: SpaceAddonProps) => JSX.Element;
declare const Space: ((props: SpaceProps) => JSX.Element) & {
    Compact: (props: SpaceCompactProps) => JSX.Element;
    Addon: (props: SpaceAddonProps) => JSX.Element;
};
export default Space;
