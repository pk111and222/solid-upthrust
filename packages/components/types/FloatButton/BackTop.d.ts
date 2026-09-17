import { Component } from 'solid-js';
import { FloatButtonProps } from './index';
/**
 * BackTop — FloatButton's BackTop preset (antd keeps both entries; the
 * standalone BackTop is a FloatButton with the up glyph + threshold).
 */
export type BackTopProps = Omit<FloatButtonProps, 'backTop' | 'icon' | 'ref'> & {
    /** Visibility threshold override. Default 400. */
    visibilityHeight?: number;
};
declare const BackTop: Component<BackTopProps>;
export default BackTop;
