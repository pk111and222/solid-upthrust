import { JSX } from '@solidjs/web';
import { FloatButtonProps } from './FloatButton';
export interface BackTopProps extends Omit<FloatButtonProps, 'target'> {
    /** 滚动高度达到此值才出现，默认 400；0 表示一开始就显示。 */
    visibilityHeight?: number;
    /** 监听滚动的目标，默认 window。 */
    target?: () => HTMLElement | Window | Document;
    /** 回到顶部的动画时长（ms），默认 450。 */
    duration?: number;
    /** 可见性变化回调（本库扩展）。 */
    onVisibleChange?: (visible: boolean) => void;
}
/**
 * FloatButton.BackTop — antd 6 BackTop：滚动高度 >= visibilityHeight 时淡入，
 * 点击以 easeInOutCubic 在 duration 内滚回顶部，再触发 onClick。默认图标 VerticalAlignTopOutlined。
 */
declare const BackTop: (rawProps: BackTopProps) => JSX.Element;
export default BackTop;
