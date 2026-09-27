import { JSX, ValidComponent } from '@solidjs/web';
import { FlexAlign, FlexGap, FlexJustify, FlexWrap } from './styles';
export type { FlexAlign, FlexGap, FlexJustify, FlexWrap } from './styles';
/** 主轴方向；合法值优先于 vertical。 */
export type FlexOrientation = 'horizontal' | 'vertical';
export interface FlexProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'class' | 'style' | 'children'> {
    /** 是否纵向排列；orientation 为合法值时以 orientation 为准。默认 false。 */
    vertical?: boolean;
    /** 主轴方向，优先级高于 vertical。 */
    orientation?: FlexOrientation;
    /** 换行方式：true 等价 'wrap'，false 等价 'nowrap'；不传时沿用 CSS 初始值 nowrap。 */
    wrap?: boolean | FlexWrap;
    /** 主轴对齐（justify-content）。 */
    justify?: FlexJustify;
    /** 交叉轴对齐（align-items）。 */
    align?: FlexAlign;
    /** 容器自身的 flex 简写，原样写入 style（数字 1 即 flex:1）。 */
    flex?: string | number;
    /** 子元素间距：small/middle/medium/large 走主题 token，数字按 px，其他字符串原样写入。 */
    gap?: FlexGap;
    /** 使用 inline-flex。默认 false。 */
    inline?: boolean;
    /** 宿主元素：原生标签名或组件，默认 'div'。 */
    component?: ValidComponent;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
declare const Flex: (props: FlexProps) => JSX.Element;
export default Flex;
