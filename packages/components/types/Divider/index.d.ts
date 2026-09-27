import { JSX } from '@solidjs/web';
/** 分割线方向。 */
export type DividerOrientation = 'horizontal' | 'vertical';
/** 标题位置；left/right 为旧写法，分别等价 start/end。 */
export type DividerTitlePlacement = 'start' | 'end' | 'center' | 'left' | 'right';
/** 线型。 */
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
/** 水平分割线的上下间距档位；medium 是 middle 的别名。 */
export type DividerSize = 'small' | 'middle' | 'medium' | 'large';
/** 可语义化定制的节点。 */
export type DividerSemanticName = 'root' | 'rail' | 'content';
export interface DividerProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children'> {
    /**
     * 方向（antd 6）。旧版本里 orientation 表示标题位置，left/right/center
     * 仍按 titlePlacement 兼容处理。
     */
    orientation?: DividerOrientation | 'left' | 'right' | 'center';
    /** 是否垂直；orientation 为方向值时以 orientation 为准。 */
    vertical?: boolean;
    /** 旧写法，等价于 orientation。 */
    type?: DividerOrientation;
    /** 标题位置，默认 center；优先级高于旧 orientation left/right。 */
    titlePlacement?: DividerTitlePlacement;
    /** 标题靠边时与该边的距离；数字与纯数字字符串按 px。center 时无效。 */
    orientationMargin?: string | number;
    /** 线型，默认 solid。 */
    variant?: DividerVariant;
    /** 旧写法，等价于 variant="dashed"；显式 variant 优先。 */
    dashed?: boolean;
    /** 标题使用正文字号与常规字重。 */
    plain?: boolean;
    /** 水平分割线的上下间距；垂直分割线忽略。 */
    size?: DividerSize;
    /** 语义化类名。 */
    classNames?: Partial<Record<DividerSemanticName, string>>;
    /** 语义化内联样式。 */
    styles?: Partial<Record<DividerSemanticName, JSX.CSSProperties>>;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
declare const Divider: (props: DividerProps) => JSX.Element;
export default Divider;
