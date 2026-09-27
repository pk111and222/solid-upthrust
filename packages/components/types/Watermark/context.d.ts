import { Accessor } from 'solid-js';
/** antd WatermarkContext：Modal / Drawer 把面板元素登记给外层 Watermark，使弹层也带水印（inherit）。 */
export interface WatermarkContextValue {
    add: (el: HTMLElement) => void;
    remove: (el: HTMLElement) => void;
}
export declare const WatermarkContext: import('solid-js').Context<WatermarkContextValue | null>;
/**
 * 弹层面板登记：`open` 为真且元素已挂上时 add，关闭 / 卸载时 remove。
 * 元素通过 getter 读取（ref 在属性与插入之前执行，effect 阶段才稳定）。
 */
export declare function useWatermarkPanel(open: Accessor<boolean>, getElement: () => HTMLElement | undefined): void;
