import { JSX } from '@solidjs/web';
import { AnchorIns } from 'upthrust-competence';
export type { AnchorIns };
export type AnchorDirection = 'vertical' | 'horizontal';
export type AnchorContainer = HTMLElement | Window;
/** 锚点链接（antd AnchorLinkItemProps）。 */
export interface AnchorLinkItemProps {
    /** 唯一标识。 */
    key: string;
    /** 锚点链接，形如 `#section`；以 http(s):// 开头视为外链。 */
    href: string;
    title: JSX.Element;
    /** 原生 a 的 target。 */
    target?: string;
    /** 点击时替换当前历史记录而不是新增（覆盖 Anchor 的 replace）。 */
    replace?: boolean;
    /** 嵌套链接；horizontal 方向下忽略。 */
    children?: AnchorLinkItemProps[];
}
/** 兼容旧名。 */
export type AnchorLinkItem = AnchorLinkItemProps;
export interface AnchorProps {
    items: AnchorLinkItemProps[];
    /** 方向，默认 vertical。 */
    direction?: AnchorDirection;
    /** 是否用 Affix 固定，默认 true。 */
    affix?: boolean;
    /** 距离窗口顶部达到该值时固定（传给 Affix），同时作为 targetOffset 的默认值。 */
    offsetTop?: number;
    /** 锚点滚动与高亮判定的偏移量，默认取 offsetTop，都未设为 0。 */
    targetOffset?: number;
    /** 锚点区域边界（px），默认 5。 */
    bounds?: number;
    /** 滚动容器，默认 window。 */
    getContainer?: () => AnchorContainer | undefined;
    /** getContainer 的旧名，保留兼容。 */
    getScrollContainer?: () => AnchorContainer | undefined;
    /** 自定义高亮：参数为滚动计算出的 href，返回要高亮的 href（兼容返回 key）。 */
    getCurrentAnchor?: (activeLink: string) => string;
    /** 高亮链接变化，参数为 href（无高亮时为空字符串）。 */
    onChange?: (currentActiveLink: string) => void;
    /** 点击链接；调用 e.preventDefault() 可阻止写入地址栏。 */
    onClick?: (e: MouseEvent, link: {
        title: JSX.Element;
        href: string;
    }) => void;
    /** 点击时替换历史记录，默认 false。 */
    replace?: boolean;
    /** affix={false} 时是否仍显示 ink 指示条，默认 false（仅 vertical；horizontal 始终显示）。 */
    showInkInFixed?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    /** 取得 headless 实例（activeKey / scrollTo）。 */
    ref?: (instance: AnchorIns) => void;
}
declare const Anchor: (rawProps: AnchorProps) => JSX.Element;
export default Anchor;
