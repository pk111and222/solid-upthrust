import { JSX } from '@solidjs/web';
import { WatermarkContent, WatermarkFont, WatermarkText } from 'upthrust-competence';
export type { WatermarkContent, WatermarkFont, WatermarkText };
export interface WatermarkProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'content' | 'children' | 'class' | 'style'> {
    /** 追加的水印元素的 z-index，默认 999。 */
    zIndex?: number;
    /** 旋转角度（°），默认 -22。 */
    rotate?: number;
    /** 单个水印宽度；图片默认 120，文字默认按内容测量。 */
    width?: number;
    /** 单个水印高度；图片默认 64，文字默认按内容测量。 */
    height?: number;
    /** 图片源（优先于文字；加载失败回退文字）。 */
    image?: string;
    /** 文字内容；数组为多行，`{ text, font }` 可单独设置某行字体。 */
    content?: WatermarkContent | WatermarkContent[];
    /** 文字样式，默认 rgba(0,0,0,.15) / 16px / normal / sans-serif / center。 */
    font?: WatermarkFont;
    /** 水印之间的间距，默认 [100, 100]。 */
    gap?: [number, number];
    /** 水印距容器左上角的偏移，默认 [gap[0]/2, gap[1]/2]。 */
    offset?: [number, number];
    /** 是否把水印传导给 Modal / Drawer 等弹层，默认 true。 */
    inherit?: boolean;
    /** 水印因 DOM 变更被移除（并已自动恢复）时触发。 */
    onRemove?: () => void;
    children?: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
    ref?: (el: HTMLDivElement) => void;
}
declare const Watermark: (rawProps: WatermarkProps) => JSX.Element;
export default Watermark;
