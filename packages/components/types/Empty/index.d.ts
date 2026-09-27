import { JSX } from '@solidjs/web';
/**
 * 内置插画是组件（Solid 的 DOM 节点不能在多处复用），推荐 `image={PRESENTED_IMAGE_SIMPLE}`；
 * 写成 `<PRESENTED_IMAGE_SIMPLE />` 也可以，同样会切换为简洁样式。
 */
export declare const PRESENTED_IMAGE_DEFAULT: () => JSX.Element;
export declare const PRESENTED_IMAGE_SIMPLE: () => JSX.Element;
/** 内置插画组件类型（PRESENTED_IMAGE_DEFAULT / PRESENTED_IMAGE_SIMPLE）。 */
export type EmptyPresentedImage = () => JSX.Element;
export interface EmptySemanticClassNames {
    root?: string;
    image?: string;
    description?: string;
    footer?: string;
}
export interface EmptySemanticStyles {
    root?: JSX.CSSProperties;
    image?: JSX.CSSProperties;
    description?: JSX.CSSProperties;
    footer?: JSX.CSSProperties;
}
export interface EmptyProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children'> {
    /**
     * 图片：节点、内置插画组件，或图片地址（渲染 `<img>`）。默认 PRESENTED_IMAGE_DEFAULT；
     * undefined / null 回落默认插画（与 antd 一致）；false 不渲染图片区域（本库扩展）。
     */
    image?: JSX.Element | EmptyPresentedImage | string | false | null;
    /** @deprecated 请使用 styles.image */
    imageStyle?: JSX.CSSProperties;
    /** 描述内容，默认「暂无数据」；false / null / '' 不渲染描述区域。 */
    description?: JSX.Element;
    /** 底部内容（如操作按钮）。 */
    children?: JSX.Element;
    classNames?: EmptySemanticClassNames;
    styles?: EmptySemanticStyles;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const _default: ((props: EmptyProps) => JSX.Element) & {
    PRESENTED_IMAGE_DEFAULT: () => JSX.Element;
    PRESENTED_IMAGE_SIMPLE: () => JSX.Element;
};
export default _default;
